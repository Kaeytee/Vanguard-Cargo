import { useSEO } from '../hooks/useSEO';

interface SEOProps {
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
 * SEO Component for dynamic meta tag management
 * Uses custom useSEO hook for React 19 compatibility
 */
export default function SEO({
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
}: SEOProps) {
  // Use our custom SEO hook to manage document head
  useSEO({
    title,
    description,
    keywords,
    image,
    url,
    type,
    author,
    publishedTime,
    modifiedTime,
    noIndex,
    canonicalUrl
  });

  // Return null since we're managing the head directly
  return null;
}
