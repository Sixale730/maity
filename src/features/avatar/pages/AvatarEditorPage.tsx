/**
 * AvatarEditorPage
 * Full page for editing user avatar
 */

import { useUser } from '@/contexts/UserContext';
import { useAvatarWithDefault } from '@maity/shared';
import { AvatarEditor } from '../components/AvatarEditor';
import { Loader2, UserCircle } from 'lucide-react';

export function AvatarEditorPage() {
  const { userProfile } = useUser();
  const userId = userProfile?.id;
  const { avatar, isLoading } = useAvatarWithDefault(userId);

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-muted-foreground">
          <UserCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No se pudo cargar el perfil del usuario</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Mi Avatar</h1>
        <p className="text-muted-foreground mt-1">
          Personaliza tu avatar con colores, formas y accesorios
        </p>
      </div>

      <AvatarEditor
        userId={userId}
        initialConfig={avatar}
      />
    </div>
  );
}

export default AvatarEditorPage;
