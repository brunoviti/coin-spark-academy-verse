
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import MarketplacePage from "./pages/MarketplacePage";
import ExchangePage from "./pages/ExchangePage";
import AchievementsPage from "./pages/AchievementsPage";
import WalletPage from "./pages/WalletPage";
import ClassesPage from "./pages/ClassesPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";
import { AuthProvider } from "./contexts/auth";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/exchange" element={<ExchangePage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/classes" element={<ClassesPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
