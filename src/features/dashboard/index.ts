/**
 * Dashboard Feature - Public API
 * Export all dashboard-related pages and components
 */

// Pages
export { default as DashboardPage } from './pages/Dashboard';
export { MyProgress as MyProgressPage } from './pages/MyProgress';
export { default as AnalyticsPage } from './pages/Analytics';
export { default as ReportsPage } from './pages/Reports';
export { default as TrendsPage } from './pages/Trends';
export { default as PlansPage } from './pages/Plans';
export { default as PlanPage } from './pages/Plan';
export { default as DocumentsPage } from './pages/Documents';
export { default as SettingsPage } from './pages/Settings';
export { default as AchievementsPage } from './pages/Achievements';

// Components
export { DashboardContent } from './components/DashboardContent';
export { PlatformAdminDashboard } from './components/dashboards/PlatformAdminDashboard';
export { default as TeamDashboard } from './components/dashboards/TeamDashboard';
export { UserDashboard } from './components/dashboards/UserDashboard';
export { GamifiedDashboard } from './components/gamified/GamifiedDashboard';
