import ContainerCarrot from "@/components/Container";
import { getDashboardPendapatan } from "@/features/finance/financeApiService";
import {
    Box, Flex, Select, Skeleton, Text, useColorMode, useColorModeValue,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiDollarSign, FiTrendingUp, FiAlertCircle, FiFileText, FiCreditCard, FiBarChart2,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { StyledDashboardPendapatan } from "./DashboardPendapatan.styled";

// ============================================
// Constants
// ============================================

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => String(CURRENT_YEAR - i));

const BULAN_ORDER = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const CHART_LINES = [
    { key: "total_invoice", label: "Total Invoice", color: "#4299e1" },
    { key: "total_tagihan", label: "Total Tagihan", color: "#48bb78" },
    { key: "total_pendapatan_perbulan", label: "Pendapatan/Bulan", color: "#ed8936" },
    { key: "total_tagihan_terbayar", label: "Tagihan Terbayar", color: "#9f7aea" },
    { key: "pembayaran_setelah_jatuh_tempo", label: "Lewat Jatuh Tempo", color: "#f56565" },
    { key: "piutang", label: "Piutang", color: "#fc8181" },
    { key: "total_bkm", label: "Total BKM", color: "#38b2ac" },
];

// ============================================
// Helpers
// ============================================

const parseNumber = (val) => {
    if (val === null || val === undefined || val === "") return 0;
    if (typeof val === "number") return val;
    const cleaned = String(val).replace(/[^0-9.-]/g, "");
    return parseFloat(cleaned) || 0;
};

const formatNumber = (val) => {
    const num = parseNumber(val);
    if (num === 0) return "-";
    return num.toLocaleString("id-ID");
};

