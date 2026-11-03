import Message from "../models/message.model.js";
import BaseRepository from "./base.repository.js";




export default class MessageRepository extends BaseRepository{
    constructor(){
        super(Message)
    }
}