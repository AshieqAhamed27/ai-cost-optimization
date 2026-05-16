# SpendGuard

SpendGuard is a full-stack AI cost governance website and application for companies that want to control AI API and infrastructure spend across teams, products, workflows, and customers.

## What the product does

SpendGuard helps businesses:

- track model API, embedding, vector database, cloud inference, and observability spend
- find waste from wrong model choices, oversized prompts, repeated calls, missing caching, and poor retention rules
- estimate monthly and yearly savings
- create AI cost governance reports
- detect waste patterns across model routing, caching, token usage, retention, attribution, and budget controls
- import CSV usage rows from billing exports or pasted cost data
- keep a cost ledger by provider, model or service, workflow, customer, owner, request volume, token usage, and budget
- track unit economics such as cost per active user, cost per request, top workflow, top customer, and unattributed spend
- flag budget alerts when total spend or individual cost lines cross limits
- create private shareable report links for clients or stakeholders
- export reports through the browser print-to-PDF flow
- track implementation status and confirmed monthly savings after fixes
- give pilot users free access while keeping Razorpay payment infrastructure ready for later

Report creation is free for pilot users right now. Razorpay payment routes, plan pricing, and verification logic remain in the codebase so paid plans can be enabled later without rebuilding checkout.

The website also includes company, security, privacy, terms, and refund pages so users can understand the service and how future payment handling works.

## Tech stack

- Frontend: React, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT login and signup
- Payments: Razorpay Orders and payment verification

## Folder structure

```text
ai-cost-optimization/
  backend/
  frontend/
```

The old static `index.html`, `styles.css`, and `script.js` are kept only as a simple landing page backup. The real app is inside `frontend` and `backend`.

## Setup

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

3. Create backend `.env`:

Copy `backend/.env.example` to `backend/.env` and fill:

```text
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret_at_least_24_characters
FRONTEND_URL=http://localhost:5174
CORS_ORIGINS=http://localhost:5174,http://127.0.0.1:5174
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
OPENAI_API_KEY=optional_openai_api_key_for_ai_features
OPENAI_MODEL=gpt-5
```

### Deployment environment variables

If your hosting dashboard asks for a variable **Key** and **Value**, do not paste the full `KEY=value` line into the Key field. For example, enter `MONGO_URI` as the key and the MongoDB connection string as the value.

Use these exact keys:

| Key | Value |
| --- | --- |
| `PORT` | `5001` |
| `MONGO_URI` | Full MongoDB connection string, for example `mongodb+srv://<user>:<password>@<cluster>.<id>.mongodb.net/<database>?retryWrites=true&w=majority` |
| `JWT_SECRET` | A long random secret with at least 24 characters |
| `FRONTEND_URL` | Your frontend URL, for example `https://your-site.vercel.app` |
| `CORS_ORIGINS` | Comma-separated frontend URLs, for example `https://ai-cost-optimization.vercel.app` |
| `RAZORPAY_KEY_ID` | Your Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Your Razorpay key secret |
| `OPENAI_API_KEY` | Optional server-side OpenAI API key for the AI audit features |
| `OPENAI_MODEL` | Optional model name for the agent, for example `gpt-5` |
| `VITE_API_URL` | Your backend API URL ending in `/api` |
| `VITE_ENABLE_PAYMENTS` | Set to `true` only when you want the frontend to open Razorpay checkout |

### Render deployment settings

For the backend Render Web Service:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

If Render is already set to `yarn install; yarn build`, the backend includes a `build` script so that command can pass too.

For the frontend Render Static Site:

```text
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

For the frontend Vercel project:

```text
Root Directory: frontend
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

The frontend includes `frontend/vercel.json` so direct URLs like `/signup`, `/login`, and `/dashboard` load the React app instead of returning a Vercel 404.

Set `VITE_API_URL` to your deployed backend URL with `/api` at the end, for example:

```text
https://your-backend.onrender.com/api
```

If Render shows `querySrv ENOTFOUND _mongodb._tcp...`, the `MONGO_URI` value is incomplete or mistyped. Copy the full connection string from MongoDB Atlas **Connect > Drivers**, and make sure the host includes `.mongodb.net`.

If the browser shows a CORS error from the Vercel frontend, set this on the Render backend service:

```text
CORS_ORIGINS=https://ai-cost-optimization.vercel.app
```

4. Create frontend `.env`:

Copy `frontend/.env.example` to `frontend/.env`.

```text
VITE_API_URL=http://localhost:5001/api
VITE_ENABLE_PAYMENTS=false
```

## Run locally

Open two terminals.

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Open:

```text
http://127.0.0.1:5174
```

## Important safety rule

Do not ask customers for passwords or secret API keys.

For governance reports, ask only for:

- cost line names
- provider or service names
- billing screenshots
- invoices
- billing exports
- usage exports

## AI features

The backend includes AI endpoints that help users turn cost data into real work:

```text
POST /api/agent/audit-advice
POST /api/agent/report-pack/:auditId
```

`/audit-advice` reviews draft cost lines before a report is created and returns quick wins, risks, governance questions, and next steps.

`/report-pack/:auditId` turns a saved report into an executive summary, savings narrative, 30-day action plan, implementation checklist, and client follow-up email.

Both endpoints are available to pilot and paid users. If `OPENAI_API_KEY` is configured, the backend calls OpenAI's Responses API from the server. If no key is configured or the provider request fails, the app falls back to built-in rule-based guidance so the product still works.

## Governance workflow features

The product now supports a more complete business workflow:

- CSV upload or paste import for cost ledger rows
- intake fields for product type, monthly active users, AI request volume, data source, cost concern, and control maturity
- workspace/client grouping for agencies, consultants, and multi-client operators
- richer cost lines with provider, model/service, workflow, customer/client, request volume, average tokens, model tier, caching status, owner, and budget limit
- waste findings with estimated savings per issue
- budget alerts for overall monthly budget and cost-line budgets
- unit economics for cost per active user, cost per request, top workflow, top customer, and unattributed spend
- action plan status tracking: to do, doing, done
- confirmed monthly savings, actual monthly spend after fixes, and implementation notes
- private public report links at `/reports/public/:token`
- PDF-ready report view using browser print
- public website AI chat assistant for product questions, user doubts, business questions, security guidance, pilot access, imports, reports, and getting started

## Website chat assistant

The website includes a floating SpendGuard Assistant widget. It calls:

```text
POST /api/agent/site-chat
```

This endpoint is public so visitors can ask product questions and broader business or AI-cost questions before signup. If `OPENAI_API_KEY` is configured, the backend uses the server-side OpenAI Responses API for friendly, detailed answers. If no key is configured, the route falls back to built-in product answers.

The assistant should not ask users for passwords, API keys, card details, bank details, or private customer records. For legal, medical, financial, security, or other high-stakes questions, it gives general educational guidance and recommends checking with a qualified professional or trusted source.

## Suggested packages

- Pilot access: free for launch users
- Team Pilot: Rs 2,499
- Business Command: Rs 14,999
- Global Governance: Rs 49,999/month
