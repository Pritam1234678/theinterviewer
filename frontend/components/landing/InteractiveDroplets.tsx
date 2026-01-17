
"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// --- Shaders ---

const vertexShader = `
attribute vec3 position;
varying vec2 vTexCoord;

void main() {
    vTexCoord = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
precision mediump float;

const int TRAIL_LENGTH = 15;
const float EPS = 1e-4;
const int ITR = 16;
const float PI = acos(-1.0);

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uPointerTrail[TRAIL_LENGTH];

varying vec2 vTexCoord;

float rnd3D(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453123);
}

float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);

    float a000 = rnd3D(i); // (0,0,0)
    float a100 = rnd3D(i + vec3(1.0, 0.0, 0.0)); // (1,0,0)
    float a010 = rnd3D(i + vec3(0.0, 1.0, 0.0)); // (0,1,0)
    float a110 = rnd3D(i + vec3(1.0, 1.0, 0.0)); // (1,1,0)
    float a001 = rnd3D(i + vec3(0.0, 0.0, 1.0)); // (0,0,1)
    float a101 = rnd3D(i + vec3(1.0, 0.0, 1.0)); // (1,0,1)
    float a011 = rnd3D(i + vec3(0.0, 1.0, 1.0)); // (0,1,1)
    float a111 = rnd3D(i + vec3(1.0, 1.0, 1.0)); // (1,1,1)

    vec3 u = f * f * (3.0 - 2.0 * f);

    float k0 = a000;
    float k1 = a100 - a000;
    float k2 = a010 - a000;
    float k3 = a001 - a000;
    float k4 = a000 - a100 - a010 + a110;
    float k5 = a000 - a010 - a001 + a011;
    float k6 = a000 - a100 - a001 + a101;
    float k7 = -a000 + a100 + a010 - a110 + a001 - a101 - a011 + a111;

    return k0 + k1 * u.x + k2 * u.y + k3 *u.z + k4 * u.x * u.y + k5 * u.y * u.z + k6 * u.z * u.x + k7 * u.x * u.y * u.z;
}

// Camera
vec3 origin = vec3(0.0, 0.0, 1.0);
vec3 lookAt = vec3(0.0, 0.0, 0.0);
vec3 cDir = normalize(lookAt - origin);
vec3 cUp = vec3(0.0, 1.0, 0.0);
vec3 cSide = cross(cDir, cUp);

float smoothMin(float d1, float d2, float k) {
    float h = exp(-k * d1) + exp(-k * d2);
    return -log(h) / k;
}

vec3 translate(vec3 p, vec3 t) {
    return p - t;
}

float sdSphere(vec3 p, float s) {
    return length(p) - s;
}

float map(vec3 p) {
    float baseRadius = 8e-3;
    float radius = baseRadius * float(TRAIL_LENGTH);
    float k = 7.;
    float d = 1e5;

    for (int i = 0; i < TRAIL_LENGTH; i++) {
        float fi = float(i);
        vec2 pointerTrail = uPointerTrail[i] * uResolution / min(uResolution.x, uResolution.y);

        float sphere = sdSphere(
                translate(p, vec3(pointerTrail, .0)),
                radius - baseRadius * fi
            );

        d = smoothMin(d, sphere, k);
    }

    float sphere = sdSphere(translate(p, vec3(1.0, -0.25, 0.0)), 0.55);
    d = smoothMin(d, sphere, k);

    return d;
}

vec3 generateNormal(vec3 p) {
    return normalize(vec3(
            map(p + vec3(EPS, 0.0, 0.0)) - map(p + vec3(-EPS, 0.0, 0.0)),
            map(p + vec3(0.0, EPS, 0.0)) - map(p + vec3(0.0, -EPS, 0.0)),
            map(p + vec3(0.0, 0.0, EPS)) - map(p + vec3(0.0, 0.0, -EPS))
        ));
}

vec3 dropletColor(vec3 normal, vec3 rayDir) {
    vec3 reflectDir = reflect(rayDir, normal);

    float noisePosTime = noise3D(reflectDir * 2.0 + uTime);
    float noiseNegTime = noise3D(reflectDir * 2.0 - uTime);

    vec3 _color0 = vec3(0.02, 0.05, 0.2) * noisePosTime; // Very Dark Blue Base
    vec3 _color1 = vec3(0.1, 0.3, 0.6) * noiseNegTime;   // Subtle Blue Highlight

    float intensity = 1.9; // Reduced intensity for less glow
    vec3 color = (_color0 + _color1) * intensity;

    return color;
}

void main() {
    vec2 p = (gl_FragCoord.xy * 2.0 - uResolution) / min(uResolution.x, uResolution.y);

    // Orthographic Camera
    vec3 ray = origin + cSide * p.x + cUp * p.y;
    vec3 rayDirection = cDir;

    float dist = 0.0;

    for (int i = 0; i < ITR; ++i) {
        dist = map(ray);
        ray += rayDirection * dist;
        if (dist < EPS) break;
    }

    vec3 color = vec3(0.0);

    // Check if we hit something (or are close enough)
    // The original code uses a simple check, here assuming background is black/transparent if no hit
    if (dist < EPS) {
        vec3 normal = generateNormal(ray);
        color = dropletColor(normal, rayDirection);
    }

    // Apply color power and output
    vec3 finalColor = pow(color, vec3(7.0));
    
    // Calculate alpha based on brightness to allow transparency
    // This ensures the black background of the shader is transparent
    float alpha = smoothstep(0.01, 0.1, length(finalColor)) * 1.0; 
    
    gl_FragColor = vec4(finalColor, alpha);
}
`;

