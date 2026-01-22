"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  File,
  Folder,
  Download,
  Trash2,
  Edit2,
  Copy,
  MoreVertical,
} from "lucide-react";
import EditFileModal from "./modals/EditFileModal";
import RenameFileModal from "./modals/RenameFileModal";
import DeleteFileModal from "./modals/DeleteFileModal";
import { BASE_URL, formatBytes } from "../../../utility";



export default function UserFilesPage({ user, onBack }) {

  const [showEditModal, setShowEditModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showMenu, setShowMenu] = useState(null);
  const [dirId, setDirId] = useState("");
  const [currentDirId, setCurrentDirId] = useState(null);
const [items, setItems] = useState([]);
   const [breadcrumbs, setBreadcrumbs] = useState(["root"])


function transformApiData(data) {
  const mappedDirs = data.directories.map(dir => ({
    id: dir._id || dir.id,
    name: dir.name,
    type: "folder",
    size: "—",
    modified: "",
    raw: dir
  }));

  const mappedFiles = data.files.map(file => ({
    id: file._id || file.id,
    name: file.name,
    type: "file",
    size: formatBytes(file.size),
    modified: new Date(file.updatedAt).toLocaleDateString(),
    raw: file
  }));

  return [...mappedDirs, ...mappedFiles];
}


  const handleEditFile = (file) => {
    setSelectedFile(file);
    setShowEditModal(true);
    setShowMenu(null);
  };

  const handleRenameFile = (file) => {
    setSelectedFile(file);
    setShowRenameModal(true);
    setShowMenu(null);
  };

  const handleDeleteFile = (file) => {
    setSelectedFile(file);
    setShowDeleteModal(true);
    setShowMenu(null);
  };

  const confirmRename = (newName) => {
   //my logic
    setShowRenameModal(false);
  };

  const confirmDelete = () => {
   //logic
    setShowDeleteModal(false);
  };

  const openFolder = (folder) => {
    console.log(folder);
  setCurrentDirId(folder.id);
  setDirId(folder.raw._id);
  setBreadcrumbs(prev => [
    ...prev,
    { id: folder.raw._id, name: folder.name }
  ]);
};

function goToBreadcrumb(index) {
  const crumb = breadcrumbs[index];
  setDirId(crumb.id);
  setBreadcrumbs(breadcrumbs.slice(0, index + 1));
}


  

  const getFileIcon = (item) => {
    if (item.type === "folder")
      return <Folder className="w-5 h-5 text-amber-500" />;

    const iconMap = {
      pdf: "📄",
      docx: "📝",
      xlsx: "📊",
      pptx: "🎯",
      zip: "📦",
      folder: "📁",
    };
    return <span className="text-lg">{iconMap[item.icon] || "📄"}</span>;
  };

  async function getUserFiles() {
    let url;
    if (dirId) {
       url = `${BASE_URL}/owner/users/${dirId}/getUserFiles`;
    } else {
       url = `${BASE_URL}/owner/users/getUserFiles`;
    }
    try {
      const response = await fetch(url, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();
     const transformed = transformApiData(data);
     setItems(transformed);

      console.log("users files", data);
    } catch (err) {
      console.log("error getting files", err);
    }
  }

  useEffect(() => {
    getUserFiles();
  }, [dirId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-md text-[color:var(--muted-foreground)] hover:bg-[color:var(--secondary)] hover:text-[color:var(--foreground)] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-[color:var(--foreground)]">
            Files: {user.name}
          </h2>
          <p className="text-sm text-[color:var(--muted-foreground)]">
            {user.email}
          </p>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-[color:var(--muted-foreground)] pb-4 border-b border-[color:var(--border)]">
        {breadcrumbs.map((crumb, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {idx > 0 && <span>/</span>}
            <button
              onClick={() => goToBreadcrumb(idx)}
              className="hover:text-[color:var(--foreground)] transition-colors"
            >
              {crumb.name}
            </button>
          </div>
        ))}
      </div>

      {/* File List Card */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
            Contents
          </h3>
          <span className="text-xs text-[color:var(--muted-foreground)]">
            {items.length} items
          </span>
        </div>

        {items.length === 0 ? (
          <div className="py-12 text-center">
            <Folder className="w-12 h-12 text-[color:var(--muted-foreground)] opacity-50 mx-auto mb-2" />
            <p className="text-[color:var(--muted-foreground)]">
              This folder is empty
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[color:var(--border)]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[color:var(--muted-foreground)]">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[color:var(--muted-foreground)]">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[color:var(--muted-foreground)]">
                    Size
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[color:var(--muted-foreground)]">
                    Modified
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[color:var(--muted-foreground)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[color:var(--border)] hover:bg-[color:var(--secondary)] transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {getFileIcon(item)}
                        <button
                          onClick={() =>
                            item.type === "folder" && openFolder(item)
                          }
                          className={
                            item.type === "folder"
                              ? "hover:text-[color:var(--accent)] transition-colors"
                              : ""
                          }
                        >
                          <span className="font-medium text-[color:var(--foreground)]">
                            {item.name}
                          </span>
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[color:var(--foreground)] capitalize">
                      {item.type}
                    </td>
                    <td className="px-4 py-4 text-sm text-[color:var(--muted-foreground)]">
                      {item.size}
                    </td>
                    <td className="px-4 py-4 text-sm text-[color:var(--muted-foreground)]">
                      {item.modified}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2 relative">
                        <button
                          onClick={() => console.log("Download:", item.name)}
                          className="p-2 rounded-md text-[color:var(--muted-foreground)] hover:bg-[color:var(--accent)] hover:text-[color:var(--accent-foreground)] transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() =>
                            setShowMenu(showMenu === item.id ? null : item.id)
                          }
                          className="p-2 rounded-md text-[color:var(--muted-foreground)] hover:bg-[color:var(--secondary)] transition-colors"
                          title="More options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {showMenu === item.id && (
                          <div className="absolute right-0 top-full mt-1 z-10 bg-[color:var(--card)] border border-[color:var(--border)] rounded-md shadow-lg w-40">
                            <button
                              onClick={() => handleEditFile(item)}
                              className="w-full text-left px-4 py-2 text-sm text-[color:var(--foreground)] hover:bg-[color:var(--secondary)] flex items-center gap-2 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleRenameFile(item)}
                              className="w-full text-left px-4 py-2 text-sm text-[color:var(--foreground)] hover:bg-[color:var(--secondary)] flex items-center gap-2 transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                              Rename
                            </button>
                            <button
                              onClick={() => handleDeleteFile(item)}
                              className="w-full text-left px-4 py-2 text-sm text-[color:var(--destructive)] hover:bg-[color:var(--destructive)]/10 flex items-center gap-2 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-xs text-[color:var(--muted-foreground)]">
          <p>
            Owner has full file management permissions. All file changes are
            logged.
          </p>
        </div>
      </div>

      {/* Modals */}
      {showEditModal && selectedFile && (
        <EditFileModal
          file={selectedFile}
          onClose={() => setShowEditModal(false)}
          onConfirm={() => setShowEditModal(false)}
        />
      )}

      {showRenameModal && selectedFile && (
        <RenameFileModal
          file={selectedFile}
          onClose={() => setShowRenameModal(false)}
          onConfirm={confirmRename}
        />
      )}

      {showDeleteModal && selectedFile && (
        <DeleteFileModal
          file={selectedFile}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
