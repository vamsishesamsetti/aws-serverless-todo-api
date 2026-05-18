import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE } from "../lib/dynamo.js";
import { ok, notFound, getUserId, serverError } from "../lib/http.js";

export const handler = async (event) => {
  try {
    const id = event.pathParameters?.id;
    const userId = getUserId(event);
    const res = await ddb.send(
      new GetCommand({
        TableName: TABLE,
        Key: { pk: `USER#${userId}`, sk: `TODO#${id}` },
      })
    );
    if (!res.Item) return notFound();
    return ok(res.Item);
  } catch (err) {
    console.error(err);
    return serverError();
  }
};
