import ContainerCarrot from "@/components/Container";
import { getDailyAsset } from "@/features/hr/assetApiServices";
import {
    Box, Button, Flex, IconButton, Input, Skeleton, Text, Tooltip, useColorMode,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiExternalLink,
    FiInbox, FiList, FiSearch, FiCalendar,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import usePagination from "@/hooks/usePagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const isValidUrl = (url) => {
    if (!url) return false;
    try { return ["http:", "https:"].includes(new URL(String(url)).protocol); }
    catch { return false; }
};

const todayString = () => {
    const d = new Date();
    return d.toISOString().split("T")[0]; // YYYY-MM-DD for <input type="date">
};

const DailyAssetPage = () => {
    const { colorMode } = useColorMode();

    const [selectedDate, setSelectedDate] = useState(todayString());
    const [appliedDate, setAppliedDate] = useState(""); // hanya update saat user klik "Tampilkan"
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const { data: dailyData = [], isLoading, isError, isFetching } = useQuery({
        queryKey: ["dailyAsset", appliedDate],
        queryFn: () => getDailyAsset(appliedDate),
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: !!appliedDate,
    });

    const stats = useMemo(() => {
        const total = dailyData.length;
        const uniqueArea = new Set(dailyData.map(i => i.area).filter(Boolean)).size;
        const uniqueKelompok = new Set(dailyData.map(i => i.kelompok).filter(Boolean)).size;
        return { total, uniqueArea, uniqueKelompok };
    }, [dailyData]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return dailyData;
        const lower = searchQuery.toLowerCase();
        return dailyData.filter(item =>
            Object.values(item).some(val => val && String(val).toLowerCase().includes(lower))
        );
    }, [dailyData, searchQuery]);

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
        if (!selectedDate) return;
        // Konversi ke format yang backend expect, kalau perlu DD/MM/YYYY
        const [year, month, day] = selectedDate.split("-");
        setAppliedDate(`${day}/${month}/${year}`);
        setCurrentPage(1);
        setSearchQuery("");
    };

    // Ambil daftar kolom dinamis dari data pertama
    const columns = useMemo(() => {
        if (!dailyData.length) return [];
        return Object.keys(dailyData[0]);
    }, [dailyData]);

    const SortableHeader = ({ column, label, minWidth }) => (
        <th onClick={() => handleSort(column)} style={{ cursor: "pointer", userSelect: "none", minWidth: minWidth || "120px" }}>
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
                    <h1>Daily Asset</h1>
                    <Text className="subtitle">Lihat data asset harian berdasarkan tanggal tertentu</Text>
                </Box>

                {/* Date Picker */}
                <Box bg={colorMode === "dark" ? "gray.800" : "white"} border="1px solid"
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                    borderRadius="12px" p={4} mb={6}
                >
                    <Flex gap={3} align="flex-end" wrap="wrap">
                        <Box>
                            <Text fontWeight="medium" mb={2} fontSize="sm">Pilih Tanggal</Text>
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                maxW="200px"
                            />
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

                {/* Empty state sebelum pilih tanggal */}
                {!appliedDate && (
                    <Flex className="empty-state">
                        <FiCalendar size={48} />
                        <Text>Pilih tanggal lalu klik "Tampilkan" untuk melihat data</Text>
                    </Flex>
                )}

                {/* Stats */}
                {appliedDate && (
                    <Box className="stats-grid" mb={6}>
                        <InfoCard>
                            <FiList size={28} />
                            <p>Total Data</p>
                            {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                        </InfoCard>
                        <InfoCard>
                            <FiList size={28} />
                            <p>Jumlah Area</p>
                            {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.uniqueArea}</p>}
                        </InfoCard>
                        <InfoCard>
                            <FiList size={28} />
                            <p>Jumlah Kelompok</p>
                            {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.uniqueKelompok}</p>}
                        </InfoCard>
                    </Box>
                )}

                {/* Search */}
                {appliedDate && (
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
                {appliedDate && (
                    <Box className="table-wrapper">
                        {isLoading ? (
                            <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                        ) : isError ? (
                            <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data daily asset</Text></Flex>
                        ) : sortedData.length === 0 ? (
                            <Flex className="empty-state">
                                <FiInbox size={48} />
                                <Text>{searchQuery ? "Tidak ada hasil pencarian" : `Tidak ada data untuk tanggal ${appliedDate}`}</Text>
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
                                                    minWidth="140px"
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
                                                    if (isValidUrl(val)) {
                                                        return (
                                                            <td key={col}>
                                                                <IconButton size="sm" variant="ghost" colorScheme="blue"
                                                                    onClick={() => window.open(String(val), "_blank", "noopener,noreferrer")}>
                                                                    <FiExternalLink />
                                                                </IconButton>
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

export default DailyAssetPage;