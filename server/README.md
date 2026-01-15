# Backend SPJT - Sistema de Procesos Judiciales y Tramitación

## 🚀 Descripción

Backend completo para el Sistema de Procesos Judiciales y Tramitación (SPJT), desarrollado con Node.js, Express y MySQL. Incluye autenticación JWT, autorización RBAC, auditoría completa y gestión de expedientes judiciales.

## 🏗️ Arquitectura

- **Framework**: Express.js
- **Base de datos**: MySQL con Knex.js (ORM)
- **Autenticación**: JWT (Access + Refresh tokens)
- **Autorización**: RBAC (Role-Based Access Control)
- **Validación**: Joi
- **Logging**: Winston
- **Seguridad**: Helmet, CORS, Rate Limiting
- **Hashing**: Argon2 para contraseñas

## 📋 Prerrequisitos

- Node.js 18+ 
- MySQL 8.0+
- npm o yarn

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd server
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp env.example .env
```

Editar `.env` con tus configuraciones:
```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=spjt_user
DB_PASSWORD=tu_password
DB_NAME=spjt_db

# JWT
JWT_ACCESS_SECRET=tu_secret_muy_seguro
JWT_REFRESH_SECRET=tu_refresh_secret_muy_seguro

# Servidor
PORT=3001
NODE_ENV=development
```

### 4. Crear base de datos
```sql
CREATE DATABASE spjt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'spjt_user'@'localhost' IDENTIFIED BY 'tu_password';
GRANT ALL PRIVILEGES ON spjt_db.* TO 'spjt_user'@'localhost';
FLUSH PRIVILEGES;
```

### 5. Ejecutar migraciones
```bash
npm run db:migrate
```

### 6. Poblar con datos de prueba
```bash
npm run db:seed
```

## 🚀 Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

## 🌐 Puertos

- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:3002 (cuando se implemente)
- **Health Check**: http://localhost:3001/health

## 📚 API Endpoints

### Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/refresh` - Renovar token
- `POST /api/v1/auth/logout` - Cerrar sesión
- `GET /api/v1/auth/me` - Perfil del usuario

### Expedientes
- `GET /api/v1/expedientes` - Listar expedientes
- `POST /api/v1/expedientes` - Crear expediente
- `GET /api/v1/expedientes/:id` - Obtener expediente
- `PATCH /api/v1/expedientes/:id` - Actualizar expediente

### Documentos
- `POST /api/v1/expedientes/:id/documentos` - Subir documento
- `GET /api/v1/documentos/:id` - Obtener documento
- `GET /api/v1/documentos/:id/download` - Descargar documento

## 🔐 Roles y Permisos

- **admin**: Acceso completo al sistema
- **juez**: Gestión de expedientes y documentos
- **secretario**: Gestión de expedientes y actuaciones
- **operador**: Consulta y carga básica

## 🧪 Testing

```bash
npm test
```

## 📊 Estructura de Base de Datos

### Tablas principales:
- `users` - Usuarios del sistema
- `roles` - Roles y permisos
- `expedientes` - Expedientes judiciales
- `actuaciones` - Actuaciones de los expedientes
- `documentos` - Documentos adjuntos
- `firmas` - Firmas electrónicas
- `auditorias` - Log de auditoría

## 🔒 Seguridad

- **HTTPS** en producción
- **Rate Limiting** (100 requests/15min por IP)
- **CORS** configurado para puerto 3002
- **Helmet** para headers de seguridad
- **Validación** de entrada con Joi
- **Hashing** seguro con Argon2
- **JWT** con rotación de tokens

## 📝 Logs

Los logs se guardan en:
- `logs/error.log` - Errores
- `logs/combined.log` - Todos los logs

## 🚀 Despliegue

### Docker (recomendado)
```bash
docker build -t spjt-backend .
docker run -p 3001:3001 spjt-backend
```

### PM2
```bash
npm install -g pm2
pm2 start src/app.js --name "spjt-backend"
pm2 startup
pm2 save
```

## 📞 Soporte

Para dudas o problemas:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo

## 📄 Licencia

MIT License - ver archivo LICENSE para más detalles.

---

**Desarrollado por**: Juan Esteban Medina  
**Proyecto**: TFG - Sistema de Procesos Judiciales y Tramitación 