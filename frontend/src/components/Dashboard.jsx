import { useState, useEffect } from 'react';
import { Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Treemap, AreaChart, Area } from 'recharts';
import styles from '../styles/Dashboard.module.css';
import NavBar from './NavBar';

const COLORS = [
  '#ff8b42',
  '#5179ac',
  '#0f4c5c',
  '#243b2c',
  '#4b634b',
  '#627c5c',
  '#a8c391',
  '#d3f2b8',
];

const getColorIndexFromFoodType = (foodType) => {
  if (!foodType) return 0;
  let hash = 0;
  for (let i = 0; i < foodType.length; i++) {
    hash += foodType.charCodeAt(i);
  }
  return hash % COLORS.length;
};

const CustomTreemapContent = (props) => {
  const { x, y, width, height, name, food_type, times_ordered, price } = props;
  const colorIndex = getColorIndexFromFoodType(food_type);
  const boxColor = COLORS[colorIndex];

  if (!name) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: boxColor,
          stroke: '#000000ff',
          strokeWidth: 2,
          outline: 'none',
        }}
      />

      {width > 50 && height > 40 && (
        <>
        <text
          x={name.length > 13 ? x + 4 : x + width / 2}
          y={y + height/3 + 18}
          fill="#fff"
          fontSize={20}
          fillOpacity={0.9}
        >
          {name}
        </text>
          <text
          x={name.length > 13 ? x + 4 : x + width / 2}
          y={y + height/3 + 36}
            fill="#fff" 
            fontSize={20} 
            fillOpacity={0.9}
          >
            {times_ordered} orders
          </text>
          <text
          x={name.length > 13 ? x + 4 : x + width / 2}
          y={y + height/3 + 52}
            fill="#fff" 
            fontSize={20} 
            fillOpacity={0.9}
          >
            ${price}
          </text>
        </>
      )}
    </g>
  );
};

