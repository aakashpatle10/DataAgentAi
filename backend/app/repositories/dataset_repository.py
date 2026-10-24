import json
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.config import settings
from app.utils.serializer import clean_record_dict

try:
    from pymongo import MongoClient
    from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
    PYMONGO_AVAILABLE = True
except ImportError:
    PYMONGO_AVAILABLE = False

class DatasetRepository:
    def __init__(self):
        self.is_mongo_connected = False
        self.mongo_client = None
        self.db = None
        
        # In-memory fallbacks / performance caches
        self._memory_datasets: Dict[str, Dict[str, Any]] = {}
        self._memory_active_records: Dict[str, List[Dict[str, Any]]] = {}
        self._memory_orig_records: Dict[str, List[Dict[str, Any]]] = {}
        self._memory_transformations: Dict[str, List[Dict[str, Any]]] = {}
        self._memory_reports: Dict[str, Dict[str, Any]] = {}
        self._memory_chat: Dict[str, List[Dict[str, Any]]] = {}
        self._memory_projects: List[Dict[str, Any]] = []

        self._init_mongo()

    def _init_mongo(self):
        if not PYMONGO_AVAILABLE:
            return
        try:
            self.mongo_client = MongoClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=1200,
                connectTimeoutMS=1200
            )
            # Ping database to verify connection
            self.mongo_client.admin.command("ping")
            self.db = self.mongo_client[settings.MONGODB_DATABASE]
            self.is_mongo_connected = True
            
            # Ensure indexes for lightning-fast queries
            try:
                self.db.datasets.create_index("id", unique=True)
                self.db.dataset_records.create_index("dataset_id")
                self.db.dataset_records_orig.create_index("dataset_id")
                self.db.chat_history.create_index([("dataset_id", 1), ("created_at", 1)])
                self.db.transformations.create_index([("dataset_id", 1), ("timestamp", 1)])
                self.db.reports.create_index("id", unique=True)
            except Exception:
                pass
        except Exception:
            self.is_mongo_connected = False
            self.mongo_client = None
            self.db = None

    # ==========================================
    # DATASET METADATA (MongoDB: datasets)
    # ==========================================
    def save_dataset_meta(self, meta: Dict[str, Any]):
        dataset_id = meta["id"]
        meta["updated_at"] = datetime.utcnow().isoformat()
        if "created_at" not in meta:
            meta["created_at"] = datetime.utcnow().isoformat()
            
        if self.is_mongo_connected and self.db is not None:
            try:
                self.db.datasets.replace_one({"id": dataset_id}, meta, upsert=True)
            except Exception:
                pass
        
        self._memory_datasets[dataset_id] = meta

    def get_dataset_meta(self, dataset_id: str) -> Optional[Dict[str, Any]]:
        if self.is_mongo_connected and self.db is not None:
            try:
                doc = self.db.datasets.find_one({"id": dataset_id}, {"_id": 0})
                if doc:
                    return doc
            except Exception:
                pass
        return self._memory_datasets.get(dataset_id)

    def list_datasets(self) -> List[Dict[str, Any]]:
        if self.is_mongo_connected and self.db is not None:
            try:
                cursor = self.db.datasets.find({}, {"_id": 0}).sort("created_at", -1)
                return list(cursor)
            except Exception:
                pass
        return list(self._memory_datasets.values())

    def delete_dataset_meta(self, dataset_id: str) -> bool:
        deleted = False
        if self.is_mongo_connected and self.db is not None:
            try:
                res = self.db.datasets.delete_one({"id": dataset_id})
                self.db.dataset_records.delete_many({"dataset_id": dataset_id})
                self.db.dataset_records_orig.delete_many({"dataset_id": dataset_id})
                self.db.transformations.delete_many({"dataset_id": dataset_id})
                self.db.reports.delete_many({"dataset_id": dataset_id})
                self.db.chat_history.delete_many({"dataset_id": dataset_id})
                deleted = res.deleted_count > 0
            except Exception:
                pass
                
        if dataset_id in self._memory_datasets:
            del self._memory_datasets[dataset_id]
            self._memory_active_records.pop(dataset_id, None)
            self._memory_orig_records.pop(dataset_id, None)
            self._memory_transformations.pop(dataset_id, None)
            self._memory_chat.pop(dataset_id, None)
            deleted = True
        return deleted

    # ==========================================
    # DATASET RECORDS (MongoDB: dataset_records & dataset_records_orig)
    # ==========================================
    def save_dataset_records(self, dataset_id: str, records: List[Dict[str, Any]], is_original: bool = False):
        clean_rows = [clean_record_dict(r) for r in records]
        
        col_name = "dataset_records_orig" if is_original else "dataset_records"
        if self.is_mongo_connected and self.db is not None:
            try:
                collection = self.db[col_name]
                collection.delete_many({"dataset_id": dataset_id})
                if clean_rows:
                    docs = [{"dataset_id": dataset_id, **row} for row in clean_rows]
                    collection.insert_many(docs, ordered=False)
            except Exception:
                pass
        
        if is_original:
            self._memory_orig_records[dataset_id] = clean_rows
        else:
            self._memory_active_records[dataset_id] = clean_rows

    def get_dataset_records(self, dataset_id: str, is_original: bool = False) -> List[Dict[str, Any]]:
        # Check in-memory cache first
        cache = self._memory_orig_records if is_original else self._memory_active_records
        if dataset_id in cache:
            return cache[dataset_id]
            
        col_name = "dataset_records_orig" if is_original else "dataset_records"
        if self.is_mongo_connected and self.db is not None:
            try:
                cursor = self.db[col_name].find({"dataset_id": dataset_id}, {"_id": 0, "dataset_id": 0})
                rows = list(cursor)
                cache[dataset_id] = rows
                return rows
            except Exception:
                pass
        return []

    def delete_dataset_records(self, dataset_id: str):
        if self.is_mongo_connected and self.db is not None:
            try:
                self.db.dataset_records.delete_many({"dataset_id": dataset_id})
                self.db.dataset_records_orig.delete_many({"dataset_id": dataset_id})
            except Exception:
                pass
        self._memory_active_records.pop(dataset_id, None)
        self._memory_orig_records.pop(dataset_id, None)

    # ==========================================
    # TRANSFORMATIONS (MongoDB: transformations)
    # ==========================================
    def add_transformation(self, dataset_id: str, record: Dict[str, Any]):
        record["timestamp"] = datetime.utcnow().isoformat()
        if self.is_mongo_connected and self.db is not None:
            try:
                self.db.transformations.insert_one({"dataset_id": dataset_id, **record})
            except Exception:
                pass
                
        if dataset_id not in self._memory_transformations:
            self._memory_transformations[dataset_id] = []
        self._memory_transformations[dataset_id].append(record)

    def get_transformations(self, dataset_id: str) -> List[Dict[str, Any]]:
        if self.is_mongo_connected and self.db is not None:
            try:
                cursor = self.db.transformations.find({"dataset_id": dataset_id}, {"_id": 0}).sort("timestamp", 1)
                return list(cursor)
            except Exception:
                pass
        return self._memory_transformations.get(dataset_id, [])

    def clear_transformations(self, dataset_id: str):
        if self.is_mongo_connected and self.db is not None:
            try:
                self.db.transformations.delete_many({"dataset_id": dataset_id})
            except Exception:
                pass
        self._memory_transformations[dataset_id] = []

    def pop_last_transformation(self, dataset_id: str) -> Optional[Dict[str, Any]]:
        history = self._memory_transformations.get(dataset_id, [])
        last = history.pop() if history else None
        
        if self.is_mongo_connected and self.db is not None:
            try:
                latest = self.db.transformations.find_one({"dataset_id": dataset_id}, sort=[("timestamp", -1)])
                if latest:
                    self.db.transformations.delete_one({"_id": latest["_id"]})
                    if not last:
                        latest.pop("_id", None)
                        last = latest
            except Exception:
                pass
        return last

    # ==========================================
    # REPORTS (MongoDB: reports)
    # ==========================================
    def save_report(self, report_meta: Dict[str, Any]):
        report_id = report_meta["id"]
        report_meta["created_at"] = datetime.utcnow().isoformat()
        if self.is_mongo_connected and self.db is not None:
            try:
                self.db.reports.replace_one({"id": report_id}, report_meta, upsert=True)
            except Exception:
                pass
        self._memory_reports[report_id] = report_meta

    def get_report(self, report_id: str) -> Optional[Dict[str, Any]]:
        if self.is_mongo_connected and self.db is not None:
            try:
                doc = self.db.reports.find_one({"id": report_id}, {"_id": 0})
                if doc:
                    return doc
            except Exception:
                pass
        return self._memory_reports.get(report_id)

    # ==========================================
    # CHAT HISTORY (MongoDB: chat_history)
    # ==========================================
    def save_chat_message(self, dataset_id: str, message: Dict[str, Any]):
        message["dataset_id"] = dataset_id
        message["created_at"] = datetime.utcnow().isoformat()
        if self.is_mongo_connected and self.db is not None:
            try:
                self.db.chat_history.insert_one(message)
            except Exception:
                pass
        if dataset_id not in self._memory_chat:
            self._memory_chat[dataset_id] = []
        self._memory_chat[dataset_id].append(message)

    def get_chat_history(self, dataset_id: str) -> List[Dict[str, Any]]:
        if self.is_mongo_connected and self.db is not None:
            try:
                cursor = self.db.chat_history.find({"dataset_id": dataset_id}, {"_id": 0}).sort("created_at", 1)
                return list(cursor)
            except Exception:
                pass
        return self._memory_chat.get(dataset_id, [])

    def clear_chat_history(self, dataset_id: str):
        if self.is_mongo_connected and self.db is not None:
            try:
                self.db.chat_history.delete_many({"dataset_id": dataset_id})
            except Exception:
                pass
        self._memory_chat.pop(dataset_id, None)

    # ==========================================
    # SAVED PROJECTS (MongoDB: saved_projects)
    # ==========================================
    def save_project(self, project_data: Dict[str, Any]):
        project_data["saved_at"] = datetime.utcnow().isoformat()
        if self.is_mongo_connected and self.db is not None:
            try:
                self.db.saved_projects.insert_one(project_data)
            except Exception:
                pass
        self._memory_projects.append(project_data)

    def get_saved_projects(self) -> List[Dict[str, Any]]:
        if self.is_mongo_connected and self.db is not None:
            try:
                cursor = self.db.saved_projects.find({}, {"_id": 0}).sort("saved_at", -1)
                return list(cursor)
            except Exception:
                pass
        return self._memory_projects

repository = DatasetRepository()
