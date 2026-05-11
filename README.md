# AI Cost Optimization Audit SaaS

This is a separate full-stack application for an AI Cost Optimization business.

## What the product does

AI Cost Optimization Audit helps businesses:

- track AI tool and subscription spend
- find unused or duplicate tools
- estimate monthly and yearly savings
- create audit reports
- collect payment through Razorpay

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
JWT_SECRET=your_long_random_secret
FRONTEND_URL=http://localhost:5174
CORS_ORIGINS=http://localhost:5174,http://127.0.0.1:5174
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
PAYMENT_SIMULATION=false
```

Use `PAYMENT_SIMULATION=false` for the real product. Only turn it on in a private local test environment.

### Deployment environment variables

If your hosting dashboard asks for a variable **Key** and **Value**, do not paste the full `KEY=value` line into the Key field. For example, enter `MONGO_URI` as the key and the MongoDB connection string as the value.

Use these exact keys:

| Key | Value |
| --- | --- |
| `PORT` | `5001` |
| `MONGO_URI` | Full MongoDB connection string, for example `mongodb+srv://<user>:<password>@<cluster>.<id>.mongodb.net/<database>?retryWrites=true&w=majority` |
| `JWT_SECRET` | A long random secret |
| `FRONTEND_URL` | Your frontend URL, for example `https://your-site.vercel.app` |
| `CORS_ORIGINS` | Comma-separated frontend URLs, for example `https://ai-cost-optimization.vercel.app` |
| `RAZORPAY_KEY_ID` | Your Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Your Razorpay key secret |
| `PAYMENT_SIMULATION` | `false` for live payments |
| `VITE_API_URL` | Your backend API URL ending in `/api` |

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

Do not ask clients for passwords or secret API keys.

For audits, ask only for:

- tool names
- plan names
- billing screenshots
- invoices
- billing exports
- seat counts

## Suggested packages

- Mini Audit: Rs 999
- Business Audit: Rs 4,999
- Monthly Monitor: Rs 9,999/month
