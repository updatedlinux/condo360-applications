# Scripts de Instalación y Configuración

## Instalación Automática del Backend

```bash
#!/bin/bash
# install-backend.sh

echo "🚀 Instalando backend Condominio360 Solicitudes..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Instalando..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Verificar versión de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Se requiere Node.js >= 18. Versión actual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) instalado"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Crear directorio de logs
mkdir -p logs

# Copiar archivo de configuración
if [ ! -f .env ]; then
    echo "📝 Creando archivo de configuración..."
    cp env.example .env
    echo "⚠️  IMPORTANTE: Configure las variables en el archivo .env antes de continuar"
    echo "   - DB_HOST, DB_USER, DB_PASSWORD"
    echo "   - SMTP_HOST, SMTP_USER, SMTP_PASS"
    echo "   - WORDPRESS_URL"
fi

# Instalar PM2 globalmente
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    npm install -g pm2
fi

echo "✅ Backend instalado correctamente"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configure las variables en .env"
echo "2. Ejecute el script SQL: mysql -u root -p wordpress_db < sql/create_tables.sql"
echo "3. Inicie el servidor: npm start"
echo "4. Para producción: pm2 start ecosystem.config.js"
```

## Instalación del Plugin WordPress

```bash
#!/bin/bash
# install-wordpress-plugin.sh

echo "🚀 Instalando plugin WordPress Condominio360 Solicitudes..."

# Verificar que WordPress está instalado
if [ ! -f "/path/to/wordpress/wp-config.php" ]; then
    echo "❌ WordPress no encontrado. Ajuste la ruta en el script."
    exit 1
fi

WP_PATH="/path/to/wordpress"
PLUGIN_PATH="$WP_PATH/wp-content/plugins/condo360-solicitudes"

# Crear directorio del plugin
mkdir -p "$PLUGIN_PATH"

# Copiar archivos del plugin
cp condo360-solicitudes.php "$PLUGIN_PATH/"
cp -r assets "$PLUGIN_PATH/"

# Establecer permisos
chown -R www-data:www-data "$PLUGIN_PATH"
chmod -R 755 "$PLUGIN_PATH"

echo "✅ Plugin instalado en $PLUGIN_PATH"
echo ""
echo "📋 Próximos pasos:"
echo "1. Active el plugin desde WordPress Admin > Plugins"
echo "2. Agregue los shortcodes a las páginas correspondientes"
echo "3. Configure los permisos de usuario"
```

## Script de Configuración de Base de Datos

```sql
-- setup-database.sql
-- Script para configurar la base de datos

-- Crear usuario específico para la aplicación (opcional)
CREATE USER IF NOT EXISTS 'condo360_user'@'localhost' IDENTIFIED BY 'condo360_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON wordpress_db.condo360solicitudes_* TO 'condo360_user'@'localhost';
GRANT SELECT ON wordpress_db.wp_users TO 'condo360_user'@'localhost';
FLUSH PRIVILEGES;

-- Verificar tablas creadas
SELECT 
    TABLE_NAME as 'Tabla',
    TABLE_ROWS as 'Filas',
    ROUND(DATA_LENGTH/1024/1024, 2) as 'Tamaño (MB)',
    CREATE_TIME as 'Creada'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME LIKE 'condo360solicitudes_%'
ORDER BY TABLE_NAME;

-- Verificar configuración
SELECT * FROM condo360solicitudes_config;
```

## Script de Verificación del Sistema

```bash
#!/bin/bash
# verify-system.sh

echo "🔍 Verificando sistema Condominio360 Solicitudes..."

# Verificar Node.js
echo "📋 Node.js:"
node -v
npm -v

# Verificar MySQL
echo "📋 MySQL:"
mysql --version

# Verificar conectividad de base de datos
echo "📋 Conectividad DB:"
mysql -h localhost -u root -p -e "SELECT 'Conexión exitosa' as status;" 2>/dev/null || echo "❌ Error de conexión"

# Verificar API
echo "📋 API Backend:"
curl -s http://localhost:7000/health | jq . 2>/dev/null || echo "❌ API no disponible"

# Verificar plugin WordPress
echo "📋 Plugin WordPress:"
if [ -f "/path/to/wordpress/wp-content/plugins/condo360-solicitudes/condo360-solicitudes.php" ]; then
    echo "✅ Plugin instalado"
else
    echo "❌ Plugin no encontrado"
fi

# Verificar logs
echo "📋 Logs:"
if [ -f "logs/combined.log" ]; then
    echo "✅ Archivo de logs existe"
    echo "Últimas 5 líneas:"
    tail -5 logs/combined.log
else
    echo "❌ Archivo de logs no encontrado"
fi

echo "✅ Verificación completada"
```

