// Define template for story extractor
window.story_extractorTemplate = `
<div class="story-manager-container">
    <header>
        <h1>Wesnoth Scenario Story Extractor</h1>
        <p class="story-manager-subtitle">Upload or paste .cfg scenario files to extract and organize story content, character dialogues, and scenario information from Wesnoth campaigns</p>
    </header>
    
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
        
        <div class="story-manager-input-content story-manager-active" id="upload-content">
            <div class="story-manager-file-upload">
                <h3>Select Scenario Files</h3>
                <p>Choose .cfg files to extract story and dialogue content</p>
                <input type="file" id="file-input" accept=".cfg" multiple>
            </div>
            <div class="story-manager-controls">
                <button class="story-manager-btn" id="process-btn">Extract Story Content</button>
                <button class="story-manager-btn story-manager-btn-secondary" id="reset-btn">Reset</button>
            </div>
        </div>
        
        <div class="story-manager-input-content" id="paste-content">
            <textarea id="paste-input" placeholder="Paste the content of your .cfg scenario file here..."></textarea>
            <div class="story-manager-controls">
                <button class="story-manager-btn" id="paste-process-btn">Extract Story Content</button>
                <button class="story-manager-btn story-manager-btn-secondary" id="paste-reset-btn">Clear</button>
            </div>
        </div>
    </section>
    
    <section class="story-manager-output-section" id="output-section">
        <div id="output-content"></div>
        <div class="story-manager-controls">
            <button class="story-manager-btn story-manager-btn-secondary" id="back-btn">Back to Input</button>
        </div>
    </section>
</div>

<div class="story-manager-notification" id="notification"></div>
`;

