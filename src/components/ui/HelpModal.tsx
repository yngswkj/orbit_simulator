import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '../../utils/i18n';
import { X, HelpCircle, Mouse, Move, Rotate3D, ZoomIn, Info, History } from 'lucide-react';
import pkg from '../../../package.json';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = React.useState<'controls' | 'changelog'>('controls');

    // Simple responsive check
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!isOpen) return null;

    return createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.6)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                background: 'rgba(10, 10, 15, 0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                width: '700px',
                maxWidth: '90%',
                height: '500px',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                color: 'white',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.02)',
                    flexShrink: 0 // Keep header fixed size
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <HelpCircle size={20} color="#3b82f6" />
                        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.02em' }}>{t('help_title')}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content Wrapper */}
                <div style={{
                    display: 'flex',
                    flex: 1,
                    minHeight: 0,
                    flexDirection: isMobile ? 'column' : 'row'
                }}>

                    {/* Sidebar / Tabs */}
                    <div style={{
                        width: isMobile ? '100%' : '200px',
                        minWidth: isMobile ? '100%' : '200px',
                        borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)',
                        borderBottom: isMobile ? '1px solid rgba(255,255,255,0.1)' : 'none',
                        background: 'rgba(0,0,0,0.2)',
                        padding: isMobile ? '0' : '16px 0',
                        display: 'flex',
                        flexDirection: isMobile ? 'row' : 'column',
                        flexShrink: 0,
                        overflowX: isMobile ? 'auto' : 'hidden' // Scroll tabs horizontally if needed
                    }}>
                        <TabButton
                            active={activeTab === 'controls'}
                            onClick={() => setActiveTab('controls')}
                            icon={<Mouse size={16} />}
                            label={t('controls_header')}
                            isMobile={isMobile}
                        />
                        <TabButton
                            active={activeTab === 'changelog'}
                            onClick={() => setActiveTab('changelog')}
                            icon={<History size={16} />}
                            label={t('changelog_header')}
                            isMobile={isMobile}
                        />

                        {!isMobile && <div style={{ flex: 1 }} />} {/* Spacer only for desktop */}

                        {/* Info Block */}
                        <div style={{
                            padding: isMobile ? '0 16px' : '16px',
                            borderTop: isMobile ? 'none' : '1px solid rgba(255,255,255,0.05)',
                            display: isMobile ? 'flex' : 'block',
                            alignItems: 'center',
                            marginLeft: isMobile ? 'auto' : 0
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.75rem',
                                color: '#64748b',
                                background: 'rgba(255,255,255,0.03)',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                justifyContent: 'center'
                            }}>
                                <Info size={14} />
                                <span style={{ fontFamily: 'monospace' }}>v{pkg.version}</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Panel */}
                    <div style={{
                        flex: 1,
                        padding: '24px',
                        overflowY: 'auto' // Vertical Scroll
                    }}>

                        {/* Tab Content starts at the very top for both */}

                        {activeTab === 'controls' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <ControlItem icon={<Rotate3D size={18} />} label={t('ctrl_rotate')} desc={t('ctrl_rotate_desc')} />
                                <ControlItem icon={<Move size={18} />} label={t('ctrl_pan')} desc={t('ctrl_pan_desc')} />
                                <ControlItem icon={<ZoomIn size={18} />} label={t('ctrl_zoom')} desc={t('ctrl_zoom_desc')} />
                                <ControlItem icon={<Mouse size={18} />} label={t('ctrl_select')} desc={t('ctrl_select_desc')} />
                            </div>
                        )}

                        {activeTab === 'changelog' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {getChangelogData(t).map((log, index) => (
                                    <div key={log.version}>
                                        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: log.isCurrent ? '#10b981' : '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {log.title || `v${log.version}`}
                                            {log.isCurrent && <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'normal' }}>Current</span>}
                                        </h4>
                                        <div style={{
                                            background: 'rgba(255,255,255,0.02)',
                                            borderRadius: '8px',
                                            padding: '16px',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            opacity: index > 2 ? 0.7 : 1
                                        }}>
                                            <ul style={{ paddingLeft: '20px', margin: 0, color: '#e2e8f0', lineHeight: 1.8, fontSize: '0.9rem' }}>
                                                {log.changes.map((change, i) => (
                                                    <li key={i} style={{ marginBottom: i === log.changes.length - 1 ? 0 : '8px' }}>
                                                        <ChangeBadge type={change.type} />
                                                        {change.content}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

// --- Sub Components ---

const TabButton = ({ active, onClick, icon, label, isMobile }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, isMobile: boolean }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: isMobile ? '12px 16px' : '10px 20px',
            width: isMobile ? 'auto' : '100%',
            flex: isMobile ? 1 : 'none',
            justifyContent: isMobile ? 'center' : 'flex-start',
            background: active ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            border: 'none',
            borderLeft: (!isMobile && active) ? '3px solid #3b82f6' : '3px solid transparent',
            borderBottom: (isMobile && active) ? '3px solid #3b82f6' : '3px solid transparent',
            color: active ? '#3b82f6' : '#94a3b8',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
        }}
    >
        {icon}
        {label}
    </button>
);

const ControlItem = ({ icon, label, desc }: { icon: React.ReactNode, label: string, desc: string }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '12px 16px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.03)',
        transition: 'background 0.2s'
    }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
    >
        <div style={{ color: '#3b82f6', opacity: 0.9 }}>{icon}</div>
        <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: '0.9rem', color: '#f1f5f9' }}>{label}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{desc}</div>
        </div>
    </div>
);

