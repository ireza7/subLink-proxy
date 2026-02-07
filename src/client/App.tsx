import { useState } from "react";
import { Header } from "./components/Header";
import { ToastContainer } from "./components/Toast";
import { SubscriptionPage } from "./pages/SubscriptionPage";
import { ConverterPage } from "./pages/ConverterPage";
import { ParserPage } from "./pages/ParserPage";
import { Base64Page } from "./pages/Base64Page";
import { MergerPage } from "./pages/MergerPage";
import { QRCodePage } from "./pages/QRCodePage";
import { CleanerPage } from "./pages/CleanerPage";
import { AboutPage } from "./pages/AboutPage";
import { useToast } from "./hooks/useToast";

export default function App() {
  const [activeTab, setActiveTab] = useState("subscription");
  const { toasts, addToast, removeToast } = useToast();

  function renderPage() {
    switch (activeTab) {
      case "subscription":
        return <SubscriptionPage onToast={addToast} />;
      case "converter":
        return <ConverterPage onToast={addToast} />;
      case "parser":
        return <ParserPage onToast={addToast} />;
      case "base64":
        return <Base64Page onToast={addToast} />;
      case "merger":
        return <MergerPage onToast={addToast} />;
      case "qrcode":
        return <QRCodePage onToast={addToast} />;
      case "cleaner":
        return <CleanerPage onToast={addToast} />;
      case "about":
        return <AboutPage />;
      default:
        return <SubscriptionPage onToast={addToast} />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {renderPage()}
      </main>
      <footer className="border-t border-gray-800 py-4 text-center text-xs text-gray-600">
        <p>
          V2Sub Worker &mdash; Built with{" "}
          <span className="text-gray-500">Hono + React + Vite + Tailwind CSS</span>
        </p>
        <p className="mt-1">Deployed on Cloudflare Workers</p>
      </footer>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
