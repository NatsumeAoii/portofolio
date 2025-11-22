export interface SharedContent {
    contact: {
        email: string;
    };
    experience: Job[];
    projects: Project[];
}

export interface Job {
    id: string;
    company: string;
    period: string;
}

export interface Project {
    id: string;
    tags: string[];
    image: string;
    live_url: string | null;
    code_url: string | null;
    title?: string; // Populated from localized content
    description?: string; // Populated from localized content
}

export interface LocalizedContent {
    meta: {
        home_title: string;
        archive_title: string;
        notFound_title: string;
    };
    nav: {
        about: string;
        experience: string;
        projects: string;
        contact: string;
    };
    hero: {
        greeting: string;
        name: string;
        tagline: string;
        description: string;
    };
    about: {
        title: string;
        p1: string;
        p2: string;
        skills_title: string;
        skills: string[];
    };
    experience: {
        title: string;
        job_content: Record<string, { role: string; description: string }>;
    };
    projects: {
        title: string;
        archive_title: string;
        archive_btn_text: string;
        filters: Record<string, string>;
    };
    project_content: Record<string, { title: string; description: string }>;
    contact: {
        title: string;
        description: string;
    };
    errors: {
        notFound: {
            title: string;
            description: string;
            button: string;
        };
    };
}

export interface SiteContent {
    _shared: SharedContent;
    en: LocalizedContent;
    id: LocalizedContent;
    [key: string]: SharedContent | LocalizedContent; // Allow indexing
}
