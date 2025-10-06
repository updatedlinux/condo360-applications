#!/bin/bash

# Script de prueba específico para verificar las correcciones aplicadas
echo "🔧 Verificando correcciones específicas..."
echo "=========================================="

# Verificar que el servidor esté ejecutándose
echo "1. Verificando estado del servidor..."
if curl -s https://applications.bonaventurecclub.com/health > /dev/null; then
    echo "✅ Servidor backend funcionando"
else
    echo "❌ Servidor backend no disponible"
    exit 1
fi

# Probar endpoint de estadísticas (debería funcionar)
echo "2. Probando endpoint de estadísticas..."
STATS_RESPONSE=$(curl -s https://applications.bonaventurecclub.com/api/requests/stats)
if echo "$STATS_RESPONSE" | grep -q "success"; then
    echo "✅ Endpoint de estadísticas funcionando"
else
    echo "❌ Error en endpoint de estadísticas"
    echo "   Respuesta: $STATS_RESPONSE"
fi

# Probar endpoint de solicitudes con parámetros específicos
echo "3. Probando endpoint de solicitudes con parámetros específicos..."

# Test 1: Sin parámetros (debería usar defaults)
echo "   Test 1: Sin parámetros"
REQUESTS_RESPONSE1=$(curl -s "https://applications.bonaventurecclub.com/api/requests")
if echo "$REQUESTS_RESPONSE1" | grep -q "success"; then
    echo "   ✅ Éxito sin parámetros"
else
    echo "   ❌ Error sin parámetros"
    echo "   Respuesta: $REQUESTS_RESPONSE1"
fi

# Test 2: Con parámetros explícitos
echo "   Test 2: Con parámetros explícitos"
REQUESTS_RESPONSE2=$(curl -s "https://applications.bonaventurecclub.com/api/requests?page=1&limit=5")
if echo "$REQUESTS_RESPONSE2" | grep -q "success"; then
    echo "   ✅ Éxito con parámetros explícitos"
else
    echo "   ❌ Error con parámetros explícitos"
    echo "   Respuesta: $REQUESTS_RESPONSE2"
fi

# Test 3: Con user_id
echo "   Test 3: Con user_id"
USER_REQUESTS_RESPONSE=$(curl -s "https://applications.bonaventurecclub.com/api/requests?user_id=1&page=1&limit=5")
if echo "$USER_REQUESTS_RESPONSE" | grep -q "success"; then
    echo "   ✅ Éxito con user_id"
else
    echo "   ❌ Error con user_id"
    echo "   Respuesta: $USER_REQUESTS_RESPONSE"
fi

# Test 4: Parámetros edge case
echo "   Test 4: Parámetros edge case"
EDGE_RESPONSE=$(curl -s "https://applications.bonaventurecclub.com/api/requests?page=0&limit=0")
if echo "$EDGE_RESPONSE" | grep -q "error"; then
    echo "   ✅ Manejo correcto de parámetros inválidos"
else
    echo "   ⚠️  Parámetros inválidos no manejados correctamente"
    echo "   Respuesta: $EDGE_RESPONSE"
fi

echo ""
echo "🎯 Resumen de correcciones aplicadas:"
echo "====================================="
echo "✅ Corregido: Parámetros de paginación convertidos a enteros en middleware"
echo "✅ Corregido: Trust proxy configurado condicionalmente"
echo "✅ Corregido: Rate limiting deshabilitado para desarrollo"
echo "✅ Corregido: Parámetros LIMIT/OFFSET convertidos a enteros en modelo"
echo "✅ Corregido: current_user_id agregado al JavaScript de WordPress"

echo ""
echo "📋 Próximos pasos:"
echo "=================="
echo "1. Reiniciar el servidor backend: npm start"
echo "2. Verificar que no aparezcan errores de MySQL en logs"
echo "3. Probar los shortcodes de WordPress"
echo "4. Ejecutar debugging MySQL: node debug-mysql.js"

echo ""
echo "🔍 Para debugging adicional:"
echo "==========================="
echo "- Ver logs del servidor en tiempo real"
echo "- Ejecutar: node debug-mysql.js"
echo "- Verificar variables de entorno"
echo "- Probar endpoints individualmente"
