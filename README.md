# Mecánico AQP (TruckSOS) 🚛🚗

**Mecánico AQP (TruckSOS)** es una solución móvil de auxilio mecánico inmediato en tiempo real diseñada para conductores varados en la carretera o la ciudad. La plataforma utiliza un flujo dinámico de negociación directa (tipo *inDrive*) entre el cliente y proveedores cercanos, respaldado por un asistente inteligente de recomendaciones técnicas.

---

## 🛠️ Stack Tecnológico

El proyecto está desarrollado con una arquitectura moderna híbrida multiplataforma:

* **Core & Framework Web:** [Next.js 16](https://nextjs.org/) (React 19, App Router) y [TypeScript](https://www.typescriptlang.org/).
* **Estilos & Diseño:** [Tailwind CSS v4](https://tailwindcss.com/) con diseño adaptable en modo oscuro y componentes interactivos.
* **Backend & Persistencia:** [Supabase](https://supabase.com/) (Autenticación de usuarios, Base de Datos PostgreSQL en tiempo real con Row Level Security y WebSockets).
* **Geolocalización & Mapas:** [Leaflet](https://leafletjs.com/) y `react-leaflet` con mapas interactivos de soporte.
* **Integración Nativa Móvil:** [Capacitor v8](https://capacitorjs.com/) para compilación y generación del paquete nativo Android (APK).
* **Iconografía:** [Lucide React](https://lucide.react.dev/).

---

## 🤖 Componente de IA (TruckSOS AI Assistant)

La aplicación integra el **Asistente Experto TruckSOS IA** directamente dentro del flujo central de solicitud de ayuda (`AsistenteIA.tsx`):

1. **Diagnóstico & Recomendación Técnica:** El usuario interactúa con el asistente para recibir recomendaciones de repuestos (llantas de carga o ligeras, baterías de alto amperaje, aceites sintéticos o sistemas de freno) ajustadas exactamente al tipo de vehículo (Camión, Auto, Minivan, Moto).
2. **Impacto Directo en la UI ("Copiar al SOS"):** La IA no funciona como un chat aislado; los resultados incluyen tarjetas interactivas con precio estimado, especificaciones y un botón de un solo clic (**"Copiar al SOS"**).
3. **Modificación de Estado:** Al presionar el botón, la IA auto-completa la categoría de emergencia y la descripción técnica dentro del formulario activo del cliente, permitiéndole enviar la alerta de auxilio de forma inmediata a los mecánicos cercanos.

---

## 📸 Capturas de Pantalla de la Aplicación

| Landing Page & Mapa | Formulario SOS con IA | Panel de Negociación |
| :---: | :---: | :---: |
| *(Agrega aquí captura del mapa)* | *(Agrega aquí captura del Asistente IA)* | *(Agrega aquí captura de ofertas)* |

*(Nota: Reemplaza los textos anteriores por los enlaces o imágenes de tu aplicación).*

---

## 🎬 Video Demostrativo

📹 **Link al Video de YouTube (3-5 minutos):** [Ver Video en YouTube](https://youtube.com/YOUR_VIDEO_LINK_HERE)  
*(El video muestra el flujo completo: registro, uso de la IA con datos reales, solicitud de auxilio y negociación en tiempo real).*

---

## 👥 Integrantes del Equipo

* **Integrante 1:** Nombre Completo - Código / Rol
* **Integrante 2:** Nombre Completo - Código / Rol
* **Integrante 3:** Nombre Completo - Código / Rol

---

## 🚀 Guía de Configuración e Instalación

Sigue estos pasos para levantar el proyecto en tu entorno local:

### 1. Requisitos Previos
* **Node.js:** Versión 18 o superior.
* **Android Studio:** SDK de Android instalado (API 24 o superior).
* **Java JDK:** Versión 21.

### 2. Clonar e Instalar Dependencias
```bash
git clone https://github.com/Sebass007/APP-TruckSoS-.git
cd APP-TruckSoS-
npm install
```

### 3. Configurar Variables de Entorno y API Keys 🔑
Crea un archivo `.env.local` en la raíz del proyecto (basado en `.env.example`) y configura las credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

*Para mapas nativos en Android, asegúrate de colocar tu Google Maps API Key en `android/app/src/main/AndroidManifest.xml`:*
```xml
<meta-data android:name="com.google.android.geo.API_KEY" android:value="TU_API_KEY_AQUÍ"/>
```

### 4. Compilar Web y Sincronizar con Android 🔄
Para generar la carpeta estática `/out` y copiarla a Android Studio:
```bash
npm run mobile:sync
```

### 5. Abrir en Android Studio y Generar APK 📱
```bash
npm run mobile:open
```
* O abre manualmente la carpeta **`android`** dentro de Android Studio.
* Para generar el APK de entrega: Ve a **Build ➔ Build Bundle(s) / APK(s) ➔ Build APK(s)**.

---

## ⚠️ Solución de Problemas Frecuentes
Si realizas cambios en el código web (Next.js/React), recuerda siempre ejecutar `npm run mobile:sync` antes de volver a presionar **Run (Play)** en Android Studio para visualizar las actualizaciones en el celular o emulador.
