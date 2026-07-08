import ContainerCarrot from "@/components/Container";
import { getDashboardRecruitmentPersonal } from "@/features/hr/hrgaPersonalApiService";
import {
    Box, Button, Flex, Select, Text, useColorMode, Tabs, TabList, Tab, TabPanels, TabPanel,
    Skeleton,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FiUsers, FiUserCheck, FiBriefcase, FiBarChart2, FiCalendar } from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => String(CURRENT_YEAR - i));

const CHART_COLOR = "#4299e1";

const DashboardRecruitmentPersonalPage = () => {
    const { colorMode } = useColorMode();
    const cardBg = colorMode === "dark" ? "gray.800" : "white";
    const borderCol = colorMode === "dark" ? "gray.600" : "gray.200";

    const [selectedYear, setSelectedYear] = useState(String(CURRENT_YEAR));
    const [appliedYear, setAppliedYear] = useState(null);

    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey: ["dashboardRecruitmentPersonal", appliedYear],
        queryFn: () => getDashboardRecruitmentPersonal(appliedYear),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: !!appliedYear,
    });

    const submitTest = data?.submit_test || [];
    const interview = data?.interview || [];
    const offering = data?.offering || [];
    const totals = data?.totals || {};

    const handleTampilkan = () => {
        setAppliedYear(selectedYear);
    };

    const ChartSection = ({ data, title, color }) => (
        <Box bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="12px" p={6} mb={4}>
            <Text fontWeight="bold" fontSize="md" mb={4}>{title}</Text>
            {data.length === 0 ? (
                <Flex justify="center" align="center" h="200px">
                    <Text color="gray.500">Tidak ada data</Text>
                </Flex>
            ) : (
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colorMode === "dark" ? "#4a5568" : "#e2e8f0"} />
                        <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: colorMode === "dark" ? "#a0aec0" : "#4a5568" }} />
                        <YAxis tick={{ fontSize: 11, fill: colorMode === "dark" ? "#a0aec0" : "#4a5568" }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="total" fill={color} radius={[4, 4, 0, 0]} name="Total" />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </Box>
    );

    const DataTable = ({ data }) => {
        if (!data.length) return null;
        const columns = Object.keys(data[0]);
        return (
            <Box overflowX="auto">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: colorMode === "dark" ? "#2d3748" : "#f7fafc" }}>
                            {columns.map(col => (
                                <th key={col} style={{ padding: "10px 14px", textAlign: "left", fontSize: "12px", fontWeight: 600, borderBottom: `2px solid ${borderCol}`, whiteSpace: "nowrap" }}>
                                    {col.replace(/_/g, " ").toUpperCase()}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => (
                            <tr key={i} style={{ borderBottom: `1px solid ${borderCol}` }}>
                                {columns.map(col => (
                                    <td key={col} style={{ padding: "10px 14px", fontSize: "13px", whiteSpace: "nowrap" }}>
                                        {row[col] !== "" && row[col] !== 0 ? row[col] : "-"}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Box>
        );
    };

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Dashboard Recruitment</h1>
                    <Text className="subtitle">Ringkasan data submit test, interview, dan offering</Text>
                </Box>

                {/* Filter Tahun */}
                <Box bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="12px" p={4} mb={6}>
                    <Flex gap={3} align="flex-end" wrap="wrap">
                        <Box>
                            <Text fontWeight="medium" mb={2} fontSize="sm">Tahun</Text>
                            <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} maxW="140px">
                                {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                            </Select>
                        </Box>
                        <Button colorScheme="teal" onClick={handleTampilkan} isLoading={isFetching} leftIcon={<FiCalendar />}>
                            Tampilkan
                        </Button>
                    </Flex>
                </Box>

                {!appliedYear && (
                    <Flex className="empty-state">
                        <FiBarChart2 size={48} />
                        <Text>Pilih tahun, lalu klik "Tampilkan"</Text>
                    </Flex>
                )}

                {appliedYear && (
                    <>
                        <Box className="stats-grid" mb={6}>
                            <InfoCard>
                                <FiUsers size={28} />
                                <p>Total Submit Test</p>
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{totals.total_submit_test || 0}</p>}
                            </InfoCard>
                            <InfoCard>
                                <FiUserCheck size={28} />
                                <p>Total Interview</p>
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{totals.total_interview || 0}</p>}
                            </InfoCard>
                            <InfoCard>
                                <FiBriefcase size={28} />
                                <p>Total Offering</p>
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{totals.total_offering || 0}</p>}
                            </InfoCard>
                            <InfoCard>
                                <FiBarChart2 size={28} />
                                <p>Posisi Dibuka</p>
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{totals.jumlah_posisi_dibuka || 0}</p>}
                            </InfoCard>
                        </Box>

                        {isError ? (
                            <Flex className="empty-state"><Text>Gagal memuat data dashboard</Text></Flex>
                        ) : (
                            <Tabs colorScheme="teal">
                                <TabList mb={4}>
                                    <Tab fontWeight="600">Submit Test</Tab>
                                    <Tab fontWeight="600">Interview</Tab>
                                    <Tab fontWeight="600">Offering</Tab>
                                </TabList>
                                <TabPanels>
                                    <TabPanel px={0}>
                                        {isLoading ? <Skeleton height="320px" /> : (
                                            <>
                                                <ChartSection data={submitTest} title={`Grafik Submit Test — ${appliedYear}`} color={CHART_COLOR} />
                                                <Box bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="12px" overflow="hidden">
                                                    <Box p={4} borderBottom="1px solid" borderColor={borderCol}><Text fontWeight="bold">Tabel Submit Test</Text></Box>
                                                    <DataTable data={submitTest} />
                                                </Box>
                                            </>
                                        )}
                                    </TabPanel>
                                    <TabPanel px={0}>
                                        {isLoading ? <Skeleton height="320px" /> : (
                                            <>
                                                <ChartSection data={interview} title={`Grafik Interview — ${appliedYear}`} color="#48bb78" />
                                                <Box bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="12px" overflow="hidden">
                                                    <Box p={4} borderBottom="1px solid" borderColor={borderCol}><Text fontWeight="bold">Tabel Interview</Text></Box>
                                                    <DataTable data={interview} />
                                                </Box>
                                            </>
                                        )}
                                    </TabPanel>
                                    <TabPanel px={0}>
                                        {isLoading ? <Skeleton height="320px" /> : (
                                            <>
                                                <ChartSection data={offering} title={`Grafik Offering — ${appliedYear}`} color="#ed8936" />
                                                <Box bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="12px" overflow="hidden">
                                                    <Box p={4} borderBottom="1px solid" borderColor={borderCol}><Text fontWeight="bold">Tabel Offering</Text></Box>
                                                    <DataTable data={offering} />
                                                </Box>
                                            </>
                                        )}
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        )}
                    </>
                )}
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default DashboardRecruitmentPersonalPage;