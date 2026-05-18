export const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const ok = (b) => json(200, b);
export const created = (b) => json(201, b);
export const noContent = () => ({ statusCode: 204, body: "" });
export const badRequest = (msg, details) => json(400, { error: msg, details });
export const notFound = (msg = "Not found") => json(404, { error: msg });
export const serverError = (msg = "Internal error") => json(500, { error: msg });

export function getUserId(event) {
  return (
    event.headers?.["x-user-id"] ||
    event.headers?.["X-User-Id"] ||
    "demo-user"
  );
}
