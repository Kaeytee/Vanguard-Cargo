# Logistics Web Application

A modern logistics company website built with React, TypeScript, and Vite, featuring clean code architecture and object-oriented programming principles.

## Project Structure

The project follows a modular architecture with the following structure:

```
mainapp/
├── public/
│   └── images/          # Static images used throughout the site
├── src/
│   ├── components/      # Reusable UI components
│   ├── landing/         # Landing page components
│   │   ├── about/       # About page components
│   │   ├── home/        # Home page components
│   │   ├── services/    # Services page components
│   │   └── contact/     # Contact page components
│   ├── layouts/         # Layout components (header, footer, etc.)
│   ├── utils/           # Utility functions
│   └── App.tsx          # Main application component
└── README.md            # Project documentation
```

## About Page Implementation

The About page has been implemented with the following sections:

1. **Header Section** - Features company description and key benefits with checkmarks
2. **Mission Section** - Two identical mission cards with icon and description
3. **Core Values Section** - Four value cards highlighting company principles
4. **Call to Action Section** - Encourages user engagement

The implementation uses clean, semantic HTML with CSS for styling, following best practices for responsive design.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
