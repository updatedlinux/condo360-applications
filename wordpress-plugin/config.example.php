<?php
/**
 * Archivo de configuración del plugin Condominio360 Solicitudes
 * 
 * Este archivo contiene configuraciones adicionales y personalizaciones
 * para el plugin. Copie este archivo y renómbrelo a 'config.php'
 * en el directorio del plugin para activar las configuraciones.
 */

// Prevenir acceso directo
if (!defined('ABSPATH')) {
    exit;
}

// Configuraciones del plugin
define('CONDO360_SOLICITUDES_CONFIG', array(
    
    // URL de la API del backend
    'api_url' => 'http://localhost:7000/api',
    
    // Configuración de correos
    'email_settings' => array(
        'from_name' => 'Condominio360 - Solicitudes',
        'from_email' => 'noreply@bonaventurecclub.com',
        'logo_url' => 'https://bonaventurecclub.com/wp-content/uploads/2025/09/2-e1759267603471.png',
        'primary_color' => '#2563eb',
        'secondary_color' => '#64748b',
        'smtp_secure' => true,
        'smtp_tls_reject_unauthorized' => true
    ),
    
    // Configuración de formularios
    'form_settings' => array(
        'max_details_length' => 2000,
        'min_details_length' => 10,
        'enable_file_uploads' => false,
        'max_file_size' => '5MB',
        'allowed_file_types' => array('pdf', 'jpg', 'png', 'doc', 'docx')
    ),
    
    // Configuración de paginación
    'pagination' => array(
        'requests_per_page' => 20,
        'admin_requests_per_page' => 20,
        'show_pagination_numbers' => true
    ),
    
    // Configuración de validaciones
    'validation' => array(
        'require_move_date_validation' => true,
        'only_saturdays_for_moves' => true,
        'require_future_dates' => true,
        'validate_id_cards' => true
    ),
    
    // Configuración de permisos
    'permissions' => array(
        'create_request_capability' => 'read',
        'view_admin_panel_capability' => 'manage_options',
        'respond_requests_capability' => 'manage_options',
        'view_all_requests_capability' => 'manage_options'
    ),
    
    // Configuración de notificaciones
    'notifications' => array(
        'send_confirmation_email' => true,
        'send_response_notification' => true,
        'notify_admins_on_new_request' => false,
        'admin_notification_email' => 'admin@bonaventurecclub.com'
    ),
    
    // Configuración de estilos
    'styling' => array(
        'theme_compatibility' => 'astra',
        'custom_css' => '',
        'primary_color' => '#2563eb',
        'secondary_color' => '#64748b',
        'success_color' => '#10b981',
        'warning_color' => '#f59e0b',
        'error_color' => '#ef4444'
    ),
    
    // Configuración de cache
    'cache' => array(
        'enable_cache' => true,
        'cache_duration' => 300, // 5 minutos
        'cache_stats' => true,
        'cache_requests_list' => true
    ),
    
    // Configuración de logs
    'logging' => array(
        'enable_logging' => true,
        'log_level' => 'info', // debug, info, warn, error
        'log_file' => 'condo360-solicitudes.log',
        'max_log_size' => '10MB',
        'keep_logs_days' => 30
    ),
    
    // Configuración de seguridad
    'security' => array(
        'rate_limit_requests' => 10, // requests por minuto
        'rate_limit_window' => 60, // segundos
        'block_suspicious_ips' => true,
        'require_nonce_verification' => true,
        'sanitize_all_inputs' => true
    ),
    
    // Configuración de integración
    'integration' => array(
        'enable_webhooks' => false,
        'webhook_url' => '',
        'webhook_secret' => '',
        'sync_with_crm' => false,
        'crm_api_url' => '',
        'crm_api_key' => ''
    )
));

// Configuraciones específicas por tipo de solicitud
define('CONDO360_REQUEST_TYPES_CONFIG', array(
    'Mudanza - Entrada' => array(
        'requires_approval' => true,
        'valid_statuses' => array('Recibida', 'Aprobado', 'Rechazado'),
        'auto_approve' => false,
        'notification_template' => 'mudanza_entrada'
    ),
    'Mudanza - Salida' => array(
        'requires_approval' => true,
        'valid_statuses' => array('Recibida', 'Aprobado', 'Rechazado'),
        'auto_approve' => false,
        'notification_template' => 'mudanza_salida'
    ),
    'Sugerencias' => array(
        'requires_approval' => false,
        'valid_statuses' => array('Recibida', 'Atendido'),
        'auto_approve' => false,
        'notification_template' => 'sugerencia'
    ),
    'Reclamos' => array(
        'requires_approval' => false,
        'valid_statuses' => array('Recibida', 'Atendido'),
        'auto_approve' => false,
        'notification_template' => 'reclamo'
    )
));

