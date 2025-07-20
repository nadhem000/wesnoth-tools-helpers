// wesnoth-wml-utils.js

/**
 * Extracts a value from a string using a regex pattern
 */
function extractValue(str, regex) {
    const match = regex.exec(str);
    if (!match) return '';
    const value = match[1] || match[2] || match[3] || '';
    return value.split('#')[0].trim();
}

/**
 * Extracts events from scenario content
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

        const nameMatch = eventBlock.match(
            /name\s*=\s*"((?:\\"|[^"])*)"|name\s*=\s*'((?:\\'|[^'])*)'|name\s*=\s*([^#\r\n\[]*)/i
        );
        let eventName = "unnamed";
        if (nameMatch) {
            eventName = (nameMatch[1] || nameMatch[2] || nameMatch[3] || "").trim();
        }

        if (eventName.includes('\n')) {
            eventName = eventName.split('\n')[0].trim();
        }

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
 * Extracts messages from content
 */
function extractMessages(content, events) {
    const allMessages = [];
    const messageRegex = /\[message\b[^\]]*\]([\s\S]*?)\[\/message\]/gi;
    let match;
    
    while ((match = messageRegex.exec(content)) !== null) {
        const messageBlock = match[0];
        const messageStart = match.index;
        const messageEnd = messageStart + messageBlock.length;
        
        const speakerMatch = messageBlock.match(/speaker\s*=\s*"([^"]*)"|speaker\s*=\s*'([^']*)'|speaker\s*=\s*(\S+)/i);
        let speaker = "narrator";
        if (speakerMatch) {
            speaker = speakerMatch[1] || speakerMatch[2] || speakerMatch[3] || "narrator";
        }
        
        const messageMatch = messageBlock.match(/message\s*=\s*_?\s*"([^"]*)"|message\s*=\s*_?\s*'([^']*)'|message\s*=\s*_?\s*(\S+)/i);
        let messageText = "";
        if (messageMatch) {
            messageText = messageMatch[1] || messageMatch[2] || messageMatch[3] || "";
        }
        
        messageText = messageText.trim().replace(/^_ /, '');
        
        let eventContext = "No event context";
        let eventName = "unnamed";
        let eventFilter = "";
        
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

/**
 * Extracts story parts from scenario content
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
 * Parses event content to extract messages and conditions
 */
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

        if (['if', 'then', 'else', 'elseif'].includes(tagName)) {
            if (!isClosing) {
                const closingTag = `[/${tagName}]`;
                const endIndex = eventContent.indexOf(closingTag, nextTagEnd + 1);
                
                if (endIndex !== -1) {
                    const innerStart = nextTagEnd + 1;
                    const innerEnd = endIndex;
                    const innerContent = eventContent.substring(innerStart, innerEnd);
                    
                    let conditionContent = '';
                    if (tagName === 'if' || tagName === 'elseif') {
                        const contentBeforeFirstChild = innerContent.split(/\[(then|else|elseif)\]/i)[0];
                        conditionContent = contentBeforeFirstChild
                            .replace(/#.*$/gm, '')
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
        else if (tagName === 'message' && !isClosing) {
            const closingTag = '[/message]';
            const endIndex = eventContent.indexOf(closingTag, nextTagEnd + 1);
            
            if (endIndex !== -1) {
                const messageContent = eventContent.substring(nextTagStart, endIndex + closingTag.length);
                
                let speaker = 'narrator';
                const speakerMatch = messageContent.match(/speaker\s*=\s*("([^"]*)"|'([^']*)'|([^\s#]+))/);
                if (speakerMatch) {
                    speaker = (speakerMatch[2] || speakerMatch[3] || speakerMatch[4] || '').trim();
                }
                
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
        
        currentIndex = nextTagEnd + 1;
    }
    
    return result;
}

// Export as global object
window.wesnothWMLUtils = {
    extractValue,
    extractEvents,
    extractMessages,
    extractStoryParts,
    parseEventContent
};