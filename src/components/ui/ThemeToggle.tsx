"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Icon } from "./Icon"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => setMounted(true), [])

    if (!mounted) {
        return <button className="nav__action-btn" aria-label="Toggle theme"><span className="w-6 h-6" /></button>
    }

    return (
        <button
            type="button"
            className="nav__action-btn"
            id="theme-toggle"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
            <span className="icon-light">
                <Icon name="theme-on" />
            </span>
            <span className="icon-dark">
                <Icon name="theme-off" />
            </span>
        </button>
    )
}
