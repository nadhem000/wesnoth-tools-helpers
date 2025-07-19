// Sample data for demonstration
			const sampleUnits = [
				{
					id: "Elvish_Archer",
					name: "Elvish Archer",
					race: "elf",
					level: 1,
					cost: 17,
					hitpoints: 29,
					movement: 6,
					attacks: [
						{ name: "sword", type: "blade", range: "melee", damage: 5, number: 2 },
						{ name: "bow", type: "pierce", range: "ranged", damage: 5, number: 4 }
					],
					description: "As primarily foragers and hunters, most elves learn to become proficient archers from a young age...",
					image: "archer.png",
					status: "complete"
				},
				{
					id: "Elvish_Avenger",
					name: "Elvish Avenger",
					race: "elf",
					level: 3,
					cost: 66,
					hitpoints: 59,
					movement: 6,
					attacks: [
						{ name: "sword", type: "blade", range: "melee", damage: 8, number: 4 },
						{ name: "bow", type: "pierce", range: "ranged", damage: 11, number: 4 }
					],
					description: "The curious name of the Elvish 'Avengers' comes from a tactic often employed by these master rangers...",
					image: "avenger.png",
					status: "complete"
				},
				{
					id: "Dwarvish_Lord",
					name: "Dwarvish Lord",
					race: "dwarf",
					level: 3,
					cost: 69,
					hitpoints: 74,
					movement: 4,
					attacks: [
						{ name: "battle axe", type: "blade", range: "melee", damage: 15, number: 3 },
						{ name: "hammer", type: "impact", range: "melee", damage: 19, number: 2 },
						{ name: "hatchet", type: "blade", range: "ranged", damage: 10, number: 1 }
					],
					description: "Clad in shining armor, these dwarves look like kings from under the mountains...",
					image: "lord.png",
					status: "complete"
				},
				{
					id: "Elvish_Ranger",
					name: "Elvish Ranger",
					race: "elf",
					level: 2,
					cost: 31,
					hitpoints: 42,
					movement: 6,
					attacks: [
						{ name: "sword", type: "blade", range: "melee", damage: 7, number: 3 },
						{ name: "bow", type: "pierce", range: "ranged", damage: 7, number: 4 }
					],
					description: "The silent watchers of the forests, Elvish rangers are masters of stealth and reconnaissance...",
					image: "ranger.png",
					status: "complete"
				},
				{
					id: "Dwarvish_Steelclad",
					name: "Dwarvish Steelclad",
					race: "dwarf",
					level: 2,
					cost: 36,
					hitpoints: 57,
					movement: 4,
					attacks: [
						{ name: "battle axe", type: "blade", range: "melee", damage: 11, number: 3 },
						{ name: "hammer", type: "impact", range: "melee", damage: 14, number: 2 }
					],
					description: "Outfitted in the strongest plate and mail of Knalgan forges, the Steelclads are the vanguard of dwarvish armies...",
					image: "steelclad.png",
					status: "complete"
				},
				{
					id: "Incomplete_Warrior",
					name: "Incomplete Warrior",
					race: "unknown",
					level: 1,
					cost: 10,
					hitpoints: 20,
					movement: 5,
					attacks: [
						{ name: "fist", type: "impact", range: "melee", damage: 3, number: 1 }
					],
					description: "This unit has some missing attributes that were filled with default values",
					status: "incomplete"
				}
			];

			// Current state
			let units = [];
			let selectedEquation = "damagePerCost";
			let sortBy = "name";
			let filterFaction = "all";
			
			// DOM Elements
			const fileInput = document.getElementById('comparator-unit-file-input');
			const browseBtn = document.getElementById('comparator-unit-browse-btn');
			const dropArea = document.getElementById('comparator-unit-drop-area');
			const fileList = document.getElementById('comparator-unit-file-list');
			const compareBtn = document.getElementById('comparator-unit-compare-btn');
			const consoleElement = document.getElementById('comparator-unit-console');
			const resultsArea = document.getElementById('comparator-unit-results-area');
			const sortSelect = document.getElementById('comparator-unit-sort-by');
			const factionSelect = document.getElementById('comparator-unit-filter-faction');
			const equationOptions = document.querySelectorAll('.comparator-unit-option-card');
			const currentMetric = document.getElementById('comparator-unit-current-metric');
			const loadSamplesBtn = document.getElementById('comparator-unit-load-samples-btn');
			const removeSamplesBtn = document.getElementById('comparator-unit-remove-samples-btn');
			
			// Initialize
			function init() {
				// Add event listeners
				browseBtn.addEventListener('click', () => fileInput.click());
				fileInput.addEventListener('change', handleFileSelect);
				
				dropArea.addEventListener('dragover', (e) => {
					e.preventDefault();
					e.stopPropagation();
					dropArea.classList.add('active');
					dropArea.classList.add('pulse');
				});
				
				dropArea.addEventListener('dragleave', () => {
					dropArea.classList.remove('active');
					dropArea.classList.remove('pulse');
				});
				
				dropArea.addEventListener('drop', (e) => {
					e.preventDefault();
					e.stopPropagation();
					dropArea.classList.remove('active');
					dropArea.classList.remove('pulse');
					
					const files = e.dataTransfer.files;
					handleFiles(files);
				});
				
				compareBtn.addEventListener('click', compareUnits);
				sortSelect.addEventListener('change', () => {
					sortBy = sortSelect.value;
					renderComparisonTable();
				});
				factionSelect.addEventListener('change', () => {
					filterFaction = factionSelect.value;
					renderComparisonTable();
				});
				
				equationOptions.forEach(option => {
					option.addEventListener('click', () => {
						equationOptions.forEach(opt => opt.classList.remove('selected'));
						option.classList.add('selected');
						selectedEquation = option.dataset.equation;
						currentMetric.textContent = `${i18n.t('comparator_unit.current_metric')}: ${option.querySelector('h3').textContent}`;
						renderComparisonTable();
					});
				});
				
				// Add event listeners for sample buttons
				loadSamplesBtn.addEventListener('click', loadSampleUnits);
				removeSamplesBtn.addEventListener('click', removeAllUnits);
				
				// Log initialization
				logToConsole(i18n.t('comparator_unit.log_initialized'), "info");
			}
			
			// Load sample units
			function loadSampleUnits() {
				if (units.length > 0) {
					logToConsole(i18n.t('comparator_unit.log_samples_exists'), "error");
					return;
				}
				
				units = [...sampleUnits];
				updateFileList();
				renderComparisonTable();
				logToConsole(i18n.t('comparator_unit.log_samples_loaded'), "success");
				logToConsole(i18n.t('comparator_unit.log_incomplete_warning'), "warning");
				logToConsole(i18n.t('comparator_unit.log_compare_hint'), "info");
			}
			
			// Remove all units
			function removeAllUnits() {
				if (units.length === 0) {
					logToConsole(i18n.t('comparator_unit.log_nothing_to_remove'), "info");
					return;
				}
				
				units = [];
				updateFileList();
				renderComparisonTable();
				logToConsole(i18n.t('comparator_unit.log_all_removed'), "success");
			}
			
			// Handle file selection
			function handleFileSelect(e) {
				const files = e.target.files;
				handleFiles(files);
			}
			
			// Process uploaded files
			function handleFiles(files) {
				if (!files.length) return;
				
				for (let i = 0; i < files.length; i++) {
					const file = files[i];
					if (file.name.endsWith('.cfg')) {
						processFile(file);
					} else {
						logToConsole(`${i18n.t('comparator_unit.log_skipped_file')} ${file.name}: ${i18n.t('comparator_unit.log_invalid_format')}`, "error");
					}
				}
			}
			
			// Robust WML parser with error handling
			function parseUnitFromWML(content, filename) {
				try {
					const unit = {
						id: "",
						name: "",
						race: "unknown",
						level: 1,
						cost: 0,
						hitpoints: 1,
						movement: 3,
						attacks: [],
						status: "complete",
						warnings: []
					};

					// Extract ID
					const idMatch = content.match(/id\s*=\s*"([^"]+)"/);
					if (idMatch) {
						unit.id = idMatch[1].replace(/\s+/g, '_');
					} else {
						// Generate ID from filename if missing
						unit.id = filename.replace('.cfg', '').replace(/\s+/g, '_');
						unit.warnings.push(i18n.t('comparator_unit.parse_id_warning'));
					}
					
					// Extract name
					const nameMatch = content.match(/name\s*=\s*_?\s*"([^"]+)"/);
					if (nameMatch) {
						unit.name = nameMatch[1];
					} else {
						unit.name = unit.id.replace(/_/g, ' ');
						unit.warnings.push(i18n.t('comparator_unit.parse_name_warning'));
					}

					// Extract race
					const raceMatch = content.match(/race\s*=\s*"([^"]+)"/);
					if (raceMatch) {
						unit.race = raceMatch[1];
					} else {
						unit.warnings.push(i18n.t('comparator_unit.parse_race_warning'));
					}

					// Extract numeric values with fallbacks
					unit.level = extractNumber(content, "level", 1);
					unit.cost = extractNumber(content, "cost", 0);
					unit.hitpoints = extractNumber(content, "hitpoints", 1);
					unit.movement = extractNumber(content, "movement", 3);

					// Validate critical values
					if (unit.hitpoints <= 0) {
						unit.hitpoints = 1;
						unit.warnings.push(i18n.t('comparator_unit.parse_hp_warning'));
					}
					if (unit.movement <= 0) {
						unit.movement = 3;
						unit.warnings.push(i18n.t('comparator_unit.parse_move_warning'));
					}

					// Extract attacks
					const attackBlocks = content.match(/\[attack\][\s\S]*?\[\/attack\]/g) || [];
					attackBlocks.forEach(block => {
						try {
							const attack = {
								name: extractString(block, "name", "unknown"),
								type: extractString(block, "type", "impact"),
								range: extractString(block, "range", "melee"),
								damage: extractNumber(block, "damage", 0),
								number: extractNumber(block, "number", 0)
							};
							
							// Validate attack
							if (attack.damage <= 0) {
								attack.damage = 1;
								unit.warnings.push(`${i18n.t('comparator_unit.parse_attack_damage')} ${attack.name}`);
							}
							if (attack.number <= 0) {
								attack.number = 1;
								unit.warnings.push(`${i18n.t('comparator_unit.parse_attack_number')} ${attack.name}`);
							}
							
							if (attack.damage > 0 && attack.number > 0) {
								unit.attacks.push(attack);
							}
						} catch (e) {
							unit.warnings.push(`${i18n.t('comparator_unit.parse_attack_error')}: ${e.message}`);
						}
					});

					// Add default attack if none found
					if (unit.attacks.length === 0) {
						unit.attacks.push({
							name: "fist",
							type: "impact",
							range: "melee",
							damage: 1,
							number: 1
						});
						unit.warnings.push(i18n.t('comparator_unit.parse_default_attack'));
					}

					// Mark as incomplete if any warnings
					if (unit.warnings.length > 0) {
						unit.status = "incomplete";
					}

					return unit;
				} catch (e) {
					logToConsole(`${i18n.t('comparator_unit.parse_error')} ${filename}: ${e.message}`, "error");
					return null;
				}
			}

			function extractNumber(text, key, defaultValue) {
				const match = text.match(new RegExp(`${key}\\s*=\\s*(\\d+)`));
				return match ? parseInt(match[1], 10) : defaultValue;
			}

			function extractString(text, key, defaultValue) {
				const match = text.match(new RegExp(`${key}\\s*=\\s*"([^"]*)"`));
				return match ? match[1] : defaultValue;
			}

			// Process a single file
			function processFile(file) {
				logToConsole(`${i18n.t('comparator_unit.processing_file')}: ${file.name}`, "info");
				
				const reader = new FileReader();
				reader.onload = (e) => {
					try {
						const content = e.target.result;
						const unit = parseUnitFromWML(content, file.name);
						
						if (unit) {
							// Check if unit already exists
							if (units.some(u => u.id === unit.id)) {
								logToConsole(`${i18n.t('comparator_unit.unit_exists')} ${unit.name}`, "error");
							} else {
								units.push(unit);
								logToConsole(`${i18n.t('comparator_unit.unit_added')}: ${unit.name} (${unit.id})`, "success");
								
								// Log any warnings from parsing
								if (unit.warnings.length > 0) {
									logToConsole(`${i18n.t('comparator_unit.unit_warnings')} ${unit.warnings.length}:`, "warning");
									unit.warnings.forEach(warning => {
										logToConsole(`- ${warning}`, "warning");
									});
								}
							}
						} else {
							logToConsole(`${i18n.t('comparator_unit.parse_failed')}: ${file.name}`, "error");
						}
						
						updateFileList();
						renderComparisonTable();
					} catch (error) {
						logToConsole(`${i18n.t('comparator_unit.processing_error')} ${file.name}: ${error.message}`, "error");
					}
				};
				reader.onerror = () => {
					logToConsole(`${i18n.t('comparator_unit.read_error')}: ${file.name}`, "error");
				};
				reader.readAsText(file);
			}

			// Update file list display
			function updateFileList() {
				fileList.innerHTML = '';
				
				if (units.length === 0) {
					fileList.innerHTML = `<p>${i18n.t('comparator_unit.no_files')}</p>`;
					return;
				}
				
				units.forEach(unit => {
					const fileItem = document.createElement('div');
					fileItem.className = 'comparator-unit-file-item';
					
					const statusClass = unit.status === "complete" ? "comparator-unit-status-good" : 
									unit.status === "incomplete" ? "comparator-unit-status-warning" : "comparator-unit-status-error";
					
					fileItem.innerHTML = `
						<div class="comparator-unit-file-name">
							<span class="comparator-unit-status-indicator ${statusClass}"></span>
							${unit.id}.cfg
						</div>
						<div class="comparator-unit-file-actions">
							<div class="comparator-unit-remove-btn" data-id="${unit.id}">
								<svg width="12" height="12" viewBox="0 0 24 24">
									<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="white"/>
								</svg>
							</div>
						</div>
					`;
					
					if (unit.warnings.length > 0) {
						const warningText = document.createElement('div');
						warningText.className = 'comparator-unit-file-status';
						warningText.innerHTML = `${unit.warnings.length} ${i18n.t('comparator_unit.unit_issues')}`;
						fileItem.appendChild(warningText);
					}
					
					fileList.appendChild(fileItem);
				});
				
				// Add remove event listeners
				document.querySelectorAll('.comparator-unit-remove-btn').forEach(btn => {
					btn.addEventListener('click', (e) => {
						const id = e.currentTarget.dataset.id;
						removeUnit(id);
					});
				});
			}
			
			// Remove a unit
			function removeUnit(id) {
				const unit = units.find(u => u.id === id);
				units = units.filter(unit => unit.id !== id);
				updateFileList();
				renderComparisonTable();
				logToConsole(`${i18n.t('comparator_unit.unit_removed')}: ${unit ? unit.name : id}`, "info");
			}
			
			// Compare units based on selected equation
			function compareUnits() {
				if (units.length === 0) {
					logToConsole(i18n.t('comparator_unit.error_no_units'), "error");
					return;
				}
				
				if (units.length === 1) {
					logToConsole(i18n.t('comparator_unit.error_one_unit'), "error");
					return;
				}
				
				logToConsole(i18n.t('comparator_unit.comparing_units'), "info");
				renderComparisonTable();
			}
			
			// Calculate metric based on selected equation
			function calculateMetric(unit) {
				switch(selectedEquation) {
					case "damagePerCost":
						const totalDamage = unit.attacks.reduce((sum, attack) => sum + (attack.damage * attack.number), 0);
						return unit.cost > 0 ? (totalDamage / unit.cost).toFixed(2) : 0;
						
					case "hpPerCost":
						return unit.cost > 0 ? (unit.hitpoints / unit.cost).toFixed(2) : 0;
						
					case "totalDamage":
						return unit.attacks.reduce((sum, attack) => sum + (attack.damage * attack.number), 0);
						
					case "efficiency":
						const avgDamage = unit.attacks.reduce((sum, attack) => sum + attack.damage, 0) / unit.attacks.length;
						return unit.cost > 0 ? ((unit.hitpoints * avgDamage) / unit.cost).toFixed(2) : 0;
						
					case "meleeEffectiveness":
						const meleeAttacks = unit.attacks.filter(a => a.range === "melee");
						const meleeDamage = meleeAttacks.reduce((sum, attack) => sum + (attack.damage * attack.number), 0);
						return (meleeDamage * unit.movement).toFixed(1);
						
					case "rangedEffectiveness":
						const rangedAttacks = unit.attacks.filter(a => a.range === "ranged");
						const rangedDamage = rangedAttacks.reduce((sum, attack) => sum + (attack.damage * attack.number), 0);
						return (rangedDamage * unit.movement).toFixed(1);
						
					default:
						return 0;
				}
			}
			
			// Render comparison table
			function renderComparisonTable() {
				if (units.length === 0) {
					resultsArea.innerHTML = `
						<div class="comparator-unit-empty-state">
							<svg class="comparator-unit-empty-state-icon" viewBox="0 0 24 24">
								<path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
							</svg>
							<h2>${i18n.t('comparator_unit.empty_title')}</h2>
							<p>${i18n.t('comparator_unit.empty_desc')}</p>
						</div>
					`;
					return;
				}
				
				// Filter units by faction
				let filteredUnits = [...units];
				if (filterFaction !== "all") {
					filteredUnits = filteredUnits.filter(unit => 
						filterFaction === "unknown" ? unit.race === "unknown" : unit.race === filterFaction
					);
				}
				
				if (filteredUnits.length === 0) {
					resultsArea.innerHTML = `
						<div class="comparator-unit-empty-state">
							<svg class="comparator-unit-empty-state-icon" viewBox="0 0 24 24">
								<path d="M10 18h5V5h-5v13zm-6 0h5V5H4v13zM16 5v13h5V5h-5z"/>
							</svg>
							<h2>${i18n.t('comparator_unit.filter_empty_title')}</h2>
							<p>${i18n.t('comparator_unit.filter_empty_desc')}</p>
						</div>
					`;
					return;
				}
				
				// Sort units
				filteredUnits.sort((a, b) => {
					switch(sortBy) {
						case "name": return a.name.localeCompare(b.name);
						case "cost": return a.cost - b.cost;
						case "hp": return b.hitpoints - a.hitpoints;
						case "movement": return b.movement - a.movement;
						case "damage": 
							const aDamage = a.attacks.reduce((sum, atk) => sum + (atk.damage * atk.number), 0);
							const bDamage = b.attacks.reduce((sum, atk) => sum + (atk.damage * atk.number), 0);
							return bDamage - aDamage;
						case "level": return b.level - a.level;
						case "metric": 
							const aMetric = parseFloat(calculateMetric(a));
							const bMetric = parseFloat(calculateMetric(b));
							return bMetric - aMetric;
						default: return 0;
					}
				});
				
				// Find max values for scaling
				const maxCost = Math.max(...filteredUnits.map(u => u.cost), 1);
				const maxHP = Math.max(...filteredUnits.map(u => u.hitpoints), 1);
				const maxMovement = Math.max(...filteredUnits.map(u => u.movement), 1);
				const maxDamage = Math.max(...filteredUnits.map(u => 
					u.attacks.reduce((sum, atk) => sum + (atk.damage * atk.number), 0)
				), 1);
				
				// Generate table HTML
				let tableHTML = `
					<table class="comparator-unit-comparison-table">
						<thead>
							<tr>
								<th>${i18n.t('comparator_unit.table_unit')}</th>
								<th>${i18n.t('comparator_unit.table_level')} ${sortBy === 'level' ? '▼' : ''}</th>
								<th>${i18n.t('comparator_unit.table_cost')} ${sortBy === 'cost' ? '▼' : ''}</th>
								<th>${i18n.t('comparator_unit.table_hp')} ${sortBy === 'hp' ? '▼' : ''}</th>
								<th>${i18n.t('comparator_unit.table_move')} ${sortBy === 'movement' ? '▼' : ''}</th>
								<th>${i18n.t('comparator_unit.table_attacks')}</th>
								<th>${document.querySelector('.comparator-unit-option-card.selected h3').textContent}</th>
							</tr>
						</thead>
						<tbody>
				`;
				
				filteredUnits.forEach(unit => {
					const totalDamage = unit.attacks.reduce((sum, atk) => sum + (atk.damage * atk.number), 0);
					const metricValue = calculateMetric(unit);
					const statusClass = unit.status === "complete" ? "" : "incomplete-unit";
					
					tableHTML += `
						<tr class="${statusClass}">
							<td>
								<div class="comparator-unit-name">${unit.name}</div>
								<div class="comparator-unit-id">${unit.id}</div>
								${unit.status !== "complete" ? 
									`<div class="comparator-unit-unit-status">⚠️ ${i18n.t('comparator_unit.table_incomplete')}</div>` : ''}
							</td>
							<td class="comparator-unit-stat-value">${unit.level}</td>
							<td>
								<div class="comparator-unit-stat-value">${unit.cost}</div>
								<div class="comparator-unit-stat-bar">
									<div class="comparator-unit-stat-bar-fill" style="width: ${(unit.cost / maxCost) * 100}%"></div>
								</div>
							</td>
							<td>
								<div class="comparator-unit-stat-value">${unit.hitpoints}</div>
								<div class="comparator-unit-stat-bar">
									<div class="comparator-unit-stat-bar-fill" style="width: ${(unit.hitpoints / maxHP) * 100}%"></div>
								</div>
							</td>
							<td>
								<div class="comparator-unit-stat-value">${unit.movement}</div>
								<div class="comparator-unit-stat-bar">
									<div class="comparator-unit-stat-bar-fill" style="width: ${(unit.movement / maxMovement) * 100}%"></div>
								</div>
							</td>
							<td>
								${unit.attacks.map(atk => `
									<div class="comparator-unit-damage-cell">
										<div>${atk.damage} × ${atk.number}</div>
										<div class="comparator-unit-damage-type">${atk.name} (${atk.range})</div>
									</div>
								`).join('')}
							</td>
							<td class="comparator-unit-stat-value">${metricValue}</td>
						</tr>
					`;
				});
				
				tableHTML += `
						</tbody>
					</table>
				`;
				
				resultsArea.innerHTML = tableHTML;
				
				// Add status styling for incomplete units
				const style = document.createElement('style');
				style.innerHTML = `
					.incomplete-unit {
						position: relative;
					}
					.incomplete-unit::after {
						content: "";
						position: absolute;
						top: 0;
						left: 0;
						right: 0;
						bottom: 0;
						background: repeating-linear-gradient(
							45deg,
							rgba(255, 152, 0, 0.05),
							rgba(255, 152, 0, 0.05) 10px,
							rgba(255, 152, 0, 0.1) 10px,
							rgba(255, 152, 0, 0.1) 20px
						);
						pointer-events: none;
						z-index: 1;
					}
					.comparator-unit-unit-status {
						font-size: 0.8rem;
						color: #ff9800;
						margin-top: 5px;
						display: flex;
						align-items: center;
						gap: 5px;
					}
				`;
				resultsArea.appendChild(style);
			}
			
			// Log messages to console
			function logToConsole(message, type = "info") {
				let iconPath = '';
				
				switch(type) {
					case "error":
						iconPath = '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>';
						break;
					case "success":
						iconPath = '<path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>';
						break;
					case "warning":
						iconPath = '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>';
						break;
					default: // info
						iconPath = '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>';
				}
				
				const entry = document.createElement('div');
				entry.className = `comparator-unit-log-entry ${type}`;
				entry.innerHTML = `
					<svg class="comparator-unit-log-entry-icon" viewBox="0 0 24 24">
						${iconPath}
					</svg>
					<div>${message}</div>
				`;
				
				consoleElement.appendChild(entry);
				consoleElement.scrollTop = consoleElement.scrollHeight;
			}
			
			// Initialize the application
			init();