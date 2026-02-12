// =============================================
// CANDLE TRACE - SPACE SCENE (Landing Page)
// Cinematic journey through trading universe
// Minimal, elegant, professional
// =============================================

'use client';

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

interface SpaceSceneProps {
    scrollProgress: number;
}

// =============================================
// SECTION DEFINITIONS
// =============================================
const SECTIONS = {
    hero: { start: 0, end: 0.15 },
    journaling: { start: 0.15, end: 0.35 },
    analytics: { start: 0.35, end: 0.55 },
    psychology: { start: 0.55, end: 0.75 },
    integrations: { start: 0.75, end: 0.88 },
    cta: { start: 0.88, end: 1 },
};

// =============================================
// CINEMATIC CAMERA - Forward journey through space
// =============================================
function CinematicCamera({ scrollProgress }: { scrollProgress: number }) {
    const { camera } = useThree();
    const currentPos = useRef(new THREE.Vector3(0, 0, 50));
    const targetPos = useRef(new THREE.Vector3());
    const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

    useFrame(() => {
        const p = scrollProgress;

        // Smooth forward journey through space
        // Camera moves forward on Z-axis as user scrolls
        const baseZ = 50 - p * 350; // Start at z=50, end at z=-300

        // Gentle lateral movement for cinematic feel
        const lateralX = Math.sin(p * Math.PI * 2) * 8;
        const lateralY = Math.cos(p * Math.PI * 1.5) * 4 + 2;

        targetPos.current.set(lateralX, lateralY, baseZ);

        // Smooth interpolation
        currentPos.current.lerp(targetPos.current, 0.02);
        camera.position.copy(currentPos.current);

        // Always look forward into space
        const lookAtZ = baseZ - 100;
        currentLookAt.current.lerp(new THREE.Vector3(0, 0, lookAtZ), 0.02);
        camera.lookAt(currentLookAt.current);
    });

    return null;
}

