// Arrays to store uploaded media
let animationInterval = null;
let currentFrameIndex = 0;
let isPlaying = false;
let animationDirection = 'forward'; // 'forward', 'reverse', 'alternate'
let animationLoop = 'loop'; // 'loop', 'play_once'
let animationSpeed = 5; // 1-10 scale
let uploadedImages = [];
let uploadedEffects = [];
let uploadedSounds = [];
let history = [];
let currentHistoryIndex = -1;
let selectedFrame = null;

// Initialize upload boxes
document.addEventListener('DOMContentLoaded', () => {
	setupUploadBox('uploadImages', 'imageInput', 'images');
	setupUploadBox('uploadEffects', 'effectsInput', 'effects');
	setupUploadBox('uploadSounds', 'soundsInput', 'sounds');
	initTimelineDragDrop();
    initHistory();
    // Add frame selection functionality
    document.addEventListener('click', function(e) {
        const frame = e.target.closest('.image-animator-timeline-frame');
        if (frame) {
            // Clear previous selection
            document.querySelectorAll('.image-animator-timeline-frame').forEach(f => {
                f.classList.remove('active');
			});
            
            // Set new selection
            frame.classList.add('active');
            selectedFrame = frame;
		}
	});
});

function getSelectedFrameWrapper() {
    if (!selectedFrame) return null;
    return selectedFrame.closest('.image-animator-timeline-wrapper');
}
function setupUploadBox(uploadBoxId, inputId, type) {
    const uploadBox = document.getElementById(uploadBoxId);
    const fileInput = document.getElementById(inputId);
    const loadingIndicator = uploadBox.querySelector('.image-animator-upload-loading');
    
    // Click handler
    uploadBox.addEventListener('click', () => fileInput.click());
    
    // File input handler
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files, type, uploadBox, loadingIndicator);
	});
    
    // Drag and drop handlers
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.classList.add('image-animator-drag-over');
	});
    
    uploadBox.addEventListener('dragleave', () => {
        uploadBox.classList.remove('image-animator-drag-over');
	});
    
    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.classList.remove('image-animator-drag-over');
        
        if (e.dataTransfer.items) {
            // Handle folder upload
            const items = e.dataTransfer.items;
            const files = [];
            
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.kind === 'file') {
                    const entry = item.webkitGetAsEntry();
                    if (entry) {
                        traverseFileTree(entry, files);
					}
				}
			}
            
            if (files.length > 0) {
                handleFiles(files, type, uploadBox, loadingIndicator);
			}
			} else {
            // Handle regular file drop
            handleFiles(e.dataTransfer.files, type, uploadBox, loadingIndicator);
		}
	});
}

// Recursive function to handle folder uploads
function traverseFileTree(entry, files) {
    if (entry.isFile) {
        entry.file(file => files.push(file));
		} else if (entry.isDirectory) {
        const reader = entry.createReader();
        reader.readEntries(entries => {
            entries.forEach(entry => traverseFileTree(entry, files));
		});
	}
}
function handleFiles(files, type, uploadBox, loadingIndicator) {
    loadingIndicator.style.display = 'flex';
    
    setTimeout(() => {
        try {
            const validFiles = Array.from(files).filter(file => {
                if (type === 'images') {
                    return file.type.startsWith('image/') && 
					['image/png', 'image/jpeg', 'image/jpg'].includes(file.type);
					} else if (type === 'effects') {
                    return file.type.startsWith('image/');
					} else if (type === 'sounds') {
                    return file.type.startsWith('audio/') || 
					['audio/ogg', 'audio/wav', 'audio/mpeg'].includes(file.type);
				}
                return false;
			});
            
            if (validFiles.length === 0) {
                throw new Error(i18n.t('image_animator.upload_error'));
			}
            
            // Store files in appropriate array
            const targetArray = 
			type === 'images' ? uploadedImages : 
			type === 'effects' ? uploadedEffects : 
			uploadedSounds;
            
            // Clear the array first
            targetArray.length = 0;
            
            const timeline = getTimeline(type);
            clearTimeline(type, timeline);
            
            validFiles.forEach((file, index) => {
                const frameNumber = index + 1;
                const frame = createTimelineFrame(file, type, frameNumber);
                timeline.appendChild(frame);
                targetArray.push(file);
			});
            
            // Immediately synchronize all timelines
            synchronizeTimelines();
            
            // Show success message
            console.log(i18n.t('image_animator.upload_success'));
            
			} catch (error) {
            console.error(`Error processing ${type} files:`, error);
            alert(error.message || i18n.t('image_animator.upload_error'));
			} finally {
            loadingIndicator.style.display = 'none';
            saveState(); // Save state after synchronization
		}
	}, 1000);
}

