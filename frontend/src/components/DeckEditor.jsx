import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDeck, createCard, updateCard, deleteCard } from "../api";

export default function DeckEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
      .catch((e) => {
        setError(e.message || "Failed to load deck");
        setLoading(false);
      });
  }, [id]);

  const startEditing = (card) => {
    setEditingCardId(card.id);
    setFrontText(card.front_text);
    setBackText(card.back_text);
    setFormError("");
  };

  const clearForm = () => {
    setEditingCardId(null);
    setFrontText("");
    setBackText("");
    setFormError("");
  };

  const handleSave = async () => {
    if (!frontText.trim() || !backText.trim()) {
      setFormError("Front and back text are required.");
      return;
    }
    try {
      if (editingCardId) {
        const updated = await updateCard(editingCardId, frontText, backText);
        setDeck((d) => ({ ...d, cards: d.cards.map(c => c.id === updated.id ? updated : c) }));
      } else {
        const created = await createCard(id, frontText, backText);
        setDeck((d) => ({ ...d, cards: [...d.cards, created] }));
      }
      clearForm();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (cardId) => {
    try {
      await deleteCard(cardId);
      setDeck((d) => ({ ...d, cards: d.cards.filter(c => c.id !== cardId) }));
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!deck) return <p>Deck not found.</p>;

  return (
    <div>
      <button onClick={() => navigate(-1)}>Back</button>
      <h1>Edit Deck: {deck.title}</h1>
      <p>{deck.description}</p>

      <h2>Cards</h2>
      {deck.cards.length === 0 ? <p>No cards</p> : deck.cards.map(card => (
        <div key={card.id} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 10 }}>
          <p><strong>Front:</strong> {card.front_text}</p>
          <p><strong>Back:</strong> {card.back_text}</p>
          <button onClick={() => startEditing(card)}>Edit</button>
          <button onClick={() => handleDelete(card.id)} style={{ marginLeft: 8 }}>Delete</button>
        </div>
      ))}

      <div style={{ marginTop: 20, padding: 10, border: "1px solid #ccc" }}>
        <h3>{editingCardId ? "Edit Card" : "Add Card"}</h3>
        {formError && <div style={{ color: "red", marginBottom: 8 }}>{formError}</div>}
        <div>
          <input value={frontText} onChange={e => setFrontText(e.target.value)} placeholder="Front text" style={{ width: "100%", marginBottom: 8 }} />
        </div>
        <div>
          <textarea value={backText} onChange={e => setBackText(e.target.value)} placeholder="Back text" style={{ width: "100%", marginBottom: 8 }} rows={4} />
        </div>
        <button onClick={handleSave}>{editingCardId ? "Save" : "Add"}</button>
        {editingCardId && <button onClick={clearForm} style={{ marginLeft: 8 }}>Cancel</button>}
      </div>
    </div>
  );
}