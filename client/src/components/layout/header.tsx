import { Link } from "wouter";
import { Brain } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3" data-testid="link-home">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Brain className="text-primary-foreground text-sm" />
          </div>
          <h1 className="text-xl font-serif font-semibold">AI Readiness Assessment</h1>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            Methodology
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
