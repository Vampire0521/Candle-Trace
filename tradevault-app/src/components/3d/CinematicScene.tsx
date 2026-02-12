// =============================================
// CANDLE TRACE - CINEMATIC 3D SCENE
// Professional ActiveTheory/Robin Payot inspired
// Space + Trading theme with smooth animations
// =============================================

'use client';

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Float, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

interface SceneProps {
    scrollProgress: number;
}

// =============================================
// CAMERA RIG - Ultra smooth journey
// =============================================
function CinematicCamera({ scrollProgress }: { scrollProgress: number }) {
    const { camera } = useThree();
    const currentPos = useRef(new THREE.Vector3(0, 0, 30));
    const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

    useFrame(() => {
        const p = scrollProgress;

        // Calculate target position based on scroll
        const targetPos = new THREE.Vector3();
        const targetLook = new THREE.Vector3();

        if (p < 0.25) {
            // Hero zone - gentle drift forward
            const t = p / 0.25;
            targetPos.set(Math.sin(t * 0.5) * 3, Math.cos(t * 0.3) * 2, 30 - t * 15);
            targetLook.set(0, 0, -20);
        } else if (p < 0.5) {
            // Zone 2 - curve left
            const t = (p - 0.25) / 0.25;
            targetPos.set(-5 + Math.sin(t * Math.PI) * 3, 2 + t * 2, 15 - t * 20);
            targetLook.set(-2, 0, -30);
        } else if (p < 0.75) {
            // Zone 3 - curve right
            const t = (p - 0.5) / 0.25;
            targetPos.set(5 - Math.sin(t * Math.PI) * 3, 4 - t * 2, -5 - t * 25);
            targetLook.set(2, 0, -50);
        } else {
            // Final approach to vault
            const t = (p - 0.75) / 0.25;
            targetPos.set(Math.sin(t * 0.5) * 2, 2 + Math.sin(t * 2) * 0.5, -30 - t * 30);
            targetLook.set(0, 0, -80);
        }

        // Super smooth interpolation
        currentPos.current.lerp(targetPos, 0.015);
        currentLookAt.current.lerp(targetLook, 0.02);

        camera.position.copy(currentPos.current);
        camera.lookAt(currentLookAt.current);
    });

    return null;
}

// =============================================
// ASTEROIDS - Drifting space rocks
// =============================================
function Asteroids() {
    const asteroidsRef = useRef<THREE.Group>(null);

    const asteroids = useMemo(() => {
        const data = [];
        for (let i = 0; i < 50; i++) {
            data.push({
                position: [
                    (Math.random() - 0.5) * 100,
                    (Math.random() - 0.5) * 60,
                    -Math.random() * 150 - 20,
                ] as [number, number, number],
                scale: 0.3 + Math.random() * 1.5,
                rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number],
                rotationSpeed: (Math.random() - 0.5) * 0.002,
                detail: Math.floor(Math.random() * 2),
            });
        }
        return data;
    }, []);

    useFrame(({ clock }) => {
        if (!asteroidsRef.current) return;
        asteroidsRef.current.children.forEach((asteroid, i) => {
            asteroid.rotation.x += asteroids[i].rotationSpeed;
            asteroid.rotation.y += asteroids[i].rotationSpeed * 0.7;
        });
    });

    return (
        <group ref={asteroidsRef}>
            {asteroids.map((asteroid, i) => (
                <mesh
                    key={i}
                    position={asteroid.position}
                    rotation={asteroid.rotation}
                    scale={asteroid.scale}
                >
                    <icosahedronGeometry args={[1, asteroid.detail]} />
                    <meshStandardMaterial
                        color="#2a2a3a"
                        roughness={0.9}
                        metalness={0.1}
                        flatShading
                    />
                </mesh>
            ))}
        </group>
    );
}

