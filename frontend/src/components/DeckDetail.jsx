import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDeck, createCard, updateCard, deleteCard, deleteDeck, reviewCard } from "../api";


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

  const [showModal, setShowModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [editingFront, setEditingFront] = useState("");
  const [editingBack, setEditingBack] = useState("");
  const [modalError, setModalError] = useState("");

  const navigate = useNavigate();

  /*state variables for review mode """*/
  const [dueCards, setDueCards] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);



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

  /* creates due queue once the deck loads */
  useEffect(() => {
    if (!deck) return;
    const due = (deck.cards || []).filter((card) => new Date(card.due) <= new Date());
    setDueCards(due);
    setQuestionIndex(0);
    setMaxIndex(0)
    setSessionDone(due.length === 0);
  },[deck]);

  const handleRate = async (rating) => {
    const card = dueCards[questionIndex];
    try {
      await reviewCard(card.id, rating);
      const nextIndex = questionIndex + 1;
      /* Advance the frontier to wherever rating takes us */
      setMaxIndex(prev => Math.max(prev, nextIndex));
      if (nextIndex >= dueCards.length) {
        setSessionDone(true);
      } else{
        setQuestionIndex(nextIndex);
        setShowBack(false)
      }
      } catch (err) {
        setError(err.message);
      }
  };


  const handleAddCard = async () => {
    if (!frontText.trim() || !backText.trim()) {
      setFormError("Front and back text are required.");
      return;
    }
    try {
      const created = await createCard(id, frontText, backText);
      setDeck((prev) => ({ ...prev, cards: [...prev.cards, created] }));
      clearEditForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const clearEditForm = () => {
    setEditingCardId(null);
    setFrontText("");
    setBackText("");
    setFormError("");
  };

  const openEditModal = (card) => {
    setSelectedCard(card);
    setEditingFront(card.front_text);
    setEditingBack(card.back_text);
    setModalError("");
    setShowModal(true);
  };

  const handleModalSave = async () => {
    if (!editingFront.trim() || !editingBack.trim()) {
      setModalError("Front and back text are required.");
      return;
    }
    try {
      const updated = await updateCard(selectedCard.id, editingFront, editingBack);
      setDeck((prev) => ({
        ...prev,
        cards: prev.cards.map((c) => (c.id === updated.id ? updated : c)),
      }));
      setShowModal(false);
    } catch (err) {
      setModalError(err.message);
    }
  };

  const handleModalDelete = async () => {
    try {
      await deleteCard(selectedCard.id);
      setDeck((prev) => ({
        ...prev,
        cards: prev.cards.filter((c) => c.id !== selectedCard.id),
      }));
      setShowModal(false);
    } catch (err) {
      setModalError(err.message);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCard(null);
    setEditingFront("");
    setEditingBack("");
    setModalError("");
  };

  const handleDeleteDeck = async () => {
    if (!window.confirm(`Are you sure you want to delete "${deck.title}"? This cannot be undone.`)) return;
    try {
        await deleteDeck(id);
        navigate("/decks");
    } catch (err) {
        setError(err.message);
    }
};

  if (loading) return <p className="text-center mt-20 text-gray-400">Loading deck...</p>;
  if (error) return <p className="text-center mt-20 text-red-500">Error: {error}</p>;
  if (!deck) return <p className="text-center mt-20 text-gray-400">Deck not found.</p>;

  const cards = deck.cards || [];
  const currentCard = cards[currentCardIndex];

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{deck.title}</h1>
            {deck.description && (
              <p className="text-gray-500 mt-1">{deck.description}</p>
            )}
            <p className="text-sm text-gray-400 mt-1">
              Created: {new Date(deck.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            onClick={() => navigate(`/decks/${id}/edit`)}
          >
            Edit Deck
          </button>
          <button
            className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
            onClick={handleDeleteDeck}
          >
            Delete Deck
          </button>
        </div>

        {cards.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col items-center justify-center min-h-96 p-12">
              <p className="text-gray-400 text-lg">This deck has no cards yet.</p>
              <button onClick={() => navigate(`/decks/${id}/edit`)} className="mt-6 text-sm text-indigo-500 hover:text-indigo-700 transition-colors">
                  Open editor to add cards
              </button>
          </div>
        ) : sessionDone ? (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col items-center justify-center min-h-96 p-12">
                <p className="text-2xl font-semibold text-gray-800 mb-2">Session complete!</p>
                <p className="text-gray-400 text-sm">
                    {dueCards.length > 0
                        ? `You reviewed ${dueCards.length} card${dueCards.length > 1 ? "s" : ""}.`
                        : "No cards are due for review right now."}
                </p>
            </div>
        ) : dueCards.length === 0 && !sessionDone ? (
            <p className="text-center mt-20 text-gray-400">Loading session...</p>
        ) : (
            <>
                {/* Flashcard */}
                <div
                    onClick={() => setShowBack(prev => !prev)}
                    className="bg-white rounded-xl shadow-md border border-gray-100 cursor-pointer flex flex-col items-center justify-center min-h-96 p-12 mb-6 hover:shadow-lg transition-shadow"
                >
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-6">
                        {showBack ? "Back" : "Front"} — click to flip
                    </p>
                    <h2 className="text-3xl font-semibold text-gray-800 text-center">
                        {showBack ? dueCards[questionIndex].back_text : dueCards[questionIndex].front_text}
                    </h2>
                    <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(dueCards[questionIndex]); }}
                        className="mt-10 text-sm text-indigo-500 hover:text-indigo-700 transition-colors"
                    >
                        Edit this card
                    </button>
                </div>

                {/* Progress + Prev/Next navigation */}
                <div className="flex justify-center items-center gap-6 mb-4">
                    {questionIndex > 0 ? (
                        <button
                            onClick={() => { setQuestionIndex(prev => prev - 1); setShowBack(false); }}
                            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            ← Previous
                        </button>
                    ) : (
                        <div className="px-6 py-2 w-28" />
                    )}
                    <p className="text-sm text-gray-400">{questionIndex + 1} / {dueCards.length} due</p>
                    {questionIndex < maxIndex ? (
                        <button
                            onClick={() => { setQuestionIndex(prev => prev + 1); setShowBack(false); }}
                            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            Next →
                        </button>
                    ) : (
                        <div className="px-6 py-2 w-28" />
                    )}
                </div>

                {/* Rating buttons — only visible after flipping */}
                {showBack && (
                    <div className="flex justify-center gap-3">
                        <button onClick={() => handleRate(1)} className="px-5 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 text-sm font-medium transition-colors">Again</button>
                        <button onClick={() => handleRate(2)} className="px-5 py-2 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-200 text-sm font-medium transition-colors">Hard</button>
                        <button onClick={() => handleRate(3)} className="px-5 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 text-sm font-medium transition-colors">Good</button>
                        <button onClick={() => handleRate(4)} className="px-5 py-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 text-sm font-medium transition-colors">Easy</button>
                    </div>
                )}
            </>
        )}

        {/* Back link */}
        <div className="mt-10">
          <a href="/decks" className="text-sm text-gray-400 hover:text-indigo-600 transition-colors">
            ← Back to decks
          </a>
        </div>
      </main>

      {/* Edit Card Modal */}
      {showModal && selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-4 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Card</h2>
            {modalError && (
              <p className="text-red-500 text-sm mb-4">{modalError}</p>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Front</label>
              <input
                type="text"
                value={editingFront}
                onChange={(e) => setEditingFront(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Back</label>
              <textarea
                value={editingBack}
                onChange={(e) => setEditingBack(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleModalSave}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Save
              </button>
              <button
                onClick={handleModalDelete}
                className="bg-red-50 text-red-500 px-5 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
              >
                Delete
              </button>
              <button
                onClick={closeModal}
                className="text-gray-500 px-5 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
}