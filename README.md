# Gestión de estudiantes y cursos

API académica Node.js/Express/MongoDB para alumnos, maestros y cursos. Esta entrega protege la inscripción bajo concurrencia, comprueba la identidad en las escrituras y ofrece una demo reproducible con datos ficticios.

## Arranque desde un clon limpio

Requisitos: Node 24 LTS (también verificado con 22.15), npm y MongoDB 8 en replica set. MongoDB standalone no permite las transacciones que mantienen el máximo de tres cursos, por lo que el servidor rechaza esa configuración al arrancar.

```sh
git clone https://github.com/Dabp7/Gestion_Estudiantes_2020527.git
cd Gestion_Estudiantes_2020527
npm ci
docker compose up -d --wait
```

Copiar `.env.example` como `.env`, elegir una clave JWT propia de al menos 32 caracteres e iniciar:

```sh
npm run seed
npm start
```

API local: http://127.0.0.1:3006. Health: `/health`. El contenedor Mongo publica solo loopback en 27026; la URI incluye `directConnection=true` porque su replica set anuncia el puerto interno. `docker compose down` detiene la base y conserva el volumen de demo.

El seed exige una base cuyo nombre termine en `_demo`, no elimina datos y puede repetirse. Crea `teacher_demo@example.test`, `teacher_other@example.test` y `student_demo@example.test`, con contraseña **ficticia** `DemoOnly!2026`, y cuatro cursos. No usar estas cuentas/clave en un despliegue real. Si la base de la demo ya tenía datos, el seed los conserva.

## Contratos

Prefijo: `/gestionSystem/v1`. Login devuelve `userDetails.token`; enviar `Authorization: Bearer <token>` (se conserva `x-token` como alternativa). Los tokens duran una hora y las cuentas desactivadas dejan de ser válidas inmediatamente.

- `POST /auth/register`: `name`, `username`, `email`, `phone` de ocho dígitos y `password` fuerte. Solo crea estudiantes. Los maestros se preparan por seed o administración controlada, nunca por un rol enviado al registro público.
- `POST /auth/login`: `email` o `username`, y `password`.
- `GET /courses?limite=20&desde=0`: catálogo paginado y ordenado, sin listas de alumnos; límite máximo 100.
- `GET /courses/searchCourse/:id`: detalle público sin roster.
- `POST /courses/addcourse`: maestro autenticado, `name` y `description`; el propietario siempre es el JWT. `email` es opcional por compatibilidad y debe coincidir si se envía.
- `PUT /courses/updateCourse/:uid`: solo el maestro propietario; solo `name` y `description` son editables.
- `DELETE /courses/deleteCourse/:courseId/:teacherId`: solo el propietario. El ID de la URL debe coincidir con el token; no concede permisos por sí mismo.
- `POST /students/addcourse/:courseId`: alumno autenticado; `studentId` opcional debe ser propio. Máximo tres cursos activos y una membresía por curso.
- `GET /students/courses/:id`: solo el alumno autenticado.
- `DELETE /students/courses/:id/:courseId`: retiro del propio alumno.
- `PUT /students/editStudent/:uid`: perfil propio; solo nombre, username, email y teléfono.
- `DELETE /students/deleteStudent/:id`: desactiva perfil propio y retira sus inscripciones en una transacción.
- `GET /teachers/:uid`: cursos del maestro autenticado con paginación acotada.

Respuestas: 400 datos inválidos; 401 token ausente/inválido; 403 rol o perfil ajeno; 404 curso propio/recurso inexistente; 409 duplicado o límite. Un maestro ajeno no puede cambiar ni transferirse un curso enviando otro `teacherId`. No se devuelven hashes ni errores internos de base.

## Regla de inscripción y borrado

Las inscripciones tienen una sola fuente de verdad: `Course.students`. La transacción escribe primero el documento del alumno mediante `enrollmentVersion`, consulta el conteo y actualiza el curso. Dos transacciones del mismo alumno entran en conflicto y el driver reintenta sobre un snapshot nuevo: cuatro solicitudes simultáneas dejan exactamente tres cursos y seis duplicadas dejan una pertenencia.

Borrar un curso elimina sus inscripciones con el propio documento y libera capacidad. No queda un array duplicado en el alumno que pueda desincronizarse. Desactivar un alumno y retirar sus pertenencias comparten transacción; una inscripción concurrente no deja un alumno inactivo en un curso.

Los datos académicos anteriores continúan usando `Course.students`; no requieren migrar a otra tabla ni inicializar contadores de capacidad. `enrollmentVersion` tiene valor inicial cero y `$inc` también funciona en documentos históricos sin ese campo.

## Pruebas y CI

```sh
npm run verify
npm audit --audit-level=high
```

`npm test` inicia un **MongoDB real en replica set temporal** mediante mongodb-memory-server, no un mock ni una base en memoria del ODM. La primera prueba puede descargar binarios oficiales. En Windows con MongoDB ya instalado:

```powershell
$env:MONGOMS_SYSTEM_BINARY = 'C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe'
$env:MONGOMS_SYSTEM_BINARY_VERSION_CHECK = 'false'
npm run verify
```

La suite cubre carreras de límite/duplicado, permisos de maestros y alumnos, limpieza al borrar, carrera de desactivación, proyección de contraseña, registro/login y seed repetible. CI instala desde el lockfile y ejecuta la misma suite. El instalador evita descargar Mongo durante `npm ci`; se obtiene o selecciona el binario al ejecutar las pruebas.

## Configuración y alcance

`.env.example` contiene valores ficticios. `.env` y la colección Postman antigua dejaron de versionarse en esta entrega; el historial Git no fue reescrito. Si alguna credencial histórica fue real, debe revocarse en su proveedor. El backend escucha en loopback para la demo. Sigue siendo un proyecto académico, sin correo de recuperación ni panel de administración productivo.

Ver [SPEC](docs/SPEC.md) y [evidencia](docs/evidence.md).
