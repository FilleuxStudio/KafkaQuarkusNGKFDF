import React, { useState, useEffect } from 'react';
import LiveAnalytics from './LiveAnalytics';

const ANALYTICS_API = import.meta.env.VITE_ANALYTICS_BASE || 'http://104.155.70.59:8085';

const AnalyticsDashboard = () => {
    const [status, setStatus] = useState(null);
    const [stats, setStats] = useState(null);
    const [alerts, setAlerts] = useState(null);
    const [isLive, setIsLive] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
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
            } catch (error) {
                console.error('❌ Failed to fetch analytics data:', error);
            } finally {
                setLoading(false);
                console.log('✅ Analytics data fetch complete');
            }
        };

        console.log('🚀 Analytics Dashboard mounted, starting data fetch...');
        fetchData();
        const interval = setInterval(() => {
            console.log('🔄 Refreshing analytics data...');
            fetchData();
        }, 5000); // Update every 5 seconds

        return () => {
            console.log('🛑 Analytics Dashboard unmounted, clearing interval');
            clearInterval(interval);
        };
    }, []);

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#fff' }}>
                <h2>Loading Analytics Dashboard...</h2>
                <p>Connecting to {ANALYTICS_API}</p>
            </div>
        );
    }

    return (
        <div style={{ 
            padding: '20px', 
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#121212',
            color: '#ffffff',
            minHeight: '100vh'
        }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
                📊 Real-Time Analytics Dashboard
            </h1>
            
            {/* Debug Info */}
            <div style={{ 
                backgroundColor: '#2a2a2a', 
                border: '1px solid #555',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '20px',
                fontSize: '0.9em'
            }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#00ff00' }}>🐛 Debug Info</h4>
                <p><strong>API Endpoint:</strong> {ANALYTICS_API}</p>
                <p><strong>Status Data:</strong> {status ? '✅ Loaded' : '❌ Missing'}</p>
                <p><strong>Stats Data:</strong> {stats ? '✅ Loaded' : '❌ Missing'}</p>
                <p><strong>Alerts Data:</strong> {alerts ? '✅ Loaded' : '❌ Missing'}</p>
                <p><strong>Is Live:</strong> {isLive ? '🟢 Yes' : '🔴 No'}</p>
            </div>
            
            {/* Live Analytics Component */}
            <LiveAnalytics />

            {/* Status Indicator */}
            <div style={{ 
                backgroundColor: isLive ? '#1e3a1e' : '#3a1e1e', 
                border: `2px solid ${isLive ? '#4caf50' : '#f44336'}`,
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px'
            }}>
                <h3 style={{ margin: '0 0 10px 0' }}>
                    🔴 System Status: {isLive ? '🟢 LIVE & ACTIVE' : '🔴 OFFLINE'}
                </h3>
                {status ? (
                    <>
                        <p style={{ margin: '5px 0' }}>
                            <strong>Service:</strong> {status.service}
                        </p>
                        <p style={{ margin: '5px 0' }}>
                            <strong>Kafka Streams:</strong> {status.kafkaStreamsState}
                        </p>
                    </>
                ) : (
                    <p style={{ color: '#ff6b6b' }}>❌ No status data available</p>
                )}
                {stats ? (
                    <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#ccc' }}>
                        Last updated: {new Date(stats.timestamp).toLocaleTimeString()}
                    </p>
                ) : (
                    <p style={{ color: '#ff6b6b', fontSize: '0.9em' }}>❌ No stats data available</p>
                )}
            </div>

            {/* Real-time Processing Info */}
            <div style={{ 
                backgroundColor: '#1e1e2e', 
                border: '2px solid #4a90e2',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px'
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#4a90e2' }}>
                    ⚡ Real-Time Stream Processing
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2em', marginBottom: '5px' }}>🛒</div>
                        <div style={{ fontWeight: 'bold' }}>Order Counting</div>
                        <div style={{ fontSize: '0.9em', color: '#ccc' }}>5-minute windows</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2em', marginBottom: '5px' }}>💰</div>
                        <div style={{ fontWeight: 'bold' }}>Revenue Tracking</div>
                        <div style={{ fontSize: '0.9em', color: '#ccc' }}>Per product analytics</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2em', marginBottom: '5px' }}>🚨</div>
                        <div style={{ fontWeight: 'bold' }}>Volume Alerts</div>
                        <div style={{ fontSize: '0.9em', color: '#ccc' }}>&gt;3 orders in 2min</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2em', marginBottom: '5px' }}>📊</div>
                        <div style={{ fontWeight: 'bold' }}>Live Analytics</div>
                        <div style={{ fontSize: '0.9em', color: '#ccc' }}>Sliding windows</div>
                    </div>
                </div>
            </div>

            {/* Alerts Section */}
            <div style={{ 
                backgroundColor: '#2e2e1e', 
                border: '2px solid #ff9800',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px'
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#ff9800' }}>
                    🚨 High Volume Alert System
                </h3>
                {alerts ? (
                    <>
                        <p style={{ margin: '10px 0' }}>
                            <strong>Status:</strong> {alerts.alertsActive ? '✅ Active' : '❌ Inactive'}
                        </p>
                        <p style={{ margin: '10px 0' }}>
                            <strong>Monitoring:</strong> {alerts.systemStatus}
                        </p>
                        <div style={{ 
                            backgroundColor: '#1a1a1a', 
                            padding: '10px', 
                            borderRadius: '8px', 
                            fontFamily: 'monospace',
                            fontSize: '0.9em'
                        }}>
                            💡 Alerts trigger when any product receives more than 3 orders within 2 minutes
                        </div>
                    </>
                ) : (
                    <p style={{ color: '#ff6b6b' }}>❌ No alerts data available</p>
                )}
            </div>

            {/* Data Flow Visualization */}
            <div style={{ 
                backgroundColor: '#1e1e1e', 
                border: '2px solid #9c27b0',
                borderRadius: '12px',
                padding: '20px'
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#9c27b0' }}>
                    🌊 Kafka Data Flow
                </h3>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px'
                }}>
                    <div style={{ textAlign: 'center', flex: '1', minWidth: '150px' }}>
                        <div style={{ fontSize: '1.5em', marginBottom: '5px' }}>📦</div>
                        <div>Orders API</div>
                        <div style={{ fontSize: '0.8em', color: '#ccc' }}>Produces orders</div>
                    </div>
                    <div style={{ color: '#9c27b0', fontSize: '1.5em' }}>→</div>
                    <div style={{ textAlign: 'center', flex: '1', minWidth: '150px' }}>
                        <div style={{ fontSize: '1.5em', marginBottom: '5px' }}>📡</div>
                        <div>Kafka Topic</div>
                        <div style={{ fontSize: '0.8em', color: '#ccc' }}>"orders"</div>
                    </div>
                    <div style={{ color: '#9c27b0', fontSize: '1.5em' }}>→</div>
                    <div style={{ textAlign: 'center', flex: '1', minWidth: '150px' }}>
                        <div style={{ fontSize: '1.5em', marginBottom: '5px' }}>⚙️</div>
                        <div>Stream Processing</div>
                        <div style={{ fontSize: '0.8em', color: '#ccc' }}>Real-time analytics</div>
                    </div>
                    <div style={{ color: '#9c27b0', fontSize: '1.5em' }}>→</div>
                    <div style={{ textAlign: 'center', flex: '1', minWidth: '150px' }}>
                        <div style={{ fontSize: '1.5em', marginBottom: '5px' }}>📈</div>
                        <div>Analytics Topics</div>
                        <div style={{ fontSize: '0.8em', color: '#ccc' }}>Results & alerts</div>
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div style={{ 
                marginTop: '30px', 
                padding: '20px', 
                backgroundColor: '#1a1a2e', 
                borderRadius: '12px',
                border: '2px solid #16a085'
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#16a085' }}>
                    🚀 How to Test Analytics
                </h3>
                <ol style={{ lineHeight: '1.6' }}>
                    <li>Go to the <strong>Home</strong> page and add products to cart</li>
                    <li>Submit orders through the cart</li>
                    <li>Return here to see the system processing data</li>
                    <li>Create multiple orders quickly to trigger volume alerts</li>
                    <li>Check browser console for detailed analytics logs</li>
                </ol>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
