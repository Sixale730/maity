import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { getOmiConversation } from '../services/omi.service';
import { OmiConversationDetail } from '../components/OmiConversationDetail';

export function OmiConversationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const { data: conversation, isLoading, error } = useQuery({
    queryKey: ['omi-conversation', id],
    queryFn: () => getOmiConversation(id!),
    enabled: !!id,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
          <p className="text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !conversation) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-xl bg-[#0F0F0F] border border-red-500/30 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            {t('omi.conversation_not_found')}
          </h2>
          <p className="text-gray-500 mb-6">
            {t('omi.conversation_not_found_desc')}
          </p>
          <Button
            onClick={() => navigate('/conversaciones')}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('omi.back_to_conversations')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <OmiConversationDetail
      conversation={conversation}
      onBack={() => navigate('/conversaciones')}
    />
  );
}
