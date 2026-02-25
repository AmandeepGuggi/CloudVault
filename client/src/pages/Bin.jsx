import { useEffect, useMemo, useState } from "react";
import { BASE_URL, getFileIcon, formatBytes } from "../utility";
import { FaFolder, FaTrashRestore } from "react-icons/fa";
import { Trash2 } from "lucide-react";
import { bulkDeleteForeverFromBin, bulkRestoreFromBin } from "../api/fileApi";

export default function Bin() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState({});
  const [confirmState, setConfirmState] = useState(null);

  const items = useMemo(
    () => [
      ...folders.map((folder) => ({
        ...folder,
        id: folder._id,
        type: "folder",
      })),
      ...files.map((file) => ({
        ...file,
        id: file._id,
        type: "file",
      })),
    ],
    [folders, files]
  );

  const selectedKeys = Object.keys(selected);
  const selectedCount = selectedKeys.length;

  const getItemKey = (item) => `${item.type}:${item.id}`;

  async function fetchBin() {
    try {
      setLoading(true);
      setError("");

      const [filesRes, foldersRes] = await Promise.all([
        fetch(`${BASE_URL}/file/bin`, { credentials: "include" }),
        fetch(`${BASE_URL}/directory/bin`, { credentials: "include" }),
      ]);

      if (!filesRes.ok || !foldersRes.ok) {
        throw new Error("Failed to fetch bin items");
      }

      const [filesData, foldersData] = await Promise.all([
        filesRes.json(),
        foldersRes.json(),
      ]);

      setFiles(filesData || []);
      setFolders(foldersData || []);
    } catch (err) {
      setError(err.message || "Failed to fetch bin items");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBin();
  }, []);

  function toggleSelect(item) {
    const key = getItemKey(item);
    setSelected((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = { id: item.id, type: item.type };
      return next;
    });
  }

  function selectAll() {
    const next = {};
    for (const item of items) {
      next[getItemKey(item)] = { id: item.id, type: item.type };
    }
    setSelected(next);
  }

  function clearSelection() {
    setSelected({});
  }

  function getSelectedPayload() {
    const fileIds = [];
    const directoryIds = [];
    for (const { id, type } of Object.values(selected)) {
      if (type === "file") fileIds.push(id);
      else directoryIds.push(id);
    }
    return { fileIds, directoryIds };
  }

  async function restoreOne(id, type) {
    const url =
      type === "file"
        ? `${BASE_URL}/file/${id}/restore`
        : `${BASE_URL}/directory/${id}/restore`;

    await fetch(url, {
      method: "PATCH",
      credentials: "include",
    });

    await fetchBin();
    setSelected((prev) => {
      const copy = { ...prev };
      delete copy[`${type}:${id}`];
      return copy;
    });
  }

  async function deleteForeverOne(id, type) {
    const url =
      type === "file"
        ? `${BASE_URL}/file/${id}/permanently`
        : `${BASE_URL}/directory/${id}/permanently`;

    await fetch(url, {
      method: "DELETE",
      credentials: "include",
    });

    await fetchBin();
    setSelected((prev) => {
      const copy = { ...prev };
      delete copy[`${type}:${id}`];
      return copy;
    });
  }

  async function restoreSelected() {
    if (!selectedCount) return;

    try {
      await bulkRestoreFromBin(getSelectedPayload());
      clearSelection();
      await fetchBin();
    } catch {
      setError("Failed to restore selected items");
    }
  }

  async function deleteSelectedForever() {
    if (!selectedCount) return;

    try {
      await bulkDeleteForeverFromBin(getSelectedPayload());
      clearSelection();
      await fetchBin();
    } catch {
      setError("Failed to delete selected items");
    }
  }

  if (loading) return <p className="p-4">Loading bin...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="px-3 pb-20 md:pb-4">
      <div className="mb-3 rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-xs text-yellow-800">
        Items in bin are auto-deleted after <span className="font-semibold">10 days</span>.
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-700">Bin</h1>
          <p className="text-xs text-gray-500">{items.length} items</p>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded border border-blue-200 bg-blue-50 px-3 py-2">
          <span className="text-sm font-medium text-blue-900">{selectedCount} selected</span>
          <button
            onClick={selectAll}
            className="rounded bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
          >
            Select all
          </button>
          <button
            onClick={restoreSelected}
            className="rounded bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
          >
            Restore selected
          </button>
          <button
            onClick={() => setConfirmState({ mode: "bulk" })}
            className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
          >
            Delete forever
          </button>
          <button
            onClick={clearSelection}
            className="rounded bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
          >
            Clear
          </button>
        </div>
      )}

      {items.length === 0 && <p className="text-sm text-gray-400">Bin is empty</p>}

      <div className="space-y-2">
        {items.map((item) => {
          const key = getItemKey(item);
          const checked = Boolean(selected[key]);

          return (
            <div
              key={key}
              className="flex items-center justify-between rounded-md border border-gray-300 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSelect(item)}
                />

                {item.type === "folder" ? (
                  <FaFolder className="h-5 w-5 shrink-0 text-blue-400" />
                ) : (
                  <img src={getFileIcon(item.name)} className="w-5 shrink-0" />
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm text-gray-700">{item.name}</p>
                  <p className="text-[11px] text-gray-400">
                    {item.type === "folder"
                      ? formatBytes(Number(item.totalSize || 0))
                      : formatBytes(item.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaTrashRestore
                  onClick={() => restoreOne(item.id, item.type)}
                  className="h-4 cursor-pointer text-green-600"
                />
                <Trash2
                  onClick={() => setConfirmState({ mode: "single", item })}
                  className="h-4 w-4 cursor-pointer text-red-600"
                />
              </div>
            </div>
          );
        })}
      </div>

      {confirmState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-80 rounded-lg bg-white p-5 shadow-xl">
            <h2 className="mb-2 text-lg font-semibold text-gray-800">Delete permanently?</h2>
            <p className="mb-4 text-sm text-gray-500">
              {confirmState.mode === "bulk"
                ? `This will permanently delete ${selectedCount} selected item(s).`
                : `This will permanently delete ${confirmState.item.name}.`}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmState(null)}
                className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (confirmState.mode === "bulk") {
                    await deleteSelectedForever();
                  } else {
                    await deleteForeverOne(confirmState.item.id, confirmState.item.type);
                  }
                  setConfirmState(null);
                }}
                className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Delete forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
