/* eslint-disable max-classes-per-file */
/* eslint-disable no-console */
import APP_CONFIG from './config.js';

/**
 * A collection of utility functions.
 */
const Utils = {
  escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },
  debounce(func, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },
  getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  },
};

/**
 * Manages dynamic, viewport-aware tooltips that follow the cursor.
 */
class TooltipManager {
  constructor(delay = 500) {
    this.delay = delay;
    this.tooltipEl = null;
    this.showTimeout = null;
    this.currentTarget = null;
    this.createTooltipElement();
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  createTooltipElement() {
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.className = 'tooltip';
    this.tooltipEl.setAttribute('role', 'tooltip');
    document.body.appendChild(this.tooltipEl);
  }

  bind(container) {
    container.addEventListener('mouseover', (e) => {
      const target = e.target.closest('[data-tooltip]');
      if (target) this.handleMouseOver(target, e);
    });

    container.addEventListener('mouseout', (e) => {
      const target = e.target.closest('[data-tooltip]');
      if (target) this.handleMouseOut(target);
    });

    container.addEventListener('focusin', (e) => {
      const target = e.target.closest('[data-tooltip]');
      if (target) this.handleFocusIn(target);
    });

    container.addEventListener('focusout', (e) => {
      const target = e.target.closest('[data-tooltip]');
      if (target) this.handleFocusOut(target);
    });
  }

  handleMouseOver(target, initialEvent) {
    this.currentTarget = target;
    clearTimeout(this.showTimeout);
    this.showTimeout = setTimeout(() => {
      if (this.currentTarget !== target) return;
      target.classList.add('tooltip-active');
      this.show(target);
      this.positionTooltip(initialEvent);
      target.addEventListener('mousemove', this.handleMouseMove);
    }, this.delay);
  }

  handleMouseOut(target) {
    if (this.currentTarget === target) {
      clearTimeout(this.showTimeout);
      target.removeEventListener('mousemove', this.handleMouseMove);
      this.hide();
      this.currentTarget = null;
    }
  }

  handleMouseMove(e) {
    this.positionTooltip(e);
  }

  handleFocusIn(target) {
    this.currentTarget = target;
    clearTimeout(this.showTimeout);
    this.showTimeout = setTimeout(() => {
      if (this.currentTarget !== target) return;
      target.classList.add('tooltip-active');
      this.show(target);
      this.positionTooltip(target);
    }, this.delay);
  }

  handleFocusOut(target) {
    if (this.currentTarget === target) {
      clearTimeout(this.showTimeout);
      this.hide();
      this.currentTarget = null;
    }
  }

  show(target) {
    this.setTooltipContent(target);
    this.tooltipEl.classList.add('visible');
  }

  hide() {
    if (this.currentTarget) {
      this.currentTarget.classList.remove('tooltip-active');
    }
    this.tooltipEl.classList.remove('visible', 'tooltip--marquee');
    this.tooltipEl.innerHTML = '';
  }

  setTooltipContent(target) {
    const key = target.dataset.tooltipKey;
    const staticText = target.dataset.tooltip;

    if (key === 'tooltips.copyright') {
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ');
        const date = new Date();
        const formattedDate = date.toLocaleString(navigator.language || 'en-US', {
          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
        });
        const marqueeText = Utils.escapeHTML(formattedDate);

        this.tooltipEl.classList.add('tooltip--marquee');
        this.tooltipEl.innerHTML = `
          <span class="tooltip__static-text">${Utils.escapeHTML(timezone)} -&nbsp;</span>
          <div class="tooltip__marquee-container">
            <div class="tooltip__marquee-wrapper">
              <span class="tooltip__marquee-text">${marqueeText}</span>
              <span class="tooltip__marquee-text" aria-hidden="true">${marqueeText}</span>
            </div>
          </div>`;
      } catch (error) {
        console.warn('Could not generate dynamic tooltip:', error);
        this.tooltipEl.textContent = staticText;
      }
    } else {
      this.tooltipEl.textContent = staticText;
    }
  }

