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
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [isAddingNew, setIsAddingNew]       = useState(false);
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

  /* Keybord shortcuts */
  useEffect(() => {
    const handleKeyDown = (e) => {
        // Cmd+Enter (Mac) or Ctrl+Enter (Windows) — save
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault(); // stops the browser doing anything else with this combo
            handleSave();
        }
        // Escape — cancel / clear the form
        if (e.key === "Escape") {
            clearForm();
        }
    };

    window.addEventListener("keydown", handleKeyDown);
    /* Clean up function, removes event listener  */
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [frontText, backText, selectedCardId, isAddingNew]);

  // Called when clicking a card in the left panel
const selectCard = (card) => {
    setSelectedCardId(card.id);
    setIsAddingNew(false);
    setFrontText(card.front_text);
    setBackText(card.back_text);
    setFormError("");
};

// Called when clicking "+ New Card"
const startNew = () => {
    setSelectedCardId(null);
    setIsAddingNew(true);
    setFrontText("");
    setBackText("");
    setFormError("");
};

// Clears the right panel back to the "nothing selected" placeholder
const clearForm = () => {
    setSelectedCardId(null);
    setIsAddingNew(false);
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
        if (selectedCardId) {
            // Updating an existing card
            const updated = await updateCard(selectedCardId, frontText, backText);
            setDeck(d => ({ ...d, cards: d.cards.map(c => c.id === updated.id ? updated : c) }));
        } else {
            // Creating a new card
            const created = await createCard(id, frontText, backText);
            setDeck(d => ({ ...d, cards: [...d.cards, created] }));
            startNew(); // Clear the form for the next new card
        }
        setFormError("");
    } catch (e) {
        setFormError(e.message);
    }
};

const handleDelete = async () => {
    if (!window.confirm("Delete this card?")) return;
    try {
        await deleteCard(selectedCardId);
        setDeck(d => ({ ...d, cards: d.cards.filter(c => c.id !== selectedCardId) }));
        clearForm();
    } catch (e) {
        setFormError(e.message);
    }
};

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!deck) return <p>Deck not found.</p>;

  return (
    <div className="min-h-screen bg-white">
        <main className="max-w-5xl mx-auto px-6 py-10">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{deck.title}</h1>
                    {deck.description && <p className="text-gray-500 text-sm mt-1">{deck.description}</p>}
                    <p className="text-sm text-gray-400 mt-1">
                      Created: {new Date(deck.created_at).toLocaleDateString()}
                    </p>
                </div>
                <button onClick={() => navigate(-1)} className="text-sm text-gray-400 hover:text-indigo-600 transition-colors">
                    ← Back
                </button>
            </div>

            {/* Two-panel layout */}
            <div className="flex gap-6" style={{ height: "calc(100vh - 200px)" }}>

                {/* Left panel — card list */}
                <div className="w-2/5 border border-gray-200 rounded-sm flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <span className="text-sm font-medium text-gray-600">{deck.cards.length} cards</span>
                        <button
                            onClick={startNew}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                        >
                            + New Card
                        </button>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {deck.cards.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center mt-8">No cards yet</p>
                        ) : (
                            deck.cards.map((card) => (
                                <div
                                    key={card.id}
                                    onClick={() => selectCard(card)}
                                    className={`px-4 py-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors
                                        ${selectedCardId === card.id ? "bg-indigo-50 border-l-4 border-l-indigo-500" : "border-l-4 border-l-transparent"}`}
                                >
                                    <p className="text-sm text-gray-800 truncate">
                                        {card.front_text.length > 30 ? card.front_text.slice(0, 30) + "…" : card.front_text}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right panel — edit form */}
                <div className="flex-1 border border-gray-200 rounded-sm p-6">
                    {!selectedCardId && !isAddingNew ? (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-gray-400 text-sm">Select a card to edit, or create a new one.</p>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                {selectedCardId ? "Edit Card" : "New Card"}
                            </h2>
                            {formError && <p className="text-red-500 text-sm mb-4">{formError}</p>}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Front</label>
                                <input
                                    type="text"
                                    value={frontText}
                                    onChange={e => setFrontText(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Back</label>
                                <textarea
                                    value={backText}
                                    onChange={e => setBackText(e.target.value)}
                                    rows={5}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={handleSave} className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors">
                                    Save
                                </button>
                                {selectedCardId && (
                                    <button onClick={handleDelete} className="bg-red-50 text-red-500 px-5 py-2 rounded-lg hover:bg-red-100 text-sm font-medium transition-colors">
                                        Delete
                                    </button>
                                )}
                                <button onClick={clearForm} className="text-gray-500 px-5 py-2 rounded-lg hover:bg-gray-100 text-sm transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    </div>
  );
}