import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE } from "../lib/dynamo.js";
import { noContent, notFound, getUserId, serverError } from "../lib/http.js";

export const handler = async (event) => {
  try {
    const id = event.pathParameters?.id;
    const userId = getUserId(event);
    await ddb.send(
      new DeleteCommand({
        TableName: TABLE,
        Key: { pk: `USER#${userId}`, sk: `TODO#${id}` },
        ConditionExpression: "attribute_exists(pk)",
      })
    );
    return noContent();
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") return notFound();
    console.error(err);
    return serverError();
  }
};
