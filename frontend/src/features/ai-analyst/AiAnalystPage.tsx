import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  BrainCircuit,
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Database,
  BarChart,
  HelpCircle,
} from "lucide-react";

import { useActiveDataset } from "@/hooks/useActiveDataset";
import { aiApi } from "@/services/api/aiApi";
import { queryKeys } from "@/services/api/queryKeys";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlotlyChart } from "@/components/charts/PlotlyChart";
import { AiChatResponse } from "@/types";

interface MessageItem {
  id: string;
  sender: "user" | "ai";
  text: string;
  responsePayload?: AiChatResponse;
  timestamp: string;
}

export const AiAnalystPage: React.FC = () => {
  const { activeDataset, activeDatasetId } = useActiveDataset();
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Status Query
  const { data: status } = useQuery({
    queryKey: queryKeys.aiStatus,
    queryFn: aiApi.getStatus,
  });

  const chatMutation = useMutation({
    mutationFn: (msg: string) => aiApi.chat(activeDatasetId!, msg),
    onSuccess: (data) => {
      const aiMsg: MessageItem = {
        id: `msg_ai_${Date.now()}`,
        sender: "ai",
        text: data.answer,
        responsePayload: data,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatMutation.isPending]);

  // Reset messages when active dataset changes so questions are always answered about the selected file
  useEffect(() => {
    setMessages([]);
  }, [activeDatasetId]);

  if (!activeDatasetId || !activeDataset) {
    return (
      <EmptyState
        icon={Database}
        title="No Dataset Selected"
        description="Select or upload a dataset to converse with the AI Data Analyst about patterns, distributions, and metrics."
      />
    );
  }

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || chatMutation.isPending) return;

    const userMsg: MessageItem = {
      id: `msg_user_${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    chatMutation.mutate(text);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const suggestedPrompts = [
    "Mere business ko grow karne ke liye plan batao",
    "Which product generated the highest revenue?",
    "Sales aur profit badhane ki strategies kya hain?",
    "Which category generated the highest profit?",
    "Are there any duplicate rows or missing values?",
  ];

  return (
    <div className="space-y-4 max-w-5xl mx-auto flex flex-col h-[calc(100vh-8.5rem)]">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DAD3C6]">
        <div>
          <h2 className="text-xl font-bold text-[#133857] tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-[#226192]" />
            AI Data Analyst Workspace
          </h2>
          <p className="text-xs text-[#5B5245] mt-0.5">
            Conversational queries translated into deterministic Python computations. Zero hallucinations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={status?.is_configured ? "secondary" : "neutral"}
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Sparkles className="w-3 h-3 mr-1 text-[#A9B887]" />
            {status?.is_configured ? `Live AI (${status.model})` : "Deterministic Heuristic Engine"}
          </Badge>

          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessages([])}
              title="Clear conversation"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Suggested Prompts Bar */}
      {messages.length === 0 && (
        <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#DAD3C6] shadow-xs space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#133857]">
            <Sparkles className="w-3.5 h-3.5 text-[#226192]" />
            Suggested Questions for {activeDataset.name}:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="text-xs px-3 py-1.5 rounded-xl bg-[#EAE6DE]/60 text-[#133857] hover:bg-[#EAE6DE] border border-[#DAD3C6] hover:border-[#226192] transition-colors text-left cursor-pointer font-medium"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages Log */}
      <Card className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FAF8F5]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 text-[#5B5245]">
            <Bot className="w-12 h-12 text-[#226192]/40 mb-3" />
            <h4 className="text-sm font-semibold text-[#133857]">Ask any question about {activeDataset.name}</h4>
            <p className="text-xs max-w-sm mt-1 text-[#5B5245]">
              Ask about top performers, missing data, relationships, or request a specific chart.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.sender === "user";
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#226192] text-[#FAF8F5] flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                    isUser
                      ? "bg-[#226192] text-[#FAF8F5] rounded-tr-xs shadow-xs"
                      : "bg-[#EAE6DE]/50 text-[#133857] border border-[#DAD3C6] shadow-xs rounded-tl-xs space-y-3"
                  }`}
                >
                  {/* Message Text with preserved formatting */}
                  <div className="whitespace-pre-wrap">{m.text}</div>

                  {/* Inline Suggested Chart if provided by AI */}
                  {m.responsePayload?.suggested_chart && (
                    <div className="pt-2 border-t border-[#DAD3C6]">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#133857] mb-2">
                        <BarChart className="w-3.5 h-3.5 text-[#226192]" />
                        Generated Plotly Chart: {m.responsePayload.suggested_chart.title}
                      </div>
                      <PlotlyChart
                        data={m.responsePayload.suggested_chart.plotly_data}
                        layout={m.responsePayload.suggested_chart.plotly_layout}
                        className="w-full h-72"
                      />
                    </div>
                  )}

                  {/* Suggested Follow-ups */}
                  {m.responsePayload?.suggested_followups && m.responsePayload.suggested_followups.length > 0 && (
                    <div className="pt-2 border-t border-[#DAD3C6] flex flex-wrap gap-1.5">
                      {m.responsePayload.suggested_followups.map((f, fi) => (
                        <button
                          key={fi}
                          onClick={() => handleSend(f)}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#EAE6DE] border border-[#DAD3C6] text-[#133857] font-medium transition-colors cursor-pointer"
                        >
                          {f} ➔
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message Footer */}
                  {!isUser && (
                    <div className="flex items-center justify-between pt-1 text-[10px] text-[#5B5245] border-t border-[#DAD3C6]">
                      <span>Intent: {m.responsePayload?.intent_recognized || "general"}</span>
                      <button
                        onClick={() => handleCopy(m.id, m.text)}
                        className="flex items-center gap-1 text-[#5B5245] hover:text-[#133857] cursor-pointer"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-[#A9B887]" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#EAE6DE] border border-[#DAD3C6] text-[#133857] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {chatMutation.isPending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#226192] text-[#FAF8F5] flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#DAD3C6] shadow-xs text-xs text-[#5B5245] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#A9B887] animate-ping" />
              Interpreting intent and executing approved calculations...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </Card>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Ask a question about your dataset (e.g. Which category had the highest profit?)..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 bg-[#FAF8F5] border border-[#DAD3C6] rounded-xl px-4 py-2.5 text-xs text-[#133857] shadow-2xs focus:outline-none focus:border-[#226192] focus:ring-1 focus:ring-[#226192]/20 placeholder:text-[#5B5245]/60"
        />
        <Button
          type="submit"
          variant="primary"
          disabled={!inputMessage.trim() || chatMutation.isPending}
          isLoading={chatMutation.isPending}
        >
          <Send className="w-4 h-4 mr-1.5" /> Send
        </Button>
      </form>
    </div>
  );
};
