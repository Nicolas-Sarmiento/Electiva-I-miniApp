# Foro Académico de Nim

Una aplicación web interactiva desarrollada con **Next.js 16**, **React**, y **Tailwind CSS v4** diseñada para facilitar discusiones académicas. Los usuarios pueden autenticarse de manera segura, crear publicaciones de texto con imágenes, comentar en hilos de discusión y alternar entre modo Claro y Oscuro.

El Backend, la base de datos y la autenticación están impulsados por **Firebase**, mientras que el almacenamiento y optimización de imágenes es gestionado por **Cloudinary**.

---

## 🚀 Tecnologías Principales

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Autenticación:** Firebase Authentication (Email/Contraseña, Google Auth)
- **Base de Datos:** Firebase Firestore (Almacenamiento en tiempo real de Posts y Comentarios)
- **Almacenamiento de Imágenes:** Cloudinary (Widget de subida directa sin servidor)
- **Despliegue Recomendado:** Vercel

---

## 📦 Prerrequisitos

Para ejecutar este proyecto en tu entorno local necesitas tener instalados:

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- [Git](https://git-scm.com/)

---

## ⚙️ Configuración del Entorno Local

Sigue estos pasos para hacer correr el proyecto en tu máquina.

### 1. Clonar el repositorio

Abre tu terminal y ejecuta:

```bash
git clone https://github.com/TU_USUARIO/foro-academico-nim.git
cd foro-academico-nim
```
*(Asegúrate de cambiar TU_USUARIO por el nombre de usuario de Github donde se subió el proyecto o el enlace directo provisto por el estudiante).*

### 2. Instalar dependencias

Con la terminal en la raíz del proyecto, ejecuta el gestor de paquetes de Node:

```bash
npm install
```

### 3. Configurar Variables de Entorno

El proyecto requiere credenciales para conectarse a los servicios en la nube de Firebase y Cloudinary.

1. En la raíz del proyecto, crea un archivo oculto llamado estrictamente `.env.local`
2. Abre `.env.local` y añade las siguientes variables con las claves de los servicios usados para el proyecto:

```env
# FIREBASE CREDENTIALS
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="tu-proyecto.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="tu-proyecto"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="tu-proyecto.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1234567890"
NEXT_PUBLIC_FIREBASE_APP_ID="1:1234567890:web:abcd123456"

# CLOUDINARY CREDENTIALS
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu_cloud_name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="tu_upload_preset"
```

*(Nota para el evaluador: Las credenciales reales deben ser facilitadas por el estudiante a través de un canal seguro, ya que, por buenas prácticas de seguridad informática, los archivos `.env` o secretos en texto plano jamás se incluyen en el repositorio público de GitHub).*

---

## 💻 Ejecutar la Aplicación

### Servidor de Desarrollo

Una vez configurado el archivo `.env.local` y con las dependencias instaladas, inicia el entorno de desarrollo corriendo:

```bash
npm run dev
```

Abre en tu navegador la dirección [http://localhost:3000](http://localhost:3000) y verás el proyecto corriendo.

### Construir para Producción (Simulación Local)

Si deseas probar el rendimiento de la aplicación ya compilada tal cual la vería un usuario final (Recomendable para testar errores de optimización estática), ejecuta estos dos comandos:

```bash
# Construye la versión optimizada
npm run build

# Levanta el servidor local con la versión ya optimizada
npm start
```

## ✨ Características Abordadas

- Registro e Inicio de sesión usando **Firebase Auth**.
- Base de datos en tiempo real mediante **Firestore**.
- Edición de perfiles (Nombres y Avatares de usuario en la Nube mediante **Cloudinary**).
- Creación ágil de publicaciones (Soporte CRUD: Crear, Leer, Actualizar, Borrar).
- Zona de comentarios anidada dentro de cada Publicación.
- Soporte Multi-Tema moderno y responsivo para Light y Dark modes.
