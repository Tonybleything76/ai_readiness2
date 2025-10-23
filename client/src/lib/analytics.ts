declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const CONSENT_KEY = 'analytics_consent';

export const hasAnalyticsConsent = (): boolean => {
  if (typeof window === 'undefined') return false;
  const consent = localStorage.getItem(CONSENT_KEY);
  return consent === 'granted';
};

export const setAnalyticsConsent = (granted: boolean) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied');
  
  if (granted && import.meta.env.VITE_GA_MEASUREMENT_ID) {
    initGA();
  }
};

let gaInitialized = false;

export const initGA = () => {
  if (typeof window === 'undefined') return;
  if (gaInitialized) return;
  if (!hasAnalyticsConsent()) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) {
    console.warn('GA4 Measurement ID not configured. Analytics will be logged to console only.');
    return;
  }

  const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`);
  if (existingScript) {
    gaInitialized = true;
    return;
  }

  try {
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}', {
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure'
      });
    `;
    document.head.appendChild(script2);
    
    gaInitialized = true;
  } catch (error) {
    console.error('Failed to initialize Google Analytics:', error);
  }
};

export const trackPageView = (url: string) => {
  if (!hasAnalyticsConsent()) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  if (typeof window !== 'undefined' && window.gtag && measurementId) {
    window.gtag('config', measurementId, {
      page_path: url,
    });
  } else {
    console.log('[Analytics] Page view:', url);
  }
};

export const trackEvent = (
  action: string,
  category?: string,
  label?: string,
  value?: number,
  params?: Record<string, any>
) => {
  if (!hasAnalyticsConsent()) return;
  
  const eventData = {
    event_category: category,
    event_label: label,
    value: value,
    ...params,
  };

  if (typeof window !== 'undefined' && window.gtag && import.meta.env.VITE_GA_MEASUREMENT_ID) {
    window.gtag('event', action, eventData);
  } else {
    console.log('[Analytics] Event:', action, eventData);
  }
};
