# Mecánico AQP (TruckSOS) 🚛🚗

Aplicación de auxilio mecánico en tiempo real con flujo de negociación tipo inDrive.

## 🚀 Guía de Configuración para el Equipo

Para que la aplicación compile y funcione correctamente en cualquier máquina, sigue estos pasos:

### 1. Requisitos Previos
*   **Node.js:** Versión 18 o superior.
*   **Android Studio:** Con el SDK de Android (mínimo API 24).
*   **Java JDK:** Versión 21 (Requerido por las últimas versiones de Android y Gradle).

### 2. Instalación y Configuración Inicial
1.  Clona el repositorio.
2.  Instala las dependencias de Node:
    ```powershell
    npm install
    ```

### 3. Variables de Entorno (CRÍTICO) 🔑
El archivo `.env.local` contiene las llaves de acceso a la base de datos y **no se sube al repositorio**.
1.  Copia el archivo de ejemplo:
    ```powershell
    cp .env.local.example .env.local
    ```
2.  Abre `.env.local` y reemplaza los valores con las credenciales de nuestro proyecto en Supabase (solicítalas si no las tienes).

### 4. Configuración de Android Studio 📱
Hemos actualizado el proyecto para soportar Kotlin y las últimas versiones de los plugins de mapas.
1.  Abre la carpeta `android` con **Android Studio**.
2.  Espera a que termine el "Gradle Sync". Si te pide instalar el **JDK 21**, acepta la instalación.
3.  Si ves errores de paquetes o plugins, ejecuta en tu terminal:
    ```powershell
    npx cap sync android
    ```

### 5. Flujo de Trabajo (Web -> Android)
Para ver tus cambios reflejados en el celular o emulador:
1.  Compila la web:
    ```powershell
    npm run static
    ```
2.  Sincroniza con el proyecto Android:
    ```powershell
    npx cap sync android
    ```
3.  En Android Studio, presiona el botón **Run** (Play verde).

---
**Nota sobre Google Maps:** Para que el mapa funcione en el celular, asegúrate de que el archivo `android/app/src/main/AndroidManifest.xml` tenga una API KEY válida en la sección `com.google.android.geo.API_KEY`.
