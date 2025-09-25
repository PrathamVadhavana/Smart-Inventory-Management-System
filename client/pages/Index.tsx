import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Star,
  Shield,
  BarChart3,
  Zap,
  Package,
  ScanLine,
  RefreshCw,
  FileText,
  Users,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Mail,
  ArrowRight,
  Play,
  Check,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Layers,
  Clock,
  Award,
  Eye,
  Lock,
  Minus,
  Plus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Intersection Observer Hook for scroll animations
const useIntersectionObserver = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, ...options },
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return [ref, isVisible] as const;
};

// Counter animation hook
const useCounter = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const [shouldStart, setShouldStart] = useState(false);

  useEffect(() => {
    if (!shouldStart) return;

    let startTime: number;
    const animateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    requestAnimationFrame(animateCount);
  }, [shouldStart, end, duration]);

  return [count, setShouldStart] as const;
};

// Trust Bar Component
const TrustBar = () => (
  <div className="bg-primary text-primary-foreground py-2 text-center">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-center space-x-8 text-sm">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4" />
          <span>ISO 27001</span>
        </div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4" />
          <span>99.9% uptime</span>
        </div>
        <div className="flex items-center space-x-2">
          <Lock className="w-4 h-4" />
          <span>GDPR-ready</span>
        </div>
      </div>
    </div>
  </div>
);

