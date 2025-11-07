# 🚗 Car Advice - Generador de Recibos

Sistema de generación de recibos para Car Advice con Next.js, integrado con Google Sheets y generación automática de PDFs.

## 🎯 Características

- ✅ Generación de PDFs instantánea con html2canvas y jsPDF
- ✅ Sincronización automática con Google Sheets
- ✅ Preview en tiempo real del recibo
- ✅ Numeración automática de recibos
- ✅ Modo offline con fallback local
- ✅ Diseño responsive y moderno
- ✅ Validación de formularios
- ✅ Soporte para múltiples monedas (ARS/USD)

## 📋 Requisitos Previos

- Node.js 18+ (recomendado usar nvm para gestión de versiones)
- npm o yarn
- Backend de Car Advice corriendo (puerto 3002 por defecto)

## 🚀 Instalación

### 1. Clonar el repositorio e instalar dependencias

```bash
cd frontend
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del directorio `frontend`:

```bash
# Para desarrollo local
NEXT_PUBLIC_API_URL=http://localhost:3002

# Para producción, reemplaza con tu URL real
# NEXT_PUBLIC_API_URL=https://tu-api-produccion.com
```

> **Nota**: El archivo `.env.local` está incluido en `.gitignore` y no se commitea al repositorio por seguridad.

### 3. Verificar que las imágenes estén en su lugar

Asegúrate de que existan los siguientes archivos de imágenes en `public/img/`:

- `logo_recibo.png` - Logo principal para el recibo
- `iso_negro.png` - Isotipo negro para pie de página

## 💻 Desarrollo

### Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

> **Importante**: Asegúrate de que el backend esté corriendo en el puerto 3002 (o el puerto que hayas configurado en `.env.local`)

### Iniciar el backend

En otra terminal, navega al directorio `backend` y ejecuta:

```bash
cd ../backend
npm install
node server.js
```

El backend debería estar corriendo en `http://localhost:3002`

## 🏗️ Build para Producción

```bash
npm run build
npm start
```

## 📝 Uso de la Aplicación

1. **Al cargar la página**: 
   - Se conecta automáticamente al backend
   - Obtiene el próximo número de recibo disponible
   - Muestra un mensaje de estado de conexión

2. **Llenar el formulario**:
   - Campos obligatorios: Cliente y Monto
   - El preview se actualiza en tiempo real

3. **Generar PDF**:
   - Click en "Descargar PDF"
   - Se validan los campos obligatorios
   - Se genera el PDF localmente
   - Se guarda automáticamente en Google Sheets
   - Se obtiene el siguiente número de recibo

4. **Modo Sin Conexión**:
   - Si el backend no está disponible, usa numeración local
   - Los PDFs se generan pero NO se guardan en Google Sheets
   - Se muestra una advertencia clara al usuario

## 🔧 Estructura del Proyecto

```
frontend/
├── pages/
│   ├── _app.js          # Configuración global de Next.js
│   ├── _document.js     # Documento HTML personalizado
│   └── index.js         # Página principal (Generador de Recibos)
├── public/
│   └── img/
│       ├── logo_recibo.png   # Logo para recibos
│       └── iso_negro.png     # Isotipo
├── styles/
│   └── globals.css      # Estilos globales y de recibos
├── .env.local           # Variables de entorno (NO commitear)
├── package.json         # Dependencias del proyecto
└── next.config.mjs      # Configuración de Next.js
```

## 🎨 Personalización

### Cambiar colores del brand

Edita las variables CSS en `styles/globals.css`:

```css
:root {
  --brand: #ff6b00;      /* Color principal (naranja Car Advice) */
  --line: #e9e9e9;       /* Color de líneas */
  --ink: #111;           /* Color de texto */
  --muted: #666;         /* Color de texto secundario */
}
```

### Modificar información de la empresa

Edita las direcciones y teléfonos directamente en `pages/index.js` en la sección del preview del recibo.

## 🔗 API Endpoints Utilizados

El frontend consume los siguientes endpoints del backend:

- **GET** `/api/recibos/next-number` - Obtiene el próximo número de recibo
- **POST** `/api/recibos` - Guarda un nuevo recibo en Google Sheets

## 🐛 Troubleshooting

### El número de recibo no se carga

- Verifica que el backend esté corriendo
- Verifica que la URL en `.env.local` sea correcta
- Revisa la consola del navegador para ver errores de CORS

### Las imágenes no se cargan

- Verifica que las imágenes existan en `public/img/`
- Los nombres deben coincidir exactamente (case-sensitive)
- Reinicia el servidor de desarrollo después de agregar imágenes

### Error de CORS

El backend debe tener configurado CORS. Verifica que en `backend/server.js` esté:

```javascript
app.use(cors());
```

### El PDF no se genera correctamente

- Verifica que html2canvas y jspdf estén instalados
- Comprueba la consola del navegador para errores
- Asegúrate de que las imágenes se carguen con CORS habilitado

## 📱 Compatibilidad

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Seguridad

- Las variables de entorno están protegidas en `.env.local`
- Los archivos `.env*` están en `.gitignore`
- Solo se exponen variables con prefijo `NEXT_PUBLIC_*`

## 📦 Dependencias Principales

- **next**: 15.4.6 - Framework React
- **react**: 19.1.0 - Librería UI
- **html2canvas**: ^1.4.1 - Captura de HTML a imagen
- **jspdf**: ^2.5.1 - Generación de PDFs
- **tailwindcss**: ^4 - Estilos CSS

## 🤝 Soporte

Para problemas o consultas, contacta al equipo de desarrollo de Car Advice.

## 📄 Licencia

Propiedad de Car Advice © 2025

---

**Desarrollado con ❤️ para Car Advice**
