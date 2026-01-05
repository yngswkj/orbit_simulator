import React, { useState } from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { useTranslation } from '../../utils/i18n';
import { Trash2, Settings, ChevronDown, ChevronUp, X, Zap } from 'lucide-react';
import { VectorInput } from './common/VectorInput';
import { SafeInput } from './common/SafeInput';
import type { CelestialBody } from '../../types/physics';

import { useToast } from './common/ToastContext';

import { ConfirmModal } from './common/ConfirmModal';
import { ContextHelp } from './common/ContextHelp';

interface BodyInspectorContentProps {
    body: CelestialBody;
}

export const BodyInspectorContent: React.FC<BodyInspectorContentProps> = ({ body: selectedBody }) => {
    const updateBody = usePhysicsStore(state => state.updateBody);
    const selectBody = usePhysicsStore(state => state.selectBody);
    const removeBody = usePhysicsStore(state => state.removeBody);
    const setFollowingBody = usePhysicsStore(state => state.setFollowingBody);
    const followingBodyId = usePhysicsStore(state => state.followingBodyId);
    const pushHistoryAction = usePhysicsStore(state => state.pushHistoryAction);
    const triggerSupernova = usePhysicsStore(state => state.triggerSupernova);



    const bodies = usePhysicsStore(state => state.bodies);
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSupernovaModal, setShowSupernovaModal] = useState(false);

    const sun = bodies.find(b => b.name === 'Sun');
    const distanceToSun = sun && selectedBody.id !== sun.id
        ? selectedBody.position.distanceTo(sun.position).toFixed(1)
        : '0.0';

    const velocity = selectedBody.velocity.length().toFixed(3);

    return (
        <div className="inspector-content" style={{ padding: '0 20px 20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                    <Settings size={16} color="#60a5fa" />
                    {selectedBody.name}
                </h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <ContextHelp topic="inspector" />
                    <button
                        onClick={() => selectBody(null)}
                        style={{
                            background: 'transparent', border: 'none',
                            color: 'rgba(255, 255, 255, 0.5)', cursor: 'pointer',
                            padding: '4px'
                        }}
                        title="Close inspector"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '10px', fontSize: '14px' }}>
                {/* Properties Display (Read Only info always visible) */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>{t('distance_sun')}:</span>
                    <span>{distanceToSun} AU</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>{t('orbital_speed')}:</span>
                    <span>{velocity} km/s</span>
                </div>

                <hr style={{ borderColor: 'rgba(255,255,255,0.1)', width: '100%', margin: '10px 0' }} />

                {/* Name */}
                <div style={{ marginBottom: '5px' }}>
                    <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>Name</label>
                    <input
                        type="text"
                        value={selectedBody.name}
                        onChange={(e) => updateBody(selectedBody.id, { name: e.target.value })}
                        onFocus={(e) => {
                            e.target.dataset.startValue = e.target.value;
                        }}
                        onBlur={(e) => {
                            const startValue = e.target.dataset.startValue;
                            if (startValue !== undefined && startValue !== e.target.value) {
                                pushHistoryAction({
                                    type: 'UPDATE',
                                    id: selectedBody.id,
                                    previous: { name: startValue },
                                    current: { name: e.target.value }
                                });
                            }
                        }}
                        className="lab-input"
                        style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', padding: '6px', borderRadius: '4px', color: 'white' }}
                    />
                </div>

                {/* Mass */}
                <div style={{ marginBottom: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>
                            {t('mass')} <span style={{ fontSize: '0.8em', color: '#666' }}>(M☉)</span>
                        </label>
                        <span style={{ fontSize: '10px', color: '#666' }}>10^{Math.log10(selectedBody.mass).toFixed(1)}</span>
                    </div>
                    <input
                        type="range"
                        min="-2" max="6" step="0.1"
                        value={Math.log10(selectedBody.mass > 0 ? selectedBody.mass : 1)}
                        onChange={(e) => updateBody(selectedBody.id, { mass: Math.pow(10, parseFloat(e.target.value)) })}
                        onPointerDown={(e) => {
                            // Store implicit start value from store (since range is log10)
                            // Actually, simpler to just store the actual mass on start
                            // We use a ref or dataset.
                            (e.target as HTMLInputElement).dataset.startMass = selectedBody.mass.toString();
                        }}
                        onPointerUp={(e) => {
                            const startMass = parseFloat((e.target as HTMLInputElement).dataset.startMass || '0');
                            if (!isNaN(startMass) && startMass !== selectedBody.mass) {
                                pushHistoryAction({
                                    type: 'UPDATE',
                                    id: selectedBody.id,
                                    previous: { mass: startMass },
                                    current: { mass: selectedBody.mass }
                                });
                            }
                        }}
                        className="lab-range"
                        style={{ marginBottom: '5px', width: '100%' }}
                    />

                    <SafeInput
                        value={selectedBody.mass}
                        onChange={(val) => updateBody(selectedBody.id, { mass: val })}
                        onCommit={(startVal, endVal) => {
                            if (startVal !== endVal) {
                                pushHistoryAction({
                                    type: 'UPDATE',
                                    id: selectedBody.id,
                                    previous: { mass: startVal },
                                    current: { mass: endVal }
                                });
                            }
                        }}
                        min={0.0001}
                        step={0.1}
                        style={{
                            width: '100%', boxSizing: 'border-box',
                            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)',
                            padding: '6px', borderRadius: '4px', color: 'white'
                        }}
                    />
                </div>

                {/* Radius */}
                <div style={{ marginBottom: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>
                            Radius <span style={{ fontSize: '0.8em', color: '#666' }}>(R⊕)</span>
                        </label>
                        <span style={{ fontSize: '10px', color: '#666' }}>{selectedBody.radius.toFixed(1)}</span>
                    </div>
                    <input
                        type="range"
                        min="0.1" max="100" step="0.1"
                        value={selectedBody.radius}
                        onChange={(e) => updateBody(selectedBody.id, { radius: parseFloat(e.target.value) })}
                        onPointerDown={(e: React.PointerEvent<HTMLInputElement>) => {
                            (e.target as HTMLInputElement).dataset.startRadius = selectedBody.radius.toString();
                        }}
                        onPointerUp={(e) => {
                            const startRadius = parseFloat((e.target as HTMLInputElement).dataset.startRadius || '0');
                            if (!isNaN(startRadius) && startRadius !== selectedBody.radius) {
                                pushHistoryAction({
                                    type: 'UPDATE',
                                    id: selectedBody.id,
                                    previous: { radius: startRadius },
                                    current: { radius: selectedBody.radius }
                                });
                            }
                        }}
                        className="lab-range"
                        style={{ width: '100%' }}
                    />
                </div>

                {/* Rotation Speed - Now always visible */}
                <div style={{ marginBottom: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>{t('rotation_speed')}</label>
                    </div>
                    <input
                        type="range"
                        min="0" max="10" step="0.1"
                        value={selectedBody.rotationSpeed || 1.0}
                        onChange={(e) => updateBody(selectedBody.id, { rotationSpeed: parseFloat(e.target.value) })}
                        onPointerDown={(e: React.PointerEvent<HTMLInputElement>) => {
                            (e.target as HTMLInputElement).dataset.startSpeed = (selectedBody.rotationSpeed || 1.0).toString();
                        }}
                        onPointerUp={(e) => {
                            const startSpeed = parseFloat((e.target as HTMLInputElement).dataset.startSpeed || '0');
                            const currentSpeed = selectedBody.rotationSpeed || 1.0;
                            if (!isNaN(startSpeed) && startSpeed !== currentSpeed) {
                                pushHistoryAction({
                                    type: 'UPDATE',
                                    id: selectedBody.id,
                                    previous: { rotationSpeed: startSpeed },
                                    current: { rotationSpeed: currentSpeed }
                                });
                            }
                        }}
                        className="lab-range"
                        style={{ marginBottom: '5px', width: '100%' }}
                    />
                    <SafeInput
                        value={selectedBody.rotationSpeed || 1.0}
                        onChange={(val) => updateBody(selectedBody.id, { rotationSpeed: val })}
                        onCommit={(startVal, endVal) => {
                            if (startVal !== endVal) {
                                pushHistoryAction({
                                    type: 'UPDATE',
                                    id: selectedBody.id,
                                    previous: { rotationSpeed: startVal },
                                    current: { rotationSpeed: endVal }
                                });
                            }
                        }}
                        min={0}
                        step={0.1}
                        style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', padding: '6px', borderRadius: '4px', color: 'white' }}
                    />
                </div>

                {/* Color */}
                <div style={{ marginBottom: '5px' }}>
                    <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>{t('color')}</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="color"
                            value={selectedBody.color}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateBody(selectedBody.id, { color: e.target.value })}
                            onFocus={(e: React.FocusEvent<HTMLInputElement>) => { (e.target as HTMLInputElement).dataset.startColor = selectedBody.color; }}
                            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                                const startColor = (e.target as HTMLInputElement).dataset.startColor;
                                if (startColor && startColor !== selectedBody.color) {
                                    pushHistoryAction({
                                        type: 'UPDATE',
                                        id: selectedBody.id,
                                        previous: { color: startColor },
                                        current: { color: selectedBody.color }
                                    });
                                }
                            }}
                            style={{
                                width: '40px', height: '36px', border: 'none', borderRadius: '4px',
                                padding: 0, cursor: 'pointer', background: 'transparent'
                            }}
                        />
                        <input
                            type="text"
                            value={selectedBody.color}
                            onChange={(e) => updateBody(selectedBody.id, { color: e.target.value })}
                            onFocus={(e) => { (e.target as HTMLInputElement).dataset.startColor = selectedBody.color; }}
                            onBlur={(e) => {
                                const startColor = (e.target as HTMLInputElement).dataset.startColor;
                                if (startColor && startColor !== selectedBody.color) {
                                    pushHistoryAction({
                                        type: 'UPDATE',
                                        id: selectedBody.id,
                                        previous: { color: startColor },
                                        current: { color: selectedBody.color }
                                    });
                                }
                            }}
                            style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', padding: '6px', borderRadius: '4px', color: 'white' }}
                        />
                    </div>
                </div>

                {/* Physics & Vectors */}
                <hr style={{ borderColor: 'rgba(255,255,255,0.1)', width: '100%', margin: '10px 0' }} />
                <button
                    onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                    style={{
                        background: 'transparent', border: 'none', color: '#60a5fa',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', padding: '5px 0', cursor: 'pointer', fontSize: '12px', fontWeight: 600, letterSpacing: '1px'
                    }}
                >
                    VECTORS & PHYSICS
                    {isAdvancedOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(selectedBody as any).isStar && (
                    <div style={{ marginTop: '10px' }}>
                        <VectorInput
                            label="Position"
                            value={selectedBody.position}
                            onChange={(v) => updateBody(selectedBody.id, { position: v })}
                            onCommit={(startV, endV) => {
                                // Need deep comparison or assume change if committed
                                if (!startV.equals(endV)) {
                                    pushHistoryAction({
                                        type: 'UPDATE',
                                        id: selectedBody.id,
                                        previous: { position: startV },
                                        current: { position: endV }
                                    });
                                }
                            }}
                        />
                        <div style={{ height: '10px' }} />
                        <VectorInput
                            label="Velocity"
                            value={selectedBody.velocity}
                            onChange={(v) => updateBody(selectedBody.id, { velocity: v })}
                            onCommit={(startV, endV) => {
                                if (!startV.equals(endV)) {
                                    pushHistoryAction({
                                        type: 'UPDATE',
                                        id: selectedBody.id,
                                        previous: { velocity: startV },
                                        current: { velocity: endV }
                                    });
                                }
                            }}
                        />
                    </div>
                )}

                {/* Actions */}
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setFollowingBody(followingBodyId === selectedBody.id ? null : selectedBody.id)}
                        style={{
                            flex: 1, padding: '8px',
                            background: followingBodyId === selectedBody.id ? 'rgba(34, 170, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                            border: `1px solid ${followingBodyId === selectedBody.id ? '#22aaff' : 'rgba(255, 255, 255, 0.2)'} `,
                            borderRadius: '6px', color: 'white', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 500, fontSize: '0.9rem'
                        }}
                    >
                        {followingBodyId === selectedBody.id ? t('stop_following') : t('camera_follow')}
                    </button>
                    {!selectedBody.isFixed && (
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            style={{
                                padding: '8px', background: 'rgba(255, 64, 80, 0.2)',
                                border: '1px solid rgba(255, 64, 80, 0.4)', borderRadius: '6px',
                                color: '#ff4050', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            title={t('remove')}
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>

                {/* Supernova Button (for stars only) */}
                {selectedBody.isStar && selectedBody.mass > 100000 && (
                    <div style={{ marginTop: '8px' }}>
                        <button
                            onClick={() => setShowSupernovaModal(true)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(147, 51, 234, 0.2))',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                borderRadius: '6px',
                                color: '#ef4444',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(147, 51, 234, 0.3))';
                                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.6)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(147, 51, 234, 0.2))';
                                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                            }}
                        >
                            <Zap size={18} />
                            Trigger Supernova
                        </button>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={showDeleteModal}
                title={t('delete_title')}
                message={t('delete_message').replace('{name}', selectedBody.name)}
                onConfirm={() => {
                    removeBody(selectedBody.id);
                    showToast(`${selectedBody.name} deleted`, 'success');
                    selectBody(null);
                    setShowDeleteModal(false);
                }}
                onCancel={() => setShowDeleteModal(false)}
                danger={true}
                confirmText={t('delete_confirm')}
                cancelText={t('delete_cancel')}
            />

            <ConfirmModal
                isOpen={showSupernovaModal}
                title="⭐ Trigger Supernova"
                message={`Are you sure you want to trigger a supernova explosion for ${selectedBody.name}? This will create a spectacular stellar explosion and transform the star into a ${selectedBody.mass > 200000 ? 'black hole' : 'neutron star'}.`}
                onConfirm={() => {
                    triggerSupernova(selectedBody.id);
                    showToast(`🌟 Supernova initiated for ${selectedBody.name}!`, 'success');
                    setShowSupernovaModal(false);
                }}
                onCancel={() => setShowSupernovaModal(false)}
                danger={true}
                confirmText="Trigger Supernova"
                cancelText="Cancel"
            />
        </div>
    );
};

