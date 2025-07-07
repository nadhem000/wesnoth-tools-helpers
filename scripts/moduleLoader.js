class ModuleLoader {
    constructor(containerId = 'tool-container') {
        this.container = document.getElementById(containerId);
        this.currentModule = null;
        this.spinner = document.createElement('div');
        this.spinner.className = 'dashboard-main-spinner';
        this.spinner.innerHTML = `
		<div class="dashboard-main-spinner-icon"></div>
		<div class="dashboard-main-spinner-text">Loading...</div>
        `;
        document.body.appendChild(this.spinner);
        
        // Store the original dashboard content
        const toolsContainer = document.querySelector('.dashboard-main-tools-container');
        if (toolsContainer) {
            this.dashboardContent = toolsContainer.innerHTML;
		}
	}
    
    async loadModule(moduleName) {
        if (moduleName === this.currentModule) return;
		
        try {
            this.currentModule = moduleName;
            this.spinner.style.display = 'flex';
            
            if (window.location.protocol === 'file:') {
                this.container.innerHTML = '';
                
                const script = document.createElement('script');
                script.src = `scripts/${moduleName}.js`;
                
                await new Promise((resolve, reject) => {
                    script.onload = () => {
						const templateName = `${moduleName}Template`;
						if (window[templateName]) {
							let templateContent = window[templateName];
							if (window.location.protocol === 'file:') {
								templateContent = templateContent.replace(
									/(href|src)="([^"]*)"/g, 
									(match, attr, path) => {
										if (path.includes('styles/')) {
											return `${attr}="${window.location.pathname.replace(/\/[^/]*$/, '')}/${path}"`;
										}
										return match;
									}
								);
							}
							this.container.innerHTML = templateContent;
						}
						const initFuncName = `init${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}`;
						if (window[initFuncName]) {
							window[initFuncName]();
						}
    if (moduleName) {
        const backButton = `<button class="dashboard-main-btn" id="return-dashboard" style="margin-bottom: 20px;">
            ← Back to Dashboard
        </button>`;
        this.container.innerHTML = backButton + this.container.innerHTML;
    }
						resolve();
					};
                    script.onerror = () => {
                        reject(new Error(`Failed to load script: scripts/${moduleName}.js`));
					};
                    document.body.appendChild(script);
				});
				} else {
                const response = await fetch(`modules/${moduleName}.html`);
                if (!response.ok) throw new Error('Module not found');
                this.container.innerHTML = await response.text();
                
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = `scripts/${moduleName}.js`;
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
				});
			}
            
            history.pushState({ module: moduleName }, '', `#${moduleName}`);
			} catch (error) {
            console.error('Failed to load module:', error);
            this.container.innerHTML = `
			<div class="error-message">
			<h3>Module Load Error</h3>
			<p>${error.message}</p>
			<button class="dashboard-main-btn" id="return-dashboard">Back to Dashboard</button>
			</div>`;
            document.getElementById('return-dashboard').addEventListener('click', () => this.showDashboard());
			} finally {
            this.spinner.style.display = 'none';
		}
	}
    
    init() {
        if (window.location.protocol === 'file:') {
            console.warn('Running in local file mode - some features may be limited');
		}
        
        this.handleHashChange();
        
        window.addEventListener('popstate', (e) => {
            this.handleHashChange();
		});
	}
    
    handleHashChange() {
        const hash = window.location.hash.substring(1);
        
        if (hash === this.currentModule) return;
        
        if (hash) {
            this.loadModule(hash);
			} else {
            this.showDashboard();
		}
	}
    
    showDashboard() {
        this.container.innerHTML = '';
        this.currentModule = null;
        
        if (this.dashboardContent) {
            const toolsContainer = document.createElement('div');
            toolsContainer.className = 'dashboard-main-tools-container';
            toolsContainer.innerHTML = this.dashboardContent;
            this.container.appendChild(toolsContainer);
            
            document.querySelectorAll('.dashboard-main-open-tool').forEach(button => {
                button.addEventListener('click', (e) => {
                    const moduleName = e.target.closest('.dashboard-main-tool-card').dataset.module;
                    window.location.hash = moduleName;
				});
			});
			} else {
            if (window.location.protocol === 'file:') {
                window.location.href = 'index.html';
			}
		}
        
        history.pushState({}, '', window.location.pathname);
	}
}