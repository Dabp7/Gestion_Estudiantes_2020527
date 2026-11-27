# Verificación · 2026-11-27

Entorno: Windows, Node 22.15.0, npm 10.9.2 y binario MongoDB 8.0 local. mongodb-memory-server inicia un proceso MongoDB real de replica set aislado; no se usa la base de la demo ni datos existentes.

- `npm run verify`: pasó sintaxis de src/configs/scripts y **9/9 pruebas**, cero omitidas.
- Cuatro POST concurrentes: tres inscripciones y un 409; seis POST duplicados: una pertenencia y cinco 409.
- Edición/borrado de curso ajeno, ID de maestro falsificado, perfil ajeno y escalamiento de rol: rechazados.
- Borrado de curso inscrito libera un cupo. Borrado de perfil concurrente no deja pertenencias y revoca acceso.
- Respuestas sin hashes; login verifica Argon2; registro no crea maestros.
- Seed ejecutado dos veces contra una base temporal de nombre `_demo`: ambas ejecuciones pasaron.
- `npm audit --audit-level=high`: **0 vulnerabilidades**.

Comando local: `MONGOMS_SYSTEM_BINARY` apuntó al MongoDB 8.0 instalado y `MONGOMS_SYSTEM_BINARY_VERSION_CHECK=false`. CI descarga su propio binario. Docker Compose no se ejecutó localmente porque Docker no está instalado; la suite sí comprobó las transacciones en un replica set real.

La URI y colección Postman anteriores se retiraron del árbol versionado. No se reescribió el historial. `.env.example` y el `.env` local de trabajo contienen solo configuración sintética de loopback.
