# Mecánico AQP (TruckSOS) 🚛🚗

Aplicación de auxilio mecánico en tiempo real con flujo de negociación tipo inDrive.

## 🚀 Guía para el Equipo

Para que la aplicación funcione en tu computadora, sigue estos pasos:

### 1. Clonar y Configurar
1. Clona el repositorio.
2. Abre la carpeta `mecanico-aqp` en VS Code.
3. Instala las dependencias:
   ```bash
   npm install
   ```

### 2. Variables de Entorno (IMPORTANTE)
El archivo `.env.local` está ignorado por seguridad. Debes crearlo en la raíz de `mecanico-aqp` con las credenciales de Supabase que compartimos por el grupo:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_aqui
```

### 3. Ejecutar en Web (Desarrollo)
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000).

### 4. Ejecutar en Android (Emulador/Físico)
Si quieres ver los cambios en Android Studio:
1. Genera el build:
   ```bash
   npm run build
   ```
2. Sincroniza con Capacitor:
   ```bash
   npx cap sync android
   ```
3. Abre Android Studio y dale a **Run**.

## 🛠️ Tecnologías
- **Frontend:** Next.js (App Router), Tailwind CSS, Lucide React.
- **Backend/Base de Datos:** Supabase (Auth, DB, Realtime).
- **Móvil:** Capacitor.js.
- **Mapas:** Leaflet / OpenStreetMap.

---
**Nota:** Cada vez que hagas cambios grandes en el diseño web y quieras verlos en el emulador de Android, recuerda correr `npm run build` y `npx cap sync android`.
