import { axiosWithCreds } from "./axiosInstances";

export const createShareLink = async (fileId, permission) => {
  const { data } = await axiosWithCreds.post(
    `/file/share/${fileId}`,
    { permission }
  );
  return data;
};

export const revokeShareLink = async (fileId) => {
  const { data } = await axiosWithCreds.delete(
    `/file/revoke/${fileId}`
  );
  return data;
};

export const getShareLink = async (fileId) => {
  try {
    const response = await axiosWithCreds.get(
      `/file/share/${fileId}`
    );

    return {
      exists: true,
      shareUrl: response.data.shareUrl,
    };

  } catch (error) {
    if (
      error.response?.status === 404 ||
      error.response?.status === 204
    ) {
      return { exists: false };
    }

    throw error;
  }
};
