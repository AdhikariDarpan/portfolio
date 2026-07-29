import * as THREE from 'three';
import { SKILLS, PROJECTS } from '../data.js';

export class CityBuilder {
  constructor(scene) {
    this.scene = scene;
    this.buildings = [];
    this.colliders = [];
    this.fountainParticles = null;
    this.fountainVelocities = [];
    this.buildingWindows = [];
    this._windowToggleTimer = 0;
    this.districtGlowStrips = [];
    this.kioskProjectIndex = 0;
  }

  build() {
    this.buildGround();
    this.buildRoads();
    this.buildSidewalks();
    this.buildPlaza();
    this.buildFountain();
    this.buildBuildings();
    this.buildHeroSigns();
    this.buildDistrictArches();
    this.buildStreetFurniture();
    this.buildProjectsDistrict();
    this.buildWelcomeBillboard();
    this.buildAboutBillboard();
    this.buildSkillsBillboard();
    this.buildContactBillboard();
    this.buildClouds();
    this.buildDistantSilhouettes();
  }

  getColliders() { return this.colliders; }

  buildGround() {
    const groundGeo = new THREE.PlaneGeometry(120, 120);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x6a8a5a, roughness: 1, metalness: 0, side: THREE.DoubleSide,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    ground.name = 'floor';
    this.scene.add(ground);
  }

