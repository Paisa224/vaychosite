# Vaycho Web + API

Landing corporativa de captación de clientes. El frontend está hecho con React,
Vite y TypeScript. En producción, un Cloudflare Worker sirve los assets estáticos
y procesa `POST /api/leads`; el backend Express se conserva únicamente para
desarrollo local.

## Arquitectura de producción

```text
Navegador
  -> POST /api/leads en reformasmantenimiento.es
  -> Cloudflare Worker
  -> API HTTPS de Resend
  -> buzón configurado

GET /*
  -> Cloudflare Static Assets (frontend/dist)
```

El Worker no guarda los datos personales en una base de datos. La protección
contra duplicados y abuso es efímera, por aislamiento, durante un minuto. El
Worker no devuelve un éxito hasta que Resend acepta la petición HTTP; la
aceptación de Resend no garantiza por sí sola la entrega final a la bandeja.

## Requisitos

- Node.js 20 o superior
- npm 10 o superior
- Cuenta de Cloudflare con Workers
- Cuenta de Resend con un dominio o subdominio verificado

## Instalación

```bash
npm install
```

## Desarrollo local

```bash
npm run dev
```

Esto inicia:

- Vite en `http://localhost:5173`
- Express en `http://localhost:4000`

El frontend usa siempre la ruta `/api/leads`. El proxy de Vite reenvía `/api`
al backend Express durante el desarrollo, por lo que no es necesario colocar
una URL absoluta ni definir una variable `VITE_API_URL`.

El backend conserva sus validaciones, almacenamiento opcional y proveedor de
notificaciones local. Consulta `backend/.env.example` para su configuración.

## Pruebas y builds

```bash
npm run typecheck:worker
npm run test:worker
npm run build
```

Para validar el frontend y el Worker con Wrangler:

```bash
npm run build:frontend
npx wrangler dev
```

En un `.dev.vars` local se pueden definir las tres variables indicadas abajo.
`.dev.vars` está ignorado por Git. Nunca se deben usar secretos reales en
archivos `VITE_*`, código fuente o `frontend/public/`.

## Variables del Worker

Configura en Cloudflare Workers & Pages > `vaychosite` > Settings > Variables:

| Variable | Tipo recomendado | Descripción |
| --- | --- | --- |
| `RESEND_API_KEY` | Secret | Clave privada emitida por Resend. |
| `LEAD_NOTIFICATION_TO` | Text / variable | Destinatario real de las solicitudes. |
| `LEAD_NOTIFICATION_FROM` | Text / variable | Remitente autenticado del dominio verificado. |

