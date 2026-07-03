import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDeck, createCard, updateCard, deleteCard } from "../api";


export default function DeckDetail() {
  const { id } = useParams();
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [mode, setMode] = useState("study");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  const [editingCardId, setEditingCardId] = useState(null);
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [formError, setFormError] = useState("");
  
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

  useEffect(() => {
    setCurrentCardIndex(0);
    setShowBack(false);
  }, [mode, deck]);

  const navigate = useNavigate();

  

  const handleAddCard = async () => {
    if (!frontText.trim() || !backText.trim()) {
      setFormError("Front and back text are required.");
      return;
    }

    try {
      const created = await createCard(id, frontText, backText);
      setDeck((prev) => ({
        ...prev,
        cards: [...prev.cards, created],
      }));
      clearEditForm();
      setFormError("");
    } catch (err) {
      setError(err.message);
    }
  };


  if (loading) return <p>Loading deck...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!deck) return <p>Deck not found.</p>;

  const cards = deck.cards || [];
  const currentCard = cards[currentCardIndex];

  return (
    <div>
      <h1>{deck.title}</h1>
      <p>{deck.description}</p>
      <p>Created: {new Date(deck.created_at).toLocaleDateString()}</p>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setMode("study")} disabled={mode === "study"}>
          Study
        </button>
        <button onClick={() => navigate(`/decks/${id}/edit`)}>
            Open editor
        </button>
      </div>

      {mode === "study" ? (
        <div>
          {cards.length === 0 ? (
            <p>This deck has no cards yet.</p>
          ) : (
            <>
              <div
                onClick={() => setShowBack((prev) => !prev)}
                style={{
                  border: "1px solid #ccc",
                  padding: "30px",
                  cursor: "pointer",
                  marginBottom: "20px",
                }}
              >
                <h2>
                  {showBack ? currentCard.back_text : currentCard.front_text}
                </h2>
                <p style={{ fontSize: "0.9rem", color: "#666" }}>
                  {showBack ? "Back — click to flip" : "Front — click to flip"}
                </p>
              </div>

              <div>
                <button
                  onClick={() => {
                    setCurrentCardIndex((prev) => Math.max(prev - 1, 0));
                    setShowBack(false);
                  }}
                  disabled={currentCardIndex === 0}
                >
                  Previous
                </button>

                <button
                  onClick={() => {
                    setCurrentCardIndex((prev) =>
                      Math.min(prev + 1, cards.length - 1)
                    );
                    setShowBack(false);
                  }}
                  disabled={currentCardIndex === cards.length - 1}
                  style={{ marginLeft: "10px" }}
                >
                  Next
                </button>
              </div>

              <p>
                Card {currentCardIndex + 1} of {cards.length}
              </p>
            </>
          )}
        </div>
      ) : (
        <div>
          <p>To edit cards, open the editor using the "Open editor" button above.</p>
        </div>
      )}

      <a href="/decks" style={{ display: "inline-block", marginTop: "20px" }}>
        Back to decks
      </a>
    </div>
  );
}