function Droplets() {
    const meshRef = useRef<THREE.Mesh>(null);
    const { size, pointer, gl } = useThree(); // Access gl to set clear color

    const TRAIL_LENGTH = 15;

    // Set clear color to transparent so HTML background shows through
    React.useEffect(() => {
        gl.setClearColor(new THREE.Color(0x000000), 0);
    }, [gl]);

    // Initialize uniforms
    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2(size.width, size.height) },
            uPointerTrail: {
                value: Array.from({ length: TRAIL_LENGTH }, () => new THREE.Vector2(0, 0)),
            },
        }),
        []
    );

    // Maintain a local reference to the trail array for updates
    // (Three.js Uniform value shares reference, so updating this array updates the uniform)
    // Actually best to update the vector instances in existing array to avoid GC
    const trailArray = uniforms.uPointerTrail.value;

    useFrame((state) => {
        if (!meshRef.current) return;

        // Update Time
        uniforms.uTime.value = state.clock.getElapsedTime();

        // Update Resolution (Fix for DPI/Retina displays)
        // We must match gl_FragCoord which is in physical pixels
        const drawingSize = new THREE.Vector2();
        state.gl.getDrawingBufferSize(drawingSize);
        uniforms.uResolution.value.copy(drawingSize);

        // Update Pointer Trail
        // Shift values down
        for (let i = TRAIL_LENGTH - 1; i > 0; i--) {
            trailArray[i].copy(trailArray[i - 1]);
        }

        // Update head with current pointer
        // R3F pointer is normalized [-1, 1].
        // Shader expects mapped values.
        // Let's ensure the mapping aligns with the aspect ratio logic in shader.
        // Shader logic: map(vec3 p) uses pointerTrail * uResolution / min(res)
        // This implies pointerTrail should be in normalized space (-1 to 1) relative to ASPECT RATIO?
        // Actually, let's look at shader line 75:
        // vec2 pointerTrail = uPointerTrail[i] * uResolution / min(uResolution.x, uResolution.y);
        // If uPointerTrail is (-1, 1), and we multiply by aspect-corrected resolution...

        // Let's pass normalized pointer (-1 to 1) and let shader handle it?
        // Check original Pointer.ts:
        // coordsX = (x / width) * 2 - 1
        // coordsY = -(y / height) * 2 + 1
        // So original code passed Normalized Device Coords (NDC).
        // R3F state.pointer IS NDC.
        trailArray[0].set(state.pointer.x, state.pointer.y);
    });

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[2, 2]} />
            {/* Using rawShaderMaterial to match original provided code exactly */}
            <rawShaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false} // Disable depth write for background
                depthTest={false}  // Disable depth test
            />
        </mesh>
    );
}

export default function InteractiveDroplets() {
    return (
        <div className="fixed inset-0 z-0 opacity-100 pointer-events-none">
            {/* 
                We use pointer-events-none on the container so it doesn't block text selection,
                BUT we need pointer events for the canvas to track mouse movement!
                So we must allow pointer events on the canvas itself or global window.
                R3F Canvas tracks pointer on its DOM element.
                Since this is 'fixed inset-0', if we enable pointer-events-auto, we block clicks on buttons below.
                
                SOLUTION:
                We need to use a global event listener for the R3F pointer 
                OR we accept that interaction only works when hovering the background (which is everywhere).
                But we want buttons to be clickable.

                If we set `pointer-events-none` on container, R3F's default event system won't catch events on the canvas.
                We can use the `eventSource` prop on Canvas to listen to `document.body` or `window`.
            */}
            <Canvas
                dpr={[1, 1.5]}
                eventSource={typeof document !== 'undefined' ? document.body : undefined}
                eventPrefix="client"
                gl={{ alpha: true }} // Enable alpha in WebGL context
            >
                <Droplets />
            </Canvas>
        </div>
    );
}
