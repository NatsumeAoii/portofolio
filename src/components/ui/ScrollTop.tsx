"use client"

import React, { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';

export function ScrollTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = (e: React.MouseEvent) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <a
            href="#"
            className={`scroll-top ${isVisible ? 'visible' : ''}`}
            onClick={scrollToTop}
            aria-label="Scroll to top"
        >
            <span data-icon-key="scroll-top">
                <Icon name="scroll-top" />
            </span>
        </a>
    );
}
