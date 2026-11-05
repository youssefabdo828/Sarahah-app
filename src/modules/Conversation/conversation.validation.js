import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "must be a valid id");

export const sendConversationMessage = z.object({
  body: z.strictObject({
    conversationId: objectId,
    content: z.string().trim().min(1).max(1000),
  }),
});

export const getConversationMessages = z.object({
  body: z.strictObject({
    conversationId: objectId,
  }),
  query: z.strictObject({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});