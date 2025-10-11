import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Layout } from './components/Layout';
import { Landing } from './pages/landing';
import { Assessment } from './pages/assessment';
import { Results } from './pages/results';
import { Overview } from './pages/overview';
import { Pricing } from './pages/pricing';
import { HowItWorks } from './pages/how-it-works';
import { Outcomes } from './pages/outcomes';
import { Contact } from './pages/contact';
import { Schedule } from './pages/schedule';
import { Confirmation } from './pages/confirmation';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/assessment" component={Assessment} />
          <Route path="/results/:id" component={Results} />
          <Route path="/overview" component={Overview} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/how-it-works" component={HowItWorks} />
          <Route path="/outcomes" component={Outcomes} />
          <Route path="/contact" component={Contact} />
          <Route path="/schedule" component={Schedule} />
          <Route path="/confirmation" component={Confirmation} />
          <Route>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-gray-600 mb-4">Page not found</p>
                <a href="/" className="text-blue-600 hover:underline">Go home</a>
              </div>
            </div>
          </Route>
        </Switch>
      </Layout>
    </QueryClientProvider>
  );
}

export default App;
