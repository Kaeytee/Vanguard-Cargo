import { Helmet } from 'react-helmet-async';

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
 * Uses react-helmet-async for better SSR support
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
  const fullTitle = title.includes('Vanguard Cargo') ? title : `${title} | Vanguard Cargo`;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      
      {/* Robots */}
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl || url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Vanguard Cargo" />
      <meta property="og:locale" content="en_US" />
      
      {/* Article specific meta tags */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          <meta property="article:author" content={author} />
          <meta property="article:section" content="cargo" />
          <meta property="article:tag" content={keywords} />
        </>
      )}
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta name="twitter:creator" content="@VanguardCargo" />
      
      {/* Additional Meta Tags for Better SEO */}
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="distribution" content="web" />
      <meta name="web_author" content={author} />
      <meta name="rating" content="general" />
      <meta name="subject" content="Package Forwarding and International Shipping Services" />
      <meta name="copyright" content="© 2025 Vanguard Cargo. All rights reserved." />
      <meta name="reply-to" content="support@vanguardcargo.org" />
      <meta name="abstract" content={description} />
      <meta name="topic" content="Logistics and Shipping Services" />
      <meta name="summary" content={description} />
      <meta name="classification" content="Business" />
      <meta name="designer" content="Vanguard Cargo Development Team" />
      <meta name="owner" content="Vanguard Cargo" />
      <meta name="directory" content="submission" />
      <meta name="category" content="Business Services, Logistics, International Shipping" />
      <meta name="coverage" content="Worldwide" />
      <meta name="identifier-URL" content={url} />
      <meta name="shortlink" content={url} />
      
      {/* Geo-targeting for Ghana */}
      <meta name="geo.region" content="GH" />
      <meta name="geo.country" content="Ghana" />
      <meta name="geo.placename" content="Accra" />
      <meta name="ICBM" content="5.6037, -0.1870" />
    </Helmet>
  );
}
