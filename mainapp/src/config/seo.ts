/**
 * SEO Configuration for Vanguard Cargo
 * Centralized SEO settings and structured data schemas
 */

// Base URL configuration
export const BASE_URL = 'https://vanguardcargo.co';

// Default SEO meta tags
export const DEFAULT_SEO = {
  siteName: 'Vanguard Cargo',
  title: 'Vanguard Cargo - Premium Package Forwarding from USA to Ghana',
  description: 'Ship from any US store to Ghana with Vanguard Cargo. Get your free US address, consolidate packages, and save up to 80% on international shipping. Trusted by thousands of Ghanaians.',
  keywords: 'package forwarding, shipping to Ghana, US address, international shipping, cargo forwarding, Ghana shipping, online shopping USA, package consolidation',
  author: 'Vanguard Cargo',
  image: `${BASE_URL}/og-image.jpg`,
  twitterHandle: '@vanguardcargo'
};

// Organization Schema
export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Vanguard Cargo",
  "url": BASE_URL,
  "logo": `${BASE_URL}/logo.png`,
  "description": "Premium package forwarding service from USA to Ghana. Get your free US address and ship with confidence.",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "GH",
    "addressLocality": "Accra",
    "addressRegion": "Greater Accra"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+233-XX-XXX-XXXX",
    "contactType": "customer service",
    "availableLanguage": ["English"],
    "areaServed": ["GH", "US"]
  },
  "sameAs": [
    "https://facebook.com/vanguardcargo",
    "https://twitter.com/vanguardcargo",
    "https://instagram.com/vanguardcargo"
  ],
  "foundingDate": "2024",
  "founders": {
    "@type": "Person",
    "name": "Vanguard Cargo Founder"
  },
  "numberOfEmployees": "50-100",
  "slogan": "Connecting Ghana to Global Markets"
};

// Service Schema
export const SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Package Forwarding Service",
  "description": "International package forwarding from USA to Ghana with consolidation and customs handling",
  "provider": {
    "@type": "Organization",
    "name": "Vanguard Cargo",
    "url": BASE_URL
  },
  "serviceType": "Package Forwarding",
  "areaServed": {
    "@type": "Country",
    "name": "Ghana"
  },
  "availableChannel": {
    "@type": "ServiceChannel",
    "serviceUrl": BASE_URL,
    "serviceSmsNumber": "+233-XX-XXX-XXXX",
    "servicePhone": "+233-XX-XXX-XXXX"
  },
  "offers": {
    "@type": "Offer",
    "name": "Package Forwarding Plans",
    "description": "Flexible package forwarding solutions",
    "priceRange": "$$$"
  }
};

// FAQ Schema for SEO
export const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does package forwarding work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You get a free US address, shop from any US store, and we forward your packages to Ghana. We also offer package consolidation to save on shipping costs."
      }
    },
    {
      "@type": "Question", 
      "name": "How much does shipping to Ghana cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Shipping costs vary by weight and dimensions. Our package consolidation service can save you up to 80% compared to individual shipments."
      }
    },
    {
      "@type": "Question",
      "name": "How long does delivery to Ghana take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Standard delivery takes 7-14 business days from our US warehouse to pickup locations in Ghana."
      }
    },
    {
      "@type": "Question",
      "name": "Do you handle customs clearance?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we handle all customs paperwork, duties, and taxes to ensure smooth delivery to Ghana."
      }
    }
  ]
};

// WebSite Schema for site search
export const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Vanguard Cargo",
  "url": BASE_URL,
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${BASE_URL}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
};

// Local Business Schema (if applicable)
export const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Vanguard Cargo",
  "image": `${BASE_URL}/logo.png`,
  "telephone": "+233-XX-XXX-XXXX",
  "email": "support@vanguardcargo.co",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Your Street Address",
    "addressLocality": "Accra",
    "addressRegion": "Greater Accra",
    "postalCode": "00233",
    "addressCountry": "GH"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 5.6037,
    "longitude": -0.1870
  },
  "url": BASE_URL,
  "openingHours": "Mo-Fr 08:00-18:00",
  "priceRange": "$$$"
};

// Breadcrumb Schema Helper
export const createBreadcrumbSchema = (items: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

// Product Schema for package forwarding service
export const PACKAGE_FORWARDING_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Package Forwarding Service",
  "description": "Premium package forwarding from USA to Ghana",
  "category": "Logistics Services",
  "brand": {
    "@type": "Brand",
    "name": "Vanguard Cargo"
  },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "lowPrice": "15",
    "highPrice": "200",
    "offerCount": "3"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "250"
  }
};
