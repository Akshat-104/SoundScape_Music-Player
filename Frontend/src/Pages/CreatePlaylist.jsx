import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  XMarkIcon,
  MusicalNoteIcon,
} from "@heroicons/react/24/solid";

const CreatePlaylist = () => {
  const [playlists,setPlaylists] = useState([]);
  const [message , setMessage] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleCreate = async ()=>{
    const newvalue = inputRef.current.value.trim();
    if (!newvalue) return;
    const userid = localStorage.getItem("userid");
    try{
      const response = await fetch("http://localhost:4444/api/playlist" , {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          name: newvalue,
          userId: Number(userid)
        }),
      });
      const create = await response.json();
      setPlaylists([...playlists , create]);
      setMessage("Playlist created successfully!");
      inputRef.current.value = "";
      setTimeout(() => {
        navigate("/showplaylist");
      }, 1500);
    }catch (err) {
      console.error("Error creating playlist:", err);
      setMessage("Error creating playlist. Please try again.");
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
      <aside className="w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col fixed h-full text-left">
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
            <span className="flex-1 truncate text-sm font-medium">{localStorage.getItem("userName") || "User"}</span>
            <button onClick={handleSignOut} title="Sign Out">
              <XMarkIcon className="w-5 h-5 text-neutral-500 hover:text-white transition" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8 flex items-center justify-center text-left">
        <div className="max-w-xl w-full text-left">
          <div className="bg-neutral-900 border border-neutral-800 p-10 rounded-[3rem] shadow-2xl text-left">
            <div className="w-20 h-20 bg-neutral-800 rounded-3xl flex items-center justify-center mb-8 mx-auto text-left">
              <MusicalNoteIcon className="w-10 h-10 text-green-500" />
            </div>
            
            <h2 className="text-3xl font-black text-center mb-2 tracking-tight text-left">Create Playlist</h2>
            <p className="text-neutral-500 text-center mb-10 text-left">Give your new collection a name</p>

            <div className="space-y-6 text-left">
              <div className="text-left">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 ml-4 mb-2 block text-left">
                  Playlist Name
                </label>
                <input
                  type="text"
                  ref={inputRef}
                  autoFocus
                  placeholder="e.g. Chill Vibes 2024"
                  className="w-full px-6 py-4 bg-black border border-neutral-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder:text-neutral-700 text-lg text-left"
                />
              </div>

              <button
                onClick={handleCreate}
                className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-neutral-200 transition-all active:scale-[0.98] shadow-lg shadow-white/5 text-left"
              >
                Create Playlist
              </button>

              {message && (
                <div className={`mt-4 px-4 py-3 rounded-xl text-center text-sm font-bold ${
                  message.includes("Error") ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => navigate("/showplaylist")}
            className="mt-8 w-full text-neutral-500 hover:text-white transition font-medium flex items-center justify-center space-x-2 text-left"
          >
            <span>Back to Playlists</span>
          </button>
        </div>
      </main>
    </div>
  )
}

export default CreatePlaylist
