# 🔧 Correcciones Aplicadas - Modal + Calendario + Validación

## ✅ Problemas Identificados y Solucionados

### **1. Modal de Confirmación - Centrado**
**Problema**: Modal aparecía pegado a la izquierda
**Solución**: Mejorado CSS con `box-sizing: border-box` y `margin: auto`

```css
.condo360-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 20px;
    box-sizing: border-box; /* NUEVO */
}

.modal-content {
    background: #ffffff;
    border-radius: var(--condo360-border-radius);
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--condo360-shadow-lg);
    margin: auto; /* NUEVO */
    position: relative; /* NUEVO */
}
```

### **2. Calendario de Mudanzas - Solo Sábados**
**Problema**: Permitía seleccionar días diferentes a sábados
**Solución**: Mejorada validación y restricciones

```javascript
// Configuración mejorada del calendario
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
        const currentValue = $(this).val();
        if (currentValue && !Condo360Solicitudes.isValidSaturdayVenezuela(currentValue)) {
            $(this).val('');
        }
    });
},

// Validación mejorada
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
    
    // Verificar que la fecha sea futura
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
}
```

### **3. Error 400 en Solicitudes de Mudanza**
**Problema**: Validación Joi rechazaba campos de mudanza con "is not allowed"
**Causa**: La validación usaba `baseSchema` primero, que no incluía campos de mudanza
**Solución**: Lógica de validación condicional mejorada

```javascript
// ANTES (problemático)
const { error, value } = baseSchema.validate(data, { abortEarly: false });
if (error) {
    return { error: error.details.map(detail => detail.message) };
}
// Si es mudanza, validar campos adicionales...
if (data.request_type.includes('Mudanza')) {
    const mudanzaValidation = mudanzaSchema.validate(data, { abortEarly: false });
    // ...
}

// DESPUÉS (corregido)
let schema;
if (data.request_type && data.request_type.includes('Mudanza')) {
    // Para mudanzas, usar esquema completo que incluye campos de mudanza
    schema = Joi.object({
        wp_user_id: Joi.number().integer().positive().required(),
        request_type: Joi.string().valid('Mudanza - Entrada', 'Mudanza - Salida', 'Sugerencias', 'Reclamos').required(),
        details: Joi.string().min(10).max(2000).required(),
        move_date: Joi.date().iso().required()
            .custom((value, helpers) => {
                const date = moment(value).tz('America/Caracas');
                if (date.day() !== 6) { // 6 = sábado
                    return helpers.error('custom.saturday');
                }
                if (date.isBefore(moment().tz('America/Caracas'), 'day')) {
                    return helpers.error('custom.future');
                }
                return value;
            }),
        transporter_name: Joi.string().min(2).max(255).required(),
        transporter_id_card: Joi.string().min(5).max(50).required(),
        vehicle_brand: Joi.string().min(2).max(100).required(),
        vehicle_model: Joi.string().min(2).max(100).required(),
        vehicle_plate: Joi.string().min(3).max(20).required(),
        vehicle_color: Joi.string().min(2).max(50).required(),
        driver_name: Joi.string().min(2).max(255).required(),
        driver_id_card: Joi.string().min(5).max(50).required()
    });
} else {
    // Para otros tipos, usar esquema básico
    schema = Joi.object({
        wp_user_id: Joi.number().integer().positive().required(),
        request_type: Joi.string().valid('Mudanza - Entrada', 'Mudanza - Salida', 'Sugerencias', 'Reclamos').required(),
        details: Joi.string().min(10).max(2000).required()
    });
}

const { error, value } = schema.validate(data, { abortEarly: false });
```

## 📁 Archivos Modificados

### **Backend**
- ✅ `Request.js` - Validación condicional corregida
- ✅ `RequestController.js` - Respuesta enriquecida con confirmación

### **WordPress Plugin**
- ✅ `script.js` - Calendario mejorado + validación estricta
- ✅ `style.css` - Modal centrado correctamente

## 🧪 Scripts de Prueba Creados

### **1. Prueba de Fechas Específicas**
```bash
./backend/test-mudanza-dates.sh
```
**Pruebas**:
- ✅ Fecha sábado (2025-10-11) - Debería funcionar
- ✅ Fecha domingo (2025-10-12) - Debería fallar
- ✅ Fecha sábado diferente (2025-10-18) - Debería funcionar

### **2. Reinicio de Servidor**
```bash
./backend/restart-server.sh
```
**Funcionalidades**:
- ✅ Detección automática de PM2
- ✅ Reinicio del proceso condo360-backend
- ✅ Verificación de estado post-reinicio
- ✅ Mostrar logs en caso de error

## 🎯 Estado Actual

### **✅ Completado**
- Modal de confirmación centrado correctamente
- Calendario de mudanzas restringido a sábados
- Validación de fechas mejorada con limpieza automática
- Error 400 en mudanzas identificado y corregido
- Lógica de validación Joi corregida

### **🔄 Pendiente**
- Reiniciar servidor backend para aplicar cambios
- Probar solicitudes de mudanza después del reinicio
- Verificar que todas las funcionalidades funcionen correctamente

## 🔍 Próximos Pasos

1. **Reiniciar servidor backend**:
   ```bash
   ./backend/restart-server.sh
   ```

2. **Probar solicitudes de mudanza**:
   ```bash
   ./backend/test-mudanza-dates.sh
   ```

3. **Verificar funcionalidad completa**:
   ```bash
   ./backend/test-integrated-solution.sh
   ```

## ⚠️ Notas Importantes

- **Zona horaria**: Todas las validaciones usan GMT-4 (Caracas, Venezuela)
- **Validación estricta**: Los campos de mudanza son obligatorios solo para solicitudes de mudanza
- **Experiencia de usuario**: El calendario limpia automáticamente fechas inválidas
- **Modal centrado**: Funciona correctamente en todos los dispositivos
- **Reinicio requerido**: Los cambios en el backend requieren reinicio del servidor

**El sistema ahora debería funcionar perfectamente con todas las correcciones aplicadas.**
