import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import './ContextHelp.css';
import { useTranslation } from '../../../utils/i18n';

interface ContextHelpProps {
    topic: 'controls' | 'bodies' | 'inspector';
}

const helpContent = {
    en: {
        controls: {
            title: 'Controls',
            description: 'Control simulation speed, camera mode, and visualization options.',
            tips: [
                'Use the time scale slider to speed up or slow down the simulation',
                'Switch between different camera modes for various viewing perspectives',
                'Toggle prediction lines to see future orbital paths',
                'Enable habitable zone visualization for star systems',
                'Adjust gravity heatmap to visualize gravitational field strength'
            ]
        },
        bodies: {
            title: 'Bodies',
            description: 'View all celestial bodies, search, filter, and manage them.',
            tips: [
                'Use the search bar to quickly find specific bodies by name',
                'Filter by type: All, Star, Planet, or Black Hole',
                'Click a body to select it and view details in the Inspector',
                'Hold Ctrl/Cmd or Shift while clicking to select multiple bodies',
                'Use the duplicate button to create a copy of a body',
                'Delete individual bodies or use bulk delete for multiple selections'
            ]
        },
        inspector: {
            title: 'Inspector',
            description: 'Edit properties of the selected body including mass, radius, and vectors.',
            tips: [
                'Modify physical properties like mass, radius, and color',
                'Adjust position and velocity vectors in 3D space',
                'Use sliders for quick adjustments or input exact values',
                'Mass is displayed in solar masses (M☉)',
                'Position and velocity are in simulation units',
                'Changes take effect immediately in the simulation'
            ]
        }
    },
    ja: {
        controls: {
            title: 'コントロール',
            description: 'シミュレーション速度、カメラモード、可視化オプションを制御します。',
            tips: [
                'タイムスケールスライダーでシミュレーションの速度を調整できます',
                '様々な視点で観察するために異なるカメラモードを切り替えられます',
                '予測ラインを切り替えて未来の軌道経路を表示できます',
                '恒星系のハビタブルゾーン可視化を有効にできます',
                '重力ヒートマップで重力場の強度を視覚化できます'
            ]
        },
        bodies: {
            title: '天体',
            description: 'すべての天体を表示、検索、フィルタリング、管理します。',
            tips: [
                '検索バーで名前から特定の天体を素早く見つけられます',
                'タイプでフィルタリング: すべて、恒星、惑星、ブラックホール',
                '天体をクリックして選択し、インスペクターで詳細を表示できます',
                'Ctrl/CmdまたはShiftを押しながらクリックすると複数の天体を選択できます',
                '複製ボタンで天体のコピーを作成できます',
                '個別に削除するか、複数選択して一括削除できます'
            ]
        },
        inspector: {
            title: 'インスペクター',
            description: '選択した天体の質量、半径、ベクトルなどのプロパティを編集します。',
            tips: [
                '質量、半径、色などの物理プロパティを変更できます',
                '3D空間での位置と速度ベクトルを調整できます',
                'スライダーで素早く調整するか、正確な値を入力できます',
                '質量は太陽質量（M☉）で表示されます',
                '位置と速度はシミュレーション単位で表示されます',
                '変更はシミュレーションに即座に反映されます'
            ]
        }
    }
};

export const ContextHelp: React.FC<ContextHelpProps> = ({ topic }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { language } = useTranslation();
    const lang = (language || 'en') as 'en' | 'ja';
    const content = helpContent[lang][topic];

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="context-help-button"
                title={lang === 'ja' ? 'ヘルプを表示' : 'Show help'}
                aria-label={`${lang === 'ja' ? 'ヘルプ' : 'Help'}: ${content.title}`}
            >
                <HelpCircle size={16} />
            </button>
        );
    }

    return (
        <div className="context-help-modal-overlay" onClick={() => setIsOpen(false)}>
            <div className="context-help-modal" onClick={(e) => e.stopPropagation()}>
                <div className="context-help-header">
                    <h3>{content.title}</h3>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="context-help-close"
                        aria-label={lang === 'ja' ? 'ヘルプを閉じる' : 'Close help'}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="context-help-body">
                    <p className="context-help-description">{content.description}</p>

                    <div className="context-help-tips">
                        <h4>{lang === 'ja' ? 'ヒント:' : 'Tips:'}</h4>
                        <ul>
                            {content.tips.map((tip, index) => (
                                <li key={index}>{tip}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
