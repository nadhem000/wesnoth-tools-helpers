document.addEventListener('DOMContentLoaded', function() {
            // Initialize i18n
            i18n.init();
            
            // Elements
            const fileInput = document.getElementById('manager-event-fileInput');
            const dropZone = document.getElementById('manager-event-dropZone');
            const browseBtn = document.getElementById('manager-event-browseBtn');
            const pasteArea = document.getElementById('manager-event-pasteArea');
            const processPasteBtn = document.getElementById('manager-event-processPasteBtn');
            const resultsSection = document.getElementById('manager-event-resultsSection');
            const emptyState = document.getElementById('manager-event-emptyState');
            const eventsContainer = document.getElementById('manager-event-eventsContainer');
            const messagesContainer = document.getElementById('manager-event-messagesContainer');
            const clearResultsBtn = document.getElementById('manager-event-clearResultsBtn');
            const eventsViewBtn = document.getElementById('manager-event-eventsViewBtn');
            const messagesViewBtn = document.getElementById('manager-event-messagesViewBtn');
            const statsPanel = document.getElementById('manager-event-statsPanel');
            const statsToggleBtn = document.getElementById('manager-event-statsToggleBtn');
            const groupFilesBtn = document.getElementById('manager-event-groupFilesBtn');
            const combineFilesBtn = document.getElementById('manager-event-combineFilesBtn');
            const downloadEditedBtn = document.getElementById('manager-event-downloadEditedBtn');
            const saveSection = document.getElementById('manager-event-saveSection');
            const saveChangesBtn = document.getElementById('manager-event-saveChangesBtn');
            const discardChangesBtn = document.getElementById('manager-event-discardChangesBtn');
            const fileCount = document.getElementById('manager-event-fileCount');
            const totalEvents = document.getElementById('manager-event-totalEvents');
            const totalMessages = document.getElementById('manager-event-totalMessages');
            const statFiles = document.getElementById('manager-event-statFiles');
            const statEvents = document.getElementById('manager-event-statEvents');
            const statMessages = document.getElementById('manager-event-statMessages');
            const statAvgEvents = document.getElementById('manager-event-statAvgEvents');
            
            // Current data
            let allFilesData = [];
            let viewMode = 'events';
            let groupMode = 'grouped';
            let statsVisible = true;
            let originalFiles = {};
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
                    const pseudoFile = {
                        name: "Pasted Content",
                        content: content
                    };
                    processPseudoFiles([pseudoFile]);
                } else {
                    alert(i18n.t('events_manager.paste_alert'));
                }
            }
            
            // Function to process uploaded files
            function processFiles(files) {
                const newFilesData = [];
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    if (file.name.endsWith('.cfg')) {
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
                            if (newFilesData.length > 0) {
                                allFilesData = allFilesData.concat(newFilesData);
                                updateUI();
                            }
                        };
                        reader.readAsText(file);
                    }
                }
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
                    updateUI();
                }
            }
            
            // Update UI after processing files
            function updateUI() {
                updateFileInfo();
                updateStats();
                renderContent();
                resultsSection.style.display = 'block';
                emptyState.style.display = 'none';
            }
            
            // Function to extract events from content
            function extractEvents(content) {
                const events = [];
                const eventRegex = /\[event\b[^\]]*\]([\s\S]*?)\[\/event\]/gi;
                let match;
                let eventIndex = 0;
                
                while ((match = eventRegex.exec(content)) !== null) {
                    const eventBlock = match[0];
                    const start = match.index;
                    const end = start + eventBlock.length;
                    
                    // Extract event name
                    const nameMatch = eventBlock.match(
                        /name\s*=\s*"((?:\\"|[^"])*)"|name\s*=\s*'((?:\\'|[^'])*)'|name\s*=\s*([^\s#\[]+)/i
                    );
                    let eventName = "unnamed";
                    if (nameMatch) {
                        eventName = (nameMatch[1] || nameMatch[2] || nameMatch[3] || "").trim();
                    }
                    
                    // Handle multi-line names
                    if (eventName.includes('\n')) {
                        eventName = eventName.split('\n')[0].trim();
                    }
                    
                    // Extract filter content
                    let filterContent = "";
                    const filterMatch = eventBlock.match(/\[filter\]([\s\S]*?)\[\/filter\]/i);
                    if (filterMatch && filterMatch[1]) {
                        filterContent = filterMatch[1].replace(/\s+/g, " ").trim();
                    }
                    
                    events.push({
                        id: `event-${eventIndex++}`,
                        name: eventName,
                        filter: filterContent,
                        block: eventBlock,
                        start: start,
                        end: end
                    });
                }
                return events;
            }
            
            // Function to extract messages from content
            function extractMessages(content, events) {
                const allMessages = [];
                const messageRegex = /\[message\b[^\]]*\]([\s\S]*?)\[\/message\]/gi;
                let match;
                
                while ((match = messageRegex.exec(content)) !== null) {
                    const messageBlock = match[0];
                    const messageStart = match.index;
                    const messageEnd = messageStart + messageBlock.length;
                    
                    // Extract speaker
                    const speakerMatch = messageBlock.match(/speaker\s*=\s*"([^"]*)"|speaker\s*=\s*'([^']*)'|speaker\s*=\s*(\S+)/i);
                    let speaker = "narrator";
                    if (speakerMatch) {
                        speaker = speakerMatch[1] || speakerMatch[2] || speakerMatch[3] || "narrator";
                    }
                    
                    // Extract message text
                    const messageMatch = messageBlock.match(/message\s*=\s*_?\s*"([^"]*)"|message\s*=\s*_?\s*'([^']*)'|message\s*=\s*_?\s*(\S+)/i);
                    let messageText = "";
                    if (messageMatch) {
                        messageText = messageMatch[1] || messageMatch[2] || messageMatch[3] || "";
                    }
                    
                    // Clean up message text
                    messageText = messageText.trim().replace(/^_ /, '');
                    
                    // Find event context and filter
                    let eventContext = "No event context";
                    let eventName = "unnamed";
                    let eventFilter = "";
                    
                    // Find the event that contains this message
                    for (const event of events) {
                        if (messageStart >= event.start && messageEnd <= event.end) {
                            eventContext = event.name;
                            eventName = event.name;
                            eventFilter = event.filter;
                            break;
                        }
                    }
                    
                    allMessages.push({
                        event: eventContext,
                        eventName: eventName,
                        eventFilter: eventFilter,
                        speaker,
                        message: messageText,
                        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
                    });
                }
                
                return allMessages;
            }
            
            // Function to render content based on current view and group mode
            function renderContent() {
                eventsContainer.innerHTML = '';
                messagesContainer.innerHTML = '';
                
                if (allFilesData.length === 0) return;
                
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
                
                // Make content editable
                setTimeout(() => {
                    if (viewMode === 'events') {
                        makeEventsEditable();
                    } else {
                        makeMessagesEditable();
                    }
                }, 100);
            }
            
            // Function to render events grouped by file
            function renderEventsGrouped() {
                allFilesData.forEach(fileData => {
                    if (fileData.events.length === 0) return;
                    
                    const fileGroup = document.createElement('div');
                    fileGroup.className = 'manager-event-file-group';
                    
                    const header = document.createElement('div');
                    header.className = 'manager-event-file-header';
                    header.innerHTML = `
                        <div>
                            <svg class="svg-icon" viewBox="0 0 384 512">
                                <path d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128z"/>
                            </svg>
                            ${fileData.fileName}
                        </div>
                        <div>${fileData.events.length} ${i18n.t('events_manager.events')}</div>
                    `;
                    
                    const content = document.createElement('div');
                    content.className = 'manager-event-events-container-inner';
                    
                    // Group events by name AND filter
                    const groupedEvents = {};
                    fileData.events.forEach(event => {
                        const groupKey = `${event.name}|${event.filter}`;
                        if (!groupedEvents[groupKey]) {
                            groupedEvents[groupKey] = [];
                        }
                        groupedEvents[groupKey].push(event);
                    });
                    
                    // Render grouped events
                    for (const [groupKey, eventGroup] of Object.entries(groupedEvents)) {
                        // Split groupKey back into name and filter
                        const [eventName, eventFilter] = groupKey.split('|');
                        
                        const eventCard = document.createElement('div');
                        eventCard.className = 'manager-event-event-card';
                        
                        const cardHeader = document.createElement('div');
                        cardHeader.className = 'manager-event-event-header';
                        cardHeader.innerHTML = `
                            <div>
                                <div class="manager-event-event-name">${eventName || 'Unnamed Event'}</div>
                                ${eventFilter ? `<div class="manager-event-event-filter">${i18n.t('events_manager.filter_label')}: ${eventFilter}</div>` : ''}
                            </div>
                            <span class="manager-event-event-count">${eventGroup.length} ${i18n.t('events_manager.events')}</span>
                        `;
                        
                        const cardContent = document.createElement('div');
                        cardContent.className = 'manager-event-event-content';
                        
                        eventGroup.forEach((event, index) => {
                            const blockDiv = document.createElement('div');
                            blockDiv.className = 'manager-event-event-block';
                            
                            const blockHeader = document.createElement('div');
                            blockHeader.className = 'manager-event-event-subheader';
                            blockHeader.textContent = `${i18n.t('events_manager.event')} #${index + 1}`;
                            
                            const code = document.createElement('pre');
                            code.className = 'manager-event-event-code';
                            code.textContent = event.block;
                            code.dataset.id = event.id;
                            
                            blockDiv.appendChild(blockHeader);
                            blockDiv.appendChild(code);
                            cardContent.appendChild(blockDiv);
                        });
                        
                        eventCard.appendChild(cardHeader);
                        eventCard.appendChild(cardContent);
                        content.appendChild(eventCard);
                    }
                    
                    fileGroup.appendChild(header);
                    fileGroup.appendChild(content);
                    eventsContainer.appendChild(fileGroup);
                });
            }
            
            // Function to make events editable
            function makeEventsEditable() {
                document.querySelectorAll('.manager-event-event-code').forEach(pre => {
                    const textarea = document.createElement('textarea');
                    textarea.className = 'manager-event-editable';
                    textarea.dataset.id = pre.dataset.id;
                    textarea.value = editedEvents[pre.dataset.id] || pre.textContent;
                    pre.replaceWith(textarea);
                    
                    textarea.addEventListener('input', function(e) {
                        const eventId = e.target.dataset.id;
                        editedEvents[eventId] = e.target.value;
                        hasUnsavedChanges = true;
                        saveSection.style.display = 'flex';
                    });
                });
            }
            
            // Function to make messages editable
            function makeMessagesEditable() {
                document.querySelectorAll('.manager-event-message-text').forEach(div => {
                    const textarea = document.createElement('textarea');
                    textarea.className = 'manager-event-message-editable';
                    textarea.dataset.id = div.dataset.id;
                    textarea.value = editedMessages[div.dataset.id] || div.textContent;
                    div.replaceWith(textarea);
                    
                    textarea.addEventListener('input', function(e) {
                        const messageId = e.target.dataset.id;
                        editedMessages[messageId] = e.target.value;
                        hasUnsavedChanges = true;
                        saveSection.style.display = 'flex';
                    });
                });
            }
            
            // Function to render messages grouped by file
            function renderMessagesGrouped() {
                allFilesData.forEach(fileData => {
                    if (fileData.messages.length === 0) return;
                    
                    const fileGroup = document.createElement('div');
                    fileGroup.className = 'manager-event-file-group';
                    
                    const header = document.createElement('div');
                    header.className = 'manager-event-file-header';
                    header.innerHTML = `
                        <div>
                            <svg class="svg-icon" viewBox="0 0 384 512">
                                <path d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128z"/>
                            </svg>
                            ${fileData.fileName}
                        </div>
                        <div>${fileData.messages.length} ${i18n.t('events_manager.messages')}</div>
                    `;
                    
                    const content = document.createElement('div');
                    content.className = 'manager-event-messages-container-inner';
                    
                    // Group messages by event name AND filter
                    const groupedMessages = {};
                    fileData.messages.forEach(msg => {
                        const groupKey = `${msg.eventName}|${msg.eventFilter}`;
                        if (!groupedMessages[groupKey]) {
                            groupedMessages[groupKey] = [];
                        }
                        groupedMessages[groupKey].push(msg);
                    });
                    
                    // Render grouped messages
                    for (const [groupKey, messageGroup] of Object.entries(groupedMessages)) {
                        // Split groupKey back into name and filter
                        const [eventName, eventFilter] = groupKey.split('|');
                        
                        const messageCard = document.createElement('div');
                        messageCard.className = 'manager-event-message-card';
                        
                        const cardHeader = document.createElement('div');
                        cardHeader.className = 'manager-event-message-header';
                        cardHeader.innerHTML = `
                            <div>
                                <div class="manager-event-event-name">${eventName || 'Unnamed Event'}</div>
                                ${eventFilter ? `<div class="manager-event-event-filter">${i18n.t('events_manager.filter_label')}: ${eventFilter}</div>` : ''}
                            </div>
                            <span class="manager-event-event-count">${messageGroup.length} ${i18n.t('events_manager.messages')}</span>
                        `;
                        
                        const cardContent = document.createElement('div');
                        cardContent.className = 'manager-event-message-content';
                        
                        messageGroup.forEach(msg => {
                            const messageItem = document.createElement('div');
                            messageItem.className = 'manager-event-message-item';
                            
                            const speaker = document.createElement('div');
                            speaker.className = 'manager-event-message-speaker';
                            speaker.innerHTML = `
                                <svg class="svg-icon" viewBox="0 0 448 512">
                                    <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0S96 57.3 96 128s57.3 128 128 128zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/>
                                </svg>
                                ${msg.speaker || 'narrator'}
                            `;
                            
                            const text = document.createElement('div');
                            text.className = 'manager-event-message-text';
                            text.textContent = msg.message;
                            text.dataset.id = msg.id;
                            
                            messageItem.appendChild(speaker);
                            messageItem.appendChild(text);
                            cardContent.appendChild(messageItem);
                        });
                        
                        messageCard.appendChild(cardHeader);
                        messageCard.appendChild(cardContent);
                        content.appendChild(messageCard);
                    }
                    
                    fileGroup.appendChild(header);
                    fileGroup.appendChild(content);
                    messagesContainer.appendChild(fileGroup);
                });
            }
            
            // Function to switch between views
            function switchView(view) {
                viewMode = view;
                if (view === 'events') {
                    eventsViewBtn.classList.add('manager-event-active');
                    messagesViewBtn.classList.remove('manager-event-active');
                    eventsContainer.classList.add('active');
                    messagesContainer.classList.remove('active');
                } else {
                    messagesViewBtn.classList.add('manager-event-active');
                    eventsViewBtn.classList.remove('manager-event-active');
                    messagesContainer.classList.add('active');
                    eventsContainer.classList.remove('active');
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
                    `<svg class="svg-icon" viewBox="0 0 512 512">
                        <path d="M496 384H64V80c0-8.84-7.16-16-16-16H16C7.16 64 0 71.16 0 80v336c0 17.67 14.33 32 32 32h464c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zM464 96H345.94c-21.38 0-32.09 25.85-16.97 40.97l32.4 32.4L288 242.75l-73.37-73.37c-12.5-12.5-32.76-12.5-45.25 0l-68.69 68.69c-6.25 6.25-6.25 16.38 0 22.63l22.62 22.62c6.25 6.25 16.38 6.25 22.63 0L192 237.25l73.37 73.37c12.5 12.5 32.76 12.5 45.25 0l96-96 32.4 32.4c15.12 15.12 40.97 4.41 40.97-16.97V112c.01-8.84-7.15-16-15.99-16z"/>
                    </svg>
                    <span data-i18n="events_manager.hide_stats">Hide Statistics</span>` : 
                    `<svg class="svg-icon" viewBox="0 0 512 512">
                        <path d="M496 384H64V80c0-8.84-7.16-16-16-16H16C7.16 64 0 71.16 0 80v336c0 17.67 14.33 32 32 32h464c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zM464 96H345.94c-21.38 0-32.09 25.85-16.97 40.97l32.4 32.4L288 242.75l-73.37-73.37c-12.5-12.5-32.76-12.5-45.25 0l-68.69 68.69c-6.25 6.25-6.25 16.38 0 22.63l22.62 22.62c6.25 6.25 16.38 6.25 22.63 0L192 237.25l73.37 73.37c12.5 12.5 32.76 12.5 45.25 0l96-96 32.4 32.4c15.12 15.12 40.97 4.41 40.97-16.97V112c.01-8.84-7.15-16-15.99-16z"/>
                    </svg>
                    <span data-i18n="events_manager.show_stats">Show Statistics</span>`;
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
            }
            
            // Function to handle download
            function handleDownload() {
                if (hasUnsavedChanges) {
                    saveSection.style.display = 'flex';
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
                alert(i18n.t('events_manager.download_success'));
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
                statsPanel.style.display = 'block';
                statsVisible = true;
                statsToggleBtn.innerHTML = `<svg class="svg-icon" viewBox="0 0 512 512">
                    <path d="M496 384H64V80c0-8.84-7.16-16-16-16H16C7.16 64 0 71.16 0 80v336c0 17.67 14.33 32 32 32h464c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zM464 96H345.94c-21.38 0-32.09 25.85-16.97 40.97l32.4 32.4L288 242.75l-73.37-73.37c-12.5-12.5-32.76-12.5-45.25 0l-68.69 68.69c-6.25 6.25-6.25 16.38 0 22.63l22.62 22.62c6.25 6.25 16.38 6.25 22.63 0L192 237.25l73.37 73.37c12.5 12.5 32.76 12.5 45.25 0l96-96 32.4 32.4c15.12 15.12 40.97 4.41 40.97-16.97V112c.01-8.84-7.15-16-15.99-16z"/>
                </svg>
                <span data-i18n="events_manager.show_stats">Show Statistics</span>`;
                switchView('events');
                switchGroupMode('grouped');
            }
            
            // Initialize view
            switchView('events');
            switchGroupMode('grouped');
            toggleStats();
        });