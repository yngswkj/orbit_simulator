import React, { useMemo, useState } from 'react';
import { usePhysicsStore } from '../../../store/physicsStore';
import { Search, Trash2, Sun, Globe, Zap, Circle, Copy } from 'lucide-react';
import type { CelestialBody } from '../../../types/physics';
import { useTranslation } from '../../../utils/i18n';
import { ConfirmModal } from '../common/ConfirmModal';
import '../common/ConfirmModal.css';
import { useToast } from '../common/ToastContext';
import { ContextHelp } from '../common/ContextHelp';

// Helper to determine body type string
const getBodyType = (body: CelestialBody) => {
    if (body.type) return body.type;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((body as any).isStar) return 'star';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((body as any).isCompactObject) return 'black_hole';
    return 'planet';
};

export const BodiesTab: React.FC = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const bodies = usePhysicsStore((state) => state.bodies);
    const selectedBodyId = usePhysicsStore((state) => state.selectedBodyId);
    const selectBody = usePhysicsStore((state) => state.selectBody);
    const removeBody = usePhysicsStore((state) => state.removeBody);
    const duplicateBody = usePhysicsStore((state) => state.duplicateBody);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'star' | 'planet' | 'black_hole'>('all');

    // Multi-selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

    // Modal State
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
    const bodyToDelete = bodies.find(b => b.id === confirmDeleteId);

    const filteredBodies = useMemo(() => {
        return bodies.filter(b => {
            const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
            const type = getBodyType(b);
            const matchesType = filterType === 'all' ||
                (filterType === 'black_hole' ? type === 'black_hole' : type === filterType) ||
                (filterType === 'planet' && type === 'asteroid'); // Group asteroids with planets for now? Or separate?
            // Actually let's just match exact string for simplicity

            return matchesSearch && matchesType;
        });
    }, [bodies, searchTerm, filterType]);

    // Count bodies by type for filter badges
    const bodyCounts = useMemo(() => {
        return {
            all: bodies.length,
            star: bodies.filter(b => getBodyType(b) === 'star').length,
            planet: bodies.filter(b => {
                const type = getBodyType(b);
                return type === 'planet' || type === 'asteroid';
            }).length,
            black_hole: bodies.filter(b => getBodyType(b) === 'black_hole').length
        };
    }, [bodies]);

    const getIcon = (body: CelestialBody) => {
        const type = getBodyType(body);
        if (type === 'star') return <Sun size={16} color="#fbbf24" />;
        if (type === 'black_hole') return <Zap size={16} color="#c084fc" />;
        if (type === 'planet') return <Globe size={16} color="#60a5fa" />;
        return <Circle size={16} color="#9ca3af" />;
    };

    // Handle body click with multi-select support
    const handleBodyClick = (bodyId: string, e: React.MouseEvent) => {
        if (e.shiftKey || e.ctrlKey || e.metaKey) {
            // Multi-select mode
            setIsMultiSelectMode(true);
            setSelectedIds(prev => {
                const next = new Set(prev);
                if (next.has(bodyId)) {
                    next.delete(bodyId);
                } else {
                    next.add(bodyId);
                }
                return next;
            });
        } else {
            // Single select mode
            if (isMultiSelectMode && selectedIds.size > 0) {
                // Clear multi-selection
                setSelectedIds(new Set());
                setIsMultiSelectMode(false);
            }
            selectBody(bodyId);
        }
    };

    // Bulk delete handler
    const handleBulkDelete = () => {
        selectedIds.forEach(id => removeBody(id));
        showToast(`${selectedIds.size} bodies deleted`, 'success');
        setSelectedIds(new Set());
        setIsMultiSelectMode(false);
        setConfirmBulkDelete(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Multi-select toolbar */}
            {isMultiSelectMode && selectedIds.size > 0 && (
                <div style={{
                    padding: '12px 20px',
                    background: 'rgba(96, 165, 250, 0.15)',
                    borderBottom: '1px solid rgba(96, 165, 250, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ fontSize: '0.9rem', color: '#60a5fa' }}>
                        {selectedIds.size} {selectedIds.size === 1 ? 'body' : 'bodies'} selected
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => {
                                setSelectedIds(new Set());
                                setIsMultiSelectMode(false);
                            }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => setConfirmBulkDelete(true)}
                            style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                color: '#ef4444',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <Trash2 size={14} />
                            Delete {selectedIds.size}
                        </button>
                    </div>
                </div>
            )}

            {/* Search & Filter Header */}
            <div style={{ padding: '0 20px 10px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', paddingBottom: '4px' }}>
                    <ContextHelp topic="bodies" />
                </div>
                <div className="lab-search" style={{ marginTop: '6px', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '4px 8px' }}>
                    <Search size={14} color="#aaa" />
                    <input
                        type="text"
                        placeholder={t('search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ border: 'none', background: 'transparent', color: 'white', marginLeft: '8px', flex: 1, outline: 'none', fontSize: '13px' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '4px', marginTop: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="custom-scrollbar">
                    {(['all', 'star', 'planet', 'black_hole'] as const).map(f => {
                        const count = bodyCounts[f];
                        return (
                            <button
                                key={f}
                                onClick={() => setFilterType(f)}
                                style={{
                                    border: 'none',
                                    background: filterType === f ? 'rgba(96, 165, 250, 0.2)' : 'transparent',
                                    color: filterType === f ? '#60a5fa' : '#888',
                                    fontSize: '11px',
                                    padding: '8px 12px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    textTransform: 'capitalize',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    minHeight: '36px'
                                }}
                            >
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                <span>{t(`filter_${f}` as any)}</span>
                                <span style={{
                                    fontSize: '10px',
                                    opacity: 0.7,
                                    fontWeight: 600,
                                    background: filterType === f ? 'rgba(96, 165, 250, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                    padding: '1px 5px',
                                    borderRadius: '8px',
                                    minWidth: '18px',
                                    textAlign: 'center'
                                }}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* List */}
            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '10px 20px' }}>
                {filteredBodies.map(body => {
                    const isSelected = selectedBodyId === body.id;
                    const isMultiSelected = selectedIds.has(body.id);
                    const isHighlighted = isSelected || isMultiSelected;

                    return (
                        <div
                            key={body.id}
                            onClick={(e) => handleBodyClick(body.id, e)}
                            className={`lab-list-item ${isHighlighted ? 'selected' : ''}`}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px', padding: '8px',
                                marginBottom: '4px', borderRadius: '6px', cursor: 'pointer',
                                background: isHighlighted ? 'rgba(96, 165, 250, 0.1)' : 'transparent',
                                border: `1px solid ${isHighlighted ? 'rgba(96, 165, 250, 0.3)' : 'transparent'}`,
                                transition: 'all 0.2s',
                                position: 'relative'
                            }}
                        >
                            <div style={{ flexShrink: 0 }}>{getIcon(body)}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: selectedBodyId === body.id ? 600 : 400, color: selectedBodyId === body.id ? 'white' : '#ddd' }} className="truncate">
                                    {body.name}
                                </div>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'capitalize' }}>{t(`filter_${getBodyType(body)}` as any)}</div>
                            </div>

                            <div style={{ display: 'flex', gap: '4px', opacity: isHighlighted ? 1 : 0.5 }}>
                                {isMultiSelected && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '8px',
                                        left: '8px',
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: '#60a5fa'
                                    }} />
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        duplicateBody(body.id);
                                        showToast(`${body.name} duplicated`, 'success');
                                    }}
                                    style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', padding: '4px' }}
                                    title={t('duplicate')}
                                >
                                    <Copy size={14} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirmDeleteId(body.id);
                                    }}
                                    style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', padding: '4px' }}
                                    title={t('remove')}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {filteredBodies.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem 0', fontSize: '0.875rem' }}>
                        {t('no_bodies_found')}
                    </div>
                )}
            </div>

            {/* Single delete modal */}
            <ConfirmModal
                isOpen={!!confirmDeleteId}
                title={t('delete_title')}
                message={t('delete_message').replace('{name}', bodyToDelete?.name || '')}
                onConfirm={() => {
                    if (confirmDeleteId) {
                        removeBody(confirmDeleteId);
                        showToast(`${bodyToDelete?.name} deleted`, 'success');
                    }
                    setConfirmDeleteId(null);
                }}
                onCancel={() => setConfirmDeleteId(null)}
                danger={true}
                confirmText={t('delete_confirm')}
                cancelText={t('delete_cancel')}
            />

            {/* Bulk delete modal */}
            <ConfirmModal
                isOpen={confirmBulkDelete}
                title="Delete Multiple Bodies"
                message={`Are you sure you want to delete ${selectedIds.size} ${selectedIds.size === 1 ? 'body' : 'bodies'}? This action cannot be undone.`}
                onConfirm={handleBulkDelete}
                onCancel={() => setConfirmBulkDelete(false)}
                danger={true}
                confirmText="Delete All"
                cancelText="Cancel"
            />
        </div>
    );
};
