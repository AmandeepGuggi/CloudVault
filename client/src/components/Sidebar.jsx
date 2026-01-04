import { FaStar, FaTrash, FaGoogleDrive, FaHome } from "react-icons/fa";
import {
  FiHome,
  FiFolder,
  FiTrash2,
  FiStar,
  FiClock,
  FiCloudSnow,
} from "react-icons/fi";
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
  onMenuClose,
}) {
  const desktopMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const menuRef = useRef(null);
  const [isActive, setIsActive] = useState(true);

  const [isOpen, setIsOpen] = React.useState(true);
  // const menuRef = React.useRef(null);
  const buttonRef = React.useRef(null);

  useEffect(() => {
    if (!showNewMenu) return;

    function handleOutside(e) {
      const activeRef =
        window.innerWidth >= 768 ? desktopMenuRef : mobileMenuRef;

      if (activeRef.current && !activeRef.current.contains(e.target)) {
        onMenuClose();
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [showNewMenu]);

  return (
    <>
      <aside className="hidden border-r  border-gray-300  md:flex w-64 pb-4 pt-3 flex-col">
        <div className="flex items-center px-6 gap-2 border-b border-gray-300 pb-2 mb-6 text-xl font-poppins">
          <p className="bg-blue-400 p-2 text-[12px] text-white font-extrabold rounded">
            CV
          </p>
          <p className="flex flex-col">
            <span className="tracking-widest text-[13px] font-bold">
              CloudVault
            </span>
            <span className=" text-[12px] text-gray-500">Storage</span>
          </p>
        </div>

        <nav className="text-sm px-3">
          <div
            ref={desktopMenuRef}
            className="flex justify-center mb-6 px-2 items-center gap-3"
          >
            <button
              onClick={onNewClick}
              className="flex items-center gap-2 px-6 py-3 bg-white w-full justify-between text-gray-600 uppercase
                   border border-gray-300 tracking-widest cursor-pointer"
            >
              <span> New </span>
              <svg
                fill="black"
                className={`w-4 h-4 arrow lg:text-white ${
                  showNewMenu ? "open" : "close"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
              >
                <path d="M297.4 438.6C309.9 451.1 330.2 451.1 342.7 438.6L502.7 278.6C515.2 266.1 515.2 245.8 502.7 233.3C490.2 220.8 469.9 220.8 457.4 233.3L320 370.7L182.6 233.4C170.1 220.9 149.8 220.9 137.3 233.4C124.8 245.9 124.8 266.2 137.3 278.7L297.3 438.7z" />
              </svg>
            </button>
            {
              // showNewMenu &&
              <NewMenu
                reff={menuRef}
                fileInputRef={fileInputRef}
                onUploadFilesClicks={onUploadFilesClick}
                handleFileSelect={handleFileSelect}
                disabled={disabled}
                onCreateFolder={onCreateFolder}
                showNewMenu={showNewMenu}
                className={`absolute right-4 sm:right-5 top-full mt-4 w-[90vw] max-w-sm sm:w-[350px] bg-white rounded-lg shadow-xl p-6 transition-all duration-600 ease-in-out
    ${
      isOpen
        ? "opacity-100 scale-100"
        : "opacity-0 scale-95 pointer-events-none"
    }`}
              />
            }
          </div>

          <p className="w-full text-left text-gray-500 px-6 py-2 ">General</p>
          <button className=" bg-blue-400 rounded mb-2 gap-1  text-white w-full items-center flex cursor-pointer text-left px-6 py-2 hover:bg-gray-200 ">
            <FiHome className="inline mr-2 w-6 h-6 p-0.5 rounded" />
            Home
          </button>

          <button className="w-full text-left text-black mb-2  cursor-pointer items-center flex gap-1  px-6 py-2   hover:bg-gray-200">
            <FiStar className="inline  w-5 h-5 mr-2" /> Starred
          </button>
       
          <button className="w-full text-left text-black mb-2  cursor-pointer px-6 py-2 items-center flex  gap-1 hover:bg-gray-200">
            <FiClock className="inline  w-5 h-5 mr-2" /> Recent
          </button>
          <button className="w-full text-left text-black mb-2 cursor-pointer px-6 py-2 items-center flex  gap-1 hover:bg-gray-200">
            <FiTrash2 className="inline  w-5 h-5 mr-2" /> Bin
          </button>
        </nav>

        <div className="px-6 text-sm  flex-col mt-20">
          <div className="text-gray-500 flex justify-between">
            <p className="uppercase text-[13px] font-semibold ">Storage</p>
            <p>50.5%</p>
          </div>
          <div className="w-full bg-gray-300 rounded-2xl overflow-hidden h-2">
            <div className="bg-blue-400 w-[50%] h-full "></div>
          </div>
          <div className="text-gray-500 ">
            <p className="text-sm">
              10.1 GB of 20GB used
            </p>
          </div>

          <div className="uppercase text-center py-2 mt-5 bg-blue-400 text-white rounded">Upgrade Storage</div>
        </div>
      </aside>

    
    </>
  );
}
