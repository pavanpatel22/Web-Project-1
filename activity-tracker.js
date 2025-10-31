class ActivityTracker {

    constructor() {
        // constants
        this.KEY = 'activity-tracker-data';
        this.SESSION_LIMIT = 60 * 60 * 1000; // 1 hr

        this._startSession();
        this._displayWidget();
        this._recordPageView();
        this._attachListeners();
        this._updateSessionDuration();
    }

    // ---------------------- SESSION SETUP ----------------------
    _startSession() {
        const saved = localStorage.getItem(this.KEY);
        const now = Date.now();

        if (saved) {
            try {
                const data = JSON.parse(saved);
                const lastEvent = data.events.length
                    ? Math.max(...data.events.map(e => e.time))
                    : data.startedAt;

                // reuse session if still active
                if (now - lastEvent < this.SESSION_LIMIT) {
                    this.session = data;
                    return;
                }
            } catch (err) {
                console.warn('Could not load existing session', err);
            }
        }

        // create new session
        this.session = {
            sessionId: this._createSessionId(),
            startedAt: now,
            events: []
        };
        this._persistSession();
    }

    _createSessionId() {
        const t = Date.now();
        const r = Math.random().toString(36).substring(2, 7);
        return `session_${t}_${r}`;
    }

    _persistSession() {
        localStorage.setItem(this.KEY, JSON.stringify(this.session));
    }

    // ---------------------- TIME HELPERS ----------------------
    _getFormattedTime(ts) {
        const d = new Date(ts);
        return [
            String(d.getHours()).padStart(2, '0'),
            String(d.getMinutes()).padStart(2, '0'),
            String(d.getSeconds()).padStart(2, '0')
        ].join(':');
    }

    _sessionMinutes() {
        return Math.floor((Date.now() - this.session.startedAt) / 60000);
    }

    // ---------------------- EVENT LOGGING ----------------------
    _recordPageView() {
        const page = window.location.pathname.split('/').pop() || 'index.html';
        this._logEvent('pageview', `Visited ${page}`, page);
    }

    _logEvent(type, details, page = null) {
        const entry = {
            type,
            details,
            time: Date.now()
        };
        if (page) entry.page = page;
        this.session.events.push(entry);
        this._persistSession();
        this._updateUI();
    }

    _attachListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-primary')) {
                this._logEvent('interaction', 'Clicked link: Shop Now');
            }
            if (e.target.classList.contains('activity-tracker-button')) {
                this._expandCollapseTimeline();
            }
        }, true);

        document.addEventListener('submit', () => {
            this._logEvent('interaction', 'Form submitted');
        }, true);
    }

    // ---------------------- WIDGET UI ----------------------
    _displayWidget() {
        const html = `
            <div class="activity-tracker-widget">
                <button class="activity-tracker-button" title="View activity">🕒</button>
                <aside class="activity-tracker-timeline">
                    ${this._displayHeader()}
                    ${this._displayStats()}
                    ${this._displayTimeline()}
                </aside>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
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
        const events = this.session.events;
        return {
            duration: this._sessionMinutes(),
            pages: events.filter(e => e.type === 'pageview').length,
            clicks: events.filter(e => e.type === 'interaction' && e.details.includes('Click')).length,
            forms: events.filter(e => e.type === 'interaction' && e.details.includes('Form')).length
        };
    }

    _displayTimeline() {
        const items = this.session.events.map(ev => this._formatTimelineEvent(ev)).join('');
        return `
            <div class="timeline-content">
                <div class="timeline-wrapper">
                    ${items}
                </div>
            </div>
        `;
    }

    _formatTimelineEvent(ev) {
        const cls = ev.type === 'pageview' ? 'pageview' : 'interaction';
        const label = ev.type === 'pageview' ? 'Page View' : 'Interaction';
        return `
            <div class="timeline-item ${cls}">
                <div class="time">${this._getFormattedTime(ev.time)}</div>
                <div class="event-title">${label}</div>
                <div class="event-details">${ev.details}</div>
            </div>
        `;
    }

    _expandCollapseTimeline() {
        const tl = document.querySelector('.activity-tracker-timeline');
        if (tl) tl.classList.toggle('expanded');
    }

    _updateUI() {
        const stats = document.querySelector('.session-stats');
        const wrap = document.querySelector('.timeline-wrapper');
        if (stats) stats.innerHTML = this._displayStats().replace(/<\/?section.*?>/g, '');
        if (wrap) wrap.innerHTML = this.session.events.map(e => this._formatTimelineEvent(e)).join('');
    }

    // ---------------------- DURATION TIMER ----------------------
    _updateSessionDuration() {
        setInterval(() => {
            const el = document.querySelector('.stat-value');
            if (el) el.textContent = `${this._sessionMinutes()} min`;
        }, 1000);
    }
}

// Node/Browser compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ActivityTracker;
} else {
    window.ActivityTracker = ActivityTracker;
}

// Initialize when ready
document.addEventListener('DOMContentLoaded', () => new ActivityTracker());
