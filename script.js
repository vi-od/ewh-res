// Real images from Appwrite database
let images = [];

let currentFilter = 'all';
let currentTagFilter = 'all';
let searchQuery = '';
let currentUser = null;

// DOM elements
const imageGrid = document.getElementById('imageGrid');
const searchInput = document.getElementById('searchInput');
const tagFilter = document.getElementById('tagFilter');
const categoryBtns = document.querySelectorAll('.category-btn');
const uploadBtn = document.getElementById('uploadBtn');
const uploadModal = document.getElementById('uploadModal');
const imageModal = document.getElementById('imageModal');
const closeModal = document.getElementById('closeModal');
const closeImageModal = document.getElementById('closeImageModal');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadForm = document.getElementById('uploadForm');
const previewImage = document.getElementById('previewImage');
const publishBtn = document.getElementById('publishBtn');
const loading = document.getElementById('loading');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkAuthAndInit();
});

// Check authentication and initialize
async function checkAuthAndInit() {
    console.log('checkAuthAndInit called on:', window.location.pathname);
    
    try {
        currentUser = await authService.getCurrentUser();
        console.log('✅ User authenticated:', currentUser);
        
        // User is authenticated, proceed with initialization
        updateAuthUI();
        await loadImages();
        setupEventListeners();
        
        // Check if we came from tags page with a specific tag
        const urlParams = new URLSearchParams(window.location.search);
        const selectedTag = urlParams.get('tag');
        if (selectedTag) {
            currentTagFilter = selectedTag;
            renderImages();
        } else {
            renderImages();
        }
        
    } catch (error) {
        console.log('❌ User not authenticated:', error.message);
        // Only redirect if we're not already on the auth page
        if (!window.location.pathname.includes('auth.html')) {
            console.log('🔄 Redirecting to auth page...');
            window.location.replace('auth.html');
        } else {
            console.log('✋ Already on auth page, staying put');
        }
    }
}

// Load images from Appwrite database
async function loadImages() {
    try {
        showLoading();
        const dbImages = await databaseService.getImages();
        
        // Transform database images to match expected format
        images = dbImages.map(img => ({
            id: img.$id,
            src: storageService.getImagePreview(img.fileId),
            title: img.title,
            description: img.description,
            category: img.category,
            tags: img.tags ? img.tags.split(',') : [],
            likes: img.likes || 0,
            liked: false, // TODO: Check if current user liked this
            userId: img.userId
        }));
        
        console.log('Loaded images:', images.length);
        hideLoading();
    } catch (error) {
        console.error('Error loading images:', error);
        hideLoading();
        // Show empty state or error message
        showNoImagesMessage();
    }
}

// Show message when no images are available
function showNoImagesMessage() {
    imageGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem;">
            <i class="fas fa-images" style="font-size: 4rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
            <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">No Images Yet</h3>
            <p style="color: var(--text-secondary);">Be the first to share something amazing!</p>
            <button onclick="document.getElementById('uploadBtn').click()" style="margin-top: 1rem; padding: 12px 24px; background: var(--primary-color); color: white; border: none; border-radius: 12px; cursor: pointer;">
                Upload First Image
            </button>
        </div>
    `;
}

// Update UI based on authentication status
function updateAuthUI() {
    const uploadBtn = document.getElementById('uploadBtn');
    const profileBtn = document.querySelector('.profile-btn');
    const logoutBtn = document.querySelector('.logout-btn');
    
    if (currentUser) {
        // User is logged in
        uploadBtn.style.display = 'flex';
        profileBtn.innerHTML = `<i class="fas fa-user"></i>`;
        profileBtn.onclick = () => showProfileModal();
        logoutBtn.style.display = 'flex';
    } else {
        // User not logged in
        uploadBtn.style.display = 'none';
        profileBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i>`;
        profileBtn.onclick = () => window.location.href = 'auth.html';
        logoutBtn.style.display = 'none';
    }
}

// Show profile modal (placeholder for now)
function showProfileModal() {
    alert('Profile page coming soon!');
}

