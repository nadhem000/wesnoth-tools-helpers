let pendingTagName = null;
let pendingTagDefinition = null;
// Tab switching functionality
document.querySelectorAll('.editor-text-tab').forEach(tab => {
	tab.addEventListener('click', () => {
		// Remove active class from all tabs
		document.querySelectorAll('.editor-text-tab').forEach(t => {
			t.classList.remove('editor-text-active');
		});
		
		// Add active class to clicked tab
		tab.classList.add('editor-text-active');
		
		// Hide all tab contents
		document.querySelectorAll('.editor-text-tab-content').forEach(content => {
			content.classList.remove('editor-text-active');
		});
		
		// Show the corresponding tab content
		const tabId = tab.getAttribute('data-tab');
		document.getElementById(`${tabId}-tab`).classList.add('editor-text-active');
		
		// Update tag list if switching to Student tab
		if (tabId === 'student') {
			updateStudentTagList();
		}
	});
});

// Expand/Collapse functionality
document.querySelectorAll('.editor-text-howto, .editor-text-dictionary').forEach(section => {
	const header = section.querySelector('.editor-text-howto-header, .editor-text-dictionary-header');
	const content = section.querySelector('.editor-text-howto-content, .editor-text-dictionary-content');
	const icon = header.querySelector('.editor-text-icon');
	
	header.addEventListener('click', () => {
		content.classList.toggle('editor-text-show');
		icon.classList.toggle('editor-text-rotated');
		
		// Add animation to content
		if (content.classList.contains('editor-text-show')) {
			content.style.animation = 'editor-text-fadeIn 0.4s ease';
		}
	});
});

// Tag storage management
function saveTagDefinition(tag, definition, mode = 'append') {
    const tags = JSON.parse(localStorage.getItem('editor-text-tags')) || {};
    
    if (mode === 'replace') {
        tags[tag] = [definition];
		} else {
        if (!tags[tag]) {
            tags[tag] = [];
		}
        tags[tag].push(definition);
	}
    
    localStorage.setItem('editor-text-tags', JSON.stringify(tags));
    updateTagList();
}

function getTagDefinitions() {
	return JSON.parse(localStorage.getItem('editor-text-tags')) || {};
}

function updateTagList() {
	const tags = getTagDefinitions();
	const tagList = Object.keys(tags).map(tag => {
		const count = tags[tag].length;
		return `<span class="editor-text-tag">${tag}</span> (${count})`;
	}).join(', ');
	
	document.getElementById('editor-text-tag-list').innerHTML = tagList || 'None';
	document.getElementById('editor-text-student-tag-list').innerHTML = tagList || 'None';
}

// Save tag definition from Teacher tab
document.getElementById('editor-text-save-btn').addEventListener('click', () => {
	const input = document.getElementById('editor-text-teacher-input')?.value;
	if (!input) return;
	
	const tagRegex = /\[(\w+)\]([\s\S]*?)\[\/\1\]/g;
	let match;
	
	while ((match = tagRegex.exec(input)) !== null) {
		const tag = match[1];
		const content = match[2].trim();
		const keys = [];
		
		// Extract keys and types
		content.split('\n').forEach(line => {
			const lineMatch = line.match(/(\w+)=(".*?")\s+\((.*?)\)/);
			if (lineMatch) {
				keys.push({
					name: lineMatch[1],
					defaultValue: lineMatch[2],
					type: lineMatch[3]
				});
			}
		});
		
		if (keys.length > 0) {
			saveTagDefinition(tag, keys);
		}
	}
});

// Update Student tab tag list
function updateStudentTagList() {
	const container = document.getElementById('editor-text-tag-container');
	container.innerHTML = '';
	
	const tags = getTagDefinitions();
	Object.keys(tags).forEach(tag => {
		tags[tag].forEach((definition, index) => {
			const item = document.createElement('div');
			item.className = 'editor-text-aside-item';
			item.setAttribute('data-tag', tag);
			item.setAttribute('data-index', index);
			item.textContent = tags[tag].length > 1 ? `${tag} ${index+1}` : tag;
			container.appendChild(item);
		});
	});
	
	// Add event listeners to new items
	document.querySelectorAll('#editor-text-tag-container .editor-text-aside-item').forEach(item => {
		item.addEventListener('click', () => {
			const tag = item.getAttribute('data-tag');
			const index = item.getAttribute('data-index');
			const tags = getTagDefinitions();
			const definition = tags[tag][index];
			
			if (definition) {
				insertTagTemplate(tag, definition);
				
				// Visual feedback
				item.style.backgroundColor = 'var(--editor-text-tab-active-bg)';
				setTimeout(() => {
					item.style.backgroundColor = '';
				}, 500);
			}
		});
	});
}

