import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const vertexShader = `
  uniform float uTime;
  uniform float uLoudness;
  uniform sampler2D uFreqTexture;

  varying float vDisplacement;
  
  #define PI 3.14159265359

  // Simplex Noise (base for FBM)
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

  // Fractional Brownian Motion
  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 4; i++) {
        value += amplitude * snoise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
  }
  
  float hash31(vec3 p) {
      p = fract(p * vec3(443.897, 441.423, 437.195));
      p += dot(p, p.yzx + 19.19);
      return fract((p.x + p.y) * p.z);
  }


  void main() {
    float random_coord = hash31(position);
    float freq = texture2D(uFreqTexture, vec2(random_coord, 0.0)).r;
    float fluid_distortion = fbm(position * 1.5 + uTime * 0.1) * 0.2 * uLoudness;
    float displacement = freq * 0.4 + fluid_distortion;
    vDisplacement = freq;
    vec3 normal = normalize(position);
    vec3 newPosition = position + normal * displacement;
    gl_PointSize = (vDisplacement * 3.0 + 1.5);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform bool uIsPlaying;
  
  varying float vDisplacement;

  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    float strength = 1.0 - smoothstep(0.4, 0.5, dist);
    if (strength < 0.001) discard;

    vec3 baseColor = vec3(0.15, 0.6, 1.0);
    float intensity = pow(vDisplacement, 2.0) * 1.5;
    vec3 final_color = baseColor * intensity + baseColor * 0.2;
    float alpha = uIsPlaying ? 1.0 : smoothstep(1.5, 0.0, uTime);

    gl_FragColor = vec4(final_color, strength * alpha);
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
    private freqTexture: THREE.DataTexture;

    private animationFrameId: number = 0;
    private fadeOutStartTime: number = 0;

    constructor(container: HTMLElement, analyser: AnalyserNode) {
        this.container = container;
        this.analyser = analyser;
        this.freqDataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.freqTexture = new THREE.DataTexture(this.freqDataArray, this.analyser.frequencyBinCount, 1, THREE.RedFormat, THREE.UnsignedByteType);
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
        const geometry = new THREE.IcosahedronGeometry(1.5, 60);
        this.material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uLoudness: { value: 0 },
                uFreqTexture: { value: this.freqTexture },
                uIsPlaying: { value: false },
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

    public updateParams(params: { bloom: number }) {
        this.bloomPass.strength = params.bloom;
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
            this.freqTexture.needsUpdate = true;
            
            const loudness = this.freqDataArray.reduce((acc, val) => acc + val, 0) / (this.freqDataArray.length * 255);
            
            this.material.uniforms.uTime.value = this.clock.getElapsedTime();
            this.material.uniforms.uLoudness.value = THREE.MathUtils.lerp(this.material.uniforms.uLoudness.value, loudness, 0.1);
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
