window.documentationTemplate = `
    <div class="doc-modal">
        <div class="doc-modal-content">
            <div class="doc-header">
                <h2 data-i18n="documentation.title">Documentation</h2>
                <button class="doc-close-btn">&times;</button>
            </div>
            <div class="doc-container">
                <div class="doc-sidebar">
                    <ul>
                        <li><a href="#doc-intro" class="doc-nav-link active" data-i18n="documentation.nav.intro">Introduction</a></li>
                        <li><a href="#doc-features" class="doc-nav-link" data-i18n="documentation.nav.features">Features</a></li>
                        <li><a href="#doc-usage" class="doc-nav-link" data-i18n="documentation.nav.usage">Usage Guide</a></li>
                        <li><a href="#doc-tools" class="doc-nav-link" data-i18n="documentation.nav.tools">Tools Overview</a></li>
                        <li><a href="#doc-troubleshooting" class="doc-nav-link" data-i18n="documentation.nav.troubleshooting">Troubleshooting</a></li>
                        <li><a href="#doc-contribute" class="doc-nav-link" data-i18n="documentation.nav.contribute">Contribute</a></li>
                        <li><a href="#doc-faq" class="doc-nav-link" data-i18n="documentation.nav.faq">FAQ</a></li>
                    </ul>
                </div>
                <div class="doc-main">
                    <div id="doc-intro" class="doc-section active">
                        <h3 data-i18n="documentation.intro.title">Introduction</h3>
                        <p data-i18n="documentation.intro.p1">The Wesnoth Campaign Tools Suite is designed to help Battle for Wesnoth campaign developers create, manage, and test their campaigns more efficiently.</p>
                        <p data-i18n="documentation.intro.p2">This suite provides specialized tools for common tasks like event extraction, story management, unit balancing, and map visualization.</p>
                        <div class="doc-info-box">
                            <h4 data-i18n="documentation.intro.benefits">Key Benefits:</h4>
                            <ul>
                                <li data-i18n="documentation.intro.benefit1">Streamlined workflow for campaign development</li>
                                <li data-i18n="documentation.intro.benefit2">Time-saving tools for repetitive tasks</li>
                                <li data-i18n="documentation.intro.benefit3">Improved consistency across scenarios</li>
                                <li data-i18n="documentation.intro.benefit4">Better error detection and validation</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div id="doc-features" class="doc-section">
                        <h3 data-i18n="documentation.features.title">Main Features</h3>
                        <div class="doc-feature-card">
                            <div class="doc-feature-icon">📝</div>
                            <div>
                                <h4 data-i18n="documentation.features.extractor">Scenario Event & Message Extractor</h4>
                                <p data-i18n="documentation.features.extractor_desc">Extract and manage events and messages from your scenario files. Edit dialogues, review event structures, and export modified files.</p>
                            </div>
                        </div>
                        <div class="doc-feature-card">
                            <div class="doc-feature-icon">📖</div>
                            <div>
                                <h4 data-i18n="documentation.features.story_extractor">Scenario Story Extractor</h4>
                                <p data-i18n="documentation.features.story_extractor_desc">Extract and organize story content, character dialogues, and scenario information from your campaign files.</p>
                            </div>
                        </div>
                        <div class="doc-feature-card">
                            <div class="doc-feature-icon">⚖️</div>
                            <div>
                                <h4 data-i18n="documentation.features.unit_analyzer">Unit Balance Analyzer</h4>
                                <p data-i18n="documentation.features.unit_analyzer_desc">Analyze and compare unit statistics to ensure balanced gameplay across factions and scenarios.</p>
                            </div>
                        </div>
                        <div class="doc-feature-card">
                            <div class="doc-feature-icon">🗺️</div>
                            <div>
                                <h4 data-i18n="documentation.features.map_viewer">Interactive Map Viewer</h4>
                                <p data-i18n="documentation.features.map_viewer_desc">Visualize and edit your scenario maps with an interactive editor that works directly with Wesnoth map format.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div id="doc-usage" class="doc-section">
                        <h3 data-i18n="documentation.usage.title">Usage Guide</h3>
                        <h4 data-i18n="documentation.usage.getting_started">Getting Started</h4>
                        <p data-i18n="documentation.usage.p1">To begin using the tools:</p>
                        <ol>
                            <li data-i18n="documentation.usage.li1">Navigate to the Dashboard</li>
                            <li data-i18n="documentation.usage.li2">Select the tool you want to use from the Tools menu</li>
                            <li data-i18n="documentation.usage.li3">Upload your scenario files or paste content directly</li>
                            <li data-i18n="documentation.usage.li4">Process the files to extract information</li>
                            <li data-i18n="documentation.usage.li5">Review, edit, and export your content</li>
                        </ol>
                        
                        <h4 data-i18n="documentation.usage.basic_workflow">Basic Workflow</h4>
                        <ol>
                            <li data-i18n="documentation.usage.step1">Upload .cfg files or paste content</li>
                            <li data-i18n="documentation.usage.step2">Click \"Extract\" to process content</li>
                            <li data-i18n="documentation.usage.step3">Review extracted content</li>
                            <li data-i18n="documentation.usage.step4">Make necessary edits</li>
                            <li data-i18n="documentation.usage.step5">Export modified files</li>
                        </ol>
                        
                        <div class="doc-warning-box">
                            <h4 data-i18n="documentation.usage.important_notes">Important Notes:</h4>
                            <ul>
                                <li data-i18n="documentation.usage.note1">Always back up your files before processing</li>
                                <li data-i18n="documentation.usage.note2">The tools preserve WML structure during editing</li>
                                <li data-i18n="documentation.usage.note3">Complex conditionals might require manual review</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div id="doc-tools" class="doc-section">
                        <h3 data-i18n="documentation.tools.title">Tools Overview</h3>
                        
                        <div class="doc-tool-card">
                            <h4 data-i18n="documentation.tools.extractor">Event & Message Extractor</h4>
                            <p data-i18n="documentation.tools.extractor_desc">This tool helps you manage in-game events and dialogues. Key features:</p>
                            <ul>
                                <li data-i18n="documentation.tools.extractor_feature1">Extract all events and their messages</li>
                                <li data-i18n="documentation.tools.extractor_feature2">Edit messages directly in the interface</li>
                                <li data-i18n="documentation.tools.extractor_feature3">Preserve WML structure during editing</li>
                                <li data-i18n="documentation.tools.extractor_feature4">Export modified scenario files</li>
                                <li data-i18n="documentation.tools.extractor_feature5">Multi-file batch processing</li>
                            </ul>
                        </div>
                        
                        <div class="doc-tool-card">
                            <h4 data-i18n="documentation.tools.story_extractor">Story Extractor</h4>
                            <p data-i18n="documentation.tools.story_extractor_desc">Specialized for managing campaign narratives and dialogues:</p>
                            <ul>
                                <li data-i18n="documentation.tools.story_extractor_feature1">Extract story text from [story] tags</li>
                                <li data-i18n="documentation.tools.story_extractor_feature2">Organize dialogues by character and event</li>
                                <li data-i18n="documentation.tools.story_extractor_feature3">Format text with proper sentence breaks</li>
                                <li data-i18n="documentation.tools.story_extractor_feature4">Identify speaker information</li>
                                <li data-i18n="documentation.tools.story_extractor_feature5">Export story content for editing</li>
                            </ul>
                        </div>
                        
                        <div class="doc-tool-card">
                            <h4 data-i18n="documentation.tools.unit_analyzer">Unit Analyzer (Coming Soon)</h4>
                            <p data-i18n="documentation.tools.unit_analyzer_desc">Balance your faction units effectively:</p>
                            <ul>
                                <li data-i18n="documentation.tools.unit_analyzer_feature1">Compare unit stats side-by-side</li>
                                <li data-i18n="documentation.tools.unit_analyzer_feature2">Calculate combat effectiveness metrics</li>
                                <li data-i18n="documentation.tools.unit_analyzer_feature3">Identify overpowered/underpowered units</li>
                                <li data-i18n="documentation.tools.unit_analyzer_feature4">Faction balance analysis</li>
                                <li data-i18n="documentation.tools.unit_analyzer_feature5">Cost-effectiveness calculations</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div id="doc-troubleshooting" class="doc-section">
                        <h3 data-i18n="documentation.troubleshooting.title">Troubleshooting</h3>
                        
                        <div class="doc-issue-card">
                            <h4 data-i18n="documentation.troubleshooting.issue1_title">Files not processing</h4>
                            <p data-i18n="documentation.troubleshooting.issue1_p">If your files aren't processing correctly:</p>
                            <ul>
                                <li data-i18n="documentation.troubleshooting.issue1_li1">Ensure files are valid .cfg format</li>
                                <li data-i18n="documentation.troubleshooting.issue1_li2">Check for syntax errors in your WML</li>
                                <li data-i18n="documentation.troubleshooting.issue1_li3">Verify file encoding is UTF-8</li>
                                <li data-i18n="documentation.troubleshooting.issue1_li4">Try with a smaller file to isolate issues</li>
                            </ul>
                        </div>
                        
                        <div class="doc-issue-card">
                            <h4 data-i18n="documentation.troubleshooting.issue2_title">Missing content in extraction</h4>
                            <p data-i18n="documentation.troubleshooting.issue2_p">If content is missing from results:</p>
                            <ul>
                                <li data-i18n="documentation.troubleshooting.issue2_li1">Check that events use standard [event] tags</li>
                                <li data-i18n="documentation.troubleshooting.issue2_li2">Verify messages use [message] tags</li>
                                <li data-i18n="documentation.troubleshooting.issue2_li3">Ensure story parts are in [story] tags</li>
                                <li data-i18n="documentation.troubleshooting.issue2_li4">Complex conditionals might need manual extraction</li>
                            </ul>
                        </div>
                        
                        <div class="doc-contact-card">
                            <h4 data-i18n="documentation.troubleshooting.contact_title">Need more help?</h4>
                            <p>
                                <span data-i18n="documentation.troubleshooting.contact_p1">Visit our</span>
                                <a href="https://github.com/nadhem000/wesnoth-tools-helpers/issues" data-i18n="documentation.troubleshooting.contact_link">GitHub Issues page</a>
                                <span data-i18n="documentation.troubleshooting.contact_p2">to report problems or ask questions.</span>
                            </p>
                        </div>
                    </div>
                    
                    <div id="doc-contribute" class="doc-section">
                        <h3 data-i18n="documentation.contribute.title">Contribute</h3>
                        <p data-i18n="documentation.contribute.p1">We welcome contributions to the Wesnoth Campaign Tools Suite!</p>
                        
                        <h4 data-i18n="documentation.contribute.how_to">How to Contribute:</h4>
                        
                        <div class="doc-contribute-card">
                            <h4 data-i18n="documentation.contribute.option1_title">Report Issues</h4>
                            <p>
                                <span data-i18n="documentation.contribute.option1_desc1">Submit bug reports or feature requests on our</span>
                                <a href="https://github.com/nadhem000/wesnoth-tools-helpers/issues" data-i18n="documentation.contribute.option1_link">GitHub Issues page</a>
                                <span data-i18n="documentation.contribute.option1_desc2">.</span>
                            </p>
                        </div>
                        
                        <div class="doc-contribute-card">
                            <h4 data-i18n="documentation.contribute.option2_title">Code Contributions</h4>
                            <p>
                                <span data-i18n="documentation.contribute.option2_desc1">Fork our</span>
                                <a href="https://github.com/nadhem000/wesnoth-tools-helpers" data-i18n="documentation.contribute.option2_link">GitHub repository</a>
                                <span data-i18n="documentation.contribute.option2_desc2">and submit pull requests.</span>
                            </p>
                        </div>
                        
                        <div class="doc-contribute-card">
                            <h4 data-i18n="documentation.contribute.option3_title">Translations</h4>
                            <p data-i18n="documentation.contribute.option3_desc">Help translate the interface by contributing to our .po files.</p>
                        </div>
                        
                        <div class="doc-contribute-card">
                            <h4 data-i18n="documentation.contribute.option4_title">Documentation</h4>
                            <p data-i18n="documentation.contribute.option4_desc">Improve documentation by suggesting edits or adding examples.</p>
                        </div>
                    </div>
                    
                    <div id="doc-faq" class="doc-section">
                        <h3 data-i18n="documentation.faq.title">Frequently Asked Questions</h3>
                        
                        <div class="doc-faq-item">
                            <h4 data-i18n="documentation.faq.q1">Can I edit the extracted content?</h4>
                            <p data-i18n="documentation.faq.a1">Yes! Both the Event Extractor and Story Extractor allow you to edit content directly in the interface before exporting.</p>
                        </div>
                        
                        <div class="doc-faq-item">
                            <h4 data-i18n="documentation.faq.q2">Does this modify my original files?</h4>
                            <p data-i18n="documentation.faq.a2">No, the tools never modify your original files. You'll need to explicitly export any changes you make.</p>
                        </div>
                        
                        <div class="doc-faq-item">
                            <h4 data-i18n="documentation.faq.q3">What WML versions are supported?</h4>
                            <p data-i18n="documentation.faq.a3">The tools support all modern WML versions used in Wesnoth 1.16.x and later.</p>
                        </div>
                        
                        <div class="doc-faq-item">
                            <h4 data-i18n="documentation.faq.q4">Can I use this with UMC campaigns?</h4>
                            <p data-i18n="documentation.faq.a4">Absolutely! The tools work with both mainline and user-made campaigns.</p>
                        </div>
                        
                        <div class="doc-faq-item">
                            <h4 data-i18n="documentation.faq.q5">Is there a way to batch process multiple files?</h4>
                            <p data-i18n="documentation.faq.a5">Yes, both extractor tools support processing multiple files at once.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

// Translation function
window._ = function(key) {
    return window.i18nStrings[key] || key;
};

// Initialize documentation with translations
window.initDocumentation = function() {
    const docContainer = document.createElement('div');
    docContainer.id = 'documentation-container';
    docContainer.innerHTML = window.documentationTemplate;
    document.body.appendChild(docContainer);
    
    // Apply translations
    const translatableElements = docContainer.querySelectorAll('[data-i18n]');
    translatableElements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key) {
            el.textContent = window._(key);
            
            // Handle placeholders in attributes
            if (el.hasAttribute('data-i18n-placeholder')) {
                const placeholderKey = el.getAttribute('data-i18n-placeholder');
                el.setAttribute('placeholder', window._(placeholderKey));
            }
        }
    });
    
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
    
    // Return public methods
    return {
        showDocumentation,
        hideDocumentation
    };
};


// Add embedded English translations
const embeddedTranslations = {
  en: {
    "documentation.title": "Documentation",
    "documentation.nav.intro": "Introduction",
    "documentation.nav.features": "Features",
    "documentation.nav.usage": "Usage Guide",
    "documentation.nav.tools": "Tools Overview",
    "documentation.nav.troubleshooting": "Troubleshooting",
    "documentation.nav.contribute": "Contribute",
    "documentation.nav.faq": "FAQ",
    
    "documentation.intro.title": "Introduction",
    "documentation.intro.p1": "The Wesnoth Campaign Tools Suite is designed to help Battle for Wesnoth campaign developers create, manage, and test their campaigns more efficiently.",
    "documentation.intro.p2": "This suite provides specialized tools for common tasks like event extraction, story management, unit balancing, and map visualization.",
    "documentation.intro.benefits": "Key Benefits:",
    "documentation.intro.benefit1": "Streamlined workflow for campaign development",
    "documentation.intro.benefit2": "Time-saving tools for repetitive tasks",
    "documentation.intro.benefit3": "Improved consistency across scenarios",
    "documentation.intro.benefit4": "Better error detection and validation",
    
    "documentation.features.title": "Main Features",
    "documentation.features.extractor": "Scenario Event & Message Extractor",
    "documentation.features.extractor_desc": "Extract and manage events and messages from your scenario files. Edit dialogues, review event structures, and export modified files.",
    "documentation.features.story_extractor": "Scenario Story Extractor",
    "documentation.features.story_extractor_desc": "Extract and organize story content, character dialogues, and scenario information from your campaign files.",
    "documentation.features.unit_analyzer": "Unit Balance Analyzer",
    "documentation.features.unit_analyzer_desc": "Analyze and compare unit statistics to ensure balanced gameplay across factions and scenarios.",
    "documentation.features.map_viewer": "Interactive Map Viewer",
    "documentation.features.map_viewer_desc": "Visualize and edit your scenario maps with an interactive editor that works directly with Wesnoth map format.",
    
    "documentation.usage.title": "Usage Guide",
    "documentation.usage.getting_started": "Getting Started",
    "documentation.usage.p1": "To begin using the tools:",
    "documentation.usage.li1": "Navigate to the Dashboard",
    "documentation.usage.li2": "Select the tool you want to use from the Tools menu",
    "documentation.usage.li3": "Upload your scenario files or paste content directly",
    "documentation.usage.li4": "Process the files to extract information",
    "documentation.usage.li5": "Review, edit, and export your content",
    "documentation.usage.basic_workflow": "Basic Workflow",
    "documentation.usage.step1": "Upload .cfg files or paste content",
    "documentation.usage.step2": "Click \"Extract\" to process content",
    "documentation.usage.step3": "Review extracted content",
    "documentation.usage.step4": "Make necessary edits",
    "documentation.usage.step5": "Export modified files",
    "documentation.usage.important_notes": "Important Notes:",
    "documentation.usage.note1": "Always back up your files before processing",
    "documentation.usage.note2": "The tools preserve WML structure during editing",
    "documentation.usage.note3": "Complex conditionals might require manual review",
    
    "documentation.tools.title": "Tools Overview",
    "documentation.tools.extractor": "Event & Message Extractor",
    "documentation.tools.extractor_desc": "This tool helps you manage in-game events and dialogues. Key features:",
    "documentation.tools.extractor_feature1": "Extract all events and their messages",
    "documentation.tools.extractor_feature2": "Edit messages directly in the interface",
    "documentation.tools.extractor_feature3": "Preserve WML structure during editing",
    "documentation.tools.extractor_feature4": "Export modified scenario files",
    "documentation.tools.extractor_feature5": "Multi-file batch processing",
    "documentation.tools.story_extractor": "Story Extractor",
    "documentation.tools.story_extractor_desc": "Specialized for managing campaign narratives and dialogues:",
    "documentation.tools.story_extractor_feature1": "Extract story text from [story] tags",
    "documentation.tools.story_extractor_feature2": "Organize dialogues by character and event",
    "documentation.tools.story_extractor_feature3": "Format text with proper sentence breaks",
    "documentation.tools.story_extractor_feature4": "Identify speaker information",
    "documentation.tools.story_extractor_feature5": "Export story content for editing",
    "documentation.tools.unit_analyzer": "Unit Analyzer (Coming Soon)",
    "documentation.tools.unit_analyzer_desc": "Balance your faction units effectively:",
    "documentation.tools.unit_analyzer_feature1": "Compare unit stats side-by-side",
    "documentation.tools.unit_analyzer_feature2": "Calculate combat effectiveness metrics",
    "documentation.tools.unit_analyzer_feature3": "Identify overpowered/underpowered units",
    "documentation.tools.unit_analyzer_feature4": "Faction balance analysis",
    "documentation.tools.unit_analyzer_feature5": "Cost-effectiveness calculations",
    
    "documentation.troubleshooting.title": "Troubleshooting",
    "documentation.troubleshooting.issue1_title": "Files not processing",
    "documentation.troubleshooting.issue1_p": "If your files aren't processing correctly:",
    "documentation.troubleshooting.issue1_li1": "Ensure files are valid .cfg format",
    "documentation.troubleshooting.issue1_li2": "Check for syntax errors in your WML",
    "documentation.troubleshooting.issue1_li3": "Verify file encoding is UTF-8",
    "documentation.troubleshooting.issue1_li4": "Try with a smaller file to isolate issues",
    "documentation.troubleshooting.issue2_title": "Missing content in extraction",
    "documentation.troubleshooting.issue2_p": "If content is missing from results:",
    "documentation.troubleshooting.issue2_li1": "Check that events use standard [event] tags",
    "documentation.troubleshooting.issue2_li2": "Verify messages use [message] tags",
    "documentation.troubleshooting.issue2_li3": "Ensure story parts are in [story] tags",
    "documentation.troubleshooting.issue2_li4": "Complex conditionals might need manual extraction",
    "documentation.troubleshooting.contact_title": "Need more help?",
    "documentation.troubleshooting.contact_p1": "Visit our",
    "documentation.troubleshooting.contact_link": "GitHub Issues page",
    "documentation.troubleshooting.contact_p2": "to report problems or ask questions.",
    
    "documentation.contribute.title": "Contribute",
    "documentation.contribute.p1": "We welcome contributions to the Wesnoth Campaign Tools Suite!",
    "documentation.contribute.how_to": "How to Contribute:",
    "documentation.contribute.option1_title": "Report Issues",
    "documentation.contribute.option1_desc1": "Submit bug reports or feature requests on our",
    "documentation.contribute.option1_link": "GitHub Issues page",
    "documentation.contribute.option1_desc2": ".",
    "documentation.contribute.option2_title": "Code Contributions",
    "documentation.contribute.option2_desc1": "Fork our",
    "documentation.contribute.option2_link": "GitHub repository",
    "documentation.contribute.option2_desc2": "and submit pull requests.",
    "documentation.contribute.option3_title": "Translations",
    "documentation.contribute.option3_desc": "Help translate the interface by contributing to our .po files.",
    "documentation.contribute.option4_title": "Documentation",
    "documentation.contribute.option4_desc": "Improve documentation by suggesting edits or adding examples.",
    
    "documentation.faq.title": "Frequently Asked Questions",
    "documentation.faq.q1": "Can I edit the extracted content?",
    "documentation.faq.a1": "Yes! Both the Event Extractor and Story Extractor allow you to edit content directly in the interface before exporting.",
    "documentation.faq.q2": "Does this modify my original files?",
    "documentation.faq.a2": "No, the tools never modify your original files. You'll need to explicitly export any changes you make.",
    "documentation.faq.q3": "What WML versions are supported?",
    "documentation.faq.a3": "The tools support all modern WML versions used in Wesnoth 1.16.x and later.",
    "documentation.faq.q4": "Can I use this with UMC campaigns?",
    "documentation.faq.a4": "Absolutely! The tools work with both mainline and user-made campaigns.",
    "documentation.faq.q5": "Is there a way to batch process multiple files?",
    "documentation.faq.a5": "Yes, both extractor tools support processing multiple files at once."
}
};

// Update loadLanguage function
function loadLanguage(lang) {
  return new Promise((resolve) => {
    // For file protocol, use embedded translations
    if (window.location.protocol === 'file:') {
      if (embeddedTranslations[lang]) {
        window.i18nStrings = embeddedTranslations[lang];
      } else {
        // Fallback to English if requested language not embedded
        window.i18nStrings = embeddedTranslations.en;
      }
      applyTranslations();
      
      // Re-init documentation if it exists
      const docContainer = document.getElementById('documentation-container');
      if (docContainer) {
        docContainer.remove();
        initDocumentation();
      }
      resolve();
    } 
    // For http/https, load from server
    else {
      fetch(`languages/${lang}.json`)
        .then(response => response.json())
        .then(translations => {
          window.i18nStrings = translations;
          applyTranslations();
          
          const docContainer = document.getElementById('documentation-container');
          if (docContainer) {
            docContainer.remove();
            initDocumentation();
          }
          resolve(translations);
        })
        .catch(error => {
          console.error('Error loading language file:', error);
          // Fall back to English
          if (lang !== 'en') {
            resolve(loadLanguage('en'));
          } else {
            // Use embedded English as last resort
            window.i18nStrings = embeddedTranslations.en;
            applyTranslations();
            resolve();
          }
        });
    }
  });
}

// Apply translations to the main page
function applyTranslations() {
    const translatableElements = document.querySelectorAll('[data-i18n]');
    translatableElements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key && window.i18nStrings[key]) {
            el.textContent = window.i18nStrings[key];
        }
    });
}

// Default to English if no language selected
if (!window.i18nStrings) {
    window.i18nStrings = {};
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Documentation link handler
    const docLinks = document.querySelectorAll('a[href="#documentation"]');
    let docModule = null;
    
    docLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!docModule) {
                // Ensure default language is loaded
                if (!window.i18nStrings || Object.keys(window.i18nStrings).length === 0) {
                    await loadLanguage('en');
                }
                docModule = initDocumentation();
            }
            docModule.showDocumentation();
        });
    });
    
    // Language selector
    const langLinks = document.querySelectorAll('a[data-lang]');
    langLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const lang = link.getAttribute('data-lang');
            await loadLanguage(lang);
            
            // Update UI
            const langNames = {
                en: "English",
                es: "Español",
                fr: "Français",
                de: "Deutsch",
                ru: "Русский",
                zh: "中文"
            };
            
            document.querySelector('.dashboard-main-dropdown > a').textContent = `${langNames[lang]} ▾`;
        });
    });
    
    // Load default language
    if (Object.keys(window.i18nStrings).length === 0) {
        loadLanguage('en');
    }
});