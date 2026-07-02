import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDecks, logout } from "../api";

export default function DeckList({ setIsLoggedIn }) {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getDecks()
      .then((data) => {
        setDecks(data.decks);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
      <button onClick={() => navigate("/decks/create")}>Create New Deck</button>
      <h1>My Decks</h1>
      {loading ? (
        <p>Loading decks...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <ul>
          {decks.map((deck) => (
            <li key={deck.id}>
              <a href={`/decks/${deck.id}`}>{deck.title}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}