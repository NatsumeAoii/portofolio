"use client"

import React, { useState } from 'react';
import { useLanguage } from '@/components/ui/LanguageContext';

export function Experience() {
    const { content, shared } = useLanguage();
    const [activeTab, setActiveTab] = useState(0);

    const jobs = shared.experience.map((job) => {
        const localized = content.experience.job_content[job.id] || { role: job.id, description: '' };
        return { ...job, ...localized };
    });

    return (
        <section id="experience" className="experience section">
            <div className="container">
                <h2 className="section__title reveal">{content.experience.title}</h2>
                <div className="experience__container reveal">
                    <div className="experience__tabs" role="tablist">
                        {jobs.map((job, index) => (
                            <button
                                key={job.id}
                                type="button"
                                role="tab"
                                className={`experience__tab-btn ${index === activeTab ? 'active' : ''}`}
                                onClick={() => setActiveTab(index)}
                            >
                                {job.company}
                            </button>
                        ))}
                    </div>
                    <div className="experience__panels">
                        {jobs.map((job, index) => (
                            <div
                                key={job.id}
                                className={`experience__panel ${index === activeTab ? 'active' : ''}`}
                                role="tabpanel"
                            >
                                <h3 className="experience__role">{job.role}</h3>
                                <p className="experience__period">{job.period}</p>
                                <p className="experience__description">{job.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
