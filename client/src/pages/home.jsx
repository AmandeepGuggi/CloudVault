import { useEffect, useRef, useState, useMemo } from "react";
import NameModal from "../components/NameModal.jsx";
import { useParams, useNavigate,  } from "react-router-dom";
import { getUniquename, BASE_URL, getFileIcon, formatBytes } from "../utility";
import { Filter, FolderPlus, LayoutGrid, List, MoreVertical, Upload } from "lucide-react";
import { FaFolder, FaStar, FaHome } from "react-icons/fa";
import ContextMenu from "../components/ContextMenu.jsx";
import { useAuth } from "../context/AuthContext.jsx"; 




export default function Home() {
  const { refreshUser , user} = useAuth();
  const [view, setView] = useState("list"); 
  const [sortBy, setSortBy] = useState("name"); 
const [sortOrder, setSortOrder] = useState("asc"); 
 const [showNewMenu, setShowNewMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [menuState, setMenuState] = useState(null);
  const { dirId } = useParams();
  const navigate = useNavigate();
  const [breadcrumbs, setBreadcrumbs] = useState([]);


async function buildBreadcrumbs(currentDirId) {
  const path = [];
  let cursor = currentDirId;
console.log(cursor);
  while (cursor) {
    const res = await fetch(`${BASE_URL}/directory/${cursor}/breadcrumbs`, {
      credentials: "include",
    });

    if (!res.ok) break;

    const data = await res.json();
    setBreadcrumbs(data)

    path.push({
      id: data.id,
      name: data.name,
    });

    cursor = data.parentId; // climb upward
  }

  // Root
  path.push({ id: null, name: "All Files" });

  return path.reverse();
}

console.log({breadcrumbs});

 // Displayed directory name
const [directoryName, setDirectoryName] = useState("My Files");

 // Lists of items
  const [directoriesList, setDirectoriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);

    // Error state
  const [errorMessage, setErrorMessage] = useState("");

 //Modal states
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newDirname, setNewDirname] = useState("New Folder");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameType, setRenameType] = useState(null); // "directory" or "file"
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

   // Uploading states
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const [uploadQueue, setUploadQueue] = useState([]); // queued items to upload
  const [uploadXhrMap, setUploadXhrMap] = useState({}); // track XHR per item
  const [progressMap, setProgressMap] = useState({}); // track progress per item
  const [isUploading, setIsUploading] = useState(false); // indicates if an upload is in progress

  // Context menu
  const [activeContextMenu, setActiveContextMenu] = useState(null);
   const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

   const allItems = [...directoriesList, ...filesList];
  const selectedItem = menuState
    ? allItems.find((x) => x.id === menuState.id)
    : null;

     useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //fetch directory items
   async function getDirectoryItems() {
      setErrorMessage(""); // clear any existing error
      if (!user) return;
      try {
        const response = await fetch(`${BASE_URL}/directory/${dirId || ""}`, {
          credentials: "include",
        });
  
        if (response.status === 401) {
          // navigate("/login");
          setErrorMessage("Not authenticated yet");
          return;
        }
  
        await handleFetchErrors(response);
        const data = await response.json();
  
        // Set directory name
        setDirectoryName(dirId ? data.name : "All Files");
  
        // Reverse directories and files so new items show on top
        setDirectoriesList([...data.directories].reverse());
        setFilesList([...data.files].reverse());
        
      } catch (error) {
        setErrorMessage(error.message);
      }
    }
   useEffect(() => {
  const close = () => setMenuState(null);
  window.addEventListener("scroll", close, true);
  return () => window.removeEventListener("scroll", close, true);
}, []);

    useEffect(() => {
      if (!user) return; 
        getDirectoryItems();

        if (!dirId) {
    setBreadcrumbs([{ id: null, name: "All Files" }]);
    return;
  }

         (async () => {
    const crumbs = await buildBreadcrumbs(dirId || null);
  })();
        // Reset context menu
        setActiveContextMenu(null);
        setActiveContextMenu(null);
        setContextMenu(null);
      }, [dirId]);
      
     
      /**
       * Click row to open directory or file
       */
      function handleRowClick(type, id) {
        if (type === "directory") {
          navigate(`/app/${id}`);
        } else {
          window.location.href = `${BASE_URL}/file/${id}`;
        }
      }
    
      /**
       * Select multiple files
       */
      function handleFileSelect(e) {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length === 0) return;
    
        // Build a list of "temp" items
        const newItems = selectedFiles.map((file) => {
          const tempId = `temp-${Date.now()}-${Math.random()}`;
          console.log(file);
          return {
            file,
            name: file.name,
            size: file.size,
            id: tempId,
            mimeType: file.type,
            isUploading: false,
          };
        });
    
        // Put them at the top of the existing list
        setFilesList((prev) => [...newItems, ...prev]);
    
        // Initialize progress=0 for each
        newItems.forEach((item) => {
          setProgressMap((prev) => ({ ...prev, [item.id]: 0 }));
        });
    
        // Add them to the uploadQueue
        setUploadQueue((prev) => [...prev, ...newItems]);
    
        // Clear file input so the same file can be chosen again if needed
        e.target.value = "";
    
        // Start uploading queue if not already uploading
        if (!isUploading) {
          setIsUploading(true);
          // begin the queue process
          processUploadQueue([...uploadQueue, ...newItems.reverse()]);
        }
      }
    
      /**
       * Upload items in queue one by one
       */
    async function processUploadQueue(queue) {
        if (queue.length === 0) {
          // No more items to upload
          setIsUploading(false);
          setUploadQueue([]);
          setTimeout(() => {
            getDirectoryItems();
           refreshUser()
          }, 1000);
          return;
        }
    
        const [currentItem, ...restQueue] = queue;
    
        // Mark it as isUploading: true
        setFilesList((prev) =>
          prev.map((f) =>
            f.id === currentItem.id ? { ...f, isUploading: true } : f
          )
        );
    
        // Start upload
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${BASE_URL}/file/${dirId || ""}`, true);
        xhr.withCredentials = true;
    
        xhr.setRequestHeader("filename", currentItem.name);
    
    
    
        xhr.upload.addEventListener("progress", (evt) => {
          if (evt.lengthComputable) {
            const progress = (evt.loaded / evt.total) * 100;
            setProgressMap((prev) => ({ ...prev, [currentItem.id]: progress }));
          }
        });
    
        xhr.addEventListener("load", () => {
          processUploadQueue(restQueue);
        });
    
        // If user cancels, remove from the queue
        setUploadXhrMap((prev) => ({ ...prev, [currentItem.id]: xhr }));
       
        xhr.send(currentItem.file);
      
      }
    
      /**
       * Cancel an in-progress upload
       */
      function handleCancelUpload(tempId) {
        const xhr = uploadXhrMap[tempId];
        if (xhr) {
          xhr.abort();
        }
        // Remove it from queue if still there
        setUploadQueue((prev) => prev.filter((item) => item.id !== tempId));
    
        // Remove from filesList
        setFilesList((prev) => prev.filter((f) => f.id !== tempId));
    
        // Remove from progressMap
        setProgressMap((prev) => {
          const { [tempId]: _, ...rest } = prev;
          return rest;
        });
    
        // Remove from Xhr map
        setUploadXhrMap((prev) => {
          const copy = { ...prev };
          delete copy[tempId];
          return copy;
        });
      }

      async function moveFileToBin(fileId) {
        console.log("del id", fileId);
  try {
    await fetch(`${BASE_URL}/file/${fileId}/bin`, {
      method: "PATCH",
      credentials: "include",
    });

    getDirectoryItems();

  } catch (err) {
    console.error("Failed to move file to bin", err);
  }
}

async function moveFolderToBin(folderId) {
  try {
    const res = await fetch(`${BASE_URL}/directory/${folderId}/bin`, {
      method: "PATCH",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Failed to move folder to bin");
    }

    // Remove folder from current view immediately (optimistic UI)
    getDirectoryItems();
  } catch (err) {
    console.error("Move folder to bin failed", err);
  }
}

/**
       * Delete a file/directory
       */
      async function handleDeleteFile(id) {
        setErrorMessage("");
        try {
          const response = await fetch(`${BASE_URL}/file/${id}`, {
            method: "DELETE",
            credentials: "include",
          });
          await handleFetchErrors(response);
          getDirectoryItems();
        } catch (error) {
          setErrorMessage(error.message);
        }
      }
    
  

     /**
   * Utility: handle fetch errors
   */
  async function handleFetchErrors(response) {
    if (!response.ok) {
      let errMsg = `Request failed with status ${response.status}`;
      try {
        const data = await response.json();
        if (data.error) errMsg = data.error;
      } catch (_) {
        // If JSON parsing fails, default errMsg stays
      }
      throw new Error(errMsg);
    }
    return response;
  }


    /**
     * Create a directory
     */
    async function handleCreateDirectory(e) {
      e.preventDefault();
      const base = newDirname.trim();
      let existingNames= directoriesList.map((f) => f.name)
      const finalName = existingNames.length
        ? getUniquename(base, existingNames)
        : base;
  
      setErrorMessage("");
      try {
        const response = await fetch(`${BASE_URL}/directory/${dirId || ""}`, {
          method: "POST",
          headers: {
            // dirname: newDirname,
            dirname: finalName,
          },
          credentials: "include",
        });
        await handleFetchErrors(response);
        setNewDirname("New Folder");
        // setShowCreateDirModal(false);
        setShowCreateFolder(false);
        getDirectoryItems();
      } catch (error) {
        setErrorMessage(error.message);
      }
    }
  
    /**
     * Rename
     */
    function openRenameModal(type, id, currentName) {
      setRenameType(type);
      setRenameId(id);
      setRenameValue(currentName);
      setShowRenameModal(true);
    }
  
    async function handleRenameSubmit(e) {
      e.preventDefault();
      setErrorMessage("");
      try {
        const url =
          renameType === "file"
            ? `${BASE_URL}/file/${renameId}`
            : `${BASE_URL}/directory/${renameId}`;
        const response = await fetch(url, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            renameType === "file"
              ? { newFilename: renameValue }
              : { newDirName: renameValue }
          ),
          credentials: "include",
        });
        await handleFetchErrors(response);
  
        setShowRenameModal(false);
        setRenameValue("");
        setRenameType(null);
        setRenameId(null);
        getDirectoryItems();
      } catch (error) {
        setErrorMessage(error.message);
      }
    }
  
    /**
     * Context Menu
     */
    function handleContextMenu(e, id) {
      e.stopPropagation();
      e.preventDefault();
      const clickX = e.clientX;
      const clickY = e.clientY;
  
      if (activeContextMenu === id) {
        setActiveContextMenu(null);
      } else {
        setActiveContextMenu(id);
      }
    }

      function openRename(type, id, currentName) {
        setRenameType(type);
        setRenameId(id);
        setRenameValue(currentName);
        setShowRenameModal(true);
      }
      function closeRename() {
        setRenameType(null);
        setRenameId("");
        setRenameValue("");
        setShowRenameModal(false);
      }
    
    
      async function handleRenameSubmit(e) {
        e.preventDefault();
        setErrorMessage("");
        try {
          const url =
            renameType === "file"
              ? `${BASE_URL}/file/${renameId}`
              : `${BASE_URL}/directory/${renameId}`;
          const response = await fetch(url, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(
              renameType === "file"
                ? { newFilename: renameValue }
                : { newDirName: renameValue }
            ),
            credentials: "include",
          });
          await handleFetchErrors(response);
    
          setShowRenameModal(false);
          setRenameValue("");
          setRenameType(null);
          setRenameId(null);
          getDirectoryItems();
        } catch (error) {
          setErrorMessage(error.message);
        }
      }
  
    useEffect(() => {
      function handleDocumentClick() {
        setActiveContextMenu(null);
      }
      document.addEventListener("click", handleDocumentClick);
      return () => document.removeEventListener("click", handleDocumentClick);
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
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
if (valA < valB) return sortOrder === "asc" ? -1 : 1;
return 0;

    });
  }
  
  const sortedItems = useMemo(() => {
    const sortedFolders = sortItems(directoriesList, sortBy, sortOrder);
    const sortedFiles = sortItems(filesList, sortBy, sortOrder);
  
    return [...sortedFolders, ...sortedFiles];
  }, [directoriesList, filesList, sortBy, sortOrder]);
  
  async function toggleStar(id, type) {
    console.log(id, type);
  const url =
    type === true
      ? `${BASE_URL}/directory/${id}/starred`
      : `${BASE_URL}/file/${id}/starred`;

  try {
    const res = await fetch(url, {
      method: "PATCH",
      credentials: "include",
    });

    const data = await res.json();
    console.log({data});
    getDirectoryItems()
    setMenuState(null);
  } catch (err) {
    console.error("Failed to toggle star", err);
  }
}


  
 
  return (
    <>
        <div className="md:sticky md:-top-7 z-10 bg-primary md:bg-white ">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-2 border-b mb-6 border-gray-300">

  <div className=" hidden md:flex items-center gap-3">
  <button
    onClick={()=> {
       setShowNewMenu(false);
      setShowCreateFolder(true);
    }}
    className="flex items-center gap-2 px-4 py-2 text-sm font-medium
               rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
  >
    <FolderPlus size={16} />
    Create Folder
  </button>

  <button
    onClick={() => {
      fileInputRef.current.click();
    }}
    className="flex items-center gap-2 px-4 py-2 text-sm font-medium
               rounded-md bg-kala text-white hover:bg-blue-700"
  >
    <Upload size={16} />
    Upload File
  </button>
  <input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          style={{ display: "none" }}
          multiple
          onChange={handleFileSelect}
        />
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

    {/* Searchbar for mobile screens */}
    <input
      type="text"
      placeholder="Search files or folders"
      className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
    />
  </div>
</div>


  <div className="flex justify-between md:justify-baseline px-3 py-2 items-center gap-3">
    {/* View toggle */}
      <div className=" md:hidden flex items-center gap-3">
  <button
    onClick={()=> {
       setShowNewMenu(false);
      setShowCreateFolder(true);
    }}
    className="flex items-center gap-2 px-4 py-2 text-sm font-medium
               rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
  >
    <FolderPlus size={16} />
    Create Folder
  </button>

  <button
    onClick={() => {
      fileInputRef.current.click();
    }}
    className="flex items-center gap-2 px-4 py-2 text-sm font-medium
               rounded-md bg-kala text-white hover:bg-black-700"
  >
    <Upload size={16} />
    Upload File
  </button>
  <input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          style={{ display: "none" }}
          multiple
          onChange={handleFileSelect}
        />
</div>
  <div className="flex items-center gap-3"> <div className="relative md:hidden" ref={dropdownRef}>
      {/* Filter Button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center justify-center
                   text-sm border border-gray-300 rounded shadow-sm
                   w-8 h-8 hover:bg-gray-100 transition"
      >
        <Filter size={16} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <DropdownItem
            label="Name"
            active={sortBy === "name"}
            onClick={() => {
              setSortBy("name");
              setOpen(false);
            }}
          />
          <DropdownItem
            label="Last modified"
            active={sortBy === "modified"}
            onClick={() => {
              setSortBy("modified");
              setOpen(false);
            }}
          />
          <DropdownItem
            label="File size"
            active={sortBy === "size"}
            onClick={() => {
              setSortBy("size");
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
    <div className="flex bg-gray-100 rounded-md p-1">
      <button
        onClick={() => setView("grid")}
        className={`p-2 rounded ${
          view === "grid" ? "bg-kala text-white shadow" : ""
        }`}
      >
        <LayoutGrid size={18} />
      </button>
      <button
        onClick={() => setView("list")}
        className={`p-2 rounded ${
          view === "list" ? "bg-kala text-white shadow" : ""
        }`}
      >
        <List size={18} />
      </button>
    </div>
    </div>

    {/* Sort */}
   

 
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="hidden md:flex border-gray-400 outline-0 border rounded px-2 py-2 text-sm"
    >
      
      <option value="name">Name</option>
      <option value="modified">Last modified</option>
      <option value="size">File size</option>
    </select>
  </div>
</div>
    </div>

    <div className="px-3 pb-1 w-full bg-white border border-gray-300  rounded">
  <nav className="flex items-center text-sm text-gray-500 gap-1">
    <FaHome className="flex items-center mt-1.5" />
    {breadcrumbs.map((item, idx) => {
      const isLast = idx === breadcrumbs.length - 1;

      return (
        <div key={item.id ?? "root"} className="flex pt-2 items-center gap-1">
          
          {!isLast ? (
            <span
              onClick={() =>
                navigate(item.id ? `/app/${item.id}` : `/app`)
              }
              className="cursor-pointer hover:text-black"
            >
              {item.name}
            </span>
          ) : (
            <span className="text-gray-800 font-medium">
              {item.name}
            </span>
          )}

          {!isLast && <span className="mx-1">{">"}</span>}
        </div>
      );
    })}
  </nav>
   <p className="text-sm text-gray-400">
      {sortedItems.length} items
    </p>
</div>


      <div className="px-3 pb-2">
   
    {/* <p className="text-sm text-gray-400">
      {sortedItems.length} items
    </p> */}
  </div>

  {view === "list" && (
  <div className="grid grid-cols-1 gap-4 pb-20 md:pb-2">
    {sortedItems.map((item) => {
      const isUploadingItem = 
  !item.isDirectory && item.id.startsWith("temp-");
const uploadProgress = progressMap[item.id] || 0;
const icon = getFileIcon(item.name)

      return (
      
    <div
  key={item.id}
  className="border group border-gray-300 rounded-lg px-4 py-1 cursor-pointer hover:bg-gray-50"
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
        <FaFolder className="text-4xl text-kala shrink-0" />
      ) : ( 
          icon && <img src={getFileIcon(item.name)} className="w-5 shrink-0" /> 
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
      <FaStar onClick={(e) => {
        e.stopPropagation()
        toggleStar(item.id, item.isDirectory)
        }} className={` ${item.isStarred ? "text-gray-400" : "text-gray-400  opacity-0 group-hover:opacity-100"} transition-opacity`} />
        
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
  <div className="grid grid-cols-2  sm:grid-cols-3 md:grid-cols-3 gap-2">
    {sortedItems.map((item) => {
      const isUploadingItem = 
  !item.isDirectory && item.id.startsWith("temp-");
const uploadProgress = progressMap[item.id] || 0;

      return (
      
    <div
  key={item.id}
 
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

      {item.size === undefined ? (
        <div  className="border group border-gray-300 rounded-lg px-4 py-1 cursor-pointer hover:bg-gray-50">
         <div className="flex justify-between w-full">
           <div className="flex items-center gap-2 min-w-0"> 
            <FaFolder className="text-4xl text-black shrink-0" />
             <div className="flex flex-col truncate min-w-0">
        <p className="text-sm truncate">{item.name}</p>
      </div>
     
        </div>
         <div className="flex items-center gap-2 shrink-0">
      <FaStar onClick={(e) => {
        e.stopPropagation()
        toggleStar(item.id, item.isDirectory)
        }} className={` ${item.isStarred ? "text-gray-400" : "text-gray-400  opacity-0 group-hover:opacity-100"} transition-opacity`}  />
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
  }}  className="text-gray-400" />
    </div>
         </div>
         </div>
      ) : null }


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
  <div className="grid grid-cols-2 pb-20 md:pb-2 sm:grid-cols-3 md:grid-cols-3 gap-2">
    {sortedItems.filter(item => item.size !== undefined).map((item) => {
      const isUploadingItem = 
  !item.isDirectory && item.id.startsWith("temp-");
const uploadProgress = progressMap[item.id] || 0;
const icon = getFileIcon(item.name);

      return (
    <div
  key={item.id}

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
  <div>
    
      {item.size !== undefined ? (
        <div  > 
         <div   className="border group border-gray-300 rounded-lg px-4 py-1 cursor-pointer hover:bg-gray-50">
       <div className="flex flex-col w-full">
          <div className="flex justify-between w-full">
           <div className="flex items-center gap-2 min-w-0"> 
          { icon && <img src={getFileIcon(item.name)} className="w-5 shrink-0" /> }
             <div className="flex flex-col truncate min-w-0">
        <p className="text-sm truncate">{item.name}</p>
      </div>
     
        </div>
         <div className="flex items-center gap-2 shrink-0">
      <FaStar onClick={(e) => {
        e.stopPropagation()
        toggleStar(item.id, item.isDirectory)
        }} className={` ${item.isStarred ? "text-gray-400" : "text-gray-400  opacity-0 group-hover:opacity-100"} transition-opacity`}  />
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

    {item.preview && item.preview.trim() ? (
   <div className=" w-full pt-1 h-40 overflow-hidden">
         <img src={`${BASE_URL}${item.preview}`} className="w-full h-full object-cover object-center shrink-0" />
      </div>
) : (
  (() => {
    const icon = getFileIcon(item.name);
    return icon ?  <div className=" w-full pt-1 h-40 overflow-hidden" > 
       <img src={getFileIcon(item.name)} className="w-full h-full object-contain object-center shrink-0" />
       </div> : null;
  })()
)}

       </div>
       </div>
        </div>
      ) : (
       null
      )}
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
          moveToBin= {moveFileToBin}
          handleDeleteDirectory={moveFolderToBin}
          handleDeleteFile={handleDeleteFile}
          handleCancelUpload={handleCancelUpload}
          isUploadingItem={selectedItem.id.startsWith("temp-")}
          handleRenameSubmit={handleRenameSubmit}
          openRenameModal={openRenameModal}
          toggleStar={toggleStar}
          onClose={() => {
            setMenuState(null);
            setActiveContextMenu(null);
          }}
        />
      )}

       {showCreateFolder && (
              <NameModal
                initialName={newDirname}
                setNewName={setNewDirname}
                onSubmit={handleCreateDirectory}
                onClose={() => setShowCreateFolder(false)}
                title="Create new folder"
                actionLabel="Create"
              />
            )}
            {showRenameModal && (
              <NameModal
                initialName={renameValue}
                setNewName={setRenameValue}
                onSubmit={handleRenameSubmit}
                renameType={renameType}
      
                onClose={closeRename}
                title={renameType === "file" ? "Rename file" : "Rename folder"}
                actionLabel="Rename"
              />
            )}
    </>
  );
}


 function DropdownItem({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 text-sm transition
        ${active ? "bg-kala text-blue-700" : "hover:bg-gray-100"}
      `}
    >
      {label}
    </button>
  );
}


