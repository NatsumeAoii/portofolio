"use client"

import Link from 'next/link'
import { useLanguage } from '@/components/ui/LanguageContext';

export default function NotFound() {
    const { content } = useLanguage();

    return (
        <div id="page-404">
            <section className="section">
                <div className="container" style={{ textAlign: 'center' }}>
                    <h1 className="section__title" tabIndex={-1}>{content.errors.notFound.title}</h1>
                    <p>{content.errors.notFound.description}</p>
                    <Link href="/" className="button" style={{ marginTop: '2rem' }}>
                        {content.errors.notFound.button}
                    </Link>
                </div>
            </section>
        </div>
    )
}
