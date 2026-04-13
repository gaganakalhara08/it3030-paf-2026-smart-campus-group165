import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: "📊" },
    { label: "My Tickets", path: "/user-dashboard", icon: "🎫" },
    { label: "Profile", path: "#", icon: "👤" },
    { label: "Settings", path: "#", icon: "⚙️" },
  ];

  return (
    <div className="flex">
      <div
        className={`${
          isOpen ? "w-64" : "w-20"
        } bg-gray-800 text-white transition-all duration-300 min-h-screen`}
      >
        <div className="p-4 flex justify-between items-center">
          {isOpen && <h2 className="text-xl font-bold">Menu</h2>}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white hover:bg-gray-700 p-2 rounded"
          >
            {isOpen ? "◀" : "▶"}
          </button>
        </div>

        <nav className="mt-8">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                if (item.path !== "#") navigate(item.path);
              }}
              className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-700 transition mb-2"
            >
              <span className="text-2xl">{item.icon}</span>
              {isOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 bg-gray-100 min-h-screen" />
    </div>
  );
}

export default Sidebar;
