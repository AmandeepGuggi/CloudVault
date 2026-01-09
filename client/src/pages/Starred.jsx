import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL, getFileIcon, formatBytes } from "../utility";
import { FaFolder, FaStar } from "react-icons/fa";
import { LayoutGrid, List } from "lucide-react";

export default function Starred() {
  const navigate = useNavigate();

  const [view, setView] = useState("list");
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

    async function toggleStar(id, type) {
  const url =
    type === true
      ? `${BASE_URL}/directory/${id}/starred`
      : `${BASE_URL}/file/${id}/starred`;

  try {
    const res = await fetch(url, {
      method: "PATCH",
      credentials: "include",
    });

    const data = await res.json();
    if (type === undefined) {
      setFiles(prev =>
        prev.map(f =>
          f.id === id ? { ...f, isStarred: data.isStarred } : f
        )
      );
    } else {
      setFolders(prev =>
        prev.map(d =>
          d.id === id ? { ...d, isStarred: data.isStarred } : d
        )
      );
    }
    fetchStarred()
  } catch (err) {
    console.error("Failed to toggle star", err);
  }
}
  async function fetchStarred() {
      try {
        setLoading(true);


const filesRes = await fetch(`${BASE_URL}/file/starred`, { credentials: "include" });
const foldersRes = await fetch(`${BASE_URL}/directory/starred`, { credentials: "include" });


        if (!filesRes.ok || !foldersRes.ok) {
          throw new Error("Failed to fetch starred items");
        }

        const filesData = await filesRes.json();
        const foldersData = await foldersRes.json();

        setFiles(
          filesData.map(f => ({
            ...f,
            isDirectory: false,
            isStarred: true,
          }))
        );

        setFolders(
          foldersData.map(d => ({
            ...d,
            isDirectory: true,
            isStarred: true,
          }))
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

  // fetch starred items
  useEffect(() => {
    fetchStarred();
  }, []);

  const items = useMemo(() => {
    return [...folders, ...files];
  }, [folders, files]);

  function openItem(item) {
    if (item.isDirectory) {
      navigate(`/app/${item._id}`);
    } else {
      window.location.href = `${BASE_URL}/file/${item._id}`;
    }
  }

  if (loading) {
    return <p className="p-4 text-gray-500">Loading starred items…</p>;
  }

  if (error) {
    return <p className="p-4 text-red-500">{error}</p>;
  }

  return (
    <div className="px-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-700">Starred</h1>
          <p className="text-sm text-gray-400">{items.length} items</p>
        </div>

        {/* View toggle */}
        <div className="flex bg-gray-100 rounded-md p-1">
          <button
            onClick={() => setView("grid")}
            className={`p-2 rounded ${
              view === "grid" ? "bg-blue-primary text-white" : ""
            }`}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded ${
              view === "list" ? "bg-blue-primary text-white" : ""
            }`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <p className="text-gray-400 text-sm">No starred items</p>
      )}

      {/* LIST VIEW */}
      {view === "list" && (
        <div className="grid gap-3">
          {items.map(item => (
            <div
              key={item._id}
              onClick={() => openItem(item)}
              className="border border-gray-300 rounded-lg p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-center gap-2 truncate">
                {item.isDirectory ? (
                  <FaFolder className="text-3xl text-blue-400" />
                ) : (
                  <img
                    src={getFileIcon(item.name)}
                    className="w-9"
                    alt=""
                  />
                )}

                <div className="truncate">
                  <p className="text-sm truncate">{item.name}</p>
                  {!item.isDirectory && (
                    <p className="text-xs text-gray-400">
                      {formatBytes(item.size)}
                    </p>
                  )}
                </div>
              </div>

              <FaStar
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStar(item._id, item.isDirectory);
                }}
                className="text-yellow-400 cursor-pointer"
              />
            </div>
          ))}
        </div>
      )}

      {/* GRID VIEW */}
      {view === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map(item => (
            <div
              key={item._id}
              onClick={() => openItem(item)}
              className="border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
            >
              <div className="flex justify-between items-start mb-3">
                {item.isDirectory ? (
                  <FaFolder className="text-4xl text-blue-400" />
                ) : (
                  <img
                    src={getFileIcon(item.name)}
                    className="w-10"
                    alt=""
                  />
                )}

                <FaStar
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(item);
                  }}
                  className="text-yellow-400 cursor-pointer"
                />
              </div>

              <p className="text-sm truncate">{item.name}</p>
              {!item.isDirectory && (
                <p className="text-xs text-gray-400">
                  {formatBytes(item.size)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
