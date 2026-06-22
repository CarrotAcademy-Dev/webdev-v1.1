import ContainerCarrot from "@/components/Container";
import { getTrackTicketFromMeFinance } from "@/features/finance/financeApiService";
import usePagination from "@/hooks/usePagination";
import {
    Box, Flex, Input, Select, Text, Tooltip, useColorMode, Badge,
    Skeleton,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiClock, FiCheckCircle,
    FiInbox, FiList, FiSearch, FiAlertCircle, FiCheckSquare,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import { TrackTicketFromMeStyled } from "./TrackTicketFMeFin.styled";

const PRIORITY_COLOR = {
    high: "red",
    medium: "orange",
    low: "green",
};

const STATUS_COLOR = {
    open: "blue",
    "in progress": "orange",
    close: "green",
    done: "green",
};

const TrackTicketFromMePage = () => {
    const { colorMode } = useColorMode();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedYear, setSelectedYear] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const { data: ticketData = [], isLoading, isError } = useQuery({
        queryKey: ["trackTicketFromMeFinance"],
        queryFn: getTrackTicketFromMeFinance,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const stats = useMemo(() => {
        const total = ticketData.length;
        const open = ticketData.filter(i => i.status?.toLowerCase() === "open").length;
        const inProgress = ticketData.filter(i => i.status?.toLowerCase() === "in progress").length;
        const done = ticketData.filter(i => ["close", "done"].includes(i.status?.toLowerCase())).length;
        return { total, open, inProgress, done };
    }, [ticketData]);

    const extractYear = (timestamp) => {
        if (!timestamp) return null;
        const parsed = new Date(timestamp);
        if (!isNaN(parsed.getTime())) return String(parsed.getFullYear());
        const parts = String(timestamp).match(/(\d{4})/g);
        return parts ? parts[parts.length - 1] : null;
    };

    const availableYears = useMemo(() => {
        const years = new Set(ticketData.map(i => extractYear(i.timestamp)).filter(Boolean));
        return [...years].sort((a, b) => Number(b) - Number(a));
    }, [ticketData]);

    const availableStatuses = useMemo(() => {
        const statuses = new Set(ticketData.map(i => i.status).filter(Boolean));
        return [...statuses].sort();
    }, [ticketData]);

    const filteredData = useMemo(() => {
        let data = ticketData;

        if (selectedYear !== "all") {
            data = data.filter(i => extractYear(i.timestamp) === selectedYear);
        }

        if (selectedStatus !== "all") {
            data = data.filter(i => i.status?.toLowerCase() === selectedStatus.toLowerCase());
        }

        if (!searchQuery) return data;
        const lower = searchQuery.toLowerCase();
        return data.filter(i =>
            (i.id_ticket && i.id_ticket.toLowerCase().includes(lower)) ||
            (i.nama_ticket && i.nama_ticket.toLowerCase().includes(lower)) ||
            (i.responsible && i.responsible.toLowerCase().includes(lower)) ||
            (i.label && i.label.toLowerCase().includes(lower))  
        );
    }, [ticketData, searchQuery, selectedYear, selectedStatus]);

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.key] || "";
            const bVal = b[sortConfig.key] || "";
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
            direction: prev.key === key && prev.direction   === "asc" ? "desc" : "asc",
        }));
    };

    const SortableHeader = ({ column,    label, minWidth }) => (
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
            <TrackTicketFromMeStyled colorMode={colorMode} data-theme={colorMode}>
                <Box className="header">
                    <h1>Track Ticket From Me</h1>
                    <Text className="subtitle">Monitor semua ticket yang kamu buat</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Total</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiClock size={28} />
                        <p>Open</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.open}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiAlertCircle size={28} />
                        <p>In Progress</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.inProgress}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiCheckSquare size={28} />
                        <p>Done</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.done}</p>}
                    </InfoCard>
                </Box>

                {/* Search + Filters */}
                <Flex className="search-container" mb={4} gap={3} wrap="wrap">
                    <Box position="relative" width="100%" maxWidth="400px">
                        <Input
                            placeholder="Cari ID, nama ticket, responsible, label..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                    <Select maxW="160px" value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}>
                        <option value="all">Semua Status</option>
                        {availableStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                    <Select maxW="160px" value={selectedYear} onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}>
                        <option value="all">Semua Tahun</option>
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </Select>
                </Flex>

                {/* Table */}
                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}><Skeleton count={20} height={40} style={{ marginBottom: "8px" }} /></Box>
                    ) : isError ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data ticket"}</Text>
                        </Flex>
                    ) : (
                        <>
                            <table style={{ minWidth: "2400px" }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="id_ticket" label="ID Ticket" minWidth="120px" />
                                        <SortableHeader column="timestamp" label="Timestamp" minWidth="160px" />
                                        <SortableHeader column="nama_ticket" label="Nama Ticket" minWidth="200px" />
                                        <th style={{ minWidth: "220px" }}>Description</th>
                                        <SortableHeader column="status" label="Status" minWidth="110px" />
                                        <SortableHeader column="deadline" label="Deadline" minWidth="130px" />
                                        <SortableHeader column="label" label="Label" minWidth="120px" />
                                        <SortableHeader column="type" label="Type" minWidth="110px" />
                                        <SortableHeader column="priority" label="Priority" minWidth="100px" />
                                        <th style={{ minWidth: "140px" }}>From</th>
                                        <th style={{ minWidth: "160px" }}>Responsible</th>
                                        <th style={{ minWidth: "140px" }}>Accountable</th>
                                        <th style={{ minWidth: "140px" }}>Consulted</th>
                                        <th style={{ minWidth: "140px" }}>Informed</th>
                                        <th style={{ minWidth: "200px" }}>Result</th>
                                        <th style={{ minWidth: "200px" }}>Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={`${item.id_ticket}-${index}`}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{item.id_ticket || "-"}</td>
                                            <td>{item.timestamp || "-"}</td>
                                            <td>
                                                {item.nama_ticket?.length > 30
                                                    ? <Tooltip label={item.nama_ticket}><span>{item.nama_ticket.substring(0, 30)}...</span></Tooltip>
                                                    : item.nama_ticket || "-"}
                                            </td>
                                            <td>
                                                {item.description?.length > 35
                                                    ? <Tooltip label={item.description}><span>{item.description.substring(0, 35)}...</span></Tooltip>
                                                    : item.description || "-"}
                                            </td>
                                            <td>
                                                <Badge colorScheme={STATUS_COLOR[item.status?.toLowerCase()] || "gray"}>
                                                    {item.status || "-"}
                                                </Badge>
                                            </td>
                                            <td>{item.deadline || "-"}</td>
                                            <td>{item.label || "-"}</td>
                                            <td>{item.type || "-"}</td>
                                            <td>
                                                {item.priority ? (
                                                    <Badge colorScheme={PRIORITY_COLOR[item.priority?.toLowerCase()] || "gray"}>
                                                        {item.priority}
                                                    </Badge>
                                                ) : "-"}
                                            </td>
                                            <td>{item.from_who || "-"}</td>
                                            <td>{item.responsible || "-"}</td>
                                            <td>{item.accountable || "-"}</td>
                                            <td>{item.consulted || "-"}</td>
                                            <td>{item.informed || "-"}</td>
                                            <td>
                                                {item.result?.length > 30
                                                    ? <Tooltip label={item.result}><span>{item.result.substring(0, 30)}...</span></Tooltip>
                                                    : item.result || "-"}
                                            </td>
                                            <td>
                                                {item.notes?.length > 30
                                                    ? <Tooltip label={item.notes}><span>{item.notes.substring(0, 30)}...</span></Tooltip>
                                                    : item.notes || "-"}
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
            </TrackTicketFromMeStyled>
        </ContainerCarrot>
    );
};

export default TrackTicketFromMePage;