// Initialize story extractor
window.initStory_extractor = function() {
    // DOM Elements
    const fileInput = document.getElementById('file-input');
    const pasteInput = document.getElementById('paste-input');
    const processBtn = document.getElementById('process-btn');
    const pasteProcessBtn = document.getElementById('paste-process-btn');
    const resetBtn = document.getElementById('reset-btn');
    const pasteResetBtn = document.getElementById('paste-reset-btn');
    const backBtn = document.getElementById('back-btn');
    const outputSection = document.getElementById('output-section');
    const outputContent = document.getElementById('output-content');
    const inputOptions = document.querySelectorAll('.story-manager-input-option');
    const inputContents = document.querySelectorAll('.story-manager-input-content');
    const notification = document.getElementById('notification');
    const inputSection = document.querySelector('.story-manager-input-section');

    // Input option switching
    inputOptions.forEach(option => {
        option.addEventListener('click', () => {
            const target = option.getAttribute('data-target');
            
            // Update active option
            inputOptions.forEach(opt => opt.classList.remove('story-manager-active'));
            option.classList.add('story-manager-active');
            
            // Show target content
            inputContents.forEach(content => {
                content.classList.remove('story-manager-active');
                if (content.id === `${target}-content`) {
                    content.classList.add('story-manager-active');
                }
            });
        });
    });

    // Reset buttons
    resetBtn.addEventListener('click', () => {
        fileInput.value = '';
    });

    pasteResetBtn.addEventListener('click', () => {
        pasteInput.value = '';
    });

    // Back to input button - FIXED
    backBtn.addEventListener('click', () => {
        outputSection.classList.remove('story-manager-active');
        inputSection.style.display = 'block';
        outputContent.innerHTML = '';
    });

    // Process uploaded files
    processBtn.addEventListener('click', () => {
        if (fileInput.files.length === 0) {
            showNotification('Please select at least one file', 'error');
            return;
        }
        
        processFiles(fileInput.files);
    });

    // Process pasted content
    pasteProcessBtn.addEventListener('click', () => {
        if (pasteInput.value.trim() === '') {
            showNotification('Please paste scenario content', 'error');
            return;
        }
        
        // Create a virtual file
        const blob = new Blob([pasteInput.value], { type: 'text/plain' });
        const file = new File([blob], 'pasted.cfg', { type: 'text/plain' });
        
        processFiles([file]);
    });

    // Process files and extract content
    function processFiles(files) {
        outputContent.innerHTML = '';
        inputSection.style.display = 'none';
        outputSection.classList.add('story-manager-active');
        
        showNotification(`Processing ${files.length} file(s)...`, 'info');
        
        // Process each file
        Array.from(files).forEach((file, index) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const content = e.target.result;
                const fileName = file.name;
                
                // Parse and extract story content
                const storyData = extractStoryContent(content, fileName);
                
                // Display extracted content
                displayStoryData(storyData, index === files.length - 1);
            };
            
            reader.readAsText(file);
        });
    }

    // Extract story content from WML
    function extractStoryContent(wmlContent, fileName) {
        const storyData = {
            fileName: fileName,
            storyParts: [],
            dialogues: []
        };

        // Extract [story] parts
        const storyRegex = /\[story\]([\s\S]*?)\[\/story\]/g;
        let storyMatch;
        while ((storyMatch = storyRegex.exec(wmlContent)) !== null) {
            const storyContent = storyMatch[1].trim();
            if (storyContent) {
                storyData.storyParts.push({
                    content: formatText(storyContent)
                });
            }
        }

        // Extract dialogues from [event] with [message]
        const eventRegex = /\[event\]([\s\S]*?)\[\/event\]/g;
        let eventMatch;
        while ((eventMatch = eventRegex.exec(wmlContent)) !== null) {
            const eventContent = eventMatch[1];
            const eventNameMatch = /name\s*=\s*"([^"]*)"/.exec(eventContent);
            const eventName = eventNameMatch ? eventNameMatch[1] : 'Unnamed Event';
            
            const messageRegex = /\[message\]([\s\S]*?)\[\/message\]/g;
            let messageMatch;
            while ((messageMatch = messageRegex.exec(eventContent)) !== null) {
                const messageContent = messageMatch[1];
                
                const speakerMatch = /speaker\s*=\s*"([^"]*)"/.exec(messageContent);
                const messageMatch = /message\s*=\s*_?\s*"([\s\S]*?)"/.exec(messageContent);
                
                if (messageMatch) {
                    storyData.dialogues.push({
                        event: eventName,
                        speaker: speakerMatch ? speakerMatch[1] : 'narrator',
                        message: formatText(messageMatch[1])
                    });
                }
            }
        }

        return storyData;
    }

    // Format text with proper sentence breaks
    function formatText(text) {
        // Replace Wesnoth formatting
        return text
            .replace(/\\n/g, '<br>')
            .replace(/"/g, '')
            .replace(/\{([^}]*)\}/g, '<em>$1</em>')
            .replace(/<span[^>]*>/g, '')
            .replace(/<\/span>/g, '');
    }

    // Display extracted data
    function displayStoryData(data, isLast) {
        const storyContainer = document.createElement('div');
        storyContainer.className = 'story-container';
        
        // File header
        const fileHeader = document.createElement('h3');
        fileHeader.textContent = data.fileName;
        storyContainer.appendChild(fileHeader);
        
        // Story parts
        if (data.storyParts.length > 0) {
            const storyHeader = document.createElement('h4');
            storyHeader.textContent = 'Story Content:';
            storyContainer.appendChild(storyHeader);
            
            data.storyParts.forEach((part, index) => {
                const storyPart = document.createElement('div');
                storyPart.className = 'story-part';
                storyPart.innerHTML = `<p>${part.content}</p>`;
                storyContainer.appendChild(storyPart);
            });
        }
        
        // Dialogues
        if (data.dialogues.length > 0) {
            const dialogueHeader = document.createElement('h4');
            dialogueHeader.textContent = 'Dialogues:';
            storyContainer.appendChild(dialogueHeader);
            
            let currentEvent = '';
            data.dialogues.forEach(dialogue => {
                if (dialogue.event !== currentEvent) {
                    currentEvent = dialogue.event;
                    const eventHeader = document.createElement('h5');
                    eventHeader.textContent = currentEvent;
                    storyContainer.appendChild(eventHeader);
                }
                
                const dialogueElement = document.createElement('div');
                dialogueElement.className = 'dialogue';
                dialogueElement.innerHTML = `
                    <strong>${dialogue.speaker}:</strong>
                    <p>${dialogue.message}</p>
                `;
                storyContainer.appendChild(dialogueElement);
            });
        }
        
        outputContent.appendChild(storyContainer);
        
        if (isLast) {
            showNotification('Extraction complete!', 'success');
        }
    }

    // Show notification
    function showNotification(message, type) {
        notification.textContent = message;
        notification.className = 'story-manager-notification';
        notification.classList.add('story-manager-show');
        notification.classList.add(`story-manager-${type}`);
        
        setTimeout(() => {
            notification.classList.remove('story-manager-show');
            setTimeout(() => {
                notification.classList.remove(`story-manager-${type}`);
            }, 300);
        }, 3000);
    }
};