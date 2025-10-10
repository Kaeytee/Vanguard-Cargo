# About Vanguard Cargo - Client Application

Vanguard Cargo is a comprehensive logistics management platform designed to streamline the process of shipping, tracking, and managing packages for customers, warehouse administrators, and super-admins. The application is built with React, TypeScript, and Vite on the frontend, and integrates with a Spring Boot REST API backend and a PostgreSQL database. It supports real-time features, robust authentication, and cross-border warehouse operations.

## Purpose
The application enables customers to:
- Create and manage accounts with status-based access controls
- Submit and track shipment requests
- View shipment history and real-time tracking updates
- Manage account settings, preferences, and security (including 2FA)
- Access customer support and submit appeals

Warehouse admins and super-admins have advanced capabilities for managing requests, users, analytics, and system configurations.

## Key Features
- **Account Management:** Registration, login, password reset, KYC document upload, and account status workflows (active, suspended, pending verification, restricted, closed)
- **Shipment Requests:** Multi-step forms for submitting package requests, address book integration, cost calculation, and file uploads
- **Real-Time Tracking:** Live shipment tracking and notifications via WebSocket integration
- **Dashboard:** Status-aware dashboard with quick actions, notifications, and account status banners
- **History & Analytics:** Complete shipment history with filtering, export, and analytics dashboard for admins
- **Settings & Preferences:** Profile management, security settings, notification preferences, and address book
- **Support & Appeals:** Support ticket system, live chat, FAQ, and account appeal submission
- **Multi-Channel Notifications:** Email, SMS, and WhatsApp integration for status updates and confirmations
- **Security:** JWT authentication, reCAPTCHA, data validation, and audit logging
- **Testing & Quality:** Comprehensive unit, integration, and E2E testing with Vitest, React Testing Library, and Playwright

## Architecture
- **Frontend:** React + TypeScript, Vite, Tailwind CSS, Radix UI, React Hook Form
- **Backend:** Spring Boot REST API, PostgreSQL (not included in this repo)
- **State Management:** React Context API
- **Testing:** Vitest, React Testing Library, MSW, Playwright

## User Roles
- **Customer:** Can manage their own shipments, profile, and support requests
- **Warehouse Admin:** Full access to all requests, assignment, and status management
- **Super Admin:** System-wide control, user management, analytics, and configuration

## Integration Points
- **API Integration:** REST endpoints for authentication, shipments, tracking, user management, support, and notifications
- **WhatsApp Business:** For package status updates and customer communication
- **WebSocket:** For real-time notifications and tracking updates

## Summary
Vanguard Cargo provides a modern, secure, and scalable solution for logistics management, focusing on user experience, real-time operations, and robust integration with backend services. It is suitable for logistics companies seeking to digitize and automate their shipping and customer management workflows.