// =============================================
// PLANETS - Large celestial bodies
// =============================================
function Planets() {
    const planetsRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (!planetsRef.current) return;
        planetsRef.current.rotation.y = clock.getElapsedTime() * 0.003;
    });

    return (
        <group ref={planetsRef}>
            {/* Large purple planet */}
            <mesh position={[-40, 15, -80]}>
                <sphereGeometry args={[12, 32, 32]} />
                <meshStandardMaterial
                    color="#1a1a2e"
                    emissive="#FFFFFF"
                    emissiveIntensity={0.1}
                    roughness={0.8}
                    metalness={0.2}
                />
            </mesh>
            {/* Planet ring */}
            <mesh position={[-40, 15, -80]} rotation={[Math.PI * 0.4, 0, 0.3]}>
                <torusGeometry args={[18, 0.8, 2, 64]} />
                <meshStandardMaterial
                    color="#FFFFFF"
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Blue gas giant */}
            <mesh position={[50, -20, -120]}>
                <sphereGeometry args={[15, 32, 32]} />
                <meshStandardMaterial
                    color="#0a1a2e"
                    emissive="#3b82f6"
                    emissiveIntensity={0.1}
                    roughness={0.7}
                    metalness={0.3}
                />
            </mesh>

            {/* Small red planet */}
            <mesh position={[25, 25, -60]}>
                <sphereGeometry args={[4, 24, 24]} />
                <meshStandardMaterial
                    color="#2a1a1a"
                    emissive="#ef4444"
                    emissiveIntensity={0.1}
                    roughness={0.9}
                    metalness={0.1}
                />
            </mesh>

            {/* Green moon */}
            <mesh position={[-20, -15, -45]}>
                <sphereGeometry args={[3, 24, 24]} />
                <meshStandardMaterial
                    color="#0a2a1a"
                    emissive="#22c55e"
                    emissiveIntensity={0.15}
                    roughness={0.8}
                    metalness={0.2}
                />
            </mesh>
        </group>
    );
}

