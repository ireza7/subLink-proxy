interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "subscription", label: "سابسکریپشن", icon: "📡" },
  { id: "converter", label: "تبدیل فرمت", icon: "🔄" },
  { id: "parser", label: "تحلیل کانفیگ", icon: "🔍" },
  { id: "merger", label: "ادغام سابسکریپشن", icon: "🔗" },
  { id: "cleaner", label: "پاکسازی", icon: "🧹" },
  { id: "qrcode", label: "QR Code", icon: "📱" },
  { id: "base64", label: "Base64", icon: "🔐" },
  { id: "about", label: "درباره", icon: "ℹ️" },
];

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        {/* Logo */}
        <div className="flex items-center justify-between py-4">
          <button
            onClick={() => onTabChange("subscription")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
              V2
            </div>
            <div className="text-right">
              <h1 className="text-lg font-bold text-white leading-tight">V2Sub Worker</h1>
              <p className="text-xs text-gray-500">ابزار مدیریت سابسکریپشن V2Ray</p>
            </div>
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
            title="GitHub Repository"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        </div>

        {/* Tabs */}
        <nav className="flex gap-1 -mb-px overflow-x-auto pb-px scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-medium rounded-t-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-gray-800 text-white border-b-2 border-primary"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
              }`}
            >
              <span className="hidden sm:inline">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