function clearTimeline(type, timeline) {
	// Clear arrays
	if (type === 'images') uploadedImages = [];
	else if (type === 'effects') uploadedEffects = [];
	else uploadedSounds = [];
	
	// Revoke existing object URLs
	const frames = timeline.querySelectorAll('.image-animator-timeline-frame');
	frames.forEach(frame => {
		const img = frame.querySelector('img');
		if (img) URL.revokeObjectURL(img.src);
	});
	
	// Clear timeline
	timeline.innerHTML = '';
}

function getTimeline(type) {
	if (type === 'images') return document.getElementById('imagesTimeline');
	if (type === 'effects') return document.getElementById('effectsTimeline');
	return document.getElementById('soundsTimeline');
}

function createTimelineFrame(file, type, frameNumber) {
	const frameWrapper = document.createElement('div');
	frameWrapper.className = 'image-animator-timeline-wrapper';
	
	// Frame container
	const frame = document.createElement('div');
	frame.className = 'image-animator-timeline-frame';
	if (!file) frame.classList.add('empty');
	
	// Frame number
	const frameNumberElement = document.createElement('span');
	frameNumberElement.className = 'image-animator-timeline-frame-number';
	frameNumberElement.textContent = frameNumber;
	frame.appendChild(frameNumberElement);
	
	// Add draggable attribute and unique ID
	frame.setAttribute('draggable', 'true');
	frame.dataset.frameId = `frame-${Date.now()}-${frameNumber}`;
	
	// Handle file content or empty state
	
    
    if (file) {
        // Filename element
        const fileName = document.createElement('div');
        fileName.className = 'image-animator-filename';
        fileName.textContent = file.name;
        frameWrapper.appendChild(fileName);
        
        // Store filename in frame dataset
        frame.dataset.filename = file.name;
		
		if (type === 'images' || type === 'effects') {
			const img = document.createElement('img');
			img.src = URL.createObjectURL(file);
			img.alt = file.name;
			frame.appendChild(img);
			} else {
			const icon = document.createElement('div');
			icon.className = 'image-animator-sound-icon';
			icon.innerHTML = `
			<svg viewBox="0 0 24 24">
			<path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/>
			</svg>
			`;
			frame.appendChild(icon);
		}
		} else {
		const emptyText = document.createElement('div');
		emptyText.className = 'image-animator-empty-text';
		emptyText.dataset.i18n = type === 'sounds' ? 
		'image_animator.empty_sound' : 
		'image_animator.empty_frame';
		emptyText.textContent = i18n.t(type === 'sounds' ? 
			'image_animator.empty_sound' : 
		'image_animator.empty_frame');
		frame.appendChild(emptyText);
	}
	
	frameWrapper.appendChild(frame);
	return frameWrapper;
}
function synchronizeTimelines() {
	try {
		const imagesTimeline = document.getElementById('imagesTimeline');
		const effectsTimeline = document.getElementById('effectsTimeline');
		const soundsTimeline = document.getElementById('soundsTimeline');
		
		const counts = {
			images: imagesTimeline.querySelectorAll('.image-animator-timeline-wrapper').length,
			effects: effectsTimeline.querySelectorAll('.image-animator-timeline-wrapper').length,
			sounds: soundsTimeline.querySelectorAll('.image-animator-timeline-wrapper').length
		};
		
		const maxFrames = Math.max(counts.images, counts.effects, counts.sounds);
		
		// Add empty frames where needed
		ensureFrameCount(imagesTimeline, 'images', maxFrames);
		ensureFrameCount(effectsTimeline, 'effects', maxFrames);
		ensureFrameCount(soundsTimeline, 'sounds', maxFrames);
		
		// Update frame numbers
		updateFrameNumbers(imagesTimeline);
		updateFrameNumbers(effectsTimeline);
		updateFrameNumbers(soundsTimeline);
		} catch (error) {
		console.error('Error synchronizing timelines:', error);
	}
}

