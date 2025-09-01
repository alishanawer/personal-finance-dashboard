import useStore from "../store";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { isAuthenticated, rehydrated, user } = useStore((state) => state.auth);

  // If still rehydrating, show nothing (or a loader/spinner)
  if (!rehydrated) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
