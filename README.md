# COLLEGE FEST 2026 - Event Management

A college fest website where students register for events and pay, and an admin manages events and sees all registrations.

Built with Node.js, Express, MongoDB (Mongoose) and plain HTML / CSS / JavaScript.

## Project structure

```
server.js              starts the app and connects the routes
config.js              reads the .env file
models/                database models: User, Event, Registration
routes/                API routes: auth, events, payment, registrations, admin
middleware/auth.js     login check, admin check, JWT token helpers
services/razorpay.js   Razorpay client (only when real keys exist)
utils/                 seed data (admin + events), error helpers
public/                the website
  index.html           page shell (navbar, footer)
  css/style.css        all styles
  js/helpers.js        API calls, toasts, shared constants
  js/effects.js        particles, scroll animation, countdown
  js/pages.js          home, events, login, receipt, dashboard pages
  js/registration.js   5-step registration + payment
  js/admin.js          admin dashboard
  js/main.js           navbar, routing, click handlers
```

## Setup (Windows + VS Code)
1. Install Node.js LTS from https://nodejs.org
2. Database: install MongoDB Community (uses `mongodb://127.0.0.1:27017/collegefest`) **or** create a free MongoDB Atlas cluster and copy its connection string.
3. Open this folder in VS Code (File > Open Folder), then open the terminal (Ctrl + `).
4. Run `npm install`
5. Create your env file: `copy .env.example .env`, then edit `.env`:
   - `MONGO_URI` = your connection string
   - `JWT_SECRET` = any long random text
   - Razorpay keys are optional. Leave them as-is to use **Demo Payment**.
6. Run `npm start`
7. Open http://localhost:5000

## Admin login (created automatically)
- Email: `admin@collegefest.com`
- Password: `Admin@123`

## Payments
- **Demo Payment**: always available, no money involved, full workflow.
- **Razorpay**: enabled only when real `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` (test keys work) are in `.env`. The secret never leaves the server; the amount is recalculated on the server (Rs 50 x events).

## Receipt
The success page has a **Download Receipt** button (opens the print dialog; choose "Save as PDF").

## Troubleshooting
- `Failed to start app` / MongoDB connection error: check `MONGO_URI`; for Atlas, whitelist your IP under Network Access and URL-encode special characters in the password. For local MongoDB, make sure the MongoDB service is running.
- `Port 5000 in use`: change `PORT` in `.env`.
- `npm not recognized`: reinstall Node.js and restart VS Code.
- Razorpay button disabled: keys missing/placeholder in `.env`; restart after editing.
- Login says invalid: passwords are case-sensitive.
