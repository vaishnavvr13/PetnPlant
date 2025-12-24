import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api from "@/lib/api";
import { connectSocket, disconnectSocket } from "@/lib/socket";

type UserRole = "user" | "provider" | "admin";
type UserType = "pet_owner" | "plant_owner" | "both" | "provider";

interface User {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  userType: UserType | null;
  role: UserRole;
  avatarUrl: string | null;
  preferences: any;
}

interface ProfileUpdate {
  fullName?: string | null;
  phone?: string | null;
  userType?: UserType | null;
  avatarUrl?: string | null;
  preferences?: any;
}

interface AuthContextType {
  user: User | null;
  profile: User | null; // Alias for compatibility
  role: UserRole | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Verify token is still valid
          const response = await api.get('/auth/me');
          setUser(response.data.user);
          setRole(response.data.user.role);

          // Connect socket for real-time updates
          connectSocket(response.data.user.id);
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setRole(null);
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        fullName: metadata?.full_name || metadata?.fullName,
        userType: metadata?.user_type || metadata?.userType,
      });

      const { token, user: newUser } = response.data;

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));

      setUser(newUser);
      setRole(newUser.role);

      // Connect socket
      connectSocket(newUser.id);

      return { error: null };
    } catch (error: any) {
      return {
        error: new Error(error.response?.data?.message || 'Registration failed')
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { token, user: loggedInUser } = response.data;

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedInUser));

      setUser(loggedInUser);
      setRole(loggedInUser.role);

      // Connect socket
      connectSocket(loggedInUser.id);

      return { error: null };
    } catch (error: any) {
      return {
        error: new Error(error.response?.data?.message || 'Login failed')
      };
    }
  };

  const signInWithGoogle = async () => {
    // Google OAuth not implemented yet in backend
    return {
      error: new Error('Google sign-in not available yet. Please use email/password.')
    };
  };

  const signOut = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clean up regardless of API call success
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      disconnectSocket();
      setUser(null);
      setRole(null);
    }
  };

  const updateProfile = async (updates: ProfileUpdate) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const response = await api.put('/auth/profile', updates);

      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return { error: null };
    } catch (error: any) {
      return {
        error: new Error(error.response?.data?.message || 'Profile update failed')
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: user, // Alias for backward compatibility
        role,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
