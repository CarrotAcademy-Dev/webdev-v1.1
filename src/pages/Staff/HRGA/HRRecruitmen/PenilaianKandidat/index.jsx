import ContainerCarrot from "@/components/Container";
import { getPenilaianKandidat } from "@/features/hr/hrApiService";
import {
    Box, Flex, IconButton, Input, Text,
    useColorMode, useDisclosure, Badge, Grid,
    Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay,
    Skeleton,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiExternalLink,
    FiInbox, FiList, FiSearch, FiUser, FiUsers, FiFileText,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import usePagination from "@/hooks/usePagination";
import { StyledDashboardReport } from "../DashboardReport/DashboardReport.styled";

const isValidUrl = (url) => {
    if (!url) return false;
    try { return ["http:", "https:"].includes(new URL(String(url)).protocol); }
    catch { return false; }
};

const PenilaianKandidatPage = () => {
    const { colorMode } = useColorMode();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [selectedItem, setSelectedItem] = useState(null);

    const { data: penilaianData = [], isLoading, isError } = useQuery({
        queryKey: ["penilaianKandidat"],
        queryFn: getPenilaianKandidat,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const stats = useMemo(() => {
        const total = penilaianData.length;
        const uniquePosisi = new Set(penilaianData.map(i => i.posisi).filter(Boolean)).size;
        const adaPdf = penilaianData.filter(i => isValidUrl(i.link_pdf)).length;
        return { total, uniquePosisi, adaPdf };
    }, [penilaianData]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return penilaianData;
        const lower = searchQuery.toLowerCase();
        return penilaianData.filter(i =>
            (i.nama_kandidat && String(i.nama_kandidat).toLowerCase().includes(lower)) ||
            (i.posisi && String(i.posisi).toLowerCase().includes(lower)) ||
            (i.first_interviewer && String(i.first_interviewer).toLowerCase().includes(lower))
        );
    }, [penilaianData, searchQuery]);

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

    const handleOpenDetail = (item) => {
        setSelectedItem(item);
        onOpen();
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

    const LinkButton = ({ url }) => isValidUrl(url) ? (
        <IconButton size="sm" variant="ghost" colorScheme="blue"
            onClick={() => window.open(String(url), "_blank", "noopener,noreferrer")}>
            <FiExternalLink />
        </IconButton>
    ) : <span>-</span>;

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Penilaian Kandidat</h1>
                    <Text className="subtitle">Data penilaian kandidat dari setiap tahap interview</Text>
                </Box>

                {/* Stats */}
                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Total Kandidat</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiUsers size={28} />
                        <p>Jumlah Posisi</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.uniquePosisi}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiFileText size={28} />
                        <p>Ada PDF</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.adaPdf}</p>}
                    </InfoCard>
                </Box>

                {/* Search */}
                <Flex className="search-container" mb={4}>
                    <Box position="relative" width="100%" maxWidth="400px">
                        <Input
                            placeholder="Cari nama kandidat, posisi, interviewer..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                </Flex>

                {/* Table */}
                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                    ) : isError ? (
                        <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data</Text></Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data penilaian"}</Text>
                        </Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="nama_kandidat" label="Nama Kandidat" minWidth="180px" />
                                        <SortableHeader column="posisi" label="Posisi" minWidth="150px" />
                                        <th style={{ minWidth: "150px" }}>Interviewer 1</th>
                                        <th style={{ minWidth: "150px" }}>Interviewer 2</th>
                                        <th style={{ minWidth: "150px" }}>Interviewer 3</th>
                                        <SortableHeader column="pendidikan" label="Pendidikan" minWidth="130px" />
                                        <SortableHeader column="usia" label="Usia" minWidth="80px" />
                                        <SortableHeader column="jenis_kelamin" label="Jenis Kelamin" minWidth="120px" />
                                        <th style={{ width: "80px", textAlign: "center" }}>Sheet</th>
                                        <th style={{ width: "80px", textAlign: "center" }}>PDF</th>
                                        <th style={{ width: "80px", position: "sticky", right: 0 }}>Detail</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={index}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{item.nama_kandidat || "-"}</td>
                                            <td>{item.posisi || "-"}</td>
                                            <td>{item.first_interviewer || "-"}</td>
                                            <td>{item.second_interviewer || "-"}</td>
                                            <td>{item.third_interviewer || "-"}</td>
                                            <td>{item.pendidikan || "-"}</td>
                                            <td>{item.usia || "-"}</td>
                                            <td>{item.jenis_kelamin || "-"}</td>
                                            <td style={{ textAlign: "center" }}>
                                                <LinkButton url={item.link_sheet} />
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                <LinkButton url={item.link_pdf} />
                                            </td>
                                            <td style={{ position: "sticky", right: 0 }}>
                                                <IconButton size="sm" variant="ghost" colorScheme="teal"
                                                    onClick={() => handleOpenDetail(item)}>
                                                    <FiUser />
                                                </IconButton>
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

                {/* Detail Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="lg">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Detail Penilaian — {selectedItem?.nama_kandidat}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={6}>
                            {selectedItem && (
                                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                    {[
                                        { label: "Nama Kandidat", key: "nama_kandidat" },
                                        { label: "Posisi", key: "posisi" },
                                        { label: "Pendidikan", key: "pendidikan" },
                                        { label: "Usia", key: "usia" },
                                        { label: "Jenis Kelamin", key: "jenis_kelamin" },
                                        { label: "Interviewer 1", key: "first_interviewer" },
                                        { label: "Interviewer 2", key: "second_interviewer" },
                                        { label: "Interviewer 3", key: "third_interviewer" },
                                    ].map(({ label, key }) => (
                                        <Box key={key} borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                            <Text fontSize="xs" color="gray.500" mb={1}>{label}</Text>
                                            <Text fontSize="sm" fontWeight="medium">
                                                {selectedItem[key] ? String(selectedItem[key]) : "-"}
                                            </Text>
                                        </Box>
                                    ))}

                                    {/* Links */}
                                    {[
                                        { label: "Link Sheet Penilaian", key: "link_sheet" },
                                        { label: "Link PDF", key: "link_pdf" },
                                    ].map(({ label, key }) => (
                                        <Box key={key} borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                            <Text fontSize="xs" color="gray.500" mb={1}>{label}</Text>
                                            {isValidUrl(selectedItem[key]) ? (
                                                <Flex align="center" gap={2}>
                                                    <Text fontSize="sm" color="blue.400" noOfLines={1}>
                                                        {String(selectedItem[key])}
                                                    </Text>
                                                    <Box as="a" href={String(selectedItem[key])} target="_blank" rel="noopener noreferrer">
                                                        <FiExternalLink size={14} />
                                                    </Box>
                                                </Flex>
                                            ) : (
                                                <Text fontSize="sm">-</Text>
                                            )}
                                        </Box>
                                    ))}
                                </Grid>
                            )}
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default PenilaianKandidatPage;