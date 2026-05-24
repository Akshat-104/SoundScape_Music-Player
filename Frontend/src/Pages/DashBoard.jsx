import React, { useState, useRef, useEffect } from "react";
import "@tailwindplus/elements";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  XMarkIcon,
  ArrowPathIcon,
  HeartIcon,
  ArrowPathRoundedSquareIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

const DashBoard = () => {
  const [trackKey , setTrackKey] = useState(null);
  const [idCheck,setIdCheck] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  // Results and active track
  const [results, setResults] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeSnippet, setActiveSnippet] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [favourites, setFavourites] = useState([]);
  const [isLooping , setIsLooping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dashboardSkipControl , setDashboardSkipControl] = useState(false);

  // Player state
  const [showPopup, setShowPopup] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0–100
  const [time, setTime] = useState(0); // seconds
  const [duration, setDuration] = useState(0); // seconds
  const [volume, setVolume] = useState(60); // 0–100
  const [showFavs, setShowFavs] = useState(false);


  const playerRef = useRef(null);

  const toggleFavourite = async (track)=>{
    // console.log(favourites);
    const Id = favourites[0].id;
    var Order = 1;
     const res = await fetch(`http://localhost:4444/api/favourite/${Id}`);
     const data = await res.json();
     Order = data.tracks.length + 1;
      await fetch(`http://localhost:4444/api/favourites/${Id}/track`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        Favouriteid: Id,
        userId:favourites[0].userId,
        trackId:track,
        order:Order
      }),
    });
    console.log(favourites);
  }
