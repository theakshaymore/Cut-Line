import axios from "axios";
import api from "./api";

export const uploadImageToImageKit = async (file, folder = "/nextcut/shops") => {
  if (!file) throw new Error("No file selected");
  const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;
  if (!publicKey) throw new Error("VITE_IMAGEKIT_PUBLIC_KEY is missing");

  const { data: auth } = await api.get("/auth/image-upload-auth");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", `${Date.now()}-${file.name}`);
  formData.append("publicKey", publicKey);
  formData.append("signature", auth.signature);
  formData.append("expire", String(auth.expire));
  formData.append("token", auth.token);
  formData.append("folder", folder);
  formData.append("useUniqueFileName", "true");

  const { data } = await axios.post("https://upload.imagekit.io/api/v1/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export default uploadImageToImageKit;
