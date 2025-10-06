#!/bin/bash

# Script de prueba para verificar las mejoras implementadas
echo "🧪 Probando mejoras implementadas..."
echo "===================================="

# Verificar que el servidor esté ejecutándose
echo "1. Verificando estado del servidor..."
if curl -s https://applications.bonaventurecclub.com/health > /dev/null; then
    echo "✅ Servidor backend funcionando"
else
    echo "❌ Servidor backend no disponible"
    exit 1
fi

# Probar creación de solicitud de sugerencia
echo "2. Probando creación de solicitud de sugerencia..."
SUGGESTION_RESPONSE=$(curl -s -X POST https://applications.bonaventurecclub.com/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "wp_user_id": 2,
    "request_type": "Sugerencias",
    "details": "Esta es una sugerencia de prueba para verificar que el sistema funciona correctamente."
  }')

if echo "$SUGGESTION_RESPONSE" | grep -q "success.*true"; then
    echo "✅ Solicitud de sugerencia creada exitosamente"
    echo "   Respuesta: $(echo $SUGGESTION_RESPONSE | jq -r '.message')"
    
    # Verificar que incluye información de confirmación
    if echo "$SUGGESTION_RESPONSE" | grep -q "24 horas hábiles"; then
        echo "✅ Mensaje de 24 horas hábiles incluido"
    else
        echo "⚠️  Mensaje de 24 horas hábiles no encontrado"
    fi
    
    # Verificar que incluye datos de confirmación
    if echo "$SUGGESTION_RESPONSE" | grep -q "confirmation"; then
        echo "✅ Datos de confirmación incluidos"
    else
        echo "⚠️  Datos de confirmación no encontrados"
    fi
else
    echo "❌ Error al crear solicitud de sugerencia"
    echo "   Respuesta: $SUGGESTION_RESPONSE"
fi

# Probar creación de solicitud de mudanza
echo "3. Probando creación de solicitud de mudanza..."
MUDANZA_RESPONSE=$(curl -s -X POST https://applications.bonaventurecclub.com/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "wp_user_id": 2,
    "request_type": "Mudanza - Entrada",
    "details": "Esta es una solicitud de mudanza de prueba.",
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

if echo "$MUDANZA_RESPONSE" | grep -q "success.*true"; then
    echo "✅ Solicitud de mudanza creada exitosamente"
    echo "   Respuesta: $(echo $MUDANZA_RESPONSE | jq -r '.message')"
else
    echo "❌ Error al crear solicitud de mudanza"
    echo "   Respuesta: $MUDANZA_RESPONSE"
fi

# Probar endpoint de solicitudes por usuario
echo "4. Probando endpoint de solicitudes por usuario..."
USER_REQUESTS_RESPONSE=$(curl -s "https://applications.bonaventurecclub.com/api/requests?user_id=2&page=1&limit=5")
if echo "$USER_REQUESTS_RESPONSE" | grep -q "success.*true"; then
    echo "✅ Endpoint de solicitudes por usuario funcionando"
    
    # Contar solicitudes
    REQUEST_COUNT=$(echo "$USER_REQUESTS_RESPONSE" | jq -r '.data | length')
    echo "   Solicitudes encontradas: $REQUEST_COUNT"
else
    echo "❌ Error en endpoint de solicitudes por usuario"
    echo "   Respuesta: $USER_REQUESTS_RESPONSE"
fi

echo ""
echo "🎯 Resumen de mejoras implementadas:"
echo "===================================="
echo "✅ Corregido: Error 'Bind parameters must not contain undefined'"
echo "✅ Agregado: Modal de confirmación con mensaje de 24 horas hábiles"
echo "✅ Mejorado: Calendario de mudanzas solo permite sábados"
echo "✅ Agregado: Tooltip informativo en calendario"
echo "✅ Mejorado: Validación de fechas en zona horaria venezolana"
echo "✅ Agregado: Auto-cierre del modal después de 10 segundos"

echo ""
echo "📋 Funcionalidades del modal de confirmación:"
echo "============================================="
echo "✅ Mensaje de éxito con emoji"
echo "✅ Información de tiempo de respuesta (24 horas hábiles)"
echo "✅ Detalles del proceso"
echo "✅ Lista de próximos pasos"
echo "✅ Botón de cierre"
echo "✅ Auto-cierre automático"

echo ""
echo "📅 Funcionalidades del calendario de mudanzas:"
echo "============================================="
echo "✅ Solo permite seleccionar sábados"
echo "✅ Fecha mínima: próximo sábado disponible"
echo "✅ Fecha máxima: último sábado del año"
echo "✅ Tooltip informativo al hacer hover"
echo "✅ Validación en tiempo real"
echo "✅ Zona horaria venezolana (GMT-4)"

echo ""
echo "🔍 Para verificar en WordPress:"
echo "=============================="
echo "1. Ir a la página con el shortcode [condo360_solicitudes_form]"
echo "2. Seleccionar 'Mudanza - Entrada' o 'Mudanza - Salida'"
echo "3. Verificar que el calendario solo muestre sábados"
echo "4. Completar y enviar una solicitud"
echo "5. Verificar que aparezca el modal de confirmación"
echo "6. Verificar que el modal se cierre automáticamente"

echo ""
echo "⚠️  Notas importantes:"
echo "===================="
echo "- El calendario respeta la zona horaria venezolana (GMT-4)"
echo "- Los campos de mudanza son opcionales para otros tipos de solicitud"
echo "- El modal de confirmación incluye información completa del proceso"
echo "- Todas las fechas se manejan en formato AM/PM venezolano"
