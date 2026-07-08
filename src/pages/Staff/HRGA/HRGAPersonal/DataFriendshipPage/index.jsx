import ContainerCarrot from "@/components/Container";
import { getDataFriendship } from "@/features/hr/hrgaPersonalApiService";
import usePagination from "@/hooks/usePagination";
import { Box, Flex, Input, Text, useColorMode, Badge, Skeleton } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FiChevronDown, FiChevronUp, FiInbox, FiList, FiSearch, FiUsers, FiGift } from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const DataFriendshipPage = () => {
    const { colorMode } = useColorMode();
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const { data: friendshipData = [], isLoading, isError } = useQuery({
        queryKey: ["dataFriendship"],
        queryFn: getDataFriendship,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const stats = useMemo(() => {
        const total = friendshipData.length;
        const avgBulanAktif = total > 0
            ? Math.round(friendshipData.reduce((s, i) => s + (Number(i.total_bulan_aktif) || 0), 0) / total)
            : 0;
        const sudahDapatMerch = friendshipData.filter(i => i.status_merch && i.status_merch !== "" && i.status_merch.toLowerCase() !== "belum").length;
        return { total, avgBulanAktif, sudahDapatMerch };
    }, [friendshipData]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return friendshipData;
        const lower = searchQuery.toLowerCase();
        return friendshipData.filter(i =>
            i.nama_siswa && String(i.nama_siswa).toLowerCase().includes(lower)
        );
    }, [friendshipData, searchQuery]);

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
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc" }));
    };

    const SortableHeader = ({ column, label, minWidth }) => (
        <th onClick={() => handleSort(column)} style={{ cursor: "pointer", userSelect: "none", minWidth: minWidth || "120px" }}>
            <Flex align="center" gap={1}>
                {label}
                {sortConfig.key === column && (sortConfig.direction === "asc" ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />)}
            </Flex>
        </th>
    );

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Data Friendship</h1>
                    <Text className="subtitle">Data siswa program friendship dan status merchandise</Text>
                </Box>

                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiUsers size={28} />
                        <p>Total Siswa</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Rata² Bulan Aktif</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.avgBulanAktif}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiGift size={28} />
                        <p>Sudah Dapat Merch</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.sudahDapatMerch}</p>}
                    </InfoCard>
                </Box>

                <Flex className="search-container" mb={4}>
                    <Box position="relative" width="100%" maxWidth="400px">
                        <Input
                            placeholder="Cari nama siswa..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                </Flex>

                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                    ) : isError ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data friendship</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data friendship"}</Text>
                        </Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="nama_siswa" label="Nama Siswa" minWidth="180px" />
                                        <th style={{ minWidth: "140px" }}>First Class</th>
                                        <th style={{ minWidth: "140px" }}>Last Class</th>
                                        <th style={{ minWidth: "130px", textAlign: "center" }}>Total Bulan Aktif</th>
                                        <th style={{ minWidth: "150px" }}>Lama Join</th>
                                        <th style={{ minWidth: "130px" }}>Status Merch</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.row || index}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{item.nama_siswa || "-"}</td>
                                            <td>{String(item.first_class || "-")}</td>
                                            <td>{String(item.last_class || "-")}</td>
                                            <td style={{ textAlign: "center" }}>{item.total_bulan_aktif ?? "-"}</td>
                                            <td>{item.lama_join_formatted || "-"}</td>
                                            <td>
                                                {item.status_merch ? (
                                                    <Badge colorScheme={item.status_merch.toLowerCase() === "belum" ? "orange" : "green"}>
                                                        {item.status_merch}
                                                    </Badge>
                                                ) : "-"}
                                            </td>
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

export default DataFriendshipPage;