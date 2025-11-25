import { useState, useEffect } from 'react';
import { Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import '../styles/Dashboard.css';
import NavBar from './NavBar';

const Dashboard = ({ user, onNavigate }) => {

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [businessPromoUsage, setBusinessPromoUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBusinessPromoUsage = async () => {
      try {
        setLoading(true);
        setError(null);
        const endpoint = `${API_BASE_URL}/promo-codes/business/${user.business_id}/promos/usage`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        if (data.usage && Array.isArray(data.usage)) {
          setBusinessPromoUsage(data.usage);
        } else {
          throw new Error('Invalid data format from API');
        }
      } catch (err) {
        setError(err.message);
        setBusinessPromoUsage([]);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.business_id) {
      fetchBusinessPromoUsage();
    }
  }, [user, API_BASE_URL]);

  const getDailyUsageData = (usageData) => {
    const dailyData = {};

    usageData.forEach((usage) => {
      const date = usage.used_at.split(' ')[0]; 
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          count: 0,
          revenue: 0
        };
      }
      dailyData[date].count += 1;
      dailyData[date].revenue += usage.discount_amount;
    });

    return Object.values(dailyData).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  };

  const getPromoPopularityData = (usageData) => {
    const promoStats = {};

    usageData.forEach((usage) => {
      const promoCode = usage.promo_code;
      if (!promoStats[promoCode]) {
        promoStats[promoCode] = {
          name: promoCode,
          promoId: usage.promoID,
          count: 0,
          totalDiscount: 0,
          description: usage.promo_description || ''
        };
      }
      promoStats[promoCode].count += 1;
      promoStats[promoCode].totalDiscount += usage.discount_amount;
    });

    return Object.values(promoStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getDiscountDistribution = (usageData) => {
    const distribution = {};

    usageData.forEach((usage) => {
      const promoCode = usage.promo_code;
      if (!distribution[promoCode]) {
        distribution[promoCode] = 0;
      }
      distribution[promoCode] += usage.discount_amount;
    });

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }));
  };

  const COLORS = [
    '#243b2c',
    '#4b634b',
    '#627c5c',
    '#a8c391',
    '#d3f2b8'
  ];

  if (loading) {
    return (
      <div className="charts-container">
        <div className="loading-spinner">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="charts-container error">
        <h2>Error Loading Data</h2>
      </div>
    );
  }

  if (!businessPromoUsage || businessPromoUsage.length === 0) {
    return (
      <div className="charts-container">
        <p>No promo usage data available for business</p>
      </div>
    );
  }

  const dailyData = getDailyUsageData(businessPromoUsage);
  const promoPopularityData = getPromoPopularityData(businessPromoUsage);
  const discountDistribution = getDiscountDistribution(businessPromoUsage);
  const totalUsage = businessPromoUsage.length;
  const totalDiscounts = businessPromoUsage.reduce(
    (sum, usage) => sum + usage.discount_amount,
    0
  );
  const avgDiscountPerUse = (totalDiscounts / totalUsage);

  return (
    <div className="charts-container">
      <NavBar user={user} onLogoClick={() => onNavigate('home')} onNavigate={onNavigate} />

      <h1>Analytics</h1>

      <div className="statistics-grid">
        <div className="stat-card">
          <h3>Total Promo Usage</h3>
          <p className="stat-value">{totalUsage}</p>
        </div>
        <div className="stat-card">
          <h3>Total Discounts Given</h3>
          <p className="stat-value">${totalDiscounts}</p>
        </div>
        <div className="stat-card">
          <h3>Avg Discount/Use</h3>
          <p className="stat-value">${avgDiscountPerUse}</p>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-container">
        <h2>Daily Promo Usage Trend</h2>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" label={{ value: 'Usage Count', angle: -90, position: 'insideLeft' }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: 'Discount Amount ($)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="count" fill="#ff8b42" name="Usage Count" />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#5179ac"
              name="Discount Amount"
            />
          </ComposedChart>
        </ResponsiveContainer>
        </div>
        <div className="chart-container">
        <h2>Discount Distribution by Promo</h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={discountDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: $${value}`}
                outerRadius={120}
                fill="#03021bff"
                dataKey="value"
              >
                {discountDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
        <h2>Most Popular Promo Codes (Top 10)</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={promoPopularityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="custom-tooltip">
                        <p>{`Promo: ${payload[0].payload.name}`}</p>
                        <p>{`Uses: ${payload[0].value}`}</p>
                        <p>{`Total Discount: $${payload[0].payload.totalDiscount}`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" fill="#0f4c5c" name="Times Used" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;