## Script de Backup

```bash
#!/bin/bash
# backup-system.sh

BACKUP_DIR="/backups/condo360"
DATE=$(date +%Y%m%d_%H%M%S)

echo "💾 Creando backup del sistema..."

# Crear directorio de backup
mkdir -p "$BACKUP_DIR"

# Backup de base de datos
echo "📦 Respaldando base de datos..."
mysqldump -u root -p wordpress_db \
  condo360solicitudes_requests \
  condo360solicitudes_config \
  condo360solicitudes_logs > "$BACKUP_DIR/database_$DATE.sql"

# Backup de código
echo "📦 Respaldando código..."
tar -czf "$BACKUP_DIR/code_$DATE.tar.gz" \
  --exclude=node_modules \
  --exclude=logs \
  .

# Backup de configuración
echo "📦 Respaldando configuración..."
cp .env "$BACKUP_DIR/env_$DATE.backup"

# Limpiar backups antiguos (mantener 30 días)
find "$BACKUP_DIR" -name "*.sql" -mtime +30 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete
find "$BACKUP_DIR" -name "*.backup" -mtime +30 -delete

echo "✅ Backup completado en $BACKUP_DIR"
```

## Script de Monitoreo

```bash
#!/bin/bash
# monitor-system.sh

echo "📊 Monitoreo del sistema Condominio360 Solicitudes"
echo "=================================================="

# Estado de PM2
echo "🔄 Procesos PM2:"
pm2 list

# Uso de memoria
echo "💾 Uso de memoria:"
free -h

# Uso de disco
echo "💽 Uso de disco:"
df -h

# Estado de MySQL
echo "🗄️ Estado MySQL:"
systemctl status mysql --no-pager -l

# Logs de errores recientes
echo "📋 Errores recientes:"
if [ -f "logs/err.log" ]; then
    tail -10 logs/err.log
else
    echo "No hay archivo de errores"
fi

# Estadísticas de la API
echo "📈 Estadísticas API:"
curl -s http://localhost:7000/api/requests/stats | jq . 2>/dev/null || echo "API no disponible"

# Conexiones activas MySQL
echo "🔗 Conexiones MySQL activas:"
mysql -u root -p -e "SHOW PROCESSLIST;" 2>/dev/null | wc -l

echo "✅ Monitoreo completado"
```

## Script de Actualización

```bash
#!/bin/bash
# update-system.sh

echo "🔄 Actualizando sistema Condominio360 Solicitudes..."

# Backup antes de actualizar
echo "💾 Creando backup..."
./backup-system.sh

# Detener aplicación
echo "⏹️ Deteniendo aplicación..."
pm2 stop condo360-solicitudes

# Actualizar dependencias
echo "📦 Actualizando dependencias..."
npm update

# Verificar vulnerabilidades
echo "🔒 Verificando vulnerabilidades..."
npm audit

# Aplicar correcciones automáticas
echo "🔧 Aplicando correcciones..."
npm audit fix

# Reiniciar aplicación
echo "🔄 Reiniciando aplicación..."
pm2 start condo360-solicitudes

# Verificar estado
echo "✅ Verificando estado..."
sleep 5
pm2 status condo360-solicitudes

echo "✅ Actualización completada"
```

## Uso de los Scripts

```bash
# Hacer ejecutables
chmod +x *.sh

# Instalar backend
./install-backend.sh

# Instalar plugin WordPress
./install-wordpress-plugin.sh

# Configurar base de datos
mysql -u root -p wordpress_db < setup-database.sql

# Verificar sistema
./verify-system.sh

# Crear backup
./backup-system.sh

# Monitorear sistema
./monitor-system.sh

# Actualizar sistema
./update-system.sh
```
