# Food Waste Management System — Backend Service

Autonomous, Agentic AI-powered backend API and orchestration engine built with Express.js, Mongoose (MongoDB Auth), and Prisma (PostgreSQL Business Data).

## Architecture Highlights
- **MongoDB (Mongoose)**: Exclusively manages user authentication, credentials, access/refresh tokens, and RBAC permissions.
- **PostgreSQL (Prisma)**: Manages all core business entities — profiles, donations, freshness assessments, matches, logistics, deliveries, notifications, and agent logs.
- **Agentic AI Core**: Autonomous agents operating with clear typed interfaces, async event queues, and pluggable ML/LLM models.
- **Real-Time Layer**: Socket.IO for dispatch alerts and live delivery coordinates.

## Installation & Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

3. Setup Prisma ORM:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

API is available at: `http://localhost:5000`  
Health check endpoint: `http://localhost:5000/health`
