# Eventora

Eventora is a full-stack event discovery and booking platform built with React, Vite, Express, MongoDB and JWT authentication.

## Features

- Event discovery and search
- Event details and seat availability
- User registration/login with OTP verification
- OTP-protected event booking
- User booking dashboard and cancellation
- Admin event management
- Admin booking confirmation and payment-status management
- Email notifications
- Responsive UI

## Project structure

```text
Eventora/
├── client/
├── server/
├── render.yaml
├── .gitignore
└── README.md
```

## Local development

### Backend

```bash
cd server
npm install
cp .env.example .env
npm start
```

### Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Never commit `.env` files or production credentials.

## Production

The included `render.yaml` defines the API and frontend services for Render. Production secrets should be configured in Render environment variables.
