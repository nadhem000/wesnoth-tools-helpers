/**
	* Internationalization Module
	* @version 1.1
*/
const i18n = {
    currentLang: 'en',
    translations: {
        en: {
            title: "Wesnoth Tools Suite",
            heading: "Documentation",
            intro: "Welcome to the Wesnoth Tools documentation",
            description: "This is a sample tool implementation",
            nav: {
                dashboard: "Dashboard",
                tools: "Tools",
                community: "Community",
                documentation: "Documentation",
                about: "About",
                languages: "Languages"
			},
            lang: {
                en: "English",
                fr: "French",
                de: "German",
                es: "Spanish",
                it: "Italian"
			},
            card: {
                unit_editor: "Unit Editor",
                scenario_builder: "Scenario Builder",
                wml_validator: "WML Validator",
                coming_soon: "Coming Soon",
                
                // Unit Editor texts
                unit_editor_description: "Create and customize units with detailed statistics and abilities for your campaign.",
                unit_editor_feature1: "Customize attack types and damage",
                unit_editor_feature2: "Define movement costs and resistances",
                unit_editor_feature3: "Add special abilities and traits",
                
                // Scenario Builder texts
                scenario_builder_description: "Design and build engaging scenarios with terrain, units, and events for your campaign.",
                scenario_builder_feature1: "Drag-and-drop map editor",
                scenario_builder_feature2: "Terrain palette with preview",
                scenario_builder_feature3: "Starting position management",
                
                // WML Validator texts
                wml_validator_description: "Validate your WML code for errors and optimize performance before deployment.",
                wml_validator_feature1: "Syntax error detection",
                wml_validator_feature2: "Performance optimization",
                wml_validator_feature3: "Compatibility checks",
				story_manager: "Story Manager",
                
                // Story Manager
      story_manager_description: "Create and manage narrative sequences and dialogues",
      story_manager_feature1: "Create branching dialogue trees",
      story_manager_feature2: "Manage character dialogues",
      story_manager_feature3: "Export to WML story format"
			},
            footer: {
                github: "GitHub",
                forums: "Forums",
                report: "Report Issues",
                copyright: "Wesnoth Campaign Tools Suite © 2025 | Created for Battle for Wesnoth developers"
			},
            offline: {
                message: "Offline Mode"
			},
            install: {
                button: "Install App"
			},
			doc: {
				toc: "Table of Contents",
				introduction: "Introduction",
				unit_editor: "Unit Editor",
				scenario_builder: "Scenario Builder",
				wml_validator: "WML Validator",
				best_practices: "Best Practices",
				api_reference: "API Reference",
				faq: "FAQ",
				intro_p1: "Welcome to the Wesnoth Campaign Tools Suite documentation...",
				intro_p2: "The suite includes three main tools...",
				key_features: "Key Features",
				feature1: "Real-time preview of units and scenarios",
				feature2: "Drag-and-drop interface for map creation",
				feature3: "Advanced WML validation with error highlighting",
				feature4: "Multi-language support for international campaigns",
				feature5: "Export functionality for Wesnoth-compatible files",
				creating_units: "Creating Units",
				unit_step1: "Click 'New Unit' from the dashboard",
				unit_step2: "Set base attributes: HP, movement, cost",
				unit_step3: "Add attacks with type, damage, and specials",
				unit_step4: "Define resistances and vulnerabilities",
				unit_step5: "Add abilities and traits",
				unit_step6: "Preview and save unit",
				note: "Note:",
				unit_note: "All units must have a unique ID...",
				scenario_desc: "Design and build engaging scenarios...",
				terrain_placement: "Terrain Placement",
				terrain_desc: "Use the terrain palette to paint maps...",
				unit_placement: "Unit Placement",
				unit_placement_desc: "Drag units from the sidebar onto the map...",
				event_scripting: "Event Scripting",
				validator_desc: "Validate your WML code for errors...",
				common_errors: "Common Errors",
				error: "Error",
				description: "Description",
				solution: "Solution",
				error1: "Missing closing tag",
				desc1: "Tag opened but not closed",
				sol1: "Add matching closing tag",
				error2: "Invalid attribute",
				desc2: "Attribute not recognized in context",
				sol2: "Check spelling and valid attributes",
				error3: "Deprecated feature",
				desc3: "Using outdated WML syntax",
				sol3: "Consult latest WML reference",
				bp1: "Use meaningful IDs for all elements",
				bp2: "Comment complex WML sections",
				bp3: "Test scenarios with different difficulty levels",
				bp4: "Balance unit statistics carefully",
				bp5: "Use the validator before each export",
				api_desc: "Advanced users can extend functionality...",
				core_methods: "Core Methods",
				method1: "Creates a new unit programmatically",
				method2: "Validates current scenario",
				method3: "Exports current project to WML",
				faq1: "Can I import existing WML files?",
				ans1: "Yes! Use the 'Import' option...",
				faq2: "How do I contribute to the project?",
				ans2: "Visit our GitHub repository...",
				faq3: "Are there any sample campaigns?",
				ans3: "Yes, under 'Templates'...",
				events_manager: "Events Manager",
				events_manager_desc: "The Events Manager tool allows you to extract, edit, and manage events and messages from Wesnoth scenario files.",
				using_events_manager: "Using the Events Manager",
				em_step1: "Upload scenario files (.cfg) using the drag-and-drop zone or the browse button",
				em_step2: "Paste WML content directly into the text area and click 'Process Pasted Content'",
				em_step3: "Switch between Events View and Messages View using the toggle buttons",
				em_step4: "Edit event code and message text directly in the editors",
				em_step5: "Save changes and download the edited files",
				em_feature1: "Extract events and messages from multiple scenario files",
				em_feature2: "Group content by file or view combined results",
				em_feature3: "Real-time statistics on events and messages",
				em_feature4: "Direct editing of WML event code",
				em_feature5: "Message translation and editing interface",
				em_note: "The Events Manager preserves your original files and only modifies content when you explicitly save changes.",
				em_trouble1: "If events aren't showing up, ensure your files contain valid [event] tags. The parser looks for these tags to identify events.",
            story_manager: "Story Manager",
      story_manager_desc: "The Story Manager tool helps you create and manage narrative sequences, dialogues, and branching story paths for your campaigns.",
      using_story_manager: "Using the Story Manager",
      sm_step1: "Create a new story or open an existing campaign",
      sm_step2: "Add characters with portraits and dialogue styles",
      sm_step3: "Build dialogue trees with player choices and consequences",
      sm_step4: "Connect story segments to scenario events",
      sm_step5: "Preview the narrative flow and character interactions",
      sm_step6: "Export to WML for use in your campaign",
      sm_feature1: "Visual dialogue tree editor with drag-and-drop interface",
      sm_feature2: "Character library with portrait management",
      sm_feature3: "Branching narrative paths with conditional logic",
      sm_feature4: "Integration with Events Manager for in-game triggers",
      sm_feature5: "Export to WML [story] format",
      export_example: "Export Example",
      sm_note: "The Story Manager maintains character consistency across your campaign scenarios. Use the \"Link to Event\" feature to connect dialogue choices with game events."
			},
			about: {
				title: "About Wesnoth Tools Suite",
				mission_title: "Our Mission",
				mission_desc: "To empower Wesnoth campaign developers with intuitive tools that streamline the creation process.",
				features_title: "Key Features",
				feature1: "Open-source and community-driven development",
				feature2: "Modern, responsive interface",
				feature3: "Progressive Web App functionality",
				feature4: "Multi-language support",
				stats_title: "Project Statistics",
				downloads: "Downloads",
				active_users: "Active Users",
				github_stars: "GitHub Stars",
				team_title: "Development Team",
				team_desc: "Passionate developers contributing to the project",
				contributor: "Contributor",
				contact_title: "Contact & Support",
				contact_desc: "Reach out to us for questions or support",
				forum: "Wesnoth Forums",
				discord: "Discord Server",
				email: "Email Support",
				license_title: "License",
				license_desc: "This project is licensed under the GPLv3 license."
			}
		}
	},
	
    // Helper function to get nested translations
    t(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
				} else {
                return null;
			}
		}
        return value;
	},
	
    init() {
        let lang = 'en';
        try {
            // localStorage may not be available in file://
            lang = localStorage.getItem('wts-lang') || 'en';
			} catch (e) {
            console.warn('LocalStorage not available, using default language');
		}
        this.setLanguage(lang);
	},
    
    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('wts-lang', lang);
        document.documentElement.lang = lang;
        
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (translation) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translation;
					} else {
                    el.textContent = translation;
				}
			}
		});
	}
};

// Initialize i18n
document.addEventListener('DOMContentLoaded', () => i18n.init());