// src/App.tsx
import { lazy, Suspense } from "react";
import { Toaster } from "@/ui/components/ui/toaster";
import { Toaster as Sonner } from "@/ui/components/ui/sonner";
import { TooltipProvider } from "@/ui/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { UserProvider } from "@/contexts/UserContext";
import { ViewRoleProvider } from "@/contexts/ViewRoleContext";
import { PlatformTourProvider } from "@/contexts/PlatformTourContext";
import LoadingFallback from "@/components/LoadingFallback";

// Critical routes (loaded immediately)
import { IndexPage } from "./features/dashboard";
import { AuthPage, AuthCallbackPage } from "./features/auth";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";

// Lazy-loaded routes (loaded on demand)
const RegistrationPage = lazy(() => import("./features/auth").then(m => ({ default: m.RegistrationPage })));
const OnboardingPage = lazy(() => import("./features/auth").then(m => ({ default: m.OnboardingPage })));
const PendingPage = lazy(() => import("./features/auth").then(m => ({ default: m.PendingPage })));
const OnboardingSuccessPage = lazy(() => import("./features/auth").then(m => ({ default: m.OnboardingSuccessPage })));
const LevelsIntroPage = lazy(() => import("./features/levels").then(m => ({ default: m.LevelsIntroPage })));

const DashboardPage = lazy(() => import("./features/dashboard").then(m => ({ default: m.DashboardPage })));
const MyProgressPage = lazy(() => import("./features/dashboard").then(m => ({ default: m.MyProgressPage })));
const AdminAnalyticsPage = lazy(() => import("./features/analytics").then(m => ({ default: m.AnalyticsPage })));
const ReportsPage = lazy(() => import("./features/dashboard").then(m => ({ default: m.ReportsPage })));
const TrendsPage = lazy(() => import("./features/dashboard").then(m => ({ default: m.TrendsPage })));
const PlansPage = lazy(() => import("./features/dashboard").then(m => ({ default: m.PlansPage })));
const PlanPage = lazy(() => import("./features/dashboard").then(m => ({ default: m.PlanPage })));
const DocumentsPage = lazy(() => import("./features/dashboard").then(m => ({ default: m.DocumentsPage })));
const SettingsPage = lazy(() => import("./features/dashboard").then(m => ({ default: m.SettingsPage })));
const AchievementsPage = lazy(() => import("./features/dashboard").then(m => ({ default: m.AchievementsPage })));

const RoleplayPage = lazy(() => import("./features/roleplay").then(m => ({ default: m.RoleplayPage })));
const SessionResultsPage = lazy(() => import("./features/roleplay").then(m => ({ default: m.SessionResultsPage })));
const SessionsPage = lazy(() => import("./features/roleplay").then(m => ({ default: m.SessionsPage })));
const DemoTrainingPage = lazy(() => import("./features/roleplay").then(m => ({ default: m.DemoTrainingPage })));

const TechWeekPage = lazy(() => import("./features/tech-week").then(m => ({ default: m.TechWeekPage })));
const TechWeekSessionsPage = lazy(() => import("./features/tech-week").then(m => ({ default: m.TechWeekSessionsPage })));
const TechWeekResultsPage = lazy(() => import("./features/tech-week").then(m => ({ default: m.TechWeekResultsPage })));

const AgentConfigPage = lazy(() => import("./features/agent-config/pages/AgentConfigPage"));
const AIResourcesPage = lazy(() => import("./features/ai-resources").then(m => ({ default: m.AIResourcesPage })));
const LearningPathPage = lazy(() => import("./features/learning-path").then(m => ({ default: m.LearningPathPage })));
const TeamProgressPage = lazy(() => import("./features/learning-path").then(m => ({ default: m.TeamProgressPage })));

const AvatarEditorPage = lazy(() => import("./features/avatar").then(m => ({ default: m.AvatarEditorPage })));
const AvatarShowcasePage = lazy(() => import("./features/avatar-showcase").then(m => ({ default: m.AvatarShowcasePage })));

const CoachPage = lazy(() => import("./features/coach").then(m => ({ default: m.CoachPage })));
const DemoPage = lazy(() => import("./features/coach").then(m => ({ default: m.DemoPage })));

const InterviewPage = lazy(() => import("./features/interview").then(m => ({ default: m.InterviewPage })));
const InterviewHistoryPage = lazy(() => import("./features/interview").then(m => ({ default: m.InterviewHistoryPage })));
const InterviewResultsPage = lazy(() => import("./features/interview").then(m => ({ default: m.InterviewResultsPage })));

