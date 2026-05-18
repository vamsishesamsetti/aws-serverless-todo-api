import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";
import { ddb, TABLE } from "../lib/dynamo.js";
import { ok, badRequest, notFound, getUserId, serverError } from "../lib/http.js";

const schema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  completed: z.boolean().optional(),
});

export const handler = async (event) => {
  try {
    const id = event.pathParameters?.id;
    const userId = getUserId(event);
    const data = schema.parse(JSON.parse(event.body || "{}"));

    const sets = [];
    const names = {};
    const values = { ":updatedAt": new Date().toISOString() };
    for (const [k, v] of Object.entries(data)) {
      sets.push(`#${k} = :${k}`);
      names[`#${k}`] = k;
      values[`:${k}`] = v;
    }
    sets.push("#updatedAt = :updatedAt");
    names["#updatedAt"] = "updatedAt";

    const res = await ddb.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { pk: `USER#${userId}`, sk: `TODO#${id}` },
        UpdateExpression: "SET " + sets.join(", "),
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ConditionExpression: "attribute_exists(pk)",
        ReturnValues: "ALL_NEW",
      })
    );
    return ok(res.Attributes);
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") return notFound();
    if (err.name === "ZodError") return badRequest("ValidationError", err.errors);
    console.error(err);
    return serverError();
  }
};
