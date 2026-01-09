


import { Divide, Plus } from "lucide-react";
import { Home, Star, Trash2, Settings, Share2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import NewMenu from "./NewMenu";
import { useRef, useState } from "react";

export default function BottomNav() {
      const menuRef = useRef(null);
       const [isOpen, setIsOpen] = useState(true);
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 md:hidden">
      <ul className="flex justify-around items-center h-16 relative">

        <NavItem to="/app" label="Home" end icon={<Home size={18}  />} />
        <NavItem to="/app/starred" label="Starred" icon={<Star size={18} />} />

      

        <NavItem to="/app/shared" label="Shared" icon={<Share2 size={18} />} />
        <NavItem to="/app/bin" label="Bin" icon={<Trash2 size={18} />} />

      </ul>
       
    </nav>
  );
}


function NavItem({ to, icon, label, end = false }) {
  return (
    <li>
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-1 w-14 py-2 rounded-md transition
           ${isActive ? "text-blue-600" : "text-gray-700 hover:text-gray-600"}`
        }
      >
        {icon}
        <span className="text-[11px] font-medium leading-none">
          {label}
        </span>
      </NavLink>
    </li>
  );
}