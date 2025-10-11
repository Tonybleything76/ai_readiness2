import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar, CheckCircle2, Clock, Video } from 'lucide-react';
import { CALENDLY_URL } from '../config/calendly';

export function Schedule() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const head = document.querySelector('head');
    const existingScript = head?.querySelector('script[src*="calendly"]');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.setAttribute('src', 'https://assets.calendly.com/assets/external/widget.js');
      script.setAttribute('type', 'text/javascript');
      script.setAttribute('async', 'true');
      head?.appendChild(script);
    }

    const handleCalendlyEvent = (e: MessageEvent) => {
      if (e.data.event === 'calendly.event_scheduled') {
        setLocation('/confirmation');
      }
    };

    window.addEventListener('message', handleCalendlyEvent);

    return () => {
      window.removeEventListener('message', handleCalendlyEvent);
    };
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" data-testid="text-schedule-title">
            Schedule Your Consultation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="text-schedule-subtitle">
            Book a personalized session with our AI readiness experts to discuss your assessment results and create an actionable transformation roadmap
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* What to Expect */}
          <Card data-testid="card-expect-1">
            <CardHeader>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Expert Guidance</CardTitle>
              <CardDescription>
                Connect with AI transformation specialists who understand your industry and business needs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card data-testid="card-expect-2">
            <CardHeader>
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle className="text-lg">Personalized Insights</CardTitle>
              <CardDescription>
                Review your assessment results in detail and get customized recommendations for your organization
              </CardDescription>
            </CardHeader>
          </Card>

          <Card data-testid="card-expect-3">
            <CardHeader>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Action Roadmap</CardTitle>
              <CardDescription>
                Walk away with a clear, prioritized plan to advance your AI readiness and transformation journey
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Calendly Widget */}
        <Card className="mb-8" data-testid="card-calendly-widget">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Select a Time That Works for You
            </CardTitle>
            <CardDescription>
              Choose from available time slots for a 30-minute consultation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="calendly-inline-widget" 
              data-url={`${CALENDLY_URL}?hide_event_type_details=1&hide_gdpr_banner=1`}
              style={{ minWidth: '320px', height: '700px' }}
              data-testid="calendly-widget"
            />
          </CardContent>
        </Card>

        {/* Session Details */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50" data-testid="card-session-details">
          <CardHeader>
            <CardTitle>What Happens After Booking?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Confirmation Email</h4>
                  <p className="text-gray-600 text-sm">
                    You'll receive an email confirmation with calendar invite and video call link
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Pre-Session Preparation</h4>
                  <p className="text-gray-600 text-sm">
                    We'll review your assessment results and prepare customized insights for your session
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Consultation Session</h4>
                  <p className="text-gray-600 text-sm">
                    Join the video call to discuss your results, ask questions, and develop your action plan
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Follow-Up Resources</h4>
                  <p className="text-gray-600 text-sm">
                    Receive a summary of recommendations and resources to support your AI transformation
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
