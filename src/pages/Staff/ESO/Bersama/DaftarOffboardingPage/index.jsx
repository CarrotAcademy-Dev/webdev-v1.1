import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Box,
    Button,
    Checkbox,
    Flex,
    IconButton,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Stack,
    Text,
    Textarea,
    Tooltip,
    useColorMode,
    useDisclosure,
} from "@chakra-ui/react";
import { FiEdit2, FiSearch, FiInbox, FiChevronUp, FiChevronDown, FiList, FiCheckSquare, FiAward, FiFileText, FiFolder, FiCalendar, FiLink } from "react-icons/fi";
import ContainerCarrot from "../../../../../components/Container";
import InfoCard from "../../../../../components/InfoCard";
import { getDataDaftarOffboarding, ceklisDaftarOffboarding } from "../../../../../features/eso/esoApiService";
import usePagination from "../../../../../hooks/usePagination";
import Pagination from "../../../../../components/Pagination/";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { DaftarOffboardingStyled } from "./DaftarOffboarding.styled";
import { toaster } from "../../../../../components/ui/toaster";

const DaftarOffboardingPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [formData, setFormData] = useState({
        id_ticket: "",
        timestamp: "",
        pic: "",
        nama: "",
        keterangan: "",
        keterangan_detail: "",
        program: "",
        modul: "",
        level: "",
        sudah_proses_sertifikat: false,
        sudah_proses_monthly_report: false,
        sudah_proses_gdrive_dropbox: false,
        sudah_proses_birthday_reminder: false,
        sudah_uninvite_link: false,
    });

    // Fetch data
    const { data: offboardingData = [], isLoading, isError } = useQuery({
        queryKey: ["daftarOffboarding"],
        queryFn: getDataDaftarOffboarding,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ceklisDaftarOffboarding,
        onSuccess: () => {
            queryClient.invalidateQueries(["daftarOffboarding"]);
            toaster.create({
                title: "Berhasil update data",
                type: "success",
                duration: 3000,
            });
            onClose();
        },
        onError: (error) => {
            toaster.create({
                title: "Gagal update data",
                description: error.message,
                type: "error",
                duration: 3000,
            });
        },
    });

    // Summary stats from full dataset
    const isTruthy = (val) => val === true || val === "TRUE";
    const stats = useMemo(() => ({
        total: offboardingData.length,
        sertifikat: offboardingData.filter(i => isTruthy(i.eso_proses_sertifikat)).length,
        monthlyReport: offboardingData.filter(i => isTruthy(i.eso_monthly_report)).length,
        gdrive: offboardingData.filter(i => isTruthy(i.eso_gdrive_dropbox)).length,
        birthday: offboardingData.filter(i => isTruthy(i.eso_birthday_reminder)).length,
        uninvite: offboardingData.filter(i => isTruthy(i.eso_uninvite_link)).length,
        selesai: offboardingData.filter(i =>
            isTruthy(i.eso_proses_sertifikat) &&
            isTruthy(i.eso_monthly_report) &&
            isTruthy(i.eso_gdrive_dropbox) &&
            isTruthy(i.eso_birthday_reminder) &&
            isTruthy(i.eso_uninvite_link)
        ).length,
    }), [offboardingData]);

    // Search logic - filter by nama, program, modul
    const filteredData = useMemo(() => {
        if (!searchQuery) return offboardingData;

        return offboardingData.filter((item) => {
            const searchLower = searchQuery.toLowerCase();
            return (
                (item.nama && item.nama.toLowerCase().includes(searchLower)) ||
                (item.program && item.program.toLowerCase().includes(searchLower)) ||
                (item.modul && item.modul.toLowerCase().includes(searchLower))
            );
        });
    }, [offboardingData, searchQuery]);

    // Sort logic - sortable: id_offboarding, timestamp, nama, program, modul, level
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;

        const sorted = [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key] || "";
            const bValue = b[sortConfig.key] || "";

            if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [filteredData, sortConfig]);

    // Pagination - 20 items per page
    const { currentItems, currentPage, totalPages, goToPage, startIndex, endIndex, totalItems, setCurrentPage } =
        usePagination(sortedData, 20);

    // Sort handler
    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    // Open modal for edit
    const handleEdit = (item) => {
        setFormData({
            id_ticket: item.id_offboarding || "",
            timestamp: item.timestamp || "",
            pic: item.pic || "",
            nama: item.nama || "",
            keterangan: item.keterangan || "",
            keterangan_detail: item.keterangan_detail || "",
            program: item.program || "",
            modul: item.modul || "",
            level: item.level || "",
            sudah_proses_sertifikat: item.eso_proses_sertifikat === true || item.eso_proses_sertifikat === "TRUE",
            sudah_proses_monthly_report: item.eso_monthly_report === true || item.eso_monthly_report === "TRUE",
            sudah_proses_gdrive_dropbox: item.eso_gdrive_dropbox === true || item.eso_gdrive_dropbox === "TRUE",
            sudah_proses_birthday_reminder: item.eso_birthday_reminder === true || item.eso_birthday_reminder === "TRUE",
            sudah_uninvite_link: item.eso_uninvite_link === true || item.eso_uninvite_link === "TRUE",
        });
        onOpen();
    };

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // Handle submit
    const handleSubmit = () => {
        updateMutation.mutate(formData);
    };

    // Handle modal close
    const handleModalClose = () => {
        setFormData({
            id_ticket: "",
            timestamp: "",
            pic: "",
            nama: "",
            keterangan: "",
            keterangan_detail: "",
            program: "",
            modul: "",
            level: "",
            sudah_proses_sertifikat: false,
            sudah_proses_monthly_report: false,
            sudah_proses_gdrive_dropbox: false,
            sudah_proses_birthday_reminder: false,
            sudah_uninvite_link: false,
        });
        onClose();
    };

    // Render boolean as icon
    const renderBool = (val) => (val === true || val === "TRUE" ? "✅" : "❌");

    // Sortable column header helper
    const SortableHeader = ({ column, label, minWidth }) => (
        <th
            onClick={() => handleSort(column)}
            style={{ cursor: "pointer", userSelect: "none", minWidth: minWidth || "120px" }}
        >
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
            <DaftarOffboardingStyled colorMode={colorMode}>
                <Box className="header">
                    <h1>Daftar Offboarding</h1>
                    <Text className="subtitle">
                        Kelola data daftar offboarding siswa
                    </Text>
                </Box>

                {/* Summary Stats */}
                <Box className="stats-grid-offboarding" mb={6}>
                    <InfoCard>
                        <FiList size={28} />
                        <p>Total Data</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.total}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiCheckSquare size={28} />
                        <p>Selesai Semua</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.selesai}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiAward size={28} />
                        <p>Proses Sertifikat</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.sertifikat}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiFileText size={28} />
                        <p>Monthly Report</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.monthlyReport}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiFolder size={28} />
                        <p>GDrive/Dropbox</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.gdrive}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiCalendar size={28} />
                        <p>Birthday Reminder</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.birthday}</p>}
                    </InfoCard>
                    <InfoCard>
                        <FiLink size={28} />
                        <p>Uninvite Link</p>
                        {isLoading ? <Skeleton height="40px" width="60px" /> : <p className="card__points">{stats.uninvite}</p>}
                    </InfoCard>
                </Box>

                {/* Search Bar */}
                <Flex className="search-container" mb={4}>
                    <Box position="relative" width="100%" maxWidth="400px">
                        <Input
                            placeholder="Cari nama, program, atau modul..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            pl="40px"
                        />
                        <Box
                            position="absolute"
                            left="12px"
                            top="50%"
                            transform="translateY(-50%)"
                            pointerEvents="none"
                        >
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                </Flex>

                {/* Table */}
                <Box className="table-wrapper">
                    {isLoading ? (
                        <Box p={4}>
                            <Skeleton count={20} height={40} style={{ marginBottom: "8px" }} />
                        </Box>
                    ) : isError ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>Gagal memuat data. Silakan refresh halaman.</Text>
                        </Flex>
                    ) : sortedData.length === 0 ? (
                        <Flex className="empty-state">
                            <FiInbox size={48} />
                            <Text>
                                {searchQuery
                                    ? "Tidak ada data yang sesuai dengan pencarian"
                                    : "Belum ada data offboarding"}
                            </Text>
                        </Flex>
                    ) : (
                        <>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "60px" }}>No</th>
                                        <SortableHeader column="id_offboarding" label="ID" minWidth="100px" />
                                        <SortableHeader column="timestamp" label="Timestamp" minWidth="160px" />
                                        <th style={{ minWidth: "120px" }}>PIC</th>
                                        <SortableHeader column="nama" label="Nama" minWidth="180px" />
                                        <SortableHeader column="program" label="Program" minWidth="120px" />
                                        <SortableHeader column="modul" label="Modul" minWidth="100px" />
                                        <SortableHeader column="level" label="Level" minWidth="80px" />
                                        <th style={{ minWidth: "140px" }}>Keterangan</th>
                                        <th style={{ minWidth: "180px" }}>Keterangan Detail</th>
                                        <th style={{ width: "90px", textAlign: "center" }}>Sertifikat</th>
                                        <th style={{ width: "90px", textAlign: "center" }}>Monthly Report</th>
                                        <th style={{ width: "90px", textAlign: "center" }}>GDrive/Dropbox</th>
                                        <th style={{ width: "90px", textAlign: "center" }}>Birthday Reminder</th>
                                        <th style={{ width: "90px", textAlign: "center" }}>Uninvite Link</th>
                                        <th style={{ width: "100px", position: "sticky", right: 0 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.id_offboarding || index}>
                                            <td>{(currentPage - 1) * 20 + index + 1}</td>
                                            <td>{item.id_offboarding}</td>
                                            <td>{item.timestamp}</td>
                                            <td>{item.pic}</td>
                                            <td>{item.nama}</td>
                                            <td>{item.program}</td>
                                            <td>{item.modul}</td>
                                            <td>{item.level}</td>
                                            <td>
                                                {item.keterangan && item.keterangan.length > 25 ? (
                                                    <Tooltip label={item.keterangan}>
                                                        <span>{item.keterangan.substring(0, 25)}...</span>
                                                    </Tooltip>
                                                ) : (
                                                    item.keterangan
                                                )}
                                            </td>
                                            <td>
                                                {item.keterangan_detail && item.keterangan_detail.length > 30 ? (
                                                    <Tooltip label={item.keterangan_detail}>
                                                        <span>{item.keterangan_detail.substring(0, 30)}...</span>
                                                    </Tooltip>
                                                ) : (
                                                    item.keterangan_detail
                                                )}
                                            </td>
                                            <td style={{ textAlign: "center" }}>{renderBool(item.eso_proses_sertifikat)}</td>
                                            <td style={{ textAlign: "center" }}>{renderBool(item.eso_monthly_report)}</td>
                                            <td style={{ textAlign: "center" }}>{renderBool(item.eso_gdrive_dropbox)}</td>
                                            <td style={{ textAlign: "center" }}>{renderBool(item.eso_birthday_reminder)}</td>
                                            <td style={{ textAlign: "center" }}>{renderBool(item.eso_uninvite_link)}</td>
                                            <td style={{ position: "sticky", right: 0 }}>
                                                <IconButton
                                                    size="sm"
                                                    backgroundColor="teal.400"
                                                    variant="ghost"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    <FiEdit2 />
                                                </IconButton>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
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
                <Modal isOpen={isOpen} onClose={handleModalClose} size="xl">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Edit Daftar Offboarding</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                {/* ID Offboarding (read-only) */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>ID Offboarding</Text>
                                    <Input
                                        value={formData.id_ticket}
                                        isReadOnly
                                        bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                                    />
                                </Box>

                                {/* Timestamp (read-only) */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Timestamp</Text>
                                    <Input
                                        value={formData.timestamp}
                                        isReadOnly
                                        bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                                    />
                                </Box>

                                {/* PIC (read-only) */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>PIC</Text>
                                    <Input
                                        value={formData.pic}
                                        isReadOnly
                                        bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                                    />
                                </Box>

                                {/* Nama (read-only) */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Nama</Text>
                                    <Input
                                        value={formData.nama}
                                        isReadOnly
                                        bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                                    />
                                </Box>

                                {/* Keterangan (read-only) */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Keterangan</Text>
                                    <Input
                                        value={formData.keterangan}
                                        isReadOnly
                                        bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                                    />
                                </Box>

                                {/* Keterangan Detail (read-only, textarea) */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Keterangan Detail</Text>
                                    <Textarea
                                        value={formData.keterangan_detail}
                                        isReadOnly
                                        bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                                        rows={3}
                                    />
                                </Box>

                                {/* Program */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Program</Text>
                                    <Input
                                        name="program"
                                        value={formData.program}
                                        onChange={handleInputChange}
                                        placeholder="Masukkan program"
                                    />
                                </Box>

                                {/* Modul */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Modul</Text>
                                    <Input
                                        name="modul"
                                        value={formData.modul}
                                        onChange={handleInputChange}
                                        placeholder="Masukkan modul"
                                    />
                                </Box>

                                {/* Level */}
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Level</Text>
                                    <Input
                                        name="level"
                                        value={formData.level}
                                        onChange={handleInputChange}
                                        placeholder="Masukkan level"
                                    />
                                </Box>

                                {/* Checkboxes */}
                                <Box>
                                    <Text fontWeight="medium" mb={3}>Status Proses</Text>
                                    <Stack gap={3}>
                                        <Checkbox
                                            name="sudah_proses_sertifikat"
                                            isChecked={formData.sudah_proses_sertifikat}
                                            onChange={handleInputChange}
                                        >
                                            Sudah Proses Sertifikat
                                        </Checkbox>
                                        <Checkbox
                                            name="sudah_proses_monthly_report"
                                            isChecked={formData.sudah_proses_monthly_report}
                                            onChange={handleInputChange}
                                        >
                                            Sudah Proses Monthly Report
                                        </Checkbox>
                                        <Checkbox
                                            name="sudah_proses_gdrive_dropbox"
                                            isChecked={formData.sudah_proses_gdrive_dropbox}
                                            onChange={handleInputChange}
                                        >
                                            Sudah Proses GDrive/Dropbox
                                        </Checkbox>
                                        <Checkbox
                                            name="sudah_proses_birthday_reminder"
                                            isChecked={formData.sudah_proses_birthday_reminder}
                                            onChange={handleInputChange}
                                        >
                                            Sudah Proses Birthday Reminder
                                        </Checkbox>
                                        <Checkbox
                                            name="sudah_uninvite_link"
                                            isChecked={formData.sudah_uninvite_link}
                                            onChange={handleInputChange}
                                        >
                                            Sudah Uninvite Link
                                        </Checkbox>
                                    </Stack>
                                </Box>
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={handleModalClose}>
                                Batal
                            </Button>
                            <Button
                                colorScheme="teal"
                                onClick={handleSubmit}
                                isLoading={updateMutation.isPending}
                            >
                                Simpan
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </DaftarOffboardingStyled>
        </ContainerCarrot>
    );
};

export default DaftarOffboardingPage;
