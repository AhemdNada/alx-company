const { getPool } = require('../db');
const logger = require('../services/logger');

class ContactModel {
  async create(contactData) {
    const pool = await getPool();
    try {
      const [result] = await pool.query(
        'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
        [contactData.name, contactData.email, contactData.subject, contactData.message]
      );
      
      const contact = {
        id: result.insertId,
        ...contactData,
        is_replied: false,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      logger.info('Contact created successfully', { contactId: contact.id });
      return contact;
    } catch (error) {
      logger.error('Failed to create contact:', error);
      throw error;
    }
  }

  async findAll(options = {}) {
    const pool = await getPool();
    try {
      let query = `
        SELECT id, name, email, subject, message, is_replied, created_at, updated_at 
        FROM contacts 
        WHERE 1=1
      `;
      const params = [];

      // Add search filter
      if (options.search) {
        query += ` AND (name LIKE ? OR email LIKE ? OR subject LIKE ?)`;
        const searchTerm = `%${options.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Add replied filter
      if (options.is_replied !== undefined) {
        query += ` AND is_replied = ?`;
        params.push(options.is_replied ? 1 : 0);
      }

      // Add sorting
      query += ` ORDER BY created_at DESC`;

      // Add pagination
      if (options.limit) {
        query += ` LIMIT ?`;
        params.push(parseInt(options.limit));
        
        if (options.offset) {
          query += ` OFFSET ?`;
          params.push(parseInt(options.offset));
        }
      }

      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      logger.error('Failed to fetch contacts:', error);
      throw error;
    }
  }

  async findById(id) {
    const pool = await getPool();
    try {
      const [[contact]] = await pool.query(
        'SELECT id, name, email, subject, message, is_replied, created_at, updated_at FROM contacts WHERE id = ?',
        [id]
      );
      return contact;
    } catch (error) {
      logger.error('Failed to fetch contact by ID:', error);
      throw error;
    }
  }

  async updateRepliedStatus(id, isReplied) {
    const pool = await getPool();
    try {
      await pool.query(
        'UPDATE contacts SET is_replied = ? WHERE id = ?',
        [isReplied ? 1 : 0, id]
      );
      
      logger.info('Contact replied status updated', { contactId: id, isReplied });
      return true;
    } catch (error) {
      logger.error('Failed to update contact replied status:', error);
      throw error;
    }
  }

  async delete(id) {
    const pool = await getPool();
    try {
      const [result] = await pool.query('DELETE FROM contacts WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Contact not found');
      }
      
      logger.info('Contact deleted successfully', { contactId: id });
      return true;
    } catch (error) {
      logger.error('Failed to delete contact:', error);
      throw error;
    }
  }

  async getStats() {
    const pool = await getPool();
    try {
      // Optimized single query for all statistics
      const [[stats]] = await pool.query(`
        SELECT 
          COUNT(*) AS total,
          SUM(CASE WHEN is_replied = 0 THEN 1 ELSE 0 END) AS unreplied,
          SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) AS today
        FROM contacts
      `);
      
      return {
        total: stats.total,
        unreplied: stats.unreplied,
        today: stats.today
      };
    } catch (error) {
      logger.error('Failed to get contact stats:', error);
      throw error;
    }
  }
}

module.exports = new ContactModel();
