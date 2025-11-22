import { useEffect } from 'react';

export function useIntersectionObserver() {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        // Observe elements that have the 'reveal' class
        // We use a timeout to ensure elements are rendered, though in React this might need a ref approach.
        // For simplicity in this migration, we'll query the DOM.
        const elements = document.querySelectorAll('.reveal');
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }); // Run on every render to catch new elements? Or just once? 
    // If content changes (language switch), we might need to re-observe.
    // But 'reveal' class is static on the elements.
}
