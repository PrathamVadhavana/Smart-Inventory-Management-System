import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Package, ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4">
        <div className="container mx-auto">
          <Link to="/" className="flex items-center space-x-2">
            <Package className="w-8 h-8 text-accent" />
            <span className="text-2xl font-heading font-bold text-foreground">InMyStack</span>
          </Link>
        </div>
      </header>

      {/* 404 Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-md mx-auto">
          <div className="space-y-4">
            <h1 className="font-heading text-6xl font-bold text-foreground">404</h1>
            <h2 className="font-heading text-2xl font-semibold text-foreground">Page not found</h2>
            <p className="text-body text-muted-foreground">
              Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/" 
              className="bg-accent text-accent-foreground px-6 py-3 rounded-lg font-medium btn-hover flex items-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <button 
              onClick={() => window.history.back()}
              className="border border-border text-foreground px-6 py-3 rounded-lg font-medium btn-hover flex items-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
          </div>

          <div className="pt-8 text-sm text-muted-foreground">
            Need help? <Link to="/" className="text-accent hover:text-accent/80 transition-colors">Contact our support team</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
