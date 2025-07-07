// Store the entire HTML as a string
window.story_extractorTemplate = `
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles/Wesnoth_Scenario_Story_Extractor.css">
    <title>Wesnoth Scenario Story Extractor</title>
</head>
<body>
    <div class="story-manager-container">
        <header>
            <h1>Wesnoth Scenario Story Extractor</h1>
            <p class="story-manager-subtitle">Upload or paste .cfg scenario files to extract and organize story content, character dialogues, and scenario information from Wesnoth campaigns</p>
        </header>
        
        <!-- How to Use Section -->
        <div class="story-manager-how-to-use">
            <h3>How to Use This Tool</h3>
            <ul>
                <li><strong>Upload Files</strong>: Select .cfg scenario files from your computer</li>
                <li><strong>Paste Content</strong>: Copy and paste scenario file contents directly</li>
                <li>Click "Extract Story Content" to process the files</li>
                <li>Story text will be formatted with proper sentence breaks</li>
                <li>Dialogues are grouped by event name with speaker information</li>
                <li>Use the "Back to Input" button to analyze more scenarios</li>
            </ul>
            <p>Note: This tool extracts story parts from [story] tags and dialogues from [message] tags within [event] sections.</p>
        </div>
        <section class="story-manager-input-section">
            <div class="story-manager-input-options">
                <div class="story-manager-input-option story-manager-active" data-target="upload">
                    <h3>Upload Files</h3>
                    <p>Select one or multiple .cfg scenario files from your computer</p>
                </div>
                <div class="story-manager-input-option" data-target="paste">
                    <h3>Paste Content</h3>
                    <p>Copy and paste the content of your .cfg scenario file directly</p>
                </div>
            </div>
            
            <div class="story-manager-input-content story-manager-active" id="story-manager-upload-content">
                <div class="story-manager-file-upload">
                    <h3>Select Scenario Files</h3>
                    <p>Choose .cfg files to extract story and dialogue content</p>
                    <input type="file" id="story-manager-file-input" accept=".cfg" multiple>
                </div>
                <div class="story-manager-controls">
                    <button class="story-manager-btn" id="story-manager-process-btn">Extract Story Content</button>
                    <button class="story-manager-btn story-manager-btn-secondary" id="story-manager-reset-btn">Reset</button>
                </div>
            </div>
            
            <div class="story-manager-input-content" id="story-manager-paste-content">
                <textarea id="story-manager-paste-input" placeholder="Paste the content of your .cfg scenario file here..."></textarea>
                <div class="story-manager-controls">
                    <button class="story-manager-btn" id="story-manager-paste-process-btn">Extract Story Content</button>
                    <button class="story-manager-btn story-manager-btn-secondary" id="story-manager-paste-reset-btn">Clear</button>
                </div>
            </div>
        </section>
        
        <section class="story-manager-output-section" id="story-manager-output-section">
            <div id="story-manager-output-content"></div>
            <div class="story-manager-controls">
                <button class="story-manager-btn story-manager-btn-secondary" id="story-manager-back-btn">Back to Input</button>
            </div>
        </section>
    </div>
    
    <div class="story-manager-notification" id="story-manager-notification"></div>
`;

