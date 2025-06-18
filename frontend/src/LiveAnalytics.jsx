import React, { useState, useEffect } from 'react';

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

    const fetchData = async () => {
        try {
            console.log('🔄 Refreshing analytics data...');
            console.log('🔍 Fetching analytics data from:', ANALYTICS_API);
            
            setError(null);
            
            // Fetch live data with better error handling
            try {
                const liveResponse = await fetch(`${ANALYTICS_API}/analytics/live-data`);
                console.log('📊 Live data response:', liveResponse.status, liveResponse.ok);
                
                if (liveResponse.ok) {
                    const data = await liveResponse.json();
                    console.log('✅ Live data:', data);
                    setLiveData(data);
                    setConnectionStatus(data.isLive ? 'live' : 'not_ready');
                } else {
                    console.error('❌ Live data request failed:', liveResponse.status);
                    setConnectionStatus('error');
                    setError(`Live data failed: ${liveResponse.status}`);
                }
            } catch (err) {
                console.error('❌ Live data request failed:', err);
                setConnectionStatus('error');
                setError('Live data connection failed');
            }

            // Fetch alerts
            try {
                const alertsResponse = await fetch(`${ANALYTICS_API}/analytics/alerts`);
                console.log('🚨 Alerts response:', alertsResponse.status, alertsResponse.ok);
                
                if (alertsResponse.ok) {
                    const alertData = await alertsResponse.json();
                    console.log('✅ Alerts data:', alertData);
                    setAlerts(alertData.alerts || []);
                } else {
                    console.error('❌ Alerts request failed:', alertsResponse.status);
                }
            } catch (err) {
                console.error('❌ Alerts request failed:', err);
            }
            
            console.log('✅ Analytics data fetch complete');
            setLastUpdate(new Date().toLocaleTimeString());
            
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Connection failed: ' + err.message);
            setConnectionStatus('error');
        }
    };

    const fetchDebugInfo = async () => {
        try {
            const response = await fetch(`${ANALYTICS_API}/analytics/debug/state-stores`);
            if (response.ok) {
                const data = await response.json();
                setDebugInfo(data);
                console.log('🔧 Debug info:', data);
            }
        } catch (err) {
            console.error('Debug info failed:', err);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Update every 5 seconds
        return () => clearInterval(interval);
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
        <div style={{ 
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{ 
                backgroundColor: '#1a1a2e', 
                border: '2px solid #16a085',
                borderRadius: '16px',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #16a085, #1abc9c)',
                    padding: '20px',
                    color: 'white'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '1.8em' }}>
                            📊 Live Kafka Analytics Dashboard
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: getStatusColor(),
                                boxShadow: '0 0 8px rgba(255,255,255,0.3)'
                            }}></div>
                            <span style={{ fontSize: '0.9em', opacity: 0.9 }}>
                                {getStatusText()}
                            </span>
                        </div>
                    </div>
                    <p style={{ margin: '8px 0 0 0', opacity: 0.8, fontSize: '0.9em' }}>
                        {liveData.dataSource}
                    </p>
                    {/* Control Buttons */}
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={fetchData}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: '6px',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            🔄 Manual Refresh
                        </button>
                        <button 
                            onClick={fetchDebugInfo}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: '6px',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            🔧 Debug State Stores
                        </button>
                    </div>
                </div>

                <div style={{ padding: '24px' }}>
                    {/* Debug Info */}
                    {!liveData.storeReady && (
                        <div style={{
                            backgroundColor: '#3d3d1a',
                            color: '#ffeb3b',
                            padding: '16px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            border: '2px solid #ffeb3b'
                        }}>
                            ⚠️ <strong>Debug Info:</strong> Kafka Streams state stores are initializing. 
                            This is normal during startup. Data will appear once streams are ready.
                            <br/>
                            <small>Current state: {liveData.kafkaStreamsState || 'Unknown'}</small>
                        </div>
                    )}

                    {/* State Store Debug Information */}
                    {debugInfo && (
                        <div style={{
                            backgroundColor: '#2a2a3e',
                            color: '#fff',
                            padding: '16px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            border: '1px solid #555',
                            fontSize: '0.8em'
                        }}>
                            <h4>🔧 State Store Debug Info</h4>
                            <p><strong>Kafka Streams State:</strong> {debugInfo.kafkaStreamsState}</p>
                            <p><strong>Order Store Entries:</strong> {debugInfo.orderStoreSize || 0}</p>
                            <p><strong>Revenue Store Entries:</strong> {debugInfo.revenueStoreSize || 0}</p>
                            {debugInfo.orderStoreEntries && debugInfo.orderStoreEntries.length > 0 && (
                                <details style={{ marginTop: '10px' }}>
                                    <summary style={{ cursor: 'pointer', color: '#16a085' }}>
                                        📊 Order Store Contents (Last 5 entries)
                                    </summary>
                                    <pre style={{ 
                                        backgroundColor: '#1a1a2e', 
                                        padding: '10px', 
                                        borderRadius: '4px',
                                        overflow: 'auto',
                                        fontSize: '0.7em'
                                    }}>
                                        {JSON.stringify(debugInfo.orderStoreEntries.slice(-5), null, 2)}
                                    </pre>
                                </details>
                            )}
                            {debugInfo.revenueStoreEntries && debugInfo.revenueStoreEntries.length > 0 && (
                                <details style={{ marginTop: '10px' }}>
                                    <summary style={{ cursor: 'pointer', color: '#16a085' }}>
                                        💰 Revenue Store Contents (Last 5 entries)
                                    </summary>
                                    <pre style={{ 
                                        backgroundColor: '#1a1a2e', 
                                        padding: '10px', 
                                        borderRadius: '4px',
                                        overflow: 'auto',
                                        fontSize: '0.7em'
                                    }}>
                                        {JSON.stringify(debugInfo.revenueStoreEntries.slice(-5), null, 2)}
                                    </pre>
                                </details>
                            )}
                        </div>
                    )}

                    {/* Alerts Section */}
                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ color: '#ff4444', marginBottom: '16px', fontSize: '1.4em' }}>
                            🚨 High Volume Alerts
                        </h3>
                        {alerts.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {alerts.slice(-3).reverse().map((alert, index) => (
                                    <div key={index} style={{
                                        background: 'linear-gradient(135deg, #ff4444, #ff6b6b)',
                                        color: 'white',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: '2px solid #ff6666',
                                        boxShadow: '0 4px 12px rgba(255, 68, 68, 0.3)',
                                        animation: index === 0 ? 'pulse 2s infinite' : 'none'
                                    }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                                            🚨 {alert.message}
                                        </div>
                                        <div style={{ fontSize: '0.9em', opacity: 0.9 }}>
                                            <strong>{alert.product}</strong> • {alert.orderCount} orders • 
                                            {new Date(alert.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                backgroundColor: '#2a3f35',
                                color: '#4CAF50',
                                padding: '20px',
                                borderRadius: '12px',
                                textAlign: 'center',
                                border: '2px solid #4CAF50'
                            }}>
                                ✅ All systems normal - No high volume alerts
                            </div>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '24px'
                    }}>
                        {/* Order Counts */}
                        <div style={{
                            backgroundColor: '#2a2a3e',
                            borderRadius: '12px',
                            padding: '20px',
                            border: '1px solid #444'
                        }}>
                            <h4 style={{ color: '#4a90e2', marginBottom: '16px', fontSize: '1.2em' }}>
                                🛒 Live Orders (Last 5 Minutes)
                            </h4>
                            {Object.keys(liveData.orderCounts).length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {Object.entries(liveData.orderCounts).map(([product, count]) => (
                                        <div key={product} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px',
                                            backgroundColor: count > 3 ? '#3d1a1a' : '#2a2a3e',
                                            borderRadius: '8px',
                                            border: count > 3 ? '2px solid #ff4444' : '1px solid #555'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '1.5em' }}>
                                                    {count > 3 ? '🔥' : '📦'}
                                                </span>
                                                <span style={{ fontWeight: 'bold', color: 'white' }}>
                                                    {product}
                                                </span>
                                            </div>
                                            <span style={{
                                                fontSize: '1.2em',
                                                fontWeight: 'bold',
                                                color: count > 3 ? '#ff4444' : '#16a085'
                                            }}>
                                                {count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center' }}>
                                    {liveData.storeReady ? 'No orders in last 5 minutes' : 'Waiting for data...'}
                                </p>
                            )}
                        </div>

                        {/* Profit/Revenue */}
                        <div style={{
                            backgroundColor: '#2a2a3e',
                            borderRadius: '12px',
                            padding: '20px',
                            border: '1px solid #444'
                        }}>
                            <h4 style={{ color: '#ff9800', marginBottom: '16px', fontSize: '1.2em' }}>
                                💰 Live Profit (Last 5 Minutes)
                            </h4>
                            <div style={{
                                textAlign: 'center',
                                padding: '20px',
                                backgroundColor: '#1a1a2e',
                                borderRadius: '8px'
                            }}>
                                <div style={{ fontSize: '3em', marginBottom: '8px' }}>💵</div>
                                <div style={{
                                    fontSize: '2.2em',
                                    fontWeight: 'bold',
                                    color: liveData.profit > 0 ? '#16a085' : '#888',
                                    marginBottom: '4px'
                                }}>
                                    ${(liveData.profit || liveData.totalRevenue || 0).toFixed(2)}
                                </div>
                                <div style={{ color: '#999', fontSize: '0.9em' }}>
                                    From Kafka Streams
                                </div>
                                {liveData.totalRevenue !== liveData.profit && (
                                    <div style={{ color: '#666', fontSize: '0.8em', marginTop: '4px' }}>
                                        Revenue: ${(liveData.totalRevenue || 0).toFixed(2)}
                                    </div>
                                )}
                                {liveData.totalOrdersFound !== undefined && (
                                    <div style={{ color: '#666', fontSize: '0.8em', marginTop: '4px' }}>
                                        Total Orders Found: {liveData.totalOrdersFound}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div style={{
                        marginTop: '24px',
                        padding: '16px',
                        backgroundColor: '#1a1a2e',
                        borderRadius: '8px',
                        textAlign: 'center',
                        color: '#888',
                        fontSize: '0.9em'
                    }}>
                        Real-time data from Kafka Streams • Updates every 5 seconds • {liveData.windowInfo || 'Last 5 minutes'}
                        <br/>
                        <small>
                            Store Ready: {liveData.storeReady ? '✅' : '⏳'} | 
                            Connection: {connectionStatus} | 
                            Kafka State: {liveData.kafkaStreamsState || 'Unknown'}
                        </small>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.02); }
                }
            `}</style>
        </div>
    );
};

export default LiveAnalytics;
