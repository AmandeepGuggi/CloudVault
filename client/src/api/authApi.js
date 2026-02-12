import { axiosWithCreds, axiosWithoutCreds } from "./axiosInstances";

export const sendOtp = async (email) => {
  const { data } = await axiosWithoutCreds.post("/auth/send-otp", { email });
  return data;
};

export const sendRegisterOtp = async (email) => {
  const { data } = await axiosWithoutCreds.post("/auth/send-register-otp", { email });
  console.log(data);
  return data;
};

export const verifyOtp = async (email, otp) => {
  const { data } = await axiosWithoutCreds.post("/auth/verify-otp", {
    email,
    otp,
  });
  return data;
};
export const verifyRegisterOtp = async (email, otp, fullname, password) => {
  const { data } = await axiosWithCreds.post("/user/register", {
    email,
    otp,
    fullname,
    password
  });
  return data;
};

export const loginWithGoogle = async (idToken) => {
  const { data } = await axiosWithCreds.post("/auth/google", { idToken });
  return data;
};

export const importFromDrive = async (files, accessToken, dirId) => {
  const { data } = await axiosWithCreds.post("/file/drive/import", { files, accessToken, dirId });
  console.log(data);
  return data;
};