// Handle logout
async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            await authService.signOut();
            console.log('User logged out');
            // Redirect to auth page
            window.location.replace('auth.html');
        } catch (error) {
            console.error('Logout error:', error);
            // Force redirect anyway
            window.location.replace('auth.html');
        }
    }
}

// Render images in the masonry grid
function renderImages() {
    const filteredImages = filterImages();
    imageGrid.innerHTML = '';
    
    filteredImages.forEach(image => {
        const imageCard = createImageCard(image);
        imageGrid.appendChild(imageCard);
    });
    
    // Add stagger animation
    const cards = document.querySelectorAll('.image-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.style.animation = 'fadeInUp 0.6s ease forwards';
    });
}

// Create image card element
function createImageCard(image) {
    const card = document.createElement('div');
    card.className = 'image-card';
    card.dataset.imageId = image.id;
    
    card.innerHTML = `
        <img src="${image.src}" alt="${image.title}" loading="lazy">
        <div class="image-overlay">
            <div class="image-title">${image.title}</div>
            <div class="image-description">${image.description}</div>
        </div>
        <div class="category-badge">${image.category}</div>
    `;
    
    card.addEventListener('click', () => openImageModal(image));
    
    return card;
}

// Filter images based on category, tags, and search query
function filterImages() {
    return images.filter(image => {
        const matchesCategory = currentFilter === 'all' || image.category === currentFilter;
        const matchesTag = currentTagFilter === 'all' || (image.tags && image.tags.includes(currentTagFilter));
        const matchesSearch = !searchQuery || 
            image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            image.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            image.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (image.tags && image.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
        
        return matchesCategory && matchesTag && matchesSearch;
    });
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', function() {
        searchQuery = this.value;
        renderImages();
    });
    
    // Tag filtering
    tagFilter.addEventListener('change', function() {
        currentTagFilter = this.value;
        renderImages();
    });
    
    // Category filtering
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.category;
            renderImages();
        });
    });
    
    // Upload modal
    uploadBtn.addEventListener('click', () => openUploadModal());
    closeModal.addEventListener('click', () => closeUploadModal());
    closeImageModal.addEventListener('click', () => closeImageDetailModal());
    
    // Upload area interactions
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    
    fileInput.addEventListener('change', handleFileSelect);
    publishBtn.addEventListener('click', publishImage);
    
    // Close modals when clicking outside
    uploadModal.addEventListener('click', function(e) {
        if (e.target === this) closeUploadModal();
    });
    
    imageModal.addEventListener('click', function(e) {
        if (e.target === this) closeImageDetailModal();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeUploadModal();
            closeImageDetailModal();
        }
    });
}

