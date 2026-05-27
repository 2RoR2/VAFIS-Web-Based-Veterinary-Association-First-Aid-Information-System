# VAFIS Prototype

This repository contains a small React + Vite prototype for a Veterinary Association First-Aid Information System (VAFIS). It is a frontend-only project meant for exploring UI flows: browsing guides and videos, taking quizzes, and trying simple role-based pages for pet owners, veterinary professionals, and administrators.

If you're here to run or develop the prototype, this README gives a short, friendly orientation to what the app does and where to look.

# How to run

npm install
open xampp mysql
open mysql workbench
open schema.sql and run it
npm run db:seed
npm run dev:server
npm run dev:client

# What this project contains

- The app is implemented in `app/` with React components and a small manual page switcher in `app/App.tsx`.
- Pages live in `app/pages/` (the important ones are `AuthPage.tsx`, `HomePage.tsx`, `QuizPage.tsx`, `ClinicsPage.tsx`, and the workflow/admin pages).
- Reusable UI pieces are in `app/components/` (cards, layout components, emergency banner, etc.).
- Static demo data for guides, quizzes, videos, and clinics is in `app/data/`.
- All styling lives in `app/styles/styles.css`. This is the single source for global styles, theme tokens, and shared component classes.

# What the prototype does 

- Browse home, guides, videos, species resources, and clinics.
- Submit feedback via the feedback page.
- Take quizzes with a progress indicator and scoring.
- Log in (client-side prototype): the login flow infers a role and shows role-specific pages (pet owner, professional, admin).
- Emergency banner and quick access to clinic search are included for prototype use.

# Authentication and roles

This is a frontend prototype only — there is no backend authentication. For local testing the app accepts credentials and assigns a role based on the email you provide. The three prototype roles are `pet-owner`, `veterinary-professional`, and `administrator`.

# Developer / testing demo credentials

- Demo credentials (for local testing only):
	- Pet Owner: owner@gmail.com — `vafis123`
	- Veterinary Professional: vet@gmail.com — `vafis123`
	- Administrator: admin@gmail.com — `vafis123`

