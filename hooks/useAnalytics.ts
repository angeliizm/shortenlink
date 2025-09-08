import { useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface AnalyticsEvent {
  site_slug: string;
  event_type: 'page_view' | 'unique_visitor' | 'session_start' | 'session_end' | 
              'action_click' | 'auth_login' | 'auth_logout' | 'dashboard_view' | 'dashboard_action';
  timestamp: string;
  session_id?: string;
  visitor_id?: string;
  path?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  country?: string;
  region?: string;
  action_index?: number;
  action_type?: string;
  dashboard_action?: string;
  ip_hash?: string;
  is_bot?: boolean;
  is_new_visitor?: boolean;
}

interface QueuedEvent {
  event: AnalyticsEvent;
  retries: number;
  timestamp: number;
}

class AnalyticsClient {
  private visitorId: string;
  private sessionId: string;
  private sessionStartTime: number;
  private lastActivityTime: number;
  private eventQueue: QueuedEvent[] = [];
  private isProcessing = false;
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes
  private maxRetries = 3;
  private retryDelay = 1000; // Start with 1 second
  private batchSize = 10;
  private flushInterval = 5000; // 5 seconds

  constructor() {
    this.visitorId = this.getOrCreateVisitorId();
    this.sessionId = this.getOrCreateSessionId();
    this.sessionStartTime = Date.now();
    this.lastActivityTime = Date.now();
    this.setupEventListeners();
    this.startQueueProcessor();
  }

  private getOrCreateVisitorId(): string {
    const stored = localStorage.getItem('analytics_visitor_id');
    if (stored) return stored;
    
    const newId = uuidv4();
    localStorage.setItem('analytics_visitor_id', newId);
    return newId;
  }

  private getOrCreateSessionId(): string {
    const stored = sessionStorage.getItem('analytics_session_id');
    const lastActivity = sessionStorage.getItem('analytics_last_activity');
    
    if (stored && lastActivity) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
      if (timeSinceLastActivity < this.sessionTimeout) {
        return stored;
      }
    }
    
    const newId = uuidv4();
    sessionStorage.setItem('analytics_session_id', newId);
    sessionStorage.setItem('analytics_last_activity', Date.now().toString());
    return newId;
  }

  private setupEventListeners(): void {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flushQueue();
      } else {
        this.checkSessionTimeout();
      }
    });

    // Track before unload
    window.addEventListener('beforeunload', () => {
      this.trackEvent({
        event_type: 'session_end',
        site_slug: window.location.hostname,
      });
      this.flushQueue(true); // Synchronous flush
    });

    // Periodic session activity update
    setInterval(() => {
      if (!document.hidden) {
        this.updateLastActivity();
      }
    }, 60000); // Every minute
  }

  private checkSessionTimeout(): void {
    const timeSinceLastActivity = Date.now() - this.lastActivityTime;
    if (timeSinceLastActivity > this.sessionTimeout) {
      // Session expired, create new session
      this.trackEvent({
        event_type: 'session_end',
        site_slug: window.location.hostname,
      });
      this.sessionId = this.getOrCreateSessionId();
      this.sessionStartTime = Date.now();
      this.trackEvent({
        event_type: 'session_start',
        site_slug: window.location.hostname,
      });
    }
  }

  private updateLastActivity(): void {
    this.lastActivityTime = Date.now();
    sessionStorage.setItem('analytics_last_activity', this.lastActivityTime.toString());
  }

  private getDeviceInfo(): { device_type: string; browser: string; os: string } {
    const userAgent = navigator.userAgent;
    
    // Detect device type
    let device_type = 'desktop';
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      device_type = /iPad|Tablet/i.test(userAgent) ? 'tablet' : 'mobile';
    }

    // Detect browser
    let browser = 'unknown';
    if (userAgent.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (userAgent.indexOf('Chrome') > -1) browser = 'Chrome';
    else if (userAgent.indexOf('Safari') > -1) browser = 'Safari';
    else if (userAgent.indexOf('Edge') > -1) browser = 'Edge';
    else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) browser = 'Opera';

    // Detect OS
    let os = 'unknown';
    if (userAgent.indexOf('Win') > -1) os = 'Windows';
    else if (userAgent.indexOf('Mac') > -1) os = 'MacOS';
    else if (userAgent.indexOf('Linux') > -1) os = 'Linux';
    else if (userAgent.indexOf('Android') > -1) os = 'Android';
    else if (userAgent.indexOf('iOS') > -1) os = 'iOS';

    return { device_type, browser, os };
  }

  private getUTMParams(): { utm_source?: string; utm_medium?: string; utm_campaign?: string } {
    const params = new URLSearchParams(window.location.search);
    const utm: any = {};
    
    if (params.get('utm_source')) utm.utm_source = params.get('utm_source')!;
    if (params.get('utm_medium')) utm.utm_medium = params.get('utm_medium')!;
    if (params.get('utm_campaign')) utm.utm_campaign = params.get('utm_campaign')!;
    
    return utm;
  }

  private shouldRespectDNT(): boolean {
    return navigator.doNotTrack === '1' || 
           (window as any).doNotTrack === '1' || 
           navigator.doNotTrack === 'yes';
  }

  private isBot(): boolean {
    const botPatterns = [
      'bot', 'crawler', 'spider', 'scraper', 'facebookexternalhit',
      'linkedinbot', 'whatsapp', 'slackbot', 'twitterbot'
    ];
    const userAgent = navigator.userAgent.toLowerCase();
    return botPatterns.some(pattern => userAgent.includes(pattern));
  }

  private async getGeoLocation(): Promise<{ country?: string; region?: string }> {
    try {
      // Use a lightweight IP geolocation service
      // This should be replaced with your preferred service
      const response = await fetch('https://ipapi.co/json/', {
        signal: AbortSignal.timeout(1000) // 1 second timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          country: data.country_code,
          region: data.region
        };
      }
    } catch {
      // Silently fail - geo location is nice to have but not critical
    }
    return {};
  }

  public async trackEvent(eventData: Partial<AnalyticsEvent>): Promise<void> {
    // Check DNT
    if (this.shouldRespectDNT()) {
      return;
    }

    // Check if bot
    if (this.isBot()) {
      eventData.is_bot = true;
    }

    // Get device info
    const deviceInfo = this.getDeviceInfo();
    
    // Get UTM params
    const utmParams = this.getUTMParams();
    
    // Get geo location (async, don't wait)
    const geoPromise = this.getGeoLocation();

    // Check if new visitor
    const isNewVisitor = !localStorage.getItem('analytics_returning_visitor');
    if (isNewVisitor && eventData.event_type === 'page_view') {
      localStorage.setItem('analytics_returning_visitor', 'true');
    }

    // Build complete event
    const event: AnalyticsEvent = {
      site_slug: eventData.site_slug || window.location.hostname,
      event_type: eventData.event_type || 'page_view',
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      visitor_id: this.visitorId,
      path: eventData.path || window.location.pathname,
      referrer: eventData.referrer || document.referrer || undefined,
      ...utmParams,
      ...deviceInfo,
      ...eventData,
      is_new_visitor: isNewVisitor,
    };

    // Add geo location when available
    geoPromise.then(geo => {
      if (geo.country) event.country = geo.country;
      if (geo.region) event.region = geo.region;
    });

    // Add to queue
    this.addToQueue(event);
    
    // Update last activity
    this.updateLastActivity();
  }

  private addToQueue(event: AnalyticsEvent): void {
    this.eventQueue.push({
      event,
      retries: 0,
      timestamp: Date.now()
    });
  }

  private startQueueProcessor(): void {
    setInterval(() => {
      if (!this.isProcessing && this.eventQueue.length > 0) {
        this.processQueue();
      }
    }, this.flushInterval);
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) return;
    
    this.isProcessing = true;
    
    // Get batch of events
    const batch = this.eventQueue.splice(0, this.batchSize);
    const failedEvents: QueuedEvent[] = [];

    for (const queuedEvent of batch) {
      try {
        await this.sendEvent(queuedEvent.event);
      } catch (error) {
        queuedEvent.retries++;
        if (queuedEvent.retries < this.maxRetries) {
          failedEvents.push(queuedEvent);
        }
      }
    }

    // Re-add failed events with exponential backoff
    if (failedEvents.length > 0) {
      setTimeout(() => {
        this.eventQueue.unshift(...failedEvents);
      }, this.retryDelay * Math.pow(2, failedEvents[0].retries));
    }

    this.isProcessing = false;
  }

  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
      keepalive: true // Ensure request completes even if page unloads
    });

    if (!response.ok) {
      throw new Error(`Failed to send analytics event: ${response.status}`);
    }
  }

  private flushQueue(synchronous = false): void {
    if (this.eventQueue.length === 0) return;

    if (synchronous) {
      // Use sendBeacon for synchronous sending (e.g., on page unload)
      const events = this.eventQueue.map(q => q.event);
      navigator.sendBeacon('/api/analytics/track/batch', JSON.stringify(events));
      this.eventQueue = [];
    } else {
      // Trigger async processing
      this.processQueue();
    }
  }

  public trackPageView(site_slug: string, path?: string): void {
    this.trackEvent({
      event_type: 'page_view',
      site_slug,
      path
    });
  }

  public trackActionClick(site_slug: string, actionIndex: number, actionType: string): void {
    this.trackEvent({
      event_type: 'action_click',
      site_slug,
      action_index: actionIndex,
      action_type: actionType
    });
  }

  public trackAuth(site_slug: string, type: 'login' | 'logout'): void {
    this.trackEvent({
      event_type: type === 'login' ? 'auth_login' : 'auth_logout',
      site_slug
    });
  }

  public trackDashboard(site_slug: string, action?: string): void {
    if (action) {
      this.trackEvent({
        event_type: 'dashboard_action',
        site_slug,
        dashboard_action: action
      });
    } else {
      this.trackEvent({
        event_type: 'dashboard_view',
        site_slug
      });
    }
  }
}

// Singleton instance
let analyticsClient: AnalyticsClient | null = null;

export function useAnalytics() {
  const clientRef = useRef<AnalyticsClient>();

  useEffect(() => {
    if (!clientRef.current) {
      if (!analyticsClient) {
        analyticsClient = new AnalyticsClient();
      }
      clientRef.current = analyticsClient;
    }
  }, []);

  const trackPageView = useCallback((site_slug: string, path?: string) => {
    clientRef.current?.trackPageView(site_slug, path);
  }, []);

  const trackActionClick = useCallback((site_slug: string, actionIndex: number, actionType: string) => {
    clientRef.current?.trackActionClick(site_slug, actionIndex, actionType);
  }, []);

  const trackAuth = useCallback((site_slug: string, type: 'login' | 'logout') => {
    clientRef.current?.trackAuth(site_slug, type);
  }, []);

  const trackDashboard = useCallback((site_slug: string, action?: string) => {
    clientRef.current?.trackDashboard(site_slug, action);
  }, []);

  return {
    trackPageView,
    trackActionClick,
    trackAuth,
    trackDashboard
  };
}