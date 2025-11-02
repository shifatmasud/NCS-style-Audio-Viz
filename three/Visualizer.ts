import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export interface VisualizerParams {
  bloom: number;
  pointSize: number;
  particleDensity: number;
  baseColor: string;
  hotColor: string;
  waveFrequency: number;
  waveSpeed: number;
  waveSize: number;
  displacementScale: number;
  noiseSize: number;
  shrinkScale: number;
}

const vertexShader = `
  uniform float uTime;
  uniform float uLoudness;
  uniform float uPointSize;
  uniform float uWaveFrequency;
  uniform float uWaveSpeed;
  uniform float uWaveSize;
  uniform float uNoiseSize;
  uniform vec2 uMousePos;
  uniform float uDisplacementScale;
  uniform float uShrinkScale;

  varying float vDisplacement;
  
  #define PI 3.14159265359

  // Simplex Noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  void main() {
    // Mouse interaction with fluid motion
    vec4 screenPos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vec2 screenUV = screenPos.xy / screenPos.w;
    float mouseDist = distance(screenUV, uMousePos);

    // Calculate a base influence with a smooth falloff.
    float mouseInfluence = 1.0 - smoothstep(0.0, 0.35, mouseDist);
    mouseInfluence = pow(mouseInfluence, 2.0);

    // Add fluid motion using time-varying simplex noise.
    float fluidWobble = snoise(position * 4.0 + uTime * 2.5) * 0.4;

    // Apply the push displacement, modulated by the wobble and scaled by a uniform.
    float mouseDisplacement = mouseInfluence * (0.6 + fluidWobble) * uDisplacementScale;

    // Wave-based displacement driven by loudness. It fades out as mouse influence increases.
    float noise_for_wave = snoise(position * uNoiseSize + uTime * 0.3);
    float wave = sin(dot(normalize(position), vec3(1.0, 1.0, 1.0)) * uWaveFrequency + uTime * uWaveSpeed + noise_for_wave * PI) * uWaveSize * uLoudness;
    
    float totalDisplacement = wave * (1.0 - mouseInfluence) + mouseDisplacement;
    
    // Pass intensity to fragment shader for glow effect
    vDisplacement = uLoudness + mouseDisplacement * 0.5; 

    vec3 normal = normalize(position);
    vec3 newPosition = position + normal * totalDisplacement;
    
    // Loudness-synced shrink and grow effect
    newPosition *= (1.0 - uLoudness * uShrinkScale);

    gl_PointSize = uPointSize;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform bool uIsPlaying;
  uniform vec3 uBaseColor;
  uniform vec3 uHotColor;
  
  varying float vDisplacement;

  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    float strength = 1.0 - smoothstep(0.4, 0.5, dist);
    if (strength < 0.001) discard;

    // More subtle intensity calculation for glow
    float intensity = pow(vDisplacement, 1.5) * 0.8;
    
    // Mix between base color and hot color based on intensity
    vec3 final_color = mix(uBaseColor, uHotColor, smoothstep(0.2, 0.7, intensity));
    
    float alpha = uIsPlaying ? 1.0 : smoothstep(1.5, 0.0, uTime);

    gl_FragColor = vec4(final_color * (intensity * 0.5 + 0.3), strength * alpha);
  }
`;


export class Visualizer {
    private container: HTMLElement;
    private analyser: AnalyserNode;
    private isPlaying: boolean = false;
    
    private renderer!: THREE.WebGLRenderer;
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private clock!: THREE.Clock;
    private points!: THREE.Points;
    private material!: THREE.ShaderMaterial;
    private composer!: EffectComposer;
    private bloomPass!: UnrealBloomPass;

    private freqDataArray: Uint8Array;
    
    private animationFrameId: number = 0;
    private fadeOutStartTime: number = 0;
    private currentParticleDensity: number = 60;

    constructor(container: HTMLElement, analyser: AnalyserNode) {
        this.container = container;
        this.analyser = analyser;
        this.freqDataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }

    public init() {
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.container.appendChild(this.renderer.domElement);

        // Scene & Camera
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 100);
        this.camera.position.z = 4.0;
        this.clock = new THREE.Clock();
        
