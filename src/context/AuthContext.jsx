/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const apiUrl = 'https://script.google.com/macros/s/AKfycbzaQqdmBXWstfEkDm3lMpC7DFeselitztz7zsxIYVWeOmVoDAxFQPiAqkm0EWrDpMFl2A/exec';
        
        const response = await fetch(`${apiUrl}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
            method: 'GET',
            redirect: 'follow'
        });
        const textResponse = await response.text();
        const result = JSON.parse(textResponse);
        
        if (result.message.includes('berhasil')) {
            setCurrentUser(result);
            localStorage.setItem('user', JSON.stringify(result));
            return result;
        } else {
            throw new Error(result.message || 'Login failed');
        }
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('user');
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