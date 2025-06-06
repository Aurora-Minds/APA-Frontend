import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

interface User {
    id: string;
    name: string;
    email: string;
    theme?: 'light' | 'dark' | 'system';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    setTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes in ms

interface AuthResponse {
    token: string;
}

interface UserResponse {
    id: string;
    name: string;
    email: string;
    theme?: 'light' | 'dark' | 'system';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [inactivityMessage, setInactivityMessage] = useState<string | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    let inactivityTimeout: NodeJS.Timeout | null = null;

    // Session persistence and fetch user info on mount or token change
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            axios.defaults.headers.common['x-auth-token'] = token;
            axios.get<UserResponse>('http://localhost:5001/api/users/me')
                .then(res => {
                    setUser(res.data as User);
                    setIsAuthenticated(true);
                    setAuthLoading(false);
                })
                .catch(() => {
                    setUser(null);
                    setIsAuthenticated(false);
                    setToken(null);
                    localStorage.removeItem('token');
                    setAuthLoading(false);
                });
        } else {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['x-auth-token'];
            setUser(null);
            setIsAuthenticated(false);
            setAuthLoading(false);
        }
    }, [token]);

    // Inactivity timer
    useEffect(() => {
        if (!isAuthenticated) return;
        const resetTimer = () => {
            if (inactivityTimeout) clearTimeout(inactivityTimeout);
            inactivityTimeout = setTimeout(() => {
                setInactivityMessage('You have been logged out due to inactivity.');
                logout();
            }, INACTIVITY_LIMIT);
        };
        // Listen to user activity
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keydown', resetTimer);
        window.addEventListener('mousedown', resetTimer);
        window.addEventListener('touchstart', resetTimer);
        resetTimer();
        return () => {
            if (inactivityTimeout) clearTimeout(inactivityTimeout);
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keydown', resetTimer);
            window.removeEventListener('mousedown', resetTimer);
            window.removeEventListener('touchstart', resetTimer);
        };
    }, [isAuthenticated]);

    const login = async (email: string, password: string) => {
        try {
            const res = await axios.post<AuthResponse>('http://localhost:5001/api/auth/login', {
                email,
                password
            });
            const token = res.data.token;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['x-auth-token'] = token;
            setToken(token);
            setIsAuthenticated(true);
            const userRes = await axios.get<UserResponse>('http://localhost:5001/api/users/me');
            setUser(userRes.data as User);
        } catch (err) {
            throw err;
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            const res = await axios.post<AuthResponse>('http://localhost:5001/api/auth/register', {
                name,
                email,
                password
            });
            const token = res.data.token;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['x-auth-token'] = token;
            setToken(token);
            setIsAuthenticated(true);
            const userRes = await axios.get<UserResponse>('http://localhost:5001/api/users/me');
            setUser(userRes.data as User);
        } catch (err) {
            throw err;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    const setTheme = async (theme: 'light' | 'dark' | 'system') => {
        if (!token) return;
        await axios.put('http://localhost:5001/api/users/me', { theme });
        setUser(prev => prev ? { ...prev, theme } : prev);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated, setTheme }}>
            {inactivityMessage && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', background: '#ffecb3', color: '#333', textAlign: 'center', zIndex: 2000, padding: 8 }}>
                    {inactivityMessage}
                </div>
            )}
            {!authLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 