// Insert tag template in Student tab
function insertTagTemplate(tag, definition) {
	const textarea = document.getElementById('editor-text-student-input');
	let template = `\n[${tag}]\n`;
	
	definition.forEach(key => {
		template += `${key.name}=${key.defaultValue}\n`;
	});
	
	template += `[/${tag}]\n`;
	
	// Insert at cursor position
	const start = textarea.selectionStart;
	const end = textarea.selectionEnd;
	const text = textarea.value;
	const before = text.substring(0, start);
	const after = text.substring(end, text.length);
	
	textarea.value = before + template + after;
	textarea.selectionStart = start + template.length;
	textarea.selectionEnd = start + template.length;
	textarea.focus();
}

// TEACHER TAB ENHANCEMENTS
// Add new key row
document.getElementById('editor-text-add-key').addEventListener('click', function() {
	const keysContainer = document.getElementById('editor-text-keys-container');
	const keyRow = document.createElement('div');
	keyRow.className = 'editor-text-key-row';
	keyRow.innerHTML = `
	<div class="editor-text-form-group">
	<label>Key Name</label>
	<input type="text" class="editor-text-key-name" placeholder="key_name">
	</div>
	
	<div class="editor-text-form-group">
	<label>Default Value</label>
	<input type="text" class="editor-text-key-default" placeholder='""'>
	</div>
	
	<div class="editor-text-form-group">
	<label>Type</label>
	<select class="editor-text-key-type">
	<option value="string">String</option>
	<option value="translatable">Translatable String</option>
	<option value="integer">Integer</option>
	<option value="numeric">Numeric</option>
	<option value="boolean">Boolean</option>
	<option value="path">Path</option>
	</select>
	</div>
	
	<div class="editor-text-form-group">
	<label>Mandatory</label>
	<select class="editor-text-key-mandatory">
	<option value="mandatory" selected>Mandatory</option>
	<option value="optional">Optional</option>
	</select>
	</div>
	
	<div class="editor-text-form-group">
	<label>Scope</label>
	<select class="editor-text-key-scope">
	<option value="official" selected>Official</option>
	<option value="umc">UMC</option>
	</select>
	</div>
	
	<button class="editor-text-remove-key">×</button>
	`;
	
	keysContainer.appendChild(keyRow);
	
	// Add event listener to remove button
	keyRow.querySelector('.editor-text-remove-key').addEventListener('click', function() {
		keysContainer.removeChild(keyRow);
		updateTagPreview();
	});
	
	// Add input listeners for live preview
	const inputs = keyRow.querySelectorAll('input, select');
	inputs.forEach(input => {
		input.addEventListener('input', updateTagPreview);
	});
});

// Remove key functionality
document.querySelectorAll('.editor-text-remove-key').forEach(button => {
	button.addEventListener('click', function() {
		const keyRow = this.closest('.editor-text-key-row');
		keyRow.remove();
		updateTagPreview();
	});
});

// Update tag preview
function updateTagPreview() {
	const tagName = document.getElementById('editor-text-tag-name').value || 'tag';
	const keys = [];
	
	document.querySelectorAll('.editor-text-key-row').forEach(row => {
		const name = row.querySelector('.editor-text-key-name').value || 'key';
		const defaultValue = row.querySelector('.editor-text-key-default').value || '""';
		const type = row.querySelector('.editor-text-key-type').value;
		const mandatory = row.querySelector('.editor-text-key-mandatory').value;
		const scope = row.querySelector('.editor-text-key-scope').value;
		
		keys.push({ name, defaultValue, type, mandatory, scope });
	});
	
	let preview = `[${tagName}]\n`;
	
	keys.forEach(key => {
		preview += `${key.name}=${key.defaultValue} (${key.type}, ${key.mandatory}, ${key.scope})\n`;
	});
	
	preview += `[/${tagName}]`;
	
	document.getElementById('editor-text-tag-preview').textContent = preview;
}