// --- Changelog Data & types ---

type ChangeType = 'new' | 'improve' | 'fix' | 'remove' | 'tech' | 'none';

interface ChangeItemData {
    type: ChangeType;
    content: string;
}

interface VersionLog {
    version: string;
    title?: string;
    isCurrent?: boolean;
    changes: ChangeItemData[];
}

const ChangeBadge = ({ type }: { type: ChangeType }) => {
    if (type === 'none') return null;

    let color = '#94a3b8';
    let label = 'Other';

    switch (type) {
        case 'new': color = '#10b981'; label = '新機能'; break;
        case 'improve': color = '#3b82f6'; label = '改善'; break;
        case 'fix': color = '#a855f7'; label = '修正'; break;
        case 'remove': color = '#ef4444'; label = '削除'; break;
        case 'tech': color = '#f59e0b'; label = '技術'; break;
    }

    return (
        <span style={{
            color: color,
            fontWeight: 'bold',
            fontSize: '0.75rem',
            border: `1px solid ${color}4d`, // 30% alpha roughly
            padding: '1px 4px',
            borderRadius: '4px',
            marginRight: '8px'
        }}>
            {label}
        </span>
    );
};

const getChangelogData = (t: any): VersionLog[] => [
    {
        version: '0.4.1',
        isCurrent: true,
        changes: [
            { type: 'improve', content: 'リアル距離モードの時間進行速度調整 (8倍速)' },
            { type: 'new', content: '重力場を表示する機能' },
            { type: 'fix', content: 'グリッド表示切り替え時のエラー修正' }
        ]
    },
    {
        version: '0.4.0',
        title: t('cl_v0_4_0_title'),
        changes: [
            { type: 'improve', content: t('cl_item_compact') },
            { type: 'new', content: t('cl_item_zen') },
            { type: 'tech', content: t('cl_item_ui') },
            { type: 'new', content: t('cl_item_gallery') }
        ]
    },
    {
        version: '0.3.0',
        title: t('cl_v0_3_0_title'),
        changes: [
            { type: 'improve', content: t('cl_item_energy') },
            { type: 'new', content: t('cl_item_hybrid') },
            { type: 'tech', content: t('cl_item_cleanup') }
        ]
    },
    {
        version: '0.2.1',
        title: t('cl_v0_2_1_title'),
        changes: [
            { type: 'improve', content: t('cl_item_surface') },
            { type: 'new', content: t('cl_item_perf') },
            { type: 'tech', content: t('cl_item_physics') }
        ]
    },
    {
        version: '0.2.0',
        changes: [
            { type: 'improve', content: '惑星自転の精密化 (地球を基準とした1日1回転の正確な同期)' },
            { type: 'new', content: 'シミュレーション日付の表示 (経過日数・年数)' },
            { type: 'fix', content: 'カメラ初期位置と距離感の再調整・初期状態の同期修正' },
            { type: 'tech', content: 'WebGPU安定性の向上 (バッファ競合回避による安全性確保)' }
        ]
    },
    {
        version: '0.1.0',
        changes: [
            { type: 'new', content: '地表視点モード・軌道固定視点モード' },
            { type: 'none', content: 'パフォーマンス最適化 (Barnes-Hut, WebWorker, WebGPU準備)' },
            { type: 'none', content: 'UI改善 (ヘルプモーダル・操作ガイド)' }
        ]
    }
];
