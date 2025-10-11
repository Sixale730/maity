import React from 'react';
import { UnderConstructionScreen } from '../../components/common/UnderConstructionScreen';
import { useLanguage } from '../../contexts/LanguageContext';

export const PrivacyScreen: React.FC = () => {
  const { t } = useLanguage();

  return (
    <UnderConstructionScreen
      title={t('nav.privacy')}
      description={t('common.underConstructionDesc')}
      icon="shield-checkmark"
    />
  );
};
