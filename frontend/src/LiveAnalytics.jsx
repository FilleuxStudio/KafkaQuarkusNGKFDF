import React, { useState, useEffect, useRef } from 'react';

const ANALYTICS_API = import.meta.env.VITE_ANALYTICS_BASE || 'http://104.155.70.59:8085';

const LiveAnalytics = () => {
    const [liveData, setLiveData] = useState({
        orderCounts: {},
        totalRevenue: 0,
        profit: 0,
        isLive: false,
        storeReady: false,
        dataSource: 'Connecting...'
    });
    const [alerts, setAlerts] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [error, setError] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [debugInfo, setDebugInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            try {
                const liveResponse = await fetch(`${ANALYTICS_API}/analytics/live-data`);
                if (liveResponse.ok) {
                    const data = await liveResponse.json();
                    setLiveData(data);
                    setConnectionStatus(data.isLive ? 'live' : 'not_ready');
                } else {
                    setConnectionStatus('error');
                    setError(`Live data failed: ${liveResponse.status}`);
                }
            } catch (err) {
                setConnectionStatus('error');
                setError('Live data connection failed');
            }

            try {
                const alertsResponse = await fetch(`${ANALYTICS_API}/analytics/alerts`);
                if (alertsResponse.ok) {
                    const alertData = await alertsResponse.json();
                    setAlerts(alertData.alerts || []);
                }
            } catch (err) {
                console.error('❌ Alerts request failed:', err);
            }
            
            setLastUpdate(new Date().toLocaleTimeString());
            
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Connection failed: ' + err.message);
            setConnectionStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const fetchDebugInfo = async () => {
        try {
            const response = await fetch(`${ANALYTICS_API}/analytics/debug/state-stores`);
            if (response.ok) {
                const data = await response.json();
                setDebugInfo(data);
            }
        } catch (err) {
            console.error('Debug info failed:', err);
        }
    };

    // ✅ FIXED: Removed auto-refresh completely
    useEffect(() => {
        fetchData(); // Only initial load, no auto-refresh
    }, []);

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'live': return '#4CAF50';
            case 'not_ready': return '#ff9800';
            case 'error': return '#f44336';
            default: return '#999';
        }
    };

    const getStatusText = () => {
        switch (connectionStatus) {
            case 'live': return `Live • ${lastUpdate}`;
            case 'not_ready': return 'Kafka Streams initializing...';
            case 'error': return error || 'Connection error';
            default: return 'Connecting...';
        }
    };

    return (
        <div>
            {/* Live Data Header */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: 'var(--apple-black)',
                        letterSpacing: '-0.02em',
                        margin: 0
                    }}>
                        Live Analytics Data
                    </h2>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: getStatusColor(),
                                boxShadow: `0 0 8px ${getStatusColor()}`
                            }}></div>
                            <span style={{ 
                                color: 'var(--apple-text-gray)',
                                fontSize: '0.9rem',
                                fontWeight: '500'
                            }}>
                                {getStatusText()}
                            </span>
                        </div>
                        
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            style={{
                                background: loading 
                                    ? 'linear-gradient(135deg, var(--apple-gray) 0%, var(--apple-black) 100%)'
                                    : 'linear-gradient(135deg, var(--apple-blue) 0%, #0052a3 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>
                
                <p style={{ 
                    color: 'var(--apple-text-gray)',
                    fontSize: '0.9rem',
                    margin: 0
                }}>
                    {liveData.dataSource} • Manual refresh only
                </p>
            </div>

            {/* Status Cards */}
            {!liveData.storeReady && (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '2rem',
                    marginBottom: '2rem',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
                    border: '2px solid #ff9800'
                }}>
                    <h3 style={{
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        marginBottom: '1rem',
                        color: '#e65100',
                        letterSpacing: '-0.02em'
                    }}>
                        ⚠️ System Initializing
                    </h3>
                    <p style={{ color: '#e65100', marginBottom: '0.5rem' }}>
                        Tumbling window analytics store is starting up. This is normal during system startup. 
                        Data will appear once Kafka Streams are ready.
                    </p>
                    <small style={{ color: '#e65100', opacity: 0.8 }}>
                        Current state: {liveData.kafkaStreamsState || 'Unknown'}
                    </small>
                </div>
            )}

            {liveData.storeReady && (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '2rem',
                    marginBottom: '2rem',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
                    border: '2px solid #4CAF50'
                }}>
                    <h3 style={{
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        marginBottom: '1rem',
                        color: '#2e7d32',
                        letterSpacing: '-0.02em'
                    }}>
                        ✅ Tumbling Windows Active
                    </h3>
                    <p style={{ color: '#2e7d32' }}>
                        Each order counted exactly once in non-overlapping 5-minute windows. 
                        No duplicate data - clean analytics!
                    </p>
                </div>
            )}

            {/* Debug Information */}
            {debugInfo && (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '2rem',
                    marginBottom: '2rem',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
                    <h3 style={{
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        marginBottom: '1.5rem',
                        color: 'var(--apple-blue)',
                        letterSpacing: '-0.02em'
                    }}>
                        🔧 Live Data Debug Information
                    </h3>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1.5rem'
                    }}>
                        <div>
                            <strong style={{ color: 'var(--apple-black)' }}>Kafka Streams State:</strong><br />
                            <span style={{ color: 'var(--apple-blue)' }}>{debugInfo.kafkaStreamsState}</span>
                        </div>
                        <div>
                            <strong style={{ color: 'var(--apple-black)' }}>Analytics Entries:</strong><br />
                            <span style={{ color: 'var(--apple-blue)' }}>{debugInfo.unifiedAnalyticsSize || 0}</span>
                        </div>
                        <div>
                            <strong style={{ color: 'var(--apple-black)' }}>Window Type:</strong><br />
                            <span style={{ color: 'var(--apple-blue)' }}>Non-overlapping Tumbling (5 min)</span>
                        </div>
                    </div>
                    
                    <button
                        onClick={fetchDebugInfo}
                        style={{
                            background: 'linear-gradient(135deg, var(--apple-gray) 0%, var(--apple-black) 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        🔧 Refresh Debug Info
                    </button>
                </div>
            )}

            {/* Alerts Section */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
                <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    marginBottom: '1.5rem',
                    color: '#f44336',
                    letterSpacing: '-0.02em'
                }}>
                    🚨 High Volume Alerts
                </h3>
                
                {alerts.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {alerts.slice(-3).reverse().map((alert, index) => (
                            <div key={index} style={{
                                background: index === 0 
                                    ? 'linear-gradient(135deg, #f44336 0%, #ff6b6b 100%)'
                                    : 'linear-gradient(135deg, rgba(244, 67, 54, 0.8) 0%, rgba(255, 107, 107, 0.8) 100%)',
                                color: 'white',
                                padding: '1.5rem',
                                borderRadius: '16px',
                                border: '2px solid #ff6666',
                                boxShadow: '0 4px 20px rgba(244, 67, 54, 0.3)'
                            }}>
                                <div style={{ 
                                    fontWeight: '700', 
                                    marginBottom: '0.5rem',
                                    fontSize: '1.1rem'
                                }}>
                                    🚨 {alert.message}
                                </div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                    <strong>{alert.product}</strong> • {alert.orderCount} orders • 
                                    {new Date(alert.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{
                        background: 'rgba(76, 175, 80, 0.1)',
                        color: '#2e7d32',
                        padding: '2rem',
                        borderRadius: '16px',
                        textAlign: 'center',
                        border: '2px solid #4CAF50',
                        fontSize: '1.1rem',
                        fontWeight: '600'
                    }}>
                        ✅ All systems normal - No high volume alerts
                    </div>
                )}
            </div>

            {/* Analytics Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '2rem'
            }}>
                {/* Live Orders Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '2rem',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
                    <h3 style={{
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        marginBottom: '1rem',
                        color: 'var(--apple-blue)',
                        letterSpacing: '-0.02em'
                    }}>
                        🛒 Live Orders
                    </h3>
                    <p style={{
                        color: 'var(--apple-text-gray)',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem'
                    }}>
                        Current 5-minute tumbling window
                    </p>
                    
                    {Object.keys(liveData.orderCounts).length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {Object.entries(liveData.orderCounts).map(([product, count]) => (
                                <div key={product} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: count > 3 
                                        ? '2px solid #f44336' 
                                        : '1px solid rgba(0, 0, 0, 0.1)',
                                    background: count > 3 
                                        ? 'rgba(244, 67, 54, 0.1)' 
                                        : 'rgba(255, 255, 255, 0.8)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ fontSize: '1.5rem' }}>
                                            {count > 3 ? '🔥' : '📦'}
                                        </span>
                                        <span style={{ 
                                            fontWeight: '600',
                                            color: 'var(--apple-black)'
                                        }}>
                                            {product}
                                        </span>
                                    </div>
                                    <span style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        color: count > 3 ? '#f44336' : 'var(--apple-blue)'
                                    }}>
                                        {count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '2rem',
                            color: 'var(--apple-text-gray)',
                            fontStyle: 'italic'
                        }}>
                            {liveData.storeReady 
                                ? 'No orders in current 5-minute window' 
                                : 'Waiting for tumbling window data...'}
                        </div>
                    )}
                </div>

                {/* Live Revenue Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '2rem',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
                    <h3 style={{
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        marginBottom: '1rem',
                        color: 'var(--apple-orange)',
                        letterSpacing: '-0.02em'
                    }}>
                        💰 Live Revenue
                    </h3>
                    <p style={{
                        color: 'var(--apple-text-gray)',
                        marginBottom: '2rem',
                        fontSize: '0.9rem'
                    }}>
                        Current 5-minute tumbling window
                    </p>
                    
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                            fontSize: '4rem', 
                            marginBottom: '1rem'
                        }}>
                            💵
                        </div>
                        <div style={{
                            fontSize: '3rem',
                            fontWeight: '800',
                            color: liveData.totalRevenue > 0 ? 'var(--apple-blue)' : 'var(--apple-text-gray)',
                            marginBottom: '0.5rem',
                            letterSpacing: '-0.02em'
                        }}>
                            ${(liveData.totalRevenue || 0).toFixed(2)}
                        </div>
                        <div style={{ 
                            color: 'var(--apple-text-gray)',
                            fontSize: '0.9rem',
                            marginBottom: '0.5rem'
                        }}>
                            From Tumbling Window Analytics
                        </div>
                        <div style={{ 
                            color: '#4CAF50',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            marginBottom: '1rem'
                        }}>
                            ✅ No duplicate counting
                        </div>
                        {liveData.totalOrdersFound !== undefined && (
                            <div style={{ 
                                color: 'var(--apple-text-gray)',
                                fontSize: '0.8rem'
                            }}>
                                Total Orders Found: {liveData.totalOrdersFound}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveAnalytics;
