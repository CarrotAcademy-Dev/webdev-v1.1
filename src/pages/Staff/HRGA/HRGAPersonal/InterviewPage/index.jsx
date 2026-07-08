/* eslint-disable react-hooks/exhaustive-deps */
import ContainerCarrot from "@/components/Container";
import { toaster } from "@/components/ui/toaster";
import { getInterview, getTugasInterviewKandidat, tambahTugasInterview } from "@/features/hr/hrgaPersonalApiService";
import usePagination from "@/hooks/usePagination";
import {
    Box, Button, Checkbox, Flex, IconButton, Input, Modal, ModalBody,
    ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Stack, Text, Tooltip, useColorMode, useDisclosure,
    Tabs, TabList, Tab, TabPanels, TabPanel,
    Skeleton,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    FiChevronDown, FiChevronUp, FiExternalLink, FiInbox,
    FiList, FiSearch, FiClock, FiCheckCircle, FiFileText,
} from "react-icons/fi";
import InfoCard from "@/components/InfoCard";
import Pagination from "@/components/Pagination";
import { StyledDashboardReport } from "../../HRRecruitmen/DashboardReport/DashboardReport.styled";

const isValidUrl = (url) => {
    if (!url) return false;
    try { return ["http:", "https:"].includes(new URL(String(url)).protocol); }
    catch { return false; }
};

const InterviewPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen: isTugasOpen, onOpen: onTugasOpen, onClose: onTugasClose } = useDisclosure();

    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    // State tugas interview
    const [tugasState, setTugasState] = useState({
        nama_kandidat: "",
        pic: "",
        fetched: false,           // sudah fetch tugas atau belum
        position: "",
        form_details: {},
        list_tugas: [],
        selected_ids: [],         // unique_id yang dicentang
        deadline_map: {},         // { unique_id: "YYYY-MM-DD" }
    });

    const { data, isLoading, isError } = useQuery({
        queryKey: ["interview"],
        queryFn: getInterview,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const upcoming = useMemo(() => data?.upcoming || [], [data]);
    const completed = useMemo(() => data?.completed || [], [data]);

    // Mutation: fetch tugas dari backend (GET tugas interview)
    const fetchTugasMutation = useMutation({
        mutationFn: ({ nama_kandidat, pic }) => getTugasInterviewKandidat(nama_kandidat, pic),
        onSuccess: (result) => {
            setTugasState(prev => ({
                ...prev,
                fetched: true,
                position: result?.position || "",
                form_details: result?.form_details || {},
                list_tugas: result?.list_tugas || [],
                selected_ids: [],
                deadline_map: {},
            }));
            if (!result?.list_tugas?.length) {
                toaster.create({ title: "Tidak ada tugas untuk posisi ini", type: "warning", duration: 3000 });
            }
        },
        onError: (error) => {
            toaster.create({ title: "Gagal mengambil tugas", description: error?.message, type: "error", duration: 3000 });
        },
    });

    // Mutation: simpan tugas interview ke backend
    const simpanTugasMutation = useMutation({
        mutationFn: tambahTugasInterview,
        onSuccess: (result) => {
            toaster.create({
                title: `Berhasil menyimpan ${result?.saved_count || 0} tugas`,
                type: "success",
                duration: 3000,
            });
            onTugasClose();
            queryClient.invalidateQueries({ queryKey: ["interview"] });
        },
        onError: (error) => {
            toaster.create({ title: "Gagal menyimpan tugas", description: error?.message, type: "error", duration: 3000 });
        },
    });

    const stats = useMemo(() => ({
        upcoming: upcoming.length,
        completed: completed.length,
        total: upcoming.length + completed.length,
    }), [upcoming, completed]);

    const filterAndSort = (arr) => {
        let result = arr;
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            result = result.filter(i =>
                (i.full_name && String(i.full_name).toLowerCase().includes(lower)) ||
                (i.position && String(i.position).toLowerCase().includes(lower)) ||
                (i.interviewer && String(i.interviewer).toLowerCase().includes(lower))
            );
        }
        if (sortConfig.key) {
            result = [...result].sort((a, b) => {
                const aVal = String(a[sortConfig.key] || "").toLowerCase();
                const bVal = String(b[sortConfig.key] || "").toLowerCase();
                if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }
        return result;
    };

    const filteredUpcoming = useMemo(() => filterAndSort(upcoming), [upcoming, searchQuery, sortConfig]);
    const filteredCompleted = useMemo(() => filterAndSort(completed), [completed, searchQuery, sortConfig]);

    const upcomingPagination = usePagination(filteredUpcoming, 20);
    const completedPagination = usePagination(filteredCompleted, 20);

    const handleSort = (key) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc" }));
    };

    // Buka modal tugas, reset state
    const handleOpenTugas = (item) => {
        setTugasState({
            nama_kandidat: item.full_name || "",
            pic: "",
            fetched: false,
            position: "",
            form_details: {},
            list_tugas: [],
            selected_ids: [],
            deadline_map: {},
        });
        onTugasOpen();
    };

    const handleFetchTugas = () => {
        if (!tugasState.pic.trim()) {
            toaster.create({ title: "Masukkan nama PIC terlebih dahulu", type: "warning", duration: 2000 });
            return;
        }
        fetchTugasMutation.mutate({
            nama_kandidat: tugasState.nama_kandidat,
            pic: tugasState.pic.trim(),
        });
    };

    const handleToggleTugas = (unique_id) => {
        setTugasState(prev => ({
            ...prev,
            selected_ids: prev.selected_ids.includes(unique_id)
                ? prev.selected_ids.filter(id => id !== unique_id)
                : [...prev.selected_ids, unique_id],
        }));
    };

    const handleDeadlineChange = (unique_id, value) => {
        setTugasState(prev => ({
            ...prev,
            deadline_map: { ...prev.deadline_map, [unique_id]: value },
        }));
    };

    const handleSimpanTugas = () => {
        if (tugasState.selected_ids.length === 0) {
            toaster.create({ title: "Pilih minimal satu tugas", type: "warning", duration: 2000 });
            return;
        }
        const tugas = tugasState.selected_ids.map(id => ({
            unique_id: id,
            deadline: tugasState.deadline_map[id] || "",
        }));
        simpanTugasMutation.mutate({
            nama_kandidat: tugasState.nama_kandidat,
            pic: tugasState.pic,
            tugas,
        });
    };

    const SortableHeader = ({ column, label, minWidth }) => (
        <th onClick={() => handleSort(column)} style={{ cursor: "pointer", userSelect: "none", minWidth: minWidth || "120px" }}>
            <Flex align="center" gap={1}>
                {label}
                {sortConfig.key === column && (sortConfig.direction === "asc" ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />)}
            </Flex>
        </th>
    );

    const TableRows = ({ items, isUpcoming, startIndex }) => (
        <>
            {items.map((item, index) => (
                <tr key={item.unique_id || index}>
                    <td>{startIndex + index + 1}</td>
                    <td>{item.full_name || "-"}</td>
                    <td>{item.email_adress || "-"}</td>
                    <td>{item.phone || "-"}</td>
                    <td>{item.position || "-"}</td>
                    <td>{String(item.interview_date || "-")}</td>
                    <td>{item.interview_time || "-"}</td>
                    <td style={{ textAlign: "center" }}>
                        {isValidUrl(item.interview_link) ? (
                            <IconButton size="sm" variant="ghost" colorScheme="blue"
                                onClick={() => window.open(String(item.interview_link), "_blank", "noopener,noreferrer")}>
                                <FiExternalLink />
                            </IconButton>
                        ) : "-"}
                    </td>
                    <td>{item.interviewer || "-"}</td>
                    <td>{item.interview_ke || "-"}</td>
                    {!isUpcoming && (
                        <td>
                            {item.review?.length > 30 ? (
                                <Tooltip label={item.review}><span>{item.review.substring(0, 30)}...</span></Tooltip>
                            ) : item.review || "-"}
                        </td>
                    )}
                    <td style={{ textAlign: "center" }}>
                        {isValidUrl(item.link_penilaian) ? (
                            <IconButton size="sm" variant="ghost" colorScheme="blue"
                                onClick={() => window.open(String(item.link_penilaian), "_blank", "noopener,noreferrer")}>
                                <FiExternalLink />
                            </IconButton>
                        ) : "-"}
                    </td>
                    {isUpcoming && (
                        <td style={{ position: "sticky", right: 0 }}>
                            <Button size="sm" colorScheme="teal" variant="outline" onClick={() => handleOpenTugas(item)}>
                                <FiFileText style={{ marginRight: "4px" }} /> Tugas
                            </Button>
                        </td>
                    )}
                </tr>
            ))}
        </>
    );

    const InterviewTable = ({ pagination, isUpcoming }) => {
        const { currentItems, currentPage, totalPages, goToPage, startIndex, endIndex, totalItems } = pagination;
        return (
            <Box className="table-wrapper">
                {currentItems.length === 0 ? (
                    <Flex className="empty-state">
                        <FiInbox size={48} />
                        <Text>{searchQuery ? "Tidak ada hasil pencarian" : "Tidak ada data"}</Text>
                    </Flex>
                ) : (
                    <>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: "50px" }}>No</th>
                                    <SortableHeader column="full_name" label="Nama Lengkap" minWidth="160px" />
                                    <th style={{ minWidth: "170px" }}>Email</th>
                                    <th style={{ minWidth: "130px" }}>Phone</th>
                                    <SortableHeader column="position" label="Posisi" minWidth="140px" />
                                    <th style={{ minWidth: "120px" }}>Tgl Interview</th>
                                    <th style={{ minWidth: "100px" }}>Waktu</th>
                                    <th style={{ minWidth: "100px", textAlign: "center" }}>Link</th>
                                    <SortableHeader column="interviewer" label="Interviewer" minWidth="140px" />
                                    <th style={{ minWidth: "100px" }}>Interview Ke</th>
                                    {!isUpcoming && <th style={{ minWidth: "180px" }}>Review</th>}
                                    <th style={{ minWidth: "100px", textAlign: "center" }}>Penilaian</th>
                                    {isUpcoming && <th style={{ width: "110px", position: "sticky", right: 0 }}>Action</th>}
                                </tr>
                            </thead>
                            <tbody>
                                <TableRows items={currentItems} isUpcoming={isUpcoming} startIndex={startIndex} />
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
        );
    };

    const cardBg = colorMode === "dark" ? "gray.800" : "white";
    const borderCol = colorMode === "dark" ? "gray.600" : "gray.200";

    return (
        <ContainerCarrot>
            <StyledDashboardReport colorMode={colorMode}>
                <Box className="header">
                    <h1>Interview</h1>
                    <Text className="subtitle">Kelola jadwal interview kandidat dan tugas interview</Text>
                </Box>

                <Box className="stats-grid" mb={6}>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Total Interview</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiClock size={28} />
                        <p>Upcoming</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.upcoming}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiCheckCircle size={28} />
                        <p>Completed</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.completed}</p>}
                    </InfoCard>
                </Box>

                <Flex className="search-container" mb={4}>
                    <Box position="relative" width="100%" maxWidth="400px">
                        <Input
                            placeholder="Cari nama, posisi, interviewer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                </Flex>

                {isLoading ? (
                    <Box p={4}><Skeleton count={10} height={40} style={{ marginBottom: "8px" }} /></Box>
                ) : isError ? (
                    <Flex className="empty-state"><FiInbox size={48} /><Text>Gagal memuat data interview</Text></Flex>
                ) : (
                    <Tabs colorScheme="teal">
                        <TabList mb={4}>
                            <Tab fontWeight="600">Upcoming ({stats.upcoming})</Tab>
                            <Tab fontWeight="600">Completed ({stats.completed})</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel px={0}>
                                <InterviewTable pagination={upcomingPagination} isUpcoming />
                            </TabPanel>
                            <TabPanel px={0}>
                                <InterviewTable pagination={completedPagination} isUpcoming={false} />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                )}

                {/* ============ Tugas Interview Modal ============ */}
                <Modal isOpen={isTugasOpen} onClose={onTugasClose} size="xl" scrollBehavior="inside">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Tugas Interview — {tugasState.nama_kandidat}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>

                                {/* Step 1: Input PIC + Ambil Tugas */}
                                <Box bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="10px" p={4}>
                                    <Text fontWeight="bold" fontSize="sm" mb={3} color="gray.500" textTransform="uppercase">
                                        Step 1 — Input PIC & Ambil Data Tugas
                                    </Text>
                                    <Flex gap={2}>
                                        <Input
                                            placeholder="Nama PIC (kode nama, contoh: AS)"
                                            value={tugasState.pic}
                                            onChange={(e) => setTugasState(prev => ({ ...prev, pic: e.target.value }))}
                                            size="sm"
                                        />
                                        <Button
                                            size="sm"
                                            colorScheme="teal"
                                            onClick={handleFetchTugas}
                                            isLoading={fetchTugasMutation.isPending}
                                            minW="110px"
                                        >
                                            Ambil Tugas
                                        </Button>
                                    </Flex>
                                </Box>

                                {/* Hasil fetch — info kandidat */}
                                {tugasState.fetched && (
                                    <>
                                        <Box p={3} borderRadius="md" bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                                            border="1px solid" borderColor={borderCol}>
                                            <Text fontSize="sm" fontWeight="bold">{tugasState.nama_kandidat}</Text>
                                            <Text fontSize="xs" color="gray.500">Posisi: {tugasState.position || "Tidak ditemukan"}</Text>

                                            {/* Form details (link form, dll) */}
                                            {Object.entries(tugasState.form_details).filter(([, v]) => v).map(([key, val]) => (
                                                <Flex key={key} align="center" gap={1} mt={1}>
                                                    <Text fontSize="xs" color="gray.500">{key}:</Text>
                                                    {isValidUrl(String(val)) ? (
                                                        <Text as="a" href={String(val)} target="_blank" rel="noopener noreferrer"
                                                            fontSize="xs" color="blue.400">
                                                            {String(val).substring(0, 40)}...
                                                        </Text>
                                                    ) : (
                                                        <Text fontSize="xs">{String(val)}</Text>
                                                    )}
                                                </Flex>
                                            ))}
                                        </Box>

                                        {/* Step 2: Pilih tugas + set deadline */}
                                        {tugasState.list_tugas.length > 0 ? (
                                            <Box>
                                                <Text fontWeight="bold" fontSize="sm" mb={3} color="gray.500" textTransform="uppercase">
                                                    Step 2 — Pilih Tugas & Set Deadline
                                                </Text>
                                                <Stack gap={3}>
                                                    {tugasState.list_tugas.map((tugas) => {
                                                        const isSelected = tugasState.selected_ids.includes(tugas.unique_id);
                                                        return (
                                                            <Box
                                                                key={tugas.unique_id}
                                                                p={3}
                                                                borderRadius="md"
                                                                border="2px solid"
                                                                borderColor={isSelected ? "teal.400" : (colorMode === "dark" ? "gray.600" : "gray.200")}
                                                                bg={isSelected ? (colorMode === "dark" ? "teal.900" : "teal.50") : "transparent"}
                                                                transition="all 0.15s"
                                                            >
                                                                <Flex align="flex-start" gap={3}>
                                                                    <Checkbox
                                                                        isChecked={isSelected}
                                                                        onChange={() => handleToggleTugas(tugas.unique_id)}
                                                                        colorScheme="teal"
                                                                        mt="2px"
                                                                    />
                                                                    <Box flex={1}>
                                                                        <Text fontSize="sm" fontWeight="medium">{tugas.tugas}</Text>
                                                                        {tugas.tipe && (
                                                                            <Text fontSize="xs" color="gray.400">Tipe: {tugas.tipe}</Text>
                                                                        )}
                                                                        {tugas.deskripsi && (
                                                                            <Text fontSize="xs" color="gray.500" mt={0.5}>{tugas.deskripsi}</Text>
                                                                        )}
                                                                        {/* Deadline input muncul hanya jika dicentang */}
                                                                        {isSelected && (
                                                                            <Box mt={2}>
                                                                                <Text fontSize="xs" mb={1} color="gray.500">Deadline:</Text>
                                                                                <Input
                                                                                    type="date"
                                                                                    size="sm"
                                                                                    maxW="180px"
                                                                                    value={tugasState.deadline_map[tugas.unique_id] || ""}
                                                                                    onChange={(e) => handleDeadlineChange(tugas.unique_id, e.target.value)}
                                                                                />
                                                                            </Box>
                                                                        )}
                                                                    </Box>
                                                                </Flex>
                                                            </Box>
                                                        );
                                                    })}
                                                </Stack>

                                                {tugasState.selected_ids.length > 0 && (
                                                    <Box mt={3} p={3} borderRadius="md"
                                                        bg={colorMode === "dark" ? "teal.900" : "teal.50"}
                                                        border="1px solid" borderColor="teal.400">
                                                        <Text fontSize="xs" color={colorMode === "dark" ? "teal.200" : "teal.700"}>
                                                            ✅ {tugasState.selected_ids.length} tugas dipilih — siap disimpan
                                                        </Text>
                                                    </Box>
                                                )}
                                            </Box>
                                        ) : (
                                            <Flex className="empty-state" py={6}>
                                                <FiInbox size={36} />
                                                <Text fontSize="sm" color="gray.500">
                                                    Tidak ada tugas tersedia untuk posisi "{tugasState.position || "-"}"
                                                </Text>
                                            </Flex>
                                        )}
                                    </>
                                )}
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onTugasClose}>Batal</Button>
                            <Button
                                colorScheme="teal"
                                onClick={handleSimpanTugas}
                                isLoading={simpanTugasMutation.isPending}
                                isDisabled={!tugasState.fetched || tugasState.selected_ids.length === 0}
                            >
                                Simpan {tugasState.selected_ids.length > 0 ? `(${tugasState.selected_ids.length})` : ""} Tugas
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </StyledDashboardReport>
        </ContainerCarrot>
    );
};

export default InterviewPage;