// The initialization function
window.initStory_extractor = function() {
   
// DOM Elements
const inputOptions = document.querySelectorAll('.story-manager-input-option');
const inputContents = document.querySelectorAll('.story-manager-input-content');
const fileInput = document.getElementById('story-manager-file-input');
const processBtn = document.getElementById('story-manager-process-btn');
const resetBtn = document.getElementById('story-manager-reset-btn');
const pasteInput = document.getElementById('story-manager-paste-input');
const pasteProcessBtn = document.getElementById('story-manager-paste-process-btn');
const pasteResetBtn = document.getElementById('story-manager-paste-reset-btn');
const outputSection = document.getElementById('story-manager-output-section');
const outputContent = document.getElementById('story-manager-output-content');
const backBtn = document.getElementById('story-manager-back-btn');
const notification = document.getElementById('story-manager-notification');

// Current state
let currentInputMethod = 'upload';
let extractedData = [];

// Event Listeners
inputOptions.forEach(option => {
    option.addEventListener('click', () => {
        const target = option.dataset.target;
        
        // Update active option
        inputOptions.forEach(opt => opt.classList.remove('story-manager-active'));
        option.classList.add('story-manager-active');
        
        // Update active content
        inputContents.forEach(content => content.classList.remove('story-manager-active'));
        document.getElementById(`story-manager-${target}-content`).classList.add('story-manager-active');
        
        currentInputMethod = target;
    });
});

processBtn.addEventListener('click', processFiles);
resetBtn.addEventListener('click', resetInput);
pasteProcessBtn.addEventListener('click', processPastedContent);
pasteResetBtn.addEventListener('click', () => {
    pasteInput.value = '';
});
backBtn.addEventListener('click', () => {
    outputSection.classList.remove('story-manager-active');
});

// Functions
function showNotification(message, isError = false) {
    notification.textContent = message;
    notification.className = 'story-manager-notification';
    
    if (isError) {
        notification.classList.add('story-manager-error');
    }
    
    notification.classList.add('story-manager-show');
    
    setTimeout(() => {
        notification.classList.remove('story-manager-show');
    }, 3000);
}

function resetInput() {
    fileInput.value = '';
}

function processFiles() {
    const files = fileInput.files;
    
    if (files.length === 0) {
        showNotification('Please select at least one file', true);
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
        outputSection.classList.add('story-manager-active');
        showNotification(`Successfully extracted ${files.length} scenario(s)`);
    });
}

function processPastedContent() {
    const content = pasteInput.value.trim();
    
    if (content === '') {
        showNotification('Please paste some content first', true);
        return;
    }
    
    extractedData = [parseScenario(content, 'Pasted Scenario')];
    displayResults();
    outputSection.classList.add('story-manager-active');
    showNotification('Content extracted successfully');
}


