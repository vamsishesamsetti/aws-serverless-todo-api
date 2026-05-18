import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE } from "../lib/dynamo.js";
import { ok, getUserId, serverError } from "../lib/http.js";

export const handler = async (event) => {
  try {
    const userId = getUserId(event);
    const res = await ddb.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":prefix": "TODO#",
        },
      })
    );
    return ok({ todos: res.Items ?? [], count: res.Count ?? 0 });
  } catch (err) {
    console.error(err);
    return serverError();
  }
};
