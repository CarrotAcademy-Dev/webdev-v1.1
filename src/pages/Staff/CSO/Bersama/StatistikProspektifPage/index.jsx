import ContainerCarrot from "@/components/Container";
import { Select } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { getStatistikProspektif } from "@/features/cso/csoApiService";
import { StyledStatistikProspektifPage } from "./StatistikProspektif.styled";
import { useState, useMemo } from "react";
import StatisticsBarChart from "@/components/StatisticsBarChart";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function StatistikProspektifPage() {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());

    const { data = [], isError, error } = useQuery({
        queryKey: ['statistikProspektif', selectedYear],
        queryFn: () => getStatistikProspektif(selectedYear),
    });

    const headerItems = [
        'Bulan & Tahun',
        'Total Prospektif',
        'Total Trial',
        'Total Onboarding',
        'Total Cancel',
        'Total First Class',
        'Total Portfolio'
    ];

    const chartCategories = headerItems.slice(1); // Exclude 'Bulan & Tahun'

    const processData = useMemo(() => {
        if (!data) return null;

        const months = data.map(row => row[0]); // First column is Bulan & Tahun
        const totals = Array(chartCategories.length).fill(0);
        const datasets = {};

        chartCategories.forEach((category, index) => {
            datasets[category] = data.map(row => parseInt(row[index + 1] || 0));
            totals[index] = datasets[category].reduce((sum, val) => sum + val, 0);
        });

        return {
            chartData: {
                labels: months,
                datasets
            },
            totals
        };
    }, [data, chartCategories]);

    if (isError) return <div>Error: {error.message}</div>;

    return (
        <StyledStatistikProspektifPage>
            <ContainerCarrot>
                <div className="hero-section">
                    <div className="hero-section__left">
                        <h1 className="page-title">Statistik Prospektif</h1>
                        <div className="filter-section">
                            <Select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                width="200px"
                            >
                                {Array.from({ length: 5 }, (_, i) => currentYear - i).map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </Select>
                        </div>
                    </div>
                </div>
                {processData && (
                    <StatisticsBarChart
                        data={processData.chartData}
                        title={`Statistik Prospektif ${selectedYear}`}
                        categories={chartCategories}
                    />
                )}
                <div className="table-container">
                    <table className="statistik-table">
                        <thead>
                            <tr>
                                {headerItems.map((header, index) => (
                                    <th key={index}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex}>{cell || '-'}</td>
                                    ))}
                                </tr>
                            ))}
                            {processData && (
                                <tr className="total-row">
                                    <td><strong>Total</strong></td>
                                    {processData.totals.map((total, index) => (
                                        <td key={index}><strong>{total}</strong></td>
                                    ))}
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </ContainerCarrot>
        </StyledStatistikProspektifPage>
    );
}

export default StatistikProspektifPage;
