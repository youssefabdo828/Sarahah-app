import { Router } from "express";
import * as messageService from "./message.service.js";
import { multerUpload } from './../../Middlewares/multer.middleware.js';
import { BadRequestException } from "../../Utils/Errors/exception.error.js";
import { authenticate } from "../../Middlewares/authentication.middleware.js";
import { validateFileSignature } from "../../Middlewares/file-signature.middleware.js";
import { validation } from "../../Middlewares/validation.middleware.js";
import * as messageValidation from "./message.validation.js";
const messageController = Router();



messageController.post("/send",authenticate,multerUpload({desiredPath:'messages'}).single("file"),validateFileSignature(["image/jpeg", "image/png", "application/pdf"]),validation(messageValidation.sendMessage), async (req, res) => {
  const {content, receiverId} = req.body;
  const file = req.file;
  if(!content && !file) {
    throw new BadRequestException("Message content or file is required", null, "CONTENT_OR_FILE_REQUIRED");
  }
  const result = await messageService.sendMessage({content, file, receiverId,senderId: req.authUser._id});
  res.status(201).json({ status: "Message sent successfully", data: result });
});

messageController.get("/receiver",authenticate , async (req, res) => {
  const  receiverId  = req.authUser._id;
  const result = await messageService.getMessagesByReceiverId(receiverId);
  res.status(200).json({ status: "Messages retrieved successfully", data: result });
});

messageController.post(
  "/request-identity",
  authenticate,
  validation(messageValidation.requestIdentity),
  async (req, res) => {
    const result = await messageService.requestSenderIdentity({
      messageId: req.body.messageId,
      requesterId: req.authUser._id,
    });
    res.status(201).json({ status: "Identity request sent", data: result });
  }
);


export default messageController;