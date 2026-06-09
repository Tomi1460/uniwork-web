# Uniwork Web

Sitio web oficial de Uniwork — landing page + app web (dashboard de clientes y prestadores).

## Stack

- **React + Vite** — Frontend framework
- **Vanilla CSS** — Diseño personalizado (dark mode, glassmorphism)
- **Supabase** — Auth + base de datos en tiempo real
- **react-router-dom** — Navegación SPA

## Setup

1. Clonar el repositorio
2. Copiar `.env.example` a `.env` y completar las variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. Instalar dependencias y correr:

```bash
npm install
npm run dev
```

## Estructura

```
src/
├── components/       # Componentes reutilizables (Navbar, Footer, etc.)
├── pages/            # Páginas de la landing
│   └── app/          # Dashboard páginas (cliente, prestador)
├── context/          # AuthContext (Supabase auth)
├── supabaseClient.js # Cliente Supabase web
└── index.css         # Design system global
```

## Deploy

El sitio se puede desplegar en Vercel, Netlify o similar. Recuerda configurar las variables de entorno en el panel de la plataforma.
