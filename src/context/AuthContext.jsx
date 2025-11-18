/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import { auth as storageAuth } from '@/utils/storage';
import { API_CONFIG } from '@/config/api.config';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = storageAuth.getUser();
        if (storedUser) {
            setCurrentUser(storedUser);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const apiUrl = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth}`;
        
        const response = await fetch(`${apiUrl}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
            method: 'GET',
            redirect: 'follow'
        });
        const textResponse = await response.text();
        const result = JSON.parse(textResponse);
        
        if (result.message.includes('berhasil')) {
            setCurrentUser(result);
            storageAuth.setUser(result);
            return result;
        } else {
            throw new Error(result.message || 'Login failed');
        }
    };

    const logout = () => {
        setCurrentUser(null);
        storageAuth.logout();
    };

    const value = {
        currentUser,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}