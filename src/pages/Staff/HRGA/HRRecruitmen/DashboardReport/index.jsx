import ContainerCarrot from "@/components/Container";
import { getDashboardReportHR } from "@/features/hr/hrApiService";
import {
    Box, Flex, Select, Text, useColorMode, useColorModeValue,
    Tabs, TabList, Tab, TabPanels, TabPanel, 
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiUsers, FiUserCheck, FiBarChart2, FiTrendingUp,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Skeleton from "react-loading-skeleton";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { StyledDashboardReport } from "./DashboardReport.styled";

// ============================================
// Constants
// ============================================

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => String(CURRENT_YEAR - i));

const POSITION_COLUMNS = [
    { key: "eso_intern", label: "ESO Intern" },
    { key: "cso_intern", label: "CSO Intern" },
    { key: "smsvei", label: "SMS VEI" },
    { key: "jsd_intern", label: "JSD Intern" },
    { key: "admwarehouse_intern", label: "ADM Warehouse" },
    { key: "hrga_intern", label: "HRGA Intern" },
    { key: "sms_intern", label: "SMS Intern" },
    { key: "finac", label: "Finance AC" },
    { key: "cso", label: "CSO" },
    { key: "eso", label: "ESO" },
    { key: "fin_intern", label: "Finance Intern" },
    { key: "de_intern", label: "DE Intern" },
    { key: "hrga", label: "HRGA" },
    { key: "jsd", label: "JSD" },
    { key: "adm_intern", label: "ADM Intern" },
    { key: "sms", label: "SMS" },
    { key: "mentor", label: "Mentor" },
];

const CHART_COLORS = [
    "#4299e1", "#48bb78", "#ed8936", "#9f7aea", "#f56565",
    "#38b2ac", "#fc8181", "#68d391", "#63b3ed", "#b794f4",
];

// ============================================
// Helpers
// ============================================

const parseNum = (val) => {
    if (!val && val !== 0) return 0;
    if (typeof val === "number") return val;
    return parseFloat(String(val).replace(/[^0-9.-]/g, "")) || 0;
};

const formatShort = (val) => {
    const num = parseNum(val);
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return String(num);
};

// ============================================
// Component
// ============================================

