import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { CityBuilder } from './city.js';

export class SceneManager {
  constructor(canvas, perfSettings) {
    this.canvas = canvas;
    this.perfSettings = perfSettings;
    this.scene = new THREE.Scene();
    this.renderer = null;
    this.camera = null;
    this.floor = null;
    this.city = null;
    this.clock = new THREE.Clock();
    this.time = 0;
    this.ambientParticles = null;
    this.ambientVelocities = [];
  }

  init() {
    this.setupRenderer();
    this.setupCamera();
    this.setupSky();
    this.setupLights();
    this.setupCity();
    this.setupAmbientParticles();
    this.setupResize();
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: this.perfSettings.antialias,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = this.perfSettings.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(10, 6, 14);
    this.camera.lookAt(0, 1.5, 0);
  }

  setupSky() {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#3a7abd');
    grad.addColorStop(0.3, '#6ab0e8');
    grad.addColorStop(0.6, '#a0cce8');
    grad.addColorStop(0.8, '#c8d8e0');
    grad.addColorStop(1, '#d8d8d0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2, 512);
    const texture = new THREE.CanvasTexture(canvas);
    this.scene.background = texture;
    this.scene.fog = new THREE.FogExp2(0xa0cce8, 0.004);
  }

  setupLights() {
    const hemi = new THREE.HemisphereLight(0x87ceeb, 0x605040, 0.7);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffeedd, 1.2);
    sun.position.set(25, 20, 8);
    sun.castShadow = this.perfSettings.shadows;
    if (this.perfSettings.shadows) {
      sun.shadow.mapSize.width = 2048;
      sun.shadow.mapSize.height = 2048;
      sun.shadow.camera.near = 0.5;
      sun.shadow.camera.far = 60;
      sun.shadow.camera.left = -25;
      sun.shadow.camera.right = 25;
      sun.shadow.camera.top = 25;
      sun.shadow.camera.bottom = -25;
      sun.shadow.bias = -0.001;
    }
    this.scene.add(sun);

    const fill = new THREE.DirectionalLight(0x7799cc, 0.25);
    fill.position.set(-15, 8, -15);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xaaccff, 0.15);
    rim.position.set(-10, 5, 20);
    this.scene.add(rim);
  }

  setupCity() {
    this.city = new CityBuilder(this.scene);
    this.city.build();
  }

  setupAmbientParticles() {
    const count = this.perfSettings.particles ? 300 : 100;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];
    const spread = 40;
    const heightMin = 2, heightMax = 7;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * (spread / 2);
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = heightMin + Math.random() * (heightMax - heightMin);
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      velocities.push({
        x: (Math.random() - 0.5) * 0.3,
        y: 0.05 + Math.random() * 0.1,
        z: (Math.random() - 0.5) * 0.3,
      });
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xfff5d6,
      size: 0.08,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.ambientParticles = new THREE.Points(geo, mat);
    this.ambientParticles.position.y = 0;
    this.scene.add(this.ambientParticles);
    this.ambientVelocities = velocities;
  }

  setupResize() {
    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  update() {
    this.time = this.clock.getElapsedTime();
    this.updateAmbientParticles();
  }

  updateAmbientParticles() {
    if (!this.ambientParticles) return;
    const pos = this.ambientParticles.geometry.attributes.position;
    const delta = this.clock.getDelta();
    const bound = 25;
    const vel = this.ambientVelocities;
    for (let i = 0; i < pos.count; i++) {
      pos.array[i * 3] += vel[i].x * delta;
      pos.array[i * 3 + 1] += vel[i].y * delta;
      pos.array[i * 3 + 2] += vel[i].z * delta;
      if (pos.array[i * 3 + 1] > 8) pos.array[i * 3 + 1] = 2;
      if (pos.array[i * 3] > bound) pos.array[i * 3] = -bound;
      if (pos.array[i * 3] < -bound) pos.array[i * 3] = bound;
      if (pos.array[i * 3 + 2] > bound) pos.array[i * 3 + 2] = -bound;
      if (pos.array[i * 3 + 2] < -bound) pos.array[i * 3 + 2] = bound;
    }
    pos.needsUpdate = true;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  setCameraPosition(pos, target) {
    if (pos) this.camera.position.copy(pos);
    if (target) this.camera.lookAt(target);
  }

  getCamera() { return this.camera; }
  getScene() { return this.scene; }
  getRenderer() { return this.renderer; }
  getColliders() { return this.city ? this.city.getColliders() : []; }
  updateFountain(time) { if (this.city && this.city.update) this.city.update(time); }

  dispose() {
    if (this.city) this.city.dispose();
    if (this.ambientParticles) {
      this.ambientParticles.geometry.dispose();
      this.ambientParticles.material.dispose();
      this.scene.remove(this.ambientParticles);
    }
    this.renderer.dispose();
    this.scene.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
  }
}