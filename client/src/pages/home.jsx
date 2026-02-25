import { useEffect, useRef, useState, useMemo } from "react";
import NameModal from "../components/NameModal.jsx";
import { useParams, useNavigate,  } from "react-router-dom";
import { getUniquename, BASE_URL, getFileIcon, formatBytes } from "../utility";
import { Filter, FolderPlus, LayoutGrid, List, MoreVertical, Upload, Download } from "lucide-react";
import { FaFolder, FaStar, FaHome } from "react-icons/fa";
import ContextMenu from "../components/ContextMenu.jsx";
import { useAuth } from "../context/AuthContext.jsx"; 
import ShareFileModal from "../components/modals/ShareFileModal.jsx";
import { importFromDrive } from "../api/authApi.js";
import { createDirectory, getBreadcrumbs, getDirectory, softDeleteDirectory, renameDirectory, toggleDirectoryStar } from "../api/directoryApi.js";
import { bulkMoveToBin, deleteFile, downloadBulkZip, getBulkDownloadLinks, renameFile, softDeleteFile, toggleFileStar } from "../api/fileApi.js";

const HOME_VIEW_STORAGE_KEY = "home:view";

export default function Home() {
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  const [bulkSelection, setBulkSelection] = useState({});
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  const { refreshUser , user} = useAuth();
  const [view, setView] = useState(() => {
    try {
      const saved = localStorage.getItem(HOME_VIEW_STORAGE_KEY);
      return saved === "grid" || saved === "list" ? saved : "list";
    } catch {
      return "list";
    }
  }); 
  const [sortBy, setSortBy] = useState("name"); 
const [sortOrder, setSortOrder] = useState("asc"); 
 const [showNewMenu, setShowNewMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [menuState, setMenuState] = useState(null);
  const { dirId } = useParams();
  const navigate = useNavigate();
  const [breadcrumbs, setBreadcrumbs] = useState([]);
const [showShareModal, setShowShareModal] = useState(false)
const [sharefileDetails, setShareFileDetails] = useState({
  id: "",
  name: "",
  size: "",
})

 const clientId = import.meta.env.VITE_DRIVE_CLIENT_ID;
 const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const [driveToken, setDriveToken] = useState("");
  const driveTokenRef = useRef("");
  const driveImportQueueRef = useRef([]);
  const [driveImportControllers, setDriveImportControllers] = useState({});
  const [isDriveImporting, setIsDriveImporting] = useState(false);
  const cancelledDriveImportsRef = useRef(new Set());

  const selectedCount = Object.keys(bulkSelection).length;

function handleToggleMultiSelectMode() {
  setIsMultiSelectMode((prev) => {
    const next = !prev;
    if (!next) {
      clearBulkSelection();
    }
    return next;
  });
}

function handleSelectAllVisibleItems() {
  const next = {};
  for (const item of sortedItems) {
    if (!isSelectableItem(item)) continue;
    next[item.id] = item.isDirectory ? "directory" : "file";
  }
  setBulkSelection(next);
}

useEffect(() => {
  try {
    localStorage.setItem(HOME_VIEW_STORAGE_KEY, view);
  } catch {
    // Ignore localStorage failures
  }
}, [view]);


useEffect(() => {
  const loadScript = (src) =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      document.body.appendChild(script);
    });

  (async () => {
    // Load OAuth client
    await loadScript("https://accounts.google.com/gsi/client");

    // Load Google API platform
    await loadScript("https://apis.google.com/js/api.js");

    // 🔥 THIS IS THE MISSING PIECE
    window.gapi.load("picker", () => {
      console.log("Google Picker loaded");
    });
  })();
}, []);

const requestDriveToken = () => {
  try {
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "https://www.googleapis.com/auth/drive.readonly",
      callback: (tokenResponse) => {
      setDriveToken(tokenResponse.access_token);
      driveTokenRef.current = tokenResponse.access_token;
      openPicker(tokenResponse.access_token);
    }
    });

    tokenClient.requestAccessToken();
  } catch {
    showStatus("error", "Unable to request Google Drive access.");
  }
};

