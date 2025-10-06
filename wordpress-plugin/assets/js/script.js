/**
 * JavaScript para el plugin Condominio360 Solicitudes
 */

(function($) {
    'use strict';

    // Objeto principal del plugin
    const Condo360Solicitudes = {
        
        // Configuración
        config: {
            apiUrl: condo360_ajax.api_url,
            ajaxUrl: condo360_ajax.ajax_url,
            nonce: condo360_ajax.nonce,
            messages: condo360_ajax.messages
        },
        
        // Estado actual
        state: {
            currentPage: 1,
            currentFilters: {},
            isLoading: false
        },
        
        // Inicialización
        init: function() {
            this.bindEvents();
            this.initFormValidation();
            this.loadUserRequests();
            this.loadAdminData();
        },
        
        // Vincular eventos
        bindEvents: function() {
            // Formulario de solicitudes
            $('#condo360-request-form').on('submit', this.handleFormSubmit.bind(this));
            $('#request_type').on('change', this.handleRequestTypeChange.bind(this));
            
            // Panel de administración
            $('#filter-status, #filter-type').on('change', this.handleFilterChange.bind(this));
            $(document).on('click', '.view-request', this.handleViewRequest.bind(this));
            $(document).on('click', '.respond-request', this.handleRespondRequest.bind(this));
            $('#response-form').on('submit', this.handleResponseSubmit.bind(this));
            
            // Modales
            $(document).on('click', '.modal-close', this.closeModal.bind(this));
            $(document).on('click', '.condo360-modal', function(e) {
                if (e.target === this) {
                    Condo360Solicitudes.closeModal();
                }
            });
            
            // Paginación
            $(document).on('click', '.pagination-btn', this.handlePagination.bind(this));
            
            // Validación de fecha de mudanza
            $('#move_date').on('change', this.validateMoveDate.bind(this));
        },
        
        // Manejar envío del formulario
        handleFormSubmit: function(e) {
            e.preventDefault();
            
            if (this.state.isLoading) return;
            
            const form = $(e.target);
            const formData = this.serializeForm(form);
            
            // Validar formulario
            if (!this.validateForm(formData)) {
                return;
            }
            
            this.setLoading(form.find('button[type="submit"]'), true);
            
            $.ajax({
                url: this.config.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'condo360_create_request',
                    nonce: this.config.nonce,
                    ...formData
                },
                success: (response) => {
                    if (response.success) {
                        // Mostrar modal de confirmación con detalles
                        this.showConfirmationModal(response.data.confirmation);
                        form[0].reset();
                        $('#mudanza-fields').hide();
                        this.loadUserRequests();
                    } else {
                        this.showMessage('error', response.data.message || 'Error al enviar la solicitud');
                    }
                },
                error: () => {
                    this.showMessage('error', 'Error de conexión');
                },
                complete: () => {
                    this.setLoading(form.find('button[type="submit"]'), false);
                }
            });
        },
        
        // Manejar cambio de tipo de solicitud
        handleRequestTypeChange: function(e) {
            const requestType = $(e.target).val();
            const mudanzaFields = $('#mudanza-fields');
            
            if (requestType.includes('Mudanza')) {
                mudanzaFields.show();
                mudanzaFields.find('input, select').prop('required', true);
                this.setupMudanzaCalendar();
            } else {
                mudanzaFields.hide();
                mudanzaFields.find('input, select').prop('required', false);
            }
        },
        
        // Configurar calendario para mudanzas (solo sábados)
        setupMudanzaCalendar: function() {
            const dateInput = $('#move_date');
            
            // Configurar atributos del input de fecha
            dateInput.attr('min', this.getNextSaturday());
            dateInput.attr('max', this.getLastSaturdayOfYear());
            
            // Agregar evento para validar fechas
            dateInput.on('change', this.validateMoveDate.bind(this));
            dateInput.on('input', this.validateMoveDate.bind(this));
            
            // Agregar tooltip informativo
            dateInput.attr('title', 'Solo se permiten sábados para mudanzas');
            
            // Agregar atributo step para restringir días
            dateInput.attr('step', '7'); // Solo permite saltos de 7 días (sábados)
            
            // Agregar evento click para mostrar solo sábados
            dateInput.on('click', function() {
                // Forzar que solo se puedan seleccionar sábados
                const currentValue = $(this).val();
                if (currentValue && !Condo360Solicitudes.isValidSaturdayVenezuela(currentValue)) {
                    $(this).val('');
                }
            });
        },
        
        // Obtener el próximo sábado
        getNextSaturday: function() {
            const today = new Date();
            
            // Encontrar el próximo sábado
            let nextSaturday = new Date(today);
            const daysUntilSaturday = (6 - today.getDay()) % 7;
            
            if (daysUntilSaturday === 0) {
                // Si es sábado, usar el siguiente sábado
                nextSaturday.setDate(today.getDate() + 7);
            } else {
                // Calcular días hasta el próximo sábado
                nextSaturday.setDate(today.getDate() + daysUntilSaturday);
            }
            
            return nextSaturday.toISOString().split('T')[0];
        },
        
        // Obtener el último sábado del año
        getLastSaturdayOfYear: function() {
            const year = new Date().getFullYear();
            const lastDay = new Date(year, 11, 31); // 31 de diciembre
            const lastSaturday = new Date(lastDay);
            
            // Retroceder hasta encontrar el último sábado del año
            while (lastSaturday.getDay() !== 6) {
                lastSaturday.setDate(lastSaturday.getDate() - 1);
            }
            
            return lastSaturday.toISOString().split('T')[0];
        },
        
        // Mostrar modal de confirmación
        showConfirmationModal: function(confirmation) {
            const modalHtml = `
                <div id="confirmation-modal" class="condo360-modal" style="display: block;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>✅ Solicitud Enviada Exitosamente</h3>
                            <span class="modal-close">&times;</span>
                        </div>
                        <div class="modal-body">
                            <div class="confirmation-message">
                                <div class="success-icon">🎉</div>
                                <h4>${confirmation.message}</h4>
                                <div class="timeframe-info">
                                    <strong>⏰ Tiempo de respuesta:</strong> ${confirmation.timeframe}
                                </div>
                                <div class="details-info">
                                    <p>${confirmation.details}</p>
                                </div>
                                <div class="next-steps">
                                    <h5>Próximos pasos:</h5>
                                    <ul>
                                        <li>Recibirá un correo de confirmación en breve</li>
                                        <li>La administración revisará su solicitud</li>
                                        <li>Se le notificará la respuesta por correo</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary modal-close">Entendido</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Remover modal anterior si existe
            $('#confirmation-modal').remove();
            
            // Agregar nuevo modal
            $('body').append(modalHtml);
            
            // Auto-cerrar después de 10 segundos
            setTimeout(() => {
                $('#confirmation-modal').fadeOut(500, function() {
                    $(this).remove();
                });
            }, 10000);
        },
        
        // Validar fecha de mudanza (solo sábados en zona horaria venezolana)
        validateMoveDate: function(e) {
            const dateInput = $(e.target);
            const selectedDate = dateInput.val();
            
            if (!selectedDate) {
                this.clearFieldError(dateInput);
                return true;
            }
            
            // Verificar que sea sábado en zona horaria venezolana
            if (!this.isValidSaturdayVenezuela(selectedDate)) {
                this.showFieldError(dateInput, 'Las mudanzas solo pueden ser programadas para sábados (zona horaria Venezuela GMT-4)');
                dateInput.val(''); // Limpiar el campo
                return false;
            }
            
            // Verificar que la fecha sea futura en zona horaria venezolana
            const today = this.getCurrentVenezuelanDate();
            
            if (selectedDate < today) {
                this.showFieldError(dateInput, 'La fecha de mudanza debe ser futura');
                dateInput.val(''); // Limpiar el campo
                return false;
            }
            
            // Verificar que esté dentro del rango permitido
            const minDate = this.getNextSaturday();
            const maxDate = this.getLastSaturdayOfYear();
            
            if (selectedDate < minDate || selectedDate > maxDate) {
                this.showFieldError(dateInput, `La fecha debe estar entre ${minDate} y ${maxDate}`);
                dateInput.val(''); // Limpiar el campo
                return false;
            }
            
            this.clearFieldError(dateInput);
            return true;
        },
        
        // Validar formulario completo
        validateForm: function(formData) {
            let isValid = true;
            
            // Validar campos requeridos
            const requiredFields = ['request_type', 'details'];
            
            if (formData.request_type.includes('Mudanza')) {
                requiredFields.push(
                    'move_date', 'transporter_name', 'transporter_id_card',
                    'vehicle_brand', 'vehicle_model', 'vehicle_plate',
                    'vehicle_color', 'driver_name', 'driver_id_card'
                );
            }
            
            requiredFields.forEach(field => {
                const input = $(`[name="${field}"]`);
                if (!formData[field] || formData[field].trim() === '') {
                    this.showFieldError(input, 'Este campo es requerido');
                    isValid = false;
                } else {
                    this.clearFieldError(input);
                }
            });
            
            // Validar longitud de detalles
            if (formData.details && formData.details.length < 10) {
                this.showFieldError($('#details'), 'Los detalles deben tener al menos 10 caracteres');
                isValid = false;
            }
            
            return isValid;
        },
        
        // Cargar solicitudes del usuario
        loadUserRequests: function() {
            const container = $('#condo360-requests-list');
            container.html('<div class="loading">' + this.config.messages.loading + '</div>');
            
            $.ajax({
                url: this.config.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'condo360_get_requests',
                    nonce: this.config.nonce,
                    user_id: condo360_ajax.current_user_id || null
                },
                success: (response) => {
                    if (response.success) {
                        this.renderUserRequests(response.data.data);
                    } else {
                        container.html('<div class="message error">No se pudieron cargar las solicitudes</div>');
                    }
                },
                error: () => {
                    container.html('<div class="message error">Error de conexión</div>');
                }
            });
        },
        
        // Renderizar solicitudes del usuario
        renderUserRequests: function(requests) {
            const container = $('#condo360-requests-list');
            
            if (requests.length === 0) {
                container.html('<div class="message info">No tiene solicitudes registradas</div>');
                return;
            }
            
            let html = '';
            requests.forEach(request => {
                html += this.renderRequestItem(request);
            });
            
            container.html(html);
        },
        
        // Renderizar item de solicitud
        renderRequestItem: function(request) {
            const statusClass = request.status.toLowerCase();
            const formattedDate = this.formatVenezuelanDate(request.created_at);
            
            return `
                <div class="request-item ${statusClass}">
                    <div class="request-header">
                        <span class="request-id">#${request.id}</span>
                        <span class="request-status ${statusClass}">${request.status}</span>
                    </div>
                    <div class="request-details">
                        <strong>Tipo:</strong> ${request.request_type}<br>
                        <strong>Detalles:</strong> ${request.details.substring(0, 100)}${request.details.length > 100 ? '...' : ''}
                        ${request.response ? `<br><strong>Respuesta:</strong> ${request.response}` : ''}
                    </div>
                    <div class="request-date">${formattedDate}</div>
                </div>
            `;
        },
        
        // Cargar datos del panel de administración
        loadAdminData: function() {
            this.loadAdminStats();
            this.loadAdminRequests();
        },
        
        // Cargar estadísticas del admin
        loadAdminStats: function() {
            const container = $('#admin-stats');
            
            $.ajax({
                url: this.config.apiUrl + '/requests/stats',
                type: 'GET',
                success: (response) => {
                    if (response.success) {
                        this.renderAdminStats(response.data);
                    }
                },
                error: () => {
                    container.html('<div class="message error">Error al cargar estadísticas</div>');
                }
            });
        },
        
        // Renderizar estadísticas del admin
        renderAdminStats: function(stats) {
            const container = $('#admin-stats');
            
            const html = `
                <div class="stat-card">
                    <h4>Total</h4>
                    <p class="stat-number">${stats.total}</p>
                </div>
                <div class="stat-card">
                    <h4>Pendientes</h4>
                    <p class="stat-number">${stats.byStatus.Recibida || 0}</p>
                </div>
                <div class="stat-card">
                    <h4>Aprobadas</h4>
                    <p class="stat-number">${stats.byStatus.Aprobado || 0}</p>
                </div>
                <div class="stat-card">
                    <h4>Rechazadas</h4>
                    <p class="stat-number">${stats.byStatus.Rechazado || 0}</p>
                </div>
                <div class="stat-card">
                    <h4>Atendidas</h4>
                    <p class="stat-number">${stats.byStatus.Atendido || 0}</p>
                </div>
                <div class="stat-card">
                    <h4>Este Mes</h4>
                    <p class="stat-number">${stats.thisMonth}</p>
                </div>
            `;
            
            container.html(html);
        },
        
        // Cargar solicitudes del admin
        loadAdminRequests: function() {
            const container = $('#admin-requests-list');
            container.html('<tr><td colspan="6" class="loading">' + this.config.messages.loading + '</td></tr>');
            
            const params = {
                page: this.state.currentPage,
                limit: 20,
                ...this.state.currentFilters
            };
            
            $.ajax({
                url: this.config.apiUrl + '/requests',
                type: 'GET',
                data: params,
                success: (response) => {
                    if (response.success) {
                        this.renderAdminRequests(response.data.data);
                        this.renderPagination(response.data.pagination);
                    } else {
                        container.html('<tr><td colspan="6" class="message error">Error al cargar solicitudes</td></tr>');
                    }
                },
                error: () => {
                    container.html('<tr><td colspan="6" class="message error">Error de conexión</td></tr>');
                }
            });
        },
        
        // Renderizar solicitudes del admin
        renderAdminRequests: function(requests) {
            const container = $('#admin-requests-list');
            
            if (requests.length === 0) {
                container.html('<tr><td colspan="6" class="message info">No hay solicitudes</td></tr>');
                return;
            }
            
            let html = '';
            requests.forEach(request => {
                const formattedDate = this.formatVenezuelanDateShort(request.created_at);
                const statusClass = request.status.toLowerCase();
                
                html += `
                    <tr>
                        <td>#${request.id}</td>
                        <td>${request.display_name}</td>
                        <td>${request.request_type}</td>
                        <td>${formattedDate}</td>
                        <td><span class="request-status ${statusClass}">${request.status}</span></td>
                        <td>
                            <button class="btn btn-secondary view-request" data-id="${request.id}">Ver</button>
                            ${request.status === 'Recibida' ? `<button class="btn btn-primary respond-request" data-id="${request.id}">Responder</button>` : ''}
                        </td>
                    </tr>
                `;
            });
            
            container.html(html);
        },
        
        // Renderizar paginación
        renderPagination: function(pagination) {
            const container = $('#admin-pagination');
            
            if (pagination.totalPages <= 1) {
                container.empty();
                return;
            }
            
            let html = '';
            
            // Botón anterior
            if (pagination.page > 1) {
                html += `<button class="pagination-btn" data-page="${pagination.page - 1}">Anterior</button>`;
            }
            
            // Páginas
            const startPage = Math.max(1, pagination.page - 2);
            const endPage = Math.min(pagination.totalPages, pagination.page + 2);
            
            for (let i = startPage; i <= endPage; i++) {
                const activeClass = i === pagination.page ? 'active' : '';
                html += `<button class="pagination-btn ${activeClass}" data-page="${i}">${i}</button>`;
            }
            
            // Botón siguiente
            if (pagination.page < pagination.totalPages) {
                html += `<button class="pagination-btn" data-page="${pagination.page + 1}">Siguiente</button>`;
            }
            
            container.html(html);
        },
        
        // Manejar cambio de filtros
        handleFilterChange: function() {
            this.state.currentFilters = {
                status: $('#filter-status').val(),
                type: $('#filter-type').val()
            };
            this.state.currentPage = 1;
            this.loadAdminRequests();
        },
        
        // Manejar paginación
        handlePagination: function(e) {
            const page = parseInt($(e.target).data('page'));
            if (page && page !== this.state.currentPage) {
                this.state.currentPage = page;
                this.loadAdminRequests();
            }
        },
        
        // Manejar ver solicitud
        handleViewRequest: function(e) {
            const requestId = $(e.target).data('id');
            
            $.ajax({
                url: this.config.apiUrl + '/requests/' + requestId,
                type: 'GET',
                success: (response) => {
                    if (response.success) {
                        this.showRequestModal(response.data);
                    }
                }
            });
        },
        
        // Mostrar modal de solicitud
        showRequestModal: function(request) {
            const modal = $('#request-modal');
            const body = $('#modal-body');
            
            const formattedDate = this.formatVenezuelanDate(request.created_at);
            
            let mudanzaInfo = '';
            if (request.request_type.includes('Mudanza')) {
                mudanzaInfo = `
                    <div class="mudanza-info">
                        <h4>Información de la Mudanza</h4>
                        <p><strong>Fecha:</strong> ${this.formatVenezuelanDateOnly(request.move_date)}</p>
                        <p><strong>Transportista:</strong> ${request.transporter_name} (C.I. ${request.transporter_id_card})</p>
                        <p><strong>Vehículo:</strong> ${request.vehicle_brand} ${request.vehicle_model} - ${request.vehicle_color}</p>
                        <p><strong>Placa:</strong> ${request.vehicle_plate}</p>
                        <p><strong>Chofer:</strong> ${request.driver_name} (C.I. ${request.driver_id_card})</p>
                    </div>
                `;
            }
            
            const html = `
                <div class="request-detail">
                    <div class="detail-header">
                        <h4>Solicitud #${request.id}</h4>
                        <span class="request-status ${request.status.toLowerCase()}">${request.status}</span>
                    </div>
                    <div class="detail-info">
                        <p><strong>Solicitante:</strong> ${request.display_name}</p>
                        <p><strong>Tipo:</strong> ${request.request_type}</p>
                        <p><strong>Fecha:</strong> ${formattedDate}</p>
                        <p><strong>Detalles:</strong></p>
                        <div class="details-text">${request.details}</div>
                        ${mudanzaInfo}
                        ${request.response ? `
                            <div class="response-section">
                                <h4>Respuesta de la Administración</h4>
                                <div class="response-text">${request.response}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
            
            body.html(html);
            modal.show();
        },
        
        // Manejar responder solicitud
        handleRespondRequest: function(e) {
            const requestId = $(e.target).data('id');
            
            $.ajax({
                url: this.config.apiUrl + '/requests/' + requestId,
                type: 'GET',
                success: (response) => {
                    if (response.success) {
                        this.showResponseModal(response.data);
                    }
                }
            });
        },
        
        // Mostrar modal de respuesta
        showResponseModal: function(request) {
            const modal = $('#response-modal');
            const statusSelect = $('#response-status');
            
            // Limpiar opciones anteriores
            statusSelect.empty();
            
            // Agregar opciones según el tipo de solicitud
            if (request.request_type.includes('Mudanza')) {
                statusSelect.append('<option value="Aprobado">Aprobado</option>');
                statusSelect.append('<option value="Rechazado">Rechazado</option>');
            } else {
                statusSelect.append('<option value="Atendido">Atendido</option>');
            }
            
            $('#response-request-id').val(request.id);
            $('#response-text').val('');
            
            modal.show();
        },
        
        // Manejar envío de respuesta
        handleResponseSubmit: function(e) {
            e.preventDefault();
            
            if (this.state.isLoading) return;
            
            const form = $(e.target);
            const formData = {
                request_id: $('#response-request-id').val(),
                status: $('#response-status').val(),
                response: $('#response-text').val()
            };
            
            this.setLoading(form.find('button[type="submit"]'), true);
            
            $.ajax({
                url: this.config.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'condo360_update_request',
                    nonce: this.config.nonce,
                    ...formData
                },
                success: (response) => {
                    if (response.success) {
                        this.showMessage('success', 'Respuesta enviada exitosamente');
                        this.closeModal();
                        this.loadAdminRequests();
                        this.loadAdminStats();
                    } else {
                        this.showMessage('error', response.data.message || 'Error al enviar la respuesta');
                    }
                },
                error: () => {
                    this.showMessage('error', 'Error de conexión');
                },
                complete: () => {
                    this.setLoading(form.find('button[type="submit"]'), false);
                }
            });
        },
        
        // Cerrar modal
        closeModal: function() {
            $('.condo360-modal').hide();
        },
        
        // Serializar formulario
        serializeForm: function(form) {
            const formData = {};
            form.find('input, select, textarea').each(function() {
                const field = $(this);
                if (field.attr('name')) {
                    formData[field.attr('name')] = field.val();
                }
            });
            return formData;
        },
        
        // Mostrar mensaje
        showMessage: function(type, message) {
            const container = $('#condo360-messages');
            const messageHtml = `<div class="message ${type}">${message}</div>`;
            container.html(messageHtml);
            
            // Auto-ocultar después de 5 segundos
            setTimeout(() => {
                container.empty();
            }, 5000);
        },
        
        // Mostrar error en campo
        showFieldError: function(field, message) {
            field.addClass('error');
            field.closest('.form-group').find('.error-message').remove();
            field.closest('.form-group').append(`<div class="error-message">${message}</div>`);
        },
        
        // Limpiar error de campo
        clearFieldError: function(field) {
            field.removeClass('error');
            field.closest('.form-group').find('.error-message').remove();
        },
        
        // Establecer estado de carga
        setLoading: function(button, loading) {
            if (loading) {
                button.addClass('loading').prop('disabled', true);
                this.state.isLoading = true;
            } else {
                button.removeClass('loading').prop('disabled', false);
                this.state.isLoading = false;
            }
        },
        
        // Inicializar validación de formulario
        initFormValidation: function() {
            // Validación en tiempo real
            $('input, textarea').on('blur', function() {
                const field = $(this);
                if (field.prop('required') && !field.val().trim()) {
                    Condo360Solicitudes.showFieldError(field, 'Este campo es requerido');
                } else {
                    Condo360Solicitudes.clearFieldError(field);
                }
            });
        },
        
        // Formatear fecha en zona horaria venezolana (GMT-4)
        formatVenezuelanDate: function(dateString) {
            if (!dateString) return '';
            
            const date = new Date(dateString);
            
            // Ajustar a GMT-4 (Venezuela)
            const venezuelanTime = new Date(date.getTime() - (4 * 60 * 60 * 1000));
            
            const day = venezuelanTime.getDate().toString().padStart(2, '0');
            const month = (venezuelanTime.getMonth() + 1).toString().padStart(2, '0');
            const year = venezuelanTime.getFullYear();
            
            let hours = venezuelanTime.getHours();
            const minutes = venezuelanTime.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            
            hours = hours % 12;
            hours = hours ? hours : 12; // 0 horas = 12 AM
            hours = hours.toString().padStart(2, '0');
            
            return `${day}/${month}/${year} a las ${hours}:${minutes} ${ampm}`;
        },
        
        // Formatear solo fecha (sin hora)
        formatVenezuelanDateOnly: function(dateString) {
            if (!dateString) return '';
            
            const date = new Date(dateString);
            const venezuelanTime = new Date(date.getTime() - (4 * 60 * 60 * 1000));
            
            const day = venezuelanTime.getDate().toString().padStart(2, '0');
            const month = (venezuelanTime.getMonth() + 1).toString().padStart(2, '0');
            const year = venezuelanTime.getFullYear();
            
            return `${day}/${month}/${year}`;
        },
        
        // Formatear fecha para mostrar en listas (más compacto)
        formatVenezuelanDateShort: function(dateString) {
            if (!dateString) return '';
            
            const date = new Date(dateString);
            const venezuelanTime = new Date(date.getTime() - (4 * 60 * 60 * 1000));
            
            const day = venezuelanTime.getDate().toString().padStart(2, '0');
            const month = (venezuelanTime.getMonth() + 1).toString().padStart(2, '0');
            const year = venezuelanTime.getFullYear();
            
            let hours = venezuelanTime.getHours();
            const minutes = venezuelanTime.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            
            hours = hours % 12;
            hours = hours ? hours : 12;
            hours = hours.toString().padStart(2, '0');
            
            return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
        },
        
        // Obtener fecha actual en zona horaria venezolana
        getCurrentVenezuelanDate: function() {
            const now = new Date();
            const venezuelanTime = new Date(now.getTime() - (4 * 60 * 60 * 1000));
            
            const day = venezuelanTime.getDate().toString().padStart(2, '0');
            const month = (venezuelanTime.getMonth() + 1).toString().padStart(2, '0');
            const year = venezuelanTime.getFullYear();
            
            return `${year}-${month}-${day}`;
        },
        
        // Validar que la fecha sea sábado en zona horaria venezolana
        isValidSaturdayVenezuela: function(dateString) {
            if (!dateString) return false;
            
            const date = new Date(dateString);
            
            // 6 = sábado en JavaScript (0 = domingo, 1 = lunes, ..., 6 = sábado)
            return date.getDay() === 6;
        }
    };
    
    // Inicializar cuando el documento esté listo
    $(document).ready(function() {
        Condo360Solicitudes.init();
    });
    
    // Exponer objeto globalmente para debugging
    window.Condo360Solicitudes = Condo360Solicitudes;
    
})(jQuery);
