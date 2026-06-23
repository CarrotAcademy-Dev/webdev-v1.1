/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { auth as storageAuth } from '@/utils/storage';
import { API_CONFIG } from '@/config/api.config';
import { toaster } from '@/components/ui/toaster';

const isDebugLoggingEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true';
const debugLog = (...args) => {
    if (isDebugLoggingEnabled) console.log(...args);
};
const debugError = (...args) => {
    if (isDebugLoggingEnabled) console.error(...args);
};

export const AuthContext = createContext();

// Session tracking constants
const GRACE_PERIOD_MINUTES = 30;
const GRACE_PERIOD_MS = GRACE_PERIOD_MINUTES * 60 * 1000;
const SESSION_PERSIST_INTERVAL = 10000; // Save to localStorage every 10 seconds
const ACTIVE_SESSION_KEY = 'carrot_academy_active_session';

// Helper function to format duration as HH:mm:ss
const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Session tracking state
    const [sessionData, setSessionData] = useState({
        loginTime: null,
        productiveSeconds: 0,
        idleSeconds: 0,
        currentState: 'productive', // 'productive' | 'grace' | 'idle'
        graceStartTime: null,
        lastActiveTimestamp: null // Track when productive state started
    });
    
    // Ref to hold latest sessionData for persistence (avoid closure stale data)
    const sessionDataRef = useRef(sessionData);
    
    // Update ref whenever sessionData changes
    useEffect(() => {
        sessionDataRef.current = sessionData; 
    }, [sessionData]);

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
            
            // Restore session data if exists for this user
            const activeSessionStr = localStorage.getItem(ACTIVE_SESSION_KEY);
            if (activeSessionStr) {
                try {
                    const session = JSON.parse(activeSessionStr);
                    const now = Date.now();
                    const lastUpdated = new Date(session.lastUpdated).getTime();
                    const timeSinceUpdate = now - lastUpdated;
                    
                    // If session belongs to this user and was updated recently (< 1 hour), restore it
                    if (session.email === storedUser.email && timeSinceUpdate < 5 * 60 * 1000) {
                        debugLog('[Session] Restoring active session from localStorage');
                        debugLog('[Session] Productive:', formatDuration(session.productiveSeconds), 
                                    'Idle:', formatDuration(session.idleSeconds));
                        
                        setSessionData({
                            loginTime: new Date(session.loginTime),
                            productiveSeconds: session.productiveSeconds,
                            idleSeconds: session.idleSeconds,
                            currentState: 'productive', // Start as productive after refresh
                            graceStartTime: null,
                            lastActiveTimestamp: Date.now()
                        });
                    }
                } catch (error) {
                    debugError('[Session] Error restoring session:', error);
                }
            }
        }
        setLoading(false);
    }, []);
    
    // Session Recovery: Check for orphaned sessions (expired without logout)
    useEffect(() => {
        const checkOrphanedSession = async () => {
            const orphanedSessionStr = localStorage.getItem(ACTIVE_SESSION_KEY);
            const storedUser = storageAuth.getUser();
            
            if (orphanedSessionStr) {
                try {
                    const session = JSON.parse(orphanedSessionStr);
                    const now = Date.now();
                    
                    // Check if this session is old (from previous session)
                    const lastUpdated = new Date(session.lastUpdated).getTime();
                    const timeSinceUpdate = now - lastUpdated;
                    
                    // Orphan detection threshold: Match dengan session expiry (9 hours = 540 minutes)
                    // Kalau session expired, baru dianggap orphaned
                    const ORPHAN_THRESHOLD = 540 * 60 * 1000; // 9 hours (production)
                    // For testing: 5 * 60 * 1000 (5 minutes)
                    
                    // Check if token is actually expired (not just stale session)
                    const isTokenExpired = !storedUser; // getUser() returns null if token expired
                    
                    // Determine if orphaned:
                    // 1. Different user (previous user didn't logout, new user login)
                    // 2. Same user + stale session + token expired (crash/timeout without logout)
                    const isDifferentUser = storedUser && session.email !== storedUser.email;
                    const isStaleSession = timeSinceUpdate > ORPHAN_THRESHOLD;
                    const isOrphaned = isDifferentUser || (isStaleSession && isTokenExpired);
                    
                    if (isOrphaned) {
                        debugLog('[Session Recovery] Orphaned session detected:', {
                            reason: isDifferentUser ? 'Different user' : 'Session stale + Token expired',
                            sessionEmail: session.email,
                            currentEmail: storedUser?.email,
                            timeSinceUpdate: (timeSinceUpdate / 1000 / 60).toFixed(2) + ' minutes',
                            threshold: (ORPHAN_THRESHOLD / 1000 / 60).toFixed(0) + ' minutes',
                            tokenExpired: isTokenExpired
                        });
                        
                        // Send logout data for expired session
                        const params = new URLSearchParams();
                        params.append('action', 'logout');
                        params.append('email', session.email);
                        params.append('duration_productive', formatDuration(session.productiveSeconds));
                        params.append('duration_idle', formatDuration(session.idleSeconds));
                        params.append('device', navigator.userAgent || 'Unknown Device');
                        
                        try {
                            await fetch(API_CONFIG.endpoints.auth, {
                                method: 'POST',
                                body: params
                            });
                            debugLog('[Session Recovery] Logout data sent successfully');
                        } catch (error) {
                            debugError('[Session Recovery] Failed to send logout data:', error);
                        }
                        
                        // Clean up orphaned session
                        localStorage.removeItem(ACTIVE_SESSION_KEY);
                        
                        // If this is same user's expired session, force logout
                        if (storedUser && session.email === storedUser.email && isStaleSession && isTokenExpired) {
                            debugLog('[Session Recovery] Force logout current user (token expired)');
                            setCurrentUser(null);
                            storageAuth.logout();
                            
                            toaster.create({
                                title: 'Sesi Telah Berakhir',
                                description: 'Sesi Anda telah berakhir. Silakan login kembali.',
                                type: 'warning',
                                duration: 5000,
                            });
                        }
                    } else if (storedUser && session.email === storedUser.email) {
                        // Session is stale (> 9h) but token still valid (user extended session)
                        if (isStaleSession) {
                            debugLog('[Session Recovery] Stale session but token still valid (extended), will be restored');
                            debugLog('[Session Recovery] Time since update:', (timeSinceUpdate / 1000 / 60).toFixed(2), 'minutes');
                        } else {
                            debugLog('[Session Recovery] Active session found (<9h), will be restored');
                        }
                    }
                } catch (error) {
                    debugError('[Session Recovery] Error parsing orphaned session:', error);
                    localStorage.removeItem(ACTIVE_SESSION_KEY);
                }
            }
        };
        
        checkOrphanedSession();
    }, []); // Run once on mount
    
    // Window focus/blur event listeners for session tracking
    useEffect(() => {
        if (!currentUser) return; // Only track when user is logged in
        
        const handleFocus = () => {
            debugLog('[Session] Window focused - calculating time away');
            setSessionData(prev => {
                const now = Date.now();
                
                // If there was a grace period, calculate how long user was away
                if (prev.graceStartTime) {
                    const awayDuration = now - prev.graceStartTime.getTime();
                    const awaySeconds = Math.floor(awayDuration / 1000);
                    
                    // If away < 30 minutes, add to productive
                    if (awayDuration < GRACE_PERIOD_MS) {
                        debugLog(`[Session] Away for ${Math.floor(awaySeconds / 60)} min - adding to PRODUCTIVE`);
                        return {
                            ...prev,
                            productiveSeconds: prev.productiveSeconds + awaySeconds,
                            currentState: 'productive',
                            graceStartTime: null,
                            lastActiveTimestamp: now
                        };
                    } else {
                        // If away >= 30 minutes, add 30 min to productive, rest to idle
                        const graceSeconds = GRACE_PERIOD_MINUTES * 60;
                        const idleSeconds = awaySeconds - graceSeconds;
                        debugLog(`[Session] Away for ${Math.floor(awaySeconds / 60)} min - adding ${GRACE_PERIOD_MINUTES} min to PRODUCTIVE, ${Math.floor(idleSeconds / 60)} min to IDLE`);
                        return {
                            ...prev,
                            productiveSeconds: prev.productiveSeconds + graceSeconds,
                            idleSeconds: prev.idleSeconds + idleSeconds,
                            currentState: 'productive',
                            graceStartTime: null,
                            lastActiveTimestamp: now
                        };
                    }
                }
                
                // No grace period active, just switch to productive and start tracking
                return {
                    ...prev,
                    currentState: 'productive',
                    graceStartTime: null,
                    lastActiveTimestamp: now
                };
            });
        };
        
        const handleBlur = () => {
            debugLog('[Session] Window blurred - calculating productive time and starting GRACE PERIOD');
            setSessionData(prev => {
                const now = Date.now();
                let newProductiveSeconds = prev.productiveSeconds;
                
                // Calculate productive time from last active timestamp to now
                if (prev.lastActiveTimestamp && prev.currentState === 'productive') {
                    const productiveDuration = now - prev.lastActiveTimestamp;
                    const productiveAddSeconds = Math.floor(productiveDuration / 1000);
                    newProductiveSeconds += productiveAddSeconds;
                    debugLog(`[Session] Adding ${productiveAddSeconds}s productive time before blur`);
                }
                
                return {
                    ...prev,
                    productiveSeconds: newProductiveSeconds,
                    currentState: 'grace',
                    graceStartTime: new Date(),
                    lastActiveTimestamp: null
                };
            });
        };
        
        const handleVisibilityChange = () => {
            if (document.hidden) {
                debugLog('[Session] Tab hidden - calculating productive time and starting GRACE PERIOD');
                setSessionData(prev => {
                    const now = Date.now();
                    let newProductiveSeconds = prev.productiveSeconds;
                    
                    // Calculate productive time from last active timestamp to now
                    if (prev.lastActiveTimestamp && prev.currentState === 'productive') {
                        const productiveDuration = now - prev.lastActiveTimestamp;
                        const productiveAddSeconds = Math.floor(productiveDuration / 1000);
                        newProductiveSeconds += productiveAddSeconds;
                        debugLog(`[Session] Adding ${productiveAddSeconds}s productive time before hidden`);
                    }
                    
                    return {
                        ...prev,
                        productiveSeconds: newProductiveSeconds,
                        currentState: 'grace',
                        graceStartTime: prev.graceStartTime || new Date(),
                        lastActiveTimestamp: null
                    };
                });
            } else {
                debugLog('[Session] Tab visible - calculating time away');
                setSessionData(prev => {
                    const now = Date.now();
                    
                    // If there was a grace period, calculate how long user was away
                    if (prev.graceStartTime) {
                        const awayDuration = now - prev.graceStartTime.getTime();
                        const awaySeconds = Math.floor(awayDuration / 1000);
                        
                        // If away < 30 minutes, add to productive
                        if (awayDuration < GRACE_PERIOD_MS) {
                            debugLog(`[Session] Away for ${Math.floor(awaySeconds / 60)} min - adding to PRODUCTIVE`);
                            return {
                                ...prev,
                                productiveSeconds: prev.productiveSeconds + awaySeconds,
                                currentState: 'productive',
                                graceStartTime: null,
                                lastActiveTimestamp: now
                            };
                        } else {
                            // If away >= 30 minutes, add 30 min to productive, rest to idle
                            const graceSeconds = GRACE_PERIOD_MINUTES * 60;
                            const idleSeconds = awaySeconds - graceSeconds;
                            debugLog(`[Session] Away for ${Math.floor(awaySeconds / 60)} min - adding ${GRACE_PERIOD_MINUTES} min to PRODUCTIVE, ${Math.floor(idleSeconds / 60)} min to IDLE`);
                            return {
                                ...prev,
                                productiveSeconds: prev.productiveSeconds + graceSeconds,
                                idleSeconds: prev.idleSeconds + idleSeconds,
                                currentState: 'productive',
                                graceStartTime: null,
                                lastActiveTimestamp: now
                            };
                        }
                    }
                    
                    // No grace period active, just switch to productive and start tracking
                    return {
                        ...prev,
                        currentState: 'productive',
                        graceStartTime: null,
                        lastActiveTimestamp: now
                    };
                });
            }
        };
        
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [currentUser]);
    
    // Display update timer: update UI every second for live display
    // Note: Actual time calculation is timestamp-based, this just triggers UI updates
    useEffect(() => {
        if (!currentUser) return;
        
        const interval = setInterval(() => {
            // Force component re-render to update displayed time
            // The actual calculation happens in handleBlur/handleFocus
            setSessionData(prev => ({ ...prev }));
        }, 1000);
        
        return () => clearInterval(interval);
    }, [currentUser]);
    
    // Session persistence: save to localStorage every 10 seconds
    useEffect(() => {
        if (!currentUser) return;
        
        const persistInterval = setInterval(() => {
            // Use ref to get real-time sessionData (avoid stale closure)
            const current = sessionDataRef.current;
            
            if (!current.loginTime) return; // Skip if not initialized yet
            
            const sessionSnapshot = {
                email: currentUser.email,
                loginTime: current.loginTime.toISOString(),
                productiveSeconds: current.productiveSeconds,
                idleSeconds: current.idleSeconds,
                lastUpdated: new Date().toISOString()
            };
            
            localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(sessionSnapshot));
            debugLog('[Session] Persisted:', {
                productive: formatDuration(current.productiveSeconds),
                idle: formatDuration(current.idleSeconds),
                state: current.currentState
            });
        }, SESSION_PERSIST_INTERVAL);
        
        return () => clearInterval(persistInterval);
    }, [currentUser]); // ✅ Only depend on currentUser, use ref for sessionData
    
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
        const apiUrl = API_CONFIG.endpoints.auth;
        
        // V2.0: Use POST with URLSearchParams (avoid preflight OPTIONS)
        const params = new URLSearchParams();
        params.append('action', 'login');
        params.append('email', email);
        params.append('password', password);
        params.append('device', navigator.userAgent || 'Unknown Device');
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: params
        });
        const textResponse = await response.text();
        const result = JSON.parse(textResponse);
        
        // V2.0: Check status instead of message
        if (result.status === 'success') {
            // V2.0: Profile data now nested in result.profile
            setCurrentUser(result.profile);
            debugLog('[Auth] Setting user with 540 min expiry (9 hours)');
            storageAuth.setUser(result.profile); // Uses default 540 minutes
            
            // Initialize session tracking
            const now = new Date();
            setSessionData({
                loginTime: now,
                productiveSeconds: 0,
                idleSeconds: 0,
                currentState: 'productive', // Start as productive (user just logged in)
                graceStartTime: null,
                lastActiveTimestamp: now.getTime() // Start tracking productive time
            });
            debugLog('[Session] Session tracking initialized');
            
            return result.profile;
        } else {
            // V2.0: More specific error messages (Email tidak terdaftar / Password salah)
            throw new Error(result.message || 'Login gagal');
        }
    };

    const logout = async () => {
        if (!currentUser) return;
        
        // Use ref to get real-time sessionData (avoid stale closure)
        const current = sessionDataRef.current;
        
        // Calculate final productive time if currently active
        let finalProductiveSeconds = current.productiveSeconds;
        if (current.lastActiveTimestamp && current.currentState === 'productive') {
            const now = Date.now();
            const productiveDuration = now - current.lastActiveTimestamp;
            const productiveAddSeconds = Math.floor(productiveDuration / 1000);
            finalProductiveSeconds += productiveAddSeconds;
            debugLog(`[Session] Adding final ${productiveAddSeconds}s productive time before logout`);
        }
        
        // Calculate final durations
        const productiveDuration = formatDuration(finalProductiveSeconds);
        const idleDuration = formatDuration(current.idleSeconds);
        
        debugLog('[Session] Logout - Productive:', productiveDuration, 'Idle:', idleDuration);
        
        // Send session data to backend
        const params = new URLSearchParams();
        params.append('action', 'logout');
        params.append('email', currentUser.email);
        params.append('duration_productive', productiveDuration);
        params.append('duration_idle', idleDuration);
        params.append('device', navigator.userAgent || 'Unknown Device');
        
        try {
            await fetch(API_CONFIG.endpoints.auth, {
                method: 'POST',
                body: params
            });
            debugLog('[Session] Logout data sent successfully');
        } catch (error) {
            debugError('[Session] Logout tracking failed:', error);
            // Continue with logout even if tracking fails
        }
        
        // Clean up
        localStorage.removeItem(ACTIVE_SESSION_KEY);
        setCurrentUser(null);
        setSessionData({
            loginTime: null,
            productiveSeconds: 0,
            idleSeconds: 0,
            currentState: 'productive',
            graceStartTime: null,
            lastActiveTimestamp: null
        });
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