import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { ddb, TABLE } from "../lib/dynamo.js";
import { created, badRequest, getUserId, serverError } from "../lib/http.js";

const schema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().datetime().optional(),
});

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const data = schema.parse(body);
    const userId = getUserId(event);
    const id = uuid();
    const now = new Date().toISOString();

    const item = {
      pk: `USER#${userId}`,
      sk: `TODO#${id}`,
      id,
      userId,
      title: data.title,
      description: data.description ?? null,
      dueDate: data.dueDate ?? null,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
    return created(item);
  } catch (err) {
    if (err.name === "ZodError") return badRequest("ValidationError", err.errors);
    console.error(err);
    return serverError();
  }
};
