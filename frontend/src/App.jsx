import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { checkAuth } from "./api";
import Login from "./components/Login";
import Signup from "./components/Signup";
import DeckList from "./components/DeckList";
import DeckDetail from "./components/DeckDetail";
import DeckCreate from "./components/DeckCreate";
import DeckEditor from "./components/DeckEditor";


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  async function checkLoginStatus() {
    try {
    const data = await checkAuth();
    setIsLoggedIn(data.authenticated);
  } catch (error) {
    console.error("Error checking auth:", error);
    setIsLoggedIn(false);
  } finally {
    setLoading(false);
  }
  }

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate replace to="/decks" /> : <Login setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route
          path="/signup"
          element={isLoggedIn ? <Navigate replace to="/decks" /> : <Signup setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route
          path="/decks"
          element={isLoggedIn ? <DeckList setIsLoggedIn={setIsLoggedIn} /> : <Navigate replace to="/login" />}
        />
        <Route
          path="/decks/create"
          element={isLoggedIn ? <DeckCreate /> : <Navigate replace to="/login" />}
        />
        <Route
          path="/decks/:id"
          element={isLoggedIn ? <DeckDetail /> : <Navigate replace to="/login" />}
        />
        <Route 
          path="/decks/:id/edit" 
          element={<DeckEditor />} 
        />

      </Routes>
    </Router>
  );
}

export default App;