const formatShort = (val) => {
    const num = parseNumber(val);
    if (num === 0) return "0";
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}M`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}Jt`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}Rb`;
    return String(num);
};

// ============================================
// Component
// ============================================

const DashboardPendapatanPage = () => {
    const { colorMode } = useColorMode();
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const textColor = useColorModeValue("gray.600", "gray.300");
    const thBg = useColorModeValue("#f7fafc", "#2d3748");

    const [selectedYear, setSelectedYear] = useState(String(CURRENT_YEAR));
    const [chartType, setChartType] = useState("line");
    const [visibleLines, setVisibleLines] = useState(
        CHART_LINES.map(l => l.key)
    );

    const { data: rawData = [], isLoading, isError } = useQuery({
        queryKey: ["dashboardPendapatan", selectedYear],
        queryFn: () => getDashboardPendapatan(selectedYear),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: !!selectedYear,
    });

    // Normalize & sort data by bulan order
    const chartData = useMemo(() => {
        return BULAN_ORDER.map(bulan => {
            const found = rawData.find(
                d => String(d.bulan).trim().toLowerCase() === bulan.toLowerCase()
            );
            if (!found) return null;
            return {
                bulan,
                bulanShort: bulan.substring(0, 3),
                total_invoice: parseNumber(found.total_invoice),
                total_tagihan: parseNumber(found.total_tagihan),
                total_pendapatan_perbulan: parseNumber(found.total_pendapatan_perbulan),
                total_tagihan_terbayar: parseNumber(found.total_tagihan_terbayar),
                pembayaran_setelah_jatuh_tempo: parseNumber(found.pembayaran_setelah_jatuh_tempo),
                piutang: parseNumber(found.piutang),
                total_bkm: parseNumber(found.total_bkm),
            };
        }).filter(Boolean);
    }, [rawData]);

    // Summary stats
    const stats = useMemo(() => {
        const sum = (key) => chartData.reduce((acc, d) => acc + d[key], 0);
        const totalPendapatan = sum("total_pendapatan_perbulan");
        const totalTagihan = sum("total_tagihan");
        const totalTerbayar = sum("total_tagihan_terbayar");
        const totalPiutang = sum("piutang");
        const totalLewatJatuhTempo = sum("pembayaran_setelah_jatuh_tempo");
        const totalBKM = sum("total_bkm");
        const collectionRate = totalTagihan > 0
            ? Math.round((totalTerbayar / totalTagihan) * 100)
            : 0;
        return {
            totalPendapatan, totalTagihan, totalTerbayar,
            totalPiutang, totalLewatJatuhTempo, totalBKM, collectionRate,
        };
    }, [chartData]);

    const toggleLine = (key) => {
        setVisibleLines(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <Box bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="md" p={3} shadow="md" maxW="220px">
                <Text fontWeight="bold" mb={2} fontSize="sm">{label}</Text>
                {payload.map((entry, i) => (
                    <Text key={i} color={entry.color} fontSize="xs" mb={1}>
                        {entry.name}: {formatNumber(entry.value)}
                    </Text>
                ))}
            </Box>
        );
    };

    const tdStyle = {
        padding: "10px 14px",
        fontSize: "13px",
        borderBottom: `1px solid ${colorMode === "dark" ? "#4a5568" : "#e2e8f0"}`,
        whiteSpace: "nowrap",
    };

    const thStyle = {
        padding: "12px 14px",
        textAlign: "right",
        fontWeight: 600,
        fontSize: "13px",
        borderBottom: `2px solid ${colorMode === "dark" ? "#4a5568" : "#e2e8f0"}`,
        background: thBg,
        whiteSpace: "nowrap",
    };

    return (
        <ContainerCarrot>
            <StyledDashboardPendapatan colorMode={colorMode} data-theme={colorMode}>
                <Box className="header">
                    <h1>Dashboard Pendapatan</h1>
                    <Text className="subtitle">Analisis pendapatan, tagihan, dan piutang per bulan</Text>
                </Box>

                {/* Stats Grid */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiDollarSign size={28} />
                        <p>Total Pendapatan</p>
                        {isLoading ? <Skeleton height="40px" width="80px" /> : <p className="card__points" style={{ fontSize: "13px" }}>{formatShort(stats.totalPendapatan)}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiFileText size={28} />
                        <p>Total Tagihan</p>
                        {isLoading ? <Skeleton height="40px" width="80px" /> : <p className="card__points" style={{ fontSize: "13px" }}>{formatShort(stats.totalTagihan)}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiCreditCard size={28} />
                        <p>Tagihan Terbayar</p>
                        {isLoading ? <Skeleton height="40px" width="80px" /> : <p className="card__points" style={{ fontSize: "13px" }}>{formatShort(stats.totalTerbayar)}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiAlertCircle size={28} />
                        <p>Piutang</p>
                        {isLoading ? <Skeleton height="40px" width="80px" /> : <p className="card__points" style={{ fontSize: "13px" }}>{formatShort(stats.totalPiutang)}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiTrendingUp size={28} />
                        <p>Lewat Jatuh Tempo</p>
                        {isLoading ? <Skeleton height="40px" width="80px" /> : <p className="card__points" style={{ fontSize: "13px" }}>{formatShort(stats.totalLewatJatuhTempo)}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiBarChart2 size={28} />
                        <p>Collection Rate</p>
                        {isLoading ? <Skeleton height="40px" width="80px" /> : <p className="card__points">{stats.collectionRate}%</p>}
                    </InfoCard>
                </Box>

                {/* Filter Controls */}
                <Box bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="12px" p={4} mb={6}>
                    <Flex gap={6} wrap="wrap" align="flex-end">
                        <Box>
                            <Text fontWeight="medium" mb={2} fontSize="sm" color={textColor}>Tahun</Text>
                            <Select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                maxW="140px"
                                size="sm"
                            >
                                {YEAR_OPTIONS.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </Select>
                        </Box>
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
                        <Box>
                            <Text fontWeight="medium" mb={2} fontSize="sm" color={textColor}>Tampilkan Metrik</Text>
                            <Flex gap={2} wrap="wrap">
                                {CHART_LINES.map(line => (
                                    <Box
                                        key={line.key}
                                        as="button"
                                        onClick={() => toggleLine(line.key)}
                                        px={2} py={1}
                                        borderRadius="full"
                                        fontSize="xs"
                                        fontWeight={500}
                                        border="1px solid"
                                        borderColor={visibleLines.includes(line.key) ? line.color : borderColor}
                                        color={visibleLines.includes(line.key) ? line.color : textColor}
                                        bg={visibleLines.includes(line.key) ? `${line.color}18` : "transparent"}
                                        cursor="pointer"
                                        transition="all 0.2s"
                                    >
                                        {line.label}
                                    </Box>
                                ))}
                            </Flex>
                        </Box>
                    </Flex>
                </Box>

                {/* Chart */}
                {isError ? (
                    <Flex className="empty-state">
                        <Text>Gagal memuat data dashboard pendapatan</Text>
                    </Flex>
                ) : (
                    <>
                        <Box bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="12px" p={6} mb={6}>
                            <Text fontWeight="bold" fontSize="lg" mb={4}>
                                Grafik Pendapatan {selectedYear}
                            </Text>
                            {isLoading ? (
                                <Skeleton height="320px" />
                            ) : chartData.length === 0 ? (
                                <Flex justify="center" align="center" h="200px">
                                    <Text color={textColor}>Tidak ada data untuk tahun {selectedYear}</Text>
                                </Flex>
                            ) : (
                                <ResponsiveContainer width="100%" height={320}>
                                    {chartType === "line" ? (
                                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={colorMode === "dark" ? "#4a5568" : "#e2e8f0"} />
                                            <XAxis dataKey="bulanShort" tick={{ fontSize: 12, fill: colorMode === "dark" ? "#a0aec0" : "#4a5568" }} />
                                            <YAxis tickFormatter={formatShort} tick={{ fontSize: 11, fill: colorMode === "dark" ? "#a0aec0" : "#4a5568" }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            {CHART_LINES.filter(l => visibleLines.includes(l.key)).map(line => (
                                                <Line
                                                    key={line.key}
                                                    type="monotone"
                                                    dataKey={line.key}
                                                    name={line.label}
                                                    stroke={line.color}
                                                    strokeWidth={2}
                                                    dot={{ r: 3 }}
                                                    activeDot={{ r: 5 }}
                                                />
                                            ))}
                                        </LineChart>
                                    ) : (
                                        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={colorMode === "dark" ? "#4a5568" : "#e2e8f0"} />
                                            <XAxis dataKey="bulanShort" tick={{ fontSize: 12, fill: colorMode === "dark" ? "#a0aec0" : "#4a5568" }} />
                                            <YAxis tickFormatter={formatShort} tick={{ fontSize: 11, fill: colorMode === "dark" ? "#a0aec0" : "#4a5568" }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            {CHART_LINES.filter(l => visibleLines.includes(l.key)).map(line => (
                                                <Bar
                                                    key={line.key}
                                                    dataKey={line.key}
                                                    name={line.label}
                                                    fill={line.color}
                                                    radius={[3, 3, 0, 0]}
                                                />
                                            ))}
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            )}
                        </Box>

                        {/* Tabel Detail */}
                        <Box bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="12px" overflow="hidden">
                            <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
                                <Text fontWeight="bold" fontSize="lg">Detail Per Bulan — {selectedYear}</Text>
                            </Box>
                            <Box overflowX="auto">
                                {isLoading ? (
                                    <Box p={4}><Skeleton count={13} height={40} style={{ marginBottom: "4px" }} /></Box>
                                ) : chartData.length === 0 ? (
                                    <Flex justify="center" align="center" p={8}>
                                        <Text color={textColor}>Tidak ada data</Text>
                                    </Flex>
                                ) : (
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr>
                                                <th style={{ ...thStyle, textAlign: "left" }}>Bulan</th>
                                                {CHART_LINES.map(line => ( 
                                                    <th key={line.key} style={{ ...thStyle, color: line.color }}>
                                                        {line.label}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody> 
                                            {chartData.map((row, index) => (
                                                <tr
                                                    key={row.bulan}
                                                    style={{
                                                        background: index % 2 === 0
                                                            ? "transparent"
                                                            : colorMode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"
                                                    }}
                                                >
                                                    <td style={{ ...tdStyle, fontWeight: 600 }}>{row.bulan}</td>
                                                    {CHART_LINES.map(line => (
                                                        <td key={line.key} style={{ ...tdStyle, textAlign: "right" }}>
                                                            {row[line.key] > 0 ? formatNumber(row[line.key]) : "-"}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}

                                            {/* Total row */}
                                            <tr style={{ background: thBg, fontWeight: 700 }}>
                                                <td style={{ ...tdStyle, fontWeight: 700 }}>TOTAL</td>
                                                {CHART_LINES.map(line => {
                                                    const total = chartData.reduce((sum, row) => sum + row[line.key], 0);
                                                    return (
                                                        <td key={line.key} style={{ ...tdStyle, textAlign: "right", color: line.color }}>
                                                            {total > 0 ? formatNumber(total) : "-"}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        </tbody>
                                    </table>
                                )}
                            </Box>
                        </Box>
                    </>
                )}
            </StyledDashboardPendapatan>
        </ContainerCarrot>
    );
};

export default DashboardPendapatanPage;