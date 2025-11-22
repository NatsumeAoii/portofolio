"use client"

import React from 'react';
import { useLanguage } from '@/components/ui/LanguageContext';
import { APP_CONFIG } from '@/data/config';
import Link from 'next/link';
import Image from 'next/image';

export function Projects() {
    const { content, shared } = useLanguage();

    const allProjects = shared.projects.map((proj) => {
        const localized = content.project_content[proj.id] || { title: proj.id, description: '' };
        return { ...proj, ...localized };
    });

    const featuredProjects = allProjects.slice(0, APP_CONFIG.featuredProjectsCount);

    return (
        <section id="projects" className="projects section">
            <div className="container projects__container">
                <h2 className="section__title reveal">{content.projects.title}</h2>
                <div className="project-grid">
                    {featuredProjects.map((project) => (
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
                <div className="project-archive__container">
                    <Link href="/archive" className="button button--secondary">{content.projects.archive_btn_text}</Link>
                </div>
            </div>
        </section>
    );
}
