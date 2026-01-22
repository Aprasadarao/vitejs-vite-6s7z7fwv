import React, { useState, useEffect } from 'react';

// Dummy API simulation
const mockAPIs = {
  '/revenue-trend': {
    success: true,
    data: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      series: [{ name: "Revenue", data: [12000, 15000, 18000, 14000, 20000, 24000] }]
    }
  },
  '/orders-per-month': {
    success: true,
    data: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      series: [{ name: "Orders", data: [320, 450, 500, 410, 600, 720] }]
    }
  },
  '/category-share': {
    success: true,
    data: {
      series: [
        { name: "Electronics", y: 45 },
        { name: "Fashion", y: 25 },
        { name: "Groceries", y: 15 },
        { name: "Books", y: 10 },
        { name: "Others", y: 5 }
      ]
    }
  },
  '/active-users': {
    success: true,
    data: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      series: [{ name: "Active Users", data: [120, 180, 160, 220, 300, 280, 260] }]
    }
  },
  '/top-products': {
    success: true,
    data: {
      categories: ["Product A", "Product B", "Product C", "Product D", "Product E"],
      series: [{ name: "Sales", data: [500, 420, 380, 340, 290] }]
    }
  }
};

const fetchData = (endpoint) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const shouldFail = Math.random() < 0.1;
      if (shouldFail) {
        reject(new Error('Failed to fetch data'));
      } else {
        resolve(mockAPIs[endpoint]);
      }
    }, 1000 + Math.random() * 1000);
  });
};

const ChartContainer = ({ title, loading, error, children }) => (
  <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
    <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
    <div className="flex-1 flex items-center justify-center min-h-[300px]">
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-red-500">Failed to load chart</div>
      ) : (
        children
      )}
    </div>
  </div>
);

const LineChart = ({ data }) => {
  const maxValue = Math.max(...data.series[0].data);
  const points = data.series[0].data.map((val, i) => {
    const x = (i / (data.series[0].data.length - 1)) * 100;
    const y = 100 - (val / maxValue) * 80;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-full flex flex-col">
      <svg viewBox="0 0 100 100" className="w-full h-48">
        <polyline
          points={points}
          fill="none"
          stroke="rgb(59, 130, 246)"
          strokeWidth="2"
        />
        {data.series[0].data.map((val, i) => {
          const x = (i / (data.series[0].data.length - 1)) * 100;
          const y = 100 - (val / maxValue) * 80;
          return (
            <circle key={i} cx={x} cy={y} r="2" fill="rgb(59, 130, 246)" />
          );
        })}
      </svg>
      <div className="flex justify-between text-xs text-gray-600 mt-2">
        {data.categories.map((cat, i) => (
          <span key={i}>{cat}</span>
        ))}
      </div>
    </div>
  );
};

const ColumnChart = ({ data }) => {
  const maxValue = Math.max(...data.series[0].data);
  const barWidth = 80 / data.series[0].data.length;

  return (
    <div className="w-full h-full flex flex-col">
      <svg viewBox="0 0 100 100" className="w-full h-48">
        {data.series[0].data.map((val, i) => {
          const height = (val / maxValue) * 80;
          const x = 10 + i * barWidth;
          const y = 90 - height;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth * 0.7}
              height={height}
              fill="rgba(34, 197, 94, 0.8)"
            />
          );
        })}
      </svg>
      <div className="flex justify-between text-xs text-gray-600 mt-2">
        {data.categories.map((cat, i) => (
          <span key={i}>{cat}</span>
        ))}
      </div>
    </div>
  );
};

