import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { X, Cookie } from 'lucide-react';
import { setAnalyticsConsent } from '../lib/analytics';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('analytics_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setAnalyticsConsent(true);
    setIsVisible(false);
  };

  const handleDecline = () => {
    setAnalyticsConsent(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-5">
      <Card className="shadow-lg border-2" data-testid="card-cookie-consent">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Privacy & Analytics</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleDecline}
              data-testid="button-close-consent"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <CardDescription>
            We use analytics to understand how visitors use our site and improve your experience.
          </CardDescription>
          
          {showDetails && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md space-y-2" data-testid="div-consent-details">
              <p className="font-semibold">What we track:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Page views and navigation patterns</li>
                <li>CTA button clicks and conversions</li>
                <li>Assessment starts and completions</li>
                <li>A/B test variant assignment</li>
              </ul>
              <p className="mt-2">
                <strong>Privacy:</strong> We anonymize IP addresses and do not collect personally identifiable information. 
                You can change your preference at any time.
              </p>
            </div>
          )}
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
            data-testid="button-toggle-details"
          >
            {showDetails ? 'Hide details' : 'Learn more'}
          </button>
        </CardContent>
        <CardFooter className="flex gap-2 pt-2">
          <Button
            onClick={handleAccept}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            data-testid="button-accept-cookies"
          >
            Accept
          </Button>
          <Button
            onClick={handleDecline}
            variant="outline"
            className="flex-1"
            data-testid="button-decline-cookies"
          >
            Decline
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