function parseScenario(content, fileName) {
    const scenario = {
        fileName: fileName,
        id: '',
        name: '',
        nextScenario: '',
        storyParts: [],
        events: []  // Changed to array to handle multiple events with same name
    };
    
    // Helper function to extract values
    const extractValue = (regex, str) => {
        const match = regex.exec(str);
        if (!match) return '';
        const value = match[1] || match[2] || match[3] || '';
        return value.split('#')[0].trim();
    };
    
    // Extract scenario metadata
    scenario.id = extractValue(/id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^#\r\n]+[^\s#]*))/, content);
    scenario.name = extractValue(/name\s*=\s*(?:"([^"]*)"|'([^']*)'|([^#\r\n]+[^\s#]*))/, content);
    scenario.nextScenario = extractValue(/next_scenario\s*=\s*(?:"([^"]*)"|'([^']*)'|([^#\r\n]+[^\s#]*))/, content);
    
    // Extract story parts 
    const storyRegex = /\[story\][\s\S]*?\[\/story\]/g;
    const storyMatch = storyRegex.exec(content);
    if (storyMatch) {
        const storyContent = storyMatch[0];
        const partRegex = /\[part\][\s\S]*?story\s*=\s*_?\s*"([^"]*)"[\s\S]*?\[\/part\]/g;
        let partMatch;
        while ((partMatch = partRegex.exec(storyContent)) !== null) {
            scenario.storyParts.push(partMatch[1]);
        }
    }
    
    // Extract events and messages
    const eventRegex = /\[event\][\s\S]*?\[\/event\]/g;
    let eventMatch;
    
    while ((eventMatch = eventRegex.exec(content)) !== null) {
        const eventContent = eventMatch[0];
        const eventName = extractValue(/name\s*=\s*(?:"([^"]*)"|'([^']*)'|([^#\r\n]+.*?))(?=[\s#]|\r|\n|$)/, eventContent) || 'unnamed';
        
        // Extract filters
        const filterTypes = ['filter', 'filter_second', 'filter_side', 'filter_location'];
        const allFilters = [];
        
        for (const filterType of filterTypes) {
            const filterRegex = new RegExp(`\\[${filterType}\\]([\\s\\S]*?)\\[\\/${filterType}\\]`, 'gi');
            let filterMatch;
            while ((filterMatch = filterRegex.exec(eventContent)) !== null) {
                let filterContent = filterMatch[1];
                // Remove comments but preserve structure
                filterContent = filterContent.replace(/#.*$/gm, '');
                // Remove extra whitespace and format
                filterContent = filterContent
                .split('\n')
                .map(line => line.trim())
                .filter(line => line)
                .join('\n');
                
                allFilters.push(`${filterType}:\n${filterContent}`);
            }
        }
        
        const filterSummary = allFilters.length > 0 ? 
        allFilters.join('\n\n') : 
        'no filter';
        
        // NEW: Check if event contains any messages
        const hasMessages = /\[message\]/.test(eventContent);
        if (!hasMessages) continue;  // Skip events without messages
        
        // Parse messages with conditions
        function parseEventContent(content) {
            const result = [];
            const tagPattern = /\[(\/?)(\w+)\]/g;
            let match;
            let lastIndex = 0;
            
            while ((match = tagPattern.exec(content)) !== null) {
                const fullTag = match[0];
                const isClosing = match[1] === '/';
                const tagName = match[2].toLowerCase();
                
                // Handle condition tags
                if (['if', 'then', 'else', 'elseif'].includes(tagName) && !isClosing) {
                    // Find closing tag
                    const closingTag = `[/${tagName}]`;
                    const endIndex = content.indexOf(closingTag, match.index);
                    
                    if (endIndex !== -1) {
                        const innerContent = content.substring(match.index + fullTag.length, endIndex);
                        const children = parseEventContent(innerContent);
                        
                        // Extract only the condition content without outer tags
                        const conditionContent = innerContent;
                        
                        result.push({
                            type: 'condition',
                            tag: tagName,
                            content: conditionContent,
                            children: children
                        });
                        
                        // Skip to end of condition block
                        tagPattern.lastIndex = endIndex + closingTag.length;
                        lastIndex = tagPattern.lastIndex;
                    }
                }
                // Handle messages
                else if (tagName === 'message' && !isClosing) {
                    const endIndex = content.indexOf('[/message]', match.index);
                    if (endIndex !== -1) {
                        const messageContent = content.substring(match.index, endIndex + 10);
                        const speaker = extractValue(/speaker\s*=\s*(?:"([^"]*)"|'([^']*)'|([^#\r\n]+.*?))(?=[\s#]|\r|\n|$)/i, messageContent) || 'narrator';
                        const messageTextMatch = /message\s*=\s*_?\s*"([^"]*)"/.exec(messageContent);
                        
                        if (messageTextMatch) {
                            result.push({
                                type: 'message',
                                speaker: speaker,
                                text: messageTextMatch[1]
                            });
                        }
                        
                        // Skip to end of message
                        tagPattern.lastIndex = endIndex + 10;
                        lastIndex = tagPattern.lastIndex;
                    }
                }
                // Handle other content between tags
                else if (match.index > lastIndex) {
                    const textContent = content.substring(lastIndex, match.index).trim();
                    if (textContent) {
                        result.push({
                            type: 'text',
                            content: textContent
                        });
                    }
                    lastIndex = match.index;
                }
            }
            
            return result;
        }
        
        const messages = parseEventContent(eventContent);
        
        // Push event to array (instead of object) to handle multiple with same name
        scenario.events.push({
            name: eventName,
            filters: filterSummary,
            messages: messages
        });
    }
    
    return scenario;
}

