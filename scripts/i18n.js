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
                wml_validator_feature3: "Compatibility checks"
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