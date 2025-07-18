// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	// Get DOM elements with prefix
	const imageContainer = document.getElementById('big-map-track-image-container');
	const imageUpload = document.getElementById('big-map-track-image-upload');
	const fileName = document.getElementById('big-map-track-file-name');
	const xCoord = document.getElementById('big-map-track-x-coord');
	const yCoord = document.getElementById('big-map-track-y-coord');
	const xInput = document.getElementById('big-map-track-x-input');
	const yInput = document.getElementById('big-map-track-y-input');
	const placeMarkerBtn = document.getElementById('big-map-track-place-marker-btn');
	const markerOptions = document.querySelectorAll('.big-map-track-marker-option');
	const commandInput = document.getElementById('big-map-track-command-input');
	const runCommandsBtn = document.getElementById('big-map-track-run-commands-btn');
	const clearMarkersBtn = document.getElementById('big-map-track-clear-markers-btn');
	const clearOutputBtn = document.getElementById('big-map-track-clear-output-btn');
	const generateTemplateBtn = document.getElementById('big-map-track-generate-template-btn');
	const commandOutput = document.getElementById('big-map-track-command-output');
	
	// NEW: Get new buttons
	const undoBtn = document.getElementById('big-map-track-undo-btn');
	const redoBtn = document.getElementById('big-map-track-redo-btn');
	const saveBtn = document.getElementById('big-map-track-save-btn');
	const cancelBtn = document.getElementById('big-map-track-cancel-btn');
	const downloadImageBtn = document.getElementById('big-map-track-download-image-btn');
	const downloadMarkersBtn = document.getElementById('big-map-track-download-markers-btn');
	const historyList = document.getElementById('big-map-track-history-list');
	
	// Initialize variables
	let currentMarkerType = 'dot';
	let markers = [];
	let currentImage = null;
	
	// NEW: History management
	let historyStack = []; // Store complete marker states
	let undoStack = []; // Store states for redo
	let currentHistoryIndex = -1;
	
	// NEW: Initialize history
	function initHistory() {
		historyStack = [];
		undoStack = [];
		currentHistoryIndex = -1;
		updateHistoryUI();
		saveStateToHistory();
	}
	
	// NEW: Save current state to history
	function saveStateToHistory() {
		// Only save if state has changed
		const currentState = JSON.stringify(markers);
		if (historyStack.length > 0 && 
			currentState === JSON.stringify(historyStack[historyStack.length - 1])) {
			return;
		}
		
		// Push current state to history
		historyStack.push(JSON.parse(JSON.stringify(markers)));
		currentHistoryIndex = historyStack.length - 1;
		
		// Clear redo stack when new action is performed
		undoStack = [];
		
		updateHistoryUI();
	}
	
	// NEW: Update history UI
	function updateHistoryUI() {
		historyList.innerHTML = '';
		
		if (historyStack.length === 0) {
			const noHistory = document.createElement('div');
			noHistory.className = 'big-map-track-history-item';
			noHistory.textContent = document.querySelector('[data-i18n="big_map_tracker_no_history"]')?.dataset?.i18n || 'No history yet';
			historyList.appendChild(noHistory);
			return;
		}
		
		historyStack.forEach((state, index) => {
			const item = document.createElement('div');
			item.className = 'big-map-track-history-item';
			if (index === currentHistoryIndex) {
				item.classList.add('active');
			}
			
			const markerCount = state.length;
			const lastAction = markerCount > 0 ? 
			`${document.querySelector('[data-i18n="big_map_tracker_last_action"]')?.dataset?.i18n || 'Last'}: (${state[state.length-1].x}, ${state[state.length-1].y})` : 
			document.querySelector('[data-i18n="big_map_tracker_no_markers"]')?.dataset?.i18n || 'No markers';
			
			item.textContent = `${document.querySelector('[data-i18n="big_map_tracker_state"]')?.dataset?.i18n || 'State'} ${index+1}: ${markerCount} ${document.querySelector('[data-i18n="big_map_tracker_markers"]')?.dataset?.i18n || 'markers'} - ${lastAction}`;
			
			// Restore state on click
			item.addEventListener('click', () => {
				restoreHistoryState(index);
			});
			
			historyList.appendChild(item);
		});
		
		// Scroll to bottom
		historyList.scrollTop = historyList.scrollHeight;
	}
	
	// NEW: Restore history state
	function restoreHistoryState(index) {
		if (index < 0 || index >= historyStack.length) return;
		
		markers = JSON.parse(JSON.stringify(historyStack[index]));
		currentHistoryIndex = index;
		renderMarkers();
		updateHistoryUI();
	}
	
	// NEW: Undo function
	function undo() {
		if (currentHistoryIndex > 0) {
			// Save current state to redo stack
			undoStack.push(JSON.parse(JSON.stringify(markers)));
			
			// Move to previous state
			currentHistoryIndex--;
			markers = JSON.parse(JSON.stringify(historyStack[currentHistoryIndex]));
			renderMarkers();
			updateHistoryUI();
			showOutput(document.querySelector('[data-i18n="big_map_tracker_undo_success"]')?.dataset?.i18n || 'Undo successful', 'success');
			} else {
			showOutput(document.querySelector('[data-i18n="big_map_tracker_nothing_undo"]')?.dataset?.i18n || 'Nothing to undo', 'info');
		}
	}
	
	// NEW: Redo function
	function redo() {
		if (undoStack.length > 0) {
			// Save current state to history
			historyStack.push(JSON.parse(JSON.stringify(markers)));
			currentHistoryIndex = historyStack.length - 1;
			
			// Restore from undo stack
			markers = undoStack.pop();
			renderMarkers();
			saveStateToHistory();
			showOutput(document.querySelector('[data-i18n="big_map_tracker_redo_success"]')?.dataset?.i18n || 'Redo successful', 'success');
			} else {
			showOutput(document.querySelector('[data-i18n="big_map_tracker_nothing_redo"]')?.dataset?.i18n || 'Nothing to redo', 'info');
		}
	}
	
	// NEW: Save project to localStorage
	function saveProject() {
		if (!currentImage) {
			showOutput(document.querySelector('[data-i18n="big_map_tracker_upload_first"]')?.dataset?.i18n || 'Please upload an image first', 'error');
			return;
		}
		
		const project = {
			imageData: currentImage.src,
			markers: markers,
			fileName: fileName.textContent
		};
		
		localStorage.setItem('mapTrackProject', JSON.stringify(project));
		showOutput(document.querySelector('[data-i18n="big_map_tracker_project_saved"]')?.dataset?.i18n || 'Project saved successfully', 'success');
	}
	
	// NEW: Load project from localStorage
	function loadProject() {
		const projectData = localStorage.getItem('mapTrackProject');
		if (!projectData) {
			showOutput(document.querySelector('[data-i18n="big_map_tracker_no_project"]')?.dataset?.i18n || 'No saved project found', 'info');
			return;
		}
		
		try {
			const project = JSON.parse(projectData);
			
			// Load image
			const img = new Image();
			img.onload = () => {
				// Clear previous markers
				clearMarkers();
				
				// Set image
				imageContainer.innerHTML = '';
				imageContainer.appendChild(img);
				currentImage = img;
				
				// Set file name
				fileName.textContent = project.fileName || document.querySelector('[data-i18n="big_map_tracker_saved_project"]')?.dataset?.i18n || 'Saved project';
				
				// Set up event listeners
				setupImageListeners(img);
				
				// Load markers
				markers = project.markers || [];
				renderMarkers();
				
				// Save to history
				saveStateToHistory();
				
				showOutput(document.querySelector('[data-i18n="big_map_tracker_project_loaded"]')?.dataset?.i18n || 'Project loaded successfully', 'success');
			};
			img.src = project.imageData;
			} catch (e) {
			showOutput(`${document.querySelector('[data-i18n="big_map_tracker_load_error"]')?.dataset?.i18n || 'Error loading project'}: ${e.message}`, 'error');
		}
	}
	
	function cancelProject() {
		const cancelConfirm = document.querySelector('[data-i18n="big_map_tracker_cancel_confirm"]')?.dataset?.i18n || 'Are you sure you want to cancel? All unsaved changes will be lost.';
		
		if (confirm(cancelConfirm)) {
			// Clear image and markers
			imageContainer.innerHTML = `
			<div class="big-map-track-image-placeholder big-map-track-bounce">
			<svg width="80" height="80" viewBox="0 0 24 24" fill="none">
			<path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="#4361ee"/>
			</svg>
			<h3 data-i18n="big_map_tracker_upload_prompt">Upload an Image to Get Started</h3>
			<p data-i18n="big_map_tracker_upload_instructions">Use the upload button above to select an image</p>
			</div>
			`;
			
			// Reset variables
			currentImage = null;
			markers = [];
			fileName.textContent = document.querySelector('[data-i18n="big_map_tracker_no_file"]')?.dataset?.i18n || 'No file selected';
			xCoord.textContent = '0';
			yCoord.textContent = '0';
			xInput.value = '0';
			yInput.value = '0';
			
			// Clear command output
			const clearedMsg = document.querySelector('[data-i18n="big_map_tracker_output_cleared"]')?.dataset?.i18n || 'Command output cleared';
			commandOutput.innerHTML = `<p>${clearedMsg}</p>`;
			
			// Clear history
			initHistory();
			
			const cancelledMsg = document.querySelector('[data-i18n="big_map_tracker_project_cancelled"]')?.dataset?.i18n || 'Project cancelled';
			showOutput(cancelledMsg, 'info');
		}
	}
	
	// NEW: Download image with markers
	function downloadImage() {
		if (!currentImage) {
			showOutput(document.querySelector('[data-i18n="big_map_tracker_upload_first"]')?.dataset?.i18n || 'Please upload an image first', 'error');
			return;
		}
		
		try {
			// Create canvas
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			
			// Set canvas size to match image
			canvas.width = currentImage.naturalWidth;
			canvas.height = currentImage.naturalHeight;
			
			// Draw image
			ctx.drawImage(currentImage, 0, 0);
			
			// Draw markers
			markers.forEach(marker => {
				const x = marker.x;
				const y = marker.y;
				
				ctx.beginPath();
				ctx.fillStyle = '#f72585';
				ctx.strokeStyle = 'white';
				ctx.lineWidth = 2;
				
				switch(marker.type) {
					case 'dot':
					ctx.arc(x, y, 8, 0, Math.PI * 2);
					ctx.fill();
					ctx.stroke();
					break;
					case 'square':
        ctx.fillStyle = '#f72585';
        ctx.fillRect(x - 11, y - 11, 22, 22);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 11, y - 11, 22, 22);
        break;
					case 'circle':
					ctx.beginPath();
					ctx.arc(x, y, 12, 0, Math.PI * 2);
					ctx.stroke();
					break;
					case 'target':
					ctx.beginPath();
					ctx.arc(x, y, 15, 0, Math.PI * 2);
					ctx.stroke();
					
					ctx.beginPath();
					ctx.arc(x, y, 8, 0, Math.PI * 2);
					ctx.stroke();
					
					ctx.beginPath();
					ctx.arc(x, y, 3, 0, Math.PI * 2);
					ctx.fill();
					break;
    case 'white-dot':
        ctx.fillStyle = 'white';
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
        break;
    case 'white-square':
        ctx.fillStyle = 'white';
        ctx.fillRect(x - 11, y - 11, 22, 22);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 11, y - 11, 22, 22);
        break;
				}
				
				// Draw coordinates text
				ctx.font = '12px Arial';
				ctx.fillStyle = 'white';
				ctx.fillText(`(${x}, ${y})`, x + 15, y - 15);
			});
			
			// Create download link
			const link = document.createElement('a');
			link.download = 'image-with-markers.png';
			link.href = canvas.toDataURL('image/png');
			link.click();
			
			showOutput(document.querySelector('[data-i18n="big_map_tracker_image_downloaded"]')?.dataset?.i18n || 'Image downloaded successfully', 'success');
			} catch (e) {
			showOutput(`${document.querySelector('[data-i18n="big_map_tracker_image_error"]')?.dataset?.i18n || 'Error downloading image'}: ${e.message}`, 'error');
		}
	}
	
	// NEW: Download markers as JSON
	function downloadMarkers() {
		if (markers.length === 0) {
			showOutput(document.querySelector('[data-i18n="big_map_tracker_no_markers_download"]')?.dataset?.i18n || 'No markers to download', 'info');
			return;
		}
		
		try {
			const dataStr = JSON.stringify(markers, null, 2);
			const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
			
			const link = document.createElement('a');
			link.setAttribute('href', dataUri);
			link.setAttribute('download', 'markers.json');
			link.click();
			
			showOutput(document.querySelector('[data-i18n="big_map_tracker_markers_downloaded"]')?.dataset?.i18n || 'Markers downloaded successfully', 'success');
			} catch (e) {
			showOutput(`${document.querySelector('[data-i18n="big_map_tracker_markers_error"]')?.dataset?.i18n || 'Error downloading markers'}: ${e.message}`, 'error');
		}
	}
	
	// Set up marker selection
	markerOptions.forEach(option => {
		option.addEventListener('click', () => {
			// Remove active class from all options
			markerOptions.forEach(opt => opt.classList.remove('active'));
			// Add active class to clicked option
			option.classList.add('active');
			// Update current marker type
			currentMarkerType = option.getAttribute('data-type');
		});
	});
	
	// Handle image upload
	imageUpload.addEventListener('change', (e) => {
		const file = e.target.files[0];
		if (!file) return;
		
		// Display file name
		fileName.textContent = file.name;
		
		// Validate file type
		if (!file.type.match('image.*')) {
			showOutput(document.querySelector('[data-i18n="big_map_tracker_invalid_image"]')?.dataset?.i18n || 'Please select a valid image file (JPEG, PNG, etc.)', 'error');
			return;
		}
		
		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			showOutput(document.querySelector('[data-i18n="big_map_tracker_file_size"]')?.dataset?.i18n || 'File size exceeds 5MB limit', 'error');
			return;
		}
		
		// Use FileReader to safely load image
		const reader = new FileReader();
		
		reader.onload = (event) => {
			// Clear previous markers
			clearMarkers();
			
			// Create new image element
			const img = new Image();
			img.src = event.target.result;
			img.alt = "Uploaded image";
			img.classList.add('big-map-track-image');
			
			// Clear image container and add new image
			imageContainer.innerHTML = '';
			imageContainer.appendChild(img);
			
			// Store reference to current image
			currentImage = img;
			
			// Set up event listeners for the new image
			setupImageListeners(img);
			
			// NEW: Initialize history
			initHistory();
			
			// Update marker positions after image loads
			updateMarkerPositions();
			
			showOutput(`${document.querySelector('[data-i18n="big_map_tracker_image_loaded"]')?.dataset?.i18n || 'Image loaded'}: ${file.name} (${Math.round(file.size/1024)}KB)`, 'success');
		};
		
		reader.onerror = () => {
			showOutput(document.querySelector('[data-i18n="big_map_tracker_read_error"]')?.dataset?.i18n || 'Error reading file', 'error');
		};
		
		reader.readAsDataURL(file);
	});
	
	// Set up image event listeners
	function setupImageListeners(img) {
		// Add event listener for mouse movement on the image
		img.addEventListener('mousemove', (e) => {
			// Get the position relative to the image
			const rect = img.getBoundingClientRect();
			const x = Math.floor(e.clientX - rect.left);
			const y = Math.floor(e.clientY - rect.top);
			
			// Update the coordinate displays
			xCoord.textContent = x;
			yCoord.textContent = y;
			
			// Also update the input fields
			xInput.value = x;
			yInput.value = y;
		});
		
		// Reset coordinates when mouse leaves the image
		img.addEventListener('mouseleave', () => {
			xCoord.textContent = '0';
			yCoord.textContent = '0';
		});
		
		// Place marker on click
		img.addEventListener('click', (e) => {
			const rect = img.getBoundingClientRect();
			const x = Math.floor(e.clientX - rect.left);
			const y = Math.floor(e.clientY - rect.top);
			
			placeMarker(x, y);
			
			// Generate command and add to output
			generateCommand('new_journey', x, y);
			
			// NEW: Save to history
			saveStateToHistory();
		});
	}
	
	// Place marker from input coordinates
	placeMarkerBtn.addEventListener('click', () => {
		const x = parseInt(xInput.value);
		const y = parseInt(yInput.value);
		
		if (isNaN(x) || isNaN(y)) {
			showOutput(document.querySelector('[data-i18n="big_map_tracker_invalid_coords"]')?.dataset?.i18n || 'Please enter valid numbers for both coordinates', 'error');
			return;
		}
		
		// Check if an image is loaded
		if (!currentImage) {
			showOutput(document.querySelector('[data-i18n="big_map_tracker_upload_first"]')?.dataset?.i18n || 'Please upload an image first', 'error');
			return;
		}
		
		// Check if coordinates are within the image
		if (x < 0 || y < 0 || x > currentImage.width || y > currentImage.height) {
			showOutput(document.querySelector('[data-i18n="big_map_tracker_outside_boundaries"]')?.dataset?.i18n || 'Coordinates are outside the image boundaries', 'error');
			return;
		}
		
		placeMarker(x, y);
		
		// NEW: Save to history
		saveStateToHistory();
	});
	
	// Allow placing marker by pressing Enter in input fields
	xInput.addEventListener('keypress', (e) => {
		if (e.key === 'Enter') placeMarkerBtn.click();
	});
	
	yInput.addEventListener('keypress', (e) => {
		if (e.key === 'Enter') placeMarkerBtn.click();
	});
	
	// Run commands from text area
	runCommandsBtn.addEventListener('click', runCommands);
	
	// Clear all markers
	clearMarkersBtn.addEventListener('click', clearMarkers);
	
	function clearMarkers() {
		markers.forEach(marker => marker.remove());
		markers = [];
		showOutput(document.querySelector('[data-i18n="big_map_tracker_markers_cleared"]')?.dataset?.i18n || 'All markers cleared', 'success');
		
		// NEW: Save to history
		saveStateToHistory();
	}
	
	// Clear command output
	clearOutputBtn.addEventListener('click', () => {
		commandOutput.innerHTML = `<p>${document.querySelector('[data-i18n="big_map_tracker_output_cleared"]')?.dataset?.i18n || 'Command output cleared'}</p>`;
	});
	
	// Generate command template
	generateTemplateBtn.addEventListener('click', () => {
		commandInput.value = `# ${document.querySelector('[data-i18n="big_map_tracker_command_template"]')?.dataset?.i18n || 'Command template'}
# ${document.querySelector('[data-i18n="big_map_tracker_format"]')?.dataset?.i18n || 'Format'}: {command_name x y}
# ${document.querySelector('[data-i18n="big_map_tracker_supported_commands"]')?.dataset?.i18n || 'Supported commands'}: NEW_JOURNEY, OLD_JOURNEY, NEW_REST, OLD_REST, NEW_BATTLE, OLD_BATTLE

{NEW_JOURNEY 100 200}
{OLD_JOURNEY 250 350}
{NEW_BATTLE 400 150}
{OLD_REST 550 300}
{NEW_REST 700 250}
{OLD_BATTLE 100 200}`;
		showOutput(document.querySelector('[data-i18n="big_map_tracker_template_generated"]')?.dataset?.i18n || 'Command template generated', 'info');
	});
	
	// Function to place a marker
	function placeMarker(x, y, type = currentMarkerType) {
		if (!currentImage) return;
		
		// Get container and image positions
		const containerRect = imageContainer.getBoundingClientRect();
		const imgRect = currentImage.getBoundingClientRect();
		
		// Calculate image offset within container
		const imgLeftOffset = imgRect.left - containerRect.left;
		const imgTopOffset = imgRect.top - containerRect.top;
		
		// Create marker
		const marker = document.createElement('div');
		marker.className = `big-map-track-marker big-map-track-${type}`;
		marker.style.left = `${imgLeftOffset + x}px`;
		marker.style.top = `${imgTopOffset + y}px`;
		
		// Add coordinate label
		const label = document.createElement('div');
		label.className = 'big-map-track-marker-label';
		label.textContent = `(${x}, ${y})`;
		marker.appendChild(label);
		
		imageContainer.appendChild(marker);
		
		// Store marker reference
		markers.push({
			element: marker,
			type: type,
			x: x,
			y: y
		});
	}
	
	// Update marker positions on window resize
	function updateMarkerPositions() {
		if (!currentImage) return;
		
		const containerRect = imageContainer.getBoundingClientRect();
		const imgRect = currentImage.getBoundingClientRect();
		const imgLeftOffset = imgRect.left - containerRect.left;
		const imgTopOffset = imgRect.top - containerRect.top;
		
		markers.forEach(marker => {
			marker.element.style.left = `${imgLeftOffset + marker.x}px`;
			marker.element.style.top = `${imgTopOffset + marker.y}px`;
		});
	}
	
	// Function to run commands
	function runCommands() {
		if (!currentImage) {
			showOutput(document.querySelector('[data-i18n="big_map_tracker_upload_first"]')?.dataset?.i18n || 'Please upload an image first', 'error');
			return;
		}
		
		const commands = commandInput.value.split('\n');
		let commandCount = 0;
		
		// Clear previous output
		commandOutput.innerHTML = '';
		
		commands.forEach((command, index) => {
			// Skip empty lines and comments
			if (!command.trim() || command.trim().startsWith('#')) {
				return;
			}
			
			// Parse command: {command_name x y}
			const regex = /{(\w+)\s+(\d+)\s+(\d+)}/;
			const match = command.match(regex);
			
			if (match) {
				const cmd = match[1].toUpperCase(); // Convert to uppercase
				const x = parseInt(match[2]);
				const y = parseInt(match[3]);
				
				if (isNaN(x) || isNaN(y)) {
					showOutput(`${document.querySelector('[data-i18n="big_map_tracker_invalid_coords_line"]')?.dataset?.i18n || 'Error on line'} ${index+1}: ${document.querySelector('[data-i18n="big_map_tracker_invalid_coords"]')?.dataset?.i18n || 'Invalid coordinates'}`, 'error');
					return;
				}
				
				// Determine marker type based on command
				let markerType;
switch(cmd) {
    case 'NEW_JOURNEY':
        markerType = 'dot';
        break;
    case 'OLD_JOURNEY':
        markerType = 'white-dot';
        break;
    case 'NEW_REST':
        markerType = 'target';
        break;
    case 'OLD_REST':
        markerType = 'circle';
        break;
    case 'NEW_BATTLE':
        markerType = 'square';
        break;
    case 'OLD_BATTLE':
        markerType = 'white-square';
        break;
    default:
        showOutput(`${document.querySelector('[data-i18n="big_map_tracker_unknown_command"]')?.dataset?.i18n || 'Error on line'} ${index+1}: ${document.querySelector('[data-i18n="big_map_tracker_unknown_command_msg"]')?.dataset?.i18n || 'Unknown command'} '${cmd}'`, 'error');
        return;
				}
				
				// Check if coordinates are within the image
				if (x < 0 || y < 0 || x > currentImage.width || y > currentImage.height) {
					showOutput(`${document.querySelector('[data-i18n="big_map_tracker_outside_boundaries_line"]')?.dataset?.i18n || 'Error on line'} ${index+1}: ${document.querySelector('[data-i18n="big_map_tracker_outside_boundaries"]')?.dataset?.i18n || 'Coordinates outside image boundaries'}`, 'error');
					return;
				}
				
				// Place the marker
				placeMarker(x, y, markerType);
				showOutput(`${document.querySelector('[data-i18n="big_map_tracker_executed"]')?.dataset?.i18n || 'Executed'}: {${cmd} ${x} ${y}}`, 'success');
				commandCount++;
				} else {
				showOutput(`${document.querySelector('[data-i18n="big_map_tracker_invalid_format_line"]')?.dataset?.i18n || 'Error on line'} ${index+1}: ${document.querySelector('[data-i18n="big_map_tracker_invalid_format"]')?.dataset?.i18n || 'Invalid command format'}`, 'error');
			}
		});
		
		// NEW: Save to history
		saveStateToHistory();
		
		if (commandCount === 0) {
			showOutput(document.querySelector('[data-i18n="big_map_tracker_no_commands"]')?.dataset?.i18n || 'No valid commands found', 'info');
		}
	}
	
	// Function to generate command
