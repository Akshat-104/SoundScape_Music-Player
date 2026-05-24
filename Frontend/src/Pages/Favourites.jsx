import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

const Favourites = () => {
  const [idCheck,setIdCheck] = useState(false);
  const {id} = useParams();
  const navigate = useNavigate();
  const [favourite, setFavourite] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const inputRef = useRef(null);
  const [loading , setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0–100
  const [time, setTime] = useState(0); // seconds
  const [duration, setDuration] = useState(0); // seconds
  const [volume, setVolume] = useState(60); // 0–100
  const [activeVideo, setActiveVideo] = useState(null);
  const playerRef = useRef(null);
  const [isLooping , setIsLooping] = useState(false);
  const [idx , setIdx] = useState(null);
  const [trackKey , setTrackKey] = useState(null);


  // Fetch favourites details
  useEffect(() => {
    const fetchFavourite = async () => {
      try {
        const res = await fetch(`http://localhost:4444/api/favourite/${id}`);
        const data = await res.json();
        setFavourite(data);
      } catch (err) {
        console.error("Error fetching playlist:", err);
      }
    };
    fetchFavourite();
  }, [id]);

  const handleSearch = async () => {
    const query = inputRef.current.value;
    if (!query) return;

    try {
      const res = await fetch(`http://localhost:4444/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults([data]); // single track result
    } catch (err) {
      console.error("Error searching track:", err);
    }
  };

  const getVideoIdFromUrl = (url) => {
    const urlObj = new URL(url);
    return urlObj.searchParams.get("v"); // returns abc123
  };


  const handleAddTrack = async (track, TRACKNAME) => {
    try {
      setLoading(true);
      const favid = favourite.id;
      const resTrackInFav = await fetch(`http://localhost:4444/api/favourite/${favid}`);
      const dataInFav = await resTrackInFav.json();
      if(dataInFav.tracks.find((pt)=>pt.track.title === TRACKNAME)){
        setSearchResults([]);
        inputRef.current.value = "";
        setError("Track Already in Favourites");
        setLoading(false);
        return;
      }
      const trackData = await fetch(`http://localhost:4444/api/alltracks`);
      const res = await trackData.json();

      let resolvedTrack = res.find((pt) => pt.title === track.name);

      if (!resolvedTrack) {
        const resTrack = await fetch("http://localhost:4444/api/tracks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: track.name,
            artist: track.artists.items[0].profile.name,
            duration: track.duration.totalMilliseconds,
            coverUrl: track.albumOfTrack.coverArt.sources[0].url,
          }),
        });
        resolvedTrack = await resTrack.json();
      }

      await fetch(`http://localhost:4444/api/favourites/${id}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Favouriteid: id,
          userId: Number(localStorage.getItem("userid")),
          trackId: resolvedTrack.id,
          order: favourite.tracks.length + 1,
        }),
      });

      const updatedRes = await fetch(`http://localhost:4444/api/favourite/${id}`);
      const updatedPlaylist = await updatedRes.json();
      setFavourite(updatedPlaylist);
      setSearchResults([]);
      inputRef.current.value = "";
    } catch (err) {
      console.error("Error adding track:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = (event)=>{
    if (event.data === window.YT.PlayerState.ENDED) {
      skipNext();
    } else if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
    }
  }

  useEffect(() => {
    let waitInterval;
    const createPlayer = () => {
      if (!activeVideo || !showPopup) return;
      if (!window.YT || !window.YT.Player) return;

      playerRef.current = new window.YT.Player("yt-player", {
        videoId: activeVideo,
        playerVars: { controls: 0, disablekb: 1, modestbranding: 1, rel: 0 },
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

  const OpenPopUpTrack = async(index , key)=>{
    const Favid = favourite.id;
    const getData = await fetch(`http://localhost:4444/api/favourite/${Favid}`)
    const FavData = await getData.json();
    if(FavData.tracks.some((pt)=>pt.trackId === key)){
      setIdCheck(true);
    }
    else {
      setIdCheck(false);
    }
    const clickedtrack = favourite.tracks[index].track.url;
    const videoid = getVideoIdFromUrl(clickedtrack);
    setTrackKey(key);
    setActiveVideo(videoid);
    setShowPopup(true);
    setIdx(index);
    setProgress(0);
    setTime(0);
    setDuration(0);
  };

  const closePopup = () => {
    setActiveVideo(null);
    setShowPopup(false);
    setIsPlaying(false);
    setProgress(0);
    setTime(0);
    setDuration(0);
  };

  const togglePlayPause = () => {
    if (!playerRef.current) return;
    isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  };

  const handleSeek = (e) => {
    if (!playerRef.current || !duration) return;
    const newProgress = Number(e.target.value);
    const newTime = (newProgress / 100) * duration;
    playerRef.current.seekTo(newTime, true);
    setTime(Math.floor(newTime));
    setProgress(newProgress);
  };

  const handleVolume = (e) => {
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);
    playerRef.current?.setVolume(newVolume);
  };

  useEffect(() => {
    if (favourite && favourite.tracks && favourite.tracks[idx]) {
      const videoUrl = favourite.tracks[idx].track.url;
      const videoId = getVideoIdFromUrl(videoUrl);
      setActiveVideo(videoId);
    }
  }, [idx, favourite]);

  const skipNext = () => {
    if (idx === null) return;
    if (idx < favourite.tracks.length - 1) {
      setIdx(idx + 1);
    } else {
      if (isLooping) {
        setIdx(0);
      } else {
        setIsPlaying(false);
      }
    }
  };

  const skipPrevious = () => {
    if (idx === null) return;
    if (idx > 0) {
      setIdx(idx - 1);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor((seconds || 0) / 60);
    const s = Math.floor(seconds || 0) % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const toggleFavourite = async (track)=>{
    const favid = favourite.id;
    const res = await fetch(`http://localhost:4444/api/favourite/${favid}`);
    const data = await res.json();
    const order = data.tracks.length + 1;
    await fetch(`http://localhost:4444/api/favourites/${favid}/track`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        Favouriteid: favid,
        userId:favourite.userId,
        trackId:track,
        order
      }),
    });
  }

  useEffect(() => {
    const check = async () => {
      await CheckIsFav();
    };
    check();
  }, [trackKey , idCheck]);

  const handleToggle = async () => {
    const nextState = !idCheck;
    setIdCheck(nextState);
    if(nextState){
      await toggleFavourite(trackKey);
    }
    else{
      const favid = favourite.id;
      await fetch(`http://localhost:4444/api/favourites/${favid}/track/${trackKey}`,{
        method:"DELETE",
        headers:{"Content-Type":"application-json"}
      })
      closePopup();
      const res = await fetch(`http://localhost:4444/api/favourite/${favid}`);
      const data = await res.json();
      setFavourite(data);
    }
  };

  const CheckIsFav = async()=>{
    if (!favourite.id || !trackKey) return;
    const favid = favourite.id;
    try{
      const res = await fetch(`http://localhost:4444/api/favourite/${favid}`);
      const data = await res.json();
      if(data.tracks.find((isfav)=>isfav.trackId === trackKey)){
        setIdCheck(true);
      }else{
        setIdCheck(false);
      }
    }catch(err){
      console.log(err);
    }
  }

  const handleSignOut = async()=>{
    await fetch(`http://localhost:4444/api/signout` , { method:"POST" });
    localStorage.removeItem("token");
    localStorage.removeItem("userid");
    localStorage.removeItem("userName");
    navigate("/");
  }

  if (!favourite) return <div className="bg-black min-h-screen flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="bg-black min-h-screen flex text-white font-sans text-left">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col fixed h-full">
        <div className="p-6 text-left">
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
      <main className="ml-64 flex-1 p-8 pb-32">
        <header className="max-w-4xl mx-auto mb-12">
          <div className="flex items-end space-x-6 mb-8 text-left">
            <div className="w-48 h-48 bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl shadow-2xl flex items-center justify-center">
              <HeartIcon className="w-20 h-20 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Collection</span>
              <h2 className="text-6xl font-black mt-2 mb-4 tracking-tight">{favourite?.name}</h2>
              <p className="text-neutral-400 font-medium">
                {favourite?.tracks?.length || 0} tracks • Your Favourites
              </p>
            </div>
          </div>

          <div className="relative group max-w-2xl">
            <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-red-500 transition-colors" />
            <input
              ref={inputRef}
              type="text"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Add more to your favourites..."
              className="w-full pl-12 pr-28 py-4 bg-neutral-900 border border-neutral-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all placeholder:text-neutral-600 text-left"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2 rounded-xl transition-all text-sm"
            >
              Search
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto">
          {searchResults.map((track) => (
            <div key={track.id} className="mb-8 flex items-center justify-between p-4 bg-neutral-900/50 border border-neutral-800 rounded-2xl group">
              <div className="flex items-center space-x-4 text-left">
                <img src={track.albumOfTrack.coverArt.sources[0].url} alt={track.name} className="w-14 h-14 rounded-lg object-cover shadow-lg" />
                <div>
                  <p className="font-bold">{track.name}</p>
                  <p className="text-xs text-neutral-500">{track.artists.items[0].profile.name}</p>
                </div>
              </div>
              <button
                onClick={() => handleAddTrack(track , track.name)}
                className="bg-white text-black font-bold px-5 py-2 rounded-full transition-all text-sm"
              >
                Add to Favourites
              </button>
            </div>
          ))}

          {loading && <div className="text-center py-4 animate-pulse text-neutral-500 italic">Adding track...</div>}
          {error && <div className="text-center py-4 text-red-500 font-medium">{error}</div>}

          <div className="space-y-1">
            <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-2 border-b border-neutral-900 text-neutral-500 text-xs font-bold uppercase tracking-widest mb-4">
              <span className="w-8">#</span>
              <span className="text-left">Title</span>
              <span className="text-right">Action</span>
            </div>
            {favourite?.tracks?.map((pt,index) => (
              <div
                key={pt.track.id}
                onClick={()=>OpenPopUpTrack(index , pt.track.id )}
                className="grid grid-cols-[auto_1fr_auto] gap-4 items-center px-4 py-3 hover:bg-neutral-900 rounded-xl transition group cursor-pointer"
              >
                <span className="w-8 text-neutral-500 group-hover:text-white transition">{index + 1}</span>
                <div className="flex items-center space-x-4 min-w-0 text-left">
                  <img src={pt.track.coverUrl} alt={pt.track.title} className="w-10 h-10 rounded shadow-md object-cover" />
                  <div className="min-w-0">
                    <p className="font-bold truncate">{pt.track.title}</p>
                    <p className="text-xs text-neutral-500 truncate">{pt.track.artist}</p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition">
                  <PlayIcon className="w-6 h-6 text-red-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Floating Bottom Player */}
      {showPopup && activeVideo && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-6 pointer-events-none text-left">
          <div className="max-w-5xl mx-auto bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-3xl shadow-2xl p-4 flex items-center pointer-events-auto text-white">
            <div className="flex items-center space-x-4 w-1/3">
              {favourite?.tracks?.[idx]?.track?.coverUrl && (
                <img
                  src={favourite.tracks[idx].track.coverUrl}
                  alt="cover"
                  className="w-16 h-16 rounded-xl shadow-lg flex-shrink-0 object-cover"
                />
              )}
              <div className="min-w-0">
                <h4 className="font-bold truncate">{favourite.tracks?.[idx]?.track?.title}</h4>
                <p className="text-xs text-neutral-400 truncate">
                  {favourite.tracks?.[idx]?.track?.artist}
                </p>
              </div>
              <button
                onClick={handleToggle}
                className={`transition-colors flex-shrink-0 ml-2 ${idCheck ? "text-red-500" : "text-neutral-500 hover:text-white"}`}
              >
                <HeartIcon className="w-6 h-6" />
              </button>
            </div>

            <div id="yt-player" className="absolute opacity-0 pointer-events-none w-0 h-0"></div>

            <div className="flex-1 flex flex-col items-center px-4">
              <div className="flex items-center space-x-6 mb-2">
                <button
                  onClick={() => setIsLooping(!isLooping)}
                  className={`transition-colors ${isLooping ? "text-red-500" : "text-neutral-500 hover:text-white"}`}
                >
                  <ArrowPathRoundedSquareIcon className="w-5 h-5" />
                </button>
                <button onClick={skipPrevious} disabled={idx === 0} className="text-white disabled:text-neutral-700">
                  <BackwardIcon className="w-7 h-7" />
                </button>
                <button
                  onClick={togglePlayPause}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition"
                >
                  {isPlaying ? <PauseIcon className="w-7 h-7" /> : <PlayIcon className="w-7 h-7 ml-1" />}
                </button>
                <button onClick={skipNext} className="text-white">
                  <ForwardIcon className="w-7 h-7" />
                </button>
                <button onClick={closePopup} className="text-neutral-500 hover:text-white transition">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="w-full flex items-center space-x-3 max-w-xl">
                <span className="text-[10px] text-neutral-500 font-mono w-8 text-right">{formatTime(time)}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleSeek}
                  className="flex-1 accent-red-500 h-1 bg-neutral-700 rounded-full appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-neutral-500 font-mono w-8">{formatTime(duration)}</span>
              </div>
            </div>

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

export default Favourites
