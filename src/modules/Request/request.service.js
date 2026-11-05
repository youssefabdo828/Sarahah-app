import RequestRepository from "../../DB/Repositories/request.repository.js";
import ConversationRepository from "../../DB/Repositories/conversation.repository.js";
import { REQUEST_STATUS } from "../../DB/models/request.model.js";
import { ConflictException, ForbiddenException, NotFoundException } from "../../Utils/Errors/exception.error.js";

const requestRepository = new RequestRepository();
const conversationRepository = new ConversationRepository();

export const getMyRequests = async ({ senderId, status }) => {
  const filters = { senderId };
  if (status) filters.status = status;

  const requests = await requestRepository
    .findDocuments(filters, "messageId requesterId status createdAt", {
      sort: { createdAt: -1 },
      populate: [
        { path: "messageId", select: "content file createdAt" },
        { path: "requesterId", select: "firstName lastName" },
      ],
    })
    .lean();

  return requests.filter((r) => r.requesterId && r.messageId);
};


export const respondToRequest = async ({ requestId, senderId, action }) => {
  const request = await requestRepository.findDocumentById(requestId);
  if (!request) {
    throw new NotFoundException("Request not found");
  }
  if (!request.senderId.equals(senderId)) {
    throw new ForbiddenException("You can only respond to your own requests");
  }

  const newStatus =
    action === "accept" ? REQUEST_STATUS.ACCEPTED : REQUEST_STATUS.REJECTED;


  const updated = await requestRepository.findOneAndUpdateDocument(
    { _id: requestId, status: REQUEST_STATUS.PENDING },
    { status: newStatus },
    { returnDocument: "after" }
  );
  if (!updated) {
    throw new ConflictException(
      "Request already handled",
      { status: request.status },
      "REQUEST_ALREADY_HANDLED"
    );
  }

  if (action === "reject") {
    return { _id: updated._id, status: updated.status };
  }

  try {
    const conversation = await conversationRepository.createNewDocument({
      participants: [updated.senderId, updated.requesterId],
      messageId: updated.messageId,
    });
    return {
      _id: updated._id,
      status: updated.status,
      conversationId: conversation._id,
    };
  } catch (error) {
    await requestRepository.updateDocumentById(requestId, {
      status: REQUEST_STATUS.PENDING,
    });
    throw error;
  }
};