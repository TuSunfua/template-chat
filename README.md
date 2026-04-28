# Template Chat

Template Chat is a full-stack AI chat application built with the Next.js App Router. It supports authenticated conversations, message history, file uploads, and streamed responses from an OpenAI-compatible inference endpoint.

## Overview

The app is organized around three main layers:

1. Frontend UI in the App Router, with route groups for auth and chat.
2. Server API routes for authentication, conversations, messages, uploads, and chat completion.
3. Persistence in MongoDB through Prisma.

The chat flow is server-driven: the client sends a prompt and optional attachments, the server builds the model input, keeps recent conversation context, and streams the assistant response back over SSE.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Prisma + MongoDB
- NextAuth credentials authentication
- OpenAI SDK against an OpenAI-compatible endpoint
- UploadThing for file uploads
- React Query for client-side data fetching and mutation state
- Tailwind CSS and shadcn-style UI components

## Key Features

- User registration and login
- Protected chat area for authenticated users only
- Conversation management with persistent message history
- Automatic conversation title generation
- Streaming assistant responses
- File attachments in chat
- Support for PDF, text, and image uploads
- Context-aware replies using previous messages in the same conversation
- Basic soft-delete support on messages

## Chat and Attachment Flow

When a user sends a message, the app:

1. Validates the prompt and attachment payload.
2. Creates a new conversation if needed, or continues an existing one.
3. Saves the user message and its attachments in MongoDB.
4. Loads recent messages from the same conversation to preserve context.
5. Builds the model payload with text, image, and file content.
6. Streams the assistant answer back to the UI.
7. Saves the final assistant message to the database.

Supported attachment types:

- Images are passed to the model as image inputs.
- Text files are fetched and embedded into the prompt.
- PDF files are converted and attached when they are small enough to fit the model limits.

## Architecture

The codebase is split into a few practical areas:

- `app/` contains route groups, layouts, and API routes.
- `components/` contains the chat UI, sidebar, input area, and reusable UI building blocks.
- `hooks/` contains the client-side chat, upload, and textarea logic.
- `lib/` contains shared server helpers for Prisma, OpenAI, chat payload building, and upload configuration.
- `prisma/` contains the MongoDB schema and data model definitions.

## Data Model

MongoDB is used as the database, with Prisma as the ORM layer. The main models are:

- `User` for account data and credentials login
- `Conversation` for chat threads
- `ConversationParticipant` for conversation membership
- `Message` for user and assistant messages
- `Attachment` for uploaded files linked to messages

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/TuSunfua/template-chat.git
cd template-chat
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your environment file

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

### 4. Configure environment variables

Update `.env` with your own values:

```env
NEXTAUTH_SECRET="replace-with-random-32-byte-hex"
NEXTAUTH_URL="http://localhost:3000"
DATABASE_URL="mongodb+srv://<user>:<password>@<host>/<db>?retryWrites=true&w=majority"
OPENAI_API_KEY="ghp_your_github_access_token_here"
UPLOADTHING_TOKEN="replace-with-your-uploadthing-token"
UPLOADTHING_CALLBACK_URL="http://localhost:3000/api/uploadthing"
```

Notes:

- `OPENAI_API_KEY` is intentionally named that way in the code, but this project expects a GitHub access token in `ghp_...` format for the configured OpenAI-compatible endpoint.
- `NEXTAUTH_SECRET` should be a strong random value.
- `DATABASE_URL` must point to a MongoDB instance.
- `UPLOADTHING_CALLBACK_URL` is optional, but it is useful when automatic callback URL detection does not work.

### 5. Prepare the database

```bash
npm run db:push
npm run db:gen
```

### 6. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - start the development server
- `npm run build` - build the app for production
- `npm run start` - run the production build
- `npm run lint` - run ESLint
- `npm run format` - format the codebase with Prettier
- `npm run db:gen` - generate Prisma client
- `npm run db:push` - push Prisma schema changes to MongoDB
- `npm run db:studio` - open Prisma Studio
- `npm run db:reset` - force reset the database schema

## Current Limitations

- The UI is not fully responsive across every device size yet, mainly because the project was built under a time constraint.
- PDF support is limited for large documents. Very small PDFs work best because the model and token limits make larger files unreliable.

## Planned Improvements

- Improve responsiveness on smaller screens and unusual viewport sizes
- Expand attachment handling for larger PDFs and longer context windows
- Refine conversation UX and file preview handling

## License

No license has been declared yet.
