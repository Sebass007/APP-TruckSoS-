# Mecánico AQP (TruckSOS) 🚛🚗

Aplicación de auxilio mecánico en tiempo real con flujo de negociación tipo inDrive, construida con **Next.js (React)**, **Capacitor** y **Supabase**.

Este documento contiene las instrucciones precisas para clonar, configurar y levantar el proyecto en tu máquina local sin errores.

---

## 📋 Requisitos Previos

Asegúrate de tener instalado lo siguiente en tu máquina:
*   **Node.js:** Versión 18 o superior.
*   **Android Studio:** Con el SDK de Android instalado (mínimo API 24).
*   **Java JDK:** Versión 21 (Requerido por las últimas versiones de Android y Gradle).

---

## 🚀 Guía de Configuración Paso a Paso

Sigue estos pasos en orden para levantar el proyecto desde cero:

### 1. Clonar el Repositorio
Clona el repositorio en tu máquina y entra al directorio del proyecto:
```bash
git clone <url-del-repositorio>
cd mecanico-aqp
```

### 2. Instalar Dependencias
Instala los paquetes de Node.js necesarios:
```bash
npm install
```

### 3. Configurar Variables de Entorno (Crítico) 🔑
El proyecto requiere conexión con Supabase. Las variables de entorno **no se suben al repositorio** por seguridad (están ignoradas en el `.gitignore`).
1. Crea una copia del archivo de ejemplo `.env.example` y llámalo `.env` o `.env.local`:
   * En Windows (PowerShell):
     ```powershell
     cp .env.example .env.local
     ```
   * En macOS/Linux/Git Bash:
     ```bash
     cp .env.example .env.local
     ```
2. Abre el archivo `.env.local` recién creado y coloca los valores reales para las siguientes variables (solicítalas al administrador del proyecto):
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Compilar la Web y Sincronizar con Capacitor 🔄
Dado que Next.js realiza una exportación estática en la carpeta `out/`, **debes compilar el proyecto antes de poder sincronizarlo con Android**. De lo contrario, Capacitor arrojará un error diciendo que la carpeta `out` no existe.

Hemos creado un comando que compila la web y la sincroniza con Android automáticamente:
```bash
npm run mobile:sync
```

*(O de manera manual paso a paso:)*
```bash
# 1. Compila la web y genera la carpeta /out
npm run static

# 2. Copia y sincroniza los archivos con la carpeta android/
npx cap sync android
```

### 5. Abrir y Ejecutar en Android Studio 📱
1. Abre **Android Studio**.
2. Selecciona **Open** (o *Import Project*) y abre **únicamente la carpeta `android`** que está en la raíz de este proyecto.
3. Espera pacientemente a que termine el **Gradle Sync** automático.
   * *Nota:* Si Android Studio te pide seleccionar la versión de JDK o arroja un error de compatibilidad Gradle, asegúrate de configurar el proyecto para usar **Java/JDK 21** en:
     `File` -> `Settings` (o `Preferences` en Mac) -> `Build, Execution, Deployment` -> `Build Tools` -> `Gradle` -> `Gradle JDK`.
4. Conecta tu celular con depuración USB activada o inicia un Emulador.
5. Presiona el botón verde de **Run** (Play) en la barra superior de Android Studio para instalar y correr la aplicación en tu dispositivo.

---

## ⚠️ Notas Importantes y Solución de Problemas

### 1. Gradle Wrapper
**¡NO modifiques, elimines ni ignores los siguientes archivos!** Estos archivos aseguran que todo el equipo use exactamente la misma versión de Gradle y evitan errores de compilación:
* `android/gradlew`
* `android/gradlew.bat`
* `android/gradle/wrapper/gradle-wrapper.jar`
* `android/gradle/wrapper/gradle-wrapper.properties`

### 2. Google Maps no carga o se queda en blanco
Para que el mapa nativo o de Google cargue en el celular, asegúrate de que el archivo `android/app/src/main/AndroidManifest.xml` tenga una API Key válida configurada.
Busca la siguiente línea en el archivo y verifica la API Key:
```xml
<meta-data android:name="com.google.android.geo.API_KEY" android:value="TU_API_KEY_AQUÍ"/>
```

### 3. Limpiar compilaciones previas si algo falla
Si después de actualizar el repositorio sigues experimentando errores con Gradle, puedes limpiar la caché corriendo desde la raíz del proyecto:
```bash
# Limpia los archivos estáticos de Next.js
rm -rf .next out

# Sincroniza limpiamente Capacitor otra vez
npm run mobile:sync
```
Y en Android Studio haz: `Build` -> `Clean Project`, y luego `File` -> `Sync Project with Gradle Files`.
