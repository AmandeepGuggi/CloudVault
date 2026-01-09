import { useEffect, useMemo, useState } from "react";
import { BASE_URL, getFileIcon, formatBytes } from "../utility";
import { FaFolder, FaTrashRestore } from "react-icons/fa";
import { Trash2, LayoutGrid, List } from "lucide-react";

export default function Bin() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);


  async function fetchBin() {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/file/bin`, {
        credentials: "include",
      });
      const foldersRes = await fetch(`${BASE_URL}/directory/bin`, {
  credentials: "include",
});
const foldersData = await foldersRes.json();

setFolders(
  foldersData.map(d => ({
    ...d,
    isDirectory: true,
  }))
);


      if (!res.ok) throw new Error("Failed to fetch bin");

      const data = await res.json();
      setFiles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function restoreFolder(id) {
  await fetch(`${BASE_URL}/directory/${id}/restore`, {
    method: "PATCH",
    credentials: "include",
  });

 fetchBin()
}


  useEffect(() => {
    fetchBin();
  }, []);

  async function restoreFile(id) {
  await fetch(`${BASE_URL}/file/${id}/restore`, {
    method: "PATCH",
    credentials: "include",
  });
fetchBin()
  // setFiles(prev => prev.filter(f => f._id !== id));
}

async function deleteForever() {
  if (!confirmDeleteId) return;

  const { id, type } = confirmDeleteId;

  try {
    const url =
      type === "file"
        ? `${BASE_URL}/file/${id}/permanently`
        : `${BASE_URL}/directory/${id}/permanently`;

    await fetch(url, {
      method: "DELETE",
      credentials: "include",
    });

    fetchBin(); // refresh bin
    setConfirmDeleteId(null);
  } catch (err) {
    setError("Failed to delete permanently");
  }
}



if (loading) return <p className="p-4">Loading bin…</p>;
if (error) return <p className="p-4 text-red-500">{error}</p>;

return (
  <div className="">
    <div className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
  Items in bin will be <span className="font-medium">automatically deleted after 10 days</span>.
  <p className="text-[10px] ">You can restore items within this period using the restore option</p>
</div>
   <div className="px-4 pb-20">
     <div className="flex justify-between mb-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-700">Bin</h1>
        <p className="text-sm text-gray-400">{files.length} items</p>
      </div>
      
      <div className="flex bg-gray-100 p-1 rounded transform ">
        
        <button
          onClick={() => setView("grid")}
          className={`p-2 ${view === "grid" && "bg-blue-primary rounded text-white"}`}
        >
          <LayoutGrid size={18} />
        </button>
        <button
          onClick={() => setView("list")}
          className={`p-2 ${view === "list" && "bg-blue-primary rounded text-white"}`}
        >
          <List size={18} />
        </button>
      </div>
    </div>

  {files.length === 0 && folders.length === 0 && (
      <p className="text-gray-400 text-sm">Bin is empty</p>
    )}

    {view === "list" && (
      <div className="grid gap-3">
        {folders.map(folder => (
          <div
            key={folder._id}
            className="border border-gray-300 rounded-lg p-4 flex justify-between items-center"
          >
            <div className="flex items-center gap-3 truncate">
              <FaFolder className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-sm truncate">{folder.name}</p>
                
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FaTrashRestore
                onClick={() => restoreFolder(folder._id)}
                className="text-green-600 h-5 cursor-pointer"
              />
              <Trash2
                // onClick={() => deleteForever(file._id)}
                 onClick={() => setConfirmDeleteId({id: folder._id, type: "folder"})}
                className="text-red-600 cursor-pointer"
              />
            </div>
          </div>
        ))}
      </div>
    )}

    {view === "list" && (
      <div className="grid gap-3">
        {files.map(file => (
          <div
            key={file._id}
            className="border border-gray-300 rounded-lg p-4 flex justify-between items-center"
          >
            <div className="flex items-center gap-3 truncate">
              <img src={getFileIcon(file.name)} className="w-8" />
              <div>
                <p className="text-sm truncate">{file.name}</p>
                <p className="text-xs text-gray-400">
                  {formatBytes(file.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FaTrashRestore
                onClick={() => restoreFile(file._id)}
                className="text-green-600 h-5 cursor-pointer"
              />
              <Trash2
                // onClick={() => deleteForever(file._id)}
                 onClick={() => setConfirmDeleteId({ id: file._id, type: "file" })}
                className="text-red-600 cursor-pointer"
              />
            </div>
          </div>
        ))}
      </div>
    )}

    {confirmDeleteId && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-80 shadow-xl">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        Delete permanently?
      </h2>

      <p className="text-sm text-gray-500 mb-4">
        This action is <span className="font-semibold text-red-600">irreversible</span>.
        The file will be permanently removed and cannot be recovered.
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setConfirmDeleteId(null)}
          className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          onClick={ () => deleteForever(confirmDeleteId) }
          className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
        >
          Delete forever
        </button>
      </div>
    </div>
  </div>
)}
   </div>

  </div>
  
)}
