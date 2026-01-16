import { useUser } from '@/contexts/UserContext';
import { useAvatarWithDefault } from '@maity/shared';
import { useLanguage } from '@/contexts/LanguageContext';
import { VoxelAvatar } from '@/features/avatar';

export function WelcomeSection() {
  const { t } = useLanguage();
  const { userProfile } = useUser();
  const { avatar } = useAvatarWithDefault(userProfile?.id);

  const firstName = userProfile?.name?.split(' ')[0] || t('roles.default_user');

  return (
    <div className="flex items-center gap-4">
      <VoxelAvatar
        config={avatar}
        size="md"
        className="rounded-xl overflow-hidden shadow-sm"
      />
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t('nav.welcome')}, {firstName}
        </h1>
        <p className="text-muted-foreground">
          {t('nav.welcome_subtitle')}
        </p>
      </div>
    </div>
  );
}
