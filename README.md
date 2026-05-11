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
PAYMENT_SIMULATION=true
```

Use `PAYMENT_SIMULATION=true` while testing. Change it to `false` only after Razorpay keys are correct.

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
