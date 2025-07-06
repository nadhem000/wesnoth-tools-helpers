class ModuleLoader {
    constructor(containerId = 'tool-container') {
        this.container = document.getElementById(containerId);
        this.currentModule = null;
    }
    
    async loadModule(moduleName) {
        try {
            // Handle local file protocol differently
            if (window.location.protocol === 'file:') {
                // Clear the container
                this.container.innerHTML = '';
                
                // Create script element for module
                const script = document.createElement('script');
                script.src = `scripts/${moduleName}.js`;
                
                // Set up onload event to set the template and initialize
                script.onload = () => {
                    // Check if the module has a template
                    const templateName = `${moduleName}Template`;
                    if (window[templateName]) {
                        this.container.innerHTML = window[templateName];
                    }
                    // Initialize the module if it has an init function
                    const initFuncName = `init${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}`;
                    if (window[initFuncName]) {
                        window[initFuncName]();
                    }
                    this.currentModule = moduleName;
                };
                
                // Add error handling for the script
                script.onerror = () => {
                    this.container.innerHTML = `<div class="error-message">Failed to load script for ${moduleName}</div>`;
                };
                
                document.body.appendChild(script);
                
                history.pushState({ module: moduleName }, '', `#${moduleName}`);
            } else {
                // Original HTTP fetch code
                const response = await fetch(`modules/${moduleName}.html`);
                if (!response.ok) throw new Error('Module not found');
                const html = await response.text();
                this.container.innerHTML = html;
                this.currentModule = moduleName;
                
                const script = document.createElement('script');
                script.src = `scripts/${moduleName}.js`;
                document.body.appendChild(script);
                
                history.pushState({ module: moduleName }, '', `#${moduleName}`);
            }
        } catch (error) {
            console.error('Failed to load module:', error);
            this.container.innerHTML = `
            <div class="error-message">
                <h3>Module Load Error</h3>
                <p>Failed to load ${moduleName} tool</p>
                <button class="btn" id="return-dashboard">Back to Dashboard</button>
            </div>`;
        }
    }
    
    init() {
        // Check if running locally
        if (window.location.protocol === 'file:') {
            console.warn('Running in local file mode - some features may be limited');
        }
        
        // Load module from URL hash
        if (window.location.hash) {
            const moduleName = window.location.hash.substring(1);
            this.loadModule(moduleName);
        }
        
        // Handle back button
        window.addEventListener('popstate', (e) => {
            if (e.state?.module) {
                this.loadModule(e.state.module);
            } else {
                this.showDashboard();
            }
        });
    }
    
    showDashboard() {
        if (window.location.protocol === 'file:') {
            // For local file, reload the page to show dashboard
            window.location.href = 'index.html';
        } else {
            this.container.innerHTML = `
            <div class="tools-container">
                ${document.querySelector('.tools-container').innerHTML}
            </div>`;
        }
        this.currentModule = null;
    }
}

const loader = new ModuleLoader();
document.addEventListener('DOMContentLoaded', () => loader.init());