  positionTooltip(source) {
    const isMouseEvent = source instanceof MouseEvent;
    const gap = 15;
    let top = 0;
    let left = 0;

    // Temporarily show to measure dimensions
    const initialVisibility = this.tooltipEl.style.visibility;
    this.tooltipEl.style.visibility = 'hidden';
    this.tooltipEl.classList.add('visible');
    const tipRect = this.tooltipEl.getBoundingClientRect();
    this.tooltipEl.style.visibility = initialVisibility;

    if (isMouseEvent) {
      top = source.clientY - tipRect.height - gap;
      left = source.clientX - (tipRect.width / 2);
      if (top < gap) top = source.clientY + gap;
    } else { // It's a target element for focus
      const targetRect = source.getBoundingClientRect();
      top = targetRect.top - tipRect.height - gap;
      left = targetRect.left + (targetRect.width / 2) - (tipRect.width / 2);
      if (top < gap) top = targetRect.bottom + gap;
    }

    if (left < gap) {
      left = gap;
    } else if (left + tipRect.width > window.innerWidth - gap) {
      left = window.innerWidth - tipRect.width - gap;
    }

    this.tooltipEl.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
  }
}

/**
 * Manages the application's state.
 */
class StateManager {
  constructor(config) {
    this.config = config;
    this.content = {};
    this.icons = {};
    this.currentLang = localStorage.getItem('lang') || config.defaultLanguage;
    this.currentTheme = localStorage.getItem('theme') || config.defaultTheme;
    this.currentProjectFilter = 'all';
    this.pageId = document.body.id;
  }

  setLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('lang', lang);
  }

  toggleLanguage() {
    const newLang = this.currentLang === 'en' ? 'id' : 'en';
    this.setLanguage(newLang);
    return newLang;
  }

  setTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    return newTheme;
  }
}

/**
 * Handles data fetching and caching.
 */
class DataService {
  constructor(config) {
    this.config = config;
  }

  clearOldCache() {
    const currentVersion = this.config.dataCacheVersion;
    const storedVersion = localStorage.getItem('dataCacheVersion');
    if (storedVersion !== currentVersion) {
      Object.keys(localStorage)
        .filter((key) => key.startsWith('portfolioCache-'))
        .forEach((key) => localStorage.removeItem(key));
      localStorage.setItem('dataCacheVersion', currentVersion);
    }
  }

  async loadData() {
    const contentCacheKey = `portfolioCache-content-${this.config.dataCacheVersion}`;
    const iconsCacheKey = `portfolioCache-icons-${this.config.dataCacheVersion}`;

    const cachedContent = localStorage.getItem(contentCacheKey);
    const cachedIcons = localStorage.getItem(iconsCacheKey);

    if (cachedContent && cachedIcons) {
      return {
        content: JSON.parse(cachedContent),
        icons: JSON.parse(cachedIcons),
      };
    }

    const [contentResult, iconsResult] = await Promise.allSettled([
      fetch('./assets/data/content.json'),
      fetch('./assets/data/icons.json'),
    ]);

    const data = { content: {}, icons: {} };

    if (contentResult.status === 'fulfilled' && contentResult.value.ok) {
      data.content = await contentResult.value.json();
      localStorage.setItem(contentCacheKey, JSON.stringify(data.content));
    } else {
      throw new Error('Failed to load critical content data.');
    }

    if (iconsResult.status === 'fulfilled' && iconsResult.value.ok) {
      data.icons = await iconsResult.value.json();
      localStorage.setItem(iconsCacheKey, JSON.stringify(data.icons));
    } else {
      console.warn('Failed to load icons.json:', iconsResult.reason || iconsResult.value.status);
    }

    return data;
  }
}

/**
 * Manages all DOM interactions and rendering.
 */
