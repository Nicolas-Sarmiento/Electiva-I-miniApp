# Electiva I Mini app

esta aplicacion es una mini app para  electiva 1(Analitica de datos), la cual se basa en el siguiente contexto:

## Objetivo de la sesión

Que el estudiante comprenda e implemente una base de datos en la nube
utilizando Firebase, aplicando autenticación, operaciones CRUD y reglas
de seguridad para garantizar aislamiento de datos entre usuarios.

------------------------------------------------------------------------

## Contexto del problema

Las plataformas sociales académicas permiten compartir ideas,
reflexiones y recursos entre estudiantes. En esta sesión construiremos
una versión simplificada de este tipo de sistema usando tecnología serverless.

Compararemos: - Firebase Firestore - Amazon DynamoDB

------------------------------------------------------------------------

## Modelo de Datos

### Firestore (Documentos y Colecciones)

Estructura propuesta:

usuarios (colección)\
└── userId (documento)\
├── nombre\
├── email

posts (colección)\
└── postId (documento)\
├── contenido\
├── fecha\
├── userId\
├── autorNombre

Cada publicación pertenece a un usuario.

------------------------------------------------------------------------

### DynamoDB (Clave-valor + documento)

Ejemplo equivalente:

``` json
{
  "PostId": "abc123",
  "UserId": "usuario123",
  "Contenido": "Reflexión sobre bases NoSQL",
  "Fecha": "2026-03-04"
}
```

Aquí es clave diseñar correctamente la Partition Key.

------------------------------------------------------------------------

## Comparación Clave

 |Característica|Firestore|DynamoDB|
|-----------------|-------------|---------------------------------------------|
 |Modelo|Documentos y colecciones|Clave-valor + documentos|
 |Seguridad|Reglas declarativas|IAM Policies|
 |Escalabilidad|Automática|Control de throughput|
  |Enfoque|APPS móviles y web en tiempo real|Sistemas masivos AWS|

------------------------------------------------------------------------

## Seguridad (Punto Central del Taller)

Regla obligatoria del reto:

Cada usuario solo puede modificar o eliminar sus propios posts.

Ejemplo de regla en Firestore:

``` javascript
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

Validación grupal:

- Usuario A crea un post.
- Usuario B intenta editarlo.
- Debe fallar.

------------------------------------------------------------------------

## Taller Grupal (80 minutos)

### Reto: Construir una Mini Red Social Académica

Debe incluir:

- Login con Firebase Authentication (correo o Google)
- Crear publicaciones
- Listar publicaciones
- Editar publicaciones propias
- Eliminar publicaciones propias
- Aplicar reglas de seguridad
- Prueba cruzada entre compañeros

------------------------------------------------------------------------

## Instrucciones para los estudiantes

1. Crear proyecto en Firebase Console.
2. Activar Authentication y Firestore.
3. Crear app Web (HTML + JS, React o Flutter).
4. Implementar autenticación.
5. Crear colección `posts`.
6. Implementar CRUD.
7. Configurar reglas.
8. Probar seguridad con diferentes cuentas.

------------------------------------------------------------------------

## Competencias a Desarrollar

### Técnicas

- Conexión cliente → backend serverless
- CRUD en NoSQL
- Seguridad declarativa
- Aislamiento multiusuario

### Analíticas

- Diferenciar modelo documental vs clave-valor
- Diseñar estructuras de datos en NoSQL
- Evaluar patrones de acceso

### Colaborativas

- Diseño conjunto del modelo
- Testing cruzado
- Documentación técnica breve

------------------------------------------------------------------------

## Producto Final Esperado

Mini app funcional con:

- Login
- CRUD completo
- Reglas de seguridad funcionando
- Evidencia en GitHub o demo en hosting

------------------------------------------------------------------------

## Criterios de Evaluación

  |Criterio|Peso|
  |---------------|------|
  |Funcionalidad|40%|
  |Seguridad|40%|
  |Presentación|20%|

------------------------------------------------------------------------

## Reto Opcional

- Sistema de "likes"
- Filtro por usuario
- Timestamp automático
- Deploy en Firebase Hosting
- Comparación con DynamoDB

------------------------------------------------------------------------