// Header Component
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-sm shadow-sm"
          : "bg-background"
      }`}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-8 h-8 text-accent" />
            <span className="text-2xl font-heading font-bold text-foreground">
              InMyStack
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-foreground hover:text-accent transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-foreground hover:text-accent transition-colors"
            >
              How it Works
            </a>
            <a
              href="#integrations"
              className="text-foreground hover:text-accent transition-colors"
            >
              Integrations
            </a>
            <a
              href="#pricing"
              className="text-foreground hover:text-accent transition-colors"
            >
              Pricing
            </a>
            <a
              href="#security"
              className="text-foreground hover:text-accent transition-colors"
            >
              Security
            </a>
            <a
              href="#faq"
              className="text-foreground hover:text-accent transition-colors"
            >
              FAQ
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="text-foreground hover:text-accent transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-accent text-accent-foreground px-6 py-2 rounded-lg font-medium btn-hover"
            >
              Start Free
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background border-t shadow-lg">
            <div className="flex flex-col space-y-4 p-4">
              <a
                href="#features"
                className="text-foreground hover:text-accent transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-foreground hover:text-accent transition-colors"
              >
                How it Works
              </a>
              <a
                href="#integrations"
                className="text-foreground hover:text-accent transition-colors"
              >
                Integrations
              </a>
              <a
                href="#pricing"
                className="text-foreground hover:text-accent transition-colors"
              >
                Pricing
              </a>
              <a
                href="#security"
                className="text-foreground hover:text-accent transition-colors"
              >
                Security
              </a>
              <a
                href="#faq"
                className="text-foreground hover:text-accent transition-colors"
              >
                FAQ
              </a>
              <Link
                to="/login"
                className="text-foreground hover:text-accent transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-accent text-accent-foreground px-6 py-2 rounded-lg font-medium w-full text-center"
              >
                Start Free
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

// Hero Section
const HeroSection = () => {
  const [heroRef, isHeroVisible] = useIntersectionObserver();

  return (
    <section ref={heroRef} className="py-20 lg:py-32 overflow-hidden relative">
      {/* Warehouse Background */}
      <div
        className="absolute inset-0 opacity-60 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url(https://images.pexels.com/photos/12706241/pexels-photo-12706241.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280)",
        }}
      />
      <div className="absolute inset-0 bg-background/75" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div
            className={`space-y-8 ${isHeroVisible ? "animate-slide-up" : "opacity-0"}`}
          >
            <h1 className="font-heading text-h1 font-bold text-foreground">
              Never Run Out.
              <br />
              <span className="text-accent">Always Know.</span>
            </h1>
            <p className="text-body text-muted-foreground max-w-xl">
              Real-time stock, smart reorders, and analytics—free to start.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/signup"
                className="bg-accent text-accent-foreground px-8 py-4 rounded-xl font-medium text-lg btn-hover text-center"
              >
                Start Free
              </Link>
              <button className="border border-border text-foreground px-8 py-4 rounded-xl font-medium text-lg btn-hover flex items-center justify-center space-x-2">
                <Play className="w-5 h-5" />
                <span>View Demo</span>
              </button>
            </div>

            {/* Social Proof */}
            <div className="pt-8">
              <p className="text-sm text-muted-foreground mb-4">
                Trusted by teams at
              </p>
              <div className="flex items-center space-x-8 opacity-60">
                <span className="text-lg font-semibold">Shopify</span>
                <span className="text-lg font-semibold">WooCommerce</span>
                <span className="text-lg font-semibold">QuickBooks</span>
                <span className="text-lg font-semibold">Excel</span>
              </div>
            </div>
          </div>

          <div
            className={`relative ${isHeroVisible ? "animate-fade-in" : "opacity-0"}`}
            style={{ animationDelay: "200ms" }}
          >
            <div className="bg-card rounded-2xl p-6 shadow-xl border relative overflow-hidden">
              {/* Subtle warehouse pattern in dashboard */}
              <div className="absolute inset-0 warehouse-pattern opacity-20" />

              <div className="space-y-10 relative z-10 p-6">
                {/* Header Section with Title and Live Status Indicator */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold text-lg">
                      Warehouse Overview
                    </h3>
                  </div>
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse-soft"></div>
                </div>

                {/* Grid of Key Performance Indicators (KPIs) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Fill Rate Card */}
                  <div className="bg-success/10 p-4 rounded-lg text-center border border-success/20 shadow-sm">
                    <div className="text-2xl font-bold text-success">99.2%</div>
                    <div className="text-sm text-muted-foreground">
                      Fill Rate
                    </div>
                  </div>
                  {/* Carrying Cost Card */}
                  <div className="bg-accent/10 p-4 rounded-lg text-center border border-accent/20 shadow-sm">
                    <div className="text-2xl font-bold text-accent">↓24%</div>
                    <div className="text-sm text-muted-foreground">
                      Carrying Cost
                    </div>
                  </div>
                  {/* Forecast Accuracy Card */}
                  <div className="bg-warning/10 p-4 rounded-lg text-center border border-warning/20 shadow-sm">
                    <div className="text-2xl font-bold text-warning">↑18%</div>
                    <div className="text-sm text-muted-foreground">
                      Forecast Accuracy
                    </div>
                  </div>
                </div>

                {/* Floating stat chips - positioned absolutely within the relative container */}
                <div className="absolute -top-4 -right-4 bg-success text-success-foreground px-3 py-2 rounded-lg text-sm font-medium shadow-lg animate-fade-in flex items-center space-x-1">
                  <Package className="w-4 h-4" />
                  <span>Stockouts ↓ 38%</span>
                </div>
                <div
                  className="absolute top-[130px] -left-4 bg-accent text-accent-foreground px-3 py-2 rounded-lg text-sm font-medium shadow-lg animate-fade-in flex items-center space-x-1"
                  style={{ animationDelay: "400ms" }}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Forecast ↑ 22%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Pain → Promise Strip
const PainPromiseSection = () => {
  const [ref, isVisible] = useIntersectionObserver();

  const painPoints = [
    {
      icon: <AlertTriangle className="w-8 h-8 text-warning" />,
      pain: "Overselling",
      promise: "Real-time sync prevents oversells",
    },
    {
      icon: <FileText className="w-8 h-8 text-warning" />,
      pain: "Manual errors",
      promise: "Automated processes eliminate mistakes",
    },
    {
      icon: <Package className="w-8 h-8 text-warning" />,
      pain: "Dead stock",
      promise: "Smart analytics optimize inventory",
    },
  ];

  return (
    <section ref={ref} className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {painPoints.map((item, index) => (
            <div
              key={index}
              className={`text-center space-y-4 ${isVisible ? "animate-scale-in" : "opacity-0"}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-center">{item.icon}</div>
              <div>
                <p className="text-muted-foreground line-through">
                  {item.pain}
                </p>
                <p className="font-semibold text-foreground">{item.promise}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Feature Grid