const userId = localStorage.getItem("userid");
     // fetch favourite songs
  const fetchFavourites = async () => {
    try {
      const res = await fetch(`http://localhost:4444/api/favourites/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setFavourites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching favourites:", err);
    }
  };

  const isLoopingRef = useRef(isLooping);
useEffect(() => {
  isLoopingRef.current = isLooping;
}, [isLooping]);

const handleStateChange = (event)=>{
  if (event.data === window.YT.PlayerState.ENDED) {
    if (isLoopingRef.current) {
      // reload same video cleanly
      event.target.stopVideo();
      event.target.seekTo(0);
      event.target.playVideo(); // ensure playback starts
    } else {
      skipNext();
    }
  } else if (event.data === window.YT.PlayerState.PLAYING) {
    setIsPlaying(true);
  } else if (event.data === window.YT.PlayerState.PAUSED) {
    setIsPlaying(false);
  }
}
  // Create/destroy player when popup opens or activeVideo changes
  useEffect(() => {
    let waitInterval;

    const createPlayer = () => {
      if (!activeVideo || !showPopup) return;
      if (!window.YT || !window.YT.Player) return; // guard until script ready

      playerRef.current = new window.YT.Player("yt-player", {
        videoId: activeVideo,
        playerVars: {
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            const total = Math.floor(event.target.getDuration() || 0);
            setDuration(total);
            event.target.setVolume(volume);
            event.target.playVideo();
            setIsPlaying(true);
          },
          onStateChange: handleStateChange
        },
      });
    };

    // If YT isn't ready yet, wait briefly
    if (activeVideo && showPopup) {
      if (window.YT && window.YT.Player) {
        createPlayer();
      } else {
        waitInterval = setInterval(() => {
          if (window.YT && window.YT.Player) {
            clearInterval(waitInterval);
            createPlayer();
          }
        }, 200);
      }
    }

    return () => {
      clearInterval(waitInterval);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [activeVideo, showPopup]);

  // Update progress/time every second while playing
  useEffect(() => {
    let interval;
    if (isPlaying && playerRef.current) {
      interval = setInterval(() => {
        const current = Math.floor(playerRef.current.getCurrentTime() || 0);
        const total = Math.floor(playerRef.current.getDuration() || duration || 0);
        setTime(current);
        setDuration(total);
        setProgress(total ? (current / total) * 100 : 0);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  // Keyboard shortcuts: Space play/pause, arrows for skip/volume
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!showPopup) return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        skipNext();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        skipPrevious();
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        const v = Math.min(100, volume + 5);
        setVolume(v);
        playerRef.current?.setVolume(v);
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        const v = Math.max(0, volume - 5);
        setVolume(v);
        playerRef.current?.setVolume(v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showPopup, volume]);

  // Search tracks
  const handleSearch = async () => {
  const query = inputRef.current.value.trim();
  if (!query) return;

  setLoading(true);
  try {
    // Get metadata from Spotify
    const spotifyRes = await fetch(`http://localhost:4444/api/search?q=${encodeURIComponent(query)}`);
    const track = await spotifyRes.json();
    setActiveSnippet(track);

    // Get videoIds from YouTube
    const ytRes = await fetch(`http://localhost:4444/api/playback?q=${encodeURIComponent(query)}`);
    const items = await ytRes.json(); // ["abc123", "xyz456"]
    setResults(items);
    setCurrentIndex(0);
    setActiveVideo(items[0]); // first videoId
    setActiveSnippet(track);
  } catch (err) {
    console.error("Error fetching videos:", err);
  } finally {
    setLoading(false);
  }
};

  // Open popup with selected track
  const openPopup = async (videoId , url) => {
    console.log(results);
    const userid = localStorage.getItem("userid")
    const favdata = await fetch(`http://localhost:4444/api/getfavourite/${userid}`);
    const getfavlist = await favdata.json();
    const getfavdata = getfavlist[0];
    if (!getfavdata) return;

    const Favid = getfavdata.id;
      const getData = await fetch(`http://localhost:4444/api/favourite/${Favid}`)
      const FavData = await getData.json();
      if(FavData.tracks.some((pt)=>pt.track.url === url)){
        setIdCheck(true);
      }
      else if(FavData.tracks.some((pt)=>pt.track.url !== url)){
        setIdCheck(false);
      }
    setActiveVideo(videoId);
    // setActiveSnippet(snippet);
    // setCurrentIndex(index);
    setShowPopup(true);
    setProgress(0);
    setTime(0);
    setDuration(0);
    if(playerRef.current){
      playerRef.current.seekTo(0);
      playerRef.current.playVideo();
    }
  };

  // Close popup
  const closePopup = () => {
    setActiveVideo(null);
    setActiveSnippet(null);
    setShowPopup(false);
    setIsPlaying(false);
    setProgress(0);
    setTime(0);
    setDuration(0);
    handleClear();
    // setCurrentIndex(null);
  };

  // Play/pause toggle
  const togglePlayPause = () => {
    if (!playerRef.current) return;
    isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  };

  // Seek via slider
  const handleSeek = (e) => {
    if (!playerRef.current || !duration) return;
    const newProgress = Number(e.target.value);
    const newTime = (newProgress / 100) * duration;
    playerRef.current.seekTo(newTime, true);
    setTime(Math.floor(newTime));
    setProgress(newProgress);
  };

  // Volume slider
  const handleVolume = (e) => {
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);
    playerRef.current?.setVolume(newVolume);
  };

  // Skip next/previous
  const skipNext = () => {
  if (currentIndex === null || queue.length === 0) return;

  if (isLooping) {
    openPopup(queue[currentIndex]);
    return;
  }

  // if (currentIndex < queue.length - 1) {
  //   const nextIndex = currentIndex + 1;
  //   const videoId = queue[nextIndex]; // ✅ directly use string
  //   setCurrentIndex(nextIndex);
  //   setActiveVideo(videoId);
  //   openPopup(videoId);
  // }
};

