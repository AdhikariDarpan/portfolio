import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CONFIG } from '../config.js';
import { PROJECTS } from '../data.js';

export class InteractionManager {
  constructor(camera, renderer, scene, avatar, panels, dialogue, cinematic, perfSettings, cityBuilder) {
    this.camera = camera;
    this.renderer = renderer;
    this.scene = scene;
    this.avatar = avatar;
    this.panels = panels;
    this.dialogue = dialogue;
    this.cinematic = cinematic;
    this.perfSettings = perfSettings;
    this.cityBuilder = cityBuilder;

    this.controls = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.keys = {};
    this.isPointerLocked = false;
    this.useFirstPerson = false;
    this.lastPanelClick = 0;
    this.idleTimer = 0;
    this.lastInteraction = Date.now();
    this.freeRoam = false;
    this.isDragging = false;
    this.joystickActive = null;
    this.joystickCenter = { x: 0, y: 0 };
    this.joystickVector = { x: 0, y: 0 };
    this.cameraMode = 'orbit';
    this.shoulderSmoothPos = new THREE.Vector3();

    this.touchStartPos = null;
    this.touchStartTime = 0;
    this.touchHoldTimer = null;

    this.kioskPosition = new THREE.Vector3(0, 0, 20);
    this.kioskProximityRange = 7;
    this.isNearKiosk = false;
    this.kioskBrowsingMode = false;

    this.lookTouchStart = null;
    this.headIdleTimer = 0;
  }

  init() {
    this.setupControls();
    this.setupEvents();
    this.setupPointerLock();
    this.setupJoystick();
    this.setupTouchGesture();
    this.setupLookControl();
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableRotate = true;
    this.controls.rotateSpeed = 0.8;
    this.controls.minDistance = CONFIG.movement.orbitMinDist;
    this.controls.maxDistance = CONFIG.movement.orbitMaxDist;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
    this.controls.minPolarAngle = 0.1;
    this.controls.enablePan = true;
    this.controls.panSpeed = 0.5;
    this.controls.target.set(0, 1.5, 0);
    this.camera.position.set(8, 5, 14);
  }

  setupEvents() {
    this.renderer.domElement.addEventListener('click', (e) => this.onClick(e));
    this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.renderer.domElement.addEventListener('mousedown', () => { this.isDragging = false; });
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
    window.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
  }

