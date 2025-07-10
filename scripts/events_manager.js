document.addEventListener('DOMContentLoaded', function() {
	// Elements
	const fileInput = document.getElementById('manager-event-fileInput');
	const dropZone = document.getElementById('manager-event-dropZone');
	const browseBtn = document.getElementById('manager-event-browseBtn');
	const pasteArea = document.getElementById('manager-event-pasteArea');
	const processPasteBtn = document.getElementById('manager-event-processPasteBtn');
	const resultsSection = document.getElementById('manager-event-resultsSection');
	const emptyState = document.getElementById('manager-event-emptyState');
	const fileCount = document.getElementById('manager-event-fileCount');
	const totalEvents = document.getElementById('manager-event-totalEvents');
	const totalMessages = document.getElementById('manager-event-totalMessages');
	const eventsContainer = document.getElementById('manager-event-eventsContainer');
	const messagesContainer = document.getElementById('manager-event-messagesContainer');
	const clearResultsBtn = document.getElementById('manager-event-clearResultsBtn');
	const eventsViewBtn = document.getElementById('manager-event-eventsViewBtn');
	const messagesViewBtn = document.getElementById('manager-event-messagesViewBtn');
	const statsPanel = document.getElementById('manager-event-statsPanel');
	const statsToggleBtn = document.getElementById('manager-event-statsToggleBtn');
	const statFiles = document.getElementById('manager-event-statFiles');
	const statEvents = document.getElementById('manager-event-statEvents');
	const statMessages = document.getElementById('manager-event-statMessages');
	const statAvgEvents = document.getElementById('manager-event-statAvgEvents');
	const fileStatsList = document.getElementById('manager-event-fileStatsList');
	const groupFilesBtn = document.getElementById('manager-event-groupFilesBtn');
	const combineFilesBtn = document.getElementById('manager-event-combineFilesBtn');
	const downloadEditedBtn = document.getElementById('manager-event-downloadEditedBtn');
	const saveSection = document.getElementById('manager-event-saveSection');
	const saveChangesBtn = document.getElementById('manager-event-saveChangesBtn');
	const discardChangesBtn = document.getElementById('manager-event-discardChangesBtn');
	
	// Current data
	let allFilesData = [];
	let viewMode = 'events'; // 'events' or 'messages'
	let groupMode = 'grouped'; // 'grouped' or 'combined'
	let statsVisible = false;
	let originalFiles = {};
	
	// Track changes
	let hasUnsavedChanges = false;
	let editedEvents = {};
	let editedMessages = {};
	
	// Event Listeners
	browseBtn.addEventListener('click', () => fileInput.click());
	fileInput.addEventListener('change', handleFileUpload);
	dropZone.addEventListener('dragover', handleDragOver);
	dropZone.addEventListener('drop', handleDrop);
	processPasteBtn.addEventListener('click', processPastedContent);
	clearResultsBtn.addEventListener('click', clearResults);
	eventsViewBtn.addEventListener('click', () => switchView('events'));
	messagesViewBtn.addEventListener('click', () => switchView('messages'));
	statsToggleBtn.addEventListener('click', toggleStats);
	groupFilesBtn.addEventListener('click', () => switchGroupMode('grouped'));
	combineFilesBtn.addEventListener('click', () => switchGroupMode('combined'));
	downloadEditedBtn.addEventListener('click', handleDownload);
	saveChangesBtn.addEventListener('click', saveChanges);
	discardChangesBtn.addEventListener('click', discardChanges);
	
	// Function to handle drag over event
	function handleDragOver(e) {
		e.preventDefault();
		e.stopPropagation();
		dropZone.style.backgroundColor = 'rgba(52, 152, 219, 0.3)';
	}
	
	// Function to handle drop event
	function handleDrop(e) {
		e.preventDefault();
		e.stopPropagation();
		dropZone.style.backgroundColor = '';
		
		const files = e.dataTransfer.files;
		if (files.length > 0) {
			processFiles(files);
		}
	}
	
	// Function to handle file upload via input
	function handleFileUpload(e) {
		const files = e.target.files;
		if (files.length > 0) {
			processFiles(files);
		}
	}
	
	// Function to process pasted content
	function processPastedContent() {
		const content = pasteArea.value.trim();
		if (content) {
			// Create a pseudo-file object for pasted content
			const pseudoFile = {
				name: "Pasted Content",
				content: content
			};
			processPseudoFiles([pseudoFile]);
			} else {
			alert("Please paste some .cfg content first!");
		}
	}
	
	// Function to process uploaded files
	function processFiles(files) {
		const processPromises = [];
		const newFilesData = [];
		
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			if (file.name.endsWith('.cfg')) {
				const promise = new Promise((resolve) => {
					const reader = new FileReader();
					reader.onload = function(e) {
						const content = e.target.result;
						originalFiles[file.name] = content;
						const events = extractEvents(content);
						const messages = extractMessages(content, events);
						
						newFilesData.push({
							fileName: file.name,
							events: events,
							messages: messages
						});
						resolve();
					};
					reader.readAsText(file);
				});
				processPromises.push(promise);
			}
		}
		
		Promise.all(processPromises).then(() => {
			if (newFilesData.length > 0) {
				// Add new files to global data
				allFilesData = allFilesData.concat(newFilesData);
				
				// Update UI
				updateFileInfo();
				updateStats();
				renderContent();
				
				resultsSection.style.display = 'block';
				emptyState.style.display = 'none';
			}
		});
	}
	
	// Function to process pseudo files (for pasted content)
	function processPseudoFiles(files) {
		files.forEach(file => {
			originalFiles[file.name] = file.content;
			const events = extractEvents(file.content);
			const messages = extractMessages(file.content, events);
			
			allFilesData.push({
				fileName: file.name,
				events: events,
				messages: messages
			});
		});
		
		if (allFilesData.length > 0) {
			// Update UI
			updateFileInfo();
			updateStats();
			renderContent();
			
			resultsSection.style.display = 'block';
			emptyState.style.display = 'none';
		}
	}
	
	// Function to extract events from content
	function extractEvents(content) {
		// Use the utility function from wesnoth-wml-utils.js
		return window.extractEvents ? window.extractEvents(content) : [];
	}
	
	// Function to extract messages from content
	function extractMessages(content, events) {
		if (window.parseEventContent) {
			const allMessages = [];
			
			events.forEach(event => {
				const parsedContent = window.parseEventContent(event.block);
				const messages = extractAllMessages(parsedContent);
				
				// Attach messages to the event object
				event.messages = messages;
				
				messages.forEach(msg => {
					allMessages.push({
						...msg,
						eventName: event.name,
						eventFilter: event.filter,
						eventId: event.id
					});
				});
			});
			
			return allMessages;
		}
		return [];
	}
	
	// Helper function to extract all messages from parsed content
	function extractAllMessages(parsedArray) {
		let messages = [];
		
		parsedArray.forEach(item => {
			if (item.type === 'message') {
				messages.push({
					id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
					speaker: item.speaker,
					text: item.text
				});
				} else if (item.type === 'condition' && item.children) {
				// Recursively extract messages from nested conditions
				messages = messages.concat(extractAllMessages(item.children));
			}
		});
		
		return messages;
	}
	
	// Function to render content based on current view and group mode
	function renderContent() {
		eventsContainer.innerHTML = '';
		messagesContainer.innerHTML = '';
		
		if (viewMode === 'events') {
			if (groupMode === 'grouped') {
				renderEventsGrouped();
				} else {
				renderEventsCombined();
			}
			} else {
			if (groupMode === 'grouped') {
				renderMessagesGrouped();
				} else {
				renderMessagesCombined();
			}
		}
	}
	
	// Function to render events grouped by file
	function renderEventsGrouped() {
		if (allFilesData.length === 0) {
			eventsContainer.innerHTML = `
			<div class="manager-event-empty-state">
				<svg class="manager-event-svg-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
				<h3>No Events Found</h3>
				<p>The files don't contain any events</p>
			</div>
			`;
			return;
		}
		
		allFilesData.forEach(fileData => {
			if (fileData.events.length === 0) return;
			
			const fileGroup = document.createElement('div');
			fileGroup.className = 'manager-event-file-group';
			
			const header = document.createElement('div');
			header.className = 'manager-event-file-header';
			header.innerHTML = `
			<div class="manager-event-file-title">
				<svg class="manager-event-svg-icon" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
				${fileData.fileName}
			</div>
			<div class="manager-event-event-count">
				${fileData.events.length} event(s)
			</div>
			`;
			
			const content = document.createElement('div');
			content.className = 'manager-event-events-container-inner';
			
			fileData.events.forEach(event => {
				const eventCard = document.createElement('div');
				eventCard.className = 'manager-event-event-card';
				
				const cardHeader = document.createElement('div');
				cardHeader.className = 'manager-event-event-header';
				cardHeader.innerHTML = `
				<div>
					<span class="manager-event-event-name">${event.name || 'Unnamed Event'}</span>
					${event.filter ? `<div class="manager-event-event-filter">Filter: ${event.filter}</div>` : ''}
				</div>
				<span class="manager-event-event-count">${event.messages.length} message(s)</span>
				`;
				
				const cardContent = document.createElement('div');
				cardContent.className = 'manager-event-event-content';
				
				// Event editor
				const editorContainer = document.createElement('div');
				editorContainer.className = 'manager-event-editor-container';
				
				const editorHeader = document.createElement('div');
				editorHeader.className = 'manager-event-editor-header';
				editorHeader.innerHTML = `
				<span>Event Code Editor</span>
				<span>
					<svg class="manager-event-svg-icon" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
				</span>
				`;
				
				const editorBody = document.createElement('div');
				editorBody.className = 'manager-event-editor-body';
				
				const textarea = document.createElement('textarea');
				textarea.className = 'manager-event-code-editor';
				textarea.value = editedEvents[event.id] || event.block;
				textarea.dataset.id = event.id;
				textarea.addEventListener('input', handleEventEdit);
				
				editorBody.appendChild(textarea);
				editorContainer.appendChild(editorHeader);
				editorContainer.appendChild(editorBody);
				cardContent.appendChild(editorContainer);
				
				// Messages in this event
				if (event.messages.length > 0) {
					const messagesHeader = document.createElement('h4');
					messagesHeader.style.margin = '15px 0 10px';
					messagesHeader.innerHTML = `
						<svg class="manager-event-svg-icon" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17l-.59.59-.58.58V4h16v12zm-9-4h2v2h-2v-2zm0-6h2v4h-2V6z"/></svg>
						Messages in this event:
					`;
					
					cardContent.appendChild(messagesHeader);
					
					event.messages.forEach(msg => {
						const messageItem = document.createElement('div');
						messageItem.className = 'manager-event-message-item';
						
						const speaker = document.createElement('div');
						speaker.className = 'manager-event-message-speaker';
						speaker.innerHTML = `
							<svg class="manager-event-svg-icon" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
							${msg.speaker || 'narrator'}
						`;
						
						const editorBody = document.createElement('div');
						editorBody.className = 'manager-event-editor-body';
						
						const textarea = document.createElement('textarea');
						textarea.className = 'manager-event-message-editor';
						textarea.value = editedMessages[msg.id] || msg.text;
						textarea.dataset.id = msg.id;
						textarea.addEventListener('input', handleMessageEdit);
						
						editorBody.appendChild(textarea);
						messageItem.appendChild(speaker);
						messageItem.appendChild(editorBody);
						cardContent.appendChild(messageItem);
					});
				}
				
				eventCard.appendChild(cardHeader);
				eventCard.appendChild(cardContent);
				content.appendChild(eventCard);
			});
			
			fileGroup.appendChild(header);
			fileGroup.appendChild(content);
			eventsContainer.appendChild(fileGroup);
		});
	}
	
	
	// Function to render messages grouped by file
	function renderMessagesGrouped() {
		messagesContainer.innerHTML = '';
		
		if (allFilesData.length === 0) {
			messagesContainer.innerHTML = `
			<div class="manager-event-empty-state">
				<svg class="manager-event-svg-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
				<h3>No Messages Found</h3>
				<p>The files don't contain any messages</p>
			</div>
			`;
			return;
		}
		
		let hasMessages = false;
		
		allFilesData.forEach(fileData => {
			if (fileData.messages.length === 0) return;
			hasMessages = true;
			
			const fileGroup = document.createElement('div');
			fileGroup.className = 'manager-event-file-group';
			
			const header = document.createElement('div');
			header.className = 'manager-event-file-header';
			header.innerHTML = `
			<div class="manager-event-file-title">
				<svg class="manager-event-svg-icon" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
				${fileData.fileName}
			</div>
			<div class="manager-event-message-count">
				${fileData.messages.length} message(s)
			</div>
			`;
			
			const content = document.createElement('div');
			content.className = 'manager-event-messages-container-inner';
			
			// Group messages by event
			const messagesByEvent = {};
			fileData.messages.forEach(msg => {
				if (!messagesByEvent[msg.eventId]) {
					messagesByEvent[msg.eventId] = {
						eventName: msg.eventName,
						messages: []
					};
				}
				messagesByEvent[msg.eventId].messages.push(msg);
			});
			
			// Create event groups
			Object.values(messagesByEvent).forEach(eventGroup => {
				const eventHeader = document.createElement('div');
				eventHeader.className = 'manager-event-event-header';
				eventHeader.innerHTML = `
				<div>
					<span class="manager-event-event-name">${eventGroup.eventName || 'Unnamed Event'}</span>
				</div>
				<span class="manager-event-message-count">${eventGroup.messages.length} message(s)</span>
				`;
				
				content.appendChild(eventHeader);
				
				eventGroup.messages.forEach(msg => {
					const messageItem = document.createElement('div');
					messageItem.className = 'manager-event-message-item';
					
					const speaker = document.createElement('div');
					speaker.className = 'manager-event-message-speaker';
					speaker.innerHTML = `
						<svg class="manager-event-svg-icon" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
						${msg.speaker || 'narrator'}
					`;
					
					const editorBody = document.createElement('div');
					editorBody.className = 'manager-event-editor-body';
					
					const textarea = document.createElement('textarea');
					textarea.className = 'manager-event-message-editor';
					textarea.value = editedMessages[msg.id] || msg.text;
					textarea.dataset.id = msg.id;
					textarea.addEventListener('input', handleMessageEdit);
					
					editorBody.appendChild(textarea);
					messageItem.appendChild(speaker);
					messageItem.appendChild(editorBody);
					content.appendChild(messageItem);
				});
			});
			
			fileGroup.appendChild(header);
			fileGroup.appendChild(content);
			messagesContainer.appendChild(fileGroup);
		});
		
		if (!hasMessages) {
			messagesContainer.innerHTML = `
			<div class="manager-event-empty-state">
				<svg class="manager-event-svg-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
				<h3>No Messages Found</h3>
				<p>The files don't contain any messages</p>
			</div>
			`;
		}
	}
	
	// Function to render messages in a combined view
	function renderMessagesCombined() {
		messagesContainer.innerHTML = '';
		
		let allMessages = [];
		allFilesData.forEach(fileData => {
			allMessages = allMessages.concat(fileData.messages);
		});
		
		if (allMessages.length === 0) {
			messagesContainer.innerHTML = `
			<div class="manager-event-empty-state">
				<svg class="manager-event-svg-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
				<h3>No Messages Found</h3>
				<p>The files don't contain any messages</p>
			</div>
			`;
			return;
		}
		
		const combinedContainer = document.createElement('div');
		combinedContainer.className = 'manager-event-combined-container';
		
		// Group messages by event
		const messagesByEvent = {};
		allMessages.forEach(msg => {
			if (!messagesByEvent[msg.eventId]) {
				messagesByEvent[msg.eventId] = {
					eventName: msg.eventName,
					fileName: msg.fileName,
					messages: []
				};
			}
			messagesByEvent[msg.eventId].messages.push(msg);
		});
		
		// Create event groups
		Object.values(messagesByEvent).forEach(eventGroup => {
			const eventCard = document.createElement('div');
			eventCard.className = 'manager-event-event-card';
			
			const cardHeader = document.createElement('div');
			cardHeader.className = 'manager-event-event-header';
			cardHeader.innerHTML = `
			<div>
				<span class="manager-event-event-name">${eventGroup.eventName || 'Unnamed Event'}</span>
				<div class="manager-event-event-source">File: ${eventGroup.fileName}</div>
			</div>
			<span class="manager-event-message-count">${eventGroup.messages.length} message(s)</span>
			`;
			
			const cardContent = document.createElement('div');
			cardContent.className = 'manager-event-event-content';
			
			eventGroup.messages.forEach(msg => {
				const messageItem = document.createElement('div');
				messageItem.className = 'manager-event-message-item';
				
				const speaker = document.createElement('div');
				speaker.className = 'manager-event-message-speaker';
				speaker.innerHTML = `
					<svg class="manager-event-svg-icon" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
					${msg.speaker || 'narrator'}
				`;
				
				const editorBody = document.createElement('div');
				editorBody.className = 'manager-event-editor-body';
				
				const textarea = document.createElement('textarea');
				textarea.className = 'manager-event-message-editor';
				textarea.value = editedMessages[msg.id] || msg.text;
				textarea.dataset.id = msg.id;
				textarea.addEventListener('input', handleMessageEdit);
				
				editorBody.appendChild(textarea);
				messageItem.appendChild(speaker);
				messageItem.appendChild(editorBody);
				cardContent.appendChild(messageItem);
			});
			
			eventCard.appendChild(cardHeader);
			eventCard.appendChild(cardContent);
			combinedContainer.appendChild(eventCard);
		});
		
		messagesContainer.appendChild(combinedContainer);
	}
	
	// Function to render events in a combined view
	function renderEventsCombined() {
		eventsContainer.innerHTML = '';
		
		let allEvents = [];
		allFilesData.forEach(fileData => {
			fileData.events.forEach(event => {
				allEvents.push({
					...event,
					fileName: fileData.fileName
				});
			});
		});
		
		if (allEvents.length === 0) {
			eventsContainer.innerHTML = `
			<div class="manager-event-empty-state">
				<svg class="manager-event-svg-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
				<h3>No Events Found</h3>
				<p>The files don't contain any events</p>
			</div>
			`;
			return;
		}
		
		const combinedContainer = document.createElement('div');
		combinedContainer.className = 'manager-event-combined-container';
		
		allEvents.forEach(event => {
			const eventCard = document.createElement('div');
			eventCard.className = 'manager-event-event-card';
			
			const cardHeader = document.createElement('div');
			cardHeader.className = 'manager-event-event-header';
			cardHeader.innerHTML = `
			<div>
				<span class="manager-event-event-name">${event.name || 'Unnamed Event'}</span>
				<div class="manager-event-event-source">File: ${event.fileName}</div>
				${event.filter ? `<div class="manager-event-event-filter">Filter: ${event.filter}</div>` : ''}
			</div>
			<span class="manager-event-event-count">${event.messages.length} message(s)</span>
			`;
			
			const cardContent = document.createElement('div');
			cardContent.className = 'manager-event-event-content';
			
			// Event editor
			const editorContainer = document.createElement('div');
			editorContainer.className = 'manager-event-editor-container';
			
			const editorHeader = document.createElement('div');
			editorHeader.className = 'manager-event-editor-header';
			editorHeader.innerHTML = `
			<span>Event Code Editor</span>
			<span>
				<svg class="manager-event-svg-icon" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
			</span>
			`;
			
			const editorBody = document.createElement('div');
			editorBody.className = 'manager-event-editor-body';
			
			const textarea = document.createElement('textarea');
			textarea.className = 'manager-event-code-editor';
			textarea.value = editedEvents[event.id] || event.block;
			textarea.dataset.id = event.id;
			textarea.addEventListener('input', handleEventEdit);
			
			editorBody.appendChild(textarea);
			editorContainer.appendChild(editorHeader);
			editorContainer.appendChild(editorBody);
			cardContent.appendChild(editorContainer);
			
			// Messages in this event
			if (event.messages.length > 0) {
				const messagesHeader = document.createElement('h4');
				messagesHeader.style.margin = '15px 0 10px';
				messagesHeader.innerHTML = `
					<svg class="manager-event-svg-icon" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17l-.59.59-.58.58V4h16v12zm-9-4h2v2h-2v-2zm0-6h2v4h-2V6z"/></svg>
					Messages in this event:
				`;
				
				cardContent.appendChild(messagesHeader);
				
				event.messages.forEach(msg => {
					const messageItem = document.createElement('div');
					messageItem.className = 'manager-event-message-item';
					
					const speaker = document.createElement('div');
					speaker.className = 'manager-event-message-speaker';
					speaker.innerHTML = `
						<svg class="manager-event-svg-icon" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
						${msg.speaker || 'narrator'}
					`;
					
					const editorBody = document.createElement('div');
					editorBody.className = 'manager-event-editor-body';
					
					const textarea = document.createElement('textarea');
					textarea.className = 'manager-event-message-editor';
					textarea.value = editedMessages[msg.id] || msg.text;
					textarea.dataset.id = msg.id;
					textarea.addEventListener('input', handleMessageEdit);
					
					editorBody.appendChild(textarea);
					messageItem.appendChild(speaker);
					messageItem.appendChild(editorBody);
					cardContent.appendChild(messageItem);
				});
			}
			
			eventCard.appendChild(cardHeader);
			eventCard.appendChild(cardContent);
			combinedContainer.appendChild(eventCard);
		});
		
		eventsContainer.appendChild(combinedContainer);
	}
	// Function to handle event editing
	function handleEventEdit(e) {
		const eventId = e.target.dataset.id;
		editedEvents[eventId] = e.target.value;
		hasUnsavedChanges = true;
		saveSection.style.display = 'block';
	}
	
	// Function to handle message editing
	function handleMessageEdit(e) {
		const messageId = e.target.dataset.id;
		editedMessages[messageId] = e.target.value;
		hasUnsavedChanges = true;
		saveSection.style.display = 'block';
	}
	
	// Function to switch between views
	function switchView(view) {
		viewMode = view;
		
		if (view === 'events') {
			eventsViewBtn.classList.add('manager-event-active');
			messagesViewBtn.classList.remove('manager-event-active');
			eventsContainer.style.display = 'block';
			messagesContainer.style.display = 'none';
			} else {
			messagesViewBtn.classList.add('manager-event-active');
			eventsViewBtn.classList.remove('manager-event-active');
			eventsContainer.style.display = 'none';
			messagesContainer.style.display = 'block';
		}
		
		renderContent();
	}
	
	// Function to switch group mode
	function switchGroupMode(mode) {
		groupMode = mode;
		
		if (mode === 'grouped') {
			groupFilesBtn.classList.add('manager-event-active');
			combineFilesBtn.classList.remove('manager-event-active');
			} else {
			combineFilesBtn.classList.add('manager-event-active');
			groupFilesBtn.classList.remove('manager-event-active');
		}
		
		renderContent();
	}
	
	// Function to toggle statistics visibility
	function toggleStats() {
		statsVisible = !statsVisible;
		statsPanel.style.display = statsVisible ? 'block' : 'none';
		statsToggleBtn.innerHTML = statsVisible ? 
			'<svg class="manager-event-svg-icon" viewBox="0 0 24 24"><path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z"/></svg> Hide Statistics' : 
			'<svg class="manager-event-svg-icon" viewBox="0 0 24 24"><path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z"/></svg> Show Statistics';
	}
	
	// Function to update file info
	function updateFileInfo() {
		fileCount.textContent = allFilesData.length;
		
		// Calculate total events and messages
		let totalEventsCount = 0;
		let totalMessagesCount = 0;
		
		allFilesData.forEach(file => {
			totalEventsCount += file.events.length;
			totalMessagesCount += file.messages.length;
		});
		
		totalEvents.textContent = totalEventsCount;
		totalMessages.textContent = totalMessagesCount;
	}
	
	// Function to update statistics
	function updateStats() {
		statFiles.textContent = allFilesData.length;
		
		let totalEventsCount = 0;
		let totalMessagesCount = 0;
		
		allFilesData.forEach(file => {
			totalEventsCount += file.events.length;
			totalMessagesCount += file.messages.length;
		});
		
		statEvents.textContent = totalEventsCount;
		statMessages.textContent = totalMessagesCount;
		
		// Calculate average events per file
		const avgEvents = allFilesData.length > 0 ? 
		(totalEventsCount / allFilesData.length).toFixed(1) : 0;
		statAvgEvents.textContent = avgEvents;
		
		// Update file stats list
		fileStatsList.innerHTML = '';
		
		allFilesData.forEach(file => {
			const fileStat = document.createElement('div');
			fileStat.className = 'manager-event-file-stat-item';
			
			fileStat.innerHTML = `
			<div class="manager-event-file-name" title="${file.fileName}">
				<svg class="manager-event-svg-icon" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
				${file.fileName}
			</div>
			<div class="manager-event-file-counts">
				<div class="manager-event-file-count">${file.events.length}</div>
				<div class="manager-event-file-count">${file.messages.length}</div>
			</div>
			`;
			
			fileStatsList.appendChild(fileStat);
		});
	}
	
	// Function to handle download
	function handleDownload() {
		if (hasUnsavedChanges) {
			saveSection.style.display = 'block';
			} else {
			downloadFiles();
		}
	}
	
	// Function to save changes
	function saveChanges() {
		hasUnsavedChanges = false;
		saveSection.style.display = 'none';
		downloadFiles();
	}
	
	// Function to discard changes
	function discardChanges() {
		editedEvents = {};
		editedMessages = {};
		hasUnsavedChanges = false;
		saveSection.style.display = 'none';
		renderContent();
	}
	
	// Function to download files
	function downloadFiles() {
		allFilesData.forEach(fileData => {
			let content = originalFiles[fileData.fileName];
			
			// Apply event edits
			fileData.events.forEach(event => {
				if (editedEvents[event.id]) {
					content = content.replace(event.block, editedEvents[event.id]);
				}
			});
			
			// Apply message edits
			fileData.messages.forEach(msg => {
				if (editedMessages[msg.id]) {
					const oldPattern = new RegExp(`message\\s*=\\s*_?\\s*"${escapeRegExp(msg.text)}"`, 'g');
					content = content.replace(oldPattern, `message="${editedMessages[msg.id]}"`);
				}
			});
			
			// Create download link
			const blob = new Blob([content], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = fileData.fileName;
			document.body.appendChild(a);
			a.click();
			setTimeout(() => {
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			}, 100);
		});
	}
	
	// Helper function to escape regex special characters
	function escapeRegExp(string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}
	
	// Function to clear results
	function clearResults() {
		allFilesData = [];
		editedEvents = {};
		editedMessages = {};
		hasUnsavedChanges = false;
		eventsContainer.innerHTML = '';
		messagesContainer.innerHTML = '';
		resultsSection.style.display = 'none';
		emptyState.style.display = 'block';
		pasteArea.value = '';
		fileInput.value = '';
		statsPanel.style.display = 'none';
		statsVisible = false;
		statsToggleBtn.innerHTML = '<svg class="manager-event-svg-icon" viewBox="0 0 24 24"><path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z"/></svg> Show Statistics';
		saveSection.style.display = 'none';
		switchView('events');
		switchGroupMode('grouped');
	}
	
	// Initialize view
	switchView('events');
	switchGroupMode('grouped');
	// Add tooltip initialization
	function initTooltips() {
		document.querySelectorAll('.wts-manager-event-tooltip').forEach(el => {
			const key = el.getAttribute('data-i18n');
			if (key) {
				// In a real implementation, this would use i18n.t(key)
				el.title = key.replace(/_/g, ' ');
			}
		});
	}
	
	// Initialize tooltips on load
	initTooltips();
	
	// Re-initialize tooltips when content changes
	function afterContentRender() {
		initTooltips();
	}
});