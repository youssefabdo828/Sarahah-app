import fs from "fs/promises";
import { fileTypeFromFile } from "file-type";
import { BadRequestException } from "../Utils/Errors/exception.error.js";

const DEFAULT_ALLOWED = ["image/jpeg", "image/png", "image/webp"];

const removeFiles = (files) =>
  Promise.all(files.map((f) => fs.unlink(f.path).catch(() => {})));

export const validateFileSignature = (allowed = DEFAULT_ALLOWED) => {
  return async (req, res, next) => {
    const files = req.file ? [req.file] : req.files ?? [];
    if (!files.length) return next();

    for (const file of files) {
      const type = await fileTypeFromFile(file.path);
      if (!type || !allowed.includes(type.mime)) {
        await removeFiles(files);
        throw new BadRequestException(
          "Invalid or tampered file type",
          null,
          "INVALID_FILE_SIGNATURE"
        );
      }
    }
    next();
  };
};