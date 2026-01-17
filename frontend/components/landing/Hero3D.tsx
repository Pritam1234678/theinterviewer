"use client";

import { Canvas } from "@react-three/fiber";
import { Float, PerspectiveCamera, TorusKnot, MeshDistortMaterial, Environment } from "@react-three/drei";
import React from "react";

function Model() {
    return (
        <Float speed={1.2} rotationIntensity={1} floatIntensity={1.5}>
            <TorusKnot args={[1, 0.3, 64, 16]} position={[0, 0, 0]}>
                <MeshDistortMaterial
                    color="#3b82f6"
                    speed={1.5}
                    distort={0.4}
                    roughness={0.2}
                    metalness={0.8}
                />
            </TorusKnot>
        </Float>
    );
}

export default function Hero3D() {
    return (
        <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
            <Canvas dpr={[1, 1.5]}>
                <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <Model />
            </Canvas>
        </div>
    );
}
