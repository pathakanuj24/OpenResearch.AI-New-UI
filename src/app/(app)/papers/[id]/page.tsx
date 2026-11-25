import { Suspense } from "react";
import { PaperScreen } from "@/features/reading/PaperScreen";

export const metadata = { title: "Reading" };

export default async function PaperPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Suspense><PaperScreen id={id} /></Suspense>;
}