function displayResults() {
    outputContent.innerHTML = '';
    
    if (extractedData.length === 0) {
        outputContent.innerHTML = `
        <div class="story-manager-empty-state">
        <div>📭</div>
        <h3>No scenarios to display</h3>
        <p>Try uploading or pasting some scenario files</p>
        </div>
        `;
        return;
    }
    
    extractedData.forEach(scenario => {
        const scenarioElement = document.createElement('div');
        scenarioElement.className = 'story-manager-scenario-card';
        
        // Prepare events HTML
        let eventsHTML = '';
        
        // Loop through events array instead of object
        scenario.events.forEach((event, index) => {
            const { name, filters, messages } = event;
            
            // Recursive function to render condition hierarchy
            function renderMessages(messages) {
                let html = '';
                messages.forEach(entry => {
                    if (entry.type === 'message') {
                        html += `
                        <div class="story-manager-dialogue-entry">
                        <div class="story-manager-speaker">${entry.speaker}</div>
                        <div class="story-manager-message">${entry.text}</div>
                        </div>
                        `;
                    }
                    else if (entry.type === 'condition') {
                        const childrenHTML = renderMessages(entry.children);
                        
                        // Format condition content without outer tags
                        const conditionContent = entry.content
                        .replace(/^[\n\s]+|[\n\s]+$/g, '') // Trim whitespace
                        .split('\n')
                        .map(line => line.trim())
                        .filter(line => line)
                        .join('\n');
                        
                        html += `
                        <div class="story-manager-condition-group">
                        <div class="story-manager-condition-header">${entry.tag.toUpperCase()}</div>
                        <div class="story-manager-condition-content"><pre>${conditionContent}</pre></div>
                        <div class="story-manager-message-container">
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
                <div class="story-manager-event-group">
                <h3 class="story-manager-event-title">${name} <span class="story-manager-event-count">#${index+1}</span></h3>
                <div class="story-manager-event-filter"><pre>${filters}</pre></div>
                <div class="story-manager-message-container">
                ${eventEntriesHTML}
                </div>
                </div>
                `;
            }
        });
        
        // Build scenario content
        scenarioElement.innerHTML = `
        <div class="story-manager-scenario-header">
        <div>
        <h2 class="story-manager-scenario-title">${scenario.name || 'Unnamed Scenario'}</h2>
        <div class="story-manager-scenario-id">ID: ${scenario.id || 'N/A'}</div>
        </div>
        <div>
        <div>File: ${scenario.fileName}</div>
        ${scenario.nextScenario ? `<div>Next Scenario: ${scenario.nextScenario}</div>` : ''}
        <div>Events: ${scenario.events.length}</div>
        </div>
        </div>
        
        <div class="story-manager-scenario-content">
        ${scenario.storyParts.length > 0 ? `
        <div class="story-manager-story-section">
        <h3 class="story-manager-section-title">📖 Story</h3>
        ${scenario.storyParts.map(part => `
            <div class="story-manager-story-part">
            <p class="story-manager-story-text">${part}</p>
            </div>
        `).join('')}
        </div>
        ` : ''}
        
        ${eventsHTML ? `
        <div class="story-manager-dialogue-section">
        <h3 class="story-manager-section-title">💬 Dialogue Events</h3>
        ${eventsHTML}
        </div>
        ` : `
        <div class="story-manager-empty-state">
        <div>🔇</div>
        <p>No dialogue events found in this scenario</p>
        </div>
        `}
        </div>
        `;
        
        outputContent.appendChild(scenarioElement);
    });
}

// Initialize with sample data for demonstration
window.onload = function() {
    // For demo purposes, we'll simulate having a scenario
    const sampleContent = `[scenario]
    id="RV_P01_S01"
    name="CotDQ-01-The Attack"
    next_scenario=RV_P01_S02
    [story]
    [part]
    story= _ "Long have we been shackled by those who deem themselves superior. Among my kin, the Faltharim, only the Muniriki extend a hand of equality."
    [/part]
    [part]
    story= _ "For ages, I have longed for true freedom; a time when my power would match that of my mother, Melbrina of Gertan."
    [/part]
    [/story]
    [event]
    name=start
    [message]
    speaker=Alanya
    message= _ "Jetrin, please! I wish to fight alongside you and your warriors! There must be a way I can help!"
    [/message]
    [message]
    speaker=Jetrin
    message= _ "Alanya, your heart is fierce, but this battle is not for you. Stay behind. Your magic should not be wasted on the fray."
    [/message]
    [/event]
    [event]
    name=moveto
    first_time_only=yes
    [filter]
    side=1
    x=21
    y=24
    [/filter]
    [set_variable]
    name=got_Myrrendi
    value=1
    [/set_variable]
    [remove_item]
    x=$x1
    y=$y1
    [/remove_item]
    {VARIABLE_OP ingredients add 1}
    [message]
    speaker=narrator
    image=portraits/other/wt_books.png
    message= _ "Myrrendi, the silky blooms that flourish beneath the shallow river waters, radiant as moonlight. Its essence mingles with the currents, bestowing calm upon those racked by pain."
    [/message]
    [message]
    speaker=narrator
    image=portraits/other/wt_books.png
    message= _ "Ingrediences: $ingredients| out of 05 ingredients."
    [/message]
    [if]
    [variable]
    name=ingredients
    numerical_equals=5
    [/variable]
    [then]
    [message]
    speaker=narrator
    image=portraits/other/wt_books.png
    message= _ "You need to move to the fire to make the potion!"
    [/message]
    [/then]
    [/if]
    [/event]
    [/scenario]`;
    
    const sampleScenario = parseScenario(sampleContent, 'Sample Scenario');
    extractedData = [sampleScenario];
};
};