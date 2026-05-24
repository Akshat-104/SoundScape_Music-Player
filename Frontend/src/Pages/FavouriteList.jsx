import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  XMarkIcon,
  MusicalNoteIcon,
} from "@heroicons/react/24/solid";

const FavouriteList = () => {
  const [favourites, setFavourites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylists = async () => {
      const userid = localStorage.getItem("userid");
      try {
        const response = await fetch(`http://localhost:4444/api/getfavourite/${userid}`);
        const data = await response.json();
        setFavourites(data);
      } catch (err) {
        console.error("Error fetching playlists:", err);
      }
    };
    fetchPlaylists();
  }, []);

  const handleSignOut = async()=>{
    await fetch(`http://localhost:4444/api/signout` , { method:"POST" });
    localStorage.removeItem("token");
    localStorage.removeItem("userid");
    localStorage.removeItem("userName");
    navigate("/");
  }

  return (
    <div className="bg-black min-h-screen flex text-white font-sans text-left">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col fixed h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            SoundScape
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => navigate("/dashboard")} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-neutral-400 hover:bg-neutral-900 hover:text-white transition text-left">
            <MagnifyingGlassIcon className="w-5 h-5" />
            <span className="font-medium">Search</span>
          </button>
          <button onClick={() => navigate("/showplaylist")} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-neutral-400 hover:bg-neutral-900 hover:text-white transition text-left">
            <PlusIcon className="w-5 h-5" />
            <span className="font-medium">Playlists</span>
          </button>
          <button onClick={() => navigate("/showFavourites")} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-neutral-800 text-white text-left">
            <HeartIcon className="w-5 h-5" />
            <span className="font-medium">Favourites</span>
          </button>
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <div className="flex items-center space-x-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center text-xs font-bold">
              {localStorage.getItem("username")?.charAt(0) || "U"}
            </div>
            <span className="flex-1 truncate text-sm font-medium">{localStorage.getItem("username") || "User"}</span>
            <button onClick={handleSignOut} title="Sign Out">
              <XMarkIcon className="w-5 h-5 text-neutral-500 hover:text-white transition" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        <header className="max-w-5xl mx-auto mb-12">
          <h2 className="text-4xl font-extrabold tracking-tight mb-2 text-left">Your Favourites</h2>
          <p className="text-neutral-500 font-medium text-left">All your loved tracks in one place</p>
        </header>

        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favourites.map((favourite) => (
            <div
              key={favourite.id}
              className="group relative bg-neutral-900 border border-neutral-800 p-5 rounded-3xl hover:bg-neutral-800 hover:border-neutral-700 transition-all cursor-pointer shadow-xl text-left"
              onClick={() => navigate(`/favourite/${favourite.id}`)}
            >
              <div className="aspect-square bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden text-left">
                <HeartIcon className="w-16 h-16 text-white/80 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg truncate mb-1 text-left">{favourite.name}</h3>
                <p className="text-xs text-neutral-500 font-medium text-left">Your special collection</p>
              </div>
            </div>
          ))}

          {favourites.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6 text-left">
                <HeartIcon className="w-10 h-10 text-neutral-700" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-left">No favourites found</h3>
              <p className="text-neutral-500 text-left">Start hearting tracks to see them here!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default FavouriteList
