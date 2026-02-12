// =============================================
// CANDLE TRACE - 3D DATA NUMBERS
// Floating trading metrics visualization
// =============================================

'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import * as THREE from 'three';

interface DataNumbersProps {
    scrollProgress: number;
}

interface FloatingTextProps {
    text: string;
    position: [number, number, number];
    color: string;
    size?: number;
    delay?: number;
}

function FloatingText({ text, position, color, size = 0.5, delay = 0 }: FloatingTextProps) {
    const textRef = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        if (textRef.current) {
            textRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() + delay) * 0.2;
            // Fade based on distance from center
            const material = textRef.current.material as THREE.MeshStandardMaterial;
            if (material) {
                const dist = Math.sqrt(position[0] ** 2 + position[2] ** 2);
                material.opacity = Math.max(0.3, 1 - dist / 20);
            }
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.2}>
            <Text
                ref={textRef}
                position={position}
                fontSize={size}
                color={color}
                anchorX="center"
                anchorY="middle"
                font="/fonts/inter.woff"
                material-transparent
                material-opacity={0.8}
            >
                {text}
            </Text>
        </Float>
    );
}

export function DataNumbers({ scrollProgress }: DataNumbersProps) {
    const groupRef = useRef<THREE.Group>(null);

    const dataPoints = [
        { text: '+$12,450', position: [-6, 3, -8] as [number, number, number], color: '#22c55e', size: 0.6, delay: 0 },
        { text: '+$8,230', position: [5, 4, -10] as [number, number, number], color: '#22c55e', size: 0.5, delay: 1 },
        { text: '67.2%', position: [-4, -2, -6] as [number, number, number], color: '#FFFFFF', size: 0.5, delay: 2 },
        { text: 'WIN RATE', position: [-4, -2.6, -6] as [number, number, number], color: '#a1a1aa', size: 0.2, delay: 2 },
        { text: '2.4x', position: [6, 0, -7] as [number, number, number], color: '#FFFFFF', size: 0.6, delay: 3 },
        { text: 'PROFIT FACTOR', position: [6, -0.5, -7] as [number, number, number], color: '#a1a1aa', size: 0.15, delay: 3 },
        { text: '$247K', position: [-3, 5, -12] as [number, number, number], color: '#22c55e', size: 0.8, delay: 4 },
        { text: '-$1,200', position: [4, -3, -9] as [number, number, number], color: '#ef4444', size: 0.4, delay: 5 },
        { text: '156', position: [7, 2, -11] as [number, number, number], color: '#FFFFFF', size: 0.5, delay: 6 },
        { text: 'TRADES', position: [7, 1.5, -11] as [number, number, number], color: '#a1a1aa', size: 0.15, delay: 6 },
    ];

    useFrame(() => {
        if (groupRef.current) {
            // Spread out numbers as user scrolls
            groupRef.current.scale.setScalar(1 + scrollProgress * 0.5);
            groupRef.current.rotation.y = scrollProgress * 0.3;
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            {dataPoints.map((point, index) => (
                <FloatingText key={index} {...point} />
            ))}
        </group>
    );
}
