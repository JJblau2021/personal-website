"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CopyIcon,
  TrashIcon,
  CheckIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "lucide-react";

type JsonValue = string | number | boolean | null | unknown[] | Record<string, unknown>;

type JsonNode = {
  key: string;
  value: JsonValue;
  nodeType: "object" | "array" | "string" | "number" | "boolean" | "null";
  path: string;
};

function getNodeType(value: unknown): JsonNode["nodeType"] {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value as JsonNode["nodeType"];
}

function buildNode(value: JsonValue, key: string = "root", path: string = ""): JsonNode {
  return { key, value, nodeType: getNodeType(value), path: path ? `${path}.${key}` : key };
}

interface TreeNodeProps {
  node: JsonNode;
  depth: number;
  defaultExpanded?: boolean;
}

function TreeNode({ node, depth, defaultExpanded = true }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded && depth < 3);
  
  const toggle = () => setExpanded(!expanded);
  
  const renderValue = () => {
    switch (node.nodeType) {
      case "string":
        return <span className="text-emerald-600 dark:text-emerald-400">"{String(node.value)}"</span>;
      case "number":
        return <span className="text-amber-600 dark:text-amber-400">{String(node.value)}</span>;
      case "boolean":
        return <span className="text-violet-600 dark:text-violet-400">{String(node.value)}</span>;
      case "null":
        return <span className="text-muted-foreground">null</span>;
      case "array":
      case "object":
        return null;
    }
  };
  
  const childEntries: [string, JsonValue][] = node.nodeType === "object" 
    ? Object.entries(node.value as Record<string, JsonValue>)
    : node.nodeType === "array"
    ? (node.value as JsonValue[]).map((v, i) => [String(i), v])
    : [];
  
  const isExpandable = node.nodeType === "object" || node.nodeType === "array";
  const childCount = childEntries.length;
  
  return (
    <div className="select-none">
      <div 
        className="flex items-center gap-1 py-0.5 px-1 rounded hover:bg-muted/50 cursor-pointer"
        style={{ paddingLeft: `${depth * 16}px` }}
        onClick={isExpandable ? toggle : undefined}
      >
        {isExpandable ? (
          <>
            {expanded ? (
              <ChevronDownIcon className="size-3 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRightIcon className="size-3 text-muted-foreground shrink-0" />
            )}
            <span className="text-blue-600 dark:text-blue-400 font-medium">{node.key}</span>
            <span className="text-muted-foreground text-xs">
              {node.nodeType === "array" ? `[${childCount}]` : `{${childCount}}`}
            </span>
          </>
        ) : (
          <>
            <span className="w-3 shrink-0" />
            <span className="text-blue-600 dark:text-blue-400 font-medium">{node.key}</span>
            <span className="text-muted-foreground mx-1">:</span>
            {renderValue()}
          </>
        )}
      </div>
      
      {isExpandable && expanded && (
        <div>
          {childEntries.map(([k, v]) => (
            <TreeNode 
              key={k} 
              node={buildNode(v, k, node.path)} 
              depth={depth + 1}
              defaultExpanded={depth < 2}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function JsonTool() {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<JsonValue | null>(null);
  const [copied, setCopied] = useState(false);
  
  const parseJson = useCallback((text: string) => {
    if (!text.trim()) {
      setError(null);
      setParsed(null);
      return;
    }
    
    try {
      const result = JSON.parse(text);
      setError(null);
      setParsed(result);
    } catch (e) {
      setError((e as Error).message);
      setParsed(null);
    }
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInput(text);
    parseJson(text);
  };
  
  const handleClear = () => {
    setInput("");
    setError(null);
    setParsed(null);
  };
  
  const handleCopy = async () => {
    if (!input.trim()) return;
    try {
      await navigator.clipboard.writeText(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };
  
  const handleFormat = () => {
    if (!input.trim()) return;
    try {
      const obj = JSON.parse(input);
      const formatted = JSON.stringify(obj, null, 2);
      setInput(formatted);
      setError(null);
      setParsed(obj);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  
  const handleMinify = () => {
    if (!input.trim()) return;
    try {
      const obj = JSON.parse(input);
      const minified = JSON.stringify(obj);
      setInput(minified);
      setError(null);
      setParsed(obj);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  
  const getTypeLabel = () => {
    if (parsed === null) return null;
    if (Array.isArray(parsed)) return `Array[${parsed.length}]`;
    return `Object{${Object.keys(parsed as Record<string, unknown>).length}}`;
  };
  
  return (
    <div className="flex flex-col h-full w-full p-4 gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            JSON 预览
          </Badge>
          {getTypeLabel() && (
            <Badge variant="outline" className="text-xs">
              {getTypeLabel()}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleFormat}>
            格式化
          </Button>
          <Button size="sm" variant="outline" onClick={handleMinify}>
            压缩
          </Button>
          <Button size="sm" variant="outline" onClick={handleCopy} disabled={!input.trim()}>
            {copied ? <CheckIcon className="size-3 mr-1" /> : <CopyIcon className="size-3 mr-1" />}
            {copied ? "已复制" : "复制"}
          </Button>
          <Button size="sm" variant="outline" onClick={handleClear}>
            <TrashIcon className="size-3 mr-1" />
            清空
          </Button>
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        <div className="flex flex-col min-h-0">
          <div className="text-xs font-medium text-muted-foreground mb-2 px-1">输入</div>
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="在此粘贴 JSON..."
            className="flex-1 w-full p-3 rounded-lg border border-input bg-background text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            spellCheck={false}
          />
        </div>
        
        <div className="flex flex-col min-h-0">
          <div className="text-xs font-medium text-muted-foreground mb-2 px-1">预览</div>
          <div className="flex-1 rounded-lg border border-input bg-card overflow-auto p-3">
            {error ? (
              <div className="p-4">
                <div className="text-destructive text-sm font-medium mb-1">解析错误</div>
                <div className="text-muted-foreground text-xs font-mono">{error}</div>
              </div>
            ) : parsed === null ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                有效 JSON 将在此预览
              </div>
            ) : (
              <div className="text-sm font-mono">
                <TreeNode 
                  node={buildNode(parsed)} 
                  depth={0}
                  defaultExpanded={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
