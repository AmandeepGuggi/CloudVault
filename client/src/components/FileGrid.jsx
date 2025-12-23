import { useRef } from "react";
import ContextMenu from "./ContextMenu";
import { FaFolder } from "react-icons/fa";
import { formatBytes, getFileIcon } from "../utility";

export default function FileGrid({

  directoryName,

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

  folders,
  files,
  onRename,
  handleRenameSubmit,
  menuState,
  setMenuState,
}) {
  const menuRef = useRef(null);

  const allItems = [...folders, ...files];
  const selectedItem = menuState
    ? allItems.find((x) => x.id === menuState.id)
    : null;

  return (
    <>
   <h1 className="mb-6 px-4 py-1 text-lg font-medium 
               rounded-full border border-gray-300 bg-gray-100
               text-gray-700 inline-block">
  {directoryName}
</h1>

      <h2 className="mb-3 font-semibold">Folders</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {folders.map((f) => (
          <div
            onClick={() =>
              !(activeContextMenu || isUploading)
                ? handleRowClick("directory", f.id)
                : null
            }
            key={f.id}
            onContextMenu={(e) => {
              e.preventDefault();
              handleContextMenu(e, f.id);
              setMenuState({
                id: f.id,
                x: e.clientX,
                y: e.clientY,
                type: "folder",
              });
            }}
            className="relative px-4 py-3 flex justify-between bg-secondary rounded-lg shadow-sm cursor-pointer"
          >
            <div>
              <FaFolder className="inline mr-2 text-2xl" /> {f.name}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                setMenuState({
                  id: f.id,
                  x: rect.right + 4,
                  y: rect.top,
                  type: "folder",
                });
              }}
            >
              ⋮
            </button>
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-semibold">Files</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-5 gap-4">
        {files.map((file) => {
            const isUploadingItem = file.id.startsWith("temp-");
          return (
            <div
              key={file.id}
              onClick={() =>
                !(activeContextMenu || isUploading)
                  ? handleRowClick("file", file.id)
                  : null
              }
              onContextMenu={(e) => {
                e.preventDefault();
                handleContextMenu(e, file.id);
                setMenuState({
                  id: file.id,
                  x: e.clientX,
                  y: e.clientY,
                  type: "file",
                });
              }}
              className="relative bg-white rounded-lg p-3 shadow-sm cursor-pointer"
            >
              <div className="flex gap-2">
                <img
                  className="w-16 h-16 bg-pink-200 rounded-full p-2 inline"
                  src={getFileIcon(file.name)}
                  alt="file icon"
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMenuState({
                      id: file.id,
                      x: rect.right + 4,
                      y: rect.top,
                      type: "file",
                    });
                  }}
                  className="absolute top-2 right-2 w-5 h-9"
                >
                  ⋮
                </button>
              </div>

              <p className="text-sm truncate">{file.name}</p>
              <p className="text-gray-300 text-sm">{formatBytes(file.size)}</p>
                {isUploadingItem && (
         <div className="bg-neutral-500 rounded-md mt-1 mb-2 overflow-hidden relative mx-2">
  <span className="absolute text-[12px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white">
    {Math.floor(uploadProgress)}%
  </span>

  <div
    className={`
      h-4 rounded-md
      ${uploadProgress === 100 ? "bg-green-600" : "bg-blue-600"}
    `}
    style={{ width: `${uploadProgress}%` }}
  ></div>
</div>

        )}
            </div>
          );
        })}
      </div>

      

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
