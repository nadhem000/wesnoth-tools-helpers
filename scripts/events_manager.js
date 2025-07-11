
        document.addEventListener('DOMContentLoaded', function() {
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
            
            // Theme toggle
            document.getElementById('wts-theme-toggle').addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
            });
            
            // Load theme preference
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                document.documentElement.setAttribute('data-theme', savedTheme);
            }
            
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
                    alert("Please paste some .cfg content first!");
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
                // Simplified event extraction logic
                const events = [];
                const eventRegex = /\[event\]([\s\S]*?)\[\/event\]/g;
                let match;
                
                while ((match = eventRegex.exec(content)) !== null) {
                    const eventBlock = match[0];
                    const nameMatch = /name\s*=\s*"([^"]*)"/.exec(eventBlock);
                    const filterMatch = /first_time_only\s*=\s*(true|false)/.exec(eventBlock);
                    
                    events.push({
                        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                        name: nameMatch ? nameMatch[1] : 'Unnamed Event',
                        filter: filterMatch ? `first_time_only=${filterMatch[1]}` : '',
                        block: eventBlock,
                        messages: []
                    });
                }
                
                return events;
            }
            
            // Function to extract messages from content
            function extractMessages(content, events) {
                const allMessages = [];
                
                events.forEach(event => {
                    const messageRegex = /\[message\]([\s\S]*?)\[\/message\]/g;
                    let msgMatch;
                    
                    while ((msgMatch = messageRegex.exec(event.block)) !== null) {
                        const msgBlock = msgMatch[0];
                        const speakerMatch = /speaker\s*=\s*"([^"]*)"/.exec(msgBlock);
                        const textMatch = /message\s*=\s*_?\s*"([^"]*)"/.exec(msgBlock);
                        
                        if (textMatch) {
                            const msg = {
                                id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                                speaker: speakerMatch ? speakerMatch[1] : 'narrator',
                                text: textMatch[1],
                                eventName: event.name,
                                eventId: event.id
                            };
                            
                            allMessages.push(msg);
                            event.messages.push(msg);
                        }
                    }
                });
                
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
                        <div>${fileData.events.length} event(s)</div>
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
                                <span>${event.name}</span>
                                ${event.filter ? `<div>Filter: ${event.filter}</div>` : ''}
                            </div>
                            <span>${event.messages.length} message(s)</span>
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
                                <svg class="svg-icon" viewBox="0 0 448 512">
                                    <path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"/>
                                </svg>
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
                                <svg class="svg-icon" viewBox="0 0 512 512">
                                    <path d="M160 368c26.5 0 48 21.5 48 48s-21.5 48-48 48s-48-21.5-48-48s21.5-48 48-48zm-96 0c26.5 0 48 21.5 48 48s-21.5 48-48 48s-48-21.5-48-48s21.5-48 48-48zm368 0c26.5 0 48 21.5 48 48s-21.5 48-48 48s-48-21.5-48-48s21.5-48 48-48zm96-304v256c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V64c0-26.5 21.5-48 48-48h416c26.5 0 48 21.5 48 48zm-48 64H48v192h416V128zm0-64H48v32h416V64z"/>
                                </svg>
                                Messages in this event:
                            `;
                            cardContent.appendChild(messagesHeader);
                            
                            event.messages.forEach(msg => {
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
            
            // Function to handle event editing
            function handleEventEdit(e) {
                const eventId = e.target.dataset.id;
                editedEvents[eventId] = e.target.value;
                hasUnsavedChanges = true;
                saveSection.style.display = 'flex';
            }
            
            // Function to handle message editing
            function handleMessageEdit(e) {
                const messageId = e.target.dataset.id;
                editedMessages[messageId] = e.target.value;
                hasUnsavedChanges = true;
                saveSection.style.display = 'flex';
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
                statsToggleBtn.textContent = statsVisible ? 'Hide Statistics' : 'Show Statistics';
            }
            
            // Function to update file info
            function updateFileInfo() {
                // Calculate total events and messages
                let totalEventsCount = 0;
                let totalMessagesCount = 0;
                
                allFilesData.forEach(file => {
                    totalEventsCount += file.events.length;
                    totalMessagesCount += file.messages.length;
                });
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
                alert("Files would be downloaded in a real implementation. This is a demo.");
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
                statsToggleBtn.textContent = 'Hide Statistics';
                saveSection.style.display = 'none';
                switchView('events');
                switchGroupMode('grouped');
            }
            
            // Initialize view
            switchView('events');
            switchGroupMode('grouped');
            toggleStats();
            
            // Demo data to show the UI functionality
            setTimeout(() => {
                const demoContent = `
                    [event]
                        name="start"
                        first_time_only=yes
                        [message]
                            speaker="King"
                            message= _ "Welcome to our kingdom, brave warrior!"
                        [/message]
                        [message]
                            speaker="Warrior"
                            message= _ "I am ready for battle!"
                        [/message]
                    [/event]
                    
                    [event]
                        name="victory"
                        [message]
                            speaker="Narrator"
                            message= _ "The battle was won, but the war continues..."
                        [/message]
                    [/event]
                `;
                
                processPseudoFiles([{name: "demo_scenario.cfg", content: demoContent}]);
            }, 1000);
        });