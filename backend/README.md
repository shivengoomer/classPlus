# ⚙️ ClassPilot Backend Engine — REST API, WS Gateway & Async Worker

[![Express](https://img.shields.io/badge/API-Express.js-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Queue-Redis%20%26%20BullMQ-red?style=for-the-badge&logo=redis)](https://redis.io/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Groq](https://img.shields.io/badge/AI-Groq%20API-orange?style=for-the-badge)](https://groq.com/)

This is the core service engine for **ClassPilot**. It handles REST routing, secure user sessions via Clerk, background processing queues with BullMQ + Redis, text extraction from uploaded files, structured assessment generation via LLMs, real-time WebSocket notifications, and high-fidelity PDF rendering.

---

## 🛠️ Tech Stack & Key Libraries

*   **Express.js**: Fast, minimalist routing framework.
*   **TypeScript**: Complete compile-time typing.
*   **Mongoose**: Object Data Modeling (ODM) for MongoDB.
*   **BullMQ + Redis**: Distributed background jobs and task queues.
*   **Groq SDK**: Interfacing with Groq Cloud Llama-3 endpoints.
*   **Clerk Middleware**: Validates frontend session JWTs and hydrates user contexts.
*   **ws**: Clean, fast WebSocket implementation for dispatching job progress alerts.
*   **Mammoth & pdf-parse**: Text extraction libraries for DOCX and PDF documents.
*   **PDFKit**: Dynamic server-side PDF generator for printing standard exam sheets.

---

## 🏗️ Architecture Deep Dive: Asynchronous Processing Pipeline

When a user creates a new assignment, Groq prompt completions can take up to 45 seconds. ClassPilot handles this asynchronously via BullMQ:

```
[Client POST /api/assignments]
         │
         ▼
[Express Controller] ─── (MongoDB: Create Pending Assignment)
         │
         ▼
[Enqueue Job to BullMQ] ─── (Redis Server)
         │
    ┌────┴─────────────────────────┐
    ▼                              ▼
[Express returns Job ID]    [Worker pulls Job from Redis]
    │                              │
    ▼                              ▼
[Client connects WebSockets]  [Worker parses DOCX/PDF]
    │                              │
    │                              ▼
    │                       [Worker queries Groq API]
    │                              │
    │                              ▼
    │                       [Worker updates MongoDB to "done"]
    │                              │
    ▼                              ▼
[WebSocket pushes completion] ◄─ [Worker triggers WS Broadcast]
```

---

## 📂 Key Codebase Directories

*   [src/workers/assignment.worker.ts](file:///Users/shivengoomer/Documents/Shiven/Coding/Internship/ClassPilot/backend/src/workers/assignment.worker.ts): Background queue listener. Fetches the assignment, extracts syllabus document texts (if provided), designs context-rich prompts, queries the Groq API, parses the JSON response, saves the compiled questions/answers to MongoDB, and signals completion.
*   [src/services/ai.service.ts](file:///Users/shivengoomer/Documents/Shiven/Coding/Internship/ClassPilot/backend/src/services/ai.service.ts): Integrates with Groq Cloud. Houses structured prompting formats and enforces strict JSON output.
*   [src/services/parser.service.ts](file:///Users/shivengoomer/Documents/Shiven/Coding/Internship/ClassPilot/backend/src/services/parser.service.ts): Parses uploaded assets into clean plain text. Supports `.pdf` (via `pdf-parse`) and `.docx` (via `mammoth`).
*   [src/services/pdf.service.ts](file:///Users/shivengoomer/Documents/Shiven/Coding/Internship/ClassPilot/backend/src/services/pdf.service.ts): Compiles assignment questions and user profile data (e.g., School Name, CBSE Code) into printable PDF exam papers using PDFKit.
*   [src/websocket/server.ts](file:///Users/shivengoomer/Documents/Shiven/Coding/Internship/ClassPilot/backend/src/websocket/server.ts): Manages active WebSocket connections. Maps connection clients with their respective generation jobs to push status updates (`pending` ➡️ `processing` ➡️ `completed` / `failed`).

---

## 🍃 MongoDB Mongoose Schemas

### 1. `Assignment` ([assignment.model.ts](file:///Users/shivengoomer/Documents/Shiven/Coding/Internship/ClassPilot/backend/src/models/assignment.model.ts))
Keeps records of generated assessments:
*   `title` (String): Assignment name.
*   `grade` (String): Target level (e.g., Class X).
*   `subject` (String): Subject (e.g., Mathematics).
*   `blueprint` (Array): Detailed section rules (Section name, question types, marks allocation).
*   `status` (String): `pending` | `processing` | `completed` | `failed`.
*   `questions` (Array): Array of question details (question text, type, options, marks).
*   `answerKey` (Array): Ideal answers corresponding to the questions.
*   `createdBy` (String): Clerk User ID string.

### 2. `LibraryItem` ([library.model.ts](file:///Users/shivengoomer/Documents/Shiven/Coding/Internship/ClassPilot/backend/src/models/library.model.ts))
Tracks referenced documents uploaded by the user:
*   `name` (String): Filename.
*   `path` (String): Relative filesystem location.
*   `size` (Number): File size in bytes (checked against the **10MB upload limit**).
*   `mimeType` (String): `application/pdf` or `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
*   `category` (String): Syllabus, Notes, Textbook, etc.
*   `createdBy` (String): Clerk User ID.

### 3. `User` ([user.model.ts](file:///Users/shivengoomer/Documents/Shiven/Coding/Internship/ClassPilot/backend/src/models/user.model.ts))
Stores profile details used to brand the generated assessment PDFs:
*   `clerkId` (String): Primary ID matching Clerk credentials.
*   `schoolName` (String): Custom name displayed in exam headers.
*   `cbseCode` (String): School CBSE affiliation code.
*   `branch` (String): Campus branch location.

---

## 📡 REST API Endpoint Catalog

All routes except `/api/assignments/:id/download` require a bearer authentication header containing a valid Clerk JWT:
`Authorization: Bearer <clerk_session_token>`

### 📝 Assignment Routes (`/api/assignments`)

| Method | Endpoint | Description | Payload / Response |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Get user's assignments list | Returns list of user's assignments. |
| **GET** | `/:id` | Fetch details of a single assignment | Returns assignment JSON. |
| **POST** | `/` | Create assignment & queue generation | **Multipart Form-Data**:<br>`title`, `grade`, `subject`, `blueprint` (JSON string), and optional file upload (`material`).<br>Returns `{ jobId, assignmentId }`. |
| **DELETE**| `/:id` | Remove an assignment | Returns success status message. |
| **POST** | `/:id/regenerate`| Queue regeneration of questions | Re-queues the generation. Returns `{ jobId }`. |
| **GET** | `/:id/download` | Export exam sheet to PDF | Streams a PDF file directly in response. Query parameter `includeAnswers=true` attaches the marking scheme. |

### 📚 Library Routes (`/api/library`)

| Method | Endpoint | Description | Payload / Response |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Retrieve uploaded documents | Returns library item documents. |
| **POST** | `/upload` | Upload resource to library | **Multipart Form-Data**: file (`file` key, max **10MB**), category.<br>Returns created library item. |
| **DELETE**| `/:id` | Delete resource from library | Deletes file from filesystem and db. |

### 👤 Profile Routes (`/api/users/profile`)

| Method | Endpoint | Description | Payload / Response |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Retrieve school profile settings | Returns user's school information. |
| **PUT** | `/` | Update school profile settings | **JSON Body**: `schoolName`, `cbseCode`, `branch`. Returns updated profile. |

---

## 🚀 Setting Up the Service

### 1. File Configuration
Create a `.env` file inside the `backend` directory:
```env
PORT=4000
MONGODB_URI=mongodb+srv://<dbuser>:<dbpassword>@<dbcluster>.mongodb.net/ClassPilot?retryWrites=true&w=majority
REDIS_URL=redis://localhost:6379
GROQ_API_KEY=gsk_your_groq_api_key_here
```

### 2. Install & Launch
Make sure **Redis** and **MongoDB** are active, then run:
```bash
# Install dependencies
npm install

# Seed mock database entries (Optional)
npm run seed

# Run the TypeScript live reload server
npm run dev
```

### 3. Production Deployment
Compile the project to raw JavaScript and launch:
```bash
npm run build
npm start
```
The compiled files are generated in `backend/dist`.
