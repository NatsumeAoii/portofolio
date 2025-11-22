import React from 'react';
import iconsData from '@/data/icons.json';
import { getAssetPath } from '@/utils/assets';

interface IconProps {
    name: string;
    className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className }) => {
    const iconContent = (iconsData as Record<string, string>)[name];

    if (!iconContent) return null;

    if (iconContent.trim().startsWith('<svg')) {
        return (
            <span
                className={className}
                dangerouslySetInnerHTML={{ __html: iconContent }}
            />
        );
    }

    return (
        <img
            src={getAssetPath(iconContent)}
            alt=""
            className={`icon-img ${className || ''}`}
            aria-hidden="true"
        />
    );
};
