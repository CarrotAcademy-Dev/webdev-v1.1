/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { auth as storageAuth } from '@/utils/storage';
import { API_CONFIG } from '@/config/api.config';
import { toaster } from '@/components/ui/toaster';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check token expiry dan auto-logout jika expired
    const checkTokenExpiry = useCallback(() => {
        const storedUser = storageAuth.getUser();
        
        // Jika user ada di storage tapi getUser return null, berarti expired
        if (!storedUser && currentUser) {
            toaster.create({
                title: 'Sesi Berakhir',
                description: 'Sesi login Anda telah berakhir. Silakan login kembali.',
                type: 'warning',
                duration: 5000,
            });
            setCurrentUser(null);
            storageAuth.logout();
            return false;
        }
        
        // Warning jika token akan expired dalam 15 menit
        if (storedUser && storageAuth.isTokenExpiringSoon()) {
            const remainingTime = storageAuth.getTokenRemainingTime();
            toaster.create({
                title: 'Sesi Akan Berakhir',
                description: `Sesi Anda akan berakhir dalam ${remainingTime} menit. Simpan pekerjaan Anda.`,
                type: 'info',
                duration: 10000,
            });
        }
        
        return true;
    }, [currentUser]);

    // Initial load
    useEffect(() => {
        const storedUser = storageAuth.getUser();
        if (storedUser) {
            setCurrentUser(storedUser);
        }
        setLoading(false);
    }, []);
    
    // Check expiry setiap 5 menit
    useEffect(() => {
        if (!currentUser) return;
        
        // Check immediately
        checkTokenExpiry();
        
        // Then check every 5 minutes
        const interval = setInterval(() => {
            checkTokenExpiry();
        }, 5 * 60 * 1000); // 5 menit
        
        return () => clearInterval(interval);
    }, [currentUser, checkTokenExpiry]);

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
            console.log('[Auth] Setting user with 540 min expiry (9 hours)');
            storageAuth.setUser(result); // Uses default 540 minutes
            return result;
        } else {
            throw new Error(result.message || 'Login failed');
        }
    };

    const logout = () => {
        setCurrentUser(null);
        storageAuth.logout();
    };
    
    // Extend session untuk user yang masih aktif
    const extendSession = () => {
        if (currentUser) {
            const extended = storageAuth.extendToken(); // Pakai default 540 menit (9 jam)
            if (extended) {
                toaster.create({
                    title: 'Sesi Diperpanjang',
                    description: 'Sesi login Anda telah diperpanjang 9 jam.',
                    type: 'success',
                    duration: 3000,
                });
            }
        }
    };
    
    // Get remaining session time
    const getSessionTimeRemaining = () => {
        return storageAuth.getTokenRemainingTime();
    };

    const value = {
        currentUser,
        login,
        logout,
        extendSession,
        getSessionTimeRemaining,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}