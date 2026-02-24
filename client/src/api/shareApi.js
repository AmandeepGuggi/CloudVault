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

export const validateShareEmail = async (email) => {
  const { data } = await axiosWithCreds.post("/file/share/validate-email", { email });
  return data;
};

export const inviteFileRecipient = async (fileId, email, permission) => {
  const { data } = await axiosWithCreds.post(`/file/share/${fileId}/invite`, {
    email,
    permission,
  });
  return data;
};

export const getFileRecipients = async (fileId) => {
  const { data } = await axiosWithCreds.get(`/file/share/${fileId}/recipients`);
  return data;
};

export const revokeFileRecipient = async (fileId, recipientId) => {
  const { data } = await axiosWithCreds.delete(`/file/share/${fileId}/recipient/${recipientId}`);
  return data;
};
