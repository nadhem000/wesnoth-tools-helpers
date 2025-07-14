document.addEventListener('DOMContentLoaded', function() {
	// DOM elements
	const directoryPathDisplay = document.getElementById('manager-sound-directory-path-display');
	const chooseDirectoryBtn = document.getElementById('manager-sound-choose-directory');
	const clearAllBtn = document.getElementById('manager-sound-clear-all');
	const sampleDataBtn = document.getElementById('manager-sound-sample-data');
	const loadSampleBtn = document.getElementById('manager-sound-load-sample');
	const directoriesContainer = document.getElementById('manager-sound-directories-container');
	const directoriesList = document.getElementById('manager-sound-directories-list');
	const notification = document.getElementById('manager-sound-notification');
	const statusMessage = document.getElementById('manager-sound-status-message');
	const soundCount = document.getElementById('manager-sound-sound-count');
	const progressBar = document.getElementById('manager-sound-loading-progress');
	const helpBtn = document.getElementById('manager-sound-help-btn');
	const organizationMethod = document.getElementById('manager-sound-organization-method');
	const soundFilter = document.getElementById('manager-sound-sound-filter');
	// NEW: Sound Modal Elements
	const soundModal = document.getElementById('manager-sound-modal');
	const closeModalBtn = document.querySelector('.manager-sound-close-modal');
	const modalSoundPath = document.getElementById('manager-sound-modal-sound-path');
	const modalSoundName = document.getElementById('manager-sound-modal-sound-name');
	const modalSoundType = document.getElementById('manager-sound-modal-sound-type');
	const modalSoundSize = document.getElementById('manager-sound-modal-sound-size');
	const modalSoundFormat = document.getElementById('manager-sound-modal-sound-format');
	const modalAudio = document.getElementById('manager-sound-modal-audio');
	const modalCopyPathBtn = document.getElementById('manager-sound-modal-copy-path');
	const modalDownloadBtn = document.getElementById('manager-sound-modal-download');
	const volumeControl = document.getElementById('manager-sound-volume-control');
	const playbackSpeed = document.getElementById('manager-sound-playback-speed');
	const saveChangesBtn = document.getElementById('manager-sound-save-changes');
	
	// State
	let directories = [];
	let soundExtensions = ['ogg', 'wav', 'mp3'];
	let currentOrganization = 'folder';
	let currentFilter = 'all';
	let editableNames = {};
	// Currently selected sound
	let currentSound = null;
	
	// Update status message
	function updateStatus(message, count = null) {
		statusMessage.textContent = message;
		if (count !== null) {
			soundCount.textContent = `${count} sounds loaded`;
		}
	}
	
	// Update progress bar
	function updateProgress(percent) {
		progressBar.style.width = `${percent}%`;
	}
	
	// Update directory display
	function updateDirectoryDisplay() {
		if (directories.length === 0) {
			directoryPathDisplay.textContent = "No directories selected";
			directoriesList.style.display = 'none';
			return;
		}
		
		if (directories.length === 1) {
			directoryPathDisplay.textContent = directories[0].name;
			directoriesList.style.display = 'none';
			} else {
			directoryPathDisplay.textContent = `${directories.length} directories selected`;
			directoriesList.style.display = 'block';
			
			// Update directories list
			directoriesList.innerHTML = '';
			directories.forEach(dir => {
				const dirItem = document.createElement('div');
				dirItem.className = 'manager-sound-directory-item';
				dirItem.innerHTML = `
				<div class="manager-sound-directory-item-name">${dir.name}</div>
				<button class="manager-sound-remove-directory-btn" data-id="${dir.id}">×</button>
				`;
				directoriesList.appendChild(dirItem);
			});
			
			// Add event listeners to remove buttons
			document.querySelectorAll('.manager-sound-remove-directory-btn').forEach(btn => {
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
				showNotification('Directory already added!');
				return;
			}
			
			// Create directory object
			const directory = {
				id: Date.now().toString(),
				handle: handle,
				name: handle.name,
				sounds: []
			};
			
			// Add to state
			directories.push(directory);
			updateDirectoryDisplay();
			
			// Start loading
			updateStatus(`Loading ${directory.name}...`);
			updateProgress(10);
			
			// Scan for sounds
			updateStatus(`Scanning ${directory.name} for sounds...`);
			await scanDirectoryForSounds(directory, handle);
			
			// Render directories
			renderDirectories();
			
			// Update status
			const totalSounds = directories.reduce((sum, dir) => sum + dir.sounds.length, 0);
			updateStatus('Directory loaded successfully', totalSounds);
			updateProgress(100);
			
			// Show notification
			showNotification(`Added directory: ${directory.name} with ${directory.sounds.length} sounds`);
			} catch (error) {
			if (error.name !== 'AbortError') {
				updateStatus('Error: ' + error.message);
				showNotification('Failed to load directory');
				console.error(error);
			}
		}
	}
	
	// Recursive function to scan directory for sounds
	async function scanDirectoryForSounds(directory, handle) {
		const soundFiles = [];
		let soundCount = 0;
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
				
				if (soundExtensions.includes(extension)) {
					soundCount++;
					const url = URL.createObjectURL(file);
					
					// Determine sound type based on directory path
					let type = 'effects';
					if (directory.name.toLowerCase().includes('music')) type = 'music';
					if (directory.name.toLowerCase().includes('voices') || 
					directory.name.toLowerCase().includes('speech')) type = 'voices';
					
					directory.sounds.push({
						id: Date.now().toString() + soundCount,
						name: entry.name,
						path: `${directory.name}/${entry.name}`,
						url: url,
						size: file.size,
						lastModified: file.lastModified,
						type: type,
						duration: 0,
						file: file  // Store file object for downloading
					});
					
					updateStatus(`Loading sounds (${soundCount} found in ${directory.name})...`);
				}
				} else if (entry.kind === 'directory') {
				// Recursively scan subdirectories
				await scanDirectoryForSounds(directory, entry);
			}
		}
	}
	
	// Remove directory function
	function removeDirectory(id) {
		const directory = directories.find(dir => dir.id === id);
		if (!directory) return;
		
		// Revoke object URLs to free memory
		directory.sounds.forEach(sound => {
			URL.revokeObjectURL(sound.url);
		});
		
		directories = directories.filter(dir => dir.id !== id);
		updateDirectoryDisplay();
		renderDirectories();
		
		const totalSounds = directories.reduce((sum, dir) => sum + dir.sounds.length, 0);
		updateStatus('Directory removed', totalSounds);
		showNotification('Directory removed');
	}
	
	// Copy sound path function
	function copySoundPath(path) {
		navigator.clipboard.writeText(path).then(() => {
			showNotification('Path copied to clipboard!');
		});
	}
	
	// Show notification
	function showNotification(message) {
		notification.querySelector('span').textContent = message;
		notification.classList.add('show');
		
		setTimeout(() => {
			notification.classList.remove('show');
		}, 3000);
	}
	
	// Group sounds by type
	function groupByType(sounds) {
		const groups = {
			effects: { name: "Sound Effects", sounds: [] },
			music: { name: "Music", sounds: [] },
			voices: { name: "Voice Acting", sounds: [] }
		};
		
		sounds.forEach(sound => {
			if (groups[sound.type]) {
				groups[sound.type].sounds.push(sound);
				} else {
				groups.effects.sounds.push(sound);
			}
		});
		
		return Object.values(groups).filter(group => group.sounds.length > 0);
	}
	
	// Group sounds by size
	function groupBySize(sounds) {
		const groups = {
			small: { name: "Small (< 100KB)", sounds: [] },
			medium: { name: "Medium (100KB - 1MB)", sounds: [] },
			large: { name: "Large (> 1MB)", sounds: [] }
		};
		
		sounds.forEach(sound => {
			if (sound.size < 100 * 1024) {
				groups.small.sounds.push(sound);
				} else if (sound.size < 1024 * 1024) {
				groups.medium.sounds.push(sound);
				} else {
				groups.large.sounds.push(sound);
			}
		});
		
		return Object.values(groups).filter(group => group.sounds.length > 0);
	}
	
	// Group sounds by date
	function groupByDate(sounds) {
		const groups = {};
		
		sounds.forEach(sound => {
			const date = new Date(sound.lastModified);
			const dateStr = date.toLocaleDateString();
			
			if (!groups[dateStr]) {
				groups[dateStr] = {
					name: dateStr,
					sounds: []
				};
			}
			groups[dateStr].sounds.push(sound);
		});
		
		return Object.values(groups);
	}
	
	// NEW: Function to open sound modal
	function openSoundModal(sound) {
		currentSound = sound;
		
		// Set modal content
		modalSoundPath.textContent = sound.path;
		modalSoundName.textContent = editableNames[sound.id] || sound.name;
		modalSoundType.textContent = sound.type.charAt(0).toUpperCase() + sound.type.slice(1);
		modalSoundSize.textContent = formatFileSize(sound.size);
		modalSoundFormat.textContent = sound.url.split('.').pop().toUpperCase();
		
		// Set audio player
		modalAudio.src = sound.url;
		modalAudio.load();
		
		// Open modal
		soundModal.classList.add('show');
		document.body.style.overflow = 'hidden';
	}
	
	// NEW: Close modal function
	function closeSoundModal() {
		soundModal.classList.remove('show');
		document.body.style.overflow = 'auto';
		
		// Pause audio when closing modal
		if (modalAudio) {
			modalAudio.pause();
		}
	}
	
	// NEW: Event listeners for modal
	closeModalBtn.addEventListener('click', closeSoundModal);
	
	soundModal.addEventListener('click', function(e) {
		if (e.target === soundModal) {
			closeSoundModal();
		}
	});
	
	// NEW: Volume control
	volumeControl.addEventListener('input', function() {
		modalAudio.volume = parseFloat(this.value);
	});
	
	// NEW: Playback speed control
	playbackSpeed.addEventListener('change', function() {
		modalAudio.playbackRate = parseFloat(this.value);
	});
	
	// NEW: Copy path from modal
	modalCopyPathBtn.addEventListener('click', function() {
		copySoundPath(currentSound.path);
	});
	
	// NEW: Download sound
	modalDownloadBtn.addEventListener('click', async function() {
		// Get processing settings
		const settings = {
			pitch: parseFloat(document.getElementById('manager-sound-pitch-shift').value),
			bass: parseInt(document.getElementById('manager-sound-bass-boost').value),
			treble: parseInt(document.getElementById('manager-sound-treble-boost').value),
			reverb: parseInt(document.getElementById('manager-sound-reverb').value),
			normalize: document.getElementById('manager-sound-normalize').checked,
			reverse: document.getElementById('manager-sound-reverse').checked
		};
		
		// Show processing indicator
		const originalText = this.textContent;
		this.textContent = 'Processing...';
		this.disabled = true;
		
		try {
			// Get the audio file
			const response = await fetch(currentSound.url);
			const arrayBuffer = await response.arrayBuffer();
			
			// Decode audio data
			const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
			const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
			
			// Process the audio
			const processedBuffer = await processSound(audioBuffer, settings);
			
			// Convert to WAV
			const wavBlob = bufferToWav(processedBuffer);
			
			// Create download link
			const a = document.createElement('a');
			const fileName = currentSound.name.replace(/\.[^/.]+$/, "") + '_processed.wav';
			a.href = URL.createObjectURL(wavBlob);
			a.download = fileName;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			
			// Clean up
			setTimeout(() => URL.revokeObjectURL(a.href), 1000);
			showNotification('Processed sound downloaded');
            } catch (error) {
			console.error('Sound processing failed:', error);
			showNotification('Error processing sound');
            } finally {
			// Restore button
			this.textContent = originalText;
			this.disabled = false;
		}
	});
	
	// NEW: Audio processing functions
	async function processSound(audioBuffer, settings) {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create offline context for processing
        const sampleRate = audioBuffer.sampleRate;
        const frameCount = Math.floor(audioBuffer.duration * sampleRate);
        const offlineCtx = new OfflineAudioContext(
            audioBuffer.numberOfChannels,
            frameCount,
            sampleRate
		);
        
        // Create source
        const source = offlineCtx.createBufferSource();
        
        // Apply reverse if needed
        if (settings.reverse) {
            // Create reversed buffer using offline context
            const reversed = offlineCtx.createBuffer(
                audioBuffer.numberOfChannels,
                audioBuffer.length,
                audioBuffer.sampleRate
			);
            
            for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
                const original = audioBuffer.getChannelData(i);
                const reversedData = reversed.getChannelData(i);
                
                for (let j = 0; j < audioBuffer.length; j++) {
                    reversedData[j] = original[audioBuffer.length - 1 - j];
				}
			}
            source.buffer = reversed;
			} else {
            source.buffer = audioBuffer;
		}
        
        // Create processing nodes
        const compressor = offlineCtx.createDynamicsCompressor();
        const filterLow = offlineCtx.createBiquadFilter();
        const filterHigh = offlineCtx.createBiquadFilter();
        const convolver = offlineCtx.createConvolver();
        
        // Set up processing chain
        source.connect(filterLow);
        filterLow.connect(filterHigh);
        filterHigh.connect(compressor);
        
        // Apply effects
        // Pitch shifting
        source.playbackRate.value = settings.pitch;
        
        // Bass boost
        filterLow.type = "lowshelf";
        filterLow.frequency.value = 320.0;
        filterLow.gain.value = settings.bass / 20;
        
        // Treble boost
        filterHigh.type = "highshelf";
        filterHigh.frequency.value = 3200.0;
        filterHigh.gain.value = settings.treble / 20;
        
        // Normalization
        if (settings.normalize) {
            compressor.threshold.value = -24;
            compressor.knee.value = 30;
            compressor.ratio.value = 12;
            compressor.attack.value = 0.01;
            compressor.release.value = 0.25;
			} else {
            compressor.threshold.value = 0;
            compressor.knee.value = 0;
            compressor.ratio.value = 1;
		}
        
        // Reverb
        if (settings.reverb > 0) {
            compressor.connect(convolver);
            convolver.connect(offlineCtx.destination);
            
            // Create impulse response for reverb using offline context
            const impulse = offlineCtx.createBuffer(2, sampleRate, sampleRate);
            const left = impulse.getChannelData(0);
            const right = impulse.getChannelData(1);
            
            // Create decaying noise
            for (let i = 0; i < sampleRate; i++) {
                left[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / sampleRate, 1.5);
                right[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / sampleRate, 1.5);
			}
            
            // Adjust reverb level
            const gainNode = offlineCtx.createGain();
            gainNode.gain.value = settings.reverb / 200;
            convolver.connect(gainNode);
            gainNode.connect(offlineCtx.destination);
            
            convolver.buffer = impulse;
			} else {
            compressor.connect(offlineCtx.destination);
		}
        
        // Start processing
        source.start();
        const processedBuffer = await offlineCtx.startRendering();
        
        return processedBuffer;
	}
	
	function reverseBuffer(buffer) {
		const reversed = buffer.context.createBuffer(
			buffer.numberOfChannels,
			buffer.length,
			buffer.sampleRate
		);
		
		for (let i = 0; i < buffer.numberOfChannels; i++) {
			const original = buffer.getChannelData(i);
			const reversedData = reversed.getChannelData(i);
			
			for (let j = 0; j < buffer.length; j++) {
				reversedData[j] = original[buffer.length - 1 - j];
			}
		}
		
		return reversed;
	}
	
	function bufferToWav(buffer) {
		const numChannels = buffer.numberOfChannels;
		const sampleRate = buffer.sampleRate;
		const format = 3; // float32
		const bitDepth = 32;
		
		let length = buffer.length * numChannels * (bitDepth / 8);
		const bufferLength = 44 + length;
		const arrayBuffer = new ArrayBuffer(bufferLength);
		const view = new DataView(arrayBuffer);
		
		// Write WAV header
		writeString(view, 0, 'RIFF');
		view.setUint32(4, 36 + length, true);
		writeString(view, 8, 'WAVE');
		writeString(view, 12, 'fmt ');
		view.setUint32(16, 16, true);
		view.setUint16(20, format, true);
		view.setUint16(22, numChannels, true);
		view.setUint32(24, sampleRate, true);
		view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
		view.setUint16(32, numChannels * (bitDepth / 8), true);
		view.setUint16(34, bitDepth, true);
		writeString(view, 36, 'data');
		view.setUint32(40, length, true);
		
		// Write audio data
		let offset = 44;
		for (let i = 0; i < buffer.length; i++) {
			for (let channel = 0; channel < numChannels; channel++) {
				const sample = buffer.getChannelData(channel)[i];
				view.setFloat32(offset, sample, true);
				offset += 4;
			}
		}
		
		return new Blob([view], { type: 'audio/wav' });
	}
	
	function writeString(view, offset, string) {
		for (let i = 0; i < string.length; i++) {
			view.setUint8(offset + i, string.charCodeAt(i));
		}
	}
	// NEW: Save changes
	saveChangesBtn.addEventListener('click', function() {
		// In a real app, you would save settings to storage
		showNotification('Sound settings saved');
	});
	// Render directories
	function renderDirectories() {
		if (directories.length === 0) {
			directoriesContainer.innerHTML = `
			<div class="manager-sound-empty-state">
			<h3>No directories added yet</h3>
			<p>Add directories containing your Wesnoth game sounds using the button above.</p>
			<div class="manager-sound-tooltip">
			<button class="manager-sound-btn manager-sound-btn-add" id="manager-sound-load-sample">Load Sample</button>
			<span class="manager-sound-tooltiptext">Load sample sounds</span>
			</div>
			</div>`;
			document.getElementById('manager-sound-load-sample').addEventListener('click', loadSampleData);
			updateStatus('Ready to load sounds', 0);
			updateProgress(0);
			return;
		}
		
		let html = '';
		let totalSounds = 0;
		
		// Get all sounds from all directories
		const allSounds = [];
		directories.forEach(dir => {
			allSounds.push(...dir.sounds);
		});
		totalSounds = allSounds.length;
		
		// Apply filter
		let filteredSounds = allSounds;
		if (currentFilter !== 'all') {
			filteredSounds = allSounds.filter(sound => sound.type === currentFilter);
		}
		
		// Apply organization method
		let groups = [];
		if (currentOrganization === 'folder') {
			// Group by folder
			groups = directories.map(dir => {
				return {
					name: dir.name,
					sounds: dir.sounds.filter(sound => filteredSounds.includes(sound)),
					id: dir.id
				};
			}).filter(group => group.sounds.length > 0);
			} else if (currentOrganization === 'type') {
			// Group by type
			groups = groupByType(filteredSounds);
			} else if (currentOrganization === 'size') {
			// Group by size
			groups = groupBySize(filteredSounds);
			} else if (currentOrganization === 'date') {
			// Group by date
			groups = groupByDate(filteredSounds);
		}
		
		// Render groups
		groups.forEach(group => {
			let soundsHtml = '';
			
			if (group.sounds.length === 0) {
				soundsHtml = `
				<div class="manager-sound-no-sounds">
				<p>No sounds found in this group</p>
				</div>
				`;
				} else {
				group.sounds.forEach(sound => {
					const displayName = editableNames[sound.id] || sound.name;
					soundsHtml += `
					<div class="manager-sound-sound-card" data-sound-id="${sound.id}">
					<div class="manager-sound-sound-preview">
					<div class="manager-sound-audio-player">
					<audio controls preload="metadata">
					<source src="${sound.url}" type="audio/${sound.url.split('.').pop()}">
					Your browser does not support the audio element.
					</audio>
					</div>
					</div>
					<div class="manager-sound-sound-info">  
					<div class="manager-sound-name-container">
					<div class="manager-sound-sound-name" title="${displayName}">${displayName}</div>  
					<button class="manager-sound-edit-name-btn" data-id="${sound.id}">✏️</button>
					</div>
					<input type="text" class="manager-sound-edit-name-input" data-id="${sound.id}" value="${displayName}" style="display: none;">
					<div class="manager-sound-sound-path" title="${sound.path}">${sound.path}</div>  
					<div class="manager-sound-info-item">
					<span class="manager-sound-info-label">Type:</span>
					<span class="manager-sound-info-value">${sound.type}</span>
					</div>
					<div class="manager-sound-info-item">
					<span class="manager-sound-info-label">Size:</span>
					<span class="manager-sound-info-value">${formatFileSize(sound.size)}</span>
					</div>
					<div class="manager-sound-sound-controls">  
					<div class="manager-sound-tooltip">
					<button class="manager-sound-btn manager-sound-btn-copy" onclick="copySoundPath('${sound.path.replace(/'/g, "\\'")}')">Copy Path</button>
					<span class="manager-sound-tooltiptext">Copy relative path to clipboard</span>
					</div>
					</div>
					</div>
					</div>
					`;
				});
			}
			
			html += `
			<div class="manager-sound-directory-container" data-id="${group.id || ''}">
			<div class="manager-sound-directory-header">
			<div class="manager-sound-directory-title">
			${group.name}
			<span class="manager-sound-count">${group.sounds.length} sounds</span>
			</div>
			${group.id ? `
			<div class="manager-sound-tooltip">
			<button class="btn manager-sound-btn-remove" onclick="removeDirectory('${group.id}')">Remove</button>
			<span class="manager-sound-tooltiptext">Remove this directory and its sounds</span>
			</div>
			` : ''}
			</div>
			<div class="manager-sound-sounds-grid">
			${soundsHtml}
			</div>
			</div>
			`;
		});
		
		directoriesContainer.innerHTML = html;
		
		// Add event listeners for name editing
		document.querySelectorAll('.manager-sound-edit-name-btn').forEach(btn => {
			btn.addEventListener('click', function() {
				const id = this.getAttribute('data-id');
				const nameDisplay = this.previousElementSibling;
				const input = nameDisplay.nextElementSibling;
				
				nameDisplay.style.display = 'none';
				input.style.display = 'block';
				input.focus();
			});
		});
		
		document.querySelectorAll('.manager-sound-edit-name-input').forEach(input => {
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
		
		// NEW: Add event listeners to sound cards
		document.querySelectorAll('.manager-sound-sound-card').forEach(card => {
			card.addEventListener('click', function(e) {
				// Don't open modal if editing name
				if (e.target.closest('.manager-sound-edit-name-btn') || 
					e.target.closest('.manager-sound-edit-name-input')) {
					return;
				}
				
				const soundId = this.getAttribute('data-sound-id');
				const sound = findSoundById(soundId);
				
				if (sound) {
					openSoundModal(sound);
				}
			});
		});
		updateStatus('Directories loaded successfully', totalSounds);
	}
	
	// NEW: Helper function to find sound by ID
	function findSoundById(id) {
		for (const dir of directories) {
			const sound = dir.sounds.find(s => s.id === id);
			if (sound) return sound;
		}
		return null;
	}
	// Format file size for display
	function formatFileSize(bytes) {
		if (bytes < 1024) return bytes + ' bytes';
		else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
		else return (bytes / 1048576).toFixed(1) + ' MB';
	}
	
	// Sample data for demonstration
	function loadSampleData() {
		directories = [];
		updateProgress(30);
		
		// Determine base path for assets
		const isInRessources = window.location.pathname.includes('ressources');
		const basePath = isInRessources ? '../' : '';
		
		const wesnothDirs = [
			{
				id: 'dir1',
				name: 'assets/sounds',
				sounds: [
					{
						id: 'snd1', 
						name: 'bow.ogg', 
						path: 'assets/sounds/bow.ogg', 
						url: `${basePath}assets/sounds/bow.ogg`,
						size: 85000, 
						lastModified: Date.now(),
						type: 'effects'
					},
					{
						id: 'snd2', 
						name: 'flail.ogg', 
						path: 'assets/sounds/flail.ogg', 
						url: `${basePath}assets/sounds/flail.ogg`,
						size: 92000, 
						lastModified: Date.now() - 86400000,
						type: 'effects'
					},
					{
						id: 'snd3', 
						name: 'human-die-1.ogg', 
						path: 'assets/sounds/human-die-1.ogg', 
						url: `${basePath}assets/sounds/human-die-1.ogg`,
						size: 78000, 
						lastModified: Date.now() - 172800000,
						type: 'effects'
					},
					{
						id: 'snd4', 
						name: 'magic-holy-1.ogg', 
						path: 'assets/sounds/magic-holy-1.ogg', 
						url: `${basePath}assets/sounds/magic-holy-1.ogg`,
						size: 1200000, 
						lastModified: Date.now() - 259200000,
						type: 'effects'
					},
					{
						id: 'snd5', 
						name: 'sword-1.ogg', 
						path: 'assets/sounds/sword-1.ogg', 
						url: `${basePath}assets/sounds/sword-1.ogg`,
						size: 87000, 
						lastModified: Date.now() - 345600000,
						type: 'effects'
					}
				]
			}
		];
		
		setTimeout(() => {
			directories = wesnothDirs;
			updateDirectoryDisplay();
			renderDirectories();
			updateProgress(100);
			showNotification('Sample Wesnoth sounds loaded!');
			updateStatus('Sample data loaded successfully', 5);
		}, 800);
	}
	
	// Event listeners
	chooseDirectoryBtn.addEventListener('click', addDirectory);
	
	clearAllBtn.addEventListener('click', () => {
		// Revoke all object URLs to free memory
		directories.forEach(directory => {
			directory.sounds.forEach(sound => {
				URL.revokeObjectURL(sound.url);
			});
		});
		
		directories = [];
		editableNames = {};
		updateDirectoryDisplay();
		renderDirectories();
		showNotification('All directories cleared!');
	});
	
	sampleDataBtn.addEventListener('click', loadSampleData);
	document.getElementById('manager-sound-load-sample').addEventListener('click', loadSampleData);
	
	// Organization method change
	organizationMethod.addEventListener('change', function() {
		currentOrganization = this.value;
		renderDirectories();
	});
	
	// Sound filter change
	soundFilter.addEventListener('change', function() {
		currentFilter = this.value;
		renderDirectories();
	});
	
	document.getElementById('manager-sound-pitch-shift').addEventListener('input', function() {
		document.getElementById('manager-sound-pitch-value').textContent = this.value + 'x';
	});
	
	document.getElementById('manager-sound-bass-boost').addEventListener('input', function() {
		document.getElementById('manager-sound-bass-value').textContent = this.value + '%';
	});
	
	document.getElementById('manager-sound-treble-boost').addEventListener('input', function() {
		document.getElementById('manager-sound-treble-value').textContent = this.value + '%';
	});
	
	document.getElementById('manager-sound-reverb').addEventListener('input', function() {
		document.getElementById('manager-sound-reverb-value').textContent = this.value + '%';
	});
	// Expose functions to global scope for inline handlers
	window.removeDirectory = removeDirectory;
	window.copySoundPath = copySoundPath;
});