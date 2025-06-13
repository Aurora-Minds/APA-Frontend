import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { User, UserResponse } from '../types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    setTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthResponse {
    token: string;
}

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [authLoading, setAuthLoading] = useState(true);

    // Session persistence and fetch user info on mount or token change
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            axios.defaults.headers.common['x-auth-token'] = token;

            const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';
            axios.get<UserResponse>(`${API_BASE_URL}/users/me`)
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

    const login = async (email: string, password: string, rememberMe: boolean) => {
        try {
            const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';
            const res = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/login`, {
                email,
                password,
                rememberMe
            });
            const token = res.data.token;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['x-auth-token'] = token;
            setToken(token);
            setIsAuthenticated(true);
            const userRes = await axios.get<UserResponse>(`${API_BASE_URL}/users/me`);
            setUser(userRes.data as User);
        } catch (err) {
            throw err;
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';
            await axios.post<AuthResponse>(`${API_BASE_URL}/auth/register`, {
                name,
                email,
                password
            });
            // Do not set token, user, or isAuthenticated here
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
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';
        await axios.put(`${API_BASE_URL}/users/me`, { theme });
        setUser(prev => prev ? { ...prev, theme } : prev);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated, setTheme }}>
            {!authLoading && children}
        </AuthContext.Provider>
    );
}; 