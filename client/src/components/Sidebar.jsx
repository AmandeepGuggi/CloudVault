import { FaStar, FaTrash, FaGoogleDrive } from "react-icons/fa";
import NewMenu from "./NewMenu";
import { useEffect, useRef } from "react";
export default function Sidebar({
  onUploadFilesClick,
  fileInputRef,
  handleFileSelect,
  directoryName,
  disabled = false,

  onNewClick,
  showNewMenu,
 onCreateFolder,
  onMenuClose
}) {
  const desktopMenuRef = useRef(null);
const mobileMenuRef = useRef(null);
    const menuRef = useRef(null);

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
    <aside className="hidden md:flex w-64 bg-primary p-4 flex-col">
      <div className="flex items-center gap-2 mb-6 text-xl font-semibold">
        <FaGoogleDrive className="text-blue-500 text-3xl" />
        Drive
      </div>

      <nav className="text-sm">
         <div ref={desktopMenuRef} className="flex mb-6 items-center gap-3">
                <button
               

                  onClick={onNewClick}
                  className="flex items-center gap-2 px-4 py-3 bg-white 
                   drop-shadow-lg hover:bg-gray-100 rounded-xl"
                >
                  <span className="text-xl">+</span> New
                </button>
                {showNewMenu && 
                <NewMenu reff={menuRef}
                 fileInputRef={fileInputRef}
                onUploadFilesClicks={onUploadFilesClick}
                handleFileSelect={handleFileSelect}
                 disabled={disabled}
                 onCreateFolder={onCreateFolder} />}
          </div>
          
        <button className="w-full text-left px-3 py-2 rounded-3xl bg-tertiary">
      <FaGoogleDrive className="inline mr-2 text-black bg-white border-2 w-6 h-6 p-0.5 rounded" />
          My Drive
        </button>
        
        <button className="w-full text-left px-3 py-2 rounded-3xl  hover:bg-gray-100">
          <FaStar className="inline  w-5 h-5 mr-2" /> Starred
        </button>
        <button className="w-full text-left px-3 py-2 rounded-3xl hover:bg-gray-100">
          <FaTrash className="inline  w-5 h-5 mr-2" /> Bin
        </button>
      </nav>


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
                  className="flex items-center px-4 py-2 bg-white 
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
