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
    useDisclosure
} from "@chakra-ui/react";
import { FiEdit2, FiExternalLink, FiSearch, FiInbox } from "react-icons/fi";
import ContainerCarrot from "../../../../../components/Container";
import { getDataAotm, updateDataAotm } from "../../../../../features/eso/esoApiService";
import usePagination from "../../../../../hooks/usePagination";
import Pagination from "../../../../../components/Pagination/";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ArtworkOfTheMonthStyled } from "./ArtworkOfTheMonth.styled";
import { toaster } from "../../../../../components/ui/toaster";

const ArtworkOfTheMonthPage = () => {
    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [searchQuery, setSearchQuery] = useState("");
    const [formData, setFormData] = useState({
        nomor: "",
        nama: "",
        modul: "",
        level: "",
        deskripsi: "",
        artwork_validation: false,
        foto_validation: false,
        predrawing_validation: false,
        tanggal_edit: "",
        tanggal_print: "",
        tanggal_tempel: "",
        link_dropbox: "",
        notes: "",
        link_design: "",
    });

    // Fetch data
    const { data: aotmData = [], isLoading, isError } = useQuery({
        queryKey: ["aotm-data"],
        queryFn: getDataAotm,
        staleTime: 1000 * 60 * 5,
    });

    // Filter data based on search query
    const filteredData = useMemo(() => {
        if (!searchQuery) return aotmData;

        const query = searchQuery.toLowerCase();
        return aotmData.filter(
            (item) =>
                item.nama?.toLowerCase().includes(query) ||
                item.modul?.toLowerCase().includes(query) ||
                item.level?.toLowerCase().includes(query) ||
                item.nomor?.toString().includes(query)
        );
    }, [aotmData, searchQuery]);

    // Pagination
    const { currentItems, currentPage, totalPages, goToPage, startIndex, endIndex, totalItems } =
        usePagination(filteredData, 10);

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: updateDataAotm,
        onSuccess: (result) => {
            if (result.status === "success") {
                toaster.create({
                    title: "Data berhasil diupdate",
                    description: result.message,
                    type: "success",
                    duration: 3000,
                });
                queryClient.invalidateQueries({ queryKey: ["aotm-data"] });
                onClose();
            } else {
                toaster.create({
                    title: "Update gagal",
                    description: result.message,
                    type: "error",
                    duration: 5000,
                });
            }
        },
        onError: (error) => {
            toaster.create({
                title: "Terjadi kesalahan",
                description: error.message || "Gagal update data",
                type: "error",
                duration: 5000,
            });
        },
    });

    // Helper to convert string to boolean
    const stringToBoolean = (value) => {
        if (typeof value === "boolean") return value;
        return value === "v" || value === "V" || value === "TRUE" || value === "true";
    };

    // Helper to convert boolean to validation string
    const booleanToValidation = (value) => {
        return value ? "v" : "";
    };

    // Helper to convert date from backend format ("22 Jan 2021") to HTML date input format ("2021-01-22")
    const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        try {
            // Parse "22 Jan 2021" format
            const months = {
                Jan: "01", Feb: "02", Mar: "03", Apr: "04",
                May: "05", Jun: "06", Jul: "07", Aug: "08",
                Sep: "09", Oct: "10", Nov: "11", Dec: "12"
            };
            const parts = dateString.split(" ");
            if (parts.length === 3) {
                const day = parts[0].padStart(2, "0");
                const month = months[parts[1]];
                const year = parts[2];
                if (month) {
                    return `${year}-${month}-${day}`;
                }
            }
            return "";
        } catch {
            return "";
        }
    };

    // Helper to convert date from HTML input format ("2021-01-22") to backend format ("22 Jan 2021")
    const formatDateForBackend = (dateString) => {
        if (!dateString) return "";
        try {
            const months = [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];
            const date = new Date(dateString);
            const day = date.getDate();
            const month = months[date.getMonth()];
            const year = date.getFullYear();
            return `${day} ${month} ${year}`;
        } catch {
            return "";
        }
    };

    // Open edit modal
    const handleEdit = (item) => {
        setFormData({
            nomor: item.nomor || "",
            nama: item.nama || "",
            modul: item.modul || "",
            level: item.level || "",
            deskripsi: item.deskripsi || "",
            artwork_validation: stringToBoolean(item.artwork_validation),
            foto_validation: stringToBoolean(item.foto_validation),
            predrawing_validation: stringToBoolean(item.predrawing_validation),
            tanggal_edit: formatDateForInput(item.tanggal_edit),
            tanggal_print: formatDateForInput(item.tanggal_print),
            tanggal_tempel: formatDateForInput(item.tanggal_tempel),
            link_dropbox: item.link_dropbox || "",
            notes: item.notes || "",
            link_design: item.link_design || "",
        });
        onOpen();
    };

    // Handle input changes
    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Handle form submit
    const handleSubmit = () => {
        // Convert boolean values to validation string for API
        const dataToSubmit = {
            ...formData,
            artwork_validation: booleanToValidation(formData.artwork_validation),
            foto_validation: booleanToValidation(formData.foto_validation),
            predrawing_validation: booleanToValidation(formData.predrawing_validation),
            tanggal_edit: formatDateForBackend(formData.tanggal_edit),
            tanggal_print: formatDateForBackend(formData.tanggal_print),
            tanggal_tempel: formatDateForBackend(formData.tanggal_tempel),
        };

        updateMutation.mutate(dataToSubmit);
    };

    // Validate URL
    const isValidUrl = (urlString) => {
        if (!urlString) return false;
        try {
            const url = new URL(urlString);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch {
            return false;
        }
    };

    // Render skeleton loading
    const renderSkeleton = () => (
        <Box className="table-scroll-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Nama</th>
                        <th>Modul</th>
                        <th>Level</th>
                        <th>Deskripsi</th>
                        <th>Artwork ✓</th>
                        <th>Foto ✓</th>
                        <th>Predrawing ✓</th>
                        <th>Tgl Edit</th>
                        <th>Tgl Print</th>
                        <th>Tgl Tempel</th>
                        <th>Link Dropbox</th>
                        <th>Notes</th>
                        <th>Link Design</th>
                        <th className="sticky-col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {[...Array(5)].map((_, index) => (
                        <tr key={index}>
                            <td><Skeleton /></td>
                            <td><Skeleton /></td>
                            <td><Skeleton /></td>
                            <td><Skeleton /></td>
                            <td><Skeleton /></td>
                            <td><Skeleton /></td>
                            <td><Skeleton /></td>
                            <td><Skeleton /></td>
                            <td><Skeleton /></td>
                            <td><Skeleton /></td>
                            <td><Skeleton /></td>
                            <td><Skeleton /></td>
                            <td><Skeleton /></td>
                            <td><Skeleton /></td>
                            <td className="sticky-col"><Skeleton /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Box>
    );

    if (isError) {
        return (
            <ContainerCarrot>
                <ArtworkOfTheMonthStyled data-theme={colorMode}>
                    <Box className="error-container">
                        <Text color="red.500" fontSize="lg">
                            ❌ Gagal memuat data. Silakan coba lagi.
                        </Text>
                    </Box>
                </ArtworkOfTheMonthStyled>
            </ContainerCarrot>
        );
    }

    return (
        <ContainerCarrot>
            <ArtworkOfTheMonthStyled data-theme={colorMode}>
                <Box className="header">
                    <Box>
                        <Text className="title">Artwork of The Month</Text>
                        <Text className="subtitle">
                            Kelola data artwork bulanan siswa dengan validasi dan tracking progress
                        </Text>
                    </Box>
                </Box>

                {/* Search Bar */}
                <Box className="search-container">
                    <Box position="relative" width={{ base: "100%", md: "400px" }}>
                        <Input
                            placeholder="Cari berdasarkan nama, modul, level, atau nomor..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            paddingLeft="40px"
                            size="lg"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)">
                            <FiSearch size={20} />
                        </Box>
                    </Box>
                </Box>

                {/* Table */}
                {isLoading ? (
                    renderSkeleton()
                ) : filteredData.length === 0 ? (
                    <Box className="empty-state">
                        <FiInbox size={64} />
                        <Text fontSize="xl" marginTop="16px">
                            {searchQuery ? "Tidak ada data yang sesuai dengan pencarian" : "Belum ada data available"}
                        </Text>
                    </Box>
                ) : (
                    <>
                        <Box className="table-scroll-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Nama</th>
                                        <th>Modul</th>
                                        <th>Level</th>
                                        <th>Deskripsi</th>
                                        <th>Artwork ✓</th>
                                        <th>Foto ✓</th>
                                        <th>Predrawing ✓</th>
                                        <th>Tgl Edit</th>
                                        <th>Tgl Print</th>
                                        <th>Tgl Tempel</th>
                                        <th>Link Dropbox</th>
                                        <th>Notes</th>
                                        <th>Link Design</th>
                                        <th className="sticky-col">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={item.nomor || index}>
                                            <td>{item.nomor || "-"}</td>
                                            <td>{item.nama || "-"}</td>
                                            <td>{item.modul || "-"}</td>
                                            <td>{item.level || "-"}</td>
                                            <td>
                                                <Tooltip content={item.deskripsi || "-"}>
                                                    <Text noOfLines={2} maxW="200px">
                                                        {item.deskripsi || "-"}
                                                    </Text>
                                                </Tooltip>
                                            </td>
                                            <td>
                                                <Checkbox
                                                    isChecked={stringToBoolean(item.artwork_validation)}
                                                    isReadOnly
                                                    colorScheme="orange"
                                                    pointerEvents="none"
                                                />
                                            </td>
                                            <td>
                                                <Checkbox
                                                    isChecked={stringToBoolean(item.foto_validation)}
                                                    isReadOnly
                                                    colorScheme="orange"
                                                    pointerEvents="none"
                                                />
                                            </td>
                                            <td>
                                                <Checkbox
                                                    isChecked={stringToBoolean(item.predrawing_validation)}
                                                    isReadOnly
                                                    colorScheme="orange"
                                                    pointerEvents="none"
                                                />
                                            </td>
                                            <td>{item.tanggal_edit || "-"}</td>
                                            <td>{item.tanggal_print || "-"}</td>
                                            <td>{item.tanggal_tempel || "-"}</td>
                                            <td>
                                                {isValidUrl(item.link_dropbox) ? (
                                                    <IconButton
                                                        as="a"
                                                        href={item.link_dropbox}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        size="sm"
                                                        bg="blue.500"
                                                        color="white"
                                                        _hover={{ 
                                                            bg: "blue.600", 
                                                            transform: "translateY(-2px)", 
                                                            boxShadow: "lg" 
                                                        }}
                                                        _active={{ 
                                                            bg: "blue.700", 
                                                            transform: "translateY(0)" 
                                                        }}
                                                        aria-label="Open Dropbox Link"
                                                    >
                                                        <FiExternalLink />
                                                    </IconButton>
                                                ) : (
                                                    <Text fontSize="sm" color="gray.500">
                                                        No link
                                                    </Text>
                                                )}
                                            </td>
                                            <td>
                                                <Tooltip content={item.notes || "-"}>
                                                    <Text noOfLines={2} maxW="150px">
                                                        {item.notes || "-"}
                                                    </Text>
                                                </Tooltip>
                                            </td>
                                            <td>
                                                {isValidUrl(item.link_design) ? (
                                                    <IconButton
                                                        as="a"
                                                        href={item.link_design}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        size="sm"
                                                        bg="blue.500"
                                                        color="white"
                                                        _hover={{ 
                                                            bg: "blue.600", 
                                                            transform: "translateY(-2px)", 
                                                            boxShadow: "lg" 
                                                        }}
                                                        _active={{ 
                                                            bg: "blue.700", 
                                                            transform: "translateY(0)" 
                                                        }}
                                                        aria-label="Open Design Link"
                                                    >
                                                        <FiExternalLink />
                                                    </IconButton>
                                                ) : (
                                                    <Text fontSize="sm" color="gray.500">
                                                        No link
                                                    </Text>
                                                )}
                                            </td>
                                            <td className="sticky-col">
                                                <Button
                                                    size="sm"
                                                    leftIcon={<FiEdit2 />}
                                                    onClick={() => handleEdit(item)}
                                                    bg="teal.500"
                                                    color="white"
                                                    _hover={{
                                                        bg: "teal.600",
                                                        transform: "translateY(-2px)",
                                                        boxShadow: "lg",
                                                    }}
                                                    _active={{
                                                        bg: "teal.700",
                                                        transform: "translateY(0)",
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Box>

                        {/* Pagination */}
                        <Box className="pagination-container">
                            <Text className="pagination-info">
                                Menampilkan {startIndex + 1} - {Math.min(endIndex, totalItems)} dari {totalItems} data
                            </Text>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={goToPage}
                            />
                        </Box>
                    </>
                )}

                {/* Edit Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="xl">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>✏️ Edit Data Artwork of The Month</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                {/* Read-only Fields */}
                                <Box>
                                    <Text fontWeight="semibold" mb={1}>
                                        Nomor
                                    </Text>
                                    <Input value={formData.nomor} isReadOnly bg="gray.100" />
                                </Box>

                                <Box>
                                    <Text fontWeight="semibold" mb={1}>
                                        Nama
                                    </Text>
                                    <Input value={formData.nama} isReadOnly bg="gray.100" />
                                </Box>

                                <Box>
                                    <Text fontWeight="semibold" mb={1}>
                                        Modul
                                    </Text>
                                    <Input value={formData.modul} isReadOnly bg="gray.100" />
                                </Box>

                                <Box>
                                    <Text fontWeight="semibold" mb={1}>
                                        Level
                                    </Text>
                                    <Input value={formData.level} isReadOnly bg="gray.100" />
                                </Box>

                                {/* Editable Fields */}
                                <Box>
                                    <Text fontWeight="semibold" mb={1}>
                                        Deskripsi
                                    </Text>
                                    <Textarea
                                        value={formData.deskripsi}
                                        onChange={(e) => handleInputChange("deskripsi", e.target.value)}
                                        placeholder="Masukkan deskripsi artwork..."
                                        rows={3}
                                    />
                                </Box>

                                <Flex gap={4} flexWrap="wrap">
                                    <Box>
                                        <Checkbox
                                            isChecked={formData.artwork_validation}
                                            onChange={(e) =>
                                                handleInputChange("artwork_validation", e.target.checked)
                                            }
                                            colorScheme="green"
                                        >
                                            <Text fontWeight="semibold">Artwork Validated</Text>
                                        </Checkbox>
                                    </Box>

                                    <Box>
                                        <Checkbox
                                            isChecked={formData.foto_validation}
                                            onChange={(e) =>
                                                handleInputChange("foto_validation", e.target.checked)
                                            }
                                            colorScheme="green"
                                        >
                                            <Text fontWeight="semibold">Foto Validated</Text>
                                        </Checkbox>
                                    </Box>

                                    <Box>
                                        <Checkbox
                                            isChecked={formData.predrawing_validation}
                                            onChange={(e) =>
                                                handleInputChange("predrawing_validation", e.target.checked)
                                            }
                                            colorScheme="green"
                                        >
                                            <Text fontWeight="semibold">Predrawing Validated</Text>
                                        </Checkbox>
                                    </Box>
                                </Flex>

                                <Box>
                                    <Text fontWeight="semibold" mb={1}>
                                        Tanggal Edit
                                    </Text>
                                    <Input
                                        type="date"
                                        value={formData.tanggal_edit}
                                        onChange={(e) => handleInputChange("tanggal_edit", e.target.value)}
                                    />
                                </Box>

                                <Box>
                                    <Text fontWeight="semibold" mb={1}>
                                        Tanggal Print
                                    </Text>
                                    <Input
                                        type="date"
                                        value={formData.tanggal_print}
                                        onChange={(e) => handleInputChange("tanggal_print", e.target.value)}
                                    />
                                </Box>

                                <Box>
                                    <Text fontWeight="semibold" mb={1}>
                                        Tanggal Tempel
                                    </Text>
                                    <Input
                                        type="date"
                                        value={formData.tanggal_tempel}
                                        onChange={(e) => handleInputChange("tanggal_tempel", e.target.value)}
                                    />
                                </Box>

                                <Box>
                                    <Text fontWeight="semibold" mb={1}>
                                        Link Dropbox
                                    </Text>
                                    <Input
                                        value={formData.link_dropbox}
                                        onChange={(e) => handleInputChange("link_dropbox", e.target.value)}
                                        placeholder="https://..."
                                    />
                                </Box>

                                <Box>
                                    <Text fontWeight="semibold" mb={1}>
                                        Notes
                                    </Text>
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange("notes", e.target.value)}
                                        placeholder="Catatan tambahan..."
                                        rows={3}
                                    />
                                </Box>

                                <Box>
                                    <Text fontWeight="semibold" mb={1}>
                                        Link Design
                                    </Text>
                                    <Input
                                        value={formData.link_design}
                                        onChange={(e) => handleInputChange("link_design", e.target.value)}
                                        placeholder="https://..."
                                    />
                                </Box>
                            </Stack>
                        </ModalBody>

                        <ModalFooter gap={3}>
                            <Button variant="outline" onClick={onClose}>
                                Batal
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                isLoading={updateMutation.isPending}
                                _hover={{
                                    bg: "orange.600",
                                    transform: "translateY(-2px)",
                                    boxShadow: "lg",
                                }}
                                _active={{
                                    bg: "orange.700",
                                    transform: "translateY(0)",
                                }}
                            >
                                💾 Update Data
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </ArtworkOfTheMonthStyled>
        </ContainerCarrot>
    );
};

export default ArtworkOfTheMonthPage;
