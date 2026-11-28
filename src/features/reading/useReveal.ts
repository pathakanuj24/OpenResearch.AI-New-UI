"use client";

import { useEffect } from "react";

/**
 * Reading flow: every `[data-reveal]` block inside the container rises in once, the first time it scrolls into view.
 * Uses one IntersectionObserver for the whole column and watches for blocks rendered later (the text rebuilt from
 * the PDF arrives after the page). Marks blocks with a data attribute, not a class, so React re-renders that set
 * `className` can't undo it. The hidden state only applies while the container carries `data-reveal-ready`.
 */
export function useReveal(container: React.RefObject<HTMLElement | null>, key: unknown) {
  useEffect(() => {
    const el = container.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.setAttribute("data-revealed", "");
        io.unobserve(e.target);
      }
    }, { rootMargin: "0px 0px -6% 0px" });
    const seen = new WeakSet<Element>();
    const scan = () => el.querySelectorAll("[data-reveal]:not([data-revealed])").forEach((n) => {
      if (!seen.has(n)) { seen.add(n); io.observe(n); }
    });
    el.setAttribute("data-reveal-ready", "");
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(el, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); el.removeAttribute("data-reveal-ready"); };
  }, [container, key]);
}
