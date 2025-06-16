<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Book Inventory Builder - Copilot Instructions

This is a Next.js TypeScript project following the T3 Stack philosophy for building a Book Inventory Builder application.

## Project Overview
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini 1.5 Flash for vision processing
- **Database**: MongoDB Atlas (planned)
- **Architecture**: Full-stack application with frontend and API routes

## Key Features
- AI-powered book cover image processing to extract book details
- Book inventory management with CRUD operations
- Modern, responsive UI using Tailwind CSS
- Image upload and processing capabilities

## Development Guidelines
- Use TypeScript for all code
- Follow Next.js App Router conventions
- Implement proper error handling for AI API calls
- Use Tailwind CSS utility classes for styling
- Maintain clean, readable code structure
- Follow React best practices and hooks patterns

## Environment Variables
- `GOOGLE_API_KEY`: Google AI API key for Gemini vision processing
- `MONGO_URI`: MongoDB connection string for database operations

## Project Structure
- `/src/app`: Next.js app router pages and API routes
- `/src/components`: Reusable React components
- `/src/lib`: Utility functions and configurations
- `/src/types`: TypeScript type definitions
