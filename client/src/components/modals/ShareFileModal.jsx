import { useEffect, useState } from "react";
import { X, Copy, Check } from "lucide-react";
import { getFileIcon } from "../../utility";
import {
  createShareLink,
  getFileRecipients,
  getShareLink,
  inviteFileRecipient,
  revokeFileRecipient,
  revokeShareLink,
  validateShareEmail,
} from "../../api/shareApi";

export default function ShareFileModal({
  fileId,
  fileName,
  fileSize,
  onClose,
}) {
  const [emailInput, setEmailInput] = useState("");
  const [sharedUsers, setSharedUsers] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [selectedPermission, setSelectedPermission] = useState("viewer");
  const [loading, setLoading] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [linkEnabled, setLinkEnabled] = useState(false);
  const [shareableLink, setShareableLink] = useState("");
  const linkPermission = "view";
  const [copied, setCopied] = useState(false);
 
  const isAlreadyShared = (email) =>
    sharedUsers.some((user) => user.recipientEmail.toLowerCase() === email);

  const isAlreadySelected = (email) =>
    selectedRecipients.some((recipient) => recipient.email === email);

  const fetchSelectableRecipient = async (rawEmail) => {
    const email = String(rawEmail || "").trim().toLowerCase();
    if (!email) {
      return null;
    }

    const validation = await validateShareEmail(email);
    if (isAlreadyShared(email)) {
      throw new Error("This user already has access.");
    }

    if (isAlreadySelected(email)) {
      throw new Error("This user is already selected.");
    }

    if (!validation?.exists || !validation?.user) {
      return {
        _id: null,
        email,
        fullname: "",
        picture: "",
        isRegistered: false,
      };
    }

    return {
      _id: validation.user._id,
      email: validation.user.email,
      fullname: validation.user.fullname,
      picture: validation.user.picture || "",
      isRegistered: true,
    };
  };

  const handleSelectRecipient = async () => {
    try {
      setLoading(true);
      setFeedbackMessage("");
      const recipient = await fetchSelectableRecipient(emailInput);
      if (!recipient) return;
      setSelectedRecipients((prev) => [...prev, recipient]);
      setEmailInput("");
    } catch (error) {
      setFeedbackMessage(error.message || "Unable to validate email.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      setLoading(true);
      setFeedbackMessage("");

      let recipientsToInvite = [...selectedRecipients];
      if (emailInput.trim()) {
        const recipient = await fetchSelectableRecipient(emailInput);
        if (recipient) {
          recipientsToInvite = [...recipientsToInvite, recipient];
          setEmailInput("");
        }
      }

      if (!recipientsToInvite.length) {
        setFeedbackMessage("Select at least one user first.");
        return;
      }

      for (const recipient of recipientsToInvite) {
        await inviteFileRecipient(fileId, recipient.email, selectedPermission);
      }

      const recipientsData = await getFileRecipients(fileId);
      setSharedUsers(recipientsData.recipients || []);
      setSelectedRecipients([]);
      setFeedbackMessage(`Invite sent to ${recipientsToInvite.length} user(s).`);
    } catch (error) {
      setFeedbackMessage(
        error.response?.data?.error || error.message || "Failed to invite user."
      );
    } finally {
      setLoading(false);
    }
  };



const handleCreateShareLink = async () => {
  try {
    setLoading(true);

    const data = await createShareLink(fileId, linkPermission);

    setShareableLink(data.shareUrl);
    setLinkEnabled(true);

  } catch (error) {
    setFeedbackMessage(error.response?.data?.error || "Failed to create share link.");
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
    setFeedbackMessage(error.response?.data?.error || "Failed to revoke share link.");
  } finally {
    setLoading(false);
  }
};

  const removeSelectedRecipient = (email) => {
    setSelectedRecipients((prev) => prev.filter((recipient) => recipient.email !== email));
  };


  const handleRemoveUser = async (id) => {
    try {
      setLoading(true);
      await revokeFileRecipient(fileId, id);
      setSharedUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (error) {
      setFeedbackMessage(error.response?.data?.error || "Failed to remove user.");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = async (id, permission) => {
    const current = sharedUsers.find((u) => u._id === id);
    if (!current) return;

    try {
      setLoading(true);
      await inviteFileRecipient(fileId, current.recipientEmail, permission);
      const recipientsData = await getFileRecipients(fileId);
      setSharedUsers(recipientsData.recipients || []);
    } catch (error) {
      setFeedbackMessage(error.response?.data?.error || "Failed to update permission.");
    } finally {
      setLoading(false);
    }
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
    if (!result.exists) {
      setLinkEnabled(false);
      setShareableLink("");
      return;
    }

    setLinkEnabled(true);
    setShareableLink(result.shareUrl);

  } catch (error) {
    setFeedbackMessage(error.response?.data?.error || "Failed to fetch share link.");
  } finally {
    setLoading(false);
  }
};

const loadRecipients = async () => {
  try {
    const recipientsData = await getFileRecipients(fileId);
    setSharedUsers(recipientsData.recipients || []);
  } catch {
    setSharedUsers([]);
  }
};

handleGetExistingLink();
loadRecipients();

}, [fileId]);



  const copyLink = async () => {
    await navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

 

  return (
    <div className="fixed inset-0 z-50   flex items-center justify-center bg-black/50 p-4">
        

      {/* <div className="w-full max-w-md rounded-lg bg-white shadow-lg overflow-hidden"> */}
      <div className="relative flex h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-lg bg-white shadow-lg">
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
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
          {feedbackMessage && (
            <p className="rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-700">
              {feedbackMessage}
            </p>
          )}
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSelectRecipient();
                  }
                }}
                placeholder="Enter email"
                className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSelectRecipient}
                className="rounded-md border border-slate-300 px-3 text-sm hover:bg-slate-50"
              >
                Select
              </button>
              <button
                onClick={handleAddUser}
                className="rounded-md bg-blue-600 px-4 text-sm text-white hover:bg-blue-700 disabled:bg-blue-300"
                disabled={!selectedRecipients.length && !emailInput.trim()}
              >
                Add
              </button>
            </div>
            {selectedRecipients.length > 0 && (
              <div className="mt-3 max-h-24 overflow-y-auto pr-1">
                <div className="flex flex-wrap gap-2">
                {selectedRecipients.map((recipient) => (
                  <div
                    key={recipient.email}
                    className="inline-flex items-center gap-2 rounded-full border bg-slate-50 px-2 py-1"
                  >
                    {recipient.picture ? (
                      <img
                        src={recipient.picture}
                        alt={recipient.fullname || recipient.email}
                        className="h-5 w-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-300 text-[10px] font-semibold text-slate-700">
                        {(recipient.fullname || recipient.email).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="max-w-[160px] truncate text-xs text-slate-700">
                      {recipient.email}
                    </span>
                    {!recipient.isRegistered && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">
                        invite-only
                      </span>
                    )}
                    <button
                      onClick={() => removeSelectedRecipient(recipient.email)}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                </div>
              </div>
            )}
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
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">

                {sharedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex justify-between items-center rounded-md bg-slate-50 p-3"
                  >
                    <span className="truncate text-sm">
                      {user.recipientUser?.fullname
                        ? `${user.recipientUser.fullname} (${user.recipientEmail})`
                        : user.recipientEmail}
                    </span>
                    <div className="flex gap-2">
                      <select
                        value={user.permission}
                        onChange={(e) =>
                          handlePermissionChange(user._id, e.target.value)
                        }
                        className="rounded-md border px-2 py-1 text-sm"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="commenter">Commenter</option>
                        <option value="editor">Editor</option>
                      </select>
                      <button onClick={() => handleRemoveUser(user._id)}>
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
