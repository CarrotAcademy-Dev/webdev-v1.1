import ContainerCarrot from "@/components/Container";
import { searchProfilSiswaFinance, submitProfilSiswaFinance } from "@/features/finance/financeApiService";
import {
    Box, Button, Flex, Grid, Input, Select, Stack, Text,
    Textarea, useColorMode, useDisclosure,
    Modal, ModalBody, ModalCloseButton, ModalContent,
    ModalFooter, ModalHeader, ModalOverlay, Badge,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
    FiSearch, FiUser, FiBook, FiAward, FiEdit2,
    FiExternalLink, FiPhone, FiMail,
} from "react-icons/fi";
import { toaster } from "@/components/ui/toaster";
import { StyledProfileSiswa } from "./ProfileSiswa.styled";

// Field yang read-only (tidak bisa diedit)
const READONLY_FIELDS = [
    "timestamp", "psid", "nis", "link_form_lanjutan_studio",
    "age_when_join", "age_now", "bukti_pembayaran",
    "link_form_lanjutan_fulltime", "remove_link_predrawing", "jadwal_30day_terakhir",
];

const EMPTY_PROFIL = {
    timestamp: "", psid: "", nis: "", nama_lengkap: "", nama_panggilan: "",
    kota_kelahiran: "", tanggal_lahir: "", jenis_kelamin: "", nomor_hp: "",
    gmail: "", pekerjaan_pelajar: "", perusahaan_sekolah: "", nama_orangtua: "",
    nomor_hp_orangtua: "", email_orangtua: "", alamat: "", catatan_alamat: "",
    program: "", target_1: "", target_2: "", target_3: "", latest_artwork: "",
    url_portfolio: "", bukti_pembayaran: "", kelas: "", link_form_lanjutan_studio: "",
    photo: "", predrawing: "", link_form_lanjutan_fulltime: "", favourite_artist: "",
    art_interest: "", other_interest: "", like: "", dislike: "",
    catatan_cso_eso: "", catatan_mentor: "", remove_link_predrawing: "",
    status_aktif: "", status_kelas: "", jadwal_30day_terakhir: "",
    age_when_join: "", age_now: "", merch: "",
};

const isValidUrl = (url) => {
    if (!url) return false;
    try { return ["http:", "https:"].includes(new URL(url).protocol); }
    catch { return false; }
};

