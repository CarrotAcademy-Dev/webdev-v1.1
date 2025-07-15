import React, { useState, useEffect } from 'react';
import { 
    ResponsiveContainer, 
    AreaChart, 
    XAxis, 
    YAxis, 
    Tooltip, 
    Area, 
    CartesianGrid 
} from 'recharts';
import StyledChart from './TasksChart.Styled';

// --- DUMMY DATA ---
const monthlyData = [ { name: 'Jan', value: 25 }, { name: 'Feb', value: 38 }, { name: 'Mar', value: 26 }, { name: 'Apr', value: 80 }, { name: 'May', value: 88 }, { name: 'Jun', value: 75 }, { name: 'Jul', value: 54 }, { name: 'Aug', value: 59 }, { name: 'Sep', value: 34 }, { name: 'Oct', value: 52 }, { name: 'Nov', value: 48 }, { name: 'Dec', value: 25 } ];
const weeklyData = [ { name: 'W1', value: 10 }, { name: 'W2', value: 15 }, { name: 'W3', value: 8 }, { name: 'W4', value: 20 } ];
const dailyData = [ { name: 'Mon', value: 2 }, { name: 'Tue', value: 5 }, { name: 'Wed', value: 3 }, { name: 'Thu', value: 6 }, { name: 'Fri', value: 4 }, { name: 'Sat', value: 1 }];

const CustomTooltip = ({ active, payload, label }) => {
    // 'active' -> boolean, true kalo lagi hover
    // 'payload' -> array berisi data dari item yg di-hover
    // 'label' -> data dari sumbu X (misal: 'Mon', 'Tues')
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{label}</p>
          <p className="intro">{`Progress: ${payload[0].value}%`}</p>
        </div>
      );
    }
  
    return null;
};

function TasksChart() {
    const [activeFilter, setActiveFilter] = useState('monthly');
    const [chartData, setChartData] = useState(monthlyData);

    useEffect(() => {
        if (activeFilter === 'monthly') setChartData(monthlyData);
        if (activeFilter === 'weekly') setChartData(weeklyData);
        if (activeFilter === 'daily') setChartData(dailyData);
    }, [activeFilter]);

    return (
        <StyledChart>
            <div className="chart-header">
                <h3>Tasks Completed - 2025</h3>
                <div className="filters">
                    <button onClick={() => setActiveFilter('daily')} className={activeFilter === 'daily' ? 'active' : ''}>Daily</button>
                    <button onClick={() => setActiveFilter('weekly')} className={activeFilter === 'weekly' ? 'active' : ''}>Weekly</button>
                    <button onClick={() => setActiveFilter('monthly')} className={activeFilter === 'monthly' ? 'active' : ''}>Monthly</button>
                </div>
            </div>
            
            <div className="chart-container">
                <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FE7743" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#FE7743" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#A0AEC0" fontSize={12} />
                        <YAxis stroke="#A0AEC0" fontSize={12} tickFormatter={(value) => `${value}%`} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <Tooltip
                            content={<CustomTooltip />} 
                            cursor={{fill: 'rgba(240, 240, 240, 0.5)'}}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#FE7743"
                            strokeWidth={2}
                            fill="url(#chartGradient)"
                            dot={{ stroke: '#FE7743', strokeWidth: 2, r: 4, fill: 'white' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </StyledChart>
    );
}

export default TasksChart;