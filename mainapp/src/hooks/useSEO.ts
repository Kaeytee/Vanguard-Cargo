import { useEffect } from 'react';

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
}

/**
 * Custom SEO hook for React 19 - replaces react-helmet-async
 * Directly manipulates document head for better performance and compatibility
 */
export function useSEO({
  title = "Vanguard Cargo - Premium Package Forwarding from USA to Ghana",
  description = "Ship from any US store to Ghana with Vanguard Cargo. Get your free US address, consolidate packages, and save up to 80% on international shipping. Trusted by thousands of Ghanaians.",
  keywords = "package forwarding, shipping to Ghana, US address, international shipping, cargo forwarding, Ghana shipping, online shopping USA, package consolidation",
  image = "https://www.vanguardcargo.org/og-image.jpg",
  url = "https://www.vanguardcargo.org/",
  type = "website",
  author = "Vanguard Cargo",
  publishedTime,
  modifiedTime,
  noIndex = false,
  canonicalUrl
}: SEOData) {
  useEffect(() => {
    const fullTitle = title.includes('Vanguard Cargo') ? title : `${title} | Vanguard Cargo`;
    
    // Update document title
    document.title = fullTitle;
    
    // Helper function to set or update meta tags
    const setMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.content = content;
    };
    
    // Helper function to set link tags
    const setLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      
      link.href = href;
    };
    
    // Primary Meta Tags
    setMetaTag('title', fullTitle);
    setMetaTag('description', description);
    setMetaTag('keywords', keywords);
    setMetaTag('author', author);
    
    // Robots
    setMetaTag('robots', noIndex ? "noindex, nofollow" : "index, follow");
    
    // Canonical URL
    setLinkTag('canonical', canonicalUrl || url);
    
    // Open Graph / Facebook
    setMetaTag('og:type', type, true);
    setMetaTag('og:url', url, true);
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', image, true);
    setMetaTag('og:image:width', '1200', true);
    setMetaTag('og:image:height', '630', true);
    setMetaTag('og:site_name', 'Vanguard Cargo', true);
    setMetaTag('og:locale', 'en_US', true);
    
    // Article specific meta tags
    if (type === 'article') {
      if (publishedTime) setMetaTag('article:published_time', publishedTime, true);
      if (modifiedTime) setMetaTag('article:modified_time', modifiedTime, true);
      setMetaTag('article:author', author, true);
      setMetaTag('article:section', 'cargo', true);
      setMetaTag('article:tag', keywords, true);
    }
    
    // Twitter
    setMetaTag('twitter:card', 'summary_large_image', true);
    setMetaTag('twitter:url', url, true);
    setMetaTag('twitter:title', fullTitle, true);
    setMetaTag('twitter:description', description, true);
    setMetaTag('twitter:image', image, true);
    setMetaTag('twitter:creator', '@VanguardCargo');
    
    // Additional Meta Tags for Better SEO
    setMetaTag('language', 'English');
    setMetaTag('revisit-after', '7 days');
    setMetaTag('distribution', 'web');
    setMetaTag('web_author', author);
    setMetaTag('rating', 'general');
    setMetaTag('subject', 'Package Forwarding and International Shipping Services');
    setMetaTag('copyright', '© 2025 Vanguard Cargo. All rights reserved.');
    setMetaTag('reply-to', 'support@vanguardcargo.org');
    setMetaTag('abstract', description);
    setMetaTag('topic', 'Logistics and Shipping Services');
    setMetaTag('summary', description);
    setMetaTag('classification', 'Business');
    setMetaTag('designer', 'Vanguard Cargo Development Team');
    setMetaTag('owner', 'Vanguard Cargo');
    setMetaTag('directory', 'submission');
    setMetaTag('category', 'Business Services, Logistics, International Shipping');
    setMetaTag('coverage', 'Worldwide');
    setMetaTag('identifier-URL', url);
    setMetaTag('shortlink', url);
    
    // Geo-targeting for Ghana
    setMetaTag('geo.region', 'GH');
    setMetaTag('geo.country', 'Ghana');
    setMetaTag('geo.placename', 'Accra');
    setMetaTag('ICBM', '5.6037, -0.1870');
    
    // Set Content-Type via http-equiv
    let httpEquiv = document.querySelector('meta[http-equiv="Content-Type"]') as HTMLMetaElement;
    if (!httpEquiv) {
      httpEquiv = document.createElement('meta');
      httpEquiv.setAttribute('http-equiv', 'Content-Type');
      document.head.appendChild(httpEquiv);
    }
    httpEquiv.content = 'text/html; charset=utf-8';
    
  }, [title, description, keywords, image, url, type, author, publishedTime, modifiedTime, noIndex, canonicalUrl]);
}
