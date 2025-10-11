import React from 'react';
import { UnderConstructionScreen } from '../../components/common/UnderConstructionScreen';
import { useLanguage } from '../../contexts/LanguageContext';

export const NotificationsScreen: React.FC = () => {
  const { t } = useLanguage();

  return (
    <UnderConstructionScreen
      title={t('nav.notifications')}
      description={t('common.underConstructionDesc')}
      icon="notifications"
    />
  );
};
