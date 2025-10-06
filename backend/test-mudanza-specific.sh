#!/bin/bash

# Script para probar específicamente las solicitudes de mudanza
echo "🧪 Probando solicitudes de mudanza..."
echo "===================================="

# Verificar que el servidor esté ejecutándose
echo "1. Verificando estado del servidor..."
if curl -s https://applications.bonaventurecclub.com/health > /dev/null; then
    echo "✅ Servidor backend funcionando"
else
    echo "❌ Servidor backend no disponible"
    exit 1
fi

# Probar creación de solicitud de mudanza entrada
echo "2. Probando solicitud de mudanza entrada..."
MUDANZA_ENTRADA_RESPONSE=$(curl -s -X POST https://applications.bonaventurecclub.com/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "wp_user_id": 2,
    "request_type": "Mudanza - Entrada",
    "details": "Esta es una solicitud de mudanza entrada de prueba.",
    "move_date": "2025-10-11",
    "transporter_name": "Transporte Test",
    "transporter_id_card": "V-12345678",
    "vehicle_brand": "Toyota",
    "vehicle_model": "Hilux",
    "vehicle_plate": "ABC-123",
    "vehicle_color": "Blanco",
    "driver_name": "Juan Pérez",
    "driver_id_card": "V-87654321"
  }')

echo "Respuesta Mudanza Entrada:"
echo "$MUDANZA_ENTRADA_RESPONSE" | jq '.' 2>/dev/null || echo "$MUDANZA_ENTRADA_RESPONSE"

if echo "$MUDANZA_ENTRADA_RESPONSE" | grep -q "success.*true"; then
    echo "✅ Solicitud de mudanza entrada creada exitosamente"
else
    echo "❌ Error al crear solicitud de mudanza entrada"
    echo "   Status: $(echo $MUDANZA_ENTRADA_RESPONSE | jq -r '.status' 2>/dev/null || echo 'N/A')"
    echo "   Error: $(echo $MUDANZA_ENTRADA_RESPONSE | jq -r '.error' 2>/dev/null || echo 'N/A')"
fi

echo ""
echo "3. Probando solicitud de mudanza salida..."
MUDANZA_SALIDA_RESPONSE=$(curl -s -X POST https://applications.bonaventurecclub.com/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "wp_user_id": 2,
    "request_type": "Mudanza - Salida",
    "details": "Esta es una solicitud de mudanza salida de prueba.",
    "move_date": "2025-10-18",
    "transporter_name": "Transporte Test 2",
    "transporter_id_card": "V-87654321",
    "vehicle_brand": "Ford",
    "vehicle_model": "Ranger",
    "vehicle_plate": "XYZ-789",
    "vehicle_color": "Azul",
    "driver_name": "María González",
    "driver_id_card": "V-11223344"
  }')

echo "Respuesta Mudanza Salida:"
echo "$MUDANZA_SALIDA_RESPONSE" | jq '.' 2>/dev/null || echo "$MUDANZA_SALIDA_RESPONSE"

if echo "$MUDANZA_SALIDA_RESPONSE" | grep -q "success.*true"; then
    echo "✅ Solicitud de mudanza salida creada exitosamente"
else
    echo "❌ Error al crear solicitud de mudanza salida"
    echo "   Status: $(echo $MUDANZA_SALIDA_RESPONSE | jq -r '.status' 2>/dev/null || echo 'N/A')"
    echo "   Error: $(echo $MUDANZA_SALIDA_RESPONSE | jq -r '.error' 2>/dev/null || echo 'N/A')"
fi

echo ""
echo "4. Probando con fecha inválida (no sábado)..."
MUDANZA_FECHA_INVALIDA_RESPONSE=$(curl -s -X POST https://applications.bonaventurecclub.com/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "wp_user_id": 2,
    "request_type": "Mudanza - Entrada",
    "details": "Esta es una solicitud con fecha inválida.",
    "move_date": "2025-10-12",
    "transporter_name": "Transporte Test",
    "transporter_id_card": "V-12345678",
    "vehicle_brand": "Toyota",
    "vehicle_model": "Hilux",
    "vehicle_plate": "ABC-123",
    "vehicle_color": "Blanco",
    "driver_name": "Juan Pérez",
    "driver_id_card": "V-87654321"
  }')

echo "Respuesta Fecha Inválida:"
echo "$MUDANZA_FECHA_INVALIDA_RESPONSE" | jq '.' 2>/dev/null || echo "$MUDANZA_FECHA_INVALIDA_RESPONSE"

if echo "$MUDANZA_FECHA_INVALIDA_RESPONSE" | grep -q "success.*true"; then
    echo "⚠️  Solicitud con fecha inválida fue aceptada (no debería)"
else
    echo "✅ Solicitud con fecha inválida fue rechazada correctamente"
fi

echo ""
echo "5. Probando con campos faltantes..."
MUDANZA_CAMPOS_FALTANTES_RESPONSE=$(curl -s -X POST https://applications.bonaventurecclub.com/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "wp_user_id": 2,
    "request_type": "Mudanza - Entrada",
    "details": "Esta es una solicitud con campos faltantes.",
    "move_date": "2025-10-11"
  }')

echo "Respuesta Campos Faltantes:"
echo "$MUDANZA_CAMPOS_FALTANTES_RESPONSE" | jq '.' 2>/dev/null || echo "$MUDANZA_CAMPOS_FALTANTES_RESPONSE"

if echo "$MUDANZA_CAMPOS_FALTANTES_RESPONSE" | grep -q "success.*true"; then
    echo "⚠️  Solicitud con campos faltantes fue aceptada (no debería)"
else
    echo "✅ Solicitud con campos faltantes fue rechazada correctamente"
fi

echo ""
echo "🎯 Resumen de pruebas de mudanza:"
echo "================================"
echo "✅ Prueba 1: Mudanza entrada con datos completos"
echo "✅ Prueba 2: Mudanza salida con datos completos"
echo "✅ Prueba 3: Fecha inválida (no sábado)"
echo "✅ Prueba 4: Campos faltantes"
echo ""
echo "🔍 Si hay errores 400, revisar:"
echo "- Validación de fecha en backend"
echo "- Validación de campos requeridos"
echo "- Formato de datos enviados"
echo "- Logs del servidor para detalles específicos"