function generateCommand(type, x, y) {
    let cmd;
    switch(type) {
        case 'dot': cmd = 'NEW_JOURNEY'; break;
        case 'white-dot': cmd = 'OLD_JOURNEY'; break;
        case 'target': cmd = 'NEW_REST'; break;
        case 'circle': cmd = 'OLD_REST'; break;
        case 'square': cmd = 'NEW_BATTLE'; break;
        case 'white-square': cmd = 'OLD_BATTLE'; break;
        default: cmd = 'NEW_JOURNEY';
    }
    
    const commandLine = `{${cmd} ${x} ${y}}`;
    showOutput(`${document.querySelector('[data-i18n="big_map_tracker_click_generated"]')?.dataset?.i18n || 'Click generated command'}: ${commandLine}`, 'info');
}
	
	// Function to show output
	function showOutput(message, type) {
		const p = document.createElement('p');
		p.textContent = message;
		
		switch(type) {
			case 'error':
			p.style.background = 'rgba(247, 37, 133, 0.2)';
			p.style.color = '#f72585';
			break;
			case 'success':
			p.style.background = 'rgba(76, 201, 240, 0.2)';
			p.style.color = '#4cc9f0';
			break;
			case 'info':
			p.style.background = 'rgba(67, 97, 238, 0.2)';
			p.style.color = '#b8c1ec';
			break;
		}
		
		commandOutput.appendChild(p);
		commandOutput.scrollTop = commandOutput.scrollHeight;
	}
	
	// NEW: Render markers from state
	function renderMarkers() {
		// Clear existing markers from DOM
		const existingMarkers = imageContainer.querySelectorAll('.big-map-track-marker');
		existingMarkers.forEach(marker => marker.remove());
		
		// Clear markers array while keeping the data
		const markerData = [...markers];
		markers = [];
		
		// Recreate markers
		markerData.forEach(data => {
			placeMarker(data.x, data.y, data.type);
		});
	}
	
	// NEW: Add event listeners for new buttons
	undoBtn.addEventListener('click', undo);
	redoBtn.addEventListener('click', redo);
	saveBtn.addEventListener('click', saveProject);
	cancelBtn.addEventListener('click', cancelProject);
	downloadImageBtn.addEventListener('click', downloadImage);
	downloadMarkersBtn.addEventListener('click', downloadMarkers);
	
	// NEW: Add resize handler to reposition markers
	window.addEventListener('resize', updateMarkerPositions);
	
	// NEW: Try to load saved project on startup
	loadProject();
});