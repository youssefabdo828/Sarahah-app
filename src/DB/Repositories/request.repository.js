import Request from "../models/request.model.js";
import BaseRepository from "./base.repository.js";

export default class RequestRepository extends BaseRepository {
  constructor() {
    super(Request);
  }
}