// Configuraciones de mensajes personalizados
define('CONDO360_MESSAGES_CONFIG', array(
    'success' => array(
        'request_created' => 'Su solicitud ha sido enviada exitosamente',
        'request_updated' => 'La solicitud ha sido actualizada',
        'response_sent' => 'La respuesta ha sido enviada al residente'
    ),
    'error' => array(
        'connection_error' => 'Error de conexión con el servidor',
        'validation_error' => 'Por favor, revise los datos ingresados',
        'permission_error' => 'No tiene permisos para realizar esta acción',
        'not_found_error' => 'La solicitud solicitada no fue encontrada'
    ),
    'validation' => array(
        'required_field' => 'Este campo es requerido',
        'min_length' => 'Debe tener al menos {min} caracteres',
        'max_length' => 'No puede exceder {max} caracteres',
        'invalid_date' => 'La fecha debe ser válida',
        'only_saturdays' => 'Las mudanzas solo pueden ser programadas para sábados',
        'future_date' => 'La fecha debe ser futura',
        'invalid_email' => 'El correo electrónico no es válido'
    )
));

// Configuraciones de campos personalizados
define('CONDO360_CUSTOM_FIELDS', array(
    'mudanza_fields' => array(
        'move_date' => array(
            'label' => 'Fecha de Mudanza',
            'type' => 'date',
            'required' => true,
            'validation' => 'saturday_future_date'
        ),
        'transporter_name' => array(
            'label' => 'Nombre del Transportista',
            'type' => 'text',
            'required' => true,
            'max_length' => 255
        ),
        'transporter_id_card' => array(
            'label' => 'Cédula del Transportista',
            'type' => 'text',
            'required' => true,
            'max_length' => 50,
            'validation' => 'id_card'
        ),
        'vehicle_brand' => array(
            'label' => 'Marca del Vehículo',
            'type' => 'text',
            'required' => true,
            'max_length' => 100
        ),
        'vehicle_model' => array(
            'label' => 'Modelo del Vehículo',
            'type' => 'text',
            'required' => true,
            'max_length' => 100
        ),
        'vehicle_plate' => array(
            'label' => 'Placa del Vehículo',
            'type' => 'text',
            'required' => true,
            'max_length' => 20
        ),
        'vehicle_color' => array(
            'label' => 'Color del Vehículo',
            'type' => 'text',
            'required' => true,
            'max_length' => 50
        ),
        'driver_name' => array(
            'label' => 'Nombre del Chofer',
            'type' => 'text',
            'required' => true,
            'max_length' => 255
        ),
        'driver_id_card' => array(
            'label' => 'Cédula del Chofer',
            'type' => 'text',
            'required' => true,
            'max_length' => 50,
            'validation' => 'id_card'
        )
    )
));

// Configuraciones de plantillas de correo
define('CONDO360_EMAIL_TEMPLATES', array(
    'request_confirmation' => array(
        'subject' => 'Solicitud #{id} recibida - {site_name}',
        'template' => 'request_confirmation.html',
        'variables' => array('id', 'type', 'date', 'details', 'site_name')
    ),
    'request_response' => array(
        'subject' => 'Respuesta a solicitud #{id} - {site_name}',
        'template' => 'request_response.html',
        'variables' => array('id', 'status', 'response', 'date', 'site_name')
    ),
    'admin_notification' => array(
        'subject' => 'Nueva solicitud #{id} - {site_name}',
        'template' => 'admin_notification.html',
        'variables' => array('id', 'type', 'requester', 'date', 'site_name')
    )
));

// Configuraciones de widgets y shortcodes
define('CONDO360_SHORTCODE_CONFIG', array(
    'condo360_solicitudes_form' => array(
        'show_history' => true,
        'show_user_info' => true,
        'enable_file_uploads' => false,
        'custom_css_class' => 'condo360-form-custom'
    ),
    'condo360_solicitudes_admin' => array(
        'per_page' => 20,
        'show_stats' => true,
        'enable_filters' => true,
        'enable_bulk_actions' => false,
        'custom_css_class' => 'condo360-admin-custom'
    )
));

