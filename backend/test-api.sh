#!/bin/bash

# Script para probar la API de Condominio360 Solicitudes

echo "🧪 Probando API de Condominio360 Solicitudes..."
echo ""

# Verificar que el servidor esté ejecutándose
echo "🔍 Verificando que el servidor esté ejecutándose..."
if ! curl -s http://localhost:7000/health > /dev/null; then
    echo "❌ El servidor no está ejecutándose en puerto 7000"
    echo "   Ejecute: npm start"
    exit 1
fi

echo "✅ Servidor ejecutándose correctamente"
echo ""

# Probar endpoint de salud
echo "🏥 Probando endpoint de salud..."
curl -s http://localhost:7000/health | jq . 2>/dev/null || curl -s http://localhost:7000/health
echo ""
echo ""

# Probar endpoint raíz
echo "🏠 Probando endpoint raíz..."
curl -s http://localhost:7000/ | jq . 2>/dev/null || curl -s http://localhost:7000/
echo ""
echo ""

# Probar endpoint de estadísticas
echo "📊 Probando endpoint de estadísticas..."
curl -s http://localhost:7000/api/requests/stats | jq . 2>/dev/null || curl -s http://localhost:7000/api/requests/stats
echo ""
echo ""

# Probar endpoint de solicitudes (GET)
echo "📋 Probando endpoint de solicitudes (GET)..."
curl -s http://localhost:7000/api/requests | jq . 2>/dev/null || curl -s http://localhost:7000/api/requests
echo ""
echo ""

# Verificar Swagger
echo "📚 Verificando documentación Swagger..."
if curl -s http://localhost:7000/api-docs > /dev/null; then
    echo "✅ Swagger disponible en: http://localhost:7000/api-docs"
else
    echo "❌ Swagger no disponible"
fi

echo ""
echo "🎯 URLs importantes:"
echo "   - API Health: http://localhost:7000/health"
echo "   - API Root: http://localhost:7000/"
echo "   - Swagger Docs: http://localhost:7000/api-docs"
echo "   - Stats: http://localhost:7000/api/requests/stats"
echo "   - Requests: http://localhost:7000/api/requests"
echo ""

# Probar creación de solicitud (ejemplo)
echo "📝 Ejemplo de creación de solicitud:"
echo "curl -X POST http://localhost:7000/api/requests \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"wp_user_id\": 1,"
echo "    \"request_type\": \"Sugerencias\","
echo "    \"details\": \"Sugiero mejorar la iluminación del estacionamiento\""
echo "  }'"
echo ""

echo "✅ Pruebas completadas"
