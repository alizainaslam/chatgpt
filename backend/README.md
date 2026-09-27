# Node TypeScript API

Starter project for a Node.js API using TypeScript, Express, MongoDB, JWT, cookies, and bcrypt.

## Setup

```bash
npm install
copy .env.example .env
```

Update `.env` with your MongoDB connection string and JWT secret. `MONGODB_URI` is optional during initial development; the server will still start without it.

## Commands

```bash
npm run dev        # Start with watch mode
npm run typecheck  # Check types without emitting files
npm run build      # Compile TypeScript to dist/
npm start          # Run the compiled application
```

The API and Socket.IO server use the same HTTP server. Socket.IO clients can
connect to the server URL (for example, `http://localhost:3000`) and listen
for connection and disconnection events.
