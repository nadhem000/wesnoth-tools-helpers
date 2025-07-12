document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const inputOptions = document.querySelectorAll('.manager-scenario-input-option');
    const inputContents = document.querySelectorAll('.manager-scenario-input-content');
    const fileInput = document.getElementById('manager-scenario-file-input');
    const processBtn = document.getElementById('manager-scenario-process-btn');
    const resetBtn = document.getElementById('manager-scenario-reset-btn');
    const pasteInput = document.getElementById('manager-scenario-paste-input');
    const pasteProcessBtn = document.getElementById('manager-scenario-paste-process-btn');
    const pasteResetBtn = document.getElementById('manager-scenario-paste-reset-btn');
    const outputSection = document.getElementById('manager-scenario-output-section');
    const outputContent = document.getElementById('manager-scenario-output-content');
    const backBtn = document.getElementById('manager-scenario-back-btn');
    
    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'manager-scenario-notification';
    notification.className = 'manager-scenario-notification';
    document.querySelector('.manager-scenario-container').appendChild(notification);

    // Initialize state
    let currentInputMethod = 'upload';
    let extractedData = [];

    // Event Listeners
    inputOptions.forEach(option => {
        option.addEventListener('click', () => {
            const target = option.dataset.target;
            inputOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            inputContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`manager-scenario-${target}-content`).classList.add('active');
            currentInputMethod = target;
        });
    });

    processBtn.addEventListener('click', processFiles);
    resetBtn.addEventListener('click', () => fileInput.value = '');
    pasteProcessBtn.addEventListener('click', processPastedContent);
    pasteResetBtn.addEventListener('click', () => pasteInput.value = '');
    backBtn.addEventListener('click', () => outputSection.classList.remove('active'));

    // Core Functions
    function processFiles() {
        const files = fileInput.files;
        if (files.length === 0) {
            showNotification(i18n.t('manager_scenario.no_files_error'), true);
            return;
        }
        
        extractedData = [];
        const promises = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const promise = new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target.result;
                    const scenarioData = parseScenario(content, file.name);
                    extractedData.push(scenarioData);
                    resolve();
                };
                reader.readAsText(file);
            });
            promises.push(promise);
        }
        
        Promise.all(promises).then(() => {
            displayResults();
            outputSection.classList.add('active');
            showNotification(i18n.t('manager_scenario.success', { count: files.length }));
        }).catch(error => {
            showNotification(i18n.t('manager_scenario.processing_error'), true);
            console.error('Error processing files:', error);
        });
    }

    function processPastedContent() {
        const content = pasteInput.value.trim();
        if (content === '') {
            showNotification(i18n.t('manager_scenario.no_content_error'), true);
            return;
        }
        
        extractedData = [parseScenario(content, i18n.t('manager_scenario.pasted_scenario'))];
        displayResults();
        outputSection.classList.add('active');
        showNotification(i18n.t('manager_scenario.paste_success'));
    }

    function parseScenario(content, fileName) {
        const scenario = {
            fileName: fileName,
            id: extractValue(content, /id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^#\r\n]+[^\s#]*))/),
            name: extractValue(content, /name\s*=\s*(?:"([^"]*)"|'([^']*)'|([^#\r\n]+[^\s#]*))/),
            nextScenario: extractValue(content, /next_scenario\s*=\s*(?:"([^"]*)"|'([^']*)'|([^#\r\n]+[^\s#]*))/),
            storyParts: extractStoryParts(content),
            events: []
        };

        // Extract events and their messages
        const events = extractEvents(content);
        const filterTypes = ['filter', 'filter_second', 'filter_side', 'filter_location'];
        
        events.forEach(event => {
            const eventContent = event.block;
            
            // Extract filters
            const allFilters = [];
            for (const filterType of filterTypes) {
                const filterRegex = new RegExp(`\\[${filterType}\\]([\\s\\S]*?)\\[\\/${filterType}\\]`, 'gi');
                let filterMatch;
                while ((filterMatch = filterRegex.exec(eventContent)) !== null) {
                    let filterContent = filterMatch[1];
                    filterContent = filterContent
                        .replace(/#.*$/gm, '')
                        .split('\n')
                        .map(line => line.trim())
                        .filter(line => line)
                        .join('\n');
                    
                    allFilters.push(`${filterType}:\n${filterContent}`);
                }
            }
            
            const filterSummary = allFilters.length > 0 ? 
                allFilters.join('\n\n') : 
                i18n.t('manager_scenario.no_filter');
            
            // Skip events without messages
            if (!/\[message\]/.test(eventContent)) return;
            
            scenario.events.push({
                name: event.name,
                filters: filterSummary,
                messages: parseEventContent(eventContent)
            });
        });
        
        return scenario;
    }

    function displayResults() {
        outputContent.innerHTML = '';
        
        if (extractedData.length === 0) {
            outputContent.innerHTML = `
            <div class="manager-scenario-empty-state">
                <div>📭</div>
                <h3>${i18n.t('manager_scenario.no_scenarios')}</h3>
                <p>${i18n.t('manager_scenario.try_uploading')}</p>
            </div>
            `;
            return;
        }
        
        extractedData.forEach(scenario => {
            const scenarioElement = document.createElement('div');
            scenarioElement.className = 'manager-scenario-scenario-card';
            
            // Prepare events HTML
            let eventsHTML = '';
            
            scenario.events.forEach((event, index) => {
                const { name, filters, messages } = event;
                
                // Recursive function to render condition hierarchy
                function renderMessages(messages) {
                    let html = '';
                    messages.forEach(entry => {
                        if (entry.type === 'message') {
                            html += `
                            <div class="manager-scenario-dialogue-entry">
                                <div class="manager-scenario-speaker">${entry.speaker}</div>
                                <div class="manager-scenario-message">${entry.text}</div>
                            </div>
                            `;
                        }
                        else if (entry.type === 'condition') {
                            const childrenHTML = renderMessages(entry.children);
                            const conditionContent = entry.content
                                .replace(/^[\n\s]+|[\n\s]+$/g, '')
                                .split('\n')
                                .map(line => line.trim())
                                .filter(line => line)
                                .join('\n');
                            
                            html += `
                            <div class="manager-scenario-condition-group">
                                <div class="manager-scenario-condition-header">${entry.tag.toUpperCase()}</div>
                                <div class="manager-scenario-condition-content"><pre>${conditionContent}</pre></div>
                                <div class="manager-scenario-message-container">
                                    ${childrenHTML}
                                </div>
                            </div>
                            `;
                        }
                    });
                    return html;
                }
                
                const eventEntriesHTML = renderMessages(messages);
                
                if (eventEntriesHTML) {
                    eventsHTML += `
                    <div class="manager-scenario-event-group">
                        <h3 class="manager-scenario-event-title">${name} <span class="manager-scenario-event-count">#${index+1}</span></h3>
                        <div class="manager-scenario-event-filter"><pre>${filters}</pre></div>
                        <div class="manager-scenario-message-container">
                            ${eventEntriesHTML}
                        </div>
                    </div>
                    `;
                }
            });
            
            // Build scenario content
            scenarioElement.innerHTML = `
            <div class="manager-scenario-card-header">
                <div>
                    <h2 class="manager-scenario-card-title">${scenario.name || i18n.t('manager_scenario.unnamed_scenario')}</h2>
                    <div class="manager-scenario-card-id">${i18n.t('manager_scenario.id')}: ${scenario.id || 'N/A'}</div>
                </div>
                <div>
                    <div>${i18n.t('manager_scenario.file')}: ${scenario.fileName}</div>
                    ${scenario.nextScenario ? `<div>${i18n.t('manager_scenario.next_scenario')}: ${scenario.nextScenario}</div>` : ''}
                    <div>${i18n.t('manager_scenario.events')}: ${scenario.events.length}</div>
                </div>
            </div>
            
            <div class="manager-scenario-card-content">
                ${scenario.storyParts.length > 0 ? `
                <div class="manager-scenario-story-section">
                    <h3 class="manager-scenario-section-title">${i18n.t('manager_scenario.story_section')}</h3>
                    ${scenario.storyParts.map(part => `
                        <div class="manager-scenario-story-part">
                            <p class="manager-scenario-story-text">${part}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${eventsHTML ? `
                <div class="manager-scenario-dialogue-section">
                    <h3 class="manager-scenario-section-title">${i18n.t('manager_scenario.dialogue_section')}</h3>
                    ${eventsHTML}
                </div>
                ` : `
                <div class="manager-scenario-empty-state">
                    <div>🔇</div>
                    <p>${i18n.t('manager_scenario.no_dialogue')}</p>
                </div>
                `}
            </div>
            `;
            
            outputContent.appendChild(scenarioElement);
        });
    }

    function showNotification(message, isError = false) {
        notification.textContent = message;
        notification.className = 'manager-scenario-notification';
        
        if (isError) {
            notification.classList.add('manager-scenario-notification-error');
        }
        
        notification.classList.add('manager-scenario-notification-show');
        
        setTimeout(() => {
            notification.classList.remove('manager-scenario-notification-show');
        }, 3000);
    }
});