const OrganizationsPage = lazy(() => import("./features/organizations").then(m => ({ default: m.OrganizationsPage })));
const TeamPage = lazy(() => import("./features/organizations").then(m => ({ default: m.TeamPage })));
const UsersPage = lazy(() => import("./features/organizations").then(m => ({ default: m.UsersPage })));

const NavigationHub = lazy(() => import("./features/navigation").then(m => ({ default: m.NavigationHub })));
const OmiConversationsPage = lazy(() => import("./features/omi").then(m => ({ default: m.OmiConversationsPage })));

const OAuthTest = lazy(() => import("./pages/OAuthTest"));
const InvitationConflict = lazy(() => import("./pages/InvitationConflict"));
const InvitationRequired = lazy(() => import("./pages/InvitationRequired"));
const UserStatusError = lazy(() => import("./pages/UserStatusError"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AppLayout = lazy(() => import("./layouts/AppLayout"));


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <UserProvider>
            <ViewRoleProvider>
              <PlatformTourProvider>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                  {/* Critical routes (no lazy loading) */}
                  <Route path="/" element={<IndexPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/auth/callback" element={<AuthCallbackPage />} />

                  {/* Lazy-loaded routes */}
                  <Route path="/oauth-test" element={<OAuthTest />} />
                  <Route path="/registration" element={<RegistrationPage />} />
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route path="/onboarding/success" element={<OnboardingSuccessPage />} />
                  <Route path="/levels-intro" element={<LevelsIntroPage />} />
                  <Route path="/invitation-confirm" element={<InvitationConflict />} />
                  <Route path="/pending" element={<PendingPage />} />
                  <Route path="/invitation-required" element={<InvitationRequired />} />
                  <Route path="/user-status-error" element={<UserStatusError />} />

                  <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                      <Route path="/dashboard" element={<NavigationHub />} />
                      <Route path="/home" element={<NavigationHub />} />
                      <Route path="/stats" element={<DashboardPage />} />
                      <Route path="/coach" element={<CoachPage />} />
                      <Route path="/roleplay" element={<RoleplayPage />} />
                      <Route path="/primera-entrevista" element={<InterviewPage />} />
                      <Route path="/progress" element={<MyProgressPage />} />
                      <Route path="/learning-path" element={<LearningPathPage />} />
                      <Route path="/team/learning-progress" element={<TeamProgressPage />} />
                      <Route path="/sessions" element={<SessionsPage />} />
                      <Route path="/sessions/:sessionId" element={<SessionResultsPage />} />
                      <Route path="/omi" element={<OmiConversationsPage />} />
                      <Route path="/analytics" element={<AdminRoute><AdminAnalyticsPage /></AdminRoute>} />
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
                      <Route path="/avatar" element={<AvatarEditorPage />} />
                      <Route path="/demo" element={<DemoPage />} />
                      <Route path="/demo-training" element={<DemoTrainingPage />} />

                      {/* Tech Week Routes (Admin Only) */}
                      <Route path="/tech-week" element={<AdminRoute><TechWeekPage /></AdminRoute>} />
                      <Route path="/tech-week/sessions" element={<AdminRoute><TechWeekSessionsPage /></AdminRoute>} />
                      <Route path="/tech-week/sessions/:sessionId" element={<AdminRoute><TechWeekResultsPage /></AdminRoute>} />

                      {/* Agent Configuration (Admin Only) */}
                      <Route path="/admin/agent-config" element={<AdminRoute><AgentConfigPage /></AdminRoute>} />

                      {/* AI Educational Resources (Admin Only) */}
                      <Route path="/ai-resources" element={<AdminRoute><AIResourcesPage /></AdminRoute>} />

                      {/* Avatar Showcase (Admin Only) */}
                      <Route path="/avatar-showcase" element={<AdminRoute><AvatarShowcasePage /></AdminRoute>} />

                      {/* Interview Routes (Admin Only) */}
                      <Route path="/primera-entrevista/historial" element={<AdminRoute><InterviewHistoryPage /></AdminRoute>} />
                      <Route path="/primera-entrevista/resultados/:sessionId" element={<AdminRoute><InterviewResultsPage /></AdminRoute>} />
                    </Route>
                  </Route>

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </PlatformTourProvider>
          </ViewRoleProvider>
          </UserProvider>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;



