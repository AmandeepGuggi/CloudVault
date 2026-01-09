import { FaSearch } from "react-icons/fa";
import ProfileMenu from "./ProfileMenu";
import { Menu, Settings, Bell } from "lucide-react";

import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utility";

export default function Topbar({
  onToggleSidebar,
  showProfile,
  onProfileClose,
  onProfileToggle,
}) {

  const profileRef = useRef(null);
   const navigate = useNavigate();

   const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Guest User");
  const [userEmail, setUserEmail] = useState("guest@example.com");



  useEffect(() => {
  if (!showProfile) return;

  function handleOutside(e) {
    if (profileRef.current && !profileRef.current.contains(e.target)) {
      onProfileClose();
    }
  }

  document.addEventListener("mousedown", handleOutside);
  return () => document.removeEventListener("mousedown", handleOutside);
}, [showProfile]);

async function getUser() {
  try {
    const response = await fetch("http://localhost:4000/user/", {
      method: "GET", 
      credentials: "include",
    });

    if (!response.ok) {
      console.error("Unauthorized or failed:", response.status);
      navigate("/login")
      return;
    }

    const data = await response.json(); 

    setUserName(data.name);
    setUserEmail(data.email);

  } catch (err) {
    console.error("Fetch error:", err);
  }
}


useEffect(()=> {
getUser()
},[])

    const handleLogout = async () => {
      console.log("logout clicked");
    try {
      const response = await fetch(`${BASE_URL}/user/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        console.log("Logged out successfully");
        // Optionally reset local state
        setLoggedIn(false);
        setUserName("Guest User");
        setUserEmail("guest@example.com");
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      onProfileClose()
    }
  };

  return (
    <header className="flex items-center border-b border-gray-300 justify-between  px-4 lg:bg-primary relative">
      <div className=" hidden md:flex items-center gap-4">
        <button variant="ghost" size="icon" onClick={onToggleSidebar} className="hover:bg-muted">
          <Menu size={20} />
        </button>
      </div>
      <div className=" hidden md:flex lg:flex items-center w-full mr-4 py-1.75 px-4 outline-none">
        <FaSearch className="inline mr-2 text-gray-400" />
         <input
        className="w-[90%] py-2.25 text-[15px] border-0 outline-0"
        placeholder="Start typing to search your file"
      />
      </div>
      <div className="flex lg:hidden md:hidden  items-center">
        <div className="py-2  md:flex bg-blue-primary m-2 text-white font-bold  rounded px-3 ">
        CV
      </div>
      <p className="text-[20px]  md:py-0 font-bold "> CloudVault</p>
      </div>


<div className="flex items-center gap-3 pl-3">

  {/* Settings and Bell — desktop only */}
    <button
    className=" md:flex items-center justify-center w-9 h-9 rounded-md text-black hover:text-gray-700 hover:bg-gray-100 transition"
    aria-label="Notifications"
    onClick={() => navigate("/notifications")}
  >
    <Bell size={18} />
  </button>
  <button
    className=" md:flex items-center justify-center w-9 h-9 rounded-md text-black hover:text-gray-700 hover:bg-gray-100 transition"
    aria-label="Settings"
    onClick={() => navigate("/settings")}
  >
    <Settings size={18} />
  </button>


  {/* Profile avatar */}
  {/* <div onClick={onProfileToggle}>
    <div className="flex items-center gap-2 cursor-pointer"> 
      <span className="text-sm font-semibold text-white rounded-full overflow-hidden min-w-9 h-9 flex items-center justify-center bg-orange-400 cursor-pointer">
      {userName.charAt(0).toUpperCase()}
    </span>
     <div className="flex flex-col leading-tight"> 
       <span className="hidden md:flex text-sm text-gray-700">{userName}</span>
      <span className="hidden md:flex text-sm text-gray-700">{userEmail}</span>
     </div>
    </div>
  </div> */}

  <div
  onClick={onProfileToggle}
  className="flex items-center gap-3 px-2 py-1 rounded-md cursor-pointer hover:bg-gray-100 transition"
>
  {/* Avatar */}
  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-400 text-white text-sm font-semibold shrink-0">
    {userName?.charAt(0).toUpperCase()}
  </span>

  {/* Text */}
  <div className="hidden md:flex flex-col leading-tight">
    <span className="text-sm font-medium text-gray-800 max-w-[120px] truncate">
      {userName}
    </span>
    <span className="text-xs text-gray-500 max-w-[140px] truncate">
      {userEmail}
    </span>
  </div>
</div>


</div>






      {showProfile &&  <ProfileMenu handleLogout={handleLogout} loggedIn={loggedIn} userName={userName} userEmail={userEmail} reff={profileRef} />
  }
    </header>
  );
}
