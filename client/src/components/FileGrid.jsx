// import { folders, files } from "../data/dummyData";
import { useRef, useState } from "react";
import ContextMenu from "./ContextMenu";
import { FaFolder } from "react-icons/fa";

export default function FileGrid({folders, files, onRename, handleRenameSubmit, menuState, setMenuState}) {
  
  const menuRef = useRef(null);

  return (
    <>
      <h2 className="mb-3 font-semibold">Folders</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {folders.map((f) => (
          <div
            key={f.id}
            onContextMenu={(e) => {
              e.preventDefault(); // 🚫 disable browser menu
              const rect = e.currentTarget.getBoundingClientRect();

              setMenuState({
                id: f.id,
                x: e.clientX,
                y: e.clientY,
                type: "folder",
                onRename: onRename
              });
            }}
            className="relative px-4 py-3 flex justify-between bg-secondary rounded-lg shadow-sm"
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
                  onRename: onRename
                });
              }}
            >
              ⋮
            </button>
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-semibold">Files</h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {files.map((file) => {
          const Icon = file.icon;
          return (
            <div
              key={file.id}
               onContextMenu={(e) => {
              e.preventDefault(); // 🚫 disable browser menu
              const rect = e.currentTarget.getBoundingClientRect();

              setMenuState({
                id: file.id,
                x: e.clientX,
                y: e.clientY,
                type: "file",
                onRename: onRename
              });
            }}
              className="relative bg-white rounded-lg p-3 shadow-sm"
            >
              {/* <Icon className="text-3xl text-red-500 mb-2" /> */}
              <p className="text-sm truncate">{file.name}</p>

              <button
                 onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                setMenuState({
                  id: file.id,
                  x: rect.right + 4,
                  y: rect.top,
                  type: "file",
                  onRename: onRename
                });
              }}
                className="absolute top-2 right-2"
              >
                ⋮
              </button>
            </div>
          );
        })}
      </div>

      {menuState && (
        <ContextMenu
        handleRenameSubmit={handleRenameSubmit}
          menuRef={menuRef}
          position={{ x: menuState.x, y: menuState.y }}
          type={menuState.type}
          onClose={() => setMenuState(null)}
        />
      )}
    </>
  );
}
