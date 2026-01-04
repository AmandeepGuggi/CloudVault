// import { Star, Home, Trash2, Settings, Share2 } from "lucide-react";
// import { NavLink } from "react-router-dom";

// export default function BottomNav() {
//   return (
//    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 md:hidden">
//   <ul className="flex justify-around items-center h-16">
    
//     <NavItem to="/home" label="Home" icon={<Home size={20} />} />
//     <NavItem to="/starred" label="Starred" icon={<Star size={20} />} />
//     <NavItem to="/shared" label="Shared" icon={<Share2 size={20} />} />
//     <NavItem to="/bin" label="Bin" icon={<Trash2 size={20} />} />
//     <NavItem to="/settings" label="Settings" icon={<Settings size={20} />} />

//   </ul>
// </nav>

//   );
// }



import { Divide, Plus } from "lucide-react";
import { Home, Star, Trash2, Settings, Share2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import NewMenu from "./NewMenu";
import { useRef, useState } from "react";

export default function BottomNav({ onAddClick, setShowNewMenu, fileInputRef, onUploadFilesClick, handleFileSelect, disabled, onCreateFolder, showNewMenu }) {
      const menuRef = useRef(null);
       const [isOpen, setIsOpen] = useState(true);
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 md:hidden">
      <ul className="flex justify-around items-center h-16 relative">

        <NavItem to="/home" label="Home" icon={<Home size={18} />} />
        <NavItem to="/starred" label="Starred" icon={<Star size={18} />} />

        {/* CENTER ADD BUTTON */}
        <li>
          <button
            onClick={onAddClick}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-white shadow-md -mt-6 active:scale-95 transition"
            aria-label="Add new"
          >
            <Plus size={22} />
          </button>
        </li>

        <NavItem to="/shared" label="Shared" icon={<Share2 size={18} />} />
        <NavItem to="/bin" label="Bin" icon={<Trash2 size={18} />} />

      </ul>
        { showNewMenu && 
                    <NewMenu
                    onClose={()=> setShowNewMenu(false)}
                      reff={menuRef}
                      fileInputRef={fileInputRef}
                      onUploadFilesClicks={onUploadFilesClick}
                      handleFileSelect={handleFileSelect}
                      disabled={disabled}
                      onCreateFolder={onCreateFolder}
                      showNewMenu={showNewMenu}
                      className={` top-full mt-4 w-[90vw] max-w-sm sm:w-[350px] bg-white rounded-lg shadow-xl p-6 transition-all duration-600 ease-in-out
          ${
            isOpen
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none"
          }`}
                    />
                  }
                 
    </nav>
  );
}


function NavItem({ to, icon, label }) {
  return (
    <li>
      <NavLink
        to={to}
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