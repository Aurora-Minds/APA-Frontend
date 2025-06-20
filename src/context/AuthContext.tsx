import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { User, UserResponse } from '../types';

interface AuthContextType {
    user: User | null;
    login: (formData: any) => Promise<UserResponse>;
    register: (formData: any) => Promise<UserResponse>;
    logout: () => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    isAuthenticated: boolean;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                axios.defaults.headers.common['x-auth-token'] = token;
                try {
                    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';
                    const res = await axios.get<{ user: User }>(`${API_BASE_URL}/auth`);
                    setUser(res.data.user);
                    setIsAuthenticated(true);
                } catch (err) {
                    localStorage.removeItem('token');
                    setUser(null);
                    setIsAuthenticated(false);
                    delete axios.defaults.headers.common['x-auth-token'];
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (formData: any) => {
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';
        const response = await axios.post<UserResponse>(`${API_BASE_URL}/auth/login`, formData);
        localStorage.setItem('token', response.data.token);
        axios.defaults.headers.common['x-auth-token'] = response.data.token;
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response.data;
    };

    const register = async (formData: any) => {
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';
        const response = await axios.post<UserResponse>(`${API_BASE_URL}/auth/register`, formData);
        localStorage.setItem('token', response.data.token);
        axios.defaults.headers.common['x-auth-token'] = response.data.token;
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        delete axios.defaults.headers.common['x-auth-token'];
    };

    const setTheme = async (theme: 'light' | 'dark' | 'system') => {
        if (user) {
            try {
                const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';
                await axios.put(`${API_BASE_URL}/users/me`, { theme });
                setUser((prev) => (prev ? { ...prev, theme } : prev));
            } catch (error) {
                console.error('Failed to update theme', error);
            }
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, setTheme, isAuthenticated, loading }}>
            {children}
        </AuthContext.Provider>
    );
}; 