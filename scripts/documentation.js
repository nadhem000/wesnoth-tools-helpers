// Store the documentation modal HTML as a string
window.documentationTemplate = `
    <div class="doc-modal">
        <div class="doc-modal-content">
            <div class="doc-header">
                <h2>Documentation</h2>
                <button class="doc-close-btn">&times;</button>
            </div>
            <div class="doc-container">
                <div class="doc-sidebar">
                    <ul>
                        <li><a href="#doc-intro" class="doc-nav-link active">Introduction</a></li>
                        <li><a href="#doc-features" class="doc-nav-link">Features</a></li>
                        <li><a href="#doc-usage" class="doc-nav-link">Usage Guide</a></li>
                        <li><a href="#doc-tools" class="doc-nav-link">Tools Overview</a></li>
                        <li><a href="#doc-troubleshooting" class="doc-nav-link">Troubleshooting</a></li>
                        <li><a href="#doc-contribute" class="doc-nav-link">Contribute</a></li>
                        <li><a href="#doc-faq" class="doc-nav-link">FAQ</a></li>
                    </ul>
                </div>
                <div class="doc-main">
                    <div id="doc-intro" class="doc-section active">
                        <h3>Introduction</h3>
                        <p>The Wesnoth Campaign Tools Suite is designed to help Battle for Wesnoth campaign developers create, manage, and test their campaigns more efficiently.</p>
                        <p>This suite provides specialized tools for common tasks like event extraction, story management, unit balancing, and map visualization.</p>
                        <div class="doc-info-box">
                            <h4>Key Benefits:</h4>
                            <ul>
                                <li>Streamlined workflow for campaign development</li>
                                <li>Time-saving tools for repetitive tasks</li>
                                <li>Improved consistency across scenarios</li>
                                <li>Better error detection and validation</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div id="doc-features" class="doc-section">
                        <h3>Main Features</h3>
                        <div class="doc-feature-card">
                            <div class="doc-feature-icon">📝</div>
                            <div>
                                <h4>Scenario Event & Message Extractor</h4>
                                <p>Extract and manage events and messages from your scenario files. Edit dialogues, review event structures, and export modified files.</p>
                            </div>
                        </div>
                        <div class="doc-feature-card">
                            <div class="doc-feature-icon">📚</div>
                            <div>
                                <h4>Scenario Story Extractor</h4>
                                <p>Extract and organize story content, character dialogues, and scenario information from your campaign files.</p>
                            </div>
                        </div>
                        <div class="doc-feature-card">
                            <div class="doc-feature-icon">⚖️</div>
                            <div>
                                <h4>Unit Balance Analyzer</h4>
                                <p>Analyze and compare unit statistics to ensure balanced gameplay across factions and scenarios.</p>
                            </div>
                        </div>
                        <div class="doc-feature-card">
                            <div class="doc-feature-icon">🗺️</div>
                            <div>
                                <h4>Interactive Map Viewer</h4>
                                <p>Visualize and edit your scenario maps with an interactive editor that works directly with Wesnoth map format.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div id="doc-usage" class="doc-section">
                        <h3>Usage Guide</h3>
                        <h4>Getting Started</h4>
                        <p>To begin using the tools:</p>
                        <ol>
                            <li>Navigate to the Dashboard</li>
                            <li>Select the tool you want to use from the Tools menu</li>
                            <li>Upload your scenario files or paste content directly</li>
                            <li>Process the files to extract information</li>
                            <li>Review, edit, and export your content</li>
                        </ol>
                        
                        <h4>Basic Workflow</h4>
                        <div class="doc-steps">
                            <div class="doc-step">
                                <div class="doc-step-number">1</div>
                                <p>Upload .cfg files or paste content</p>
                            </div>
                            <div class="doc-step">
                                <div class="doc-step-number">2</div>
                                <p>Click "Extract" to process content</p>
                            </div>
                            <div class="doc-step">
                                <div class="doc-step-number">3</div>
                                <p>Review extracted content</p>
                            </div>
                            <div class="doc-step">
                                <div class="doc-step-number">4</div>
                                <p>Make necessary edits</p>
                            </div>
                            <div class="doc-step">
                                <div class="doc-step-number">5</div>
                                <p>Export modified files</p>
                            </div>
                        </div>
                        
                        <div class="doc-warning">
                            <h4>Important Notes:</h4>
                            <ul>
                                <li>Always back up your files before processing</li>
                                <li>The tools preserve WML structure during editing</li>
                                <li>Complex conditionals might require manual review</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div id="doc-tools" class="doc-section">
                        <h3>Tools Overview</h3>
                        <div class="doc-tool-card">
                            <h4>Event & Message Extractor</h4>
                            <p>This tool helps you manage in-game events and dialogues. Key features:</p>
                            <ul>
                                <li>Extract all events and their messages</li>
                                <li>Edit messages directly in the interface</li>
                                <li>Preserve WML structure during editing</li>
                                <li>Export modified scenario files</li>
                                <li>Multi-file batch processing</li>
                            </ul>
                        </div>
                        
                        <div class="doc-tool-card">
                            <h4>Story Extractor</h4>
                            <p>Specialized for managing campaign narratives and dialogues:</p>
                            <ul>
                                <li>Extract story text from [story] tags</li>
                                <li>Organize dialogues by character and event</li>
                                <li>Format text with proper sentence breaks</li>
                                <li>Identify speaker information</li>
                                <li>Export story content for editing</li>
                            </ul>
                        </div>
                        
                        <div class="doc-tool-card">
                            <h4>Unit Analyzer (Coming Soon)</h4>
                            <p>Balance your faction units effectively:</p>
                            <ul>
                                <li>Compare unit stats side-by-side</li>
                                <li>Calculate combat effectiveness metrics</li>
                                <li>Identify overpowered/underpowered units</li>
                                <li>Faction balance analysis</li>
                                <li>Cost-effectiveness calculations</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div id="doc-troubleshooting" class="doc-section">
                        <h3>Troubleshooting</h3>
                        <div class="doc-issue">
                            <h4>Files not processing</h4>
                            <p>If your files aren't processing correctly:</p>
                            <ul>
                                <li>Ensure files are valid .cfg format</li>
                                <li>Check for syntax errors in your WML</li>
                                <li>Verify file encoding is UTF-8</li>
                                <li>Try with a smaller file to isolate issues</li>
                            </ul>
                        </div>
                        
                        <div class="doc-issue">
                            <h4>Missing content in extraction</h4>
                            <p>If content is missing from results:</p>
                            <ul>
                                <li>Check that events use standard [event] tags</li>
                                <li>Verify messages use [message] tags</li>
                                <li>Ensure story parts are in [story] tags</li>
                                <li>Complex conditionals might need manual extraction</li>
                            </ul>
                        </div>
                        
                        <div class="doc-contact">
                            <h4>Need more help?</h4>
                            <p>Visit our <a href="https://github.com/nadhem000/wesnoth-tools-helpers/issues" class="doc-link">GitHub Issues page</a> to report problems or ask questions.</p>
                        </div>
                    </div>
                    
                    <div id="doc-contribute" class="doc-section">
                        <h3>Contribute</h3>
                        <p>We welcome contributions to the Wesnoth Campaign Tools Suite!</p>
                        
                        <h4>How to Contribute:</h4>
                        <div class="doc-contribute-option">
                            <div class="doc-contribute-icon">🐛</div>
                            <div>
                                <h5>Report Issues</h5>
                                <p>Submit bug reports or feature requests on our <a href="https://github.com/nadhem000/wesnoth-tools-helpers/issues" class="doc-link">GitHub Issues page</a>.</p>
                            </div>
                        </div>
                        
                        <div class="doc-contribute-option">
                            <div class="doc-contribute-icon">💻</div>
                            <div>
                                <h5>Code Contributions</h5>
                                <p>Fork our <a href="https://github.com/nadhem000/wesnoth-tools-helpers" class="doc-link">GitHub repository</a> and submit pull requests.</p>
                            </div>
                        </div>
                        
                        <div class="doc-contribute-option">
                            <div class="doc-contribute-icon">🌐</div>
                            <div>
                                <h5>Translations</h5>
                                <p>Help translate the interface by contributing to our .po files.</p>
                            </div>
                        </div>
                        
                        <div class="doc-contribute-option">
                            <div class="doc-contribute-icon">📖</div>
                            <div>
                                <h5>Documentation</h5>
                                <p>Improve documentation by suggesting edits or adding examples.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div id="doc-faq" class="doc-section">
                        <h3>Frequently Asked Questions</h3>
                        
                        <div class="doc-faq-item">
                            <h4>Can I edit the extracted content?</h4>
                            <p>Yes! Both the Event Extractor and Story Extractor allow you to edit content directly in the interface before exporting.</p>
                        </div>
                        
                        <div class="doc-faq-item">
                            <h4>Does this modify my original files?</h4>
                            <p>No, the tools never modify your original files. You'll need to explicitly export any changes you make.</p>
                        </div>
                        
                        <div class="doc-faq-item">
                            <h4>What WML versions are supported?</h4>
                            <p>The tools support all modern WML versions used in Wesnoth 1.16.x and later.</p>
                        </div>
                        
                        <div class="doc-faq-item">
                            <h4>Can I use this with UMC campaigns?</h4>
                            <p>Absolutely! The tools work with both mainline and user-made campaigns.</p>
                        </div>
                        
                        <div class="doc-faq-item">
                            <h4>Is there a way to batch process multiple files?</h4>
                            <p>Yes, both extractor tools support processing multiple files at once.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

// Initialization function
window.initDocumentation = function() {
    // Create documentation container
    const docContainer = document.createElement('div');
    docContainer.id = 'documentation-container';
    docContainer.innerHTML = window.documentationTemplate;
    document.body.appendChild(docContainer);
    
    // DOM Elements
    const docModal = docContainer.querySelector('.doc-modal');
    const docCloseBtn = docContainer.querySelector('.doc-close-btn');
    const docNavLinks = docContainer.querySelectorAll('.doc-nav-link');
    const docSections = docContainer.querySelectorAll('.doc-section');
    
    // Show documentation modal
    function showDocumentation() {
        docModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    // Hide documentation modal
    function hideDocumentation() {
        docModal.style.display = 'none';
        document.body.style.overflow = ''; // Re-enable scrolling
    }
    
    // Set active section
    function setActiveSection(sectionId) {
        // Update navigation links
        docNavLinks.forEach(link => {
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Update sections
        docSections.forEach(section => {
            if (section.id === sectionId) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
    }
    
    // Event Listeners
    docCloseBtn.addEventListener('click', hideDocumentation);
    
    // Close modal when clicking outside content
    docModal.addEventListener('click', (e) => {
        if (e.target === docModal) {
            hideDocumentation();
        }
    });
    
    // Navigation link clicks
    docNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            setActiveSection(sectionId);
        });
    });
    
    // Escape key closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && docModal.style.display === 'block') {
            hideDocumentation();
        }
    });
    
    // Hook up to documentation link
    document.querySelectorAll('a[href="#documentation"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showDocumentation();
        });
    });
    
    // Return public methods
    return {
        showDocumentation,
        hideDocumentation
    };
};

// Initialize documentation on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.initDocumentation();
});