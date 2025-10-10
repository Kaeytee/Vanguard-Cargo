/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_ENVIRONMENT: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_USE_MOCK_DATA: string
  readonly VITE_DEBUG: string
  readonly VITE_RECAPTCHA_SITE_KEY: string
  readonly VITE_RECAPTCHA_SECRET_KEY: string
  readonly VITE_ENABLE_RECAPTCHA: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_DISABLE_REALTIME: string
  readonly PROD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
