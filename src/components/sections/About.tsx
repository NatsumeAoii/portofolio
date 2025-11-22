"use client"

import React from 'react';
import { useLanguage } from '@/components/ui/LanguageContext';

export function About() {
    const { content } = useLanguage();

    return (
        <section id="about" className="about section">
            <div className="container about__container">
                <div className="about__content reveal">
                    <h2 className="section__title">{content.about.title}</h2>
                    <p>{content.about.p1}</p>
                    <p>{content.about.p2}</p>
                </div>
                <div className="about__skills reveal">
                    <h3 className="about__skills-title">{content.about.skills_title}</h3>
                    <ul className="skills__list" id="skills-list">
                        {content.about.skills.map((skill) => (
                            <li key={skill}>{skill}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
