import { WelcomeSection } from './WelcomeSection';
import { UserNavigationSection } from './UserNavigationSection';
import { AdminNavigationSection } from './AdminNavigationSection';

export function NavigationHub() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-10 relative">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-[#485df4] rounded-full opacity-5 blur-[100px]" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-[#ff0050] rounded-full opacity-5 blur-[100px]" />
      </div>

      {/* Welcome section with avatar */}
      <WelcomeSection />

      {/* User navigation cards grouped by section */}
      <UserNavigationSection />

      {/* Admin section (only visible to admins) */}
      <AdminNavigationSection />
    </div>
  );
}
