import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import NotesPage from "./NotesPage";
import Login from "./Login";
import Signup from "./Signup";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* landingPage and NotesPage, signup and login routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/notes" element={<NotesPage />} />
      </Routes>
    </Router>
  );
};

export default App;