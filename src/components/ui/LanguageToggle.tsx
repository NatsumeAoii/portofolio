"use client"

import * as React from "react"
import { useLanguage } from "@/components/ui/LanguageContext"

export function LanguageToggle() {
    const { language, setLanguage } = useLanguage()

    return (
        <button
            type="button"
            className="nav__action-btn"
            id="lang-toggle"
            aria-label="Toggle language"
            onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
        >
            {language.toUpperCase()}
        </button>
    )
}
