// Admin dashboard interactions
(function () {
	const body = document.body;
	const sidebar = document.getElementById('sidebar');
	const sidebarOverlay = document.getElementById('sidebarOverlay');
	const openSidebarBtn = document.getElementById('openSidebar');
	const themeToggle = document.getElementById('themeToggle');
	const darkModeSwitch = document.getElementById('darkModeSwitch');

	// Use same-origin API by default (works when frontend is served by backend on port 4000)
	const API = ((window && window.API_BASE) ? window.API_BASE : '/api').replace(/\/$/, '');

	const setDarkMode = (isDark) => {
		if (isDark) {
			body.classList.add('dark');
			localStorage.setItem('theme', 'dark');
			if (darkModeSwitch) darkModeSwitch.checked = true;
		} else {
			body.classList.remove('dark');
			localStorage.setItem('theme', 'light');
			if (darkModeSwitch) darkModeSwitch.checked = false;
		}
	};

	(function initTheme() {
		const saved = localStorage.getItem('theme');
		if (saved) setDarkMode(saved === 'dark');
		else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) setDarkMode(true);
	})();

	if (themeToggle) themeToggle.addEventListener('click', () => setDarkMode(!body.classList.contains('dark')));
	if (darkModeSwitch) darkModeSwitch.addEventListener('change', (e) => setDarkMode(e.target.checked));

	const openSidebar = () => { if (!sidebar || !sidebarOverlay) return; sidebar.classList.add('is-open'); sidebarOverlay.classList.add('is-open'); body.style.overflow = 'hidden'; };
	const closeSidebar = () => { if (!sidebar || !sidebarOverlay) return; sidebar.classList.remove('is-open'); sidebarOverlay.classList.remove('is-open'); body.style.overflow = ''; };
	if (openSidebarBtn) openSidebarBtn.addEventListener('click', openSidebar);
	if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
	document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSidebar(); });

	const initTabs = () => {
		const groups = document.querySelectorAll('.tab-group');
		groups.forEach(group => {
			const btns = group.querySelectorAll(':scope > .tabs > .tab-btn');
			const panels = group.querySelectorAll(':scope > .tab-panel');
			if (!btns.length || !panels.length) return;
			const activate = (tabKey) => { btns.forEach(b => b.classList.toggle('active', b.dataset.tab === tabKey)); panels.forEach(p => p.classList.toggle('hidden', p.dataset.tab !== tabKey)); };
			const activeBtn = Array.from(btns).find(b => b.classList.contains('active')) || btns[0];
			activate(activeBtn.dataset.tab);
			btns.forEach(btn => btn.addEventListener('click', () => activate(btn.dataset.tab)));
		});
	};

	const openModal = (id) => { const el = document.getElementById(id); if (el) el.classList.remove('hidden'); };
	const closeModal = (id) => { const el = document.getElementById(id); if (el) el.classList.add('hidden'); };
	document.addEventListener('click', (e) => { const closeId = e.target.getAttribute('data-close'); if (closeId) closeModal(closeId); });

	// Sharing Rates via API
	let editingRateId = null;
	async function loadRates(){
		const res = await fetch(API + '/sharing-rates');
		if (!res.ok) { alert('Failed to load rates'); return; }
		const rows = await res.json();
		const tbody = document.getElementById('ratesBody');
		if (!tbody) return;
		tbody.innerHTML = '';
		if (!rows.length){ const tr = document.createElement('tr'); tr.innerHTML = '<td colspan="3" class="py-6 text-center text-slate-500 dark:text-slate-400">No rates yet. Click Add to create one.</td>'; tbody.appendChild(tr); return; }
		rows.forEach((item) => {
			const tr = document.createElement('tr');
			tr.innerHTML = `
				<td class="py-3 pr-4">${item.title || ''}</td>
				<td class="py-3 pr-4 font-mono">${Number(item.percentage).toFixed(1)}%</td>
				<td class="py-3 pr-4">
					<div class="flex items-center gap-2">
						<button type="button" class="quick-action" data-action="edit-rate" data-id="${item.id}"><i class="fa-solid fa-pen"></i>Edit</button>
						<button type="button" class="quick-action" data-action="delete-rate" data-id="${item.id}"><i class="fa-solid fa-trash"></i>Delete</button>
					</div>
				</td>`;
			tbody.appendChild(tr);
		});
	}
	function openRateModalForAdd(){ editingRateId = null; document.getElementById('rateModalTitle').textContent = 'Add Rate'; document.getElementById('rateTitle').value = ''; document.getElementById('ratePercentage').value = ''; openModal('rateModal'); }
	async function openRateModalForEdit(id){ editingRateId = id; const res = await fetch(API + '/sharing-rates'); if (!res.ok) return alert('Failed to load rate'); const rows = await res.json(); const item = rows.find(r=>r.id===id); if (!item) return alert('Rate not found'); document.getElementById('rateModalTitle').textContent = 'Edit Rate'; document.getElementById('rateTitle').value = item.title || ''; document.getElementById('ratePercentage').value = item.percentage || ''; openModal('rateModal'); }
	async function handleRateSubmit(e){ e.preventDefault(); const title = (document.getElementById('rateTitle').value||'').trim(); const percentage = Number(document.getElementById('ratePercentage').value); if (!title) return alert('Title is required'); if (!Number.isFinite(percentage) || percentage<0 || percentage>100) return alert('Percentage must be between 0 and 100'); const payload = { title, percentage }; let resp; if (editingRateId==null){ resp = await fetch(API + '/sharing-rates', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) }); } else { resp = await fetch(API + '/sharing-rates/' + editingRateId, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) }); } if (!resp.ok) { alert('Failed to save'); return; } closeModal('rateModal'); await loadRates(); }

	// Chairmen via API
	let editingChairmanId = null;
	async function loadChairmen(){
		const res = await fetch(API + '/chairmen');
		if (!res.ok) { alert('Failed to load chairmen'); return; }
		const rows = await res.json();
		const grid = document.getElementById('chairmenGrid');
		if (!grid) return;
		grid.innerHTML = '';
		if (!rows.length){ const empty = document.createElement('div'); empty.className='rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-8 text-center text-slate-500 dark:text-slate-400'; empty.textContent='No chairmen yet. Click Add to create one.'; grid.appendChild(empty); return; }
		rows.forEach((item) => {
			const card = document.createElement('div');
			card.className = 'rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 shadow-sm overflow-hidden';
			card.innerHTML = `
				<div class="aspect-video bg-slate-100 dark:bg-slate-900/40">${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name||''}" class="w-full h-full object-cover">` : ''}</div>
				<div class="p-4 space-y-2">
					<div class="text-base font-semibold">${item.name || ''}</div>
					<div class="text-sm text-slate-500 dark:text-slate-400">${item.subtitle || ''}</div>
					<p class="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">${item.description || ''}</p>
					<div class="pt-2 flex items-center gap-2">
						<button type="button" class="quick-action" data-action="edit-chairman" data-id="${item.id}"><i class="fa-solid fa-pen"></i>Edit</button>
						<button type="button" class="quick-action" data-action="delete-chairman" data-id="${item.id}"><i class="fa-solid fa-trash"></i>Delete</button>
					</div>
				</div>`;
			grid.appendChild(card);
		});
	}
	function openChairmanModalForAdd(){ editingChairmanId = null; document.getElementById('chairmanModalTitle').textContent='Add Chairman'; document.getElementById('chairmanImage').value=''; document.getElementById('chairmanImageUrl').value=''; document.getElementById('chairmanPreview').classList.add('hidden'); document.getElementById('chairmanName').value=''; document.getElementById('chairmanSubtitle').value=''; document.getElementById('chairmanDescription').value=''; const f=document.getElementById('chairmanFeatured'); if (f) f.checked=false; openModal('chairmanModal'); }
	async function openChairmanModalForEdit(id){ editingChairmanId = id; const res = await fetch(API + '/chairmen'); if (!res.ok) return alert('Failed to load'); const rows = await res.json(); const item = rows.find(r=>r.id===id); if(!item) return alert('Chairman not found'); document.getElementById('chairmanModalTitle').textContent='Edit Chairman'; document.getElementById('chairmanImage').value=''; document.getElementById('chairmanImageUrl').value=''; const prev=document.getElementById('chairmanPreview'); prev.src=item.imageUrl||''; prev.classList.toggle('hidden',!item.imageUrl); document.getElementById('chairmanName').value=item.name||''; document.getElementById('chairmanSubtitle').value=item.subtitle||''; document.getElementById('chairmanDescription').value=item.description||''; const f=document.getElementById('chairmanFeatured'); if (f) f.checked = !!item.isFeatured; openModal('chairmanModal'); }

	async function handleChairmanSubmit(e){
		e.preventDefault();
		const name=(document.getElementById('chairmanName').value||'').trim();
		const subtitle=(document.getElementById('chairmanSubtitle').value||'').trim();
		const description=(document.getElementById('chairmanDescription').value||'').trim();
		const isFeatured = !!(document.getElementById('chairmanFeatured') && document.getElementById('chairmanFeatured').checked);
		if(!name) return alert('Name is required');
		const fileEl=document.getElementById('chairmanImage');
		const urlEl=document.getElementById('chairmanImageUrl');
		const form = new FormData();
		form.append('name', name);
		form.append('subtitle', subtitle);
		form.append('description', description);
		form.append('isFeatured', isFeatured ? '1' : '0');
		if (fileEl && fileEl.files && fileEl.files[0]) {
			form.append('imageFile', fileEl.files[0]);
		} else if (urlEl && urlEl.value) {
			form.append('imageUrl', urlEl.value);
		}
		let resp;
		if (editingChairmanId==null){
			resp = await fetch(API + '/chairmen', { method:'POST', body: form });
		} else {
			resp = await fetch(API + '/chairmen/' + editingChairmanId, { method:'PUT', body: form });
		}
		if (!resp.ok) { alert('Failed to save'); return; }
		closeModal('chairmanModal'); await loadChairmen();
	}

	const imageInput = document.getElementById('chairmanImage');
	const imageUrlInput = document.getElementById('chairmanImageUrl');
	const imagePreview = document.getElementById('chairmanPreview');
	if (imageInput) imageInput.addEventListener('change', async () => { if (imageInput.files && imageInput.files[0]) { try { const url = URL.createObjectURL(imageInput.files[0]); imagePreview.src = url; imagePreview.classList.remove('hidden'); } catch {} } });
	if (imageUrlInput) imageUrlInput.addEventListener('input', () => { if (imageUrlInput.value) { imagePreview.src = imageUrlInput.value; imagePreview.classList.remove('hidden'); } });

	const addRateBtn = document.getElementById('addRateBtn'); if (addRateBtn) addRateBtn.addEventListener('click', openRateModalForAdd);
	const rateForm = document.getElementById('rateForm'); if (rateForm) rateForm.addEventListener('submit', handleRateSubmit);
	const addChairmanBtn = document.getElementById('addChairmanBtn'); if (addChairmanBtn) addChairmanBtn.addEventListener('click', openChairmanModalForAdd);
	const chairmanForm = document.getElementById('chairmanForm'); if (chairmanForm) chairmanForm.addEventListener('submit', handleChairmanSubmit);

	// More robust delegation on the grid container
	const grid = document.getElementById('chairmenGrid');
	if (grid) {
		grid.addEventListener('click', async (e) => {
			const btn = e.target.closest('[data-action]');
			if (!btn) return;
			e.preventDefault();
			const action = btn.getAttribute('data-action');
			const idAttr = btn.getAttribute('data-id');
			const id = idAttr ? Number(idAttr) : null;
			if (action === 'edit-chairman' && id != null) {
				openChairmanModalForEdit(id);
			} else if (action === 'delete-chairman' && id != null) {
				if (confirm('Delete this chairman?')) {
					const resp = await fetch(API + '/chairmen/' + id, { method:'DELETE' });
					if (!resp.ok) { alert('Failed to delete'); return; }
					await loadChairmen();
				}
			}
		});
	}

	// Delegation for Sharing Rates actions
	const ratesBodyEl = document.getElementById('ratesBody');
	if (ratesBodyEl) {
		ratesBodyEl.addEventListener('click', async (e) => {
			const btn = e.target.closest('[data-action]');
			if (!btn) return;
			e.preventDefault();
			const action = btn.getAttribute('data-action');
			const idAttr = btn.getAttribute('data-id');
			const id = idAttr ? Number(idAttr) : null;
			if (action === 'edit-rate' && id != null) {
				openRateModalForEdit(id);
			} else if (action === 'delete-rate' && id != null) {
				if (confirm('Delete this rate?')) {
					const resp = await fetch(API + '/sharing-rates/' + id, { method:'DELETE' });
					if (!resp.ok) { alert('Failed to delete'); return; }
					await loadRates();
				}
			}
		});
	}

	async function init(){
		initTabs();
		await Promise.all([loadRates(), loadChairmen()]);
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();


