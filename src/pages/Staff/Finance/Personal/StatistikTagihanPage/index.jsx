/* eslint-disable react-hooks/exhaustive-deps */
import ContainerCarrot from "@/components/Container";
import { getStatistikTagihan } from "@/features/finance/financeApiService";
import {
    Box, Flex, Select, Text, useColorMode, useColorModeValue, Badge,
    Skeleton,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiTrendingUp, FiDollarSign, FiBarChart2,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { StyledStatistikTagihan } from "./StatistikTagihan.styled";

const BULAN_ORDER = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const COLORS = ["#4299e1", "#48bb78", "#ed8936", "#9f7aea", "#f56565", "#38b2ac"];

const formatNumber = (value) => {
    if (!value && value !== 0) return "-";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "-";
    return num.toLocaleString("id-ID");
};

const formatNumberShort = (value) => {
    if (!value && value !== 0) return "0";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "0";
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}Jt`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}Rb`;
    return num.toString();
};

const parseTotal = (total) => {
    if (typeof total === "number") return total;
    return parseFloat(String(total)) || 0;  // ← hapus replace regex rupiah
};

const StatistikTagihanPage = () => {
    const { colorMode } = useColorMode();
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const textColor = useColorModeValue("gray.600", "gray.300");

    const [selectedYears, setSelectedYears] = useState([]);
    const [chartType, setChartType] = useState("line");

    const { data: rawData = [], isLoading, isError } = useQuery({
        queryKey: ["statistikTagihan"],
        queryFn: getStatistikTagihan,
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    // Get all available years
    const availableYears = useMemo(() => {
        const years = new Set(rawData.map(i => String(i.tahun)).filter(Boolean));
        return [...years].sort((a, b) => Number(b) - Number(a));
    }, [rawData]);

    // Auto-select latest year on load
    useMemo(() => {
        if (availableYears.length > 0 && selectedYears.length === 0) {
            setSelectedYears([availableYears[0]]);
        }
    }, [availableYears]);

    // Group data by tahun → bulan
    const groupedData = useMemo(() => {
        const grouped = {};
        rawData.forEach(item => {
            const tahun = String(item.tahun);
            if (!grouped[tahun]) grouped[tahun] = {};
            grouped[tahun][item.bulan] = parseTotal(item.total);
        });
        return grouped;
    }, [rawData]);

    // Chart data — satu row per bulan, kolom per tahun
    const chartData = useMemo(() => {
        return BULAN_ORDER.map(bulan => {
            const row = { bulan, bulanShort: bulan.substring(0, 3) };
            selectedYears.forEach(tahun => {
                row[tahun] = groupedData[tahun]?.[bulan] || 0;
            });
            return row;
        });
    }, [groupedData, selectedYears]);

    // Stats untuk tahun pertama yang dipilih
    const primaryYear = selectedYears[0];
    const primaryData = groupedData[primaryYear] || {};
    const stats = useMemo(() => {
        const values = Object.values(primaryData).filter(v => v > 0);
        const total = values.reduce((a, b) => a + b, 0);
        const avg = values.length > 0 ? total / values.length : 0;
        const max = values.length > 0 ? Math.max(...values) : 0;
        const maxBulan = Object.entries(primaryData).find(([, v]) => v === max)?.[0] || "-";
        return { total, avg, max, maxBulan, bulanAktif: values.length };
    }, [primaryData]);

    // Tabel perbandingan
    const comparisonTableData = useMemo(() => {
        return BULAN_ORDER.map(bulan => {
            const row = { bulan };
            selectedYears.forEach(tahun => {
                row[tahun] = groupedData[tahun]?.[bulan] || null;
            });
            return row;
        }).filter(row => selectedYears.some(tahun => row[tahun] !== null));
    }, [groupedData, selectedYears]);

    const handleYearToggle = (year) => {
        setSelectedYears(prev =>
            prev.includes(year)
                ? prev.filter(y => y !== year)
                : [...prev, year]
        );
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <Box bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="md" p={3} shadow="md">
                <Text fontWeight="bold" mb={2}>{label}</Text>
                {payload.map((entry, i) => (
                    <Text key={i} color={entry.color} fontSize="sm">
                        {entry.dataKey}: {formatNumber(entry.value)}
                    </Text>
                ))}
            </Box>
        );
    };

    return (
        <ContainerCarrot>
            <StyledStatistikTagihan colorMode={colorMode} data-theme={colorMode}>
                <Box className="header">
                    <h1>Statistik Tagihan</h1>
                    <Text className="subtitle">Analisis dan perbandingan data tagihan per bulan dan tahun</Text>
                </Box>

                {/* Stats Cards */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiDollarSign size={28} />
                        <p>Total Invoice {isLoading ? <Skeleton height="20px" width="10px" /> : primaryYear}</p>
                        {isLoading ? <Skeleton height="20px" width="100px" /> : <p className="card__points">{formatNumber(stats.total)}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiTrendingUp size={28} />
                        <p>Rata-rata/Bulan</p>
                        {isLoading ? <Skeleton height="20px" width="100px" /> : <p className="card__points">{formatNumber(Math.round(stats.avg))}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiBarChart2 size={28} />
                        <p>Tertinggi</p>
                        {isLoading ? <Skeleton height="20px" width="100px" /> : <p className="card__points">{formatNumber(stats.max)}</p>}
                    </InfoCard>
                </Box>

                {/* Filter Controls */}
                <Box bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="12px" p={4} mb={6}>
                    <Flex gap={4} wrap="wrap" align="center" justify="space-between">
                        {/* Year Selector */}
                        <Box>
                            <Text fontWeight="medium" mb={2} fontSize="sm" color={textColor}>
                                Pilih Tahun (bisa multi)
                            </Text>
                            <Flex gap={2} wrap="wrap">
                                {isLoading
                                    ? <Skeleton width="60px" height="32px" count={3} inline />
                                    : availableYears.map(year => (
                                        <Badge
                                            key={year}
                                            cursor="pointer"
                                            px={3} py={1}
                                            borderRadius="full"
                                            fontSize="sm"
                                            colorScheme={selectedYears.includes(year) ? "teal" : "gray"}
                                            variant={selectedYears.includes(year) ? "solid" : "outline"}
                                            onClick={() => handleYearToggle(year)}
                                            userSelect="none"
                                        >
                                            {year}
                                        </Badge>
                                    ))}
                            </Flex>
                        </Box>

                        {/* Chart Type */}
                        <Box>
                            <Text fontWeight="medium" mb={2} fontSize="sm" color={textColor}>Tipe Chart</Text>
                            <Select
                                value={chartType}
                                onChange={(e) => setChartType(e.target.value)}
                                maxW="160px"
                                size="sm"
                            >
                                <option value="line">Line Chart</option>
                                <option value="bar">Bar Chart</option>
                            </Select>
                        </Box>
                    </Flex>
                </Box>

                {/* Chart */}
                {isError ? (
                    <Flex className="empty-state">
                        <Text>Gagal memuat data statistik tagihan</Text>
                    </Flex>
                ) : selectedYears.length === 0 ? (
                    <Flex className="empty-state">
                        <Text>Pilih minimal satu tahun untuk menampilkan chart</Text>
                    </Flex>
                ) : (
                    <>
                        <Box
                            bg={cardBg} border="1px solid" borderColor={borderColor}
                            borderRadius="12px" p={6} mb={6}
                        >
                            <Text fontWeight="bold" fontSize="lg" mb={4}>
                                Grafik Tagihan {selectedYears.join(", ")}
                            </Text>
                            {isLoading ? (
                                <Skeleton height="300px" />
                            ) : (
                                <ResponsiveContainer width="100%" height={320}>
                                    {chartType === "line" ? (
                                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={colorMode === "dark" ? "#4a5568" : "#e2e8f0"} />
                                            <XAxis dataKey="bulanShort" tick={{ fontSize: 12, fill: colorMode === "dark" ? "#a0aec0" : "#4a5568" }} />
                                            <YAxis tickFormatter={formatNumberShort} tick={{ fontSize: 11, fill: colorMode === "dark" ? "#a0aec0" : "#4a5568" }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            {selectedYears.map((tahun, i) => (
                                                <Line
                                                    key={tahun}
                                                    type="monotone"
                                                    dataKey={tahun}
                                                    stroke={COLORS[i % COLORS.length]}
                                                    strokeWidth={2}
                                                    dot={{ r: 4 }}
                                                    activeDot={{ r: 6 }}
                                                />
                                            ))}
                                        </LineChart>
                                    ) : (
                                        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={colorMode === "dark" ? "#4a5568" : "#e2e8f0"} />
                                            <XAxis dataKey="bulanShort" tick={{ fontSize: 12, fill: colorMode === "dark" ? "#a0aec0" : "#4a5568" }} />
                                            <YAxis tickFormatter={formatNumberShort} tick={{ fontSize: 11, fill: colorMode === "dark" ? "#a0aec0" : "#4a5568" }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            {selectedYears.map((tahun, i) => (
                                                <Bar
                                                    key={tahun}
                                                    dataKey={tahun}
                                                    fill={COLORS[i % COLORS.length]}
                                                    radius={[4, 4, 0, 0]}
                                                />
                                            ))}
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            )}
                        </Box>

                        {/* Tabel Perbandingan/ */}
                        <Box
                            bg={cardBg} border="1px solid" borderColor={borderColor}
                            borderRadius="12px" overflow="hidden" mb={6}
                        >
                            <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
                                <Text fontWeight="bold" fontSize="lg">
                                    Tabel Perbandingan {selectedYears.join(" vs ")}
                                </Text>
                            </Box>
                            <Box overflowX="auto">
                                {isLoading ? (
                                    <Box p={4}><Skeleton count={13} height={40} style={{ marginBottom: "4px" }} /></Box>
                                ) : comparisonTableData.length === 0 ? (
                                    <Box p={4} textAlign="center">
                                        Tidak ada data untuk ditampilkan.
                                    </Box>
                                ) : (
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr style={{ background: colorMode === "dark" ? "#2d3748" : "#f7fafc" }}>
                                                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, fontSize: "14px", borderBottom: `2px solid ${colorMode === "dark" ? "#4a5568" : "#e2e8f0"}`, whiteSpace: "nowrap" }}>
                                                    Bulan
                                                </th>
                                                {selectedYears.map((tahun, i) => (
                                                    <th key={tahun} style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, fontSize: "14px", borderBottom: `2px solid ${colorMode === "dark" ? "#4a5568" : "#e2e8f0"}`, color: COLORS[i % COLORS.length], whiteSpace: "nowrap" }}>
                                                        {tahun}
                                                    </th>
                                                ))}
                                                {selectedYears.length > 1 && (
                                                    <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, fontSize: "14px", borderBottom: `2px solid ${colorMode === "dark" ? "#4a5568" : "#e2e8f0"}`, whiteSpace: "nowrap" }}>
                                                        Selisih ({selectedYears[0]} - {selectedYears[1]})
                                                    </th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comparisonTableData.map((row, index) => {
                                                const val0 = row[selectedYears[0]] || 0;
                                                const val1 = selectedYears[1] ? (row[selectedYears[1]] || 0) : null;
                                                const selisih = val1 !== null ? val0 - val1 : null;

                                                return (
                                                    <tr
                                                        key={row.bulan}
                                                        style={{
                                                            borderBottom: `1px solid ${colorMode === "dark" ? "#4a5568" : "#e2e8f0"}`,
                                                            background: index % 2 === 0 ? "transparent" : (colorMode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"),
                                                        }}
                                                    >
                                                        <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: 500 }}>
                                                            {row.bulan}
                                                        </td>
                                                        {selectedYears.map(tahun => (
                                                            <td key={tahun} style={{ padding: "12px 16px", fontSize: "14px", textAlign: "right" }}>
                                                                {row[tahun] ? formatNumber(row[tahun]) : "-"}
                                                            </td>
                                                        ))}
                                                        {selectedYears.length > 1 && (
                                                            <td style={{ padding: "12px 16px", fontSize: "14px", textAlign: "right", fontWeight: 600, color: selisih > 0 ? "#48bb78" : selisih < 0 ? "#f56565" : "inherit" }}>
                                                                {selisih !== null
                                                                    ? `${selisih >= 0 ? "+" : ""}${formatNumber(selisih)}`
                                                                    : "-"}
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })}

                                            {/* Total row */}
                                            <tr style={{ background: colorMode === "dark" ? "#2d3748" : "#f7fafc", fontWeight: 700 }}>
                                                <td style={{ padding: "12px 16px", fontSize: "14px" }}>TOTAL</td>
                                                {selectedYears.map(tahun => {
                                                    const total = comparisonTableData.reduce((sum, row) => sum + (row[tahun] || 0), 0);
                                                    return (
                                                        <td key={tahun} style={{ padding: "12px 16px", fontSize: "14px", textAlign: "right" }}>
                                                            {formatNumber(total)}
                                                        </td>
                                                    );
                                                })}
                                                {selectedYears.length > 1 && (
                                                    <td style={{ padding: "12px 16px", fontSize: "14px", textAlign: "right" }}>
                                                        {(() => {
                                                            const t0 = comparisonTableData.reduce((s, r) => s + (r[selectedYears[0]] || 0), 0);
                                                            const t1 = comparisonTableData.reduce((s, r) => s + (r[selectedYears[1]] || 0), 0);
                                                            const diff = t0 - t1;
                                                            return (
                                                                <Text as="span" color={diff >= 0 ? "green.400" : "red.400"}>
                                                                    {diff >= 0 ? "+" : ""}{formatNumber(diff)}
                                                                </Text>
                                                            );
                                                        })()}
                                                    </td>
                                                )}
                                            </tr>
                                        </tbody>
                                    </table>
                                )}
                            </Box>
                        </Box>
                    </>
                )}
            </StyledStatistikTagihan>
        </ContainerCarrot>
    );
};

export default StatistikTagihanPage;