  setupPointerLock() {
    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.renderer.domElement;
      if (this.isPointerLocked) {
        this.controls.enabled = false;
      } else {
        this.controls.enabled = true;
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked) {
        this.handlePointerLockMove(e);
      }
    });
  }

  setupJoystick() {
    this.joystickEl = document.getElementById('joystick');
    if (!this.joystickEl) return;
    this.joystickKnob = this.joystickEl.querySelector('.joystick-knob');

    const onTouch = (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      this.lastInteraction = Date.now();

      const rect = this.joystickEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const maxR = rect.width / 2 - 12;

      let dx = touch.clientX - cx;
      let dy = touch.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > maxR) {
        dx = (dx / dist) * maxR;
        dy = (dy / dist) * maxR;
      }

      this.joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;
      this.joystickVector.x = dx / maxR;
      this.joystickVector.y = -dy / maxR;
    };

    const endTouch = () => {
      this.joystickKnob.style.transform = 'translate(0, 0)';
      this.joystickVector.x = 0;
      this.joystickVector.y = 0;
    };

    this.joystickEl.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.joystickActive = true;
      onTouch(e);
    }, { passive: false });

    this.joystickEl.addEventListener('touchmove', (e) => {
      e.preventDefault();
      onTouch(e);
    }, { passive: false });

    this.joystickEl.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.joystickActive = false;
      endTouch();
    }, { passive: false });

    this.joystickEl.addEventListener('touchcancel', () => {
      this.joystickActive = false;
      endTouch();
    });
  }

  setupTouchGesture() {
    const canvas = this.renderer.domElement;
    const holdMs = 800;
    const moveThreshold = 20;

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      this.touchStartPos = { x: t.clientX, y: t.clientY };
      this.touchStartTime = Date.now();
      this.touchHoldTimer = setTimeout(() => {
        if (this.avatar && this.avatar.wave && this.freeRoam) {
          this.avatar.wave();
        }
        this.touchHoldTimer = null;
      }, holdMs);
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (!this.touchStartPos || e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - this.touchStartPos.x;
      const dy = t.clientY - this.touchStartPos.y;
      if (Math.sqrt(dx * dx + dy * dy) > moveThreshold) {
        if (this.touchHoldTimer) {
          clearTimeout(this.touchHoldTimer);
          this.touchHoldTimer = null;
        }
      }
    }, { passive: true });

    canvas.addEventListener('touchend', () => {
      if (this.touchHoldTimer) {
        clearTimeout(this.touchHoldTimer);
        this.touchHoldTimer = null;
      }
      this.touchStartPos = null;
    });

    canvas.addEventListener('touchcancel', () => {
      if (this.touchHoldTimer) {
        clearTimeout(this.touchHoldTimer);
        this.touchHoldTimer = null;
      }
      this.touchStartPos = null;
    });
  }

  setupLookControl() {
    const lookBtn = document.getElementById('look-btn');
    if (!lookBtn) return;

    const onStart = (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      this.lookTouchStart = { x: touch.clientX, y: touch.clientY };
      this.lastInteraction = Date.now();
      e.preventDefault();
    };

    const onMove = (e) => {
      if (!this.lookTouchStart) return;
      const touch = e.touches[0];
      if (!touch) return;
      this.lastInteraction = Date.now();

      const dx = touch.clientX - this.lookTouchStart.x;
      const dy = touch.clientY - this.lookTouchStart.y;
      this.lookTouchStart = { x: touch.clientX, y: touch.clientY };

      const sens = 0.005;

      if (this.cameraMode === 'orbit') {
        this.controls.azimuthalAngle -= dx * sens;
        this.controls.polarAngle = Math.max(0.1, Math.min(Math.PI - 0.1, this.controls.polarAngle + dy * sens));
      } else if (this.avatar) {
        this.avatar.rotateYaw(-dx * sens * 2);
      }

      this.headIdleTimer = 0;
      this.updateHeadFollow();
      e.preventDefault();
    };

    const onEnd = () => {
      this.lookTouchStart = null;
    };

    lookBtn.addEventListener('touchstart', onStart, { passive: false });
    lookBtn.addEventListener('touchmove', onMove, { passive: false });
    lookBtn.addEventListener('touchend', onEnd);
    lookBtn.addEventListener('touchcancel', onEnd);
  }

  updateHeadFollow() {
    if (!this.avatar) return;
    const avatarPos = this.avatar.getPosition();
    const camPos = this.camera.position;
    const dirToCam = new THREE.Vector3().subVectors(camPos, avatarPos);
    dirToCam.y = 0;
    const distToCam = dirToCam.length();
    if (distToCam < 0.01) return;
    dirToCam.divideScalar(distToCam);

    const facing = this.avatar.getFacingDirection();
    const yaw = Math.atan2(
      dirToCam.x * facing.z - dirToCam.z * facing.x,
      dirToCam.x * facing.x + dirToCam.z * facing.z
    );

    const direct = new THREE.Vector3().subVectors(camPos, avatarPos).normalize();
    const pitch = -Math.asin(Math.max(-1, Math.min(1, direct.y)));

    this.avatar.setHeadLook(yaw, pitch);
  }

  handleJoystickMovement() {
    if (!this.freeRoam || !this.joystickActive) return;
    const jv = this.joystickVector;

    if (Math.abs(jv.x) < 0.05 && Math.abs(jv.y) < 0.05) {
      this.avatar.setFreeRoamDirection(new THREE.Vector3());
      return;
    }

    // Camera-relative movement (same as WASD convention)
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
    right.y = 0;
    right.normalize();

    const dir = new THREE.Vector3()
      .addScaledVector(forward, jv.y)
      .addScaledVector(right, jv.x * 0.6);
    this.avatar.setFreeRoamDirection(dir.length() > 0.01 ? dir : new THREE.Vector3());

    const avatarPos = this.avatar.getPosition();
    this.controls.target.copy(avatarPos.clone().setY(1.5));
  }

  handlePointerLockMove(e) {
    const sensitivity = 0.002;
    const yaw = new THREE.Object3D();
    yaw.rotation.y = -e.movementX * sensitivity;
    const pitch = new THREE.Object3D();
    pitch.rotation.x = -e.movementY * sensitivity;

    const quat = new THREE.Quaternion();
    quat.multiplyQuaternions(yaw.quaternion, pitch.quaternion);
    this.camera.quaternion.premultiply(quat);
  }

  onClick(e) {
    if (this.isPointerLocked) return;
    if (this.isDragging) return;

    this.lastInteraction = Date.now();
    const rect = this.renderer.domElement.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const panelKey = this.panels.handleClick(clientX, clientY);
    if (panelKey) {
      this.handlePanelClick(panelKey);
      return;
    }

    this.handleWorldClick(clientX, clientY);
  }

  onMouseMove(e) {
    if (e.buttons > 0) this.isDragging = true;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  onKeyDown(e) {
    this.keys[e.code] = true;

    // Kiosk browsing mode: left/right to navigate, escape to exit
    if (this.kioskBrowsingMode && this.cityBuilder) {
      if (e.code === 'ArrowLeft') {
        const total = this.cityBuilder.getProjectCount();
        const cur = this.cityBuilder.getKioskProjectIndex();
        this.cityBuilder.showKioskProject((cur - 1 + total) % total);
        e.preventDefault();
        return;
      }
      if (e.code === 'ArrowRight') {
        const total = this.cityBuilder.getProjectCount();
        const cur = this.cityBuilder.getKioskProjectIndex();
        this.cityBuilder.showKioskProject((cur + 1) % total);
        e.preventDefault();
        return;
      }
      if (e.code === 'Escape') {
        this.exitKioskBrowsingMode();
        e.preventDefault();
        return;
      }
    }

    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
      e.preventDefault();
    }

    if (e.code === 'Escape') {
      if (this.isPointerLocked) {
        document.exitPointerLock();
      }
      this.panels.closePanelContent();
    }
  }

  onKeyUp(e) {
    this.keys[e.code] = false;
  }

  onWheel(e) {
    if (this.panels.openPanel) {
      e.preventDefault();
    }
  }

  handlePanelClick(key) {
    const now = Date.now();
    if (now - this.lastPanelClick < 500) return;
    this.lastPanelClick = now;

    this.panels.openPanelContent(key);
    this.playDialogueForPanel(key);
  }

  playDialogueForPanel(key) {
    switch (key) {
      case 'about': this.dialogue.sayAbout(); break;
      case 'skills': this.dialogue.saySkills(); break;
      case 'projects': this.dialogue.sayProjects(); break;
      case 'contact': this.dialogue.sayContact(); break;
    }
  }

  handleWorldClick(clientX, clientY) {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Check kiosk hit (when near)
    if (this.isNearKiosk) {
      const kioskGroup = this.scene.getObjectByName('kiosk');
      if (kioskGroup) {
        const kioskMeshes = [];
        kioskGroup.traverse(m => { if (m.isMesh) kioskMeshes.push(m); });
        const kioskHits = this.raycaster.intersectObjects(kioskMeshes);
        if (kioskHits.length > 0) {
          const hit = kioskHits[0];

          if (!this.kioskBrowsingMode) {
            this.kioskBrowsingMode = true;
            if (this.cityBuilder) this.cityBuilder.showKioskProject(0);
            this.updateKioskHint();
            return;
          }

          // Browsing mode — check UV for arrow regions
          if (hit.uv && hit.object.name === 'kiosk-screen') {
            const ux = hit.uv.x;
            if (ux < 0.15) {
              const total = this.cityBuilder ? this.cityBuilder.getProjectCount() : PROJECTS.length;
              const cur = this.cityBuilder ? this.cityBuilder.getKioskProjectIndex() : 0;
              if (this.cityBuilder) this.cityBuilder.showKioskProject((cur - 1 + total) % total);
              return;
            }
            if (ux > 0.85) {
              const total = this.cityBuilder ? this.cityBuilder.getProjectCount() : PROJECTS.length;
              const cur = this.cityBuilder ? this.cityBuilder.getKioskProjectIndex() : 0;
              if (this.cityBuilder) this.cityBuilder.showKioskProject((cur + 1) % total);
              return;
            }
          }

          // Center region — open panel overlay
          this.exitKioskBrowsingMode();
          this.handlePanelClick('projects');
          this.playDialogueForPanel('projects');
          return;
        }
      }
    }

    // Clicked outside kiosk while browsing → exit browsing mode
    if (this.kioskBrowsingMode) {
      this.exitKioskBrowsingMode();
    }

    // Check building hits
    const buildingMeshes = [];
    this.scene.children.forEach(child => {
      if (child.name === 'building' || (child.userData && child.userData.type === 'building')) {
        child.traverse(mesh => {
          if (mesh.isMesh) buildingMeshes.push(mesh);
        });
      }
    });

    const buildingHits = this.raycaster.intersectObjects(buildingMeshes);
    if (buildingHits.length > 0) {
      const hit = buildingHits[0];
      // Walk up to find the group with userData.label
      let group = hit.object;
      while (group && !group.userData?.label) {
        group = group.parent;
      }
      if (!group) return;

      const label = group.userData.label || '';
      const labelLower = label.toLowerCase();
      let panelKey = 'about';
      if (labelLower.includes('frontend') || labelLower.includes('backend') || labelLower.includes('cloud') || labelLower.includes('tools') || labelLower.includes('skill')) {
        panelKey = 'skills';
      } else if (labelLower.includes('contact') || labelLower.includes('available') || labelLower.includes('connect')) {
        panelKey = 'contact';
      } else if (labelLower.includes('project') || labelLower.includes('📁') || PROJECTS.some(p => labelLower.includes(p.name.toLowerCase()))) {
        panelKey = 'projects';
      }

      // Walk avatar to a spot in front of the billboard
      const billPos = new THREE.Vector3();
      group.getWorldPosition(billPos);
      const frontDir = new THREE.Vector3(0, 0, 1).applyQuaternion(group.quaternion);
      frontDir.y = 0;
      frontDir.normalize();
      const walkTarget = billPos.clone().add(frontDir.clone().multiplyScalar(4));
      walkTarget.y = 0;
      this.avatar.walkTo(walkTarget);

      // Zoom camera to face the billboard clearly (orbit mode only)
      if (this.cameraMode !== 'shoulder') {
        const billCenter = billPos.clone().setY(1.8);
        this.cinematic.transitionTo(
          billPos.clone().add(new THREE.Vector3(frontDir.x * 4, 2.5, frontDir.z * 4)),
          billCenter,
          1.0
        );
        this.controls.target.copy(billCenter);
      }

      // Open panel content so user can read
      this.handlePanelClick(panelKey);
      return;
    }

    // Walk to clicked ground point
    const floorIntersects = this.raycaster.intersectObject(this.scene.getObjectByName('floor'));
    if (floorIntersects.length > 0) {
      const point = floorIntersects[0].point;
      if (this.freeRoam) {
        this.avatar.walkTo(point);
      } else {
        this.controls.target.lerp(point.setY(1.5), 0.1);
      }
    }
  }

  setCameraMode(mode) {
    this.cameraMode = mode;
    if (mode === 'shoulder') {
      this.controls.enabled = false;
      this.useFirstPerson = false;
      if (this.isPointerLocked) document.exitPointerLock();
      this.shoulderSmoothPos.copy(this.camera.position);
      if (this.cinematic) this.cinematic.cancel();
    } else {
      this.controls.enabled = !this.isPointerLocked;
      if (this.avatar && this.avatar.getPosition) {
        const pos = this.avatar.getPosition();
        this.controls.target.set(pos.x, Math.max(pos.y + 1.5, 1.5), pos.z);
      } else {
        this.controls.target.set(0, 1.5, 0);
      }
    }
  }

  updateShoulderCamera(delta) {
    if (!this.avatar || !this.avatar.getPosition) return;

    const avatarPos = this.avatar.getPosition();
    const facing = this.avatar.getFacingDirection();
    const behind = facing.clone().negate().multiplyScalar(CONFIG.movement.shoulderOffsetBack);
    const targetPos = new THREE.Vector3(
      avatarPos.x + behind.x,
      avatarPos.y + CONFIG.movement.shoulderOffsetUp,
      avatarPos.z + behind.z
    );

    this.shoulderSmoothPos.lerp(targetPos, Math.min(1, delta * 5));
    this.camera.position.copy(this.shoulderSmoothPos);
    this.camera.position.y = Math.max(this.camera.position.y, 1.5);

    const lookTarget = new THREE.Vector3(
      avatarPos.x,
      avatarPos.y + 1.8,
      avatarPos.z
    );
    this.camera.lookAt(lookTarget);

    this.controls.target.lerp(lookTarget, delta * 3);
  }

  update(delta) {
    if (this.cameraMode === 'shoulder') {
      this.updateShoulderCamera(delta);
      if (this.cinematic.isTransitioning) {
        this.cinematic.update(delta);
      }
    } else {
      if (this.cinematic.isTransitioning) {
        this.cinematic.update(delta);
        this.controls.enabled = false;
      } else {
        this.controls.enabled = !this.isPointerLocked;
      }
    }

    if (this.freeRoam && !this.cinematic.isTransitioning && !this.panels.openPanel && !this.dialogue.isSpeaking) {
      this.handleFreeRoamMovement(delta);
      this.handleJoystickMovement();
    } else if (this.useFirstPerson && this.isPointerLocked && !this.cinematic.isTransitioning) {
      this.handleFirstPersonMovement(delta);
    }

    this.controls.update();

    this.updateKioskProximity(delta);

    // Head follows camera in orbit mode, recovers after 2s idle
    if (this.cameraMode === 'orbit' && this.avatar && !this.lookTouchStart) {
      this.headIdleTimer += delta;
      if (this.headIdleTimer < 2) {
        this.updateHeadFollow();
      } else if (this.headIdleTimer > 2.5) {
        this.avatar.clearHeadLook();
      }
    }

    this.idleTimer += delta;
    if (this.idleTimer > 15 && !this.panels.openPanel && !this.dialogue.isSpeaking) {
      this.dialogue.sayIdle();
      this.idleTimer = 0;
    }
  }

  handleFreeRoamMovement(delta) {
    const rotateSpeed = CONFIG.movement.rotateSpeed;
    const useArrows = this.keys['ArrowUp'] || this.keys['ArrowDown'] || this.keys['ArrowLeft'] || this.keys['ArrowRight'];
    const useWASD = this.keys['KeyW'] || this.keys['KeyS'] || this.keys['KeyA'] || this.keys['KeyD'];

    const moveDir = new THREE.Vector3();

    if (useArrows) {
      if (this.keys['ArrowLeft']) this.avatar.rotateYaw(rotateSpeed * delta);
      if (this.keys['ArrowRight']) this.avatar.rotateYaw(-rotateSpeed * delta);
      if (this.keys['ArrowUp']) {
        const fwd = this.avatar.getFacingDirection();
        moveDir.add(fwd);
      }
      if (this.keys['ArrowDown']) {
        const fwd = this.avatar.getFacingDirection();
        moveDir.sub(fwd);
      }
    } else if (useWASD) {
      const wasd = new THREE.Vector3();
      if (this.keys['KeyW']) wasd.z -= 1;
      if (this.keys['KeyS']) wasd.z += 1;
      if (this.keys['KeyA']) wasd.x -= 1;
      if (this.keys['KeyD']) wasd.x += 1;

      wasd.normalize();
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
      forward.y = 0;
      forward.normalize();
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
      right.y = 0;
      right.normalize();
      moveDir.addScaledVector(forward, -wasd.z);
      moveDir.addScaledVector(right, wasd.x);
    }

    this.avatar.setFreeRoamDirection(moveDir.length() > 0.01 ? moveDir : new THREE.Vector3());

    const avatarPos = this.avatar.getPosition();
    this.controls.target.copy(avatarPos.clone().setY(1.5));
    if (this.cameraMode !== 'shoulder') {
      this.controls.enabled = true;
      this.controls.minDistance = CONFIG.movement.orbitMinDistFree;
      this.controls.maxDistance = CONFIG.movement.orbitMaxDistFree;
    }
  }

  setFreeRoam(enabled) {
    this.freeRoam = enabled;
    this.avatar.setFreeRoam(enabled);
    if (enabled) {
      this.useFirstPerson = false;
      if (this.isPointerLocked) document.exitPointerLock();
      if (this.cameraMode !== 'shoulder') {
        this.controls.enabled = true;
        this.controls.minDistance = CONFIG.movement.orbitMinDistFree;
        this.controls.maxDistance = CONFIG.movement.orbitMaxDistFree;
        this.controls.target.set(0, 1.5, 0);
        this.camera.position.set(5, 3.5, 8);
        this.camera.lookAt(0, 1.5, 0);
      }
    }
  }

  handleFirstPersonMovement(delta) {
    const direction = new THREE.Vector3();
    const speed = CONFIG.movement.firstPersonSpeed * delta;
    const bound = CONFIG.movement.firstPersonBounds;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) direction.z -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) direction.z += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) direction.x -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) direction.x += 1;

    if (direction.length() > 0) {
      direction.normalize();
      direction.applyQuaternion(this.camera.quaternion);
      direction.y = 0;

      const newPos = this.camera.position.clone().addScaledVector(direction, speed);
      if (this.avatar && this.avatar.checkCollision) {
        this.avatar.checkCollision(newPos);
      }
      newPos.y = 1.6;
      newPos.x = THREE.MathUtils.clamp(newPos.x, -bound, bound);
      newPos.z = THREE.MathUtils.clamp(newPos.z, -bound, bound);

      this.camera.position.copy(newPos);
      this.controls.target.copy(newPos).add(new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion));
    }
  }

  updateKioskProximity(delta) {
    if (!this.avatar || !this.avatar.getPosition || this.panels.openPanel) {
      if (this.kioskBrowsingMode) this.exitKioskBrowsingMode();
      if (this.isNearKiosk) {
        this.isNearKiosk = false;
        this.hideKioskHint();
      }
      return;
    }

    const avatarPos = this.avatar.getPosition();
    const dist = avatarPos.distanceTo(this.kioskPosition);
    const wasNear = this.isNearKiosk;
    this.isNearKiosk = dist < this.kioskProximityRange;

    // Exit browsing mode if walked away
    if (this.kioskBrowsingMode && !this.isNearKiosk) {
      this.exitKioskBrowsingMode();
    }

    if (this.isNearKiosk) {
      this.updateKioskHint();
    } else if (!this.isNearKiosk && wasNear) {
      this.hideKioskHint();
    }
  }

  showKioskHint() {
    this.updateKioskHint();
  }

  hideKioskHint() {
    const hint = document.getElementById('hint');
    if (hint && this._kioskHintVisible) {
      hint.classList.remove('visible');
      this._kioskHintVisible = false;
    }
  }

  updateKioskHint() {
    const hint = document.getElementById('hint');
    if (!hint) return;
    const span = hint.querySelector('span');
    if (this.kioskBrowsingMode) {
      span.textContent = '◀ ▶ Click arrows to browse  ·  Center for details  ·  Click outside to exit';
      hint.classList.add('visible');
      this._kioskHintVisible = true;
    } else if (this.isNearKiosk) {
      span.textContent = 'Click the kiosk screen to browse projects';
      hint.classList.add('visible');
      this._kioskHintVisible = true;
    } else {
      hint.classList.remove('visible');
      this._kioskHintVisible = false;
    }
  }

  exitKioskBrowsingMode() {
    if (!this.kioskBrowsingMode) return;
    this.kioskBrowsingMode = false;
    if (this.cityBuilder) this.cityBuilder.showKioskWelcome();
    this.updateKioskHint();
  }

  setFirstPerson(enabled) {
    this.useFirstPerson = enabled;
    if (enabled) {
      this.renderer.domElement.requestPointerLock();
    } else if (this.isPointerLocked) {
      document.exitPointerLock();
    }
  }

  dispose() {
    this.controls.dispose();
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('wheel', this.onWheel);
    document.removeEventListener('pointerlockchange', this.handlePointerLockMove);
  }
}