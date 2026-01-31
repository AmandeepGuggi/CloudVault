import { FaSearch } from "react-icons/fa";
import ProfileMenu from "./ProfileMenu";
import { Menu, Settings, Bell, Search } from "lucide-react";
import { ChevronRight } from 'lucide-react';
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utility";
import { useAuth } from "../context/AuthContext";

export default function Topbar({
  onToggleSidebar,
  showProfile,
  setShowProfile,
  isCollapsed
}) {
const wrapperRef = useRef(null);
const popupRef = useRef(null);
const { user, logout } = useAuth();
   const navigate = useNavigate();

   const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState(user.name);
  const [userEmail, setUserEmail] = useState(user.email);
  const [profileSrc, setProfileSrc] = useState(user.picture);

  const [showNotifications, setShowNotifications] = useState(false);
const [notification, setNotification] = useState([])
const count = notification.length;
const hasNotification = count > 0;

const fetchNotifications = async () => {
  const res = await fetch(`${BASE_URL}/auth/notifications`, {
    credentials: "include",
  });
  const data = await res.json();
  setNotification(data);
};

const clearNotifications = async () => {
  await fetch(`${BASE_URL}/auth/notifications/seen`, {
    method: "POST",
    credentials: "include",
  });
  setNotification([]);
};

  useEffect(() => {
  if (!showProfile) return;

  function handleOutside(e) {
   if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target)
      ) {
        setShowProfile(false);
      }
  }
  
  document.addEventListener("mousedown", handleOutside);
  return () => document.removeEventListener("mousedown", handleOutside);
}, [showProfile, setShowProfile]);




