document.addEventListener('DOMContentLoaded', function() {
            // DOM elements
            const directoryPathDisplay = document.getElementById('manager-image-directory-path-display');
            const chooseDirectoryBtn = document.getElementById('manager-image-choose-directory');
            const clearAllBtn = document.getElementById('manager-image-clear-all');
            const sampleDataBtn = document.getElementById('manager-image-sample-data');
            const loadSampleBtn = document.getElementById('manager-image-load-sample');
            const directoriesContainer = document.getElementById('manager-image-directories-container');
            const directoriesList = document.getElementById('manager-image-directories-list');
            const notification = document.getElementById('manager-image-notification');
            const statusMessage = document.getElementById('manager-image-status-message');
            const imageCount = document.getElementById('manager-image-image-count');
            const progressBar = document.getElementById('manager-image-loading-progress');
            const helpBtn = document.getElementById('manager-image-help-btn');
            const organizationMethod = document.getElementById('manager-image-organization-method');
            const sizeButtons = document.querySelectorAll('.manager-image-size-btn');
            
            // Lightbox elements
            const lightbox = document.getElementById('manager-image-lightbox');
            const lightboxImage = document.getElementById('manager-image-lightbox-image');
            const lightboxTitle = document.getElementById('manager-image-lightbox-title');
            const lightboxPath = document.getElementById('manager-image-lightbox-path');
            const lightboxClose = document.getElementById('manager-image-lightbox-close');
            const lightboxCloseBtn = document.getElementById('manager-image-lightbox-close-btn');
            const lightboxCopy = document.getElementById('manager-image-lightbox-copy');
            const lightboxDownload = document.getElementById('manager-image-lightbox-download');
            const lightboxModify = document.getElementById('manager-image-lightbox-modify');
            const lightboxDimensions = document.getElementById('manager-image-lightbox-dimensions');
            const lightboxSize = document.getElementById('manager-image-lightbox-size');
            const lightboxModified = document.getElementById('manager-image-lightbox-modified');
            
            // Editor elements
            const editorModal = document.getElementById('manager-image-editor-modal');
            const editorClose = document.getElementById('manager-image-editor-close');
            const editorCancel = document.getElementById('manager-image-editor-cancel');
            const editorSave = document.getElementById('manager-image-editor-save');
            const editorCanvas = document.getElementById('manager-image-editor-canvas');
            const ctx = editorCanvas.getContext('2d');
            
            // Tool elements
            const toolButtons = document.querySelectorAll('.manager-image-tool-button');
            const brightnessSlider = document.getElementById('manager-image-brightness-slider');
            const contrastSlider = document.getElementById('manager-image-contrast-slider');
            const saturationSlider = document.getElementById('manager-image-saturation-slider');
            const brightnessValue = document.getElementById('manager-image-brightness-value');
            const contrastValue = document.getElementById('manager-image-contrast-value');
            const saturationValue = document.getElementById('manager-image-saturation-value');
            
            // State
            let directories = [];
            let imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'];
            let currentSize = 'medium';
            let currentOrganization = 'folder';
            let editableNames = {};
            let currentLightboxImage = null;
            let currentEditorImage = null;
            let originalImageData = null;
            let currentFilter = 'none';
            let currentTransform = { rotate: 0, flipH: false, flipV: false };
            let adjustments = { brightness: 100, contrast: 100, saturation: 100 };
            let adjustmentCanvas = document.createElement('canvas');
            let adjustmentCtx = adjustmentCanvas.getContext('2d');
            
            // Update status message
            function updateStatus(message, count = null) {
                statusMessage.textContent = message;
                if (count !== null) {
                    imageCount.textContent = `${count} images loaded`;
                }
            }
            
            // Update progress bar
            function updateProgress(percent) {
                progressBar.style.width = `${percent}%`;
            }
            
            // Update directory display
            function updateDirectoryDisplay() {
                if (directories.length === 0) {
                    directoryPathDisplay.textContent = i18n.t('image_manager.no_directories');
                    directoriesList.style.display = 'none';
                    return;
                }
                
                if (directories.length === 1) {
                    directoryPathDisplay.textContent = directories[0].name;
                    directoriesList.style.display = 'none';
                } else {
                    directoryPathDisplay.textContent = `${directories.length} ${i18n.t('image_manager.directories_selected')}`;
                    directoriesList.style.display = 'block';
                    
                    // Update directories list
                    directoriesList.innerHTML = '';
                    directories.forEach(dir => {
                        const dirItem = document.createElement('div');
                        dirItem.className = 'manager-image-directory-item';
                        dirItem.innerHTML = `
                            <div class="manager-image-directory-item-name">${dir.name}</div>
                            <button class="manager-image-remove-directory-btn" data-id="${dir.id}">×</button>
                        `;
                        directoriesList.appendChild(dirItem);
                    });
                    
                    // Add event listeners to remove buttons
                    document.querySelectorAll('.manager-image-remove-directory-btn').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const id = this.getAttribute('data-id');
                            removeDirectory(id);
                        });
                    });
                }
            }
            
            // Add directory function
            async function addDirectory() {
                try {
                    // Request directory access
                    const handle = await window.showDirectoryPicker();
                    
                    // Check if directory is already added
                    if (directories.some(dir => dir.handle.name === handle.name)) {
                        showNotification(i18n.t('image_manager.directory_already_added'));
                        return;
                    }
                    
                    // Create directory object
                    const directory = {
                        id: Date.now().toString(),
                        handle: handle,
                        name: handle.name,
                        images: []
                    };
                    
                    // Add to state
                    directories.push(directory);
                    updateDirectoryDisplay();
                    
                    // Start loading
                    updateStatus(i18n.t('image_manager.loading_directory', { name: directory.name }));
                    updateProgress(10);
                    
                    // Scan for images
                    updateStatus(i18n.t('image_manager.scanning_directory', { name: directory.name }));
                    await scanDirectoryForImages(directory, handle);
                    
                    // Render directories
                    renderDirectories();
                    
                    // Update status
                    const totalImages = directories.reduce((sum, dir) => sum + dir.images.length, 0);
                    updateStatus(i18n.t('image_manager.directory_loaded_success'), totalImages);
                    updateProgress(100);
                    
                    // Show notification
                    showNotification(i18n.t('image_manager.directory_added', { 
                        name: directory.name, 
                        count: directory.images.length 
                    }));
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        updateStatus(i18n.t('image_manager.error') + ': ' + error.message);
                        showNotification(i18n.t('image_manager.failed_load_directory'));
                        console.error(error);
                    }
                }
            }
            
            // Recursive function to scan directory for images
            async function scanDirectoryForImages(directory, handle) {
                const imageFiles = [];
                let imageCount = 0;
                let totalFiles = 0;
                
                // Count total files first for progress
                for await (const entry of handle.values()) {
                    if (entry.kind === 'file') {
                        totalFiles++;
                    }
                }
                
                let processedFiles = 0;
                
                // Process files
                for await (const entry of handle.values()) {
                    if (entry.kind === 'file') {
                        processedFiles++;
                        const progress = 10 + Math.floor((processedFiles / totalFiles) * 70);
                        updateProgress(progress);
                        
                        const file = await entry.getFile();
                        const extension = entry.name.split('.').pop().toLowerCase();
                        
                        if (imageExtensions.includes(extension)) {
                            imageCount++;
                            const url = URL.createObjectURL(file);
                            
                            directory.images.push({
                                id: Date.now().toString() + imageCount,
                                name: entry.name,
                                path: `${directory.name}/${entry.name}`,
                                url: url,
                                size: file.size,
                                lastModified: file.lastModified,
                                file: file  // Store file object for downloading
                            });
                            
                            updateStatus(i18n.t('image_manager.loading_images', { 
                                count: imageCount, 
                                name: directory.name 
                            }));
                        }
                    } else if (entry.kind === 'directory') {
                        // Recursively scan subdirectories
                        await scanDirectoryForImages(directory, entry);
                    }
                }
            }
            
            // Remove directory function
            function removeDirectory(id) {
                const directory = directories.find(dir => dir.id === id);
                if (!directory) return;
                
                // Revoke object URLs to free memory
                directory.images.forEach(image => {
                    URL.revokeObjectURL(image.url);
                });
                
                directories = directories.filter(dir => dir.id !== id);
                updateDirectoryDisplay();
                renderDirectories();
                
                const totalImages = directories.reduce((sum, dir) => sum + dir.images.length, 0);
                updateStatus(i18n.t('image_manager.directory_removed'), totalImages);
                showNotification(i18n.t('image_manager.directory_removed'));
            }
            
            // Copy image path function
            function copyImagePath(path) {
                navigator.clipboard.writeText(path).then(() => {
                    showNotification(i18n.t('image_manager.path_copied'));
                });
            }
            
            // Copy image Data function
            function copyImageData(imageData) {
                const copy = new Uint8ClampedArray(imageData.data);
                return new ImageData(copy, imageData.width, imageData.height);
            }
            
            // Show notification
            function showNotification(message) {
                notification.querySelector('span').textContent = message;
                notification.classList.add('show');
                
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 3000);
            }
            
            // Group images by size
            function groupBySize(images) {
                const groups = {
                    small: { name: i18n.t('image_manager.small_files'), images: [] },
                    medium: { name: i18n.t('image_manager.medium_files'), images: [] },
                    large: { name: i18n.t('image_manager.large_files'), images: [] }
                };
                
                images.forEach(image => {
                    if (image.size < 100 * 1024) {
                        groups.small.images.push(image);
                    } else if (image.size < 1024 * 1024) {
                        groups.medium.images.push(image);
                    } else {
                        groups.large.images.push(image);
                    }
                });
                
                return Object.values(groups).filter(group => group.images.length > 0);
            }
            
            // Group images by date
            function groupByDate(images) {
                const groups = {};
                
                images.forEach(image => {
                    const date = new Date(image.lastModified);
                    const dateStr = date.toLocaleDateString();
                    
                    if (!groups[dateStr]) {
                        groups[dateStr] = {
                            name: dateStr,
                            images: []
                        };
                    }
                    groups[dateStr].images.push(image);
                });
                
                return Object.values(groups);
            }
            
            // Render directories
            function renderDirectories() {
                if (directories.length === 0) {
                    directoriesContainer.innerHTML = `
                        <div class="manager-image-empty-state">
                            <h3 data-i18n="image_manager.no_directories_added">No directories added yet</h3>
                            <p data-i18n="image_manager.add_directories_instruction">Add directories containing your Wesnoth game images using the button above. Images will be displayed here organized by directory.</p>
                            <p data-i18n="image_manager.copy_paths_instruction">You can then copy their paths for use in game configuration files.</p>
                            <div class="manager-image-tooltip">
                                <button class="manager-image-btn manager-image-btn-add" id="manager-image-load-sample">🖼️ ${i18n.t('image_manager.load_sample_images')}</button>
                                <span class="manager-image-tooltiptext">${i18n.t('image_manager.load_sample_tooltip')}</span>
                            </div>
                        </div>
                    `;
                    document.getElementById('manager-image-load-sample').addEventListener('click', loadSampleData);
                    updateStatus(i18n.t('image_manager.ready'), 0);
                    updateProgress(0);
                    return;
                }
                
                let html = '';
                let totalImages = 0;
                
                // Get all images from all directories
                const allImages = [];
                directories.forEach(dir => {
                    allImages.push(...dir.images);
                });
                totalImages = allImages.length;
                
                // Apply organization method
                let groups = [];
                if (currentOrganization === 'folder') {
                    // Group by folder
                    groups = directories.map(dir => {
                        return {
                            name: dir.name,
                            images: dir.images,
                            id: dir.id
                        };
                    });
                } else if (currentOrganization === 'size') {
                    // Group by size
                    groups = groupBySize(allImages);
                } else if (currentOrganization === 'date') {
                    // Group by date
                    groups = groupByDate(allImages);
                }
                
                // Render groups
                groups.forEach(group => {
                    let imagesHtml = '';
                    
                    if (group.images.length === 0) {
                        imagesHtml = `
                            <div class="manager-image-no-images">
                                <p data-i18n="image_manager.no_images_found">No images found in this group</p>
                            </div>
                        `;
                    } else {
                        group.images.forEach(image => {
                            const displayName = editableNames[image.id] || image.name;
                            imagesHtml += `
                                <div class="manager-image-image-card manager-image-size-${currentSize}">
                                    <img src="${image.url}" alt="${image.name}" class="manager-image-image-preview" data-id="${image.id}">
                                    <div class="manager-image-image-info">
                                        <div class="manager-image-image-name-container">
                                            <div class="manager-image-image-name" title="${displayName}">${displayName}</div>
                                            <button class="manager-image-edit-name-btn" data-id="${image.id}">✏️</button>
                                        </div>
                                        <input type="text" class="manager-image-edit-name-input" data-id="${image.id}" value="${displayName}" style="display: none;">
                                        <div class="manager-image-image-path" title="${image.path}">${image.path}</div>
                                        <div class="manager-image-image-controls">
                                            <div class="manager-image-tooltip">
                                                <button class="manager-image-btn manager-image-btn-copy" onclick="copyImagePath('${image.path.replace(/'/g, "\\'")}')">📋 ${i18n.t('image_manager.copy_path')}</button>
                                                <span class="manager-image-tooltiptext">${i18n.t('image_manager.copy_path_tooltip')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        });
                    }
                    
                    html += `
                        <div class="manager-image-directory-container" data-id="${group.id || ''}">
                            <div class="manager-image-directory-header">
                                <div class="manager-image-directory-title">
                                    ${group.name}
                                    <span class="manager-image-image-count">${group.images.length} ${i18n.t('image_manager.images')}</span>
                                </div>
                                ${group.id ? `
                                    <div class="manager-image-tooltip">
                                        <button class="manager-image-btn manager-image-btn-remove" onclick="removeDirectory('${group.id}')">🗑️ ${i18n.t('image_manager.remove')}</button>
                                        <span class="manager-image-tooltiptext">${i18n.t('image_manager.remove_directory_tooltip')}</span>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="manager-image-images-grid manager-image-size-${currentSize}">
                                ${imagesHtml}
                            </div>
                        </div>
                    `;
                });
                
                directoriesContainer.innerHTML = html;
                
                // Add event listeners for name editing
                document.querySelectorAll('.manager-image-edit-name-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        const nameDisplay = this.previousElementSibling;
                        const input = nameDisplay.nextElementSibling;
                        
                        nameDisplay.style.display = 'none';
                        input.style.display = 'block';
                        input.focus();
                    });
                });
                
                document.querySelectorAll('.manager-image-edit-name-input').forEach(input => {
                    input.addEventListener('blur', function() {
                        const id = this.getAttribute('data-id');
                        const nameDisplay = this.previousElementSibling.previousElementSibling;
                        
                        editableNames[id] = this.value;
                        nameDisplay.textContent = this.value;
                        
                        this.style.display = 'none';
                        nameDisplay.style.display = 'block';
                    });
                    
                    input.addEventListener('keyup', function(e) {
                        if (e.key === 'Enter') {
                            this.blur();
                        }
                    });
                });
                
                // Add click event listeners to image previews
                document.querySelectorAll('.manager-image-image-preview').forEach(img => {
                    img.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        // Find the image in our directories
                        let clickedImage = null;
                        for (const dir of directories) {
                            clickedImage = dir.images.find(img => img.id === id);
                            if (clickedImage) break;
                        }
                        if (clickedImage) {
                            openLightbox(clickedImage);
                        }
                    });
                });
                
                updateStatus(i18n.t('image_manager.directories_loaded_success'), totalImages);
            }
            
            // Open lightbox with image
            function openLightbox(image) {
                currentLightboxImage = image;
                lightboxImage.src = image.url;
                lightboxImage.alt = image.name;
                lightboxTitle.textContent = editableNames[image.id] || image.name;
                lightboxPath.textContent = image.path;
                
                // Format file size
                const fileSizeKB = Math.round(image.size / 1024);
                const fileSizeMB = Math.round(image.size / (1024 * 1024) * 10) / 10;
                const sizeText = image.size > 1024 * 1024 ? 
                    `${fileSizeMB} MB` : `${fileSizeKB} KB`;
                lightboxSize.textContent = sizeText;
                
                // Format modified date
                const modifiedDate = new Date(image.lastModified);
                lightboxModified.textContent = modifiedDate.toLocaleString();
                
                // Reset dimensions until image loads
                lightboxDimensions.textContent = i18n.t('image_manager.loading');
                
                // Wait for image to load to get dimensions
                lightboxImage.onload = function() {
                    lightboxDimensions.textContent = `${this.naturalWidth} × ${this.naturalHeight}px`;
                };
                
                // Show the lightbox
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
            
            // Close lightbox
            function closeLightbox() {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
                currentLightboxImage = null;
            }
            
            // Open editor with image
            function openEditor(image) {
                currentEditorImage = image;
                
                const img = new Image();
                img.onload = function() {
                    // Set canvas size to accommodate rotations
                    const diagonal = Math.ceil(Math.sqrt(img.width * img.width + img.height * img.height));
                    editorCanvas.width = diagonal;
                    editorCanvas.height = diagonal;
                    
                    // Set up adjustment canvas
                    adjustmentCanvas.width = img.width;
                    adjustmentCanvas.height = img.height;
                    adjustmentCtx.drawImage(img, 0, 0);
                    // Store original without modifications
                    originalImageData = copyImageData(
                        adjustmentCtx.getImageData(0, 0, adjustmentCanvas.width, adjustmentCanvas.height)
                    );
                    
                    // Update slider values
                    brightnessSlider.value = adjustments.brightness;
                    contrastSlider.value = adjustments.contrast;
                    saturationSlider.value = adjustments.saturation;
                    brightnessValue.textContent = adjustments.brightness;
                    contrastValue.textContent = adjustments.contrast;
                    saturationValue.textContent = adjustments.saturation;
                    
                    // Hide all tool controls
                    document.querySelectorAll('.manager-image-tool-control').forEach(el => {
                        el.style.display = 'none';
                    });
                    
                    // Reset tool buttons
                    document.querySelectorAll('.manager-image-tool-button').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    
                    // Apply initial adjustments
                    applyAdjustments();
                    
                    // Show the editor
                    editorModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                };
                img.src = image.url;
            }
            
            // Close editor
            function closeEditor() {
                editorModal.classList.remove('active');
                document.body.style.overflow = '';
                currentEditorImage = null;
                
                // Reset editor state
                adjustments = { brightness: 100, contrast: 100, saturation: 100 };
                currentFilter = 'none';
                currentTransform = { rotate: 0, flipH: false, flipV: false };
            }
            
            // Apply adjustments to the image
            function applyAdjustments() {
                if (!originalImageData) return;

                // Check if adjustments are needed
                const needsAdjustment = 
                    adjustments.brightness !== 100 ||
                    adjustments.contrast !== 100 ||
                    adjustments.saturation !== 100 ||
                    currentFilter !== 'none';

                // If no adjustments needed, use original data
                if (!needsAdjustment) {
                    adjustmentCtx.putImageData(originalImageData, 0, 0);
                    applyTransformations();
                    return;
                }
                
                // Create deep copy instead of modifying original
                const imageData = copyImageData(originalImageData);
                
                const data = imageData.data;
                const brightness = adjustments.brightness / 100;
                const contrast = adjustments.contrast / 100;
                
                // Apply brightness and contrast
                for (let i = 0; i < data.length; i += 4) {
                    if (adjustments.brightness !== 100) {
                        // Brightness
                        data[i] = Math.min(255, Math.max(0, data[i] * brightness));
                        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * brightness));
                        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * brightness));
                    }
                    
                    // Contrast
                    if (adjustments.contrast !== 100) {
                        const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
                        data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
                        data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
                        data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
                    }
                }
                
                // Apply saturation if needed
                if (adjustments.saturation !== 100) {
                    const saturation = adjustments.saturation / 100;
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
                        
                        data[i] = Math.min(255, Math.max(0, gray + saturation * (r - gray)));
                        data[i + 1] = Math.min(255, Math.max(0, gray + saturation * (g - gray)));
                        data[i + 2] = Math.min(255, Math.max(0, gray + saturation * (b - gray)));
                    }
                }
                
                // Apply filters
                switch (currentFilter) {
                    case 'grayscale':
                        for (let i = 0; i < data.length; i += 4) {
                            const avg = 0.2989 * data[i] + 0.5870 * data[i + 1] + 0.1140 * data[i + 2];
                            data[i] = avg;
                            data[i + 1] = avg;
                            data[i + 2] = avg;
                        }
                        break;
                    case 'sepia':
                        for (let i = 0; i < data.length; i += 4) {
                            const r = data[i];
                            const g = data[i + 1];
                            const b = data[i + 2];
                            data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
                            data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
                            data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
                        }
                        break;
                    case 'invert':
                        for (let i = 0; i < data.length; i += 4) {
                            data[i] = 255 - data[i];
                            data[i + 1] = 255 - data[i + 1];
                            data[i + 2] = 255 - data[i + 2];
                        }
                        break;
                }
                
                // Update adjustment canvas
                adjustmentCtx.putImageData(imageData, 0, 0);
                applyTransformations();
            }
            
            // Apply transformations
            function applyTransformations() {
                ctx.clearRect(0, 0, editorCanvas.width, editorCanvas.height);
                ctx.save();
                
                // Center the image
                ctx.translate(editorCanvas.width / 2, editorCanvas.height / 2);
                
                // Apply rotation
                ctx.rotate(currentTransform.rotate * Math.PI / 180);
                
                // Apply flips
                ctx.scale(currentTransform.flipH ? -1 : 1, currentTransform.flipV ? -1 : 1);
                
                // Draw the adjusted image
                ctx.drawImage(
                    adjustmentCanvas, 
                    -adjustmentCanvas.width / 2, 
                    -adjustmentCanvas.height / 2
                );
                
                ctx.restore();
            }
            
            // Sample data for demonstration
            function loadSampleData() {
                directories = [];
                updateProgress(30);
                
                const wesnothDirs = [
                    {
                        id: 'dir1',
                        name: 'units',
                        images: [
                            {id: 'img1', name: 'elvish-archer.png', path: 'units/elves-archer/elvish-archer.png', url: 'https://www.wesnoth.org/wiki/images/thumb/3/3e/Elvish_Archer.png/120px-Elvish_Archer.png', size: 85000, lastModified: Date.now()},
                            {id: 'img2', name: 'elvish-fighter.png', path: 'units/elves-fighter/elvish-fighter.png', url: 'https://www.wesnoth.org/wiki/images/thumb/0/0d/Elvish_Fighter.png/120px-Elvish_Fighter.png', size: 92000, lastModified: Date.now() - 86400000},
                            {id: 'img3', name: 'elvish-scout.png', path: 'units/elves-scout/elvish-scout.png', url: 'https://www.wesnoth.org/wiki/images/thumb/d/dc/Elvish_Scout.png/120px-Elvish_Scout.png', size: 78000, lastModified: Date.now() - 172800000},
                            {id: 'img4', name: 'elvish-shaman.png', path: 'units/elves-shaman/elvish-shaman.png', url: 'https://www.wesnoth.org/wiki/images/thumb/2/26/Elvish_Shaman.png/120px-Elvish_Shaman.png', size: 1200000, lastModified: Date.now() - 259200000},
                        ]
                    },
                    {
                        id: 'dir2',
                        name: 'terrain',
                        images: [
                            {id: 'img5', name: 'grass.png', path: 'terrain/grass.png', url: 'https://www.wesnoth.org/wiki/images/thumb/0/0b/Grass.png/120px-Grass.png', size: 45000, lastModified: Date.now() - 345600000},
                            {id: 'img6', name: 'forest.png', path: 'terrain/forest.png', url: 'https://www.wesnoth.org/wiki/images/thumb/1/1f/Forest.png/120px-Forest.png', size: 50000, lastModified: Date.now() - 432000000},
                            {id: 'img7', name: 'mountains.png', path: 'terrain/mountains.png', url: 'https://www.wesnoth.org/wiki/images/thumb/2/2b/Mountains.png/120px-Mountains.png', size: 55000, lastModified: Date.now() - 518400000},
                            {id: 'img8', name: 'water.png', path: 'terrain/water.png', url: 'https://www.wesnoth.org/wiki/images/thumb/9/9d/Water.png/120px-Water.png', size: 48000, lastModified: Date.now() - 604800000},
                        ]
                    },
                    {
                        id: 'dir3',
                        name: 'icons',
                        images: [
                            {id: 'img9', name: 'attack-melee.png', path: 'icons/attack-melee.png', url: 'https://www.wesnoth.org/wiki/images/thumb/0/00/Melee.png/60px-Melee.png', size: 25000, lastModified: Date.now() - 691200000},
                            {id: 'img10', name: 'attack-ranged.png', path: 'icons/attack-ranged.png', url: 'https://www.wesnoth.org/wiki/images/thumb/5/5e/Ranged.png/60px-Ranged.png', size: 26000, lastModified: Date.now() - 777600000},
                            {id: 'img11', name: 'movement.png', path: 'icons/movement.png', url: 'https://www.wesnoth.org/wiki/images/thumb/5/50/Movement.png/60px-Movement.png', size: 24000, lastModified: Date.now() - 864000000},
                            {id: 'img12', name: 'hitpoints.png', path: 'icons/hitpoints.png', url: 'https://www.wesnoth.org/wiki/images/thumb/6/60/Hitpoints.png/60px-Hitpoints.png', size: 23000, lastModified: Date.now() - 950400000},
                        ]
                    }
                ];
                
                setTimeout(() => {
                    directories = wesnothDirs;
                    updateDirectoryDisplay();
                    renderDirectories();
                    updateProgress(100);
                    showNotification(i18n.t('image_manager.sample_loaded'));
                    updateStatus(i18n.t('image_manager.sample_loaded_success'), 12);
                }, 800);
            }
            
            // Event listeners for lightbox
            lightboxClose.addEventListener('click', closeLightbox);
            lightboxCloseBtn.addEventListener('click', closeLightbox);
            
            // Click outside content to close
            lightbox.addEventListener('click', function(e) {
                if (e.target === lightbox) {
                    closeLightbox();
                }
            });
            
            // Escape key to close lightbox
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                    closeLightbox();
                }
            });
            
            // Copy path from lightbox
            lightboxCopy.addEventListener('click', function() {
                if (currentLightboxImage) {
                    copyImagePath(currentLightboxImage.path);
                }
            });
            
            // Download image from lightbox
            lightboxDownload.addEventListener('click', function() {
                if (currentLightboxImage) {
                    // Create a temporary link
                    const a = document.createElement('a');
                    a.href = currentLightboxImage.url;
                    a.download = currentLightboxImage.name;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }
            });
            
            // Open editor from lightbox
            lightboxModify.addEventListener('click', function() {
                if (currentLightboxImage) {
                    openEditor(currentLightboxImage);
                }
            });
            
            // Event listeners for editor
            editorClose.addEventListener('click', closeEditor);
            editorCancel.addEventListener('click', closeEditor);
            
            // Save edited image
            editorSave.addEventListener('click', function() {
                if (currentEditorImage) {
                    // Create a temporary link
                    const a = document.createElement('a');
                    a.href = editorCanvas.toDataURL('image/png');
                    a.download = currentEditorImage.name;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    
                    showNotification(i18n.t('image_manager.image_saved'));
                    closeEditor();
                }
            });
            
            // Tool buttons event listeners
            toolButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const tool = this.dataset.tool;
                    const filter = this.dataset.filter;
                    const transform = this.dataset.transform;
                    
                    if (tool) {
                        // Show tool control
                        document.querySelectorAll('.manager-image-tool-control').forEach(el => {
                            el.style.display = 'none';
                        });
                        document.getElementById(`manager-image-${tool}-control`).style.display = 'block';
                        
                        // Mark button as active
                        document.querySelectorAll('.manager-image-tool-button').forEach(btn => {
                            btn.classList.remove('active');
                        });
                        this.classList.add('active');
                    }
                    
                    if (filter) {
                        currentFilter = filter;
                        applyAdjustments();
                    }
                    
                    if (transform) {
                        switch (transform) {
                            case 'rotate-left':
                                currentTransform.rotate = (currentTransform.rotate - 90) % 360;
                                applyTransformations();
                                break;
                            case 'rotate-right':
                                currentTransform.rotate = (currentTransform.rotate + 90) % 360;
                                applyTransformations();
                                break;
                            case 'flip-h':
                                currentTransform.flipH = !currentTransform.flipH;
                                applyTransformations();
                                break;
                            case 'flip-v':
                                currentTransform.flipV = !currentTransform.flipV;
                                applyTransformations();
                                break;
                        }
                    }
                });
            });
            
            // Slider event listeners
            brightnessSlider.addEventListener('input', function() {
                adjustments.brightness = this.value;
                brightnessValue.textContent = this.value;
                applyAdjustments();
            });
            
            contrastSlider.addEventListener('input', function() {
                adjustments.contrast = this.value;
                contrastValue.textContent = this.value;
                applyAdjustments();
            });
            
            saturationSlider.addEventListener('input', function() {
                adjustments.saturation = this.value;
                saturationValue.textContent = this.value;
                applyAdjustments();
            });
            
            // Event listeners
            chooseDirectoryBtn.addEventListener('click', addDirectory);
            
            clearAllBtn.addEventListener('click', () => {
                // Revoke all object URLs to free memory
                directories.forEach(directory => {
                    directory.images.forEach(image => {
                        URL.revokeObjectURL(image.url);
                    });
                });
                
                directories = [];
                editableNames = {};
                updateDirectoryDisplay();
                renderDirectories();
                showNotification(i18n.t('image_manager.all_cleared'));
            });
            
            sampleDataBtn.addEventListener('click', loadSampleData);
            
            // Organization method change
            organizationMethod.addEventListener('change', function() {
                currentOrganization = this.value;
                renderDirectories();
            });
            
            // Size buttons
            sizeButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    sizeButtons.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    currentSize = this.dataset.size;
                    renderDirectories();
                });
            });
            
            // Expose functions to global scope for inline handlers
            window.removeDirectory = removeDirectory;
            window.copyImagePath = copyImagePath;
        });