const skipPrevious = () => {
  if (currentIndex === null || queue.length === 0) return;

  if (currentIndex > 0) {
    const prevIndex = currentIndex - 1;
    const videoId = queue[prevIndex]; // ✅ directly use string
    setCurrentIndex(prevIndex);
    setActiveVideo(videoId);
    openPopup(videoId);
  }
};


  // Formatting helpers
  const formatTime = (seconds) => {
    const m = Math.floor((seconds || 0) / 60);
    const s = Math.floor(seconds || 0) % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  useEffect(() => {
        const check = async () => {
          await CheckIsFav();
          // console.log(idCheck);
        };
        check();
      }, [trackKey , idCheck]);
  
    const handleToggle = async () => {
      // Optimistically flip UI state
      const nextState = !idCheck;
      setIdCheck(nextState);
      if(nextState){
        await toggleFavourite(trackKey);
      }
      else{
        const favid = favourites[0].id;
        await fetch(`http://localhost:4444/api/favourites/${favid}/track/${trackKey}`,{
          method:"DELETE",
          headers:{"Content-Type":"application-json"}
        })
        closePopup();
        const res = await fetch(`http://localhost:4444/api/favourite/${favid}`);
        const data = await res.json();
        setFavourites(data);
      }
      // Optionally re-check from backend if needed
      // const fav = await CheckIsFav(trackKey);
      // setIsFav(fav);
    };
  
  
  
    const CheckIsFav = async()=>{
      const favid = favourites?.[0]?.id;
      try{
       const res = await fetch(`http://localhost:4444/api/favourite/${favid}`);
       const data = await res.json();
      //  console.log(data);
       if(data.tracks.find((isfav)=>isfav.trackId === trackKey)){
        setIdCheck(true);
       }else{
        setIdCheck(false);
       }
      }catch(err){
        console.log(err);
      }
    }
    const handleClear = ()=>{
        setResults("");
        inputRef.current.value = null;
    }

    const handleSignOut = async(req,res)=>{
    await fetch(`http://localhost:4444/api/signout` , {
      method:"POST"
    })
    localStorage.removeItem("token");
    localStorage.removeItem("userid");
    localStorage.removeItem("userName");
    navigate("/");
  }

  return (
    <div className="bg-black min-h-screen flex text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col fixed h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            SoundScape
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => navigate("/dashboard")} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-neutral-800 text-white">
            <MagnifyingGlassIcon className="w-5 h-5" />
            <span className="font-medium">Search</span>
          </button>
          <button onClick={() => navigate("/showplaylist")} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-neutral-400 hover:bg-neutral-900 hover:text-white transition">
            <PlusIcon className="w-5 h-5" />
            <span className="font-medium">Playlists</span>
          </button>
          <button onClick={() => navigate("/showFavourites")} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-neutral-400 hover:bg-neutral-900 hover:text-white transition">
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
      <main className="ml-64 flex-1 p-8 pb-32">
        <header className="max-w-4xl mx-auto mb-12">
          <h2 className="text-4xl font-extrabold mb-8 tracking-tight">Explore Music</h2>
          <div className="relative group">
            <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-500 group-focus-within:text-green-500 transition-colors" />
            <input
              type="text"
              ref={inputRef}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="What do you want to listen to?"
              className="w-full pl-14 pr-32 py-5 bg-neutral-900 border border-neutral-800 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder:text-neutral-600"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-500 hover:bg-green-400 disabled:bg-neutral-700 text-black font-bold px-6 py-2.5 rounded-xl transition-all"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto">
          {/* Results Grid */}
          {results?.videoId ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                onClick={() => openPopup(results.videoId , results.videoUrl)}
                className="group relative bg-neutral-900/50 border border-neutral-800 p-6 rounded-3xl cursor-pointer hover:bg-neutral-800 hover:border-neutral-700 transition-all"
              >
                <div className="flex items-center space-x-6">
                  {activeSnippet?.albumOfTrack?.coverArt?.sources?.[0]?.url && (
                    <div className="relative overflow-hidden rounded-2xl shadow-2xl w-32 h-32 flex-shrink-0">
                      <img
                        src={activeSnippet.albumOfTrack.coverArt.sources[0].url}
                        alt="cover"
                        className={`w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110`}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <PlayIcon className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold truncate mb-1">{activeSnippet?.name}</h3>
                    <p className="text-neutral-400 font-medium truncate">
                      {activeSnippet?.artists?.items?.[0]?.profile?.name}
                    </p>
                    <div className="mt-4 flex items-center space-x-3 text-sm text-neutral-500">
                      <span className="px-2 py-0.5 bg-neutral-800 rounded">Spotify Meta</span>
                      <span>•</span>
                      <span>YouTube Stream</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : !loading && inputRef.current?.value && (
            <div className="text-center py-20">
              <p className="text-neutral-500 text-lg italic">Search for your favorite tracks to start listening</p>
            </div>
          )}

          {results?.videoId && (
            <div className="mt-12 flex justify-center">
               <button 
                  className="text-neutral-500 hover:text-white transition flex items-center space-x-2" 
                  onClick={handleClear}
                >
                  <ArrowPathRoundedSquareIcon className="w-5 h-5" />
                  <span>Clear results</span>
                </button>
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Player (Modified Popup) */}
      {showPopup && activeVideo && activeSnippet && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-6 pointer-events-none">
          <div className="max-w-5xl mx-auto bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)] p-4 flex items-center pointer-events-auto">
            {/* Player Info */}
            <div className="flex items-center space-x-4 w-1/3">
              {activeSnippet?.albumOfTrack?.coverArt?.sources?.[0]?.url && (
                <img
                  src={activeSnippet.albumOfTrack.coverArt.sources[0].url}
                  alt="cover"
                  className="w-16 h-16 rounded-xl shadow-lg flex-shrink-0 object-cover"
                />
              )}
              <div className="min-w-0">
                <h4 className="font-bold truncate text-white">{activeSnippet?.name}</h4>
                <p className="text-xs text-neutral-400 truncate">
                  {activeSnippet?.artists?.items?.[0]?.profile?.name}
                </p>
              </div>
              <button
                onClick={handleToggle}
                className={`transition-colors flex-shrink-0 ml-2 ${idCheck ? "text-red-500" : "text-neutral-500 hover:text-white"}`}
              >
                <HeartIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Hidden YT */}
            <div id="yt-player" className="absolute opacity-0 pointer-events-none w-0 h-0"></div>

            {/* Controls */}
            <div className="flex-1 flex flex-col items-center px-4">
              <div className="flex items-center space-x-6 mb-2">
                <button
                  onClick={() => setIsLooping(!isLooping)}
                  className={`transition-colors ${isLooping ? "text-green-500" : "text-neutral-500 hover:text-white"}`}
                >
                  <ArrowPathRoundedSquareIcon className="w-5 h-5" />
                </button>
                <button 
                  onClick={skipPrevious} 
                  disabled={currentIndex === null || currentIndex <= 0}
                  className="text-white disabled:text-neutral-700 transition"
                >
                  <BackwardIcon className="w-7 h-7" />
                </button>
                <button
                  onClick={togglePlayPause}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition active:scale-95"
                >
                  {isPlaying ? <PauseIcon className="w-7 h-7" /> : <PlayIcon className="w-7 h-7 ml-1" />}
                </button>
                <button 
                  onClick={skipNext}
                  disabled={dashboardSkipControl === false}
                  className="text-white disabled:text-neutral-700 transition"
                >
                  <ForwardIcon className="w-7 h-7" />
                </button>
                <button
                  onClick={closePopup}
                  className="text-neutral-500 hover:text-white transition"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Progress */}
              <div className="w-full flex items-center space-x-3 max-w-xl">
                <span className="text-[10px] text-neutral-500 font-mono w-8 text-right">{formatTime(time)}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleSeek}
                  className="flex-1 accent-green-500 h-1 bg-neutral-700 rounded-full appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-neutral-500 font-mono w-8">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Volume */}
            <div className="w-1/3 flex items-center justify-end space-x-3 px-4">
              <SpeakerWaveIcon className="w-5 h-5 text-neutral-500" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolume}
                className="w-24 accent-white h-1 bg-neutral-700 rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashBoard;