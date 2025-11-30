this is project idea "Project Overview

We are building a cross-browser extension supported by a full web platform that together deliver an AI-powered text enhancement and rewriting experience.
The extension integrates seamlessly into the user’s workflow via the browser context menu (right-click), enabling instant rewriting, rephrasing, and text enhancement powered by AI.

The product consists of three main components:

Browser Extension

Context-menu action for AI rewriting.

Popup interface for configuration and personalization.

Secure communication with backend APIs—no sensitive logic stored client-side.

Web Application

OAuth Authentication

Billing and Subscription Management via Lemon Squeezy (trial, monthly, lifetime).

User Dashboard displaying usage, subscription details, and profile information.

Centralized API layer that handles verification, authorization, and usage limits before returning AI results.

Backend & Infrastructure

Claude 3.5 Sonnet for AI text generation (with abstraction to support future model changes).

Supabase for database, authentication integration, and platform services.

Extension will also be distributed as a Shopify App.

Billing Model

Three-tier subscription system:

Trial – Limited to ~10 AI enhancement actions.

Monthly Subscription – Recurring access.

Lifetime License – One-time payment for permanent access.

Billing and licensing are fully managed through Lemon Squeezy.

Language Support Policy

The system focuses primarily on delivering high-quality rewriting for the following languages:

English

Arabic

French

For all other languages, the platform will attempt generation, but if the AI output is detected to be low-quality or unreliable, the system will respond with a message indicating that the language is not fully supported.

This ensures a consistently high user experience and prevents misleading or incorrect results.

Non-Functional Requirements

AI Model Flexibility
Abstract AI interfaces to allow seamless switching or upgrading (Claude, OpenAI, Gemini, etc.).

Branding Flexibility
Centralized styling and theming to allow quick brand/color changes across extension and web components.

Broad Website Compatibility
Extension should function on most websites, including SPAs and dynamically rendered environments.

Extensible Prompt Architecture
Prompt creation must be modular to support future options such as tone, style, intent, and rewriting modes.

Security by Design
No API keys or sensitive logic on the client side.
All extension requests route through backend APIs, where authentication, authorization, subscription validation, and usage enforcement occur.

WXT + Vite + React for extension development
Nextjs for the website
monorepo arch for better development"

this is full project idea, now check the current project and check what has been done, then we will proceed with the extension part to fully complete it, i want you to fully generate a plan to complete the extension package, covering everything from source to test to deploy
