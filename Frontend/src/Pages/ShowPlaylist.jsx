import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  XMarkIcon,
  TrashIcon,
  MusicalNoteIcon,
  PlayIcon,
} from "@heroicons/react/24/solid";

const ShowPlaylist = () => {
  const [playlists, setPlaylists] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylists = async () => {
      const userid = localStorage.getItem("userid");
      try {
        const response = await fetch(`http://localhost:4444/api/getplaylists/${userid}`);
        const data = await response.json();
        setPlaylists(data);
      } catch (err) {
        console.error("Error fetching playlists:", err);
      }
    };
    fetchPlaylists();
  }, []);

  const deletePlaylist = async (Id)=>{
    try{
      const response = await fetch("http://localhost:4444/api/deleteplaylist" , {
        method:"DELETE",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ id: Id }),
      });
      if(response.ok){
        setPlaylists((prev) => prev.filter((p) => p.id !== Id));
      }
    }catch(err){
      console.error("Error : ", err);
    }
  }

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
        
        <nav className="flex-1 px-4 space-y-2 text-left">
          <button onClick={() => navigate("/dashboard")} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-neutral-400 hover:bg-neutral-900 hover:text-white transition text-left">
            <MagnifyingGlassIcon className="w-5 h-5" />
            <span className="font-medium">Search</span>
          </button>
          <button onClick={() => navigate("/showplaylist")} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-neutral-800 text-white text-left">
            <PlusIcon className="w-5 h-5" />
            <span className="font-medium">Playlists</span>
          </button>
          <button onClick={() => navigate("/showFavourites")} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-neutral-400 hover:bg-neutral-900 hover:text-white transition text-left">
            <HeartIcon className="w-5 h-5" />
            <span className="font-medium">Favourites</span>
          </button>
        </nav>

        <div className="p-4 border-t border-neutral-800 text-left">
          <div className="flex items-center space-x-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center text-xs font-bold">
              {localStorage.getItem("username")?.charAt(0) || "U"}
            </div>
            <span className="flex-1 truncate text-sm font-medium text-left">{localStorage.getItem("username") || "User"}</span>
            <button onClick={handleSignOut} title="Sign Out">
              <XMarkIcon className="w-5 h-5 text-neutral-500 hover:text-white transition" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8 text-left">
        <header className="max-w-5xl mx-auto mb-12 flex justify-between items-end">
          <div className="text-left">
            <h2 className="text-4xl font-extrabold tracking-tight mb-2 text-left">Your Playlists</h2>
            <p className="text-neutral-500 font-medium text-left">Manage and explore your collections</p>
          </div>
          <button 
            onClick={() => navigate("/createplaylist")}
            className="bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded-2xl transition flex items-center space-x-2 shadow-lg shadow-green-500/20 text-left"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Create New</span>
          </button>
        </header>

        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-left">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="group relative bg-neutral-900 border border-neutral-800 p-5 rounded-3xl hover:bg-neutral-800 hover:border-neutral-700 transition-all cursor-pointer shadow-xl text-left"
              onClick={() => navigate(`/playlist/${playlist.id}`)}
            >
              <div className="aspect-square bg-neutral-800 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden text-left">
                <MusicalNoteIcon className="w-16 h-16 text-neutral-700 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-left">
                  <PlayIcon className="w-12 h-12 text-white" />
                </div>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg truncate mb-1 text-left">{playlist.name}</h3>
                <p className="text-xs text-neutral-500 font-medium text-left">{playlist.tracks?.length || 0} tracks</p>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deletePlaylist(playlist.id);
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-black transition text-left"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}

          {playlists.length === 0 && (
            <div className="col-span-full py-20 text-center text-left">
              <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6 text-left">
                <MusicalNoteIcon className="w-10 h-10 text-neutral-700" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-left">No playlists yet</h3>
              <p className="text-neutral-500 mb-8 text-left">Create your first playlist to start organizing your music</p>
              <button 
                onClick={() => navigate("/createplaylist")}
                className="text-green-500 font-bold hover:underline text-left"
              >
                Create a playlist
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ShowPlaylist
