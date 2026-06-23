import ContainerCarrot from "@/components/Container";
import { getAssetHistory } from "@/features/hr/assetApiServices";
import {
    Box, Flex, Input, Select, Skeleton, Text, useColorMode,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiInbox,
    FiList, FiSearch, FiTrendingUp, FiTrendingDown, FiPackage,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import usePagination from "@/hooks/usePagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const CURRENT_YEAR = new Date().getFullYear();

const AssetHistoryPage = () => {
    const { colorMode } = useColorMode();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterBulan, setFilterBulan] = useState("all");
    const [filterTahun, setFilterTahun] = useState("all");
    const [filterKeterangan, setFilterKeterangan] = useState("all");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const { data: historyData = [], isLoading, isError } = useQuery({
        queryKey: ["assetHistory"],
        queryFn: getAssetHistory,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    // Available filter options dari data
    const availableBulan = useMemo(() => {
        const bulan = new Set(historyData.map(i => i.bulan).filter(Boolean));
        return [...bulan].sort();
    }, [historyData]);

    const availableTahun = useMemo(() => {
        const tahun = new Set(historyData.map(i => String(i.tahun)).filter(Boolean));
        return [...tahun].sort((a, b) => Number(b) - Number(a));
    }, [historyData]);

    const availableKeterangan = useMemo(() => {
        const ket = new Set(historyData.map(i => i.keterangan).filter(Boolean));
        return [...ket].sort();
    }, [historyData]);

    const stats = useMemo(() => {
        const total = historyData.length;
        const totalIn = historyData.filter(i => i.in && String(i.in) !== "" && String(i.in) !== "0").length;
        const totalOut = historyData.filter(i => i.out && String(i.out) !== "" && String(i.out) !== "0").length;
        const uniqueBarang = new Set(historyData.map(i => i.nama_barang).filter(Boolean)).size;
        return { total, totalIn, totalOut, uniqueBarang };
    }, [historyData]);

    const filteredData = useMemo(() => {
        let data = historyData;

        if (filterBulan !== "all") data = data.filter(i => i.bulan === filterBulan);
        if (filterTahun !== "all") data = data.filter(i => String(i.tahun) === filterTahun);
        if (filterKeterangan !== "all") data = data.filter(i => i.keterangan === filterKeterangan);

        if (!searchQuery) return data;
        const lower = searchQuery.toLowerCase();
        return data.filter(i =>
            (i.nama_barang && String(i.nama_barang).toLowerCase().includes(lower)) ||
            (i.nama && String(i.nama).toLowerCase().includes(lower)) ||
            (i.id_barang && String(i.id_barang).toLowerCase().includes(lower))
        );
    }, [historyData, searchQuery, filterBulan, filterTahun, filterKeterangan]);

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
                    <h1>Asset History</h1>
                    <Text className="subtitle">Riwayat pergerakan IN/OUT asset per barang</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Total Transaksi</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiPackage size={28} />
                        <p>Jumlah Barang</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.uniqueBarang}</p>}
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

                {/* Search + Filters */}
                <Flex className="search-container" mb={4} gap={3} wrap="wrap" align="center">
                    <Box position="relative" width="100%" maxWidth="320px">
                        <Input
                            placeholder="Cari nama barang, nama, ID..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                    <Select maxW="150px" value={filterBulan} onChange={(e) => { setFilterBulan(e.target.value); setCurrentPage(1); }}>
                        <option value="all">Semua Bulan</option>
                        {availableBulan.map(b => <option key={b} value={b}>{b}</option>)}
                    </Select>
                    <Select maxW="130px" value={filterTahun} onChange={(e) => { setFilterTahun(e.target.value); setCurrentPage(1); }}>
                        <option value="all">Semua Tahun</option>
                        {availableTahun.map(y => <option key={y} value={y}>{y}</option>)}
                    </Select>
                    <Select maxW="180px" value={filterKeterangan} onChange={(e) => { setFilterKeterangan(e.target.value); setCurrentPage(1); }}>
                        <option value="all">Semua Keterangan</option>
                        {availableKeterangan.map(k => <option key={k} value={k}>{k}</option>)}
                    </Select>
                </Flex>

                {/* Table */}
                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                    ) : isError ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data asset history</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data history"}</Text>
                        </Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="tanggal" label="Tanggal" minWidth="130px" />
                                        <SortableHeader column="nama" label="Nama" minWidth="150px" />
                                        <SortableHeader column="id_barang" label="ID Barang" minWidth="130px" />
                                        <SortableHeader column="nama_barang" label="Nama Barang" minWidth="180px" />
                                        <th style={{ minWidth: "80px", textAlign: "center" }}>IN</th>
                                        <th style={{ minWidth: "80px", textAlign: "center" }}>OUT</th>
                                        <th style={{ minWidth: "120px", textAlign: "center" }}>Tersedia</th>
                                        <SortableHeader column="keterangan" label="Keterangan" minWidth="150px" />
                                        <SortableHeader column="bulan" label="Bulan" minWidth="100px" />
                                        <SortableHeader column="tahun" label="Tahun" minWidth="80px" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={index}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{String(item.tanggal || "-")}</td>
                                            <td>{item.nama || "-"}</td>
                                            <td>{item.id_barang || "-"}</td>
                                            <td>{item.nama_barang || "-"}</td>
                                            <td style={{ textAlign: "center" }}>
                                                {item.in && String(item.in) !== "0" && String(item.in) !== "" ? (
                                                    <Text color="green.500" fontWeight="bold">{String(item.in)}</Text>
                                                ) : "-"}
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                {item.out && String(item.out) !== "0" && String(item.out) !== "" ? (
                                                    <Text color="red.500" fontWeight="bold">{String(item.out)}</Text>
                                                ) : "-"}
                                            </td>
                                            <td style={{ textAlign: "center" }}>{item.tersedia ?? "-"}</td>
                                            <td>{item.keterangan || "-"}</td>
                                            <td>{item.bulan || "-"}</td>
                                            <td>{item.tahun || "-"}</td>
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
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default AssetHistoryPage;