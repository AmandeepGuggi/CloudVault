import { HelpCircle, Settings } from "lucide-react";
import {FaSignOutAlt} from "react-icons/fa";
export default function ProfileMenu({ userEmail, loggedIn, userName, handleLogout}) {
  return (
    <div  className="absolute  right-4 top-14 w-44 md:w-54 bg-white box-shadow rounded-xl z-50">
      <p className="text-gray-900 text-sm px-4 pt-4">{userName} </p>
      <p title={userEmail} className="text-gray-600 cursor-pointer text-[12px] truncate  px-4 pb-2 border-b border-gray-400">{userEmail} </p>
      
     <div className="flex gap-2 items-center cursor-pointer px-4 pt-2 text-sm">
       <Settings className="text-gray-700 w-5 " /> Account settings
     </div>
     <div className="flex gap-2 items-center px-4 cursor-pointer pt-2 text-sm pb-2 border-b border-gray-400">
       <HelpCircle className="text-gray-700 w-5 " /> Documentation
     </div>
     
        <div onClick={()=> handleLogout()}  className="flex cursor-pointer gap-2 items-center px-4 pt-2 text-sm text-red-700 pb-2">
       <FaSignOutAlt className="text-red-700 w-5 " /> {loggedIn? "Logout": "LogIn"}
     </div>
    </div>
  );
}
