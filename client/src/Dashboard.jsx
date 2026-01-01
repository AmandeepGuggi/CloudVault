import { useState, useRef, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import FileGrid from "./components/FileGrid";
import { folders, files } from "./data/dummyData";
import NameModal from "./components/NameModal";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL, getUniquename } from "./utility/index.js";

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);

  // Context menu
  const [showProfile, setShowProfile] = useState(false);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const { dirId } = useParams();
  const navigate = useNavigate();

  // Displayed directory name
  const [directoryName, setDirectoryName] = useState("All Files");

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
  const [uploadQueue, setUploadQueue] = useState([]); // queued items to upload
  const [uploadXhrMap, setUploadXhrMap] = useState({}); // track XHR per item
  const [progressMap, setProgressMap] = useState({}); // track progress per item
  const [isUploading, setIsUploading] = useState(false); // indicates if an upload is in progress

  // Context menu
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

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
   * Fetch directory contents
   */
  async function getDirectoryItems() {
    setErrorMessage(""); // clear any existing error
    try {
      const response = await fetch(`${BASE_URL}/directory/${dirId || ""}`, {
        credentials: "include",
      });
      console.log(response);

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
    if (!authChecked) return;
    getDirectoryItems();
    // Reset context menu
    setActiveContextMenu(null);
    setActiveContextMenu(null);
    setContextMenu(null);
  }, [dirId, authChecked]);
  
  /**
   * Decide file icon
   */
 
  /**
   * Click row to open directory or file
   */
  function handleRowClick(type, id) {
    if (type === "directory") {
      navigate(`/directory/${id}`);
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
      return {
        file,
        name: file.name,
        size: file.size,
        id: tempId,
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
  function processUploadQueue(queue) {
    if (queue.length === 0) {
      // No more items to upload
      setIsUploading(false);
      setUploadQueue([]);
      setTimeout(() => {
        getDirectoryItems();
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

  async function handleDeleteDirectory(id) {
    setErrorMessage("");
    try {
      const response = await fetch(`${BASE_URL}/directory/${id}`, {
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
      setContextMenuPos({ x: clickX - 110, y: clickY });
    }
  }

  useEffect(() => {
    function handleDocumentClick() {
      setActiveContextMenu(null);
    }
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  // Combine directories & files into one list for rendering
  const combinedItems = [
    ...directoriesList.map((d) => ({ ...d, isDirectory: true })),
    ...filesList.map((f) => ({ ...f, isDirectory: false })),
  ];

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

  return (
    <div className="flex h-screen  overflow-hidden">
      <Sidebar
        directoryName={directoryName}
        onUploadFilesClick={() => {
          fileInputRef.current.click();
        }}
        fileInputRef={fileInputRef}
        handleFileSelect={handleFileSelect}
        disabled={
          errorMessage ===
          "Directory not found or you do not have access to it!"
        }
        onNewClick={() => setShowNewMenu(!showNewMenu)}
        showNewMenu={showNewMenu}
        onCreateFolder={() => {
          setShowNewMenu(false);
          setShowCreateFolder(true);
        }}
        onMenuClose={() => setShowNewMenu(false)}
      />
      {/* <Header /> */}
      <div className="flex-1 flex flex-col">
        <Topbar
        authChecked={authChecked}
        setAuthChecked = {setAuthChecked}
          onProfileToggle={() => setShowProfile(prev => !prev)}
          showProfile={showProfile}
          onProfileClose={() => setShowProfile(false)}
        />
        {errorMessage &&
          errorMessage !==
            "Directory not found or you do not have access to it!" && (
            <div className="error-message">{errorMessage}</div>
          )}

        <main className="p-3 h-full bg-white mb-2 mr-4 ml-4 overflow-y-auto">
          <FileGrid
          directoryName={directoryName}
          handleContextMenu={handleContextMenu}
          handleDeleteDirectory={handleDeleteDirectory}
          handleDeleteFile={handleDeleteFile}
          handleCancelUpload={handleCancelUpload}
          openRenameModal={openRenameModal}
          BASE_URL={BASE_URL}
          setActiveContextMenu={setActiveContextMenu}
          progressMap={progressMap}
          handleRowClick={handleRowClick}
          folders={directoriesList}
          files={filesList}
            onRename={openRename}
            menuState={contextMenu}
            setMenuState={setContextMenu}
            handleRenameSubmit={() => {
              setContextMenu(null);
              setShowRenameModal(false);
              setActiveContextMenu(null)
            }}
          />
        </main>
      </div>
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
    </div>
  );
}
