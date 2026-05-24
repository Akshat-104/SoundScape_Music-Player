# SoundScape - Music Player 🎵

A full-stack music management application that allows users to search for tracks using Spotify metadata, fetch playback links via YouTube, and manage their personal playlists and favorites.

## 🚀 Features

- **User Authentication:** Secure sign-up and login using JWT and Bcrypt.
- **Track Search:** Search for music using the Spotify API for rich metadata (title, artist, album art).
- **Automated Playback Links:** Automatically fetches YouTube video links for any searched track to enable playback.
- **Playlist Management:** Create, view, and delete custom playlists.
- **Favorites:** Add tracks to a "Favorites" list for quick access.
- **Responsive UI:** A modern, responsive interface built with React and Tailwind CSS.
- **Protected Routes:** Ensures user data is only accessible to authenticated users.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **Icons:** Heroicons
- **Components:** Headless UI
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JSON Web Tokens (JWT) & Bcrypt
- **APIs:** Spotify Web API, YouTube Data API v3

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [PostgreSQL](https://www.postgresql.org/)
- A Spotify Developer account (to get `CLIENT_ID` and `CLIENT_SECRET`)
- A Google Cloud project with YouTube Data API v3 enabled (to get `YOUTUBE_KEY`)

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd MusicPlayer
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Backend` folder and add the following:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
   JWT_SECRET="your_jwt_secret_here"
   SPOTIFY_CLIENT_ID="your_spotify_client_id"
   SPOTIFY_CLIENT_SECRET="your_spotify_client_secret"
   YOUTUBE_KEY="your_youtube_api_key"
   PORT=4444
   ```
4. Run Prisma migrations to set up your database schema:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Generate the Prisma client:
   ```bash
   npx prisma generate
   ```
6. Start the backend server:
   ```bash
   node index.js
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) If you need to change the API URL, update the Axios base configurations in your source files.
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📖 Usage

1. **Sign Up / Login:** Create a new account or log in with existing credentials.
2. **Dashboard:** Explore your playlists and favorites.
3. **Search:** Use the search bar to find tracks. When you find a track, you can add it to your library.
4. **Playlists:** Create a new playlist and add tracks to it.
5. **Favorites:** Click the heart icon on any track to add it to your Favorites list.

## 📁 Project Structure

```
MusicPlayer/
├── Backend/
│   ├── prisma/             # Database schema and migrations
│   ├── middleware/         # Auth middleware
│   ├── index.js            # Main Express server
│   └── ...
└── Frontend/
    ├── src/
    │   ├── Pages/          # React components for each route
    │   ├── App.jsx         # Main routing and app structure
    │   └── ...
    └── ...
```

## 📄 License

This project is licensed under the ISC License.
