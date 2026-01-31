import { useState, useRef, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import BottomNav from "./components/BottomNav.jsx";
import { Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored !== null ? JSON.parse(stored) : true;
  });
   const { user } = useAuth();
 
  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  // Context menu
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="flex h-screen  overflow-hidden">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
      />
      {/* <Header /> */}
      <div className="flex-1 flex flex-col">
        <Topbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          showProfile={showProfile}
          setShowProfile={setShowProfile}
          isCollapsed={sidebarOpen}
        />

        <main className="p-3 h-full bg-[#f8f9f9]  md:bg-white overflow-y-auto">
          <Outlet />
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
