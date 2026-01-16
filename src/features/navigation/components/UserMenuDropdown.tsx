import { useNavigate } from 'react-router-dom';
import { LogOut, User, Settings } from 'lucide-react';
import { supabase, useAvatarWithDefault } from '@maity/shared';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { VoxelAvatar } from '@/features/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/components/ui/dropdown-menu';
import { Button } from '@/ui/components/ui/button';

export function UserMenuDropdown() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { userProfile } = useUser();
  const { avatar } = useAvatarWithDefault(userProfile?.id);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 px-2 gap-2">
          <VoxelAvatar
            config={avatar}
            size="xs"
            className="rounded-md overflow-hidden"
          />
          <span className="text-sm font-medium hidden sm:inline-block max-w-[100px] truncate">
            {userProfile?.name || t('roles.default_user')}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userProfile?.name || t('roles.default_user')}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userProfile?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/avatar')} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          {t('nav.avatar')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          {t('nav.settings')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          {t('nav.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
