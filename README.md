# Foro Académico de Nim

Una aplicación web interactiva desarrollada con **Next.js 16**, **React**, y **Tailwind CSS v4** diseñada para facilitar discusiones académicas. Los usuarios pueden autenticarse de manera segura, crear publicaciones de texto con imágenes, comentar en hilos de discusión y alternar entre modo Claro y Oscuro.

El Backend, la base de datos y la autenticación están impulsados por **Firebase**, mientras que el almacenamiento y optimización de imágenes es gestionado por **Cloudinary**.

---
## Integrantes del Grupo

- Kimberly Natalia Figuero Zapata
- Edwin David Martinez Gomez
- Andres Felipe Luna Becerra
- Nicolas Sarmiento

## 🚀 Tecnologías Principales

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Autenticación:** Firebase Authentication (Email/Contraseña, Google Auth)
- **Base de Datos:** Firebase Firestore (Almacenamiento en tiempo real de Posts y Comentarios)
- **Almacenamiento de Imágenes:** Cloudinary (Widget de subida directa sin servidor)
- **Despliegue:** Vercel

---

## 📦 Prerrequisitos

Para ejecutar este proyecto en tu entorno local necesitas tener instalados:

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- [Git](https://git-scm.com/)

---

## Reglas de seguridad de Firebase

La aplicación utiliza Firebase Firestore como base de datos NoSQL para almacenar la información de usuarios, publicaciones, comentarios e interacciones dentro del foro. La estructura está organizada en colecciones y subcolecciones para mantener una relación clara entre los diferentes elementos del sistema.

La base de datos de Firebase utiliza reglas de seguridad para garantizar que únicamente los usuarios autorizados puedan acceder o modificar la información almacenada. Las reglas implementadas en el proyecto controlan el acceso a las colecciones principales `posts`, `usuarios`, `comments` y `likes` de la siguiente forma:

- Acceso público de lectura:
Las publicaciones y comentarios pueden ser consultados por cualquier usuario.

- Autenticación obligatoria para escritura:
Solo los usuarios autenticados pueden crear publicaciones, comentarios o dar "like".

- Control de propiedad del contenido:
Un usuario únicamente puede modificar o eliminar los recursos que ha creado.

- Protección de perfiles de usuario:
Cada usuario solo puede crear, actualizar o eliminar su propio documento dentro de la colección `usuarios`.

Estas reglas buscan mantener un equilibrio entre accesibilidad y seguridad, permitiendo la interacción abierta con el contenido del foro mientras se protege la integridad de los datos y la propiedad de cada publicación o comentario. Las reglas implementadas en Firestore fueron:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
      
      match /likes/{userId} {
        allow read: if true;
        allow write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /comments/{commentId} {
        allow read: if true;
        allow create: if request.auth != null;
        allow update, delete: if request.auth != null && (request.auth.uid == resource.data.userId || request.auth.uid == get(/databases/$(database)/documents/posts/$(postId)).data.userId);
      }
    }
  }
}
```
Adicionalmente, para la autenticación de usuarios, se utilizan el método por correo y con inicio de sesión de Google, los cuales se configuran en la pestaña: Autenticación > Métodos de registro. Luego, dando click en Añadir un nuevo proveedor y seleccionando `Correo/Contraseña` y `Google`.


## ⚙️ Configuración del Entorno Local

Sigue estos pasos para hacer correr el proyecto en tu máquina.

### 1. Clonar el repositorio

Abre tu terminal y ejecuta:

```bash
git clone https://github.com/Nicolas-Sarmiento/Electiva-I-miniApp.git
cd Electiva-I-miniApp
```


### 2. Instalar dependencias

Con la terminal en la raíz del proyecto, ejecuta el gestor de paquetes de Node:

```bash
npm install
```

### 3. Configurar Variables de Entorno

El proyecto requiere credenciales para conectarse a los servicios en la nube de Firebase y Cloudinary.

1. En la raíz del proyecto, crea un archivo oculto llamado estrictamente `.env.local`
2. Abre `.env.local` y añade las variables con las claves de los servicios usados para el proyecto:

*(NOTA: Las credenciales son facilitadas a través del moodle).*

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

## 🌐 Despliegue

La aplicación se encuentra desplegada en la plataforma **Vercel**, la cual permite la integración directa con repositorios de GitHub para realizar despliegues automáticos.

Para acceder a la versión en producción ingresar al siguiente enlace:

https://electiva-i-mini-app.vercel.app/
