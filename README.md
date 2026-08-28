# Food Waste Management System (Agentic AI-Powered)

A full-stack, modular platform connecting **Donors** (restaurants, households, grocers) with **Recipients** (shelters, NGOs, individuals in need) through **Volunteers**, orchestrated by specialized **Autonomous AI Agents** (Food Freshness, Recipient Matching, Logistics & Route Optimization, Volunteer Dispatch, Impact Analytics, and Notifications).

---

## 🏛️ Architecture Overview

This project consists of two completely independent top-level applications communicating over RESTful HTTP and WebSocket protocols:

```
food-waste-management-system/
├── backend/          # Node.js + Express.js API + Agentic AI Orchestrator
└── frontend/         # React.js + Vite + Tailwind CSS SPA
```

### Dual-Database Architecture
- **MongoDB (Mongoose)**: Handles user authentication, credentials, password reset tokens, and active sessions.
- **PostgreSQL (Prisma)**: Handles all relational domain entities (donations, items, matches, deliveries, routes, impact metrics, agent logs). User profiles in Postgres reference the MongoDB `userId` string.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB connection string (Local or Mongo Atlas)
- PostgreSQL connection string (or SQLite for quick local test)
- Redis connection (optional, in-memory fallback enabled by default)

### 1. Setup Backend
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run dev
```
Backend API will start at: `http://localhost:5000` (Health check: `http://localhost:5000/health`)

### 2. Setup Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Frontend Web App will start at: `http://localhost:5173`

---

## 🤖 Agentic AI Modules
- **Food Agent**: Freshness scoring (0-100), visual defect detection, safety window estimation.
- **Matching Agent**: Multi-criteria matching balancing distance, dietary fit, capacity, and urgency.
- **Volunteer Agent**: Geofenced volunteer dispatch and task reassignment.
- **Logistics Agent**: Multi-stop route optimization and dynamic ETA calculations.
- **Notification Agent**: Multichannel in-app, email, SMS, and push notification triggers.
- **Impact Agent**: Quantifies rescued meals, avoided CO2 emissions, and water saved.
