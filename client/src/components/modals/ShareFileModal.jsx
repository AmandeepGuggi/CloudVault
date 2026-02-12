import { useEffect, useState } from "react";
import { X, FileText, Copy, Check } from "lucide-react";
import { BASE_URL, getFileIcon } from "../../utility";
import { createShareLink, getShareLink, revokeShareLink } from "../../api/shareApi";

export default function ShareFileModal({
  fileId,
  fileName,
  fileSize,
  onClose,
}) {
  const [emailInput, setEmailInput] = useState("");
  const [sharedUsers, setSharedUsers] = useState([]);
  const [selectedPermission, setSelectedPermission] = useState("viewer");
  const [loading, setLoading] = useState(false)
  const [linkEnabled, setLinkEnabled] = useState(false);
  const [shareableLink, setShareableLink] = useState("");
  const [linkPermission, setLinkPermission] = useState("view");
  const [copied, setCopied] = useState(false);
 


  const handleAddUser = () => {
    if (!emailInput.trim()) return;

    setSharedUsers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        email: emailInput.trim(),
        permission: selectedPermission,
      },
    ]);

    setEmailInput("");
  };



const handleCreateShareLink = async () => {
  try {
    setLoading(true);

    const data = await createShareLink(fileId, linkPermission);

    setShareableLink(data.shareUrl);
    setLinkEnabled(true);

  } catch (error) {
    console.error(error.response?.data?.error || error.message);
  } finally {
    setLoading(false);
  }
};



const handleRevokeShareLink = async () => {
  try {
    setLoading(true);
    await revokeShareLink(fileId);
    setShareableLink("");
    setLinkEnabled(false);

  } catch (error) {
    console.error(error.response?.data?.error || error.message);
  } finally {
    setLoading(false);
  }
};


  const handleRemoveUser = (id) => {
    setSharedUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handlePermissionChange = (id, permission) => {
    setSharedUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, permission } : u))
    );
  };
  const toggleLink = () => {
  
  if (!linkEnabled) {
    handleCreateShareLink();
  } else {
    handleRevokeShareLink();
  }
};

useEffect(() => {
 
const handleGetExistingLink = async () => {
  try {
    setLoading(true);

    const result = await getShareLink(fileId);
   console.log(result);
    if (!result.exists) {
      setLinkEnabled(false);
      setShareableLink("");
      return;
    }

    setLinkEnabled(true);
    setShareableLink(result.shareUrl);

  } catch (error) {
    console.error(error.response?.data?.error || error.message);
  } finally {
    setLoading(false);
  }
};

handleGetExistingLink()

}, [fileId]);



  const copyLink = async () => {
    await navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

 

  return (
    <div className="fixed inset-0 z-50   flex items-center justify-center bg-black/50 p-4">
        

      {/* <div className="w-full max-w-md rounded-lg bg-white shadow-lg overflow-hidden"> */}
      <div className="relative w-full max-w-md max-h-[90vh] rounded-lg bg-white shadow-lg flex flex-col">
    {loading && (
  <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-50">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
  </div>
)}


        {/* Header */}
        <div className="flex justify-between items-start border-b p-5">
          <div className="flex gap-3">
            {/* {getFileIcon()} */}
            <img src={getFileIcon(fileName)} alt="" />
            <div>
              <h2 className="font-semibold text-slate-900 truncate">
                {fileName}
              </h2>
              <p className="text-sm text-slate-500">
                {fileSize} 
              </p>
            </div>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-500 hover:text-slate-700" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6">
          {/* Add people */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Add people
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
                placeholder="Enter email"
                className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddUser}
                className="rounded-md bg-blue-600 px-4 text-sm text-white hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Permission selector */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Permission
            </label>
            <select
              value={selectedPermission}
              onChange={(e) => setSelectedPermission(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="viewer">Viewer (can view)</option>
              <option value="commenter">Commenter</option>
              <option value="editor">Editor</option>
            </select>
          </div>

          {/* Link sharing */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">Get shareable link</span>
              <button
                onClick={toggleLink}
                className={`w-11 h-6 rounded-full relative transition ${
                  linkEnabled ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                    linkEnabled ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            {linkEnabled && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={shareableLink}
                    className="flex-1 rounded-md border bg-slate-50 px-3 py-2 text-sm"
                  />
                  <button
                    onClick={copyLink}
                    className="rounded-md border px-3"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                    <div onClick={handleRevokeShareLink} className="w-full text-center bg-green-700 cursor-pointer text-white rounded-md border px-3 py-2 text-sm">
                        Revoke access
                    </div>
              </div>
            )}
          </div>

          {/* Shared users */}
          {sharedUsers.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-2">
                People with access
              </h3>
              {/* <div className="space-y-2 overflow-scroll"> */}
              <div className="space-y-2 max-h-28 overflow-y-auto pr-1">

                {sharedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex justify-between items-center rounded-md bg-slate-50 p-3"
                  >
                    <span className="truncate text-sm">
                      {user.email}
                    </span>
                    <div className="flex gap-2">
                      <select
                        value={user.permission}
                        onChange={(e) =>
                          handlePermissionChange(user.id, e.target.value)
                        }
                        className="rounded-md border px-2 py-1 text-sm"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="commenter">Commenter</option>
                        <option value="editor">Editor</option>
                      </select>
                      <button onClick={() => handleRemoveUser(user.id)}>
                        <X className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t bg-slate-50 p-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-md border py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-md bg-blue-600 py-2 text-sm text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