  buildRoads() {
    const makeRoad = (x, z, w, h) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 })
      );
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, 0, z);
      m.receiveShadow = true;
      this.scene.add(m);
    };
    makeRoad(0, 0, 6, 60);
    makeRoad(0, 0, 60, 6);

    // Lane dashes
    const d = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    for (let i = -25; i <= 25; i += 4) {
      if (Math.abs(i) < 3) continue;
      const a = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 1.2), d);
      a.rotation.x = -Math.PI / 2;
      a.position.set(0, 0.01, i);
      this.scene.add(a);
      const b = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.15), d);
      b.rotation.x = -Math.PI / 2;
      b.position.set(i, 0.01, 0);
      this.scene.add(b);
    }
  }

  buildSidewalks() {
    const swMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.85 });
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 });

    // Sidewalks along roads (1u wide on each side)
    // North-south road (x=0)
    for (let side of [-1, 1]) {
      const sw = new THREE.Mesh(new THREE.PlaneGeometry(1, 60), swMat);
      sw.rotation.x = -Math.PI / 2;
      sw.position.set(side * 3.5, 0.01, 0);
      sw.receiveShadow = true;
      this.scene.add(sw);
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 60), curbMat);
      curb.position.set(side * 3.0, 0.06, 0);
      this.scene.add(curb);
    }
    // East-west road (z=0)
    for (let side of [-1, 1]) {
      const sw = new THREE.Mesh(new THREE.PlaneGeometry(60, 1), swMat);
      sw.rotation.x = -Math.PI / 2;
      sw.position.set(0, 0.01, side * 3.5);
      sw.receiveShadow = true;
      this.scene.add(sw);
      const curb = new THREE.Mesh(new THREE.BoxGeometry(60, 0.12, 0.08), curbMat);
      curb.position.set(0, 0.06, side * 3.0);
      this.scene.add(curb);
    }

    // Crosswalks at intersections
    const crossMat = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    for (let dist of [-24, -6, 6, 24]) {
      for (let i = -2; i <= 2; i++) {
        const cw = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 3), crossMat);
        cw.rotation.x = -Math.PI / 2;
        cw.position.set(dist, 0.015, i * 0.6);
        this.scene.add(cw);
        const cw2 = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.25), crossMat);
        cw2.rotation.x = -Math.PI / 2;
        cw2.position.set(i * 0.6, 0.015, dist);
        this.scene.add(cw2);
      }
    }
  }

  buildPlaza() {
    const p = new THREE.Mesh(
      new THREE.CircleGeometry(5, 32),
      new THREE.MeshStandardMaterial({ color: 0x7a7a7a, roughness: 0.8 })
    );
    p.rotation.x = -Math.PI / 2;
    p.position.set(0, 0.01, 0);
    p.receiveShadow = true;
    this.scene.add(p);
  }

  buildFountain() {
    // Basin
    const basinMat = new THREE.MeshStandardMaterial({ color: 0x8899aa, roughness: 0.3, metalness: 0.4 });
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.5, 0.4, 24), basinMat);
    basin.position.set(0, 0.2, 0);
    basin.castShadow = true;
    basin.receiveShadow = true;
    this.scene.add(basin);

    // Water surface
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x4a9eff, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.6,
    });
    const water = new THREE.Mesh(new THREE.CircleGeometry(2.0, 24), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, 0.4, 0);
    this.scene.add(water);

    // Center pillar
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xaabbcc, roughness: 0.4, metalness: 0.3 });
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.2, 8), pillarMat);
    pillar.position.set(0, 0.8, 0);
    pillar.castShadow = true;
    this.scene.add(pillar);

    // Water particles
    const count = 250;
    const positions = new Float32Array(count * 3);
    const velocities = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.5;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = 0.2 + Math.random() * 0.1;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      velocities.push({
        x: (Math.random() - 0.5) * 0.4,
        y: 1.5 + Math.random() * 2.0,
        z: (Math.random() - 0.5) * 0.4,
      });
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x87ceeb, size: 0.12, transparent: true, opacity: 0.7,
    });
    this.fountainParticles = new THREE.Points(geo, mat);
    this.fountainParticles.position.y = 0.4;
    this.fountainVelocities = velocities;
    this.scene.add(this.fountainParticles);
  }

  buildHeroSigns() {
    const makeSign = (x, z, rotY, title, subtitle) => {
      const c = document.createElement('canvas');
      c.width = 1024; c.height = 384;
      const cx = c.getContext('2d');

      const g = cx.createLinearGradient(0, 0, 0, 384);
      g.addColorStop(0, '#080c14');
      g.addColorStop(0.5, '#0a1020');
      g.addColorStop(1, '#060a14');
      cx.fillStyle = g;
      cx.fillRect(0, 0, 1024, 384);

      cx.strokeStyle = 'rgba(255,255,255,0.06)';
      cx.lineWidth = 1;
      cx.strokeRect(1, 1, 1022, 382);

      cx.textAlign = 'center';
      cx.textBaseline = 'middle';

      cx.font = '600 52px "Inter", Arial, sans-serif';
      cx.fillStyle = '#ffffff';
      cx.fillText(title, 512, 140);

      cx.fillStyle = 'rgba(255,255,255,0.3)';
      cx.fillRect(340, 175, 344, 1);

      cx.font = '400 22px "Inter", Arial, sans-serif';
      cx.fillStyle = 'rgba(255,255,255,0.6)';
      cx.fillText(subtitle, 512, 220);

      const tex = new THREE.CanvasTexture(c);
      const mat = new THREE.MeshStandardMaterial({
        map: tex, roughness: 0.4, metalness: 0.1, side: THREE.DoubleSide,
      });
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(7, 2.8), mat);
      sign.position.set(x, 7.5, z);
      sign.rotation.y = rotY;
      sign.castShadow = true;
      this.scene.add(sign);

      const fm = new THREE.MeshStandardMaterial({ color: '#1a2035', metalness: 0.5, roughness: 0.3 });
      for (let py of [-0.04, 2.84]) {
        const f = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.06, 0.06), fm);
        f.position.set(x, 7.5 + py, z);
        f.rotation.y = rotY;
        this.scene.add(f);
      }
      for (let px of [-3.6, 3.6]) {
        const f = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.9, 0.06), fm);
        const fx = x + Math.cos(rotY) * px;
        const fz = z + Math.sin(rotY) * px;
        f.position.set(fx, 7.5 + 1.4, fz);
        f.rotation.y = rotY;
        this.scene.add(f);
      }
    };

    makeSign(0, -28, 0, 'Darpan Adhikari', 'Full Stack Developer & AI Engineer');
    makeSign(0, 32, Math.PI, 'Darpan Adhikari', 'Full Stack Developer & AI Engineer');
    makeSign(-28, -10, Math.PI / 2, 'Darpan Adhikari', 'Full Stack Developer & AI Engineer');
    makeSign(30, -10, -Math.PI / 2, 'Darpan Adhikari', 'Full Stack Developer & AI Engineer');
  }

  buildBuildings() {
    this.buildGlassTowers();
    this.buildBrickLofts();
    this.buildTownhouses();
    this.buildCornerCafes();
  }

  // ── Glass Tower ──────────────────────────────────────────────────
  buildGlassTowers() {
    const towers = [
      { x: 0, z: -30 }, { x: 0, z: 34 },
      { x: -30, z: 0 }, { x: 34, z: 0 },
    ];
    towers.forEach(t => {
      const g = new THREE.Group();
      const h = 10, w = 5, d = 5;

      // Glass shaft
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x4a8aaa, metalness: 0.3, roughness: 0.1,
        transparent: true, opacity: 0.7, envMapIntensity: 0.5,
      });
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, h * 0.85, d * 0.9), glassMat);
      shaft.position.y = h / 2;
      shaft.castShadow = true;
      g.add(shaft);

      // Vertical mullions
      const mullMat = new THREE.MeshStandardMaterial({ color: 0x222233, metalness: 0.6, roughness: 0.2 });
      for (let side of [-1, 1]) {
        for (let offset of [-0.35, -0.12, 0.12, 0.35]) {
          const vm = new THREE.Mesh(new THREE.BoxGeometry(0.02, h * 0.8, 0.02), mullMat);
          vm.position.set(side * w * 0.45, h * 0.5, offset * d);
          g.add(vm);
          const vm2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, h * 0.8, 0.02), mullMat);
          vm2.position.set(offset * w, h * 0.5, side * d * 0.45);
          g.add(vm2);
        }
      }

      // Horizontal floor bands
      const bandMat = new THREE.MeshStandardMaterial({ color: 0x1a2a3a, metalness: 0.4, roughness: 0.3 });
      for (let i = 1; i < 7; i++) {
        const band = new THREE.Mesh(new THREE.BoxGeometry(w * 0.92, 0.04, d * 0.92), bandMat);
        band.position.y = i * (h * 0.85 / 7);
        g.add(band);
      }

      // Roof crown / mechanical penthouse
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.5, roughness: 0.3 });
      const crown = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 1.2), roofMat);
      crown.position.y = h + 0.3;
      g.add(crown);
      const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.8, 4), roofMat);
      antenna.position.y = h + 0.8;
      g.add(antenna);

      // Lobby entrance (brighter base)
      const lobbyMat = new THREE.MeshStandardMaterial({
        color: 0x88ccdd, emissive: 0x224466, emissiveIntensity: 0.15,
      });
      const lobby = new THREE.Mesh(new THREE.BoxGeometry(w * 0.6, 1.2, 0.1), lobbyMat);
      lobby.position.set(0, 0.6, -d * 0.46);
      g.add(lobby);

      g.position.set(t.x, 0, t.z);
      this.scene.add(g);
      this.buildings.push(g);
      this.colliders.push({
        min: new THREE.Vector3(t.x - w / 2, 0, t.z - d / 2),
        max: new THREE.Vector3(t.x + w / 2, h, t.z + d / 2),
      });
    });
  }

  // ── Brick Loft ──────────────────────────────────────────────────
  buildBrickLofts() {
    const makeWinTex = (baseColor = '#4a5568') => {
      const c = document.createElement('canvas');
      c.width = 128; c.height = 256;
      const cx = c.getContext('2d');
      const cols = 4, rows = 6;
      const gw = 128 / cols, gh = 256 / rows;
      const state = [];
      cx.fillStyle = baseColor;
      cx.fillRect(0, 0, 128, 256);
      for (let r = 0; r < rows; r++) {
        for (let col = 0; col < cols; col++) {
          const lit = Math.random() > 0.35;
          state.push(lit);
          cx.fillStyle = lit ? '#ffe8b0' : '#2d3748';
          cx.fillRect(col * gw + 4, r * gh + 4, gw - 8, gh - 8);
          cx.strokeStyle = '#2d3748';
          cx.lineWidth = 1;
          cx.strokeRect(col * gw + 4, r * gh + 4, gw - 8, gh - 8);
        }
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      this.buildingWindows.push({ canvas: c, ctx: cx, texture: tex, cols, rows, state });
      return tex;
    };

    const lofts = [
      // North
      { x: -18, z: -30, w: 4, h: 7, d: 5, c: '#6b4a3a' },
      { x: 18, z: -30, w: 4, h: 7, d: 5, c: '#5a4a3a' },
      // South
      { x: -18, z: 34, w: 4, h: 7, d: 5, c: '#5a4a3a' },
      { x: 18, z: 34, w: 4, h: 7, d: 5, c: '#6b4a3a' },
      // West
      { x: -30, z: -18, w: 5, h: 7, d: 4, c: '#6b4a3a' },
      { x: -30, z: 18, w: 5, h: 7, d: 4, c: '#5a4a3a' },
      // East
      { x: 34, z: -18, w: 5, h: 7, d: 4, c: '#5a4a3a' },
      { x: 34, z: 18, w: 5, h: 7, d: 4, c: '#6b4a3a' },
    ];

    lofts.forEach(l => {
      const g = new THREE.Group();

      // Main body
      const bodyMat = new THREE.MeshStandardMaterial({
        color: l.c, roughness: 0.8, metalness: 0.05,
      });
      const body = new THREE.Mesh(new THREE.BoxGeometry(l.w, l.h, l.d), bodyMat);
      body.position.y = l.h / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      g.add(body);

      // Window texture face on the outward side
      const winMat = new THREE.MeshStandardMaterial({
        map: makeWinTex(l.c), roughness: 0.7, metalness: 0.1,
      });
      // Determine if north/south or east/west oriented
      const isNS = Math.abs(l.z) > 20;
      const winW = isNS ? l.w : l.d * 0.7;
      const winH = l.h * 0.85;
      const win = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), winMat);
      const outDir = isNS ? (l.z < 0 ? 1 : -1) : (l.x < 0 ? 1 : -1);
      if (isNS) {
        win.position.set(0, l.h / 2, outDir * (l.d / 2 + 0.01));
      } else {
        win.rotation.y = Math.PI / 2;
        win.position.set(outDir * (l.w / 2 + 0.01), l.h / 2, 0);
      }
      g.add(win);

      // Parapet (extends above roof)
      const paraMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 });
      for (let side of [-1, 1]) {
        const p1 = new THREE.Mesh(new THREE.BoxGeometry(l.w + 0.2, 0.15, 0.15), paraMat);
        p1.position.set(0, l.h, side * l.d / 2);
        g.add(p1);
        const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, l.d + 0.2), paraMat);
        p2.position.set(side * l.w / 2, l.h, 0);
        g.add(p2);
      }

      // Rooftop terrace railing
      const railMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.3, roughness: 0.5 });
      for (let i = -1; i <= 1; i += 0.5) {
        for (let j = -1; j <= 1; j += 0.5) {
          if (Math.abs(i) < 0.6 && Math.abs(j) < 0.6) continue;
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4), railMat);
          post.position.set(i * l.w / 2.5, l.h + 0.15, j * l.d / 2.5);
          g.add(post);
        }
      }

      g.position.set(l.x, 0, l.z);
      this.scene.add(g);
      this.buildings.push(g);
      this.colliders.push({
        min: new THREE.Vector3(l.x - l.w / 2, 0, l.z - l.d / 2),
        max: new THREE.Vector3(l.x + l.w / 2, l.h, l.z + l.d / 2),
      });
    });
  }

  // ── Townhouse Row ───────────────────────────────────────────────
  buildTownhouses() {
    const towns = [
      { x: -26, z: -28, w: 6, h: 4, d: 5, colors: ['#7a5a4a','#6a4a3a','#8a6a5a'] },
      { x: 26, z: -28, w: 6, h: 4, d: 5, colors: ['#6a4a3a','#7a5a4a','#5a3a2a'] },
      { x: -26, z: 32, w: 6, h: 4, d: 5, colors: ['#5a3a2a','#8a6a5a','#6a4a3a'] },
      { x: 26, z: 32, w: 6, h: 4, d: 5, colors: ['#7a5a4a','#5a3a2a','#7a5a4a'] },
      { x: -28, z: -26, w: 5, h: 4, d: 6, colors: ['#6a4a3a','#7a5a4a','#5a3a2a'] },
      { x: -28, z: 26, w: 5, h: 4, d: 6, colors: ['#8a6a5a','#6a4a3a','#7a5a4a'] },
      { x: 32, z: -26, w: 5, h: 4, d: 6, colors: ['#5a3a2a','#7a5a4a','#6a4a3a'] },
      { x: 32, z: 26, w: 5, h: 4, d: 6, colors: ['#6a4a3a','#5a3a2a','#8a6a5a'] },
    ];
    towns.forEach(t => {
      const g = new THREE.Group();
      const units = t.colors.length;
      const unitW = t.w / units;
      for (let i = 0; i < units; i++) {
        const uMat = new THREE.MeshStandardMaterial({
          color: t.colors[i], roughness: 0.85, metalness: 0.05,
        });
        const uBody = new THREE.Mesh(new THREE.BoxGeometry(unitW * 0.9, t.h, t.d), uMat);
        const offsetX = (i - (units - 1) / 2) * unitW;
        uBody.position.set(offsetX, t.h / 2, 0);
        uBody.castShadow = true;
        uBody.receiveShadow = true;
        g.add(uBody);
        const wMat = new THREE.MeshStandardMaterial({ color: 0x224466, emissive: 0x446688, emissiveIntensity: 0.1 });
        const wdw = new THREE.Mesh(new THREE.PlaneGeometry(unitW * 0.5, t.h * 0.5), wMat);
        wdw.position.set(offsetX, t.h * 0.6, t.d / 2 + 0.01);
        g.add(wdw);
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.9 });
        const door = new THREE.Mesh(new THREE.PlaneGeometry(unitW * 0.3, t.h * 0.3), doorMat);
        door.position.set(offsetX, t.h * 0.15, t.d / 2 + 0.01);
        g.add(door);
        const stoop = new THREE.Mesh(new THREE.BoxGeometry(unitW * 0.4, 0.08, 0.2), doorMat);
        stoop.position.set(offsetX, 0.04, -t.d / 2 + 0.1);
        g.add(stoop);
      }
      const divMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 });
      for (let i = 1; i < units; i++) {
        const div = new THREE.Mesh(new THREE.BoxGeometry(0.04, t.h, t.d + 0.2), divMat);
        div.position.set((i - (units - 1) / 2) * unitW, t.h / 2, 0);
        g.add(div);
      }
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 });
      for (let side of [-1, 1]) {
        const slope = new THREE.Mesh(
          new THREE.BoxGeometry(t.w + 0.3, 0.08, t.d / 2 + 0.1), roofMat
        );
        slope.position.set(0, t.h, side * t.d / 4);
        slope.rotation.x = side * 0.25;
        g.add(slope);
      }
      const ridge = new THREE.Mesh(new THREE.BoxGeometry(t.w + 0.3, 0.06, 0.08), roofMat);
      ridge.position.set(0, t.h + 0.2, 0);
      g.add(ridge);
      g.position.set(t.x, 0, t.z);
      this.scene.add(g);
      this.buildings.push(g);
      const isNS = Math.abs(t.z) > 20;
      const cw = isNS ? t.w : t.d;
      const cd = isNS ? t.d : t.w;
      this.colliders.push({
        min: new THREE.Vector3(t.x - cw / 2, 0, t.z - cd / 2),
        max: new THREE.Vector3(t.x + cw / 2, t.h + 0.3, t.z + cd / 2),
      });
    });
  }

  // ── Corner Cafe ─────────────────────────────────────────────────
  buildCornerCafes() {
    const cafes = [
      { x: -14, z: 32, rot: 0 },
      { x: 14, z: 32, rot: 0 },
    ];
    cafes.forEach(c => {
      const g = new THREE.Group();
      const h = 4, w = 5, d = 5;
      const upMat = new THREE.MeshStandardMaterial({ color: 0xd4c4a8, roughness: 0.7 });
      const upper = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.6, d), upMat);
      upper.position.y = h * 0.7;
      upper.castShadow = true;
      g.add(upper);
      const uwMat = new THREE.MeshStandardMaterial({ color: 0x446688 });
      for (let side of [-1, 1]) {
        const uw = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8), uwMat);
        uw.position.set(side * w * 0.3, h * 0.7, d / 2 + 0.01);
        g.add(uw);
      }
      const gfMat = new THREE.MeshPhysicalMaterial({
        color: 0x88bbdd, transparent: true, opacity: 0.5, roughness: 0.1, metalness: 0.1,
      });
      const gf = new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, h * 0.35, 0.05), gfMat);
      gf.position.set(0, h * 0.18, d / 2 + 0.01);
      g.add(gf);
      const awMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.8 });
      const awning = new THREE.Mesh(new THREE.BoxGeometry(w + 0.4, 0.04, 0.5), awMat);
      awning.position.set(0, h * 0.38, -d / 2 - 0.22);
      g.add(awning);
      for (let i = 0; i < 6; i++) {
        const stripe = new THREE.Mesh(
          new THREE.BoxGeometry(0.03, 0.04, 0.45),
          new THREE.MeshStandardMaterial({ color: i % 2 ? 0x8a3a2a : 0xd4a878 })
        );
        stripe.position.set(-w / 2 + 0.15 + i * (w / 5.5), h * 0.38, -d / 2 - 0.22);
        g.add(stripe);
      }
      const signMat = new THREE.MeshStandardMaterial({ color: 0x1a0a0a });
      const sign = new THREE.Mesh(new THREE.BoxGeometry(w * 0.6, 0.2, 0.02), signMat);
      sign.position.set(0, h * 0.5, -d / 2 - 0.02);
      g.add(sign);
      const paraMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8 });
      const roof = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, d), paraMat);
      roof.position.y = h;
      g.add(roof);
      g.position.set(c.x, 0, c.z);
      this.scene.add(g);
      this.buildings.push(g);
      this.colliders.push({
        min: new THREE.Vector3(c.x - w / 2, 0, c.z - d / 2),
        max: new THREE.Vector3(c.x + w / 2, h, c.z + d / 2),
      });
    });
  }

  // ── Improved Billboard Helper ─────────────────────────────────────
  createBillboard(x, z, rotY, width, height, bgColor, accentColor, title, lines, icon) {
    const group = new THREE.Group();

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Background with rounded rect
    const r = 24;
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, bgColor);
    grad.addColorStop(1, this.darken(bgColor, 20));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(1024 - r, 0);
    ctx.quadraticCurveTo(1024, 0, 1024, r);
    ctx.lineTo(1024, 512 - r);
    ctx.quadraticCurveTo(1024, 512, 1024 - r, 512);
    ctx.lineTo(r, 512);
    ctx.quadraticCurveTo(0, 512, 0, 512 - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fill();

    // Inner glow border
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 30;
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(r + 8, 8);
    ctx.lineTo(1024 - r - 8, 8);
    ctx.quadraticCurveTo(1016, 8, 1016, r + 8);
    ctx.lineTo(1016, 512 - r - 8);
    ctx.quadraticCurveTo(1016, 504, 1024 - r - 8, 504);
    ctx.lineTo(r + 8, 504);
    ctx.quadraticCurveTo(8, 504, 8, 512 - r - 8);
    ctx.lineTo(8, r + 8);
    ctx.quadraticCurveTo(8, 8, r + 8, 8);
    ctx.closePath();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // Decorative top accent bar
    ctx.fillStyle = accentColor;
    ctx.globalAlpha = 0.15;
    ctx.fillRect(100, 0, 824, 2);
    ctx.globalAlpha = 1;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const titleY = icon ? 130 : 110;

    if (icon) {
      ctx.font = '36px Arial, sans-serif';
      ctx.fillStyle = accentColor;
      ctx.globalAlpha = 0.7;
      ctx.fillText(icon, 512, 60);
      ctx.globalAlpha = 1;
    }

    ctx.font = '600 44px "Inter", Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 8;
    ctx.fillText(title, 512, titleY);
    ctx.shadowBlur = 0;

    const divY = titleY + 22;
    const divGrad = ctx.createLinearGradient(340, 0, 684, 0);
    divGrad.addColorStop(0, 'transparent');
    divGrad.addColorStop(0.5, accentColor);
    divGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = divGrad;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(340, divY, 344, 2);
    ctx.globalAlpha = 1;

    const lineStartY = titleY + 50;
    lines.forEach((line, i) => {
      ctx.font = i === 0 ? '400 20px "Inter", Arial, sans-serif' : '300 16px "Inter", Arial, sans-serif';
      ctx.fillStyle = i === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)';
      const display = this.truncateText(ctx, line, 920);
      ctx.fillText(display, 512, lineStartY + i * 34);
    });

    // Bottom accent bar
    ctx.fillStyle = accentColor;
    ctx.globalAlpha = 0.08;
    ctx.fillRect(200, 500, 624, 1);
    ctx.globalAlpha = 1;

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshStandardMaterial({
      map: tex, roughness: 0.3, metalness: 0.1,
    });
    const bill = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
    bill.position.y = height / 2;
    bill.castShadow = true;
    group.add(bill);

    // 3D frame with depth
    const frameMat = new THREE.MeshStandardMaterial({
      color: '#1a2035', metalness: 0.6, roughness: 0.2,
    });
    const frameDepth = 0.12;
    const top = new THREE.Mesh(new THREE.BoxGeometry(width + 0.2, frameDepth, frameDepth), frameMat);
    top.position.set(0, height + 0.03, 0);
    group.add(top);
    const bot = new THREE.Mesh(new THREE.BoxGeometry(width + 0.2, frameDepth, frameDepth), frameMat);
    bot.position.set(0, -0.03, 0);
    group.add(bot);
    const left = new THREE.Mesh(new THREE.BoxGeometry(frameDepth, height + 0.06, frameDepth), frameMat);
    left.position.set(-width / 2 - 0.1, height / 2, 0);
    group.add(left);
    const right = new THREE.Mesh(new THREE.BoxGeometry(frameDepth, height + 0.06, frameDepth), frameMat);
    right.position.set(width / 2 + 0.1, height / 2, 0);
    group.add(right);

    // Neon border strip (inner glow)
    const glowMat = new THREE.MeshStandardMaterial({
      color: accentColor, emissive: accentColor, emissiveIntensity: 0.25,
    });
    const glowT = new THREE.Mesh(new THREE.BoxGeometry(width - 0.2, 0.02, 0.02), glowMat);
    glowT.position.set(0, height - 0.04, 0.01);
    group.add(glowT);
    const glowB = new THREE.Mesh(new THREE.BoxGeometry(width - 0.2, 0.02, 0.02), glowMat);
    glowB.position.set(0, -height + 0.04, 0.01);
    group.add(glowB);

    // Poles
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.5, roughness: 0.4 });
    for (let px of [-width / 2 + 0.25, width / 2 - 0.25]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, height + 0.6, 6), poleMat);
      pole.position.set(px, (height + 0.6) / 2 - 0.3, 0);
      pole.castShadow = true;
      group.add(pole);
      // Base cap
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.06, 6), poleMat);
      cap.position.set(px, -0.03, 0);
      group.add(cap);
    }

    group.position.set(x, 0, z);
    group.rotation.y = rotY;
    group.userData = { label: title, type: 'building' };
    group.name = 'building';
    this.scene.add(group);
    this.buildings.push(group);

    const halfW = width / 2;
    const cx = Math.abs(Math.cos(rotY));
    const sx = Math.abs(Math.sin(rotY));
    const halfX = halfW * cx + 0.3 * sx;
    const halfZ = halfW * sx + 0.3 * cx;
    this.colliders.push({
      min: new THREE.Vector3(x - halfX, 0, z - halfZ),
      max: new THREE.Vector3(x + halfX, height + 0.5, z + halfZ),
    });

    return group;
  }

  truncateText(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let t = text;
    while (t.length > 0 && ctx.measureText(t + '...').width > maxWidth) t = t.slice(0, -1);
    return t + '...';
  }

  darken(hex, amount) {
    let c = parseInt(hex.slice(1), 16);
    let r = Math.max(0, (c >> 16) - amount);
    let g = Math.max(0, ((c >> 8) & 0xff) - amount);
    let b = Math.max(0, (c & 0xff) - amount);
    return `rgb(${r},${g},${b})`;
  }

  // ── District Billboards ───────────────────────────────────────────
  buildWelcomeBillboard() {
    this.createBillboard(6, -6, -Math.PI / 4, 5, 3.5, '#0a1520', '#4a8af5',
      'WELCOME',
      ['Darpan Adhikari · Full Stack & AI Engineer',
       '5+ Years · 50+ Projects · 30+ Clients Worldwide',
       'React · TypeScript · Node · Python · Three.js'],
      '🌐');
  }

  buildAboutBillboard() {
    this.createBillboard(-22, -32, Math.PI / 3, 4.5, 3.5, '#0a1220', '#4a8af5',
      '👤 ABOUT ME',
      ['Building full-stack systems & AI tools',
       'Remote-First · Open Source · Lifelong Learner',
       'Startups → Enterprise · 30+ Delivered'],
      null);
    this.createBillboard(-2, -34, 0, 3.5, 3, '#0a1220', '#6a9af5',
      '📊 STATS',
      ['50+ Projects Shipped', '5+ Years Experience', 'Full-Stack Expertise'],
      null);
  }

  buildSkillsBillboard() {
    const cats = ['FRONTEND', 'BACKEND', 'CLOUD', 'TOOLS'];
    const colors = ['#8b5cf6', '#00d4aa', '#f5c842', '#f472b6'];
    cats.forEach((cat, i) => {
      const skills = (SKILLS[cat.toLowerCase()] || []).slice(0, 4).map(s => s.name).join(' · ');
      this.createBillboard(-34, -6 + i * 4.5, Math.PI / 2, 4, 3.5, '#0f0a1a', colors[i],
        `${cat}`, [skills || 'Various technologies'], null);
    });
  }

  buildContactBillboard() {
    this.createBillboard(34, -2, -Math.PI / 2, 5, 4, '#1a0a0a', '#fbbf24',
      '📬 LET\'S CONNECT',
      ['darpand263@gmail.com', 'LinkedIn · GitHub · Portfolio',
       'Available for Freelance & Remote · Reply < 24h'],
      null);
    this.createBillboard(36, 8, -Math.PI / 2, 3, 2.8, '#1a0a0a', '#fbbf24',
      '✅ AVAILABLE',
      ['Freelance', 'Remote Roles', 'Reply < 24h'],
      null);
  }

  // ── District entrance arches ─────────────────────────────────────
  buildDistrictArches() {
    const arches = [
      // Each arch spans across the road with pillars on sidewalk/grass
      // rot=0 → spans along x-axis (covers north-south road)
      // rot=π/2 → spans along z-axis (covers east-west road)
      { x: 0, z: -14, rot: 0,          label: 'ABOUT',    color: '#4a8af5', icon: '👤' },
      { x: -14, z: 0, rot: Math.PI / 2, label: 'SKILLS',  color: '#8b5cf6', icon: '⚡' },
      { x: 0, z: 12,  rot: 0,          label: 'PROJECTS', color: '#00f5d4', icon: '📁' },
      { x: 14, z: 0,  rot: -Math.PI / 2, label: 'CONTACT', color: '#fbbf24', icon: '✉' },
    ];

    arches.forEach(a => {
      const group = new THREE.Group();
      const span = 7.0; // wide enough for 6-unit road + sidewalks
      const pillarH = 4.5;
      const beamH = 0.6;
      const pillarW = 0.35;

      // Top beam with canvas label
      const beamCanvas = document.createElement('canvas');
      beamCanvas.width = 512;
      beamCanvas.height = 128;
      const bCtx = beamCanvas.getContext('2d');
      bCtx.fillStyle = '#0a0f1a';
      bCtx.fillRect(0, 0, 512, 128);
      bCtx.shadowColor = a.color;
      bCtx.shadowBlur = 20;
      bCtx.strokeStyle = a.color;
      bCtx.lineWidth = 3;
      bCtx.strokeRect(6, 6, 500, 116);
      bCtx.shadowBlur = 0;
      bCtx.font = 'bold 36px Arial, sans-serif';
      bCtx.textAlign = 'center';
      bCtx.textBaseline = 'middle';
      bCtx.fillStyle = '#ffffff';
      bCtx.fillText(`${a.icon} ${a.label} DISTRICT`, 256, 50);
      bCtx.font = '18px Arial, sans-serif';
      bCtx.fillStyle = a.color;
      bCtx.fillText('──────────────────', 256, 85);
      const beamTex = new THREE.CanvasTexture(beamCanvas);
      const beamMat = new THREE.MeshStandardMaterial({
        map: beamTex, emissive: a.color, emissiveIntensity: 0.15,
      });
      const beam = new THREE.Mesh(new THREE.BoxGeometry(span + 0.6, beamH, 0.15), beamMat);
      beam.position.y = pillarH + beamH / 2;
      group.add(beam);

      // Neon glow strip along top beam
      const glowMat = new THREE.MeshStandardMaterial({
        color: a.color, emissive: a.color, emissiveIntensity: 0.35,
      });

      // Pillars
      const pillarMat = new THREE.MeshStandardMaterial({
        color: '#1a2035', metalness: 0.5, roughness: 0.3,
      });
      for (let side of [-1, 1]) {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(pillarW, pillarH, pillarW), pillarMat);
        pillar.position.set(side * (span / 2 + pillarW / 2), (pillarH - beamH) / 2, 0);
        pillar.castShadow = true;
        group.add(pillar);

        // Vertical neon strip on outer edge
        const strip = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, pillarH - 0.4, 0.04),
          glowMat
        );
        strip.position.set(side * (span / 2 + pillarW / 2 + 0.02), (pillarH + beamH) / 2, 0);
        group.add(strip);
        this.districtGlowStrips.push(strip);
      }

      group.position.set(a.x, 0, a.z);
      group.rotation.y = a.rot;
      this.scene.add(group);
      this.buildings.push(group);
    });
  }

  // ── Street furniture ──────────────────────────────────────────────
  buildStreetFurniture() {
    const treeTrunk = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.9 });
    const treeFoliage = new THREE.MeshStandardMaterial({ color: 0x3a7a3a, roughness: 0.8 });
    const lampPole = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.4, roughness: 0.5 });
    const lampGlow = new THREE.MeshStandardMaterial({ color: 0xffeedd, emissive: 0xffdd99, emissiveIntensity: 0.4 });
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.8 });
    const benchMetal = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5, roughness: 0.4 });
    const bushMat = new THREE.MeshStandardMaterial({ color: 0x2a6a2a, roughness: 0.9 });

    const makeTree = (x, z, scale = 1) => {
      const g = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.12 * scale, 1.2 * scale, 6), treeTrunk);
      trunk.position.y = 0.6 * scale;
      trunk.castShadow = true;
      g.add(trunk);
      const crown = new THREE.Mesh(new THREE.ConeGeometry(0.6 * scale, 1.0 * scale, 6), treeFoliage);
      crown.position.y = 1.4 * scale;
      crown.castShadow = true;
      g.add(crown);
      g.position.set(x, 0, z);
      this.scene.add(g);
    };

    const makeLamp = (x, z) => {
      const g = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 2.8, 6), lampPole);
      pole.position.y = 1.4;
      pole.castShadow = true;
      g.add(pole);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.03), lampPole);
      arm.position.set(0, 2.8, 0);
      g.add(arm);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), lampGlow);
      bulb.position.set(0, 2.85, 0);
      g.add(bulb);
      g.position.set(x, 0, z);
      this.scene.add(g);
    };

    const makeBench = (x, z, rot = 0) => {
      const g = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 0.4), benchMat);
      seat.position.y = 0.35;
      seat.castShadow = true;
      g.add(seat);
      for (let side of [-1, 1]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.3, 0.04), benchMetal);
        leg.position.set(side * 0.35, 0.15, 0);
        g.add(leg);
      }
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.4), benchMetal);
      back.position.set(-0.45, 0.5, 0);
      g.add(back);
      g.position.set(x, 0, z);
      g.rotation.y = rot;
      this.scene.add(g);
    };

    const makeBush = (x, z, scale = 1) => {
      const bush = new THREE.Mesh(new THREE.SphereGeometry(0.4 * scale, 6, 6), bushMat);
      bush.scale.y = 0.6;
      bush.position.set(x, 0.25 * scale, z);
      bush.castShadow = true;
      this.scene.add(bush);
    };

    // Trees along roads
    const treePositions = [
      // North-south road sides
      { x: -3.5, z: -14 }, { x: 3.5, z: -14 },
      { x: -3.5, z: -9 },  { x: 3.5, z: -9 },
      { x: -3.5, z: 9 },   { x: 3.5, z: 9 },
      { x: -3.5, z: 14 },  { x: 3.5, z: 14 },
      // East-west road sides
      { x: -14, z: -3.5 }, { x: -14, z: 3.5 },
      { x: -9, z: -3.5 },  { x: -9, z: 3.5 },
      { x: 9, z: -3.5 },   { x: 9, z: 3.5 },
      { x: 14, z: -3.5 },  { x: 14, z: 3.5 },
      // Around plaza
      { x: -5, z: -5, s: 0.8 }, { x: 5, z: -5, s: 0.8 },
      { x: -5, z: 5, s: 0.8 },  { x: 5, z: 5, s: 0.8 },
      // Near buildings
      { x: -22, z: -16, s: 0.7 }, { x: -22, z: 16, s: 0.7 },
      { x: 24, z: -16, s: 0.7 },  { x: 24, z: 16, s: 0.7 },
    ];
    treePositions.forEach(p => makeTree(p.x, p.z, p.s || 1));

    // Lamps along roads
    const lampPositions = [
      { x: -3, z: -18 }, { x: 3, z: -18 },
      { x: -3, z: -6 },  { x: 3, z: -6 },
      { x: -3, z: 6 },   { x: 3, z: 6 },
      { x: -3, z: 18 },  { x: 3, z: 18 },
      { x: -18, z: -3 }, { x: -18, z: 3 },
      { x: -6, z: -3 },  { x: -6, z: 3 },
      { x: 6, z: -3 },   { x: 6, z: 3 },
      { x: 18, z: -3 },  { x: 18, z: 3 },
    ];
    lampPositions.forEach(p => makeLamp(p.x, p.z));

    // Benches in plaza and near districts
    makeBench(-3, -3.5, Math.PI / 4);
    makeBench(3, -3.5, -Math.PI / 4);
    makeBench(-3, 3, Math.PI / 3);
    makeBench(3.5, 3, -Math.PI / 3);
    makeBench(-7, -14, Math.PI / 2);
    makeBench(7, -14, -Math.PI / 2);
    makeBench(-14, -4, 0);
    makeBench(-14, 4, Math.PI);
    makeBench(14, -4, 0);
    makeBench(14, 4, Math.PI);

    // Bushes
    const bushPositions = [
      { x: -21, z: -14 }, { x: -21, z: 14 },
      { x: 23, z: -14 },  { x: 23, z: 14 },
      { x: -10, z: -22 }, { x: -10, z: 22 },
      { x: 10, z: -22 },  { x: 10, z: 22 },
    ];
    bushPositions.forEach(p => makeBush(p.x, p.z, 0.7));
  }

  // ── Districts ────────────────────────────────────────────────────

  buildProjectsDistrict() {
    this.buildProjectKiosk();
  }

  buildProjectKiosk() {
    const x = 0, z = 20;
    const screenW = 8, screenH = 5;
    const kioskGroup = new THREE.Group();

    // Canvas texture for the screen
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');

    // Dark gradient background
    const grad = ctx.createLinearGradient(0, 0, 0, 640);
    grad.addColorStop(0, '#0a0f1a');
    grad.addColorStop(0.5, '#0d1525');
    grad.addColorStop(1, '#080c18');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 640);

    // Cyan border glow
    ctx.shadowColor = '#00f5d4';
    ctx.shadowBlur = 40;
    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = 6;
    ctx.strokeRect(12, 12, 1000, 616);
    ctx.shadowBlur = 0;

    // Inner border
    ctx.strokeStyle = 'rgba(0,245,212,0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(24, 24, 976, 592);

    // Title
    ctx.shadowColor = '#00f5d4';
    ctx.shadowBlur = 20;
    ctx.font = 'bold 52px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('PROJECT PORTFOLIO', 512, 160);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.font = '24px Arial, sans-serif';
    ctx.fillStyle = '#00f5d4';
    ctx.fillText('Browse 23+ Projects', 512, 215);

    // Decorative line
    const lg = ctx.createLinearGradient(200, 0, 824, 0);
    lg.addColorStop(0, 'transparent');
    lg.addColorStop(0.5, '#00f5d4');
    lg.addColorStop(1, 'transparent');
    ctx.fillStyle = lg;
    ctx.fillRect(200, 240, 624, 2);

    // Category icons/names
    ctx.font = '18px Arial, sans-serif';
    ctx.fillStyle = '#6b7aa8';
    const cats = ['Web', 'AI', 'Mobile', 'Desktop', 'Tools'];
    cats.forEach((c, i) => {
      const cx = 512 + (i - 2) * 140;
      ctx.fillText(c, cx, 290);
    });

    // Instruction
    ctx.font = '20px Arial, sans-serif';
    ctx.fillStyle = '#d0d0ff';
    ctx.fillText('Walk closer and click to browse', 512, 400);

    // Tech stack line
    ctx.font = '16px Arial, sans-serif';
    ctx.fillStyle = '#4a5a7a';
    ctx.fillText('React · TypeScript · Node.js · Python · Flutter · AI', 512, 480);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;

    // Main screen
    const screenMat = new THREE.MeshStandardMaterial({
      map: tex, emissive: 0x112244, emissiveIntensity: 0.3, metalness: 0.1, roughness: 0.3,
    });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(screenW, screenH), screenMat);
    screen.position.y = screenH / 2 + 0.5;
    screen.castShadow = true;
    screen.name = 'kiosk-screen';
    kioskGroup.add(screen);

    // Neon frame
    this.kioskFrameMat = new THREE.MeshStandardMaterial({
      color: '#00f5d4', emissive: '#00f5d4', emissiveIntensity: 0.4, metalness: 0.8, roughness: 0.2,
    });
    const frameMat = this.kioskFrameMat;
    // Top bar
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(screenW + 0.3, 0.06, 0.08), frameMat);
    topBar.position.set(0, screenH + 0.53, 0);
    kioskGroup.add(topBar);
    // Bottom bar
    const botBar = new THREE.Mesh(new THREE.BoxGeometry(screenW + 0.3, 0.06, 0.08), frameMat);
    botBar.position.set(0, 0.47, 0);
    kioskGroup.add(botBar);
    // Side bars
    for (let s of [-1, 1]) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.06, screenH + 0.12, 0.08), frameMat);
      side.position.set(s * (screenW / 2 + 0.15), screenH / 2 + 0.5, 0);
      kioskGroup.add(side);
    }

    // Side pillars
    const pillarMat = new THREE.MeshStandardMaterial({ color: '#1a2035', metalness: 0.6, roughness: 0.3 });
    for (let s of [-1, 1]) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.4, screenH + 1.5, 0.4), pillarMat);
      pillar.position.set(s * (screenW / 2 + 0.6), (screenH + 1.5) / 2, 0);
      pillar.castShadow = true;
      kioskGroup.add(pillar);
    }

    // Base platform
    const baseMat = new THREE.MeshStandardMaterial({ color: '#121828', metalness: 0.3, roughness: 0.6 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(screenW + 2, 0.4, 1.5), baseMat);
    base.position.set(0, 0.2, 0);
    base.receiveShadow = true;
    base.castShadow = true;
    kioskGroup.add(base);

    // Position the whole kiosk
    kioskGroup.position.set(x, 0, z);
    kioskGroup.rotation.y = Math.PI; // faces south
    kioskGroup.userData = { label: 'Project Kiosk', type: 'kiosk' };
    kioskGroup.name = 'kiosk';
    this.scene.add(kioskGroup);
    this.buildings.push(kioskGroup);

    // Collider — the base area
    this.colliders.push({
      min: new THREE.Vector3(x - screenW / 2 - 1, 0, z - 0.8),
      max: new THREE.Vector3(x + screenW / 2 + 1, screenH + 2, z + 0.8),
    });

    // Store reference for screen texture updates
    this.kioskScreen = screen;
    this.kioskTexture = tex;
    this.kioskCtx = ctx;
    this.kioskCanvas = canvas;
  }

  showKioskWelcome() {
    if (!this.kioskCtx || !this.kioskTexture) return;
    this._drawKioskWelcome();
    this.kioskTexture.needsUpdate = true;
  }

  showKioskProject(index) {
    if (!this.kioskCtx || !this.kioskTexture) return;
    if (index < 0 || index >= PROJECTS.length) return;
    this.kioskProjectIndex = index;
    this._drawKioskProject(PROJECTS[index]);
    this.kioskTexture.needsUpdate = true;
  }

  getProjectCount() { return PROJECTS.length; }
  getKioskProjectIndex() { return this.kioskProjectIndex; }
  setKioskProjectIndex(idx) { this.kioskProjectIndex = idx; }

  _drawKioskWelcome() {
    const ctx = this.kioskCtx;
    const grad = ctx.createLinearGradient(0, 0, 0, 640);
    grad.addColorStop(0, '#0a0f1a');
    grad.addColorStop(0.5, '#0d1525');
    grad.addColorStop(1, '#080c18');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 640);
    ctx.shadowColor = '#00f5d4';
    ctx.shadowBlur = 40;
    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = 6;
    ctx.strokeRect(12, 12, 1000, 616);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(0,245,212,0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(24, 24, 976, 592);
    ctx.shadowColor = '#00f5d4';
    ctx.shadowBlur = 20;
    ctx.font = 'bold 52px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('PROJECT PORTFOLIO', 512, 160);
    ctx.shadowBlur = 0;
    ctx.font = '24px Arial, sans-serif';
    ctx.fillStyle = '#00f5d4';
    ctx.fillText('Browse 23+ Projects', 512, 215);
    const lg = ctx.createLinearGradient(200, 0, 824, 0);
    lg.addColorStop(0, 'transparent');
    lg.addColorStop(0.5, '#00f5d4');
    lg.addColorStop(1, 'transparent');
    ctx.fillStyle = lg;
    ctx.fillRect(200, 240, 624, 2);
    ctx.font = '18px Arial, sans-serif';
    ctx.fillStyle = '#6b7aa8';
    ['Web', 'AI', 'Mobile', 'Desktop', 'Tools'].forEach((c, i) => {
      ctx.fillText(c, 512 + (i - 2) * 140, 290);
    });
    ctx.font = '20px Arial, sans-serif';
    ctx.fillStyle = '#d0d0ff';
    ctx.fillText('Walk closer and click to browse', 512, 400);
    ctx.font = '16px Arial, sans-serif';
    ctx.fillStyle = '#4a5a7a';
    ctx.fillText('React · TypeScript · Node.js · Python · Flutter · AI', 512, 480);
  }

  _drawKioskProject(project) {
    const ctx = this.kioskCtx;
    const pc = project.color || '#00f5d4';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, 1024, 640);

    ctx.shadowColor = pc;
    ctx.shadowBlur = 40;
    ctx.strokeStyle = pc;
    ctx.lineWidth = 6;
    ctx.strokeRect(12, 12, 1000, 616);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = 'rgba(0,245,212,0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(24, 24, 976, 592);

    // Left arrow
    ctx.save();
    ctx.shadowColor = pc;
    ctx.shadowBlur = 20;
    ctx.fillStyle = pc;
    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    ctx.arc(55, 88, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('◀', 55, 90);
    ctx.restore();

    // Right arrow
    ctx.save();
    ctx.shadowColor = pc;
    ctx.shadowBlur = 20;
    ctx.fillStyle = pc;
    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    ctx.arc(969, 88, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('▶', 969, 90);
    ctx.restore();

    // Emoji
    ctx.font = '52px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = pc;
    ctx.fillText(project.emoji || '📁', 512, 28);

    // Project name
    ctx.font = 'bold 38px Arial, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = pc;
    ctx.shadowBlur = 12;
    ctx.fillText(project.name, 512, 118);
    ctx.shadowBlur = 0;

    // Description
    ctx.font = '17px Arial, sans-serif';
    ctx.fillStyle = '#d0d0ff';
    ctx.textBaseline = 'middle';
    const lines = this.wrapText(ctx, project.desc, 850);
    lines.slice(0, 3).forEach((line, i) => {
      ctx.fillText(line, 512, 172 + i * 26);
    });

    // Tags
    ctx.font = '14px Arial, sans-serif';
    ctx.fillStyle = pc;
    const tags = project.tags.slice(0, 6).join('  ·  ');
    ctx.fillText(tags, 512, 270);

    // Divider
    const lg = ctx.createLinearGradient(200, 0, 824, 0);
    lg.addColorStop(0, 'transparent');
    lg.addColorStop(0.5, pc);
    lg.addColorStop(1, 'transparent');
    ctx.fillStyle = lg;
    ctx.fillRect(200, 298, 624, 2);

    // Language
    if (project.lang) {
      ctx.font = '16px Arial, sans-serif';
      ctx.fillStyle = pc;
      ctx.fillText(project.lang, 512, 330);
    }

    // Bottom instruction
    ctx.fillStyle = pc;
    ctx.globalAlpha = 0.08;
    ctx.fillRect(100, 580, 824, 1);
    ctx.globalAlpha = 1;
    ctx.font = '13px Arial, sans-serif';
    ctx.fillStyle = '#4a5a7a';
    ctx.fillText('Click ◀ ▶ to browse  ·  Center for details  ·  Click outside to exit', 512, 565);
  }

  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let line = '';
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  buildClouds() {
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, transparent: true, opacity: 0.15, depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.clouds = [];
    for (let i = 0; i < 6; i++) {
      const g = new THREE.Group();
      const w = 4 + Math.random() * 6;
      const h = 1 + Math.random() * 1.5;
      const d = 1.5 + Math.random() * 2;
      const main = new THREE.Mesh(new THREE.SphereGeometry(w * 0.5, 7, 5), cloudMat);
      main.scale.set(1, 0.4, 0.6);
      g.add(main);
      for (let p = 0; p < 3; p++) {
        const blob = new THREE.Mesh(new THREE.SphereGeometry(w * 0.25, 6, 4), cloudMat);
        const angle = (p / 3) * Math.PI * 2;
        blob.position.set(Math.cos(angle) * w * 0.25, Math.sin(p) * h * 0.15, Math.sin(angle) * d * 0.2);
        blob.scale.set(1, 0.4, 0.6);
        g.add(blob);
      }
      g.position.set(
        -20 + Math.random() * 40,
        15 + Math.random() * 8,
        -20 + Math.random() * 40
      );
      g.userData = { speed: 0.1 + Math.random() * 0.2, startX: g.position.x };
      this.scene.add(g);
      this.clouds.push(g);
    }
  }

  buildDistantSilhouettes() {
    const silMat = new THREE.MeshStandardMaterial({ color: 0x1a2030, roughness: 0.8, metalness: 0.1 });
    // Place silhouette blocks well outside the city edge
    const silhouettes = [
      // North
      { x: -30, z: -45, w: 20, h: 12, d: 4 },
      { x: -5, z: -45, w: 16, h: 18, d: 4 },
      { x: 18, z: -45, w: 22, h: 14, d: 4 },
      // South
      { x: -25, z: 45, w: 18, h: 15, d: 4 },
      { x: 0, z: 45, w: 14, h: 20, d: 4 },
      { x: 20, z: 45, w: 20, h: 12, d: 4 },
      // West
      { x: -45, z: -25, w: 4, h: 16, d: 18 },
      { x: -45, z: 0, w: 4, h: 22, d: 14 },
      { x: -45, z: 20, w: 4, h: 14, d: 20 },
      // East
      { x: 45, z: -22, w: 4, h: 14, d: 16 },
      { x: 45, z: 2, w: 4, h: 20, d: 14 },
      { x: 45, z: 22, w: 4, h: 16, d: 18 },
    ];
    silhouettes.forEach(s => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(s.w, s.h, s.d), silMat);
      mesh.position.set(s.x, s.h / 2, s.z);
      this.scene.add(mesh);
    });
  }

  update(time) {
    this.updateFountain(time);
    this.updateClouds(time);
  }

  updateFountain(time) {
    if (!this.fountainParticles) return;
    const pos = this.fountainParticles.geometry.attributes.position.array;
    const vel = this.fountainVelocities;
    for (let i = 0; i < pos.length / 3; i++) {
      pos[i * 3] += vel[i].x * 0.02;
      pos[i * 3 + 1] += vel[i].y * 0.02;
      pos[i * 3 + 2] += vel[i].z * 0.02;
      vel[i].y -= 0.06;
      if (pos[i * 3 + 1] < 0) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * 0.5;
        pos[i * 3] = Math.cos(a) * r;
        pos[i * 3 + 1] = 0.1;
        pos[i * 3 + 2] = Math.sin(a) * r;
        vel[i].x = (Math.random() - 0.5) * 0.4;
        vel[i].y = 1.5 + Math.random() * 2.0;
        vel[i].z = (Math.random() - 0.5) * 0.4;
      }
    }
    this.fountainParticles.geometry.attributes.position.needsUpdate = true;
    this.updateKioskGlow(time);
    this.updateBuildingWindows(time);
  }

  updateClouds(time) {
    if (!this.clouds) return;
    this.clouds.forEach(c => {
      c.position.x += Math.sin(time * 0.05 + c.userData.startX) * 0.003;
      c.position.z += Math.cos(time * 0.04 + c.userData.startX * 0.5) * 0.003;
      c.position.y += Math.sin(time * 0.03 + c.userData.startX * 0.3) * 0.001;
      c.rotation.z = Math.sin(time * 0.01 + c.userData.startX) * 0.02;
    });
  }

  updateBuildingWindows(time) {
    if (this.buildingWindows.length === 0) return;
    const interval = 2.5 + Math.sin(time * 0.1) * 0.5;
    if (time - this._windowToggleTimer < interval) return;
    this._windowToggleTimer = time;

    const toggles = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < toggles; i++) {
      const bldg = this.buildingWindows[Math.floor(Math.random() * this.buildingWindows.length)];
      const idx = Math.floor(Math.random() * bldg.state.length);
      bldg.state[idx] = !bldg.state[idx];
      const row = Math.floor(idx / bldg.cols);
      const col = idx % bldg.cols;
      const gw = 128 / bldg.cols;
      const gh = 256 / bldg.rows;
      bldg.ctx.fillStyle = bldg.state[idx] ? '#ffe8b0' : '#2d3748';
      bldg.ctx.fillRect(col * gw + 4, row * gh + 4, gw - 8, gh - 8);
      bldg.ctx.strokeStyle = '#2d3748';
      bldg.ctx.lineWidth = 1;
      bldg.ctx.strokeRect(col * gw + 4, row * gh + 4, gw - 8, gh - 8);
      bldg.texture.needsUpdate = true;
    }
  }

  updateKioskGlow(time) {
    if (!this.kioskFrameMat) return;
    const pulse = 0.3 + Math.sin(time * 0.8) * 0.15;
    this.kioskFrameMat.emissiveIntensity = pulse;
    if (this.kioskScreen) {
      this.kioskScreen.material.emissiveIntensity = 0.2 + Math.sin(time * 0.6) * 0.1;
    }
    const archPulse = 0.25 + Math.sin(time * 0.7) * 0.12;
    this.districtGlowStrips.forEach(s => {
      s.material.emissiveIntensity = archPulse;
    });
  }

  dispose() {
    this.buildings.forEach(g => {
      this.scene.remove(g);
      g.traverse(c => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
    });
    this.buildingWindows = [];
    this.districtGlowStrips = [];
  }
}