import { useState } from "react";
import {
  X,
  FileText,
  Copy,
  Check,
} from "lucide-react";

export default function ShareFileModal({
  fileName,
  fileSize,
  filePath,
  fileType = "document",
  onClose,
}) {
  const [emailInput, setEmailInput] = useState("");
  const [sharedUsers, setSharedUsers] = useState([]);
  const [selectedPermission, setSelectedPermission] = useState("viewer");
  const [shareableLink, setShareableLink] = useState("");
  const [linkEnabled, setLinkEnabled] = useState(false);
  const [linkPermission, setLinkPermission] = useState("view");
  const [copied, setCopied] = useState(false);

  const getFileIcon = () => {
    if (fileType === "pdf") return <span className="text-red-500 font-bold">PDF</span>;
    if (fileType === "image") return <span>🖼️</span>;
    if (fileType === "video") return <span>▶️</span>;
    return <FileText className="w-5 h-5 text-slate-600" />;
  };

  const handleAddUser = () => {
    if (!emailInput.trim()) return;

    setSharedUsers([
      ...sharedUsers,
      {
        id: crypto.randomUUID(),
        email: emailInput.trim(),
        permission: selectedPermission,
      },
    ]);
    setEmailInput("");
  };

  const handleRemoveUser = (id) => {
    setSharedUsers(sharedUsers.filter(u => u.id !== id));
  };

  const handlePermissionChange = (id, permission) => {
    setSharedUsers(
      sharedUsers.map(u =>
        u.id === id ? { ...u, permission } : u
      )
    );
  };

  const toggleLink = () => {
    if (!linkEnabled) {
      setShareableLink(
        `https://share.cloudvault.com/${crypto.randomUUID()}`
      );
    }
    setLinkEnabled(!linkEnabled);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-lg">

        {/* Header */}
        <div className="flex justify-between items-start p-5 border-b">
          <div className="flex gap-3">
            {getFileIcon()}
            <div>
              <h2 className="font-semibold truncate">{fileName}</h2>
              <p className="text-xs text-slate-500">
                {fileSize} • {filePath}
              </p>
            </div>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">

          {/* Add people */}
          <div>
            <label className="text-sm font-medium">Add people</label>
            <div className="flex gap-2 mt-2">
              <input
                type="email"
                className="flex-1 border rounded px-3 py-2 text-sm"
                placeholder="Enter email"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddUser()}
              />
              <button
                onClick={handleAddUser}
                className="bg-blue-600 text-white px-4 rounded text-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* Permission */}
          <div>
            <label className="text-sm font-medium">Permission</label>
            <select
              value={selectedPermission}
              onChange={e => setSelectedPermission(e.target.value)}
              className="w-full mt-2 border rounded px-3 py-2 text-sm"
            >
              <option value="viewer">Viewer</option>
              <option value="commenter">Commenter</option>
              <option value="editor">Editor</option>
            </select>
          </div>

          {/* Link sharing */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Get shareable link</span>
              <button
                onClick={toggleLink}
                className={`w-11 h-6 rounded-full relative ${
                  linkEnabled ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute w-4 h-4 bg-white rounded-full top-1 transition ${
                    linkEnabled ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            {linkEnabled && (
              <div className="mt-3 space-y-2">
                <div className="flex gap-2">
                  <input
                    value={shareableLink}
                    readOnly
                    className="flex-1 border rounded px-3 py-2 text-sm bg-slate-50"
                  />
                  <button
                    onClick={copyLink}
                    className="border px-3 rounded"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>

                <select
                  value={linkPermission}
                  onChange={e => setLinkPermission(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="view">View</option>
                  <option value="edit">Edit</option>
                </select>
              </div>
            )}
          </div>

          {/* Shared users */}
          {sharedUsers.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-2">
                People with access
              </h3>
              <div className="space-y-2">
                {sharedUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex justify-between items-center bg-slate-50 p-3 rounded"
                  >
                    <span className="text-sm truncate">{user.email}</span>
                    <div className="flex gap-2">
                      <select
                        value={user.permission}
                        onChange={e =>
                          handlePermissionChange(user.id, e.target.value)
                        }
                        className="border rounded px-2 text-sm"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="commenter">Commenter</option>
                        <option value="editor">Editor</option>
                      </select>
                      <button onClick={() => handleRemoveUser(user.id)}>
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t bg-slate-50">
          <button
            onClick={onClose}
            className="flex-1 border rounded py-2"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-blue-600 text-white rounded py-2"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
