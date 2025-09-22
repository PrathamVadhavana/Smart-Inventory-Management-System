import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, Mail, Lock, Package,
  ArrowRight, Moon, Sun, Chrome
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginSchema } from '@shared/api';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

// Theme context for dark mode
// Theme context for dark mode
const useTheme = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let shouldBeDark;

    if (stored) {
      // Prioritize the stored theme if it exists
      shouldBeDark = stored === 'dark';
    } else {
      // Otherwise, use the system preference as the default
      shouldBeDark = prefersDark;
    }

    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []); // The empty dependency array ensures this runs only once on mount

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  return { isDark, toggleTheme };
};

// Form validation hook
const useFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateField = (name: string, value: string) => {
    let error = '';

    switch (name) {
      case 'email':
        if (!value) error = 'Email is required';
        else if (!validateEmail(value)) error = 'Please enter a valid email';
        break;
      case 'password':
        if (!value) error = 'Password is required';
        else if (value.length < 8) error = 'Password must be at least 8 characters';
        break;
      default:
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const markTouched = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const isFormValid = (formData: Record<string, string>) => {
    // Check if all fields have values and no errors exist
    return Object.keys(formData).every(key => formData[key].trim() !== '') &&
      Object.values(errors).every(error => !error);
  };

  return { errors, touched, validateField, markTouched, isFormValid };
};

// Animated input component
const AnimatedInput: React.FC<{
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  touched?: boolean;
  icon: React.ReactNode;
  showPasswordToggle?: boolean;
}> = ({
  type, name, placeholder, value, onChange, onBlur, error, touched, icon, showPasswordToggle
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="space-y-1">
        <div className={`relative transition-all duration-200 ${isFocused ? 'scale-[1.02]' : ''
          }`}>
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10">
            {icon}
          </div>
          <input
            type={inputType}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              onBlur();
            }}
            className={`w-full pl-10 pr-12 py-3 rounded-lg border-2 transition-all duration-200 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none ${error && touched
              ? 'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20'
              : 'border-border focus:border-accent focus:ring-2 focus:ring-accent/20'
              }`}
            aria-label={placeholder}
            aria-invalid={error && touched ? 'true' : 'false'}
            aria-describedby={error && touched ? `${name}-error` : undefined}
          />
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        {error && touched && (
          <p id={`${name}-error`} className="text-sm text-destructive animate-slide-up" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  };

// Social button component
const SocialButton: React.FC<{
  provider: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ provider, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 border border-border rounded-lg hover:bg-muted transition-all duration-200 btn-hover"
    aria-label={`Continue with ${provider}`}
  >
    {icon}
    <span className="text-sm font-medium">{provider}</span>
  </button>
);

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { errors, touched, validateField, markTouched, isFormValid } = useFormValidation();
  const { signIn, user } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (name: string) => {
    markTouched(name);
    validateField(name, formData[name]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Zod validation
    const result = LoginSchema.safeParse({
      email: formData.email,
      password: formData.password,
    });

    if (!result.success) {
      // Show Zod errors (replace this with your error display logic)
      const zodErrors = result.error.flatten().fieldErrors;
      Object.entries(zodErrors).forEach(([key, value]) => {
        if (value && value[0]) {
          // You may want to set these errors in your state
          // For example: setErrors((prev) => ({ ...prev, [key]: value[0] }));
          // Or use your toast system
          // toast.error(value[0]);
        }
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(formData.email, formData.password);
      if (!error) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    let supabaseProvider = '';
    if (provider.toLowerCase() === 'google') supabaseProvider = 'google';
    else if (provider.toLowerCase() === 'microsoft') supabaseProvider = 'azure';
    else return;
    await supabase.auth.signInWithOAuth({
      provider: supabaseProvider,
      options: { redirectTo: window.location.origin + '/dashboard' }
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'url(https://images.pexels.com/photos/12706241/pexels-photo-12706241.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/85 to-muted/80" />
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-lg bg-card/90 border border-border hover:bg-muted/90 transition-colors z-50 backdrop-blur-sm"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Login card */}
      <div className={`w-full max-w-md transition-all duration-500 relative z-10 ${isVisible ? 'animate-slide-up opacity-100' : 'opacity-0 translate-y-4'
        }`}>
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center space-x-2 text-accent hover:text-accent/80 transition-colors mb-4">
              <Package size={32} />
              <span className="text-2xl font-heading font-bold">InMyStack</span>
            </Link>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Welcome back 👋
            </h1>
            <p className="text-muted-foreground">
              Login to manage your inventory.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <AnimatedInput
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(value) => handleChange('email', value)}
              onBlur={() => handleBlur('email')}
              error={errors.email}
              touched={touched.email}
              icon={<Mail size={20} />}
            />

            <AnimatedInput
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(value) => handleChange('password', value)}
              onBlur={() => handleBlur('password')}
              error={errors.password}
              touched={touched.password}
              icon={<Lock size={20} />}
              showPasswordToggle
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border text-accent focus:ring-accent focus:ring-2"
                />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-accent hover:text-accent/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={!isFormValid(formData) || isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${isFormValid(formData) && !isLoading
                ? 'bg-accent text-accent-foreground hover:bg-accent/90 btn-hover'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Social buttons */}
          <div className="flex space-x-3">
            <SocialButton
              provider="Google"
              icon={<Chrome size={20} />}
              onClick={() => handleSocialAuth('Google')}
            />
            <SocialButton
              provider="Microsoft"
              icon={<div className="w-5 h-5 bg-accent rounded-sm" />}
              onClick={() => handleSocialAuth('Microsoft')}
            />
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-accent hover:text-accent/80 transition-colors font-medium"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