// =============================================
// AMBIENT STARS - Calm, minimal star field
// =============================================
function AmbientStars({ scrollProgress }: { scrollProgress: number }) {
    const starsRef = useRef<THREE.Points>(null);

    const { positions, opacities } = useMemo(() => {
        const count = 5000; // Reduced for minimal aesthetic
        const pos = new Float32Array(count * 3);
        const ops = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Distribute stars in a large sphere around the path
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 80 + Math.random() * 300;

            pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = -200 + Math.random() * 400; // Spread along journey path

            ops[i] = 0.3 + Math.random() * 0.7;
        }

        return { positions: pos, opacities: ops };
    }, []);

    useFrame(({ clock }) => {
        if (!starsRef.current) return;

        // Gentle twinkling effect
        const time = clock.getElapsedTime();
        starsRef.current.rotation.y = time * 0.005;
        starsRef.current.rotation.x = Math.sin(time * 0.01) * 0.02;
    });

    return (
        <points ref={starsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={1.2}
                color="#ffffff"
                transparent
                opacity={0.8}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

// =============================================
// NEBULA CLOUDS - Soft volumetric atmosphere
// =============================================
function NebulaClouds({ scrollProgress }: { scrollProgress: number }) {
    const cloudsRef = useRef<THREE.Points>(null);

    const positions = useMemo(() => {
        const count = 1500;
        const pos = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Create cloud clusters at different depths
            const clusterZ = -50 - (i % 5) * 60;
            const angle = Math.random() * Math.PI * 2;
            const radius = 30 + Math.random() * 50;

            pos[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 30;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
            pos[i * 3 + 2] = clusterZ + (Math.random() - 0.5) * 30;
        }

        return pos;
    }, []);

    useFrame(({ clock }) => {
        if (!cloudsRef.current) return;
        cloudsRef.current.rotation.z = clock.getElapsedTime() * 0.01;
    });

    return (
        <points ref={cloudsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={4}
                color="#1a1a2e"
                transparent
                opacity={0.15 + scrollProgress * 0.1}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

// =============================================
// HOLOGRAPHIC GRID LINES - Section markers
// =============================================
function HolographicGridLines({ scrollProgress }: { scrollProgress: number }) {
    const gridRef = useRef<THREE.Group>(null);

    // Create grid lines at section boundaries
    const lines = useMemo(() => {
        const lineData = [];
        const sectionStarts = [
            { z: -30, color: '#ffffff' },   // Journaling
            { z: -100, color: '#ffffff' },  // Analytics
            { z: -170, color: '#ffffff' },  // Psychology
            { z: -230, color: '#ffffff' },  // Integrations
            { z: -280, color: '#ffffff' },  // CTA
        ];

        for (const section of sectionStarts) {
            // Horizontal line
            const points = [
                new THREE.Vector3(-60, 0, section.z),
                new THREE.Vector3(60, 0, section.z),
            ];
            lineData.push({ points, color: section.color });
        }

        return lineData;
    }, []);

    useFrame(({ clock }) => {
        if (!gridRef.current) return;
        // Subtle pulse effect
        const pulse = 0.3 + Math.sin(clock.getElapsedTime() * 2) * 0.1;
        gridRef.current.children.forEach((child) => {
            if (child instanceof THREE.Line) {
                (child.material as THREE.LineBasicMaterial).opacity = pulse;
            }
        });
    });

    return (
        <group ref={gridRef}>
            {lines.map((line, i) => (
                <line key={i}>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            args={[new Float32Array(line.points.flatMap(p => [p.x, p.y, p.z])), 3]}
                        />
                    </bufferGeometry>
                    <lineBasicMaterial
                        color={line.color}
                        transparent
                        opacity={0.2}
                        blending={THREE.AdditiveBlending}
                    />
                </line>
            ))}
        </group>
    );
}

// =============================================
// FLOATING DATA PARTICLES - Trading elements
// =============================================
function FloatingDataParticles({ scrollProgress }: { scrollProgress: number }) {
    const particlesRef = useRef<THREE.Points>(null);

    const { positions, colors } = useMemo(() => {
        const count = 200;
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Distribute along the journey path
            const z = -20 - i * 1.5;
            const angle = (i / count) * Math.PI * 8 + Math.random() * 0.5;
            const radius = 15 + Math.sin(i * 0.3) * 10;

            pos[i * 3] = Math.cos(angle) * radius;
            pos[i * 3 + 1] = Math.sin(angle) * radius * 0.4;
            pos[i * 3 + 2] = z;

            // Color: mostly white with occasional cyan accent
            if (Math.random() > 0.85) {
                col[i * 3] = 0.2; col[i * 3 + 1] = 0.9; col[i * 3 + 2] = 0.95; // Cyan
            } else {
                col[i * 3] = 1; col[i * 3 + 1] = 1; col[i * 3 + 2] = 1; // White
            }
        }

        return { positions: pos, colors: col };
    }, []);

    useFrame(({ clock }) => {
        if (!particlesRef.current) return;
        const time = clock.getElapsedTime();

        // Gentle oscillation
        particlesRef.current.rotation.z = time * 0.02;

        // Pulse opacity based on scroll
        const material = particlesRef.current.material as THREE.PointsMaterial;
        material.opacity = 0.4 + scrollProgress * 0.3;
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-color" args={[colors, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={2}
                vertexColors
                transparent
                opacity={0.5}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

// =============================================
// COMMAND PLATFORM - Final CTA scene
// =============================================
function CommandPlatform({ scrollProgress }: { scrollProgress: number }) {
    const platformRef = useRef<THREE.Group>(null);
    const visibility = Math.max(0, (scrollProgress - 0.85) / 0.15);

    useFrame(({ clock }) => {
        if (!platformRef.current) return;
        platformRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    });

    if (visibility === 0) return null;

    return (
        <group ref={platformRef} position={[0, -8, -300]}>
            {/* Main platform ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[15, 0.5, 16, 64]} />
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={visibility * 0.5}
                    transparent
                    opacity={visibility * 0.7}
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>

            {/* Inner ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[10, 0.3, 16, 64]} />
                <meshStandardMaterial
                    color="#22d3ee"
                    emissive="#22d3ee"
                    emissiveIntensity={visibility * 0.8}
                    transparent
                    opacity={visibility * 0.5}
                />
            </mesh>

            {/* Center glow */}
            <mesh>
                <sphereGeometry args={[3, 32, 32]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={visibility * 0.2}
                />
            </mesh>
        </group>
    );
}

// =============================================
// SCENE LIGHTING
// =============================================
function SceneLighting({ scrollProgress }: { scrollProgress: number }) {
    return (
        <>
            <ambientLight intensity={0.05} />
            <pointLight
                position={[0, 20, -100]}
                intensity={0.5 + scrollProgress * 0.5}
                color="#ffffff"
                distance={200}
            />
            <pointLight
                position={[-30, -10, -200]}
                intensity={0.3}
                color="#22d3ee"
                distance={150}
            />
            <pointLight
                position={[30, 10, -250]}
                intensity={0.2}
                color="#ffffff"
                distance={150}
            />
        </>
    );
}

// =============================================
// POST-PROCESSING - Subtle, elegant effects
// =============================================
function PostProcessing({ scrollProgress }: { scrollProgress: number }) {
    return (
        <EffectComposer>
            <Bloom
                intensity={0.3 + scrollProgress * 0.4}
                luminanceThreshold={0.3}
                luminanceSmoothing={0.9}
                mipmapBlur
            />
            <Vignette
                offset={0.3}
                darkness={0.4 + scrollProgress * 0.2}
                blendFunction={BlendFunction.NORMAL}
            />
        </EffectComposer>
    );
}

// =============================================
// MAIN SPACE SCENE EXPORT
// =============================================
export function SpaceScene({ scrollProgress }: SpaceSceneProps) {
    return (
        <Canvas
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                background: 'linear-gradient(180deg, #000000 0%, #050510 50%, #000000 100%)',
            }}
            camera={{ position: [0, 0, 50], fov: 60, near: 0.1, far: 1000 }}
            gl={{
                antialias: true,
                alpha: false,
                powerPreference: 'high-performance',
                stencil: false,
            }}
            dpr={[1, 1.5]}
        >
            <Suspense fallback={null}>
                <CinematicCamera scrollProgress={scrollProgress} />
                <SceneLighting scrollProgress={scrollProgress} />

                {/* Space background */}
                <AmbientStars scrollProgress={scrollProgress} />
                <NebulaClouds scrollProgress={scrollProgress} />

                {/* Journey elements */}
                <HolographicGridLines scrollProgress={scrollProgress} />
                <FloatingDataParticles scrollProgress={scrollProgress} />

                {/* Final scene */}
                <CommandPlatform scrollProgress={scrollProgress} />

                {/* Effects */}
                <PostProcessing scrollProgress={scrollProgress} />

                {/* Depth fog */}
                <fog attach="fog" args={['#000000', 100, 400]} />
            </Suspense>
        </Canvas>
    );
}
