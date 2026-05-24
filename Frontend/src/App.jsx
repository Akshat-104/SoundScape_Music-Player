import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import SignUp from "./Pages/SignUp";
import Login from "./Pages/Login";
import LandingPage from "./Pages/LandingPage";
import DashBoard from "./Pages/DashBoard";
import CreatePlaylist from "./Pages/CreatePlaylist";
import ShowPlaylist from "./Pages/ShowPlaylist";
import PlaylistPage from "./Pages/PlaylistPage";
import FavouriteList from "./Pages/FavouriteList";
import Favourites from "./Pages/Favourites";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  
  // If there is no token, redirect to landing/login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If there is a token, render the child routes
  return <Outlet />;
};

function App() {
  const token = localStorage.getItem("token");
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/" element={<LandingPage/>}/>
        <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashBoard/>}/>
        <Route path="/createplaylist" element={<CreatePlaylist/>}/>
        <Route path="/showplaylist" element={<ShowPlaylist/>}/>
        <Route path="/playlist/:id" element={<PlaylistPage/>}/>
        <Route path="/showFavourites" element={<FavouriteList/>}/>
        <Route path="/favourite/:id" element={<Favourites/>}/>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;