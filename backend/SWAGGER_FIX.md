# Solución de Problemas - Swagger y MySQL2

## ✅ Problemas Corregidos

### 1. Advertencias MySQL2 Eliminadas
**Problema**: Opciones inválidas `acquireTimeout` y `timeout`
**Solución**: Eliminadas completamente de la configuración

### 2. Swagger Sin Endpoints
**Problema**: Swagger se abre pero no muestra endpoints
**Solución**: 
- Configuración completa de schemas
- Archivo de documentación separado
- Rutas de APIs actualizadas

## 🔧 Pasos para Aplicar Correcciones

### 1. Reiniciar el servidor
```bash
# Detener servidor actual (Ctrl+C)
# Luego reiniciar
npm start
```

### 2. Verificar que no hay advertencias MySQL2
Debería ver solo:
```
✅ Conexión a la base de datos establecida correctamente
🚀 Servidor ejecutándose en puerto 7000
📚 Documentación disponible en: http://localhost:7000/api-docs
🏥 Health check disponible en: http://localhost:7000/health
```

### 3. Probar Swagger
1. Abrir: http://localhost:7000/api-docs
2. Debería mostrar:
   - **Solicitudes** (tag)
   - **Sistema** (tag)
   - Endpoints: POST /api/requests, GET /api/requests, etc.

### 4. Probar API con script
```bash
./test-api.sh
```

## 📋 Endpoints Disponibles en Swagger

### Solicitudes
- **POST** `/api/requests` - Crear solicitud
- **GET** `/api/requests` - Listar solicitudes
- **GET** `/api/requests/{id}` - Obtener solicitud
- **PUT** `/api/requests/{id}` - Actualizar solicitud
- **GET** `/api/requests/stats` - Estadísticas

### Sistema
- **GET** `/health` - Estado del servidor
- **GET** `/` - Información de la API

## 🧪 Pruebas Manuales

### 1. Probar Health Check
```bash
curl http://localhost:7000/health
```

### 2. Probar Estadísticas
```bash
curl http://localhost:7000/api/requests/stats
```

### 3. Probar Creación de Solicitud
```bash
curl -X POST http://localhost:7000/api/requests \
  -H 'Content-Type: application/json' \
  -d '{
    "wp_user_id": 1,
    "request_type": "Sugerencias",
    "details": "Sugiero mejorar la iluminación del estacionamiento"
  }'
```

## 🔍 Verificación de Swagger

### Si Swagger sigue sin mostrar endpoints:

1. **Verificar archivos**:
   ```bash
   ls -la src/docs/
   ls -la src/routes/
   ls -la src/controllers/
   ```

2. **Verificar configuración**:
   ```bash
   grep -n "apis:" src/app.js
   ```

3. **Probar endpoint de Swagger JSON**:
   ```bash
   curl http://localhost:7000/api-docs/swagger.json
   ```

### Si hay errores en Swagger JSON:

1. **Verificar sintaxis JSDoc**:
   - Los comentarios deben empezar con `/**`
   - Deben tener `@swagger` en la primera línea
   - Deben estar en archivos incluidos en `apis`

2. **Verificar rutas**:
   - Las rutas deben estar definidas en `src/routes/`
   - Los controladores deben estar en `src/controllers/`

## 🚨 Troubleshooting Avanzado

### Error: "Cannot read property 'paths' of undefined"
- Verificar que `swagger-jsdoc` esté instalado
- Verificar sintaxis de comentarios JSDoc

### Error: "Swagger UI not loading"
- Verificar que `swagger-ui-express` esté instalado
- Verificar que el puerto 7000 esté disponible

### Swagger se carga pero está vacío
- Verificar que los archivos en `apis` existan
- Verificar que tengan comentarios JSDoc válidos
- Verificar permisos de lectura de archivos

## ✅ Resultado Esperado

Después de aplicar las correcciones:

1. **Sin advertencias MySQL2**
2. **Swagger con endpoints visibles**:
   - Solicitudes (POST, GET, PUT)
   - Sistema (Health, Info)
3. **API funcional**:
   - Health check responde
   - Endpoints responden correctamente
   - Documentación completa

## 📞 Próximos Pasos

1. **Reiniciar servidor** con las correcciones
2. **Verificar Swagger** en http://localhost:7000/api-docs
3. **Probar endpoints** con el script de prueba
4. **Configurar base de datos** si no está hecho
5. **Probar creación de solicitudes** reales
