import { useEffect } from "react";
import {
  MdOpenInNew,
  MdDriveFileRenameOutline,
  MdDownload,
  MdStarBorder,
  MdDeleteOutline,
  MdCancel,
} from "react-icons/md";

export default function ContextMenu({
  isUploadingItem,
  handleCancelUpload,
  handleRowClick,
  moveToBin,
  toggleStar,
  item,
  handleDeleteDirectory,
  openRenameModal,
  BASE_URL,
  menuRef,
  position,
  onClose,
}) {
 
  useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuRef, onClose]);

  if (item.isDirectory) {
    return (
      <div
        ref={menuRef}
        style={{
          position: "fixed",
          top: position.y,
          left: position.x,
        }}
        className="z-50 w-40 cursor-pointer rounded-lg bg-white shadow-lg"
      >
        <div
          className={`flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100  `}
          onClick={() => openRenameModal("directory", item.id, item.name)}
        >
          <MdDriveFileRenameOutline className="h-5 w-5" /> Rename
        </div>
        <div
          className={`flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100  `}
          onClick={() => toggleStar(item.id, item.isDirectory)}
        >
          <MdStarBorder className="h-5 w-5" /> {item.isStarred ? "Remove starred" : "Add to starred"}
        </div>
        <div
          className={`flex w-full items-center gap-3 px-4 py-2 text-sm
        hover:bg-gray-100 text-red-600 `}
          onClick={() => handleDeleteDirectory(item.id)}
        >
          <MdDeleteOutline className="h-5 w-5" />
          <span>Move to bin</span>
        </div>
      </div>
    );
  } else {
    // File context menu
    if (isUploadingItem && item.isUploading) {
      // Only show "Cancel"
      return (
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: position.y,
            left: position.x,
          }}
          className="z-50 w-40 cursor-pointer rounded-lg bg-white shadow-lg"
        >
          <div
            className={`flex w-full items-center gap-3 px-4 py-2 text-sm
        hover:bg-gray-100 text-red-600 `}
            onClick={() => handleCancelUpload(item.id)}
          >
            <MdCancel className="h-5 w-5" />
            Cancel
          </div>
        </div>
      );
    } else {
      // Normal file
      return (
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: position.y,
            left: position.x,
          }}
          className="z-50 w-40 cursor-pointer rounded-lg bg-white shadow-lg"
        >
          <div onClick={()=> handleRowClick("file", item.id)} className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100">
            <MdOpenInNew className="h-5 w-5" />
            
            Open
          </div>

          <div
            className={`flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100  `}
            onClick={() =>
              (window.location.href = `${BASE_URL}/file/${item.id}?action=download`)
            }
          >
            <MdDownload className="h-5 w-5" />
            Download
          </div>
          <div
            className={`flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100  `}
            onClick={() => openRenameModal("file", item.id, item.name)}
          >
            <MdDriveFileRenameOutline className="h-5 w-5" />
            Rename
          </div>
          <div onClick={() => toggleStar(item.id, item.isDirectory)}
            className={`flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100  `}
          >
            <MdStarBorder className="h-5 w-5" /> {item.isStarred ? "Remove starred" : "Add to starred"}
          </div>
          <div
            className={`flex w-full items-center gap-3 px-4 py-2 text-sm
        hover:bg-gray-100 text-red-600 `}
            onClick={() =>{
              console.log("del file");
               moveToBin(item.id)
            }}
          >
            <MdDeleteOutline className="h-5 w-5" />
            Move to bin
          </div>
        </div>
      );
    }
  }
 
}
