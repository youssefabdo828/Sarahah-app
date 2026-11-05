import { Router } from "express";
import * as conversationService from "./conversation.service.js";
import * as conversationValidation from "./conversation.validation.js";
import { authenticate } from "../../Middlewares/authentication.middleware.js";
import { validation } from "../../Middlewares/validation.middleware.js";

const conversationController = Router();

conversationController.post(
  "/messages",
  authenticate,
  validation(conversationValidation.sendConversationMessage),
  async (req, res) => {
    const result = await conversationService.sendConversationMessage({
      conversationId: req.body.conversationId,
      senderId: req.authUser._id,
      content: req.body.content,
    });
    res.status(201).json({ status: "Message sent successfully", data: result });
  }
);

conversationController.get(
  "/messages",
  authenticate,
  validation(conversationValidation.getConversationMessages),
  async (req, res) => {
    const { conversationId } = req.validate.body;
    const { page, limit } = req.validate.query;

    const result = await conversationService.getConversationMessages({
      conversationId,
      userId: req.authUser._id,
      page,
      limit,
    });
    res.status(200).json({ status: "Messages retrieved successfully", data: result });
  }
);

export default conversationController;