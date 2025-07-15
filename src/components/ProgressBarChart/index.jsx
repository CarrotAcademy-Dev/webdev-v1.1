import { 
    ResponsiveContainer, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis,
    Cell,
    Tooltip
} from 'recharts';
import StyledProgressBarChart from './ProgessBarChart.styled';

const CustomTooltip = ({ active, payload, label }) => {
    // 'active' -> boolean, true kalo lagi hover
    // 'payload' -> array berisi data dari item yg di-hover
    // 'label' -> data dari sumbu X (misal: 'Mon', 'Tues')
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`Hari ${label}`}</p>
          <p className="intro">{`Progress: ${payload[0].value}%`}</p>
        </div>
      );
    }
  
    return null;
};

function ProgressBarChart({ chartData, todayDay }) {
    return (
        <StyledProgressBarChart>
            <div className="chart-header">
                <h3>Progress</h3>
                <div className="today-progress">
                    <p>today's</p>
                    <span>{ chartData.find(d => d.day === todayDay)?.progress || 0 } %</span>
                </div>
            </div>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barCategoryGap="20%">
                        <XAxis 
                            dataKey="day" 
                            axisLine={false}
                            tickLine={false}
                            stroke="#A0AEC0"
                            fontSize={12}
                        />
                        <YAxis domain={[0, 100]} axisLine={false} tick={false} width={0} />
                        <Tooltip
                            content={<CustomTooltip />} 
                            cursor={{fill: 'rgba(240, 240, 240, 0.5)'}}
                        />
                        <Bar dataKey="progress" radius={[10, 10, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.day === todayDay ? '#FE7743' : 'rgba(254, 119, 67, 0.3)'} 
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </StyledProgressBarChart>
    );
}

export default ProgressBarChart;