import APP_CONFIG from './config.js';

const TEMPLATES = {
  home: `
        <section id="hero" class="hero section">
            <div class="container">
                <h1 class="hero__title" tabindex="-1">
                    <span data-content-key="hero.greeting"></span>
                    <span class="hero__name" data-content-key="hero.name"></span>
                    <span class="hero__tagline" data-content-key="hero.tagline"></span>
                </h1>
                <p class="hero__description" data-content-key="hero.description"></p>
                <a href="#projects" class="button">View My Work</a>
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

class PortfolioApp {
  constructor(config) {
    this.config = config;
    this.content = {};
    this.icons = {};
    this.currentLang = localStorage.getItem('lang') || this.config.defaultLanguage || 'en';
    this.currentTheme = localStorage.getItem('theme') || this.config.defaultTheme || 'light';
    this.currentProjectFilter = 'all';
    this.observer = null;
    this.pageId = document.body.id;
    this.dom = {};
  }

  async init() {
    this._clearOldCache();
    this._setupDOM();
    this._initIntersectionObserver();

    try {
      await this._loadData();
      this._setRandomFavicon();
      this._populateIcons();
      this._applyTheme();
      this._bindEventListeners();
      this._renderPage();
    } catch (error) {
      this._renderError(error);
    }
  }

  _setupDOM() {
    this.dom = {
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

  _clearOldCache() {
    const currentVersion = this.config.dataCacheVersion || 'v1.0.0';
    const storedVersion = localStorage.getItem('dataCacheVersion');

    if (storedVersion !== currentVersion) {
      Object.keys(localStorage)
        .filter((key) => key.startsWith('portfolioCache-'))
        .forEach((key) => localStorage.removeItem(key));
      localStorage.setItem('dataCacheVersion', currentVersion);
    }
  }

  async _loadData() {
    const contentCacheKey = `portfolioCache-content-${this.config.dataCacheVersion}`;
    const iconsCacheKey = `portfolioCache-icons-${this.config.dataCacheVersion}`;

    try {
      const cachedContent = localStorage.getItem(contentCacheKey);
      const cachedIcons = localStorage.getItem(iconsCacheKey);

      if (cachedContent && cachedIcons) {
        this.content = JSON.parse(cachedContent);
        this.icons = JSON.parse(cachedIcons);
        return;
      }

      const [contentResult, iconsResult] = await Promise.allSettled([
        fetch('./assets/data/content.json'),
        fetch('./assets/data/icons.json'),
      ]);

      if (contentResult.status === 'fulfilled' && contentResult.value.ok) {
        const contentJson = await contentResult.value.json();
        this.content = contentJson;
        localStorage.setItem(contentCacheKey, JSON.stringify(contentJson));
      } else {
        console.error('Failed to load content.json:', contentResult.reason || contentResult.value.status);
        throw new Error('Failed to load critical content data.');
      }

      if (iconsResult.status === 'fulfilled' && iconsResult.value.ok) {
        const iconsJson = await iconsResult.value.json();
        this.icons = iconsJson;
        localStorage.setItem(iconsCacheKey, JSON.stringify(iconsJson));
      } else {
        console.warn('Failed to load icons.json:', iconsResult.reason || iconsResult.value.status);
        this.icons = {};
      }
    } catch (error) {
      console.error('Error in _loadData:', error);
      throw error;
    }
  }

  _renderError(error) {
    console.error('Application initialization failed:', error);

    this.dom.loader?.classList.add('hidden');

    if (!this.dom.appRoot) return;

    this.dom.appRoot.innerHTML = TEMPLATES.notFound;
    document.title = 'Error | Portfolio';

    const titleEl = this.dom.appRoot.querySelector('[data-content-key="errors.notFound.title"]');
    const descEl = this.dom.appRoot.querySelector('[data-content-key="errors.notFound.description"]');
    const btnEl = this.dom.appRoot.querySelector('[data-content-key="errors.notFound.button"]');

    if (titleEl) titleEl.textContent = 'An Error Occurred';
    if (descEl) descEl.textContent = 'The portfolio content could not be loaded. Please check your connection and try again later.';
    if (btnEl) btnEl.style.display = 'none';

    this.dom.body.classList.remove('loading-content');
  }

  _setRandomFavicon() {
    if (!this.icons) return;

    const logoKeys = Object.keys(this.icons).filter((key) => key.startsWith('logo_'));

    if (logoKeys.length > 0) {
      const randomIndex = Math.floor(Math.random() * logoKeys.length);
      const randomLogoKey = logoKeys[randomIndex];
      const logoUrl = this.icons[randomLogoKey];

      const faviconIco = document.getElementById('favicon-ico');
      const faviconApple = document.getElementById('favicon-apple');

      if (faviconIco) faviconIco.href = logoUrl;
      if (faviconApple) faviconApple.href = logoUrl;
    }
  }

  _bindEventListeners() {
    this.dom.themeToggle?.addEventListener('click', () => this._toggleTheme());
    this.dom.langToggle?.addEventListener('click', () => this._toggleLanguage());
    this.dom.menuToggle?.addEventListener('click', () => this._toggleMenu());

    this.dom.mainMenu?.addEventListener('click', (e) => {
      if (e.target.classList.contains('nav__link')) {
        this._toggleMenu(true);
      }
    });

    this.dom.scrollTopBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const debouncedScrollHandler = this._debounce(
      () => this._handleScroll(),
      this.config.scrollDebounceDelay,
    );
    window.addEventListener('scroll', debouncedScrollHandler);
  }

  _renderPage() {
    const pageRenderers = {
      'page-home': this._renderHomePage,
      'page-archive': this._renderArchivePage,
      'page-404': this._render404Page,
    };
    const renderFunction = pageRenderers[this.pageId];
    if (renderFunction) {
      renderFunction.call(this);
      this._applyLanguage();
      this._manageFocus();
    }
  }

  _manageFocus() {
    const focusTarget = this.dom.appRoot?.querySelector('h1[tabindex="-1"]');
    focusTarget?.focus({ preventScroll: true });
  }

  _renderHomePage() {
    if (!this.dom.appRoot) return;
    this.dom.appRoot.innerHTML = TEMPLATES.home;
  }

  _renderArchivePage() {
    if (!this.dom.appRoot) return;
    this.dom.appRoot.innerHTML = TEMPLATES.archive;
  }

  _render404Page() {
    if (!this.dom.appRoot) return;
    this.dom.appRoot.innerHTML = TEMPLATES.notFound;
  }

  _toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', this.currentTheme);
    this._applyTheme();
  }

  _applyTheme() {
    this.dom.html.setAttribute('data-theme', this.currentTheme);
  }

  _toggleLanguage() {
    this.currentLang = this.currentLang === 'en' ? 'id' : 'en';
    localStorage.setItem('lang', this.currentLang);
    this._applyLanguage();
  }

  _toggleMenu(forceClose = false) {
    const isMenuOpen = this.dom.body.classList.contains('nav-open');
    const shouldBeOpen = !isMenuOpen;

    if (forceClose) {
      this.dom.body.classList.remove('nav-open');
      this.dom.menuToggle?.setAttribute('aria-expanded', 'false');
    } else {
      this.dom.body.classList.toggle('nav-open', shouldBeOpen);
      this.dom.menuToggle?.setAttribute('aria-expanded', String(shouldBeOpen));
    }
  }

  _applyLanguage() {
    const langData = this.content[this.currentLang];
    if (!langData) {
      console.warn(`Language data for "${this.currentLang}" not found.`);
      // Hide loader even if language data is missing but content loaded
      this.dom.loader?.classList.add('hidden');
      return;
    }

    this.dom.html.lang = this.currentLang;
    const pageTitleKeys = {
      'page-home': 'home_title',
      'page-archive': 'archive_title',
      'page-404': 'notFound_title',
    };
    document.title = langData.meta?.[pageTitleKeys[this.pageId]] || 'Portfolio';

    if (this.dom.langToggle) this.dom.langToggle.textContent = this.currentLang.toUpperCase();

    document.querySelectorAll('[data-content-key]').forEach((el) => {
      const key = el.dataset.contentKey;
      const value = key.split('.').reduce((obj, k) => obj?.[k], langData);
      if (value !== undefined && value !== null && typeof value !== 'object') {
        el.textContent = value;
      }
    });

    const pageContentRenderers = {
      'page-home': this._renderHomePageContent,
      'page-archive': this._renderArchivePageContent,
    };
    pageContentRenderers[this.pageId]?.call(this, langData);

    this._renderSharedContent();

    if (this.dom.body.classList.contains('loading-content')) {
      this.dom.body.classList.remove('loading-content');
    }

    this.dom.loader?.classList.add('hidden');
  }

  _renderSharedContent() {
    const socialLinksContainer = document.getElementById('social-links-container');
    const copyrightNotice = document.getElementById('copyright-notice');
    if (socialLinksContainer) this._renderSocials(socialLinksContainer);
    if (copyrightNotice) this._setCopyrightYear(copyrightNotice);
  }

  _populateIcons(container = document) {
    if (!this.icons) return;

    container.querySelectorAll('[data-icon-key]').forEach((placeholder) => {
      const key = placeholder.dataset.iconKey;
      const iconData = this.icons[key];
      if (!iconData) {
        placeholder.innerHTML = '';
        return;
      }
      if (iconData.trim().startsWith('<svg')) {
        placeholder.innerHTML = iconData.replace('<svg', '<svg aria-hidden="true" focusable="false"');
      } else {
        placeholder.innerHTML = `<img src="${this._escapeHTML(iconData)}" alt="" class="icon-img" aria-hidden="true">`;
      }
    });
  }

  _renderHomePageContent(langData) {
    const skillsList = document.getElementById('skills-list');
    const experienceTabs = document.getElementById('experience-tabs');
    const projectGrid = document.getElementById('project-grid');
    const contactEmailLink = document.getElementById('contact-email');

    if (skillsList) this._renderSkills(skillsList, langData.about?.skills || []);
    if (experienceTabs) this._renderExperience(experienceTabs, document.getElementById('experience-panels'), langData);
    if (projectGrid) this._renderFeaturedProjects(projectGrid, langData);
    if (contactEmailLink) {
      const email = this.content._shared?.contact?.email;
      if (email) {
        contactEmailLink.href = `mailto:${email}`;
        contactEmailLink.textContent = email;
      }
    }
  }

  _renderArchivePageContent(langData) {
    const projectFiltersContainer = document.getElementById('project-filters');
    const projectGrid = document.getElementById('project-grid');
    if (projectFiltersContainer) {
      this._renderProjectFilters(projectFiltersContainer, langData.projects?.filters || {});
    }
    if (projectGrid) this._renderAllProjects(projectGrid, langData);
  }

  _renderSkills(container, skills) {
    container.innerHTML = skills.map((skill) => `<li>${this._escapeHTML(skill)}</li>`).join('');
  }

  _getLocalizedExperience(langData) {
    const sharedJobs = this.content._shared?.experience || [];
    const localizedContent = langData.experience?.job_content || {};
    return sharedJobs.map((job) => ({
      ...job,
      ...(localizedContent[job.id] || { role: job.id, description: '' }),
    }));
  }

  _renderExperience(tabsContainer, panelsContainer, langData) {
    if (!tabsContainer || !panelsContainer) return;
    const jobs = this._getLocalizedExperience(langData);

    if (jobs.length === 0) return;

    const tabButtonsHTML = jobs.map((job, index) => {
      const activeClass = index === 0 ? 'active' : '';
      const companyName = this._escapeHTML(job.company);
      return `
          <button type="button"
              role="tab" // <-- ADD THIS LINE
              class="experience__tab-btn ${activeClass}"
              data-index="${index}">
              ${companyName}
          </button>`;
    }).join('');
    tabsContainer.innerHTML = tabButtonsHTML;
    tabsContainer.setAttribute('role', 'tablist');

    const panelContentHTML = jobs.map((job, index) => {
      const activeClass = index === 0 ? 'active' : '';
      return `
            <div class="experience__panel ${activeClass}" data-index="${index}">
                <h3 class="experience__role">${this._escapeHTML(job.role)}</h3>
                <p class="experience__period">${this._escapeHTML(job.period)}</p>
                <p class="experience__description">${this._escapeHTML(job.description)}</p>
            </div>`;
    }).join('');
    panelsContainer.innerHTML = panelContentHTML;

    tabsContainer.addEventListener('click', (e) => {
      const button = e.target.closest('.experience__tab-btn');
      if (!button) return;
      const { index } = button.dataset;
      tabsContainer.querySelector('.active')?.classList.remove('active');
      panelsContainer.querySelector('.active')?.classList.remove('active');
      button.classList.add('active');
      panelsContainer.querySelector(`[data-index="${index}"]`)?.classList.add('active');
    });
  }

  _renderProjectFilters(container, filters) {
    const filterButtonsHTML = Object.entries(filters).map(([key, value]) => {
      const activeClass = key === 'all' ? 'active' : '';
      return `
                <button type="button"
                    class="filter-btn ${activeClass}"
                    data-filter-key="${key}">
                    ${value}
                </button>`;
    }).join('');
    container.innerHTML = filterButtonsHTML;

    container.addEventListener('click', (e) => {
      const button = e.target.closest('.filter-btn');
      if (!button) return;
      this.currentProjectFilter = button.dataset.filterKey;
      container.querySelector('.active')?.classList.remove('active');
      button.classList.add('active');
      this._renderAllProjects(document.getElementById('project-grid'), this.content[this.currentLang]);
    });
  }

  _getLocalizedProjects(langData) {
    const sharedProjects = this.content._shared?.projects || [];
    const localizedContent = langData.project_content || {};
    return sharedProjects.map((proj) => ({
      ...proj,
      ...(localizedContent[proj.id] || { title: proj.id, description: '' }),
    }));
  }

  _renderProjectGrid(container, projects, langData) {
    if (!container) return;
    container.innerHTML = projects.map((project) => this._createProjectCard(project, langData.projects?.filters || {})).join('');
    this._reObserveDynamicContent();
  }

  _renderFeaturedProjects(container, langData) {
    const allProjects = this._getLocalizedProjects(langData);
    const featuredProjects = allProjects.slice(0, this.config.featuredProjectsCount);
    this._renderProjectGrid(container, featuredProjects, langData);
  }

  _renderAllProjects(container, langData) {
    const allProjects = this._getLocalizedProjects(langData);
    const filteredProjects = this.currentProjectFilter === 'all'
      ? allProjects
      : allProjects.filter((p) => (p.tags || []).includes(this.currentProjectFilter));
    this._renderProjectGrid(container, filteredProjects, langData);
  }

  _createProjectCard(project, filters) {
    const tagsHTML = (project.tags || []).map((tagKey) => `<span class="project-card__tag">${this._escapeHTML(filters[tagKey] || tagKey)}</span>`).join('');
    const liveLinkHTML = project.live_url ? `<a href="${this._escapeHTML(project.live_url)}" class="project-card__link" target="_blank" rel="noopener noreferrer">Live Demo</a>` : '';
    const codeLinkHTML = project.code_url ? `<a href="${this._escapeHTML(project.code_url)}" class="project-card__link" target="_blank" rel="noopener noreferrer">View Code</a>` : '';

    const isExternalImage = (project.image || '').startsWith('http');
    const imageSrc = project.image || '';
    const webpSrc = isExternalImage ? imageSrc : imageSrc.replace(/\.(jpe?g|png)$/i, '.webp');

    return `
            <article class="project-card reveal">
                <picture>
                    <source srcset="${this._escapeHTML(webpSrc)}" type="image/webp">
                    <source srcset="${this._escapeHTML(imageSrc)}" type="image/jpeg">
                    <img src="${this._escapeHTML(imageSrc)}" alt="${this._escapeHTML(project.title)}" class="project-card__image" loading="lazy" width="800" height="450">
                </picture>
                <div class="project-card__content">
                    <h3 class="project-card__title">${this._escapeHTML(project.title)}</h3>
                    <p class="project-card__description">${this._escapeHTML(project.description)}</p>
                    <div class="project-card__tags">${tagsHTML}</div>
                    <div class="project-card__links">${liveLinkHTML}${codeLinkHTML}</div>
                </div>
            </article>`;
  }

  _renderSocials(container) {
    const socialLinksHTML = (this.config.socialLinks || []).map((social) => {
      const iconKey = social.iconKey || social.name;
      return `
            <a href="${social.url}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="${social.name}">
                <span data-icon-key="${iconKey}"></span>
            </a>`;
    });
    container.innerHTML = socialLinksHTML.join('');
    this._populateIcons(container);
  }

  _setCopyrightYear(container) {
    container.textContent = `© ${new Date().getFullYear()}`;
  }

  _handleScroll() {
    this.dom.header?.classList.toggle('scrolled', window.scrollY > 50);
    this.dom.scrollTopBtn?.classList.toggle('visible', window.scrollY > 300);
  }

  _initIntersectionObserver() {
    const defaultOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    const options = { ...defaultOptions, ...this.config.observerOptions };

    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, options);
  }

  _reObserveDynamicContent() {
    document.querySelectorAll('.reveal:not(.visible)').forEach((el) => this.observer?.observe(el));
  }

  _escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  _debounce(func, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }
}

try {
  const app = new PortfolioApp(APP_CONFIG);
  app.init();
} catch (error) {
  console.error('Fatal synchronous error during app initialization:', error);
  const loader = document.getElementById('loader');
  if (loader) loader.classList.add('hidden');
  const appRoot = document.getElementById('app-root');
  if (appRoot) {
    appRoot.innerHTML = '<p style="text-align: center; padding: 2rem;">A fatal error occurred. Please try refreshing the page.</p>';
  }
}
