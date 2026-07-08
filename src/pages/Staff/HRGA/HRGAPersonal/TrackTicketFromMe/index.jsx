import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { trackTicketFromMe, getUtilsTicketingInternal } from "@/features/hr/hrgaPersonalApiService";
import usePagination from "@/hooks/usePagination";
import {
    Box, Button, Flex, Input, Select, Text, Tooltip, useColorMode, Badge,
    Skeleton,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiInbox, FiList, FiSearch, FiEye,
    FiCheckCircle, FiClock, FiXCircle,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const STATUS_COLORS = {
    "open": "orange",
    "close": "green",
};

const TrackTicketFromMePage = () => {
    const { colorMode } = useColorMode();

    const [kodeNama, setKodeNama] = useState("");
    const [appliedKodeNama, setAppliedKodeNama] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const { data: utils } = useQuery({
        queryKey: ["utilsTicketingInternal"],
        queryFn: getUtilsTicketingInternal,
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const personNames = (utils?.person_data || []).map(p => p.kode_nama).filter(Boolean);

    const { data: ticketData = [], isLoading, isError, isFetching } = useQuery({
        queryKey: ["trackTicketFromMe", appliedKodeNama],
        queryFn: () => trackTicketFromMe(appliedKodeNama),
        staleTime: 3 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: !!appliedKodeNama,
    });

    const stats = useMemo(() => {
        const total = ticketData.length;
        const open = ticketData.filter(i => String(i.status).toLowerCase() === "open").length;
        const closed = ticketData.filter(i => String(i.status).toLowerCase() === "close").length;
        return { total, open, closed };
    }, [ticketData]);

    const filteredData = useMemo(() => {
        let data = ticketData;
        if (filterStatus !== "all") data = data.filter(i => String(i.status).toLowerCase() === filterStatus);
        if (!searchQuery) return data;
        const lower = searchQuery.toLowerCase();
        return data.filter(i =>
            (i.nama_ticket && String(i.nama_ticket).toLowerCase().includes(lower)) ||
            (i.responsible && String(i.responsible).toLowerCase().includes(lower)) ||
            (i.label && String(i.label).toLowerCase().includes(lower)) ||
            (i.id_ticket && String(i.id_ticket).toLowerCase().includes(lower))
        );
    }, [ticketData, searchQuery, filterStatus]);

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

    const handleTampilkan = () => {
        if (!kodeNama.trim()) {
            toaster.create({ title: "Pilih kode nama terlebih dahulu", type: "warning", duration: 2000 });
            return;
        }
        setAppliedKodeNama(kodeNama.trim());
        setCurrentPage(1);
    };

    const SortableHeader = ({ column, label, minWidth }) => (
        <th onClick={() => handleSort(column)} style={{ cursor: "pointer", userSelect: "none", minWidth: minWidth || "120px" }}>
            <Flex align="center" gap={1}>
                {label}
                {sortConfig.key === column && (sortConfig.direction === "asc" ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />)}
            </Flex>
        </th>
    );

    const cardBg = colorMode === "dark" ? "gray.800" : "white";
    const borderCol = colorMode === "dark" ? "gray.600" : "gray.200";

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Track Ticket From Me</h1>
                    <Text className="subtitle">Pantau semua tiket yang pernah kamu buat</Text>
                </Box>

                {/* Filter Kode Nama */}
                <Box bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="12px" p={4} mb={6}>
                    <Flex gap={3} align="flex-end" wrap="wrap">
                        <Box flex={1} maxW="300px">
                            <Text fontWeight="medium" mb={2} fontSize="sm">Kode Nama (From)</Text>
                            <Select value={kodeNama} onChange={(e) => setKodeNama(e.target.value)} placeholder="- Pilih kode nama -">
                                {personNames.map(p => <option key={p} value={p}>{p}</option>)}
                            </Select>
                        </Box>
                        <Button colorScheme="teal" onClick={handleTampilkan} isLoading={isFetching}>
                            Tampilkan
                        </Button>
                    </Flex>
                </Box>

                {!appliedKodeNama ? (
                    <Flex className="empty-state">
                        <FiEye size={48} />
                        <Text>Pilih kode nama lalu klik "Tampilkan" untuk melihat tiket yang kamu buat</Text>
                    </Flex>
                ) : (
                    <>
                        <Box className="stats-grid" mb={6}>
                            <InfoCard>
                                <FiList size={28} />
                                <p>Total Ticket</p>
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                            </InfoCard>
                            <InfoCard>
                                <FiClock size={28} />
                                <p>Open</p>
                                {isLoading ? <Skeleton height="40px" width="60px" /> : (
                                    <p className="card__points" style={{ color: stats.open > 0 ? "#ed8936" : "inherit" }}>{stats.open}</p>
                                )}
                            </InfoCard>
                            <InfoCard>
                                <FiCheckCircle size={28} />
                                <p>Closed</p>
                                {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.closed}</p>}
                            </InfoCard>
                        </Box>

                        {/* Search + Filter */}
                        <Flex className="search-container" mb={4} gap={3} wrap="wrap" align="center">
                            <Box position="relative" width="100%" maxWidth="360px">
                                <Input
                                    placeholder="Cari nama ticket, ID, label, responsible..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    pl="40px"
                                />
                                <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                                    <FiSearch size={18} />
                                </Box>
                            </Box>
                            <Select maxW="160px" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
                                <option value="all">Semua Status</option>
                                <option value="open">Open</option>
                                <option value="close">Close</option>
                            </Select>
                        </Flex>

                        <Box className="table-wrapper">
                            {isLoading ? (
                                <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                            ) : isError ? (
                                <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data</Text></Flex>
                            ) : sortedData.length === 0 ? (
                                <Flex className="empty-state">
                                    <FiInbox size={48} />
                                    <Text>{searchQuery ? "Tidak ada hasil pencarian" : `Tidak ada ticket dari ${appliedKodeNama}`}</Text>
                                </Flex>
                            ) : (
                                <>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th style={{ width: "50px" }}>No</th>
                                                <th style={{ minWidth: "100px" }}>Timestamp</th>
                                                <SortableHeader column="id_ticket" label="ID Ticket" minWidth="120px" />
                                                <SortableHeader column="nama_ticket" label="Nama Ticket" minWidth="180px" />
                                                <th style={{ minWidth: "200px" }}>Description</th>
                                                <SortableHeader column="status" label="Status" minWidth="100px" />
                                                <SortableHeader column="deadline" label="Deadline" minWidth="120px" />
                                                <SortableHeader column="label" label="Label" minWidth="120px" />
                                                <th style={{ minWidth: "100px" }}>Type</th>
                                                <th style={{ minWidth: "100px" }}>Priority</th>
                                                <SortableHeader column="responsible" label="Responsible" minWidth="130px" />
                                                <th style={{ minWidth: "160px" }}>Result</th>
                                                <th style={{ minWidth: "160px" }}>Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentItems.map((item, index) => (
                                                <tr key={item.id_ticket || index}>
                                                    <td>{startIndex + index + 1}</td>
                                                    <td>{String(item.timestamp || "-")}</td>
                                                    <td>{item.id_ticket || "-"}</td>
                                                    <td>{item.nama_ticket || "-"}</td>
                                                    <td>
                                                        {item.description?.length > 35 ? (
                                                            <Tooltip label={item.description}><span>{item.description.substring(0, 35)}...</span></Tooltip>
                                                        ) : item.description || "-"}
                                                    </td>
                                                    <td>
                                                        <Badge colorScheme={STATUS_COLORS[String(item.status).toLowerCase()] || "gray"}>
                                                            {item.status || "-"}
                                                        </Badge>
                                                    </td>
                                                    <td>{String(item.deadline || "-")}</td>
                                                    <td>{item.label || "-"}</td>
                                                    <td>{item.type || "-"}</td>
                                                    <td>{item.priority || "-"}</td>
                                                    <td>{item.responsible || "-"}</td>
                                                    <td>
                                                        {item.result?.length > 25 ? (
                                                            <Tooltip label={item.result}><span>{item.result.substring(0, 25)}...</span></Tooltip>
                                                        ) : item.result || "-"}
                                                    </td>
                                                    <td>
                                                        {item.notes?.length > 25 ? (
                                                            <Tooltip label={item.notes}><span>{item.notes.substring(0, 25)}...</span></Tooltip>
                                                        ) : item.notes || "-"}
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
                    </>
                )}
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default TrackTicketFromMePage;