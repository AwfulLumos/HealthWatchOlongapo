# HealthWatch Olongapo - System Overview

## Project Description

**HealthWatch Olongapo** is a comprehensive **Barangay Health Center Management System** designed specifically for healthcare facilities in Olongapo City, Philippines. This modern, responsive web-based application empowers healthcare professionals with an intuitive interface for patient care management and administrative tasks.

## Key Characteristics

- **Target Users**: Doctors, Nurses, Midwives, Barangay Health Workers (BHW), and Administrative staff
- **Geographic Focus**: Olongapo City, organized by barangay locations
- **Data Storage**: Browser-based localStorage (client-side, no backend server)
- **Architecture**: Single-page application (SPA) with React Router
- **UI Framework**: Modern design using Tailwind CSS and Radix UI components
- **Accessibility**: Built with accessibility-first components from Radix UI

## System Purpose

The system addresses the critical need for digital health record management in barangay health centers, providing:

1. **Centralized Patient Management** - Complete patient records with medical history
2. **Efficient Appointment Scheduling** - Calendar-based scheduling system
3. **Clinical Documentation** - Consultation records with ICD-10 coding
4. **Prescription Management** - Digital prescription tracking and management
5. **Vital Signs Monitoring** - Comprehensive vital signs recording with BMI calculations
6. **Staff Administration** - Healthcare provider management system
7. **Analytics Dashboard** - Real-time insights and reporting
8. **Reports Generation** - Statistical reports for healthcare planning

## Technology Stack

### Frontend Framework
- **React 18.3.1** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite 6.3.5** - Lightning-fast build tool and development server

### UI Components & Styling
- **Radix UI** - Headless, accessible component primitives
- **Tailwind CSS 4.1.12** - Utility-first CSS framework
- **Shadcn/ui** - Pre-built components with Tailwind styling
- **Material-UI 7.3.5** - Additional UI components and icons
- **Lucide React** - Beautiful SVG icon library (1000+ icons)

### State Management & Routing
- **React Router 7.13.0** - Client-side routing and navigation
- **React Hook Form 7.55.0** - Efficient form state management
- **Custom Hooks** - Centralized business logic management

### Data Visualization
- **Recharts 2.15.2** - React charting library for analytics dashboards

### Additional Libraries
- **date-fns 3.6.0** - Modern date manipulation
- **Motion 12.23.24** - Animation library for smooth transitions
- **Sonner 2.0.3** - Toast notifications
- **Canvas Confetti** - Celebration animations

## Target Deployment

The application is designed to run in modern web browsers and can be deployed as:
- **Static Website** (GitHub Pages, Netlify, Vercel)
- **Self-hosted** (Any web server serving static files)
- **Local Development** (Vite development server)

## Data Management Philosophy

The system uses browser localStorage for data persistence, making it:
- **Offline-capable** - Works without internet connection
- **Privacy-focused** - Data stays on user's device
- **Zero-setup** - No database or server configuration required
- **Development-friendly** - Easy to test and develop locally

This approach is ideal for pilot deployments, proof-of-concepts, and environments where server infrastructure is limited or costly to maintain.

## Next Steps

This documentation provides a foundation for understanding the HealthWatch Olongapo system. For detailed technical information, see:

- [Technical Architecture](./TECHNICAL_ARCHITECTURE.md)
- [User Guide](./USER_GUIDE.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [API Reference](./API_REFERENCE.md)