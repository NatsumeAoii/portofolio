"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/ui/LanguageContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { Icon } from '@/components/ui/Icon';

export function Header() {
    const { content } = useLanguage();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        document.body.classList.toggle('nav-open', !isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        document.body.classList.remove('nav-open');
    };

    return (
        <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
            <nav className="nav container">
                <Link href="/" className="nav__logo" onClick={closeMenu}>
                    Hi!
                </Link>
                <ul className={`nav__list ${isMenuOpen ? 'visible' : ''}`} id="main-menu">
                    <li className="nav__item"><Link href="/#about" className="nav__link" onClick={closeMenu}>{content.nav.about}</Link></li>
                    <li className="nav__item"><Link href="/#experience" className="nav__link" onClick={closeMenu}>{content.nav.experience}</Link></li>
                    <li className="nav__item"><Link href="/#projects" className="nav__link" onClick={closeMenu}>{content.nav.projects}</Link></li>
                    <li className="nav__item"><Link href="/#contact" className="nav__link" onClick={closeMenu}>{content.nav.contact}</Link></li>
                </ul>
                <div className="nav__actions">
                    <ThemeToggle />
                    <LanguageToggle />
                    <button
                        type="button"
                        className="nav__action-btn nav__menu-toggle"
                        id="menu-toggle"
                        aria-label="Toggle menu"
                        aria-expanded={isMenuOpen}
                        onClick={toggleMenu}
                    >
                        {isMenuOpen ? <Icon name="menu-close" /> : <Icon name="menu-open" />}
                    </button>
                </div>
            </nav>
        </header>
    );
}
