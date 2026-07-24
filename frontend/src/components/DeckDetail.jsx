import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDeck, createCard, updateCard, deleteCard, deleteDeck, previewCard, reviewCard } from "../api";


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
  const [previews, setPreviews] = useState({}); // Store previews for cards

/*rounding of due time fo card*/
function formatDue(isoString) {
  const due = new Date(isoString);
    const now = new Date();
    const diffMs = due - now;
    const diffMins = diffMs / 1000 / 60;
    const diffHours = diffMins / 60;
    const diffDays = diffHours / 24;

    if (diffMins < 5) {
        // Round to nearest minute
        const mins = Math.round(diffMins);
        return `${mins}m`;
    } else if (diffMins < 60) {
        // Round to nearest 10 minutes
        const mins = Math.round(diffMins / 10) * 10;
        return `${mins}m`;
    } else if (diffHours < 24) {
        // Round to nearest hour
        const hours = Math.round(diffHours);
        return `${hours}h`;
    } else if (diffDays < 7) {
        // Round to nearest day
        const days = Math.round(diffDays);
        return `${days}d`;
    } else {
        // Round to nearest week
        const weeks = Math.round(diffDays / 7);
        return `${weeks}w`;
    }
}



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


  /*fetches preview for a card and stores it in the previews state */
  useEffect(() => {
    if (dueCards.length === 0 || sessionDone) return;
    const card = dueCards[questionIndex];
    previewCard(card.id)
        .then(data => {
            const formatted = {};
            for (const [rating, isoDate] of Object.entries(data.previews)) {
                formatted[rating] = formatDue(isoDate);
            }
            setPreviews(formatted);
        })
        .catch(() => setPreviews({}));
  }, [questionIndex, dueCards, sessionDone]);



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

  useEffect(() => {
    const handleKeyDown = (e) => {
        // Don't fire shortcuts if the user is typing in an input or textarea
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

        if (sessionDone || dueCards.length === 0) return; // no shortcuts when session is over

        // Space — flip the card
        if (e.key === " ") {
            e.preventDefault(); // stops the page scrolling down
            setShowBack(prev => !prev);
        }

        // Rating — 1/2/3/4 keys, only when the back is visible
        if (showBack) {
            if (e.key === "1") handleRate(1);
            if (e.key === "2") handleRate(2);
            if (e.key === "3") handleRate(3);
            if (e.key === "4") handleRate(4);
        }

        // Arrow keys — previous / next navigation
        if (e.key === "ArrowLeft" && questionIndex > 0) {
            setQuestionIndex(prev => prev - 1);
            setShowBack(false);
        }
        if (e.key === "ArrowRight" && questionIndex < maxIndex) {
            setQuestionIndex(prev => prev + 1);
            setShowBack(false);
        }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
}, [showBack, sessionDone, dueCards, questionIndex, maxIndex]);


  if (loading) return <p className="text-center mt-20 text-gray-400">Loading deck...</p>;
  if (error) return <p className="text-center mt-20 text-red-500">Error: {error}</p>;
  if (!deck) return <p className="text-center mt-20 text-gray-400">Deck not found.</p>;

  const cards = deck.cards || [];
  const currentCard = cards[currentCardIndex];

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{deck.title}</h1>
            <div className="flex justify-between items-start">
                <div>
                    {deck.description && (
                        <p className="text-gray-700">{deck.description}</p>
                    )}
                    <p className="text-sm text-gray-400 mt-1 py-1">
                        Created: {new Date(deck.created_at).toLocaleDateString()}
                    </p>
                    <a href="/decks" className="text-sm text-gray-400 hover:text-indigo-600 transition-colors">
                      ← Back to decks
                    </a>
                </div>
                
                  
                
                <div className="flex flex-col items-end gap-2 py-1">
                    <button
                        className="text-gray-500 hover:text-indigo-400 transition-colors text-sm font-medium"
                        onClick={() => navigate(`/decks/${id}/edit`)}
                    >
                        Edit Deck
                    </button>
                    <button
                        className="text-gray-500 hover:text-red-400 transition-colors text-sm font-medium"
                        onClick={handleDeleteDeck}
                    >
                        Delete Deck
                    </button>
                </div>
            </div>
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
                    className="bg-white rounded-sm shadow-md border border-gray-100 cursor-pointer flex flex-col items-center justify-center min-h-96 p-12 mb-6 hover:shadow-lg transition-shadow"
                >
                    <h2 className="text-3xl font-semibold text-gray-800 text-center">
                        {showBack ? dueCards[questionIndex].back_text : dueCards[questionIndex].front_text}
                    </h2>
                    <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(dueCards[questionIndex]); }}
                        className="mt-10 text-sm text-indigo-400 hover:text-indigo-500 transition-colors"
                    >
                        Edit this card
                    </button>
                </div>

                {/* Progress + Prev/Next navigation */}
                <div className="flex justify-center items-center gap-6 mb-4">
                    {questionIndex > 0 ? (
                        <button
                            onClick={() => { setQuestionIndex(prev => prev - 1); setShowBack(false); }}
                            className="px-4 py-1 text-gray-600 text-sm hover:text-indigo-400 transition-colors w-30"
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
                            className="px-4 py-1 text-gray-600 text-sm hover:text-indigo-400 transition-colors w-28"
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
                      <div className="flex flex-col items-center">
                          <button onClick={() => handleRate(1)} className="px-4 py-1  text-gray-500 hover:text-black hover:underline text-sm font-medium transition-colors">Again</button>
                          <span className="text-xs text-gray-400 mt-1">{previews[1] ?? ""}</span>
                      </div>
                      <div className="flex flex-col items-center">
                          <button onClick={() => handleRate(2)} className="px-4 py-1  text-gray-500 hover:text-black hover:underline text-sm font-medium transition-colors">Hard</button>
                          <span className="text-xs text-gray-400 mt-1">{previews[2] ?? ""}</span>
                      </div>
                      <div className="flex flex-col items-center">
                          <button onClick={() => handleRate(3)} className="px-4 py-1  text-gray-500  hover:text-black hover:underline text-sm font-medium transition-colors">Good</button>
                          <span className="text-xs text-gray-400 mt-1">{previews[3] ?? ""}</span>
                      </div>
                      <div className="flex flex-col items-center">
                          <button onClick={() => handleRate(4)} className="px-4 py-1  text-gray-500  hover:text-black hover:underline text-sm font-medium transition-colors">Easy</button>
                          <span className="text-xs text-gray-400 mt-1">{previews[4] ?? ""}</span>
                      </div>
                  </div>
                )}
            </>
        )}

        
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