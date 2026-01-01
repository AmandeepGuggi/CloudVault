import { FaStar, FaTrash, FaGoogleDrive, FaHome} from "react-icons/fa";
import { FiHome, FiFolder, FiTrash2, FiStar, FiClock, FiCloudSnow} from "react-icons/fi";
import { HiOutlineHome } from "react-icons/hi2";
import React from "react";

import NewMenu from "./NewMenu";
import { useEffect, useRef, useState } from "react";
export default function Sidebar({
  onUploadFilesClick,
  fileInputRef,
  handleFileSelect,
  disabled = false,

  onNewClick,
  showNewMenu,
 onCreateFolder,
  onMenuClose
}) {
  const desktopMenuRef = useRef(null);
const mobileMenuRef = useRef(null);
    const menuRef = useRef(null);
    const [isActive, setIsActive] = useState(true)

     const [isOpen, setIsOpen] = React.useState(true);
    // const menuRef = React.useRef(null);
    const buttonRef = React.useRef(null);

    useEffect(() => {
    if (!showNewMenu) return;
  
    function handleOutside(e) {
      const activeRef = window.innerWidth >= 768
  ? desktopMenuRef
  : mobileMenuRef;

if (activeRef.current && !activeRef.current.contains(e.target)) {
  onMenuClose();
}

    }
  
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [showNewMenu]);

  return (
    <>
    <aside className="hidden border-r border-gray-300  md:flex w-64 pb-4 pt-3 flex-col">
      <div className="flex items-center px-6 gap-2 border-b border-gray-300 pb-3 mb-6 text-xl font-poppins">
        <FiCloudSnow className="text-black-500 text-3xl " />
        <span className="tracking-widest">Cloudex</span>
      </div>

      <nav className="text-sm">
         
         <div ref={desktopMenuRef} className="flex justify-center mb-6 px-6 items-center gap-3">
                <button
                  onClick={onNewClick}
                  className="flex items-center gap-2 px-6 py-3 bg-white w-full justify-between text-gray-600 uppercase
                   border border-gray-300 tracking-widest cursor-pointer"
                >
                 <span> New </span>
                <svg  fill="black" className={`w-4 h-4 arrow lg:text-white ${showNewMenu ? "open" : "close"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M297.4 438.6C309.9 451.1 330.2 451.1 342.7 438.6L502.7 278.6C515.2 266.1 515.2 245.8 502.7 233.3C490.2 220.8 469.9 220.8 457.4 233.3L320 370.7L182.6 233.4C170.1 220.9 149.8 220.9 137.3 233.4C124.8 245.9 124.8 266.2 137.3 278.7L297.3 438.7z"/></svg>
       
                </button>
                {
                // showNewMenu && 
                
                <NewMenu reff={menuRef}
                 fileInputRef={fileInputRef}
                onUploadFilesClicks={onUploadFilesClick}
                handleFileSelect={handleFileSelect}
                 disabled={disabled}
                 onCreateFolder={onCreateFolder}
                 showNewMenu={showNewMenu}
                 className={`absolute right-4 sm:right-5 top-full mt-4 w-[90vw] max-w-sm sm:w-[350px] bg-white rounded-lg shadow-xl p-6 transition-all duration-600 ease-in-out
    ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
                 />}
          </div>
          
        <p className="w-full text-left text-gray-500 px-6 py-2 ">
                  General
        </p>
        <button className="w-full text-gray-500 cursor-pointer text-left px-6 py-2 hover:bg-gray-200 ">
      <FiHome className="inline mr-2 w-6 h-6 p-0.5 rounded" />
          Home
        </button>
        
        <button className="w-full text-left text-gray-500 cursor-pointer  px-6 py-2   hover:bg-gray-200">
          <FiFolder className="inline  w-5 h-5 mr-2" /> Starred
        </button>
       {isActive ? <> <button className="w-full text-left cursor-pointer text-black  px-6 py-2 bg-gray-200  hover:bg-gray-200">
          <FaStar className="inline  w-5 h-5 mr-2" /> Starred
        </button></> :
        <> <button className="w-full text-left text-gray-500 cursor-pointer px-6 py-2 bg-gray-200  hover:bg-gray-200">
          <FiStar className="inline  w-5 h-5 mr-2" /> Starred
        </button>
        </>}
        <button className="w-full text-left text-gray-500 cursor-pointer px-6 py-2  hover:bg-gray-200">
          <FiClock className="inline  w-5 h-5 mr-2" /> Recent
        </button>
        <button className="w-full text-left text-gray-500 cursor-pointer px-6 py-2 hover:bg-gray-200">
          <FiTrash2 className="inline  w-5 h-5 mr-2" /> Trash
        </button>
      </nav>

        <div className="px-6 text-sm  flex-col mt-20">
          <div className="text-gray-500 flex justify-between" >
            <p>Storage</p>
            <p>50.5%</p>
          </div>
          <div className="w-full border border-gray-400 h-4">
            <div className="bg-blue-600 w-[50%] h-full ">
            </div>
          </div>
           <div className="text-gray-500 " >
            <p><span className="text-black font-bold">10.1 GB </span>of 20GB used</p>
          </div>

          <div className="uppercase border text-center py-2 mt-5">
            upgrade
          </div>

        </div>

    </aside>

    {/* MOBILE VIEW */}
      <aside className=" md:hidden  flex w-18 bg-primary  p-4 flex-col">
      <div className="flex items-center justify-center  gap-2 mb-6 text-xl font-semibold">
        <FaGoogleDrive className="text-blue-500 text-3xl" />
      </div>

      <nav className="text-sm">
         <div ref={mobileMenuRef} className="flex mb-6 items-center">
                <button
                  onClick={onNewClick}
                  className="flex items-center px-6 py-2 bg-white 
                   drop-shadow-lg hover:bg-gray-100 rounded-xl"
                >
                  <span className="text-lg">+</span>
                </button>
                {showNewMenu && <NewMenu
                 fileInputRef={fileInputRef}
                onUploadFilesClicks={onUploadFilesClick}
                handleFileSelect={handleFileSelect}
                 disabled={disabled}
                reff={menuRef} onCreateFolder={onCreateFolder} />}
              </div>
        <button className="w-full py-2 rounded-full bg-tertiary">
      <FaGoogleDrive className="inline text-black bg-white border-2 w-6 h-6 p-0.5 rounded" />
       
        </button>
        
        <button className="w-full py-2 rounded-full hover:bg-gray-100">
          <FaStar className="inline  w-5 h-5 " /> 
        </button>
        <button className="w-full py-2 rounded-full  hover:bg-gray-100">
          <FaTrash className="inline  w-5 h-5 " />
        </button>
      </nav>
    </aside>
     </>
  );
}