// Configuraciones de base de datos
define('CONDO360_DB_CONFIG', array(
    'table_prefix' => 'condo360solicitudes_',
    'enable_logging' => true,
    'log_table' => 'condo360solicitudes_logs',
    'config_table' => 'condo360solicitudes_config',
    'cleanup_logs_days' => 90,
    'backup_enabled' => true,
    'backup_frequency' => 'daily'
));

// Configuraciones de desarrollo
define('CONDO360_DEV_CONFIG', array(
    'debug_mode' => false,
    'log_api_calls' => false,
    'show_debug_info' => false,
    'enable_profiling' => false,
    'cache_disabled' => false
));

// Función para obtener configuración
function condo360_get_config($key = null, $default = null) {
    $config = CONDO360_SOLICITUDES_CONFIG;
    
    if ($key === null) {
        return $config;
    }
    
    $keys = explode('.', $key);
    $value = $config;
    
    foreach ($keys as $k) {
        if (isset($value[$k])) {
            $value = $value[$k];
        } else {
            return $default;
        }
    }
    
    return $value;
}

// Función para actualizar configuración
function condo360_update_config($key, $value) {
    // Esta función debería implementar la lógica para actualizar
    // la configuración en la base de datos
    global $wpdb;
    
    $table_name = $wpdb->prefix . 'condo360solicitudes_config';
    
    $wpdb->replace(
        $table_name,
        array(
            'config_key' => $key,
            'config_value' => maybe_serialize($value),
            'updated_at' => current_time('mysql')
        ),
        array('%s', '%s', '%s')
    );
}

// Función para obtener mensaje personalizado
function condo360_get_message($type, $key, $replacements = array()) {
    $messages = CONDO360_MESSAGES_CONFIG;
    
    if (isset($messages[$type][$key])) {
        $message = $messages[$type][$key];
        
        // Reemplazar variables en el mensaje
        foreach ($replacements as $placeholder => $replacement) {
            $message = str_replace('{' . $placeholder . '}', $replacement, $message);
        }
        
        return $message;
    }
    
    return $key; // Devolver la clave si no se encuentra el mensaje
}

// Hook para cargar configuraciones personalizadas
add_action('init', function() {
    // Cargar configuraciones desde la base de datos
    global $wpdb;
    
    $table_name = $wpdb->prefix . 'condo360solicitudes_config';
    $configs = $wpdb->get_results("SELECT config_key, config_value FROM $table_name");
    
    foreach ($configs as $config) {
        $key = $config->config_key;
        $value = maybe_unserialize($config->config_value);
        
        // Definir constante si no existe
        if (!defined('CONDO360_' . strtoupper($key))) {
            define('CONDO360_' . strtoupper($key), $value);
        }
    }
});

// Función de utilidad para logging
function condo360_log($level, $message, $context = array()) {
    if (!condo360_get_config('logging.enable_logging', true)) {
        return;
    }
    
    $log_level = condo360_get_config('logging.log_level', 'info');
    $levels = array('debug' => 0, 'info' => 1, 'warn' => 2, 'error' => 3);
    
    if ($levels[$level] < $levels[$log_level]) {
        return;
    }
    
    $log_file = WP_CONTENT_DIR . '/uploads/condo360-logs/' . condo360_get_config('logging.log_file', 'condo360-solicitudes.log');
    
    $timestamp = current_time('Y-m-d H:i:s');
    $context_str = !empty($context) ? ' ' . json_encode($context) : '';
    $log_entry = "[$timestamp] [$level] $message$context_str" . PHP_EOL;
    
    // Crear directorio si no existe
    $log_dir = dirname($log_file);
    if (!file_exists($log_dir)) {
        wp_mkdir_p($log_dir);
    }
    
    file_put_contents($log_file, $log_entry, FILE_APPEND | LOCK_EX);
}

// Función para limpiar logs antiguos
function condo360_cleanup_logs() {
    $log_dir = WP_CONTENT_DIR . '/uploads/condo360-logs/';
    $keep_days = condo360_get_config('logging.keep_logs_days', 30);
    
    if (is_dir($log_dir)) {
        $files = glob($log_dir . '*.log');
        $cutoff_time = time() - ($keep_days * 24 * 60 * 60);
        
        foreach ($files as $file) {
            if (filemtime($file) < $cutoff_time) {
                unlink($file);
            }
        }
    }
}

// Programar limpieza de logs
if (!wp_next_scheduled('condo360_cleanup_logs')) {
    wp_schedule_event(time(), 'daily', 'condo360_cleanup_logs');
}

add_action('condo360_cleanup_logs', 'condo360_cleanup_logs');
