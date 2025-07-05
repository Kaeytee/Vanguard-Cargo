/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_API_BASE_URL: string
  readonly REACT_APP_ENVIRONMENT: string
  readonly REACT_APP_APP_NAME: string
  readonly REACT_APP_VERSION: string
  readonly REACT_APP_USE_MOCK_DATA: string
  readonly REACT_APP_DEBUG: string
  readonly REACT_APP_RECAPTCHA_SITE_KEY: string
  readonly REACT_APP_RECAPTCHA_SECRET_KEY: string
  readonly REACT_APP_ENABLE_RECAPTCHA: string
  readonly VERCEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