// Add input listeners for live preview
document.getElementById('editor-text-tag-name').addEventListener('input', updateTagPreview);
document.getElementById('editor-text-tag-description').addEventListener('input', updateTagPreview);

document.querySelectorAll('.editor-text-key-name, .editor-text-key-default, .editor-text-key-type, .editor-text-key-mandatory, .editor-text-key-scope').forEach(input => {
	input.addEventListener('input', updateTagPreview);
});

// Initialize preview
updateTagPreview();

// Save form data
document.getElementById('editor-text-save-btn').addEventListener('click', function() {
    try {
        const tagName = document.getElementById('editor-text-tag-name').value.trim();
        if (!tagName) {
            alert('Please enter a tag name');
            return;
		}
        
        const keys = [];
        document.querySelectorAll('.editor-text-key-row').forEach(row => {
            const name = row.querySelector('.editor-text-key-name').value.trim();
            const defaultValue = row.querySelector('.editor-text-key-default').value;
            const type = row.querySelector('.editor-text-key-type').value;
            const mandatory = row.querySelector('.editor-text-key-mandatory').value;
            const scope = row.querySelector('.editor-text-key-scope').value;
			const comment = row.querySelector('.editor-text-key-comment').value || '';
            
            if (name) {
                keys.push({ name, defaultValue, type, mandatory, scope, comment });
			}
		});
        
        if (keys.length === 0) {
            alert('Please add at least one key');
            return;
		}
        
        const tags = getTagDefinitions();
        pendingTagName = tagName;
        pendingTagDefinition = keys;
        
        if (tags[tagName] && tags[tagName].length > 0) {
            // Show modal for existing tag
            document.getElementById('editor-text-modal-tag-name').textContent = `[${tagName}]`;
            document.getElementById('editor-text-save-modal').style.display = 'flex';
			} else {
            // Save directly if new tag
            saveTagDefinition(tagName, keys);
            updateDictionaryTable();
            showSaveFeedback(this);
		}
		} catch (error) {
        console.error('Save error:', error);
        alert('An error occurred while saving: ' + error.message);
	}
});
document.getElementById('editor-text-modal-replace').addEventListener('click', function() {
    try {
        saveTagDefinition(pendingTagName, pendingTagDefinition, 'replace');
        updateDictionaryTable();
        closeModal();
        showSaveFeedback(document.getElementById('editor-text-save-btn'));
		} catch (error) {
        console.error('Replace error:', error);
        alert('Error replacing tag: ' + error.message);
	}
});

document.getElementById('editor-text-modal-append').addEventListener('click', function() {
    try {
        saveTagDefinition(pendingTagName, pendingTagDefinition, 'append');
        updateDictionaryTable();
        closeModal();
        showSaveFeedback(document.getElementById('editor-text-save-btn'));
		} catch (error) {
        console.error('Append error:', error);
        alert('Error appending tag: ' + error.message);
	}
});

document.getElementById('editor-text-modal-cancel').addEventListener('click', closeModal);

// Helper functions
function closeModal() {
    document.getElementById('editor-text-save-modal').style.display = 'none';
    pendingTagName = null;
    pendingTagDefinition = null;
}

function showSaveFeedback(button) {
    button.textContent = '✓ Saved!';
    button.style.background = 'linear-gradient(to right, #4CAF50, #388E3C)';
    setTimeout(() => {
        button.textContent = '💾 Save';
        button.style.background = '';
	}, 2000);
}

// Toggle dropdown visibility
document.getElementById('editor-text-export-option').addEventListener('click', function(e) {
	e.stopPropagation();
	const dropdown = this.querySelector('.editor-text-dropdown');
	const isVisible = dropdown.classList.contains('editor-text-show');
	
	// Hide all dropdowns
	document.querySelectorAll('.editor-text-dropdown').forEach(d => {
		d.classList.remove('editor-text-show');
	});
	
	// Toggle current dropdown
	if (!isVisible) {
		dropdown.classList.add('editor-text-show');
	}
});

document.getElementById('editor-text-import-option').addEventListener('click', function(e) {
	e.stopPropagation();
	const dropdown = this.querySelector('.editor-text-dropdown');
	const isVisible = dropdown.classList.contains('editor-text-show');
	
	// Hide all dropdowns
	document.querySelectorAll('.editor-text-dropdown').forEach(d => {
		d.classList.remove('editor-text-show');
	});
	
	// Toggle current dropdown
	if (!isVisible) {
		dropdown.classList.add('editor-text-show');
	}
});

