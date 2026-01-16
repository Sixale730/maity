import { WelcomeSection } from './WelcomeSection';
import { UserNavigationSection } from './UserNavigationSection';
import { AdminNavigationSection } from './AdminNavigationSection';

export function NavigationHub() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-10">
      {/* Welcome section with avatar */}
      <WelcomeSection />

      {/* User navigation cards grouped by section */}
      <UserNavigationSection />

      {/* Admin section (only visible to admins) */}
      <AdminNavigationSection />
    </div>
  );
}