function ensureFrameCount(timeline, type, targetCount) {
	const currentCount = timeline.querySelectorAll('.image-animator-timeline-wrapper').length;
	
	if (currentCount < targetCount) {
		for (let i = currentCount; i < targetCount; i++) {
			const frame = createTimelineFrame(null, type, i + 1);
			timeline.appendChild(frame);
		}
	}
}
// Initialize drag and drop for timelines
function initTimelineDragDrop() {
	const timelines = [
		document.getElementById('imagesTimeline'),
		document.getElementById('effectsTimeline'),
		document.getElementById('soundsTimeline')
	];
	
	timelines.forEach(timeline => {
		// Make frames draggable
		timeline.addEventListener('dragstart', e => {
			const frame = e.target.closest('.image-animator-timeline-frame');
			if (frame) {
				e.target.classList.add('dragging');
				e.dataTransfer.setData('text/plain', frame.dataset.frameId);
				e.dataTransfer.effectAllowed = 'move';
				
				// Add visual feedback
				frame.classList.add('dragging');
			}
		});
		
		// Handle drag over - more generous drop targets
		timeline.addEventListener('dragover', e => {
			e.preventDefault();
			const afterElement = getDragAfterElement(timeline, e.clientX);
			const draggable = document.querySelector('.dragging');
			
			if (!draggable) return;
			
			// Remove previous drop targets
			timeline.querySelectorAll('.image-animator-timeline-wrapper.drop-target').forEach(el => {
				el.classList.remove('drop-target');
			});
			
			// Set new drop target with larger area
			if (afterElement) {
				afterElement.classList.add('drop-target');
			}
		});
		
		// Handle drop
		timeline.addEventListener('drop', e => {
			e.preventDefault();
			const frameId = e.dataTransfer.getData('text/plain');
			const draggable = document.querySelector(`.image-animator-timeline-frame[data-frame-id="${frameId}"]`);
			
			if (!draggable || !draggable.classList.contains('dragging')) return;
			
			const afterElement = getDragAfterElement(timeline, e.clientX);
			const wrapper = draggable.closest('.image-animator-timeline-wrapper');
			
			if (afterElement) {
				timeline.insertBefore(wrapper, afterElement);
				} else {
				timeline.appendChild(wrapper);
			}
			
			// Update frame numbers
			updateFrameNumbers(timeline);
			
			// Clean up
			draggable.classList.remove('dragging');
			timeline.querySelectorAll('.drop-target').forEach(el => {
				el.classList.remove('drop-target');
			});
		});
		
		// Handle drag end
		timeline.addEventListener('dragend', e => {
			const frames = document.querySelectorAll('.image-animator-timeline-frame');
			frames.forEach(frame => {
				frame.classList.remove('dragging', 'drop-target');
			});
			
			timeline.querySelectorAll('.image-animator-timeline-wrapper.drop-target').forEach(wrapper => {
				wrapper.classList.remove('drop-target');
			});
		});
	});
}

