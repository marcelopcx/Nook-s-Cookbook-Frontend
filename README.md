# 🍳 Nook's Cookbook (Frontend)

¡Bienvenido a **Nook's Cookbook**! Este proyecto es una aplicación móvil de recetas inspirada y tematizada con el universo de *Animal Crossing*. El desarrollo forma parte de una asignación práctica para el curso de **Desarrollo de Aplicaciones Móviles** en la **Universidad Rafael Urdaneta (URU)**.

La aplicación cuenta con una arquitectura moderna desacoplada:
* Desarrollado en **React Native** con **Expo** (Expo Router) utilizando **Tailwind CSS** a través de **NativeWind** para un diseño responsivo y estilizado.

---

## 🚀 Guía de Inicialización del Proyecto

Sigue estos pasos para clonar, configurar y ejecutar el proyecto localmente en tu entorno de desarrollo o dispositivo de pruebas.

### 📋 Prerrequisitos

Asegúrate de tener instalado lo siguiente en tu sistema (ideal para entornos macOS/M1 y similares):
1.  **Node.js** (Versión LTS recomendada) y `npm`.

3.  La aplicación **Expo Go** instalada en tu dispositivo móvil (Android o iOS) para probar la app en tiempo real.

---

## 📱 Configuración del Frontend (React Native + Expo)

1.  **Navega al directorio del frontend:**
    ```bash
    cd frontend
    ```

2.  **Instala las dependencias del proyecto:**
    Usamos una combinación fija y probada para garantizar la compatibilidad de NativeWind con el empaquetador Metro:
    ```bash
    npm install
    ```

3.  **Configura las Variables de Entorno (`.env`):**
    Crea un archivo llamado `.env` en la raíz de la carpeta `frontend/` para apuntar al servidor backend. Debes usar tu dirección IP local en lugar de `localhost` para que tu dispositivo móvil pueda conectarse correctamente:
    ```env
    EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:3000
    ```
    *Nota: Puedes conocer tu IP ejecutando `ifconfig` (Mac/Linux) o `ipconfig` (Windows) en tu terminal.*

4.  **Inicia el servidor de desarrollo de Expo:**
    Para asegurar que todas las configuraciones de Tailwind y variables de entorno se lean de forma limpia, inicia limpiando la caché:
    ```bash
    npx expo start -c
    ```

5.  **Ejecutar en tu dispositivo:**
    * Escanea el código QR que aparece en la terminal usando la app **Expo Go** (en Android) o la cámara nativa (en iOS).
    * Presiona `a` en la terminal para abrirlo en un emulador de Android o `i` para el simulador de iOS si los tienes configurados.

---

## 📂 Arquitectura de Carpetas

El frontend está organizado bajo un patrón de diseño limpio que separa la UI de la lógica de negocio:

* `app/` - Sistema de rutas manejado por **Expo Router** (pestañas principales como `index.tsx` y `profile.tsx`).
* `components/` - Componentes visuales organizados en `ui/` (reutilizables) y `recipes/` (tarjetas y listas de cocina).
* `constants/` - Configuración global y centralización de la URL leída del `.env`.
* `hooks/` - Custom Hooks para aislar la lógica de peticiones y estados de la interfaz.
* `services/` - Módulos de servicios de red (`api.ts`) encargados de la comunicación directa con el `Backend`.
* `types/` - Interfaces y tipados de TypeScript para garantizar la consistencia de los datos.