/**
 * Turns a PDF's positioned text (pdf.js getTextContent) into reading blocks: headings, paragraphs and
 * figure/table captions, with page numbers kept for citations and "view in PDF".
 * Heuristics are field-neutral: font size and weight, numbering, line gaps, repeated headers/footers.
 */
export type Block =
  | { kind: "heading"; text: string; page: number; level: 1 | 2; num?: string }
  | { kind: "math"; text: string; page: number }
  | { kind: "para"; text: string; page: number; id: string }
  | { kind: "caption"; text: string; page: number; label: string };

type Item = { str: string; x: number; y: number; w: number; h: number; bold: boolean };
type Line = { text: string; x: number; y: number; right: number; size: number; bold: boolean; page: number; pageH: number; pageW: number };

export type PageText = { page: number; width: number; height: number; items: Item[] };

const median = (a: number[]) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };

const ARXIV_STAMP = /^\s*arXiv:\d{4}\.\d{4,5}(v\d+)?\s*(\[[^\]]*\])?\s*(\d{1,2}\s+[A-Z][a-z]{2}\s+\d{4})?\s*/;

function toLines(p: PageText): Line[] {
  const rows: Item[][] = [];
  for (const it of [...p.items].sort((a, b) => b.y - a.y || a.x - b.x)) {
    if (!it.str.trim()) continue;
    const row = rows.find((r) => Math.abs(r[0].y - it.y) <= Math.max(2, it.h * 0.35));
    if (row) row.push(it); else rows.push([it]);
  }
  // Two-column pages: if many rows start right of the middle, read the left column first.
  const mid = p.width / 2;
  const lines = rows.map((r) => {
    r.sort((a, b) => a.x - b.x);
    let text = "";
    let prevEnd = -1;
    for (const it of r) {
      if (prevEnd >= 0 && it.x - prevEnd > it.h * 0.15 && !text.endsWith(" ") && !it.str.startsWith(" ")) text += " ";
      text += it.str;
      prevEnd = it.x + it.w;
    }
    return {
      // arXiv's rotated margin stamp ("arXiv:1706.03762v7 [cs.CL] 2 Aug 2023") lands at the start of a body line.
      text: text.replace(/\s+/g, " ").replace(ARXIV_STAMP, "").trim(), x: r[0].x, y: r[0].y, right: prevEnd,
      size: Math.max(...r.map((i) => i.h)), bold: r.every((i) => i.bold), page: p.page, pageH: p.height, pageW: p.width,
    };
  });
  const rightCol = lines.filter((l) => l.x > mid - 10 && l.right - l.x < p.width * 0.48).length;
  const twoCol = rightCol > lines.length * 0.3;
  return twoCol ? [...lines.filter((l) => l.x < mid - 10), ...lines.filter((l) => l.x >= mid - 10)] : lines;
}

