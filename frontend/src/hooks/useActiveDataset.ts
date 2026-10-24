import { useActiveDatasetContext } from "@/context/ActiveDatasetContext";

export function useActiveDataset() {
  return useActiveDatasetContext();
}
