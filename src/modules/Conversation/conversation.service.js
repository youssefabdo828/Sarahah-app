import ConversationRepository from "../../DB/Repositories/conversation.repository.js";
import ConversationMessageRepository from "../../DB/Repositories/conversation-message.repository.js";
import {
  ForbiddenException,
  NotFoundException,
} from "../../Utils/Errors/exception.error.js";

const conversationRepository = new ConversationRepository();
const conversationMessageRepository = new ConversationMessageRepository();


const getConversationForUser = async (conversationId, userId) => {
  const conversation = await conversationRepository.findDocumentById(conversationId);
  if (!conversation) {
    throw new NotFoundException("Conversation not found");
  }
  const isParticipant = conversation.participants.some((id) => id.equals(userId));
  if (!isParticipant) {
    throw new ForbiddenException("You are not part of this conversation");
  }
  return conversation;
};

export const sendConversationMessage = async ({ conversationId, senderId, content }) => {
  await getConversationForUser(conversationId, senderId);

  const message = await conversationMessageRepository.createNewDocument({
    conversationId,
    senderId,
    content,
  });

  return {
    _id: message._id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    content: message.content,
    createdAt: message.createdAt,
  };
};

export const getConversationMessages = async ({ conversationId, userId, page, limit }) => {
  await getConversationForUser(conversationId, userId);

  const messages = await conversationMessageRepository
    .findDocuments({ conversationId }, "senderId content createdAt", {
      sort: { createdAt: -1 },
      skip: (page - 1) * limit,
      limit,
    })
    .lean();

  return { page, limit, messages };
};