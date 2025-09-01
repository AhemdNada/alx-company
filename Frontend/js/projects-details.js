// Projects Details page functionality
(function(){
    const API = ((window && window.API_BASE) ? window.API_BASE : '/api').replace(/\/$/, '');
    let currentProject = null;
    let currentImageIndex = 0;

    // Get project ID from URL
    function getProjectId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    // Show loading state
    function showLoading() {
        document.getElementById('loadingState').classList.remove('hidden');
        document.getElementById('projectContent').classList.add('hidden');
        document.getElementById('errorState').classList.add('hidden');
    }

    // Show project content
    function showProject() {
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('projectContent').classList.remove('hidden');
        document.getElementById('errorState').classList.add('hidden');
    }

    // Show error state
    function showError() {
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('projectContent').classList.add('hidden');
        document.getElementById('errorState').classList.remove('hidden');
    }

    // Load project data
    async function loadProject() {
        const projectId = getProjectId();
        if (!projectId) {
            showError();
            return;
        }

        try {
            const res = await fetch(API + '/projects/' + projectId);
            if (!res.ok) {
                throw new Error('Project not found');
            }
            
            currentProject = await res.json();
            renderProject();
            showProject();
        } catch (error) {
            console.error('Error loading project:', error);
            showError();
        }
    }

    // Render project content
    function renderProject() {
        if (!currentProject) return;

        // Set page title
        document.title = `${currentProject.title} — Alexandria Petroleum Company`;
        
        // Update breadcrumb and main title
        document.getElementById('projectTitle').textContent = currentProject.title;
        document.getElementById('projectTitleMain').textContent = currentProject.title;
        
        // Add category badge if available
        if (currentProject.category) {
            const categoryLabels = {
                'major_projects': 'MAJOR PROJECTS',
                'replacement_renovation': 'REPLACEMENT RENOVATION & UNIT DEVELOPMENT',
                'geographical_region': 'GEOGRAPHICAL REGION'
            };
            const categoryLabel = categoryLabels[currentProject.category] || currentProject.category;
            const categoryBadge = document.createElement('span');
            categoryBadge.className = `inline-block px-3 py-1 text-xs font-medium rounded-full ml-3 ${currentProject.category === 'major_projects' ? 'bg-blue-100 text-blue-800' : currentProject.category === 'replacement_renovation' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`;
            categoryBadge.textContent = categoryLabel;
            document.getElementById('projectTitleMain').appendChild(categoryBadge);
        }

        // Render images
        renderImages();
        
        // Render descriptions
        renderDescriptions();
        
        // Render project details
        renderProjectDetails();
    }

    // Render project images
    function renderImages() {
        const mainImage = document.getElementById('mainImage');
        const gallery = document.getElementById('imageGallery');
        const imageCounter = document.getElementById('imageCounter');
        const totalImages = document.getElementById('totalImages');
        
        if (!currentProject.images || currentProject.images.length === 0) {
            // Use placeholder image
            mainImage.src = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=2070&q=80';
            mainImage.alt = currentProject.title;
            gallery.innerHTML = '';
            imageCounter.textContent = '1';
            totalImages.textContent = '1';
            return;
        }

        // Set main image to first image (cover image)
        const coverImage = currentProject.images.find(img => img.isCover) || currentProject.images[0];
        mainImage.src = coverImage.imageUrl;
        mainImage.alt = currentProject.title;

        // Update image counter
        imageCounter.textContent = '1';
        totalImages.textContent = currentProject.images.length.toString();

        // Render gallery thumbnails
        gallery.innerHTML = currentProject.images.map((image, index) => `
            <img src="${image.imageUrl}" 
                 alt="${currentProject.title} - Image ${index + 1}" 
                 class="gallery-thumbnail w-full h-20 object-cover rounded-lg ${index === 0 ? 'active' : ''}"
                 data-index="${index}">
        `).join('');
        
        // Add click event listeners to thumbnails
        gallery.querySelectorAll('.gallery-thumbnail').forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', () => switchMainImage(index));
        });
        
        // Show/hide navigation buttons based on number of images
        const prevBtn = document.getElementById('prevImageBtn');
        const nextBtn = document.getElementById('nextImageBtn');
        
        if (currentProject.images.length <= 1) {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        } else {
            if (prevBtn) prevBtn.style.display = 'block';
            if (nextBtn) nextBtn.style.display = 'block';
        }
    }

    // Switch main image
    function switchMainImage(index) {
        if (!currentProject.images || !currentProject.images[index]) return;
        
        const mainImage = document.getElementById('mainImage');
        const thumbnails = document.querySelectorAll('.gallery-thumbnail');
        const imageCounter = document.getElementById('imageCounter');
        const prevBtn = document.getElementById('prevImageBtn');
        const nextBtn = document.getElementById('nextImageBtn');
        
        // Update main image
        mainImage.src = currentProject.images[index].imageUrl;
        
        // Update active thumbnail
        thumbnails.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
        
        // Update image counter
        imageCounter.textContent = (index + 1).toString();
        
        // Update navigation buttons
        if (currentProject.images.length > 1) {
            if (prevBtn) prevBtn.style.display = index === 0 ? 'none' : 'block';
            if (nextBtn) nextBtn.style.display = index === currentProject.images.length - 1 ? 'none' : 'block';
        } else {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        }
        
        currentImageIndex = index;
    }

    // Navigation functions
    function nextImage() {
        if (currentProject.images && currentImageIndex < currentProject.images.length - 1) {
            switchMainImage(currentImageIndex + 1);
        }
    }

    function prevImage() {
        if (currentProject.images && currentImageIndex > 0) {
            switchMainImage(currentImageIndex - 1);
        }
    }

    // Keyboard navigation
    function handleKeyPress(e) {
        if (e.key === 'ArrowLeft') {
            prevImage();
        } else if (e.key === 'ArrowRight') {
            nextImage();
        }
    }

    // Render project descriptions
    function renderDescriptions() {
        const descriptionsContainer = document.getElementById('projectDescriptions');
        const leftColumnContainer = document.getElementById('leftColumnDescriptions');
        
        if (!currentProject.description || currentProject.description.length === 0) {
            descriptionsContainer.innerHTML = `
                <div class="description-section">
                    <h3 class="description-title">Project Overview</h3>
                    <p class="description-paragraph">Detailed information about this project will be available soon.</p>
                </div>
            `;
            return;
        }

        // Filter valid descriptions
        const validDescriptions = currentProject.description.filter(desc => desc.type === 'description');
        
        // Split descriptions between left and right columns
        // Put first 2 descriptions on the right, rest on the left for better balance
        let rightDescriptions, leftDescriptions;
        
        if (validDescriptions.length <= 2) {
            // If 2 or fewer descriptions, put all on the right
            rightDescriptions = validDescriptions;
            leftDescriptions = [];
        } else {
            // Put first 2 on the right, rest on the left
            rightDescriptions = validDescriptions.slice(0, 2);
            leftDescriptions = validDescriptions.slice(2);
        }

        // Render left column descriptions
        leftColumnContainer.innerHTML = leftDescriptions.map(desc => {
            const paragraphs = desc.paragraphs.map(p => `<p class="description-paragraph">${p}</p>`).join('');
            return `
                <div class="description-section">
                    <h3 class="description-title">${desc.title}</h3>
                    ${paragraphs}
                </div>
            `;
        }).join('');

        // Render right column descriptions
        descriptionsContainer.innerHTML = rightDescriptions.map(desc => {
            const paragraphs = desc.paragraphs.map(p => `<p class="description-paragraph">${p}</p>`).join('');
            return `
                <div class="description-section">
                    <h3 class="description-title">${desc.title}</h3>
                    ${paragraphs}
                </div>
            `;
        }).join('');
    }

    // Render project details table
    function renderProjectDetails() {
        const detailsSection = document.getElementById('projectDetailsSection');
        const detailsTable = document.getElementById('projectDetailsTable');
        
        // Always show the section if we have category or details
        if ((!currentProject.details || currentProject.details.length === 0) && !currentProject.category) {
            detailsSection.classList.add('hidden');
            return;
        }

        detailsSection.classList.remove('hidden');
        let tableHTML = '';
        
        // Add category row if available
        if (currentProject.category) {
            const categoryLabels = {
                'major_projects': 'MAJOR PROJECTS',
                'replacement_renovation': 'REPLACEMENT RENOVATION & UNIT DEVELOPMENT',
                'geographical_region': 'GEOGRAPHICAL REGION'
            };
            const categoryLabel = categoryLabels[currentProject.category] || currentProject.category;
            tableHTML += `
                <tr>
                    <td>Category</td>
                    <td>${categoryLabel}</td>
                </tr>
            `;
        }
        
        // Add other details
        if (currentProject.details && currentProject.details.length > 0) {
            tableHTML += currentProject.details.map(detail => `
                <tr>
                    <td>${detail.key}</td>
                    <td>${detail.value}</td>
                </tr>
            `).join('');
        }
        
        // Add sample data if no details exist
        if (!currentProject.details || currentProject.details.length === 0) {
            tableHTML += `
                <tr>
                    <td>Project Number</td>
                    <td>PRJ-${String(currentProject.id).padStart(4, '0')}</td>
                </tr>
                <tr>
                    <td>Status</td>
                    <td>In Progress</td>
                </tr>
                <tr>
                    <td>Start Date</td>
                    <td>January 2024</td>
                </tr>
                <tr>
                    <td>Completion</td>
                    <td>December 2025</td>
                </tr>
                <tr>
                    <td>Manager</td>
                    <td>Eng. Ahmed Hassan</td>
                </tr>
                <tr>
                    <td>Budget</td>
                    <td>$2.5 Million</td>
                </tr>
            `;
        }
        
        detailsTable.innerHTML = tableHTML;
    }

    // Initialize page
    function init() {
        loadProject();
        
        // Add event listeners for navigation buttons
        const prevBtn = document.getElementById('prevImageBtn');
        const nextBtn = document.getElementById('nextImageBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', prevImage);
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', nextImage);
        }
        
        // Add keyboard navigation
        document.addEventListener('keydown', handleKeyPress);
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