const NUMBERED = /^(\d{1,2}(\.\d{1,2}){0,3}|[IVX]{1,5})\.?\s+[A-Z(][^]{1,90}$/;
const DEEP_NUMBERED = /^\d{1,2}(\.\d{1,2}){1,3}\.?\s+[A-Z][^.!?]{2,70}$/; // "3.2.1 Scaled Dot-Product Attention"
const NUM_PREFIX = /^((\d{1,2}(\.\d{1,2}){0,3}|[IVX]{1,5})\.?)\s+/;
/** Lines that are mostly symbols/numbers: equation fragments. */
const mathy = (t: string) => { const letters = (t.match(/[A-Za-z]/g) ?? []).length; return t.length < 25 || letters / t.length < 0.55; };
const NAMED = /^(abstract|introduction|background|related work|methods?|methodology|materials and methods|data|results|discussion|conclusions?|references|bibliography|acknowledge?ments?|appendix|limitations|future work)\b/i;
const CAPTION = /^(fig(ure)?|table)\.?\s*(\d+|[IVX]+)\s*[:.]/i;

export function reflow(pages: PageText[]): Block[] {
  const all = pages.flatMap(toLines);
  if (!all.length) return [];
  const body = median(all.filter((l) => l.text.length > 30).map((l) => l.size)) || 10;
  // Repeated headers/footers and page numbers.
  const edge = (l: Line) => l.y > l.pageH * 0.93 || l.y < l.pageH * 0.06;
  const counts = new Map<string, number>();
  for (const l of all) if (edge(l)) { const k = l.text.replace(/\d+/g, "#"); counts.set(k, (counts.get(k) ?? 0) + 1); }
  const lines = all.filter((l) => !(edge(l) && ((counts.get(l.text.replace(/\d+/g, "#")) ?? 0) > 1 || /^\d{1,4}$/.test(l.text))));

  const blocks: Block[] = [];
  let para: Line[] = [];
  let n = 0;
  const flush = () => {
    if (!para.length) return;
    let text = "";
    for (const l of para) {
      if (text.endsWith("-") && /^[a-z]/.test(l.text)) text = text.slice(0, -1) + l.text;
      else text += (text ? " " : "") + l.text;
    }
    text = text.replace(/\s+([,.;:])/g, "$1").trim();
    if (text) {
      const cap = text.match(CAPTION);
      const prevBlock = blocks[blocks.length - 1];
      if (cap) blocks.push({ kind: "caption", text, page: para[0].page, label: cap[0].replace(/[:.]$/, "") });
      else if (mathy(text) && text.split(" ").length < 14) {
        // Equation fragments: merge consecutive ones into a single subtle block.
        if (prevBlock?.kind === "math" && prevBlock.page === para[0].page) prevBlock.text += " " + text;
        else blocks.push({ kind: "math", text, page: para[0].page });
      } else blocks.push({ kind: "para", text, page: para[0].page, id: `b${n++}` });
    }
    para = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const prev = lines[i - 1];
    const short = l.text.length < 90 && !/[.,;:]$/.test(l.text);
    const words = l.text.split(" ").length;
    const isHeading = short && l.text.length > 2 && /[A-Za-z]{3}/.test(l.text) && words <= 12 && /^[\dIVXA-Z(]/.test(l.text) && (
      (l.size >= body * 1.12 && words <= 10) || (NUMBERED.test(l.text) && (l.bold || l.size >= body * 1.02)) || DEEP_NUMBERED.test(l.text)
      || (NAMED.test(l.text) && (l.bold || l.size > body) && words <= 6));
    if (isHeading) {
      flush();
      const m = l.text.match(NUM_PREFIX);
      const num = m?.[1].replace(/\.$/, "");
      const level = num ? (num.includes(".") ? 2 : 1) : (l.size >= body * 1.3 || NAMED.test(l.text) ? 1 : 2);
      blocks.push({ kind: "heading", text: m ? l.text.slice(m[0].length) : l.text, page: l.page, level, num });
      continue;
    }
    if (CAPTION.test(l.text)) flush();
    const gap = prev && prev.page === l.page ? prev.y - l.y : 0;
    const newPara = !prev || prev.page !== l.page && /[.!?:]$/.test(prev.text)
      || gap > Math.max(l.size, prev.size) * 1.75
      || (prev.page === l.page && prev.right < prev.pageW * 0.7 && /[.!?:]$/.test(prev.text) && l.x - prev.x < 30)
      || Math.abs(l.size - prev.size) > body * 0.18;
    if (newPara) flush();
    para.push(l);
  }
  flush();
  // Lone symbols and indices ("4", "dk", "i=1") are pieces of an equation the PDF split up; on their own they're noise.
  for (let i = blocks.length - 1; i >= 0; i--) {
    const b = blocks[i];
    if (b.kind === "math" && b.text.replace(/\s/g, "").length < 6) blocks.splice(i, 1);
  }
  // Drop the title page above the abstract (title, authors, notices): the reading header shows them.
  const abs = blocks.findIndex((b) => b.kind === "heading" && /^abstract\b/i.test(b.text));
  return abs > 0 && blocks.slice(0, abs).every((b) => b.page === 1) ? blocks.slice(abs) : blocks;
}

/** Find the paragraph a citation quote came from: exact phrase first, then word overlap near the cited page. */
export function findBlock(blocks: Block[], quote: string, page: number): string | null {
  const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const q = norm(quote.replace(/…$/, ""));
  const words = q.split(" ").filter((w) => w.length > 2);
  const paras = blocks.filter((b): b is Extract<Block, { kind: "para" }> => b.kind === "para");
  const probe = q.split(" ").slice(0, 8).join(" ");
  const exact = paras.find((b) => probe.length > 20 && norm(b.text).includes(probe));
  if (exact) return exact.id;
  let best: { id: string; score: number } | null = null;
  for (const b of paras) {
    if (Math.abs(b.page - page) > 1) continue;
    const set = new Set(norm(b.text).split(" "));
    const score = words.filter((w) => set.has(w)).length / Math.max(1, words.length) - Math.abs(b.page - page) * 0.05;
    if (!best || score > best.score) best = { id: b.id, score };
  }
  return best && best.score > 0.35 ? best.id : null;
}
