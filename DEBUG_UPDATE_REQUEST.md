# 🔍 Debugging: Error 400 en Actualización de Solicitudes

## 🎯 Problema Identificado

### **Error 400 en PUT /api/requests/:id**
- **Síntoma**: Al responder solicitudes desde el shortcode de admin, no se guarda la respuesta
- **Error**: `PUT /api/requests/13 400 - 56ms`
- **Comportamiento**: El servidor se reinicia después del error

## 🔧 Debugging Aplicado

### **1. ✅ Logs de Debug en Backend**

#### **RequestController.js**
```javascript
// Agregado al inicio de updateRequest
console.log(`DEBUG updateRequest: id=${id}, body=`, req.body);

// Agregado en validación
console.log(`DEBUG validateUpdate: validating data=`, req.body);
const validation = RequestValidator.validateUpdate(req.body);
console.log(`DEBUG validation result:`, validation);

if (validation.error) {
  console.log(`DEBUG validation error:`, validation.error);
}

// Agregado en validación de estado
console.log(`DEBUG updateRequest: request_type="${existingRequest.request_type}", status="${updateData.status}"`);
const isValidStatus = RequestValidator.validateStatusForType(existingRequest.request_type, updateData.status);
console.log(`DEBUG validateStatusForType result: ${isValidStatus}`);
```

### **2. ✅ Logs de Debug en Frontend**

#### **script.js**
```javascript
// Agregado en handleResponseSubmit
console.log('DEBUG handleResponseSubmit: formData=', formData);

// Agregado en callbacks AJAX
success: (response) => {
    console.log('DEBUG AJAX success response:', response);
    if (response.success) {
        // ... éxito
    } else {
        console.log('DEBUG AJAX success but response.success=false:', response);
    }
},
error: (xhr, status, error) => {
    console.log('DEBUG AJAX error:', xhr, status, error);
    console.log('DEBUG AJAX error response:', xhr.responseText);
}
```

## 🧪 Pruebas Realizadas

### **✅ Endpoint PUT Funciona Correctamente**

```bash
# Prueba directa del endpoint
curl -X PUT "https://applications.bonaventurecclub.com/api/requests/13" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Atendido",
    "response": "Su solicitud de carta de residencia ha sido procesada exitosamente"
  }'

# Resultado: ✅ success: true
# La solicitud se actualiza correctamente
```

### **✅ Validación de Estado Funciona**

```javascript
// Para "Carta de Residencia" (no mudanza)
validateStatusForType("Carta de Residencia", "Atendido") // ✅ true

// Para mudanzas
validateStatusForType("Mudanza - Entrada", "Aprobado") // ✅ true
validateStatusForType("Mudanza - Entrada", "Atendido") // ❌ false
```

## 🔍 Análisis del Problema

### **Posibles Causas**
1. **Frontend**: Datos mal formateados o vacíos
2. **AJAX**: Error en la comunicación con WordPress
3. **WordPress**: Error en el handler AJAX
4. **Validación**: Error en la validación de datos
5. **Estado**: Error en la validación de estado por tipo

### **Flujo de Datos**
```
Frontend JS → WordPress AJAX → Backend API → Validación → Base de Datos
```

## 🎯 Próximos Pasos

### **1. Monitorear Logs**
- ✅ **Backend**: Logs agregados para ver datos recibidos
- ✅ **Frontend**: Logs agregados para ver datos enviados
- 🔄 **Próximo**: Probar desde el frontend y revisar logs

### **2. Verificar WordPress AJAX**
- 🔄 **Verificar**: Handler `ajax_update_request` en WordPress
- 🔄 **Verificar**: Datos enviados desde frontend
- 🔄 **Verificar**: Respuesta del backend

### **3. Validar Datos**
- 🔄 **Verificar**: FormData en JavaScript
- 🔄 **Verificar**: Sanitización en WordPress
- 🔄 **Verificar**: Validación Joi en backend

## 📁 Archivos Modificados

### **Backend**
- ✅ `backend/src/controllers/RequestController.js` - Logs de debug agregados

### **Frontend**
- ✅ `wordpress-plugin/assets/js/script.js` - Logs de debug agregados

## 🎯 Estado Actual

### **✅ Funcionando**
- ✅ **Endpoint PUT**: Funciona correctamente
- ✅ **Validación**: Estado válido para "Carta de Residencia"
- ✅ **Base de datos**: Actualización exitosa

### **🔍 En Investigación**
- 🔄 **Frontend**: Datos enviados desde JavaScript
- 🔄 **WordPress**: Handler AJAX
- 🔄 **Comunicación**: Entre frontend y backend

**Los logs de debug están implementados para identificar exactamente dónde está fallando el proceso de actualización de solicitudes.**
