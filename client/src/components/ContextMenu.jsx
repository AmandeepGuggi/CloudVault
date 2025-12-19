import { useEffect } from "react";
import {
  MdOpenInNew,
  MdDriveFileRenameOutline,
  MdDownload,
  MdStarBorder,
  MdDeleteOutline,
} from "react-icons/md";

export default function ContextMenu({ onRename, menuRef, position, onClose , type, handleRenameSubmit}) {
  useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuRef, onClose]);

  const fileOptions = [
  {
    id: "open",
    label: "Open",
    icon: MdOpenInNew,
    allowedFor: ["file"], // 👈 NOT folder
    onClicking: handleRenameSubmit
  },
  {
    id: "rename",
    label: "Rename",
    icon: MdDriveFileRenameOutline,
    allowedFor: ["file", "folder"],
    onClicking: onRename
  },
  {
    id: "download",
    label: "Download",
    icon: MdDownload,
    allowedFor: ["file"],
    onClicking: handleRenameSubmit
  },
  {
    id: "star",
    label: "Add to starred",
    icon: MdStarBorder,
    allowedFor: ["file", "folder"],
    onClicking: handleRenameSubmit
  },
  {
    id: "delete",
    label: "Move to bin",
    icon: MdDeleteOutline,
    danger: true,
    allowedFor: ["file", "folder"],
    onClicking: handleRenameSubmit
  },
];
const visibleOptions = fileOptions.filter((opt) =>
  opt.allowedFor.includes(type)
);

  return (
    <div
      ref={menuRef}   
      style={{
        position: "fixed",
        top: position.y,
        left: position.x,
      }}
      className="z-50 w-40 rounded-lg bg-white shadow-lg"
    >
      {visibleOptions.map((opt) => {
        const Icon = opt.icon;

        return (
          <button
            key={opt.id}
            className={`flex w-full items-center gap-3 px-4 py-2 text-sm
              hover:bg-gray-100
              ${opt.danger ? "text-red-600" : "text-gray-700"}
            `}
            onClick={() => {
              opt.onClicking()
              console.log(opt.id);
              onClose();
            }}
          >
            <Icon className="h-5 w-5" />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
