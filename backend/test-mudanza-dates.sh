#!/bin/bash

# Script simple para probar fechas de mudanza
echo "🧪 Probando fechas específicas para mudanzas..."
echo "=============================================="

# Verificar que el servidor esté ejecutándose
if curl -s https://applications.bonaventurecclub.com/health > /dev/null; then
    echo "✅ Servidor backend funcionando"
else
    echo "❌ Servidor backend no disponible"
    exit 1
fi

echo ""
echo "📅 Verificando fechas de prueba:"
echo "2025-10-11 = Sábado (debería funcionar)"
echo "2025-10-12 = Domingo (debería fallar)"
echo "2025-10-18 = Sábado (debería funcionar)"
echo ""

# Probar con fecha que SÍ es sábado
echo "1. Probando con fecha sábado (2025-10-11)..."
RESPONSE1=$(curl -s -X POST https://applications.bonaventurecclub.com/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "wp_user_id": 2,
    "request_type": "Mudanza - Entrada",
    "details": "Prueba con fecha sábado.",
    "move_date": "2025-10-11",
    "transporter_name": "Test Transport",
    "transporter_id_card": "V-12345678",
    "vehicle_brand": "Toyota",
    "vehicle_model": "Hilux",
    "vehicle_plate": "ABC-123",
    "vehicle_color": "Blanco",
    "driver_name": "Juan Pérez",
    "driver_id_card": "V-87654321"
  }')

echo "Status Code: $(echo $RESPONSE1 | jq -r '.status // "N/A"')"
echo "Success: $(echo $RESPONSE1 | jq -r '.success // "N/A"')"
echo "Error: $(echo $RESPONSE1 | jq -r '.error // "N/A"')"
echo "Details: $(echo $RESPONSE1 | jq -r '.details // "N/A"')"

if echo "$RESPONSE1" | grep -q "success.*true"; then
    echo "✅ Solicitud con fecha sábado funcionó correctamente"
else
    echo "❌ Error con fecha sábado"
fi

echo ""
echo "2. Probando con fecha domingo (2025-10-12)..."
RESPONSE2=$(curl -s -X POST https://applications.bonaventurecclub.com/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "wp_user_id": 2,
    "request_type": "Mudanza - Entrada",
    "details": "Prueba con fecha domingo.",
    "move_date": "2025-10-12",
    "transporter_name": "Test Transport",
    "transporter_id_card": "V-12345678",
    "vehicle_brand": "Toyota",
    "vehicle_model": "Hilux",
    "vehicle_plate": "ABC-123",
    "vehicle_color": "Blanco",
    "driver_name": "Juan Pérez",
    "driver_id_card": "V-87654321"
  }')

echo "Status Code: $(echo $RESPONSE2 | jq -r '.status // "N/A"')"
echo "Success: $(echo $RESPONSE2 | jq -r '.success // "N/A"')"
echo "Error: $(echo $RESPONSE2 | jq -r '.error // "N/A"')"
echo "Details: $(echo $RESPONSE2 | jq -r '.details // "N/A"')"

if echo "$RESPONSE2" | grep -q "success.*true"; then
    echo "⚠️  Solicitud con fecha domingo fue aceptada (no debería)"
else
    echo "✅ Solicitud con fecha domingo fue rechazada correctamente"
fi

echo ""
echo "3. Probando con fecha sábado diferente (2025-10-18)..."
RESPONSE3=$(curl -s -X POST https://applications.bonaventurecclub.com/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "wp_user_id": 2,
    "request_type": "Mudanza - Salida",
    "details": "Prueba con fecha sábado diferente.",
    "move_date": "2025-10-18",
    "transporter_name": "Test Transport 2",
    "transporter_id_card": "V-87654321",
    "vehicle_brand": "Ford",
    "vehicle_model": "Ranger",
    "vehicle_plate": "XYZ-789",
    "vehicle_color": "Azul",
    "driver_name": "María González",
    "driver_id_card": "V-11223344"
  }')

echo "Status Code: $(echo $RESPONSE3 | jq -r '.status // "N/A"')"
echo "Success: $(echo $RESPONSE3 | jq -r '.success // "N/A"')"
echo "Error: $(echo $RESPONSE3 | jq -r '.error // "N/A"')"
echo "Details: $(echo $RESPONSE3 | jq -r '.details // "N/A"')"

if echo "$RESPONSE3" | grep -q "success.*true"; then
    echo "✅ Solicitud con fecha sábado diferente funcionó correctamente"
else
    echo "❌ Error con fecha sábado diferente"
fi

echo ""
echo "🎯 Resumen:"
echo "==========="
echo "Si todas las fechas sábado fallan con error 400, el problema está en:"
echo "1. Validación de fecha en el backend"
echo "2. Formato de fecha enviado"
echo "3. Configuración de zona horaria"
echo ""
echo "Si las fechas domingo son aceptadas, el problema está en:"
echo "1. Validación de día de la semana"
echo "2. Lógica de validación de sábados"
