import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Settings,
  Server,
  Database,
  BrainCircuit,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

import { datasetsApi } from "@/services/api/datasetsApi";
import { aiApi } from "@/services/api/aiApi";
import { queryKeys } from "@/services/api/queryKeys";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const SettingsPage: React.FC = () => {
  const { data: health } = useQuery({
    queryKey: queryKeys.health,
    queryFn: datasetsApi.getHealth,
  });

  const { data: aiStatus } = useQuery({
    queryKey: queryKeys.aiStatus,
    queryFn: aiApi.getStatus,
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#133857] tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#226192]" />
          Platform Configuration & Status
        </h2>
        <p className="text-xs text-[#5B5245] mt-0.5">
          Environment variables, backend health, database persistence, and AI provider integration.
        </p>
      </div>

      {/* Health & Infrastructure Card */}
      <Card className="space-y-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-[#226192]" />
            <CardTitle>System & Services Health</CardTitle>
          </div>
          <Badge variant={health?.status === "healthy" ? "neutral" : "secondary"} size="sm">
            {health?.status === "healthy" ? "SYSTEM OPERATIONAL" : "DEGRADED"}
          </Badge>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[#EAE6DE]/50 rounded-xl border border-[#DAD3C6]">
            <div className="text-[#5B5245] mb-1 flex items-center gap-1.5 font-semibold">
              <Server className="w-3.5 h-3.5 text-[#226192]" /> Backend Service
            </div>
            <div className="font-bold text-[#133857]">{health?.service || "DataAgent AI API"}</div>
            <div className="text-[10px] text-[#5B5245] mt-0.5">FastAPI • v{health?.version || "1.0.0"}</div>
          </div>

          <div className="p-3 bg-[#EAE6DE]/50 rounded-xl border border-[#DAD3C6]">
            <div className="text-[#5B5245] mb-1 flex items-center gap-1.5 font-semibold">
              <Database className="w-3.5 h-3.5 text-[#226192]" /> MongoDB Database
            </div>
            <div className="font-bold text-[#133857]">
              {health?.database.connected ? "Connected (Local 27017)" : "In-Memory JSON Fallback"}
            </div>
            <div className="text-[10px] text-[#5B5245] mt-0.5">
              {health?.database.connected ? "Persistent Storage Active" : "MongoDB Offline (Non-blocking)"}
            </div>
          </div>

          <div className="p-3 bg-[#EAE6DE]/50 rounded-xl border border-[#DAD3C6]">
            <div className="text-[#5B5245] mb-1 flex items-center gap-1.5 font-semibold">
              <BrainCircuit className="w-3.5 h-3.5 text-[#226192]" /> AI Engine
            </div>
            <div className="font-bold text-[#133857]">
              {aiStatus?.is_configured ? `Active (${aiStatus.provider})` : "Deterministic Engine"}
            </div>
            <div className="text-[10px] text-[#5B5245] mt-0.5">Model: {aiStatus?.model || "gemini-1.5-flash"}</div>
          </div>
        </div>
      </Card>

      {/* AI Configuration Info */}
      <Card className="space-y-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-[#226192]" />
            <CardTitle>AI Provider Integration</CardTitle>
          </div>
          <Badge variant={aiStatus?.is_configured ? "secondary" : "neutral"} size="sm">
            {aiStatus?.is_configured ? "KEY CONFIGURED" : "KEY NOT SET (DETERMINISTIC MODE)"}
          </Badge>
        </CardHeader>

        <p className="text-xs text-[#5B5245] leading-relaxed">
          DataAgent AI follows a <b className="text-[#133857]">Zero-Key Principle</b>: all data profiling, cleaning,
          interactive Plotly charts, descriptive statistics, and Tukey outlier detection work
          deterministically via Pandas and NumPy even when no AI key is provided.
        </p>

        <div className="p-3.5 bg-[#EAE6DE]/50 rounded-xl border border-[#DAD3C6] text-xs space-y-2">
          <div className="font-bold text-[#133857]">To enable Natural Language AI reasoning:</div>
          <p className="text-[#5B5245]">
            Set your AI API key in <code className="bg-[#FAF8F5] px-1 py-0.5 rounded border border-[#DAD3C6]">backend/.env</code>:
          </p>
          <pre className="p-3 bg-[#133857] text-[#FAF8F5] rounded-xl font-mono text-[11px] overflow-x-auto">
{`AI_PROVIDER=gemini
AI_API_KEY=your_api_key_here
AI_MODEL=gemini-1.5-flash
AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta`}
          </pre>
        </div>
      </Card>

      {/* Security & Data Safety */}
      <Card className="space-y-3">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#A9B887]" />
            <CardTitle>Security & Architectural Guarantees</CardTitle>
          </div>
        </CardHeader>
        <ul className="text-xs text-[#5B5245] space-y-2 list-disc pl-5 leading-relaxed">
          <li><b className="text-[#133857]">Zero Arbitrary Code Execution:</b> Neither users nor LLMs can execute arbitrary Python via <code className="bg-[#EAE6DE] px-1 py-0.5 rounded">eval()</code> or <code className="bg-[#EAE6DE] px-1 py-0.5 rounded">exec()</code>. All transformations are strictly mapped to predefined Pandas operations.</li>
          <li><b className="text-[#133857]">Schema Guardrails:</b> All group-by and aggregation columns are validated against the dataset's actual schema before execution.</li>
          <li><b className="text-[#133857]">Controlled Storage:</b> Uploaded files are assigned isolated random UUID identifiers with path-traversal prevention.</li>
          <li><b className="text-[#133857]">File Limit:</b> Maximum 25MB per upload file, limited to CSV, XLSX, and JSON formats.</li>
        </ul>
      </Card>
    </div>
  );
};
