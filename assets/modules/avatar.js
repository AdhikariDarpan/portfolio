import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CONFIG } from '../config.js';

export class AvatarManager {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.avatar = null;
    this.mixer = null;
    this.animations = {};
    this.currentAction = null;
    this.isLoaded = false;
    this.targetPosition = new THREE.Vector3(0, 0, 0);
    this.currentPosition = new THREE.Vector3(0, 0, 0);
    this.headBone = null;
    this.rightArmBone = null;
    this.lookAtTarget = null;
    this.headLookOverride = null;
    this.idleActions = [];
    this.lastBlink = 0;
    this.freeRoamMove = null;
    this.freeRoam = false;
    this.freeRoamInput = null;
    this.currentSpeed = 0;
    this.colliders = [];

    this.MOVEMENT_STATE = Object.freeze({ IDLE: 0, NAVIGATING: 1, FREE_ROAM: 2 });
    this.movementState = this.MOVEMENT_STATE.IDLE;
    this.walkBobTime = 0;

    this.isGestureActive = false;
    this.gestureQueue = [];
    this.isLoadingGLB = false;

    this.useGLB = false;
  }

  setColliders(colliders) { this.colliders = colliders || []; }

  checkCollision(pos) {
    const pad = CONFIG.movement.collisionPad;
    for (const c of this.colliders) {
      if (pos.x >= c.min.x - pad && pos.x <= c.max.x + pad &&
          pos.z >= c.min.z - pad && pos.z <= c.max.z + pad) {
        const dxL = pos.x - (c.min.x - pad);
        const dxR = (c.max.x + pad) - pos.x;
        const dzL = pos.z - (c.min.z - pad);
        const dzR = (c.max.z + pad) - pos.z;
        const minD = Math.min(dxL, dxR, dzL, dzR);
        if (minD === dxL) pos.x = c.min.x - pad;
        else if (minD === dxR) pos.x = c.max.x + pad;
        else if (minD === dzL) pos.z = c.min.z - pad;
        else pos.z = c.max.z + pad;
        return true;
      }
    }
    return false;
  }

  async load(url) {
    this.isLoadingGLB = true;
    if (url) {
      const loader = new GLTFLoader();
      try {
        const gltf = await loader.loadAsync(url);
        this.avatar = gltf.scene;
        this.avatar.scale.setScalar(1.0);
        this.avatar.position.set(0, 0, 0);

        this.avatar.traverse(child => {
          if (!child.isMesh || !child.material) return;
          child.castShadow = true;
          child.receiveShadow = true;
          child.frustumCulled = false;
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach(mat => {
            const n = (mat.name || child.name || '').toLowerCase();
            if (n.includes('body') || n.includes('skin')) {
              mat.metalness = 0.05; mat.roughness = 0.7;
            } else if (n.includes('hair')) {
              mat.metalness = 0; mat.roughness = 0.9;
            } else if (n.includes('glasses_0') || n.includes('frame')) {
              mat.metalness = 0.8; mat.roughness = 0.2;
            } else if (n.includes('glasses_1')) {
              mat.metalness = 0; mat.roughness = 0;
              mat.transparent = true; mat.opacity = 0.1;
            } else if (n.includes('shoe')) {
              mat.metalness = 0.05; mat.roughness = 0.8;
            } else if (n.includes('look') || n.includes('face')) {
              mat.metalness = 0; mat.roughness = 0.6;
            }
          });
        });

        try {
          const box = new THREE.Box3().setFromObject(this.avatar);
          if (box.min.y > -0.05) {
            this.avatar.position.y = -box.min.y;
          }
        } catch (e) {
          console.warn('[Avatar] Bounding box failed:', e);
        }

        this.setupAnimations(gltf);
        this.findAvatarBones();
        this.scene.add(this.avatar);
        this.isLoaded = true;
        this.useGLB = true;
        this.isLoadingGLB = false;
        this.playIdle();
        console.log('[Avatar] GLB avatar loaded');
        return;
      } catch (err) {
        console.warn('[Avatar] GLB load failed, using fallback:', err);
        if (this.avatar) {
          this.scene.remove(this.avatar);
          this.avatar = null;
        }
        this.mixer = null;
        this.animations = {};
        this.idleActions = [];
        this.isLoaded = false;
        this.useGLB = false;
      }
    }
    this.isLoadingGLB = false;

    if (CONFIG.avatar.usePhotoTexture) {
      await this.createPhotoFallback();
    } else {
      this.createStylizedFallback();
    }
  }

  findAvatarBones() {
    if (!this.avatar) return;
    const armNames = CONFIG.gestures.armBoneNames.map(n => n.toLowerCase());
    this.avatar.traverse(child => {
      const n = child.name.toLowerCase();
      if (n.includes('head') && !this.headBone) {
        this.headBone = child;
      }
      if (!this.rightArmBone && armNames.some(name => n === name || n.includes(name))) {
        this.rightArmBone = child;
      }
    });
  }

  setupAnimations(gltf) {
    if (!gltf.animations || gltf.animations.length === 0) return;
    try {
      this.mixer = new THREE.AnimationMixer(this.avatar);
      gltf.animations.forEach(clip => {
        if (!clip || !clip.name) return;
        try {
          const action = this.mixer.clipAction(clip);
          this.animations[clip.name] = action;
          if (clip.name.toLowerCase().includes('idle') || clip.name.toLowerCase().includes('stand')) {
            this.idleActions.push(action);
          }
        } catch (e) {
          console.warn(`[Avatar] Skipping animation "${clip.name}":`, e);
        }
      });
    } catch (e) {
      console.warn('[Avatar] Animation mixer setup failed:', e);
      this.mixer = null;
    }
  }

  playAnimation(name, loop = THREE.LoopRepeat, clampWhenFinished = false) {
    if (!this.mixer || !this.animations[name]) return;
    if (this.currentAction) this.currentAction.fadeOut(0.3);
    const action = this.animations[name];
    action.reset();
    action.setLoop(loop, clampWhenFinished ? 1 : Infinity);
    action.clampWhenFinished = clampWhenFinished;
    action.fadeIn(0.3);
    action.play();
    this.currentAction = action;
  }

  playIdle() {
    if (this.idleActions.length > 0) {
      const idle = this.idleActions[Math.floor(Math.random() * this.idleActions.length)];
      if (this.currentAction) this.currentAction.fadeOut(0.3);
      idle.reset();
      idle.fadeIn(0.3);
      idle.play();
      this.currentAction = idle;
    } else if (this.animations.Idle) {
      this.playAnimation('Idle');
    } else {
      this.startProceduralIdle();
    }
  }

  startProceduralIdle() { this.proceduralIdle = true; this.idleTime = 0; }
  stopProceduralIdle() { this.proceduralIdle = false; }

  queueGesture(type, target) {
    this.gestureQueue.push({ type, target: target ? target.clone() : null });
  }

  endGesture() {
    this.isGestureActive = false;
    this.waving = false;
    this.pointing = false;
    this.waveTime = undefined;
    this.pointTime = undefined;
    this.pointTarget = null;
    this.playIdle();
    if (this.gestureQueue.length > 0) {
      const next = this.gestureQueue.shift();
      if (next.type === 'wave') this.wave();
      else if (next.type === 'point') this.pointAt(next.target);
    }
  }

  wave() {
    if (this.isGestureActive) {
      this.queueGesture('wave');
      return;
    }
    this.isGestureActive = true;
    if (this.animations.Wave) {
      this.playAnimation('Wave', THREE.LoopOnce, true);
      setTimeout(() => this.endGesture(), CONFIG.gestures.waveDuration * 1000);
    } else {
      this.proceduralWave();
    }
  }

  pointAt(target) {
    if (this.isGestureActive) {
      this.queueGesture('point', target);
      return;
    }
    this.isGestureActive = true;
    if (this.animations.Point) {
      this.playAnimation('Point', THREE.LoopOnce, true);
      setTimeout(() => this.endGesture(), CONFIG.gestures.pointDuration * 1000);
    } else {
      this.proceduralPoint(target);
    }
  }

  walkTo(position) {
    this.movementState = this.MOVEMENT_STATE.NAVIGATING;
    this.targetPosition.copy(position);
    this.targetPosition.y = 0;
    this.freeRoamInput = null;
    this.currentSpeed = CONFIG.movement.walkSpeed;
    if (this.animations.Walk || this.animations.Run) {
      this.playAnimation(this.animations.Walk ? 'Walk' : 'Run');
    }
  }

  proceduralWave() { this.isGestureActive = true; this.waveTime = 0; this.waving = true; }
  proceduralPoint(target) { this.isGestureActive = true; this.pointTarget = target.clone(); this.pointing = true; this.pointTime = 0; }

  update(delta, time) {
    if (this.mixer) this.mixer.update(delta);

    switch (this.movementState) {
      case this.MOVEMENT_STATE.NAVIGATING:
        this.updateNavigating(delta, time);
        break;
      case this.MOVEMENT_STATE.FREE_ROAM:
        this.updateFreeRoam(delta, time);
        break;
      case this.MOVEMENT_STATE.IDLE:
        this.currentSpeed = Math.max(this.currentSpeed - CONFIG.movement.deceleration * delta, 0);
        break;
    }

    this.updateProceduralAnimations(delta, time);
    this.updateHeadLook(time);
    this.updateBlink(time);
  }

  updateNavigating(delta) {
    if (!this.avatar) return;
    const direction = new THREE.Vector3().subVectors(this.targetPosition, this.avatar.position);
    direction.y = 0;
    const distance = direction.length();
    if (distance > 0.05) {
      direction.normalize();

      const decelDist = 1.5;
      let speed = CONFIG.movement.walkSpeed;
      if (distance < decelDist) {
        speed = speed * (distance / decelDist);
        speed = Math.max(speed, 0.15);
      }

      const moveStep = speed * delta;
      const newPos = this.avatar.position.clone().addScaledVector(direction, Math.min(moveStep, distance));
      this.checkCollision(newPos);
      this.currentSpeed = speed;
      this.avatar.position.copy(newPos);
      this.avatar.position.y = 0;
      const m = new THREE.Matrix4().lookAt(
        this.avatar.position,
        this.avatar.position.clone().add(direction),
        new THREE.Vector3(0, 1, 0)
      );
      const targetQuat = new THREE.Quaternion().setFromRotationMatrix(m);
      this.avatar.quaternion.slerp(targetQuat, 0.08);
    } else {
      this.movementState = this.MOVEMENT_STATE.IDLE;
      this.currentSpeed = 0;
      this.avatar.position.copy(this.targetPosition);
      this.playIdle();
    }
  }

  updateFreeRoam(delta) {
    if (!this.avatar) return;
    const moving = this.freeRoamInput && this.freeRoamInput.length() > 0.01;
    if (moving) {
      this.currentSpeed = Math.min(this.currentSpeed + CONFIG.movement.acceleration * delta, CONFIG.movement.freeRoamMaxSpeed);
    } else {
      this.currentSpeed = Math.max(this.currentSpeed - CONFIG.movement.deceleration * delta, 0);
      if (this.currentSpeed < 0.01) {
        this.movementState = this.MOVEMENT_STATE.IDLE;
        this.playIdle();
        return;
      }
    }

    const dir = this.freeRoamInput.clone().normalize();
    const newPos = this.avatar.position.clone().addScaledVector(dir, this.currentSpeed * delta);
    this.checkCollision(newPos);
    this.avatar.position.copy(newPos);
    this.avatar.position.y = 0;

    const m = new THREE.Matrix4().lookAt(
      this.avatar.position,
      this.avatar.position.clone().add(dir),
      new THREE.Vector3(0, 1, 0)
    );
    const targetQuat = new THREE.Quaternion().setFromRotationMatrix(m);
    this.avatar.quaternion.slerp(targetQuat, 0.08);
  }

  setFreeRoamDirection(direction) {
    if (!this.avatar) return;
    this.freeRoamInput = direction.clone();
    if (direction.length() > 0.01) {
      this.proceduralIdle = false;
      this.movementState = this.MOVEMENT_STATE.FREE_ROAM;
    }
  }

  rotateYaw(angle) {
    if (!this.avatar) return;
    this.proceduralIdle = false;
    this.avatar.rotation.y += angle;
  }

  getFacingDirection() {
    if (!this.avatar) return new THREE.Vector3(0, 0, -1);
    const dir = new THREE.Vector3(0, 0, this.useGLB ? 1 : -1);
    dir.applyQuaternion(this.avatar.quaternion);
    dir.y = 0;
    return dir.normalize();
  }

  setFreeRoam(enabled) {
    this.freeRoam = enabled;
  }

  getRightArmNode() {
    return this.rightArmBone || this.avatar.getObjectByName('avatar-right-arm');
  }

  updateProceduralAnimations(delta, time) {
    if (!this.avatar) return;

    if (this.currentSpeed > 0.1 && (!this.useGLB || !this.animations.Walk)) {
      this.walkBobTime += delta * this.currentSpeed * 5;
      const body = this.avatar.getObjectByName('avatar-body');
      if (body) {
        body.position.y = 0.5 + Math.sin(this.walkBobTime) * 0.03;
      }
    }

    if (this.proceduralIdle && this.currentSpeed < 0.01) {
      this.idleTime += delta;
      const body = this.avatar.getObjectByName('avatar-body');
      const head = this.avatar.getObjectByName('avatar-head');
      if (body) body.position.y = 0.5 + Math.sin(this.idleTime * 1.5) * 0.02;
      if (head) head.position.y = 1.45 + Math.sin(this.idleTime * 1.5) * 0.02;
      this.avatar.rotation.y = Math.sin(this.idleTime * 0.3) * 0.1;
    }

    if (this.waving && this.waveTime !== undefined) {
      this.waveTime += delta;
      const rightArm = this.getRightArmNode();
      if (rightArm) {
        rightArm.rotation.z = -Math.PI / 6 + Math.sin(this.waveTime * 10) * 0.8;
        rightArm.rotation.x = Math.sin(this.waveTime * 5) * 0.3;
      }
      if (this.waveTime > CONFIG.gestures.waveDuration) {
        this.endGesture();
      }
    }

    if (this.pointing && this.pointTarget) {
      this.pointTime += delta;
      const rightArm = this.getRightArmNode();
      if (rightArm) {
        const dir = new THREE.Vector3().subVectors(this.pointTarget, this.avatar.position).normalize();
        rightArm.lookAt(dir);
        rightArm.rotation.z -= Math.PI / 2;
      }
      if (this.pointTime > CONFIG.gestures.pointDuration) {
        this.endGesture();
      }
    }
  }

  setHeadLook(yaw, pitch) {
    if (!this.headBone) return;
    const maxYaw = 1.4;
    const maxPitch = 0.8;
    this.headLookOverride = {
      y: Math.max(-maxYaw, Math.min(maxYaw, yaw)),
      x: Math.max(-maxPitch, Math.min(maxPitch, pitch))
    };
    this.headBone.rotation.y = this.headLookOverride.y;
    this.headBone.rotation.x = this.headLookOverride.x;
  }

  clearHeadLook() {
    this.headLookOverride = null;
  }

  updateHeadLook(time) {
    if (!this.headBone) return;
    if (this.headLookOverride) {
      this.headBone.rotation.y = this.headLookOverride.y;
      this.headBone.rotation.x = this.headLookOverride.x;
    } else {
      this.headBone.rotation.y = Math.sin(time * 0.5) * 0.3;
      this.headBone.rotation.x = Math.sin(time * 0.7) * 0.1;
    }
  }

  updateBlink(time) {
    if (!this.avatar) return;
    if (time - this.lastBlink > 3 + Math.random() * 4) {
      this.lastBlink = time;
      this.blinking = true;
      this.blinkStart = time;
    }
    if (this.blinking) {
      const t = (time - this.blinkStart) * 10;
      const s = t < 1 ? 1 - t : t < 2 ? t - 1 : 1;
      this.setEyeScale(s);
      if (t >= 2) this.blinking = false;
    }
  }

  setEyeScale(scale) {
    const leftEye = this.avatar?.getObjectByName('avatar-left-eye');
    const rightEye = this.avatar?.getObjectByName('avatar-right-eye');
    if (leftEye) leftEye.scale.y = scale;
    if (rightEye) rightEye.scale.y = scale;
  }

  setLookAt(target) { this.lookAtTarget = target; }
  clearLookAt() { this.lookAtTarget = null; }

  getPosition() {
    return this.avatar ? this.avatar.position.clone() : new THREE.Vector3();
  }

  setPosition(pos) {
    if (this.avatar) {
      this.avatar.position.copy(pos);
      this.avatar.position.y = 0;
    }
  }

  dispose() {
    if (this.mixer) this.mixer.uncacheRoot(this.avatar);
    if (this.avatar) {
      this.scene.remove(this.avatar);
      this.avatar.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
    }
  }
}
