import React from 'react';
import { UnderConstructionScreen } from '../../components/common/UnderConstructionScreen';
import { useLanguage } from '../../contexts/LanguageContext';

export const TermsScreen: React.FC = () => {
  const { t } = useLanguage();

  return (
    <UnderConstructionScreen
      title={t('nav.terms')}
      description={t('common.underConstructionDesc')}
      icon="document-text"
    />
  );
};
