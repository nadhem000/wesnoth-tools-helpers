// wesnoth-wml-utils.js

/**
 * Extracts a value from a string using a regex pattern that matches:
 *   key="value"
 *   key='value'
 *   key=value
 * 
 * @param {string} str - The string to search in
 * @param {RegExp} regex - The regex pattern (should have 3 capture groups for the three forms)
 * @returns {string} The extracted value
 */
function extractValue(str, regex) {
    const match = regex.exec(str);
    if (!match) return '';
    // The regex should have capture groups for double-quoted, single-quoted, and unquoted
    const value = match[1] || match[2] || match[3] || '';
    return value.split('#')[0].trim();
}

/**
 * Extracts events from scenario content.
 * 
 * @param {string} content - The scenario content
 * @returns {Array} Array of event objects
 */
function extractEvents(content) {
    const events = [];
    const eventRegex = /\[event\b[^\]]*\]([\s\S]*?)\[\/event\]/gi;
    let match;
    let eventIndex = 0;

    while ((match = eventRegex.exec(content)) !== null) {
        const eventBlock = match[0];
        const start = match.index;
        const end = start + eventBlock.length;

        // Extract event name - FIXED REGEX
        const nameMatch = eventBlock.match(
            /name\s*=\s*"((?:\\"|[^"])*)"|name\s*=\s*'((?:\\'|[^'])*)'|name\s*=\s*([^#\r\n\[]*)/i
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

/**
 * Extracts story parts from scenario content.
 * 
 * @param {string} content - The scenario content
 * @returns {Array} Array of story part strings
 */
function extractStoryParts(content) {
    const storyParts = [];
    const storyRegex = /\[story\][\s\S]*?\[\/story\]/g;
    const storyMatch = storyRegex.exec(content);
    if (storyMatch) {
        const storyContent = storyMatch[0];
        const partRegex = /\[part\][\s\S]*?story\s*=\s*_?\s*"([^"]*)"[\s\S]*?\[\/part\]/g;
        let partMatch;
        while ((partMatch = partRegex.exec(storyContent)) !== null) {
            storyParts.push(partMatch[1]);
        }
    }
    return storyParts;
}

/**
 * Parses event content to extract messages and conditions.
 * 
 * @param {string} eventContent - The content of a single event
 * @returns {Array} Array of message objects and condition blocks
 */
// wesnoth-wml-utils.js

function parseEventContent(eventContent) {
    const result = [];
    let currentIndex = 0;
    
    while (currentIndex < eventContent.length) {
        const nextTagStart = eventContent.indexOf('[', currentIndex);
        if (nextTagStart === -1) break;
        
        const nextTagEnd = eventContent.indexOf(']', nextTagStart);
        if (nextTagEnd === -1) break;
        
        const fullTag = eventContent.substring(nextTagStart, nextTagEnd + 1);
        const isClosing = fullTag.startsWith('[/');
        const tagName = isClosing 
            ? fullTag.substring(2, fullTag.length - 1).toLowerCase()
            : fullTag.substring(1, fullTag.length - 1).split(' ')[0].toLowerCase();

        // Handle condition tags
        if (['if', 'then', 'else', 'elseif'].includes(tagName)) {
            if (!isClosing) {
                // Find closing tag
                const closingTag = `[/${tagName}]`;
                const endIndex = eventContent.indexOf(closingTag, nextTagEnd + 1);
                
                if (endIndex !== -1) {
                    const innerStart = nextTagEnd + 1;
                    const innerEnd = endIndex;
                    const innerContent = eventContent.substring(innerStart, innerEnd);
                    
                    // Extract condition content for [if] and [elseif]
                    let conditionContent = '';
                    if (tagName === 'if' || tagName === 'elseif') {
                        const contentBeforeFirstChild = innerContent.split(/\[(then|else|elseif)\]/i)[0];
                        conditionContent = contentBeforeFirstChild
                            .replace(/#.*$/gm, '') // Remove comments
                            .split('\n')
                            .map(line => line.trim())
                            .filter(line => line)
                            .join('\n');
                    }
                    
                    result.push({
                        type: 'condition',
                        tag: tagName,
                        content: conditionContent,
                        children: parseEventContent(innerContent)
                    });
                    
                    currentIndex = endIndex + closingTag.length;
                    continue;
                }
            }
        }
        
    // Handle messages
    else if (tagName === 'message' && !isClosing) {
        const closingTag = '[/message]';
        const endIndex = eventContent.indexOf(closingTag, nextTagEnd + 1);
        
        if (endIndex !== -1) {
            const messageContent = eventContent.substring(nextTagStart, endIndex + closingTag.length);
            
            // Improved speaker extraction
            let speaker = 'narrator';
            const speakerMatch = messageContent.match(/speaker\s*=\s*("([^"]*)"|'([^']*)'|([^\s#]+))/);
            if (speakerMatch) {
                speaker = (speakerMatch[2] || speakerMatch[3] || speakerMatch[4] || '').trim();
            }
            
            // Improved message extraction
            let messageText = '';
            const messageMatch = messageContent.match(/message\s*=\s*_?\s*"((?:\\"|[^"])*)"/);
            if (messageMatch) {
                messageText = messageMatch[1].replace(/\\"/g, '"');
            }
            
            if (messageText) {
                result.push({
                    type: 'message',
                    speaker: speaker,
                    text: messageText
                });
            }
            
            currentIndex = endIndex + closingTag.length;
            continue;
        }
    }
        
        // Move to next position if no valid tag was processed
        currentIndex = nextTagEnd + 1;
    }
    
    return result;
}
// Export functions if we are in a module context
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        extractValue,
        extractEvents,
        extractStoryParts,
        parseEventContent
    };
}




/* // In  HTML file
<script src="wesnoth-utils.js"></script>

// In  tool JavaScript files
// Example usage for the event/message manager:
const events = extractEvents(fileContent);
const messages = parseEventContent(eventBlock);

// Example usage for the story manager:
const storyParts = extractStoryParts(scenarioContent);
const scenarioId = extractValue(content, /id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^#\r\n]+[^\s#]*))/); */