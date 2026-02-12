// =============================================
// CANDLE TRACE - 3D PARTICLE FIELD
// Floating particles for depth and atmosphere
// =============================================

'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
    scrollProgress: number;
}

export function ParticleField({ scrollProgress }: ParticleFieldProps) {
    const pointsRef = useRef<THREE.Points>(null);
    const geometryRef = useRef<THREE.BufferGeometry>(null);

    // Generate particle positions
    const { positions, colors } = useMemo(() => {
        const count = 2000;
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Spread particles in a sphere-like distribution
            const radius = 20 + Math.random() * 30;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = radius * Math.cos(phi) - 20;

            // Color variation (purple to blue)
            const colorMix = Math.random();
            col[i * 3] = 0.55 + colorMix * 0.23; // R: 139-200
            col[i * 3 + 1] = 0.36 + colorMix * 0.15; // G: 92-130
            col[i * 3 + 2] = 0.96; // B: 246
        }

        return { positions: pos, colors: col };
    }, []);

    // Set buffer attributes on mount
    useEffect(() => {
        if (geometryRef.current) {
            geometryRef.current.setAttribute(
                'position',
                new THREE.BufferAttribute(positions, 3)
            );
            geometryRef.current.setAttribute(
                'color',
                new THREE.BufferAttribute(colors, 3)
            );
        }
    }, [positions, colors]);

    useFrame(({ clock }) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = clock.getElapsedTime() * 0.02;
            pointsRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.01) * 0.1;

            // Expand with scroll
            const scale = 1 + scrollProgress * 0.5;
            pointsRef.current.scale.setScalar(scale);
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry ref={geometryRef} />
            <pointsMaterial
                size={0.1}
                vertexColors
                transparent
                opacity={0.6}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}