// Helper to determine drop position
function getDragAfterElement(timeline, x) {
	const wrappers = [...timeline.querySelectorAll('.image-animator-timeline-wrapper:not(.dragging)')];
	
	return wrappers.reduce((closest, wrapper) => {
		const box = wrapper.getBoundingClientRect();
		const offset = x - box.left - box.width / 2;
		
		if (offset < 0 && offset > closest.offset) {
			return { offset: offset, element: wrapper };
			} else {
			return closest;
		}
	}, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Update frame numbers in a timeline
function updateFrameNumbers(timeline) {
	const wrappers = timeline.querySelectorAll('.image-animator-timeline-wrapper');
	wrappers.forEach((wrapper, index) => {
		const frame = wrapper.querySelector('.image-animator-timeline-frame');
		const frameNumber = index + 1;
		
		// Update frame number display
		frame.querySelector('.image-animator-timeline-frame-number').textContent = frameNumber;
		
		// Update data attribute
		frame.dataset.frameId = `frame-${Date.now()}-${frameNumber}`;
	});
}
function initHistory() {
	history = [];
	currentHistoryIndex = -1;
	saveState();
}

function saveState() {
	// Remove any future states if we're not at the end
	if (currentHistoryIndex < history.length - 1) {
		history = history.slice(0, currentHistoryIndex + 1);
	}
	
	// Capture current state
	const state = {
		images: [...uploadedImages],
		effects: [...uploadedEffects],
		sounds: [...uploadedSounds],
		frameNumbers: getCurrentFrameNumbers()
	};
	
	history.push(state);
	currentHistoryIndex = history.length - 1;
	
	updateUndoRedoButtons();
}

function getCurrentFrameNumbers() {
	return {
		images: document.querySelectorAll('#imagesTimeline .image-animator-timeline-frame-number').length,
		effects: document.querySelectorAll('#effectsTimeline .image-animator-timeline-frame-number').length,
		sounds: document.querySelectorAll('#soundsTimeline .image-animator-timeline-frame-number').length
	};
}

function restoreState(state) {
	// Restore media arrays
	uploadedImages = [...state.images];
	uploadedEffects = [...state.effects];
	uploadedSounds = [...state.sounds];
	
	// Restore timelines
	restoreTimeline('images', state.frameNumbers.images);
	restoreTimeline('effects', state.frameNumbers.effects);
	restoreTimeline('sounds', state.frameNumbers.sounds);
}

function restoreTimeline(type, frameCount) {
	const timeline = getTimeline(type);
	clearTimeline(type, timeline);
	
	// Get the target array for this type
	const targetArray = 
	type === 'images' ? uploadedImages : 
	type === 'effects' ? uploadedEffects : 
	uploadedSounds;
	
	// Rebuild frames
	for (let i = 0; i < frameCount; i++) {
		const file = targetArray[i];
		const frame = createTimelineFrame(file, type, i + 1);
		timeline.appendChild(frame);
	}
}

function undo() {
	try {
		if (currentHistoryIndex > 0) {
			currentHistoryIndex--;
			restoreState(history[currentHistoryIndex]);
		}
		updateUndoRedoButtons();
		} catch (error) {
		console.error('Error in undo:', error);
		alert(i18n.t('image_animator.undo_error'));
		} finally {
		synchronizeTimelines();
	}
}

function redo() {
	try {
		if (currentHistoryIndex < history.length - 1) {
			currentHistoryIndex++;
			restoreState(history[currentHistoryIndex]);
		}
		updateUndoRedoButtons();
		} catch (error) {
		console.error('Error in redo:', error);
		alert(i18n.t('image_animator.redo_error'));
		} finally {
		synchronizeTimelines();
	}
}

function updateUndoRedoButtons() {
	const undoBtn = document.querySelector('[onclick="undo()"]');
	const redoBtn = document.querySelector('[onclick="redo()"]');
	
	if (undoBtn) {
		undoBtn.disabled = currentHistoryIndex <= 0;
		undoBtn.style.opacity = undoBtn.disabled ? '0.5' : '1';
	}
	
	if (redoBtn) {
		redoBtn.disabled = currentHistoryIndex >= history.length - 1;
		redoBtn.style.opacity = redoBtn.disabled ? '0.5' : '1';
	}
}
// Toggle how to use section
try {
	const howToUse = document.getElementById('howToUse');
	const description = document.querySelector('.image-animator-description');
	
	howToUse.addEventListener('click', () => {
		try {
			if (description.style.display === 'none') {
				description.style.display = 'block';
				howToUse.querySelector('.image-animator-expand-collapse').textContent = 
				i18n.t('image_animator.collapse_indicator');
				} else {
				description.style.display = 'none';
				howToUse.querySelector('.image-animator-expand-collapse').textContent = 
				i18n.t('image_animator.expand_indicator');
			}
			} catch (error) {
			console.error('Error in howToUse click handler:', error);
		}
	});
	} catch (error) {
	console.error('Error initializing howToUse section:', error);
}

// Frame selection in timeline
try {
	const frames = document.querySelectorAll('.image-animator-timeline-frame');
	frames.forEach(frame => {
		frame.addEventListener('click', () => {
			try {
				const timeline = frame.closest('.image-animator-timeline-frames');
				timeline.querySelectorAll('.image-animator-timeline-frame').forEach(f => {
					f.classList.remove('active');
				});
				frame.classList.add('active');
				} catch (error) {
				console.error('Error in frame selection:', error);
			}
		});
	});
	} catch (error) {
	console.error('Error initializing frame selection:', error);
}

// Animation speed control
const speedSlider = document.getElementById('speedSlider');
speedSlider.addEventListener('input', () => {
    try {
        animationSpeed = parseInt(speedSlider.value);
        // If animation is playing, restart it to apply new speed
        if (isPlaying) {
            const canvas = document.querySelector('.image-animator-preview-display canvas');
            if (canvas) {
                pauseAnimation();
                playAnimation();
            }
        }
    } catch (error) {
        console.error('Error in speed slider handler:', error);
    }
});

// Timeline duration controls
try {
	const startTimeInput = document.getElementById('startTime');
	const durationTimeInput = document.getElementById('durationTime');
	
	startTimeInput.addEventListener('change', () => {
		try {
			console.log(`Start time changed to: ${startTimeInput.value}`);
			} catch (error) {
			console.error('Error in start time input:', error);
		}
	});
	
durationTimeInput.addEventListener('change', () => {
    try {
        // If animation is playing, restart it to apply new duration
        if (isPlaying) {
            const canvas = document.querySelector('.image-animator-preview-display canvas');
            if (canvas) {
                pauseAnimation();
                playAnimation();
            }
        }
    } catch (error) {
        console.error('Error in duration input:', error);
    }
});
	} catch (error) {
	console.error('Error initializing timeline controls:', error);
}

// Placeholder functions
function playAnimation() {
    try {
        const previewDisplay = document.querySelector('.image-animator-preview-display');
        if (!previewDisplay) {
            throw new Error('Preview display element not found');
        }

        // Clear any existing content
        previewDisplay.innerHTML = '';
        
        const canvas = setupAnimationPreview();
        updateAnimation(canvas);
        
        // Update status text if the placeholder exists
        const placeholder = previewDisplay.querySelector('.image-animator-preview-placeholder');
        if (placeholder) {
            placeholder.textContent = i18n.t('image_animator.playing_status');
        }
    } catch (error) {
        console.error('Error in playAnimation:', error);
        alert(i18n.t('image_animator.play_error'));
    }
}


function pauseAnimation() {
    try {
        if (animationInterval) {
            clearInterval(animationInterval);
            animationInterval = null;
            isPlaying = false;
            
            const placeholder = document.querySelector('.image-animator-preview-display .image-animator-preview-placeholder');
            if (placeholder) {
                placeholder.textContent = i18n.t('image_animator.paused_status');
            }
        }
    } catch (error) {
        console.error('Error in pauseAnimation:', error);
    }
}

function reloadAnimation() {
    try {
        pauseAnimation();
        const previewDisplay = document.querySelector('.image-animator-preview-display');
        if (previewDisplay) {
            previewDisplay.innerHTML = '<div class="image-animator-preview-placeholder" data-i18n="image_animator.preview_status">Animation Preview</div>';
            currentFrameIndex = 0;
            
            const placeholder = previewDisplay.querySelector('.image-animator-preview-placeholder');
            if (placeholder) {
                placeholder.textContent = i18n.t('image_animator.preview_status');
            }
        }
    } catch (error) {
        console.error('Error in reloadAnimation:', error);
    }
}

function addFrame() {
    try {
        const timelines = [
            document.getElementById('imagesTimeline'),
            document.getElementById('effectsTimeline'),
            document.getElementById('soundsTimeline')
		];
		
        timelines.forEach(timeline => {
            const wrapperCount = timeline.querySelectorAll('.image-animator-timeline-wrapper').length;
            const frameNumber = wrapperCount + 1;
            
            const wrapper = document.createElement('div');
            wrapper.className = 'image-animator-timeline-wrapper';
            
            const fileName = document.createElement('div');
            fileName.className = 'image-animator-filename';
            fileName.textContent = i18n.t('image_animator.new_frame', {frameNumber});
            fileName.dataset.i18n = "image_animator.new_frame";
            wrapper.appendChild(fileName);
            
            const frame = document.createElement('div');
            frame.className = 'image-animator-timeline-frame empty';
            frame.dataset.frameId = `frame-${Date.now()}-${frameNumber}`;
            
            const frameNumberElement = document.createElement('span');
            frameNumberElement.className = 'image-animator-timeline-frame-number';
            frameNumberElement.textContent = frameNumber;
            frame.appendChild(frameNumberElement);
            
            const emptyText = document.createElement('div');
            emptyText.className = 'image-animator-empty-text';
            emptyText.dataset.i18n = "image_animator.empty_frame";
            emptyText.textContent = i18n.t('image_animator.empty_frame');
            frame.appendChild(emptyText);
            
            // Make draggable
            frame.setAttribute('draggable', 'true');
            
            wrapper.appendChild(frame);
            timeline.appendChild(wrapper);
		});
        
        // Add to history
        saveState();
        
        // Update frame numbers
        synchronizeTimelines();
		} catch (error) {
        console.error('Error in addFrame:', error);
        alert(i18n.t('image_animator.add_frame_error'));
	}
}

function removeFrame() {
    try {
        if (!selectedFrame) {
            alert(i18n.t('image_animator.no_frame_selected'));
            return;
		}
        
        const wrapper = getSelectedFrameWrapper();
        if (!wrapper) return;
        
        // Remove from all timelines
        const frameNumber = parseInt(
            wrapper.querySelector('.image-animator-timeline-frame-number').textContent
		);
        
        const timelines = [
            document.getElementById('imagesTimeline'),
            document.getElementById('effectsTimeline'),
            document.getElementById('soundsTimeline')
		];
        
        timelines.forEach(timeline => {
            const wrappers = timeline.querySelectorAll('.image-animator-timeline-wrapper');
            if (wrappers.length >= frameNumber) {
                wrappers[frameNumber - 1].remove();
			}
		});
        
        // Clear selection
        selectedFrame = null;
        
        // Update frame numbers
        synchronizeTimelines();
        saveState();
		} catch (error) {
        console.error('Error in removeFrame:', error);
        alert(i18n.t('image_animator.remove_frame_error'));
	}
}

function duplicateFrame() {
    try {
        if (!selectedFrame) {
            alert(i18n.t('image_animator.no_frame_selected'));
            return;
		}
        
        const wrapper = getSelectedFrameWrapper();
        if (!wrapper) return;
        
        const frameNumber = parseInt(
            wrapper.querySelector('.image-animator-timeline-frame-number').textContent
		);
        
        const timelines = [
            document.getElementById('imagesTimeline'),
            document.getElementById('effectsTimeline'),
            document.getElementById('soundsTimeline')
		];
        
        timelines.forEach(timeline => {
            const wrappers = timeline.querySelectorAll('.image-animator-timeline-wrapper');
            if (wrappers.length >= frameNumber) {
                const original = wrappers[frameNumber - 1];
                const clone = original.cloneNode(true);
                
                // Update frame ID
                const frame = clone.querySelector('.image-animator-timeline-frame');
                frame.dataset.frameId = `frame-${Date.now()}-${frameNumber + 1}`;
                
                // Insert after original
                if (original.nextElementSibling) {
                    timeline.insertBefore(clone, original.nextElementSibling);
					} else {
                    timeline.appendChild(clone);
				}
			}
		});
        
        // Update frame numbers
        synchronizeTimelines();
        saveState();
		} catch (error) {
        console.error('Error in duplicateFrame:', error);
        alert(i18n.t('image_animator.duplicate_frame_error'));
	}
}

function reverseOrder() {
	try {
		console.log("Reverse order");
		const timelines = [
			document.getElementById('imagesTimeline'),
			document.getElementById('effectsTimeline'),
			document.getElementById('soundsTimeline')
		];
		
		timelines.forEach(timeline => {
			const frames = Array.from(timeline.children);
			timeline.innerHTML = '';
			frames.reverse().forEach(frame => timeline.appendChild(frame));
		});
		} catch (error) {
		console.error('Error in reverseOrder:', error);
	}
	synchronizeTimelines();
	saveState();
}

function setupAnimationPreview() {
    const previewDisplay = document.querySelector('.image-animator-preview-display');
    previewDisplay.innerHTML = ''; // Clear previous content
    
    // Create canvas for animation
    const canvas = document.createElement('canvas');
    canvas.width = 300; // Default size, can be adjusted
    canvas.height = 300;
    canvas.style.maxWidth = '100%';
    canvas.style.borderRadius = '8px';
    previewDisplay.appendChild(canvas);
    
    return canvas;
}

function getCurrentFrame(type, index) {
    const timeline = getTimeline(type);
    const wrappers = timeline.querySelectorAll('.image-animator-timeline-wrapper');
    
    if (index >= wrappers.length) return null;
    
    const frame = wrappers[index].querySelector('.image-animator-timeline-frame');
    if (!frame) return null;
    
    if (type === 'sounds') {
        const soundIndex = uploadedSounds.findIndex(s => s?.name === frame.dataset.filename);
        return soundIndex >= 0 ? uploadedSounds[soundIndex] : null;
    } else {
        const img = frame.querySelector('img');
        return img ? img.src : null;
    }
}

function drawAnimationFrame(canvas, ctx, frameIndex) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw base image
    const imageSrc = getCurrentFrame('images', frameIndex);
    if (imageSrc) {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
            const width = img.width * scale;
            const height = img.height * scale;
            const x = (canvas.width - width) / 2;
            const y = (canvas.height - height) / 2;
            ctx.drawImage(img, x, y, width, height);
            
            // Draw effects on top
            const effectSrc = getCurrentFrame('effects', frameIndex);
            if (effectSrc) {
                const effectImg = new Image();
                effectImg.src = effectSrc;
                effectImg.onload = () => {
                    ctx.drawImage(effectImg, x, y, width, height);
                };
            }
        };
    }
    
    // Play sound if available
    const soundFile = getCurrentFrame('sounds', frameIndex);
    if (soundFile) {
        const audio = new Audio(URL.createObjectURL(soundFile));
        audio.play().catch(e => console.error('Sound playback failed:', e));
    }
}

