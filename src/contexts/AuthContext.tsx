import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  role: "admin" | "faculty" | "student";
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: string) => {
    // UI only - no backend integration
    // Simulate login by setting user state
    setUser({
      id: "user-" + Date.now(),
      email,
      role: role as "admin" | "faculty" | "student",
      name: email.split("@")[0],
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
