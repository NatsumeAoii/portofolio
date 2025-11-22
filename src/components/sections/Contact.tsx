"use client"

import React from 'react';
import { useLanguage } from '@/components/ui/LanguageContext';
import { Footer } from '@/components/layout/Footer';

export function Contact() {
    const { content, shared } = useLanguage();

    return (
        <section id="contact" className="contact section">
            <div className="container contact__container reveal">
                <h2 className="section__title">{content.contact.title}</h2>
                <p>{content.contact.description}</p>
                <a href={`mailto:${shared.contact.email}`} className="contact__email">
                    {shared.contact.email}
                </a>
                <Footer />
            </div>
        </section>
    );
}