// Close dropdowns when clicking elsewhere
document.addEventListener('click', (e) => {
	if (!e.target.closest('.editor-text-option')) {
		document.querySelectorAll('.editor-text-dropdown').forEach(dropdown => {
			dropdown.classList.remove('editor-text-show');
		});
	}
});

// Dropdown item click handling
document.querySelectorAll('.editor-text-dropdown-item').forEach(item => {
	item.addEventListener('click', (e) => {
		e.stopPropagation();
		const format = item.getAttribute('data-format');
		const parent = item.closest('.editor-text-option');
		const action = parent.id.includes('export') ? 'Export' : 'Import';
		
		alert(`${action} selected format: ${format}`);
		parent.querySelector('.editor-text-dropdown').classList.remove('editor-text-show');
	});
});

// Add hover effect to dropdown items
document.querySelectorAll('.editor-text-dropdown-item').forEach(item => {
	item.addEventListener('mouseenter', () => {
		item.style.backgroundColor = 'var(--editor-text-tab-active-bg)';
	});
	
	item.addEventListener('mouseleave', () => {
		item.style.backgroundColor = '';
	});
});

// Button hover effect
document.querySelectorAll('.editor-text-button').forEach(button => {
	button.addEventListener('mouseenter', () => {
		button.style.transform = 'translateY(-3px)';
	});
	
	button.addEventListener('mouseleave', () => {
		button.style.transform = '';
	});
});

// Option hover effect
document.querySelectorAll('.editor-text-option').forEach(option => {
	option.addEventListener('mouseenter', () => {
		option.style.transform = 'translateY(-2px)';
	});
	
	option.addEventListener('mouseleave', () => {
		option.style.transform = '';
	});
});

// Initialize tag list
updateTagList();

// MANUAL ENTRY FUNCTIONALITY
document.getElementById('editor-text-clear-btn').addEventListener('click', function() {
	document.getElementById('editor-text-manual-input').value = '';
});

document.getElementById('editor-text-parse-btn').addEventListener('click', function() {
	const manualInput = document.getElementById('editor-text-manual-input').value;
	if (!manualInput.trim()) {
		alert('Please enter some tag definitions');
		return;
	}
	
	// Parse the manual input
	const tags = parseManualInput(manualInput);
	if (tags.length === 0) {
		alert('No valid tags found. Please check your syntax.');
		return;
	}
	
	// For simplicity, we'll take the first tag
	const tag = tags[0];
	
	// Update the form with the parsed tag
	document.getElementById('editor-text-tag-name').value = tag.name;
	
	// Clear existing keys
	const keysContainer = document.getElementById('editor-text-keys-container');
	keysContainer.innerHTML = '';
	
	// Add keys from the parsed tag
	tag.keys.forEach(key => {
		const keyRow = createKeyRow();
		keysContainer.appendChild(keyRow);
		
		// Set the values
		keyRow.querySelector('.editor-text-key-name').value = key.name;
		keyRow.querySelector('.editor-text-key-default').value = key.defaultValue;
		keyRow.querySelector('.editor-text-key-type').value = key.type;
		keyRow.querySelector('.editor-text-key-mandatory').value = key.mandatory;
		keyRow.querySelector('.editor-text-key-scope').value = key.scope;
		
		// Add event listeners
		keyRow.querySelector('.editor-text-remove-key').addEventListener('click', function() {
			keysContainer.removeChild(keyRow);
			updateTagPreview();
		});
		
		const inputs = keyRow.querySelectorAll('input, select');
		inputs.forEach(input => {
			input.addEventListener('input', updateTagPreview);
		});
	});
	
	// Update preview
	updateTagPreview();
	
	// Success feedback
	this.textContent = '✓ Parsed!';
	this.style.background = 'linear-gradient(to right, #4CAF50, #388E3C)';
	setTimeout(() => {
		this.textContent = 'Parse & Update Form';
		this.style.background = '';
	}, 2000);
});