function updateAnimation(canvas) {
    const ctx = canvas.getContext('2d');
    const durationInput = document.getElementById('durationTime');
    const speedSlider = document.getElementById('speedSlider');
    
    // Calculate frame duration based on input and speed
    const baseDuration = parseInt(durationInput.value) || 200;
    const speedFactor = 1 + (10 - parseInt(speedSlider.value)) * 0.2; // Faster with higher speed value
    const frameDuration = baseDuration / speedFactor;
    
    // Get playback options
    animationLoop = document.querySelector('.image-animator-select:nth-of-type(1)').value;
    animationDirection = document.querySelector('.image-animator-select:nth-of-type(2)').value;
    
    // Clear any existing animation
    if (animationInterval) {
        clearInterval(animationInterval);
    }
    
    isPlaying = true;
    const imagesTimeline = document.getElementById('imagesTimeline');
    const frameCount = imagesTimeline.querySelectorAll('.image-animator-timeline-wrapper').length;
    
    if (frameCount === 0) {
        alert(i18n.t('image_animator.no_frames_to_play'));
        return;
    }
    
    let direction = 1; // 1 for forward, -1 for reverse
    
    animationInterval = setInterval(() => {
        drawAnimationFrame(canvas, ctx, currentFrameIndex);
        
        // Handle different playback directions
        if (animationDirection === 'alternate') {
            if (currentFrameIndex >= frameCount - 1) direction = -1;
            else if (currentFrameIndex <= 0) direction = 1;
            currentFrameIndex += direction;
        } else if (animationDirection === 'reverse') {
            currentFrameIndex = (currentFrameIndex - 1 + frameCount) % frameCount;
        } else { // forward
            currentFrameIndex = (currentFrameIndex + 1) % frameCount;
        }
        
        // Handle play once mode
        if (animationLoop === 'play_once' && 
            ((animationDirection === 'forward' && currentFrameIndex === 0) ||
             (animationDirection === 'reverse' && currentFrameIndex === frameCount - 1) ||
             (animationDirection === 'alternate' && currentFrameIndex === 0 && direction === 1))) {
            pauseAnimation();
        }
    }, frameDuration);
}
function exportGIF() {
	try {
		console.log("Export as GIF");
		alert(i18n.t('image_animator.gif_export_message'));
		} catch (error) {
		console.error('Error in exportGIF:', error);
	}
}