const openPicker = (accessToken) => {
  if (!window.google?.picker) {
    showStatus("error", "Google Picker is not ready yet.");
    return;
  }

  const picker = new window.google.picker.PickerBuilder()
    .addView(window.google.picker.ViewId.DOCS)
    .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
    .setOAuthToken(accessToken)
    .setDeveloperKey(apiKey)
    .setCallback((pickerCallback))
    
    .build();

  picker.setVisible(true);
};

const pickerCallback = (data) => {
  if (data.action !== google.picker.Action.PICKED) return;

  const files = data.docs.map((doc) => ({
    id: doc.id,
    name: doc.name,
    mimeType: doc.mimeType,
  }));

  startDriveImportQueue(files);
  
};

const startDriveImportQueue = (files) => {
  if (!files?.length) return;
  if (!driveTokenRef.current && !driveToken) {
    showStatus("error", "Missing Drive access token.");
    return;
  }

  const queuedItems = files.map((file) => ({
    id: `drive-temp-${Date.now()}-${Math.random()}`,
    driveFile: file,
    name: file.name,
    size: 0,
    mimeType: file.mimeType,
    isImporting: true,
    isDirectory: false,
  }));

  setFilesList((prev) => [...queuedItems, ...prev]);
  const nextQueue = [...driveImportQueueRef.current, ...queuedItems];
  driveImportQueueRef.current = nextQueue;

  if (!isDriveImporting) {
    setIsDriveImporting(true);
    processDriveImportQueue(nextQueue);
  }
};

async function processDriveImportQueue(queue, completed = 0, failed = 0) {
  if (queue.length === 0) {
    setIsDriveImporting(false);
    driveImportQueueRef.current = [];
    await getDirectoryItems();
    await refreshUser();

    if (completed > 0 && failed === 0) {
      showStatus("success", `${completed} file(s) imported from Drive.`);
    } else if (completed > 0 && failed > 0) {
      showStatus("error", `${completed} imported, ${failed} failed.`);
    } else if (failed > 0) {
      showStatus("error", `${failed} file(s) failed to import.`);
    }
    return;
  }

  const [currentItem, ...restQueue] = queue;
  if (cancelledDriveImportsRef.current.has(currentItem.id)) {
    cancelledDriveImportsRef.current.delete(currentItem.id);
    processDriveImportQueue(restQueue, completed, failed);
    return;
  }

  const controller = new AbortController();
  setDriveImportControllers((prev) => ({ ...prev, [currentItem.id]: controller }));

  try {
    const response = await importFromDrive(
      [currentItem.driveFile],
      driveTokenRef.current || driveToken,
      dirId,
      controller.signal
    );

    setFilesList((prev) => prev.filter((f) => f.id !== currentItem.id));
    processDriveImportQueue(restQueue, response?.message ? completed + 1 : completed, failed);
  } catch (error) {
    setFilesList((prev) => prev.filter((f) => f.id !== currentItem.id));
    if (error?.name === "CanceledError" || error?.name === "AbortError") {
      processDriveImportQueue(restQueue, completed, failed + 1);
      return;
    }
    processDriveImportQueue(restQueue, completed, failed + 1);
  } finally {
    cancelledDriveImportsRef.current.delete(currentItem.id);
    setDriveImportControllers((prev) => {
      const copy = { ...prev };
      delete copy[currentItem.id];
      return copy;
    });
    driveImportQueueRef.current = driveImportQueueRef.current.filter(
      (item) => item.id !== currentItem.id
    );
  }
}




async function buildBreadcrumbs(currentDirId) {
  const path = [];
  let cursor = currentDirId;
  while (cursor) {
    const res = await getBreadcrumbs(cursor)
    if (res.status!==200 || !res.data) break;
   
    const data = res.data
    setBreadcrumbs(data)

    path.push({
      id: data.id,
      name: data.name,
    });

    cursor = data.parentId; 
  }

  
  path.push({ id: null, name: "All Files" });

  return path.reverse();
}


 // Displayed directory name
