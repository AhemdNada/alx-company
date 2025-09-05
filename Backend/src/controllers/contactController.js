const contactModel = require('../models/contactModel');
const mailService = require('../services/mailService');
const logger = require('../services/logger');

class ContactController {
  async submitContact(req, res) {
    try {
      const { name, email, subject, message } = req.body;

      
      const contact = await contactModel.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim()
      });

      
      mailService.sendContactNotification(contact).catch(error => {
        logger.error('Failed to send contact notification email:', error);
      });

      logger.info('Contact form submitted successfully', { 
        contactId: contact.id,
        email: contact.email,
        ip: req.ip 
      });

      res.status(201).json({
        success: true,
        message: 'Your message has been sent successfully!',
        data: {
          id: contact.id,
          submittedAt: contact.created_at
        }
      });
    } catch (error) {
      logger.error('Failed to submit contact form:', error);
      res.status(500).json({
        success: false,
        message: 'Something went wrong. Please try again later.'
      });
    }
  }

  async getContacts(req, res) {
    try {
      const { search, is_replied, limit = 50, offset = 0 } = req.query;
      
      const options = {
        search: search || null,
        is_replied: is_replied !== undefined ? is_replied === 'true' : undefined,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const contacts = await contactModel.findAll(options);
      
      res.json({
        success: true,
        data: contacts
      });
    } catch (error) {
      logger.error('Failed to fetch contacts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch contacts'
      });
    }
  }

  async getContactById(req, res) {
    try {
      const { id } = req.params;
      const contact = await contactModel.findById(parseInt(id));
      
      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }

      res.json({
        success: true,
        data: contact
      });
    } catch (error) {
      logger.error('Failed to fetch contact by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch contact'
      });
    }
  }

  async updateRepliedStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_replied } = req.body;

      if (typeof is_replied !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'is_replied must be a boolean value'
        });
      }

      await contactModel.updateRepliedStatus(parseInt(id), is_replied);

      res.json({
        success: true,
        message: `Contact marked as ${is_replied ? 'replied' : 'unreplied'}`
      });
    } catch (error) {
      logger.error('Failed to update contact replied status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update contact status'
      });
    }
  }

  async deleteContact(req, res) {
    try {
      const { id } = req.params;
      await contactModel.delete(parseInt(id));

      res.json({
        success: true,
        message: 'Contact deleted successfully'
      });
    } catch (error) {
      logger.error('Failed to delete contact:', error);
      
      if (error.message === 'Contact not found') {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete contact'
      });
    }
  }

  async getContactStats(req, res) {
    try {
      const stats = await contactModel.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Failed to get contact stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get contact statistics'
      });
    }
  }
}

module.exports = new ContactController();
