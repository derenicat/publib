# Publib - A Social Library Platform

Publib is a web-based social platform where users can create, rate, and review their personal book and movie libraries, and share their activities through a social feed. This project is the backend service that powers the Publib application.

## ✨ Key Features

- **User Authentication:** Secure user registration, login, and logout using JWTs transmitted via `HttpOnly` cookies.
- **Advanced Password Management:** Robust password update and reset functionality with secure token handling.
- **Token Blacklisting:** JWTs are blacklisted upon logout to prevent reuse, enhancing session security.
- **User Profiles:** Publicly discoverable user profiles with options for private data and follow statistics.
- **"Hybrid Search" & "Discover":** A dual-mode search system for both **Books (Google Books API)** and **Movies (TMDB API)**. "Discover" allows browsing the local database with advanced filtering, while "Hybrid Search" queries an external API and enriches the results with local data.
- **"Smart" Detail Endpoint & Get-or-Create Caching:** A "smart" detail endpoint (`/api/{media}/:identifier`) intelligently handles both local and external IDs, fetching and caching new media items (books/movies) on-the-fly to ensure data consistency.
- **Unified Reviews & Ratings:** Users can rate and review books and movies. The system denormalizes average ratings and counts onto media items for high-performance retrieval.
- **Scalable Follow System:** Users can follow and unfollow other users, establishing a social graph.
- **Activity Stream:** A central activity feed logs all significant user actions (reviews, list additions, follows) and allows for social interactions (likes, comments) on activity cards.
- **Type-Safe User Lists:** Users can create and manage custom lists specifically for books ("My Books") or movies ("My Movies"), ensuring data integrity. New users are automatically provisioned with default "My Books" and "My Movies" lists.
- **RESTful List Management:** User list endpoints are aligned with REST standards, providing clear separation for global public lists, user-specific lists, and individual list details.
- **Layered Architecture & SoC:** Clean, maintainable, and scalable code following a 4-Tier Separation of Concerns (Routes, Controllers, Services, Repositories).
- **Robust Security:** Rate limiting, security headers (Helmet), data sanitization against NoSQL injection and XSS attacks, and role-based access control (RBAC).

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

This structure makes the application easy to test, maintain, and scale. Key architectural patterns like **Data Enrichment**, **"Smart" Detail Endpoint & Get-or-Create Caching**, **Centralized Configuration**, **In-Memory Caching**, **Polymorphic Associations**, **Embedded Data Model (for Activity Interactions)** and **Type-Safe Lists** are implemented to create a robust and efficient system.

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
    Now, open the `.env` file and add your configuration values (e.g., database connection string, JWT secret, Google Books API Key, TMDB API Key).

4.  **Run the development server**
    ```bash
    npm run dev
    ```
    The server will start on the port defined in your `.env` file (defaults to 3000).

## ↔️ API Endpoints

Here is a summary of the main implemented endpoints. For a detailed guide, please refer to `documents/backend/POSTMAN_API_GUIDE.md`.

### Authentication & User Management
| Method  | Endpoint                        | Protected? | Description                                                 |
| :------ | :------------------------------ | :--------: | :---------------------------------------------------------- |
| `POST`  | `/api/auth/register`            |     ❌      | Creates a new user account and provisions default lists.    |
| `POST`  | `/api/auth/login`               |     ❌      | Logs a user in and sets an `HttpOnly` cookie.               |
| `POST`  | `/api/auth/logout`              |     ✅      | Logs a user out and blacklists the token.                   |
| `POST`  | `/api/auth/forgot-password`     |     ❌      | Initiates the password reset process.                       |
| `PATCH` | `/api/auth/reset-password/:token` |     ❌      | Resets the user's password with a valid token.              |
| `GET`   | `/api/users`                    |     ❌      | Retrieves a list of all active users.                       |
| `GET`   | `/api/users/:detailPageId`      |     ❌      | Retrieves the public profile of a single user.              |
| `GET`   | `/api/users/me`                 |     ✅      | Retrieves the profile of the logged-in user.                |
| `PATCH` | `/api/users/me`                 |     ✅      | Updates the profile data of the logged-in user.             |
| `PATCH`| `/api/users/update-my-password`|     ✅      | Updates the password of the logged-in user.                 |
| `DELETE`| `/api/users/me`                 |     ✅      | Deactivates the logged-in user's account.                   |

