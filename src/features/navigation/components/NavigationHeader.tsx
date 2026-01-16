import { Link } from 'react-router-dom';
import { MaityLogo } from '@/shared/components/MaityLogo';
import { AdminViewRoleSelector } from '@/shared/components/AdminViewRoleSelector';
import LanguageSelector from '@/shared/components/LanguageSelector';
import { UserMenuDropdown } from './UserMenuDropdown';

export function NavigationHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo - links to hub */}
        <Link
          to="/dashboard"
          className="hover:opacity-80 transition-opacity"
        >
          <MaityLogo size="sm" variant="full" />
        </Link>

        {/* Right side: Admin selector + Language + User menu */}
        <div className="flex items-center gap-3">
          <AdminViewRoleSelector />
          <LanguageSelector compact />
          <UserMenuDropdown />
        </div>
      </div>
    </header>
  );
}
