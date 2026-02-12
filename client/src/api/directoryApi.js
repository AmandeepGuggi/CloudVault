import { axiosWithCreds } from "./axiosInstances";

export const getDirectory = async (dirId = "") => {
  const {data} = await axiosWithCreds.get(`/directory/${dirId}`);

  return data;
};

export const createDirectory = async (dirId = "", newDirname) => {
  const { data } = await axiosWithCreds.post(
    `/directory/${dirId}`,
    {},
    { headers: { dirname: newDirname } }
  );
  return data;
};

export const deleteDirectory = async (id) => {
  const { data } = await axiosWithCreds.delete(`/directory/${id}`);
  return data;
};

export const softDeleteDirectory = async (id) => {
  const { data } = await axiosWithCreds.patch(`/directory/${id}/bin`);
  return data;
};

export const renameDirectory = async (id, newDirName) => {
  const { data } = await axiosWithCreds.patch(`/directory/${id}`, 
    { newDirName },
    { headers: { "Content-Type": "application/json" } }
);
  return data;
};

export const getBreadcrumbs = async (id) => {
  const data  = await axiosWithCreds.get(`/directory/${id}/breadcrumbs`);
  return data;
};

export const toggleDirectoryStar = async (id) => {
  const { data } = await axiosWithCreds.patch(
    `/directory/${id}/starred`
  );
  return data;
};