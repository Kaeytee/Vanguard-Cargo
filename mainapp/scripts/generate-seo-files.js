#!/usr/bin/env node

/**
 * Sitemap Generator for Ttarius Logistics
 * Generates comprehensive XML sitemaps for better SEO
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://ttariuslogistics.com';

// Static pages with their priorities and change frequencies
const STATIC_PAGES = [
  {
    url: '/',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: '1.0',
    images: [
      {
        loc: `${BASE_URL}/images/hero-image.jpg`,
        title: 'Ttarius Logistics - Package Forwarding Service',
        caption: 'Premium package forwarding from USA to Ghana'
      }
    ]
  },
  {
    url: '/about',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.8'
  },
  {
    url: '/services',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: '0.9',
    images: [
      {
        loc: `${BASE_URL}/assets/services.jpg`,
        title: 'Package Forwarding Services',
        caption: 'Comprehensive shipping solutions from USA to Ghana'
      }
    ]
  },
  {
    url: '/contact',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.7',
    images: [
      {
        loc: `${BASE_URL}/assets/support.jpg`,
        title: 'Contact Ttarius Logistics',
        caption: 'Get in touch with our support team'
      }
    ]
  }
];

// SEO Landing pages for marketing
const LANDING_PAGES = [
  {
    url: '/shipping-to-ghana',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.8'
  },
  {
    url: '/package-forwarding',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.8'
  },
  {
    url: '/usa-address',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.8'
  },
  {
    url: '/consolidation-service',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.7'
  },
  {
    url: '/customs-clearance',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.7'
  }
];

// Combine all pages
const ALL_PAGES = [...STATIC_PAGES, ...LANDING_PAGES];

// Generate sitemap XML
function generateSitemap() {
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  ALL_PAGES.forEach(page => {
    sitemap += `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
`;

    // Add image tags if present
    if (page.images) {
      page.images.forEach(image => {
        sitemap += `    <image:image>
      <image:loc>${image.loc}</image:loc>
      <image:title>${image.title}</image:title>
      <image:caption>${image.caption}</image:caption>
    </image:image>
`;
      });
    }

    sitemap += `  </url>
`;
  });

  sitemap += `</urlset>`;

  return sitemap;
}

// Generate robots.txt
function generateRobotsTxt() {
  return `User-agent: *
Allow: /

# Important pages for crawling
Allow: /about
Allow: /services
Allow: /contact

# SEO Landing pages
Allow: /shipping-to-ghana
Allow: /package-forwarding
Allow: /usa-address
Allow: /consolidation-service
Allow: /customs-clearance

# Disallow admin and private areas
Disallow: /app/
Disallow: /admin/
Disallow: /api/
Disallow: /_vercel/
Disallow: /debug/

# Disallow authentication pages from indexing
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /verify-email

# Allow crawling of static assets
Allow: /assets/
Allow: /images/
Allow: /*.css
Allow: /*.js
Allow: /*.png
Allow: /*.jpg
Allow: /*.jpeg
Allow: /*.gif
Allow: /*.svg
Allow: /*.webp

# Sitemap location
Sitemap: ${BASE_URL}/sitemap.xml

# Crawl delay (be respectful)
Crawl-delay: 1`;
}

// Generate security.txt for responsible disclosure
function generateSecurityTxt() {
  return `Contact: mailto:security@ttariuslogistics.com
Expires: 2025-12-31T23:59:59.000Z
Encryption: https://ttariuslogistics.com/pgp-key.txt
Acknowledgments: https://ttariuslogistics.com/security-thanks
Policy: https://ttariuslogistics.com/security-policy
Hiring: https://ttariuslogistics.com/careers`;
}

// Write files
function writeFiles() {
  const publicDir = path.join(__dirname, '../public');
  
  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write sitemap.xml
  fs.writeFileSync(
    path.join(publicDir, 'sitemap.xml'),
    generateSitemap(),
    'utf8'
  );

  // Write robots.txt
  fs.writeFileSync(
    path.join(publicDir, 'robots.txt'),
    generateRobotsTxt(),
    'utf8'
  );

  // Write security.txt
  fs.writeFileSync(
    path.join(publicDir, 'security.txt'),
    generateSecurityTxt(),
    'utf8'
  );

  console.log('✅ SEO files generated successfully:');
  console.log('   - sitemap.xml');
  console.log('   - robots.txt');
  console.log('   - security.txt');
}

// Run the generator
if (require.main === module) {
  writeFiles();
}

module.exports = { generateSitemap, generateRobotsTxt, generateSecurityTxt };
