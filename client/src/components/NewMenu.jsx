import { MdFileUpload, MdDriveFolderUpload, MdClose } from "react-icons/md";
import { useState } from "react";

export default function NewMenu({showNewMenu, onClose, reff, onCreateFolder, fileInputRef, handleFileSelect, onUploadFilesClicks, disabled}) {

  return (
  <div ref={reff}
 
     className={`
    fixed inset-x-0 bottom-0 md:bottom-auto
    md:absolute md:top-35 md:left-6 md:inset-x-auto

    bg-white box-shadow rounded-t-2xl md:rounded-sm
    w-full md:w-80
    z-50
    transition-all duration-300 ease-in-out

    ${showNewMenu ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full md:translate-y-0 pointer-events-none"}
  `}
    >
      {/* Mobile header */}
<div className="flex items-center justify-between px-4 py-3 border-b md:hidden">
  <span className="font-medium text-gray-700">New</span>
  <button
    onClick={onClose}
    className="p-2 rounded hover:bg-gray-200"
    aria-label="Close menu"
  >
    <MdClose size={20} />
  </button>
</div>

   
      <button onClick={onCreateFolder} className="w-full cursor-pointer hover:bg-gray-300 md:my-2  text-left px-3 py-2 ">
        <MdDriveFolderUpload size={22} className="inline mr-2" />
        New folder
      </button>
      <div className="md:border-b"></div>
      <button
       disabled={disabled} 
       onClick={onUploadFilesClicks} 
       className="w-full cursor-pointer hover:bg-gray-300 my-2  text-left px-3 py-2 ">
        <MdFileUpload size={22} className="inline mr-2" />
        File upload
      </button>
      <input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          style={{ display: "none" }}
          multiple
          onChange={handleFileSelect}
        />
      <button className="w-full cursor-not-allowed hover:bg-gray-300 mb-2 text-left px-3 py-2 ">
    <MdDriveFolderUpload size={22} className="inline mr-2" />
        Folder upload
      </button>

    </div>
  );
}

// import { MdFileUpload, MdDriveFolderUpload } from "react-icons/md";

// export default function NewMenu({
//   reff,
//   showNewMenu,
//   onCreateFolder,
//   fileInputRef,
//   handleFileSelect,
//   onUploadFilesClicks,
//   disabled,
//   onClose,
// }) {
//   if (!showNewMenu) return null;

//   return (
//     <div ref={reff}  className="fixed inset-0 z-50 md:absolute md:inset-auto md:top-24 md:left-6">

//       {/* Backdrop (mobile only) */}
//       <div
//         className="absolute inset-0 bg-black/30 md:hidden"
//         onClick={onClose}
//       />

//       {/* Menu container */}
//       <div
//         className="
//           absolute bottom-0 left-0 right-0
//           bg-white rounded-t-2xl p-4
//           md:static md:rounded-md md:w-80
//           box-shadow
//         "
//       >
//         <button
//           onClick={onCreateFolder}
//           className="w-full cursor-pointer hover:bg-gray-100 my-2 text-left px-3 py-2 rounded"
//         >
//           <MdDriveFolderUpload size={22} className="inline mr-2" />
//           New folder
//         </button>

//         <div className="border-b" />

//         <button
//           disabled={disabled}
//           onClick={()=> {
//              onUploadFilesClicks();              // close menu
//     // fileInputRef.current?.click(); 
//           }}
//           className="w-full cursor-pointer hover:bg-gray-100 my-2 text-left px-3 py-2 rounded"
//         >
//           <MdFileUpload size={22} className="inline mr-2" />
//           File upload
//         </button>

//         <input
//           ref={fileInputRef}
//           id="file-upload"
//           type="file"
//           multiple
//           style={{ display: "none" }}
//           hidden
//           onChange={handleFileSelect}
//         />

//         <button
//           className="w-full cursor-not-allowed opacity-50 my-2 text-left px-3 py-2"
//         >
//           <MdDriveFolderUpload size={22} className="inline mr-2" />
//           Folder upload
//         </button>
//       </div>
//     </div>
//   );
// }
