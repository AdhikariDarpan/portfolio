import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { CONFIG } from './config.js';
import { performanceDetector } from './modules/performance.js';
import { SceneManager } from './modules/scene.js';
import { AvatarManager } from './modules/avatar.js';
import { PanelManager } from './modules/panels.js';
import { DialogueManager } from './modules/dialogue.js';
import { CinematicCamera } from './modules/cinematic.js';
import { InteractionManager } from './modules/interaction.js';

class Portfolio3D {
  constructor() {
    this.canvas = document.getElementById('c3d');
    this.loader = document.getElementById('loader');
    this.loaderText = document.getElementById('lpct');
    this.hint = document.getElementById('hint');
    this.loader = document.getElementById('loader');
    this.loaderText = document.querySelector('.loader-pct');
    this.navDots = document.getElementById('nav-dots');

    this.sceneManager = null;
    this.avatarManager = null;
    this.panelManager = null;
    this.dialogueManager = null;
    this.cinematicCamera = null;
    this.interactionManager = null;
    this.labelRenderer = null;

    this.clock = new THREE.Clock();
    this.isLoaded = false;
    this.loadProgress = 0;
    this.freeRoamEnabled = false;
    this.cameraMode = 'orbit';
  }

  async init() {
    try {
      this.showLoader();
      await this.detectPerformance();
      this.setupLabelRenderer();
      await this.setupScene();
      await this.setupAvatar();
      this.avatarManager.setPosition(new THREE.Vector3(0, 0, 5));
      if (this.sceneManager.getColliders()) {
        this.avatarManager.setColliders(this.sceneManager.getColliders());
      }
      this.setupPanels();
      this.setupDialogue();
      this.setupCinematic();
      this.setupInteraction();
      this.setupUI();
      this.enableFreeRoam();
      this.hideLoader(() => this.startIntroFlythrough());
      this.startRenderLoop();
      this.startWelcomeSequence();
    } catch (e) {
      console.error('[Init] Failed:', e);
      document.getElementById('loader').innerHTML = `<div class="loader-text" style="color:#f472b6">${e.message}</div>`;
    }
  }

  async detectPerformance() {
    const tier = await performanceDetector.detect();
    this.perfSettings = performanceDetector.getSettings();
    this.perfSettings.isMobile = /Mobi|Android/i.test(navigator.userAgent);
    console.log('[Init] Performance tier:', tier, this.perfSettings);
  }

  setupLabelRenderer() {
    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0';
    this.labelRenderer.domElement.style.pointerEvents = 'none';
    this.labelRenderer.domElement.style.zIndex = '100';
    document.body.appendChild(this.labelRenderer.domElement);

    window.addEventListener('resize', () => {
      this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  async setupScene() {
    this.sceneManager = new SceneManager(this.canvas, this.perfSettings);
    this.sceneManager.init();
  }

  async setupAvatar() {
    this.avatarManager = new AvatarManager(this.sceneManager.getScene(), this.sceneManager.getCamera());
    await this.avatarManager.load(CONFIG.avatar.glbUrl);
  }

  setupPanels() {
    this.panelManager = new PanelManager(this.sceneManager.getScene(), this.sceneManager.getCamera(), this.sceneManager.getRenderer());
    this.panelManager.init(this.labelRenderer, (key) => this.onPanelClick(key));
  }

  setupDialogue() {
    this.dialogueManager = new DialogueManager();
    this.dialogueManager.init(
      () => { this.isDialogueActive = true; },
      () => { this.isDialogueActive = false; }
    );
  }

  setupCinematic() {
    this.cinematicCamera = new CinematicCamera(this.sceneManager.getCamera());
  }

  setupInteraction() {
    this.interactionManager = new InteractionManager(
      this.sceneManager.getCamera(),
      this.sceneManager.getRenderer(),
      this.sceneManager.getScene(),
      this.avatarManager,
      this.panelManager,
      this.dialogueManager,
      this.cinematicCamera,
      this.perfSettings,
      this.sceneManager.city
    );
    this.interactionManager.init();
  }

  setupUI() {
    this.navDots.querySelectorAll('.nav-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const target = dot.dataset.target;
        this.navigateToPanel(target);
      });
    });

    document.getElementById('modal-close').addEventListener('click', () => {
      document.getElementById('proj-modal').classList.remove('active');
      document.body.style.overflow = '';
    });

    document.getElementById('proj-modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        e.currentTarget.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    this.setupCameraToggle();
  }

  setupCameraToggle() {
    const toggle = document.getElementById('cam-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      const newMode = this.cameraMode === 'orbit' ? 'shoulder' : 'orbit';
      this.cameraMode = newMode;
      toggle.classList.toggle('shoulder', newMode === 'shoulder');
      if (this.interactionManager) {
        this.interactionManager.setCameraMode(newMode);
      }
    });
  }

