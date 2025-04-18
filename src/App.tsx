
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import WalletPage from "./pages/WalletPage";
import AchievementsPage from "./pages/AchievementsPage";
import MarketplacePage from "./pages/MarketplacePage";
import ExchangePage from "./pages/ExchangePage";
import AdminPage from "./pages/AdminPage";
import ClassesPage from "./pages/ClassesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/exchange" element={<ExchangePage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
