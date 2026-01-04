import { useEffect, useRef } from "react";
import ContextMenu from "./ContextMenu";
import { FaFolder } from "react-icons/fa";
import { formatBytes, getFileIcon } from "../utility";
import { FaStar } from "react-icons/fa";
import { MoreVertical } from "lucide-react";

import { FileArchive, LayoutGrid, List } from "lucide-react";
import { useState, useMemo } from "react";

export default function FileGrid({
  directoryName,
progressMap,
  handleContextMenu,
  BASE_URL,
  handleRowClick,
  handleDeleteDirectory,
  activeContextMenu,
  openRenameModal,
  setActiveContextMenu,

  isUploading,
  uploadProgress,
  handleCancelUpload,
  handleDeleteFile,
  files,

  folders,
  onRename,
  handleRenameSubmit,
  menuState,
  setMenuState,
}) {
  const menuRef = useRef(null);

  const [view, setView] = useState("list"); 
const [sortBy, setSortBy] = useState("name"); 
const [sortOrder, setSortOrder] = useState("asc"); 

  const allItems = [...folders, ...files];
  const selectedItem = menuState
    ? allItems.find((x) => x.id === menuState.id)
    : null;

    useEffect(() => {
  const close = () => setMenuState(null);
  window.addEventListener("scroll", close, true);
  return () => window.removeEventListener("scroll", close, true);
}, []);


    function sortItems(items, sortBy, sortOrder) {
  return [...items].sort((a, b) => {
    let valA, valB;

    if (sortBy === "name") {
      valA = a.name.toLowerCase();
      valB = b.name.toLowerCase();
    }

    if (sortBy === "size") {
      valA = a.size ?? 0;
      valB = b.size ?? 0;
    }

    if (sortBy === "modified") {
      valA = new Date(a.updatedAt || a.createdAt);
      valB = new Date(b.updatedAt || b.createdAt);
    }
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
}

const sortedItems = useMemo(() => {
  const sortedFolders = sortItems(folders, sortBy, sortOrder);
  const sortedFiles = sortItems(files, sortBy, sortOrder);

  return [...sortedFolders, ...sortedFiles];
}, [folders, files, sortBy, sortOrder]);



  return (
    <>

    <div className="md:sticky md:-top-7 z-10 bg-primary md:bg-white ">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-6 border-b mb-6 border-gray-300">
  <div className="px-3 py-2">
    <h1 className="text-2xl font-medium text-gray-700">
      {directoryName}
    </h1>
    <p className="text-sm text-gray-400">
      {sortedItems.length} items
    </p>
  </div>

<div className="md:hidden w-full px-3 py-2">
  <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
    
    {/* Search Icon */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
      />
    </svg>

    {/* Input */}
    <input
      type="text"
      placeholder="Search files or folders"
      className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
    />
  </div>
</div>


  <div className="flex justify-between md:justify-baseline px-3 py-2 items-center gap-3">
    {/* View toggle */}
    <div className="flex bg-gray-100 rounded-md p-1">
      <button
        onClick={() => setView("grid")}
        className={`p-2 rounded ${
          view === "grid" ? "bg-white shadow" : ""
        }`}
      >
        <LayoutGrid size={18} />
      </button>
      <button
        onClick={() => setView("list")}
        className={`p-2 rounded ${
          view === "list" ? "bg-white shadow" : ""
        }`}
      >
        <List size={18} />
      </button>
    </div>

    {/* Sort */}
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="border-gray-400 outline-0 border rounded px-2 py-2 text-sm"
    >
      <option value="name">Name</option>
      <option value="modified">Last modified</option>
      <option value="size">File size</option>
    </select>
  </div>
</div>
    </div>

{/* {view === "list" && (
   <div className="grid grid-cols-1 gap-4">
    {sortedItems.map((item) => (
     <div 
     key={item.id} className="border group flex justify-between items-center border-gray-300 rounded-lg px-2 py-3 cursor-pointer hover:bg-gray-50">
       <div
        className="flex gap-2 truncate"
      >
        {item.size === undefined ? (
          <FaFolder className=" text-4xl text-blue-400" />
        ) : (
          <img
            src={getFileIcon(item.name)}
            className="w-10"
          />
        )}

        <div className="flex flex-col truncate">
          <p className="mt-2 text-sm truncate">{item.name}</p>

        {item.size === undefined ? (
         <p className=" text-gray-400 text-sm "></p>
        ) : (
        <p className=" text-gray-400 text-sm ">{formatBytes(item.size)}</p>
        )}
        </div>
      </div>
      <div className="flex items-center">
        <FaStar className="opacity-0 group-hover:opacity-100 transition-opacity" />
        <MoreVertical className="text-gray-400 font-light" />
      </div>
     </div>
    ))}
  </div>
)} */}

{view === "list" && (
  <div className="grid grid-cols-1 gap-4 pb-20 md:pb-2">
    {sortedItems.map((item) => {
      const isUploadingItem = 
  !item.isDirectory && item.id.startsWith("temp-");
const uploadProgress = progressMap[item.id] || 0;
      return (
      
    <div
  key={item.id}
  className="border group border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
  onClick={() =>
    !(activeContextMenu || isUploading) &&
    handleRowClick(item.isDirectory ? "directory" : "file", item.id)
  }
  onContextMenu={(e) => {
    if (isUploadingItem) return; 
    e.preventDefault();
    handleContextMenu(e, item.id);
    const menuWidth = 180;
  const menuHeight = 220;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let x = e.clientX;
  let y = e.clientY;

  // Prevent overflow on right
  if (x + menuWidth > viewportWidth) {
    x = viewportWidth - menuWidth - 8;
  }

  // Prevent overflow at bottom
  if (y + menuHeight > viewportHeight) {
    y = viewportHeight - menuHeight - 8;
  }

  setMenuState({
    id: item.id,
    x,
    y,
    type: "folder",
  });
  }}
>
  {/* Top row */}
  <div className="flex justify-between items-center gap-3">
    <div className="flex items-center gap-2 truncate">
      {item.size === undefined ? (
        <FaFolder className="text-4xl text-blue-400 shrink-0" />
      ) : (
        <img src={getFileIcon(item.name)} className="w-10 shrink-0" />
      )}

      <div className="flex flex-col truncate">
        <p className="text-sm truncate">{item.name}</p>

        {item.size !== undefined && !isUploadingItem && (
          <p className="text-gray-400 text-sm">
            {formatBytes(item.size)}
          </p>
        )}
      </div>
    </div>

    <div className="flex items-center gap-2">
      <FaStar className="opacity-0 group-hover:opacity-100 transition-opacity" />
      <MoreVertical onClick={(e) => {
    if (isUploadingItem) return; 
    e.preventDefault();
    handleContextMenu(e, item.id);
    const menuWidth = 180;
  const menuHeight = 220;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let x = e.clientX;
  let y = e.clientY;

  // Prevent overflow on right
  if (x + menuWidth > viewportWidth) {
    x = viewportWidth - menuWidth - 8;
  }

  // Prevent overflow at bottom
  if (y + menuHeight > viewportHeight) {
    y = viewportHeight - menuHeight - 8;
  }

  setMenuState({
    id: item.id,
    x,
    y,
    type: "folder",
  });
  }} className="text-gray-400" />
    </div>
  </div>

  {/* Uploading row (INLINE, BELOW NAME) */}
  {isUploadingItem && (
    <div className="mt-3">
      <div className="flex items-center gap-2">
        {/* Progress bar */}
        <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
          <div
            className={`h-full transition-all ${
              uploadProgress === 100 ? "bg-green-600" : "bg-blue-600"
            }`}
            style={{ width: `${uploadProgress}%` }}
          />
        </div>

        {/* Cancel button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCancelUpload(item.id);
          }}
          className="text-gray-500 hover:text-red-600 text-sm"
        >
          ✕
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-1">
        Uploading… {Math.floor(uploadProgress)}%
      </p>
    </div>
  )}
</div>

     
    )})}
  </div>
)}

{view === "grid" && (
  <div className="grid grid-cols-2 pb-20 md:pb-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
    {sortedItems.map((item) => {
      const isUploadingItem = 
  !item.isDirectory && item.id.startsWith("temp-");
const uploadProgress = progressMap[item.id] || 0;
      return (
      
    <div
  key={item.id}
  className="border group border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
  onClick={() =>
    !(activeContextMenu || isUploading) &&
    handleRowClick(item.isDirectory ? "directory" : "file", item.id)
  }
  onContextMenu={(e) => {
    if (isUploadingItem) return; 
    e.preventDefault();
    handleContextMenu(e, item.id);
    const menuWidth = 180;
  const menuHeight = 220;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let x = e.clientX;
  let y = e.clientY;

  // Prevent overflow on right
  if (x + menuWidth > viewportWidth) {
    x = viewportWidth - menuWidth - 8;
  }

  // Prevent overflow at bottom
  if (y + menuHeight > viewportHeight) {
    y = viewportHeight - menuHeight - 8;
  }

  setMenuState({
    id: item.id,
    x,
    y,
    type: "folder",
  });
  }}
>
  {/* Top row */}
  <div className="flex justify-between items-center gap-3">
    <div className="flex items-center gap-2 truncate">
      {item.size === undefined ? (
        <FaFolder className="text-4xl text-blue-400 shrink-0" />
      ) : (
        <img src={getFileIcon(item.name)} className="w-10 shrink-0" />
      )}

      <div className="flex flex-col truncate">
        <p className="text-sm truncate">{item.name}</p>

        {item.size !== undefined && !isUploadingItem && (
          <p className="text-gray-400 text-sm">
            {formatBytes(item.size)}
          </p>
        )}
      </div>
    </div>

    <div className="flex items-center gap-2">
      <FaStar className="opacity-0 group-hover:opacity-100 transition-opacity" />
      <MoreVertical className="text-gray-400" />
    </div>
  </div>

  {/* Uploading row (INLINE, BELOW NAME) */}
  {isUploadingItem && (
    <div className="mt-3">
      <div className="flex items-center gap-2">
        {/* Progress bar */}
        <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
          <div
            className={`h-full transition-all ${
              uploadProgress === 100 ? "bg-green-600" : "bg-blue-600"
            }`}
            style={{ width: `${uploadProgress}%` }}
          />
        </div>

        {/* Cancel button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCancelUpload(item.id);
          }}
          className="text-gray-500 hover:text-red-600 text-sm"
        >
          ✕
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-1">
        Uploading… {Math.floor(uploadProgress)}%
      </p>
    </div>
  )}
</div>

     
    )})}
  </div>
)}


      {/* SINGLE CONTEXT MENU BELOW */}
      {menuState && selectedItem && (
        <ContextMenu
          handleRowClick={handleRowClick}
          item={selectedItem}
          type={menuState.type}
          position={{ x: menuState.x, y: menuState.y }}
          menuRef={menuRef}
          BASE_URL={BASE_URL}
          handleDeleteDirectory={handleDeleteDirectory}
          handleDeleteFile={handleDeleteFile}
          handleCancelUpload={handleCancelUpload}
          isUploadingItem={selectedItem.id.startsWith("temp-")}
          handleRenameSubmit={handleRenameSubmit}
          openRenameModal={openRenameModal}
          onClose={() => {
            setMenuState(null);
            setActiveContextMenu(null);
          }}
        />
      )}
    </>
  );
}
