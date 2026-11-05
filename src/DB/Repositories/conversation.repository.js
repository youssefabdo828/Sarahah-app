import Conversation from "../models/conversation.model.js";
import BaseRepository from "./base.repository.js";

export default class ConversationRepository extends BaseRepository {
  constructor() {
    super(Conversation);
  }
}