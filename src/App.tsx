import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ProfileSetup from "./pages/ProfileSetup";
import Learning from "./pages/Learning";
import RiskAssessment from "./pages/RiskAssessment";
import Analytics from "./pages/Analytics";
import Animals from "./pages/Animals";
import Alerts from "./pages/Alerts";
import Records from "./pages/Records";
import PolicymakerDashboard from "./pages/PolicymakerDashboard";
import Notifications from "./pages/Notifications";
import ContactPolicymakers from "./pages/ContactPolicymakers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/learning" element={<Layout><Learning /></Layout>} />
            <Route path="/risk-assessment" element={<Layout><RiskAssessment /></Layout>} />
            <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
            <Route path="/animals" element={<Layout><Animals /></Layout>} />
            <Route path="/alerts" element={<Layout><Alerts /></Layout>} />
            <Route path="/records" element={<Layout><Records /></Layout>} />
            <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
            <Route path="/contact" element={<Layout><ContactPolicymakers /></Layout>} />
            <Route path="/policymaker" element={<Layout><PolicymakerDashboard /></Layout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
