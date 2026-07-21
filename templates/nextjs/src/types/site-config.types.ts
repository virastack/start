export interface SocialLinks {
  twitter: string;
  github: string;
  linkedin: string;
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  author: string;
  locale: string;
  themeColor: string;
  keywords: string[];
  social: SocialLinks;
  ogImage: string;
  languages: Record<string, string>;
}
