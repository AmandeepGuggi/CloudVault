import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function NameModal({
  onClose,
  onSubmit,
  initialName,
  title,
  setNewName,
}) {
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  useEffect(() => {
    if (!inputRef.current) return;

    inputRef.current.focus();
    inputRef.current.select();
  }, []);
  const isDisabled = !initialName.trim();

  // console.log(existingNames);
  useEffect(() => {
    function handleOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    }

    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-99 flex items-center justify-center bg-black/30">
      <div ref={modalRef} className="w-96 rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-medium mb-4">{title}</h2>

        <form onSubmit={onSubmit}>
          <input
            ref={inputRef}
            value={initialName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Untitled"
            className="w-full rounded-md border px-3 py-2 outline-blue-500"
          />

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              onClick={onSubmit}
              disabled={isDisabled}
              // className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              className={`rounded-full px-4 py-2 text-sm text-white
    ${
      isDisabled
        ? "bg-blue-300 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700"
    }`}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}
