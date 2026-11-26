"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { logger } from "@/lib/log";
import { cn } from "@/lib/utils";

const log = logger("boundary");

type Props = {
  /** Shown in the fallback and the log: "the guide", "the reading view". */
  area: string;
  children: ReactNode;
  className?: string;
  /** Reset the boundary when any of these change (e.g. the paper id). */
  resetKeys?: unknown[];
};
type State = { error: Error | null; keys?: unknown[] };

/**
 * Keeps one panel's crash from blanking the page: the guide can fail while the paper stays readable.
 * Logs the error with the component stack and offers a retry that re-mounts the panel.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, keys: this.props.resetKeys };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    const changed = (props.resetKeys ?? []).some((k, i) => !Object.is(k, state.keys?.[i]));
    return changed ? { error: null, keys: props.resetKeys } : null;
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    log.error(`${this.props.area} crashed: ${error.message}`, error, {
      source: `boundary:${this.props.area}`, componentStack: info.componentStack?.slice(0, 1500),
    });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className={cn("flex flex-col items-start gap-2 rounded-[var(--r-lg)] border border-line bg-surface p-5", this.props.className)}>
        <p className="font-semibold">Something went wrong in {this.props.area}.</p>
        <p className="text-sm text-ink-2">The rest of the page still works. Try again; if it keeps happening, reload the page.</p>
        <button type="button" onClick={() => this.setState({ error: null })}
          className="mt-1 inline-flex h-9 items-center gap-1.5 rounded-pill bg-moss px-4 text-sm font-semibold text-moss-ink hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss">
          <RotateCcw className="size-3.5" /> Try again
        </button>
      </div>
    );
  }
}
