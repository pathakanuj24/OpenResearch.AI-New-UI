"use client";

import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { CitePin } from "@/components/atlas";
import type { SourceData } from "./types";

const CITE = /\[(\d+(?:\s*[,;]\s*\d+)*)\]/g;

/** Turn "[1, 3]" into links with a cite: scheme that render as citation chips. */
export function linkCitations(text: string) {
  return text.replace(CITE, (_, group: string) =>
    group.split(/[,;]/).map((n) => `[${n.trim()}](cite:${n.trim()})`).join(""),
  );
}

export function Markdown({
  text,
  sources,
  onCite,
}: {
  text: string;
  sources?: SourceData[];
  onCite?: (s: SourceData) => void;
}) {
  const byIndex = new Map((sources ?? []).map((s) => [s.index, s]));
  return (
    <div className="answer">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        urlTransform={(url) => (url.startsWith("cite:") ? url : defaultUrlTransform(url))}
        components={{
          a({ href, children }) {
            if (href?.startsWith("cite:")) {
              const n = Number(href.slice(5));
              const s = byIndex.get(n);
              if (!s) return <sup className="text-ink-3">[{n}]</sup>;
              return (
                <CitePin n={n} onClick={() => onCite?.(s)} quote={s.quote}
                  label={`Source ${n}: page ${s.page}${s.section ? `, ${s.section}` : ""}`} />
              );
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-moss-text underline underline-offset-2">
                {children}
              </a>
            );
          },
        }}
      >
        {linkCitations(text)}
      </ReactMarkdown>
    </div>
  );
}
