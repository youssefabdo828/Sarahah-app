import MessageRepository from "../../DB/Repositories/message.repository.js";
import { NotFoundException } from "../../Utils/Errors/exception.error.js";
import UserRepository from './../../DB/Repositories/user.repository.js';

const messageRepository = new MessageRepository();
  const userRepository = new UserRepository();

export const sendMessage = async ({content, file, receiverId}) => {
const user = await userRepository.findDocumentById(receiverId);
  if(!user) {
    throw new NotFoundException("Receiver not found");
  }
  return await messageRepository.createNewDocument({content, file:file?.path, receiverId});
};




export const getMessagesByReceiverId = async (receiverId) => {
  return await messageRepository.findDocuments({ receiverId });
};
