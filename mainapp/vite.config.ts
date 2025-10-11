import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { securityHeadersPlugin } from './vite-security-headers-plugin'

/**
 * Vite Configuration
 * Enhanced with PWA support, security headers, environment variables, and source maps
 * @author Senior Software Engineer
 */
export default defineConfig(({ mode }) => {
  // Load env file based on mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      // Security headers for development and preview
      securityHeadersPlugin(),
      
      react(),
      
      // PWA Plugin Configuration for offline support and caching
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        
        // PWA Manifest Configuration
        manifest: {
          name: 'Vanguard Cargo',
          short_name: 'Vanguard',
          description: 'International shipping and logistics platform',
          theme_color: '#ef4444',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: '/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        
        // Workbox Configuration for caching strategies
        workbox: {
          // Cache all static assets during build (excluding large images)
          globPatterns: ['**/*.{js,css,html,ico,woff,woff2,ttf,otf}'],
          
          // Exclude large images from precache (they'll be cached at runtime)
          globIgnores: [
            '**/settings.png',
            '**/submit-girl.png', 
            '**/track.png',
            '**/Screenshot*.png',
            '**/ICONS.png',
            '**/LEGACY.png'
          ],
          
          // Increase cache limit for remaining assets
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB limit
          
          // Runtime caching strategies
          runtimeCaching: [
            // API Calls - NetworkFirst strategy
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 // 1 hour
                },
                cacheableResponse: {
                  statuses: [0, 200]
                },
                networkTimeoutSeconds: 10
              }
            },
            
            // Images - CacheFirst strategy
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-cache',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
                }
              }
            },
            
            // Fonts - CacheFirst strategy
            {
              urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'font-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                }
              }
            },
            
            // Google Fonts - StaleWhileRevalidate
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                }
              }
            },
            
            // Google Fonts Stylesheets
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                }
              }
            }
          ],
          
          // Clean up old caches automatically
          cleanupOutdatedCaches: true,
          
          // Activate service worker immediately
          skipWaiting: true,
          clientsClaim: true
        },
        
        // Development mode settings
        devOptions: {
          enabled: false, // Disable SW in development for easier debugging
          type: 'module'
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    css: {
      devSourcemap: true,
    },
    build: {
      sourcemap: mode === 'development' ? 'inline' : true,
      cssMinify: true,
      rollupOptions: {
        output: {
          // Suppress source map warnings for third-party libraries
          sourcemapExcludeSources: false,
        }
      }
    },
    // Server configuration
    server: {
      // Suppress source map warnings in development
      hmr: {
        overlay: true
      }
    },
    // Define environment variables that should be replaced at build time
    define: {
      // Ensure reCAPTCHA environment variables are properly replaced
      'import.meta.env.REACT_APP_RECAPTCHA_SITE_KEY': JSON.stringify(env.REACT_APP_RECAPTCHA_SITE_KEY || ''),
      'import.meta.env.REACT_APP_RECAPTCHA_SECRET_KEY': JSON.stringify(env.REACT_APP_RECAPTCHA_SECRET_KEY || ''),
      'import.meta.env.REACT_APP_ENABLE_RECAPTCHA': JSON.stringify(env.REACT_APP_ENABLE_RECAPTCHA || 'true'),
      // Add other critical environment variables here
      'import.meta.env.REACT_APP_ENVIRONMENT': JSON.stringify(env.REACT_APP_ENVIRONMENT || 'production'),
    }
  }
})