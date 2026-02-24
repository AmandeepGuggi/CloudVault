import { axiosWithCreds } from "./axiosInstances";

export const softDeleteFile = async (id) => {
  const { data } = await axiosWithCreds.patch(`/file/${id}/bin`);
  return data;
};
export const deleteFile = async (id) => {
  const { data } = await axiosWithCreds.delete(`/file/${id}`);
  return data;
};

export const renameFile = async (id, newFilename) => {
  const { data } = await axiosWithCreds.patch(`/file/${id}`, {
    newFilename,
  });
  return data;
};

export const uploadFileWithProgress = async (
  dirId,
  file,
  filename,
  onUploadProgress
) => {
  const { data } = await axiosWithCreds.post(`/file/${dirId || ""}`, file, {
    headers: {
      "Content-Type": file.type,
      filename,
    },
    onUploadProgress,
  });
  return data;
};

export const toggleFileStar = async (id) => {
  const { data } = await axiosWithCreds.patch(
    `/file/${id}/starred`
  );
  return data;
};

export const bulkMoveToBin = async ({ fileIds = [], directoryIds = [] }) => {
  const { data } = await axiosWithCreds.post("/file/bulk/bin", { fileIds, directoryIds });
  return data;
};

export const getBulkDownloadLinks = async ({ fileIds = [], directoryIds = [] }) => {
  const { data } = await axiosWithCreds.post("/file/bulk/download-links", { fileIds, directoryIds });
  return data;
};

export const downloadBulkZip = async ({ fileIds = [], directoryIds = [] }) => {
  const response = await axiosWithCreds.post(
    "/file/bulk/download-zip",
    { fileIds, directoryIds },
    { responseType: "blob" }
  );
  return response.data;
};

export const bulkRestoreFromBin = async ({ fileIds = [], directoryIds = [] }) => {
  const { data } = await axiosWithCreds.post("/file/bulk/restore", { fileIds, directoryIds });
  return data;
};

export const bulkDeleteForeverFromBin = async ({ fileIds = [], directoryIds = [] }) => {
  const { data } = await axiosWithCreds.post("/file/bulk/permanently-delete", { fileIds, directoryIds });
  return data;
};

export const bulkUnstarItems = async ({ fileIds = [], directoryIds = [] }) => {
  const { data } = await axiosWithCreds.post("/file/bulk/unstar", { fileIds, directoryIds });
  return data;
};
