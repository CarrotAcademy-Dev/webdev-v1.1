import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { useColorMode } from '@chakra-ui/react';
import { StyledStatisticsBarChart } from './StatisticsBarChart.styled';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function StatisticsBarChart({ data, title, categories }) {
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';
    
    const formatLabel = (label) => {
        const shortMonths = {
            'Januari': 'Jan',
            'Februari': 'Feb',
            'Maret': 'Mar',
            'April': 'Apr',
            'Mei': 'Mei',
            'Juni': 'Jun',
            'Juli': 'Jul',
            'Agustus': 'Agu',
            'September': 'Sep',
            'Oktober': 'Okt',
            'November': 'Nov',
            'Desember': 'Des',
        };
        
        const parts = label.split(' ');
        if (parts.length === 2) {
            return `${shortMonths[parts[0]]}`;
        }
        return shortMonths[label] || label;
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12
                    },
                    color: isDark ? '#E2E8F0' : '#4A5568'
                }
            },
            title: {
                display: true,
                text: title,
                font: {
                    size: 18,
                    weight: 'bold'
                },
                padding: {
                    bottom: 30
                },
                color: isDark ? '#F7FAFC' : '#2D3748'
            },
            tooltip: {
                backgroundColor: isDark ? 'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                titleColor: isDark ? '#F7FAFC' : '#2D3748',
                bodyColor: isDark ? '#E2E8F0' : '#4A5568',
                borderColor: isDark ? '#4A5568' : '#E2E8F0',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 13
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    callback: function(value) {
                        return formatLabel(data.labels[value]);
                    },
                    font: {
                        size: 12
                    },
                    maxRotation: 0,
                    minRotation: 0,
                    color: isDark ? '#E2E8F0' : '#4A5568'
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: isDark 
                        ? '#4A5568' 
                        : '#E2E8F0',
                    drawBorder: false
                },
                ticks: {
                    font: {
                        size: 12
                    },
                    color: isDark ? '#E2E8F0' : '#4A5568'
                }
            }
        },
        layout: {
            padding: {
                left: 10,
                right: 10
            }
        },
        barPercentage: 0.8,
        categoryPercentage: 0.7
    };

    const modernColors = [
        'rgba(255, 138, 101, 0.7)', // Soft coral
        'rgba(126, 87, 194, 0.7)',  // Soft purple
        'rgba(77, 182, 172, 0.7)',  // Soft teal
        'rgba(255, 167, 38, 0.7)',  // Soft orange
        'rgba(92, 107, 192, 0.7)',  // Soft indigo
        'rgba(240, 98, 146, 0.7)'   // Soft pink
    ];

    const chartData = {
        labels: data.labels,
        datasets: categories.map((category, index) => ({
            label: category,
            data: data.datasets[category],
            backgroundColor: modernColors[index % modernColors.length],
            borderColor: 'transparent',
            borderRadius: 8,
            borderSkipped: false
        }))
    };

    return (
        <StyledStatisticsBarChart data-theme={colorMode}>
            <div className="chart-container">
                <Bar options={options} data={chartData} />
            </div>
        </StyledStatisticsBarChart>
    );
}

export default StatisticsBarChart;