const [directoryName, setDirectoryName] = useState("My Files");

 // Lists of items
  const [directoriesList, setDirectoriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);

  function showStatus(type, text) {
    setStatusMessage({ type, text });
  }

  useEffect(() => {
    if (!statusMessage.text) return;
    const timeout = setTimeout(() => {
      setStatusMessage({ type: "", text: "" });
    }, 2500);
    return () => clearTimeout(timeout);
  }, [statusMessage]);

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
        setSelectedItemId(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //fetch directory items
   async function getDirectoryItems() {
      if (!user) return;
      try {
        const data = await getDirectory(dirId || "")
        setDirectoryName(dirId ? data.name : "All Files");
        setDirectoriesList([...data.directories].reverse());
        setFilesList([...data.files]);
      } catch (error) {
        showStatus("error", error?.message || "Failed to load directory items.");
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
        clearBulkSelection();
        setIsMultiSelectMode(false);

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
        const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length === 0) return;

        const oversizedFiles = selectedFiles.filter((file) => file.size > MAX_FILE_SIZE_BYTES);
        const allowedFiles = selectedFiles.filter((file) => file.size <= MAX_FILE_SIZE_BYTES);

        if (oversizedFiles.length > 0) {
          showStatus("error", `${oversizedFiles.length} file(s) exceed 5MB and were not uploaded.`);
        }
        if (allowedFiles.length === 0) {
          e.target.value = "";
          return;
        }
    
        // Build a list of "temp" items
        const newItems = allowedFiles.map((file) => {
          const tempId = `temp-${Date.now()}-${Math.random()}`;
          
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
    async function processUploadQueue(queue, completed = 0, failed = 0) {
        if (queue.length === 0) {
          // No more items to upload
          setIsUploading(false);
          setUploadQueue([]);
          setTimeout(() => {
            getDirectoryItems();
           refreshUser()
          }, 1000);
          if (completed > 0 && failed === 0) {
            showStatus("success", `${completed} file(s) uploaded successfully.`);
          } else if (completed > 0 && failed > 0) {
            showStatus("error", `${completed} uploaded, ${failed} failed.`);
          } else if (failed > 0) {
            showStatus("error", `${failed} file(s) failed to upload.`);
          }
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
    
        // xhr.setRequestHeader("filename", currentItem.name );
        xhr.setRequestHeader("X-Filename", encodeURIComponent(currentItem.name));
        xhr.setRequestHeader("X-Filesize", currentItem.size);


    
    
    
        xhr.upload.addEventListener("progress", (evt) => {
          if (evt.lengthComputable) {
            const progress = (evt.loaded / evt.total) * 100;
            setProgressMap((prev) => ({ ...prev, [currentItem.id]: progress }));
          }
        });
    
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            processUploadQueue(restQueue, completed + 1, failed);
          } else {
            let serverMessage = "Upload failed";
            try {
              const parsed = JSON.parse(xhr.responseText || "{}");
              if (parsed?.error) serverMessage = parsed.error;
            } catch {
              // ignore parse failures and show fallback message
            }
            showStatus("error", `${currentItem.name}: ${serverMessage}`);
            processUploadQueue(restQueue, completed, failed + 1);
          }
        });

        xhr.addEventListener("error", () => {
          showStatus("error", `${currentItem.name}: Upload failed due to a network error.`);
          processUploadQueue(restQueue, completed, failed + 1);
        });

        xhr.addEventListener("abort", () => {
          processUploadQueue(restQueue, completed, failed + 1);
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
        showStatus("error", "Upload cancelled.");
      }

      function handleCancelDriveImport(tempId) {
        cancelledDriveImportsRef.current.add(tempId);
        const controller = driveImportControllers[tempId];
        if (controller) {
          controller.abort();
        }

        driveImportQueueRef.current = driveImportQueueRef.current.filter(
          (item) => item.id !== tempId
        );
        setFilesList((prev) => prev.filter((f) => f.id !== tempId));
        setDriveImportControllers((prev) => {
          const copy = { ...prev };
          delete copy[tempId];
          return copy;
        });
        showStatus("error", "Drive import cancelled.");
      }

      async function moveFileToBin(fileId) {
        
  try {
    await softDeleteFile(fileId);
    getDirectoryItems();
    showStatus("success", "File moved to bin.");

  } catch {
    showStatus("error", "Failed to move file to bin.");
  }
}

 async function handleDeleteFile(id) {
        try {
          await deleteFile(id);
          getDirectoryItems();
          showStatus("success", "File deleted.");
        } catch (error) {
          showStatus("error", error?.message || "Failed to delete file.");
        }
      }
    

async function moveFolderToBin(folderId) {
  try {
    await softDeleteDirectory(folderId);
    getDirectoryItems();
    showStatus("success", "Folder moved to bin.");
  } catch {
    showStatus("error", "Failed to move folder to bin.");
  }
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
  
      try {
        await createDirectory(dirId || "", finalName);
        
        setNewDirname("New Folder");
        setShowCreateFolder(false);
        getDirectoryItems();
        showStatus("success", "Folder created.");
      } catch (error) {
        showStatus("error", error?.message || "Failed to create folder.");
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
      try {
        if (renameType === "file") {
      await renameFile(renameId, renameValue);
    } else {
      await renameDirectory(renameId, renameValue);
    }
        
  
        setShowRenameModal(false);
        setRenameValue("");
        setRenameType(null);
        setRenameId(null);
        getDirectoryItems();
        showStatus("success", `${renameType === "file" ? "File" : "Folder"} renamed.`);
      } catch (error) {
        showStatus("error", error?.message || "Rename failed.");
      }
    }
  
    /**
     * Context Menu
     */
    function handleContextMenu(e, id) {
      e.stopPropagation();
      e.preventDefault();
  
      if (activeContextMenu === id) {
        setActiveContextMenu(null);
      } else {
        setActiveContextMenu(id);
      }
    }

   
      function closeRename() {
        setRenameType(null);
        setRenameId("");
        setRenameValue("");
        setShowRenameModal(false);
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
  const folders = sortedItems.filter(item => item.size === undefined);
const files = sortedItems.filter(item => item.size !== undefined);

const isTempUploadItem = (item) =>
  !item.isDirectory &&
  typeof item.id === "string" &&
  item.id.startsWith("temp-") &&
  !item.id.startsWith("drive-temp-");

const isTempDriveImportItem = (item) =>
  !item.isDirectory &&
  typeof item.id === "string" &&
  item.id.startsWith("drive-temp-");

const isBusyItem = (item) => isTempUploadItem(item) || isTempDriveImportItem(item);
const isSelectableItem = (item) => item?.id && !isBusyItem(item);
const isItemSelected = (item) => Boolean(bulkSelection[item.id]);

function toggleBulkSelection(item) {
  if (!isSelectableItem(item)) return;

  setBulkSelection((prev) => {
    const copy = { ...prev };
    if (copy[item.id]) {
      delete copy[item.id];
    } else {
      copy[item.id] = item.isDirectory ? "directory" : "file";
    }
    return copy;
  });
}

function clearBulkSelection() {
  setBulkSelection({});
}

function getBulkIds() {
  const fileIds = [];
  const directoryIds = [];

  for (const [id, type] of Object.entries(bulkSelection)) {
    if (type === "directory") directoryIds.push(id);
    else fileIds.push(id);
  }
  return { fileIds, directoryIds };
}

async function handleBulkMoveSelectionToBin() {
  const { fileIds, directoryIds } = getBulkIds();
  if (!fileIds.length && !directoryIds.length) return;

  try {
    await bulkMoveToBin({ fileIds, directoryIds });
    showStatus("success", "Selected items moved to bin.");
    clearBulkSelection();
    await getDirectoryItems();
  } catch (error) {
    showStatus("error", error?.message || "Failed to move selected items to bin.");
  }
}

async function handleBulkDownloadSelected() {
  const { fileIds, directoryIds } = getBulkIds();
  if (!fileIds.length && !directoryIds.length) return;

  try {
    const response = await getBulkDownloadLinks({ fileIds, directoryIds });
    const links = response?.links || [];
    links.forEach((link, index) => {
      setTimeout(() => {
        const anchor = document.createElement("a");
        anchor.href = link.url;
        anchor.download = "";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      }, index * 150);
    });
    showStatus("success", `${links.length} file(s) download started.`);
  } catch (error) {
    showStatus("error", error?.message || "Failed to download selected items.");
  }
}

async function handleBulkDownloadAsZip() {
  const { fileIds, directoryIds } = getBulkIds();
  if (!fileIds.length && !directoryIds.length) return;

  try {
    const zipBlob = await downloadBulkZip({ fileIds, directoryIds });
    const url = window.URL.createObjectURL(zipBlob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `cloudvault-download-${Date.now()}.zip`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
    showStatus("success", "ZIP download started.");
  } catch (error) {
    showStatus("error", error?.message || "Failed to download ZIP.");
  }
}

function getMenuPosition(e, menuHeight = 220, bottomOffset = 80) {
  const menuWidth = 180;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let x = e.clientX;
  let y = e.clientY;

  if (x + menuWidth > viewportWidth) {
    x = viewportWidth - menuWidth - 8;
  }

  if (y + menuHeight > viewportHeight) {
    y = viewportHeight - menuHeight - bottomOffset;
  }

  return { x, y };
}

function openItemMenu(e, item, options = {}) {
  const { shouldSelect = false, bottomOffset = 80 } = options;
  if (isBusyItem(item)) return;

  if (shouldSelect) {
    setSelectedItemId(item.id);
  }

  handleContextMenu(e, item.id);
  const position = getMenuPosition(e, 220, bottomOffset);

  setMenuState({
    id: item.id,
    ...position,
    type: "folder",
  });
}

function handleItemSelect(id) {
  if (isUploading || isDriveImporting) return;
  if (isMultiSelectMode) {
    const item = allItems.find((x) => x.id === id);
    if (item) toggleBulkSelection(item);
    return;
  }
  setSelectedItemId(id);
}

function handleItemOpen(item) {
  if (isUploading || isDriveImporting) return;
  if (isMultiSelectMode) return;
  if (item.isDirectory) {
    navigate(`/app/${item.id}`);
  } else {
    window.open(`${BASE_URL}/file/${item.id}`, "_blank");
  }
}

function renderTransferStatus(itemId, isUploadingItem, isDriveImportItem, uploadProgress) {
  if (!isUploadingItem && !isDriveImportItem) return null;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2">
        {isUploadingItem ? (
          <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
            <div
              className={`h-full transition-all ${
                uploadProgress === 100 ? "bg-green-600" : "bg-blue-600"
              }`}
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        ) : (
          <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
            <div className="h-full w-1/2 bg-blue-600 animate-pulse" />
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            isDriveImportItem ? handleCancelDriveImport(itemId) : handleCancelUpload(itemId);
          }}
          className="text-gray-500 hover:text-red-600 text-sm"
        >
          ✕
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-1">
        {isDriveImportItem ? "Importing from Drive..." : `Uploading… ${Math.floor(uploadProgress)}%`}
      </p>
    </div>
  );
}

function applySortBy(nextSortBy) {
  setSortBy(nextSortBy);
  setSortOrder(nextSortBy === "modified" ? "desc" : "asc");
}


async function toggleStar(id, isDirectory) {
  try {
    if (isDirectory) {
      await toggleDirectoryStar(id);
    } else {
      await toggleFileStar(id);
    }

    await getDirectoryItems();
    setMenuState(null);
    showStatus("success", "Star status updated.");

  } catch (error) {
    showStatus("error", error?.response?.data?.error || error?.message || "Failed to update star.");
  }
}


  
 
  return (
    <>
      {statusMessage.text && (
        <div
          className={`absolute right-3 top-3 z-[70] rounded-md border px-3 py-2 text-xs shadow-lg ${
            statusMessage.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {statusMessage.text}
        </div>
      )}
      <input
        ref={fileInputRef}
        id="file-upload"
        type="file"
        style={{ display: "none" }}
        multiple
        onChange={handleFileSelect}
      />
        <div className="md:sticky md:-top-7 z-10 bg-[#ffffff] ">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-2 border-b mb-6 border-gray-300">

  <div className=" hidden md:flex items-center gap-3">
  <button
    onClick={()=> {
       setShowNewMenu(false);
      setShowCreateFolder(true);
    }}
    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#e4e9ee]
               rounded-md text-gray-700 hover:bg-[#e9eef3]"
  >
    <FolderPlus size={16} />
    Create Folder
  </button>

  <button
    onClick={() => {
      fileInputRef.current?.click();
    }}
    className="flex items-center gap-2 px-4 py-2 text-sm font-medium
               rounded-md bg-kala text-white cursor-pointer"
  >
    <Upload size={16} />
    Upload File
  </button>
  

<button
  onClick={requestDriveToken}
  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#e4e9ee]
            rounded-md hover:bg-[#e9eef3]"
>
  <Download size={16} />
  Import from Drive
</button>
  

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
      fileInputRef.current?.click();
    }}
    className="flex items-center gap-2 px-4 py-2 text-sm font-medium
               rounded-md bg-kala text-white hover:bg-black-700"
  >
    <Upload size={16} />
    Upload File
  </button>
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
              applySortBy("name");
              setOpen(false);
            }}
          />
          <DropdownItem
            label="Last modified"
            active={sortBy === "modified"}
            onClick={() => {
              applySortBy("modified");
              setOpen(false);
            }}
          />
          <DropdownItem
            label="File size"
            active={sortBy === "size"}
            onClick={() => {
              applySortBy("size");
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
      onChange={(e) => applySortBy(e.target.value)}
      className="hidden md:flex border-gray-400 outline-0 border rounded px-2 py-2 text-sm"
    >
      
      <option value="name">Name</option>
      <option value="modified">Last modified</option>
      <option value="size">File size</option>
    </select>
  </div>
</div>
    </div>

    <div className="px-3 pb-1 mb-2 w-full bg-[#f8f9f9] border border-gray-300  rounded">
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

{isMultiSelectMode && (
  <div className="mb-3 flex flex-wrap items-center gap-2 rounded border border-blue-200 bg-blue-50 px-3 py-2">
    <span className="text-sm font-medium text-blue-900">{selectedCount} selected</span>
    <button
      onClick={handleSelectAllVisibleItems}
      className="rounded bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
    >
      Select All
    </button>
    <button
      onClick={handleBulkDownloadSelected}
      disabled={selectedCount === 0}
      className="rounded bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
    >
      Download
    </button>
    <button
      onClick={handleBulkDownloadAsZip}
      disabled={selectedCount === 0}
      className="rounded bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
    >
      Download ZIP
    </button>
    <button
      onClick={handleBulkMoveSelectionToBin}
      disabled={selectedCount === 0}
      className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
    >
      Move to Bin
    </button>
    <button
      onClick={clearBulkSelection}
      className="rounded bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
    >
      Clear
    </button>
  </div>
)}


  {view === "list" && (
  <div className="grid grid-cols-1 gap-4 pb-20 md:pb-2">
    {sortedItems.map((item) => {
      const isUploadingItem = isTempUploadItem(item);
const isDriveImportItem = isTempDriveImportItem(item);
const uploadProgress = progressMap[item.id] || 0;
const icon = getFileIcon(item.name)

      return (
      
    <div
  key={item.id}
  className={`border rounded-lg px-4 py-1 cursor-pointer group
  ${selectedItemId === item.id ? "bg-blue-50 border-blue-400" : "hover:bg-gray-50"}
`}

  onClick={() => handleItemSelect(item.id)}
onDoubleClick={() => handleItemOpen(item)}

  onContextMenu={(e) => {
    openItemMenu(e, item, { shouldSelect: true, bottomOffset: 80 });
  }}
>
  {/* Top row */}
  <div className="flex justify-between items-center gap-3">
    <div className="flex items-center gap-2 truncate">
      {isMultiSelectMode && isSelectableItem(item) && (
        <input
          type="checkbox"
          checked={isItemSelected(item)}
          onClick={(e) => e.stopPropagation()}
          onChange={() => toggleBulkSelection(item)}
        />
      )}
      {item.size === undefined ? (
        <FaFolder className="text-4xl text-kala shrink-0" />
      ) : ( 
          icon && <img src={getFileIcon(item.name)} className="w-5 shrink-0" /> 
      )}

      <div className="flex flex-col truncate">
        <p className="text-sm truncate">{item.name}</p>

        {item.size !== undefined && !isUploadingItem && !isDriveImportItem && (
          <p className="text-gray-400 text-sm">
            {formatBytes(item.size)}
          </p>
        )}
        {item.size === undefined && (
          <p className="text-gray-400 text-sm">
            {formatBytes(Number(item.totalSize || 0))}
          </p>
        )}
      </div>
    </div>

    <div className="flex items-center gap-2">
      <FaStar onClick={(e) => {
        e.stopPropagation()
        toggleStar(item.id, item.isDirectory)
        }} className={` ${item.isStarred ? "text-yellow-400" : "text-gray-400  opacity-0 group-hover:opacity-100"} transition-opacity`} />
        
      <MoreVertical onClick={(e) => {
    openItemMenu(e, item, { shouldSelect: true, bottomOffset: 80 });
  }} className="text-gray-400" />
    </div>
  </div>

  {renderTransferStatus(item.id, isUploadingItem, isDriveImportItem, uploadProgress)}
</div>

     
    )})}
  </div>
)}
{/* for folders */}
{view === "grid" && (
  <div className="grid grid-cols-2  sm:grid-cols-3 md:grid-cols-3 gap-2">
    {
    folders.map((item) => {
      const isUploadingItem = isTempUploadItem(item);
const isDriveImportItem = isTempDriveImportItem(item);
const uploadProgress = progressMap[item.id] || 0;

      return (
      
    <div
  key={item.id}
 className={` my-2
`}
   onClick={() => handleItemSelect(item.id)}
onDoubleClick={() => handleItemOpen(item)}
  onContextMenu={(e) => {
    openItemMenu(e, item, { shouldSelect: true, bottomOffset: 8 });
  }}
>
  {/* Top row */}

      {item.size === undefined ? (
        <div  className={`border group  rounded-lg px-4 py-1 cursor-pointer  ${selectedItemId === item.id ? "bg-blue-50 border-blue-400" : "hover:bg-gray-50 border-gray-300  "}`}>
         <div className="flex justify-between w-full">
           <div className="flex  items-center  min-w-0"> 
            {isMultiSelectMode && isSelectableItem(item) && (
              <input
                type="checkbox"
                checked={isItemSelected(item)}
                onClick={(e) => e.stopPropagation()}
                onChange={() => toggleBulkSelection(item)}
              />
            )}
            <FaFolder className="text-4xl text-kala shrink-0" />
             <div className="flex flex-col truncate min-w-0 ">
        <p className="text-sm truncate pl-1">{item.name}</p>
        <p className="text-gray-400 text-sm pl-1">
          {formatBytes(Number(item.totalSize || 0))}
        </p>
      </div>
     
        </div>
         <div className="flex items-center gap-2 shrink-0">
      <FaStar onClick={(e) => {
        e.stopPropagation()
        setSelectedItemId(item.id);
        toggleStar(item.id, item.isDirectory)
        }} className={` ${item.isStarred ? "text-yellow-400" : "text-gray-400  opacity-0 group-hover:opacity-100"} transition-opacity`}  />
      <MoreVertical onClick={(e) => {
    openItemMenu(e, item, { shouldSelect: true, bottomOffset: 8 });
  }}  className="text-gray-400" />
    </div>
         </div>
         </div>
      ) : "aman" }


  {renderTransferStatus(item.id, isUploadingItem, isDriveImportItem, uploadProgress)}
</div>

     
    )})}
  </div>
)}

{/* for files */}

{view === "grid" && (
  <div className="grid grid-cols-2 pb-20 md:pb-2 sm:grid-cols-3 md:grid-cols-3 gap-2">
    {files.filter(item => item.size !== undefined).map((item) => {
      const isUploadingItem = isTempUploadItem(item);
const isDriveImportItem = isTempDriveImportItem(item);
const uploadProgress = progressMap[item.id] || 0;
const icon = getFileIcon(item.name);

      return (
    <div
  key={item.id}

  // onClick={() =>
  //   !(activeContextMenu || isUploading) &&
  //   handleRowClick(item.isDirectory ? "directory" : "file", item.id)
  // }
   onClick={() => handleItemSelect(item.id)}
onDoubleClick={() => handleItemOpen(item)}
  onContextMenu={(e) => {
    openItemMenu(e, item, { shouldSelect: true, bottomOffset: 80 });
  }}
  
>
  {/* Top row */}
  <div>
    
      {item.size !== undefined ? (
        <div> 
         <div  className={`border rounded-lg px-4 py-1 cursor-pointer group
  ${selectedItemId === item.id ? "bg-blue-50 border-blue-400" : "hover:bg-gray-50"}
`} 
>
       <div className="flex flex-col w-full">
          <div className="flex justify-between w-full">
           <div className="flex items-center gap-2 min-w-0"> 
          {isMultiSelectMode && isSelectableItem(item) && (
            <input
              type="checkbox"
              checked={isItemSelected(item)}
              onClick={(e) => e.stopPropagation()}
              onChange={() => toggleBulkSelection(item)}
            />
          )}
          { icon && <img src={getFileIcon(item.name)} className="w-5 shrink-0" /> }
             <div className="flex flex-col truncate min-w-0">
        <p className="text-sm truncate">{item.name}</p>
      </div>
     
        </div>
         <div className="flex items-center gap-2 shrink-0">
      <FaStar onClick={(e) => {
        e.stopPropagation()
        toggleStar(item.id, item.isDirectory)
        }} className={` ${item.isStarred ? "text-yellow-400" : "text-gray-400  opacity-0 group-hover:opacity-100"} transition-opacity`}  />
      <MoreVertical onClick={(e) => {
    openItemMenu(e, item, { shouldSelect: false, bottomOffset: 18 });
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

  {renderTransferStatus(item.id, isUploadingItem, isDriveImportItem, uploadProgress)}
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
          isUploadingItem={isTempUploadItem(selectedItem) || isTempDriveImportItem(selectedItem)}
          handleRenameSubmit={handleRenameSubmit}
          openRenameModal={openRenameModal}
          toggleStar={toggleStar}
          setShowShareModal={setShowShareModal}
          shareFileDetails={setShareFileDetails}
          isMultiSelectMode={isMultiSelectMode}
          onToggleMultiSelectMode={handleToggleMultiSelectMode}
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
            {
              showShareModal && (
                 <ShareFileModal
                 fileId={sharefileDetails.id}
          fileName={sharefileDetails.name}
          fileSize= {sharefileDetails.size}
          filePath="Shared Drive / Projects"
          onClose={() => {
            setShowShareModal(false)
            setShareFileDetails(null)
          }}
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
