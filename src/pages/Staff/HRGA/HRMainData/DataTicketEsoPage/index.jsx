import ContainerCarrot from "@/components/Container";
import { getDataTicketEso } from "@/features/hr/hrMainDataApiService";
import usePagination from "@/hooks/usePagination";
import {
    Box, Flex, Input, Select, Text, Tooltip, useColorMode, Badge,
    Skeleton,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiInbox,
    FiList, FiSearch, FiCheckCircle, FiClock, FiAlertCircle,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const STATUS_COLORS = { "Open": "orange", "Close": "green" };
const SUBMIT_COLORS = { "Tepat Waktu": "green", "Telat": "red" };

const DataTicketEsoPage = () => {
    const { colorMode } = useColorMode();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterSubmit, setFilterSubmit] = useState("all");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const { data: result, isLoading, isError } = useQuery({
        queryKey: ["dataTicketEso"],
        queryFn: getDataTicketEso,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const ticketData = useMemo(() => result?.data || [], [result]);
    const summary = useMemo(() => result?.summary || {}, [result]);

    const filteredData = useMemo(() => {
        let data = ticketData;
        if (filterStatus !== "all") data = data.filter(i => i.status === filterStatus);
        if (filterSubmit !== "all") data = data.filter(i => i.submit_status === filterSubmit);
        if (!searchQuery) return data;
        const lower = searchQuery.toLowerCase();
        return data.filter(i =>
            (i.nama_ticket && String(i.nama_ticket).toLowerCase().includes(lower)) ||
            (i.id_ticket && String(i.id_ticket).toLowerCase().includes(lower)) ||
            (i.responsible && String(i.responsible).toLowerCase().includes(lower)) ||
            (i.label && String(i.label).toLowerCase().includes(lower))
        );
    }, [ticketData, searchQuery, filterStatus, filterSubmit]);

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
                    <h1>Data Ticket ESO</h1>
                    <Text className="subtitle">Monitoring semua tiket internal divisi ESO</Text>
                </Box>

                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Total Ticket</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{ticketData.length}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiClock size={28} />
                        <p>Open</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : (
                            <p className="card__points" style={{ color: (summary.ticket_open || 0) > 0 ? "#ed8936" : "inherit" }}>
                                {summary.ticket_open || 0}
                            </p>
                        )}
                    </InfoCard>
                    <InfoCard>
                        <FiCheckCircle size={28} />
                        <p>Close</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{summary.ticket_close || 0}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiAlertCircle size={28} />
                        <p>Submit Terlambat</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : (
                            <p className="card__points" style={{ color: (summary.submit_terlambat || 0) > 0 ? "#f56565" : "inherit" }}>
                                {summary.submit_terlambat || 0}
                            </p>
                        )}
                    </InfoCard>
                    <InfoCard>
                        <FiCheckCircle size={28} />
                        <p>Submit Tepat Waktu</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{summary.submit_tepat_waktu || 0}</p>}
                    </InfoCard>
                </Box>

                <Flex className="search-container" mb={4} gap={3} wrap="wrap" align="center">
                    <Box position="relative" width="100%" maxWidth="360px">
                        <Input
                            placeholder="Cari nama ticket, ID, responsible, label..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                    <Select maxW="150px" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
                        <option value="all">Semua Status</option>
                        <option value="Open">Open</option>
                        <option value="Close">Close</option>
                    </Select>
                    <Select maxW="170px" value={filterSubmit} onChange={(e) => { setFilterSubmit(e.target.value); setCurrentPage(1); }}>
                        <option value="all">Semua Submit</option>
                        <option value="Tepat Waktu">Tepat Waktu</option>
                        <option value="Telat">Telat</option>
                    </Select>
                </Flex>

                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                    ) : isError ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data ticket ESO</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data ticket ESO"}</Text>
                        </Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="timestamp" label="Timestamp" minWidth="120px" />
                                        <SortableHeader column="id_ticket" label="ID Ticket" minWidth="120px" />
                                        <SortableHeader column="nama_ticket" label="Nama Ticket" minWidth="180px" />
                                        <th style={{ minWidth: "200px" }}>Description</th>
                                        <SortableHeader column="status" label="Status" minWidth="100px" />
                                        <SortableHeader column="deadline" label="Deadline" minWidth="120px" />
                                        <SortableHeader column="label" label="Label" minWidth="120px" />
                                        <th style={{ minWidth: "100px" }}>Type</th>
                                        <th style={{ minWidth: "100px" }}>Priority</th>
                                        <SortableHeader column="responsible" label="Responsible" minWidth="130px" />
                                        <th style={{ minWidth: "130px" }}>From</th>
                                        <th style={{ minWidth: "160px" }}>Result</th>
                                        <th style={{ minWidth: "160px" }}>Notes</th>
                                        <SortableHeader column="submit_status" label="Submit" minWidth="130px" />
                                        <th style={{ minWidth: "140px" }}>Tgl Close</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.id_ticket || index}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{item.timestamp || "-"}</td>
                                            <td>{item.id_ticket || "-"}</td>
                                            <td>{item.nama_ticket || "-"}</td>
                                            <td>
                                                {item.description?.length > 35 ? (
                                                    <Tooltip label={item.description}><span>{item.description.substring(0, 35)}...</span></Tooltip>
                                                ) : item.description || "-"}
                                            </td>
                                            <td>
                                                <Badge colorScheme={STATUS_COLORS[item.status] || "gray"}>{item.status || "-"}</Badge>
                                            </td>
                                            <td>{item.deadline || "-"}</td>
                                            <td>{item.label || "-"}</td>
                                            <td>{item.type || "-"}</td>
                                            <td>{item.priority || "-"}</td>
                                            <td>{item.responsible || "-"}</td>
                                            <td>{item.from_who || "-"}</td>
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
                                            <td>
                                                <Badge colorScheme={SUBMIT_COLORS[item.submit_status] || "gray"}>
                                                    {item.submit_status || "-"}
                                                </Badge>
                                            </td>
                                            <td>{item.timestamp_status_closed || "-"}</td>
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

export default DataTicketEsoPage;