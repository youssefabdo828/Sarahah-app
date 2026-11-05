import mongoose from "mongoose";

const conversationMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const ConversationMessage = mongoose.model(
  "ConversationMessage",
  conversationMessageSchema
);

export default ConversationMessage;