useEffect(()=> {

if (!user) return; 
setLoggedIn(true)
 fetchNotifications();

 function handleClickOutside(e) {
    if (popupRef.current && !popupRef.current.contains(e.target)) {
      setShowNotifications(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
},[])

    const handleLogout = async () => {
    try {
      const response = await fetch(`${BASE_URL}/user/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        console.log("Logged out successfully");
        // Optionally reset local state
        setLoggedIn(false);
        setUserName("");
        setUserEmail("");
        navigate("/login");
        setLoggedIn(false)
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setShowProfile(false);
    }
  };

  return (
    <header className="flex relative items-center border-b border-gray-300 justify-between  px-4 bg-[#f8f9f9] ">
      <div className=" hidden absolute -left-2.5 bg-kala rounded-full md:flex items-center gap-4">
        <button variant="ghost" size="icon" onClick={onToggleSidebar} className="hover:bg-muted">
          <ChevronRight size={25} className={`w-4.5 text-white h-4.5 transition-transform duration-200 ${isCollapsed ? 'rotate-180': ""} )`} />
        </button>
      </div>
      <div className=" hidden md:flex bg-[#e4e4e6] rounded-lg lg:flex items-center w-full mr-4 py-0. m-1.75 px-4 outline-none">
        <Search className="inline mr-2 w-4 h-4 text-gray-400" />
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
    <div className="relative" ref={popupRef}>
  <button
    className="relative flex items-center justify-center w-9 h-9 rounded-md
               text-black hover:text-gray-700 hover:bg-gray-100 transition"
    aria-label="Notifications"
    onClick={() => setShowNotifications((prev) => !prev)}
  >
    <Bell size={18} />

    {hasNotification && (
      <span
        className="absolute top-1 right-1 flex items-center justify-center
                   w-3 h-3 text-[10px] font-semibold
                   text-white bg-red-500 rounded-full"
      >
      {count}
      </span>
    )}
  </button>

  {/* Popup */}
  {showNotifications && (
    <div
      className="absolute right-0 mt-2 w-72 rounded-md border border-gray-300 bg-white shadow-lg z-50"
    >
     {hasNotification? 
     <>
      {notification.map((n,i) => (
        <div  key={i} className="border-b px-4 py-3 border-gray-300 ">
        <div className="bg-blue-100 px-2 py-1 rounded ">
          <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
          New login from a different device
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {n.deviceName}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(n.time).toLocaleTimeString()}
        </p>
        </div>
      </div>

      ) )}

      </> : <div className="flex items-center justify-center pt-4 h-20 ">
      No notifications
      </div>}

      <button
        onClick={() => {
          clearNotifications()
          setShowNotifications(false);
        }}
        className="w-full text-sm text-red-600 py-2 hover:bg-gray-50"
      >
        Clear all
      </button>
    </div>
  )}
</div>
  <button
    className=" md:flex items-center justify-center w-9 h-9 rounded-md text-black hover:text-gray-700 hover:bg-gray-100 transition"
    aria-label="Settings"
    // onClick={() => navigate("/settings")}
    onClick={() => navigate("/settings")}
  >
    <Settings size={18} />
  </button>

  

<div ref={wrapperRef}>
    <div
  onClick={()=> {
    setShowProfile(prev => !prev)
  }}
  className="flex items-center gap-3 px-2 py-1 rounded-md cursor-pointer transition"
>
  {/* Avatar */}
  {profileSrc && <img src={profileSrc} alt="Profile" className="w-9 h-9 border p-0.5 border-gray-300 rounded-full" />}

  {/* Text */}
  <div className="hidden md:flex flex-col leading-tight">
    <span className="text-sm font-medium text-gray-800 max-w-[30 truncate">
      {userName}
    </span>
    <span className="text-xs text-gray-500 max-w-35 truncate">
      {userEmail}
    </span>
  </div>
</div>

    {showProfile &&  <ProfileMenu handleLogout={handleLogout} loggedIn={loggedIn} userName={userName} userEmail={userEmail} />
  }
</div>
</div>

  
    </header>
  );
}


// import { FaSearch } from "react-icons/fa";
// import ProfileMenu from "./ProfileMenu";
// import { Menu, Settings, Bell } from "lucide-react";
// import { useRef, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { BASE_URL } from "../utility";

// export default function Topbar({
//   onToggleSidebar,
//   showProfile,
//   setShowProfile,
// }) {
//   const wrapperRef = useRef(null);
//   const navigate = useNavigate();

//   const [userName, setUserName] = useState("Guest User");
//   const [userEmail, setUserEmail] = useState("guest@example.com");
//   const [profileSrc, setProfileSrc] = useState("");

//   // ---------------- OUTSIDE CLICK ----------------
//   useEffect(() => {
//     if (!showProfile) return;

//     function handleOutside(e) {
//       if (
//         wrapperRef.current &&
//         !wrapperRef.current.contains(e.target)
//       ) {
//         setShowProfile(false);
//       }
//     }

//     document.addEventListener("mousedown", handleOutside);
//     return () =>
//       document.removeEventListener("mousedown", handleOutside);
//   }, [showProfile, setShowProfile]);

//   // ---------------- GET USER ----------------
//   async function getUser() {
//     try {
//       const res = await fetch(`${BASE_URL}/user`, {
//         credentials: "include",
//       });

//       if (!res.ok) {
//         navigate("/login");
//         return;
//       }

//       const data = await res.json();
//       setUserName(data.name);
//       setUserEmail(data.email);
//       setProfileSrc(
//         data.picture ||
//           "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYfAWbelVtedtn8mYCajf5bYv6PJgyMxOR2g&s"
//       );
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   useEffect(() => {
//     getUser();
//   }, []);

//   // ---------------- LOGOUT ----------------
//   const handleLogout = async () => {
//     try {
//       await fetch(`${BASE_URL}/user/logout`, {
//         method: "POST",
//         credentials: "include",
//       });
//       navigate("/login");
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setShowProfile(false);
//     }
//   };

//   return (
//     <header className="flex items-center justify-between border-b px-4 relative">
//       {/* Left */}
//       <button onClick={onToggleSidebar}>
//         <Menu size={20} />
//       </button>

//       {/* Right */}
//       <div className="flex items-center gap-3" ref={wrapperRef}>
//         <button onClick={() => navigate("/notifications")}>
//           <Bell size={18} />
//         </button>
//         <button onClick={() => navigate("/settings")}>
//           <Settings size={18} />
//         </button>

//         {/* Avatar */}
//         <div
//           onClick={() => setShowProfile(p => !p)}
//           className="flex items-center gap-2 cursor-pointer"
//         >
//           <img
//             src={profileSrc}
//             alt="Profile"
//             className="w-9 h-9 rounded-full"
//           />
//           <div className="hidden md:flex flex-col text-sm">
//             <span>{userName}</span>
//             <span className="text-xs text-gray-500">
//               {userEmail}
//             </span>
//           </div>
//         </div>

//         {showProfile && (
//           <ProfileMenu
//             handleLogout={handleLogout}
//             userName={userName}
//             userEmail={userEmail}
//           />
//         )}
//       </div>
//     </header>
//   );
// }
