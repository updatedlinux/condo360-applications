<?php
/**
 * Plugin Name: Condominio360 - Módulo de Solicitudes
 * Plugin URI: https://bonaventurecclub.com
 * Description: Módulo completo para gestión de solicitudes de residentes en Condominio360
 * Version: 1.0.0
 * Author: Condominio360
 * License: GPL v2 or later
 * Text Domain: condo360-solicitudes
 * Domain Path: /languages
 */

// Prevenir acceso directo
if (!defined('ABSPATH')) {
    exit;
}

// Configurar zona horaria para Venezuela (GMT-4)
if (!ini_get('date.timezone')) {
    date_default_timezone_set('America/Caracas');
}

// Definir constantes del plugin
define('CONDO360_SOLICITUDES_VERSION', '1.0.0');
define('CONDO360_SOLICITUDES_PLUGIN_URL', plugin_dir_url(__FILE__));
define('CONDO360_SOLICITUDES_PLUGIN_PATH', plugin_dir_path(__FILE__));

// Cargar configuración personalizada si existe
if (file_exists(CONDO360_SOLICITUDES_PLUGIN_PATH . 'config.php')) {
    require_once CONDO360_SOLICITUDES_PLUGIN_PATH . 'config.php';
}

// Definir URL de API por defecto o usar configuración personalizada
if (defined('CONDO360_SOLICITUDES_CONFIG') && isset(CONDO360_SOLICITUDES_CONFIG['api_url'])) {
    define('CONDO360_SOLICITUDES_API_URL', CONDO360_SOLICITUDES_CONFIG['api_url']);
} else {
    define('CONDO360_SOLICITUDES_API_URL', 'https://applications.bonaventurecclub.com/api');
}

/**
 * Clase principal del plugin
 */
class Condo360Solicitudes {
    
    private static $instance = null;
    
    /**
     * Obtener instancia única del plugin
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor privado para singleton
     */
    private function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('wp_ajax_condo360_create_request', array($this, 'ajax_create_request'));
        add_action('wp_ajax_condo360_update_request', array($this, 'ajax_update_request'));
        add_action('wp_ajax_condo360_get_requests', array($this, 'ajax_get_requests'));
        