// Upload modal functions
function openUploadModal() {
    uploadModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeUploadModal() {
    uploadModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    resetUploadForm();
}

function resetUploadForm() {
    uploadArea.style.display = 'block';
    uploadForm.style.display = 'none';
    fileInput.value = '';
    document.getElementById('imageTitle').value = '';
    document.getElementById('imageDescription').value = '';
    document.getElementById('imageCategory').value = 'fashion';
}

// Image detail modal functions
function openImageModal(image) {
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalCategory = document.getElementById('modalCategory');
    const likeBtn = document.querySelector('.like-btn');
    const likeCount = document.querySelector('.like-count');
    
    modalImage.src = image.src;
    modalTitle.textContent = image.title;
    modalDescription.textContent = image.description;
    modalCategory.textContent = image.category;
    likeCount.textContent = image.likes;
    
    if (image.liked) {
        likeBtn.classList.add('liked');
    } else {
        likeBtn.classList.remove('liked');
    }
    
    // Setup like button
    likeBtn.onclick = () => toggleLike(image.id);
    
    imageModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeImageDetailModal() {
    imageModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// File handling functions
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        handleFileSelect({ target: { files: files } });
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImage.src = e.target.result;
        uploadArea.style.display = 'none';
        uploadForm.style.display = 'flex';
    };
    reader.readAsDataURL(file);
}

// Publish image function
function publishImage() {
    const title = document.getElementById('imageTitle').value.trim();
    const description = document.getElementById('imageDescription').value.trim();
    const category = document.getElementById('imageCategory').value;
    
    if (!title) {
        alert('Please add a title for your image');
        return;
    }
    
    showLoading();
    
    // Simulate upload delay
    setTimeout(() => {
        const selectedTags = Array.from(document.getElementById('imageTags').selectedOptions).map(option => option.value);
        
        const newImage = {
            id: Date.now(),
            src: previewImage.src,
            title: title,
            description: description || 'No description provided',
            category: category,
            tags: selectedTags,
            likes: 0,
            liked: false
        };
        
        images.unshift(newImage);
        hideLoading();
        closeUploadModal();
        renderImages();
        
        // Show success message
        showNotification('Image published successfully!');
    }, 1500);
}

// Like functionality
function toggleLike(imageId) {
    const image = images.find(img => img.id === imageId);
    if (image) {
        image.liked = !image.liked;
        image.likes += image.liked ? 1 : -1;
        
        const likeBtn = document.querySelector('.like-btn');
        const likeCount = document.querySelector('.like-count');
        
        if (image.liked) {
            likeBtn.classList.add('liked');
        } else {
            likeBtn.classList.remove('liked');
        }
        
        likeCount.textContent = image.likes;
        
        // Add heart animation
        if (image.liked) {
            likeBtn.style.animation = 'heartBeat 0.6s ease';
            setTimeout(() => {
                likeBtn.style.animation = '';
            }, 600);
        }
    }
}

// Loading functions
function showLoading() {
    loading.classList.add('active');
}

function hideLoading() {
    loading.classList.remove('active');
}

// Notification function
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: var(--shadow-hover);
        z-index: 3001;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations for cards and notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes heartBeat {
        0%, 14%, 28% {
            transform: scale(1);
        }
        7%, 21% {
            transform: scale(1.3);
        }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .image-card {
        opacity: 0;
        transform: translateY(30px);
    }
`;

document.head.appendChild(style);

// Lazy loading for better performance
function setupLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Save/bookmark functionality (localStorage)
function saveImage(imageId) {
    let savedImages = JSON.parse(localStorage.getItem('savedImages') || '[]');
    if (!savedImages.includes(imageId)) {
        savedImages.push(imageId);
        localStorage.setItem('savedImages', JSON.stringify(savedImages));
        showNotification('Image saved to your collection!');
    } else {
        showNotification('Image already in your collection');
    }
}

// Share functionality
function shareImage(image) {
    if (navigator.share) {
        navigator.share({
            title: image.title,
            text: image.description,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href)
            .then(() => showNotification('Link copied to clipboard!'))
            .catch(() => showNotification('Unable to share', 'error'));
    }
}

// Setup save and share buttons in image modal
document.addEventListener('DOMContentLoaded', function() {
    const saveBtn = document.querySelector('.save-btn');
    const shareBtn = document.querySelector('.share-btn');
    
    saveBtn.addEventListener('click', function() {
        const currentImageId = parseInt(document.getElementById('modalImage').dataset.imageId);
        if (currentImageId) {
            saveImage(currentImageId);
        }
    });
    
    shareBtn.addEventListener('click', function() {
        const currentImageId = parseInt(document.getElementById('modalImage').dataset.imageId);
        const image = images.find(img => img.id === currentImageId);
        if (image) {
            shareImage(image);
        }
    });
});

// Update image modal to store current image ID
function openImageModal(image) {
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalCategory = document.getElementById('modalCategory');
    const likeBtn = document.querySelector('.like-btn');
    const likeCount = document.querySelector('.like-count');
    
    modalImage.src = image.src;
    modalImage.dataset.imageId = image.id;
    modalTitle.textContent = image.title;
    modalDescription.textContent = image.description;
    modalCategory.textContent = image.category;
    likeCount.textContent = image.likes;
    
    if (image.liked) {
        likeBtn.classList.add('liked');
    } else {
        likeBtn.classList.remove('liked');
    }
    
    // Setup like button
    likeBtn.onclick = () => toggleLike(image.id);
    
    imageModal.classList.add('active');
    document.body.style.overflow = 'hidden';
} 