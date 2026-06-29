import ContainerCarrot from "@/components/Container";
import { getHasilInterview } from "@/features/hr/hrApiService";
import {
    Box, Button, Flex, IconButton, Input, Select, Text,
    Tooltip, useColorMode, useDisclosure,
    Modal, ModalBody, ModalCloseButton, ModalContent,
    ModalHeader, ModalOverlay, Badge, Grid,
    Skeleton,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiExternalLink,
    FiInbox, FiSearch, FiUser, FiUsers, FiCheckCircle, FiList,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import usePagination from "@/hooks/usePagination";
import { StyledDashboardReport } from "../DashboardReport/DashboardReport.styled";

// ============================================
// Constants
// ============================================

const POSISI_OPTIONS = [
    { value: "cso_new", label: "CSO (New)" },
    { value: "cso", label: "CSO" },
    { value: "cso_intern", label: "CSO Intern" },
    { value: "adm_intern", label: "ADM Intern" },
    { value: "adm_warehouse", label: "ADM Warehouse Intern" },
    { value: "de_intern", label: "DE Intern" },
    { value: "eso", label: "ESO" },
    { value: "eso_intern", label: "ESO Intern" },
    { value: "fin_inter", label: "Finance Intern" },
    { value: "finac", label: "Finance AC" },
    { value: "hrga", label: "HRGA" },
    { value: "hrga_intern", label: "HRGA Intern" },
    { value: "jsd", label: "JSD" },
    { value: "jsd_intern", label: "JSD Intern" },
    { value: "mentor", label: "Mentor" },
    { value: "sms", label: "SMS" },
    { value: "sms_intern", label: "SMS Intern" },
    { value: "smsvei", label: "SMS VEI" },
];

// Field yang sama di semua posisi — selalu ditampilkan di tabel
const COMMON_FIELDS = [
    { key: "timestamp", label: "Timestamp" },
    { key: "nama_lengkap", label: "Nama Lengkap" },
    { key: "no_handphone", label: "No HP" },
    { key: "email", label: "Email" },
    { key: "jenis_kelamin", label: "Jenis Kelamin" },
    { key: "domisili_saat_ini", label: "Domisili" },
    { key: "pendidikan_terakhir", label: "Pendidikan" },
    { key: "interview", label: "Interview" },
    { key: "done", label: "Done" },
    { key: "checked", label: "Checked" },
];

// Field link/upload yang perlu tombol external link
const LINK_FIELDS = [
    "upload_cv", "upload_form_caaf", "upload_form", "upload_portfolio",
    "upload_transkrip", "upload_transkrip_nilai", "download_dan_isi_form_caaf_di_bawah_ini",
    "link_portfolio", "personality_test",
];

// Field test
const getTestFields = (data) => {
    if (!data?.length) return [];
    const sample = data[0];
    return Object.keys(sample).filter(k => k.startsWith("test_") || k === "test");
};

const isValidUrl = (url) => {
    if (!url) return false;
    try { return ["http:", "https:"].includes(new URL(String(url)).protocol); }
    catch { return false; }
};

const isTruthy = (val) => val === true || String(val).toUpperCase() === "TRUE" || val === 1;

// ============================================
// Component
// ============================================

const HasilResponseTestKandidat = () => {
    const { colorMode } = useColorMode();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [selectedPosisi, setSelectedPosisi] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [selectedKandidat, setSelectedKandidat] = useState(null);

    const { data: rawData = [], isLoading, isError } = useQuery({
        queryKey: ["hasilInterview", selectedPosisi],
        queryFn: () => getHasilInterview(selectedPosisi),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: !!selectedPosisi,
    });

    const testFields = useMemo(() => getTestFields(rawData), [rawData]);

    const stats = useMemo(() => {
        const total = rawData.length;
        const sudahInterview = rawData.filter(i => isTruthy(i.interview)).length;
        const done = rawData.filter(i => isTruthy(i.done)).length;
        const checked = rawData.filter(i => isTruthy(i.checked)).length;
        return { total, sudahInterview, done, checked };
    }, [rawData]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return rawData;
        const lower = searchQuery.toLowerCase();
        return rawData.filter(i =>
            (i.nama_lengkap && String(i.nama_lengkap).toLowerCase().includes(lower)) ||
            (i.email && String(i.email).toLowerCase().includes(lower)) ||
            (i.no_handphone && String(i.no_handphone).toLowerCase().includes(lower))
        );
    }, [rawData, searchQuery]);

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

    const handleViewDetail = (item) => {
        setSelectedKandidat(item);
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

    const renderCell = (item, key) => {
        const val = item[key];
        if (key === "interview" || key === "done" || key === "checked") {
            return isTruthy(val) ? "✅" : "❌";
        }
        if (LINK_FIELDS.includes(key) && isValidUrl(val)) {
            return (
                <IconButton size="sm" variant="ghost" colorScheme="blue"
                    onClick={() => window.open(String(val), "_blank", "noopener,noreferrer")}>
                    <FiExternalLink />
                </IconButton>
            );
        }
        if (!val || val === "") return "-";
        const str = String(val);
        return str.length > 30 ? (
            <Tooltip label={str}><span>{str.substring(0, 30)}...</span></Tooltip>
        ) : str;
    };

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Hasil Test Kandidat</h1>
                    <Text className="subtitle">Data hasil test dan kandidat lanjut interview per posisi</Text>
                </Box>

                {/* Posisi Selector */}
                <Box mb={6}>
                    <Text fontWeight="medium" mb={2} fontSize="sm">Pilih Posisi</Text>
                    <Select
                        placeholder="-- Pilih posisi --"
                        value={selectedPosisi}
                        onChange={(e) => {
                            setSelectedPosisi(e.target.value);
                            setCurrentPage(1);
                            setSearchQuery("");
                        }}
                        maxW="300px"
                    >
                        {POSISI_OPTIONS.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </Select>
                </Box>

                {/* Stats — hanya muncul kalau posisi dipilih */}
                {selectedPosisi && (
                    <Box className="stats-grid" mb={6}>
                        <InfoCard>
                            <FiList size={28} />
                            <p>Total Kandidat</p>
                            {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                        </InfoCard>
                        <InfoCard>
                            <FiUsers size={28} />
                            <p>Lanjut Interview</p>
                            {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.sudahInterview}</p>}
                        </InfoCard>
                        <InfoCard>
                            <FiCheckCircle size={28} />
                            <p>Checked</p>
                            {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.checked}</p>}
                        </InfoCard>
                    </Box>
                )}

                {/* Empty state sebelum pilih posisi */}
                {!selectedPosisi && (
                    <Flex className="empty-state">
                        <FiUsers size={48} />
                        <Text>Pilih posisi untuk melihat data kandidat</Text>
                    </Flex>
                )}

                {/* Search */}
                {selectedPosisi && (
                    <Flex className="search-container" mb={4}>
                        <Box position="relative" width="100%" maxWidth="400px">
                            <Input
                                placeholder="Cari nama, email, atau no HP..."
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
                {selectedPosisi && (
                    <Box className="table-wrapper">
                        {isLoading ? (
                            <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                        ) : isError ? (
                            <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data</Text></Flex>
                        ) : sortedData.length === 0 ? (
                            <Flex className="empty-state">
                                <FiInbox size={48} />
                                <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data kandidat"}</Text>
                            </Flex>
                        ) : (
                            <>
                                <table>
                                    <thead>
                                        <tr>
                                            <th style={{ width: "50px" }}>No</th>
                                            <SortableHeader column="timestamp" label="Timestamp" minWidth="160px" />
                                            <SortableHeader column="nama_lengkap" label="Nama Lengkap" minWidth="180px" />
                                            <th style={{ minWidth: "130px" }}>No HP</th>
                                            <th style={{ minWidth: "180px" }}>Email</th>
                                            <SortableHeader column="jenis_kelamin" label="Jenis Kelamin" minWidth="110px" />
                                            <th style={{ minWidth: "130px" }}>Domisili</th>
                                            <th style={{ minWidth: "130px" }}>Pendidikan</th>
                                            {/* Test fields — dinamis */}
                                            {testFields.map(tf => (
                                                <th key={tf} style={{ minWidth: "100px", textAlign: "center" }}>
                                                    {tf.replace(/_/g, " ").toUpperCase()}
                                                </th>
                                            ))}
                                            <th style={{ width: "80px", textAlign: "center" }}>Interview</th>
                                            <th style={{ width: "70px", textAlign: "center" }}>Done</th>
                                            <th style={{ width: "80px", textAlign: "center" }}>Checked</th>
                                            <th style={{ width: "80px", position: "sticky", right: 0 }}>Detail</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map((item, index) => (
                                            <tr key={index}>
                                                <td>{startIndex + index + 1}</td>
                                                <td>{String(item.timestamp || "-")}</td>
                                                <td>{item.nama_lengkap || "-"}</td>
                                                <td>{item.no_handphone || "-"}</td>
                                                <td>{item.email || "-"}</td>
                                                <td>{item.jenis_kelamin || "-"}</td>
                                                <td>{item.domisili_saat_ini || item.domisili || "-"}</td>
                                                <td>{item.pendidikan_terakhir || "-"}</td>
                                                {testFields.map(tf => (
                                                    <td key={tf} style={{ textAlign: "center" }}>
                                                        {renderCell(item, tf)}
                                                    </td>
                                                ))}
                                                <td style={{ textAlign: "center" }}>{isTruthy(item.interview) ? "✅" : "❌"}</td>
                                                <td style={{ textAlign: "center" }}>{isTruthy(item.done) ? "✅" : "❌"}</td>
                                                <td style={{ textAlign: "center" }}>{isTruthy(item.checked) ? "✅" : "❌"}</td>
                                                <td style={{ position: "sticky", right: 0 }}>
                                                    <Button size="sm" variant="ghost" colorScheme="teal" onClick={() => handleViewDetail(item)}>
                                                        <FiUser />
                                                    </Button>
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
                )}

                {/* Detail Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>
                            Detail Kandidat — {selectedKandidat?.nama_lengkap}
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={6}>
                            {selectedKandidat && (
                                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                    {Object.entries(selectedKandidat).map(([key, val]) => {
                                        const isLink = LINK_FIELDS.includes(key) && isValidUrl(String(val));
                                        const isBool = ["interview", "done", "checked"].includes(key);
                                        return (
                                            <Box key={key} borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                                <Text fontSize="xs" color="gray.500" textTransform="uppercase" mb={1}>
                                                    {key.replace(/_/g, " ")}
                                                </Text>
                                                {isBool ? (
                                                    <Badge colorScheme={isTruthy(val) ? "green" : "red"}>
                                                        {isTruthy(val) ? "Ya" : "Tidak"}
                                                    </Badge>
                                                ) : isLink ? (
                                                    <Flex align="center" gap={2}>
                                                        <Text fontSize="sm" color="blue.400" noOfLines={1}>{String(val)}</Text>
                                                        <Box as="a" href={String(val)} target="_blank" rel="noopener noreferrer">
                                                            <FiExternalLink size={14} />
                                                        </Box>
                                                    </Flex>
                                                ) : (
                                                    <Text fontSize="sm" fontWeight="medium">
                                                        {val !== null && val !== undefined && val !== "" ? String(val) : "-"}
                                                    </Text>
                                                )}
                                            </Box>
                                        );
                                    })}
                                </Grid>
                            )}
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default HasilResponseTestKandidat;