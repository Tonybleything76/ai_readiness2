import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Landing } from './pages/landing';
import { Assessment } from './pages/assessment';
import { Results } from './pages/results';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/assessment" component={Assessment} />
        <Route path="/results/:id" component={Results} />
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
    </QueryClientProvider>
  );
}

export default App;
