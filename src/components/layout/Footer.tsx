"use client"

import React from 'react';
import { APP_CONFIG } from '@/data/config';
import { Icon } from '@/components/ui/Icon';
import { LocationStatus } from '@/components/ui/LocationStatus';

export function Footer() {
    return (
        <footer className="site-footer">
            <div className="contact__socials" id="social-links-container">
                {APP_CONFIG.socialLinks.map((social) => (
                    <a
                        key={social.name}
                        href={social.url}
                        className="social-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.name}
                    >
                        <span data-icon-key={social.iconKey}>
                            <Icon name={social.iconKey} />
                        </span>
                    </a>
                ))}
            </div>
            <LocationStatus />
            <p className="copyright" id="copyright-notice">
                © {new Date().getFullYear()}
            </p>
        </footer>
    );
}
