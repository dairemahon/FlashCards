import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDeck } from "../api";

export default function DeckDetail() {
  const { id } = useParams();
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDeck(id)
      .then((data) => {
        setDeck(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading deck...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!deck) return <p>Deck not found.</p>;

  return (
    <div>
      <h1>{deck.title}</h1>
      <p>{deck.description}</p>
      <p>Created: {new Date(deck.created_at).toLocaleDateString()}</p>
      <a href="/decks">Back to decks</a>
    </div>
  );
}