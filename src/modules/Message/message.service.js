import MessageRepository from "../../DB/Repositories/message.repository.js";
import UserRepository from './../../DB/Repositories/user.repository.js';
import RequestRepository from "../../DB/Repositories/request.repository.js";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "../../Utils/Errors/exception.error.js";
  import ConversationRepository from "../../DB/Repositories/conversation.repository.js";
import { REQUEST_STATUS } from "../../DB/models/request.model.js";

const messageRepository = new MessageRepository();
  const userRepository = new UserRepository();
  const requestRepository = new RequestRepository();
  const conversationRepository = new ConversationRepository();

export const sendMessage = async ({content, file, receiverId, senderId }) => {
    if (receiverId === senderId.toString()) {
    throw new BadRequestException(
      "You can't send a message to yourself",
      null,
      "CANNOT_MESSAGE_SELF"
    );
  }
const user = await userRepository.findDocumentById(receiverId);
  if(!user) {
    throw new NotFoundException("Receiver not found");
  }
    const message = await messageRepository.createNewDocument({
    content,
    file: file?.path,
    receiverId,
    senderId,
  });
  return {
    _id: message._id,
    content: message.content,
    file: message.file,
    receiverId: message.receiverId,
    createdAt: message.createdAt,
  };
};









export const getMessagesByReceiverId = async (receiverId) => {
  const messages = await messageRepository
    .findDocuments({ receiverId }, null, { sort: { createdAt: -1 } })
    .select("+senderId")
    .lean();

  const acceptedRequests = await requestRepository
    .findDocuments(
      {
        messageId: { $in: messages.map((m) => m._id) },
        status: REQUEST_STATUS.ACCEPTED,
      },
      "messageId"
    )
    .lean();
  const acceptedIds = new Set(acceptedRequests.map((r) => r.messageId.toString()));

  const conversations = await conversationRepository
    .findDocuments({ messageId: { $in: [...acceptedIds] } }, "messageId")
    .lean();
  const conversationByMessage = new Map(
    conversations.map((c) => [c.messageId.toString(), c._id])
  );

  const senders = await userRepository
    .findDocuments(
      {
        _id: {
          $in: messages
            .filter((m) => acceptedIds.has(m._id.toString()))
            .map((m) => m.senderId),
        },
      },
      "firstName lastName"
    )
    .lean();
  const senderById = new Map(senders.map((s) => [s._id.toString(), s]));

  return messages.map((m) => {
    const revealed = acceptedIds.has(m._id.toString());
    return {
      _id: m._id,
      content: m.content,
      file: m.file,
      createdAt: m.createdAt,
      sender: revealed ? senderById.get(m.senderId?.toString()) ?? null : null,
      conversationId: revealed ? conversationByMessage.get(m._id.toString()) ?? null : null,
    };
  });
};












export const requestSenderIdentity = async ({ messageId, requesterId }) => {
  const message = await messageRepository
    .findDocumentById(messageId)
    .select("+senderId");

  if (!message) {
    throw new NotFoundException("Message not found");
  }

  if (!message.receiverId.equals(requesterId)) {
    throw new ForbiddenException("You can only request identity for your own messages");
  }

  if (!message.senderId) {
    throw new BadRequestException("This message has no sender information", null, "NO_SENDER");
  }

  const senderExists = await userRepository.findDocumentById(message.senderId);
if (!senderExists) {
  throw new BadRequestException("The sender no longer exists", null, "SENDER_DELETED");
}

  const existing = await requestRepository.findOneDocument({ messageId });
  if (existing) {
    throw new ConflictException(
      "Identity already requested for this message",
      { status: existing.status },
      "REQUEST_ALREADY_EXISTS"
    );
  }

  const request = await requestRepository.createNewDocument({
    messageId,
    requesterId,
    senderId: message.senderId,
  });

  return {
    _id: request._id,
    messageId: request.messageId,
    status: request.status,
    createdAt: request.createdAt,
  };
};
