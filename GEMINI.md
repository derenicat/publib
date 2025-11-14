# GEMINI Project Context: Publib

## Project Overview

**Publib** is a "Social Library Platform" designed for users to create, rate, and review their personal book and movie libraries. It features a social feed for user interaction.

The project is structured as a monorepo with a `backend` and an empty `frontend` directory, indicating a full-stack application under development.

### Backend

The backend is a Node.js application built with the **MERN (MongoDB, Express.js, React, Node.js)** stack in mind. It follows a clean, 3-Tier Architecture to enforce **Separation of Concerns (SoC)**.

- **Technology Stack:**
  - **Runtime:** Node.js
  - **Framework:** Express.js
  - **Database:** MongoDB
  - **ODM:** Mongoose
  - **Authentication:** JWT (JSON Web Tokens) delivered via `HttpOnly` cookies.
  - **Security:** Passwords are not stored in the database, `bcrypt` is used for hashing.

- **Architecture:**
  - `Routes`: Handle URL definitions and forward requests to Controllers.
  - `Controllers`: Manage `req`/`res` objects and orchestrate business logic by calling Services.
  - `Services`: Contain the core business logic of the application.
  - `Repositories`: Encapsulate all data access logic using Mongoose.
  - `Models`: Define MongoDB collection schemas using Mongoose.
  - `Middlewares`: Used for centralized concerns like authentication (JWT validation) and error handling.

### Frontend

The `frontend` directory is currently empty.

**TODO:** A client application needs to be developed, likely using a modern JavaScript framework like **React**, to interact with the backend API.

## Building and Running

### Backend

To run the backend server for development:

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    `bash
    npm run dev
    `
    The server will run on the port specified in the `.env` file (defaults to 3000).

## Development Conventions

- **Directory Structure:** All backend source code is located in the `src/` directory, organized by architectural layer (e.g., `routes`, `controllers`, `services`).
- **File Naming:** Files are named using **camelCase** (e.g., `authRoutes.js`).
- **API Strategy:** The backend is designed to consume external APIs (like TMDb for movies and Google Books for books) and cache the retrieved data in its own MongoDB database to improve performance and avoid rate limiting.
- **Security:** The architecture explicitly forbids storing JWTs in `localStorage` to prevent XSS attacks, opting for secure `HttpOnly` cookies instead.
