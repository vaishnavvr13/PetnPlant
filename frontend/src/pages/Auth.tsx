import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PawPrint, Leaf, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type AuthMode = "login" | "register";
type UserType = "pet_owner" | "plant_owner" | "both" | "provider";

const emailSchema = z.string().trim().email("Invalid email address").max(255);
const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(72);
const nameSchema = z.string().trim().min(1, "Name is required").max(100);
const phoneSchema = z.string().trim().max(20).optional();

const Auth = () => {
  const navigate = useNavigate();
  const { user, profile, signUp, signIn, signInWithGoogle, loading } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<AuthMode>("login");
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState<UserType | null>(null);
  const [preferences, setPreferences] = useState({
    notifications: true,
    newsletter: false,
  });

  useEffect(() => {
    if (user && !loading && profile) {
      // Role-based redirect
      if (profile.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, loading, profile, navigate]);

  const validateStep = (currentStep: number): string | null => {
    switch (currentStep) {
      case 1:
        const emailResult = emailSchema.safeParse(email);
        if (!emailResult.success) return emailResult.error.errors[0].message;
        const passwordResult = passwordSchema.safeParse(password);
        if (!passwordResult.success) return passwordResult.error.errors[0].message;
        if (password !== confirmPassword) return "Passwords do not match";
        return null;
      case 2:
        const nameResult = nameSchema.safeParse(fullName);
        if (!nameResult.success) return nameResult.error.errors[0].message;
        return null;
      case 3:
        if (!userType) return "Please select a user type";
        return null;
      default:
        return null;
    }
  };

  const handleNextStep = () => {
    const error = validateStep(step);
    if (error) {
      toast({ title: "Validation Error", description: error, variant: "destructive" });
      return;
    }
    setStep(step + 1);
  };

  const handleRegister = async () => {
    setIsSubmitting(true);

    const { error } = await signUp(email, password, {
      full_name: fullName,
      user_type: userType,
      phone,
      preferences,
    });

    if (error) {
      toast({
        title: "Registration Failed",
        description: error.message === "User already registered"
          ? "An account with this email already exists. Please sign in instead."
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account Created",
        description: "Welcome to PetPlant Care!",
      });
      // Will be redirected by useEffect based on role
    }

    setIsSubmitting(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast({ title: "Error", description: emailResult.error.errors[0].message, variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message === "Invalid login credentials"
          ? "Invalid email or password. Please try again."
          : error.message,
        variant: "destructive",
      });
    } else {
      // Will be redirected by useEffect based on role
    }

    setIsSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: "Google Sign-In Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setPhone("");
    setUserType(null);
    setStep(1);
  };

  const userTypeOptions: { type: UserType; icon: typeof PawPrint; title: string; description: string }[] = [
    { type: "pet_owner", icon: PawPrint, title: "Pet Owner", description: "I need care for my pets" },
    { type: "plant_owner", icon: Leaf, title: "Plant Owner", description: "I need care for my plants" },
    { type: "both", icon: PawPrint, title: "Both", description: "I have pets and plants" },
    { type: "provider", icon: PawPrint, title: "Care Provider", description: "I want to provide care services" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col justify-center p-12">
          <a href="/" className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-lime flex items-center justify-center">
              <PawPrint className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold font-display">PetPlant Care</span>
          </a>
          <h1 className="text-4xl font-bold font-display mb-4">
            {mode === "login" ? "Welcome Back!" : "Join Our Community"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            {mode === "login"
              ? "Sign in to access your account and manage your pet & plant care services."
              : "Create an account to find trusted care providers or start offering your services."}
          </p>

          {/* Decorative Elements */}
          <div className="absolute bottom-12 left-12 right-12">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Trusted by thousands</p>
                <p className="text-xs text-muted-foreground">4.9★ average rating from 10,000+ reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-lime flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-display">PetPlant Care</span>
          </div>

          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-2xl font-bold font-display mb-2">Sign In</h2>
                <p className="text-muted-foreground mb-6">
                  Enter your credentials to access your account
                </p>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-card border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-card border-border"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Sign In
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  Don't have an account?{" "}
                  <button
                    onClick={() => { setMode("register"); resetForm(); }}
                    className="text-primary hover:underline font-medium"
                  >
                    Create one
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Progress Steps */}
                <div className="flex items-center gap-2 mb-8">
                  {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${s === step
                            ? "bg-primary text-primary-foreground"
                            : s < step
                              ? "bg-primary/20 text-primary"
                              : "bg-card text-muted-foreground"
                          }`}
                      >
                        {s}
                      </div>
                      {s < 4 && (
                        <div
                          className={`w-8 h-0.5 ${s < step ? "bg-primary" : "bg-border"
                            }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                )}

                <AnimatePresence mode="wait">
                  {/* Step 1: Account Credentials */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <h2 className="text-2xl font-bold font-display mb-2">Create Account</h2>
                      <p className="text-muted-foreground mb-6">Enter your email and create a password</p>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reg-email">Email</Label>
                          <Input
                            id="reg-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-card border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="reg-password">Password</Label>
                          <Input
                            id="reg-password"
                            type="password"
                            placeholder="Min. 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-card border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm Password</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="bg-card border-border"
                          />
                        </div>

                        <Button onClick={handleNextStep} className="w-full">
                          Continue
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Personal Info */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <h2 className="text-2xl font-bold font-display mb-2">Personal Info</h2>
                      <p className="text-muted-foreground mb-6">Tell us a bit about yourself</p>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="full-name">Full Name</Label>
                          <Input
                            id="full-name"
                            type="text"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="bg-card border-border"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone (optional)</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="bg-card border-border"
                          />
                        </div>

                        <Button onClick={handleNextStep} className="w-full">
                          Continue
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: User Type Selection */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <h2 className="text-2xl font-bold font-display mb-2">What brings you here?</h2>
                      <p className="text-muted-foreground mb-6">Select how you'll use PetPlant Care</p>

                      <div className="grid gap-3">
                        {userTypeOptions.map((option) => (
                          <button
                            key={option.type}
                            onClick={() => setUserType(option.type)}
                            className={`p-4 rounded-xl border text-left transition-all ${userType === option.type
                                ? "border-primary bg-primary/10"
                                : "border-border bg-card hover:border-primary/50"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${userType === option.type
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                  }`}
                              >
                                {option.type === "plant_owner" ? (
                                  <Leaf className="w-5 h-5" />
                                ) : option.type === "both" ? (
                                  <div className="flex">
                                    <PawPrint className="w-4 h-4" />
                                    <Leaf className="w-4 h-4 -ml-1" />
                                  </div>
                                ) : (
                                  <PawPrint className="w-5 h-5" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{option.title}</p>
                                <p className="text-sm text-muted-foreground">{option.description}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      <Button onClick={handleNextStep} className="w-full mt-6" disabled={!userType}>
                        Continue
                      </Button>
                    </motion.div>
                  )}

                  {/* Step 4: Preferences & Complete */}
                  {step === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <h2 className="text-2xl font-bold font-display mb-2">Almost Done!</h2>
                      <p className="text-muted-foreground mb-6">Set your preferences</p>

                      <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 rounded-xl border border-border bg-card cursor-pointer">
                          <div>
                            <p className="font-medium">Push Notifications</p>
                            <p className="text-sm text-muted-foreground">Get notified about bookings and updates</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={preferences.notifications}
                            onChange={(e) => setPreferences({ ...preferences, notifications: e.target.checked })}
                            className="w-5 h-5 rounded accent-primary"
                          />
                        </label>

                        <label className="flex items-center justify-between p-4 rounded-xl border border-border bg-card cursor-pointer">
                          <div>
                            <p className="font-medium">Newsletter</p>
                            <p className="text-sm text-muted-foreground">Receive tips and special offers</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={preferences.newsletter}
                            onChange={(e) => setPreferences({ ...preferences, newsletter: e.target.checked })}
                            className="w-5 h-5 rounded accent-primary"
                          />
                        </label>

                        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                          <p className="text-sm">
                            By creating an account, you agree to our{" "}
                            <a href="#" className="text-primary hover:underline">Terms of Service</a> and{" "}
                            <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                          </p>
                        </div>

                        <Button onClick={handleRegister} className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Create Account
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  Already have an account?{" "}
                  <button
                    onClick={() => { setMode("login"); resetForm(); }}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Auth;
