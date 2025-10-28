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
                const lastActivity = data.events.length > 0 ? 
                    Math.max(...data.events.map(e => e.time)) : data.sessionStart;
                const timeSinceLastActivity = Date.now() - lastActivity;
                
                // Check if session expired (1 hour)
                if (timeSinceLastActivity < 3600000) {
                    this.sessionId = data.sessionId;
                    this.sessionStart = data.sessionStart;
                    this.events = data.events;
                    this.stats = data.stats;
                } else {
                    // Session expired, start new one
                    this.saveToStorage();
                }
            } catch (e) {
                console.error('Failed to load stored data:', e);
            }
        }
    }

    saveToStorage() {
        const data = {
            sessionId: this.sessionId,
            sessionStart: this.sessionStart,
            events: this.events,
            stats: this.stats
        };
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    setupEventListeners() {
        // Track all button clicks with btn-primary class
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn-primary') || e.target.closest('.btn-primary')) {
                this.trackButtonClick();
            }
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            this.trackFormSubmission();
        });

        // Timeline toggle
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('activity-tracker-button') || 
                e.target.closest('.activity-tracker-button')) {
                this.toggleTimeline();
            }
        });
    }

    trackPageView() {
        const pageName = window.location.pathname.split('/').pop() || 'index.html';
        const scrollDepth = this.calculateScrollDepth();
        
        this.events.push({
            type: 'pageview',
            page: pageName,
            time: Date.now(),
            scrollDepth: scrollDepth
        });
        
        this.stats.pagesViewed++;
        this.saveToStorage();
        this.render();
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

    trackFormSubmission() {
        this.events.push({
            type: 'interaction',
            subtype: 'form-submission',
            details: 'Form submitted',
            time: Date.now()
        });
        
        this.stats.formsSubmitted++;
        this.saveToStorage();
        this.render();
    }

    calculateScrollDepth() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const scrollPercentage = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
        return Math.min(scrollPercentage, 100);
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
        return Math.floor(duration / 60000);
    }

    startDurationTimer() {
        setInterval(() => {
            this.render();
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
        if (!document.querySelector('.activity-tracker-widget')) {
            const widget = document.createElement('div');
            widget.className = 'activity-tracker-widget';
            widget.innerHTML = `
                <button class="activity-tracker-button" aria-label="Open activity timeline">🕒</button>
                <aside class="activity-tracker-timeline">
                    <header class="timeline-header">
                        <h3>Activity Timeline</h3>
                        <div>
                            <div class="session-id">Session ID: ${this.sessionId}</div>
                            <div class="session-started">Started: ${this.formatTime(this.sessionStart)}</div>
                        </div>
                    </header>
                    <section class="session-stats">
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
                    </section>
                    <div class="timeline-content">
                        <div class="timeline-wrapper"></div>
                    </div>
                </aside>
            `;
            document.body.appendChild(widget);
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

        timelineWrapper.innerHTML = this.events
            .map(event => {
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
            })
            .join('');
    }
}

// Initialize the activity tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ActivityTracker();
});