class UIManager {
  constructor(state, config) {
    this.state = state;
    this.config = config;
    this.dom = this.cacheDOM();
    this.observer = this.initIntersectionObserver();
    this.templates = {
      home: `
        <section id="hero" class="hero section">
            <div class="container">
                <h1 class="hero__title" tabindex="-1">
                    <span data-content-key="hero.greeting"></span>
                    <span class="hero__name" data-content-key="hero.name"></span>
                    <span class="hero__tagline" data-content-key="hero.tagline"></span>
                </h1>
                <p class="hero__description" data-content-key="hero.description"></p>
                <a href="#projects" class="button" data-content-key="hero.button">View My Work</a>
            </div>
        </section>
        <section id="about" class="about section">
            <div class="container about__container">
                <div class="about__content reveal">
                    <h2 class="section__title" data-content-key="about.title"></h2>
                    <p data-content-key="about.p1"></p>
                    <p data-content-key="about.p2"></p>
                </div>
                <div class="about__skills reveal">
                    <h3 class="about__skills-title" data-content-key="about.skills_title"></h3>
                    <ul class="skills__list" id="skills-list"></ul>
                </div>
            </div>
        </section>
        <section id="experience" class="experience section">
            <div class="container">
                <h2 class="section__title reveal" data-content-key="experience.title"></h2>
                <div class="experience__container reveal">
                    <div class="experience__tabs" id="experience-tabs"></div>
                    <div class="experience__panels" id="experience-panels"></div>
                </div>
            </div>
        </section>
        <section id="projects" class="projects section">
            <div class="container projects__container">
                <h2 class="section__title reveal" data-content-key="projects.title"></h2>
                <div class="project-grid" id="project-grid"></div>
                <div class="project-archive__container">
                    <a href="./archive.html" class="button button--secondary" data-content-key="projects.archive_btn_text"></a>
                </div>
            </div>
        </section>
        <section id="contact" class="contact section">
            <div class="container contact__container reveal">
                <h2 class="section__title" data-content-key="contact.title"></h2>
                <p data-content-key="contact.description"></p>
                <a href="#" class="contact__email" id="contact-email"></a>
                <footer class="site-footer">
                    <div class="contact__socials" id="social-links-container"></div>
                    <p class="copyright" id="copyright-notice"></p>
                </footer>
            </div>
        </section>`,
      archive: `
        <section class="projects section">
            <div class="container">
                <h1 class="section__title reveal" tabindex="-1" data-content-key="projects.archive_title"></h1>
                <div class="project-filters reveal" id="project-filters"></div>
                <div class="project-grid" id="project-grid"></div>
            </div>
        </section>`,
      notFound: `
        <section class="section">
            <div class="container" style="text-align: center;">
                <h1 class="section__title" tabindex="-1" data-content-key="errors.notFound.title"></h1>
                <p data-content-key="errors.notFound.description"></p>
                <a href="/" class="button" style="margin-top: 2rem;" data-content-key="errors.notFound.button"></a>
            </div>
        </section>`,
    };
  }

  cacheDOM() {
    return {
      body: document.body,
      html: document.documentElement,
      header: document.querySelector('.header'),
      appRoot: document.getElementById('app-root'),
      themeToggle: document.getElementById('theme-toggle'),
      langToggle: document.getElementById('lang-toggle'),
      scrollTopBtn: document.querySelector('.scroll-top'),
      menuToggle: document.getElementById('menu-toggle'),
      mainMenu: document.getElementById('main-menu'),
      loader: document.getElementById('loader'),
    };
  }

