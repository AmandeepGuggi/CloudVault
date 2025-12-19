import { MdFileUpload, MdDriveFolderUpload } from "react-icons/md";
import { useState } from "react";

export default function NewMenu({reff, onCreateFolder, fileInputRef, handleFileSelect, onUploadFilesClicks, disabled}) {
  return (
    <div ref={reff} className="absolute top-14 left-4 bg-white box-shadow  rounded-sm w-80 z-50">
      <button onClick={onCreateFolder} className="w-full cursor-pointer hover:bg-gray-300 my-2  text-left px-3 py-2 ">
        <MdDriveFolderUpload size={22} className="inline mr-2" />
        New folder
      </button>
      <div className="border-b"></div>
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
