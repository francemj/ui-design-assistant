# UI Placement Assistant

## Overview

UI Placement Assistant is an AI-powered web application that helps designers and developers make informed decisions about UI element placement. Users upload screenshots of existing interfaces and describe new elements they want to add. The application leverages GPT-4o vision capabilities to analyze the layout and provide intelligent placement suggestions with detailed rationale.

The tool is designed as a modern productivity application with a focus on clarity, efficiency, and minimal visual distraction, allowing users to concentrate on analyzing UI layouts rather than navigating complex interfaces.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**Routing**: Wouter for lightweight client-side routing with a simple two-page structure (Home and NotFound).

**State Management**: 
- TanStack Query (React Query) for server state management with custom query client configuration
- React Hook Form with Zod resolvers for form state and validation
- React Context for theme state management

**UI Component System**: 
- shadcn/ui component library with Radix UI primitives for accessible, unstyled components
- Tailwind CSS for styling with custom design tokens following a Linear/Vercel-inspired aesthetic
- Custom CSS variables for theme support (light/dark mode)
- CVA (Class Variance Authority) for component variant management

**Design System**:
- Typography: Inter for UI/body text, JetBrains Mono for technical content
- Color system: HSL-based with semantic color tokens supporting both light and dark modes
- Spacing: Tailwind's unit system (2, 4, 6, 8, 12, 16, 24)
- Modern productivity tool aesthetic emphasizing clarity and minimal distraction

### Backend Architecture

**Runtime**: Node.js with Express.js framework using ES modules.

**API Structure**: 
- RESTful single endpoint architecture (`POST /api/analyze`)
- File upload handling via Multer with in-memory storage
- Input validation using Zod schemas shared between client and server

**Request Processing Flow**:
1. Client uploads image file and description via multipart form data
2. Server validates file type (PNG/JPEG only) and size (10MB limit)
3. Image converted to base64 for AI processing
4. OpenAI GPT-4o vision model analyzes the image with structured prompts
5. Response validated against Zod schema before returning to client

**Development Tools**:
- TypeScript for type safety across the stack
- TSX for development server with hot module replacement
- esbuild for production builds
- Vite middleware integration for seamless dev experience

### Data Storage

**Current Implementation**: In-memory storage only (MemStorage class) with no persistent data layer.

**Database Configuration**: Drizzle ORM configured with PostgreSQL dialect, but not actively used in current implementation. Configuration exists in `drizzle.config.ts` with schema location at `shared/schema.ts`, suggesting future data persistence capabilities.

**Rationale**: The application is stateless and processes requests on-demand without storing historical data. Each analysis is independent, requiring no session or user data persistence.

### External Dependencies

**AI Integration**: 
- OpenAI API (configurable via environment variables)
- Model: GPT-4o with vision capabilities
- Purpose: Analyzing UI screenshots and generating placement suggestions
- Configuration: Custom base URL and API key support for flexibility

**UI Libraries**:
- Radix UI: 20+ component primitives (Dialog, Dropdown, Toast, Tabs, etc.)
- Lucide React: Icon library for consistent iconography
- date-fns: Date formatting utilities
- cmdk: Command menu component

**Form & Validation**:
- React Hook Form: Form state management
- Zod: Runtime type validation and schema definition
- @hookform/resolvers: Integration between React Hook Form and Zod

**Development Dependencies**:
- Google Fonts: Inter and JetBrains Mono font families
- Replit-specific plugins: Runtime error overlay, cartographer, dev banner (development only)

**Third-Party Services**:
- Neon Database: Serverless PostgreSQL (configured but not actively used)
- OpenAI: GPT-4o vision API for image analysis

## Recent Changes

### January 2025 - Project Completion
- **Core Implementation**: Completed full-stack UI Placement Assistant application
  - Integrated Replit AI Integrations for OpenAI (charges to Replit credits, no API key needed)
  - Built complete frontend with upload zone (drag-and-drop), form validation (React Hook Form + Zod), and results display
  - Implemented backend `/api/analyze` endpoint with Multer file uploads and GPT-4o vision API integration
  - Added comprehensive data-testid attributes for testing throughout the application
  
- **AI Response Processing**: Enhanced backend to handle various AI response formats
  - Robust JSON extraction from markdown code blocks and free-form text
  - Zod schema validation for type-safe responses
  - Detailed error logging for debugging AI response issues

- **Testing**: Completed end-to-end testing with Playwright
  - Verified complete user flow: upload → analyze → view results → reset
  - Validated form validation, loading states, and error handling
  - Confirmed image processing and AI analysis pipeline

- **Design**: Implemented Modern Productivity Tool aesthetic
  - Linear/Vercel-inspired design following design_guidelines.md
  - Dark mode support with theme toggle
  - Responsive layout with proper spacing and typography
  - Custom elevation system for hover/active interactions