También se pueden configurar desde una terminal autenticada:

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler deploy --var LEAD_NOTIFICATION_TO:DESTINATARIO
npx wrangler deploy --var "LEAD_NOTIFICATION_FROM:NOMBRE <aviso@SUBDOMINIO_VERIFICADO>"
```

Los ejemplos anteriores contienen marcadores y no deben pegarse sin sustituir
los valores. Preferiblemente, configura `LEAD_NOTIFICATION_TO` y
`LEAD_NOTIFICATION_FROM` en el Dashboard para que persistan entre despliegues.

## Configurar y verificar Resend

1. Crea un dominio o subdominio de envío en Resend, preferiblemente un
   subdominio exclusivo como `mail.reformasmantenimiento.es`.
2. Resend mostrará los registros DNS exactos necesarios (SPF, DKIM y, cuando
   corresponda, retorno de mensajes). Copia esos valores; no los inventes.
3. Añade los registros al DNS de Cloudflare como **DNS only** si Resend así lo
   indica. Desactiva el proxy naranja en registros que Resend necesite resolver
   directamente.
4. Espera a que Resend marque el dominio como verificado. Configura DMARC según
   la política DNS del dominio si aún no existe.
5. Crea una clave API limitada al envío de correo.
6. Usa como `LEAD_NOTIFICATION_FROM` una dirección bajo el dominio verificado,
   por ejemplo `Vaycho <avisos@mail.reformasmantenimiento.es>`, sustituyendo
   el subdominio por el que hayas verificado realmente.
7. Guarda la clave únicamente como secreto `RESEND_API_KEY`.
8. Envía una prueba controlada y revisa tanto la respuesta HTTP como el panel
   **Emails** de Resend y el buzón receptor.

El correo del cliente se usa como `reply_to`, nunca como remitente autenticado.

## Desplegar

La configuración `wrangler.jsonc` combina Worker y Static Assets. Ya no debe
usarse el despliegue anterior basado solo en `--assets`.

```bash
npm install
npm run build:frontend
npx wrangler deploy
```

O bien:

```bash
npm run deploy
```

En Cloudflare, verifica que `reformasmantenimiento.es` y
`www.reformasmantenimiento.es` estén asociados al Worker `vaychosite` mediante
Custom Domains. HTTPS, `assets`, navegación SPA y archivos públicos son servidos
por el mismo despliegue.

## SEO técnico inicial

Se añaden estos recursos públicos:

- `/robots.txt`
- `/sitemap.xml`
- metadatos SEO base en `frontend/index.html` (title, description, canonical,
  robots, Open Graph y Twitter Card).

Comprobación rápida tras desplegar:

```bash
curl -I https://reformasmantenimiento.es/robots.txt
curl -I https://reformasmantenimiento.es/sitemap.xml
curl https://reformasmantenimiento.es/robots.txt
curl https://reformasmantenimiento.es/sitemap.xml
```

Resultado esperado:

- `robots.txt`: `HTTP 200` y `Content-Type: text/plain`
- `sitemap.xml`: `HTTP 200` y `Content-Type: application/xml` o `text/xml`
- Ninguna de esas rutas debe devolver el HTML de la SPA.

Para evitar bloqueos a Googlebot, revisa en Cloudflare:

1. **Security > WAF > Custom rules**: que no existan reglas que bloqueen o
   desafíen `User-Agent` de buscadores en `GET` de rutas públicas.
2. **Security > Bots**: permitir tráfico de bots verificados y no aplicar
   desafíos a Googlebot en el dominio principal.
3. **Security > Events**: comprobar que Googlebot no registre bloqueos para
   `/`, `/robots.txt` ni `/sitemap.xml`.

### Solicitar indexación en Google Search Console

1. Verificar la propiedad `https://reformasmantenimiento.es/`.
2. En **Sitemaps**, enviar:
   `https://reformasmantenimiento.es/sitemap.xml`.
3. Usar **Inspección de URL** con `https://reformasmantenimiento.es/` y
   solicitar indexación.
4. Revisar cobertura e informes de rastreo en los días siguientes.

## Contrato del endpoint

- `POST /api/leads`
- `Content-Type: application/json`
- Cuerpo máximo: 12 KB
- Respuestas JSON con `ok` y `message`
- `202`: Resend aceptó el envío
- `400`, `413`, `415`, `422`: entrada inválida
- `403`: origen cruzado
- `409`: duplicado reciente
- `429`: límite por aislamiento/IP
- `502`: Resend no disponible o rechazó la solicitud
- `503`: configuración de Resend incompleta

El límite de abuso es de cinco solicitudes por minuto por IP observada en cada
aislamiento de Worker, junto con deduplicación de contenido durante un minuto.
Es apropiado para una landing sin base de datos; un producto con volumen alto
puede añadir un Durable Object para límites distribuidos si fuera necesario.

## Comprobación en producción

1. Confirma que las tres variables del Worker existen y que el dominio está
   verificado en Resend.
2. Abre `https://reformasmantenimiento.es`.
3. Completa el formulario con datos identificables como prueba.
4. Comprueba que la interfaz muestra éxito y que DevTools registra
   `POST /api/leads` con estado `202`.
5. Comprueba el mensaje en Resend y, después, su recepción final en el buzón
   configurado.
6. Responde al correo y verifica que el destinatario sea el cliente de prueba
   mediante `reply_to`.

No se considera probada la entrega real sin credenciales y una ejecución de
integración contra Resend.
