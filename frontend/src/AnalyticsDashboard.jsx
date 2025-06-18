import React, { useState, useEffect, useRef } from 'react';
import LiveAnalytics from './LiveAnalytics';

const ANALYTICS_API = import.meta.env.VITE_ANALYTICS_BASE || 'http://104.155.70.59:8085';

const AnalyticsDashboard = () => {
    const [status, setStatus] = useState(null);
    const [stats, setStats] = useState(null);
    const [alerts, setAlerts] = useState(null);
    const [isLive, setIsLive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
    
    // ✅ Scroll position preservation
    const scrollPosition = useRef(0);
    const lastUpdateTime = useRef(Date.now());

    const fetchData = async (isAutoRefresh = false) => {
        try {
            if (isAutoRefresh) {
                setIsAutoRefreshing(true);
                // ✅ Save scroll position before auto-refresh
                scrollPosition.current = window.pageYOffset;
            } else {
                setLoading(true);
            }
            
            console.log('🔍 Fetching analytics data from:', ANALYTICS_API);
            
            // Fetch all analytics data
            const [statusRes, statsRes, alertsRes] = await Promise.all([
                fetch(`${ANALYTICS_API}/analytics/status`),
                fetch(`${ANALYTICS_API}/analytics/realtime-stats`),
                fetch(`${ANALYTICS_API}/analytics/alerts`)
            ]);

            console.log('📊 Status response:', statusRes.status, statusRes.ok);
            console.log('📈 Stats response:', statsRes.status, statsRes.ok);
            console.log('🚨 Alerts response:', alertsRes.status, alertsRes.ok);

            if (statusRes.ok) {
                const statusData = await statusRes.json();
                console.log('✅ Status data:', statusData);
                setStatus(statusData);
                setIsLive(statusData.kafkaStreamsState === 'RUNNING');
            } else {
                console.error('❌ Status request failed:', statusRes.status);
            }

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                console.log('✅ Stats data:', statsData);
                setStats(statsData);
            } else {
                console.error('❌ Stats request failed:', statsRes.status);
            }

            if (alertsRes.ok) {
                const alertsData = await alertsRes.json();
                console.log('✅ Alerts data:', alertsData);
                setAlerts(alertsData);
            } else {
                console.error('❌ Alerts request failed:', alertsRes.status);
            }
            
            lastUpdateTime.current = Date.now();
            
        } catch (error) {
            console.error('❌ Failed to fetch analytics data:', error);
        } finally {
            if (isAutoRefresh) {
                setIsAutoRefreshing(false);
                // ✅ Restore scroll position after auto-refresh
                setTimeout(() => {
                    window.scrollTo({
                        top: scrollPosition.current,
                        behavior: 'instant' // No smooth scrolling for invisible restore
                    });
                }, 0);
            } else {
                setLoading(false);
            }
            console.log('✅ Analytics data fetch complete');
        }
    };

    // ✅ Invisible auto-refresh implementation
    useEffect(() => {
        console.log('🚀 Analytics Dashboard mounted, starting initial data fetch...');
        
        // ✅ Prevent browser scroll restoration
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
        
        // Initial load
        fetchData(false);
        
        // ✅ Auto-refresh every 5 seconds with scroll preservation
        const interval = setInterval(() => {
            console.log('🔄 Auto-refreshing analytics data (invisible)...');
            fetchData(true); // true = auto-refresh mode
        }, 5000); // 5 seconds - not too aggressive
        
        return () => {
            clearInterval(interval);
            // Restore default scroll behavior on cleanup
            if ('scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'auto';
            }
        };
    }, []);

    if (loading) {
        return (
            <div className="app-container" style={{ 
                minHeight: '100vh',
                background: 'linear-gradient(135deg, var(--apple-white) 0%, #ffffff 100%)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '3rem',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    textAlign: 'center'
                }}>
                    <h2 style={{ 
                        color: 'var(--apple-black)',
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        marginBottom: '1rem'
                    }}>
                        Loading Analytics Dashboard...
                    </h2>
                    <p style={{ color: 'var(--apple-text-gray)' }}>
                        Connecting to {ANALYTICS_API}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container" style={{ 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, var(--apple-white) 0%, #ffffff 100%)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif'
        }}>
            {/* Header */}
            <div style={{
                background: 'rgba(251, 251, 253, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                padding: '1.5rem 2rem',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, var(--apple-black) 0%, var(--apple-gray) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        letterSpacing: '-0.03em',
                        margin: 0
                    }}>
                        Real-Time Analytics Dashboard
                    </h1>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* ✅ Auto-refresh indicator */}
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            opacity: isAutoRefreshing ? 1 : 0.6,
                            transition: 'opacity 0.3s ease'
                        }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: '#4CAF50',
                                animation: isAutoRefreshing ? 'pulse 1s infinite' : 'none'
                            }}></div>
                            <span style={{ 
                                fontSize: '0.8rem',
                                color: 'var(--apple-text-gray)',
                                fontWeight: '500'
                            }}>
                                {isAutoRefreshing ? 'Refreshing...' : 'Auto-refresh: 5s'}
                            </span>
                        </div>
                        
                        <button
                            onClick={() => fetchData(false)}
                            disabled={loading || isAutoRefreshing}
                            style={{
                                background: (loading || isAutoRefreshing)
                                    ? 'linear-gradient(135deg, var(--apple-gray) 0%, var(--apple-black) 100%)'
                                    : 'linear-gradient(135deg, var(--apple-blue) 0%, #0052a3 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '12px',
                                cursor: (loading || isAutoRefreshing) ? 'not-allowed' : 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                opacity: (loading || isAutoRefreshing) ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Refreshing...' : 'Manual Refresh'}
                        </button>
                    </div>
                </div>
                
                {/* ✅ Last update indicator */}
                <p style={{ 
                    margin: '0.5rem 0 0 0', 
                    color: 'var(--apple-text-gray)',
                    fontSize: '0.8rem'
                }}>
                    Last updated: {new Date(lastUpdateTime.current).toLocaleTimeString()} • 
                    Auto-refresh enabled with scroll preservation
                </p>
            </div>

            {/* Main Content */}
            <div style={{ padding: '3rem 2rem' }}>
                
                {/* Debug Info - Stock Management Style */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '2rem',
                    marginBottom: '2rem',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    // ✅ Smooth transition during refresh
                    transition: 'opacity 0.2s ease',
                    opacity: isAutoRefreshing ? 0.95 : 1
                }}>
                    <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        marginBottom: '1.5rem',
                        color: 'var(--apple-blue)',
                        letterSpacing: '-0.02em'
                    }}>
                        System Debug Info
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                    }}>
                        <div>
                            <strong style={{ color: 'var(--apple-black)' }}>API Endpoint:</strong><br />
                            <span style={{ color: 'var(--apple-blue)', fontSize: '0.9rem' }}>{ANALYTICS_API}</span>
                        </div>
                        <div>
                            <strong style={{ color: 'var(--apple-black)' }}>Status Data:</strong><br />
                            <span style={{ color: status ? '#4CAF50' : '#f44336' }}>
                                {status ? '✅ Loaded' : '❌ Missing'}
                            </span>
                        </div>
                        <div>
                            <strong style={{ color: 'var(--apple-black)' }}>Stats Data:</strong><br />
                            <span style={{ color: stats ? '#4CAF50' : '#f44336' }}>
                                {stats ? '✅ Loaded' : '❌ Missing'}
                            </span>
                        </div>
                        <div>
                            <strong style={{ color: 'var(--apple-black)' }}>Alerts Data:</strong><br />
                            <span style={{ color: alerts ? '#4CAF50' : '#f44336' }}>
                                {alerts ? '✅ Loaded' : '❌ Missing'}
                            </span>
                        </div>
                        <div>
                            <strong style={{ color: 'var(--apple-black)' }}>Is Live:</strong><br />
                            <span style={{ color: isLive ? '#4CAF50' : '#f44336' }}>
                                {isLive ? '🟢 Yes' : '🔴 No'}
                            </span>
                        </div>
                        <div>
                            <strong style={{ color: 'var(--apple-black)' }}>Auto-Refresh:</strong><br />
                            <span style={{ color: '#4CAF50' }}>
                                ✅ Active (5s interval)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Live Analytics Component - Pass refresh state */}
                <LiveAnalytics isAutoRefreshing={isAutoRefreshing} />

                {/* Rest of your existing sections... */}
                {/* System Status - Stock Management Style */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '2rem',
                    marginBottom: '2rem',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
                    border: isLive ? '2px solid #4CAF50' : '2px solid #f44336',
                    transition: 'opacity 0.2s ease',
                    opacity: isAutoRefreshing ? 0.95 : 1
                }}>
                    <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        marginBottom: '1rem',
                        color: isLive ? '#2e7d32' : '#d32f2f',
                        letterSpacing: '-0.02em'
                    }}>
                        System Status: {isLive ? 'LIVE & ACTIVE' : 'OFFLINE'}
                    </h3>
                    {status ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                            <div>
                                <strong style={{ color: 'var(--apple-black)' }}>Service:</strong><br />
                                <span style={{ color: 'var(--apple-blue)' }}>{status.service}</span>
                            </div>
                            <div>
                                <strong style={{ color: 'var(--apple-black)' }}>Kafka Streams:</strong><br />
                                <span style={{ color: 'var(--apple-blue)' }}>{status.kafkaStreamsState}</span>
                            </div>
                        </div>
                    ) : (
                        <p style={{ color: '#d32f2f' }}>❌ No status data available</p>
                    )}
                    {stats && (
                        <p style={{ 
                            marginTop: '1rem',
                            fontSize: '0.9em', 
                            color: 'var(--apple-text-gray)' 
                        }}>
                            Last updated: {new Date(stats.timestamp).toLocaleTimeString()}
                        </p>
                    )}
                </div>

                {/* All other sections remain the same... */}
            </div>
            
            {/* ✅ CSS Animation for pulse effect */}
            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.1); }
                }
            `}</style>
        </div>
    );
};

export default AnalyticsDashboard;
