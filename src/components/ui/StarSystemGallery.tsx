import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePhysicsStore } from '../../store/physicsStore';
import { STAR_SYSTEM_PRESETS } from '../../utils/starSystems';
import type { StarSystemMode } from '../../types/starSystem';
import { Sun, Star, Activity, Infinity as InfinityIcon, CheckCircle2, Orbit } from 'lucide-react';

interface StarSystemGalleryProps {
    isOpen: boolean;
    onClose: () => void;
}

// Category icons using Lucide
const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'classic': return <Sun size={32} color="#fcd34d" />;
        case 'multi-star': return <Star size={32} color="#60a5fa" fill="#60a5fa" fillOpacity={0.2} />;
        case 'choreography': return <InfinityIcon size={32} color="#a78bfa" />;
        default: return <Star size={32} color="#94a3b8" />;
    }
};

export const StarSystemGallery: React.FC<StarSystemGalleryProps> = ({ isOpen, onClose }) => {
    const loadStarSystem = usePhysicsStore(state => state.loadStarSystem);
    const currentSystemId = usePhysicsStore(state => state.currentSystemId);
    const currentSystemMode = usePhysicsStore(state => state.currentSystemMode);

    const [selectedModes, setSelectedModes] = useState<Record<string, StarSystemMode>>({});
    const [hoveredPreset, setHoveredPreset] = useState<string | null>(null);
    const [isClosing, setIsClosing] = useState(false);
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

    // Detect language from navigator
    const isJapanese = typeof navigator !== 'undefined' && navigator.language.startsWith('ja');

    // Mobile detection
    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Sync selectedModes with current store mode when gallery opens
    React.useEffect(() => {
        if (isOpen && currentSystemId && currentSystemMode) {
            setSelectedModes(prev => ({ ...prev, [currentSystemId]: currentSystemMode }));
        }
    }, [isOpen, currentSystemId, currentSystemMode]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 300); // Match animation duration
    };

    if (!isOpen) return null;

    const handleLoadSystem = (systemId: string) => {
        const mode = selectedModes[systemId];
        loadStarSystem(systemId, mode);
        onClose();
    };

    const handleModeChange = (systemId: string, mode: StarSystemMode) => {
        setSelectedModes(prev => ({ ...prev, [systemId]: mode }));
    };

    const modalContent = (
        <div
            style={{
                position: 'fixed',
                top: isMobile ? 'auto' : '10px',
                left: isMobile ? '8px' : 'auto',
                bottom: isMobile ? '8px' : 'auto',
                right: isMobile ? '8px' : '10px',
                width: isMobile ? 'calc(100% - 16px)' : '900px',
                height: isMobile ? 'auto' : 'calc(100vh - 20px)',
                maxHeight: isMobile ? '50vh' : '800px',
                minHeight: isMobile ? '240px' : 'auto',
                background: 'rgba(20, 20, 30, 0.92)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: isMobile ? '12px' : '8px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: isMobile ? '0 -4px 20px rgba(0, 0, 0, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.4)',
                overflow: 'hidden',
                zIndex: 2000,
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isClosing
                    ? (isMobile ? 'translateY(calc(100% + 16px))' : 'translateX(calc(100% + 20px))')
                    : (isMobile ? 'translateY(0)' : 'translateX(0)'),
                opacity: isClosing ? 0 : 1,
                animation: !isClosing
                    ? (isMobile ? 'slideUpIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' : 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)')
                    : 'none'
            }}
        >
                {/* Header */}
                <div style={{
                    padding: isMobile ? '12px 16px' : '16px 24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.1)',
                    flexShrink: 0,
                    minHeight: isMobile ? '56px' : '64px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Orbit size={isMobile ? 18 : 20} color="#3b82f6" />
                        <h2 style={{
                            margin: 0,
                            color: 'white',
                            fontSize: isMobile ? '1rem' : '1.1rem',
                            fontWeight: 600,
                            letterSpacing: '0.02em'
                        }}>
                            {isJapanese ? '恒星系ギャラリー' : 'Star System Gallery'}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '8px',
                            color: 'rgba(255, 255, 255, 0.6)',
                            cursor: 'pointer',
                            fontSize: isMobile ? '20px' : '24px',
                            lineHeight: 1,
                            width: isMobile ? '32px' : '36px',
                            height: isMobile ? '32px' : '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            fontWeight: 300
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                        }}
                    >×</button>
                </div>

                {/* Preset Grid */}
                <div style={{
                    padding: isMobile ? '16px' : '24px',
                    overflowY: 'auto',
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: isMobile ? '16px' : '20px',
                    flex: 1
                }}>
                    {STAR_SYSTEM_PRESETS.map(preset => {
                        const isActive = currentSystemId === preset.id;
                        const isHovered = hoveredPreset === preset.id;
                        // Selected mode in UI (or default to first mode)
                        const selectedMode = selectedModes[preset.id] || (preset.modes?.[0]?.id ?? undefined);
                        // Check if mode differs from current store mode (for mode switch button)
                        const isModeChanged = isActive && preset.modes && selectedMode !== currentSystemMode;
                        // Fully active = same system AND same mode (or no modes)
                        const isFullyActive = isActive && (!preset.modes || selectedMode === currentSystemMode);

                        return (
                            <div
                                key={preset.id}
                                onMouseEnter={() => setHoveredPreset(preset.id)}
                                onMouseLeave={() => setHoveredPreset(null)}
                                style={{
                                    background: isActive
                                        ? 'linear-gradient(145deg, rgba(59, 130, 246, 0.15) 0%, rgba(30, 58, 138, 0.2) 100%)'
                                        : 'rgba(255, 255, 255, 0.03)',
                                    border: isActive
                                        ? '1px solid rgba(59, 130, 246, 0.5)'
                                        : (isHovered ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.08)'),
                                    borderRadius: '12px',
                                    padding: '20px',
                                    cursor: 'default',
                                    transition: 'all 0.2s ease',
                                    transform: isHovered ? 'translateY(-2px)' : 'none',
                                    boxShadow: isHovered ? '0 10px 25px -5px rgba(0, 0, 0, 0.3)' : 'none',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                {/* Header / Icon */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginBottom: '16px'
                                }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '10px',
                                        background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        border: '1px solid rgba(255, 255, 255, 0.05)'
                                    }}>
                                        {getCategoryIcon(preset.category)}
                                    </div>
                                    <div>
                                        <h3 style={{
                                            margin: '0 0 2px 0',
                                            color: 'white',
                                            fontSize: '1.05rem',
                                            fontWeight: 600
                                        }}>
                                            {isJapanese ? preset.nameJa : preset.name}
                                        </h3>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            color: isActive ? '#60a5fa' : '#64748b',
                                            fontWeight: 500
                                        }}>
                                            {preset.category.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {/* Description */}
                                <p style={{
                                    margin: '0 0 20px 0',
                                    color: '#94a3b8',
                                    fontSize: '0.875rem',
                                    lineHeight: 1.6,
                                    flex: 1
                                }}>
                                    {isJapanese ? preset.descriptionJa : preset.description}
                                </p>

                                {/* Mode Selector */}
                                {preset.modes && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '0.75rem',
                                            color: '#64748b',
                                            marginBottom: '8px',
                                            fontWeight: 600
                                        }}>
                                            {isJapanese ? 'モード選択' : 'SELECT MODE'}
                                        </label>
                                        <div style={{
                                            display: 'flex',
                                            background: 'rgba(0, 0, 0, 0.3)',
                                            borderRadius: '8px',
                                            padding: '2px',
                                            gap: '2px'
                                        }}>
                                            {preset.modes.map(mode => {
                                                const isModeSelected = selectedMode === mode.id;
                                                return (
                                                    <button
                                                        key={mode.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleModeChange(preset.id, mode.id);
                                                        }}
                                                        style={{
                                                            flex: 1,
                                                            padding: '6px 4px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 500,
                                                            background: isModeSelected
                                                                ? 'rgba(55, 65, 81, 0.8)'
                                                                : 'transparent',
                                                            color: isModeSelected ? 'white' : '#94a3b8',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            borderBottom: isModeSelected ? '2px solid #3b82f6' : '2px solid transparent'
                                                        }}
                                                    >
                                                        {isJapanese ? mode.nameJa : mode.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Action Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleLoadSystem(preset.id);
                                    }}
                                    disabled={isFullyActive}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        background: isFullyActive
                                            ? 'rgba(16, 185, 129, 0.1)'
                                            : (isModeChanged ? '#3b82f6' : 'white'),
                                        color: isFullyActive ? '#10b981' : (isModeChanged ? 'white' : 'black'),
                                        border: isFullyActive ? '1px solid rgba(16, 185, 129, 0.3)' : 'none',
                                        borderRadius: '8px',
                                        cursor: isFullyActive ? 'default' : 'pointer',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                    onMouseEnter={e => {
                                        if (!isFullyActive) {
                                            e.currentTarget.style.background = isModeChanged ? '#2563eb' : '#e2e8f0';
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (!isFullyActive) {
                                            e.currentTarget.style.background = isModeChanged ? '#3b82f6' : 'white';
                                        }
                                    }}
                                >
                                    {isFullyActive ? (
                                        <>
                                            <CheckCircle2 size={16} />
                                            {isJapanese ? '読み込み済み' : 'Active'}
                                        </>
                                    ) : isModeChanged ? (
                                        <>
                                            <Activity size={16} />
                                            {isJapanese ? 'モード切替' : 'Switch Mode'}
                                        </>
                                    ) : (
                                        <>
                                            <Activity size={16} />
                                            {isJapanese ? 'シミュレーション開始' : 'Launch Simulation'}
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

// CSS animations injected into document head (reuse from HelpModal if exists)
if (typeof document !== 'undefined') {
    const styleId = 'gallery-modal-animations';
    if (!document.getElementById(styleId) && !document.getElementById('help-modal-animations')) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(calc(100% + 20px));
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideUpIn {
                from {
                    transform: translateY(calc(100% + 16px));
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
}
