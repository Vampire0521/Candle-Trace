// =============================================
// CANDLE TRACE - ELITE BLACK HOLE 3D EXPERIENCE
// Award-winning cinematic journey
// Inspired by ActiveTheory & Robin Payot
// =============================================

'use client';

import { useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { Stars, Float, Sphere, shaderMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

interface SceneProps {
    scrollProgress: number;
}

// =============================================
// CUSTOM SHADER MATERIALS
// =============================================

// Gravitational distortion shader for particles
const GravityStretchMaterial = shaderMaterial(
    {
        uTime: 0,
        uProgress: 0,
        uColor: new THREE.Color('#FFFFFF'),
    },
    // Vertex shader
    `
    uniform float uTime;
    uniform float uProgress;
    varying vec3 vPosition;
    varying float vStretch;
    
    void main() {
        vPosition = position;
        
        // Calculate stretch toward center (black hole pull)
        vec3 toCenter = -position;
        float dist = length(position);
        float pullStrength = uProgress * 2.0;
        
        // Stretch particles toward z-axis (black hole direction)
        vec3 stretched = position;
        stretched.z -= pullStrength * (1.0 / max(dist * 0.1, 0.1)) * 50.0;
        
        vStretch = pullStrength / max(dist, 1.0);
        
        vec4 mvPosition = modelViewMatrix * vec4(stretched, 1.0);
        gl_PointSize = (3.0 + vStretch * 5.0) * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
    }
    `,
    // Fragment shader
    `
    uniform vec3 uColor;
    uniform float uProgress;
    varying float vStretch;
    
    void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        
        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        alpha *= 0.6 + vStretch * 0.4;
        
        // Color shifts toward white as it stretches
        vec3 finalColor = mix(uColor, vec3(1.0), vStretch * 0.5);
        
        gl_FragColor = vec4(finalColor, alpha);
    }
    `
);

extend({ GravityStretchMaterial });

// =============================================
// CINEMATIC CAMERA - Smooth journey into void
// =============================================
function CinematicCamera({ scrollProgress }: { scrollProgress: number }) {
    const { camera } = useThree();
    const currentPos = useRef(new THREE.Vector3(0, 0, 50));
    const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
    const targetPos = useRef(new THREE.Vector3());
    const targetLookAt = useRef(new THREE.Vector3());

    useFrame(() => {
        const p = scrollProgress;

        // 5-stage camera progression
        if (p < 0.15) {
            // Stage 1: VOID - Slowly enter
            const t = p / 0.15;
            targetPos.current.set(
                Math.sin(t * 0.5) * 5,
                Math.cos(t * 0.3) * 3,
                50 - t * 30
            );
            targetLookAt.current.set(0, 0, -100);
        } else if (p < 0.4) {
            // Stage 2: DRIFT - Elements appear
            const t = (p - 0.15) / 0.25;
            targetPos.current.set(
                Math.sin(t * Math.PI) * 10,
                5 + Math.sin(t * 2) * 3,
                20 - t * 80
            );
            targetLookAt.current.set(0, 0, -200);
        } else if (p < 0.65) {
            // Stage 3: PULL - Gravitational warping
            const t = (p - 0.4) / 0.25;
            targetPos.current.set(
                Math.sin(t * Math.PI * 2) * 8,
                3 - t * 2,
                -60 - t * 120
            );
            targetLookAt.current.set(0, 0, -400);
        } else if (p < 0.85) {
            // Stage 4: ACCELERATE - Intense approach
            const t = (p - 0.65) / 0.2;
            const spiral = t * Math.PI * 4;
            targetPos.current.set(
                Math.sin(spiral) * (6 - t * 5),
                Math.cos(spiral) * (3 - t * 2),
                -180 - t * 150
            );
            targetLookAt.current.set(0, 0, -500);
        } else {
            // Stage 5: SINGULARITY - Inside the black hole
            const t = (p - 0.85) / 0.15;
            targetPos.current.set(
                Math.sin(t * 10) * (1 - t) * 2,
                Math.cos(t * 10) * (1 - t),
                -330 - t * 80
            );
            targetLookAt.current.set(0, 0, -500);
        }

        // Ultra-smooth interpolation (slower = smoother)
        const lerpSpeed = 0.012 + scrollProgress * 0.008;
        currentPos.current.lerp(targetPos.current, lerpSpeed);
        currentLookAt.current.lerp(targetLookAt.current, lerpSpeed);

        camera.position.copy(currentPos.current);
        camera.lookAt(currentLookAt.current);
    });

    return null;
}

// =============================================
// INFINITE STAR FIELD - Deep space backdrop
// =============================================
function InfiniteStars({ scrollProgress }: { scrollProgress: number }) {
    const starsRef = useRef<THREE.Points>(null);

    const { positions, sizes } = useMemo(() => {
        const count = 10000;
        const pos = new Float32Array(count * 3);
        const size = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 100 + Math.random() * 400;

            pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = radius * Math.cos(phi) - 200; // Offset toward black hole

            size[i] = 0.5 + Math.random() * 1.5;
        }

        return { positions: pos, sizes: size };
    }, []);

    useFrame((_, delta) => {
        if (!starsRef.current) return;

        // Stars slowly drift toward black hole
        const posArray = starsRef.current.geometry.attributes.position.array as Float32Array;
        const speed = 2 + scrollProgress * 20;

        for (let i = 0; i < posArray.length / 3; i++) {
            posArray[i * 3 + 2] += speed * delta;

            // Reset stars that pass camera
            if (posArray[i * 3 + 2] > 100) {
                posArray[i * 3 + 2] = -500;
            }
        }

        starsRef.current.geometry.attributes.position.needsUpdate = true;
        starsRef.current.rotation.z += delta * 0.01;
    });

    return (
        <points ref={starsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
            </bufferGeometry>
            <pointsMaterial
                size={1.5}
                color="#ffffff"
                transparent
                opacity={0.9}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

// =============================================
// COSMIC DUST - Volumetric particle clouds
// =============================================
function CosmicDust({ scrollProgress }: { scrollProgress: number }) {
    const dustRef = useRef<THREE.Points>(null);

    const { positions, colors } = useMemo(() => {
        const count = 3000;
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Create dust in cylindrical clouds
            const angle = Math.random() * Math.PI * 2;
            const radius = 20 + Math.random() * 80;
            const z = (Math.random() - 0.5) * 600;

            pos[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 20;
            pos[i * 3 + 1] = Math.sin(angle) * radius * 0.3 + (Math.random() - 0.5) * 15;
            pos[i * 3 + 2] = z;

            // Color gradient: purple → blue → cyan
            const colorT = Math.random();
            if (colorT < 0.4) {
                col[i * 3] = 0.55; col[i * 3 + 1] = 0.36; col[i * 3 + 2] = 0.96;
            } else if (colorT < 0.7) {
                col[i * 3] = 0.23; col[i * 3 + 1] = 0.51; col[i * 3 + 2] = 0.96;
            } else {
                col[i * 3] = 0.13; col[i * 3 + 1] = 0.83; col[i * 3 + 2] = 0.93;
            }
        }

        return { positions: pos, colors: col };
    }, []);

    useFrame((_, delta) => {
        if (!dustRef.current) return;

        const posArray = dustRef.current.geometry.attributes.position.array as Float32Array;
        const speed = 5 + scrollProgress * 40;

        for (let i = 0; i < posArray.length / 3; i++) {
            posArray[i * 3 + 2] += speed * delta;

            if (posArray[i * 3 + 2] > 100) {
                posArray[i * 3 + 2] = -500;
            }
        }

        dustRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={dustRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-color" args={[colors, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={0.8}
                vertexColors
                transparent
                opacity={0.4 + scrollProgress * 0.3}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

// =============================================
// TRADING ELEMENTS - Data being pulled in
// =============================================
function TradingElements({ scrollProgress }: { scrollProgress: number }) {
    const groupRef = useRef<THREE.Group>(null);

    const elements = useMemo(() => {
        const data = [];
        for (let i = 0; i < 80; i++) {
            const isBullish = Math.random() > 0.45;
            const angle = Math.random() * Math.PI * 2;
            const radius = 15 + Math.random() * 60;

            data.push({
                position: new THREE.Vector3(
                    Math.cos(angle) * radius,
                    (Math.random() - 0.5) * 30,
                    -50 - Math.random() * 350
                ),
                height: 0.3 + Math.random() * 2,
                wickHeight: 0.15 + Math.random() * 0.8,
                color: isBullish ? '#22c55e' : '#ef4444',
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                floatPhase: Math.random() * Math.PI * 2,
            });
        }
        return data;
    }, []);

    useFrame(({ clock }) => {
        if (!groupRef.current) return;
        const time = clock.getElapsedTime();

        groupRef.current.children.forEach((group, i) => {
            const el = elements[i];

            // Gravitational pull toward center as scroll increases
            const pullStrength = scrollProgress * 0.02;
            group.position.x *= (1 - pullStrength);
            group.position.y *= (1 - pullStrength * 0.5);

            // Gentle floating
            group.position.y += Math.sin(time * 0.5 + el.floatPhase) * 0.01;

            // Rotation intensifies with scroll
            group.rotation.y += el.rotationSpeed * (1 + scrollProgress * 2);
            group.rotation.x = Math.sin(time * 0.2 + el.floatPhase) * 0.1 * (1 + scrollProgress);
        });
    });

    return (
        <group ref={groupRef}>
            {elements.map((el, i) => (
                <group key={i} position={el.position}>
                    {/* Candlestick body */}
                    <mesh>
                        <boxGeometry args={[0.2, el.height, 0.2]} />
                        <meshStandardMaterial
                            color={el.color}
                            emissive={el.color}
                            emissiveIntensity={0.6 + scrollProgress * 0.4}
                            metalness={0.7}
                            roughness={0.3}
                        />
                    </mesh>
                    {/* Wicks */}
                    <mesh position={[0, el.height / 2 + el.wickHeight / 2, 0]}>
                        <boxGeometry args={[0.03, el.wickHeight, 0.03]} />
                        <meshStandardMaterial color={el.color} emissive={el.color} emissiveIntensity={0.4} />
                    </mesh>
                    <mesh position={[0, -el.height / 2 - el.wickHeight / 2, 0]}>
                        <boxGeometry args={[0.03, el.wickHeight, 0.03]} />
                        <meshStandardMaterial color={el.color} emissive={el.color} emissiveIntensity={0.4} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

// =============================================
// ACCRETION DISK - Swirling ring around black hole
// =============================================
function AccretionDisk({ scrollProgress }: { scrollProgress: number }) {
    const diskRef = useRef<THREE.Group>(null);
    const visibility = Math.max(0, (scrollProgress - 0.3) / 0.7);

    useFrame(({ clock }) => {
        if (!diskRef.current) return;

        // Rotation speed increases as we approach
        const rotationSpeed = 0.1 + scrollProgress * 0.5;
        diskRef.current.rotation.z += rotationSpeed * 0.01;
    });

    return (
        <group ref={diskRef} position={[0, 0, -420]} rotation={[Math.PI * 0.15, 0, 0]}>
            {/* Multiple ring layers */}
            {[0, 1, 2, 3, 4].map((i) => (
                <mesh key={i} rotation={[0, 0, i * 0.2]}>
                    <torusGeometry args={[30 + i * 8, 0.5 + i * 0.3, 16, 100]} />
                    <meshStandardMaterial
                        color={i < 2 ? '#f97316' : i < 4 ? '#eab308' : '#ffffff'}
                        emissive={i < 2 ? '#f97316' : i < 4 ? '#eab308' : '#fef3c7'}
                        emissiveIntensity={0.8 + (4 - i) * 0.2}
                        transparent
                        opacity={visibility * (0.4 + (4 - i) * 0.1)}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}

            {/* Particle swirl */}
            <SwirlingParticles visibility={visibility} />
        </group>
    );
}

function SwirlingParticles({ visibility }: { visibility: number }) {
    const particlesRef = useRef<THREE.Points>(null);

    const positions = useMemo(() => {
        const count = 2000;
        const pos = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 20;
            const radius = 25 + (i / count) * 40;

            pos[i * 3] = Math.cos(angle) * radius;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 3;
            pos[i * 3 + 2] = Math.sin(angle) * radius * 0.3;
        }

        return pos;
    }, []);

    useFrame(({ clock }) => {
        if (!particlesRef.current) return;

        const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array;
        const time = clock.getElapsedTime();

        for (let i = 0; i < posArray.length / 3; i++) {
            const angle = (i / (posArray.length / 3)) * Math.PI * 20 + time * 0.5;
            const radius = 25 + (i / (posArray.length / 3)) * 40;

            posArray[i * 3] = Math.cos(angle) * radius;
            posArray[i * 3 + 2] = Math.sin(angle) * radius * 0.3;
        }

        particlesRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={1}
                color="#fbbf24"
                transparent
                opacity={visibility * 0.7}
                blending={THREE.AdditiveBlending}
                sizeAttenuation
            />
        </points>
    );
}

// =============================================
// EVENT HORIZON - The black hole core
// =============================================
function EventHorizon({ scrollProgress }: { scrollProgress: number }) {
    const holeRef = useRef<THREE.Group>(null);
    const visibility = Math.max(0, (scrollProgress - 0.4) / 0.6);

    useFrame(({ clock }) => {
        if (!holeRef.current) return;

        holeRef.current.rotation.y = clock.getElapsedTime() * 0.05;

        // Pulsing effect
        const pulse = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.02;
        holeRef.current.scale.setScalar(pulse);
    });

    return (
        <group ref={holeRef} position={[0, 0, -450]}>
            {/* Black core */}
            <mesh>
                <sphereGeometry args={[20, 64, 64]} />
                <meshBasicMaterial color="#000000" />
            </mesh>

            {/* Event horizon glow */}
            <mesh>
                <sphereGeometry args={[21, 64, 64]} />
                <meshStandardMaterial
                    color="#1a1a2e"
                    emissive="#FFFFFF"
                    emissiveIntensity={visibility * 0.5}
                    transparent
                    opacity={visibility * 0.6}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Gravitational lensing ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[22, 0.5, 16, 100]} />
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={visibility * 2}
                    transparent
                    opacity={visibility * 0.8}
                />
            </mesh>

            {/* Inner light ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[23, 0.2, 16, 100]} />
                <meshBasicMaterial
                    color="#22d3ee"
                    transparent
                    opacity={visibility * 0.9}
                />
            </mesh>
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

        // Light color shifts as we go deeper
        let targetColor: THREE.Color;
        if (scrollProgress < 0.3) {
            targetColor = new THREE.Color('#FFFFFF');
        } else if (scrollProgress < 0.6) {
            targetColor = new THREE.Color('#6366f1');
        } else if (scrollProgress < 0.85) {
            targetColor = new THREE.Color('#f97316');
        } else {
            targetColor = new THREE.Color('#ffffff');
        }

        lightRef.current.color.lerp(targetColor, 0.02);
        lightRef.current.intensity = 1 + scrollProgress * 2;
    });

    return (
        <>
            <ambientLight intensity={0.03} />
            <pointLight
                ref={lightRef}
                position={[0, 0, -400]}
                intensity={1}
                color="#FFFFFF"
                distance={300}
            />
            <pointLight position={[50, 30, -200]} intensity={0.3} color="#3b82f6" distance={200} />
            <pointLight position={[-50, -30, -300]} intensity={0.2} color="#FFFFFF" distance={200} />
        </>
    );
}

// =============================================
// POST-PROCESSING EFFECTS
// =============================================
function PostProcessingEffects({ scrollProgress }: { scrollProgress: number }) {
    return (
        <EffectComposer>
            <Bloom
                intensity={0.5 + scrollProgress * 1.5}
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
                mipmapBlur
            />
            <ChromaticAberration
                blendFunction={BlendFunction.NORMAL}
                offset={new THREE.Vector2(scrollProgress * 0.003, scrollProgress * 0.002)}
            />
            <Vignette
                offset={0.3 + scrollProgress * 0.2}
                darkness={0.5 + scrollProgress * 0.4}
                blendFunction={BlendFunction.NORMAL}
            />
        </EffectComposer>
    );
}

// =============================================
// MAIN SCENE EXPORT
// =============================================
export function BlackHoleScene({ scrollProgress }: SceneProps) {
    return (
        <Canvas
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                background: '#000000',
            }}
            camera={{ position: [0, 0, 50], fov: 60, near: 0.1, far: 1000 }}
            gl={{
                antialias: true,
                alpha: false,
                powerPreference: 'high-performance',
                stencil: false,
            }}
            dpr={[1, 2]}
        >
            <Suspense fallback={null}>
                <CinematicCamera scrollProgress={scrollProgress} />
                <SceneLighting scrollProgress={scrollProgress} />

                {/* Space elements */}
                <InfiniteStars scrollProgress={scrollProgress} />
                <CosmicDust scrollProgress={scrollProgress} />

                {/* Trading data being pulled in */}
                <TradingElements scrollProgress={scrollProgress} />

                {/* Black hole structure */}
                <AccretionDisk scrollProgress={scrollProgress} />
                <EventHorizon scrollProgress={scrollProgress} />

                {/* Post-processing */}
                <PostProcessingEffects scrollProgress={scrollProgress} />

                {/* Fog for depth */}
                <fog attach="fog" args={['#000000', 50, 500]} />
            </Suspense>
        </Canvas>
    );
}
