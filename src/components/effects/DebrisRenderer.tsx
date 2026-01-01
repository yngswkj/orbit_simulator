/**
 * DebrisRenderer.tsx
 * Efficient rendering of debris particles using instanced mesh
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useEffectsStore } from '../../store/effectsStore';
import * as THREE from 'three';

const MAX_DEBRIS = 2000; // Maximum debris particles to render

export const DebrisRenderer: React.FC = () => {
    const debrisClouds = useEffectsStore(state => state.debrisClouds);
    const updateDebris = useEffectsStore(state => state.updateDebris);
    const removeExpiredDebris = useEffectsStore(state => state.removeExpiredDebris);

    const meshRef = useRef<THREE.InstancedMesh>(null);
    const lastCleanup = useRef(0);

    // Dummy object for matrix calculations
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Create geometry and material
    const geometry = useMemo(() => {
        // Irregular rock-like shape
        const geo = new THREE.IcosahedronGeometry(1, 0);

        // Deform vertices for more irregular shape
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);
            const noise = 0.7 + Math.random() * 0.6;
            pos.setXYZ(i, x * noise, y * noise, z * noise);
        }
        geo.computeVertexNormals();

        return geo;
    }, []);

    const material = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            roughness: 0.9,
            metalness: 0.1,
            flatShading: true
        });
    }, []);

    // Get all particles flattened
    const allParticles = useMemo(() => {
        return debrisClouds.flatMap(c => c.particles).slice(0, MAX_DEBRIS);
    }, [debrisClouds]);

    // Update instance matrices and colors
    useFrame((_, delta) => {
        if (!meshRef.current) return;

        const now = performance.now();

        // Update physics
        updateDebris(delta);

        // Periodic cleanup
        if (now - lastCleanup.current > 2000) {
            removeExpiredDebris();
            lastCleanup.current = now;
        }

        // Update instances
        const count = Math.min(allParticles.length, MAX_DEBRIS);

        for (let i = 0; i < count; i++) {
            const p = allParticles[i];
            const age = (now - p.createdAt) / p.lifetime;

            // Position
            dummy.position.set(p.position.x, p.position.y, p.position.z);

            // Rotation (tumbling)
            dummy.rotation.x += p.rotationSpeed.x * delta;
            dummy.rotation.y += p.rotationSpeed.y * delta;
            dummy.rotation.z += p.rotationSpeed.z * delta;

            // Scale (shrink as it ages)
            const scale = p.size * (1 - age * 0.5);
            dummy.scale.setScalar(Math.max(scale, 0.01));

            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);

            // Color with fade
            const color = new THREE.Color(p.color);
            const fade = 1 - age * 0.3;
            color.multiplyScalar(fade);
            meshRef.current.setColorAt(i, color);
        }

        // Hide unused instances
        for (let i = count; i < MAX_DEBRIS; i++) {
            dummy.scale.setScalar(0);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) {
            meshRef.current.instanceColor.needsUpdate = true;
        }
        meshRef.current.count = count;
    });

    // Initialize instance color attribute
    useEffect(() => {
        if (meshRef.current && !meshRef.current.instanceColor) {
            const colors = new Float32Array(MAX_DEBRIS * 3);
            meshRef.current.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
        }
    }, []);

    if (allParticles.length === 0) return null;

    return (
        <instancedMesh
            ref={meshRef}
            args={[geometry, material, MAX_DEBRIS]}
            frustumCulled={false}
        />
    );
};
