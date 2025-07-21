document.addEventListener('DOMContentLoaded', () => {
    // Elements with data-i18n attributes
    const processBtn = document.getElementById('dictionary-manager-processBtn');
    const fileInput = document.getElementById('dictionary-manager-fileInput');
    const poContentTextarea = document.getElementById('dictionary-manager-poContent');
    const statusDiv = document.getElementById('dictionary-manager-status');
    const loadBtn = document.getElementById('dictionary-manager-loadBtn');
    const saveDictBtn = document.getElementById('dictionary-manager-saveDictBtn');
    const downloadBtn = document.getElementById('dictionary-manager-downloadBtn');
    const clearDictBtn = document.getElementById('dictionary-manager-clearDictBtn');
    const uploadDictBtn = document.getElementById('dictionary-manager-uploadDictBtn');
    const tabBtns = document.querySelectorAll('.dictionary-manager-tab-btn');
    const tabContents = document.querySelectorAll('.dictionary-manager-tab-content');
    const applyDictBtn = document.getElementById('dictionary-manager-applyDictBtn');
    
    if (applyDictBtn) {
        applyDictBtn.addEventListener('click', applyDictionary);
	}
    
    const downloadModifiedBtn = document.getElementById('dictionary-manager-downloadModifiedBtn');
    if (downloadModifiedBtn) {
        downloadModifiedBtn.addEventListener('click', downloadModifiedPo);
        downloadModifiedBtn.disabled = false;
	}
    
    // Global variables
    let currentDictionary = null;
    let originalPoContent = '';
    
    // Tab navigation
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
		});
	});
    
    // Load dictionary function
    function loadDictionary() {
        const language = document.getElementById('dictionary-manager-language').value;
        const dictKey = `dictionary-${language}`;
        const storedDict = localStorage.getItem(dictKey);
        
        if (storedDict) {
            try {
                currentDictionary = JSON.parse(storedDict);
                renderDictionary(currentDictionary);
                statusDiv.textContent = i18n.t('dictionary_manager.loaded_dictionary', {
                    language: language,
                    count: Object.keys(currentDictionary.entries).length
				});
				} catch (e) {
                statusDiv.textContent = i18n.t('dictionary_manager.load_error');
                console.error(i18n.t('dictionary_manager.parse_error'), e);
			}
			} else {
            statusDiv.textContent = i18n.t('dictionary_manager.no_dictionary_found', { language: language });
            document.getElementById('dictionary-manager-dictionaryOutput').innerHTML = 
			`<p data-i18n="dictionary_manager.no_dictionary_instructions" data-i18n-options='{"language": "${language}"}'></p>`;
		}
	}
    
    // Get PO content function
    async function getPoContent() {
        if (poContentTextarea.value.trim() !== '') {
            return poContentTextarea.value;
		}
        
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = (e) => reject(new Error(i18n.t('dictionary_manager.file_read_error')));
                reader.readAsText(file);
			});
		}
        
        return null;
	}
    
    // Extract header function
    function extractHeader(content) {
        const lines = content.split(/\r?\n/);
        let headerEnd = 0;
        
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() === '') {
                headerEnd = i;
                break;
			}
		}
        
        return {
            header: lines.slice(0, headerEnd + 1).join('\n'),
            message: i18n.t('dictionary_manager.header_extracted', { count: headerEnd + 1 })
		};
	}
    
    // Extract language line function
    function extractLanguageLine(header) {
        const regex = /Language:\s*([^\n]+)/i;
        const match = header.match(regex);
        if (match && match[1]) {
            console.log(i18n.t('dictionary_manager.extracted_language', { line: match[0] }));
            return match[1].trim();
		}
        console.log(i18n.t('dictionary_manager.no_language_found'));
        return null;
	}
    
    // Clean language code function
    function cleanLanguageCode(languageLine) {
        let cleaned = languageLine.replace(/\n/g, '');
        const backslashIndex = cleaned.indexOf('\\');
        
        if (backslashIndex !== -1) {
            cleaned = cleaned.substring(0, backslashIndex);
		}
        
        cleaned = cleaned.replace(/['"]/g, '').trim();
        console.log(i18n.t('dictionary_manager.cleaned_language', { code: cleaned }));
        return cleaned;
	}
    
    // Parse PO entries function
    function parsePoEntries(content) {
        const entries = [];
        const blocks = content.split(/\n\n/);
        
        for (const block of blocks) {
            if (!block.trim()) continue;
            
            if (block.includes('\n"') || block.includes('\n#~ "')) {
                continue;
			}
            
            const msgidMatch = block.match(/(?:#~ *)?msgid\s+"(.*?[^\\])"/);
            if (!msgidMatch) continue;
            
            const msgstrMatch = block.match(/(?:#~ *)?msgstr\s+"(.*?[^\\])"/);
            const msgid = msgidMatch[1].replace(/\\"/g, '"').trim();
            const msgstr = msgstrMatch ? msgstrMatch[1].replace(/\\"/g, '"').trim() : "";
            
            if (!msgid || 
                msgid === "\\n" || 
                msgid === "\\t" || 
                msgid === "\\r" || 
                msgid === '""' || 
                msgid === '') {
                continue;
			}
            
            entries.push({ msgid, msgstr });
		}
        
        return entries;
	}
    
    // Create dictionary container function
    function createDictionaryContainer(languagePo) {
        const wordCount = document.getElementById('dictionary-manager-wordCount').value;
        const dictionary = {
            metadata: {
                language: languagePo,
                wordCount: wordCount,
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                version: "1.0",
                source: "po-file-extractor"
			},
            entries: {}
		};
        localStorage.setItem(`dictionary-${languagePo}`, JSON.stringify(dictionary));
        return dictionary;
	}
    
    // Process dictionary matches function
    function processDictionaryMatches(dictionary, entries) {
        const matches = [];
        
        for (const entry of entries) {
            if (dictionary.entries[entry.msgid] !== undefined) {
                matches.push({
                    msgid: entry.msgid,
                    existing: dictionary.entries[entry.msgid],
                    new: entry.msgstr
				});
			}
		}
        
        return matches;
	}
    
    // Render dictionary function
    function renderDictionary(dictionary) {
        const outputDiv = document.getElementById('dictionary-manager-dictionaryOutput');
        const entries = dictionary.entries;
        const entryCount = Object.keys(entries).length;
        
        let html = `
        <div class="dictionary-manager-summary">
		${i18n.t('dictionary_manager.dictionary_summary', {
		language: dictionary.metadata.language,
		count: entryCount,
		created: new Date(dictionary.metadata.created).toLocaleDateString(),
		modified: new Date(dictionary.metadata.modified).toLocaleDateString()
		})}
        </div>
        <table style="width:100%; border-collapse:collapse; margin-top:10px;">
		<thead>
		<tr style="border-bottom:2px solid #3498db;">
		<th style="padding:8px;text-align:left;width:30%;" data-i18n="dictionary_manager.key_header"></th>
		<th style="padding:8px;text-align:left;width:50%;" data-i18n="dictionary_manager.value_header"></th>
		<th style="padding:8px;text-align:left;width:20%;" data-i18n="dictionary_manager.actions_header"></th>
		</tr>
		</thead>
		<tbody>
        `;
        
        for (const [key, value] of Object.entries(entries)) {
            html += `
            <tr data-key="${encodeURIComponent(key)}" style="border-bottom:1px solid #eee;">
			<td style="padding:8px;vertical-align:top;"><strong>${key}</strong></td>
			<td style="padding:8px;vertical-align:top;">
			<div class="dictionary-manager-entry-value">${value}</div>
			</td>
			<td style="padding:8px;">
			<div class="dictionary-manager-entry-actions">
			<button class="dictionary-manager-entry-btn dictionary-manager-entry-edit" data-i18n="dictionary_manager.edit_btn"></button>
			<button class="dictionary-manager-entry-btn dictionary-manager-entry-delete" data-i18n="dictionary_manager.delete_btn"></button>
			</div>
			</td>
            </tr>
            `;
		}
        
        html += `</tbody></table>`;
        outputDiv.innerHTML = html;
        
        // Add event listeners for edit buttons
        outputDiv.querySelectorAll('.dictionary-manager-entry-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const row = this.closest('tr');
                const key = decodeURIComponent(row.dataset.key);
                const valueCell = row.querySelector('.dictionary-manager-entry-value');
                const originalValue = currentDictionary.entries[key];
                
                valueCell.innerHTML = `
                <textarea class="dictionary-manager-edit-input">${originalValue}</textarea>
                <div class="dictionary-manager-entry-actions" style="margin-top:8px;">
				<button class="dictionary-manager-entry-btn dictionary-manager-entry-save" data-i18n="dictionary_manager.save_btn"></button>
				<button class="dictionary-manager-entry-btn dictionary-manager-entry-cancel" data-i18n="dictionary_manager.cancel_btn"></button>
                </div>
                `;
                
                const textarea = valueCell.querySelector('textarea');
                textarea.focus();
                textarea.select();
                
                // Save handler
                valueCell.querySelector('.dictionary-manager-entry-save').addEventListener('click', function() {
                    const newValue = textarea.value.trim();
                    if (newValue === '') {
                        statusDiv.textContent = i18n.t('dictionary_manager.value_empty_error');
                        return;
					}
                    
                    currentDictionary.entries[key] = newValue;
                    saveCurrentDictionary();
                    renderDictionary(currentDictionary);
                    statusDiv.textContent = i18n.t('dictionary_manager.entry_updated', {
                        key: key.substring(0, 30),
                        ellipsis: key.length > 30 ? '...' : ''
					});
				});
                
                // Cancel handler
                valueCell.querySelector('.dictionary-manager-entry-cancel').addEventListener('click', function() {
                    renderDictionary(currentDictionary);
				});
			});
		});
        
        // Add event listeners for delete buttons
        outputDiv.querySelectorAll('.dictionary-manager-entry-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const row = this.closest('tr');
                const key = decodeURIComponent(row.dataset.key);
                
                if (confirm(i18n.t('dictionary_manager.delete_confirm', {
                    key: key.substring(0, 30),
                    ellipsis: key.length > 30 ? '...' : ''
				}))) {
				delete currentDictionary.entries[key];
				saveCurrentDictionary();
				renderDictionary(currentDictionary);
				statusDiv.textContent = i18n.t('dictionary_manager.entry_deleted', {
					key: key.substring(0, 30),
					ellipsis: key.length > 30 ? '...' : ''
				});
                }
			});
		});
	}
    
    // Save current dictionary function
    function saveCurrentDictionary() {
        if (currentDictionary) {
            currentDictionary.metadata.modified = new Date().toISOString();
            const dictKey = `dictionary-${currentDictionary.metadata.language}`;
            localStorage.setItem(dictKey, JSON.stringify(currentDictionary));
		}
	}
    
    // Download current dictionary function
    function downloadCurrentDictionary() {
        if (!currentDictionary) {
            statusDiv.textContent = i18n.t('dictionary_manager.no_dictionary_to_download');
            return;
		}
        
        currentDictionary.metadata.downloaded = new Date().toISOString();
        
        const data = JSON.stringify(currentDictionary, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dictionary-${currentDictionary.metadata.language}-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
		}, 100);
	}
    
    // Clear current dictionary function
    function clearCurrentDictionary() {
        if (!currentDictionary) {
            statusDiv.textContent = i18n.t('dictionary_manager.no_dictionary_to_clear');
            return;
		}
        
        const entryCount = Object.keys(currentDictionary.entries).length;
        if (!entryCount) {
            statusDiv.textContent = i18n.t('dictionary_manager.dictionary_already_empty');
            return;
		}
        
        if (confirm(i18n.t('dictionary_manager.clear_confirm', {
            count: entryCount,
            language: currentDictionary.metadata.language
		}))) {
		currentDictionary.entries = {};
		saveCurrentDictionary();
		renderDictionary(currentDictionary);
		statusDiv.textContent = i18n.t('dictionary_manager.dictionary_cleared');
        }
	}
    
    // Upload dictionary function
    function uploadDictionary() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const newDict = JSON.parse(e.target.result);
                    
                    if (!newDict.metadata || !newDict.metadata.language || !newDict.entries) {
                        throw new Error(i18n.t('dictionary_manager.invalid_dictionary_format'));
					}
                    
                    const outputDiv = document.getElementById('dictionary-manager-dictionaryOutput');
                    
                    if (!currentDictionary) {
                        currentDictionary = newDict;
                        saveCurrentDictionary();
                        renderDictionary(currentDictionary);
                        statusDiv.textContent = i18n.t('dictionary_manager.dictionary_uploaded', {
                            language: newDict.metadata.language,
                            count: Object.keys(newDict.entries).length
						});
                        return;
					}
                    
                    if (currentDictionary.metadata.language !== newDict.metadata.language) {
                        if (!confirm(i18n.t('dictionary_manager.language_mismatch_warning', {
                            current: currentDictionary.metadata.language,
                            uploaded: newDict.metadata.language
						}))) {
						return;
                        }
                        currentDictionary = newDict;
                        saveCurrentDictionary();
                        renderDictionary(currentDictionary);
                        statusDiv.textContent = i18n.t('dictionary_manager.dictionary_loaded', {
                            language: newDict.metadata.language
						});
                        return;
					}
                    
                    let addedCount = 0;
                    let updatedCount = 0;
                    const conflicts = [];
                    
                    for (const [key, value] of Object.entries(newDict.entries)) {
                        if (!currentDictionary.entries[key]) {
                            addedCount++;
							} else if (currentDictionary.entries[key] !== value) {
                            updatedCount++;
                            conflicts.push({key, oldValue: currentDictionary.entries[key], newValue: value});
						}
					}
                    
                    const conflictInfo = conflicts.length ? 
                    `<div class="dictionary-manager-merge-info">
					<strong>${i18n.t('dictionary_manager.note')}:</strong> 
					${i18n.t('dictionary_manager.conflict_entries', { count: conflicts.length })}
                    </div>` : '';
                    
                    outputDiv.innerHTML = `
                    <div class="dictionary-manager-summary">
					${i18n.t('dictionary_manager.merge_preview', {
					added: addedCount,
					updated: updatedCount
					})}
                    </div>
                    ${conflictInfo}
                    <div class="dictionary-manager-button-group" style="margin-top:15px;">
					<button id="confirm-merge" class="dictionary-manager-btn dictionary-manager-btn-primary" data-i18n="dictionary_manager.confirm_merge_btn"></button>
					<button id="cancel-merge" class="dictionary-manager-btn dictionary-manager-btn-light" data-i18n="dictionary_manager.cancel_btn"></button>
                    </div>
                    `;
                    
                    document.getElementById('confirm-merge').addEventListener('click', () => {
                        for (const [key, value] of Object.entries(newDict.entries)) {
                            currentDictionary.entries[key] = value;
						}
                        
                        saveCurrentDictionary();
                        renderDictionary(currentDictionary);
                        statusDiv.textContent = i18n.t('dictionary_manager.merge_completed', {
                            added: addedCount,
                            updated: updatedCount
						});
					});
                    
                    document.getElementById('cancel-merge').addEventListener('click', () => {
                        renderDictionary(currentDictionary);
                        statusDiv.textContent = i18n.t('dictionary_manager.merge_canceled');
					});
                    
					} catch (error) {
                    statusDiv.textContent = i18n.t('dictionary_manager.invalid_dictionary_file');
                    console.error(i18n.t('dictionary_manager.upload_error'), error);
				}
			};
            
            reader.onerror = () => {
                statusDiv.textContent = i18n.t('dictionary_manager.file_read_error');
			};
            
            reader.readAsText(file);
		};
        
        input.click();
	}
    
    // Render matches function
    function renderMatches(matches, dictionary, entries) {
        const outputDiv = document.getElementById('dictionary-manager-dictionaryOutput');
        outputDiv.innerHTML = '';
        
        const matchesContainer = document.createElement('div');
        matchesContainer.className = 'dictionary-manager-matches';
        matchesContainer.innerHTML = `
        <h3 data-i18n="dictionary_manager.conflicts_found_header"></h3>
        <p>${i18n.t('dictionary_manager.conflicts_count', { count: matches.length })}</p>
        <div class="dictionary-manager-matches-container"></div>
        `;
        
        const container = matchesContainer.querySelector('.dictionary-manager-matches-container');
        
        for (const match of matches) {
            const matchDiv = document.createElement('div');
            matchDiv.className = 'dictionary-manager-match';
            matchDiv.innerHTML = `
            <div class="dictionary-manager-match-header">
			<strong>${match.msgid}</strong>
            </div>
            <div class="dictionary-manager-match-options">
			<div class="dictionary-manager-match-option">
			<label>
			<input type="radio" name="${match.msgid}" value="existing" checked>
			${i18n.t('dictionary_manager.use_existing')}:
			</label>
			<div class="dictionary-manager-match-value">${match.existing}</div>
			</div>
			<div class="dictionary-manager-match-option">
			<label>
			<input type="radio" name="${match.msgid}" value="new">
			${i18n.t('dictionary_manager.use_new')}:
			</label>
			<div class="dictionary-manager-match-value">${match.new}</div>
			</div>
			<div class="dictionary-manager-match-option">
			<label>
			<input type="radio" name="${match.msgid}" value="custom">
			${i18n.t('dictionary_manager.custom_value')}:
			</label>
			<textarea class="dictionary-manager-custom-value" 
			rows="2" 
			placeholder="${i18n.t('dictionary_manager.custom_placeholder')}"
			data-msgid="${match.msgid}"></textarea>
			</div>
            </div>
            `;
            container.appendChild(matchDiv);
		}
        
        container.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const textarea = this.closest('.dictionary-manager-match-option')
				.querySelector('.dictionary-manager-custom-value');
                if (this.value === 'custom') {
                    textarea.disabled = false;
                    textarea.focus();
					} else {
                    textarea.disabled = true;
				}
			});
		});
        
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = i18n.t('dictionary_manager.confirm_selections_btn');
        confirmBtn.id = 'dictionary-manager-confirmBtn';
        confirmBtn.className = 'dictionary-manager-btn dictionary-manager-btn-primary';
        
        confirmBtn.addEventListener('click', () => {
            container.querySelectorAll('.dictionary-manager-match').forEach(match => {
                const msgid = match.querySelector('strong').textContent;
                const selectedOption = match.querySelector('input[type="radio"]:checked').value;
                
                if (selectedOption === 'existing') {
                    // Keep existing value
					} else if (selectedOption === 'new') {
                    dictionary.entries[msgid] = matches.find(m => m.msgid === msgid).new;
					} else if (selectedOption === 'custom') {
                    const customValue = match.querySelector('.dictionary-manager-custom-value').value;
                    if (customValue.trim()) {
                        dictionary.entries[msgid] = customValue;
					}
				}
			});
            
            const addedCount = filterAndAddEntries(dictionary, entries);
            localStorage.setItem(`dictionary-${dictionary.metadata.language}`, JSON.stringify(dictionary));
            renderDictionary(dictionary);
            statusDiv.textContent = i18n.t('dictionary_manager.conflicts_resolved', {
                conflicts: matches.length,
                added: addedCount
			});
            matchesContainer.remove();
		});
        
        matchesContainer.appendChild(confirmBtn);
        outputDiv.appendChild(matchesContainer);
	}
    
    // Count words function
    function countWords(str) {
        return str.trim().split(/\s+/).filter(word => word.length > 0).length;
	}
    
    // Filter and add entries function
    function filterAndAddEntries(dictionary, entries) {
        const wordCountSetting = document.getElementById('dictionary-manager-wordCount').value;
        let addedCount = 0;
        
        entries.forEach(entry => {
            if (!entry.msgid) return;
            
            const wordCount = countWords(entry.msgid);
            const isSingleWord = wordCount === 1;
            const isTwoWords = wordCount === 2;
            
            let shouldAdd = false;
            
            if (wordCountSetting === "1" && isSingleWord) {
                shouldAdd = true;
				} else if (wordCountSetting === "2" && isTwoWords) {
                shouldAdd = true;
				} else if (wordCountSetting === "both" && (isSingleWord || isTwoWords)) {
                shouldAdd = true;
			}
            
            if (shouldAdd && !dictionary.entries[entry.msgid]) {
                dictionary.entries[entry.msgid] = entry.msgstr;
                addedCount++;
			}
		});
        
        return addedCount;
	}
    
    // Add new entry function
    function addNewEntry() {
        if (!currentDictionary) {
            statusDiv.textContent = i18n.t('dictionary_manager.load_dictionary_first');
            return;
		}
        
        const outputDiv = document.getElementById('dictionary-manager-dictionaryOutput');
        
        const newEntryForm = document.createElement('div');
        newEntryForm.className = 'dictionary-manager-new-entry-form';
        newEntryForm.innerHTML = `
        <div class="dictionary-manager-summary" data-i18n="dictionary_manager.add_new_entry_header"></div>
        <div class="dictionary-manager-new-entry-fields">
		<div class="dictionary-manager-input-box">
		<label class="dictionary-manager-label" data-i18n="dictionary_manager.key_label"></label>
		<input type="text" id="dictionary-manager-newEntryKey" class="dictionary-manager-input">
		</div>
		<div class="dictionary-manager-input-box">
		<label class="dictionary-manager-label" data-i18n="dictionary_manager.value_label"></label>
		<textarea id="dictionary-manager-newEntryValue" class="dictionary-manager-textarea" rows="3"></textarea>
		</div>
		<div class="dictionary-manager-button-group">
		<button id="dictionary-manager-saveNewEntry" class="dictionary-manager-btn dictionary-manager-btn-primary" data-i18n="dictionary_manager.save_btn"></button>
		<button id="dictionary-manager-cancelNewEntry" class="dictionary-manager-btn dictionary-manager-btn-light" data-i18n="dictionary_manager.cancel_btn"></button>
		</div>
        </div>
        `;
        
        outputDiv.prepend(newEntryForm);
        document.getElementById('dictionary-manager-newEntryKey').focus();
        
        document.getElementById('dictionary-manager-saveNewEntry').addEventListener('click', saveNewEntry);
        document.getElementById('dictionary-manager-cancelNewEntry').addEventListener('click', () => {
            newEntryForm.remove();
		});
	}
    
    // Save new entry function
    function saveNewEntry() {
        const keyInput = document.getElementById('dictionary-manager-newEntryKey');
        const valueInput = document.getElementById('dictionary-manager-newEntryValue');
        const key = keyInput.value.trim();
        const value = valueInput.value.trim();
        
        if (!key) {
            statusDiv.textContent = i18n.t('dictionary_manager.key_empty_error');
            keyInput.focus();
            return;
		}
        
        if (!value) {
            statusDiv.textContent = i18n.t('dictionary_manager.value_empty_error');
            valueInput.focus();
            return;
		}
        
        if (currentDictionary.entries[key]) {
            if (!confirm(i18n.t('dictionary_manager.overwrite_confirm', { key: key }))) {
                return;
			}
		}
        
        currentDictionary.entries[key] = value;
        saveCurrentDictionary();
        renderDictionary(currentDictionary);
        statusDiv.textContent = i18n.t('dictionary_manager.new_entry_added', {
            key: key.substring(0, 30),
            ellipsis: key.length > 30 ? '...' : ''
		});
	}
    
    // Filter dictionary function
    function filterDictionary() {
        if (!currentDictionary) return;
        
        const searchInput = document.getElementById('dictionary-manager-searchInput').value.toLowerCase();
        const filterValue = document.getElementById('dictionary-manager-filterSelect').value;
        
        const rows = document.querySelectorAll('#dictionary-manager-dictionaryOutput tr[data-key]');
        
        rows.forEach(row => {
            const key = decodeURIComponent(row.dataset.key).toLowerCase();
            let shouldShow = true;
            
            if (searchInput && !key.includes(searchInput)) {
                shouldShow = false;
			}
            
            if (shouldShow && filterValue !== 'all') {
                const firstChar = key.charAt(0).toLowerCase();
                
                switch(filterValue) {
                    case 'a-c': shouldShow = firstChar >= 'a' && firstChar <= 'c'; break;
                    case 'd-f': shouldShow = firstChar >= 'd' && firstChar <= 'f'; break;
                    case 'g-i': shouldShow = firstChar >= 'g' && firstChar <= 'i'; break;
                    case 'j-l': shouldShow = firstChar >= 'j' && firstChar <= 'l'; break;
                    case 'm-o': shouldShow = firstChar >= 'm' && firstChar <= 'o'; break;
                    case 'p-r': shouldShow = firstChar >= 'p' && firstChar <= 'r'; break;
                    case 's-u': shouldShow = firstChar >= 's' && firstChar <= 'u'; break;
                    case 'v-z': shouldShow = firstChar >= 'v' && firstChar <= 'z'; break;
				}
			}
            
            if (shouldShow) {
                row.classList.remove('dictionary-manager-entry-hidden');
				} else {
                row.classList.add('dictionary-manager-entry-hidden');
			}
		});
        
        const visibleCount = document.querySelectorAll('#dictionary-manager-dictionaryOutput tr[data-key]:not(.dictionary-manager-entry-hidden)').length;
        const totalCount = Object.keys(currentDictionary.entries).length;
        document.querySelector('.dictionary-manager-summary').textContent = 
		i18n.t('dictionary_manager.filter_summary', {
			language: currentDictionary.metadata.language,
			visible: visibleCount,
			total: totalCount
		});
	}
    
    // Process button event listener
    processBtn.addEventListener('click', async () => {
        statusDiv.textContent = i18n.t('dictionary_manager.processing');
        
        try {
            const content = await getPoContent();
            if (!content) {
                statusDiv.textContent = i18n.t('dictionary_manager.no_po_content');
                return;
			}
            
            const { header } = extractHeader(content);
            const languageLine = extractLanguageLine(header);
            
            if (!languageLine) {
                statusDiv.textContent = i18n.t('dictionary_manager.no_language_in_header');
                return;
			}
            
            const languagePo = cleanLanguageCode(languageLine);
            const selectedLanguage = document.getElementById('dictionary-manager-language').value;
            
            if (languagePo !== selectedLanguage) {
                const warning = i18n.t('dictionary_manager.language_mismatch', {
                    poLanguage: languagePo,
                    selected: selectedLanguage
				});
                console.warn(warning);
                statusDiv.textContent = warning;
                return;
			}
            
            console.log(i18n.t('dictionary_manager.language_validation_passed', {
                language: languagePo
			}));
            statusDiv.textContent = i18n.t('dictionary_manager.checking_dictionary');
            
            const dictionaryKey = `dictionary-${languagePo}`;
            let dictionary = JSON.parse(localStorage.getItem(dictionaryKey));
            
            if (dictionary) {
                console.log(i18n.t('dictionary_manager.existing_dictionary_found', {
                    language: languagePo
				}));
                statusDiv.textContent = i18n.t('dictionary_manager.existing_dictionary_loaded', {
                    language: languagePo
				});
				} else {
                console.log(i18n.t('dictionary_manager.creating_new_dictionary', {
                    language: languagePo
				}));
                dictionary = createDictionaryContainer(languagePo);
                statusDiv.textContent = i18n.t('dictionary_manager.new_dictionary_created', {
                    language: languagePo
				});
			}
            
            renderDictionary(dictionary);
            console.log(i18n.t('dictionary_manager.dictionary_displayed'));
            currentDictionary = dictionary;
            
            const entries = parsePoEntries(content);
            const matches = processDictionaryMatches(dictionary, entries);
            
            if (matches.length > 0) {
                renderMatches(matches, dictionary, entries);
                statusDiv.textContent = i18n.t('dictionary_manager.matches_found', { count: matches.length });
                return;
			}
            
            const addedCount = filterAndAddEntries(dictionary, entries);
            localStorage.setItem(`dictionary-${languagePo}`, JSON.stringify(dictionary));
            renderDictionary(dictionary);
            statusDiv.textContent = i18n.t('dictionary_manager.entries_added', { count: addedCount });
			} catch (error) {
            statusDiv.textContent = i18n.t('dictionary_manager.error_prefix') + error.message;
		}
	});
    
    // Other event listeners
    loadBtn.addEventListener('click', loadDictionary);
    saveDictBtn.addEventListener('click', () => {
        if (currentDictionary) {
            saveCurrentDictionary();
			} else {
            statusDiv.textContent = i18n.t('dictionary_manager.no_dictionary_to_save');
		}
	});
    downloadBtn.addEventListener('click', downloadCurrentDictionary);
    clearDictBtn.addEventListener('click', clearCurrentDictionary);
    uploadDictBtn.addEventListener('click', uploadDictionary);
    document.getElementById('dictionary-manager-newEntryBtn').addEventListener('click', addNewEntry);
    document.getElementById('dictionary-manager-searchInput').addEventListener('input', filterDictionary);
    document.getElementById('dictionary-manager-filterSelect').addEventListener('change', filterDictionary);
    
    // Enable dictionary buttons
    downloadBtn.disabled = false;
    
    // Escape PO string function
    function escapePoString(str) {
        return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
	}
    
    // Replace msgstr in block function
    function replaceMsgstrInBlock(block, newMsgstr) {
        const escapedMsgstr = escapePoString(newMsgstr);
        if (block.includes('msgstr "')) {
            return block.replace(/msgstr\s+"([^"]*)"/, `msgstr "${escapedMsgstr}"`);
		}
        if (block.includes('#~ msgstr "')) {
            return block.replace(/#~ msgstr\s+"([^"]*)"/, `#~ msgstr "${escapedMsgstr}"`);
		}
        return block;
	}
    
    // Apply dictionary function
    async function applyDictionary() {
        statusDiv.textContent = i18n.t('dictionary_manager.applying_dictionary');
        
        try {
            const content = await getPoContent();
            if (!content) {
                statusDiv.textContent = i18n.t('dictionary_manager.no_po_content');
                return;
			}
            
            originalPoContent = content;
            const language = document.getElementById('dictionary-manager-language').value;
            const dictKey = `dictionary-${language}`;
            const storedDict = localStorage.getItem(dictKey);
            const containerExists = storedDict !== null;
            
            console.log(i18n.t('dictionary_manager.container_exists', { exists: containerExists }));
            
            const suggestionsOutput = document.getElementById('dictionary-manager-suggestionsOutput');
            suggestionsOutput.innerHTML = '';
            
            const blocks = content.split(/\n\n/);
            let modifiedBlocks = [...blocks];
            let matches = [];
            
            if (containerExists) {
                const dictionary = JSON.parse(storedDict);
                const applyMode = document.getElementById('dictionary-manager-applyMode').value;
                
                for (let i = 0; i < blocks.length; i++) {
                    const block = blocks[i];
                    const { msgid, msgstr } = parsePoBlock(block);
                    
                    if (msgid && dictionary.entries[msgid]) {
                        const dictValue = dictionary.entries[msgid];
                        matches.push({
                            index: i,
                            msgid: msgid,
                            original: msgstr || '',
                            dictionary: dictValue
						});
                        
                        if (applyMode === 'auto') {
                            modifiedBlocks[i] = replaceMsgstrInBlock(block, dictValue);
						}
					}
				}
                
                console.log(i18n.t('dictionary_manager.matches_found', { count: matches.length }));
                
                if (matches.length > 0) {
                    if (applyMode === 'suggest') {
                        let tableHTML = `
                        <table class="dictionary-manager-suggestions-table">
						<thead>
						<tr>
						<th data-i18n="dictionary_manager.key_header"></th>
						<th data-i18n="dictionary_manager.original_translation"></th>
						<th data-i18n="dictionary_manager.dictionary_value"></th>
						<th data-i18n="dictionary_manager.action_header"></th>
						</tr>
						</thead>
						<tbody>
                        `;
                        
                        matches.forEach(match => {
                            tableHTML += `
                            <tr>
							<td>${match.msgid}</td>
							<td>${match.original}</td>
							<td>${match.dictionary}</td>
							<td>
							<label>
							<input type="radio" name="action-${match.index}" value="original" checked>
							${i18n.t('dictionary_manager.keep_original')}
							</label>
							<label>
							<input type="radio" name="action-${match.index}" value="dictionary">
							${i18n.t('dictionary_manager.use_dictionary')}
							</label>
							</td>
                            </tr>
                            `;
						});
                        
                        tableHTML += `</tbody></table>
                        <div class="dictionary-manager-button-group" style="margin-top:15px;">
						<button id="confirm-changes" class="dictionary-manager-btn dictionary-manager-btn-primary" data-i18n="dictionary_manager.confirm_changes_btn"></button>
                        </div>`;
                        
                        suggestionsOutput.innerHTML = tableHTML;
                        
                        document.getElementById('confirm-changes').addEventListener('click', () => {
                            matches.forEach(match => {
                                const selectedAction = document.querySelector(`input[name="action-${match.index}"]:checked`).value;
                                if (selectedAction === 'dictionary') {
                                    modifiedBlocks[match.index] = replaceMsgstrInBlock(
                                        blocks[match.index], 
                                        match.dictionary
									);
								}
							});
                            
                            const outputDiv = document.getElementById('dictionary-manager-applicationOutput');
                            outputDiv.textContent = modifiedBlocks.join('\n\n');
                            
                            statusDiv.textContent = i18n.t('dictionary_manager.changes_applied', { count: matches.length });
						});
						} else {
                        suggestionsOutput.innerHTML = `
                        <div class="dictionary-manager-summary">
						${i18n.t('dictionary_manager.auto_applied', { count: matches.length })}
                        </div>
                        `;
					}
					} else {
                    suggestionsOutput.innerHTML = `
                    <div class="dictionary-manager-summary">
					${i18n.t('dictionary_manager.no_matches_found')}
                    </div>
                    `;
				}
			}
            
            const outputDiv = document.getElementById('dictionary-manager-applicationOutput');
            outputDiv.textContent = modifiedBlocks.join('\n\n');
            
            statusDiv.textContent = i18n.t('dictionary_manager.dictionary_applied', { exists: containerExists });
			} catch (error) {
            statusDiv.textContent = i18n.t('dictionary_manager.error_prefix') + error.message;
		}
	}
    
    // Parse PO block function
    function parsePoBlock(block) {
        let msgid = null;
        let msgstr = null;
        
        const msgidMatch = block.match(/(?:#~ *)?msgid\s+"(.*?[^\\])"/);
        if (msgidMatch) {
            msgid = msgidMatch[1].replace(/\\"/g, '"').trim();
		}
        
        const msgstrMatch = block.match(/(?:#~ *)?msgstr\s+"(.*?[^\\])"/);
        if (msgstrMatch) {
            msgstr = msgstrMatch[1].replace(/\\"/g, '"').trim();
		}
        
        return { msgid, msgstr };
	}
    
    // Download modified PO function
    async function downloadModifiedPo() {
        const outputDiv = document.getElementById('dictionary-manager-applicationOutput');
        const modifiedContent = outputDiv.textContent;
        
        if (!modifiedContent) {
            statusDiv.textContent = i18n.t('dictionary_manager.no_modified_content');
            return;
		}
        
        const originalLines = originalPoContent ? originalPoContent.split('\n').length : 0;
        const modifiedLines = modifiedContent.split('\n').length;
        
        console.log(i18n.t('dictionary_manager.line_count_comparison', {
            original: originalLines,
            modified: modifiedLines
		}));
        statusDiv.textContent = i18n.t('dictionary_manager.line_count_difference', {
            original: originalLines,
            modified: modifiedLines,
            difference: Math.abs(originalLines - modifiedLines)
		});
        
        let fileName = 'modified_dictionary.po';
        if (fileInput.files.length > 0) {
            const originalName = fileInput.files[0].name;
            fileName = originalName.replace('.po', '_modified.po');
		}
        
        const blob = new Blob([modifiedContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
		}, 100);
	}
});