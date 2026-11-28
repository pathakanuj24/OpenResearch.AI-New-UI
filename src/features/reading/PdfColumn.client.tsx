"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Loader2 } from "lucide-react";
import { usePdfBytes } from "./usePdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export type PdfTarget = { page: number; quote?: string; nonce: number };
const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** The paper's real PDF, pages flowing in the reading column (fallback when passages aren't available). */
export default function PdfColumn({ paperId, target }: { paperId: string; target?: PdfTarget | null }) {
  const box = useRef<HTMLDivElement>(null);
  const pages = useRef<Record<number, HTMLDivElement | null>>({});
  const pdf = usePdfBytes(paperId);
  const file = useMemo(() => (pdf.data ? { data: pdf.data.slice() } : null), [pdf.data]);
  const error = pdf.error ? (pdf.error as Error).message : null;
  const [n, setN] = useState(0);
  const [width, setWidth] = useState(720);

  useEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.min(760, e.contentRect.width)));
    ro.observe(el); return () => ro.disconnect();
  }, []);

  const q = useMemo(() => (target?.quote ? norm(target.quote.replace(/…$/, "")) : ""), [target]);
  const render = useCallback(({ str, pageNumber }: { str: string; pageNumber: number }) => {
    if (!target || pageNumber !== target.page || !q) return esc(str);
    const s = norm(str);
    // Only real phrases: short fragments (numbers, symbols, single words) match almost any quote.
    return s.length >= 12 && s.includes(" ") && q.includes(s) ? `<mark class="cite-mark">${esc(str)}</mark>` : esc(str);
  }, [target, q]);

  useEffect(() => {
    if (!target) return;
    pages.current[target.page]?.scrollIntoView({ behavior: "smooth", block: "start" });
    const t = setTimeout(() => pages.current[target.page]?.querySelector(".cite-mark")?.scrollIntoView({ behavior: "smooth", block: "center" }), 600);
    return () => clearTimeout(t);
  }, [target]);

  return (
    <div ref={box} className="w-full">
      {error ? <p className="rounded-[14px] bg-surface-2 p-4 text-sm text-ink-2">{error}</p>
        : !file ? <div className="flex justify-center py-16 text-ink-3"><Loader2 className="size-5 animate-spin" /></div>
        : (
          <Document file={file} onLoadSuccess={({ numPages }) => setN(numPages)} loading={<div className="flex justify-center py-16"><Loader2 className="size-5 animate-spin" /></div>}>
            {Array.from({ length: n }, (_, i) => i + 1).map((p) => (
              <div key={p} ref={(el) => { pages.current[p] = el; }} data-page={p} data-reveal className="mb-5 scroll-mt-24 overflow-hidden rounded-[var(--r)] border border-line bg-white shadow-1">
                <Page pageNumber={p} width={width} customTextRenderer={render} />
              </div>
            ))}
          </Document>
        )}
    </div>
  );
}
