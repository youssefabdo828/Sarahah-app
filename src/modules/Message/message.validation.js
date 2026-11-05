import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "must be a valid id");

export const sendMessage = z.object({
  body: z.strictObject({
    receiverId: objectId,
    content: z.string().trim().max(1000).optional(),
  }),
});

export const requestIdentity = z.object({
  body: z.strictObject({
    messageId: objectId,
  }),
});