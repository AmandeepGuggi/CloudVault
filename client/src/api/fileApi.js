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