#!/usr/bin/env node

/**
 * SEO Audit Script for Vanguard Cargo
 * Checks various SEO elem    const metaChecks = [
      { tag: 'name="description"', description: 'Meta description' },
      { tag: 'name="keywords"', description: 'Meta keywords' },
      { tag: 'property="og:title"', description: 'Open Graph title' },
      { tag: 'property="og:description"', description: 'Open Graph description' },
      { tag: 'property="og:image"', description: 'Open Graph image' },
      { tag: 'twitter:card', description: 'Twitter Card' },
      { tag: 'rel="canonical"', description: 'Canonical URL' },
      { tag: 'application/ld+json', description: 'Structured Data' }
    ];

    metaChecks.forEach(check => {
      if (check.tag === 'twitter:card') {
        // Check for both name and property attributes for Twitter Card
        if (htmlContent.includes('name="twitter:card"') || htmlContent.includes('property="twitter:card"')) {
          this.log('success', `${check.description} is present`);
        } else {
          this.log('error', `${check.description} is missing`);
        }
      } else if (htmlContent.includes(check.tag)) {
        this.log('success', `${check.description} is present`);
      } else {
        this.log('error', `${check.description} is missing`);
      } recommendations
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://vanguardcargo.org';

class SEOAuditor {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.successes = [];
  }

  log(type, message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    
    switch (type) {
      case 'error':
        this.issues.push(message);
        console.log(`❌ ${message}`);
        break;
      case 'warning':
        this.warnings.push(message);
        console.log(`⚠️  ${message}`);
        break;
      case 'success':
        this.successes.push(message);
        console.log(`✅ ${message}`);
        break;
      default:
        console.log(`ℹ️  ${message}`);
    }
  }

  checkFile(filePath, description) {
    if (fs.existsSync(filePath)) {
      this.log('success', `${description} exists`);
      return true;
    } else {
      this.log('error', `${description} is missing`);
      return false;
    }
  }

  checkFileContent(filePath, searchText, description) {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(searchText)) {
        this.log('success', `${description} contains required content`);
        return true;
      } else {
        this.log('warning', `${description} missing: ${searchText}`);
        return false;
      }
    } else {
      this.log('error', `${description} file not found`);
      return false;
    }
  }

  auditBasicFiles() {
    console.log('\n🔍 Auditing Basic SEO Files...\n');
    
    const publicDir = path.join(__dirname, '../public');
    
    // Check for essential SEO files
    this.checkFile(path.join(publicDir, 'sitemap.xml'), 'Sitemap');
    this.checkFile(path.join(publicDir, 'robots.txt'), 'Robots.txt');
    this.checkFile(path.join(publicDir, 'security.txt'), 'Security.txt');
    this.checkFile(path.join(publicDir, 'site.webmanifest'), 'Web App Manifest');
    this.checkFile(path.join(publicDir, '.htaccess'), '.htaccess file');
  }

  auditHTMLFile() {
    console.log('\n🔍 Auditing HTML Structure...\n');
    
    const indexPath = path.join(__dirname, '../index.html');
    
    if (!this.checkFile(indexPath, 'index.html')) {
      return;
    }

    const htmlContent = fs.readFileSync(indexPath, 'utf8');

    // Check meta tags
    const metaChecks = [
      { tag: '<title>', description: 'Title tag' },
      { tag: 'name="description"', description: 'Meta description' },
      { tag: 'name="keywords"', description: 'Meta keywords' },
      { tag: 'property="og:title"', description: 'Open Graph title' },
      { tag: 'property="og:description"', description: 'Open Graph description' },
      { tag: 'property="og:image"', description: 'Open Graph image' },
      { tag: 'name="twitter:card"', description: 'Twitter Card' },
      { tag: 'rel="canonical"', description: 'Canonical URL' },
      { tag: 'application/ld+json', description: 'Structured Data' }
    ];

    metaChecks.forEach(check => {
      if (htmlContent.includes(check.tag)) {
        this.log('success', `${check.description} is present`);
      } else {
        this.log('error', `${check.description} is missing`);
      }
    });

    // Check for performance optimizations
    if (htmlContent.includes('rel="preconnect"')) {
      this.log('success', 'DNS preconnect found');
    } else {
      this.log('warning', 'Consider adding DNS preconnect for external resources');
    }
  }

  auditRobotsTxt() {
    console.log('\n🔍 Auditing Robots.txt...\n');
    
    const robotsPath = path.join(__dirname, '../public/robots.txt');
    
    if (!this.checkFile(robotsPath, 'robots.txt')) {
      return;
    }

    const robotsContent = fs.readFileSync(robotsPath, 'utf8');

    // Check robots.txt content
    const robotsChecks = [
      { content: 'User-agent: *', description: 'User-agent directive' },
      { content: 'Allow:', description: 'Allow directive' },
      { content: 'Disallow:', description: 'Disallow directive' },
      { content: 'Sitemap:', description: 'Sitemap reference' }
    ];

    robotsChecks.forEach(check => {
      if (robotsContent.includes(check.content)) {
        this.log('success', `robots.txt ${check.description} found`);
      } else {
        this.log('warning', `robots.txt ${check.description} missing`);
      }
    });
  }

  auditSitemap() {
    console.log('\n🔍 Auditing Sitemap...\n');
    
    const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
    
    if (!this.checkFile(sitemapPath, 'sitemap.xml')) {
      return;
    }

    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

    // Check sitemap structure
    const sitemapChecks = [
      { content: '<?xml version="1.0"', description: 'XML declaration' },
      { content: '<urlset', description: 'URL set declaration' },
      { content: '<loc>', description: 'Location tags' },
      { content: '<lastmod>', description: 'Last modified dates' },
      { content: '<changefreq>', description: 'Change frequency' },
      { content: '<priority>', description: 'Priority values' }
    ];

    sitemapChecks.forEach(check => {
      if (sitemapContent.includes(check.content)) {
        this.log('success', `Sitemap ${check.description} found`);
      } else {
        this.log('warning', `Sitemap ${check.description} missing`);
      }
    });

    // Count URLs
    const urlCount = (sitemapContent.match(/<url>/g) || []).length;
    this.log('success', `Sitemap contains ${urlCount} URLs`);
  }

  auditSEOComponents() {
    console.log('\n🔍 Auditing SEO Components...\n');
    
    const seoComponentPath = path.join(__dirname, '../src/components/SEO.tsx');
    const seoConfigPath = path.join(__dirname, '../src/config/seo.ts');
    
    this.checkFile(seoComponentPath, 'SEO Component');
    this.checkFile(seoConfigPath, 'SEO Configuration');
  }

  generateReport() {
    console.log('\n📊 SEO AUDIT REPORT');
    console.log('='.repeat(50));
    
    const totalChecks = this.successes.length + this.warnings.length + this.issues.length;
    const successRate = ((this.successes.length / totalChecks) * 100).toFixed(1);
    
    console.log(`\n📈 Overall Score: ${successRate}%`);
    console.log(`✅ Passed: ${this.successes.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Issues: ${this.issues.length}`);
    
    if (this.issues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES TO FIX:');
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  RECOMMENDATIONS:');
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }

    console.log('\n💡 NEXT STEPS:');
    console.log('1. Fix all critical issues');
    console.log('2. Address warnings for better optimization');
    console.log('3. Test your site with Google Search Console');
    console.log('4. Use tools like PageSpeed Insights and Lighthouse');
    console.log('5. Submit your sitemap to search engines');
    
    // Generate score badge
    let badge = '🥇 Excellent';
    if (successRate < 70) badge = '🥉 Needs Work';
    else if (successRate < 85) badge = '🥈 Good';
    
    console.log(`\n${badge} SEO Health: ${successRate}%\n`);
  }

  run() {
    console.log('🔍 VANGUARD CARGO SEO AUDIT');
    console.log('='.repeat(50));
    
    this.auditBasicFiles();
    this.auditHTMLFile();
    this.auditRobotsTxt();
    this.auditSitemap();
    this.auditSEOComponents();
    this.generateReport();
  }
}

// Run the audit
if (require.main === module) {
  const auditor = new SEOAuditor();
  auditor.run();
}

module.exports = SEOAuditor;