  initIntersectionObserver() {
    const options = { ...this.config.observerOptions };
    return new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, options);
  }

  renderPageLayout() {
    const pageTemplates = {
      'page-home': this.templates.home,
      'page-archive': this.templates.archive,
      'page-404': this.templates.notFound,
    };
    const template = pageTemplates[this.state.pageId];
    if (template && this.dom.appRoot) {
      this.dom.appRoot.innerHTML = template;
    }
    const focusTarget = this.dom.appRoot?.querySelector('h1[tabindex="-1"]');
    focusTarget?.focus({ preventScroll: true });
  }

  applyTheme() {
    this.dom.html.setAttribute('data-theme', this.state.currentTheme);
  }

  applyLanguage() {
    const langData = this.state.content[this.state.currentLang];
    if (!langData) {
      console.warn(`Language data for "${this.state.currentLang}" not found.`);
      this.hideLoadingState();
      return;
    }

    this.dom.html.lang = this.state.currentLang;
    const pageTitleKeys = {
      'page-home': 'meta.home_title',
      'page-archive': 'meta.archive_title',
      'page-404': 'meta.notFound_title',
    };
    document.title = Utils.getNestedProperty(langData, pageTitleKeys[this.state.pageId]) || 'Portfolio';

    if (this.dom.langToggle) this.dom.langToggle.textContent = this.state.currentLang.toUpperCase();

    document.querySelectorAll('[data-content-key]').forEach((el) => {
      const value = Utils.getNestedProperty(langData, el.dataset.contentKey);
      if (value !== undefined && value !== null && typeof value !== 'object') {
        el.textContent = value;
      }
    });

    this.renderPageSpecificContent(langData);
    this.renderSharedContent(langData);
    this.hideLoadingState();
  }

  applyTooltips(langData) {
    document.querySelectorAll('[data-tooltip-key]').forEach((el) => {
      const tooltipText = Utils.getNestedProperty(langData, el.dataset.tooltipKey);
      if (tooltipText) {
        el.setAttribute('data-tooltip', tooltipText);
      } else {
        el.setAttribute('data-tooltip', '');
      }
    });
  }

  renderPageSpecificContent(langData) {
    const pageRenderers = {
      'page-home': () => this.renderHomePageContent(langData),
      'page-archive': () => this.renderArchivePageContent(langData),
    };
    pageRenderers[this.state.pageId]?.();
  }

  renderSharedContent(langData) {
    const socialLinksContainer = document.getElementById('social-links-container');
    const copyrightNotice = document.getElementById('copyright-notice');
    if (socialLinksContainer) this.renderSocials(socialLinksContainer);
    if (copyrightNotice) {
      copyrightNotice.textContent = `© ${new Date().getFullYear()}`;
      copyrightNotice.setAttribute('data-tooltip-key', 'tooltips.copyright');
    }
    this.applyTooltips(langData);
  }

  renderHomePageContent(langData) {
    this.renderSkills(langData.about?.skills || []);
    this.renderExperience(langData);
    this.renderFeaturedProjects(langData);
    const contactEmailLink = document.getElementById('contact-email');
    if (contactEmailLink) {
      const email = this.state.content._shared?.contact?.email;
      if (email) {
        contactEmailLink.href = `mailto:${email}`;
        contactEmailLink.textContent = email;
        contactEmailLink.setAttribute('data-tooltip-key', 'tooltips.email');
      }
    }
  }

  renderArchivePageContent(langData) {
    this.renderProjectFilters(langData.projects?.filters || {});
    this.renderAllProjects(langData);
  }

  renderSkills(skills) {
    const container = document.getElementById('skills-list');
    if (!container) return;
    container.innerHTML = skills.map((skill) => `<li>${Utils.escapeHTML(skill)}</li>`).join('');
  }

  renderExperience(langData) {
    const tabsContainer = document.getElementById('experience-tabs');
    const panelsContainer = document.getElementById('experience-panels');
    if (!tabsContainer || !panelsContainer) return;

    const sharedJobs = this.state.content._shared?.experience || [];
    const localizedContent = langData.experience?.job_content || {};
    const jobs = sharedJobs.map((job) => ({
      ...job,
      ...(localizedContent[job.id] || { role: job.id, description: '' }),
    }));

    if (jobs.length === 0) return;

    tabsContainer.innerHTML = jobs.map((job, index) => `
      <button type="button" role="tab" class="experience__tab-btn ${index === 0 ? 'active' : ''}" data-index="${index}">
        ${Utils.escapeHTML(job.company)}
      </button>`).join('');
    tabsContainer.setAttribute('role', 'tablist');

    panelsContainer.innerHTML = jobs.map((job, index) => `
      <div class="experience__panel ${index === 0 ? 'active' : ''}" data-index="${index}">
        <h3 class="experience__role">${Utils.escapeHTML(job.role)}</h3>
        <p class="experience__period">${Utils.escapeHTML(job.period)}</p>
        <p class="experience__description">${Utils.escapeHTML(job.description)}</p>
      </div>`).join('');
  }

  renderProjectFilters(filters) {
    const container = document.getElementById('project-filters');
    if (!container) return;
    container.innerHTML = Object.entries(filters).map(([key, value]) => `
      <button type="button" class="filter-btn ${key === 'all' ? 'active' : ''}" data-filter-key="${key}">
        ${value}
      </button>`).join('');
  }

  renderFeaturedProjects(langData) {
    const allProjects = this.getLocalizedProjects(langData);
    const featured = allProjects.slice(0, this.config.featuredProjectsCount);
    this.renderProjectGrid(featured, langData);
  }

  renderAllProjects(langData) {
    const allProjects = this.getLocalizedProjects(langData);
    const filtered = this.state.currentProjectFilter === 'all'
      ? allProjects
      : allProjects.filter((p) => (p.tags || []).includes(this.state.currentProjectFilter));
    this.renderProjectGrid(filtered, langData);
  }

  getLocalizedProjects(langData) {
    const sharedProjects = this.state.content._shared?.projects || [];
    const localizedContent = langData.project_content || {};
    return sharedProjects.map((proj) => ({
      ...proj,
      ...(localizedContent[proj.id] || { title: proj.id, description: '' }),
    }));
  }

  renderProjectGrid(projects, langData) {
    const container = document.getElementById('project-grid');
    if (!container) return;
    const filters = langData.projects?.filters || {};
    container.innerHTML = projects.map((p) => this.createProjectCard(p, filters)).join('');
    this.reObserveDynamicContent();
    this.applyTooltips(langData);
  }

  createProjectCard(project, filters) {
    const tagsHTML = (project.tags || [])
      .map((tag) => `<span class="project-card__tag">${Utils.escapeHTML(filters[tag] || tag)}</span>`)
      .join('');
    const liveLink = project.live_url ? `<a href="${Utils.escapeHTML(project.live_url)}" class="project-card__link" target="_blank" rel="noopener noreferrer" aria-label="View live demo for ${Utils.escapeHTML(project.title)}" data-tooltip-key="tooltips.liveDemo">Live Demo</a>` : '';
    const codeLink = project.code_url ? `<a href="${Utils.escapeHTML(project.code_url)}" class="project-card__link" target="_blank" rel="noopener noreferrer" aria-label="View source code for ${Utils.escapeHTML(project.title)}" data-tooltip-key="tooltips.viewCode">View Code</a>` : '';
    const imageSrc = project.image || '';
    const webpSrc = imageSrc.startsWith('http') ? imageSrc : imageSrc.replace(/\.(jpe?g|png)$/i, '.webp');

    return `
      <article class="project-card reveal">
        <picture>
          <source srcset="${Utils.escapeHTML(webpSrc)}" type="image/webp">
          <source srcset="${Utils.escapeHTML(imageSrc)}" type="image/jpeg">
          <img src="${Utils.escapeHTML(imageSrc)}" alt="${Utils.escapeHTML(project.title)}" class="project-card__image" loading="lazy" width="800" height="450">
        </picture>
        <div class="project-card__content">
          <h3 class="project-card__title">${Utils.escapeHTML(project.title)}</h3>
          <p class="project-card__description">${Utils.escapeHTML(project.description)}</p>
          <div class="project-card__tags">${tagsHTML}</div>
          <div class="project-card__links">${liveLink}${codeLink}</div>
        </div>
      </article>`;
  }

  renderSocials(container) {
    container.innerHTML = (this.config.socialLinks || []).map((social) => `
      <a href="${social.url}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="${social.name}" data-tooltip-key="tooltips.social.${social.name.toLowerCase()}">
        <span data-icon-key="${social.iconKey || social.name}"></span>
      </a>`).join('');
    this.populateIcons(container);
  }

  populateIcons(container = document) {
    if (!this.state.icons) return;
    container.querySelectorAll('[data-icon-key]').forEach((el) => {
      const iconData = this.state.icons[el.dataset.iconKey];
      if (!iconData) {
        el.innerHTML = '';
        return;
      }
      if (iconData.trim().startsWith('<svg')) {
        el.innerHTML = iconData.replace('<svg', '<svg aria-hidden="true" focusable="false"');
      } else {
        el.innerHTML = `<img src="${Utils.escapeHTML(iconData)}" alt="" class="icon-img" aria-hidden="true">`;
      }
    });
  }

  setRandomFavicon() {
    if (!this.state.icons) return;
    const logoKeys = Object.keys(this.state.icons).filter((key) => key.startsWith('logo_'));
    if (logoKeys.length > 0) {
      const randomLogoKey = logoKeys[Math.floor(Math.random() * logoKeys.length)];
      const logoUrl = this.state.icons[randomLogoKey];
      document.getElementById('favicon-ico')?.setAttribute('href', logoUrl);
      document.getElementById('favicon-apple')?.setAttribute('href', logoUrl);
    }
  }

  toggleMenu(forceClose = false) {
    const shouldBeOpen = !this.dom.body.classList.contains('nav-open');
    if (forceClose) {
      this.dom.body.classList.remove('nav-open');
      this.dom.menuToggle?.setAttribute('aria-expanded', 'false');
    } else {
      this.dom.body.classList.toggle('nav-open', shouldBeOpen);
      this.dom.menuToggle?.setAttribute('aria-expanded', String(shouldBeOpen));
    }
  }

  handleScroll() {
    this.dom.header?.classList.toggle('scrolled', window.scrollY > 50);
    this.dom.scrollTopBtn?.classList.toggle('visible', window.scrollY > 300);
  }

  reObserveDynamicContent() {
    document.querySelectorAll('.reveal:not(.visible)').forEach((el) => this.observer?.observe(el));
  }

  hideLoadingState() {
    this.dom.body.classList.remove('loading-content');
    this.dom.loader?.classList.add('hidden');
  }

  renderError(message) {
    this.hideLoadingState();
    if (!this.dom.appRoot) return;

    this.dom.appRoot.innerHTML = this.templates.notFound;
    document.title = 'Error | Portfolio';

    const titleEl = this.dom.appRoot.querySelector('[data-content-key="errors.notFound.title"]');
    const descEl = this.dom.appRoot.querySelector('[data-content-key="errors.notFound.description"]');
    const btnEl = this.dom.appRoot.querySelector('[data-content-key="errors.notFound.button"]');

    if (titleEl) titleEl.textContent = 'An Error Occurred';
    if (descEl) descEl.textContent = message;
    if (btnEl) btnEl.style.display = 'none';
  }
}

