import { axiosWithCreds, axiosWithoutCreds } from "./axiosInstances";

export const getNotifications = async () => {
  const { data } = await axiosWithCreds.get("/auth/notifications");
  return data;
};
export const readNotification = async () => {
  const { data } = await axiosWithCreds.post("/auth/notifications/seen");
  return data;
};

