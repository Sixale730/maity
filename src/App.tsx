// src/App.tsx
import { Toaster } from "@/ui/components/ui/toaster";
import { Toaster as Sonner } from "@/ui/components/ui/sonner";
import { TooltipProvider } from "@/ui/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { UserProvider } from "@/contexts/UserContext";
import { PlatformTourProvider } from "@/contexts/PlatformTourContext";

import {
  AuthPage,
  AuthCallbackPage,
  RegistrationPage,
  OnboardingPage,
  PendingPage,
  OnboardingSuccessPage
} from "./features/auth";
import {
  DashboardPage,
  IndexPage,
  MyProgressPage,
  AnalyticsPage,
  ReportsPage,
  TrendsPage,
  PlansPage,
  PlanPage,
  DocumentsPage,
  SettingsPage,
  AchievementsPage
} from "./features/dashboard";
import {
  RoleplayPage,
  SessionResultsPage,
  SessionsPage,
  DemoTrainingPage
} from "./features/roleplay";
import { CoachPage, DemoPage } from "./features/coach";
import { OrganizationsPage, TeamPage, UsersPage } from "./features/organizations";
import OAuthTest from "./pages/OAuthTest";
import ProtectedRoute from "./routes/ProtectedRoute";
import InvitationConflict from "./pages/InvitationConflict";
import InvitationRequired from "./pages/InvitationRequired";
import UserStatusError from "./pages/UserStatusError";
import NotFound from "./pages/NotFound";
import AppLayout from "./layouts/AppLayout";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <UserProvider>
            <PlatformTourProvider>
              <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/oauth-test" element={<OAuthTest />} />
            <Route path="/registration" element={<RegistrationPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/onboarding/success" element={<OnboardingSuccessPage />} />
            <Route path="/invitation-confirm" element={<InvitationConflict />} />
            <Route path="/pending" element={<PendingPage />} />
            <Route path="/invitation-required" element={<InvitationRequired />} />
            <Route path="/user-status-error" element={<UserStatusError />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/coach" element={<CoachPage />} />
                <Route path="/roleplay" element={<RoleplayPage />} />
                <Route path="/progress" element={<MyProgressPage />} />
                <Route path="/sessions" element={<SessionsPage />} />
                <Route path="/sessions/:sessionId" element={<SessionResultsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/organizations" element={<OrganizationsPage />} />
                <Route path="/usuarios" element={<UsersPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/trends" element={<TrendsPage />} />
                <Route path="/planes" element={<PlansPage />} />
                <Route path="/plan" element={<PlanPage />} />
                <Route path="/documentos" element={<DocumentsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/logros" element={<AchievementsPage />} />
                <Route path="/demo" element={<DemoPage />} />
                <Route path="/demo-training" element={<DemoTrainingPage />} />
              </Route>
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
              </Routes>
            </PlatformTourProvider>
          </UserProvider>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;



