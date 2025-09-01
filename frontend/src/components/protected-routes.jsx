import { Navigate } from "react-router-dom";
import useStore from "../store";

function ProtectedRoute({ children }) {
  const { isAuthenticated, rehydrated } = useStore((state) => state.auth);

  // If still rehydrating, show nothing (or a loader/spinner)
  if (!rehydrated) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
