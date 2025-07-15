import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import ChartWrapper from './GaugeChart.Styled';

const data = [{ name: 'achieved', value: 41 }];

function GaugeChart() {
    return (
        <ChartWrapper>
            <p className="chart-title">Presentase Achieved Bulan Ini</p>
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                    innerRadius="60%"
                    outerRadius="90%"
                    data={data}
                    startAngle={180}
                    endAngle={0}
                    barSize={80}
                >
                    <PolarAngleAxis
                        type="number"
                        domain={[0, 100]}
                        angleAxisId={0}
                        tick={false}
                    />
                    <RadialBar
                        background
                        clockWise
                        dataKey="value"
                        fill="#FE7743"
                    />
                </RadialBarChart>
            </ResponsiveContainer>
            <div className="chart-label">
                <p className="percent-value">41%</p>
                <p className="task-status">Task Achieved</p>
            </div>
        </ChartWrapper>
    );
}

export default GaugeChart;