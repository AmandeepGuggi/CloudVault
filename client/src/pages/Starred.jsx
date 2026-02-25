import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL, getFileIcon, formatBytes } from "../utility";
import { FaFolder, FaStar } from "react-icons/fa";
import { bulkUnstarItems } from "../api/fileApi";

export default function Starred() {
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState({});

  const items = useMemo(
    () => [
      ...folders.map((folder) => ({
        ...folder,
        id: folder._id,
        isDirectory: true,
      })),
      ...files.map((file) => ({
        ...file,
        id: file._id,
        isDirectory: false,
      })),
    ],
    [folders, files]
  );

  const selectedCount = Object.keys(selected).length;

  function itemKey(item) {
    return `${item.isDirectory ? "directory" : "file"}:${item.id}`;
  }

  function getSelectedPayload() {
    const fileIds = [];
    const directoryIds = [];

    for (const entry of Object.values(selected)) {
      if (entry.type === "directory") directoryIds.push(entry.id);
      else fileIds.push(entry.id);
    }

    return { fileIds, directoryIds };
  }

  async function fetchStarred() {
    try {
      setLoading(true);
      setError("");

      const [filesRes, foldersRes] = await Promise.all([
        fetch(`${BASE_URL}/file/starred`, { credentials: "include" }),
        fetch(`${BASE_URL}/directory/starred`, { credentials: "include" }),
      ]);

      if (!filesRes.ok || !foldersRes.ok) {
        throw new Error("Failed to fetch starred items");
      }

      const [filesData, foldersData] = await Promise.all([
        filesRes.json(),
        foldersRes.json(),
      ]);

      setFiles(filesData || []);
      setFolders(foldersData || []);
    } catch (err) {
      setError(err.message || "Failed to fetch starred items");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStarred();
  }, []);

  function openItem(item) {
    if (item.isDirectory) {
      navigate(`/app/${item.id}`);
    } else {
      window.location.href = `${BASE_URL}/file/${item.id}`;
    }
  }

  function toggleSelect(item) {
    const key = itemKey(item);
    setSelected((prev) => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = {
          id: item.id,
          type: item.isDirectory ? "directory" : "file",
        };
      }
      return next;
    });
  }

  function selectAll() {
    const next = {};
    for (const item of items) {
      next[itemKey(item)] = {
        id: item.id,
        type: item.isDirectory ? "directory" : "file",
      };
    }
    setSelected(next);
  }

  function clearSelection() {
    setSelected({});
  }

  async function unstarSingle(item) {
    const payload = item.isDirectory
      ? { fileIds: [], directoryIds: [item.id] }
      : { fileIds: [item.id], directoryIds: [] };

    try {
      await bulkUnstarItems(payload);
      setSelected((prev) => {
        const next = { ...prev };
        delete next[itemKey(item)];
        return next;
      });
      await fetchStarred();
    } catch {
      setError("Failed to unstar item");
    }
  }

  async function unstarSelected() {
    if (!selectedCount) return;

    try {
      await bulkUnstarItems(getSelectedPayload());
      clearSelection();
      await fetchStarred();
    } catch {
      setError("Failed to unstar selected items");
    }
  }

  if (loading) return <p className="p-4 text-gray-500">Loading starred items...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="px-3 pb-20 md:pb-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-700">Starred</h1>
          <p className="text-xs text-gray-500">{items.length} items</p>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded border border-yellow-200 bg-yellow-50 px-3 py-2">
          <span className="text-sm font-medium text-yellow-900">{selectedCount} selected</span>
          <button
            onClick={selectAll}
            className="rounded bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
          >
            Select all
          </button>
          <button
            onClick={unstarSelected}
            className="rounded bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
          >
            Unstar selected
          </button>
          <button
            onClick={clearSelection}
            className="rounded bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
          >
            Clear
          </button>
        </div>
      )}

      {items.length === 0 && <p className="text-sm text-gray-400">No starred items</p>}

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => openItem(item)}
            className="flex cursor-pointer items-center justify-between rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50"
          >
            <div className="flex min-w-0 items-center gap-2">
              <input
                type="checkbox"
                checked={Boolean(selected[itemKey(item)])}
                onClick={(e) => e.stopPropagation()}
                onChange={() => toggleSelect(item)}
              />

              {item.isDirectory ? (
                <FaFolder className="h-5 w-5 shrink-0 text-blue-400" />
              ) : (
                <img src={getFileIcon(item.name)} className="w-5 shrink-0" alt="" />
              )}

              <div className="min-w-0">
                <p className="truncate text-sm text-gray-700">{item.name}</p>
                <p className="text-[11px] text-gray-400">
                  {item.isDirectory
                    ? formatBytes(Number(item.totalSize || 0))
                    : formatBytes(item.size)}
                </p>
              </div>
            </div>

            <FaStar
              onClick={(e) => {
                e.stopPropagation();
                unstarSingle(item);
              }}
              className="cursor-pointer text-yellow-400"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
