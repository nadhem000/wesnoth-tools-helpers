// story_mode.js
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const inputOptions = document.querySelectorAll('.mode-story-input-option');
    const inputContents = document.querySelectorAll('.mode-story-input-content');
    const fileInput = document.getElementById('mode-story-file-input');
    const processBtn = document.getElementById('mode-story-process-btn');
    const resetBtn = document.getElementById('mode-story-reset-btn');
    const pasteInput = document.getElementById('mode-story-paste-input');
    const pasteProcessBtn = document.getElementById('mode-story-paste-process-btn');
    const pasteResetBtn = document.getElementById('mode-story-paste-reset-btn');
    const outputSection = document.getElementById('mode-story-output-section');
    const outputContent = document.getElementById('mode-story-output-content');
    const backBtn = document.getElementById('mode-story-back-btn');
    
    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'mode-story-notification';
    notification.className = 'mode-story-notification';
    document.querySelector('.mode-story-container').appendChild(notification);

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
            document.getElementById(`mode-story-${target}-content`).classList.add('active');
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
            showNotification(i18n.t('story_mode.no_files_error'), true);
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
            showNotification(i18n.t('story_mode.success', { count: files.length }));
        }).catch(error => {
            showNotification(i18n.t('story_mode.processing_error'), true);
            console.error('Error processing files:', error);
        });
    }

    function processPastedContent() {
        const content = pasteInput.value.trim();
        if (content === '') {
            showNotification(i18n.t('story_mode.no_content_error'), true);
            return;
        }
        
        extractedData = [parseScenario(content, i18n.t('story_mode.pasted_scenario'))];
        displayResults();
        outputSection.classList.add('active');
        showNotification(i18n.t('story_mode.paste_success'));
    }

    function parseScenario(content, fileName) {
        // Helper function to extract values
        const extractValue = (attrName, str) => {
            const regex = new RegExp(
                `${attrName}\\s*=\\s*` + 
                `(?:"([^"]*)"|'([^']*)'|([^\\s\\[\\]]+))`
            );
            const match = regex.exec(str);
            if (!match) return '';
            return (match[1] || match[2] || match[3] || '').trim();
        };

        const scenario = {
            fileName: fileName,
            id: '',
            name: '',
            nextScenario: '',
            storyParts: [],
            events: []
        };

        // Extract scenario metadata
        scenario.id = extractValue('id', content);
        scenario.name = extractValue('name', content);
        scenario.nextScenario = extractValue('next_scenario', content);
        
        // Extract story parts
        scenario.storyParts = wesnothWMLUtils.extractStoryParts(content);
        
        // Extract events
        const events = wesnothWMLUtils.extractEvents(content);
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
                i18n.t('story_mode.no_filter');
            
            // Skip events without messages
            if (!/\[message\]/.test(eventContent)) return;
            
            scenario.events.push({
                name: event.name,
                filters: filterSummary,
                messages: wesnothWMLUtils.parseEventContent(eventContent)
            });
        });
        
        return scenario;
    }

    function displayResults() {
        outputContent.innerHTML = '';
        
        if (extractedData.length === 0) {
            outputContent.innerHTML = `
                <div class="mode-story-empty-state">
                    <div>📭</div>
                    <h3>${i18n.t('story_mode.no_scenarios')}</h3>
                    <p>${i18n.t('story_mode.try_uploading')}</p>
                </div>
            `;
            return;
        }
        
        extractedData.forEach(scenario => {
            const scenarioElement = document.createElement('div');
            scenarioElement.className = 'mode-story-scenario-card';
            
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
                                <div class="mode-story-dialogue-entry">
                                    <div class="mode-story-speaker">
                                        <span class="mode-story-icon">💬</span>${entry.speaker}
                                    </div>
                                    <div class="mode-story-message">${entry.text}</div>
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
                                <div class="mode-story-condition-group">
                                    <div class="mode-story-condition-header">
                                        <span class="mode-story-icon">🔲</span>${entry.tag.toUpperCase()}
                                    </div>
                                    <div class="mode-story-condition-content"><pre>${conditionContent}</pre></div>
                                    <div class="mode-story-message-container">
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
                        <div class="mode-story-event-group">
                            <h3 class="mode-story-event-title">
                                <span class="mode-story-icon">📝</span>${name} 
                                <span class="mode-story-event-count">#${index+1}</span>
                            </h3>
                            <div class="mode-story-event-filter">
                                <strong><span class="mode-story-icon">🔍</span>${i18n.t('story_mode.filters')}:</strong>
                                <pre>${filters}</pre>
                            </div>
                            <div class="mode-story-message-container">
                                ${eventEntriesHTML}
                            </div>
                        </div>
                    `;
                }
            });
            
            // Build scenario content
            scenarioElement.innerHTML = `
                <div class="mode-story-card-header">
                    <div>
                        <h2 class="mode-story-card-title">
                            <span class="mode-story-icon">📖</span>${scenario.name || i18n.t('story_mode.unnamed_scenario')}
                        </h2>
                        <div class="mode-story-card-id">
                            <span class="mode-story-icon">🆔</span>${i18n.t('story_mode.id')}: ${scenario.id || 'N/A'}
                        </div>
                    </div>
                    <div>
                        <div><span class="mode-story-icon">📄</span>${i18n.t('story_mode.file')}: ${scenario.fileName}</div>
                        ${scenario.nextScenario ? `
                        <div>
                            <span class="mode-story-icon">↪️</span>${i18n.t('story_mode.next_scenario')}: ${scenario.nextScenario}
                        </div>` : ''}
                        <div><span class="mode-story-icon">🎭</span>${i18n.t('story_mode.events')}: ${scenario.events.length}</div>
                    </div>
                </div>
                
                <div class="mode-story-card-content">
                    ${scenario.storyParts.length > 0 ? `
                    <div class="mode-story-story-section">
                        <h3 class="mode-story-section-title">
                            <span class="mode-story-icon">📜</span>${i18n.t('story_mode.story_section')}
                        </h3>
                        ${scenario.storyParts.map(part => `
                            <div class="mode-story-story-part">
                                <p class="mode-story-story-text">${part}</p>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                    
                    ${eventsHTML ? `
                    <div class="mode-story-dialogue-section">
                        <h3 class="mode-story-section-title">
                            <span class="mode-story-icon">💬</span>${i18n.t('story_mode.dialogue_section')}
                        </h3>
                        ${eventsHTML}
                    </div>
                    ` : `
                    <div class="mode-story-empty-state">
                        <div>🔇</div>
                        <p>${i18n.t('story_mode.no_dialogue')}</p>
                    </div>
                    `}
                </div>
            `;
            
            outputContent.appendChild(scenarioElement);
        });
    }

    function showNotification(message, isError = false) {
        notification.textContent = message;
        notification.className = 'mode-story-notification';
        
        if (isError) {
            notification.classList.add('mode-story-notification-error');
        }
        
        notification.classList.add('mode-story-notification-show');
        
        setTimeout(() => {
            notification.classList.remove('mode-story-notification-show');
        }, 3000);
    }
});