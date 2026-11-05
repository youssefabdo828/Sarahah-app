import ConversationMessage from "../models/conversation-message.model.js";
import BaseRepository from "./base.repository.js";

export default class ConversationMessageRepository extends BaseRepository {
  constructor() {
    super(ConversationMessage);
  }
}