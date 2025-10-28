class ActivityTracker {
    constructor() {
        this.storageKey = 'activity-tracker-data';
        this.sessionId = this.generateSessionId();
        this.sessionStart = Date.now();
        this.events = [];
        this.stats = {
            pagesViewed: 0,
            totalClicks: 0,
            formsSubmitted: 0
        };
        
        this.init();
    }

    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.trackPageView();
        this.render();
        this.startDurationTimer();
    }

    loadFromStorage() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                const data = JSON.parse(stored);

                const lastActivity = (data.events && data.events.length > 0) ? 
                    Math.max(...data.events.map(e => e.time)) : data.sessionStart || 0;
                const timeSinceLastActivity = Date.now() - lastActivity;

                // Continue session if within 1 hour (3600000 ms)
                if (timeSinceLastActivity < 3600000) {
                    this.sessionId = data.sessionId || this.sessionId;
                    this.sessionStart = data.sessionStart || this.sessionStart;
                    this.events = data.events || [];
                    this.stats = Object.assign({
                        pagesViewed: 0,
                        totalClicks: 0,
                        formsSubmitted: 0
                    }, data.stats || {});
                } else {
                    // Session expired -> create a new session (reset events/stats)
                    this.sessionId = this.generateSessionId();
                    this.sessionStart = Date.now();
                    this.events = [];
                    this.stats = {
                        pagesViewed: 0,
                        totalClicks: 0,
                        formsSubmitted: 0
                    };
                    this.saveToStorage();
                }
            } catch (e) {
                console.error('Failed to load stored data:', e);
                // If stored data corrupt, reset
                this.sessionId = this.generateSessionId();
                this.sessionStart = Date.now();
                this.events = [];
                this.stats = {
                    pagesViewed: 0,
                    totalClicks: 0,
                    formsSubmitted: 0
                };
                this.saveToStorage();
            }
        } else {
            // No stored data -> save initial session
            this.saveToStorage();
        }
    }

    saveToStorage() {
        const data = {
            sessionId: this.sessionId,
            sessionStart: this.sessionStart,
            events: this.events,
            stats: this.stats
        };
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (err) {
            console.error('Failed to save activity tracker data to localStorage:', err);
        }
    }

    setupEventListeners() {
        // Single delegated click listener high on the document
        document.addEventListener('click', (e) => {
            // If timeline button clicked, toggle timeline (and *do not* treat as .btn-primary)
            const timelineBtn = e.target.closest('.activity-tracker-button');
            if (timelineBtn) {
                this.toggleTimeline();
                return;
            }

            // Check for .btn-primary clicks (delegated)
            const primary = e.target.closest('.btn-primary');
            if (primary) {
                this.trackButtonClick();
                return;
            }
        });

        // Track form submissions: submit event does bubble, so one listener is enough
        document.addEventListener('submit', (e) => {
            // Do not prevent default (so normal form submission/navigation proceeds)
            this.trackFormSubmission({
                formName: (e.target && (e.target.name || e.target.id)) || 'form'
            });
        });

        // Track scroll for page view updates (debounced)
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.updateScrollDepth();
            }, 100);
        });
    }

    trackPageView() {
        const pageName = document.title || window.location.pathname.split('/').pop() || 'index.html';
        const scrollDepth = this.calculateScrollDepth();
        
        // Check if we already have a page view for this page in current session
        const existingPageView = this.events.find(event => 
            event.type === 'pageview' && event.page === pageName
        );

        if (!existingPageView) {
            const ev = {
                type: 'pageview',
                page: pageName,
                time: Date.now(),
                scrollDepth: scrollDepth
            };
            this.events.push(ev);
            this.stats.pagesViewed++;
            this.saveToStorage();
            this.render();
        } else {
            // Update scroll depth for existing page view if deeper
            if (existingPageView.scrollDepth < scrollDepth) {
                existingPageView.scrollDepth = scrollDepth;
                this.saveToStorage();
                this.render();
            }
        }
    }

    updateScrollDepth() {
        const pageName = document.title || window.location.pathname.split('/').pop() || 'index.html';
        const scrollDepth = this.calculateScrollDepth();
        
        const pageView = this.events.find(event => 
            event.type === 'pageview' && event.page === pageName
        );
        
        if (pageView && pageView.scrollDepth < scrollDepth) {
            pageView.scrollDepth = scrollDepth;
            this.saveToStorage();
            this.render();
        }
    }

    trackButtonClick() {
        this.events.push({
            type: 'interaction',
            subtype: 'button-click',
            details: 'Clicked link: Shop Now',
            time: Date.now()
        });
        
        this.stats.totalClicks++;
        this.saveToStorage();
        this.render();
    }

    trackFormSubmission(opts = {}) {
        const details = opts.formName ? `Form submitted (${opts.formName})` : 'Form submitted';
        this.events.push({
            type: 'interaction',
            subtype: 'form-submission',
            details: details,
            time: Date.now()
        });
        
        this.stats.formsSubmitted++;
        this.saveToStorage();
        this.render();
    }

    calculateScrollDepth() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
        const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
        const clientHeight = document.documentElement.clientHeight || window.innerHeight || 0;
        
        if (scrollHeight <= clientHeight || clientHeight === 0) return 100;
        
        const scrollPercentage = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
        return Math.min(Math.max(scrollPercentage, 0), 100);
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    getSessionDuration() {
        const duration = Date.now() - this.sessionStart;
        return Math.floor(duration / 60000); // minutes
    }

    startDurationTimer() {
        // Update stats every minute to reflect duration
        this._durationInterval = setInterval(() => {
            this.renderStats();
        }, 60000);
    }

    toggleTimeline() {
        const timeline = document.querySelector('.activity-tracker-timeline');
        if (timeline) {
            timeline.classList.toggle('expanded');
        }
    }

    render() {
        this.ensureWidgetExists();
        this.renderHeader();
        this.renderStats();
        this.renderTimeline();
    }

    ensureWidgetExists() {
        let widget = document.querySelector('.activity-tracker-widget');
        if (!widget) {
            widget = document.createElement('div');
            widget.className = 'activity-tracker-widget';
            document.body.appendChild(widget);
        }

        let button = widget.querySelector('.activity-tracker-button');
        if (!button) {
            button = document.createElement('button');
            button.className = 'activity-tracker-button';
            button.setAttribute('aria-label', 'Open activity timeline');
            button.innerHTML = '🕒';
            widget.appendChild(button);
        }

        let timeline = widget.querySelector('.activity-tracker-timeline');
        if (!timeline) {
            timeline = document.createElement('aside');
            timeline.className = 'activity-tracker-timeline';
            widget.appendChild(timeline);
        }

        this.ensureTimelineStructure(timeline);
    }

    ensureTimelineStructure(timeline) {
        // Header
        let header = timeline.querySelector('.timeline-header');
        if (!header) {
            header = document.createElement('header');
            header.className = 'timeline-header';
            timeline.appendChild(header);
        }
        
        if (!header.querySelector('h3')) {
            header.innerHTML = `
                <h3>Activity Timeline</h3>
                <div>
                    <div class="session-id">Session ID: ${this.sessionId}</div>
                    <div class="session-started">Started: ${this.formatTime(this.sessionStart)}</div>
                </div>
            `;
        }

        // Stats container
        let stats = timeline.querySelector('.session-stats');
        if (!stats) {
            stats = document.createElement('section');
            stats.className = 'session-stats';
            timeline.appendChild(stats);
        }

        // Timeline content
        let content = timeline.querySelector('.timeline-content');
        if (!content) {
            content = document.createElement('div');
            content.className = 'timeline-content';
            // enforce required CSS properties
            content.style.overflowY = 'auto';
            content.style.maxHeight = '350px';
            timeline.appendChild(content);
        } else {
            // ensure styles exist in case element already present
            content.style.overflowY = 'auto';
            content.style.maxHeight = '350px';
        }

        let wrapper = content.querySelector('.timeline-wrapper');
        if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.className = 'timeline-wrapper';
            content.appendChild(wrapper);
        }
    }

    renderHeader() {
        const sessionIdEl = document.querySelector('.session-id');
        const sessionStartedEl = document.querySelector('.session-started');
        
        if (sessionIdEl) {
            sessionIdEl.textContent = `Session ID: ${this.sessionId}`;
        }
        
        if (sessionStartedEl) {
            sessionStartedEl.textContent = `Started: ${this.formatTime(this.sessionStart)}`;
        }
    }

    renderStats() {
        const statsContainer = document.querySelector('.session-stats');
        if (!statsContainer) return;

        // Render exactly in the specified order and format:
        statsContainer.innerHTML = `
            <div class="stat">
                <div class="stat-label">Session Duration</div>
                <div class="stat-value">${this.getSessionDuration()} min</div>
            </div>
            <div class="stat">
                <div class="stat-label">Pages Viewed</div>
                <div class="stat-value">${this.stats.pagesViewed}</div>
            </div>
            <div class="stat">
                <div class="stat-label">Total Clicks</div>
                <div class="stat-value">${this.stats.totalClicks}</div>
            </div>
            <div class="stat">
                <div class="stat-label">Forms Submitted</div>
                <div class="stat-value">${this.stats.formsSubmitted}</div>
            </div>
        `;
    }

    renderTimeline() {
        const timelineWrapper = document.querySelector('.timeline-wrapper');
        if (!timelineWrapper) return;

        // Sort events by time (newest first)
        const sortedEvents = [...this.events].sort((a, b) => b.time - a.time);
        
        timelineWrapper.innerHTML = sortedEvents.map(event => {
            const time = this.formatTime(event.time);
            
            if (event.type === 'pageview') {
                return `
                    <div class="timeline-item pageview">
                        <div class="time">${time}</div>
                        <div class="event-content">
                            <div class="event-title">Page View</div>
                            <div class="event-details">Visited: ${event.page} — ${event.scrollDepth}% viewed</div>
                        </div>
                    </div>
                `;
            } else if (event.type === 'interaction') {
                return `
                    <div class="timeline-item interaction">
                        <div class="time">${time}</div>
                        <div class="event-content">
                            <div class="event-title">Interaction</div>
                            <div class="event-details">${event.details}</div>
                        </div>
                    </div>
                `;
            }
            return '';
        }).join('');
    }

    // Public method to track custom interactions
    trackInteraction(details) {
        this.events.push({
            type: 'interaction',
            subtype: 'custom',
            details: details,
            time: Date.now()
        });
        this.saveToStorage();
        this.render();
    }

    // Public method to get current session data
    getSessionData() {
        return {
            sessionId: this.sessionId,
            sessionStart: this.sessionStart,
            events: this.events,
            stats: this.stats
        };
    }
}

// Initialize the activity tracker when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.activityTracker = new ActivityTracker();
    });
} else {
    window.activityTracker = new ActivityTracker();
}
