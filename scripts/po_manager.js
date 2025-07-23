document.addEventListener('DOMContentLoaded', function() {
	// DOM Elements
	const sourceText = document.getElementById('po-manager-sourceText');
	const translatedText = document.getElementById('po-manager-translatedText');
	const targetLang = document.getElementById('po-manager-targetLang');
	const extractBtn = document.getElementById('po-manager-extractBtn');
	const applyBtn = document.getElementById('po-manager-applyBtn');
	const downloadOriginalBtn = document.getElementById('po-manager-downloadOriginalBtn');
	const uploadTranslationsBtn = document.getElementById('po-manager-uploadTranslationsBtn');
	const loadingIndicator = document.getElementById('po-manager-loadingIndicator');
	const sourceStats = document.getElementById('po-manager-sourceStats');
	const translationTableContainer = document.getElementById('po-manager-translationTableContainer');
	const uploadInputBtn = document.getElementById('po-manager-uploadInputBtn');
	const downloadOutputBtn = document.getElementById('po-manager-downloadOutputBtn');
	const emptyShellBtn = document.getElementById('po-manager-emptyShellBtn');
	const fuzzyAllBtn = document.getElementById('po-manager-fuzzyAllBtn');
	const unfuzzyAllBtn = document.getElementById('po-manager-unfuzzyAllBtn');
	const analyzeBtn = document.getElementById('po-manager-analyzeBtn');
	// Modal elements
	const modal = document.getElementById('po-manager-analysisModal');
	const closeBtn = document.querySelector('.po-manager-close');
	if (closeBtn && modal) {
		closeBtn.addEventListener('click', () => modal.style.display = 'none');
		window.addEventListener('click', (e) => {
			if (e.target === modal) modal.style.display = 'none';
		});
	}
	/**
		* Sample PO file content for initial demonstration
		* @constant {string}
	*/
	const samplePoContent = `# Sample PO File
	# Sample PO File
	msgid ""
	msgstr ""
	"Project-Id-Version: Sample Project\\n"
	"POT-Creation-Date: 2023-01-01\\n"
	"PO-Revision-Date: 2023-01-01\\n"
	"Last-Translator: You <you@example.com>\\n"
	"Language-Team: \\n"
	"Language: en\\n"
	"MIME-Version: 1.0\\n"
	"Content-Type: text/plain; charset=UTF-8\\n"
	"Content-Transfer-Encoding: 8bit\\n"
	"Plural-Forms: nplurals=6; plural= n==0 ? 0 : n==1 ? 1 : n==2 ? 2 : n%100>=3 && "
	"n%100<=10 ? 3 : n%100>=11 && n%100<=99 ? 4 : 5;\\n"
	"X-Generator: Poedit 3.0\\n"
	#: sample/file.c:123
	msgid "Hello world"
	msgstr ""
	#: sample/file.c:124
	msgid "%d apple"
	msgid_plural "%d apples"
	msgstr[0] ""
	msgstr[1] ""
	msgstr[2] ""
	msgstr[3] ""
	msgstr[4] ""
	msgstr[5] ""
	#~ msgid "Old message"
	#~ msgstr "Old translation"
	`;
	// Initialize textarea with sample PO content
	sourceText.value = samplePoContent;
	analyzeBtn.addEventListener('click', performAnalysis);
	/**
		* Handles PO content extraction when extract button is clicked
		* @listens extractBtn#click
	*/
	extractBtn.addEventListener('click', function() {
		const poContent = sourceText.value.trim();
		if (!poContent) {
			alert(i18n.t('po_manager.alert_paste_first'));
			return;
		}
		// Empty Shell functionality
		emptyShellBtn.addEventListener('click', function() {
			if (!window.currentMessages) {
				alert(i18n.t('po_manager.alert_extract_first'));
				return;
			}
			showLoading(true);
			setTimeout(() => {
				window.currentMessages.forEach(msg => {
					// Clear translations
					if (msg.hasPlural && Array.isArray(msg.msgstr)) {
						for (let i = 0; i < msg.msgstr.length; i++) {
							msg.msgstr[i] = "";
						}
                        } else {
						msg.msgstr = "";
					}
					// Remove fuzzy flag
					msg.fuzzy = false;
				});
				refreshTranslationTable();
				alert(i18n.t('po_manager.alert_cleared'));
				showLoading(false);
			}, 100);
		});
		// Fuzzy All functionality
		fuzzyAllBtn.addEventListener('click', function() {
			if (!window.currentMessages) {
				alert(i18n.t('po_manager.alert_extract_first'));
				return;
			}
			showLoading(true);
			setTimeout(() => {
				window.currentMessages.forEach(msg => {
					// Only mark non-obsolete messages as fuzzy
					if (!msg.isObsolete) {
						msg.fuzzy = true;
					}
				});
				refreshTranslationTable();
				showLoading(false);
			}, 100);
		});
		// Unfuzzy All functionality
		unfuzzyAllBtn.addEventListener('click', function() {
			if (!window.currentMessages) {
				alert(i18n.t('po_manager.alert_extract_first'));
				return;
			}
			showLoading(true);
			setTimeout(() => {
				window.currentMessages.forEach(msg => {
					msg.fuzzy = false;
				});
				refreshTranslationTable();
				showLoading(false);
			}, 100);
		});
		showLoading(true);
		setTimeout(() => {
			try {
				// Capture the returned value
				const pluralForm = logPluralForm(poContent);
				const explanations = explainPluralFormComprehensively(pluralForm);
				window.pluralFormsExplanations = explanations;
				const extractionResult = extractPoStrings(poContent);
				displayExtractedStrings(extractionResult);
				applyBtn.disabled = false;
				downloadOriginalBtn.disabled = false;
                } catch (error) {
				console.error('Extraction error:', error);
				alert(i18n.t('po_manager.error_extracting') + error.message);
                } finally {
				showLoading(false);
			}
		}, 100);
	});
	/**
		* Applies translations to generate new PO file
		* @listens applyBtn#click
	*/
	applyBtn.addEventListener('click', function() {
		if (!window.currentMessages) {
			alert(i18n.t('po_manager.alert_extract_first'));
			return;
		}
		showLoading(true);
		setTimeout(() => {
			try {
				const translatedContent = generateTranslatedPo(window.currentMessages, window.currentMetadata);
				translatedText.value = translatedContent;
				downloadOutputBtn.disabled = false;
				// Calculate and display translation statistics
				const translatedCount = window.currentMessages.filter(m => m.msgstr && !m.isObsolete).length;
				const totalCount = window.currentMessages.filter(m => !m.isObsolete).length;
				document.getElementById('po-manager-translatedStats').innerHTML = `
				<p>${i18n.t('po_manager.translated_stats', { translatedCount, totalCount, percent: Math.round(translatedCount/totalCount*100) })}</p>
				<p>${i18n.t('po_manager.obsolete_stats', { count: window.currentMessages.filter(m => m.isObsolete).length })}</p>
				`;
                } catch (error) {
				console.error('Generation error:', error);
				alert(i18n.t('po_manager.error_generating') + error.message);
                } finally {
				showLoading(false);
			}
		}, 100);
	});
	/**
		* Handles PO file upload for source content
		* @listens uploadInputBtn#click
	*/
	uploadInputBtn.addEventListener('click', function() {
		let fileInput = document.getElementById('fileInput');
		if (!fileInput) {
			fileInput = document.createElement('input');
			fileInput.type = 'file';
			fileInput.id = 'fileInput';
			fileInput.style.display = 'none';
			fileInput.accept = '.po';
			document.body.appendChild(fileInput);
		}
		fileInput.onchange = function(e) {
			const file = e.target.files[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = function(e) {
				sourceText.value = e.target.result;
			};
			reader.readAsText(file);
			// Reset file input
			fileInput.value = '';
		};
		fileInput.click();
	});
	/**
		* Downloads translated PO file with language code in filename
		* @listens downloadOutputBtn#click
	*/
	downloadOutputBtn.addEventListener('click', function() {
		if (!translatedText.value) {
			alert(i18n.t('po_manager.alert_no_translated_content'));
			return;
		}
		const langCode = targetLang.value;
		const blob = new Blob([translatedText.value], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${langCode}.po`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	});
	/**
		* Exports original strings for translation
		* @listens downloadOriginalBtn#click
	*/
	const downloadOptions = {
		downloadAll: 'all',
		downloadUntranslated: 'untranslated',
		downloadTranslated: 'translated',
		downloadFuzzy: 'fuzzy',
		downloadObsolete: 'obsolete',
		downloadwithContext: 'withContext',
		downloadCSV: 'csv'
	};
	Object.entries(downloadOptions).forEach(([elementId, optionType]) => {
		document.getElementById('po-manager-' + elementId).addEventListener('click', function(e) {
			e.preventDefault();
			exportOriginalStrings(optionType);
		});
	});
	function exportOriginalStrings(optionType) {
		if (!window.currentMessages) {
			alert(i18n.t('po_manager.alert_extract_first'));
			return;
		}
		let contentParts = [];
		let filteredMessages = window.currentMessages;
		// Apply filters based on option type
		switch(optionType) {
			case 'untranslated':
			filteredMessages = filteredMessages.filter(m => !m.msgstr && !m.isObsolete);
			break;
			case 'translated':
			filteredMessages = filteredMessages.filter(m => m.msgstr && !m.isObsolete);
			break;
			case 'fuzzy':
			filteredMessages = filteredMessages.filter(m => m.fuzzy);
			break;
			case 'obsolete':
			filteredMessages = filteredMessages.filter(m => m.isObsolete);
			break;
			case 'withContext':
			// No special filtering, handled in output
			break;
			case 'csv':
			// Handled separately
			break;
			// 'all' falls through to default
		}
		// CSV Format
		if (optionType === 'csv') {
			const headers = [
				i18n.t('po_manager.csv_header_id'),
				i18n.t('po_manager.csv_header_context'),
				i18n.t('po_manager.csv_header_original'),
				i18n.t('po_manager.csv_header_status'),
				i18n.t('po_manager.csv_header_fuzzy'),
				i18n.t('po_manager.csv_header_translation')
			];
			const rows = [headers.join(',')];
			filteredMessages.forEach(msg => {
				if (msg.msgid === '') return;
				const context = [...msg.references, ...msg.comments]
				.map(c => c.replace(/"/g, '""'))
				.join('; ');
				const statusText = msg.msgstr ? i18n.t('po_manager.status_translated') : 
				msg.isObsolete ? i18n.t('po_manager.status_obsolete') : 
				i18n.t('po_manager.status_untranslated');
				const fuzzyText = msg.fuzzy ? i18n.t('po_manager.yes') : i18n.t('po_manager.no');
				const row = [
					`"${msg.id}"`,
					`"${context}"`,
					`"${msg.msgid.replace(/"/g, '""')}"`,
					`"${statusText}"`,
					`"${fuzzyText}"`,
					`"${(msg.msgstr || '').replace(/"/g, '""')}"`
				];
				rows.push(row.join(','));
			});
			contentParts = rows;
		} 
		// With Context option - includes references and comments
		else if (optionType === 'withContext') {
			filteredMessages.forEach(msg => {
				if (msg.msgid === '') return;
				contentParts.push(`#${msg.id}`);
				// Include context (references and comments)
				msg.references.forEach(ref => contentParts.push(ref));
				msg.comments.forEach(comment => contentParts.push(comment));
				contentParts.push(msg.msgid);
				contentParts.push('\n\n==========\n\n');
			});
		}
		// All other options - simple format (no context)
		else {
			filteredMessages.forEach(msg => {
				if (msg.msgid === '') return;
				contentParts.push(`#${msg.id}`);
				contentParts.push(msg.msgid);
				contentParts.push('\n\n==========\n\n');
			});
		}
		// Remove trailing separator
		if (contentParts.length > 0) {
			contentParts = contentParts.slice(0, -1);
		}
		const content = contentParts.join('\n');
		const extension = optionType === 'csv' ? 'csv' : 'txt';
		const filename = optionType === 'withContext' ? 
		'original_strings_with_context' : 
		`original_strings_${optionType}`;
		const blob = new Blob([content], { type: optionType === 'csv' ? 
		'text/csv;charset=utf-8;' : 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${filename}.${extension}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
	/**
		* Processes uploaded translations and applies to current messages
		* @listens uploadTranslationsBtn#click
	*/
	uploadTranslationsBtn.addEventListener('click', function() {
		if (!window.currentMessages) {
			alert(i18n.t('po_manager.alert_extract_first'));
			return;
		}
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.txt,.po';
		input.onchange = function(e) {
			const file = e.target.files[0];
			if (!file) return;
			showLoading(true);
			const reader = new FileReader();
			reader.onload = function(e) {
				try {
					const content = e.target.result;
					const sections = content.split(/\s*==========\s*/);
					const translations = {};
					// Parse translation sections
					sections.forEach(section => {
						const lines = section.split(/\r?\n/).filter(line => line.trim() !== '');
						if (lines.length === 0) return;
						const idLine = lines[0];
						if (!idLine.startsWith('#')) return;
						const id = idLine.substring(1).trim();
						const translation = lines.slice(1).join('\n').trim();
						if (id && translation) {
							translations[id] = translation;
						}
					});
					// Apply translations to message objects
					let appliedCount = 0;
					let pluralSkipped = 0;
					window.currentMessages.forEach(msg => {
						const translation = translations[msg.id];
						if (!translation) return;
						if (msg.hasPlural) {
							// Parse plural form translations
							const pluralMatches = translation.match(/\[(\d+)\]:\s*([^]+?)(?=\n\[\d+\]:|$)/g);
							if (pluralMatches && pluralMatches.length > 0) {
								msg.msgstr = [];
								pluralMatches.forEach(match => {
									const indexMatch = match.match(/\[(\d+)\]:/);
									if (!indexMatch) return;
									const index = parseInt(indexMatch[1]);
									const text = match.substring(indexMatch[0].length).trim();
									// Ensure we have enough slots for this plural form
									while (msg.msgstr.length <= index) {
										msg.msgstr.push("");
									}
									msg.msgstr[index] = text;
								});
								appliedCount++;
								} else {
								pluralSkipped++;
							}
							} else {
							// Regular translation
							msg.msgstr = translation;
							appliedCount++;
						}
					});
					// Refresh UI with updated translations
					displayExtractedStrings({
						messages: window.currentMessages,
						metadata: window.currentMetadata
					}, true);
					// Show results
					if (pluralSkipped > 0) {
						alert(i18n.t('po_manager.alert_upload_success_plural', { appliedCount, pluralSkipped }));
						} else {
						alert(i18n.t('po_manager.alert_upload_success', { appliedCount }));
					}
					} catch (error) {
					console.error('Upload error:', error);
					alert(i18n.t('po_manager.error_processing') + error.message);
					} finally {
					showLoading(false);
				}
			};
			reader.readAsText(file);
		};
		input.click();
	});
	/**
		* Removes contextual helper prefixes before the '^' character in translations
		* @param {string} translation - The translation string to process
		* @returns {string} Translation without helper prefixes
	*/
	function removeHelperPrefixes(translation) {
		return translation.replace(/^[^^]*\^/, '');
	}
	/**
		* Extracts and logs the plural form from the PO file header
		* @param {string} poContent - The full PO file content
	*/
	function logPluralForm(poContent) {
		const pluralFormMatch = poContent.match(/"Plural-Forms:\s*([\s\S]*?)\\n"/);
		if (pluralFormMatch && pluralFormMatch[1]) {
			const pluralForm = pluralFormMatch[1].replace(/\s*\n\s*"/g, '');
			console.log('Plural-Forms:', pluralForm);
			return pluralForm; // Return the value
		}
		console.log(i18n.t('po_manager.no_plural_form'));
		return null;
	}
	/**
		* Provides a comprehensive explanation of plural forms with example numbers
		* @param {string} pluralForm - The plural form string from the PO header
	*/
	function explainPluralFormComprehensively(pluralForm) {
		const explanations = [];
		if (!pluralForm) {
			console.log(i18n.t('po_manager.no_plural_form'));
			return explanations;
		}
		try {
			// Clean up plural form string
			pluralForm = pluralForm.replace(/"/g, '').replace(/\\n/g, '').trim();
			// Extract the expression after 'plural='
			const pluralExpr = pluralForm.split('plural=')[1].replace(/;$/, '');
			const conditions = pluralExpr.split(/\s*:\s*/);
			for (let i = 0; i < conditions.length; i++) {
				const [conditionPart, result] = conditions[i].split(/\s*\?\s*/);
				if (!conditionPart || result === undefined) {
					if (i === conditions.length - 1) {
						explanations[parseInt(conditions[i])] = i18n.t('po_manager.plural_otherwise');
					}
					continue;
				}
				// Handle simple equality conditions (n == number)
				const equalityMatch = conditionPart.match(/n\s*==\s*(\d+)/);
				if (equalityMatch) {
					explanations[parseInt(result)] = `n=${equalityMatch[1]}`;
					continue;
				}
				// Handle modulo range conditions (n%100>=3 && n%100<=10)
				const modRangeMatch = conditionPart.match(/n%(\d+)\s*>=\s*(\d+)\s*&&\s*n%\d+\s*<=\s*(\d+)/);
				if (modRangeMatch) {
					const start = parseInt(modRangeMatch[2]);
					const end = parseInt(modRangeMatch[3]);
					explanations[parseInt(result)] = `[${start},${end}]`;
					continue;
				}
				// Handle direct range conditions (n>=3 && n<=10)
				const rangeMatch = conditionPart.match(/n\s*>=\s*(\d+)\s*&&\s*n\s*<=\s*(\d+)/);
				if (rangeMatch) {
					const start = parseInt(rangeMatch[1]);
					const end = parseInt(rangeMatch[2]);
					explanations[parseInt(result)] = `[${start},${end}]`;
					continue;
				}
				// Handle simple modulo conditions (n%10==1)
				const modEqualityMatch = conditionPart.match(/n%(\d+)\s*==\s*(\d+)/);
				if (modEqualityMatch) {
					const mod = parseInt(modEqualityMatch[1]);
					const value = parseInt(modEqualityMatch[2]);
					explanations[parseInt(result)] = `n%${mod}=${value}`;
					continue;
				}
				// Default case - return raw condition
				explanations[parseInt(result)] = conditionPart
				.replace(/\bn\b/g, 'n')
				.replace(/%/g, ' mod ')
				.replace(/&&/g, ' and ');
			}
            } catch (error) {
			console.error(i18n.t('po_manager.plural_parse_error'), error);
			console.log(i18n.t('po_manager.raw_plural_form'), pluralForm);
		}
		return explanations;
	}
	/**
		* Extracts PO file strings and metadata
		* @param {string} poContent - The content of the PO file
		* @returns {Object} Extraction result with messages, metadata and header block
	*/
	function extractPoStrings(poContent) {
		const lines = poContent.split('\n');
		let currentMsg = null;
		const messages = [];
		// Improved header detection logic
		let headerEndIndex = 0;
		let inHeader = true;
		let headerEndFound = false;
		// Identify header section boundaries
		for (; headerEndIndex < lines.length; headerEndIndex++) {
			const line = lines[headerEndIndex].trim();
			if (!line) {
				if (inHeader) {
					headerEndFound = true;
					break;
				}
				continue;
			}
			// Detect first non-header msgid entry
			if (line.startsWith('msgid ') && line !== 'msgid ""') {
				inHeader = false;
				headerEndFound = true;
				break;
			}
		}
		// Fallback if header boundary wasn't detected
		if (!headerEndFound) {
			headerEndIndex = lines.length;
		}
		// Extract header block
		const headerBlock = lines.slice(0, headerEndIndex).join('\n');
		window.currentHeaderBlock = headerBlock;
		let pendingComments = [];   // Accumulates translator comments
		let pendingReferences = []; // Accumulates reference locations
		let inPluralBlock = false;
		// Process each line after header
		for (let lineNumber = headerEndIndex; lineNumber < lines.length; lineNumber++) {
			const line = lines[lineNumber];
			const trimmedLine = line.trim();
			if (!trimmedLine) continue; // Skip empty lines
			// Handle msgid declarations
			if (trimmedLine.startsWith('msgid ') || trimmedLine.startsWith('#~ msgid ')) {
				// Save previous message if exists
				if (currentMsg) {
					messages.push(currentMsg);
				}
				const isObsolete = trimmedLine.startsWith('#~');
				const startQuote = trimmedLine.indexOf('"');
				const endQuote = trimmedLine.lastIndexOf('"');
				let text = '';
				if (startQuote !== -1 && endQuote > startQuote) {
					text = trimmedLine.substring(startQuote + 1, endQuote);
				}
				currentMsg = {
					id: `msg-${messages.length + 1}`,
					isObsolete,
					fuzzy: false,
					msgid: text,
					msgstr: '',
					references: [...pendingReferences],
					comments: [...pendingComments],
					lineNumber: lineNumber + 1,
					complete: false,
					hasPlural: false
				};
				// Reset accumulators
				pendingComments = [];
				pendingReferences = [];
				inPluralBlock = false;
			}
			// Handle msgid_plural declarations
			else if (trimmedLine.startsWith('msgid_plural ') || trimmedLine.startsWith('#~ msgid_plural ')) {
				if (!currentMsg) continue;
				const isObsolete = trimmedLine.startsWith('#~');
				const startQuote = trimmedLine.indexOf('"');
				const endQuote = trimmedLine.lastIndexOf('"');
				let text = '';
				if (startQuote !== -1 && endQuote > startQuote) {
					text = trimmedLine.substring(startQuote + 1, endQuote);
				}
				currentMsg.hasPlural = true;
				currentMsg.msgid_plural = text;
				inPluralBlock = true;
			}
			// Handle msgstr declarations
			else if (trimmedLine.startsWith('msgstr ') || trimmedLine.startsWith('#~ msgstr ')) {
				if (!currentMsg) continue;
				if (inPluralBlock) {
					// This is msgstr[0] for plural forms
					const startQuote = trimmedLine.indexOf('"');
					const endQuote = trimmedLine.lastIndexOf('"');
					if (startQuote !== -1 && endQuote > startQuote) {
						currentMsg.msgstr = [trimmedLine.substring(startQuote + 1, endQuote)];
					}
                    } else {
					// Regular msgstr handling
					const startQuote = trimmedLine.indexOf('"');
					const endQuote = trimmedLine.lastIndexOf('"');
					if (startQuote !== -1 && endQuote > startQuote) {
						currentMsg.msgstr = trimmedLine.substring(startQuote + 1, endQuote);
					}
				}
				currentMsg.complete = true;
			}
			// Handle msgstr[n] declarations for plural forms
			else if ((trimmedLine.startsWith('msgstr[') || trimmedLine.startsWith('#~ msgstr[')) && currentMsg?.hasPlural) {
				const startBracket = trimmedLine.indexOf('[');
				const endBracket = trimmedLine.indexOf(']');
				const index = parseInt(trimmedLine.substring(startBracket + 1, endBracket));
				const startQuote = trimmedLine.indexOf('"');
				const endQuote = trimmedLine.lastIndexOf('"');
				if (startQuote !== -1 && endQuote > startQuote) {
					const text = trimmedLine.substring(startQuote + 1, endQuote);
					if (!Array.isArray(currentMsg.msgstr)) {
						currentMsg.msgstr = [];
					}
					currentMsg.msgstr[index] = text;
				}
			}
			// Handle multiline string continuations
			else if (currentMsg && trimmedLine.endsWith('"') && 
				(trimmedLine.startsWith('"') || 
				(currentMsg.isObsolete && trimmedLine.startsWith('#~ "')))) {
				let content;
				if (trimmedLine.startsWith('"')) {
					content = trimmedLine.substring(1, trimmedLine.length - 1);
                    } else {
					// FIX: Use substring(4) instead of substring(3) to remove '#~ "' completely
					content = trimmedLine.substring(4, trimmedLine.length - 1);
				}
				if (currentMsg.complete) {
					if (Array.isArray(currentMsg.msgstr)) {
						if (currentMsg.msgstr.length > 0) {
							currentMsg.msgstr[currentMsg.msgstr.length - 1] += content;
						}
                        } else {
						currentMsg.msgstr += content;
					}
                    } else {
					if (currentMsg.hasPlural && inPluralBlock) {
						currentMsg.msgid_plural += content;
                        } else {
						currentMsg.msgid += content;
					}
				}
			}
			// Capture reference locations
			else if (trimmedLine.startsWith('#:')) {
				pendingReferences.push(line);
			}
			// Capture translator comments
			else if (trimmedLine.startsWith('#.')) {
				pendingComments.push(line);
			}
			// Fuzzy Flag Detection
			else if (trimmedLine.startsWith('#, fuzzy') || trimmedLine.includes('fuzzy')) {
				currentMsg.fuzzy = true;
				pendingComments.push(line);
			}
			// Capture other comments (excluding obsolete markers)
			else if (trimmedLine.startsWith('#') && !trimmedLine.startsWith('#~')) {
				pendingComments.push(line);
			}
		}
		// Add final message if exists
		if (currentMsg) {
			messages.push(currentMsg);
		}
		// Store messages and metadata globally
		window.currentMessages = messages;
		window.currentMetadata = extractMetadata(poContent);
		return {
			messages: messages,
			metadata: window.currentMetadata,
			headerBlock: headerBlock
		};
	}
	/**
		* Extracts metadata from PO file headers
		* @param {string} poContent - The full PO file content
		* @returns {Object} Key-value pairs of metadata
	*/
	function extractMetadata(poContent) {
		const metadata = {};
		const headerEnd = poContent.indexOf('msgid ""');
		if (headerEnd === -1) return metadata;
		const headerSection = poContent.substring(0, headerEnd);
		const headerLines = headerSection.split('\n');
		// Parse each metadata line
		for (const line of headerLines) {
			if (line.startsWith('"')) {
				const parts = line.split(':');
				if (parts.length >= 2) {
					const key = parts[0].replace(/"/g, '').trim();
					const value = parts.slice(1).join(':').replace(/\\n/g, '').replace(/"/g, '').trim();
					if (key && value) {
						metadata[key] = value;
					}
				}
			}
		}
		return metadata;
	}
	/**
		* Generates translated PO file content from messages
		* @param {Array} messages - Message objects with translations
		* @param {Object} metadata - File metadata
		* @returns {string} Complete PO file content with translations
	*/
	function generateTranslatedPo(messages, metadata) {
		let header = window.currentHeaderBlock;
		const langCode = document.getElementById('po-manager-targetLang').value;
		header = header.replace(
			/("Language: )\w+(\\n")/,
			`$1${langCode}$2`
		);
		let output = [];
		output.push(header);
		output.push('');
		messages.forEach(msg => {
			if (msg.msgid === '') return;
			// Separate translator comments (#.) from other comments
			const translatorComments = msg.comments.filter(c => c.trim().startsWith('#.'));
			const otherComments = msg.comments.filter(c => !c.trim().startsWith('#.'));
			// Output comments in correct order: translator comments first, then references, then other comments
			translatorComments.forEach(comment => output.push(comment));
			msg.references.forEach(ref => output.push(ref));
			otherComments.forEach(comment => output.push(comment));
			if (msg.isObsolete) {
				output.push('#~ msgid "' + msg.msgid + '"');
				if (msg.hasPlural) {
					output.push('#~ msgid_plural "' + (msg.msgid_plural || '') + '"');
					if (Array.isArray(msg.msgstr)) {
						msg.msgstr.forEach((str, index) => {
							output.push('#~ msgstr[' + index + '] "' + (str || '') + '"');
						});
					}
                    } else {
					output.push('#~ msgstr "' + (msg.msgstr || '') + '"');
				}
                } else {
				output.push('msgid "' + msg.msgid + '"');
				if (msg.hasPlural) {
					output.push('msgid_plural "' + (msg.msgid_plural || '') + '"');
					if (Array.isArray(msg.msgstr)) {
						msg.msgstr.forEach((str, index) => {
							output.push('msgstr[' + index + '] "' + (str || '') + '"');
						});
					}
                    } else {
					output.push('msgstr "' + (msg.msgstr || '') + '"');
				}
			}
			if (msg.fuzzy && !msg.isObsolete) {
				output.push('#, fuzzy');
			}
			output.push('');
		});
		return output.join('\n');
	}
	/**
		* Displays extracted strings in a translation table
		* @param {Object} result - Extraction result object
		* @param {boolean} [forceRefresh=true] - Whether to force UI refresh
	*/
	function displayExtractedStrings(result, forceRefresh = true) {
		const { messages, metadata } = result;
		// Update statistics display
		sourceStats.innerHTML = `
		<p>${i18n.t('po_manager.total_strings', { count: messages.length })}</p>
		<p>${i18n.t('po_manager.translated_count', { count: messages.filter(m => m.msgstr).length })}</p>
		<p>${i18n.t('po_manager.obsolete_count', { count: messages.filter(m => m.isObsolete).length })}</p>
		`;
		// Construct table HTML structure
		let tableHTML = `
		<div class="po-manager-translation-table-container">
		<table class="po-manager-translation-table">
		<thead>
		<tr>
		<th>${i18n.t('po_manager.table_header_id')}</th>
		<th>${i18n.t('po_manager.table_header_context')}</th>
		<th>${i18n.t('po_manager.table_header_original')}</th>
		<th>${i18n.t('po_manager.table_header_plural')}</th>
		<th>${i18n.t('po_manager.table_header_translation')}</th>
		<th>${i18n.t('po_manager.table_header_plural_trans')}</th>
		<th>${i18n.t('po_manager.table_header_status')}</th>
		<th>${i18n.t('po_manager.table_header_fuzzy')}</th>
		</tr>
		</thead>
		<tbody>
		`;
		// Process each message for table rows
		messages.forEach(msg => {
			if (msg.msgid === '') return;
			const statusText = msg.msgstr ? i18n.t('po_manager.status_translated') : 
			msg.isObsolete ? i18n.t('po_manager.status_obsolete') : 
			i18n.t('po_manager.status_untranslated');
			const statusClass = msg.msgstr ? 'po-manager-translated' : 
			msg.isObsolete ? 'po-manager-obsolete' : 
			'po-manager-untranslated';
			const contextLines = [];
			msg.references.forEach(ref => {
				let cleanRef = ref.replace(/^#:\s*/, '');
				contextLines.push(`<span class="po-manager-reference">${escapeHtml(cleanRef)}</span>`);
			});
			msg.comments.forEach(comment => {
				let cleanComment = comment.replace(/^#\.?\s*/, '');
				if (comment.startsWith('#')) {
					contextLines.push(`<span class="po-manager-comment">${escapeHtml(cleanComment)}</span>`);
                    } else {
					contextLines.push(`<span class="po-manager-other-comment">${escapeHtml(cleanComment)}</span>`);
				}
			});
			const contextHtml = contextLines.join('<br>') || i18n.t('po_manager.no_context');
			const rowClass = `${statusClass} ${msg.fuzzy ? 'po-manager-fuzzy' : ''}`;
			// Handle plural forms
			let pluralTranslationsHtml = '';
			if (msg.hasPlural && Array.isArray(msg.msgstr)) {
				pluralTranslationsHtml = `<div class="po-manager-plural-translations">`;
				msg.msgstr.forEach((translation, index) => {
					let explanation = window.pluralFormsExplanations?.[index] || i18n.t('po_manager.plural_form', { index });
					// Change: Remove the prefix text for ranges
					if (explanation.startsWith('[')) {
						// Keep only the range part
						explanation = explanation;
                        } else if (explanation.includes('n=')) {
						// Keep only the n=value part
						explanation = explanation.split('n=')[1];
					}
					pluralTranslationsHtml += `
					<div class="po-manager-plural-form">
					<div class="po-manager-plural-header">
					<span class="po-manager-plural-index">[${index}]:</span>
					<span class="po-manager-plural-explanation">${escapeHtml(explanation)}</span>
					</div>
					<span class="po-manager-plural-text" contenteditable="true">${escapeHtml(translation || '')}</span>
					</div>
					`;
				});
				pluralTranslationsHtml += `</div>`;
			}
			tableHTML += `
			<tr data-id="${msg.id}" class="${rowClass}">
			<td>${msg.id}</td>
			<td class="po-manager-context-cell">${contextHtml}</td>
			<td class="po-manager-original-text">${escapeHtml(msg.msgid)}</td>
			<td class="po-manager-original-plural">${msg.hasPlural ? escapeHtml(msg.msgid_plural) : ''}</td>
			<td class="po-manager-translation-cell" contenteditable="true">${msg.hasPlural ? '' : escapeHtml(msg.msgstr)}</td>
			<td class="po-manager-plural-translations-cell">${pluralTranslationsHtml}</td>
			<td class="po-manager-status">${statusText}</td>
			<td class="po-manager-fuzzy-status">${msg.fuzzy ? i18n.t('po_manager.yes') : i18n.t('po_manager.no')}</td>
			</tr>
			`;
		});
		tableHTML += `
		</tbody>
		</table>
		</div>
		`;
		translationTableContainer.innerHTML = tableHTML;
		document.querySelectorAll('.po-manager-translation-cell').forEach(cell => {
			cell.addEventListener('blur', function() {
				const row = this.closest('tr');
				const msgId = row.dataset.id;
				const newTranslation = this.textContent;
				const message = messages.find(m => m.id === msgId);
				if (message && !message.hasPlural) {
					message.msgstr = newTranslation;
					updateRowStatus(row, newTranslation);
				}
			});
		});
		document.querySelectorAll('.po-manager-plural-text').forEach(cell => {
			cell.addEventListener('blur', function() {
				const row = this.closest('tr');
				const msgId = row.dataset.id;
				const pluralIndex = parseInt(this.closest('.po-manager-plural-form').querySelector('.po-manager-plural-index').textContent.match(/\d+/)[0]);
				const newTranslation = this.textContent;
				const message = messages.find(m => m.id === msgId);
				if (message && message.hasPlural && Array.isArray(message.msgstr)) {
					message.msgstr[pluralIndex] = newTranslation;
					updateRowStatus(row, newTranslation);
				}
			});
		});
	}
	/**
		* Updates row status based on translation content
		* @param {HTMLElement} row - Table row element
		* @param {string} translation - Current translation text
	*/
	function updateRowStatus(row, translation) {
		const statusCell = row.querySelector('.po-manager-status');
		if (translation.trim()) {
			row.classList.add('po-manager-translated');
			row.classList.remove('po-manager-untranslated');
			statusCell.textContent = i18n.t('po_manager.status_translated');
            } else {
			row.classList.add('po-manager-untranslated');
			row.classList.remove('po-manager-translated');
			statusCell.textContent = i18n.t('po_manager.status_untranslated');
		}
	}
	/**
		* Escapes HTML special characters for safe display
		* @param {string} unsafe - Raw input string
		* @returns {string} HTML-safe string
	*/
	function escapeHtml(unsafe) {
		if (!unsafe) return '';
		return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;")
		.replace(/\n/g, '<br>');
	}
	/**
		* Controls visibility of loading indicator
		* @param {boolean} show - Whether to show the indicator
	*/
	function showLoading(show) {
		loadingIndicator.style.display = show ? 'flex' : 'none';
	}
	function refreshTranslationTable() {
		if (!window.currentMessages) return;
		displayExtractedStrings({
			messages: window.currentMessages,
			metadata: window.currentMetadata
		}, true);
	}
	/**
		* Performs comprehensive analysis comparing original and translated PO files
	*/
	function performAnalysis() {
		const originalContent = sourceText.value.trim();
		const translatedContent = translatedText.value.trim();
		if (!originalContent || !translatedContent) {
			alert(i18n.t('po_manager.alert_analysis_required'));
			return;
		}
		showLoading(true);
		setTimeout(() => {
			try {
				const originalData = extractPoStrings(originalContent);
				const translatedData = extractPoStrings(translatedContent);
				const originalStats = generateStatistics(originalData.messages);
				const translatedStats = generateStatistics(translatedData.messages);
				displayAnalysisReport(originalStats, translatedStats);
				// Display modal
				modal.style.display = 'block';
                } catch (error) {
				console.error('Analysis error:', error);
				alert(i18n.t('po_manager.error_analysis') + error.message);
                } finally {
				showLoading(false);
			}
		}, 100);
	}
	/**
		* Generates statistics from PO messages
		* @param {Array} messages - Message objects
		* @returns {Object} Statistics object
	*/
	function generateStatistics(messages) {
		const stats = {
			total: 0,
			translated: 0,
			untranslated: 0,
			fuzzy: 0,
			obsolete: 0,
			withPlurals: 0,
			withContext: 0,
			charCount: 0,
			wordCount: 0
		};
		messages.forEach(msg => {
			if (msg.msgid === '') return;
			stats.total++;
			if (msg.isObsolete) {
				stats.obsolete++;
				return;
			}
			if (msg.fuzzy) stats.fuzzy++;
			if (msg.hasPlural) stats.withPlurals++;
			if (msg.references.length > 0 || msg.comments.length > 0) {
				stats.withContext++;
			}
			// Calculate translation status
			if (msg.hasPlural) {
				if (Array.isArray(msg.msgstr)) {
					const allTranslated = msg.msgstr.every(t => t && t.trim() !== '');
					if (allTranslated) {
						stats.translated++;
                        } else {
						stats.untranslated++;
					}
                    } else {
					stats.untranslated++;
				}
                } else {
				if (msg.msgstr && msg.msgstr.trim() !== '') {
					stats.translated++;
                    } else {
					stats.untranslated++;
				}
			}
			// Calculate text metrics
			const text = msg.msgid + (msg.msgid_plural || '');
			stats.charCount += text.length;
			stats.wordCount += text.split(/\s+/).filter(w => w).length;
		});
		return stats;
	}
	/**
		* Displays analysis report in modal
		* @param {Object} origStats - Original file statistics
		* @param {Object} transStats - Translated file statistics
	*/
	function displayAnalysisReport(origStats, transStats) {
		const report = document.getElementById('po-manager-analysisReport');
		if (!report) return;
		// Calculate progress percentages
		const origTranslatedPct = Math.round((origStats.translated / origStats.total) * 100);
		const transTranslatedPct = Math.round((transStats.translated / transStats.total) * 100);
		const improvementPct = transTranslatedPct - origTranslatedPct;
		const origFuzzyPct = Math.round((origStats.fuzzy / origStats.total) * 100);
		const transFuzzyPct = Math.round((transStats.fuzzy / transStats.total) * 100);
		const origUntranslatedPct = Math.round((origStats.untranslated / origStats.total) * 100);
		const transUntranslatedPct = Math.round((transStats.untranslated / transStats.total) * 100);
		// Create report HTML
		report.innerHTML = `
		<div class="po-manager-stats-grid">
		<div class="po-manager-stat-card">
		<h4>${i18n.t('po_manager.analysis_translation_progress')}</h4>
		<p><strong>${i18n.t('po_manager.analysis_original')}</strong> ${origStats.translated}/${origStats.total} (${origTranslatedPct}%)</p>
		<div class="po-manager-progress-container">
		<div class="po-manager-progress-bar" style="width:${origTranslatedPct}%">${origTranslatedPct}%</div>
		</div>
		<p><strong>${i18n.t('po_manager.analysis_translated')}</strong> ${transStats.translated}/${transStats.total} (${transTranslatedPct}%)</p>
		<div class="po-manager-progress-container">
		<div class="po-manager-progress-bar" style="width:${transTranslatedPct}%">${transTranslatedPct}%</div>
		</div>
		<p><strong>${i18n.t('po_manager.analysis_improvement')}</strong> ${improvementPct}%</p>
		</div>
		<div class="po-manager-stat-card">
		<h4>${i18n.t('po_manager.analysis_fuzzy_status')}</h4>
		<p><strong>${i18n.t('po_manager.analysis_original')}</strong> ${origStats.fuzzy} (${origFuzzyPct}%)</p>
		<p><strong>${i18n.t('po_manager.analysis_translated')}</strong> ${transStats.fuzzy} (${transFuzzyPct}%)</p>
		<p><strong>${i18n.t('po_manager.analysis_change')}</strong> ${transStats.fuzzy - origStats.fuzzy}</p>
		</div>
		<div class="po-manager-stat-card">
		<h4>${i18n.t('po_manager.analysis_untranslated')}</h4>
		<p><strong>${i18n.t('po_manager.analysis_original')}</strong> ${origStats.untranslated} (${origUntranslatedPct}%)</p>
		<p><strong>${i18n.t('po_manager.analysis_translated')}</strong> ${transStats.untranslated} (${transUntranslatedPct}%)</p>
		<p><strong>${i18n.t('po_manager.analysis_remaining')}</strong> ${transStats.untranslated}</p>
		</div>
		</div>
		<div class="po-manager-report-section">
		<h4>${i18n.t('po_manager.analysis_detailed_comparison')}</h4>
		<table class="po-manager-report-table">
		<thead>
		<tr>
		<th>${i18n.t('po_manager.analysis_metric')}</th>
		<th>${i18n.t('po_manager.analysis_original')}</th>
		<th>${i18n.t('po_manager.analysis_translated')}</th>
		<th>${i18n.t('po_manager.analysis_difference')}</th>
		</tr>
		</thead>
		<tbody>
		<tr>
		<td>${i18n.t('po_manager.analysis_total_messages')}</td>
		<td>${origStats.total}</td>
		<td>${transStats.total}</td>
		<td>${transStats.total - origStats.total}</td>
		</tr>
		<tr>
		<td>${i18n.t('po_manager.analysis_translated_messages')}</td>
		<td>${origStats.translated}</td>
		<td>${transStats.translated}</td>
		<td>${transStats.translated - origStats.translated}</td>
		</tr>
		<tr>
		<td>${i18n.t('po_manager.analysis_untranslated_messages')}</td>
		<td>${origStats.untranslated}</td>
		<td>${transStats.untranslated}</td>
		<td>${transStats.untranslated - origStats.untranslated}</td>
		</tr>
		<tr>
		<td>${i18n.t('po_manager.analysis_fuzzy_messages')}</td>
		<td>${origStats.fuzzy}</td>
		<td>${transStats.fuzzy}</td>
		<td>${transStats.fuzzy - origStats.fuzzy}</td>
		</tr>
		<tr>
		<td>${i18n.t('po_manager.analysis_obsolete_messages')}</td>
		<td>${origStats.obsolete}</td>
		<td>${transStats.obsolete}</td>
		<td>${transStats.obsolete - origStats.obsolete}</td>
		</tr>
		<tr>
		<td>${i18n.t('po_manager.analysis_plural_messages')}</td>
		<td>${origStats.withPlurals}</td>
		<td>${transStats.withPlurals}</td>
		<td>${transStats.withPlurals - origStats.withPlurals}</td>
		</tr>
		<tr>
		<td>${i18n.t('po_manager.analysis_context_messages')}</td>
		<td>${origStats.withContext}</td>
		<td>${transStats.withContext}</td>
		<td>${transStats.withContext - origStats.withContext}</td>
		</tr>
		<tr>
		<td>${i18n.t('po_manager.analysis_total_chars')}</td>
		<td>${origStats.charCount}</td>
		<td>${transStats.charCount}</td>
		<td>${transStats.charCount - origStats.charCount}</td>
		</tr>
		<tr>
		<td>${i18n.t('po_manager.analysis_total_words')}</td>
		<td>${origStats.wordCount}</td>
		<td>${transStats.wordCount}</td>
		<td>${transStats.wordCount - origStats.wordCount}</td>
		</tr>
		</tbody>
		</table>
		</div>
		<div class="po-manager-report-section">
		<h4>${i18n.t('po_manager.analysis_quality_indicators')}</h4>
		<p><strong>${i18n.t('po_manager.analysis_completeness')}</strong> ${transTranslatedPct >= 95 ? '✅ ' + i18n.t('po_manager.analysis_excellent') : transTranslatedPct >= 80 ? '⚠️ ' + i18n.t('po_manager.analysis_good') : '❌ ' + i18n.t('po_manager.analysis_needs_work')}</p>
		<p><strong>${i18n.t('po_manager.analysis_fuzzy_reduction')}</strong> ${transStats.fuzzy < origStats.fuzzy ? '✅ ' + i18n.t('po_manager.analysis_improved') : '⚠️ ' + i18n.t('po_manager.analysis_needs_attention')}</p>
		<p><strong>${i18n.t('po_manager.analysis_context_preservation')}</strong> ${transStats.withContext === origStats.withContext ? '✅ ' + i18n.t('po_manager.analysis_maintained') : '⚠️ ' + i18n.t('po_manager.analysis_changed')}</p>
		</div>
		`;
	}
});