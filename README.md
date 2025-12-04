# Publib - A Social Library Platform

Publib is a full-stack social platform where users can create, rate, and review their personal book and movie libraries, and share their activities through a dynamic social feed. This repository contains both the backend service and the frontend application.

## ✨ Key Features

### Backend & Core Logic

- **User Authentication:** Secure user registration, login, and logout using JWTs transmitted via `HttpOnly` cookies.
- **"Hybrid Search" & "Discover":** A dual-mode search system for both **Books (Google Books API)** and **Movies (TMDB API)**. "Discover" allows browsing the local database with advanced filtering, while "Hybrid Search" queries an external API and enriches the results with local data.
- **"Smart" Detail Endpoint:** Intelligently handles both local and external IDs, fetching and caching new media items on-the-fly to ensure data consistency.
- **Unified Reviews & Ratings:** Users can rate and review books and movies. The system denormalizes average ratings and counts onto media items for high-performance retrieval.
- **Scalable Follow System:** Users can follow and unfollow other users, establishing a social graph.
- **Activity Stream:** A central activity feed logs all significant user actions and allows for social interactions (likes, comments) on activity cards.
- **Type-Safe User Lists:** Users can create and manage custom lists specifically for books or movies. Default lists ("My Books", "My Movies") are automatically provisioned.
- **"Top Rated" Endpoints:** Dedicated, optimized API endpoints (`/top-5`) for fetching the highest-rated movies and books.

### Frontend & UX

- **Modern & Responsive UI:** Built with **React** and **Tailwind CSS**, featuring a dark-themed, clean, and mobile-responsive design.
- **Refined Homepage:** An interactive dashboard showcasing top-rated content with a seamless movie/book toggle.
- **Letterboxd-Style Discovery:** Advanced filtering in the Discovery section allowing users to browse by decades and specific years.
- **Optimistic UI:** Likes and follows update instantly on the interface for a snappy user experience, reverting gracefully on errors.
- **Interactive Activity Feed:** Users can comment on and like activities directly within the feed, with dynamic updates.
- **Toast Notifications:** Real-time feedback for user actions (success/error messages) using `react-hot-toast`.

## 🛠️ Tech Stack

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT)
- **Security:** `bcrypt`, `helmet`, `express-rate-limit`, `express-mongo-sanitize`, `xss-clean`.

### Frontend

- **Framework:** React (Vite)
- **Styling:** Tailwind CSS (v4)
- **Routing:** React Router DOM
- **State Management:** Context API (AuthContext), Local State
- **HTTP Client:** Axios (with interceptors for error handling)
- **Icons:** Heroicons
- **Notifications:** React Hot Toast

## 🏛️ Architecture

### Backend Architecture

The backend follows a strict **4-Tier Layered Architecture**:

1.  **Routes:** Define API endpoints and validation.
2.  **Controllers:** Handle request/response, utilize **Alias Middleware** for specialized queries.
3.  **Services:** Core business logic, external API integrations.
4.  **Repositories:** Database interactions using Mongoose.

### Frontend Architecture

The frontend is structured for modularity and reusability:

- **`pages/`**: Top-level route components (e.g., `HomePage`, `ProfilePage`, `DiscoveryPage`).
- **`components/`**: Reusable UI blocks.
  - `common/`: Generic components (Modals, Buttons).
  - `media/`: Media-specific components (`MediaHeader`, `ReviewCard`).
  - `feed/`: Activity feed components (`ActivityCard`).
- **`services/`**: API wrapper modules mirroring backend services (`authService`, `bookService`).
- **`context/`**: Global state providers (`AuthContext`).
- **`utils/`**: Helper functions (`helpers.js`).

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (Local or Atlas)
- TMDB API Key
- Google Books API Key (Optional but recommended)

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/derenicat/publib.git
    cd publib
    ```

2.  **Backend Setup**

    ```bash
    cd backend
    npm install
    cp .env.example .env
    # Configure your .env file with DB string and API keys
    npm run dev
    ```

3.  **Frontend Setup**

    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```

4.  **Access the App**
    Open your browser and navigate to `http://localhost:5173` (or the port Vite exposes).

## ↔️ Key API Endpoints

- **Auth:** `/api/auth/register`, `/api/auth/login`
- **Media:** `/api/books/search`, `/api/movies/top-5`, `/api/movies/:identifier`
- **Social:** `/api/feed`, `/api/feed/:id/comments`, `/api/users/:id/follow`
- **Lists:** `/api/lists`, `/api/library-entries`
