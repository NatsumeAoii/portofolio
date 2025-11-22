"use client"

import React, { useState } from 'react';
import { Header } from "@/components/layout/Header";
import { useLanguage } from '@/components/ui/LanguageContext';
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { ScrollTop } from '@/components/ui/ScrollTop';

import Image from 'next/image';

export default function Archive() {
    const { content, shared } = useLanguage();
    const [filter, setFilter] = useState('all');
    useIntersectionObserver();

    const allProjects = shared.projects.map((proj) => {
        const localized = content.project_content[proj.id] || { title: proj.id, description: '' };
        return { ...proj, ...localized };
    });

    const filteredProjects = filter === 'all'
        ? allProjects
        : allProjects.filter(p => p.tags.includes(filter));

    return (
        <div id="page-archive">
            <Header />
            <main id="app-root">
                <section className="projects section">
                    <div className="container">
                        <h1 className="section__title reveal" tabIndex={-1}>{content.projects.archive_title}</h1>
                        <div className="project-filters reveal" id="project-filters">
                            {Object.entries(content.projects.filters).map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    className={`filter-btn ${filter === key ? 'active' : ''}`}
                                    onClick={() => setFilter(key)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="project-grid" id="project-grid">
                            {filteredProjects.map((project) => (
                                <article key={project.id} className="project-card reveal">
                                    <Image
                                        src={project.image}
                                        alt={project.title || ''}
                                        className="project-card__image"
                                        width={800}
                                        height={450}
                                        style={{ width: '100%', height: 'auto' }}
                                    />
                                    <div className="project-card__content">
                                        <h3 className="project-card__title">{project.title}</h3>
                                        <p className="project-card__description">{project.description}</p>
                                        <div className="project-card__tags">
                                            {project.tags.map(tag => (
                                                <span key={tag} className="project-card__tag">
                                                    {content.projects.filters[tag] || tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="project-card__links">
                                            {project.live_url && (
                                                <a href={project.live_url} className="project-card__link" target="_blank" rel="noopener noreferrer">Live Demo</a>
                                            )}
                                            {project.code_url && (
                                                <a href={project.code_url} className="project-card__link" target="_blank" rel="noopener noreferrer">View Code</a>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <ScrollTop />
        </div>
    );
}
