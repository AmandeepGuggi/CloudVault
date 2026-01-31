import { FaCloud } from "react-icons/fa";
import {
  FiHome,
  FiTrash2,
  FiStar,
  FiShare2,
} from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; 
import { useEffect, useRef, useState } from "react";
import { formatBytes } from "../utility";
export default function Sidebar({ open }) {
 const { user, loading, getUser } = useAuth();

  const [storageUsed, setStorageUsed] = useState(user.storage)
   const storageLimit = 200 * 1024 * 1024; // 500 MB in bytes
 const storagePercentage = Math.min(
  (storageUsed / storageLimit) * 100,
  100
);

const roundedPercentage = storagePercentage.toFixed(1);

  return (
    <>
      <aside className={` ${open ? "w-64" : "w-25"} transition-all duration-400 hidden border-r bg-[#edeef0] border-gray-300  md:flex h-screen pb-4 pt-3 flex-col`}>
        <div className="flex items-center px-6 gap-2 border-b border-gray-300 pb-2 mb-6 text-xl font-poppins">
          <p className={` ${open? "": "pb-2.5"} bg-kala p-2 text-[12px] text-white font-extrabold rounded`}>
            <FaCloud className="h-4 w-4" />
          </p>
         {open && 
          <p className="flex flex-col">
            <span className="tracking-widest text-[13px] font-bold">
              CloudVault
            </span>
            <span className=" text-[12px] text-gray-500">Storage</span>
          </p>}
        </div>

        <nav className="text-sm px-3">
         

       

          <NavItem to="/app" icon={<FiHome className="w-4 h-4" />} label="Home" open={open} end />
<NavItem to="/app/starred" icon={<FiStar className="w-4 h-4"  />} label="Starred" open={open} />
<NavItem to="/app/shared" icon={<FiShare2 className="w-4 h-4"  />} label="Shared" open={open} />
<NavItem to="/app/bin" icon={<FiTrash2 className="w-4 h-4"  />} label="Bin" open={open} />

        </nav>

       {open ? 
        <div className={` ${open ? "w-64" : "w-20"} px-6 text-sm mt-auto  flex-col `}>
          <div className="text-gray-500 flex justify-between">
            <p className="uppercase text-[13px] font-semibold ">Storage</p>
            <p> {roundedPercentage} %</p>
          </div>
          <div className="w-full bg-[#e4e4e6] rounded-2xl overflow-hidden h-2">
            <div  style={{ width: `${roundedPercentage}%` }}
            className={`bg-kala transition-all delay-300 h-full  `}></div>
          </div>
          <div className="text-gray-500 ">
            <p className="text-sm">
              {formatBytes(storageUsed)} GB of 200MB used
            </p>
          </div>

          <div className="uppercase text-center py-2 mt-5 bg-kala text-white rounded">Upgrade Storage</div>
        </div> : 
        <div className="mt-auto flex justify-center pb-4">
  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center  text-sm font-semibold text-black">
    {roundedPercentage}%
  </div>
</div>
}
      </aside>

    
    </>
  );
}


function NavItem({ to, icon, label, open, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        ` ${open ? "justify-start px-6 py-2 " : "justify-center px-0 py-2"}
        flex items-center gap-2  mb-2 rounded
        transition-colors cursor-pointer
        ${isActive
          ? "bg-[#e4e4e6] text-kala"
          : "text-black hover:bg-gray-200"}
        `
      }
    >
      <span className="w-5 h-5">{icon}</span>
      {open && <span>{label}</span>}
    </NavLink>
  );
}
