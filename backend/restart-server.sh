#!/bin/bash

# Script para reiniciar el servidor backend
echo "🔄 Reiniciando servidor backend..."
echo "================================="

# Verificar si PM2 está ejecutándose
if command -v pm2 &> /dev/null; then
    echo "📋 Usando PM2 para reiniciar..."
    
    # Listar procesos PM2
    echo "Procesos actuales:"
    pm2 list
    
    # Reiniciar el proceso condo360-backend si existe
    if pm2 list | grep -q "condo360-backend"; then
        echo "🔄 Reiniciando proceso condo360-backend..."
        pm2 restart condo360-backend
    else
        echo "⚠️  Proceso condo360-backend no encontrado en PM2"
        echo "🚀 Iniciando nuevo proceso..."
        cd /usr/local/src/condo360-applications/backend
        pm2 start src/app.js --name condo360-backend
    fi
    
    # Mostrar estado
    echo ""
    echo "📊 Estado del proceso:"
    pm2 show condo360-backend
    
else
    echo "⚠️  PM2 no está disponible"
    echo "🔍 Verificando procesos Node.js..."
    
    # Buscar procesos Node.js relacionados
    ps aux | grep "node.*app.js" | grep -v grep
    
    echo ""
    echo "💡 Para reiniciar manualmente:"
    echo "1. Detener el proceso actual: pkill -f 'node.*app.js'"
    echo "2. Navegar al directorio: cd /usr/local/src/condo360-applications/backend"
    echo "3. Iniciar el servidor: npm start"
fi

echo ""
echo "⏳ Esperando 5 segundos para que el servidor se inicie..."
sleep 5

echo ""
echo "🏥 Verificando estado del servidor..."
if curl -s https://applications.bonaventurecclub.com/health > /dev/null; then
    echo "✅ Servidor backend funcionando correctamente"
    
    # Mostrar timestamp para confirmar reinicio
    TIMESTAMP=$(curl -s https://applications.bonaventurecclub.com/health | jq -r '.timestamp')
    echo "🕐 Timestamp del servidor: $TIMESTAMP"
else
    echo "❌ Servidor backend no disponible"
    echo "🔍 Verificando logs..."
    
    if command -v pm2 &> /dev/null; then
        pm2 logs condo360-backend --lines 10
    fi
fi
