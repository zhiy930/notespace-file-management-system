# NoteSpace

NoteSpace is a full-stack note and task management web application designed to help users organize their notes, to-do lists, folders, and daily activities in one place.

## Features

- Create, edit, and delete notes
- Create, edit, complete, and delete to-do tasks
- Pin important tasks
- Organize notes and tasks into folders
- Calendar-based task viewing
- Home dashboard with upcoming and pinned tasks
- Responsive beige/cream user interface
- Persistent data storage using SQLite

## Tech Stack

### Frontend
- Vue.js
- Vite
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js
- SQLite
- CORS

## Project Structure

    notespace-file-management-system/
    ├── backend/
    │   ├── database.js
    │   ├── server.js
    │   ├── package.json
    │   └── package-lock.json
    │
    ├── frontend/
    │   ├── src/
    │   │   ├── App.vue
    │   │   └── style.css
    │   ├── package.json
    │   └── package-lock.json
    │
    ├── .gitignore
    └── README.md

## Installation

### 1. Clone the repository

    git clone https://github.com/zhiy930/notespace-file-management-system.git

### 2. Install backend dependencies

    cd backend
    npm install

### 3. Start the backend

    node server.js

The backend runs on:

    http://localhost:3000

### 4. Install frontend dependencies

Open another terminal:

    cd frontend
    npm install

### 5. Start the frontend

    npm run dev

The frontend runs on:

    http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | /api/notes | Get all notes |
| POST | /api/notes | Create a note |
| PUT | /api/notes/:id | Update a note |
| DELETE | /api/notes/:id | Delete a note |
| GET | /api/todos | Get all tasks |
| POST | /api/todos | Create a task |
| PUT | /api/todos/:id | Update a task |
| PATCH | /api/todos/:id/pin | Pin or unpin a task |
| DELETE | /api/todos/:id | Delete a task |
| GET | /api/folders | Get all folders |
| POST | /api/folders | Create a folder |

## Database

NoteSpace uses SQLite for local data storage.

The database and required tables are automatically created when the backend starts.

## AI-Assisted Development

AI tools were used as a development assistant during this project. AI-generated suggestions were reviewed, modified, implemented, and manually tested before being included in the application.

### Example 1 — To-Do Update Function

**Prompt:**  
Asked for help implementing and debugging the ability to edit existing to-do tasks.

**AI suggestion:**  
Suggested creating an update API endpoint and connecting the Vue edit modal to the backend.

**Verification and modification:**  
The API was manually tested and frontend console errors were debugged before the feature was considered complete.

### Example 2 — Pin Task Feature

**Prompt:**  
Asked how to add the ability to pin important tasks.

**AI suggestion:**  
Suggested adding a `pinned` field to the SQLite database and creating a PATCH endpoint.

**Verification and modification:**  
The database migration was implemented and the endpoint was manually tested using PowerShell before connecting it to the frontend.

### Example 3 — UI Improvements

**Prompt:**  
Asked for improvements to the home dashboard and beige/cream visual design.

**AI suggestion:**  
Suggested layouts and CSS styling for pinned tasks, calendar elements, task cards, and dashboard components.

**Verification and modification:**  
The generated styling was adjusted and tested in the browser to maintain consistency with the intended NoteSpace design.

## Future Improvements

- User authentication
- Search functionality
- Task reminders and notifications
- Drag-and-drop task organization
- Cloud database support
- Dark mode

## Author

Developed by Yan Zhi.