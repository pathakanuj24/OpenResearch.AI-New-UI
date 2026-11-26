import Link from "next/link";
import { Button, Logo, Topo } from "@/components/atlas";

export const metadata = { title: "Signed out" };

export default async function SignedOut({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const deleted = (await searchParams).deleted;
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-bg px-5">
      <Topo seed="signed-out" className="absolute inset-0 size-full text-line-2" opacity={0.7} />
      <div className="relative max-w-md text-center">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-8 text-[34px] font-semibold tracking-[-0.035em]">{deleted ? "Your account is deleted." : "You're signed out."}</h1>
        <p className="mt-2 text-ink-2">{deleted ? "Your papers, trails and memory are gone. Thanks for reading with us." : "Your trail is saved. It'll be right here when you come back."}</p>
        <div className="mt-6 flex justify-center gap-2">
          {deleted ? null : <Button variant="pri" asChild><Link href="/login">Log in again</Link></Button>}
          <Button asChild><Link href="/">Go to the home page</Link></Button>
        </div>
      </div>
    </div>
  );
}