  onPanelClick(key) {
    this.highlightNavDot(key);
  }

  navigateToPanel(target) {
    const map = {
      hero: null,
      about: 'about',
      skills: 'skills',
      projects: 'projects',
      contact: 'contact',
    };
    const key = map[target];
    const districtPositions = {
      about: new THREE.Vector3(-4, 0, -18),
      skills: new THREE.Vector3(-18, 0, -2),
      projects: new THREE.Vector3(0, 0, 16),
      contact: new THREE.Vector3(18, 0, 0),
    };

    if (key) {
      this.panelManager.openPanelContent(key);
      this.highlightNavDot(key);
      const pos = districtPositions[key];
      if (pos && this.avatarManager && this.interactionManager) {
        this.avatarManager.walkTo(pos);
        this.interactionManager.controls.target.copy(pos.clone().setY(1.5));
      }
    } else {
      // Hero — return to center
      this.panelManager.closePanelContent();
      this.highlightNavDot(null);
      if (this.avatarManager) {
        this.avatarManager.walkTo(new THREE.Vector3(0, 0, 0));
      }
      if (this.interactionManager) {
        this.interactionManager.controls.target.set(0, 1.5, 0);
      }
    }
  }

  highlightNavDot(key) {
    this.navDots.querySelectorAll('.nav-dot').forEach(dot => {
      const match = key ? dot.dataset.target === key : dot.dataset.target === 'hero';
      dot.classList.toggle('active', match);
    });
  }

  enableFreeRoam() {
    this.freeRoamEnabled = true;
    this.interactionManager.setFreeRoam(true);
    this.avatarManager.startProceduralIdle();

    const hint = document.getElementById('hint');
    if (hint) {
      hint.querySelector('span').textContent = 'Click billboards to read · Arrow keys to walk · WASD to strafe';
      setTimeout(() => hint.classList.add('visible'), 500);
      setTimeout(() => hint.classList.remove('visible'), 8000);
    }
  }

  startWelcomeSequence() {
    setTimeout(() => {
      this.dialogueManager.sayWelcome();
    }, 1500);

    this.dialogueManager.onDialogueEnd = () => {
      this.isDialogueActive = false;
    };
  }

  showLoader() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      this.loaderText.textContent = Math.floor(progress) + '%';
    }, 100);
  }

  hideLoader(callback) {
    setTimeout(() => {
      this.loader.classList.add('out');
      this.isLoaded = true;
      if (callback) callback();
    }, 500);
  }

  startIntroFlythrough() {
    const cam = this.sceneManager.getCamera();
    cam.position.set(12, 18, 22);
    cam.lookAt(0, 0, 0);

    this.cinematicCamera.transitionTo(
      new THREE.Vector3(10, 6, 14),
      new THREE.Vector3(0, 1.5, 0),
      3.5
    );
  }

  startRenderLoop() {
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = this.clock.getDelta();
      this.update(delta);
      this.render();
    };
    animate();
  }

  update(delta) {
    if (!this.isLoaded) return;

    const time = this.clock.getElapsedTime();

    this.sceneManager.update();
    this.sceneManager.updateFountain(time);
    this.avatarManager.update(delta, time);
    this.panelManager.update(delta);
    this.dialogueManager.update(delta, time);
    this.interactionManager.update(delta);
  }

  render() {
    this.sceneManager.render();
    this.labelRenderer.render(this.sceneManager.getScene(), this.sceneManager.getCamera());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new Portfolio3D();
  app.init();
});