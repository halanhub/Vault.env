"use client";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div style={{
      display: "flex",
      width: "100%",
      gap: 4,
      padding: 5,
      backgroundColor: "#fff",
      border: "2px solid #000",
      borderRadius: 999,
      boxShadow: "4px 4px 0 0 #000",
    }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              flex: 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              padding: "9px 12px",
              borderRadius: 999, border: "none",
              fontSize: 14, fontWeight: 700,
              cursor: "pointer",
              transition: "background 0.15s, color 0.15s, box-shadow 0.15s",
              backgroundColor: isActive ? "#1A1A1A" : "transparent",
              color: isActive ? "#fff" : "#6b7280",
              boxShadow: isActive ? "2px 2px 0 0 #000" : "none",
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
