# Publib - A Social Library Platform

Publib is a web-based social platform where users can create, rate, and review their personal book and movie libraries, and share their activities through a social feed. This project is the backend service that powers the Publib application.

## ✨ Key Features

- **User Authentication:** Secure user registration, login, and logout using JWTs transmitted via `HttpOnly` cookies.
- **Advanced Password Management:** Robust password update and reset functionality with secure token handling.
- **Token Blacklisting:** JWTs are blacklisted upon logout to prevent reuse, enhancing session security.
- **User Profiles:** Publicly discoverable user profiles with options for private data.
- **"Hybrid Search" & "Discover":** A dual-mode search system. "Discover" allows browsing the local database with advanced filtering, while "Hybrid Search" queries an external API (Google Books) and enriches the results with local data.
- **"Get-or-Create" Caching:** A "smart" detail endpoint (`/api/books/:id`) intelligently handles both local and external IDs, fetching and caching new books on-the-fly to ensure data consistency.
- **Custom User Lists:** Users can create and manage custom, shareable lists (e.g., "Favorite Sci-Fi Books").
- **Library Management:** Functionality to add books to user-created lists with different statuses ('READ', 'READING', 'WANT_TO_READ').
- **Layered Architecture & SoC:** Clean, maintainable, and scalable code following a 4-Tier Separation of Concerns (Routes, Controllers, Services, Repositories).
- **Robust Security:** Rate limiting, security headers (Helmet), data sanitization against NoSQL injection and XSS attacks, and role-based access control (RBAC).

*(Planned features include a social feed, advanced ratings/reviews, and a follow system.)*

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT)
- **Security:** `bcrypt` for password hashing, `helmet`, `express-rate-limit`, `express-mongo-sanitize`, `xss-clean`.
- **Validation:** `express-validator` for robust input validation.

## 🏛️ Architecture

The backend follows a strict **4-Tier Layered Architecture** to ensure a clean separation of concerns.

1.  **Routes (`/routes`):** Define API endpoints and forward requests to controllers. Also integrates validation middleware.
2.  **Controllers (`/controllers`):** Handle request/response objects, orchestrate business logic by calling services. Strictly no business logic here.
3.  **Services (`/services`):** Contain the core, framework-agnostic business logic of the application.
4.  **Repositories (`/repositories`):** Abstract all database interactions using Mongoose. This is the only layer that interacts with the database.

This structure makes the application easy to test, maintain, and scale. Key architectural patterns like **Data Enrichment**, **"Get-or-Create" Caching**, and **Centralized Error Handling** are implemented to create a robust and efficient system.

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
    Now, open the `.env` file and add your configuration values (e.g., database connection string, JWT secret, Google Books API Key).

4.  **Run the development server**
    ```bash
    npm run dev
    ```
    The server will start on the port defined in your `.env` file (defaults to 3000).

## ↔️ API Endpoints

Here is a summary of the main implemented endpoints.

| Method  | Endpoint                        | Protected? | Description                                                 |
| :------ | :------------------------------ | :--------: | :---------------------------------------------------------- |
| `POST`  | `/api/auth/register`            |     ❌      | Creates a new user account.                                 |
| `POST`  | `/api/auth/login`               |     ❌      | Logs a user in and sets an `HttpOnly` cookie.               |
| `POST`  | `/api/auth/logout`              |     ✅      | Logs a user out and blacklists the token.                   |
| `POST`  | `/api/auth/forgot-password`     |     ❌      | Initiates the password reset process.                       |
| `PATCH` | `/api/auth/reset-password/:token` |     ❌      | Resets the user's password with a valid token.              |
| `GET`   | `/api/users`                    |     ❌      | Retrieves a list of all active users.                       |
| `GET`   | `/api/users/:id`                |     ❌      | Retrieves the public profile of a single user.              |
| `GET`   | `/api/users/me`                 |     ✅      | Retrieves the profile of the logged-in user.                |
| `PATCH` | `/api/users/me`                 |     ✅      | Updates the profile data of the logged-in user.             |
| `PATCH`| `/api/users/update-my-password`|     ✅      | Updates the password of the logged-in user.                 |
| `DELETE`| `/api/users/me`                 |     ✅      | Deactivates the logged-in user's account.                   |
| `GET`   | `/api/books/search`             |     ❌      | Searches for new books via the "Hybrid Search" flow.        |
| `GET`   | `/api/books`                    |     ❌      | Discovers existing books in the local DB.                   |
| `GET`   | `/api/books/:id`                |     ❌      | Gets book details via the "Smart Detail" endpoint.          |
| `GET`   | `/api/lists`                    |     ✅      | Gets all lists for the logged-in user.                      |
| `POST`  | `/api/lists`                    |     ✅      | Creates a new custom list.                                  |
| `GET`   | `/api/lists/:id`                |     ✅ / ❌     | Gets a specific list (public or private if owner/admin).    |
| `DELETE`| `/api/lists/:id`                |     ✅      | Deletes a list (owner/admin only).                          |
| `POST`  | `/api/library-entries`          |     ✅      | Adds a book to a user's list.                               |
| `GET`   | `/api/library-entries/list/:listId`| ✅      | Gets all entries for a specific list.                       |
| `DELETE`| `/api/library-entries/:id`      |     ✅      | Removes an entry from a list (owner/admin only).            |


