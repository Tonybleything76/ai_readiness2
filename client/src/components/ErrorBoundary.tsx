import { Component, ReactNode } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">Something went wrong</CardTitle>
              </div>
              <CardDescription>
                We encountered an unexpected error. Don't worry, your data is safe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {import.meta.env.DEV && this.state.error && (
                <div className="bg-gray-100 p-3 rounded text-sm text-gray-700 font-mono overflow-auto max-h-40">
                  {this.state.error.toString()}
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={this.handleReset} className="flex-1">
                  Return Home
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
