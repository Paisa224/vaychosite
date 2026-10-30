# Vaycho Web + API

Proyecto web de captación de clientes con frontend en React (Vite + TypeScript) y backend en Express (TypeScript), preparado para despliegue con dominio propio y Cloudflare.

## Stack

- Frontend: React + Vite + TypeScript + Tailwind
- Backend: Express + TypeScript + Zod
- Persistencia de leads: memoria o Prisma (según `LEAD_STORAGE_MODE`)
- Notificaciones por email de leads: FormSubmit (configurable)

## Estructura

```text
vaycho/
├─ frontend/
├─ backend/
├─ package.json
└─ README.md
```

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Instalación

Desde la raíz:

```bash
npm install
```

## Variables de entorno

### Backend

Crear `backend/.env` (puedes copiar desde `backend/.env.example`):

```env
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
LEAD_STORAGE_MODE=memory
LEAD_NOTIFICATION_PROVIDER=formsubmit
LEAD_NOTIFICATION_EMAIL=manuel_navarro50@hotmail.com
DATABASE_URL=postgresql://usuario:password@localhost:5432/vaycho_leads?schema=public
```

Notas:
- Si `LEAD_STORAGE_MODE=memory`, `DATABASE_URL` no es obligatorio.
- Si `LEAD_STORAGE_MODE=prisma`, `DATABASE_URL` sí es obligatorio.
- `LEAD_NOTIFICATION_PROVIDER`:
  - `formsubmit`: envía cada lead al correo configurado.
  - `none`: desactiva notificaciones por correo.

### Frontend

Crear `frontend/.env` (puedes copiar desde `frontend/.env.example`):

```env
VITE_API_URL=http://localhost:4000
```

## Ejecutar en local

Desde la raíz:

```bash
npm run dev
```

Esto levanta frontend y backend en paralelo.

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Build de producción

Desde la raíz:

```bash
npm run build
```

## Endpoint principal

- `POST /api/leads`

El formulario del frontend envía aquí los datos del cliente. El backend valida, guarda el lead (según modo) y dispara la notificación por correo.

## Activación inicial de FormSubmit (importante)

La primera vez, FormSubmit envía un correo de verificación al destino configurado. Debes confirmar ese correo una sola vez para habilitar las notificaciones automáticas.

## Publicar en GitHub

### 1) Inicializar repositorio

```bash
git init
git add .
git commit -m "chore: initial project setup"
```

### 2) Conectar remoto y subir

```bash
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

## Dominio + Cloudflare (resumen)

1. Comprar dominio (ejemplo: `reformasmantenimiento.es`)
2. Añadirlo en Cloudflare
3. Cambiar nameservers en el registrador por los de Cloudflare
4. Crear DNS:
   - `A` para `@` apuntando a la IP del servidor
   - `CNAME` para `www` apuntando a `@`
5. Configurar SSL/TLS en Cloudflare (`Full` o `Full (strict)` según certificado del servidor)