        // Geometry & Material
        const geometry = new THREE.IcosahedronGeometry(1.5, this.currentParticleDensity);
        this.material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uLoudness: { value: 0 },
                uIsPlaying: { value: false },
                uPointSize: { value: 1.5 },
                uBaseColor: { value: new THREE.Color(0x1980ff) },
                uHotColor: { value: new THREE.Color(0xffffff) },
                uWaveFrequency: { value: 8.0 },
                uWaveSpeed: { value: 1.0 },
                uWaveSize: { value: 0.25 },
                uNoiseSize: { value: 2.5 },
                uMousePos: { value: new THREE.Vector2(10000, 10000) },
                uDisplacementScale: { value: 1.0 },
                uShrinkScale: { value: 0.5 },
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        this.points = new THREE.Points(geometry, this.material);
        this.scene.add(this.points);

        // Post-processing
        const renderPass = new RenderPass(this.scene, this.camera);
        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(this.container.clientWidth, this.container.clientHeight), 1.5, 0.4, 0.85);
        this.bloomPass.threshold = 0.7;
        this.bloomPass.strength = 0.35;
        this.bloomPass.radius = 0.1;

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderPass);
        this.composer.addPass(this.bloomPass);

        // Event Listeners
        window.addEventListener('resize', this.onWindowResize);
        
        // Start animation loop
        this.animate();
    }
    
    public setPlaying(isPlaying: boolean) {
        this.isPlaying = isPlaying;
    }

    public updateMousePosition(pos: { x: number; y: number }) {
        if (this.material) {
            this.material.uniforms.uMousePos.value.x = pos.x;
            this.material.uniforms.uMousePos.value.y = pos.y;
        }
    }

    public updateParams(params: VisualizerParams) {
        this.bloomPass.strength = params.bloom;
        this.material.uniforms.uPointSize.value = params.pointSize;
        this.material.uniforms.uBaseColor.value.set(params.baseColor);
        this.material.uniforms.uHotColor.value.set(params.hotColor);
        this.material.uniforms.uWaveFrequency.value = params.waveFrequency;
        this.material.uniforms.uWaveSpeed.value = params.waveSpeed;
        this.material.uniforms.uWaveSize.value = params.waveSize;
        this.material.uniforms.uDisplacementScale.value = params.displacementScale;
        this.material.uniforms.uNoiseSize.value = params.noiseSize;
        this.material.uniforms.uShrinkScale.value = params.shrinkScale;

        if (this.currentParticleDensity !== params.particleDensity) {
            this.currentParticleDensity = params.particleDensity;
            const newGeometry = new THREE.IcosahedronGeometry(1.5, Math.round(this.currentParticleDensity));
            this.points.geometry.dispose();
            this.points.geometry = newGeometry;
        }
    }

    private onWindowResize = () => {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.composer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    private animate = () => {
        this.animationFrameId = requestAnimationFrame(this.animate);
        
        this.points.rotation.y += 0.0005;
        this.points.rotation.x += 0.0002;
        
        if (this.isPlaying) {
            this.analyser.getByteFrequencyData(this.freqDataArray);
            
            const rawLoudness = this.freqDataArray.reduce((acc, val) => acc + val, 0) / (this.freqDataArray.length * 255);
            
            // Enhance the loudness value to increase dynamic range, making peaks more prominent.
            const enhancedLoudness = Math.pow(rawLoudness, 2.0) * 1.5;

            this.material.uniforms.uTime.value = this.clock.getElapsedTime();
            
            // Increase the lerp factor for a much faster, more "reactive" response to loudness changes.
            this.material.uniforms.uLoudness.value = THREE.MathUtils.lerp(
                this.material.uniforms.uLoudness.value,
                Math.min(enhancedLoudness, 1.0), // Clamp to prevent visual glitches
                0.4 // Increased from 0.1 for more reactivity
            );

            if(!this.material.uniforms.uIsPlaying.value){
                this.material.uniforms.uIsPlaying.value = true;
            }
        } else {
            const currentLoudness = this.material.uniforms.uLoudness.value;
            this.material.uniforms.uLoudness.value = THREE.MathUtils.lerp(currentLoudness, 0, 0.05);

            if(this.material.uniforms.uIsPlaying.value){
                this.fadeOutStartTime = this.clock.getElapsedTime();
                this.material.uniforms.uIsPlaying.value = false;
            }
            this.material.uniforms.uTime.value = this.clock.getElapsedTime() - this.fadeOutStartTime;
        }

        this.composer.render();
    }

    public destroy() {
        cancelAnimationFrame(this.animationFrameId);
        window.removeEventListener('resize', this.onWindowResize);
        this.points.geometry.dispose();
        this.material.dispose();
        this.renderer.dispose();
        if (this.container && this.renderer.domElement) {
           this.container.removeChild(this.renderer.domElement);
        }
    }
}