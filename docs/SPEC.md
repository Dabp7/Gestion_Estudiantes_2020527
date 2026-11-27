# Inscripciones y permisos verificables

## Problema

La comprobación del máximo de tres cursos consultaba datos antes de guardar, sin una transacción. Dos inscripciones simultáneas podían superar el máximo o duplicar la pertenencia. Las rutas recibían IDs de maestros/alumnos sin comprobar un JWT y aceptaban cambios arbitrarios.

## Contrato

- Toda escritura usa la identidad del JWT; maestro crea/edita/borra solo sus cursos y alumno solo su perfil/inscripciones.
- Cada inscripción bloquea lógicamente el documento del alumno incrementando `enrollmentVersion` dentro de una transacción. El conteo y la membresía del curso comparten ese snapshot; un conflicto de escritura se reintenta por el driver.
- Máximo tres cursos activos, una pertenencia por curso; duplicado o límite devuelve 409.
- Las inscripciones siguen teniendo una sola fuente de verdad: `Course.students`. Al borrar un curso desaparecen esas inscripciones y se libera capacidad. Al desactivar alumno se retiran todas sus pertenencias en la misma transacción.
- Solo se editan campos permitidos; rol, estado, propietario y hashes quedan protegidos.
- Registro público solo de alumnos; maestros de la demo se crean con el seed controlado.

## Cierre observable

Pruebas con MongoDB replica set real: cuatro solicitudes concurrentes dejan tres cursos; seis duplicadas dejan una pertenencia; maestro ajeno no cambia curso; borrado libera un cupo; borrado de perfil concurrente no deja pertenencias; no se exponen hashes. CI instala desde lockfile y ejecuta los mismos tests.

## Decisión

Se conservó MongoDB y la estructura por dominios. Un contador separado de cursos requeriría migración y sincronización permanente; una escritura transaccional del alumno serializa el conteo actual sin duplicar la fuente de verdad. Esto requiere replica set: el arranque rechaza MongoDB standalone.
