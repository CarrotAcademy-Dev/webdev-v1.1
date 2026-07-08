import ContainerCarrot from "@/components/Container";
import { getMonthlyStockHistory } from "@/features/hr/stockApiService";
import {
    Box, Button, Flex, Input, Select, Skeleton, Text, Tooltip, useColorMode,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiInbox,
    FiList, FiSearch, FiCalendar, FiTrendingUp, FiTrendingDown,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import usePagination from "@/hooks/usePagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const BULAN_OPTIONS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => String(CURRENT_YEAR - i));
const CURRENT_MONTH_EN = BULAN_OPTIONS[new Date().getMonth()];

const MonthlyStockHistoryPage = () => {
    const { colorMode } = useColorMode();

    const [selectedBulan, setSelectedBulan] = useState(CURRENT_MONTH_EN);
    const [selectedTahun, setSelectedTahun] = useState(String(CURRENT_YEAR));
    const [appliedFilter, setAppliedFilter] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const { data: monthlyData = [], isLoading, isError, isFetching } = useQuery({
        queryKey: ["monthlyStockHistory", appliedFilter?.bulan, appliedFilter?.tahun],
        queryFn: () => getMonthlyStockHistory(appliedFilter.bulan, appliedFilter.tahun),
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: !!appliedFilter,
    });

    // Kolom dinamis dari response
    const columns = useMemo(() => {
        if (!monthlyData.length) return [];
        return Object.keys(monthlyData[0]);
    }, [monthlyData]);

    const stats = useMemo(() => {
        const total = monthlyData.length;
        const totalIn = monthlyData.reduce((sum, i) => sum + (Number(i.in_qty) || 0), 0);
        const totalOut = monthlyData.reduce((sum, i) => sum + (Number(i.out_qty) || 0), 0);
        return { total, totalIn, totalOut };
    }, [monthlyData]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return monthlyData;
        const lower = searchQuery.toLowerCase();
        return monthlyData.filter(item =>
            Object.values(item).some(val => val && String(val).toLowerCase().includes(lower))
        );
    }, [monthlyData, searchQuery]);

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aVal = String(a[sortConfig.key] || "").toLowerCase();
            const bVal = String(b[sortConfig.key] || "").toLowerCase();
            if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig]);

    const { currentItems, currentPage, totalPages, goToPage, startIndex, endIndex, totalItems, setCurrentPage } =
        usePagination(sortedData, 20);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    const handleTampilkan = () => {
        setAppliedFilter({ bulan: selectedBulan, tahun: selectedTahun });
        setCurrentPage(1);
        setSearchQuery("");
    };

    const SortableHeader = ({ column, label, minWidth }) => (
        <th onClick={() => handleSort(column)} style={{ cursor: "pointer", userSelect: "none", minWidth: minWidth || "130px" }}>
            <Flex align="center" gap={1}>
                {label}
                {sortConfig.key === column && (
                    sortConfig.direction === "asc" ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                )}
            </Flex>
        </th>
    );

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Monthly Stock History</h1>
                    <Text className="subtitle">Rekap pergerakan stock per bulan</Text>
                </Box>

                {/* Filter Bulan & Tahun */}
                <Box
                    bg={colorMode === "dark" ? "gray.800" : "white"}
                    border="1px solid"
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                    borderRadius="12px" p={4} mb={6}
                >
                    <Flex gap={3} align="flex-end" wrap="wrap">
                        <Box>
                            <Text fontWeight="medium" mb={2} fontSize="sm">Bulan</Text>
                            <Select
                                value={selectedBulan}
                                onChange={(e) => setSelectedBulan(e.target.value)}
                                maxW="180px"
                            >
                                {BULAN_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                            </Select>
                        </Box>
                        <Box>
                            <Text fontWeight="medium" mb={2} fontSize="sm">Tahun</Text>
                            <Select
                                value={selectedTahun}
                                onChange={(e) => setSelectedTahun(e.target.value)}
                                maxW="140px"
                            >
                                {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                            </Select>
                        </Box>
                        <Button
                            colorScheme="teal"
                            onClick={handleTampilkan}
                            isLoading={isFetching}
                            leftIcon={<FiCalendar />}
                        >
                            Tampilkan
                        </Button>
                    </Flex>
                </Box>

                {/* Empty state sebelum filter */}
                {!appliedFilter && (
                    <Flex className="empty-state">
                        <FiCalendar size={48} />
                        <Text>Pilih bulan dan tahun, lalu klik "Tampilkan"</Text>
                    </Flex>
                )}

                {/* Stats */}
                {appliedFilter && (
                    <Box className="stats-grid" mb={6}>
                        <InfoCard>
                            <FiList size={28} />
                            <p>Total Data</p>
                            {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                        </InfoCard>
                        <InfoCard>
                            <FiTrendingUp size={28} />
                            <p>Total IN</p>
                            {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.totalIn}</p>}
                        </InfoCard>
                        <InfoCard>
                            <FiTrendingDown size={28} />
                            <p>Total OUT</p>
                            {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.totalOut}</p>}
                        </InfoCard>
                    </Box>
                )}

                {/* Search */}
                {appliedFilter && (
                    <Flex className="search-container" mb={4}>
                        <Box position="relative" width="100%" maxWidth="400px">
                            <Input
                                placeholder="Cari di semua kolom..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                pl="40px"
                            />
                            <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                                <FiSearch size={18} />
                            </Box>
                        </Box>
                    </Flex>
                )}

                {/* Table */}
                {appliedFilter && (
                    <Box className="table-wrapper">
                        {isLoading ? (
                            <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                        ) : isError ? (
                            <Flex className="empty-state">
                                <FiInbox size={48} />
                                <Text>Gagal memuat data monthly stock history</Text>
                            </Flex>
                        ) : sortedData.length === 0 ? (
                            <Flex className="empty-state">
                                <FiInbox size={48} />
                                <Text>
                                    {searchQuery
                                        ? "Tidak ada hasil pencarian"
                                        : `Tidak ada data untuk ${appliedFilter.bulan} ${appliedFilter.tahun}`}
                                </Text>
                            </Flex>
                        ) : (
                            <>
                                <table>
                                    <thead>
                                        <tr>
                                            <th style={{ width: "50px" }}>No</th>
                                            {columns.map(col => (
                                                <SortableHeader
                                                    key={col}
                                                    column={col}
                                                    label={col.replace(/_/g, " ").toUpperCase()}
                                                />
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map((item, index) => (
                                            <tr key={index}>
                                                <td>{startIndex + index + 1}</td>
                                                {columns.map(col => {
                                                    const val = item[col];

                                                    // IN hijau, OUT merah
                                                    if (col === "in_qty" && val && String(val) !== "0") {
                                                        return (
                                                            <td key={col} style={{ textAlign: "center" }}>
                                                                <Text color="green.500" fontWeight="bold">{String(val)}</Text>
                                                            </td>
                                                        );
                                                    }
                                                    if (col === "out_qty" && val && String(val) !== "0") {
                                                        return (
                                                            <td key={col} style={{ textAlign: "center" }}>
                                                                <Text color="red.500" fontWeight="bold">{String(val)}</Text>
                                                            </td>
                                                        );
                                                    }

                                                    const str = val ? String(val) : "-";
                                                    return (
                                                        <td key={col}>
                                                            {str.length > 30 ? (
                                                                <Tooltip label={str}>
                                                                    <span>{str.substring(0, 30)}...</span>
                                                                </Tooltip>
                                                            ) : str}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {totalPages > 1 && (
                                    <Flex justify="center" mt={4}>
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={goToPage}
                                            startIndex={startIndex}
                                            endIndex={endIndex}
                                            totalItems={totalItems}
                                        />
                                    </Flex>
                                )}
                            </>
                        )}
                    </Box>
                )}
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default MonthlyStockHistoryPage;