// Projects page filtering + hover interactions
(function(){
  const API = ((window && window.API_BASE) ? window.API_BASE : '/api').replace(/\/$/, '');
  let projects = [];
  let filteredProjects = [];

  async function loadProjects(category = 'all') {
    try {
      const url = category === 'all' ? API + '/projects' : API + '/projects?category=' + category;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load projects');
      projects = await res.json();
      filteredProjects = [...projects];
      renderProjects();
    } catch (error) {
      console.error('Error loading projects:', error);
      document.getElementById('projects-grid').innerHTML = '<div class="col-span-full text-center text-gray-500 py-12">Failed to load projects</div>';
    }
  }

  function renderProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    if (!filteredProjects.length) {
      grid.innerHTML = '<div class="col-span-full text-center text-gray-500 py-12">No projects found</div>';
      return;
    }

    grid.innerHTML = filteredProjects.map(project => {
      const coverImage = project.coverImage || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=2070&q=80';
      const description = project.description && project.description.length > 0 && project.description[0].paragraphs && project.description[0].paragraphs.length > 0 
        ? project.description[0].paragraphs[0] 
        : '';
      
      const categoryLabels = {
        'major_projects': 'MAJOR PROJECTS',
        'replacement_renovation': 'REPLACEMENT RENOVATION & UNIT DEVELOPMENT',
        'geographical_region': 'GEOGRAPHICAL REGION'
      };
      
      const categoryBadge = project.category ? `
        <div class="absolute top-4 right-4">
          <span class="px-2 py-1 text-xs font-medium rounded-full ${project.category === 'major_projects' ? 'bg-blue-600 text-white' : project.category === 'replacement_renovation' ? 'bg-green-600 text-white' : 'bg-purple-600 text-white'}">
            ${categoryLabels[project.category] || project.category}
          </span>
        </div>
      ` : '';
      
      return `
        <div class="project-card group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer" data-id="${project.id}">
          <div class="relative h-80">
            <img src="${coverImage}" alt="${project.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            ${categoryBadge}
            <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 class="text-xl font-bold">${project.title}</h3>
              <p class="project-desc text-sm text-gray-200">${description}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Add click handlers
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', () => {
        const projectId = card.getAttribute('data-id');
        window.location.href = `/projects-details.html?id=${projectId}`;
      });
    });
  }

  function applyFilter(filter) {
    loadProjects(filter);
  }

  // Filter buttons
  const btns = Array.prototype.slice.call(document.querySelectorAll('.filter-btn'));
  if (btns.length > 0) {
  btns.forEach(function(btn){
    btn.addEventListener('click', function(){
      var filter = btn.getAttribute('data-filter');
      btns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      applyFilter(filter);
    });
  });
  }

  // Initialize
  loadProjects();
})();

