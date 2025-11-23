export const APP_CONFIG = {
    dataCacheVersion: '1.0.0',
    defaultLanguage: 'en',
    defaultTheme: 'dark',
    basePath: '/portofolio', // Must match next.config.ts
    observerOptions: {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    },
    featuredProjectsCount: 4,
    scrollDebounceDelay: 100,
    socialLinks: [
        { name: 'GitHub', url: 'https://github.com/NatsumeAoii', iconKey: 'GitHub' },
        { name: 'LinkedIn', url: 'https://www.linkedin.com/in/wardanadwimulia/', iconKey: 'LinkedIn' },
        { name: 'Discord', url: 'https://discordapp.com/users/243726663985659905', iconKey: 'Discord' }
    ]
};
