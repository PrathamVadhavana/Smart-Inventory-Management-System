import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye, EyeOff, Mail, Lock, User, Package,
  ArrowRight, Moon, Sun, Chrome, Check, X
} from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { SignUpSchema } from "@shared/api";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

// Theme context for dark mode
const useTheme = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    let shouldBeDark;

    if (stored) {
      shouldBeDark = stored === "dark";
    } else {
      shouldBeDark = prefersDark;
    }

    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newTheme);
  };

  return { isDark, toggleTheme };
};

// Password strength calculator
const calculatePasswordStrength = (password: string) => {
  let score = 0;
  const criteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  score += criteria.length ? 20 : 0;
  score += criteria.uppercase ? 20 : 0;
  score += criteria.lowercase ? 20 : 0;
  score += criteria.number ? 20 : 0;
  score += criteria.special ? 20 : 0;

  let level: "weak" | "medium" | "strong";
  let color: string;
  let text: string;

  if (score < 40) {
    level = "weak";
    color = "bg-destructive";
    text = "Weak";
  } else if (score < 80) {
    level = "medium";
    color = "bg-warning";
    text = "Medium";
  } else {
    level = "strong";
    color = "bg-success";
    text = "Strong";
  }

  return { score, level, color, text, criteria };
};

// Form validation hook
const useFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateField = (
    name: string,
    value: string,
    confirmPassword?: string,
  ) => {
    let error = "";

    switch (name) {
      case "fullName":
        if (!value) error = "Full name is required";
        else if (value.length < 2) error = "Name must be at least 2 characters";
        break;
      case "email":
        if (!value) error = "Email is required";
        else if (!validateEmail(value)) error = "Please enter a valid email";
        break;
      case "password":
        if (!value) error = "Password is required";
        else {
          const { criteria } = calculatePasswordStrength(value);
          if (!criteria.length)
            error = "Password must be at least 8 characters";
          else if (!criteria.uppercase)
            error = "Password must contain uppercase letter";
          else if (!criteria.lowercase)
            error = "Password must contain lowercase letter";
          else if (!criteria.number) error = "Password must contain a number";
        }
        break;
      case "confirmPassword":
        if (!value) error = "Please confirm your password";
        else if (value !== confirmPassword) error = "Passwords do not match";
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const markTouched = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const isFormValid = (
    formData: Record<string, string>,
    agreeToTerms: boolean,
  ) => {
    const fieldsValid =
      Object.keys(formData).every((key) => formData[key].trim() !== "") &&
      Object.values(errors).every((error) => !error) &&
      formData.password === formData.confirmPassword;

    return fieldsValid && agreeToTerms;
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
  showPasswordStrength?: boolean;
}> = ({
  type,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  icon,
  showPasswordToggle,
  showPasswordStrength,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = showPasswordToggle
    ? showPassword
      ? "text"
      : "password"
    : type;
  const passwordStrength = showPasswordStrength
    ? calculatePasswordStrength(value)
    : null;

  return (
    <div className="space-y-2">
      <div
        className={`relative transition-all duration-200 ${
          isFocused ? "scale-[1.02]" : ""
        }`}
      >
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
          className={`w-full pl-10 pr-12 py-3 rounded-lg border-2 transition-all duration-200 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none ${
            error && touched
              ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20"
              : "border-border focus:border-accent focus:ring-2 focus:ring-accent/20"
          }`}
          aria-label={placeholder}
          aria-invalid={error && touched ? "true" : "false"}
          aria-describedby={error && touched ? `${name}-error` : undefined}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {/* Password strength indicator */}
      {showPasswordStrength && value && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Password strength
            </span>
            <span
              className={`text-sm font-medium ${
                passwordStrength?.level === "weak"
                  ? "text-destructive"
                  : passwordStrength?.level === "medium"
                    ? "text-warning"
                    : "text-success"
              }`}
            >
              {passwordStrength?.text}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${passwordStrength?.color}`}
              style={{ width: `${passwordStrength?.score}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(passwordStrength?.criteria || {}).map(
              ([key, met]) => (
                <div
                  key={key}
                  className={`flex items-center space-x-1 ${met ? "text-success" : "text-muted-foreground"}`}
                >
                  {met ? <Check size={12} /> : <X size={12} />}
                  <span>
                    {key === "length"
                      ? "8+ characters"
                      : key === "uppercase"
                        ? "Uppercase"
                        : key === "lowercase"
                          ? "Lowercase"
                          : key === "number"
                            ? "Number"
                            : "Special char"}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {error && touched && (
        <p
          id={`${name}-error`}
          className="text-sm text-destructive animate-slide-up"
          role="alert"
        >
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

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { errors, touched, validateField, markTouched, isFormValid } =
    useFormValidation();
  const { signUp, user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validateField(
        name,
        value,
        name === "confirmPassword" ? formData.password : undefined,
      );
    }
    if (name === "password" && touched.confirmPassword) {
      validateField("confirmPassword", formData.confirmPassword, value);
    }
  };

  const handleBlur = (name: string) => {
    markTouched(name);
    validateField(
      name,
      formData[name],
      name === "confirmPassword" ? formData.password : undefined,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Zod validation
    const result = SignUpSchema.safeParse({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
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
      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.fullName,
      );
      if (!error) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    try {
      if (provider.toLowerCase() !== "google") return;

      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/dashboard" },
      });

      if (error) {
        console.error("OAuth error:", error);
        // You could show a toast notification here
        alert(
          `Google authentication is not configured. Please use email/password signup or contact administrator.`,
        );
      }
    } catch (error) {
      console.error("OAuth error:", error);
      alert(`Google authentication failed. Please try email/password signup.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage:
          "url(https://images.pexels.com/photos/6169641/pexels-photo-6169641.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
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

      {/* Sign up card */}
      <div
        className={`w-full max-w-md transition-all duration-500 relative z-10 ${
          isVisible ? "animate-scale-in opacity-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="bg-card rounded-2xl shadow-xl border border-border px-8 py-6 space-y-4">
          {/* Header */}
          <div className="text-center space-y-2">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-accent hover:text-accent/80 transition-colors mb-2"
            >
              <Package size={32} />
              <span className="text-2xl font-heading font-bold">InMyStack</span>
            </Link>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Create your free account 🚀
            </h1>
            <p className="text-muted-foreground text-sm">
              Get started with real-time inventory tracking today.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <AnimatedInput
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(value) => handleChange("fullName", value)}
              onBlur={() => handleBlur("fullName")}
              error={errors.fullName}
              touched={touched.fullName}
              icon={<User size={20} />}
            />

            <AnimatedInput
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(value) => handleChange("email", value)}
              onBlur={() => handleBlur("email")}
              error={errors.email}
              touched={touched.email}
              icon={<Mail size={20} />}
            />

            <AnimatedInput
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={(value) => handleChange("password", value)}
              onBlur={() => handleBlur("password")}
              error={errors.password}
              touched={touched.password}
              icon={<Lock size={20} />}
              showPasswordToggle
              showPasswordStrength
            />

            <AnimatedInput
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(value) => handleChange("confirmPassword", value)}
              onBlur={() => handleBlur("confirmPassword")}
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
              icon={<Lock size={20} />}
              showPasswordToggle
            />

            <div className="space-y-2">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-border text-accent focus:ring-accent focus:ring-2"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-accent hover:text-accent/80 transition-colors"
                  >
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-accent hover:text-accent/80 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!isFormValid(formData, agreeToTerms) || isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                isFormValid(formData, agreeToTerms) && !isLoading
                  ? "bg-accent text-accent-foreground hover:bg-accent/90 btn-hover"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
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
              <span className="px-2 bg-card text-muted-foreground">
                Or sign up with
              </span>
            </div>
          </div>

          {/* Social buttons */}
          <div className="flex justify-center">
            <SocialButton
              provider="Google"
              icon={<Chrome size={20} />}
              onClick={() => handleSocialAuth("Google")}
            />
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-accent hover:text-accent/80 transition-colors font-medium"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