const DashboardReportPage = () => {
    const { colorMode } = useColorMode();
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const textColor = useColorModeValue("gray.600", "gray.300");
    const thBg = useColorModeValue("#f7fafc", "#2d3748");

    const [selectedYear, setSelectedYear] = useState(String(CURRENT_YEAR));
    const [visiblePositions, setVisiblePositions] = useState(
        POSITION_COLUMNS.slice(0, 5).map(p => p.key)
    );

    const { data, isLoading, isError } = useQuery({
        queryKey: ["dashboardReportHR", selectedYear],
        queryFn: () => getDashboardReportHR(selectedYear),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: !!selectedYear,
    });

    const screeningData = useMemo(() => data?.dataScreening || [], [data]);
    const interviewData = useMemo(() => data?.dataInterview || [], [data]);

    // Summary stats
    const stats = useMemo(() => {
        const totalScreening = screeningData.reduce((sum, row) =>
            sum + POSITION_COLUMNS.reduce((s, p) => s + parseNum(row[p.key]), 0), 0
        );
        const totalInterview = interviewData.reduce((sum, row) =>
            sum + POSITION_COLUMNS.reduce((s, p) => s + parseNum(row[p.key]), 0), 0
        );
        const conversionRate = totalScreening > 0
            ? Math.round((totalInterview / totalScreening) * 100)
            : 0;

        // Most active position
        const positionTotals = POSITION_COLUMNS.map(p => ({
            label: p.label,
            total: screeningData.reduce((s, row) => s + parseNum(row[p.key]), 0),
        })).sort((a, b) => b.total - a.total);

        return { totalScreening, totalInterview, conversionRate, topPosition: positionTotals[0] };
    }, [screeningData, interviewData]);

    // Chart data — total per bulan
    const screeningChartData = useMemo(() => {
        return screeningData.map(row => {
            const entry = { month: row.month };
            visiblePositions.forEach(key => {
                entry[key] = parseNum(row[key]);
            });
            entry.total = POSITION_COLUMNS.reduce((s, p) => s + parseNum(row[p.key]), 0);
            return entry;
        });
    }, [screeningData, visiblePositions]);

    const interviewChartData = useMemo(() => {
        return interviewData.map(row => {
            const entry = { month: row.month };
            visiblePositions.forEach(key => {
                entry[key] = parseNum(row[key]);
            });
            entry.total = POSITION_COLUMNS.reduce((s, p) => s + parseNum(row[p.key]), 0);
            return entry;
        });
    }, [interviewData, visiblePositions]);

    const togglePosition = (key) => {
        setVisiblePositions(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <Box bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="md" p={3} shadow="md">
                <Text fontWeight="bold" mb={2} fontSize="sm">{label}</Text>
                {payload.map((entry, i) => (
                    <Text key={i} color={entry.color} fontSize="xs" mb={1}>
                        {entry.name}: {entry.value}
                    </Text>
                ))}
            </Box>
        );
    };

    const tdStyle = {
        padding: "10px 14px",
        fontSize: "13px",
        borderBottom: `1px solid ${colorMode === "dark" ? "#4a5568" : "#e2e8f0"}`,
        textAlign: "center",
        whiteSpace: "nowrap",
    };

    const thStyle = {
        padding: "10px 14px",
        fontSize: "12px",
        fontWeight: 600,
        borderBottom: `2px solid ${colorMode === "dark" ? "#4a5568" : "#e2e8f0"}`,
        background: thBg,
        whiteSpace: "nowrap",
        textAlign: "center",
    };

    const DataTable = ({ data }) => {
        if (!data.length) return (
            <Flex justify="center" p={8}>
                <Text color={textColor}>Tidak ada data</Text>
            </Flex>
        );

        return (
            <Box overflowX="auto" className="table-wrapper">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={{ ...thStyle, textAlign: "left", minWidth: "100px" }}>Bulan</th>
                            {POSITION_COLUMNS.map(p => (
                                <th key={p.key} style={{ ...thStyle, minWidth: "80px" }}>{p.label}</th>
                            ))}
                            <th style={{ ...thStyle, minWidth: "80px", fontWeight: 700 }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => {
                            const rowTotal = POSITION_COLUMNS.reduce((s, p) => s + parseNum(row[p.key]), 0);
                            return (
                                <tr
                                    key={index}
                                    style={{
                                        background: index % 2 === 0 ? "transparent"
                                            : colorMode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                                    }}
                                >
                                    <td style={{ ...tdStyle, textAlign: "left", fontWeight: 600 }}>
                                        {row.month}
                                    </td>
                                    {POSITION_COLUMNS.map(p => (
                                        <td key={p.key} style={tdStyle}>
                                            {parseNum(row[p.key]) > 0 ? parseNum(row[p.key]) : "-"}
                                        </td>
                                    ))}
                                    <td style={{ ...tdStyle, fontWeight: 700 }}>
                                        {rowTotal > 0 ? rowTotal : "-"}
                                    </td>
                                </tr>
                            );
                        })}
                        {/* Total row */}
                        <tr style={{ background: thBg, fontWeight: 700 }}>
                            <td style={{ ...tdStyle, textAlign: "left", fontWeight: 700 }}>TOTAL</td>
                            {POSITION_COLUMNS.map(p => {
                                const colTotal = data.reduce((s, row) => s + parseNum(row[p.key]), 0);
                                return (
                                    <td key={p.key} style={{ ...tdStyle, fontWeight: 700 }}>
                                        {colTotal > 0 ? colTotal : "-"}
                                    </td>
                                );
                            })}
                            <td style={{ ...tdStyle, fontWeight: 700 }}>
                                {data.reduce((s, row) =>
                                    s + POSITION_COLUMNS.reduce((ss, p) => ss + parseNum(row[p.key]), 0), 0
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </Box>
        );
    };

    const ChartSection = ({ data, title }) => (
        <Box bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="12px" p={6} mb={4}>
            <Text fontWeight="bold" fontSize="md" mb={4}>{title}</Text>
            {isLoading ? (
                <Skeleton height="280px" />
            ) : data.length === 0 ? (
                <Flex justify="center" align="center" h="200px">
                    <Text color={textColor}>Tidak ada data untuk tahun {selectedYear}</Text>
                </Flex>
            ) : (
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colorMode === "dark" ? "#4a5568" : "#e2e8f0"} />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: colorMode === "dark" ? "#a0aec0" : "#4a5568" }} />
                        <YAxis tickFormatter={formatShort} tick={{ fontSize: 11, fill: colorMode === "dark" ? "#a0aec0" : "#4a5568" }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {visiblePositions.map((key, i) => {
                            const pos = POSITION_COLUMNS.find(p => p.key === key);
                            return (
                                <Bar
                                    key={key}
                                    dataKey={key}
                                    name={pos?.label || key}
                                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                                    radius={[3, 3, 0, 0]}
                                />
                            );
                        })}
                    </BarChart>
                </ResponsiveContainer>
            )}
        </Box>
    );

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Dashboard Report Recruitment</h1>
                    <Text className="subtitle">Laporan data screening dan interview kandidat per posisi</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiUsers size={28} />
                        <p>Total Screening</p>
                        {isLoading
                            ? <Skeleton height="40px" width="60px" />
                            : <p className="card__points">{stats.totalScreening}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiUserCheck size={28} />
                        <p>Total Interview</p>
                        {isLoading
                            ? <Skeleton height="40px" width="60px" />
                            : <p className="card__points">{stats.totalInterview}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiTrendingUp size={28} />
                        <p>Conversion Rate</p>
                        {isLoading
                            ? <Skeleton height="40px" width="60px" />
                            : <p className="card__points">{stats.conversionRate}%</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiBarChart2 size={28} />
                        <p>Posisi Terbanyak</p>
                        {isLoading
                            ? <Skeleton height="40px" width="60px" />
                            : <p className="card__points" style={{ fontSize: "13px" }}>{stats.topPosition?.label || "-"}</p>}
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
                            <Text fontWeight="medium" mb={2} fontSize="sm" color={textColor}>
                                Filter Posisi di Chart (bisa multi)
                            </Text>
                            <Flex gap={2} wrap="wrap">
                                {POSITION_COLUMNS.map((pos, i) => (
                                    <Box
                                        key={pos.key}
                                        as="button"
                                        onClick={() => togglePosition(pos.key)}
                                        px={2} py={1}
                                        borderRadius="full"
                                        fontSize="xs"
                                        fontWeight={500}
                                        border="1px solid"
                                        borderColor={visiblePositions.includes(pos.key)
                                            ? CHART_COLORS[i % CHART_COLORS.length]
                                            : borderColor}
                                        color={visiblePositions.includes(pos.key)
                                            ? CHART_COLORS[i % CHART_COLORS.length]
                                            : textColor}
                                        bg={visiblePositions.includes(pos.key)
                                            ? `${CHART_COLORS[i % CHART_COLORS.length]}18`
                                            : "transparent"}
                                        cursor="pointer"
                                        transition="all 0.2s"
                                    >
                                        {pos.label}
                                    </Box>
                                ))}
                            </Flex>
                        </Box>
                    </Flex>
                </Box>

                {isError ? (
                    <Flex className="empty-state">
                        <Text>Gagal memuat data dashboard recruitment</Text>
                    </Flex>
                ) : (
                    <Tabs colorScheme="teal">
                        <TabList mb={4}>
                            <Tab fontWeight="600">Screening</Tab>
                            <Tab fontWeight="600">Lolos Screening</Tab>
                        </TabList>

                        <TabPanels>
                            {/* Screening */}
                            <TabPanel px={0}>
                                <ChartSection
                                    data={screeningChartData}
                                    title={`Grafik Screening per Posisi — ${selectedYear}`}
                                />
                                <Box bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="12px" overflow="hidden">
                                    <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
                                        <Text fontWeight="bold">Tabel Screening — {selectedYear}</Text>
                                    </Box>
                                    {isLoading
                                        ? <Box p={4}><Skeleton count={13} height={36} style={{ marginBottom: "4px" }} /></Box>
                                        : <DataTable data={screeningData} />}
                                </Box>
                            </TabPanel>

                            {/* Interview */}
                            <TabPanel px={0}>
                                <ChartSection
                                    data={interviewChartData}
                                    title={`Grafik Interview per Posisi — ${selectedYear}`}
                                />
                                <Box bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="12px" overflow="hidden">
                                    <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
                                        <Text fontWeight="bold">Tabel Interview — {selectedYear}</Text>
                                    </Box>
                                    {isLoading
                                        ? <Box p={4}><Skeleton count={13} height={36} style={{ marginBottom: "4px" }} /></Box>
                                        : <DataTable data={interviewData} />}
                                </Box>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                )}
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default DashboardReportPage;