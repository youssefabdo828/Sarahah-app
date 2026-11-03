import fs from "fs/promises";
import path from "path";

export const removeFile = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(path.resolve(filePath));
  } catch (err) {
    if (err.code !== "ENOENT") console.error("Failed to remove file:", err.message); // ENOENT = الملف مش موجود أصلاً، عادي
  }
};