const ProfilSiswaPage = () => {
    const { colorMode } = useColorMode();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [searchInput, setSearchInput] = useState("");
    const [profilData, setProfilData] = useState(null);
    const [finishedCourse, setFinishedCourse] = useState([]);
    const [activeCourse, setActiveCourse] = useState([]);
    const [formData, setFormData] = useState(EMPTY_PROFIL);

    const searchMutation = useMutation({
        mutationFn: searchProfilSiswaFinance,
        onSuccess: (data) => {
            setProfilData(data.result);
            setFinishedCourse(data.finished_course);
            setActiveCourse(data.active_course);
            setFormData(data.result || EMPTY_PROFIL);
        },
        onError: (error) => {
            toaster.create({
                title: "Siswa tidak ditemukan",
                description: error?.message,
                type: "error",
                duration: 3000,
            });
            setProfilData(null);
            setFinishedCourse([]);
            setActiveCourse([]);
        },
    });

    const submitMutation = useMutation({
        mutationFn: submitProfilSiswaFinance,
        onSuccess: () => {
            toaster.create({ title: "Profil berhasil diupdate", type: "success", duration: 3000 });
            onClose();
            // Refetch
            searchMutation.mutate(searchInput);
        },
        onError: (error) => {
            toaster.create({
                title: "Gagal update profil",
                description: error?.message,
                type: "error",
                duration: 3000,
            });
        },
    });

    const handleSearch = () => {
        if (!searchInput.trim()) {
            toaster.create({ title: "Masukkan nama siswa", type: "warning", duration: 2000 });
            return;
        }
        searchMutation.mutate(searchInput.trim());
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenEdit = () => {
        setFormData(profilData || EMPTY_PROFIL);
        onOpen();
    };

    const handleSubmit = () => {
        submitMutation.mutate(formData);
    };

    const inputBg = colorMode === "dark" ? "gray.700" : "gray.100";
    const sectionBg = colorMode === "dark" ? "gray.800" : "white";
    const borderCol = colorMode === "dark" ? "gray.600" : "gray.200";

    const SectionCard = ({ title, icon, children }) => (
        <Box bg={sectionBg} border="1px solid" borderColor={borderCol} borderRadius="12px" overflow="hidden" mb={4}>
            <Flex align="center" gap={2} p={4} borderBottom="1px solid" borderColor={borderCol}>
                {icon}
                <Text fontWeight="bold" fontSize="md">{title}</Text>
            </Flex>
            <Box p={4}>{children}</Box>
        </Box>
    );

    const InfoRow = ({ label, value, isLink }) => (
        <Box mb={3}>
            <Text fontSize="xs" color="gray.500" mb={1}>{label}</Text>
            {isLink && isValidUrl(value) ? (
                <Flex align="center" gap={2}>
                    <Text fontSize="sm" fontWeight="medium" color="blue.400" noOfLines={1}>{value}</Text>
                    <Box as="a" href={value} target="_blank" rel="noopener noreferrer">
                        <FiExternalLink size={14} />
                    </Box>
                </Flex>
            ) : (
                <Text fontSize="sm" fontWeight="medium">{value || "-"}</Text>
            )}
        </Box>
    );

    const EditField = ({ label, name, value, isReadOnly, isTextarea, type = "text" }) => (
        <Box>
            <Text fontWeight="medium" mb={1} fontSize="sm">{label}</Text>
            {isTextarea ? (
                <Textarea
                    name={name}
                    value={value || ""}
                    onChange={handleInputChange}
                    isReadOnly={isReadOnly}
                    bg={isReadOnly ? inputBg : undefined}
                    rows={3}
                    fontSize="sm"
                />
            ) : (
                <Input
                    name={name}
                    type={type}
                    value={value || ""}
                    onChange={handleInputChange}
                    isReadOnly={isReadOnly}
                    bg={isReadOnly ? inputBg : undefined}
                    fontSize="sm"
                />
            )}
        </Box>
    );

    return (
        <ContainerCarrot>
            <StyledProfileSiswa colorMode={colorMode} data-theme={colorMode}>
                <Box className="header">
                    <h1>Profil Siswa</h1>
                    <Text className="subtitle">Cari dan kelola data profil siswa</Text>
                </Box>

                {/* Search Bar */}
                <Flex gap={3} mb={6} maxW="500px">
                    <Box position="relative" flex={1}>
                        <Input
                            placeholder="Cari nama lengkap siswa..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            pl="40px"
                        />
                        <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none">
                            <FiSearch size={18} />
                        </Box>
                    </Box>
                    <Button
                        colorScheme="teal"
                        onClick={handleSearch}
                        isLoading={searchMutation.isPending}
                        minW="90px"
                    >
                        Cari
                    </Button>
                </Flex>

                {/* Empty state */}
                {!profilData && !searchMutation.isPending && (
                    <Flex className="empty-state">
                        <FiUser size={48} />
                        <Text>Cari nama siswa untuk melihat profil</Text>
                    </Flex>
                )}

                {/* Profil Content */}
                {profilData && (
                    <>
                        {/* Header Profil */}
                        <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
                            <Box>
                                <Text fontSize="2xl" fontWeight="bold">{profilData.nama_lengkap}</Text>
                                <Flex gap={2} mt={1} wrap="wrap">
                                    <Badge colorScheme="teal">{profilData.program || "Program -"}</Badge>
                                    <Badge colorScheme={profilData.status_aktif === "Aktif" ? "green" : "red"}>
                                        {profilData.status_aktif || "-"}
                                    </Badge>
                                    <Badge colorScheme="blue">{profilData.status_kelas || "-"}</Badge>
                                </Flex>
                            </Box>
                            <Button
                                colorScheme="teal"
                                variant="outline"
                                onClick={handleOpenEdit}
                                size="sm"
                            >
                                <FiEdit2 style={{ marginRight: "6px" }} /> Edit Profil
                            </Button>
                        </Flex>

                        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={4}>
                            {/* Data Pribadi */}
                            <SectionCard title="Data Pribadi" icon={<FiUser size={18} />}>
                                <InfoRow label="NIS" value={profilData.nis} />
                                <InfoRow label="PSID" value={profilData.psid} />
                                <InfoRow label="Nama Panggilan" value={profilData.nama_panggilan} />
                                <InfoRow label="Tanggal Lahir" value={profilData.tanggal_lahir} />
                                <InfoRow label="Kota Kelahiran" value={profilData.kota_kelahiran} />
                                <InfoRow label="Jenis Kelamin" value={profilData.jenis_kelamin} />
                                <InfoRow label="Usia Masuk" value={profilData.age_when_join} />
                                <InfoRow label="Usia Sekarang" value={profilData.age_now} />
                            </SectionCard>

                            {/* Kontak */}
                            <SectionCard title="Kontak" icon={<FiPhone size={18} />}>
                                <InfoRow label="Nomor HP" value={profilData.nomor_hp} />
                                <InfoRow label="Gmail" value={profilData.gmail} />
                                <InfoRow label="Pekerjaan / Pelajar" value={profilData.pekerjaan_pelajar} />
                                <InfoRow label="Perusahaan / Sekolah" value={profilData.perusahaan_sekolah} />
                                <InfoRow label="Nama Orang Tua" value={profilData.nama_orangtua} />
                                <InfoRow label="No HP Orang Tua" value={profilData.nomor_hp_orangtua} />
                                <InfoRow label="Email Orang Tua" value={profilData.email_orangtua} />
                                <InfoRow label="Alamat" value={profilData.alamat} />
                                <InfoRow label="Catatan Alamat" value={profilData.catatan_alamat} />
                            </SectionCard>

                            {/* Info Kelas */}
                            <SectionCard title="Info Kelas" icon={<FiBook size={18} />}>
                                <InfoRow label="Program" value={profilData.program} />
                                <InfoRow label="Kelas" value={profilData.kelas} />
                                <InfoRow label="Merch" value={profilData.merch} />
                                <InfoRow label="Target 1" value={profilData.target_1} />
                                <InfoRow label="Target 2" value={profilData.target_2} />
                                <InfoRow label="Target 3" value={profilData.target_3} />
                                <InfoRow label="Favourite Artist" value={profilData.favourite_artist} />
                                <InfoRow label="Art Interest" value={profilData.art_interest} />
                                <InfoRow label="Other Interest" value={profilData.other_interest} />
                                <InfoRow label="Like" value={profilData.like} />
                                <InfoRow label="Dislike" value={profilData.dislike} />
                            </SectionCard>

                            {/* Links & Catatan */}
                            <SectionCard title="Links & Catatan" icon={<FiMail size={18} />}>
                                <InfoRow label="Latest Artwork" value={profilData.latest_artwork} isLink />
                                <InfoRow label="URL Portfolio" value={profilData.url_portfolio} isLink />
                                <InfoRow label="Photo" value={profilData.photo} isLink />
                                <InfoRow label="Predrawing" value={profilData.predrawing} isLink />
                                <InfoRow label="Catatan CSO/ESO" value={profilData.catatan_cso_eso} />
                                <InfoRow label="Catatan Mentor" value={profilData.catatan_mentor} />
                            </SectionCard>
                        </Grid>

                        {/* Active Course */}
                        {activeCourse.length > 0 && (
                            <SectionCard title="Kelas Aktif" icon={<FiBook size={18} />}>
                                <Box overflowX="auto">
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr style={{ background: colorMode === "dark" ? "#2d3748" : "#f7fafc" }}>
                                                {["Modul", "Level", "First Class", "Total Sesi", "Masterpiece"].map(h => (
                                                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "13px", fontWeight: 600, borderBottom: `2px solid ${borderCol}`, whiteSpace: "nowrap" }}>
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activeCourse.map((c, i) => (
                                                <tr key={i} style={{ borderBottom: `1px solid ${borderCol}` }}>
                                                    <td style={{ padding: "10px 14px", fontSize: "13px" }}>{c.modul}</td>
                                                    <td style={{ padding: "10px 14px", fontSize: "13px" }}>{c.level}</td>
                                                    <td style={{ padding: "10px 14px", fontSize: "13px" }}>{c.first_class}</td>
                                                    <td style={{ padding: "10px 14px", fontSize: "13px" }}>{c.sesi}</td>
                                                    <td style={{ padding: "10px 14px", fontSize: "13px" }}>{c.masterpice}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Box>
                            </SectionCard>
                        )}

                        {/* Finished Course */}
                        {finishedCourse.length > 0 && (
                            <SectionCard title="Kelas Selesai" icon={<FiAward size={18} />}>
                                <Box overflowX="auto">
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr style={{ background: colorMode === "dark" ? "#2d3748" : "#f7fafc" }}>
                                                {["Modul", "Level", "Periode Kelas", "Total Sesi", "Tgl Sertifikat"].map(h => (
                                                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "13px", fontWeight: 600, borderBottom: `2px solid ${borderCol}`, whiteSpace: "nowrap" }}>
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {finishedCourse.map((c, i) => (
                                                <tr key={i} style={{ borderBottom: `1px solid ${borderCol}` }}>
                                                    <td style={{ padding: "10px 14px", fontSize: "13px" }}>{c.modul}</td>
                                                    <td style={{ padding: "10px 14px", fontSize: "13px" }}>{c.level}</td>
                                                    <td style={{ padding: "10px 14px", fontSize: "13px" }}>{c.kelas}</td>
                                                    <td style={{ padding: "10px 14px", fontSize: "13px" }}>{c.sesi}</td>
                                                    <td style={{ padding: "10px 14px", fontSize: "13px" }}>
                                                        {c.tanggal_sertifikat ? (
                                                            <Badge colorScheme="green">{c.tanggal_sertifikat}</Badge>
                                                        ) : "-"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Box>
                            </SectionCard>
                        )}
                    </>
                )}

                {/* Edit Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Edit Profil — {formData.nama_lengkap}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack gap={4}>
                                {/* Read-only identifiers */}
                                <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase">
                                    Identitas (Read-only)
                                </Text>
                                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                    <EditField label="NIS" name="nis" value={formData.nis} isReadOnly />
                                    <EditField label="PSID" name="psid" value={formData.psid} isReadOnly />
                                    <EditField label="Nama Lengkap" name="nama_lengkap" value={formData.nama_lengkap} isReadOnly />
                                    <EditField label="Timestamp" name="timestamp" value={formData.timestamp} isReadOnly />
                                </Grid>

                                <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mt={2}>
                                    Data Pribadi
                                </Text>
                                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                    <EditField label="Nama Panggilan" name="nama_panggilan" value={formData.nama_panggilan} />
                                    <EditField label="Jenis Kelamin" name="jenis_kelamin" value={formData.jenis_kelamin} />
                                    <EditField label="Kota Kelahiran" name="kota_kelahiran" value={formData.kota_kelahiran} />
                                    <EditField label="Tanggal Lahir" name="tanggal_lahir" value={formData.tanggal_lahir} type="date" />
                                    <EditField label="Nomor HP" name="nomor_hp" value={formData.nomor_hp} />
                                    <EditField label="Gmail" name="gmail" value={formData.gmail} />
                                    <EditField label="Pekerjaan / Pelajar" name="pekerjaan_pelajar" value={formData.pekerjaan_pelajar} />
                                    <EditField label="Perusahaan / Sekolah" name="perusahaan_sekolah" value={formData.perusahaan_sekolah} />
                                </Grid>

                                <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mt={2}>
                                    Data Orang Tua
                                </Text>
                                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                    <EditField label="Nama Orang Tua" name="nama_orangtua" value={formData.nama_orangtua} />
                                    <EditField label="No HP Orang Tua" name="nomor_hp_orangtua" value={formData.nomor_hp_orangtua} />
                                    <EditField label="Email Orang Tua" name="email_orangtua" value={formData.email_orangtua} />
                                </Grid>
                                <EditField label="Alamat" name="alamat" value={formData.alamat} isTextarea />
                                <EditField label="Catatan Alamat" name="catatan_alamat" value={formData.catatan_alamat} />

                                <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mt={2}>
                                    Info Kelas & Program
                                </Text>
                                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                    <EditField label="Program" name="program" value={formData.program} />
                                    <EditField label="Kelas" name="kelas" value={formData.kelas} />
                                    <EditField label="Status Aktif" name="status_aktif" value={formData.status_aktif} />
                                    <EditField label="Status Kelas" name="status_kelas" value={formData.status_kelas} />
                                    <EditField label="Merch" name="merch" value={formData.merch} />
                                    <EditField label="Target 1" name="target_1" value={formData.target_1} />
                                    <EditField label="Target 2" name="target_2" value={formData.target_2} />
                                    <EditField label="Target 3" name="target_3" value={formData.target_3} />
                                    <EditField label="Favourite Artist" name="favourite_artist" value={formData.favourite_artist} />
                                    <EditField label="Art Interest" name="art_interest" value={formData.art_interest} />
                                    <EditField label="Other Interest" name="other_interest" value={formData.other_interest} />
                                    <EditField label="Like" name="like" value={formData.like} />
                                    <EditField label="Dislike" name="dislike" value={formData.dislike} />
                                </Grid>

                                <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mt={2}>
                                    Links
                                </Text>
                                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                    <EditField label="Latest Artwork" name="latest_artwork" value={formData.latest_artwork} />
                                    <EditField label="URL Portfolio" name="url_portfolio" value={formData.url_portfolio} />
                                    <EditField label="Photo" name="photo" value={formData.photo} />
                                    <EditField label="Predrawing" name="predrawing" value={formData.predrawing} />
                                </Grid>

                                <Text fontWeight="bold" fontSize="sm" color="gray.500" textTransform="uppercase" mt={2}>
                                    Catatan
                                </Text>
                                <EditField label="Catatan CSO/ESO" name="catatan_cso_eso" value={formData.catatan_cso_eso} isTextarea />
                                <EditField label="Catatan Mentor" name="catatan_mentor" value={formData.catatan_mentor} isTextarea />
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onClose}>Batal</Button>
                            <Button
                                colorScheme="teal"
                                onClick={handleSubmit}
                                isLoading={submitMutation.isPending}
                            >
                                Simpan
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </StyledProfileSiswa>
        </ContainerCarrot>
    );
};

export default ProfilSiswaPage;