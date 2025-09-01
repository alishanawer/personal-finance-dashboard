import useStore from "./store";
import Home from "./pages/home";
import { useEffect } from "react";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import ReportsPage from "./pages/reports";
import SettingsPage from "./pages/settings";
import DashboardPage from "./pages/dashboard";
import TransactionsPage from "./pages/transactions";
import ProtectedRoute from "./components/protected-routes";
import { ThemeProvider } from "./components/theme-provider";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  const rehydrateAuth = useStore((state) => state.rehydrateAuth);

  useEffect(() => {
    rehydrateAuth();
  }, []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
