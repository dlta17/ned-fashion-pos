import React from 'react';
import PageHeader from '../components/common/PageHeader';
import LiveAssistant from '../components/LiveAssistant';
import { useI18n } from '../contexts/I18nContext';

const LiveAssistantPage: React.FC = () => {
    const { t } = useI18n();
    return (
        <div>
            <PageHeader title={t('liveAssistant.title')} />
            <div className="bg-white rounded-lg shadow-md p-6">
                <LiveAssistant />
            </div>
        </div>
    );
};

export default LiveAssistantPage;