import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDeck } from "../api";

export default function DeckCreate() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newDeck = await createDeck(title, description);
      navigate(`/decks/${newDeck.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => navigate("/decks")}>Back to Decks</button>
      <h1>Create a new deck</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Title:
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Description:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Deck"}
        </button>
      </form>
      <a href="/decks">Cancel</a>
    </div>
  );
}