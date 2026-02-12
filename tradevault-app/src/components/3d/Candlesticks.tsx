// =============================================
// CANDLE TRACE - 3D CANDLESTICK VISUALIZER
// Floating candlesticks that animate with scroll
// =============================================

'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface CandlestickProps {
    position: [number, number, number];
    bullish: boolean;
    height: number;
    wickHeight: number;
    delay: number;
}

function Candlestick({ position, bullish, height, wickHeight, delay }: CandlestickProps) {
    const groupRef = useRef<THREE.Group>(null);
    const color = bullish ? '#22c55e' : '#ef4444';

    useFrame(({ clock }) => {
        if (groupRef.current) {
            // Gentle floating animation
            groupRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() + delay) * 0.3;
            groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5 + delay) * 0.1;
        }
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Candle body */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.4, height, 0.4]} />
                <meshStandardMaterial
                    color={color}
                    metalness={0.5}
                    roughness={0.3}
                    emissive={color}
                    emissiveIntensity={0.3}
                />
            </mesh>

            {/* Upper wick */}
            <mesh position={[0, height / 2 + wickHeight / 2, 0]}>
                <boxGeometry args={[0.08, wickHeight, 0.08]} />
                <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
            </mesh>

            {/* Lower wick */}
            <mesh position={[0, -height / 2 - wickHeight / 2, 0]}>
                <boxGeometry args={[0.08, wickHeight, 0.08]} />
                <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
            </mesh>
        </group>
    );
}

interface CandlesticksProps {
    scrollProgress: number;
}

export function Candlesticks({ scrollProgress }: CandlesticksProps) {
    const groupRef = useRef<THREE.Group>(null);

    // Generate random candlestick data
    const candlesticks = useMemo(() => {
        const sticks: CandlestickProps[] = [];
        const rows = 5;
        const cols = 8;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = (col - cols / 2) * 1.2 + Math.random() * 0.3;
                const y = (row - rows / 2) * 2 + Math.random() * 0.5;
                const z = -5 - Math.random() * 10;

                sticks.push({
                    position: [x, y, z] as [number, number, number],
                    bullish: Math.random() > 0.4,
                    height: 0.5 + Math.random() * 1.5,
                    wickHeight: 0.2 + Math.random() * 0.5,
                    delay: Math.random() * Math.PI * 2,
                });
            }
        }
        return sticks;
    }, []);

    useFrame(() => {
        if (groupRef.current) {
            // Rotate and spread based on scroll
            groupRef.current.rotation.y = scrollProgress * 0.5;
            groupRef.current.position.z = -scrollProgress * 5;
            groupRef.current.scale.setScalar(1 + scrollProgress * 0.3);
        }
    });

    return (
        <group ref={groupRef} position={[0, -2, -10]}>
            {candlesticks.map((stick, i) => (
                <Float key={i} speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
                    <Candlestick {...stick} />
                </Float>
            ))}
        </group>
    );
}