const PieChart = ({ data }) => {
  const total = data.series.reduce((sum, item) => sum + item.y, 0);
  let currentAngle = -90;
  const colors = [
    'rgb(59, 130, 246)',
    'rgb(16, 185, 129)',
    'rgb(251, 146, 60)',
    'rgb(244, 63, 94)',
    'rgb(168, 85, 247)'
  ];

  const slices = data.series.map((item, i) => {
    const percentage = item.y / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (currentAngle * Math.PI) / 180;

    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    return {
      path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: colors[i],
      name: item.name,
      value: item.y
    };
  });

  return (
    <div className="w-full h-full flex flex-col items-center">
      <svg viewBox="0 0 100 100" className="w-48 h-48">
        {slices.map((slice, i) => (
          <path key={i} d={slice.path} fill={slice.color} />
        ))}
      </svg>
      <div className="mt-4 space-y-1">
        {slices.map((slice, i) => (
          <div key={i} className="flex items-center text-xs">
            <div
              className="w-3 h-3 mr-2"
              style={{ backgroundColor: slice.color }}
            />
            <span>{slice.name}: {slice.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AreaChart = ({ data }) => {
  const maxValue = Math.max(...data.series[0].data);
  const points = data.series[0].data.map((val, i) => {
    const x = (i / (data.series[0].data.length - 1)) * 100;
    const y = 100 - (val / maxValue) * 80;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <div className="w-full h-full flex flex-col">
      <svg viewBox="0 0 100 100" className="w-full h-48">
        <polygon
          points={areaPoints}
          fill="rgba(139, 92, 246, 0.3)"
          stroke="rgb(139, 92, 246)"
          strokeWidth="2"
        />
      </svg>
      <div className="flex justify-between text-xs text-gray-600 mt-2">
        {data.categories.map((cat, i) => (
          <span key={i}>{cat}</span>
        ))}
      </div>
    </div>
  );
};

const BarChart = ({ data }) => {
  const maxValue = Math.max(...data.series[0].data);
  const barHeight = 80 / data.series[0].data.length;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex items-center">
        <div className="w-32 flex flex-col justify-between text-xs text-gray-600">
          {data.categories.map((cat, i) => (
            <span key={i} className="text-right pr-2">{cat}</span>
          ))}
        </div>
        <svg viewBox="0 0 100 100" className="flex-1 h-48">
          {data.series[0].data.map((val, i) => {
            const width = (val / maxValue) * 90;
            const y = 10 + i * barHeight;
            return (
              <rect
                key={i}
                x="5"
                y={y}
                width={width}
                height={barHeight * 0.7}
                fill="rgba(236, 72, 153, 0.8)"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [charts, setCharts] = useState({
    revenue: { loading: true, error: false, data: null },
    orders: { loading: true, error: false, data: null },
    category: { loading: true, error: false, data: null },
    users: { loading: true, error: false, data: null },
    products: { loading: true, error: false, data: null }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchData('/revenue-trend');
        setCharts(prev => ({
          ...prev,
          revenue: { loading: false, error: false, data: response.data }
        }));
      } catch (err) {
        setCharts(prev => ({
          ...prev,
          revenue: { loading: false, error: true, data: null }
        }));
      }

      try {
        const response = await fetchData('/orders-per-month');
        setCharts(prev => ({
          ...prev,
          orders: { loading: false, error: false, data: response.data }
        }));
      } catch (err) {
        setCharts(prev => ({
          ...prev,
          orders: { loading: false, error: true, data: null }
        }));
      }

      try {
        const response = await fetchData('/category-share');
        setCharts(prev => ({
          ...prev,
          category: { loading: false, error: false, data: response.data }
        }));
      } catch (err) {
        setCharts(prev => ({
          ...prev,
          category: { loading: false, error: true, data: null }
        }));
      }

      try {
        const response = await fetchData('/active-users');
        setCharts(prev => ({
          ...prev,
          users: { loading: false, error: false, data: response.data }
        }));
      } catch (err) {
        setCharts(prev => ({
          ...prev,
          users: { loading: false, error: true, data: null }
        }));
      }

      try {
        const response = await fetchData('/top-products');
        setCharts(prev => ({
          ...prev,
          products: { loading: false, error: false, data: response.data }
        }));
      } catch (err) {
        setCharts(prev => ({
          ...prev,
          products: { loading: false, error: true, data: null }
        }));
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <ChartContainer 
            title="Revenue Trend" 
            loading={charts.revenue.loading}
            error={charts.revenue.error}
          >
            {charts.revenue.data && <LineChart data={charts.revenue.data} />}
          </ChartContainer>

          <ChartContainer 
            title="Orders per Month" 
            loading={charts.orders.loading}
            error={charts.orders.error}
          >
            {charts.orders.data && <ColumnChart data={charts.orders.data} />}
          </ChartContainer>

          <ChartContainer 
            title="Category Share" 
            loading={charts.category.loading}
            error={charts.category.error}
          >
            {charts.category.data && <PieChart data={charts.category.data} />}
          </ChartContainer>

          <ChartContainer 
            title="Active Users" 
            loading={charts.users.loading}
            error={charts.users.error}
          >
            {charts.users.data && <AreaChart data={charts.users.data} />}
          </ChartContainer>

          <ChartContainer 
            title="Top Products" 
            loading={charts.products.loading}
            error={charts.products.error}
          >
            {charts.products.data && <BarChart data={charts.products.data} />}
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;