document.getElementById('editor-text-generate-btn').addEventListener('click', function() {
	const tagName = document.getElementById('editor-text-tag-name').value || 'tag';
	const keys = [];
	
	document.querySelectorAll('.editor-text-key-row').forEach(row => {
		const name = row.querySelector('.editor-text-key-name').value || 'key';
		const defaultValue = row.querySelector('.editor-text-key-default').value || '""';
		const type = row.querySelector('.editor-text-key-type').value;
		const mandatory = row.querySelector('.editor-text-key-mandatory').value;
		const scope = row.querySelector('.editor-text-key-scope').value;
		
		keys.push({ name, defaultValue, type, mandatory, scope });
	});
	
	if (keys.length === 0) {
		alert('Please add at least one key');
		return;
	}
	
	let generatedText = `[${tagName}]\n`;
	
	keys.forEach(key => {
        let line = `${key.name} = ${key.defaultValue} (${key.type}, ${key.mandatory}, ${key.scope})`;
        if (key.comment) {
            line += ` # ${key.comment}`;
		}
        generatedText += `\n${line}`;
	});
	
	document.getElementById('editor-text-manual-input').value = generatedText;
	
	// Success feedback
	this.textContent = '✓ Generated!';
	this.style.background = 'linear-gradient(to right, #4CAF50, #388E3C)';
	setTimeout(() => {
		this.textContent = 'Generate from Form';
		this.style.background = '';
	}, 2000);
});

function parseManualInput(input) {
    const tagRegex = /\[(\w+)\]([\s\S]*?)\[\/\1\]/g;
    const keyRegex = /(\w+)\s*=\s*(".*?"|\S+)\s+\(([^,]+),\s*([^,]+),\s*([^)]+)\)/;
    const tags = [];
    
    let match;
    while ((match = tagRegex.exec(input)) !== null) {
        const tagName = match[1];
        const content = match[2].trim();
        const keys = [];
        
        // Parse comments
        const comments = parseComments(content);
        
        // Split content into lines
        const lines = content.split('\n');
        lines.forEach(line => {
            line = line.trim();
            if (!line || line.startsWith('#')) return;
            
            const keyMatch = line.match(keyRegex);
            if (keyMatch) {
                keys.push({
                    name: keyMatch[1],
                    defaultValue: keyMatch[2],
                    type: keyMatch[3].trim(),
                    mandatory: keyMatch[4].trim(),
                    scope: keyMatch[5].trim(),
                    comment: comments[keyMatch[1]] ? comments[keyMatch[1]].join('\n') : ''
				});
			}
		});
        
        if (keys.length > 0) {
            tags.push({
                name: tagName,
                keys: keys
			});
		}
	}
    
    return tags;
}