/**
 * The main application orchestrator.
 */
class App {
  constructor(config) {
    this.state = new StateManager(config);
    this.dataService = new DataService(config);
    this.ui = new UIManager(this.state, config);
    this.tooltipManager = new TooltipManager();
  }

  async init() {
    try {
      this.dataService.clearOldCache();
      const { content, icons } = await this.dataService.loadData();
      this.state.content = content;
      this.state.icons = icons;

      this.ui.setRandomFavicon();
      this.ui.populateIcons();
      this.ui.applyTheme();
      this.bindEventListeners();
      this.tooltipManager.bind(document.body);
      this.ui.renderPageLayout();
      this.ui.applyLanguage();
    } catch (error) {
      console.error('Application initialization failed:', error);
      this.ui.renderError('The portfolio content could not be loaded. Please check your connection and try again later.');
    }
  }

  bindEventListeners() {
    this.ui.dom.themeToggle?.addEventListener('click', () => {
      this.state.toggleTheme();
      this.ui.applyTheme();
    });

    this.ui.dom.langToggle?.addEventListener('click', () => {
      this.state.toggleLanguage();
      this.ui.applyLanguage();
    });

    this.ui.dom.menuToggle?.addEventListener('click', () => this.ui.toggleMenu());
    this.ui.dom.mainMenu?.addEventListener('click', (e) => {
      if (e.target.classList.contains('nav__link')) this.ui.toggleMenu(true);
    });

    this.ui.dom.scrollTopBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', Utils.debounce(() => this.ui.handleScroll(), this.state.config.scrollDebounceDelay));

    this.ui.dom.appRoot?.addEventListener('click', (e) => {
      this.handleDynamicEvents(e);
    });
  }

