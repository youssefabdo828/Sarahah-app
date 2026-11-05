import { z } from "zod";
import { REQUEST_STATUS } from "../../DB/models/request.model.js";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "must be a valid id");

export const getRequests = z.object({
  query: z.strictObject({
    status: z.enum(Object.values(REQUEST_STATUS)).optional(),
  }),
});

export const respondToRequest = z.object({
  body: z.strictObject({
    requestId: objectId,
    action: z.enum(["accept", "reject"]),
  }),
});