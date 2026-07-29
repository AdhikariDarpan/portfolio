import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { CONFIG } from '../config.js';
import { SKILLS, EXP, PROJECTS } from '../data.js';

export class PanelManager {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.panels = new Map();
    this.labelRenderer = null;
    this.openPanel = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.onPanelClick = null;
  }

  init(labelRenderer, onPanelClick) {
    this.labelRenderer = labelRenderer;
    this.onPanelClick = onPanelClick;
    // City buildings replace the 3D panels — content overlay system is kept
  }

  createPanel(key, config) {
    const group = new THREE.Group();
    group.name = `panel-${key}`;

    const panelGeo = new THREE.PlaneGeometry(5, 3.5);
    const panelMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a0f1a,
      metalness: 0.1,
      roughness: 0.2,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
    });

    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.name = 'panel-surface';
    group.add(panel);

    const frameGeo = new THREE.BoxGeometry(5.1, 3.6, 0.05);
    const frameMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f5d4,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x00f5d4,
      emissiveIntensity: 0.3,
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.z = -0.03;
    group.add(frame);

    const innerGlowGeo = new THREE.PlaneGeometry(4.8, 3.3);
    const innerGlowMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      transparent: true,
      opacity: 0.03,
      side: THREE.DoubleSide,
    });
    const innerGlow = new THREE.Mesh(innerGlowGeo, innerGlowMat);
    innerGlow.position.z = 0.02;
    group.add(innerGlow);

    group.position.set(config.pos[0], config.pos[1], config.pos[2]);
    group.rotation.set(config.rot[0], config.rot[1], config.rot[2]);

    const labelDiv = document.createElement('div');
    labelDiv.className = 'panel-label-3d';
    labelDiv.innerHTML = `
      <span class="panel-label-text">${config.label}</span>
      <span class="panel-hint">Click to explore</span>
    `;
    const label = new CSS2DObject(labelDiv);
    label.position.set(0, 2.2, 0.1);
    group.add(label);

    group.userData = { key, config, isInteractive: true };

    this.scene.add(group);
    this.panels.set(key, group);
  }

  getIntersects(clientX, clientY) {
    this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const panelObjects = [];
    this.panels.forEach(panel => panelObjects.push(panel));
    return this.raycaster.intersectObjects(panelObjects, true);
  }

  handleClick(clientX, clientY) {
    const intersects = this.getIntersects(clientX, clientY);
    if (intersects.length > 0) {
      const panelGroup = intersects[0].object;
      let parent = panelGroup.parent;
      while (parent && !parent.userData.key) {
        parent = parent.parent;
      }
      if (parent && parent.userData.key && this.onPanelClick) {
        this.onPanelClick(parent.userData.key, parent);
        return parent.userData.key;
      }
    }
    return null;
  }

  getPanel(key) {
    return this.panels.get(key);
  }

  getAllPanels() {
    return Array.from(this.panels.values());
  }

  highlightPanel(key, highlight) {
    const panel = this.panels.get(key);
    if (!panel) return;
    const surface = panel.getObjectByName('panel-surface');
    const frame = panel.children.find(c => c.geometry && c.geometry.type === 'BoxGeometry');
    if (surface) {
      surface.material.emissive = highlight ? new THREE.Color(0x00f5d4) : new THREE.Color(0x000000);
      surface.material.emissiveIntensity = highlight ? 0.2 : 0;
    }
    if (frame) {
      frame.material.emissiveIntensity = highlight ? 0.8 : 0.3;
    }
  }

  openPanelContent(key) {
    this.openPanel = key;
    const panel = this.panels.get(key);
    if (!panel) return;

    const contentDiv = document.getElementById('panel-content');
    if (!contentDiv) return;

    const config = CONFIG.panels[key];
    let html = '';

    switch (key) {
      case 'about':
        html = this.getAboutHTML(config);
        break;
      case 'skills':
        html = this.getSkillsHTML(config);
        break;
      case 'projects':
        html = this.getProjectsHTML(config);
        break;
      case 'contact':
        html = this.getContactHTML(config);
        break;
    }

    contentDiv.innerHTML = html;
    contentDiv.classList.remove('ui-hidden');
    contentDiv.classList.add('open');
    this.setupPanelInteractions(key);
  }

  closePanelContent() {
    const contentDiv = document.getElementById('panel-content');
    if (contentDiv) {
      contentDiv.classList.remove('open');
      contentDiv.innerHTML = '';
    }
    this.openPanel = null;
  }

  getAboutHTML(config) {
    return `
      <div class="panel-content-3d">
        <div class="panel-header">
          <span class="panel-label">${config.label}</span>
          <h2>${config.title}</h2>
          <div class="panel-divider"></div>
        </div>
        <p>${config.content}</p>
        <div class="panel-stats">
          ${config.stats.map(s => `<div class="pstat"><span class="pstat-n">${s.value}</span><span class="pstat-l">${s.label}</span></div>`).join('')}
        </div>
        <div style="margin-top:1.5rem">
          ${EXP.map(e => `
            <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:1rem 1.2rem;margin-bottom:.8rem">
              <div style="font-size:.85rem;font-weight:600;color:var(--cyan)">${e.role}</div>
              <div style="font-size:.75rem;color:var(--muted);margin:.2rem 0 .6rem">${e.company} · ${e.period}</div>
              <p style="font-size:.8rem;color:var(--white);line-height:1.6;margin-bottom:.6rem">${e.desc}</p>
              <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:.3rem">
                ${e.achievements.slice(0, 4).map(a => `<li style="font-size:.75rem;color:var(--muted);display:flex;gap:.5rem"><span style="color:var(--cyan);flex-shrink:0">▸</span>${a}</li>`).join('')}
              </ul>
              <div style="display:flex;gap:.3rem;flex-wrap:wrap;margin-top:.6rem">
                ${e.tags.slice(0, 4).map(t => `<span style="font-size:.6rem;padding:.15rem .5rem;border-radius:3px;background:rgba(0,245,212,.08);border:1px solid rgba(0,245,212,.15);color:var(--cyan)">${t}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  getSkillsHTML(config) {
    const firstTab = config.tabs[0];
    const skills = SKILLS[firstTab] || [];
    return `
      <div class="panel-content-3d">
        <div class="panel-header">
          <span class="panel-label">${config.label}</span>
          <h2>${config.title}</h2>
          <div class="panel-divider"></div>
        </div>
        <div class="skills-tabs-g">
          ${config.tabs.map(t => `<button class="stab-btn ${t === firstTab ? 'active' : ''}" data-sk="${t}">${t.charAt(0).toUpperCase() + t.slice(1)}</button>`).join('')}
        </div>
        <div id="skills-detail-3d" class="skills-detail-g">
          ${skills.map(s => `<div class="tech-card"><div class="tech-icon">${s.icon}</div><div class="tech-info"><div class="tech-name">${s.name}</div><div class="tech-level">${s.level}</div><div class="tech-bar-mini"><div class="tech-bar-fill" data-w="${s.pct}"></div></div></div></div>`).join('')}
        </div>
      </div>
    `;
  }

  getCategoryLabel(cat) {
    const map = {
      web: 'Web', frontend: 'Web', backend: 'Web', fullstack: 'Web',
      ai: 'AI', nlp: 'AI', 'computer-vision': 'AI', ocr: 'AI', 'image-processing': 'AI',
      translation: 'AI', 'local-ai': 'AI', security: 'AI',
      mobile: 'Mobile',
      desktop: 'Desktop',
      tools: 'Tools', package: 'Tools', pwa: 'Tools', productivity: 'Tools',
      'developer-tools': 'Tools', canvas: 'Tools', firebase: 'Tools',
    };
    return map[cat] || 'Other';
  }

  getUniqueCategories() {
    const cats = new Set();
    PROJECTS.forEach(p => {
      if (p.cats) p.cats.forEach(c => cats.add(this.getCategoryLabel(c)));
    });
    return ['All', ...Array.from(cats).sort()];
  }

  getProjectsHTML(config) {
    const categories = this.getUniqueCategories();
    const projHTML = PROJECTS.map((p, idx) => `
      <div class="proj-card-3d" data-proj-idx="${idx}" data-proj-cats="${(p.cats||[]).map(c => this.getCategoryLabel(c)).join(',')}" style="display:${idx === 0 ? '' : 'none'}">
        <div class="proj-img-3d">
          <div class="proj-img-bg-3d" style="background:${p.gradient || 'var(--bg2)'}"></div>
          ${p.image ? `<img src="${p.image}" alt="${p.name}" class="proj-img-thumb-3d" loading="lazy">` : `<div class="proj-emoji-3d">${p.emoji}</div>`}
        </div>
        <div class="proj-body-3d">
          <div class="proj-tags-3d">${(p.tags||[]).slice(0,4).map(t => `<span class="ptag-3d">${t}</span>`).join('')}</div>
          <div class="proj-name-3d">${p.name}</div>
          <div class="proj-desc-3d">${p.desc}</div>
        </div>
      </div>
    `).join('');

    return `
      <div class="panel-content-3d">
        <div class="panel-header">
          <span class="panel-label">${config.label}</span>
          <h2>${config.title}</h2>
          <div class="panel-divider"></div>
        </div>
        <div class="proj-categories-3d" id="proj-categories-3d">
          ${categories.map(c => `<button class="proj-cat-btn ${c === 'All' ? 'active' : ''}" data-cat="${c}">${c}</button>`).join('')}
        </div>
        <div class="proj-scroll" id="proj-scroll-3d">
          <button class="carousel-btn carousel-prev" id="carousel-prev">‹</button>
          <div class="carousel-viewport" id="carousel-viewport">
            ${projHTML}
          </div>
          <button class="carousel-btn carousel-next" id="carousel-next">›</button>
          <div class="carousel-footer" id="carousel-footer">
            <span class="carousel-counter" id="carousel-counter">1 / ${PROJECTS.length}</span>
          </div>
          <div class="carousel-dots" id="carousel-dots"></div>
        </div>
      </div>
    `;
  }

  getContactHTML(config) {
    return `
      <div class="panel-content-3d">
        <div class="panel-header">
          <span class="panel-label">${config.label}</span>
          <h2>${config.title}</h2>
          <div class="panel-divider"></div>
        </div>
        <p class="contact-tagline">${config.content}</p>
        <div class="contact-links-3d">
          ${config.links.map(l => `<a href="${l.url}" ${l.external ? 'target="_blank"' : ''} class="clink-3d"><span class="clink-icon-3d">${l.icon}</span><span class="clink-text-3d">${l.text}</span></a>`).join('')}
        </div>
      </div>
    `;
  }

  setupPanelInteractions(key) {
    if (key === 'skills') {
      document.querySelectorAll('#panel-content .stab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('#panel-content .stab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const tab = btn.dataset.sk;
          const skills = SKILLS[tab] || [];
          const detail = document.getElementById('skills-detail-3d');
          if (detail) {
            detail.innerHTML = skills.map(s => `<div class="tech-card"><div class="tech-icon">${s.icon}</div><div class="tech-info"><div class="tech-name">${s.name}</div><div class="tech-level">${s.level}</div><div class="tech-bar-mini"><div class="tech-bar-fill" data-w="${s.pct}"></div></div></div></div>`).join('');
            setTimeout(() => {
              detail.querySelectorAll('.tech-bar-fill').forEach(f => f.style.width = f.dataset.w + '%');
            }, 50);
          }
        });
      });
      setTimeout(() => {
        document.querySelectorAll('#skills-detail-3d .tech-bar-fill').forEach(f => f.style.width = f.dataset.w + '%');
      }, 50);
    }

    if (key === 'projects') {
      const viewport = document.getElementById('carousel-viewport');
      const prevBtn = document.getElementById('carousel-prev');
      const nextBtn = document.getElementById('carousel-next');
      const counter = document.getElementById('carousel-counter');

      const getVisibleCards = () => {
        const all = viewport ? Array.from(viewport.querySelectorAll('.proj-card-3d')) : [];
        return all.filter(c => !c.classList.contains('cat-hidden'));
      };

      const getActiveIndex = (cards) => {
        const idx = cards.findIndex(c => c.classList.contains('carousel-active'));
        return idx >= 0 ? idx : 0;
      };

      const showCard = (cards, idx) => {
        cards.forEach((c, i) => {
          c.classList.toggle('carousel-active', i === idx);
          c.style.display = i === idx ? '' : 'none';
        });
        if (counter) {
          const total = cards.length;
          const shownIdx = cards.findIndex(c => c.classList.contains('carousel-active'));
          counter.textContent = `${shownIdx + 1} / ${total}`;
        }
      };

      const navigateCarousel = (dir) => {
        const cards = getVisibleCards();
        if (cards.length === 0) return;
        const cur = getActiveIndex(cards);
        let next = cur + dir;
        if (next < 0) next = cards.length - 1;
        if (next >= cards.length) next = 0;
        showCard(cards, next);
      };

      // Category tabs
      document.querySelectorAll('#proj-categories-3d .proj-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('#proj-categories-3d .proj-cat-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const cat = btn.dataset.cat;
          const allCards = viewport ? Array.from(viewport.querySelectorAll('.proj-card-3d')) : [];
          let firstVisible = null;
          allCards.forEach(card => {
            const match = cat === 'All' || (card.dataset.projCats || '').split(',').includes(cat);
            card.classList.toggle('cat-hidden', !match);
            if (match && !firstVisible) firstVisible = card;
          });
          const visible = allCards.filter(c => !c.classList.contains('cat-hidden'));
          visible.forEach(c => c.classList.remove('carousel-active'));
          if (visible.length > 0) {
            visible[0].classList.add('carousel-active');
          }
          showCard(visible, 0);
        });
      });

      // Arrow navigation
      if (prevBtn) prevBtn.addEventListener('click', () => navigateCarousel(-1));
      if (nextBtn) nextBtn.addEventListener('click', () => navigateCarousel(1));

      // Keyboard navigation
      const onKey = (e) => {
        if (this.openPanel !== 'projects') return;
        if (e.key === 'ArrowLeft') navigateCarousel(-1);
        if (e.key === 'ArrowRight') navigateCarousel(1);
      };
      document.addEventListener('keydown', onKey);

      // Project card clicks
      document.querySelectorAll('.proj-card-3d').forEach(card => {
        card.addEventListener('click', () => {
          const idx = parseInt(card.dataset.projIdx);
          const proj = PROJECTS[idx];
          if (proj) this.showProjectModal(proj);
        });
      });

      // Init first card
      const initCards = viewport ? Array.from(viewport.querySelectorAll('.proj-card-3d')) : [];
      initCards.forEach(c => c.classList.remove('carousel-active'));
      const firstCard = initCards.find(c => c.style.display !== 'none');
      if (firstCard) firstCard.classList.add('carousel-active');
      if (counter) counter.textContent = `1 / ${initCards.length}`;
    }
  }

  showProjectModal(proj) {
    const modal = document.getElementById('proj-modal');
    const body = document.getElementById('modal-body');
    if (!modal || !body) return;

    body.innerHTML = `
      <div class="modal-header-3d">
        <h2>${proj.name}</h2>
        <p>${proj.desc}</p>
      </div>
      <div class="modal-features-3d">
        <h3>Key Features</h3>
        <ul>${proj.features.map(f => `<li>${f}</li>`).join('')}</ul>
      </div>
      <div class="modal-tech-3d">
        <h3>Tech Stack</h3>
        <div class="tech-list-3d">${proj.tags.map(t => `<span class="tech-chip-3d">${t}</span>`).join('')}</div>
      </div>
    `;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  update(delta) {
    this.panels.forEach(panel => {
      const frame = panel.children.find(c => c.geometry && c.geometry.type === 'BoxGeometry');
      if (frame) {
        frame.rotation.z = Math.sin(Date.now() * 0.001 + panel.position.x) * 0.01;
      }
    });
  }

  dispose() {
    this.panels.forEach(panel => {
      this.scene.remove(panel);
      panel.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
    });
    this.panels.clear();
  }
}