const Dashboard = ({ user, onNavigate }) => {

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [businessPromoUsage, setBusinessPromoUsage] = useState(null);
  const [popularItems, setPopularItems] = useState(null);
  const [dailyOrders, setDailyOrders] = useState(null);
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
  useEffect(() => {
    const fetchDailyOrders = async () => {
      try {
        if (!user || !user.business_id) return;

        const endpoint = `${API_BASE_URL}/businesses/business/${user.business_id}/orders/daily`;
        const response = await fetch(endpoint);

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (data.daily_orders && Array.isArray(data.daily_orders)) {
          const sortedData = data.daily_orders.sort((a, b) => 
            new Date(a.order_date) - new Date(b.order_date)
          );
          setDailyOrders(sortedData);
        }
      } catch (err) {
      }
    };

    fetchDailyOrders();
  }, [user, API_BASE_URL]);

  useEffect(() => {
    const fetchPopularItems = async () => {
      try {
        if (!user || !user.business_id) return;

        const endpoint = `${API_BASE_URL}/business/${user.business_id}/items/popular`;
        const response = await fetch(endpoint);

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        
        if (data.items && Array.isArray(data.items)) {
          const aggregated = {};

          data.items.forEach((item) => {
            if (item.times_ordered === 0) {
              return;
            }

            const key = item.dish_name.toLowerCase();

            if (!aggregated[key]) {
              aggregated[key] = {
                name: item.dish_name,
                size: item.times_ordered,
                itemId: item.id,
                food_type: item.food_type,
                price: item.price,
                times_ordered: item.times_ordered,
                total_quantity_sold: item.total_quantity_sold,
                is_available: item.is_available,
                count: 1
              };
            } else {
              aggregated[key].size += item.times_ordered;
              aggregated[key].times_ordered += item.times_ordered;
              aggregated[key].total_quantity_sold += item.total_quantity_sold;
              aggregated[key].count += 1;
            }
          });
          const itemsByFoodType = {};
          Object.values(aggregated).forEach((item) => {
            const foodType = item.food_type;
            if (!itemsByFoodType[foodType]) {
              itemsByFoodType[foodType] = [];
            }
            itemsByFoodType[foodType].push(item);
          });
          const treemapData = [];
          
          const foodTypesByPopularity = Object.keys(itemsByFoodType).sort((a, b) => {
            const aTotal = itemsByFoodType[a].reduce((sum, item) => sum + item.size, 0);
            const bTotal = itemsByFoodType[b].reduce((sum, item) => sum + item.size, 0);
            return bTotal - aTotal;
          });

          foodTypesByPopularity.forEach((foodType) => {
            const foodTypeItems = itemsByFoodType[foodType]
              .sort((a, b) => b.size - a.size)
              .map((item) => ({
                name: item.name,
                size: item.size,
                itemId: item.itemId,
                food_type: item.food_type,
                price: item.price,
                times_ordered: item.times_ordered,
                total_quantity_sold: item.total_quantity_sold,
                is_available: item.is_available,
                count: item.count
              }));
            
            treemapData.push(...foodTypeItems);
          });

          if (treemapData.length > 0) {
            const treeData = {
              name: 'Items by Food Type',
              children: treemapData
            };
            setPopularItems(treeData);
          }
        }
      } catch (err) {
      }
    };

    fetchPopularItems();
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
          totalDiscount: 0
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
      value: value
    }));
  };

  if (loading) {
    return (
      <div className={styles.chartsContainer}>
        <div className={styles.loadingSpinner}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.chartsContainer} ${styles.error}`}>
        <h2>Error Loading Data</h2>
      </div>
    );
  }

  if (!businessPromoUsage || businessPromoUsage.length === 0) {
    return (
      <div className={styles.chartsContainer}>
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
    <div className={styles.chartsContainer}>
      <NavBar user={user} onLogoClick={() => onNavigate('home')} onNavigate={onNavigate} />

      <h1>Analytics</h1>

      <div className={styles.statisticsGrid}>
        <div className={styles.statCard}>
          <h3>Total Promo Usage</h3>
          <p className={styles.statValue}>{totalUsage}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Discounts Given</h3>
          <p className={styles.statValue}>${totalDiscounts.toFixed(2)}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Avg Discount/Use</h3>
          <p className={styles.statValue}>${avgDiscountPerUse.toFixed(2)}</p>
        </div>
      </div>

      <div className={styles.chartSection}>
        <div className={styles.chartContainer}>
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
        <div className={styles.chartContainer}>
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
        <div className={styles.chartContainer}>
          <h2>Most Popular Promo Codes (Top 5)</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={promoPopularityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className={styles.customTooltip}>
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
      {popularItems && popularItems.children && popularItems.children.length > 0 ? (
        <div className={styles.chartSection}>
          <div className={`${styles.chartContainer} ${styles.fullWidth}`}>
            <h2>Most Popular Items by Food Type</h2>
            <ResponsiveContainer width="100%" height={700}>
              <Treemap
                data={[popularItems]}
                dataKey="size"
                stroke="white"
                content={<CustomTreemapContent />}
              />
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className={styles.chartSection}>
          <div className={`${styles.chartContainer} ${styles.fullWidth}`}>
            <p>No items with orders to display</p>
          </div>
        </div>
      )}
      {dailyOrders && dailyOrders.length > 0 ? (
        <div className={styles.chartSection}>
          <div className={`${styles.chartContainer} ${styles.fullWidth}`}>
            <h2>Daily Orders Overview</h2>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={dailyOrders}>
                <defs>

                  <linearGradient id="colorOrderCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0}/>
                  </linearGradient>

                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[1]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS[1]} stopOpacity={0}/>
                  </linearGradient>

                  <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[2]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS[2]} stopOpacity={0}/>
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="order_date" />
                <YAxis yAxisId="left" label={{ value: 'Order Count / Customers', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Revenue ($)', angle: 90, position: 'insideRight' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#f9f9f9', border: '1px solid #ccc' }}
                  formatter={(value) => (typeof value === 'number' ? value.toFixed(2) : value)}
                />
                <Legend />

                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="order_count" 
                  stroke={COLORS[0]} 
                  fillOpacity={1} 
                  fill="url(#colorOrderCount)"
                  name="Order Count"
                />

                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="total_revenue" 
                  stroke={COLORS[1]}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)"
                  name="Total Revenue"
                />

                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="unique_customers" 
                  stroke={COLORS[2]}
                  fillOpacity={1} 
                  fill="url(#colorCustomers)"
                  name="Customers"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}
      {dailyOrders && dailyOrders.length > 0 ? (
        <div className={styles.chartSection}>
          <div className={`${styles.chartContainer} ${styles.fullWidth}`}>
            <h2>Daily Orders Metrics</h2>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={dailyOrders}>
                <defs>
                  <linearGradient id="colorCumulativeRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[5]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS[5]} stopOpacity={0}/>
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="order_date" />
                <YAxis yAxisId="left" label={{ value: 'Order Count', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Revenue ($)', angle: 90, position: 'insideRight' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#f9f9f9', border: '1px solid #ccc' }}
                  formatter={(value) => (typeof value === 'number' ? value.toFixed(2) : value)}
                />
                <Legend />

                <Bar 
                  yAxisId="left"
                  dataKey="order_count" 
                  fill={COLORS[0]} 
                  name="Order Count"
                  opacity={0.8}
                />

                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="total_revenue" 
                  fill="url(#colorCumulativeRevenue)"
                  stroke={COLORS[5]}
                  fillOpacity={1}
                  name="Daily Revenue"
                />

                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="cumulative_revenue" 
                  stroke={COLORS[3]}
                  strokeWidth={3}
                  name="Cumulative Revenue"
                  isAnimationActive={true}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Dashboard;