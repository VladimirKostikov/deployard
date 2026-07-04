import { ContainerImageOption } from './types';

export const frameworkImageOptions: ContainerImageOption[] = [
  { name: 'Angular', image: 'node:22-alpine', category: 'Framework', icon: 'angular', defaultPort: 4200 },
  { name: 'Directus', image: 'directus/directus:11.1.0', category: 'Framework', icon: 'directus', defaultPort: 8055 },
  { name: 'Django', image: 'python:3.13-slim', category: 'Framework', icon: 'django', defaultPort: 8000 },
  { name: 'FastAPI', image: 'python:3.13-slim', category: 'Framework', icon: 'fastapi', defaultPort: 8000 },
  { name: 'Flask', image: 'python:3.13-slim', category: 'Framework', icon: 'flask', defaultPort: 5000 },
  { name: 'Laravel', image: 'php:8.4-fpm-alpine', category: 'Framework', icon: 'laravel', defaultPort: 8000 },
  { name: 'NestJS', image: 'node:22-alpine', category: 'Framework', icon: 'nestjs', defaultPort: 3000 },
  { name: 'Next.js', image: 'node:22-alpine', category: 'Framework', icon: 'nextdotjs', defaultPort: 3000 },
  { name: 'Nuxt', image: 'node:22-alpine', category: 'Framework', icon: 'nuxtdotjs', defaultPort: 3000 },
  { name: 'Phoenix', image: 'elixir:1.17-alpine', category: 'Framework', icon: 'elixir', defaultPort: 4000 },
  { name: 'React (Vite)', image: 'node:22-alpine', category: 'Framework', icon: 'react', defaultPort: 5173 },
  { name: 'Remix', image: 'node:22-alpine', category: 'Framework', icon: 'remix', defaultPort: 3000 },
  { name: 'Spring Boot', image: 'eclipse-temurin:21-jre-alpine', category: 'Framework', icon: 'springboot', defaultPort: 8080 },
  { name: 'Strapi', image: 'strapi/strapi:5.4.0', category: 'Framework', icon: 'strapi', defaultPort: 1337 },
  { name: 'SvelteKit', image: 'node:22-alpine', category: 'Framework', icon: 'svelte', defaultPort: 5173 },
  { name: 'Symfony', image: 'php:8.4-fpm-alpine', category: 'Framework', icon: 'symfony', defaultPort: 8000 },
  { name: 'Vue (Vite)', image: 'node:22-alpine', category: 'Framework', icon: 'vuedotjs', defaultPort: 5173 },
];
