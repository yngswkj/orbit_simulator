import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import type { CallBackProps, Step } from 'react-joyride';
import { useTranslation } from '../../utils/i18n';

export const Tour: React.FC = () => {
    const [run, setRun] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        // Check if tour has been seen
        const seen = localStorage.getItem('orbit_sim_tour_seen');
        if (!seen) {
            // Delay slightly to ensure UI is mounted
            setTimeout(() => setRun(true), 1000);
        }
    }, []);

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setRun(false);
            localStorage.setItem('orbit_sim_tour_seen', 'true');
        }
    };

    const steps: Step[] = [
        {
            target: 'body',
            placement: 'center',
            title: t('tour_welcome'),
            content: (
                <div>
                    <p>{t('tour_intro')}</p>
                </div>
            ),
        },
        {
            target: '.control-panel-container', // We need to add this class to ControlPanel container
            title: t('tour_panel_title'),
            content: t('tour_panel_content'),
            placement: 'left',
        },
        {
            target: '.sim-controls-buttons', // Need to add class
            title: t('tour_sim_title'),
            content: t('tour_sim_content'),
        },
        {
            target: '.camera-follow-select', // Need to add class
            title: t('tour_cam_title'),
            content: t('tour_cam_content'),
        },
        {
            target: 'canvas', // Approximate
            title: t('tour_scene_title'),
            content: t('tour_scene_content'),
            placement: 'bottom',
        }
    ];

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showSkipButton
            showProgress
            styles={{
                options: {
                    zIndex: 10000,
                    primaryColor: '#22aaff',
                    textColor: '#333',
                    backgroundColor: '#fff',
                },
                tooltipContainer: {
                    textAlign: 'left'
                },
                buttonNext: {
                    backgroundColor: '#22aaff'
                }
            }}
            callback={handleJoyrideCallback}
        />
    );
};
