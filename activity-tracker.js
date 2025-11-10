class ActivityTracker {

    constructor() {
        // Constants
        this.KEY = 'activity-tracker-data';
        this.SESSION_LIMIT = 60 * 60 * 1000; // 1 hour limit per session

        // Setup
        this._startSession();
        this._displayWidget();
        this._recordPageView();
        this._attachListeners();
        this._updateSessionDuration();
    }

    // ---------------------- SESSION SETUP ----------------------
    _startSession() {
        const savedData = localStorage.getItem(this.KEY);
        const now = Date.now();

        if (savedData) {
            try {
                const sessionData = JSON.parse(savedData);
                const lastEventTime = sessionData.events.length
                    ? sessionData.events.reduce((max, e) => e.time > max ? e.time : max, sessionData.startedAt)
                    : sessionData.startedAt;

                // Reuse the session if it’s still active
                if (now - lastEventTime < this.SESSION_LIMIT) {
                    this.session = sessionData;
                    return;
                }

            } catch (err) {
                console.warn('Error reading saved session:', err);
            }
        }

        // Start a new session
        this.session = {
            sessionId: this._createSessionId(),
            startedAt: now,
            events: []
        };

        this._persistSession();
    }

    _createSessionId() {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        return `session_${timestamp}_${randomStr}`;
    }

    _persistSession() {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(this.session));
        } catch (e) {
            console.error('Failed to save session', e);
        }
    }

    // ---------------------- TIME HELPERS ----------------------
    _getFormattedTime(ts) {
        const d = new Date(ts);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
    }

    _sessionMinutes() {
        const elapsed = Date.now() - this.session.startedAt;
        return Math.floor(elapsed / 60000);
    }

    // ---------------------- EVENT LOGGING ----------------------
    _recordPageView() {
        const pageName = window.location.pathname.split('/').pop() || 'index.html';
        this._logEvent('pageview', `Visited ${pageName}`, pageName);
    }

    _logEvent(type, details, page = null) {
        const newEvent = {
            type,
            details,
            time: Date.now()
        };

        if (page) newEvent.page = page;

        this.session.events.push(newEvent);
        this._persistSession();
        this._updateUI();
    }

    _attachListeners() {
        document.addEventListener('click', (e) => {
            const el = e.target;

            if (el.classList.contains('btn-primary')) {
                this._logEvent('interaction', 'Clicked link: Shop Now');
            }

            if (el.classList.contains('activity-tracker-button')) {
                this._expandCollapseTimeline();
            }
        }, true);

        document.addEventListener('submit', () => {
            this._logEvent('interaction', 'Form submitted');
        }, true);
    }

    // ---------------------- WIDGET UI ----------------------
    _displayWidget() {
        const widgetHTML = `
            <div class="activity-tracker-widget">
                <button class="activity-tracker-button" title="View activity">🕒</button>
                <aside class="activity-tracker-timeline">
                    ${this._displayHeader()}
                    ${this._displayStats()}
                    ${this._displayTimeline()}
                </aside>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', widgetHTML);
    }

    _displayHeader() {
        const s = this.session;
        return `
            <header class="timeline-header">
                <h3>Activity Timeline</h3>
                <div>
                    <div><strong>ID:</strong> ${s.sessionId}</div>
                    <div><strong>Start:</strong> ${this._getFormattedTime(s.startedAt)}</div>
                </div>
            </header>
        `;
    }

    _displayStats() {
        const { duration, pages, clicks, forms } = this._calculateStats();
        return `
            <section class="session-stats">
                <div class="stat"><div class="stat-label">Duration</div><div class="stat-value">${duration} min</div></div>
                <div class="stat"><div class="stat-label">Pages Viewed</div><div class="stat-value">${pages}</div></div>
                <div class="stat"><div class="stat-label">Clicks</div><div class="stat-value">${clicks}</div></div>
                <div class="stat"><div class="stat-label">Forms</div><div class="stat-value">${forms}</div></div>
            </section>
        `;
    }

    _calculateStats() {
        const ev = this.session.events;
        return {
            duration: this._sessionMinutes(),
            pages: ev.filter(e => e.type === 'pageview').length,
            clicks: ev.filter(e => e.type === 'interaction' && e.details.includes('Click')).length,
            forms: ev.filter(e => e.type === 'interaction' && e.details.includes('Form')).length
        };
    }

    _displayTimeline() {
        const eventsMarkup = this.session.events.map(e => this._formatTimelineEvent(e)).join('');
        return `
            <div class="timeline-content">
                <div class="timeline-wrapper">
                    ${eventsMarkup}
                </div>
            </div>
        `;
    }

    _formatTimelineEvent(ev) {
        const eventClass = ev.type === 'pageview' ? 'pageview' : 'interaction';
        const label = ev.type === 'pageview' ? 'Page View' : 'Interaction';

        return `
            <div class="timeline-item ${eventClass}">
                <div class="time">${this._getFormattedTime(ev.time)}</div>
                <div class="event-title">${label}</div>
                <div class="event-details">${ev.details}</div>
            </div>
        `;
    }

    _expandCollapseTimeline() {
        const timeline = document.querySelector('.activity-tracker-timeline');
        if (timeline) {
            timeline.classList.toggle('expanded');
        }
    }

    _updateUI() {
        const statsEl = document.querySelector('.session-stats');
        const timelineWrap = document.querySelector('.timeline-wrapper');

        if (statsEl) {
            statsEl.innerHTML = this._displayStats().replace(/<\/?section.*?>/g, '');
        }

        if (timelineWrap) {
            timelineWrap.innerHTML = this.session.events.map(e => this._formatTimelineEvent(e)).join('');
        }
    }

    // ---------------------- DURATION TIMER ----------------------
    _updateSessionDuration() {
        setInterval(() => {
            const durationEl = document.querySelector('.stat-value');
            if (durationEl) {
                durationEl.textContent = `${this._sessionMinutes()} min`;
            }
        }, 1000);
    }
}

// Node/Browser check
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ActivityTracker;
} else {
    window.ActivityTracker = ActivityTracker;
}

// Auto-start when page loads
document.addEventListener('DOMContentLoaded', () => new ActivityTracker());
