import Link from "next/link";
import { Button, Topo } from "@/components/atlas";

export default function NotFound() {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-bg px-5">
      <Topo seed="404" className="absolute inset-0 size-full text-line-2" opacity={0.7} />
      <div className="relative max-w-md text-center">
        <p className="text-[12.5px] font-semibold uppercase tracking-[.08em] text-ink-3">Not found · 404</p>
        <h1 className="mt-2 text-[34px] font-semibold tracking-[-0.035em]">This trail doesn&apos;t go anywhere.</h1>
        <p className="mt-2 text-ink-2">The page you followed doesn&apos;t exist or has moved. Head back and pick up where you left off.</p>
        <div className="mt-6 flex justify-center gap-2"><Button variant="pri" asChild><Link href="/today">Go to Today</Link></Button><Button asChild><Link href="/">Home page</Link></Button></div>
      </div>
    </div>
  );
}
