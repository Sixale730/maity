// src/App.tsx
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { UserProvider } from "@/contexts/UserContext";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import OAuthTest from "./pages/OAuthTest";
import Dashboard from "./pages/Dashboard";
import Pending from "./pages/Pending";
import ProtectedRoute from "./routes/ProtectedRoute";
import Registration from "./pages/Registration";
import Onboarding from "./pages/Onboarding";
import OnboardingSuccess from "./pages/OnboardingSuccess";
import InvitationConflict from "./pages/InvitationConflict";
import InvitationRequired from "./pages/InvitationRequired";
import UserStatusError from "./pages/UserStatusError";
import NotFound from "./pages/NotFound";
import Roleplay from "./pages/Roleplay";
import { MyProgress } from "./pages/MyProgress";
import AppLayout from "./layouts/AppLayout";
import Coach from "./pages/Coach";
import Sessions from "./pages/Sessions";
import SessionResultsPage from "./pages/SessionResultsPage";
import Organizations from "./pages/Organizations";
import Team from "./pages/Team";
import Analytics from "./pages/Analytics";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import Trends from "./pages/Trends";
import Plans from "./pages/Plans";
import Plan from "./pages/Plan";
import Documents from "./pages/Documents";
import Settings from "./pages/Settings";
import Achievements from "./pages/Achievements";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <UserProvider>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/oauth-test" element={<OAuthTest />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/onboarding/success" element={<OnboardingSuccess />} />
            <Route path="/invitation-confirm" element={<InvitationConflict />} />
            <Route path="/pending" element={<Pending />} />
            <Route path="/invitation-required" element={<InvitationRequired />} />
            <Route path="/user-status-error" element={<UserStatusError />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/coach" element={<Coach />} />
                <Route path="/roleplay" element={<Roleplay />} />
                <Route path="/progress" element={<MyProgress />} />
                <Route path="/sessions" element={<Sessions />} />
                <Route path="/sessions/:sessionId" element={<SessionResultsPage />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/organizations" element={<Organizations />} />
                <Route path="/usuarios" element={<Users />} />
                <Route path="/team" element={<Team />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/trends" element={<Trends />} />
                <Route path="/planes" element={<Plans />} />
                <Route path="/plan" element={<Plan />} />
                <Route path="/documentos" element={<Documents />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/logros" element={<Achievements />} />
              </Route>
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </UserProvider>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;