function exportWML() {
    try {
        // Get all frames from the timeline
        const imageWrappers = document.querySelectorAll('#imagesTimeline .image-animator-timeline-wrapper');
        const effectWrappers = document.querySelectorAll('#effectsTimeline .image-animator-timeline-wrapper');
        const soundWrappers = document.querySelectorAll('#soundsTimeline .image-animator-timeline-wrapper');
        
        if (imageWrappers.length === 0) {
            alert(i18n.t('image_animator.no_frames_to_export'));
            return;
        }
        
        // Start building WML content
        let wmlContent = "[animation]\n";
        
        // Process each frame
        for (let i = 0; i < imageWrappers.length; i++) {
            const imageFrame = imageWrappers[i].querySelector('.image-animator-timeline-frame');
            const effectFrame = effectWrappers[i]?.querySelector('.image-animator-timeline-frame');
            const soundFrame = soundWrappers[i]?.querySelector('.image-animator-timeline-frame');
            
            // Get image filename
            const imageSrc = imageFrame.querySelector('img')?.src;
            let imageName = "missing.png";
            if (imageSrc) {
                if (imageSrc.startsWith('blob:')) {
                    imageName = imageFrame.dataset.filename || `frame_${i+1}.png`;
                } else {
                    imageName = imageSrc.split('/').pop();
                }
            }
            
            // Get effect filename if exists
            let effectName = "";
            if (effectFrame) {
                const effectSrc = effectFrame.querySelector('img')?.src;
                if (effectSrc) {
                    if (effectSrc.startsWith('blob:')) {
                        effectName = effectFrame.dataset.filename || `effect_${i+1}.png`;
                    } else {
                        effectName = effectSrc.split('/').pop();
                    }
                }
            }
            
            // Get sound filename if exists
            let soundName = "";
            if (soundFrame) {
                soundName = soundFrame.dataset.filename || `sound_${i+1}.ogg`;
            }
            
            // Build frame content
            wmlContent += "    [frame]\n";
            wmlContent += `        image="${imageName}"\n`;
            if (effectName) {
                wmlContent += `        halo="${effectName}"\n`;
            }
            if (soundName) {
                wmlContent += `        sound="${soundName}"\n`;
            }
            wmlContent += "    [/frame]\n";
        }
        
        wmlContent += "[/animation]";
        
        // Create download link
        const blob = new Blob([wmlContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'animation.cfg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Update preview placeholder
        const placeholder = document.querySelector('.image-animator-export-option:nth-child(2) .image-animator-export-placeholder');
        if (placeholder) {
            placeholder.textContent = i18n.t('image_animator.wml_export_success');
            setTimeout(() => {
                placeholder.textContent = i18n.t('image_animator.export_preview');
            }, 3000);
        }
    } catch (error) {
        console.error('Error in exportWML:', error);
        alert(i18n.t('image_animator.wml_export_error'));
    }
}

function exportSpriteSheet() {
	try {
		console.log("Export as Sprite Sheet");
		alert(i18n.t('image_animator.spritesheet_export_message'));
		} catch (error) {
		console.error('Error in exportSpriteSheet:', error);
	}
}

// Collect all i18n keys and values
const translatableStrings = {
	
	image_animator: {
		title: "Wesnoth Animation Manager",
		subtitle: "Create professional battle animations for The Battle for Wesnoth with advanced tools and presets",
		collapse_indicator: "-",
		expand_indicator: "+",
		how_to_use: "How to Use the Wesnoth Animation Manager",
		description: "This tool allows you to create professional battle animations for The Battle for Wesnoth. Upload your images, special effects, and sounds, then arrange them on the timeline. Preview your animation and export it in your preferred format.",
		steps: "1. Upload your unit sprite images (PNG format with transparency)<br>2. Add special effects and sound files<br>3. Arrange your frames on the timeline<br>4. Preview the animation with playback controls<br>5. Export as GIF, WML, or sprite sheet",
		animation_setup: "Animation Setup",
		upload_images: "Drag & drop unit sprite images here or click to browse",
		image_hint: "Supports PNG with transparency - Max 10MB each",
		upload_effects: "Drag & drop special effects images here or click to browse",
		effects_hint: "Supports PNG with transparency - Max 10MB each",
		upload_sounds: "Drag & drop sounds here or click to browse",
		sounds_hint: "Supports OGG, WAV, MP3 - Max 10MB each",
		animation_preview: "Animation Preview",
		preview_placeholder: "Animation Preview",
		play: "Play",
		pause: "Pause",
		reload: "Reload",
		loop: "Loop",
		play_once: "Play Once",
		forward: "Forward",
		reverse: "Reverse",
		alternate: "Alternate",
		speed: "Speed:",
		animation_timeline: "Animation Timeline",
		add_frame: "Add Frame",
		remove_frame: "Remove Frame",
		duplicate_frame: "Duplicate Frame",
		reverse_order: "Reverse Order",
		start_time: "Start time:",
		duration_time: "Duration (ms):",
		images_line: "Images",
		effects_line: "Special Effects",
		sounds_line: "Sounds",
		exporting: "Export Your Animation",
		export_gif: "Export as GIF",
		export_gif_desc: "Animated GIF format for easy sharing",
		export_wml: "Export as WML",
		export_wml_desc: "Wesnoth Markup Language for game integration",
		export_sprite: "Export as Sprite Sheet",
		export_sprite_desc: "Sprite sheet for advanced animation control",
		export_preview: "Preview will appear here",
		download: "Download",
		playing_status: "Playing animation...",
		paused_status: "Animation paused",
		preview_status: "Animation Preview",
		gif_export_message: "GIF export functionality would be implemented here",
		wml_export_message: "WML export functionality would be implemented here",
		spritesheet_export_message: "Sprite sheet export functionality would be implemented here",
		uploading: "Uploading files...",
		upload_error: "No valid files found. Please upload supported file types.",
		upload_success: "Files uploaded successfully!",
		folder_upload: "Uploading folder...",
		frame_number: "Frame",
		filename: "Filename",
		drag_drop: "Drag to reorder frames",
		dragging: "Dragging frame",
		drag_drop_hint: "Drag frames to reorder",
		drag_active: "Dragging frame",
		drop_hint: "Drop to reorder",
		ruler_title: "Animation Timeline Ruler",
		undo: "Undo",
		redo: "Redo",
		undo_error: "Error undoing action",
		redo_error: "Error redoing action",
		ruler_title: "Animation Timeline Ruler",
		frame: "Frame",
		ms: "ms",
		empty_frame: "Empty",
		empty_image: "No image",
		empty_sound: "No sound",
		new_frame: "Frame {frameNumber}",
		no_frame_selected: "Please select a frame first",
		add_frame_error: "Error adding frame",
		remove_frame_error: "Error removing frame",
		duplicate_frame_error: "Error duplicating frame",
        no_frames_to_play: "No frames available to play. Please upload images first.",
        play_error: "Error playing animation",
        preview_status: "Animation Preview",
        playing_status: "Playing animation...",
        paused_status: "Animation paused",
        no_frames_to_export: "No frames available to export. Please upload images first.",
        wml_export_success: "WML exported successfully!",
        wml_export_error: "Error exporting WML. Please try again."
	}
};				