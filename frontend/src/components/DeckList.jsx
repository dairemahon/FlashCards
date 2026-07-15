import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDecks, deleteDeck} from "../api";

export default function DeckList({ setIsLoggedIn }) {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

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

  const toggleSelect = (deckId) => {
    setSelectedIds((prev) =>
      prev.includes(deckId) ? prev.filter((id) => id !== deckId) : [...prev, deckId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    if (!window.confirm(`Are you sure you want to delete ${count} deck${count > 1 ? "s" : ""}? This cannot be undone.`)) return;
    try {
        await Promise.all(selectedIds.map((id) => deleteDeck(id)));
        setDecks((prev) => prev.filter((d) => !selectedIds.includes(d.id)));
        setSelectedIds([]);
        setEditMode(false);
    } catch (err) {
        setError(err.message);
    }
};

  return (
  <div className="min-h-screen bg-white">
    {/* Main content area */}
    <main className="max-w-4/5 mx-auto px-4 py-10">

      {/* Page header */}
      <div className="flex justify-between items-center mb-8">
    <h2 className="text-3xl font-serif text-gray-800 px-15">My Decks</h2>
    <div className="flex gap-3 px-20">
        {editMode && selectedIds.length > 0 && (
            <button
                onClick={handleDeleteSelected}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
            >
                Delete Selected ({selectedIds.length})
            </button>
        )}
        <button
            onClick={() => { setEditMode((prev) => !prev); setSelectedIds([]); }}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
            {editMode ? "Done" : "Edit"}
        </button>
      </div>
    </div>

      {/* States */}
      {loading ? (
        <p className="text-gray-400 text-center mt-20">Loading decks...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : decks.length === 0 ? (
        <p className="text-gray-400 text-center mt-20">No decks yet. Create your first one!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-20">
          {decks.map((deck) => (
            <div
              key={deck.id}
              onClick={() => editMode ? toggleSelect(deck.id) : navigate(`/decks/${deck.id}`)}
              className={`bg-white rounded-xl shadow-sm p-8 cursor-pointer hover:shadow-md transition-shadow 
                  border min-h-60 flex flex-col items-center justify-center pb-15
                  ${editMode && selectedIds.includes(deck.id) ? "border-red-400 bg-red-50" : "border-gray-100"}`}
            >
              {editMode && (
                <input
                  type="checkbox"
                  checked={selectedIds.includes(deck.id)}
                  onChange={() => toggleSelect(deck.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="mb-3 w-4 h-4 accent-red-500"
                />
              )}
              <h3 className="text-2xl font-semibold text-gray-800 text-center">{deck.title}</h3>
              {deck.description && (
                <p className="text-sm text-gray-500 mt-1 text-center">{deck.description}</p>
              )}
            </div>
          ))}

          {/* New Deck card — styled to match the other cards */}
          <div
            onClick={() => navigate("/decks/create")}
            className="bg-white rounded-xl shadow-sm p-8 cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-indigo-300 min-h-60 flex flex-col items-center justify-center text-indigo-400 hover:text-indigo-600 hover:border-indigo-500 transition-colors"
          >
            <span className="text-5xl font-light mb-3">+</span>
            <span className="text-sm font-medium">New Deck</span>
          </div>

        </div>
      )}
    </main>
  </div>
);
}