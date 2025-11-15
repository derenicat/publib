# Publib - A Social Library Platform

Publib is a web-based social platform where users can create, rate, and review their personal book and movie libraries, and share their activities through a social feed. This project is the backend service that powers the Publib application.

## ✨ Key Features

- **User Authentication:** Secure user registration, login, and logout using JWTs transmitted via `HttpOnly` cookies.
- **Password Management:** Robust password update and reset functionality.
- **User Profiles:** Publicly discoverable user profiles.
- **Advanced API Queries:** Feature-rich API with support for filtering, sorting, pagination, and field limiting.
- **Book & Movie Library Management:** (In Progress) Functionality to add, manage, and categorize books and movies in user libraries.
- **Custom User Lists:** (In Progress) Ability for users to create and manage custom, shareable lists (e.g., "Favorite Sci-Fi Books").
- **Security:** Rate limiting, security headers (Helmet), and data sanitization against NoSQL injection and XSS attacks.
- **Layered Architecture:** Clean, maintainable, and scalable code following Separation of Concerns (SoC).

*(Planned features include a social feed, advanced ratings/reviews, and a follow system.)*

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT)
- **Security:** `bcrypt` for password hashing, `helmet`, `express-rate-limit`, `express-mongo-sanitize`, `xss-clean`.

## 🏛️ Architecture

The backend follows a classic **Layered Architecture** to ensure a clean separation of concerns.

1.  **Routes:** Define API endpoints and forward requests to controllers.
2.  **Controllers:** Handle request/response objects and orchestrate business logic.
3.  **Services:** Contain the core business logic of the application.
4.  **Repositories:** Abstract all database interactions, providing a clean data access layer.

This structure makes the application easy to test, maintain, and scale. For more details, see the [Architecture Document](./backend/documents/ARCHITECTURE.md).

## 🚀 Getting Started

To get the backend server running locally, follow these steps:

1.  **Clone the repository**
    ```bash
    git clone https://github.com/derenicat/publib.git
    cd publib/backend
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up environment variables**
    Create a `.env` file inside the `backend` directory and fill it out according to the provided example:
    ```bash
    cp .env.example .env
    ```
    Now, open the `.env` file and add your configuration values (e.g., database connection string, JWT secret).

4.  **Run the development server**
    ```bash
    npm run dev
    ```
    The server will start on the port defined in your `.env` file (defaults to 3000).

## ↔️ API Endpoints

Here is a summary of the main implemented endpoints. For a full overview, see the [User Flow Document](./backend/documents/AUTH_USER_FLOW.md).

| Method  | Endpoint                        | Protected? | Description                                      |
| :------ | :------------------------------ | :--------: | :----------------------------------------------- |
| `POST`  | `/api/auth/register`            |     ❌      | Creates a new user account.                      |
| `POST`  | `/api/auth/login`               |     ❌      | Logs a user in and sets an `HttpOnly` cookie.    |
| `POST`  | `/api/auth/logout`              |     ✅      | Logs a user out by clearing the cookie.          |
| `POST`  | `/api/auth/forgot-password`     |     ❌      | Initiates the password reset process.            |
| `PATCH` | `/api/auth/reset-password/:token` |     ❌      | Resets the user's password with a valid token.   |
| `GET`   | `/api/users`                    |     ❌      | Retrieves a list of all active users.            |
| `GET`   | `/api/users/:id`                |     ❌      | Retrieves the public profile of a single user.   |
| `GET`   | `/api/users/me`                 |     ✅      | Retrieves the profile of the logged-in user.     |
| `PATCH` | `/api/users/me`                 |     ✅      | Updates the profile of the logged-in user.       |
| `GET`   | `/api/lists`                    |     ✅      | (Planned) Get all lists for the logged-in user.  |
| `POST`  | `/api/lists`                    |     ✅      | (Planned) Create a new custom list.              |
| `POST`  | `/api/library-entries`          |     ✅      | (Planned) Add a book/movie to a list.            |

---
*This project was originally specified in the [PROJECT_DOCUMENT.pdf](./backend/documents/PROJECT_DOCUMENT.pdf).*
