# 🚛 TRUCK-SOS - Plataforma de Auxilio Mecánico y Emergencia Vial Satelital

**TruckSOS** es una aplicación móvil y web de vanguardia diseñada para conectar instantáneamente a conductores de camiones, autos, minivans y motos con talleres mecánicos y servicios de grúa afiliados en tiempo real. Utilizando geolocalización satelital, negociación en vivo de tarifas y asistencia guiada por Inteligencia Artificial, la plataforma garantiza una respuesta inmediata ante emergencias viales en carreteras y rutas urbanas.

---

## 🛠️ Stack Tecnológico

* **Core & Framework:** Next.js 16 (App Router), React 19, TypeScript.
* **Móvil & Híbrido:** Capacitor 8 (Integración nativa para Android, GPS Geolocation, Google Maps Native).
* **Base de Datos & Realtime:** Supabase (Autenticación, Postgres Database, Realtime WebSockets).
* **Inteligencia Artificial:** Asistente Inteligente de Diagnóstico Vial (Gemini API / Motor de Recomendación IA).
* **Diseño & UI/UX:** TailwindCSS, Lucide Icons, Tokens de Material Design 3 (Dark Mode, Glassmorphism, Responsive UI).

---

## 🤖 Componente de Inteligencia Artificial (IA)

La aplicación integra de forma nativa el **Asistente IA TruckSOS**, una herramienta avanzada contextualizada según el tipo de vehículo (Camión, Auto, Minivan, Moto) y la avería reportada. 
* **Diagnóstico en Tiempo Real:** El usuario puede describir el problema en lenguaje natural o solicitar una recomendación al instante.
* **Recomendación Personalizada:** La IA analiza la avería y sugiere repuestos, tipos de servicio adecuados (Llantas, Batería, Mecánica, Grúa) y recomendaciones de seguridad.
* **Auto-completado Inteligente:** Con un solo clic (`Aplicar Recomendación`), el resultado generado por la IA llena automáticamente el formulario de solicitud de auxilio para agilizar la atención en carretera.

---

## 👥 Integrantes del Proyecto

* **Amaro Oré, Sebastian Fabrizzio**
* **Diaz Diaz, Jesus Miguel**
* **Flores Oviedo, Julio Alfredo**
* **Quispe Encarnacion, Rusell Abad**
* **Suca Quispe, Diego Alonso**

---

## 📱 Capturas de Pantalla de la Aplicación

| 1. Mapa GPS y Selección de Auxilio | 2. Cotización y Chat Realtime | 3. Historial de Servicios Terminados |
| :---: | :---: | :---: |
| ![Mapa GPS](https://raw.githubusercontent.com/Sebass007/APP-TruckSoS-/main/public/screenshots/screen1.png) | ![Chat Realtime](https://raw.githubusercontent.com/Sebass007/APP-TruckSoS-/main/public/screenshots/screen2.png) | ![Historial](https://raw.githubusercontent.com/Sebass007/APP-TruckSoS-/main/public/screenshots/screen3.png) |

---

## 📹 Video de Demostración

🎥 **Enlace al video explicativo en YouTube (3 - 5 minutos narrado):**  
👉 [Ver Demostración Completa de TruckSOS en YouTube](https://www.youtube.com/watch?v=trucksos-demo-placeholder)

---

## ⚙️ Instrucciones de Configuración y Despliegue

### 1. Requisitos Previos
* Node.js (v18 o superior)
* npm o yarn
* Android Studio (para compilación del APK móvil)

### 2. Variables de Entorno (API Keys)
Para ejecutar la aplicación, crea un archivo `.env.local` en la raíz del proyecto (basado en `.env.example`). Ninguna clave está expuesta en el código fuente:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
NEXT_PUBLIC_GEMINI_API_KEY=tu-api-key-de-gemini
```

### 3. Instalación y Ejecución en Desarrollo
```bash
# Clonar el repositorio
git clone https://github.com/Sebass007/APP-TruckSoS-.git
cd APP-TruckSoS-

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### 4. Compilación del APK para Android
```bash
# Generar paquete estático y sincronizar con Capacitor Android
npm run mobile:sync

# Abrir en Android Studio para generar el APK (Build -> Build APK(s))
npx cap open android
```
