# Vocational App - Backend API

Backend API para la aplicación de descubrimiento vocacional desarrollada con Node.js, Express y MySQL.

## 🚀 Características

- **Autenticación JWT** - Sistema seguro de autenticación
- **Base de datos MySQL** - Almacenamiento robusto y escalable
- **API RESTful** - Endpoints bien estructurados
- **Validación de datos** - Validación completa con express-validator
- **Seguridad** - Implementación de mejores prácticas de seguridad
- **Logging** - Sistema de logs personalizado
- **Migraciones** - Scripts automatizados para base de datos

## 📋 Requisitos

- Node.js >= 16.0.0
- MySQL >= 8.0
- npm >= 8.0.0

## 🛠️ Instalación

1. **Clonar el repositorio**
\`\`\`bash
git clone <repository-url>
cd backend
\`\`\`

2. **Instalar dependencias**
\`\`\`bash
npm install
\`\`\`

3. **Configurar variables de entorno**
\`\`\`bash
cp .env.example .env
\`\`\`

Editar `.env` con tus configuraciones:
\`\`\`env
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=vocational_app
DB_PORT=3306

# JWT
JWT_SECRET=tu_clave_secreta_muy_larga_y_compleja
JWT_EXPIRES_IN=24h

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
\`\`\`

4. **Configurar base de datos**
\`\`\`bash
# Ejecutar migraciones
npm run migrate

# O manualmente:
mysql -u root -p < scripts/database-schema.sql
mysql -u root -p < scripts/seed-data.sql
\`\`\`

5. **Iniciar servidor**
\`\`\`bash
# Desarrollo
npm run dev

# Producción
npm start
\`\`\`

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Información del usuario actual
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Cerrar sesión

### Usuarios
- `GET /api/users/:id` - Obtener perfil de usuario
- `PUT /api/users/:id` - Actualizar perfil
- `GET /api/users/:id/history` - Historial de tests
- `DELETE /api/users/:id` - Eliminar usuario

### Test Vocacional
- `GET /api/test/questions` - Obtener preguntas del test
- `POST /api/tests` - Enviar respuestas del test
- `GET /api/tests/:id` - Obtener resultados de un test

### Universidades
- `GET /api/universities` - Listar universidades (con filtros)
- `GET /api/universities/:id` - Detalles de universidad
- `GET /api/universities/countries` - Lista de países
- `POST /api/universities` - Crear universidad (admin)
- `PUT /api/universities/:id` - Actualizar universidad (admin)
- `DELETE /api/universities/:id` - Eliminar universidad (admin)

### Preguntas (Admin)
- `GET /api/questions` - Listar preguntas
- `POST /api/questions` - Crear pregunta
- `PUT /api/questions/:id` - Actualizar pregunta
- `DELETE /api/questions/:id` - Eliminar pregunta
- `GET /api/questions/aptitudes` - Lista de aptitudes

### Administración
- `GET /api/admin/dashboard` - Estadísticas del dashboard
- `GET /api/admin/users` - Gestión de usuarios
- `DELETE /api/admin/users/:id` - Eliminar usuario
- `GET /api/admin/tests` - Estadísticas de tests
- `GET /api/admin/universities/stats` - Estadísticas de universidades
- `GET /api/admin/logs` - Logs del sistema

## 🔒 Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación. Incluye el token en el header:

\`\`\`
Authorization: Bearer <tu_token_jwt>
\`\`\`

## 📊 Base de Datos

### Estructura Principal

- **users** - Información de usuarios
- **aptitudes** - Aptitudes vocacionales
- **questions** - Preguntas del test
- **question_options** - Opciones de respuesta
- **universities** - Información de universidades
- **careers** - Carreras universitarias
- **test_results** - Resultados de tests
- **test_answers** - Respuestas individuales
- **test_aptitudes** - Puntuaciones por aptitud

### Usuarios por Defecto

Después de ejecutar las migraciones:

- **Admin**: admin@vocationalapp.com / admin123
- **Usuario**: juan@test.com / test123

## 🛡️ Seguridad

- Validación de entrada con express-validator
- Sanitización de datos
- Rate limiting
- Helmet para headers de seguridad
- Hashing seguro de contraseñas con bcrypt
- Protección contra inyección SQL
- CORS configurado

## 📝 Logging

Los logs se guardan en la carpeta `logs/` con formato:
\`\`\`
[timestamp] LEVEL: mensaje | metadata
\`\`\`

Niveles disponibles: `info`, `error`, `warn`, `debug`

## 🧪 Testing

\`\`\`bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage
\`\`\`

## 📦 Scripts Disponibles

- `npm start` - Iniciar servidor en producción
- `npm run dev` - Iniciar servidor en desarrollo con nodemon
- `npm run migrate` - Ejecutar migraciones de base de datos
- `npm run seed` - Insertar datos de prueba
- `npm test` - Ejecutar tests

## 🚀 Despliegue

### Variables de Entorno de Producción

\`\`\`env
NODE_ENV=production
PORT=3000
DB_HOST=tu_host_produccion
DB_USER=tu_usuario_produccion
DB_PASSWORD=tu_password_seguro
DB_NAME=vocational_app_prod
JWT_SECRET=clave_super_secreta_para_produccion
\`\`\`

### Docker (Opcional)

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

## 📈 Roadmap

- [ ] Implementar cache con Redis
- [ ] Agregar tests unitarios completos
- [ ] Implementar notificaciones por email
- [ ] Agregar métricas y monitoreo
- [ ] Implementar backup automático de BD
- [ ] Agregar soporte para múltiples idiomas
\`\`\`

Ahora tienes el backend completo con:

## ✅ **Archivos Completados del Backend**

### **Rutas y Controladores**
- `routes/users.js` - Gestión completa de usuarios
- `routes/questions.js` - CRUD de preguntas del test
- `routes/admin.js` - Panel administrativo completo

### **Scripts y Utilidades**
- `scripts/migrate.js` - Migraciones automatizadas
- `scripts/seed.js` - Datos de prueba
- `utils/logger.js` - Sistema de logging
- `utils/validation.js` - Validaciones reutilizables
- `utils/helpers.js` - Funciones auxiliares

### **Configuración**
- `.gitignore` - Archivos a ignorar
- `README.md` - Documentación completa

## 🚀 **Para Ejecutar Todo el Sistema**

\`\`\`bash
# Backend
cd backend
npm install
cp .env.example .env
# Configurar .env con tus datos
npm run migrate
npm run dev

# Frontend
cd frontend
npm install
ng serve
\`\`\`

El sistema completo estará disponible en:
- **Frontend Angular**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **Documentación API**: Incluida en README.md

¿Te gustaría que agregue alguna funcionalidad adicional o que mejore algún aspecto específico del backend?
