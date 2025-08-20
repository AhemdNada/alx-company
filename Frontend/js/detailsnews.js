// Minimal JS for details news page: gallery thumbs and simple slider
(function () {
  function bindGallery() {
    const mainImg = document.getElementById('gallery-main');
    const thumbImgs = Array.from(document.querySelectorAll('#gallery-thumbs .thumb-btn img'));
    if (!mainImg || thumbImgs.length === 0) return;

    const state = (window.galleryState = window.galleryState || { activeIndex: 0 });

    function setActive(index) {
      const total = thumbImgs.length;
      if (total === 0) return;
      state.activeIndex = (index + total) % total;
      const target = thumbImgs[state.activeIndex];
      const full = target.getAttribute('data-full') || target.src;
      mainImg.style.opacity = '0';
      setTimeout(() => {
        mainImg.src = full;
        mainImg.alt = target.alt || 'Gallery image';
        mainImg.style.opacity = '1';
      }, 150);
      // Highlight
      thumbImgs.forEach((el, i) => {
        const btn = el.closest('.thumb-btn');
        if (!btn) return;
        if (i === state.activeIndex) {
          btn.classList.add('ring-2', 'ring-blue-500', 'shadow-md');
          btn.classList.remove('ring-1');
        } else {
          btn.classList.remove('ring-2', 'ring-blue-500', 'shadow-md');
          btn.classList.add('ring-1');
        }
      });
    }

    thumbImgs.forEach((img, i) => {
      img.addEventListener('click', () => setActive(i));
    });

    const galleryPrev = document.getElementById('gallery-prev');
    const galleryNext = document.getElementById('gallery-next');
    if (galleryPrev) galleryPrev.addEventListener('click', () => setActive(state.activeIndex - 1));
    if (galleryNext) galleryNext.addEventListener('click', () => setActive(state.activeIndex + 1));
    setActive(state.activeIndex || 0);
  }

  window.galleryInit = bindGallery;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindGallery);
  else bindGallery();
})();

// Data loading + skeleton toggling
(function(){
  const API = (window && window.API_BASE ? window.API_BASE : '/api').replace(/\/$/, '');
  function parseQuery(){
    const p = new URLSearchParams(location.search);
    return { id: Number(p.get('id')) || null };
  }
  function showSkeleton(){
    const skelTop = document.getElementById('skelTopTitle');
    const titleTop = document.getElementById('newsTitle');
    const skelRight = document.getElementById('skelRight');
    const right = document.getElementById('rightContainer');
    const skelGallery = document.getElementById('skelGallery');
    const gallery = document.getElementById('galleryContainer');
    if (skelTop) skelTop.classList.remove('hidden');
    if (titleTop) titleTop.classList.add('hidden');
    if (skelRight) skelRight.classList.remove('hidden');
    if (right) right.classList.add('hidden');
    if (skelGallery) skelGallery.classList.remove('hidden');
    if (gallery) gallery.classList.add('hidden');
  }
  function hideSkeleton(){
    const skelTop = document.getElementById('skelTopTitle');
    const titleTop = document.getElementById('newsTitle');
    const skelRight = document.getElementById('skelRight');
    const right = document.getElementById('rightContainer');
    const skelGallery = document.getElementById('skelGallery');
    const gallery = document.getElementById('galleryContainer');
    if (skelTop) skelTop.classList.add('hidden');
    if (titleTop) titleTop.classList.remove('hidden');
    if (skelRight) skelRight.classList.add('hidden');
    if (right) right.classList.remove('hidden');
    if (skelGallery) skelGallery.classList.add('hidden');
    if (gallery) gallery.classList.remove('hidden');
  }
  function renderDescription(blocks){
    const wrap = document.getElementById('newsBody');
    wrap.innerHTML = '';
    if (!Array.isArray(blocks) || !blocks.length){ return; }
    blocks.forEach(b => {
      if (b && b.type === 'paragraph'){
        const p = document.createElement('p');
        p.className = 'text-gray-700 whitespace-pre-line';
        p.textContent = b.text || '';
        wrap.appendChild(p);
      } else if (b && b.type === 'list'){
        const ul = document.createElement('ul');
        ul.className = 'list-disc list-inside space-y-2';
        (Array.isArray(b.items) ? b.items : []).forEach(it => {
          const li = document.createElement('li'); li.textContent = it || ''; ul.appendChild(li);
        });
        wrap.appendChild(ul);
      }
    });
  }
  function renderImages(images, orientation){
    const main = document.getElementById('gallery-main');
    const thumbs = document.getElementById('gallery-thumbs');
    const container = main ? main.parentElement : null;
    const ratio = container ? container.querySelector(':scope > div') : null;
    thumbs.innerHTML = '';
    if (!images || !images.length){ main.src=''; return; }
    main.src = images[0].imageUrl;
    if (ratio){ ratio.style.paddingTop = orientation === 'vertical' ? '140%' : '56.25%'; }
    images.forEach((img, idx) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.className = 'thumb-btn group block rounded-xl overflow-hidden ring-1 ring-gray-200 hover:ring-blue-300';
      const thumb = document.createElement('img');
      thumb.src = img.imageUrl;
      thumb.setAttribute('data-full', img.imageUrl);
      thumb.alt = 'News image';
      thumb.className = orientation === 'vertical' ? 'h-24 w-16 object-cover transition-transform duration-300 group-hover:scale-105' : 'h-20 w-32 object-cover transition-transform duration-300 group-hover:scale-105';
      btn.appendChild(thumb);
      li.appendChild(btn);
      thumbs.appendChild(li);
    });
    // Bind gallery interactions for dynamic thumbs
    const thumbImgs = Array.from(thumbs.querySelectorAll('.thumb-btn img'));
    let activeIndex = 0;
    function setActive(index){
      if (!thumbImgs.length) return;
      activeIndex = (index + thumbImgs.length) % thumbImgs.length;
      const target = thumbImgs[activeIndex];
      const full = target.getAttribute('data-full') || target.src;
      main.style.opacity = '0';
      setTimeout(() => {
        main.src = full;
        main.alt = target.alt || 'Gallery image';
        main.style.opacity = '1';
      }, 150);
      thumbImgs.forEach((el, i) => {
        const btn = el.closest('.thumb-btn');
        if (!btn) return;
        if (i === activeIndex){
          btn.classList.add('ring-2','ring-blue-500','shadow-md');
          btn.classList.remove('ring-1');
        } else {
          btn.classList.remove('ring-2','ring-blue-500','shadow-md');
          btn.classList.add('ring-1');
        }
      });
    }
    thumbImgs.forEach((img, i) => { img.addEventListener('click', () => setActive(i)); });
    const prev = document.getElementById('gallery-prev');
    const next = document.getElementById('gallery-next');
    if (prev) prev.addEventListener('click', () => setActive(activeIndex - 1));
    if (next) next.addEventListener('click', () => setActive(activeIndex + 1));
    setActive(0);
  }
  async function load(){
    const { id } = parseQuery();
    if (!id){ return; }
    showSkeleton();
    const res = await fetch(API + '/news/' + id);
    if (!res.ok){ return; }
    const item = await res.json();
    document.getElementById('newsTitle').textContent = item.title || '';
    document.getElementById('newsTitleRight').textContent = item.title || '';
    document.getElementById('newsSubtitleRight').textContent = item.subtitle || '';
    renderDescription(item.description);
    renderImages(item.images, item.imageOrientation);
    hideSkeleton();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load); else load();
})();