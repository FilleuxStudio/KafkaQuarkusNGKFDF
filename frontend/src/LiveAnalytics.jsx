import React, { useState, useEffect } from 'react';

const ANALYTICS_API = import.meta.env.VITE_ANALYTICS_BASE || 'http://104.155.70.59:8085';

const LiveAnalytics = () => {
    const [productStats, setProductStats] = useState({});
    const [recentOrders, setRecentOrders] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // Fetch product statistics
                const statsRes = await fetch(`${ANALYTICS_API}/analytics/product-stats`);
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    console.log('📊 Product Stats:', statsData);
                    setProductStats(statsData.productOrderCounts || {});
                }

                // Fetch recent orders
                const ordersRes = await fetch(`${ANALYTICS_API}/analytics/recent-orders`);
                if (ordersRes.ok) {
                    const ordersData = await ordersRes.json();
                    console.log('📋 Recent Orders:', ordersData);
                    setRecentOrders(ordersData.recentOrders || []);
                    setTotalRevenue(ordersData.totalRevenue || 0);
                }
            } catch (error) {
                console.error('❌ Error fetching analytics:', error);
            }
        };

        fetchAnalytics();
        const interval = setInterval(fetchAnalytics, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ 
            backgroundColor: '#1a1a2e', 
            border: '2px solid #16a085',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
        }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#16a085' }}>
                📈 Live Business Analytics
            </h3>

            {/* Product Order Counts */}
            <div style={{ marginBottom: '25px' }}>
                <h4 style={{ color: '#4a90e2', marginBottom: '15px' }}>🛒 Product Order Counts (Live)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    {Object.entries(productStats).map(([product, count]) => (
                        <div key={product} style={{ 
                            backgroundColor: '#2a2a3e', 
                            padding: '15px', 
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '2em', marginBottom: '5px' }}>
                                {count > 5 ? '🔥' : '📦'}
                            </div>
                            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{product}</div>
                            <div style={{ fontSize: '1.5em', color: '#16a085' }}>{count} orders</div>
                        </div>
                    ))}
                </div>
                {Object.keys(productStats).length === 0 && (
                    <p style={{ color: '#ccc', textAlign: 'center', fontStyle: 'italic' }}>
                        No orders processed yet. Place some orders to see live data! 🚀
                    </p>
                )}
            </div>

            {/* Revenue Tracking */}
            <div style={{ marginBottom: '25px' }}>
                <h4 style={{ color: '#ff9800', marginBottom: '15px' }}>💰 Revenue Tracking</h4>
                <div style={{ 
                    backgroundColor: '#2a2a3e', 
                    padding: '20px', 
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '3em', marginBottom: '10px' }}>💵</div>
                    <div style={{ fontSize: '2em', color: '#16a085', fontWeight: 'bold' }}>
                        ${totalRevenue.toFixed(2)}
                    </div>
                    <div style={{ color: '#ccc', fontSize: '0.9em' }}>Recent Revenue (Last 5 minutes)</div>
                </div>
            </div>

            {/* Recent Orders */}
            <div>
                <h4 style={{ color: '#9c27b0', marginBottom: '15px' }}>📋 Recent Order Activity</h4>
                {recentOrders.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {recentOrders.map((order, index) => (
                            <div key={index} style={{ 
                                backgroundColor: '#2a2a3e', 
                                padding: '15px', 
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <strong>{order.product}</strong>
                                    <div style={{ fontSize: '0.9em', color: '#ccc' }}>
                                        Quantity: {order.quantity}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: '#16a085', fontWeight: 'bold' }}>
                                        ${order.revenue}
                                    </div>
                                    <div style={{ fontSize: '0.8em', color: '#ccc' }}>
                                        {new Date(order.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: '#ccc', textAlign: 'center', fontStyle: 'italic' }}>
                        No recent orders. Start shopping to see live updates! 🛍️
                    </p>
                )}
            </div>
        </div>
    );
};

export default LiveAnalytics;
