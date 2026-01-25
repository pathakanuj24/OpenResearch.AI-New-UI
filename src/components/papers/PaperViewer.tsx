import dynamic from "next/dynamic";

const PaperViewer = dynamic(
  () => import("./PaperViewer.client"),
  {
    ssr: false, // 🔥 THIS FIXES DOMMatrix ERROR
    loading: () => (
      <div style={{ padding: 24 }}>Loading PDF…</div>
    ),
  }
);

export default PaperViewer;
