
# Ttarius Logistics - Warehouse Management System

## Overview

Ttarius Logistics is a warehouse-to-warehouse international logistics platform that enables customers to ship packages from foreign countries to local warehouses for pickup. The warehouse system is the operational core that manages package processing, international shipping, and customer pickup coordination.

## Business Model

**Warehouse-to-Warehouse Pickup Service:**

- Customers submit requests for packages to be collected from foreign warehouses
- Packages are processed and shipped internationally to local warehouses
- Customers are notified when packages arrive at the local warehouse
- Customers visit the local warehouse to collect their packages (no home delivery)

## Features

- User authentication (register, login, forgot password)
- Protected client dashboard for package requests and tracking
- International shipment creation and tracking
- Warehouse staff management for package processing
- Customer notification system for pickup coordination
- Admin shipment management with barcode generation
- Responsive layout with sidebar and navbar
- **Admin Shipment History Barcode & Advanced Filter UI**
  - Barcode column displays a scannable PNG barcode for each shipment, generated from the tracking URL using `generateTrackingBarcode` utility.
  - Professional filter UI with status tabs, live search, and animated date filter dropdown, matching the "Awaiting Shipment List" reference exactly.
  - All filter state (status, search, date) handled with robust React state and clean OOP code.
  - Code is thoroughly commented and follows best practices for maintainability and extensibility.

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