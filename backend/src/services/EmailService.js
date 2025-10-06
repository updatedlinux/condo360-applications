const nodemailer = require('nodemailer');
const moment = require('moment-timezone');
require('dotenv').config();

// Configurar zona horaria para GMT-4
moment.tz.setDefault('America/Caracas');

/**
 * Servicio de correos electrónicos para Condominio360
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true para puerto 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED === 'true'
      }
    });

    this.fromName = process.env.SMTP_FROM_NAME || 'Condominio360 - Solicitudes';
    this.fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@bonaventurecclub.com';
    this.logoUrl = process.env.EMAIL_TEMPLATE_LOGO || 'https://bonaventurecclub.com/wp-content/uploads/2025/09/2-e1759267603471.png';
    this.primaryColor = process.env.EMAIL_TEMPLATE_COLOR_PRIMARY || '#2563eb';
    this.secondaryColor = process.env.EMAIL_TEMPLATE_COLOR_SECONDARY || '#64748b';
    this.siteName = process.env.WORDPRESS_SITE_NAME || 'Bonaventure Country Club';
    this.siteUrl = process.env.WORDPRESS_URL || 'https://bonaventurecclub.com';
  }

  /**
   * Verificar configuración del servicio de correo
   * @returns {Promise<boolean>} - True si la configuración es válida
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Servidor SMTP configurado correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error en configuración SMTP:', error);
      return false;
    }
  }

  /**
   * Generar plantilla HTML base para correos
   * @param {string} title - Título del correo
   * @param {string} content - Contenido del correo
   * @param {string} footerText - Texto del pie de página
   * @returns {string} - HTML del correo
   */
  generateEmailTemplate(title, content, footerText = '') {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, ${this.primaryColor}, ${this.secondaryColor});
            padding: 30px 20px;
            text-align: center;
        }
        .logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 15px;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 30px 20px;
        }
        .content h2 {
            color: ${this.primaryColor};
            margin-top: 0;
            font-size: 20px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
        }
        .info-box {
            background-color: #f8fafc;
            border-left: 4px solid ${this.primaryColor};
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 4px 4px 0;
        }
        .info-row {
            display: flex;
            margin-bottom: 8px;
        }
        .info-label {
            font-weight: 600;
            color: ${this.secondaryColor};
            min-width: 120px;
        }
        .info-value {
            color: #333;
        }
        .footer {
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            color: ${this.secondaryColor};
            font-size: 14px;
        }
        .button {
            display: inline-block;
            background-color: ${this.primaryColor};
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }
        .button:hover {
            background-color: ${this.secondaryColor};
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .content {
                padding: 20px 15px;
            }
            .info-row {
                flex-direction: column;
            }
            .info-label {
                min-width: auto;
                margin-bottom: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${this.logoUrl}" alt="${this.siteName}" class="logo">
            <h1>${title}</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            ${footerText || `
                <p><strong>${this.siteName}</strong></p>
                <p>Este es un correo automático del sistema de solicitudes.</p>
                <p>Para más información, visite: <a href="${this.siteUrl}">${this.siteUrl}</a></p>
            `}
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Enviar correo de acuse de recibo al crear solicitud
   * @param {Object} request - Datos de la solicitud
   * @param {Object} user - Datos del usuario
   * @returns {Promise<boolean>} - True si se envió correctamente
   */
  async sendRequestConfirmation(request, user) {
    try {
      const formattedDate = moment(request.created_at).tz('America/Caracas').format('DD/MM/YYYY [a las] h:mm A');
      
      let mudanzaDetails = '';
      if (request.request_type.includes('Mudanza')) {
        const moveDate = moment(request.move_date).tz('America/Caracas').format('DD/MM/YYYY');
        mudanzaDetails = `
          <div class="info-box">
            <h3 style="margin-top: 0; color: ${this.primaryColor};">Detalles de la Mudanza</h3>
            <div class="info-row">
              <span class="info-label">Fecha:</span>
              <span class="info-value">${moveDate}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Transportista:</span>
              <span class="info-value">${request.transporter_name} (C.I. ${request.transporter_id_card})</span>
            </div>
            <div class="info-row">
              <span class="info-label">Vehículo:</span>
              <span class="info-value">${request.vehicle_brand} ${request.vehicle_model} - ${request.vehicle_color}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Placa:</span>
              <span class="info-value">${request.vehicle_plate}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Chofer:</span>
              <span class="info-value">${request.driver_name} (C.I. ${request.driver_id_card})</span>
            </div>
          </div>
        `;
      }

      const content = `
        <h2>¡Solicitud Recibida!</h2>
        <p>Estimado/a <strong>${user.display_name}</strong>,</p>
        <p>Hemos recibido su solicitud correctamente. A continuación encontrará los detalles:</p>
        
        <div class="info-box">
          <div class="info-row">
            <span class="info-label">Número:</span>
            <span class="info-value">#${request.id}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Tipo:</span>
            <span class="info-value">${request.request_type}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Fecha:</span>
            <span class="info-value">${formattedDate}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Estado:</span>
            <span class="info-value">${request.status}</span>
          </div>
        </div>

        <div class="info-box">
          <h3 style="margin-top: 0; color: ${this.primaryColor};">Detalles de su Solicitud</h3>
          <p>${request.details}</p>
        </div>

        ${mudanzaDetails}

        <p>Su solicitud será revisada por la administración y recibirá una respuesta en breve.</p>
        <p>Puede consultar el estado de sus solicitudes en cualquier momento desde el portal de residentes.</p>
      `;

      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: user.user_email,
        subject: `Solicitud #${request.id} recibida - ${this.siteName}`,
        html: this.generateEmailTemplate('Solicitud Recibida', content)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Correo de confirmación enviado a ${user.user_email}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando correo de confirmación:', error);
      return false;
    }
  }

  /**
   * Enviar correo de notificación al responder solicitud
   * @param {Object} request - Datos de la solicitud actualizada
   * @param {Object} user - Datos del usuario
   * @returns {Promise<boolean>} - True si se envió correctamente
   */
  async sendRequestResponse(request, user) {
    try {
      const formattedDate = moment(request.updated_at).tz('America/Caracas').format('DD/MM/YYYY [a las] h:mm A');
      
      let statusColor = this.secondaryColor;
      let statusText = request.status;
      
      switch (request.status) {
        case 'Aprobado':
          statusColor = '#10b981';
          statusText = '✅ Aprobado';
          break;
        case 'Rechazado':
          statusColor = '#ef4444';
          statusText = '❌ Rechazado';
          break;
        case 'Atendido':
          statusColor = '#3b82f6';
          statusText = '✅ Atendido';
          break;
      }

      const content = `
        <h2>Respuesta a su Solicitud</h2>
        <p>Estimado/a <strong>${user.display_name}</strong>,</p>
        <p>Su solicitud ha sido procesada por la administración. A continuación encontrará la respuesta:</p>
        
        <div class="info-box">
          <div class="info-row">
            <span class="info-label">Número:</span>
            <span class="info-value">#${request.id}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Tipo:</span>
            <span class="info-value">${request.request_type}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Estado:</span>
            <span class="info-value" style="color: ${statusColor}; font-weight: 600;">${statusText}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Fecha de respuesta:</span>
            <span class="info-value">${formattedDate}</span>
          </div>
        </div>

        <div class="info-box">
          <h3 style="margin-top: 0; color: ${this.primaryColor};">Respuesta de la Administración</h3>
          <p>${request.response}</p>
        </div>

        <p>Si tiene alguna pregunta adicional, no dude en contactar a la administración.</p>
        <p>Gracias por utilizar el sistema de solicitudes de ${this.siteName}.</p>
      `;

      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: user.user_email,
        subject: `Respuesta a solicitud #${request.id} - ${this.siteName}`,
        html: this.generateEmailTemplate('Respuesta a Solicitud', content)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Correo de respuesta enviado a ${user.user_email}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando correo de respuesta:', error);
      return false;
    }
  }

  /**
   * Enviar correo personalizado
   * @param {string} to - Destinatario
   * @param {string} subject - Asunto
   * @param {string} title - Título del correo
   * @param {string} content - Contenido HTML
   * @returns {Promise<boolean>} - True si se envió correctamente
   */
  async sendCustomEmail(to, subject, title, content) {
    try {
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: to,
        subject: subject,
        html: this.generateEmailTemplate(title, content)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Correo personalizado enviado a ${to}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando correo personalizado:', error);
      return false;
    }
  }
}

module.exports = EmailService;
