import { Link } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Mail, Phone, MapPin, Send, MessageSquare, Calendar } from 'lucide-react';

export function Contact() {
  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Us',
      detail: 'contact@aireadiness.com',
      description: 'Send us an email anytime',
    },
    {
      icon: Phone,
      title: 'Call Us',
      detail: '+1 (555) 123-4567',
      description: 'Mon-Fri from 9am to 6pm EST',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      detail: '123 AI Street, Tech Valley, CA 94000',
      description: 'Our headquarters',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent" data-testid="text-contact-title">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto" data-testid="text-contact-subtitle">
            Have questions about our AI readiness assessment? We're here to help you get started on your AI transformation journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Contact Form */}
          <Card data-testid="card-contact-form">
            <CardHeader>
              <CardTitle className="text-2xl" data-testid="text-form-title">Send Us a Message</CardTitle>
              <CardDescription data-testid="text-form-description">
                Fill out the form below and we'll get back to you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" data-testid="label-name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="John Doe"
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <Label htmlFor="email" data-testid="label-email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="john@company.com"
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <Label htmlFor="company" data-testid="label-company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    placeholder="Your Company"
                    data-testid="input-company"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" data-testid="label-phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    data-testid="input-phone"
                  />
                </div>
                <div>
                  <Label htmlFor="message" data-testid="label-message">Message *</Label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    placeholder="Tell us how we can help..."
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    data-testid="input-message"
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" data-testid="button-submit">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card data-testid="card-contact-info">
              <CardHeader>
                <CardTitle className="text-2xl" data-testid="text-info-title">Contact Information</CardTitle>
                <CardDescription data-testid="text-info-description">
                  Choose the method that works best for you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactMethods.map((method, index) => {
                  const Icon = method.icon;
                  return (
                    <div key={index} className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors" data-testid={`item-contact-method-${index}`}>
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1" data-testid={`text-method-title-${index}`}>{method.title}</h3>
                        <p className="text-blue-600 font-medium mb-1" data-testid={`text-method-detail-${index}`}>{method.detail}</p>
                        <p className="text-sm text-gray-600" data-testid={`text-method-description-${index}`}>{method.description}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50" data-testid="card-quick-actions">
              <CardHeader>
                <CardTitle data-testid="text-quick-actions-title">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/assessment?tier=free">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-start-assessment">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Start Free Assessment
                  </Button>
                </Link>
                <a href="https://calendly.com" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-schedule-demo">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule a Demo
                  </Button>
                </a>
                <Link href="/pricing">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-view-pricing">
                    <Mail className="mr-2 h-4 w-4" />
                    View Pricing
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card data-testid="card-faq">
          <CardHeader>
            <CardTitle className="text-2xl" data-testid="text-faq-title">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div data-testid="faq-item-0">
                <h3 className="font-semibold mb-2">How long does the assessment take?</h3>
                <p className="text-gray-600">The free assessment takes approximately 10 minutes, while the comprehensive assessment takes 20-30 minutes.</p>
              </div>
              <div data-testid="faq-item-1">
                <h3 className="font-semibold mb-2">Can I save my progress and continue later?</h3>
                <p className="text-gray-600">Yes, your progress is automatically saved. You can return to complete the assessment at any time using the same device.</p>
              </div>
              <div data-testid="faq-item-2">
                <h3 className="font-semibold mb-2">Do I get a detailed report?</h3>
                <p className="text-gray-600">Yes, you'll receive a comprehensive report with your readiness score, dimensional breakdown, and actionable recommendations.</p>
              </div>
              <div data-testid="faq-item-3">
                <h3 className="font-semibold mb-2">Is my data secure?</h3>
                <p className="text-gray-600">Absolutely. We use industry-standard encryption and never share your data with third parties without your explicit consent.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
