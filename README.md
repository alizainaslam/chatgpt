# AI Chat App

A full-stack AI chat app built with MongoDB, Express, React, and Node.js (MERN), using TypeScript. Users can sign up, log in, start conversations, and return to their saved chat history. The backend uses Gemini to generate replies, Pinecone for vector-based chat memory, and Socket.IO for real-time messaging.

## Run locally

You’ll need Node.js 20 or newer, MongoDB, and API credentials for Gemini and Pinecone.

1. In `backend`, create a `.env` file with:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=replace_with_a_random_secret
   GEMINI_KEY=your_gemini_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   ```

   The Pinecone account must have an index named `chatgpt`. The app also reads `PORT` (defaults to `3000`) and `CLIENT_ORIGIN` (defaults to `http://localhost:5173`) if you need to change them. Keep `.env` private.

2. Open a terminal in `backend` and start the API:

   ```sh
   npm install
   npm run dev
   ```

3. Open a second terminal in `frontend` and start the web app:

   ```sh
   npm install
   npm run dev
   ```

4. Visit `http://localhost:5173`, create an account, start a chat, and send a message. Reopen the conversation to check that its history was saved.

The frontend uses `http://localhost:3000/api` by default. To use a different API URL, set `VITE_API_URL` in `frontend/.env`.