### Follow System
| Method  | Endpoint                        | Protected? | Description                                                 |
| :------ | :------------------------------ | :--------: | :---------------------------------------------------------- |
| `POST`  | `/api/users/:detailPageId/follow` |     ✅      | Follows the user with the specified ID.                     |
| `DELETE`| `/api/users/:detailPageId/follow` |     ✅      | Unfollows the user with the specified ID.                   |
| `GET`   | `/api/users/me/followers`       |     ✅      | Gets the followers of the logged-in user.                   |
| `GET`   | `/api/users/me/following`       |     ✅      | Gets the users followed by the logged-in user.              |
| `GET`   | `/api/users/:detailPageId/followers`|     ❌      | Gets the followers of a specific user.                      |
| `GET`   | `/api/users/:detailPageId/following`|     ❌      | Gets the users followed by a specific user.                 |
| `GET`   | `/api/users/:detailPageId/follow-stats`|     ❌      | Gets the follower/following counts for a user.              |

### Media (Books & Movies)
| Method  | Endpoint                        | Protected? | Description                                                 |
| :------ | :------------------------------ | :--------: | :---------------------------------------------------------- |
| `GET`   | `/api/books/search`             |     ❌      | Searches for new books via Google Books API.                |
| `GET`   | `/api/books`                    |     ❌      | Discovers existing books in the local DB.                   |
| `GET`   | `/api/books/:identifier`        |     ❌      | Gets book details via the "Smart Detail" endpoint.          |
| `GET`   | `/api/movies/search`            |     ❌      | Searches for new movies via TMDB API.                       |
| `GET`   | `/api/movies`                   |     ❌      | Discovers existing movies in the local DB.                  |
| `GET`   | `/api/movies/:identifier`       |     ❌      | Gets movie details via the "Smart Detail" endpoint.         |

### Reviews
| Method  | Endpoint                        | Protected? | Description                                                 |
| :------ | :------------------------------ | :--------: | :---------------------------------------------------------- |
| `POST`  | `/api/reviews`                  |     ✅      | Creates a new review for a book or movie.                   |
| `GET`   | `/api/reviews`                  |     ❌      | Gets all reviews. Supports filtering by item or user.       |
| `GET`   | `/api/reviews/:reviewId`        |     ❌      | Gets a single review by its ID.                             |
| `PATCH` | `/api/reviews/:reviewId`        |     ✅      | Updates your own review.                                    |
| `DELETE`| `/api/reviews/:reviewId`        |     ✅      | Deletes your own review.                                    |

### User Lists & Library Entries
| Method  | Endpoint                        | Protected? | Description                                                 |
| :------ | :------------------------------ | :--------: | :---------------------------------------------------------- |
| `POST`  | `/api/lists`                    |     ✅      | Creates a new type-safe custom list.                        |
| `GET`   | `/api/lists`                    |     ❌      | Gets all **public** lists on the platform.                  |
| `GET`   | `/api/lists/me`                 |     ✅      | Gets all lists (public & private) for the logged-in user.   |
| `GET`   | `/api/lists/user/:detailPageId` |     ❌      | Gets all **public** lists for a specific user.              |
| `GET`   | `/api/lists/:id`                |     ❓      | Gets a single list (public or private if owner/admin).      |
| `DELETE`| `/api/lists/:id`                |     ✅      | Deletes a list (default lists cannot be deleted).           |
| `POST`  | `/api/library-entries`          |     ✅      | Adds a book/movie to a specific type-safe list.             |
| `GET`   | `/api/library-entries/list/:listId`| ✅      | Gets all entries for a specific list.                       |
| `DELETE`| `/api/library-entries/:id`      |     ✅      | Removes an entry from a list.                               |

### Activity Feed
| Method  | Endpoint                        | Protected? | Description                                                 |
| :------ | :------------------------------ | :--------: | :---------------------------------------------------------- |
| `GET`   | `/api/feed`                     |     ❌      | Gets the global activity feed.                              |
| `GET`   | `/api/feed/me`                  |     ✅      | Gets the personal activity feed for the logged-in user.     |
| `GET`   | `/api/feed/social`              |     ✅      | Gets the social feed (activities from followed users).      |
| `GET`   | `/api/feed/users/:detailPageId` |     ❌      | Gets the personal activity feed for a specific user.        |
| `POST`  | `/api/feed/:id/like`            |     ✅      | Toggles a like on an activity.                              |
| `POST`  | `/api/feed/:id/comments`        |     ✅      | Adds a comment to an activity.                              |
| `DELETE`| `/api/feed/:id/comments/:commentId`| ✅      | Deletes a comment from an activity.                         ||


