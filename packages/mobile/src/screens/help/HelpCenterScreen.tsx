import React from 'react';
import { UnderConstructionScreen } from '../../components/common/UnderConstructionScreen';
import { useLanguage } from '../../contexts/LanguageContext';

export const HelpCenterScreen: React.FC = () => {
  const { t } = useLanguage();

  return (
    <UnderConstructionScreen
      title={t('nav.helpCenter')}
      description={t('common.underConstructionDesc')}
      icon="help-circle"
    />
  );
};
