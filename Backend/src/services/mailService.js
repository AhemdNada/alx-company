const nodemailer = require('nodemailer');
const logger = require('./logger');

class MailService {
  constructor() {
    this.transporter = null;
    this.companyEmail = process.env.COMPANY_EMAIL || 'info@alx-pc.com';
    this.init();
  }

  async init() {
    try {
      
      if (process.env.SENDGRID_API_KEY) {
        this.transporter = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false,
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
          }
        });
        logger.info('Mail service initialized with SendGrid');
      } 
      
      else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
        logger.info('Mail service initialized with Gmail');
      } 
      else {
        logger.warn('No email configuration found. Contact notifications will not be sent.');
        this.transporter = null;
      }
    } catch (error) {
      logger.error('Failed to initialize mail service:', error);
      this.transporter = null;
    }
  }
  
  async sendContactNotification(contactData) {
    if (!this.transporter) {
      logger.warn('Mail service not configured. Skipping email notification.');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@alx-pc.com',
        to: this.companyEmail,
        subject: `New Contact Form Message: ${contactData.subject}`,
        html: this.generateContactEmailHTML(contactData),
        text: this.generateContactEmailText(contactData)
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Contact notification email sent successfully', { 
        messageId: info.messageId,
        contactId: contactData.id 
      });
      return true;
    } catch (error) {
      logger.error('Failed to send contact notification email:', error);
      return false;
    }
  }

  generateContactEmailHTML(contactData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Contact Form Message</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8fafc; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #374151; }
          .value { background: white; padding: 10px; border-radius: 5px; border-left: 4px solid #2563eb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Form Message</h1>
            <p>You have received a new message from your website contact form.</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">From:</div>
              <div class="value">${this.escapeHtml(contactData.name)} (${this.escapeHtml(contactData.email)})</div>
            </div>
            <div class="field">
              <div class="label">Subject:</div>
              <div class="value">${this.escapeHtml(contactData.subject)}</div>
            </div>
            <div class="field">
              <div class="label">Message:</div>
              <div class="value">${this.escapeHtml(contactData.message).replace(/\n/g, '<br>')}</div>
            </div>
            <div class="field">
              <div class="label">Received:</div>
              <div class="value">${new Date(contactData.created_at).toLocaleString()}</div>
            </div>
          </div>
          <div class="footer">
            <p>This message was sent from the Alexandria Petroleum Company contact form.</p>
            <p>Message ID: ${contactData.id}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateContactEmailText(contactData) {
    return `
New Contact Form Message

You have received a new message from your website contact form.

From: ${contactData.name} (${contactData.email})
Subject: ${contactData.subject}
Received: ${new Date(contactData.created_at).toLocaleString()}

Message:
${contactData.message}

---
This message was sent from the Alexandria Petroleum Company contact form.
Message ID: ${contactData.id}
    `;
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}

module.exports = new MailService();
