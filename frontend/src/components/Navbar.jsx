import { useNavigate } from "react-router-dom";
import { logout } from "../api";

export default function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="bg-white px-6 py-10 flex justify-between items-center">
      <h1
        onClick={() => navigate(isLoggedIn ? "/decks" : "/login")}
        className="text-4xl font-serif font-medium tracking-wider text-black-600 px-10 cursor-pointer"
      >
        Rulo
      </h1>

      <div className="flex gap-3 px-10">
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            Logout
          </button>
        ) : (
          <>
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
}