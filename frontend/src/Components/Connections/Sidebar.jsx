import { Compass, Users, UserPlus } from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const items = [
    { id: 1, icon: Compass, label: "Discover People", color: "#22D3EE" },
    { id: 2, icon: Users, label: "My Connections", color: "#8B5CF6" },
    { id: 3, icon: UserPlus, label: "Sent Requests", color: "#10B981" },
  ];

  return (
    <div className="card-static p-2 hidden lg:block">
      <nav className="space-y-1">
        {items.map((item) => {
          const active = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                active
                  ? "bg-[#15152A] border border-[#8B5CF6]/25"
                  : "border border-transparent hover:bg-white/[0.03]"
              }`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: active ? `${item.color}20` : "#0F141C",
                  border: `1px solid ${active ? item.color + "40" : "#18202B"}`,
                }}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: active ? item.color : "#71717A" }}
                />
              </div>
              <span
                className={`text-sm font-medium ${
                  active ? "text-white" : "text-secondary"
                }`}
              >
                {item.label}
              </span>
              {active && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: item.color }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;