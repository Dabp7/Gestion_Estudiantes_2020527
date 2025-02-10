# Administración de Control de Alumnos

## Descripción del Proyecto

Este proyecto es una aplicación de backend desarrollada en Node.js con MongoDB y Express, diseñada para la administración del control de alumnos en un centro educativo. La aplicación permite gestionar alumnos, maestros y cursos de manera eficiente, asegurando una correcta asignación y administración de usuarios.

## Tecnologías Utilizadas
- **Node.js**
- **MongoDB**
- **Express.js**
- **Mongoose** (ODM para MongoDB)
- **Bcrypt** (para encriptación de contraseñas)
- **JSON Web Token (JWT)** (para autenticación)

## Roles en el Sistema
El sistema cuenta con dos roles de usuario definidos:

1. **Alumno (STUDENT_ROLE)**
2. **Maestro (TEACHER_ROLE)**

## Funcionalidades

### Alumno (STUDENT_ROLE)
- Registro y autenticación en el sistema.
- Asignación a un máximo de 3 cursos.
- Restricción para no inscribirse en cursos duplicados.
- Visualización de los cursos asignados.
- Edición y eliminación de su perfil.

### Maestro (TEACHER_ROLE)
- Registro y autenticación en el sistema.
- Creación, edición, eliminación y visualización de cursos propios.
- Actualización de la asignación de los alumnos en caso de modificación de un curso.
- Eliminación de un curso con impacto en los alumnos inscritos.

## Instalación y Uso

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/nombre-del-repositorio.git
   ```
2. Navegar al directorio del proyecto:
   ```bash
   cd nombre-del-repositorio
   ```
3. Instalar dependencias:
   ```bash
   npm install
   ```
4. Configurar las variables de entorno en un archivo `.env`.
5. Iniciar el servidor:
   ```bash
   npm start
   ```


## Licencia
Este proyecto está bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.