// =============================================
// CANDLESTICKS - Smoothly drifting
// =============================================
function FloatingCandlesticks({ scrollProgress }: { scrollProgress: number }) {
    const groupRef = useRef<THREE.Group>(null);

    const candlesticks = useMemo(() => {
        const sticks = [];
        for (let i = 0; i < 60; i++) {
            const isBullish = Math.random() > 0.45;
            sticks.push({
                position: new THREE.Vector3(
                    (Math.random() - 0.5) * 80,
                    (Math.random() - 0.5) * 40,
                    -20 - Math.random() * 120
                ),
                height: 0.4 + Math.random() * 2,
                wickHeight: 0.2 + Math.random() * 1,
                color: isBullish ? '#22c55e' : '#ef4444',
                driftSpeed: 0.1 + Math.random() * 0.3,
                rotationSpeed: (Math.random() - 0.5) * 0.01,
                floatOffset: Math.random() * Math.PI * 2,
            });
        }
        return sticks;
    }, []);

    useFrame(({ clock }) => {
        if (!groupRef.current) return;
        const time = clock.getElapsedTime();

        groupRef.current.children.forEach((group, i) => {
            const stick = candlesticks[i];
            // Gentle floating motion
            group.position.y = stick.position.y + Math.sin(time * 0.5 + stick.floatOffset) * 0.5;
            group.position.x = stick.position.x + Math.sin(time * 0.3 + stick.floatOffset) * 0.3;
            group.rotation.y += stick.rotationSpeed;
            group.rotation.z = Math.sin(time * 0.2 + stick.floatOffset) * 0.1;
        });
    });

    return (
        <group ref={groupRef}>
            {candlesticks.map((stick, i) => (
                <group key={i} position={stick.position}>
                    {/* Body */}
                    <mesh>
                        <boxGeometry args={[0.25, stick.height, 0.25]} />
                        <meshStandardMaterial
                            color={stick.color}
                            emissive={stick.color}
                            emissiveIntensity={0.5}
                            metalness={0.6}
                            roughness={0.4}
                        />
                    </mesh>
                    {/* Top wick */}
                    <mesh position={[0, stick.height / 2 + stick.wickHeight / 2, 0]}>
                        <boxGeometry args={[0.04, stick.wickHeight, 0.04]} />
                        <meshStandardMaterial color={stick.color} emissive={stick.color} emissiveIntensity={0.3} />
                    </mesh>
                    {/* Bottom wick */}
                    <mesh position={[0, -stick.height / 2 - stick.wickHeight / 2, 0]}>
                        <boxGeometry args={[0.04, stick.wickHeight, 0.04]} />
                        <meshStandardMaterial color={stick.color} emissive={stick.color} emissiveIntensity={0.3} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

// =============================================
// PRICE CHARTS - Flowing 3D lines
// =============================================
function PriceCharts({ scrollProgress }: { scrollProgress: number }) {
    const chartsRef = useRef<THREE.Group>(null);

    const charts = useMemo(() => {
        const chartData = [];
        for (let c = 0; c < 12; c++) {
            const points: THREE.Vector3[] = [];
            const startX = (Math.random() - 0.5) * 60;
            const startY = (Math.random() - 0.5) * 30;
            const startZ = -30 - Math.random() * 80;

            let y = 0;
            for (let i = 0; i < 40; i++) {
                y += (Math.random() - 0.48) * 0.4;
                points.push(new THREE.Vector3(i * 0.5, y, 0));
            }

            chartData.push({
                points,
                position: [startX, startY, startZ] as [number, number, number],
                color: y > 0 ? '#22c55e' : '#ef4444',
                opacity: 0.4 + Math.random() * 0.3,
            });
        }
        return chartData;
    }, []);

    useFrame(({ clock }) => {
        if (!chartsRef.current) return;
        chartsRef.current.children.forEach((chart, i) => {
            chart.rotation.y = Math.sin(clock.getElapsedTime() * 0.1 + i) * 0.05;
        });
    });

    return (
        <group ref={chartsRef}>
            {charts.map((chart, i) => (
                <group key={i} position={chart.position} rotation={[0, Math.random() * 0.5, 0]}>
                    <Line
                        points={chart.points}
                        color={chart.color}
                        lineWidth={2}
                        transparent
                        opacity={chart.opacity}
                    />
                </group>
            ))}
        </group>
    );
}

// =============================================
// CURRENCY SYMBOLS - Floating crypto/forex
// =============================================
function CurrencySymbols({ scrollProgress }: { scrollProgress: number }) {
    const symbolsRef = useRef<THREE.Group>(null);

    const symbols = useMemo(() => {
        const currencyData = [
            { symbol: '₿', color: '#f7931a' }, // Bitcoin
            { symbol: 'Ξ', color: '#627eea' }, // Ethereum
            { symbol: '$', color: '#22c55e' }, // Dollar
            { symbol: '€', color: '#3b82f6' }, // Euro
            { symbol: '£', color: '#FFFFFF' }, // Pound
            { symbol: '¥', color: '#ef4444' }, // Yen
            { symbol: '₮', color: '#26a17b' }, // Tether
            { symbol: '◎', color: '#9945ff' }, // Solana
        ];

        return currencyData.map((curr, i) => ({
            ...curr,
            position: new THREE.Vector3(
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 30,
                -25 - Math.random() * 70
            ),
            scale: 1.5 + Math.random() * 2,
            floatOffset: Math.random() * Math.PI * 2,
        }));
    }, []);

    useFrame(({ clock }) => {
        if (!symbolsRef.current) return;
        const time = clock.getElapsedTime();

        symbolsRef.current.children.forEach((group, i) => {
            const sym = symbols[i];
            group.position.y = sym.position.y + Math.sin(time * 0.4 + sym.floatOffset) * 1;
            group.position.x = sym.position.x + Math.cos(time * 0.3 + sym.floatOffset) * 0.5;
            group.rotation.y = Math.sin(time * 0.2 + sym.floatOffset) * 0.3;
        });
    });

    return (
        <group ref={symbolsRef}>
            {symbols.map((sym, i) => (
                <group key={i} position={sym.position}>
                    {/* Glow sphere */}
                    <Sphere args={[sym.scale * 0.8, 16, 16]}>
                        <meshStandardMaterial
                            color={sym.color}
                            emissive={sym.color}
                            emissiveIntensity={0.3}
                            transparent
                            opacity={0.15}
                        />
                    </Sphere>
                    {/* Core */}
                    <Sphere args={[sym.scale * 0.3, 16, 16]}>
                        <meshStandardMaterial
                            color={sym.color}
                            emissive={sym.color}
                            emissiveIntensity={0.8}
                        />
                    </Sphere>
                </group>
            ))}
        </group>
    );
}

// =============================================
// PARTICLE STREAMS - Data flow effect
// =============================================
function ParticleStreams({ scrollProgress }: { scrollProgress: number }) {
    const particlesRef = useRef<THREE.Points>(null);

    const { positions, colors, velocities } = useMemo(() => {
        const count = 500;
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const vel = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 2 + Math.random() * 25;

            pos[i * 3] = Math.cos(angle) * radius;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
            pos[i * 3 + 2] = -80 + Math.random() * 160;

            vel[i] = 0.3 + Math.random() * 0.7;

            // Mix of trading colors
            const colorChoice = Math.random();
            if (colorChoice < 0.3) {
                col[i * 3] = 0.13; col[i * 3 + 1] = 0.77; col[i * 3 + 2] = 0.37; // Green
            } else if (colorChoice < 0.6) {
                col[i * 3] = 0.93; col[i * 3 + 1] = 0.27; col[i * 3 + 2] = 0.27; // Red
            } else if (colorChoice < 0.8) {
                col[i * 3] = 0.55; col[i * 3 + 1] = 0.36; col[i * 3 + 2] = 0.96; // Purple
            } else {
                col[i * 3] = 0.23; col[i * 3 + 1] = 0.51; col[i * 3 + 2] = 0.96; // Blue
            }
        }

        return { positions: pos, colors: col, velocities: vel };
    }, []);

    useFrame((_, delta) => {
        if (!particlesRef.current) return;

        const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array;
        const speed = 3 + scrollProgress * 15;

        for (let i = 0; i < posArray.length / 3; i++) {
            posArray[i * 3 + 2] += speed * delta * velocities[i];
            if (posArray[i * 3 + 2] > 80) {
                posArray[i * 3 + 2] = -80;
            }
        }

        particlesRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-color" args={[colors, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={0.12}
                vertexColors
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
                sizeAttenuation
            />
        </points>
    );
}

// =============================================
// TRADING VAULT - Final destination
// =============================================
function TradingVault({ scrollProgress }: { scrollProgress: number }) {
    const vaultRef = useRef<THREE.Group>(null);
    const vaultOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.5) / 0.5));

    useFrame(({ clock }) => {
        if (vaultRef.current) {
            vaultRef.current.rotation.y = clock.getElapsedTime() * 0.08;
            const pulse = 1 + Math.sin(clock.getElapsedTime() * 0.8) * 0.03;
            vaultRef.current.scale.setScalar(pulse);
        }
    });

    return (
        <group ref={vaultRef} position={[0, 0, -70]}>
            {/* Core */}
            <mesh>
                <octahedronGeometry args={[6, 0]} />
                <meshStandardMaterial
                    color="#0a0a1a"
                    metalness={0.95}
                    roughness={0.05}
                    emissive="#FFFFFF"
                    emissiveIntensity={0.15 + vaultOpacity * 0.2}
                    transparent
                    opacity={0.3 + vaultOpacity * 0.7}
                />
            </mesh>
            {/* Wireframe */}
            <mesh>
                <octahedronGeometry args={[6.2, 0]} />
                <meshBasicMaterial color="#FFFFFF" wireframe transparent opacity={0.3 + vaultOpacity * 0.4} />
            </mesh>
            {/* Inner glow */}
            <Sphere args={[5, 32, 32]}>
                <meshStandardMaterial
                    color="#1a1a2e"
                    emissive="#FFFFFF"
                    emissiveIntensity={0.2 + vaultOpacity * 0.3}
                    transparent
                    opacity={0.4 + vaultOpacity * 0.4}
                />
            </Sphere>
            {/* Orbiting rings */}
            {[0, 1, 2, 3].map((i) => (
                <Float key={i} speed={0.5} rotationIntensity={0.2} floatIntensity={0.1}>
                    <mesh rotation={[Math.PI / 4 + i * 0.4, i * 0.5, i * 0.3]}>
                        <torusGeometry args={[9 + i * 1.5, 0.02, 16, 100]} />
                        <meshStandardMaterial
                            color={i % 2 === 0 ? '#FFFFFF' : '#3b82f6'}
                            emissive={i % 2 === 0 ? '#FFFFFF' : '#3b82f6'}
                            emissiveIntensity={0.4 + vaultOpacity * 0.4}
                            transparent
                            opacity={0.4 + vaultOpacity * 0.5}
                        />
                    </mesh>
                </Float>
            ))}
        </group>
    );
}

// =============================================
// LIGHTING
// =============================================
function SceneLighting({ scrollProgress }: { scrollProgress: number }) {
    const lightRef = useRef<THREE.PointLight>(null);

    useFrame(() => {
        if (!lightRef.current) return;

        let targetColor: THREE.Color;
        if (scrollProgress < 0.25) {
            targetColor = new THREE.Color('#FFFFFF');
        } else if (scrollProgress < 0.5) {
            targetColor = new THREE.Color('#3b82f6');
        } else if (scrollProgress < 0.75) {
            targetColor = new THREE.Color('#22c55e');
        } else {
            targetColor = new THREE.Color('#f59e0b');
        }

        lightRef.current.color.lerp(targetColor, 0.015);
    });

    return (
        <>
            <ambientLight intensity={0.06} />
            <pointLight ref={lightRef} position={[0, 0, 20]} intensity={1.2} color="#FFFFFF" distance={100} />
            <pointLight position={[-30, 20, -40]} intensity={0.4} color="#FFFFFF" distance={80} />
            <pointLight position={[30, -15, -60]} intensity={0.3} color="#3b82f6" distance={80} />
            <pointLight position={[0, -30, -100]} intensity={0.2} color="#22c55e" distance={100} />
        </>
    );
}

// =============================================
// DEEP SPACE BACKGROUND
// =============================================
function DeepSpaceBackground() {
    return (
        <>
            <Stars radius={250} depth={150} count={8000} factor={6} saturation={0.1} fade speed={0.2} />
            <fog attach="fog" args={['#030308', 40, 180]} />
        </>
    );
}

// =============================================
// MAIN SCENE EXPORT
// =============================================
export function CinematicScene({ scrollProgress }: SceneProps) {
    return (
        <Canvas
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                background: 'radial-gradient(ellipse at 50% 50%, #0a0a1a 0%, #050510 40%, #020205 100%)',
            }}
            camera={{ position: [0, 0, 30], fov: 55 }}
            gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
            dpr={[1, 2]}
        >
            <Suspense fallback={null}>
                <CinematicCamera scrollProgress={scrollProgress} />
                <SceneLighting scrollProgress={scrollProgress} />
                <DeepSpaceBackground />

                {/* Space elements */}
                <Asteroids />
                <Planets />

                {/* Trading elements */}
                <FloatingCandlesticks scrollProgress={scrollProgress} />
                <PriceCharts scrollProgress={scrollProgress} />
                <CurrencySymbols scrollProgress={scrollProgress} />
                <ParticleStreams scrollProgress={scrollProgress} />

                {/* Destination */}
                <TradingVault scrollProgress={scrollProgress} />
            </Suspense>
        </Canvas>
    );
}
