import { FaPlus, FaSearch, FaToolbox } from "react-icons/fa";
import ProfileMenu from "./ProfileMenu";
import NewMenu from "./NewMenu";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utility";

export default function Topbar({
  showProfile,
  onProfileClose,
  onProfileToggle,
  setAuthChecked
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

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`${BASE_URL}/user/`, {
          method: "post",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          // Set user info if logged in
          setUserName(data.name);
          setUserEmail(data.email);
          setLoggedIn(true);
        } 
        setAuthChecked(true);
      } catch (err) {
        console.error("Error fetching user info:", err);
        setAuthChecked(false);
      }
    }
    fetchUser();
  }, []);

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
    <header className="flex items-center border-b border-gray-300 justify-between  px-4 bg-primary relative">
      <div className="flex items-center md:block w-full mr-4 py-1.75 px-4 outline-none">
        <FaSearch className="inline mr-2 text-gray-400" />
         <input
        className="w-[90%] py-2.25 text-[15px] border-0 outline-0"
        placeholder="Start typing to search your file"
      />
     

      </div>
<div className="h-full border border-gray-300">

</div>
    <div 
  className=" pl-3 "
  onClick={onProfileToggle}
>
  {userName ? (
   <div className="flex items-center gap-3">
     <span className="text-sm font-semibold text-white rounded-full overflow-hidden min-w-9 h-9 flex items-center justify-center  bg-orange-400 cursor-pointer">
      {userName.charAt(0).toUpperCase()}
    </span>
    <div>
      <p className="text-sm font-bold tracking-widest">{userName}</p>
      <p className="text-sm ">{userEmail}</p>
    </div>
    </div>
  ) : (
    <img
      src="/photo2.jpeg"
      alt="user"
      className="object-cover w-full h-full"
      onError={() => setImgError(true)}
    />
  )}
</div>


      {showProfile &&  <ProfileMenu handleLogout={handleLogout} loggedIn={loggedIn} userName={userName} userEmail={userEmail} reff={profileRef} />
  }
    </header>
  );
}
