<?php
/**
 * Script de diagnóstico para Condominio360 Solicitudes
 * 
 * Ejecutar desde línea de comandos:
 * php wp-content/plugins/condo360-solicitudes/diagnostic.php
 */

// Configurar WordPress
require_once('../../../wp-config.php');

echo "🔍 Diagnóstico de Condominio360 Solicitudes\n";
echo "==========================================\n\n";

// Verificar constantes del plugin
echo "📋 Verificando constantes del plugin:\n";
if (defined('CONDO360_SOLICITUDES_API_URL')) {
    echo "✅ CONDO360_SOLICITUDES_API_URL: " . CONDO360_SOLICITUDES_API_URL . "\n";
} else {
    echo "❌ CONDO360_SOLICITUDES_API_URL no definida\n";
}

if (defined('CONDO360_SOLICITUDES_CONFIG')) {
    echo "✅ CONDO360_SOLICITUDES_CONFIG definida\n";
    if (isset(CONDO360_SOLICITUDES_CONFIG['api_url'])) {
        echo "✅ api_url configurada: " . CONDO360_SOLICITUDES_CONFIG['api_url'] . "\n";
    } else {
        echo "❌ api_url no configurada\n";
    }
} else {
    echo "❌ CONDO360_SOLICITUDES_CONFIG no definida\n";
}

echo "\n";

// Verificar archivos del plugin
echo "📁 Verificando archivos del plugin:\n";
$plugin_path = WP_PLUGIN_DIR . '/condo360-solicitudes/';
$files = [
    'condo360-solicitudes.php',
    'config.php',
    'assets/css/style.css',
    'assets/js/script.js'
];

foreach ($files as $file) {
    if (file_exists($plugin_path . $file)) {
        echo "✅ $file\n";
    } else {
        echo "❌ $file - Archivo faltante\n";
    }
}

echo "\n";

// Verificar conectividad con la API
echo "🌐 Verificando conectividad con la API:\n";
$api_url = defined('CONDO360_SOLICITUDES_API_URL') ? CONDO360_SOLICITUDES_API_URL : 'https://applications.bonaventurecclub.com/api';
$health_url = str_replace('/api', '', $api_url) . '/health';

echo "URL de API: $api_url\n";
echo "Health check: $health_url\n";

$response = wp_remote_get($health_url, array(
    'timeout' => 10,
    'sslverify' => true
));

if (is_wp_error($response)) {
    echo "❌ Error de conexión: " . $response->get_error_message() . "\n";
} else {
    $code = wp_remote_retrieve_response_code($response);
    $body = wp_remote_retrieve_body($response);
    
    echo "✅ Código de respuesta: $code\n";
    
    if ($code === 200) {
        $data = json_decode($body, true);
        if ($data && isset($data['status']) && $data['status'] === 'OK') {
            echo "✅ API funcionando correctamente\n";
            echo "   Status: " . $data['status'] . "\n";
            echo "   Timestamp: " . $data['timestamp'] . "\n";
            echo "   Environment: " . $data['environment'] . "\n";
        } else {
            echo "❌ Respuesta de API inválida\n";
            echo "   Body: $body\n";
        }
    } else {
        echo "❌ Código de respuesta inesperado: $code\n";
        echo "   Body: $body\n";
    }
}

echo "\n";

// Verificar configuración de WordPress
echo "⚙️ Verificando configuración de WordPress:\n";
echo "WP_DEBUG: " . (WP_DEBUG ? 'true' : 'false') . "\n";
echo "WP_DEBUG_LOG: " . (WP_DEBUG_LOG ? 'true' : 'false') . "\n";
echo "WP_DEBUG_DISPLAY: " . (WP_DEBUG_DISPLAY ? 'true' : 'false') . "\n";

echo "\n";

// Verificar permisos de usuario
echo "👤 Verificando permisos de usuario:\n";
if (is_user_logged_in()) {
    $user = wp_get_current_user();
    echo "Usuario actual: " . $user->display_name . " (ID: " . $user->ID . ")\n";
    echo "Capacidades:\n";
    echo "  - read: " . (current_user_can('read') ? '✅' : '❌') . "\n";
    echo "  - manage_options: " . (current_user_can('manage_options') ? '✅' : '❌') . "\n";
} else {
    echo "❌ No hay usuario logueado\n";
}

echo "\n";

// Verificar plugins activos
echo "🔌 Verificando plugins activos:\n";
$active_plugins = get_option('active_plugins');
if (in_array('condo360-solicitudes/condo360-solicitudes.php', $active_plugins)) {
    echo "✅ Plugin Condominio360 Solicitudes activo\n";
} else {
    echo "❌ Plugin Condominio360 Solicitudes no activo\n";
}

echo "\n";

// Verificar base de datos
echo "🗄️ Verificando base de datos:\n";
global $wpdb;

$table_name = $wpdb->prefix . 'condo360solicitudes_requests';
$table_exists = $wpdb->get_var("SHOW TABLES LIKE '$table_name'") === $table_name;

if ($table_exists) {
    echo "✅ Tabla $table_name existe\n";
    
    $count = $wpdb->get_var("SELECT COUNT(*) FROM $table_name");
    echo "   Registros: $count\n";
} else {
    echo "❌ Tabla $table_name no existe\n";
    echo "   Ejecutar: mysql -u root -p wordpress_db < sql/create_tables.sql\n";
}

echo "\n";

// Verificar logs de errores
echo "📝 Verificando logs de errores:\n";
$log_file = WP_CONTENT_DIR . '/debug.log';
if (file_exists($log_file)) {
    $log_size = filesize($log_file);
    echo "✅ Log de errores existe (tamaño: " . number_format($log_size) . " bytes)\n";
    
    if ($log_size > 0) {
        echo "   Últimas 5 líneas del log:\n";
        $lines = file($log_file);
        $last_lines = array_slice($lines, -5);
        foreach ($last_lines as $line) {
            echo "   " . trim($line) . "\n";
        }
    }
} else {
    echo "ℹ️ No hay log de errores\n";
}

echo "\n";
echo "🎯 Diagnóstico completado\n";
echo "\n";
echo "📋 Próximos pasos si hay problemas:\n";
echo "1. Verificar que el servidor backend esté ejecutándose\n";
echo "2. Comprobar configuración en config.php\n";
echo "3. Verificar conectividad de red y SSL\n";
echo "4. Revisar logs del servidor\n";
echo "5. Activar el plugin desde WordPress Admin\n";
echo "\n";
