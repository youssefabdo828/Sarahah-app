import { Router } from "express";
import * as requestService from "./request.service.js";
import * as requestValidation from "./request.validation.js";
import { authenticate } from "../../Middlewares/authentication.middleware.js";
import { validation } from "../../Middlewares/validation.middleware.js";

const requestController = Router();

requestController.get(
  "/",
  authenticate,
  validation(requestValidation.getRequests),
  async (req, res) => {
    const result = await requestService.getMyRequests({
      senderId: req.authUser._id,
      status: req.query.status,
    });
    res.status(200).json({ status: "Requests retrieved successfully", data: result });
  }
);

requestController.patch(
  "/respond",
  authenticate,
  validation(requestValidation.respondToRequest),
  async (req, res) => {
    const result = await requestService.respondToRequest({
      requestId: req.body.requestId,
      senderId: req.authUser._id,
      action: req.body.action,
    });
    res.status(200).json({ status: "Request updated successfully", data: result });
  }
);

export default requestController;