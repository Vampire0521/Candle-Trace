// =============================================
// CANDLE TRACE - WARP TUNNEL COMPONENT
// Immersive space travel through trading dimensions
// =============================================

'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WarpTunnelProps {
    scrollProgress: number;
}

// Streaking stars that fly past during warp
function WarpStars({ scrollProgress }: { scrollProgress: number }) {
    const starsRef = useRef<THREE.Points>(null);
    const velocityRef = useRef(new Float32Array(2000));

    const { positions, colors } = useMemo(() => {
        const count = 2000;
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Distribute stars in a cylindrical tunnel pattern
            const angle = Math.random() * Math.PI * 2;
            const radius = 3 + Math.random() * 15;
            const z = (Math.random() - 0.5) * 200;

            pos[i * 3] = Math.cos(angle) * radius;
            pos[i * 3 + 1] = Math.sin(angle) * radius;
            pos[i * 3 + 2] = z;

            // Random velocity for each star
            velocityRef.current[i] = 0.5 + Math.random() * 1.5;

            // Color gradient: purple to blue to cyan
            const colorT = Math.random();
            if (colorT < 0.33) {
                // Purple
                col[i * 3] = 0.55;
                col[i * 3 + 1] = 0.36;
                col[i * 3 + 2] = 0.96;
            } else if (colorT < 0.66) {
                // Blue
                col[i * 3] = 0.23;
                col[i * 3 + 1] = 0.51;
                col[i * 3 + 2] = 0.96;
            } else {
                // Cyan/White
                col[i * 3] = 0.7;
                col[i * 3 + 1] = 0.9;
                col[i * 3 + 2] = 1.0;
            }
        }

        return { positions: pos, colors: col };
    }, []);

    useFrame((_, delta) => {
        if (!starsRef.current) return;

        const posArray = starsRef.current.geometry.attributes.position.array as Float32Array;
        const speed = 10 + scrollProgress * 80; // Speed increases with scroll

        for (let i = 0; i < posArray.length / 3; i++) {
            // Move stars towards camera
            posArray[i * 3 + 2] += speed * delta * velocityRef.current[i];

            // Reset stars that pass the camera
            if (posArray[i * 3 + 2] > 50) {
                posArray[i * 3 + 2] = -100;
            }
        }

        starsRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={starsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    args={[colors, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                vertexColors
                transparent
                opacity={0.9}
                blending={THREE.AdditiveBlending}
                sizeAttenuation
            />
        </points>
    );
}

// Glowing tunnel rings
function TunnelRings({ scrollProgress }: { scrollProgress: number }) {
    const ringsRef = useRef<THREE.Group>(null);

    const rings = useMemo(() => {
        const ringData = [];
        for (let i = 0; i < 30; i++) {
            ringData.push({
                z: -i * 8,
                radius: 8 + Math.sin(i * 0.5) * 2,
                opacity: 0.1 + Math.random() * 0.2,
            });
        }
        return ringData;
    }, []);

    useFrame((_, delta) => {
        if (!ringsRef.current) return;

        const speed = 5 + scrollProgress * 40;

        ringsRef.current.children.forEach((ring, i) => {
            ring.position.z += speed * delta;
            if (ring.position.z > 10) {
                ring.position.z = -240;
            }
            // Pulse effect
            const scale = 1 + Math.sin(Date.now() * 0.002 + i) * 0.05;
            ring.scale.setScalar(scale);
        });
    });

    return (
        <group ref={ringsRef}>
            {rings.map((ring, i) => (
                <mesh key={i} position={[0, 0, ring.z]} rotation={[0, 0, 0]}>
                    <torusGeometry args={[ring.radius, 0.03, 8, 64]} />
                    <meshBasicMaterial
                        color={i % 2 === 0 ? '#FFFFFF' : '#3b82f6'}
                        transparent
                        opacity={ring.opacity}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}
        </group>
    );
}

// Nebula clouds that change color per zone
function NebulaClouds({ scrollProgress }: { scrollProgress: number }) {
    const cloudsRef = useRef<THREE.Group>(null);

    // Determine zone color based on scroll progress
    const zoneColor = useMemo(() => {
        if (scrollProgress < 0.25) return new THREE.Color('#FFFFFF'); // Purple - Hero
        if (scrollProgress < 0.5) return new THREE.Color('#3b82f6'); // Blue - Analytics
        if (scrollProgress < 0.75) return new THREE.Color('#22c55e'); // Green - Growth
        return new THREE.Color('#f59e0b'); // Gold - CTA
    }, [scrollProgress]);

    useFrame(() => {
        if (!cloudsRef.current) return;

        cloudsRef.current.children.forEach((child) => {
            const mesh = child as THREE.Mesh;
            const mat = mesh.material as THREE.MeshBasicMaterial;
            mat.color.lerp(zoneColor, 0.02);
        });
    });

    return (
        <group ref={cloudsRef}>
            {/* Background nebula spheres */}
            {[...Array(8)].map((_, i) => (
                <mesh
                    key={i}
                    position={[
                        (Math.random() - 0.5) * 40,
                        (Math.random() - 0.5) * 30,
                        -50 - Math.random() * 100,
                    ]}
                    scale={[15 + Math.random() * 20, 15 + Math.random() * 20, 15 + Math.random() * 20]}
                >
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshBasicMaterial
                        color="#FFFFFF"
                        transparent
                        opacity={0.05 + Math.random() * 0.05}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}
        </group>
    );
}

// Main Warp Tunnel export
export function WarpTunnel({ scrollProgress }: WarpTunnelProps) {
    return (
        <group>
            <WarpStars scrollProgress={scrollProgress} />
            <TunnelRings scrollProgress={scrollProgress} />
            <NebulaClouds scrollProgress={scrollProgress} />
        </group>
    );
}
