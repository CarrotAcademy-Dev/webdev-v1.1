import ContainerCarrot from "@/components/Container";
import { getApplicantData, editApplicantData } from "@/features/hr/hrApiService";
import {
    Box, Button, Flex, Grid, IconButton, Input, Modal, ModalBody,
    ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Select, Stack, Text, Textarea, Tooltip, useColorMode, useDisclosure, Badge,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiEdit2, FiExternalLink,
    FiInbox, FiList, FiSearch, FiUser, FiUserCheck, FiUsers,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import usePagination from "@/hooks/usePagination";
import { toaster } from "@/components/ui/toaster";
import { StyledDashboardReport } from "../DashboardReport/DashboardReport.styled";

// ============================================
// Constants
// ============================================

const STATUS_FINAL_OPTIONS = ["", "Lolos", "Tidak Lolos", "On Hold", "Withdraw"];
const STATUS_OFFERING_OPTIONS = ["", "Pending", "Accepted", "Rejected"];
const STATUS_ONBOARDING_OPTIONS = ["", "Belum", "Sudah", "Batal"];

const STATUS_COLORS = {
    "Lolos": "green", "Accepted": "green", "Sudah": "green",
    "Tidak Lolos": "red", "Rejected": "red", "Batal": "red",
    "On Hold": "orange", "Pending": "orange", "Belum": "gray",
    "Withdraw": "gray",
};

const LINK_FIELDS = ["link_test", "interview_link_1", "interview_link_2", "interview_link_3", "pdf_penilaian"];

const isValidUrl = (url) => {
    if (!url) return false;
    try { return ["http:", "https:"].includes(new URL(String(url)).protocol); }
    catch { return false; }
};

const EMPTY_EDIT_FORM = {
    name: "", position: "",
    status_follow_up: "", status_final: "", status_offering: "",
    status_salary: "", status_onboarding: "", status_interview_2: "", status_interview_3: "",
    interview_date_1: "", interview_time_1: "", interview_link_1: "", interviewer_1: "",
    interview_date_2: "", interview_time_2: "", interview_link_2: "", interviewer_2: "",
    interview_date_3: "", interview_time_3: "", interview_link_3: "", interviewer_3: "",
    review_1: "", review_2: "", review_3: "",
    offering_date: "", offering_time: "", pic: "",
    onboarding_date: "", jam_kehadiran: "", jam_masuk: "", jam_keluar: "", shift: "",
    notes: "", review_test_mengajar: "", contact_emergency: "",
    pdf_penilaian: "", done: "",
};

// ============================================
// Component
// ============================================

const ApplicantDataPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterPosition, setFilterPosition] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
    const [selectedApplicant, setSelectedApplicant] = useState(null);

    const { data: applicantData = [], isLoading, isError } = useQuery({
        queryKey: ["applicantData"],
        queryFn: getApplicantData,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const editMutation = useMutation({
        mutationFn: editApplicantData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applicantData"] });
            toaster.create({ title: "Berhasil update data", type: "success", duration: 3000 });
            onEditClose();
        },
        onError: (error) => {
            toaster.create({ title: "Gagal update data", description: error?.message, type: "error", duration: 3000 });
        },
    });

    // Stats
    const stats = useMemo(() => {
        const total = applicantData.length;
        const lolos = applicantData.filter(i => i.status_final === "Lolos").length;
        const onboarding = applicantData.filter(i => i.status_onboarding === "Sudah").length;
        const positions = new Set(applicantData.map(i => i.position).filter(Boolean)).size;
        return { total, lolos, onboarding, positions };
    }, [applicantData]);

    // Available positions for filter
    const availablePositions = useMemo(() => {
        return [...new Set(applicantData.map(i => i.position).filter(Boolean))].sort();
    }, [applicantData]);

    // Filter + search + sort
    const filteredData = useMemo(() => {
        let data = applicantData;
        if (filterPosition !== "all") data = data.filter(i => i.position === filterPosition);
        if (filterStatus !== "all") data = data.filter(i => i.status_final === filterStatus);
        if (!searchQuery) return data;
        const lower = searchQuery.toLowerCase();
        return data.filter(i =>
            (i.name && String(i.name).toLowerCase().includes(lower)) ||
            (i.full_name && String(i.full_name).toLowerCase().includes(lower)) ||
            (i.email_address && String(i.email_address).toLowerCase().includes(lower)) ||
            (i.position && String(i.position).toLowerCase().includes(lower))
        );
    }, [applicantData, searchQuery, filterPosition, filterStatus]);

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

    const handleOpenEdit = (item) => {
        setEditForm({
            name: item.name || "",
            position: item.position || "",
            status_follow_up: item.status_follow_up || "",
            status_final: item.status_final || "",
            status_offering: item.status_offering || "",
            status_salary: item.status_salary || "",
            status_onboarding: item.status_onboarding || "",
            status_interview_2: item.status_interview_2 || "",
            status_interview_3: item.status_interview_3 || "",
            interview_date_1: item.interview_date_1 || "",
            interview_time_1: item.interview_time_1 || "",
            interview_link_1: item.interview_link_1 || "",
            interviewer_1: item.interviewer_1 || "",
            interview_date_2: item.interview_date_2 || "",
            interview_time_2: item.interview_time_2 || "",
            interview_link_2: item.interview_link_2 || "",
            interviewer_2: item.interviewer_2 || "",
            interview_date_3: item.interview_date_3 || "",
            interview_time_3: item.interview_time_3 || "",
            interview_link_3: item.interview_link_3 || "",
            interviewer_3: item.interviewer_3 || "",
            review_1: item.review_1 || "",
            review_2: item.review_2 || "",
            review_3: item.review_3 || "",
            offering_date: item.offering_date || "",
            offering_time: item.offering_time || "",
            pic: item.pic || "",
            onboarding_date: item.onboarding_date || "",
            jam_kehadiran: item.jam_kehadiran || "",
            jam_masuk: item.jam_masuk || "",
            jam_keluar: item.jam_keluar || "",
            shift: item.shift || "",
            notes: item.notes || "",
            review_test_mengajar: item.review_test_mengajar || "",
            contact_emergency: item.contact_emergency || "",
            pdf_penilaian: item.pdf_penilaian || "",
            done: item.done || "",
        });
        onEditOpen();
    };

    const handleOpenDetail = (item) => {
        setSelectedApplicant(item);
        onDetailOpen();
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = () => {
        if (!editForm.name || !editForm.position) {
            toaster.create({ title: "Nama dan posisi wajib ada", type: "warning", duration: 2000 });
            return;
        }
        editMutation.mutate(editForm);
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

    const StatusBadge = ({ value }) => {
        if (!value) return <span>-</span>;
        return <Badge colorScheme={STATUS_COLORS[value] || "gray"}>{value}</Badge>;
    };

    const SelectField = ({ label, name, value, options }) => (
        <Box>
            <Text fontWeight="medium" mb={2} fontSize="sm">{label}</Text>
            <Select name={name} value={value} onChange={handleEditChange} size="sm">
                {options.map(o => <option key={o} value={o}>{o || "- Pilih -"}</option>)}
            </Select>
        </Box>
    );

    const InputField = ({ label, name, value, type = "text" }) => (
        <Box>
            <Text fontWeight="medium" mb={2} fontSize="sm">{label}</Text>
            <Input name={name} value={value} onChange={handleEditChange} type={type} size="sm" />
        </Box>
    );

    const TextareaField = ({ label, name, value }) => (
        <Box>
            <Text fontWeight="medium" mb={2} fontSize="sm">{label}</Text>
            <Textarea name={name} value={value} onChange={handleEditChange} rows={3} size="sm" />
        </Box>
    );

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Applicant Data</h1>
                    <Text className="subtitle">Data lengkap kandidat dari screening hingga onboarding</Text>
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
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.positions}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiUserCheck size={28} />
                        <p>Lolos Final</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.lolos}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiUser size={28} />
                        <p>Sudah Onboarding</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.onboarding}</p>}
                    </InfoCard>
                </Box>

                {/* Search + Filter */}
                <Flex className="search-container" mb={4} gap={3} wrap="wrap" align="center">
                    <Box position="relative" width="100%" maxWidth="360px">
                        <Input
                            placeholder="Cari nama, email, posisi..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                    <Select maxW="200px" value={filterPosition} onChange={(e) => { setFilterPosition(e.target.value); setCurrentPage(1); }}>
                        <option value="all">Semua Posisi</option>
                        {availablePositions.map(p => <option key={p} value={p}>{p}</option>)}
                    </Select>
                    <Select maxW="180px" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
                        <option value="all">Semua Status</option>
                        {STATUS_FINAL_OPTIONS.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
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
                            <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data applicant"}</Text>
                        </Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>No</th>
                                        <SortableHeader column="date" label="Tanggal" minWidth="120px" />
                                        <SortableHeader column="name" label="Nama" minWidth="160px" />
                                        <SortableHeader column="position" label="Posisi" minWidth="150px" />
                                        <th style={{ minWidth: "160px" }}>Email</th>
                                        <th style={{ minWidth: "130px" }}>No HP</th>
                                        <SortableHeader column="status_follow_up" label="Follow Up" minWidth="120px" />
                                        <SortableHeader column="status_final" label="Status Final" minWidth="120px" />
                                        <SortableHeader column="status_offering" label="Offering" minWidth="120px" />
                                        <SortableHeader column="status_onboarding" label="Onboarding" minWidth="120px" />
                                        <th style={{ minWidth: "120px" }}>Onboarding Date</th>
                                        <th style={{ minWidth: "100px" }}>Link Test</th>
                                        <th style={{ minWidth: "100px" }}>PDF Penilaian</th>
                                        <th style={{ width: "100px", position: "sticky", right: 0 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.unique_id || index}>
                                            <td>{startIndex + index + 1}</td>
                                            <td>{String(item.date || "-")}</td>
                                            <td>{item.name || "-"}</td>
                                            <td>{item.position || "-"}</td>
                                            <td>
                                                {item.email_address?.length > 25 ? (
                                                    <Tooltip label={item.email_address}>
                                                        <span>{item.email_address.substring(0, 25)}...</span>
                                                    </Tooltip>
                                                ) : item.email_address || "-"}
                                            </td>
                                            <td>{item.phone || "-"}</td>
                                            <td><StatusBadge value={item.status_follow_up} /></td>
                                            <td><StatusBadge value={item.status_final} /></td>
                                            <td><StatusBadge value={item.status_offering} /></td>
                                            <td><StatusBadge value={item.status_onboarding} /></td>
                                            <td>{String(item.onboarding_date || "-")}</td>
                                            <td>
                                                {isValidUrl(item.link_test) ? (
                                                    <IconButton size="sm" variant="ghost" colorScheme="blue"
                                                        onClick={() => window.open(String(item.link_test), "_blank", "noopener,noreferrer")}>
                                                        <FiExternalLink />
                                                    </IconButton>
                                                ) : "-"}
                                            </td>
                                            <td>
                                                {isValidUrl(item.pdf_penilaian) ? (
                                                    <IconButton size="sm" variant="ghost" colorScheme="blue"
                                                        onClick={() => window.open(String(item.pdf_penilaian), "_blank", "noopener,noreferrer")}>
                                                        <FiExternalLink />
                                                    </IconButton>
                                                ) : "-"}
                                            </td>
                                            <td style={{ position: "sticky", right: 0 }}>
                                                <Flex gap={1}>
                                                    <IconButton size="sm" variant="ghost" colorScheme="teal"
                                                        onClick={() => handleOpenDetail(item)}>
                                                        <FiUser />
                                                    </IconButton>
                                                    <IconButton size="sm" backgroundColor="teal.400" variant="ghost"
                                                        onClick={() => handleOpenEdit(item)}>
                                                        <FiEdit2 />
                                                    </IconButton>
                                                </Flex>
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

                {/* Edit Modal */}
                <Modal isOpen={isEditOpen} onClose={onEditClose} size="4xl" scrollBehavior="inside">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Edit Applicant — {editForm.name}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={5}>
                                {/* Identitas — read only display */}
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>
                                        Identitas (Read-only)
                                    </Text>
                                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                                        <Box>
                                            <Text fontSize="xs" color="gray.500">Nama</Text>
                                            <Text fontWeight="medium">{editForm.name}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="xs" color="gray.500">Posisi</Text>
                                            <Text fontWeight="medium">{editForm.position}</Text>
                                        </Box>
                                    </Grid>
                                </Box>

                                {/* Status */}
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>Status</Text>
                                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={3}>
                                        <InputField label="Status Follow Up" name="status_follow_up" value={editForm.status_follow_up} />
                                        <SelectField label="Status Final" name="status_final" value={editForm.status_final} options={STATUS_FINAL_OPTIONS} />
                                        <SelectField label="Status Offering" name="status_offering" value={editForm.status_offering} options={STATUS_OFFERING_OPTIONS} />
                                        <InputField label="Status Salary" name="status_salary" value={editForm.status_salary} />
                                        <SelectField label="Status Onboarding" name="status_onboarding" value={editForm.status_onboarding} options={STATUS_ONBOARDING_OPTIONS} />
                                        <InputField label="Done" name="done" value={editForm.done} />
                                    </Grid>
                                </Box>

                                {/* Interview 1 */}
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>Interview 1</Text>
                                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                                        <InputField label="Tanggal Interview 1" name="interview_date_1" value={editForm.interview_date_1} />
                                        <InputField label="Waktu Interview 1" name="interview_time_1" value={editForm.interview_time_1} />
                                        <InputField label="Link Interview 1" name="interview_link_1" value={editForm.interview_link_1} />
                                        <InputField label="Interviewer 1" name="interviewer_1" value={editForm.interviewer_1} />
                                    </Grid>
                                    <Box mt={3}><TextareaField label="Review 1" name="review_1" value={editForm.review_1} /></Box>
                                </Box>

                                {/* Interview 2 */}
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>Interview 2</Text>
                                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                                        <InputField label="Tanggal Interview 2" name="interview_date_2" value={editForm.interview_date_2} />
                                        <InputField label="Waktu Interview 2" name="interview_time_2" value={editForm.interview_time_2} />
                                        <InputField label="Link Interview 2" name="interview_link_2" value={editForm.interview_link_2} />
                                        <InputField label="Interviewer 2" name="interviewer_2" value={editForm.interviewer_2} />
                                        <InputField label="Status Interview 2" name="status_interview_2" value={editForm.status_interview_2} />
                                    </Grid>
                                    <Box mt={3}><TextareaField label="Review 2" name="review_2" value={editForm.review_2} /></Box>
                                </Box>

                                {/* Interview 3 */}
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>Interview 3</Text>
                                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                                        <InputField label="Tanggal Interview 3" name="interview_date_3" value={editForm.interview_date_3} />
                                        <InputField label="Waktu Interview 3" name="interview_time_3" value={editForm.interview_time_3} />
                                        <InputField label="Link Interview 3" name="interview_link_3" value={editForm.interview_link_3} />
                                        <InputField label="Interviewer 3" name="interviewer_3" value={editForm.interviewer_3} />
                                        <InputField label="Status Interview 3" name="status_interview_3" value={editForm.status_interview_3} />
                                    </Grid>
                                    <Box mt={3}><TextareaField label="Review 3" name="review_3" value={editForm.review_3} /></Box>
                                </Box>

                                {/* Offering & Onboarding */}
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>Offering & Onboarding</Text>
                                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                                        <InputField label="Offering Date" name="offering_date" value={editForm.offering_date} />
                                        <InputField label="Offering Time" name="offering_time" value={editForm.offering_time} />
                                        <InputField label="PIC" name="pic" value={editForm.pic} />
                                        <InputField label="Onboarding Date" name="onboarding_date" value={editForm.onboarding_date} />
                                        <InputField label="Jam Kehadiran" name="jam_kehadiran" value={editForm.jam_kehadiran} />
                                        <InputField label="Jam Masuk" name="jam_masuk" value={editForm.jam_masuk} type="time" />
                                        <InputField label="Jam Keluar" name="jam_keluar" value={editForm.jam_keluar} type="time" />
                                        <InputField label="Shift" name="shift" value={editForm.shift} />
                                    </Grid>
                                </Box>

                                {/* Lainnya */}
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mb={3}>Lainnya</Text>
                                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                                        <InputField label="PDF Penilaian" name="pdf_penilaian" value={editForm.pdf_penilaian} />
                                        <InputField label="Contact Emergency" name="contact_emergency" value={editForm.contact_emergency} />
                                    </Grid>
                                    <Box mt={3}><TextareaField label="Review Test Mengajar" name="review_test_mengajar" value={editForm.review_test_mengajar} /></Box>
                                    <Box mt={3}><TextareaField label="Notes" name="notes" value={editForm.notes} /></Box>
                                </Box>
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onEditClose}>Batal</Button>
                            <Button colorScheme="teal" onClick={handleEditSubmit} isLoading={editMutation.isPending}>
                                Simpan
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Detail Modal */}
                <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="2xl" scrollBehavior="inside">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Detail — {selectedApplicant?.name}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={6}>
                            {selectedApplicant && (
                                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                    {Object.entries(selectedApplicant).map(([key, val]) => {
                                        const isLink = LINK_FIELDS.includes(key) && isValidUrl(String(val));
                                        const isStatus = key.startsWith("status_");
                                        return (
                                            <Box key={key} borderBottom="1px solid" borderColor="gray.100" pb={2}>
                                                <Text fontSize="xs" color="gray.500" textTransform="uppercase" mb={1}>
                                                    {key.replace(/_/g, " ")}
                                                </Text>
                                                {isStatus ? (
                                                    <Badge colorScheme={STATUS_COLORS[String(val)] || "gray"}>
                                                        {val || "-"}
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

export default ApplicantDataPage;