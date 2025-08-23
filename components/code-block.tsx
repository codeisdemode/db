"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface CodeBlockProps {
  code: string
  language?: string
  showLineNumbers?: boolean
  className?: string
}

export function CodeBlock({ code, language = "javascript", showLineNumbers = true, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = code.trim().split("\n")

  return (
    <div className={cn("relative rounded-lg overflow-hidden bg-muted/50", className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-muted/80 border-b border-border">
        <div className="text-sm text-muted-foreground">{language}</div>
        <button
          onClick={copyToClipboard}
          className="p-1 rounded hover:bg-background/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono">
          {lines.map((line, i) => (
            <div key={i} className="table-row">
              {showLineNumbers && (
                <span className="table-cell pr-4 text-right text-muted-foreground select-none">{i + 1}</span>
              )}
              <span className="table-cell">{line}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  )
}

