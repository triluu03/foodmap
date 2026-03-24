import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";

export function Navbar() {
  const { user, isAuthenticated, isLoading, logout, loginWithRedirect } =
    useAuth0();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Foodmap
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : isAuthenticated ? (
              <>
                <Link
                  to="/userlist"
                  className="text-sm text-gray-700 hover:text-blue-600"
                >
                  Users
                </Link>
                <Link
                  to="/user"
                  className="text-sm text-gray-700 hover:text-blue-600"
                >
                  {user?.name || user?.email}
                </Link>
                <button
                  onClick={() =>
                    logout({
                      logoutParams: { returnTo: window.location.origin },
                    })
                  }
                  className="text-sm text-red-600 hover:text-red-800 hover:cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => loginWithRedirect()}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