function parseComments(content) {
    const lines = content.split('\n');
    const comments = {};
    let currentKey = null;
    
    lines.forEach(line => {
        const trimmedLine = line.trim();
        const keyMatch = trimmedLine.match(/^(\w+)\s*=/);
        const commentMatch = trimmedLine.match(/^(#+)\s*(.*)/);
        
        if (keyMatch) {
            currentKey = keyMatch[1];
			} else if (commentMatch && commentMatch[2]) {
            if (!comments[currentKey]) {
                comments[currentKey] = [];
			}
            comments[currentKey].push(commentMatch[2]);
		}
	});
    
    return comments;
}

function createKeyRow() {
	const keyRow = document.createElement('div');
	keyRow.className = 'editor-text-key-row';
	keyRow.innerHTML = `
	<div class="editor-text-form-group">
	<label>Key Name</label>
	<input type="text" class="editor-text-key-name" placeholder="key_name">
	</div>
	
	<div class="editor-text-form-group">
	<label>Default Value</label>
	<input type="text" class="editor-text-key-default" placeholder='""'>
	</div>
	
	<div class="editor-text-form-group">
	<label>Type</label>
	<select class="editor-text-key-type">
	<option value="string">String</option>
	<option value="translatable">Translatable String</option>
	<option value="integer">Integer</option>
	<option value="numeric">Numeric</option>
	<option value="boolean">Boolean</option>
	<option value="path">Path</option>
	</select>
	</div>
	
	<div class="editor-text-form-group">
	<label>Mandatory</label>
	<select class="editor-text-key-mandatory">
	<option value="mandatory" selected>Mandatory</option>
	<option value="optional">Optional</option>
	</select>
	</div>
	
	<div class="editor-text-form-group">
	<label>Scope</label>
	<select class="editor-text-key-scope">
	<option value="official" selected>Official</option>
	<option value="umc">UMC</option>
	</select>
	</div>
	
	<div class="editor-text-form-group">
	<label>Comment</label>
	<input type="text" class="editor-text-key-comment" placeholder="Comment (optional)">
	</div>
	<button class="editor-text-remove-key">×</button>
	`;
	return keyRow;
}
// TEACHER DICTIONARY TABLE MANAGEMENT
function updateDictionaryTable() {
	const tbody = document.getElementById('editor-text-teacher-tag-table-body');
	tbody.innerHTML = '';
	
	const tags = getTagDefinitions();
	for (const tagName in tags) {
		const definitions = tags[tagName];
		definitions.forEach((definition, index) => {
			const row = document.createElement('tr');
			
			// Tag name cell
			const tagCell = document.createElement('td');
			tagCell.textContent = `[${tagName}]`;
			
			// Keys cell
			const keysCell = document.createElement('td');
			
			definition.forEach(key => {
				// Create key badge
				const keyBadge = document.createElement('span');
				keyBadge.className = 'editor-text-teacher-badge';
				keyBadge.textContent = key.name;
				keysCell.appendChild(keyBadge);
				
				// Add comment icon if exists
				if (key.comment) {
					const commentIcon = document.createElement('span');
					commentIcon.className = 'editor-text-comment-icon';
					commentIcon.innerHTML = '💬';
					commentIcon.title = key.comment;
					keysCell.appendChild(commentIcon);
				}
				
				// Create mandatory badge
				const mandatoryBadge = document.createElement('span');
				mandatoryBadge.className = `editor-text-mandatory-badge editor-text-${key.mandatory}`;
				mandatoryBadge.textContent = key.mandatory === 'mandatory' ? 'M' : 'O';
				keysCell.appendChild(mandatoryBadge);
				
				// Create scope badge
				const scopeBadge = document.createElement('span');
				scopeBadge.className = `editor-text-mandatory-badge editor-text-${key.scope}`;
				scopeBadge.textContent = key.scope === 'official' ? 'O' : 'U';
				keysCell.appendChild(scopeBadge);
				
				// Add space between key groups
				keysCell.appendChild(document.createTextNode(' '));
			});
			
			// Actions cell
			const actionsCell = document.createElement('td');
			actionsCell.className = 'editor-text-teacher-actions';
			
			const editButton = document.createElement('button');
			editButton.className = 'editor-text-teacher-action-btn editor-text-teacher-action-edit';
			editButton.textContent = '✏️ Edit';
			editButton.dataset.tag = tagName;
			editButton.dataset.index = index;
			
			const deleteButton = document.createElement('button');
			deleteButton.className = 'editor-text-teacher-action-btn editor-text-teacher-action-delete';
			deleteButton.textContent = '🗑️ Delete';
			deleteButton.dataset.tag = tagName;
			deleteButton.dataset.index = index;
			
			actionsCell.appendChild(editButton);
			actionsCell.appendChild(deleteButton);
			
			// Add cells to row
			row.appendChild(tagCell);
			row.appendChild(keysCell);
			row.appendChild(actionsCell);
			
			tbody.appendChild(row);
		});
	}
	
	// Attach event handlers to the new buttons
	attachEditDeleteHandlers();
}

function attachEditDeleteHandlers() {
	// Edit button functionality
	document.querySelectorAll('.editor-text-teacher-action-edit').forEach(button => {
		button.addEventListener('click', function() {
			const tagName = this.dataset.tag;
			const index = this.dataset.index;
			const tags = getTagDefinitions();
			const definition = tags[tagName][index];
			
			// Load into form
			document.getElementById('editor-text-tag-name').value = tagName;
			
			// Clear existing keys
			const keysContainer = document.getElementById('editor-text-keys-container');
			keysContainer.innerHTML = '';
			
			// Add keys from definition
			definition.forEach(key => {
				const keyRow = createKeyRow();
				keysContainer.appendChild(keyRow);
				
				keyRow.querySelector('.editor-text-key-name').value = key.name;
				keyRow.querySelector('.editor-text-key-default').value = key.defaultValue;
				keyRow.querySelector('.editor-text-key-type').value = key.type;
				keyRow.querySelector('.editor-text-key-mandatory').value = key.mandatory;
				keyRow.querySelector('.editor-text-key-scope').value = key.scope;
				
				// Add event listeners
				keyRow.querySelector('.editor-text-remove-key').addEventListener('click', function() {
					keysContainer.removeChild(keyRow);
					updateTagPreview();
				});
				
				const inputs = keyRow.querySelectorAll('input, select');
				inputs.forEach(input => {
					input.addEventListener('input', updateTagPreview);
				});
			});
			
			updateTagPreview();
			
			// Scroll to form
			document.querySelector('.editor-text-teacher-form-container').scrollIntoView({
				behavior: 'smooth'
			});
		});
	});
	
	// Delete button functionality
	document.querySelectorAll('.editor-text-teacher-action-delete').forEach(button => {
		button.addEventListener('click', function() {
			if (confirm('Are you sure you want to delete this tag definition?')) {
				const tagName = this.dataset.tag;
				const index = this.dataset.index;
				
				const tags = getTagDefinitions();
				tags[tagName].splice(index, 1);
				
				// If no definitions left, remove the tag
				if (tags[tagName].length === 0) {
					delete tags[tagName];
				}
				
				localStorage.setItem('editor-text-tags', JSON.stringify(tags));
				updateDictionaryTable();
				updateTagList();
			}
		});
	});
}
// Initialize dictionary table on page load
document.addEventListener('DOMContentLoaded', function() {
	updateDictionaryTable();
	updateTagList();
});
// Translation constants
const translatableStrings = {
	"text_editor.title": "Wesnoth File Editor",
	"text_editor.subtitle": "Create and manage Wesnoth scenario files with ease",
	"text_editor.how_to_use": "How to Use",
	"text_editor.step1": "Define your tags in the Teacher tab with keys and types",
	"text_editor.step2": "Save tags to dictionary using the Save button",
	"text_editor.step3": "Switch to Student tab to create content using defined tags",
	"text_editor.step4": "Click on tags in sidebar to insert templates",
	"text_editor.step5": "Validate files in Tester tab before use",
	"text_editor.teacher_tab": "Teacher",
	"text_editor.student_tab": "Student",
	"text_editor.tester_tab": "Tester",
	"text_editor.teacher_title": "Tag Definition",
	"text_editor.dictionary": "Dictionary",
	"text_editor.dictionary_content": "Define your tags and their structure here. Each tag should have keys with specified types.",
	"text_editor.option_color": "Color",
	"text_editor.option_indentation": "Indentation",
	"text_editor.option_export": "Export",
	"text_editor.option_import": "Import",
	"text_editor.option_settings": "Settings",
	"text_editor.undo": "Undo",
	"text_editor.redo": "Redo",
	"text_editor.verify": "Verify",
	"text_editor.cancel": "Cancel",
	"text_editor.save": "Save",
	"text_editor.student_title": "Content Creation",
	"text_editor.student_dictionary_content": "Use the defined tags to create your scenario content. Click on a tag in the sidebar to insert it.",
	"text_editor.option_preview": "Preview",
	"text_editor.option_guides": "Guides",
	"text_editor.option_templates": "Templates",
	"text_editor.available_tags": "Available Tags",
	"text_editor.tester_title": "File Validation",
	"text_editor.tester_dictionary_content": "Validate your scenario files and check for errors or inconsistencies.",
	"text_editor.option_lint": "Lint",
	"text_editor.option_simulate": "Simulate",
	"text_editor.option_debug": "Debug",
	"text_editor.export_cfg": ".cfg",
	"text_editor.export_json": ".json",
	"text_editor.export_txt": ".txt",
	"text_editor.import_cfg": ".cfg",
	"text_editor.import_json": ".json",
	"text_editor.import_txt": ".txt",
	"text_editor.tooltip_color": "Change editor color scheme",
	"text_editor.tooltip_indentation": "Adjust indentation settings",
	"text_editor.tooltip_export": "Export your tag definitions",
	"text_editor.tooltip_import": "Import tag definitions",
	"text_editor.tooltip_settings": "Editor preferences",
    "text_editor.modal_title": "Tag Already Exists",
    "text_editor.modal_message": "The tag {tag} already exists. How would you like to proceed?",
    "text_editor.modal_replace": "Replace Existing",
    "text_editor.modal_append": "Add New Version",
    "text_editor.modal_cancel": "Cancel"
};