import React from 'react';
import { UnderConstructionScreen } from '../../components/common/UnderConstructionScreen';
import { useLanguage } from '../../contexts/LanguageContext';

export const LanguageScreen: React.FC = () => {
  const { t } = useLanguage();

  return (
    <UnderConstructionScreen
      title={t('nav.language')}
      description={t('common.underConstructionDesc')}
      icon="globe"
    />
  );
};
