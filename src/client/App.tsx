import { useState } from "react";
import { Header } from "./components/Header";
import { ToastContainer } from "./components/Toast";
import { SubscriptionPage } from "./pages/SubscriptionPage";
import { ConverterPage } from "./pages/ConverterPage";
import { ParserPage } from "./pages/ParserPage";
import { Base64Page } from "./pages/Base64Page";
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
      case "about":
        return <AboutPage />;
      default:
        return <SubscriptionPage onToast={addToast} />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-6xl mx-auto px-4 py-6">{renderPage()}</main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
