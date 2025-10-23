import { Link } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { CheckCircle2, Calendar, Mail, Home, FileText } from 'lucide-react';

export function Confirmation() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" data-testid="icon-success" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gray-900" data-testid="text-confirmation-title">
            Consultation Successfully Scheduled!
          </h1>
          <p className="text-xl text-gray-600" data-testid="text-confirmation-subtitle">
            We're excited to help you advance your AI readiness journey
          </p>
        </div>

        {/* Confirmation Details */}
        <Card className="mb-8 border-l-4 border-l-green-500" data-testid="card-confirmation-details">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              What's Next?
            </CardTitle>
            <CardDescription>
              Here's what to expect leading up to your consultation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <Mail className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Check Your Email</h3>
                <p className="text-gray-600 text-sm">
                  You'll receive a confirmation email with:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Calendar invitation (.ics file)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Video conference link
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Session preparation tips
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-lg">
              <FileText className="h-6 w-6 text-indigo-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">We'll Review Your Assessment</h3>
                <p className="text-gray-600 text-sm">
                  Our team will analyze your assessment results before the session to provide the most relevant and actionable insights for your organization.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Join Your Consultation</h3>
                <p className="text-gray-600 text-sm">
                  At your scheduled time, click the video link to join. Come prepared with questions about your assessment results and AI transformation goals.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preparation Tips */}
        <Card className="mb-8" data-testid="card-preparation-tips">
          <CardHeader>
            <CardTitle>How to Prepare for Your Session</CardTitle>
            <CardDescription>Get the most value from your consultation</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Review your results:</strong> Take another look at your assessment scores and identify areas where you need clarity
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Prepare questions:</strong> Think about your biggest AI challenges and what you want to achieve
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Involve stakeholders:</strong> Consider inviting key decision-makers to join the call
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Test your tech:</strong> Ensure your camera and microphone are working before the session
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Need to Reschedule */}
        <Card className="mb-8 bg-gray-50" data-testid="card-reschedule-info">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              Need to reschedule? Use the link in your confirmation email to select a different time. Questions? Contact us at{' '}
              <a href="mailto:support@aireadiness.com" className="text-blue-600 hover:underline" data-testid="link-support-email">
                support@aireadiness.com
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" data-testid="button-home">
              <Home className="mr-2 h-5 w-5" />
              Return to Home
            </Button>
          </Link>
          <Link href="/assessment">
            <Button size="lg" variant="outline" data-testid="button-assessment">
              Take Another Assessment
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
