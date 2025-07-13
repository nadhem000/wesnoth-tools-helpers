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
events_manager: "Events Manager",
                unit_editor: "Unit Editor",
                scenario_builder: "Scenario Builder",
                wml_validator: "WML Validator",
                coming_soon: "Coming Soon",
                
                // Events Manager texts
events_manager_description: "Extract and manage events and messages from Wesnoth scenario files",
events_manager_feature1: "Extract events and messages",
events_manager_feature2: "Edit event WML code directly",
events_manager_feature3: "Modify message text in context",
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
story_manager_description: "Extract and manage story content from Wesnoth scenario files", 
story_manager_feature1: "Extract story parts and dialogues",
story_manager_feature2: "View scenario metadata and events",
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
		},
        fr: {
            title: "Suite d'Outils Wesnoth",
            heading: "Documentation",
            intro: "Bienvenue dans la documentation des outils Wesnoth",
            description: "Ceci est un exemple d'implémentation d'outil",
            nav: {
                dashboard: "Tableau de bord",
                tools: "Outils",
                community: "Communauté",
                documentation: "Documentation",
                about: "À propos",
                languages: "Langues"
			},
            lang: {
                en: "Anglais",
                fr: "Français",
                de: "Allemand",
                es: "Espagnol",
                it: "Italien"
			},
            card: {
			events_manager: "Gestionnaire d'événements",
                story_manager: "Gestionnaire d'histoires",
                unit_editor: "Éditeur d'unités",
                scenario_builder: "Constructeur de scénarios",
                wml_validator: "Validateur WML",
                coming_soon: "Bientôt disponible",
events_manager_description: "Extraire et gérer les événements et messages des fichiers de scénario Wesnoth",
events_manager_feature1: "Extraire les événements et messages",
events_manager_feature2: "Éditer directement le code WML des événements",
events_manager_feature3: "Modifier le texte des messages en contexte",
                unit_editor_description: "Créez et personnalisez des unités avec des statistiques et capacités détaillées pour votre campagne.",
                unit_editor_feature1: "Personnalisez les types d'attaque et les dégâts",
                unit_editor_feature2: "Définissez les coûts de déplacement et les résistances",
                unit_editor_feature3: "Ajoutez des capacités et traits spéciaux",
                scenario_builder_description: "Concevez et construisez des scénarios captivants avec terrain, unités et événements pour votre campagne.",
                scenario_builder_feature1: "Éditeur de carte par glisser-déposer",
                scenario_builder_feature2: "Palette de terrain avec aperçu",
                scenario_builder_feature3: "Gestion des positions de départ",
                wml_validator_description: "Validez votre code WML pour détecter les erreurs et optimisez les performances avant le déploiement.",
                wml_validator_feature1: "Détection d'erreurs de syntaxe",
                wml_validator_feature2: "Optimisation des performances",
                wml_validator_feature3: "Vérifications de compatibilité",
story_manager_description: "Extraire et gérer le contenu scénaristique des fichiers de scénario Wesnoth",
story_manager_feature1: "Extraire les parties d'histoire et dialogues",
story_manager_feature2: "Voir les métadonnées et événements du scénario",
story_manager_feature3: "Exporter au format WML story"
			},
            footer: {
                github: "GitHub",
                forums: "Forums",
                report: "Signaler des problèmes",
                copyright: "Suite d'Outils Wesnoth © 2025 | Créé pour les développeurs de Battle for Wesnoth"
			},
            offline: {
                message: "Mode hors-ligne"
			},
            install: {
                button: "Installer l'application"
			},
            doc: {
                toc: "Table des matières",
                introduction: "Introduction",
                unit_editor: "Éditeur d'unités",
                scenario_builder: "Constructeur de scénarios",
                wml_validator: "Validateur WML",
                best_practices: "Bonnes pratiques",
                api_reference: "Référence API",
                faq: "FAQ",
                intro_p1: "Bienvenue dans la documentation de la suite d'outils Wesnoth...",
                intro_p2: "La suite comprend trois outils principaux...",
                key_features: "Fonctionnalités clés",
                feature1: "Prévisualisation en temps réel des unités et scénarios",
                feature2: "Interface glisser-déposer pour la création de cartes",
                feature3: "Validation WML avancée avec surlignage des erreurs",
                feature4: "Support multilingue pour les campagnes internationales",
                feature5: "Fonctionnalité d'export pour fichiers compatibles Wesnoth",
                creating_units: "Création d'unités",
                unit_step1: "Cliquez sur 'Nouvelle unité' dans le tableau de bord",
                unit_step2: "Définissez les attributs de base : PV, mouvement, coût",
                unit_step3: "Ajoutez des attaques avec type, dégâts et spéciaux",
                unit_step4: "Définissez résistances et vulnérabilités",
                unit_step5: "Ajoutez capacités et traits",
                unit_step6: "Prévisualisez et sauvegardez l'unité",
                note: "Note :",
                unit_note: "Toutes les unités doivent avoir un ID unique...",
                scenario_desc: "Concevez et construisez des scénarios captivants...",
                terrain_placement: "Placement du terrain",
                terrain_desc: "Utilisez la palette de terrain pour peindre les cartes...",
                unit_placement: "Placement des unités",
                unit_placement_desc: "Glissez les unités de la barre latérale sur la carte...",
                event_scripting: "Scripting d'événements",
                validator_desc: "Validez votre code WML pour détecter les erreurs...",
                common_errors: "Erreurs courantes",
                error: "Erreur",
                description: "Description",
                solution: "Solution",
                error1: "Balise de fermeture manquante",
                desc1: "Balise ouverte mais non fermée",
                sol1: "Ajoutez la balise de fermeture correspondante",
                error2: "Attribut invalide",
                desc2: "Attribut non reconnu dans ce contexte",
                sol2: "Vérifiez l'orthographe et les attributs valides",
                error3: "Fonctionnalité obsolète",
                desc3: "Utilisation d'une syntaxe WML dépassée",
                sol3: "Consultez la dernière référence WML",
                bp1: "Utilisez des ID significatifs pour tous les éléments",
                bp2: "Commentez les sections WML complexes",
                bp3: "Testez les scénarios avec différents niveaux de difficulté",
                bp4: "Équilibrez soigneusement les statistiques des unités",
                bp5: "Utilisez le validateur avant chaque export",
                api_desc: "Les utilisateurs avancés peuvent étendre les fonctionnalités...",
                core_methods: "Méthodes principales",
                method1: "Crée une nouvelle unité par programmation",
                method2: "Valide le scénario actuel",
                method3: "Exporte le projet actuel en WML",
                faq1: "Puis-je importer des fichiers WML existants ?",
                ans1: "Oui ! Utilisez l'option 'Importer'...",
                faq2: "Comment contribuer au projet ?",
                ans2: "Visitez notre dépôt GitHub...",
                faq3: "Y a-t-il des campagnes d'exemple ?",
                ans3: "Oui, dans 'Modèles'...",
                events_manager: "Gestionnaire d'événements",
                events_manager_desc: "Le Gestionnaire d'événements vous permet d'extraire, éditer et gérer les événements et messages des fichiers de scénario Wesnoth.",
                using_events_manager: "Utilisation du Gestionnaire d'événements",
                em_step1: "Importez les fichiers scénario (.cfg) en les glissant-déposant ou via le bouton Parcourir",
                em_step2: "Collez le contenu WML dans la zone de texte et cliquez 'Traiter le contenu'",
                em_step3: "Basculez entre vues Événements et Messages",
                em_step4: "Éditez le code d'événement et le texte des messages directement",
                em_step5: "Sauvegardez et téléchargez les fichiers modifiés",
                em_feature1: "Extrait événements et messages de multiples fichiers",
                em_feature2: "Groupe le contenu par fichier ou vue combinée",
                em_feature3: "Statistiques en temps réel sur événements et messages",
                em_feature4: "Édition directe du code WML des événements",
                em_feature5: "Interface de traduction et d'édition des messages",
                em_note: "Le Gestionnaire d'événements préserve vos fichiers originaux et ne modifie le contenu que lors d'une sauvegarde explicite.",
                em_trouble1: "Si les événements n'apparaissent pas, assurez-vous que vos fichiers contiennent des balises [event] valides.",
                story_manager_desc: "Le Gestionnaire d'histoires vous aide à créer et gérer des séquences narratives, dialogues et chemins scénaristiques à embranchements.",
                using_story_manager: "Utilisation du Gestionnaire d'histoires",
                sm_step1: "Créez une nouvelle histoire ou ouvrez une campagne existante",
                sm_step2: "Ajoutez des personnages avec portraits et styles de dialogue",
                sm_step3: "Construisez des arbres de dialogue avec choix et conséquences",
                sm_step4: "Connectez les segments d'histoire aux événements de scénario",
                sm_step5: "Prévisualisez le flux narratif et les interactions",
                sm_step6: "Exportez en WML pour votre campagne",
                sm_feature1: "Éditeur visuel d'arbres de dialogue par glisser-déposer",
                sm_feature2: "Bibliothèque de personnages avec gestion des portraits",
                sm_feature3: "Chemins narratifs à embranchements avec logique conditionnelle",
                sm_feature4: "Intégration avec le Gestionnaire d'événements",
                sm_feature5: "Export au format WML [story]",
                export_example: "Exemple d'export",
                sm_note: "Le Gestionnaire d'histoires maintient la cohérence des personnages à travers vos scénarios. Utilisez \"Lier à un événement\" pour connecter les choix aux événements."
			},
            about: {
                title: "À propos de la suite d'outils Wesnoth",
                mission_title: "Notre mission",
                mission_desc: "Donner aux créateurs de campagnes Wesnoth des outils intuitifs qui simplifient le processus de création.",
                features_title: "Fonctionnalités clés",
                feature1: "Développement open-source et communautaire",
                feature2: "Interface moderne et réactive",
                feature3: "Fonctionnalité d'application web progressive",
                feature4: "Support multilingue",
                stats_title: "Statistiques du projet",
                downloads: "Téléchargements",
                active_users: "Utilisateurs actifs",
                github_stars: "Étoiles GitHub",
                team_title: "Équipe de développement",
                team_desc: "Développeurs passionnés contribuant au projet",
                contributor: "Contributeur",
                contact_title: "Contact & Support",
                contact_desc: "Contactez-nous pour vos questions",
                forum: "Forums Wesnoth",
                discord: "Serveur Discord",
                email: "Support email",
                license_title: "Licence",
                license_desc: "Ce projet est sous licence GPLv3."
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