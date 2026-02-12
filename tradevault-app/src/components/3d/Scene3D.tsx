// =============================================
// CANDLE TRACE - 3D SCENE COMPONENT
// Main canvas with space environment
// =============================================

'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, Text3D, Center, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Candlesticks } from './Candlesticks';
import { ParticleField } from './ParticleField';
import { DataNumbers } from './DataNumbers';

interface SceneProps {
    scrollProgress: number;
}

function CameraRig({ scrollProgress }: { scrollProgress: number }) {
    const cameraRef = useRef<THREE.PerspectiveCamera>(null);

    useFrame(() => {
        if (cameraRef.current) {
            // Move camera along Z and Y based on scroll
            cameraRef.current.position.z = 20 - scrollProgress * 15;
            cameraRef.current.position.y = scrollProgress * 5;
            cameraRef.current.rotation.x = -scrollProgress * 0.2;
        }
    });

    return <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 20]} fov={60} />;
}

function FloatingLogo() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.1;
            groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.2;
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                <mesh>
                    <torusGeometry args={[2, 0.5, 16, 100]} />
                    <meshStandardMaterial
                        color="#FFFFFF"
                        metalness={0.8}
                        roughness={0.2}
                        emissive="#FFFFFF"
                        emissiveIntensity={0.3}
                    />
                </mesh>
            </Float>
        </group>
    );
}

function SpaceEnvironment() {
    return (
        <>
            {/* Stars background */}
            <Stars
                radius={100}
                depth={50}
                count={5000}
                factor={4}
                saturation={0}
                fade
                speed={1}
            />

            {/* Nebula effect - colored fog */}
            <fog attach="fog" args={['#0a0a0a', 15, 40]} />

            {/* Ambient light */}
            <ambientLight intensity={0.2} />

            {/* Main spotlight with purple hue */}
            <spotLight
                position={[10, 20, 10]}
                angle={0.5}
                penumbra={1}
                intensity={1}
                color="#FFFFFF"
                castShadow
            />

            {/* Secondary light from below */}
            <pointLight position={[0, -10, 0]} intensity={0.5} color="#3b82f6" />

            {/* Rim light */}
            <pointLight position={[-10, 5, -5]} intensity={0.3} color="#ec4899" />
        </>
    );
}

export function Scene3D({ scrollProgress }: SceneProps) {
    return (
        <Canvas
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
            }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]}
        >
            <Suspense fallback={null}>
                <CameraRig scrollProgress={scrollProgress} />
                <SpaceEnvironment />

                {/* Floating candlestick cluster */}
                <Candlesticks scrollProgress={scrollProgress} />

                {/* Particle field for depth */}
                <ParticleField scrollProgress={scrollProgress} />

                {/* Floating data visualization */}
                <DataNumbers scrollProgress={scrollProgress} />

                {/* Central logo element */}
                <FloatingLogo />
            </Suspense>
        </Canvas>
    );
}