        // Registrar shortcodes
        add_shortcode('condo360_solicitudes_form', array($this, 'shortcode_form'));
        add_shortcode('condo360_solicitudes_admin', array($this, 'shortcode_admin'));
    }
    
    /**
     * Formatear fecha en zona horaria venezolana (GMT-4)
     * @param string $date_string - Fecha a formatear
     * @param bool $include_time - Incluir hora
     * @return string - Fecha formateada
     */
    public function format_venezuelan_date($date_string, $include_time = true) {
        if (empty($date_string)) {
            return '';
        }
        
        $date = new DateTime($date_string, new DateTimeZone('UTC'));
        $date->setTimezone(new DateTimeZone('America/Caracas'));
        
        if ($include_time) {
            return $date->format('d/m/Y \a \l\a\s h:i A');
        } else {
            return $date->format('d/m/Y');
        }
    }
    
    /**
     * Formatear fecha para mostrar en listas (más compacto)
     * @param string $date_string - Fecha a formatear
     * @return string - Fecha formateada compacta
     */
    public function format_venezuelan_date_short($date_string) {
        if (empty($date_string)) {
            return '';
        }
        
        $date = new DateTime($date_string, new DateTimeZone('UTC'));
        $date->setTimezone(new DateTimeZone('America/Caracas'));
        
        return $date->format('d/m/Y h:i A');
    }
    
    /**
     * Obtener fecha actual en zona horaria venezolana
     * @return string - Fecha actual formateada
     */
    public function get_current_venezuelan_date() {
        $date = new DateTime('now', new DateTimeZone('America/Caracas'));
        return $date->format('Y-m-d');
    }
    
    /**
     * Obtener timestamp actual en zona horaria venezolana
     * @return string - Timestamp actual
     */
    public function get_current_venezuelan_timestamp() {
        $date = new DateTime('now', new DateTimeZone('America/Caracas'));
        return $date->format('Y-m-d H:i:s');
    }
    
    /**
     * Validar que la fecha sea sábado en zona horaria venezolana
     * @param string $date_string - Fecha a validar
     * @return bool - True si es sábado
     */
    public function is_saturday_venezuela($date_string) {
        if (empty($date_string)) {
            return false;
        }
        
        $date = new DateTime($date_string, new DateTimeZone('America/Caracas'));
        return $date->format('w') == '6'; // 6 = sábado
    }
    
    /**
     * Inicializar el plugin
     */
    public function init() {
        // Cargar traducciones
        load_plugin_textdomain('condo360-solicitudes', false, dirname(plugin_basename(__FILE__)) . '/languages');
        
        // Verificar configuración
        $this->check_configuration();
    }
    
    /**
     * Encolar scripts y estilos
     */
    public function enqueue_scripts() {
        wp_enqueue_style(
            'condo360-solicitudes-style',
            CONDO360_SOLICITUDES_PLUGIN_URL . 'assets/css/style.css',
            array(),
            CONDO360_SOLICITUDES_VERSION
        );
        
        wp_enqueue_script(
            'condo360-solicitudes-script',
            CONDO360_SOLICITUDES_PLUGIN_URL . 'assets/js/script.js',
            array('jquery'),
            CONDO360_SOLICITUDES_VERSION,
            true
        );
        
        // Localizar script para AJAX
        wp_localize_script('condo360-solicitudes-script', 'condo360_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('condo360_nonce'),
            'api_url' => CONDO360_SOLICITUDES_API_URL,
            'current_user_id' => is_user_logged_in() ? get_current_user_id() : 0,
            'messages' => array(
                'loading' => __('Cargando...', 'condo360-solicitudes'),
                'error' => __('Ha ocurrido un error', 'condo360-solicitudes'),
                'success' => __('Operación exitosa', 'condo360-solicitudes'),
                'confirm_delete' => __('¿Está seguro de eliminar esta solicitud?', 'condo360-solicitudes')
            )
        ));
    }
    
    /**
     * Shortcode para formulario de solicitudes (propietarios)
     */
    public function shortcode_form($atts) {
        $atts = shortcode_atts(array(
            'show_history' => 'true'
        ), $atts);
        
        if (!is_user_logged_in()) {
            return '<div class="condo360-error">' . __('Debe iniciar sesión para acceder a este formulario.', 'condo360-solicitudes') . '</div>';
        }
        
        $current_user = wp_get_current_user();
        $user_id = $current_user->ID;
        
        ob_start();
        ?>
        <div class="condo360-solicitudes-form">
            <div class="condo360-header">
                <h2><?php _e('Solicitudes de Condominio360', 'condo360-solicitudes'); ?></h2>
                <p><?php _e('Complete el formulario para enviar su solicitud', 'condo360-solicitudes'); ?></p>
            </div>
            
            <form id="condo360-request-form" class="condo360-form">
                <div class="form-group">
                    <label for="request_type"><?php _e('Tipo de Solicitud', 'condo360-solicitudes'); ?> <span class="required">*</span></label>
                    <select id="request_type" name="request_type" required>
                        <option value=""><?php _e('Seleccione un tipo', 'condo360-solicitudes'); ?></option>
                        <option value="Mudanza - Entrada"><?php _e('Mudanza - Entrada', 'condo360-solicitudes'); ?></option>
                        <option value="Mudanza - Salida"><?php _e('Mudanza - Salida', 'condo360-solicitudes'); ?></option>
                        <option value="Sugerencias"><?php _e('Sugerencias', 'condo360-solicitudes'); ?></option>
                        <option value="Reclamos"><?php _e('Reclamos', 'condo360-solicitudes'); ?></option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="details"><?php _e('Detalles de la Solicitud', 'condo360-solicitudes'); ?> <span class="required">*</span></label>
                    <textarea id="details" name="details" rows="5" required placeholder="<?php _e('Describa su solicitud con el mayor detalle posible...', 'condo360-solicitudes'); ?>"></textarea>
                </div>
                
                <!-- Campos específicos para mudanzas -->
                <div id="mudanza-fields" class="mudanza-fields" style="display: none;">
                    <h3><?php _e('Información de la Mudanza', 'condo360-solicitudes'); ?></h3>
                    
                    <div class="form-group">
                        <label for="move_date"><?php _e('Fecha de Mudanza', 'condo360-solicitudes'); ?> <span class="required">*</span></label>
                        <input type="date" id="move_date" name="move_date" />
                        <small class="help-text"><?php _e('Solo se permiten sábados para mudanzas', 'condo360-solicitudes'); ?></small>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="transporter_name"><?php _e('Nombre del Transportista', 'condo360-solicitudes'); ?> <span class="required">*</span></label>
                            <input type="text" id="transporter_name" name="transporter_name" />
                        </div>
                        <div class="form-group">
                            <label for="transporter_id_card"><?php _e('Cédula del Transportista', 'condo360-solicitudes'); ?> <span class="required">*</span></label>
                            <input type="text" id="transporter_id_card" name="transporter_id_card" />
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="vehicle_brand"><?php _e('Marca del Vehículo', 'condo360-solicitudes'); ?> <span class="required">*</span></label>
                            <input type="text" id="vehicle_brand" name="vehicle_brand" />
                        </div>
                        <div class="form-group">
                            <label for="vehicle_model"><?php _e('Modelo del Vehículo', 'condo360-solicitudes'); ?> <span class="required">*</span></label>
                            <input type="text" id="vehicle_model" name="vehicle_model" />
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="vehicle_plate"><?php _e('Placa del Vehículo', 'condo360-solicitudes'); ?> <span class="required">*</span></label>
                            <input type="text" id="vehicle_plate" name="vehicle_plate" />
                        </div>
                        <div class="form-group">
                            <label for="vehicle_color"><?php _e('Color del Vehículo', 'condo360-solicitudes'); ?> <span class="required">*</span></label>
                            <input type="text" id="vehicle_color" name="vehicle_color" />
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="driver_name"><?php _e('Nombre del Chofer', 'condo360-solicitudes'); ?> <span class="required">*</span></label>
                            <input type="text" id="driver_name" name="driver_name" />
                        </div>
                        <div class="form-group">
                            <label for="driver_id_card"><?php _e('Cédula del Chofer', 'condo360-solicitudes'); ?> <span class="required">*</span></label>
                            <input type="text" id="driver_id_card" name="driver_id_card" />
                        </div>
                    </div>
                </div>
                
                <!-- Información del usuario (solo lectura) -->
                <div class="user-info">
                    <h3><?php _e('Información del Solicitante', 'condo360-solicitudes'); ?></h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label><?php _e('Nombre Completo', 'condo360-solicitudes'); ?></label>
                            <input type="text" value="<?php echo esc_attr($current_user->display_name); ?>" readonly />
                        </div>
                        <div class="form-group">
                            <label><?php _e('Usuario', 'condo360-solicitudes'); ?></label>
                            <input type="text" value="<?php echo esc_attr($current_user->user_nicename); ?>" readonly />
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        <span class="btn-text"><?php _e('Enviar Solicitud', 'condo360-solicitudes'); ?></span>
                        <span class="btn-loading" style="display: none;"><?php _e('Enviando...', 'condo360-solicitudes'); ?></span>
                    </button>
                </div>
            </form>
            
            <div id="condo360-messages"></div>
            
            <?php if ($atts['show_history'] === 'true'): ?>
            <div class="condo360-history">
                <h3><?php _e('Historial de Solicitudes', 'condo360-solicitudes'); ?></h3>
                <div id="condo360-requests-list">
                    <div class="loading"><?php _e('Cargando solicitudes...', 'condo360-solicitudes'); ?></div>
                </div>
            </div>
            <?php endif; ?>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Shortcode para panel de administración
     */
    public function shortcode_admin($atts) {
        $atts = shortcode_atts(array(
            'per_page' => '20'
        ), $atts);
        
        // Verificar permisos de administrador
        if (!current_user_can('manage_options')) {
            return '<div class="condo360-error">' . __('No tiene permisos para acceder a esta sección.', 'condo360-solicitudes') . '</div>';
        }
        
        ob_start();
        ?>
        <div class="condo360-admin-panel">
            <div class="condo360-header">
                <h2><?php _e('Panel de Administración - Solicitudes', 'condo360-solicitudes'); ?></h2>
                <div class="admin-stats" id="admin-stats">
                    <div class="loading"><?php _e('Cargando estadísticas...', 'condo360-solicitudes'); ?></div>
                </div>
            </div>
            
            <div class="admin-filters">
                <div class="filter-group">
                    <label for="filter-status"><?php _e('Filtrar por Estado:', 'condo360-solicitudes'); ?></label>
                    <select id="filter-status">
                        <option value=""><?php _e('Todos los estados', 'condo360-solicitudes'); ?></option>
                        <option value="Recibida"><?php _e('Recibida', 'condo360-solicitudes'); ?></option>
                        <option value="Aprobado"><?php _e('Aprobado', 'condo360-solicitudes'); ?></option>
                        <option value="Rechazado"><?php _e('Rechazado', 'condo360-solicitudes'); ?></option>
                        <option value="Atendido"><?php _e('Atendido', 'condo360-solicitudes'); ?></option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="filter-type"><?php _e('Filtrar por Tipo:', 'condo360-solicitudes'); ?></label>
                    <select id="filter-type">
                        <option value=""><?php _e('Todos los tipos', 'condo360-solicitudes'); ?></option>
                        <option value="Mudanza - Entrada"><?php _e('Mudanza - Entrada', 'condo360-solicitudes'); ?></option>
                        <option value="Mudanza - Salida"><?php _e('Mudanza - Salida', 'condo360-solicitudes'); ?></option>
                        <option value="Sugerencias"><?php _e('Sugerencias', 'condo360-solicitudes'); ?></option>
                        <option value="Reclamos"><?php _e('Reclamos', 'condo360-solicitudes'); ?></option>
                    </select>
                </div>
            </div>
            
            <div class="admin-table-container">
                <table class="condo360-admin-table">
                    <thead>
                        <tr>
                            <th><?php _e('ID', 'condo360-solicitudes'); ?></th>
                            <th><?php _e('Solicitante', 'condo360-solicitudes'); ?></th>
                            <th><?php _e('Tipo', 'condo360-solicitudes'); ?></th>
                            <th><?php _e('Fecha', 'condo360-solicitudes'); ?></th>
                            <th><?php _e('Estado', 'condo360-solicitudes'); ?></th>
                            <th><?php _e('Acciones', 'condo360-solicitudes'); ?></th>
                        </tr>
                    </thead>
                    <tbody id="admin-requests-list">
                        <tr>
                            <td colspan="6" class="loading"><?php _e('Cargando solicitudes...', 'condo360-solicitudes'); ?></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="admin-pagination" id="admin-pagination"></div>
        </div>
        
        <!-- Modal para detalles de solicitud -->
        <div id="request-modal" class="condo360-modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><?php _e('Detalles de la Solicitud', 'condo360-solicitudes'); ?></h3>
                    <span class="modal-close">&times;</span>
                </div>
                <div class="modal-body" id="modal-body">
                    <!-- Contenido dinámico -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary modal-close"><?php _e('Cerrar', 'condo360-solicitudes'); ?></button>
                </div>
            </div>
        </div>
        
        <!-- Modal para responder solicitud -->
        <div id="response-modal" class="condo360-modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><?php _e('Responder Solicitud', 'condo360-solicitudes'); ?></h3>
                    <span class="modal-close">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="response-form">
                        <input type="hidden" id="response-request-id" name="request_id" />
                        
                        <div class="form-group">
                            <label for="response-status"><?php _e('Estado:', 'condo360-solicitudes'); ?></label>
                            <select id="response-status" name="status" required>
                                <option value=""><?php _e('Seleccione un estado', 'condo360-solicitudes'); ?></option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="response-text"><?php _e('Respuesta:', 'condo360-solicitudes'); ?></label>
                            <textarea id="response-text" name="response" rows="5" required placeholder="<?php _e('Escriba la respuesta de la administración...', 'condo360-solicitudes'); ?>"></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">
                                <span class="btn-text"><?php _e('Guardar Respuesta', 'condo360-solicitudes'); ?></span>
                                <span class="btn-loading" style="display: none;"><?php _e('Guardando...', 'condo360-solicitudes'); ?></span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * AJAX: Crear solicitud
     */
    public function ajax_create_request() {
        check_ajax_referer('condo360_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_send_json_error(array('message' => __('Debe iniciar sesión', 'condo360-solicitudes')));
        }
        
        $current_user = wp_get_current_user();
        $data = array(
            'wp_user_id' => $current_user->ID,
            'request_type' => sanitize_text_field($_POST['request_type']),
            'details' => sanitize_textarea_field($_POST['details'])
        );
        
        // Agregar campos específicos de mudanza si aplica
        if (strpos($data['request_type'], 'Mudanza') !== false) {
            $data['move_date'] = sanitize_text_field($_POST['move_date']);
            $data['transporter_name'] = sanitize_text_field($_POST['transporter_name']);
            $data['transporter_id_card'] = sanitize_text_field($_POST['transporter_id_card']);
            $data['vehicle_brand'] = sanitize_text_field($_POST['vehicle_brand']);
            $data['vehicle_model'] = sanitize_text_field($_POST['vehicle_model']);
            $data['vehicle_plate'] = sanitize_text_field($_POST['vehicle_plate']);
            $data['vehicle_color'] = sanitize_text_field($_POST['vehicle_color']);
            $data['driver_name'] = sanitize_text_field($_POST['driver_name']);
            $data['driver_id_card'] = sanitize_text_field($_POST['driver_id_card']);
        }
        
        $response = $this->make_api_request('POST', '/requests', $data);
        
        if ($response && isset($response['success']) && $response['success']) {
            wp_send_json_success($response);
        } else {
            wp_send_json_error($response);
        }
    }
    
    /**
     * AJAX: Actualizar solicitud
     */
    public function ajax_update_request() {
        check_ajax_referer('condo360_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('No tiene permisos', 'condo360-solicitudes')));
        }
        
        $request_id = intval($_POST['request_id']);
        $data = array(
            'status' => sanitize_text_field($_POST['status']),
            'response' => sanitize_textarea_field($_POST['response'])
        );
        
        $response = $this->make_api_request('PUT', "/requests/{$request_id}", $data);
        
        if ($response && isset($response['success']) && $response['success']) {
            wp_send_json_success($response);
        } else {
            wp_send_json_error($response);
        }
    }
    
    /**
     * AJAX: Obtener solicitudes
     */
    public function ajax_get_requests() {
        check_ajax_referer('condo360_nonce', 'nonce');
        
        $params = array();
        
        if (isset($_POST['user_id'])) {
            $params['user_id'] = intval($_POST['user_id']);
        }
        
        if (isset($_POST['page'])) {
            $params['page'] = intval($_POST['page']);
        }
        
        if (isset($_POST['limit'])) {
            $params['limit'] = intval($_POST['limit']);
        }
        
        $query_string = http_build_query($params);
        $url = '/requests' . ($query_string ? '?' . $query_string : '');
        
        $response = $this->make_api_request('GET', $url);
        
        if ($response && isset($response['success']) && $response['success']) {
            wp_send_json_success($response);
        } else {
            wp_send_json_error($response);
        }
    }
    
    /**
     * Realizar petición a la API
     */
    private function make_api_request($method, $endpoint, $data = null) {
        $url = CONDO360_SOLICITUDES_API_URL . $endpoint;
        
        $args = array(
            'method' => $method,
            'timeout' => 30,
            'headers' => array(
                'Content-Type' => 'application/json',
                'User-Agent' => 'Condo360-WordPress-Plugin/' . CONDO360_SOLICITUDES_VERSION
            )
        );
        
        if ($data && in_array($method, array('POST', 'PUT'))) {
            $args['body'] = json_encode($data);
        }
        
        $response = wp_remote_request($url, $args);
        
        if (is_wp_error($response)) {
            return array(
                'success' => false,
                'error' => $response->get_error_message()
            );
        }
        
        $body = wp_remote_retrieve_body($response);
        $decoded = json_decode($body, true);
        
        return $decoded ?: array(
            'success' => false,
            'error' => 'Respuesta inválida del servidor'
        );
    }
    
    /**
     * Verificar configuración del plugin
     */
    private function check_configuration() {
        // Verificar que la API esté disponible
        $api_url = CONDO360_SOLICITUDES_API_URL;
        $health_url = str_replace('/api', '', $api_url) . '/health';
        
        $response = wp_remote_get($health_url, array(
            'timeout' => 10,
            'sslverify' => true
        ));
        
        if (is_wp_error($response)) {
            add_action('admin_notices', array($this, 'api_notice'));
            return;
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (!$data || !isset($data['status']) || $data['status'] !== 'OK') {
            add_action('admin_notices', array($this, 'api_notice'));
        }
    }
    
    /**
     * Mostrar aviso si la API no está disponible
     */
    public function api_notice() {
        $api_url = CONDO360_SOLICITUDES_API_URL;
        $health_url = str_replace('/api', '', $api_url) . '/health';
        
        ?>
        <div class="notice notice-error">
            <p><strong>Condominio360 Solicitudes:</strong> La API del backend no está disponible.</p>
            <p><strong>URL configurada:</strong> <?php echo esc_html($api_url); ?></p>
            <p><strong>Health check:</strong> <a href="<?php echo esc_url($health_url); ?>" target="_blank"><?php echo esc_html($health_url); ?></a></p>
            <p><strong>Posibles soluciones:</strong></p>
            <ul>
                <li>Verificar que el servidor backend esté ejecutándose</li>
                <li>Comprobar la configuración en <code>config.php</code></li>
                <li>Verificar conectividad de red y SSL</li>
                <li>Revisar logs del servidor</li>
            </ul>
        </div>
        <?php
    }
}

// Inicializar el plugin
Condo360Solicitudes::getInstance();

// Hook de activación
register_activation_hook(__FILE__, function() {
    // Crear tablas si no existen
    global $wpdb;
    
    $charset_collate = $wpdb->get_charset_collate();
    
    $sql = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}condo360solicitudes_requests (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        wp_user_id BIGINT UNSIGNED NOT NULL,
        request_type ENUM('Mudanza - Entrada', 'Mudanza - Salida', 'Sugerencias', 'Reclamos') NOT NULL,
        details TEXT NOT NULL,
        move_date DATE NULL,
        transporter_name VARCHAR(255) NULL,
        transporter_id_card VARCHAR(50) NULL,
        vehicle_brand VARCHAR(100) NULL,
        vehicle_model VARCHAR(100) NULL,
        vehicle_plate VARCHAR(20) NULL,
        vehicle_color VARCHAR(50) NULL,
        driver_name VARCHAR(255) NULL,
        driver_id_card VARCHAR(50) NULL,
        status ENUM('Recibida', 'Aprobado', 'Rechazado', 'Atendido') DEFAULT 'Recibida',
        response TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_wp_user_id (wp_user_id),
        INDEX idx_request_type (request_type),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (wp_user_id) REFERENCES {$wpdb->prefix}users(ID) ON DELETE CASCADE ON UPDATE CASCADE
    ) $charset_collate;";
    
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
});

// Hook de desactivación
register_deactivation_hook(__FILE__, function() {
    // Limpiar cache si es necesario
    wp_cache_flush();
});
