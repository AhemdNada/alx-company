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
	document.addEventListener('click', (e) => {
		const closer = e.target.closest('[data-close]');
		if (!closer) return;
		const closeId = closer.getAttribute('data-close');
		if (closeId) closeModal(closeId);
	});

	// ------------ News (CRUD) ------------
	let editingNewsId = null;
	let pendingNewsFiles = [];
	function renderNewsRows(rows){
		const tbody = document.getElementById('newsBody');
		if (!tbody) return;
		tbody.innerHTML = '';
		if (!rows || !rows.length){
			const tr = document.createElement('tr');
			tr.innerHTML = '<td colspan="5" class="py-6 text-center text-slate-500 dark:text-slate-400">No news yet. Click Add to create one.</td>';
			tbody.appendChild(tr);
			return;
		}
		rows.forEach((item) => {
			const tr = document.createElement('tr');
			tr.innerHTML = `
				<td class="py-3 pr-4">${item.title || ''}</td>
				<td class="py-3 pr-4">${item.subtitle || ''}</td>
				<td class="py-3 pr-4">${item.imageOrientation || ''}</td>
				<td class="py-3 pr-4">${item.coverImage ? '<img src="'+item.coverImage+'" class="h-10 w-16 object-cover rounded" />' : '-'}</td>
				<td class="py-3 pr-4">
					<div class="flex items-center gap-2">
						<button type="button" class="quick-action" data-action="edit-news" data-id="${item.id}"><i class="fa-solid fa-pen"></i>Edit</button>
						<button type="button" class="quick-action" data-action="delete-news" data-id="${item.id}"><i class="fa-solid fa-trash"></i>Delete</button>
						<a class="quick-action" href="/news-details.html?id=${item.id}" target="_blank"><i class="fa-solid fa-up-right-from-square"></i>View</a>
					</div>
				</td>`;
			tbody.appendChild(tr);
		});
	}

	async function loadNews(){
		const res = await fetch(API + '/news');
		if (!res.ok){ alert('Failed to load news'); return; }
		const rows = await res.json();
		renderNewsRows(rows);
	}

	// ------------ News Ticker (CRUD) ------------
	function renderTickerRows(rows){
		const tbody = document.getElementById('tickerBody');
		if (!tbody) return;
		tbody.innerHTML = '';
		if (!rows || !rows.length){
			const tr = document.createElement('tr');
			tr.innerHTML = '<td colspan="2" class="py-6 text-center text-slate-500 dark:text-slate-400">No messages yet.</td>';
			tbody.appendChild(tr);
			return;
		}
		rows.forEach((item) => {
			const tr = document.createElement('tr');
			tr.innerHTML = `
				<td class="py-3 pr-4">
					<input data-id="${item.id}" class="ticker-input w-full rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-blue-400 focus:ring-2 focus:ring-blue-200/60 dark:focus:ring-blue-500/30 px-3 py-2 text-sm outline-none" value="${(item.message||'').replace(/"/g,'&quot;')}">
				</td>
				<td class="py-3 pr-4">
					<div class="flex items-center gap-2">
						<button type="button" class="quick-action" data-action="save-ticker" data-id="${item.id}"><i class="fa-solid fa-floppy-disk"></i>Save</button>
						<button type="button" class="quick-action" data-action="delete-ticker" data-id="${item.id}"><i class="fa-solid fa-trash"></i>Delete</button>
					</div>
				</td>`;
			tbody.appendChild(tr);
		});
	}

	async function loadTicker(){
		try {
			const res = await fetch(API + '/news/ticker');
			if (!res.ok) throw new Error('Failed to load');
			const rows = await res.json();
			renderTickerRows(rows);
		} catch (e) {
			console.error(e);
		}
	}

	async function createTickerMessage(message){
		const resp = await fetch(API + '/news/ticker', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message }) });
		if (!resp.ok) throw new Error('Failed to create');
		return resp.json();
	}

	async function updateTickerMessage(id, message){
		const resp = await fetch(API + '/news/ticker/' + id, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message }) });
		if (!resp.ok) throw new Error('Failed to update');
		return resp.json();
	}

	async function deleteTickerMessage(id){
		const resp = await fetch(API + '/news/ticker/' + id, { method:'DELETE' });
		if (!resp.ok) throw new Error('Failed to delete');
	}

	function clearNewsModal(){
		editingNewsId = null;
		pendingNewsFiles = [];
		document.getElementById('newsModalTitle').textContent = 'Add News';
		document.getElementById('newsId').value = '';
		document.getElementById('newsTitle').value = '';
		document.getElementById('newsSubtitle').value = '';
		document.getElementById('newsOrientation').value = 'horizontal';
		document.getElementById('newsImagesFiles').value = '';
		const preview = document.getElementById('newsImagesPreview'); if (preview) preview.innerHTML = '';
		const urlsWrap = document.getElementById('newsImageUrls');
		urlsWrap.innerHTML = '<input type="url" class="w-full rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-blue-400 focus:ring-2 focus:ring-blue-200/60 dark:focus:ring-blue-500/30 px-4 py-2 text-sm outline-none" placeholder="https://...">';
		const blocks = document.getElementById('newsDescriptionBlocks');
		blocks.innerHTML = '';
		document.getElementById('existingImagesWrap').classList.add('hidden');
		document.getElementById('existingImagesList').innerHTML='';
	}

	function createParagraphBlock(text){
		const div = document.createElement('div');
		div.className = 'rounded-xl border border-slate-200/70 dark:border-slate-700/60 p-3';
		div.setAttribute('data-type', 'paragraph');
		div.innerHTML = `
			<div class="flex items-center justify-between mb-2">
				<div class="text-xs uppercase tracking-wide text-slate-500">Paragraph</div>
				<button type="button" class="chip" data-action="remove-block"><i class="fa-solid fa-xmark"></i><span>Remove</span></button>
			</div>
			<textarea class="w-full rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-blue-400 focus:ring-2 focus:ring-blue-200/60 dark:focus:ring-blue-500/30 px-3 py-2 text-sm outline-none" rows="4" placeholder="Write paragraph..."></textarea>
		`;
		div.querySelector('textarea').value = text || '';
		return div;
	}

	function createListBlock(items){
		const div = document.createElement('div');
		div.className = 'rounded-xl border border-slate-200/70 dark:border-slate-700/60 p-3';
		div.setAttribute('data-type', 'list');
		div.innerHTML = `
			<div class="flex items-center justify-between mb-2">
				<div class="text-xs uppercase tracking-wide text-slate-500">List</div>
				<div class="flex gap-2">
					<button type="button" class="chip" data-action="add-list-item"><i class="fa-solid fa-plus"></i><span>Add Item</span></button>
					<button type="button" class="chip" data-action="remove-block"><i class="fa-solid fa-xmark"></i><span>Remove</span></button>
				</div>
			</div>
			<div class="space-y-2" data-role="list-items"></div>
		`;
		const listWrap = div.querySelector('[data-role="list-items"]');
		function addItem(val){
			const row = document.createElement('div');
			row.className = 'flex gap-2';
			row.innerHTML = `
				<input type="text" class="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-blue-400 focus:ring-2 focus:ring-blue-200/60 dark:focus:ring-blue-500/30 px-3 py-2 text-sm outline-none" placeholder="List item">
				<button type="button" class="chip" data-action="remove-list-item"><i class="fa-solid fa-trash"></i></button>
			`;
			row.querySelector('input').value = val || '';
			listWrap.appendChild(row);
		}
		(items && items.length ? items : ['']).forEach(addItem);
		return div;
	}

	function openNewsModalForAdd(){
		clearNewsModal();
		openModal('newsModal');
	}

	async function openNewsModalForEdit(id){
		clearNewsModal();
		editingNewsId = id;
		document.getElementById('newsModalTitle').textContent = 'Edit News';
		const res = await fetch(API + '/news/' + id);
		if (!res.ok){ alert('Failed to load'); return; }
		const item = await res.json();
		document.getElementById('newsId').value = item.id;
		document.getElementById('newsTitle').value = item.title || '';
		document.getElementById('newsSubtitle').value = item.subtitle || '';
		document.getElementById('newsOrientation').value = item.imageOrientation || 'horizontal';
		// description blocks
		const blocks = document.getElementById('newsDescriptionBlocks');
		(blocks.innerHTML = '');
		if (Array.isArray(item.description)){
			item.description.forEach((b) => {
				if (b && b.type === 'paragraph') blocks.appendChild(createParagraphBlock(b.text || ''));
				else if (b && b.type === 'list') blocks.appendChild(createListBlock(Array.isArray(b.items) ? b.items : []));
			});
		}
		// existing images
		const existingWrap = document.getElementById('existingImagesWrap');
		const existingList = document.getElementById('existingImagesList');
		if (item.images && item.images.length){
			existingWrap.classList.remove('hidden');
			existingList.innerHTML = '';
			item.images.forEach((img) => {
				const c = document.createElement('label');
				c.className = 'block rounded-xl border border-slate-200/70 dark:border-slate-700/60 overflow-hidden';
				c.innerHTML = `
					<img src="${img.imageUrl}" class="w-full aspect-video object-cover">
					<div class="flex items-center gap-2 p-2 text-sm">
						<input type="checkbox" class="h-4 w-4" data-role="keep-image" checked>
						<span class="truncate" title="${img.imageUrl}">Keep</span>
						<input type="hidden" data-role="image-url" value="${img.imageUrl}">
					</div>`;
				existingList.appendChild(c);
			});
		}
		openModal('newsModal');
	}

	function serializeDescription(){
		const out = [];
		const blocks = Array.from(document.querySelectorAll('#newsDescriptionBlocks > div[data-type]'));
		blocks.forEach((b) => {
			const type = b.getAttribute('data-type');
			if (type === 'paragraph'){
				const text = (b.querySelector('textarea')?.value || '').trim();
				if (text) out.push({ type: 'paragraph', text });
			} else if (type === 'list'){
				const items = Array.from(b.querySelectorAll('[data-role="list-items"] input')).map(i => i.value.trim()).filter(Boolean);
				if (items.length) out.push({ type: 'list', items });
			}
		});
		return out;
	}

	async function handleNewsSubmit(e){
		e.preventDefault();
		const title = (document.getElementById('newsTitle').value || '').trim();
		if (!title) return alert('Title is required');
		const subtitle = (document.getElementById('newsSubtitle').value || '').trim();
		const orientation = document.getElementById('newsOrientation').value === 'vertical' ? 'vertical' : 'horizontal';
		const desc = serializeDescription();
		const form = new FormData();
		form.append('title', title);
		form.append('subtitle', subtitle);
		form.append('imageOrientation', orientation);
		form.append('descriptionJson', JSON.stringify(desc));
		const fileEl = document.getElementById('newsImagesFiles');
		const filesToSend = pendingNewsFiles.length ? pendingNewsFiles : Array.from((fileEl && fileEl.files) ? fileEl.files : []);
		if (filesToSend.length){ for (const f of filesToSend) form.append('imageFiles', f); }
		// urls
		Array.from(document.querySelectorAll('#newsImageUrls input[type="url"]')).forEach(u => { const v = (u.value||'').trim(); if (v) form.append('imageUrls[]', v); });
		// existing keep (for edit)
		if (editingNewsId != null){
			const keep = [];
			Array.from(document.querySelectorAll('#existingImagesList [data-role="keep-image"]')).forEach(chk => {
				if (chk.checked){
					const url = chk.parentElement?.querySelector('[data-role="image-url"]').value || '';
					if (url) keep.push(url);
				}
			});
			form.append('existingImageUrlsJson', JSON.stringify(keep));
		}
		let resp;
		if (editingNewsId == null){
			resp = await fetch(API + '/news', { method: 'POST', body: form });
		} else {
			resp = await fetch(API + '/news/' + editingNewsId, { method: 'PUT', body: form });
		}
		if (!resp.ok){ alert('Failed to save'); return; }
		closeModal('newsModal');
		await loadNews();
	}

	// Events for dynamic blocks (delegation)
	document.addEventListener('click', (e) => {
		const btn = e.target.closest('[data-action]');
		if (!btn) return;
		const action = btn.getAttribute('data-action');
		if (action === 'remove-block'){
			const block = btn.closest('div[data-type]');
			block && block.remove();
		} else if (action === 'add-list-item'){
			const block = btn.closest('div[data-type="list"]');
			const listWrap = block && block.querySelector('[data-role="list-items"]');
			if (listWrap){
				const row = document.createElement('div');
				row.className = 'flex gap-2';
				row.innerHTML = `<input type="text" class="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-blue-400 focus:ring-2 focus:ring-blue-200/60 dark:focus:ring-blue-500/30 px-3 py-2 text-sm outline-none" placeholder="List item"><button type=\"button\" class=\"chip\" data-action=\"remove-list-item\"><i class=\"fa-solid fa-trash\"></i></button>`;
				listWrap.appendChild(row);
			}
		} else if (action === 'remove-list-item'){
			const row = btn.closest('.flex.gap-2');
			row && row.remove();
		}
	});

	// Wire up buttons
	const addNewsBtn = document.getElementById('addNewsBtn'); if (addNewsBtn) addNewsBtn.addEventListener('click', openNewsModalForAdd);
	const addParaBlockBtn = document.getElementById('addParaBlockBtn'); if (addParaBlockBtn) addParaBlockBtn.addEventListener('click', () => { document.getElementById('newsDescriptionBlocks').appendChild(createParagraphBlock('')); });
	const addListBlockBtn = document.getElementById('addListBlockBtn'); if (addListBlockBtn) addListBlockBtn.addEventListener('click', () => { document.getElementById('newsDescriptionBlocks').appendChild(createListBlock([''])); });
	const addNewsImageUrlBtn = document.getElementById('addNewsImageUrlBtn'); if (addNewsImageUrlBtn) addNewsImageUrlBtn.addEventListener('click', () => { const wrap = document.getElementById('newsImageUrls'); const input = document.createElement('input'); input.type='url'; input.placeholder='https://...'; input.className='w-full rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-blue-400 focus:ring-2 focus:ring-blue-200/60 dark:focus:ring-blue-500/30 px-4 py-2 text-sm outline-none'; wrap.appendChild(input); });
	const newsForm = document.getElementById('newsForm'); if (newsForm) newsForm.addEventListener('submit', handleNewsSubmit);

	// Ticker events
	const tickerCreateForm = document.getElementById('tickerCreateForm');
	if (tickerCreateForm){
		tickerCreateForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const input = document.getElementById('tickerMessageInput');
			const msg = (input.value || '').trim();
			if (!msg) return;
			try { await createTickerMessage(msg); input.value = ''; await loadTicker(); } catch { alert('Failed to add'); }
		});
	}

	const tickerBody = document.getElementById('tickerBody');
	if (tickerBody){
		tickerBody.addEventListener('click', async (e) => {
			const btn = e.target.closest('[data-action]');
			if (!btn) return;
			const id = Number(btn.getAttribute('data-id'));
			const action = btn.getAttribute('data-action');
			if (action === 'save-ticker'){
				const input = tickerBody.querySelector(`input.ticker-input[data-id="${id}"]`);
				if (!input) return;
				const val = (input.value || '').trim();
				if (!val) return alert('Message is required');
				try { await updateTickerMessage(id, val); await loadTicker(); } catch { alert('Failed to save'); }
			} else if (action === 'delete-ticker'){
				if (!confirm('Delete this message?')) return;
				try { await deleteTickerMessage(id); await loadTicker(); } catch { alert('Failed to delete'); }
			}
		});
	}

	// Quick thumbnails preview for multiple selection
	const newsImagesFiles = document.getElementById('newsImagesFiles');
	function filesAreSame(a, b){ return a.name === b.name && a.size === b.size && a.type === b.type && a.lastModified === b.lastModified; }
	function refreshNewsFilesPreview(){
		const preview = document.getElementById('newsImagesPreview');
		if (!preview) return;
		preview.innerHTML = '';
		pendingNewsFiles.forEach((f, idx) => {
			try {
				const url = URL.createObjectURL(f);
				const wrap = document.createElement('div');
				wrap.className = 'relative group';
				wrap.innerHTML = `<img src="${url}" alt="${f.name}" class="w-full aspect-video object-cover rounded"><button type="button" class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition bg-white/90 text-red-600 border border-red-200 rounded-md px-2 py-1 text-xs" data-action="remove-pending-file" data-index="${idx}"><i class="fa-solid fa-xmark"></i></button>`;
				preview.appendChild(wrap);
			} catch {}
		});
	}
	if (newsImagesFiles){
		newsImagesFiles.addEventListener('change', () => {
			const newly = Array.from(newsImagesFiles.files || []);
			newly.forEach(f => {
				if (!pendingNewsFiles.some(e => filesAreSame(e, f))) pendingNewsFiles.push(f);
			});
			newsImagesFiles.value = '';
			refreshNewsFilesPreview();
		});
		document.addEventListener('click', (e) => {
			const btn = e.target.closest('[data-action="remove-pending-file"]');
			if (!btn) return;
			const idx = Number(btn.getAttribute('data-index'));
			if (!Number.isNaN(idx) && idx >= 0 && idx < pendingNewsFiles.length){
				pendingNewsFiles.splice(idx, 1);
				refreshNewsFilesPreview();
			}
		});
	}

	// Delegation for news actions
	const newsBodyEl = document.getElementById('newsBody');
	if (newsBodyEl){
		newsBodyEl.addEventListener('click', async (e) => {
			const btn = e.target.closest('[data-action]');
			if (!btn) return;
			const action = btn.getAttribute('data-action');
			const idAttr = btn.getAttribute('data-id');
			const id = idAttr ? Number(idAttr) : null;
			if (action === 'edit-news' && id != null){
				openNewsModalForEdit(id);
			} else if (action === 'delete-news' && id != null){
				if (confirm('Delete this news item?')){
					const resp = await fetch(API + '/news/' + id, { method: 'DELETE' });
					if (!resp.ok){ alert('Failed to delete'); return; }
					await loadNews();
				}
			}
		});
	}

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
		await Promise.all([loadRates(), loadChairmen(), loadNews(), loadTicker()]);
		
		// Initialize contacts if the function exists
		if (window.initContacts) {
			window.initContacts();
		}
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();


