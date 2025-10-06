-- Script SQL para crear las tablas del módulo Condominio360 Solicitudes
-- Ejecutar este script en la base de datos de WordPress

-- Crear tabla principal de solicitudes
CREATE TABLE IF NOT EXISTS `condo360solicitudes_requests` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `wp_user_id` BIGINT UNSIGNED NOT NULL,
  `request_type` ENUM('Mudanza - Entrada', 'Mudanza - Salida', 'Sugerencias', 'Reclamos') NOT NULL,
  `details` TEXT NOT NULL,
  `move_date` DATE NULL COMMENT 'Solo para solicitudes de mudanza',
  `transporter_name` VARCHAR(255) NULL COMMENT 'Nombre del transportista para mudanzas',
  `transporter_id_card` VARCHAR(50) NULL COMMENT 'Cédula del transportista para mudanzas',
  `vehicle_brand` VARCHAR(100) NULL COMMENT 'Marca del vehículo para mudanzas',
  `vehicle_model` VARCHAR(100) NULL COMMENT 'Modelo del vehículo para mudanzas',
  `vehicle_plate` VARCHAR(20) NULL COMMENT 'Placa del vehículo para mudanzas',
  `vehicle_color` VARCHAR(50) NULL COMMENT 'Color del vehículo para mudanzas',
  `driver_name` VARCHAR(255) NULL COMMENT 'Nombre del chofer para mudanzas',
  `driver_id_card` VARCHAR(50) NULL COMMENT 'Cédula del chofer para mudanzas',
  `status` ENUM('Recibida', 'Aprobado', 'Rechazado', 'Atendido') DEFAULT 'Recibida',
  `response` TEXT NULL COMMENT 'Respuesta de la administración',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices para optimizar consultas
  INDEX `idx_wp_user_id` (`wp_user_id`),
  INDEX `idx_request_type` (`request_type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_move_date` (`move_date`),
  
  -- Clave foránea hacia wp_users
  FOREIGN KEY (`wp_user_id`) REFERENCES `wp_users`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla de solicitudes del módulo Condominio360';

-- Crear tabla de configuración del módulo (opcional, para futuras extensiones)
CREATE TABLE IF NOT EXISTS `condo360solicitudes_config` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `config_key` VARCHAR(100) NOT NULL UNIQUE,
  `config_value` TEXT NULL,
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configuración del módulo Condominio360';

-- Insertar configuraciones por defecto
INSERT INTO `condo360solicitudes_config` (`config_key`, `config_value`, `description`) VALUES
('email_notifications', '1', 'Habilitar notificaciones por correo'),
('max_requests_per_user', '10', 'Máximo número de solicitudes activas por usuario'),
('auto_approve_suggestions', '0', 'Aprobar automáticamente sugerencias'),
('move_days_allowed', '6', 'Días de la semana permitidos para mudanzas (6=sábado)'),
('response_required', '1', 'Requerir respuesta para todas las solicitudes')
ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`);

-- Crear tabla de logs de actividad (opcional, para auditoría)
CREATE TABLE IF NOT EXISTS `condo360solicitudes_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `request_id` BIGINT NULL,
  `wp_user_id` BIGINT UNSIGNED NULL,
  `action` VARCHAR(50) NOT NULL COMMENT 'create, update, delete, view',
  `old_values` JSON NULL COMMENT 'Valores anteriores (para updates)',
  `new_values` JSON NULL COMMENT 'Valores nuevos',
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX `idx_request_id` (`request_id`),
  INDEX `idx_wp_user_id` (`wp_user_id`),
  INDEX `idx_action` (`action`),
  INDEX `idx_created_at` (`created_at`),
  
  FOREIGN KEY (`request_id`) REFERENCES `condo360solicitudes_requests`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`wp_user_id`) REFERENCES `wp_users`(`ID`) ON DELETE SET NULL
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Logs de actividad del módulo Condominio360';

