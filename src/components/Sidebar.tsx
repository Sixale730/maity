'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, LayoutDashboardIcon, LogOutIcon, UsersIcon } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { label: 'Inicio', href: '/', icon: <HomeIcon size={18} /> },
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboardIcon size={18} /> },
  { label: 'Usuarios', href: '/usuarios', icon: <UsersIcon size={18} /> },
  { label: 'Cerrar sesión', href: '/logout', icon: <LogOutIcon size={18} /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-gray-800 text-gray-100 p-6 z-50">
      <h2 className="text-2xl font-bold mb-10">MAITY</h2>
      <nav className="space-y-4">
        {navItems.map(({ label, href, icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors hover:bg-gray-700',
              pathname === href && 'bg-gray-700 font-semibold'
            )}
          >
            {icon}
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
