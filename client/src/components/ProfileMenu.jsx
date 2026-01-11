import {FaSignOutAlt} from "react-icons/fa";
export default function ProfileMenu({ userEmail, loggedIn, userName, handleLogout}) {
  return (
    <div  className="absolute right-4 top-14 w-64 md:w-84 bg-secondary box-shadow rounded-xl p-4 z-50">
      <p className="text-gray-900 text-center">{userEmail} </p>
  {/* <div className="rounded-full overflow-hidden w-20 h-20 mx-auto my-4 border border-gray-200">
       <img src="/photo2.jpeg" alt="user" className="object-cover w-full h-full  "  />
      </div> */}
      <div className="rounded-full overflow-hidden w-20 h-20 mx-auto my-4 border border-gray-200 flex items-center justify-center bg-orange-400">
  {userName ? (
    <span className="text-3xl font-semibold text-white">
      {userName.charAt(0).toUpperCase()}
    </span>
  ) : (
    <img
      src="/photo2.jpeg"
      alt="user"
      className="object-cover w-full h-full"
    />
  )}
</div>

      
      <p className="text-gray-900 text-center text-2xl">Hi, {userName} </p>
      <button className="my-2 w-[70%] md:text-nowrap border text-sm px-2 flex items-center mx-auto border-black rounded-full py-2 text-blue-600">
        Manage your Google Account
      </button>
      <div className="flex flex-col md:flex-row justify-between gap-1 mt-4">
        <button className="text-gray-600  bg-white px-8 text-[14px] rounded-full md:rounded-r-none md:rounded-l-full text-nowrap py-2">
         + Add account</button>
        <button onClick={()=> handleLogout()} className=" text-gray-600 cursor-pointer bg-white px-8 text-[14px] rounded-full md:rounded-l-none md:rounded-r-full py-2 text-nowrap">
          <FaSignOutAlt className="inline mr-2" />{loggedIn? "Logout": "LogIn"}</button>
      </div>
    </div>
  );
}
