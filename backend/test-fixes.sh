#!/bin/bash

# Script de prueba para verificar que el backend funciona correctamente
# Después de las correcciones aplicadas

echo "🔧 Verificando correcciones del backend..."
echo "=========================================="

# Verificar que el servidor esté ejecutándose
echo "1. Verificando estado del servidor..."
if curl -s https://applications.bonaventurecclub.com/health > /dev/null; then
    echo "✅ Servidor backend funcionando"
else
    echo "❌ Servidor backend no disponible"
    exit 1
fi

# Probar endpoint de estadísticas
echo "2. Probando endpoint de estadísticas..."
STATS_RESPONSE=$(curl -s https://applications.bonaventurecclub.com/api/requests/stats)
if echo "$STATS_RESPONSE" | grep -q "success"; then
    echo "✅ Endpoint de estadísticas funcionando"
    echo "   Respuesta: $STATS_RESPONSE"
else
    echo "❌ Error en endpoint de estadísticas"
    echo "   Respuesta: $STATS_RESPONSE"
fi

# Probar endpoint de solicitudes (sin user_id)
echo "3. Probando endpoint de solicitudes (admin)..."
REQUESTS_RESPONSE=$(curl -s "https://applications.bonaventurecclub.com/api/requests?page=1&limit=5")
if echo "$REQUESTS_RESPONSE" | grep -q "success"; then
    echo "✅ Endpoint de solicitudes funcionando"
    echo "   Respuesta: $REQUESTS_RESPONSE"
else
    echo "❌ Error en endpoint de solicitudes"
    echo "   Respuesta: $REQUESTS_RESPONSE"
fi

# Probar endpoint de solicitudes con user_id válido
echo "4. Probando endpoint de solicitudes con user_id..."
USER_REQUESTS_RESPONSE=$(curl -s "https://applications.bonaventurecclub.com/api/requests?user_id=1&page=1&limit=5")
if echo "$USER_REQUESTS_RESPONSE" | grep -q "success"; then
    echo "✅ Endpoint de solicitudes por usuario funcionando"
    echo "   Respuesta: $USER_REQUESTS_RESPONSE"
else
    echo "❌ Error en endpoint de solicitudes por usuario"
    echo "   Respuesta: $USER_REQUESTS_RESPONSE"
fi

echo ""
echo "🎯 Resumen de correcciones aplicadas:"
echo "====================================="
echo "✅ Corregido: Parámetros LIMIT y OFFSET en MySQL (convertidos a enteros)"
echo "✅ Corregido: Trust proxy configurado para manejar X-Forwarded-For"
echo "✅ Corregido: current_user_id agregado al JavaScript de WordPress"
echo "✅ Corregido: URL de Swagger apunta a producción"
echo "✅ Corregido: Configuración de WordPress carga correctamente"

echo ""
echo "📋 Próximos pasos:"
echo "=================="
echo "1. Reiniciar el servidor backend: npm start"
echo "2. Actualizar el plugin WordPress en el servidor"
echo "3. Verificar que los shortcodes funcionen correctamente"
echo "4. Probar creación de solicitudes desde WordPress"

echo ""
echo "🔍 Para debugging adicional:"
echo "==========================="
echo "- Ver logs del servidor: tail -f /var/log/condo360-backend.log"
echo "- Ver logs de WordPress: tail -f /var/log/wordpress/error.log"
echo "- Probar Swagger: https://applications.bonaventurecclub.com/api-docs"
