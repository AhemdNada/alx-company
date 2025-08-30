// Contacts management for admin dashboard
(function () {
  const API = ((window && window.API_BASE) ? window.API_BASE : '/api').replace(/\/$/, '');
  let currentContactId = null;

  // Load contact statistics
  async function loadContactStats() {
    try {
      const res = await fetch(API + '/admin/contact-stats');
      if (!res.ok) throw new Error('Failed to load stats');
      const stats = await res.json();
      
      // Update the stats display
      document.getElementById('totalContacts').textContent = stats.total || 0;
      document.getElementById('unrepliedContacts').textContent = stats.unreplied || 0;
      document.getElementById('todayContacts').textContent = stats.today || 0;
    } catch (error) {
      console.error('Failed to load contact stats:', error);
      // Set default values on error
      document.getElementById('totalContacts').textContent = '0';
      document.getElementById('unrepliedContacts').textContent = '0';
      document.getElementById('todayContacts').textContent = '0';
    }
  }

  // Render contacts table
  function renderContactsRows(contacts) {
    const tbody = document.getElementById('contactsBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    if (!contacts || !contacts.length) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="5" class="py-6 text-center text-slate-500 dark:text-slate-400">No contact messages found.</td>';
      tbody.appendChild(tr);
      return;
    }

    contacts.forEach((contact) => {
      const tr = document.createElement('tr');
      const date = new Date(contact.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      tr.innerHTML = `
        <td class="py-3 pr-4">
          <div>
            <div class="font-medium">${contact.name}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400">${contact.email}</div>
          </div>
        </td>
        <td class="py-3 pr-4">
          <div class="max-w-xs truncate" title="${contact.subject}">${contact.subject}</div>
        </td>
        <td class="py-3 pr-4 text-sm text-slate-500 dark:text-slate-400">${date}</td>
        <td class="py-3 pr-4">
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            contact.is_replied 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
          }">
            ${contact.is_replied ? 'Replied' : 'Unreplied'}
          </span>
        </td>
        <td class="py-3 pr-4">
          <div class="flex items-center gap-2">
            <button type="button" class="quick-action" data-action="view-contact" data-id="${contact.id}">
              <i class="fa-solid fa-eye"></i>View
            </button>
            <button type="button" class="quick-action" data-action="toggle-replied" data-id="${contact.id}" data-replied="${contact.is_replied}">
              <i class="fa-solid fa-${contact.is_replied ? 'undo' : 'check'}"></i>${contact.is_replied ? 'Mark Unreplied' : 'Mark Replied'}
            </button>
            <button type="button" class="quick-action" data-action="delete-contact" data-id="${contact.id}">
              <i class="fa-solid fa-trash"></i>Delete
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Load contacts with filters
  async function loadContacts() {
    try {
      const search = document.getElementById('contactSearch')?.value || '';
      const filter = document.getElementById('contactFilter')?.value || '';
      
      let url = API + '/contact/admin/contacts?limit=50';
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (filter) url += `&is_replied=${filter}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load contacts');
      const result = await res.json();
      
      if (result.success) {
        renderContactsRows(result.data);
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  }

  // View contact details
  async function viewContact(id) {
    try {
      const res = await fetch(API + '/contact/admin/contacts/' + id);
      if (!res.ok) throw new Error('Failed to load contact');
      const result = await res.json();
      
      if (result.success) {
        const contact = result.data;
        currentContactId = contact.id;
        
        const content = document.getElementById('contactModalContent');
        const date = new Date(contact.created_at).toLocaleString('en-US');
        
        content.innerHTML = `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
              <div class="text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">${contact.name}</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <div class="text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">${contact.email}</div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
            <div class="text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">${contact.subject}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
            <div class="text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded-lg whitespace-pre-wrap">${contact.message}</div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
              <div class="text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">${date}</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <div class="text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  contact.is_replied 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                }">
                  ${contact.is_replied ? 'Replied' : 'Unreplied'}
                </span>
              </div>
            </div>
          </div>
        `;

        const toggleBtn = document.getElementById('toggleRepliedBtn');
        toggleBtn.textContent = contact.is_replied ? 'Mark as Unreplied' : 'Mark as Replied';
        toggleBtn.onclick = () => toggleRepliedStatus(contact.id, !contact.is_replied);

        // Open modal
        document.getElementById('contactModal').classList.remove('hidden');
      }
    } catch (error) {
      console.error('Failed to view contact:', error);
      alert('Failed to load contact details');
    }
  }

  // Toggle replied status
  async function toggleRepliedStatus(id, isReplied) {
    try {
      const res = await fetch(API + '/contact/admin/contacts/' + id + '/replied', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_replied: isReplied })
      });
      
      if (!res.ok) throw new Error('Failed to update status');
      const result = await res.json();
      
      if (result.success) {
        await loadContacts();
        await loadContactStats();
        if (currentContactId === id) {
          document.getElementById('contactModal').classList.add('hidden');
        }
      }
    } catch (error) {
      console.error('Failed to toggle replied status:', error);
      alert('Failed to update status');
    }
  }

  // Delete contact
  async function deleteContact(id) {
    if (!confirm('Are you sure you want to delete this contact message?')) return;
    
    try {
      const res = await fetch(API + '/contact/admin/contacts/' + id, {
        method: 'DELETE'
      });
      
      if (!res.ok) throw new Error('Failed to delete contact');
      const result = await res.json();
      
      if (result.success) {
        await loadContacts();
        await loadContactStats();
        if (currentContactId === id) {
          document.getElementById('contactModal').classList.add('hidden');
        }
      }
    } catch (error) {
      console.error('Failed to delete contact:', error);
      alert('Failed to delete contact');
    }
  }

  // Event listeners
  function initContactsEvents() {
    // Search and filter
    const searchInput = document.getElementById('contactSearch');
    const filterSelect = document.getElementById('contactFilter');
    
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(loadContacts, 300);
      });
    }
    
    if (filterSelect) {
      filterSelect.addEventListener('change', loadContacts);
    }

    // Contact actions delegation
    const contactsBody = document.getElementById('contactsBody');
    if (contactsBody) {
      contactsBody.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        
        const action = btn.getAttribute('data-action');
        const id = Number(btn.getAttribute('data-id'));
        
        if (action === 'view-contact') {
          viewContact(id);
        } else if (action === 'toggle-replied') {
          const isReplied = btn.getAttribute('data-replied') === 'true';
          toggleRepliedStatus(id, !isReplied);
        } else if (action === 'delete-contact') {
          deleteContact(id);
        }
      });
    }
  }

  // Initialize contacts functionality
  async function initContacts() {
    initContactsEvents();
    await Promise.all([loadContacts(), loadContactStats()]);
  }

  // Export for use in main admin.js
  window.initContacts = initContacts;
})();
