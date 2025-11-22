"use client"

import React from 'react';
import { useLanguage } from '@/components/ui/LanguageContext';

export function Hero() {
    const { content } = useLanguage();

    return (
        <section id="hero" className="hero section">
            <div className="container">
                <h1 className="hero__title" tabIndex={-1}>
                    <span>{content.hero.greeting}</span>{" "}
                    <span className="hero__name">{content.hero.name}</span>
                    <span className="hero__tagline">{content.hero.tagline}</span>
                </h1>
                <p className="hero__description">{content.hero.description}</p>
                <a href="#projects" className="button">View My Work</a>
            </div>
        </section>
    );
}