  handleDynamicEvents(e) {
    const experienceTab = e.target.closest('.experience__tab-btn');
    if (experienceTab) {
      const { index } = experienceTab.dataset;
      const tabsContainer = experienceTab.parentElement;
      const panelsContainer = tabsContainer.nextElementSibling;
      tabsContainer.querySelector('.active')?.classList.remove('active');
      panelsContainer.querySelector('.active')?.classList.remove('active');
      experienceTab.classList.add('active');
      panelsContainer.querySelector(`[data-index="${index}"]`)?.classList.add('active');
      return;
    }

    const filterButton = e.target.closest('.filter-btn');
    if (filterButton) {
      this.state.currentProjectFilter = filterButton.dataset.filterKey;
      filterButton.parentElement.querySelector('.active')?.classList.remove('active');
      filterButton.classList.add('active');
      this.ui.renderAllProjects(this.state.content[this.state.currentLang]);
    }
  }
}

// --- Application Entry Point ---
try {
  const app = new App(APP_CONFIG);
  document.addEventListener('DOMContentLoaded', () => app.init());
} catch (error) {
  console.error('Fatal synchronous error during app setup:', error);
  document.getElementById('loader')?.classList.add('hidden');
  const appRoot = document.getElementById('app-root');
  if (appRoot) {
    appRoot.innerHTML = '<p style="text-align: center; padding: 2rem;">A fatal error occurred. Please try refreshing the page.</p>';
  }
}
