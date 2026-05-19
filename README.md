# aws-serverless-todo-api

Production-shaped serverless REST API on AWS. Lambda functions handle CRUD against a single-table DynamoDB design, fronted by an HTTP API Gateway. Infrastructure is described in SAM (CloudFormation). CI deploys via OIDC — no long-lived AWS keys in GitHub.

## Architecture

```
client ──> API Gateway (HTTP API)
              │
              ├── POST   /todos        ─> CreateTodoFn  (Lambda)
              ├── GET    /todos        ─> ListTodosFn
              ├── GET    /todos/{id}   ─> GetTodoFn
              ├── PUT    /todos/{id}   ─> UpdateTodoFn
              └── DELETE /todos/{id}   ─> DeleteTodoFn
                                          │
                                          └─> DynamoDB (TodosTable)
                                              pk = USER#<id>
                                              sk = TODO#<uuid>

CloudWatch Logs + X-Ray traces for every invocation.
```

Single-table design: one DynamoDB table holds per-user todos using a composite key.
`pk = USER#<userId>` and `sk = TODO#<uuid>` lets us query all of a user's todos with `begins_with`.

## Prerequisites

- AWS account, AWS CLI configured (`aws configure`)
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- Node 20+

## Quick start

```bash
npm install

# Local invoke
cp env.local.example.json env.local.json
sam build
sam local start-api --env-vars env.local.json

# Deploy to AWS (first time, interactive)
sam deploy --guided
```

## CI/CD

GitHub Actions deploys on every push to `main`:

1. `npm ci && npm test`
2. `sam build`
3. `sam deploy` using OIDC-assumed IAM role (no static keys)

Required GitHub secrets / variables:

- `secrets.AWS_DEPLOY_ROLE_ARN` — IAM role with trust policy for your repo (OIDC)
- `vars.AWS_REGION` — defaults to `us-east-1`

## API examples

```bash
API=https://<id>.execute-api.us-east-1.amazonaws.com/prod

curl -X POST $API/todos -H "Content-Type: application/json" \
  -H "X-User-Id: demo" -d '{"title":"Buy milk"}'

curl $API/todos -H "X-User-Id: demo"

curl -X PUT $API/todos/<id> -H "Content-Type: application/json" \
  -H "X-User-Id: demo" -d '{"completed":true}'
```

> Note: `X-User-Id` is a stand-in for a Cognito/JWT-derived identity. The TODO list below adds real auth.

## Roadmap / TODO

- [ ] Replace `X-User-Id` header with a Cognito User Pool authorizer on the HTTP API
- [ ] Add a Lambda authorizer that verifies JWTs from Project 1 (`express-jwt-auth-api-docker`)
- [ ] Add `aws-sdk-client-mock` unit tests for each handler
- [ ] Add SAM `Conditions` for dev/stage/prod and a parameter for log level
- [ ] Add a GSI to query todos by `completed` flag across users
- [ ] Add a DynamoDB Stream + Lambda that emits "todo completed" events to EventBridge
- [ ] Add an SNS topic so completed events fan out to email/Slack
- [ ] Add CloudWatch Alarms on 5XX rate, Lambda errors, throttles → SNS
- [ ] Add a CloudWatch dashboard JSON committed in `infra/dashboard.json`
- [ ] Wire structured (JSON) logging with Powertools for AWS Lambda
- [ ] Switch to ARM/Graviton (already on arm64; benchmark vs x86)
- [ ] Add k6 / artillery load test that drives 50 RPS for 60s
- [ ] Add a tiny React frontend (or wire to Project 5)
- [ ] Add Trivy + CodeQL scans to the pipeline
- [ ] Write `ARCHITECTURE.md` with sequence diagrams

## Cost notes

DynamoDB is PAY_PER_REQUEST (no idle cost). Lambda free tier covers 1M invocations/month. HTTP API is cheaper than REST API Gateway. Expect $0/month for a portfolio project.

## License

MIT


---

## Author

**Vamsi Shesamsetti** — Full-Stack Developer · Cloud Engineer · M.S. CS @ FAU (May 2026)

🌐 [vamsishesamsetti.dev](https://vamsishesamsetti.dev) · 💼 [LinkedIn](https://linkedin.com/in/vamsishesamsetti) · 🐙 [GitHub](https://github.com/vamsishesamsetti) · ✉️ shesamsettivamsi11@gmail.com
