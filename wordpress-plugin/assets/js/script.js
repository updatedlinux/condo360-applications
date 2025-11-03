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
            
            // Vincular eventos a modales existentes en el HTML
            this.bindModalEvents('#request-modal');
            this.bindModalEvents('#response-modal');
            
            // Agregar botón de prueba temporal para debug
            if (window.location.href.includes('debug')) {
                $('body').append(`
                    <div style="position: fixed; top: 10px; right: 10px; z-index: 99999; background: red; color: white; padding: 10px;">
                        <button onclick="Condo360Solicitudes.testModal()">Test Modal</button>
                        <button onclick="Condo360Solicitudes.closeModal()">Close Modal</button>
                    </div>
                `);
            }
        },
        
        // Método de prueba para modal
        testModal: function() {
            console.log('DEBUG testModal: Creando modal de prueba');
            const testModalHtml = `
                <div id="test-modal" class="condo360-modal" style="display: block;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Modal de Prueba</h3>
                            <span class="modal-close">&times;</span>
                        </div>
                        <div class="modal-body">
                            <p>Este es un modal de prueba. Debería cerrarse con:</p>
                            <ul>
                                <li>Botón X</li>
                                <li>Clic fuera del modal</li>
                                <li>Tecla Escape</li>
                            </ul>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary modal-close">Cerrar</button>
                        </div>
                    </div>
                </div>
            `;
            
            $('#test-modal').remove();
            $('body').append(testModalHtml);
        },
        
        // Vincular eventos
        bindEvents: function() {
            // Formulario de solicitudes
            $('#condo360-request-form').on('submit', this.handleFormSubmit.bind(this));
            $('#request_type').on('change', this.handleRequestTypeChange.bind(this));
            
            // Panel de junta de condominio
            $('#filter-status, #filter-type').on('change', this.handleFilterChange.bind(this));
            $(document).on('click', '.view-request', this.handleViewRequest.bind(this));
            $(document).on('click', '.respond-request', this.handleRespondRequest.bind(this));
            $('#response-form').on('submit', this.handleResponseSubmit.bind(this));
            
            // Modales - Cerrar con botones (delegación específica)
            $(document).on('click', '.modal-close', function(e) {
                console.log('DEBUG: Botón de cerrar modal clickeado', e.target);
                e.preventDefault();
                e.stopPropagation();
                Condo360Solicitudes.closeModal();
            });
            
            // Alternativa: Evento directo en botones de cerrar
            $(document).on('click', 'span.modal-close, button.modal-close', function(e) {
                console.log('DEBUG: Botón de cerrar alternativo clickeado', e.target);
                e.preventDefault();
                e.stopPropagation();
                Condo360Solicitudes.closeModal();
            });
            
            // Evento más amplio para capturar cualquier clic en elementos de cierre
            $(document).on('click', function(e) {
                if ($(e.target).hasClass('modal-close') || 
                    $(e.target).closest('.modal-close').length > 0 ||
                    e.target.textContent === '×' ||
                    e.target.textContent === 'Cerrar') {
                    console.log('DEBUG: Evento de cierre capturado por delegación amplia', e.target);
                    e.preventDefault();
                    e.stopPropagation();
                    Condo360Solicitudes.closeModal();
                }
            });
            
            // Modales - Cerrar con clic fuera
            $(document).on('click', '.condo360-modal', function(e) {
                console.log('DEBUG: Clic en modal, target:', e.target, 'this:', this);
                if (e.target === this) {
                    console.log('DEBUG: Cerrando modal por clic fuera');
                    Condo360Solicitudes.closeModal();
                }
            });
            
            // Prevenir cierre al hacer clic dentro del modal
            $(document).on('click', '.modal-content', function(e) {
                console.log('DEBUG: Clic dentro del modal, previniendo cierre');
                e.stopPropagation();
            });
            
            // Cerrar modal con tecla Escape
            $(document).on('keydown', function(e) {
                if (e.key === 'Escape' && $('.condo360-modal:visible').length > 0) {
                    console.log('DEBUG: Cerrando modal con tecla Escape');
                    Condo360Solicitudes.closeModal();
                }
            });
            
            // Paginación
            $(document).on('click', '.pagination-btn', this.handlePagination.bind(this));
            
            // Validación de fecha de mudanza
            $('#move_date').on('change', this.validateMoveDateSimple.bind(this));
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
                        // Mostrar mensaje específico del backend
                        let errorMessage = 'Error al enviar la solicitud';
                        if (response.data && response.data.details && Array.isArray(response.data.details)) {
                            errorMessage = response.data.details.join(', ');
                        } else if (response.data && response.data.message) {
                            errorMessage = response.data.message;
                        }
                        this.showMessage('error', errorMessage);
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
                this.setupIdCardValidation(); // Aplicar validación de cédulas
            } else {
                mudanzaFields.hide();
                mudanzaFields.find('input, select').prop('required', false);
            }
        },
        
        // Configurar validación de cédulas (solo números)
        setupIdCardValidation: function() {
            // Remover eventos anteriores para evitar duplicados
            $('#transporter_id_card, #driver_id_card').off('input.idCardValidation');
            
            // Aplicar validación solo a números
            $('#transporter_id_card, #driver_id_card').on('input.idCardValidation', function(e) {
                const value = e.target.value;
                const cleanValue = value.replace(/[^0-9]/g, '');
                if (value !== cleanValue) {
                    e.target.value = cleanValue;
                    // Mostrar mensaje temporal
                    Condo360Solicitudes.showMessage('warning', 'Solo se permiten números en el campo de cédula');
                }
            });
            
            console.log('DEBUG setupIdCardValidation: Validación aplicada a campos de cédula');
        },
        
        // Configurar calendario para mudanzas (simplificado)
        setupMudanzaCalendar: function() {
            const dateInput = $('#move_date');
            
            // Configurar fecha mínima (hoy)
            const today = this.getCurrentVenezuelanDate();
            dateInput.attr('min', today);
            
            // Configurar fecha máxima usando configuración del plugin
            const currentYear = new Date().getFullYear();
            const maxFutureYears = condo360_ajax.max_future_years || 2; // Valor por defecto: 2 años
            const maxYear = currentYear + maxFutureYears;
            dateInput.attr('max', `${maxYear}-12-31`);
            
            // Agregar tooltip informativo
            dateInput.attr('title', 'Seleccione la fecha de mudanza');
            
            // Remover eventos anteriores para evitar duplicados
            dateInput.off('change.validateMoveDate input.validateMoveDate');
            
            // Solo validar que sea fecha futura, no sábado
            dateInput.on('change.validateMoveDate', this.validateMoveDateSimple.bind(this));
            
            console.log('DEBUG setupMudanzaCalendar (simplificado):', {
                min: dateInput.attr('min'),
                max: dateInput.attr('max'),
                today: today,
                maxYear: maxYear,
                maxFutureYears: maxFutureYears
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
                                        <li>La junta de condominio revisará su solicitud</li>
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
            
            // Vincular eventos específicos al modal recién creado
            this.bindModalEvents('#confirmation-modal');
        },
        
        // Vincular eventos específicos a un modal
        bindModalEvents: function(modalId) {
            console.log('DEBUG bindModalEvents: Vinculando eventos a', modalId);
            
            $(modalId).find('.modal-close').off('click.modalClose').on('click.modalClose', function(e) {
                console.log('DEBUG bindModalEvents: Botón de cerrar clickeado en', modalId);
                e.preventDefault();
                e.stopPropagation();
                Condo360Solicitudes.closeModal();
            });
            
            // También vincular al botón "Entendido" si existe
            $(modalId).find('button.modal-close').off('click.modalClose').on('click.modalClose', function(e) {
                console.log('DEBUG bindModalEvents: Botón "Entendido" clickeado en', modalId);
                e.preventDefault();
                e.stopPropagation();
                Condo360Solicitudes.closeModal();
            });
        },
        
        // Validar fecha de mudanza (simplificado - solo fecha futura)
        validateMoveDateSimple: function(e) {
            const dateInput = $(e.target);
            const selectedDate = dateInput.val();
            
            console.log('DEBUG validateMoveDateSimple:', {
                selectedDate: selectedDate,
                inputElement: dateInput[0]
            });
            
            if (!selectedDate) {
                this.clearFieldError(dateInput);
                return true;
            }
            
            // Solo verificar que la fecha sea futura
            const today = this.getCurrentVenezuelanDate();
            console.log('DEBUG today:', today);
            
            if (selectedDate < today) {
                console.log('DEBUG: Rejecting date - not future');
                this.showFieldError(dateInput, 'La fecha de mudanza debe ser futura');
                return false;
            }
            
            console.log('DEBUG: Accepting date - valid (future)');
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
            
            // Validación específica para mudanzas (simplificada)
            if (formData.request_type.includes('Mudanza')) {
                const moveDateInput = $('#move_date');
                if (moveDateInput.val()) {
                    const moveDateValid = this.validateMoveDateSimple({ target: moveDateInput[0] });
                    if (!moveDateValid) {
                        isValid = false;
                    }
                }
            }
            
            return isValid;
        },
        
        // Cargar solicitudes del usuario
        loadUserRequests: function() {
            const container = $('#condo360-requests-list');
            container.html('<div class="loading">' + this.config.messages.loading + '</div>');
            
            const perPage = condo360_ajax.per_page || 20;
            
            $.ajax({
                url: this.config.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'condo360_get_requests',
                    nonce: this.config.nonce,
                    user_id: condo360_ajax.current_user_id || null,
                    page: this.state.currentPage,
                    limit: perPage
                },
                success: (response) => {
                    if (response.success) {
                        this.renderUserRequests(response.data.data);
                        this.renderPagination(response.data.pagination, 'user');
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
            // Usar campo _formatted si existe, sino formatear
            const formattedDate = request.created_at_formatted || this.formatVenezuelanDate(request.created_at);
            
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
        
        // Cargar datos del panel de junta de condominio
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
            
            const perPage = condo360_ajax.per_page || 20;
            
            const params = {
                page: this.state.currentPage,
                limit: perPage,
                ...this.state.currentFilters
            };
            
            $.ajax({
                url: this.config.apiUrl + '/requests',
                type: 'GET',
                data: params,
                success: (response) => {
                    if (response.success) {
                        this.renderAdminRequests(response.data);
                        this.renderPagination(response.pagination, 'admin');
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
            
            // Validar que requests existe y es un array
            if (!requests || !Array.isArray(requests) || requests.length === 0) {
                container.html('<tr><td colspan="6" class="message info">No hay solicitudes</td></tr>');
                return;
            }
            
            let html = '';
            requests.forEach(request => {
                console.log('DEBUG renderAdminRequests: request.id=' + request.id + ', created_at=' + request.created_at + ', created_at_formatted=' + request.created_at_formatted);
                
                // Usar campo _formatted si existe, sino formatear
                const formattedDate = request.created_at_formatted || this.formatVenezuelanDateShort(request.created_at);
                console.log('DEBUG renderAdminRequests: formattedDate=' + formattedDate);
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
        renderPagination: function(pagination, type = 'admin') {
            const container = type === 'admin' ? $('#admin-pagination') : $('#condo360-pagination');
            
            if (!pagination || pagination.totalPages <= 1) {
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
                
                // Determinar si es admin o usuario basado en el contenedor
                const isAdmin = $(e.target).closest('#admin-pagination').length > 0;
                
                if (isAdmin) {
                    this.loadAdminRequests();
                } else {
                    this.loadUserRequests();
                }
            }
        },
        
        // Manejar ver solicitud
        handleViewRequest: function(e) {
            const requestId = $(e.target).data('id');
            
            $.ajax({
                url: this.config.apiUrl + '/requests/' + requestId,
                type: 'GET',
                success: (response) => {
                    console.log('DEBUG handleViewRequest: response=', response);
                    if (response.success) {
                        console.log('DEBUG handleViewRequest: response.data=', response.data);
                        this.showRequestModal(response.data);
                    }
                }
            });
        },
        
        // Mostrar modal de solicitud
        showRequestModal: function(request) {
            const modal = $('#request-modal');
            const body = $('#modal-body');
            
            console.log('DEBUG showRequestModal: request.created_at=', request.created_at);
            console.log('DEBUG showRequestModal: request.created_at_formatted=', request.created_at_formatted);
            
            // SIEMPRE usar campo _formatted si existe (backend ya lo formateó correctamente)
            // Solo usar fallback si realmente no existe
            let formattedDate;
            if (request.created_at_formatted) {
                formattedDate = request.created_at_formatted;
                console.log('DEBUG showRequestModal: Usando created_at_formatted del backend:', formattedDate);
            } else {
                formattedDate = this.formatVenezuelanDate(request.created_at);
                console.log('DEBUG showRequestModal: Fallback a formatVenezuelanDate:', formattedDate);
            }
            
            let mudanzaInfo = '';
            if (request.request_type.includes('Mudanza')) {
                console.log('DEBUG showRequestModal: request.move_date=', request.move_date);
                console.log('DEBUG showRequestModal: request.move_date_formatted=', request.move_date_formatted);
                
                // SIEMPRE usar campo _formatted si existe
                let moveDateFormatted;
                if (request.move_date_formatted) {
                    moveDateFormatted = request.move_date_formatted;
                    console.log('DEBUG showRequestModal: Usando move_date_formatted del backend:', moveDateFormatted);
                } else {
                    moveDateFormatted = this.formatVenezuelanDateOnly(request.move_date);
                    console.log('DEBUG showRequestModal: Fallback a formatVenezuelanDateOnly:', moveDateFormatted);
                }
                mudanzaInfo = `
                    <div class="mudanza-info">
                        <h4>Información de la Mudanza</h4>
                        <p><strong>Fecha:</strong> ${moveDateFormatted}</p>
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
                                <h4>Respuesta de la Junta de Condominio</h4>
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
            
            // Agregar contador de caracteres
            this.setupResponseTextCounter();
            
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
            
            console.log('DEBUG handleResponseSubmit: formData=', formData);
            
            // Validar longitud mínima de respuesta
            if (formData.response.length < 10) {
                this.showMessage('error', 'La respuesta debe tener al menos 10 caracteres');
                $('#response-text').focus();
                return;
            }
            
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
                    console.log('DEBUG AJAX success response:', response);
                    if (response.success) {
                        this.showMessage('success', 'Respuesta enviada exitosamente');
                        this.closeModal();
                        this.loadAdminRequests();
                        this.loadAdminStats();
                    } else {
                        console.log('DEBUG AJAX success but response.success=false:', response);
                        this.showMessage('error', response.data.message || 'Error al enviar la respuesta');
                    }
                },
                error: (xhr, status, error) => {
                    console.log('DEBUG AJAX error:', xhr, status, error);
                    console.log('DEBUG AJAX error response:', xhr.responseText);
                    this.showMessage('error', 'Error de conexión');
                },
                complete: () => {
                    this.setLoading(form.find('button[type="submit"]'), false);
                }
            });
        },
        
        // Configurar contador de caracteres para respuesta
        setupResponseTextCounter: function() {
            const textarea = $('#response-text');
            const formGroup = textarea.closest('.form-group');
            
            // Remover contador anterior si existe
            formGroup.find('.character-counter').remove();
            
            // Crear contador
            const counter = $('<div class="character-counter"></div>');
            formGroup.append(counter);
            
            // Función para actualizar contador
            const updateCounter = () => {
                const length = textarea.val().length;
                const minLength = 10;
                const isValid = length >= minLength;
                
                counter.html(`
                    <span class="counter-text ${isValid ? 'valid' : 'invalid'}">
                        ${length}/${minLength} caracteres mínimos
                    </span>
                `);
            };
            
            // Actualizar en tiempo real
            textarea.on('input keyup paste', updateCounter);
            
            // Actualizar inicialmente
            updateCounter();
        },
        
        // Cerrar modal
        closeModal: function() {
            console.log('DEBUG closeModal: Cerrando todos los modales');
            $('.condo360-modal').each(function() {
                console.log('DEBUG closeModal: Cerrando modal:', this.id || 'sin-id');
                $(this).hide();
            });
            
            // También cerrar modales específicos por ID
            $('#request-modal, #response-modal, #confirmation-modal').hide();
            
            console.log('DEBUG closeModal: Modales cerrados');
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
        // NOTA: Esta función solo se usa como fallback si _formatted no está disponible
        // El backend ya envía fechas correctamente formateadas en GMT-4
        formatVenezuelanDate: function(dateString) {
            if (!dateString) return '';
            
            // Si ya viene formateado (contiene "a las"), retornarlo como está
            if (typeof dateString === 'string' && dateString.includes('a las')) {
                return dateString;
            }
            
            // Si es un string en formato ISO, parsearlo correctamente
            // El backend envía fechas en formato ISO que ya están en GMT-4
            const date = new Date(dateString);
            
            // El backend ya ajustó a GMT-4, así que usar los componentes de la fecha directamente
            // Sin restar horas adicionales
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            
            let hours = date.getHours();
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            
            hours = hours % 12;
            hours = hours ? hours : 12; // 0 horas = 12 AM
            hours = hours.toString().padStart(2, '0');
            
            return `${day}/${month}/${year} a las ${hours}:${minutes} ${ampm}`;
        },
        
        // Formatear solo fecha (sin hora)
        // NOTA: Esta función solo se usa como fallback si _formatted no está disponible
        formatVenezuelanDateOnly: function(dateString) {
            if (!dateString) return '';
            
            // Si ya viene formateado (formato DD/MM/YYYY), retornarlo como está
            if (typeof dateString === 'string' && dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                return dateString;
            }
            
            // Si es un string en formato ISO o Date, parsearlo
            // Para move_date, el backend envía "YYYY-MM-DD" que se parsea como medianoche local
            const date = new Date(dateString);
            
            // Usar componentes locales directamente (el backend ya ajustó a GMT-4)
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            
            return `${day}/${month}/${year}`;
        },
        
        // Formatear fecha para mostrar en listas (más compacto)
        // NOTA: Esta función solo se usa como fallback si _formatted no está disponible
        formatVenezuelanDateShort: function(dateString) {
            if (!dateString) return '';
            
            // Si ya viene formateado, retornarlo como está
            if (typeof dateString === 'string' && (dateString.includes('a las') || dateString.includes('/'))) {
                return dateString;
            }
            
            // Si es un string en formato ISO, parsearlo correctamente
            const date = new Date(dateString);
            
            // Usar componentes locales directamente (el backend ya ajustó a GMT-4)
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            
            let hours = date.getHours();
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            
            hours = hours % 12;
            hours = hours ? hours : 12;
            hours = hours.toString().padStart(2, '0');
            
            return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
        },
        
        // Obtener fecha actual en zona horaria venezolana
        getCurrentVenezuelanDate: function() {
            const now = new Date();
            
            const day = now.getDate().toString().padStart(2, '0');
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const year = now.getFullYear();
            
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