-- Crear vista para estadísticas rápidas
CREATE OR REPLACE VIEW `condo360solicitudes_stats` AS
SELECT 
  COUNT(*) as total_requests,
  COUNT(CASE WHEN `status` = 'Recibida' THEN 1 END) as pending_requests,
  COUNT(CASE WHEN `status` = 'Aprobado' THEN 1 END) as approved_requests,
  COUNT(CASE WHEN `status` = 'Rechazado' THEN 1 END) as rejected_requests,
  COUNT(CASE WHEN `status` = 'Atendido' THEN 1 END) as attended_requests,
  COUNT(CASE WHEN `request_type` = 'Mudanza - Entrada' THEN 1 END) as move_in_requests,
  COUNT(CASE WHEN `request_type` = 'Mudanza - Salida' THEN 1 END) as move_out_requests,
  COUNT(CASE WHEN `request_type` = 'Sugerencias' THEN 1 END) as suggestions,
  COUNT(CASE WHEN `request_type` = 'Reclamos' THEN 1 END) as complaints,
  COUNT(CASE WHEN DATE(`created_at`) = CURDATE() THEN 1 END) as today_requests,
  COUNT(CASE WHEN MONTH(`created_at`) = MONTH(CURDATE()) AND YEAR(`created_at`) = YEAR(CURDATE()) THEN 1 END) as this_month_requests
FROM `condo360solicitudes_requests`;

-- Crear procedimiento almacenado para limpiar logs antiguos (opcional)
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS `condo360solicitudes_cleanup_logs`(IN days_to_keep INT)
BEGIN
  DELETE FROM `condo360solicitudes_logs` 
  WHERE `created_at` < DATE_SUB(NOW(), INTERVAL days_to_keep DAY);
  
  SELECT ROW_COUNT() as deleted_logs;
END //
DELIMITER ;

-- Crear función para validar fechas de mudanza (solo sábados)
DELIMITER //
CREATE FUNCTION IF NOT EXISTS `condo360solicitudes_is_saturday`(date_to_check DATE) 
RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
  RETURN WEEKDAY(date_to_check) = 5; -- 5 = sábado en MySQL
END //
DELIMITER ;

-- Crear trigger para validar fechas de mudanza
DELIMITER //
CREATE TRIGGER IF NOT EXISTS `condo360solicitudes_validate_move_date`
BEFORE INSERT ON `condo360solicitudes_requests`
FOR EACH ROW
BEGIN
  IF NEW.request_type LIKE 'Mudanza%' AND NEW.move_date IS NOT NULL THEN
    IF NOT `condo360solicitudes_is_saturday`(NEW.move_date) THEN
      SIGNAL SQLSTATE '45000' 
      SET MESSAGE_TEXT = 'Las mudanzas solo pueden ser programadas para sábados';
    END IF;
    
    IF NEW.move_date < CURDATE() THEN
      SIGNAL SQLSTATE '45000' 
      SET MESSAGE_TEXT = 'La fecha de mudanza debe ser futura';
    END IF;
  END IF;
END //
DELIMITER ;

-- Crear trigger para validar fechas de mudanza en updates
DELIMITER //
CREATE TRIGGER IF NOT EXISTS `condo360solicitudes_validate_move_date_update`
BEFORE UPDATE ON `condo360solicitudes_requests`
FOR EACH ROW
BEGIN
  IF NEW.request_type LIKE 'Mudanza%' AND NEW.move_date IS NOT NULL THEN
    IF NOT `condo360solicitudes_is_saturday`(NEW.move_date) THEN
      SIGNAL SQLSTATE '45000' 
      SET MESSAGE_TEXT = 'Las mudanzas solo pueden ser programadas para sábados';
    END IF;
    
    IF NEW.move_date < CURDATE() THEN
      SIGNAL SQLSTATE '45000' 
      SET MESSAGE_TEXT = 'La fecha de mudanza debe ser futura';
    END IF;
  END IF;
END //
DELIMITER ;

-- Mostrar información de las tablas creadas
SELECT 
  TABLE_NAME as 'Tabla',
  TABLE_ROWS as 'Filas',
  DATA_LENGTH as 'Tamaño (bytes)',
  CREATE_TIME as 'Creada'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME LIKE 'condo360solicitudes_%'
ORDER BY TABLE_NAME;

-- Mostrar información de la vista creada
SELECT 
  TABLE_NAME as 'Vista',
  VIEW_DEFINITION as 'Definición'
FROM information_schema.VIEWS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'condo360solicitudes_stats';