const FeatureGrid = () => {
  const [ref, isVisible] = useIntersectionObserver();

  const features = [
    {
      icon: <RefreshCw className="w-8 h-8 text-accent" />,
      title: "Real-time Sync",
      description:
        "Instant updates across all your sales channels and locations.",
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-accent" />,
      title: "Smart Reorder Points",
      description: "AI-powered thresholds that adapt to your sales patterns.",
    },
    {
      icon: <MapPin className="w-8 h-8 text-accent" />,
      title: "Multi-Location",
      description: "Manage inventory across warehouses, stores, and channels.",
    },
    {
      icon: <ScanLine className="w-8 h-8 text-accent" />,
      title: "Barcode/QR",
      description: "Quick scanning for fast stock counts and updates.",
    },
    {
      icon: <Layers className="w-8 h-8 text-accent" />,
      title: "SKU Bundles/Kits",
      description: "Track complex products and component inventory.",
    },
    {
      icon: <FileText className="w-8 h-8 text-accent" />,
      title: "Audit & Logs",
      description: "Complete trail of all inventory movements and changes.",
    },
  ];

  return (
    <section id="features" ref={ref} className="py-20 relative">
      <div className="warehouse-pattern absolute inset-0" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-heading text-h2 font-semibold text-foreground">
            Everything you need
          </h2>
          <p className="text-body text-muted-foreground max-w-2xl mx-auto">
            Powerful features that scale with your business, from startup to
            enterprise.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-card p-6 rounded-2xl border card-hover ${isVisible ? "animate-scale-in" : "opacity-0"}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-4">
                <div>{feature.icon}</div>
                <h3 className="font-heading text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
                <a
                  href="#"
                  className="inline-flex items-center text-accent hover:text-accent/80 transition-colors"
                >
                  Learn more <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// How It Works
const HowItWorksSection = () => {
  const [ref, isVisible] = useIntersectionObserver();

  const steps = [
    {
      number: "01",
      title: "Connect channels",
      description: "Link your Shopify, WooCommerce, or custom API in minutes.",
    },
    {
      number: "02",
      title: "Import SKUs & set thresholds",
      description:
        "Automatically import products and configure smart reorder points.",
    },
    {
      number: "03",
      title: "Automate reorders & track analytics",
      description:
        "Sit back as the system manages inventory and provides insights.",
    },
  ];

  return (
    <section id="how-it-works" ref={ref} className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-heading text-h2 font-semibold text-foreground">
            How it works
          </h2>
          <p className="text-body text-muted-foreground max-w-2xl mx-auto">
            Get up and running in under 10 minutes with our simple 3-step
            process.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-16 left-0 right-0 h-0.5 bg-border hidden lg:block">
              <div
                className={`h-full bg-accent transition-all duration-1000 ${isVisible ? "w-full" : "w-0"}`}
              ></div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`text-center space-y-4 ${isVisible ? "animate-slide-up" : "opacity-0"}`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="w-16 h-16 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-heading font-bold text-xl mx-auto relative z-10">
                    {step.number}
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Interactive KPI Highlights
const KPISection = () => {
  const [ref, isVisible] = useIntersectionObserver();
  const [fillRate, setFillRateStart] = useCounter(99.2, 2000);
  const [carryingCost, setCarryingCostStart] = useCounter(24, 2000);
  const [forecastAccuracy, setForecastAccuracyStart] = useCounter(18, 2000);

  useEffect(() => {
    if (isVisible) {
      setFillRateStart(true);
      setCarryingCostStart(true);
      setForecastAccuracyStart(true);
    }
  }, [isVisible]);

  return (
    <section ref={ref} className="py-20 relative">
      <div className="warehouse-boxes absolute inset-0" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-heading text-h2 font-semibold text-foreground">
            Real results
          </h2>
          <p className="text-body text-muted-foreground max-w-2xl mx-auto">
            See the impact on your business metrics with our smart inventory
            management.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div
            className={`text-center space-y-2 ${isVisible ? "animate-scale-in" : "opacity-0"}`}
          >
            <div className="text-4xl font-bold text-success">
              {fillRate.toFixed(1)}%
            </div>
            <div className="text-lg font-medium text-foreground">Fill Rate</div>
            <div className="text-sm text-muted-foreground">
              Never miss a sale again
            </div>
          </div>

          <div
            className={`text-center space-y-2 ${isVisible ? "animate-scale-in" : "opacity-0"}`}
            style={{ animationDelay: "200ms" }}
          >
            <div className="text-4xl font-bold text-accent">
              ↓{carryingCost}%
            </div>
            <div className="text-lg font-medium text-foreground">
              Carrying Cost
            </div>
            <div className="text-sm text-muted-foreground">
              Reduce excess inventory
            </div>
          </div>

          <div
            className={`text-center space-y-2 ${isVisible ? "animate-scale-in" : "opacity-0"}`}
            style={{ animationDelay: "400ms" }}
          >
            <div className="text-4xl font-bold text-warning">
              ↑{forecastAccuracy}%
            </div>
            <div className="text-lg font-medium text-foreground">
              Forecast Accuracy
            </div>
            <div className="text-sm text-muted-foreground">
              Better demand planning
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Integrations Carousel
const IntegrationsSection = () => {
  const [ref, isVisible] = useIntersectionObserver();
  const [currentIndex, setCurrentIndex] = useState(0);

  const integrations = [
    { name: "Shopify", logo: "📦" },
    { name: "WooCommerce", logo: "🛒" },
    { name: "BigCommerce", logo: "🏪" },
    { name: "Magento", logo: "🎯" },
    { name: "QuickBooks", logo: "📊" },
    { name: "Xero", logo: "💼" },
    { name: "Amazon", logo: "📋" },
    { name: "eBay", logo: "🏷️" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(
        (prev) => (prev + 1) % Math.ceil(integrations.length / 4),
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="integrations" ref={ref} className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-heading text-h2 font-semibold text-foreground">
            Works with your tools
          </h2>
          <p className="text-body text-muted-foreground max-w-2xl mx-auto">
            Seamlessly integrate with the platforms you already use.
          </p>
        </div>

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {Array.from({ length: Math.ceil(integrations.length / 4) }).map(
              (_, groupIndex) => (
                <div key={groupIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-4 gap-8">
                    {integrations
                      .slice(groupIndex * 4, (groupIndex + 1) * 4)
                      .map((integration, index) => (
                        <div
                          key={index}
                          className="text-center space-y-4 opacity-60 hover:opacity-100 transition-opacity duration-300"
                        >
                          <div className="text-4xl">{integration.logo}</div>
                          <div className="font-medium text-foreground">
                            {integration.name}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="flex justify-center space-x-2 mt-8">
          {Array.from({ length: Math.ceil(integrations.length / 4) }).map(
            (_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex
                    ? "bg-accent"
                    : "bg-muted-foreground/30"
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ),
          )}
        </div>
      </div>
    </section>
  );
};

// Security & Compliance
const SecuritySection = () => {
  const [ref, isVisible] = useIntersectionObserver();

  const securityFeatures = [
    "SOC2 Type II compliant",
    "Role-based access control (RBAC)",
    "Single sign-on (SSO) support",
    "Two-factor authentication (2FA)",
    "Complete audit trails",
    "Encryption at rest and in transit",
  ];

  return (
    <section id="security" ref={ref} className="py-20 relative">
      <div className="warehouse-pattern absolute inset-0" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div
            className={`space-y-8 ${isVisible ? "animate-slide-up" : "opacity-0"}`}
          >
            <div className="space-y-4">
              <h2 className="font-heading text-h2 font-semibold text-foreground">
                Enterprise-grade security
              </h2>
              <p className="text-body text-muted-foreground">
                Your data is protected with the highest security standards and
                compliance certifications.
              </p>
            </div>

            <div className="space-y-4">
              {securityFeatures.map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 ${isVisible ? "animate-fade-in" : "opacity-0"}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`flex justify-center ${isVisible ? "animate-scale-in" : "opacity-0"}`}
          >
            <div className="relative">
              <div className="w-48 h-48 bg-accent/10 rounded-full flex items-center justify-center">
                <Shield className="w-24 h-24 text-accent animate-pulse-soft" />
              </div>
              <div className="absolute inset-0 border-4 border-accent/20 rounded-full animate-pulse-soft"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Testimonials Carousel
const TestimonialsSection = () => {
  const [ref, isVisible] = useIntersectionObserver();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Operations Manager",
      company: "TechStyle Fashion",
      rating: 5,
      quote:
        "InMyStack reduced our stockouts by 40% in the first month. The smart reorder points are incredibly accurate.",
    },
    {
      name: "Michael Rodriguez",
      role: "Inventory Director",
      company: "HomeGoods Plus",
      rating: 5,
      quote:
        "Finally, inventory management that actually works. Our carrying costs dropped 30% while maintaining perfect availability.",
    },
    {
      name: "Emma Thompson",
      role: "E-commerce Manager",
      company: "Lifestyle Brands Co",
      rating: 5,
      quote:
        "The real-time sync across all our channels is a game-changer. No more overselling or manual reconciliation.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={ref} className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-heading text-h2 font-semibold text-foreground">
            What our customers say
          </h2>
          <p className="text-body text-muted-foreground max-w-2xl mx-auto">
            Join thousands of businesses that trust InMyStack with their
            inventory.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <div className="bg-card p-8 rounded-2xl border text-center space-y-6 mx-4">
                    <div className="flex justify-center space-x-1">
                      {Array.from({ length: testimonial.rating }).map(
                        (_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 fill-warning text-warning"
                          />
                        ),
                      )}
                    </div>

                    <blockquote className="text-lg text-foreground">
                      "{testimonial.quote}"
                    </blockquote>

                    <div className="space-y-2">
                      <div className="font-semibold text-foreground">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentTestimonial
                    ? "bg-accent"
                    : "bg-muted-foreground/30"
                }`}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Pricing Section
const PricingSection = () => {
  const [ref, isVisible] = useIntersectionObserver();
  const [isYearly, setIsYearly] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    name: string;
    amount: number;
  }>({ name: "", amount: 0 });

  const merchantVpa =
    (import.meta.env.VITE_MERCHANT_UPI as string) || "example@upi";
  const merchantName =
    (import.meta.env.VITE_MERCHANT_NAME as string) || "InMyStack";

  const buildUpiLink = (amount: number, note: string) => {
    const params = new URLSearchParams({
      pa: merchantVpa,
      pn: merchantName,
      am: String(amount),
      cu: "INR",
      tn: note,
    });
    return `upi://pay?${params.toString()}`;
  };

  const plans = [
    {
      name: "Free",
      price: { monthly: 0, yearly: 0 },
      description: "Perfect for getting started",
      features: [
        "Up to 500 SKUs",
        "1 location",
        "Email support",
        "Basic reporting",
        "Manual reorders",
      ],
      cta: "Start Free",
      popular: false,
    },
    {
      name: "Pro",
      price: { monthly: 4300, yearly: 3500 },
      description: "For growing businesses",
      features: [
        "Up to 5,000 SKUs",
        "5 locations",
        "Priority support",
        "Advanced forecasting",
        "Smart reorder points",
        "API access",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Business",
      price: { monthly: 13000, yearly: 10500 },
      description: "For established companies",
      features: [
        "Unlimited SKUs",
        "Unlimited locations",
        "SSO integration",
        "Audit logs",
        "Dedicated CSM",
        "Custom integrations",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <section id="pricing" ref={ref} className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-heading text-h2 font-semibold text-foreground">
            Simple, transparent pricing
          </h2>
          <p className="text-body text-muted-foreground max-w-2xl mx-auto">
            Start free and scale as you grow. No hidden fees or setup costs.
          </p>

          <div className="flex items-center justify-center space-x-4 mt-8">
            <span
              className={`text-sm ${!isYearly ? "text-foreground font-medium" : "text-muted-foreground"}`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isYearly ? "bg-accent" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                  isYearly ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm ${isYearly ? "text-foreground font-medium" : "text-muted-foreground"}`}
            >
              Yearly
            </span>
            {isYearly && (
              <span className="bg-success text-success-foreground px-2 py-1 rounded-md text-xs font-medium">
                Save 20%
              </span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-card p-8 rounded-2xl border relative ${
                plan.popular ? "border-accent shadow-lg scale-105" : ""
              } ${isVisible ? "animate-scale-in" : "opacity-0"}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-heading text-xl font-semibold text-foreground">
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-4xl font-bold text-foreground">
                      ₹{isYearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    <span className="text-muted-foreground">
                      /{isYearly ? "month" : "month"}
                    </span>
                  </div>
                  {isYearly && plan.price.yearly !== plan.price.monthly && (
                    <p className="text-sm text-muted-foreground">
                      Billed annually (₹{plan.price.yearly * 12}/year)
                    </p>
                  )}
                </div>

                <button
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                    plan.popular
                      ? "bg-accent text-accent-foreground btn-hover"
                      : "border border-border text-foreground hover:bg-muted"
                  }`}
                  onClick={() => {
                    // Business plan -> contact sales
                    if (plan.name === "Business") {
                      window.location.href =
                        "mailto:sales@inmystack.app?subject=Contact%20Sales%20-%20Business%20Plan";
                      return;
                    }

                    // Free plan -> navigate to signup without payment
                    if (plan.name === "Free") {
                      // Use query param so signup can preselect plan
                      window.location.href = `/signup?plan=Free`;
                      return;
                    }

                    // Paid plans -> open payment modal
                    const amount = isYearly
                      ? plan.price.yearly
                      : plan.price.monthly;
                    setSelectedPlan({ name: plan.name, amount });
                    setPaymentOpen(true);
                  }}
                >
                  {plan.cta}
                </button>

                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center space-x-3"
                    >
                      <Check className="w-4 h-4 text-success flex-shrink-0" />
                      <span className="text-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Lightweight payment modal using native UPI intent/QR fallback */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan.amount > 0
                ? "Complete payment"
                : "No payment required"}
            </DialogTitle>
            <DialogDescription>
              {selectedPlan.amount > 0
                ? `Plan: ${selectedPlan.name} • Amount: ₹${selectedPlan.amount.toLocaleString()}`
                : `You selected the ${selectedPlan.name} plan which is free — no payment is required.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPlan.amount > 0 ? (
              <>
                <a
                  href={buildUpiLink(
                    selectedPlan.amount,
                    `${selectedPlan.name} plan`,
                  )}
                  className="w-full inline-flex items-center justify-center h-11 rounded-lg bg-accent text-accent-foreground btn-hover"
                >
                  Pay with UPI (PhonePe/Paytm/Google Pay)
                </a>
                <div className="text-xs text-muted-foreground">
                  Tip: On desktop, copy the UPI link into your UPI app if it
                  doesn’t open automatically.
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                No payment is required for the Free plan. Click "Start Free" on
                the plan card to create your free account.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

// FAQ Section
const FAQSection = () => {
  const [ref, isVisible] = useIntersectionObserver();
  const [openItem, setOpenItem] = useState<number | null>(0);

  const faqs = [
    {
      question: "Who owns the data in InMyStack?",
      answer:
        "You own all your data. We're simply the custodian. You can export your data at any time, and we'll delete it from our servers when you cancel your account.",
    },
    {
      question: "What integrations do you support?",
      answer:
        "We integrate with all major e-commerce platforms (Shopify, WooCommerce, BigCommerce, Magento), accounting software (QuickBooks, Xero), and marketplaces (Amazon, eBay). Plus custom API integration for proprietary systems.",
    },
    {
      question: "How long does onboarding take?",
      answer:
        "Most customers are fully set up within 24 hours. Our integration connects in minutes, and our team helps optimize your reorder points based on your historical data.",
    },
    {
      question: "Are there any limits on the free plan?",
      answer:
        "The free plan includes up to 500 SKUs, 1 location, and email support. You can upgrade anytime as your business grows, with no data migration required.",
    },
    {
      question: "What's your support SLA?",
      answer:
        "Free plan: 48-hour email response. Pro plan: 24-hour response with priority support. Business plan: 4-hour response with dedicated customer success manager.",
    },
    {
      question: "Can I cancel anytime?",
      answer:
        "Yes, you can cancel anytime with no penalty. Your account will remain active until the end of your billing period, and you can export all your data.",
    },
  ];

  return (
    <section id="faq" ref={ref} className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-heading text-h2 font-semibold text-foreground">
            Frequently asked questions
          </h2>
          <p className="text-body text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about InMyStack.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-card border rounded-lg ${isVisible ? "animate-slide-up" : "opacity-0"}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <button
                className="w-full p-6 text-left flex items-center justify-between"
                onClick={() => setOpenItem(openItem === index ? null : index)}
              >
                <h3 className="font-medium text-foreground pr-4">
                  {faq.question}
                </h3>
                {openItem === index ? (
                  <Minus className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
              </button>

              {openItem === index && (
                <div className="px-6 pb-6">
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Final CTA Banner
const FinalCTASection = () => {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <section ref={ref} className="py-20 bg-accent text-accent-foreground">
      <div className="container mx-auto px-4 text-center">
        <div
          className={`space-y-8 ${isVisible ? "animate-fade-in" : "opacity-0"}`}
        >
          <h2 className="font-heading text-h2 font-semibold">
            Get inventory zen in days, not months
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Join thousands of businesses that have transformed their inventory
            management with InMyStack.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-background text-foreground px-8 py-4 rounded-xl font-medium text-lg btn-hover text-center"
            >
              Start Free
            </Link>
            <button className="border border-accent-foreground/20 text-accent-foreground px-8 py-4 rounded-xl font-medium text-lg btn-hover">
              Talk to Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-accent" />
              <span className="text-2xl font-heading font-bold">InMyStack</span>
            </div>
            <p className="text-primary-foreground/80 max-w-md">
              The smartest way to manage inventory across all your sales
              channels. Never run out, always know.
            </p>
            <div className="flex space-x-4">
              <Twitter className="w-5 h-5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
              <Linkedin className="w-5 h-5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
              <Facebook className="w-5 h-5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <a
                  href="#"
                  className="hover:text-primary-foreground transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary-foreground transition-colors"
                >
                  Integrations
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary-foreground transition-colors"
                >
                  API
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary-foreground transition-colors"
                >
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <a
                  href="#"
                  className="hover:text-primary-foreground transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary-foreground transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary-foreground transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary-foreground transition-colors"
                >
                  Case Studies
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <a
                  href="#"
                  className="hover:text-primary-foreground transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary-foreground transition-colors"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary-foreground transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary-foreground transition-colors"
                >
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-6 text-sm text-primary-foreground/80">
              <a
                href="#"
                className="hover:text-primary-foreground transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="hover:text-primary-foreground transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="hover:text-primary-foreground transition-colors"
              >
                Cookie Policy
              </a>
            </div>
            <div className="text-sm text-primary-foreground/80">
              © {currentYear} InMyStack. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <TrustBar />
      <Header />
      <main id="main">
        <HeroSection />
        <PainPromiseSection />
        <FeatureGrid />
        <HowItWorksSection />
        <KPISection />
        <IntegrationsSection />
        <SecuritySection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}
