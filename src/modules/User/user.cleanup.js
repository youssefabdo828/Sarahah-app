import fs from "node:fs";
import MessageRepository from "../../DB/Repositories/message.repository.js";
import RequestRepository from "../../DB/Repositories/request.repository.js";
import ConversationRepository from "../../DB/Repositories/conversation.repository.js";
import ConversationMessageRepository from "../../DB/Repositories/conversation-message.repository.js";

const messageRepository = new MessageRepository();
const requestRepository = new RequestRepository();
const conversationRepository = new ConversationRepository();
const conversationMessageRepository = new ConversationMessageRepository();

export const deleteUserRelatedData = async (userId) => {

  const conversations = await conversationRepository
    .findDocuments({ participants: userId }, "_id")
    .lean();
  const conversationIds = conversations.map((c) => c._id);

  await conversationMessageRepository.deleteManyDocuments({
    conversationId: { $in: conversationIds },
  });
  await conversationRepository.deleteManyDocuments({ _id: { $in: conversationIds } });


  await requestRepository.deleteManyDocuments({
    $or: [{ senderId: userId }, { requesterId: userId }],
  });


  const received = await messageRepository
    .findDocuments({ receiverId: userId }, "file")
    .lean();
  received.forEach((m) => {
    if (m.file) fs.unlink(m.file, () => {});
  });
  await messageRepository.deleteManyDocuments({ receiverId: userId });
};