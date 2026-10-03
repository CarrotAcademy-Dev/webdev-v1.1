/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Badge,
  useToast,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Skeleton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Tooltip
} from '@chakra-ui/react';
import { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProspektif,
  getProspektifStaging,
  tambahProspektif,
  editProspektif,
  deleteProspektif,
  sendProspektifToCso
} from '@/features/marcom/marcomApiService';
import ContainerCarrot from '@/components/Container';
import InfoCard from '@/components/InfoCard';
import Pagination from '@/components/Pagination';
import useDebounce from '@/hooks/useDebounce';
import { StyledProspektifMarcomPage } from './ProspektifMarcomPage.styled';
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSend,
  FiUsers,
  FiCalendar,
  FiShare2,
  FiLayers,
  FiPhone,
  FiInfo
} from 'react-icons/fi';

const MEDIA_OPTIONS = ['Instagram', 'TikTok', 'WhatsApp', 'Website', 'Event', 'Walk-in', 'Referral', 'Lainnya'];

const initialFormData = {
  nama: '',
  nomor_hp: '',
  first_contact: new Date().toISOString().split('T')[0],
  media: 'Instagram',
  program_yang_tertarik: '',
  referral: '',
  keterangan: ''
};

export default function ProspektifMarcomPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [filterMedia, setFilterMedia] = useState('ALL');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [selectedItem, setSelectedItem] = useState(null);
  const cancelRef = useRef();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Active Tab: 0 = DB Utama, 1 = Staging
  const [tabIndex, setTabIndex] = useState(0);

  // Queries
  const { data: mainData = [], isLoading: isLoadingMain } = useQuery({
    queryKey: ['marcomProspektif'],
    queryFn: getProspektif,
    staleTime: 3 * 60 * 1000
  });

  const { data: stagingData = [], isLoading: isLoadingStaging } = useQuery({
    queryKey: ['marcomProspektifStaging'],
    queryFn: getProspektifStaging,
    staleTime: 3 * 60 * 1000
  });

  // Mutations
  const addMutation = useMutation({
    mutationFn: tambahProspektif,
    onSuccess: (res) => {
      toast({
        title: 'Berhasil',
        description: res.message || 'Data prospektif berhasil ditambahkan',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      setIsAddOpen(false);
      setFormData(initialFormData);
      queryClient.invalidateQueries({ queryKey: ['marcomProspektif'] });
    },
    onError: (err) => {
      toast({
        title: 'Gagal',
        description: err.message || 'Gagal menambahkan data',
        status: 'error',
        duration: 4000,
        isClosable: true
      });
    }
  });

  const editMutation = useMutation({
    mutationFn: editProspektif,
    onSuccess: (res) => {
      toast({
        title: 'Berhasil',
        description: res.message || 'Data prospektif berhasil diupdate',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      setIsEditOpen(false);
      setSelectedItem(null);
      queryClient.invalidateQueries({ queryKey: ['marcomProspektif'] });
    },
    onError: (err) => {
      toast({
        title: 'Gagal',
        description: err.message || 'Gagal mengubah data',
        status: 'error',
        duration: 4000,
        isClosable: true
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProspektif,
    onSuccess: (res) => {
      toast({
        title: 'Terhapus',
        description: res.message || 'Data berhasil dihapus',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      setIsDeleteOpen(false);
      setSelectedItem(null);
      queryClient.invalidateQueries({ queryKey: ['marcomProspektif'] });
    },
    onError: (err) => {
      toast({
        title: 'Gagal',
        description: err.message || 'Gagal menghapus data',
        status: 'error',
        duration: 4000,
        isClosable: true
      });
    }
  });

  const sendToCsoMutation = useMutation({
    mutationFn: sendProspektifToCso,
    onSuccess: (res) => {
      toast({
        title: 'Berhasil Dikirim',
        description: `${res.jumlah || 0} data staging berhasil dikirim ke CSO!`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      queryClient.invalidateQueries({ queryKey: ['marcomProspektif'] });
      queryClient.invalidateQueries({ queryKey: ['marcomProspektifStaging'] });
    },
    onError: (err) => {
      toast({
        title: 'Gagal Mengirim',
        description: err.message || 'Gagal mengirim data ke CSO',
        status: 'error',
        duration: 4000,
        isClosable: true
      });
    }
  });

  // Current active data set
  const activeDataset = tabIndex === 0 ? mainData : stagingData;
  const isLoading = tabIndex === 0 ? isLoadingMain : isLoadingStaging;

  // Filtered data
  const filteredData = useMemo(() => {
    return activeDataset.filter((item) => {
      const matchSearch =
        (item.nama && item.nama.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (item.nomor_hp && String(item.nomor_hp).toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (item.program_yang_tertarik &&
          item.program_yang_tertarik.toLowerCase().includes(debouncedSearch.toLowerCase()));

      const matchMedia =
        filterMedia === 'ALL' ||
        (item.media && item.media.toLowerCase() === filterMedia.toLowerCase());

      return matchSearch && matchMedia;
    });
  }, [activeDataset, debouncedSearch, filterMedia]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  // Statistics
  const todayStr = new Date().toISOString().split('T')[0];
  const totalToday = useMemo(() => {
    return mainData.filter((i) => i.timestamp && String(i.timestamp).startsWith(todayStr)).length;
  }, [mainData, todayStr]);

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      row: item.row,
      nama: item.nama || '',
      nomor_hp: item.nomor_hp || '',
      first_contact: item.first_contact || '',
      media: item.media || 'Instagram',
      program_yang_tertarik: item.program_yang_tertarik || '',
      referral: item.referral || '',
      keterangan: item.keterangan || ''
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleSaveAdd = () => {
    if (!formData.nama || !formData.nomor_hp) {
      toast({
        title: 'Validasi Gagal',
        description: 'Nama dan Nomor HP wajib diisi',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    addMutation.mutate(formData);
  };

  const handleSaveEdit = () => {
    if (!formData.nama || !formData.nomor_hp) {
      toast({
        title: 'Validasi Gagal',
        description: 'Nama dan Nomor HP wajib diisi',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    editMutation.mutate(formData);
  };

  return (
    <ContainerCarrot>
      <StyledProspektifMarcomPage>
        <div className="page-header">
          <h1>Prospektif Marcom</h1>
          <p>Kelola data prospektif, leads marketing, dan sinkronisasi ke CSO</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <InfoCard>
            <FiUsers size={28} color="#FE7743" />
            <div>
              <p>Total Prospektif</p>
              <h3>{mainData.length}</h3>
            </div>
          </InfoCard>

          <InfoCard>
            <FiCalendar size={28} color="#3182CE" />
            <div>
              <p>Masuk Hari Ini</p>
              <h3>{totalToday}</h3>
            </div>
          </InfoCard>

          <InfoCard>
            <FiLayers size={28} color="#805AD5" />
            <div>
              <p>Data Staging</p>
              <h3>{stagingData.length}</h3>
            </div>
          </InfoCard>
        </div>

        {/* Tabs & Controls */}
        <Box bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor} mb={4}>
          <Tabs
            variant="soft-rounded"
            colorScheme="orange"
            onChange={(idx) => {
              setTabIndex(idx);
              setCurrentPage(1);
            }}
          >
            <Flex justify="space-between" align="center" wrap="wrap" gap={3} mb={3}>
              <TabList>
                <Tab fontSize="sm">Database Utama CSO ({mainData.length})</Tab>
                <Tab fontSize="sm">Staging Marcom ({stagingData.length})</Tab>
              </TabList>

              <Flex gap={2}>
                {tabIndex === 1 && stagingData.length > 0 && (
                  <Button
                    leftIcon={<FiSend />}
                    colorScheme="blue"
                    size="sm"
                    onClick={() => sendToCsoMutation.mutate()}
                    isLoading={sendToCsoMutation.isPending}
                  >
                    Kirim ke CSO
                  </Button>
                )}
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="orange"
                  size="sm"
                  onClick={() => {
                    setFormData(initialFormData);
                    setIsAddOpen(true);
                  }}
                >
                  Tambah Prospektif
                </Button>
              </Flex>
            </Flex>

            <TabPanels>
              <TabPanel p={0} />
              <TabPanel p={0} />
            </TabPanels>
          </Tabs>

          {/* Search & Filter Controls */}
          <div className="controls-row">
            <InputGroup maxW={{ base: '100%', md: '320px' }}>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray" />
              </InputLeftElement>
              <Input
                placeholder="Cari nama, HP, program..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                size="sm"
                borderRadius="md"
              />
            </InputGroup>

            <Flex gap={2} align="center">
              <Text fontSize="sm" color={textColor} whiteSpace="nowrap">
                Media:
              </Text>
              <Select
                size="sm"
                value={filterMedia}
                onChange={(e) => {
                  setFilterMedia(e.target.value);
                  setCurrentPage(1);
                }}
                w="160px"
                borderRadius="md"
              >
                <option value="ALL">Semua Media</option>
                {MEDIA_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </Flex>
          </div>

          {/* Table */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>No</th>
                  <th>Timestamp</th>
                  <th>Nama Lengkap</th>
                  <th>Nomor HP</th>
                  <th>First Contact</th>
                  <th>Media</th>
                  <th>Program Minat</th>
                  <th>Referral</th>
                  <th>Keterangan</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx}>
                      <td colSpan={10}>
                        <Skeleton height="35px" />
                      </td>
                    </tr>
                  ))
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '2rem' }}>
                      <Text color={textColor}>Tidak ada data prospektif ditemukan</Text>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, idx) => (
                    <tr key={item.row || idx}>
                      <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td>
                        <Text fontSize="xs" color={textColor}>
                          {item.timestamp || '-'}
                        </Text>
                      </td>
                      <td>
                        <Text fontWeight="600">{item.nama}</Text>
                      </td>
                      <td>
                        <Flex align="center" gap={1}>
                          <FiPhone size={13} color="#3182CE" />
                          <Text fontSize="xs">{item.nomor_hp || '-'}</Text>
                        </Flex>
                      </td>
                      <td>
                        <Text fontSize="xs">{item.first_contact || '-'}</Text>
                      </td>
                      <td>
                        <Badge colorScheme="purple" fontSize="xs">
                          {item.media || 'Lainnya'}
                        </Badge>
                      </td>
                      <td>
                        <Text fontSize="xs">{item.program_yang_tertarik || '-'}</Text>
                      </td>
                      <td>
                        <Text fontSize="xs" color={textColor}>
                          {item.referral || '-'}
                        </Text>
                      </td>
                      <td>
                        <Tooltip label={item.keterangan || '-'}>
                          <Text fontSize="xs" noOfLines={1} maxW="150px">
                            {item.keterangan || '-'}
                          </Text>
                        </Tooltip>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Flex justify="center" gap={1}>
                          <IconButton
                            icon={<FiEdit2 />}
                            size="xs"
                            colorScheme="blue"
                            variant="ghost"
                            aria-label="Edit"
                            onClick={() => handleOpenEdit(item)}
                          />
                          <IconButton
                            icon={<FiTrash2 />}
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            aria-label="Hapus"
                            onClick={() => handleOpenDelete(item)}
                          />
                        </Flex>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && filteredData.length > itemsPerPage && (
            <Box mt={4}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </Box>
          )}
        </Box>

        {/* Modal Tambah Prospektif */}
        <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Tambah Data Prospektif Baru</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex direction="column" gap={3}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Nama Lengkap</FormLabel>
                  <Input
                    placeholder="Contoh: Jessica Anggita"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    size="sm"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Nomor WhatsApp / HP</FormLabel>
                  <Input
                    placeholder="0812xxxxxxxx"
                    value={formData.nomor_hp}
                    onChange={(e) => setFormData({ ...formData, nomor_hp: e.target.value })}
                    size="sm"
                  />
                </FormControl>

                <Flex gap={3}>
                  <FormControl flex={1}>
                    <FormLabel fontSize="sm">First Contact</FormLabel>
                    <Input
                      type="date"
                      value={formData.first_contact}
                      onChange={(e) => setFormData({ ...formData, first_contact: e.target.value })}
                      size="sm"
                    />
                  </FormControl>

                  <FormControl flex={1}>
                    <FormLabel fontSize="sm">Media Asal</FormLabel>
                    <Select
                      value={formData.media}
                      onChange={(e) => setFormData({ ...formData, media: e.target.value })}
                      size="sm"
                    >
                      {MEDIA_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </Flex>

                <FormControl>
                  <FormLabel fontSize="sm">Program Yang Diminati</FormLabel>
                  <Input
                    placeholder="Contoh: Full Time Course / Illustration"
                    value={formData.program_yang_tertarik}
                    onChange={(e) =>
                      setFormData({ ...formData, program_yang_tertarik: e.target.value })
                    }
                    size="sm"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Referral (Optional)</FormLabel>
                  <Input
                    placeholder="Referensi dari teman/event"
                    value={formData.referral}
                    onChange={(e) => setFormData({ ...formData, referral: e.target.value })}
                    size="sm"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Keterangan / Catatan</FormLabel>
                  <Textarea
                    placeholder="Catatan tambahan..."
                    value={formData.keterangan}
                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                    size="sm"
                    rows={2}
                  />
                </FormControl>
              </Flex>
            </ModalBody>
            <ModalFooter gap={2}>
              <Button size="sm" variant="ghost" onClick={() => setIsAddOpen(false)}>
                Batal
              </Button>
              <Button
                size="sm"
                colorScheme="orange"
                onClick={handleSaveAdd}
                isLoading={addMutation.isPending}
              >
                Simpan
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal Edit Prospektif */}
        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Data Prospektif (Row {formData.row})</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex direction="column" gap={3}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Nama Lengkap</FormLabel>
                  <Input
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    size="sm"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Nomor WhatsApp / HP</FormLabel>
                  <Input
                    value={formData.nomor_hp}
                    onChange={(e) => setFormData({ ...formData, nomor_hp: e.target.value })}
                    size="sm"
                  />
                </FormControl>

                <Flex gap={3}>
                  <FormControl flex={1}>
                    <FormLabel fontSize="sm">First Contact</FormLabel>
                    <Input
                      type="date"
                      value={formData.first_contact}
                      onChange={(e) => setFormData({ ...formData, first_contact: e.target.value })}
                      size="sm"
                    />
                  </FormControl>

                  <FormControl flex={1}>
                    <FormLabel fontSize="sm">Media Asal</FormLabel>
                    <Select
                      value={formData.media}
                      onChange={(e) => setFormData({ ...formData, media: e.target.value })}
                      size="sm"
                    >
                      {MEDIA_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </Flex>

                <FormControl>
                  <FormLabel fontSize="sm">Program Yang Diminati</FormLabel>
                  <Input
                    value={formData.program_yang_tertarik}
                    onChange={(e) =>
                      setFormData({ ...formData, program_yang_tertarik: e.target.value })
                    }
                    size="sm"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Referral</FormLabel>
                  <Input
                    value={formData.referral}
                    onChange={(e) => setFormData({ ...formData, referral: e.target.value })}
                    size="sm"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Keterangan</FormLabel>
                  <Textarea
                    value={formData.keterangan}
                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                    size="sm"
                    rows={2}
                  />
                </FormControl>
              </Flex>
            </ModalBody>
            <ModalFooter gap={2}>
              <Button size="sm" variant="ghost" onClick={() => setIsEditOpen(false)}>
                Batal
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={handleSaveEdit}
                isLoading={editMutation.isPending}
              >
                Update Perubahan
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Dialog Konfirmasi Hapus */}
        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsDeleteOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Hapus Data Prospektif
              </AlertDialogHeader>
              <AlertDialogBody>
                Apakah Anda yakin ingin menghapus data prospektif{' '}
                <strong>{selectedItem?.nama}</strong> (Baris {selectedItem?.row})? Aksi ini tidak
                dapat dibatalkan.
              </AlertDialogBody>
              <AlertDialogFooter gap={2}>
                <Button ref={cancelRef} size="sm" onClick={() => setIsDeleteOpen(false)}>
                  Batal
                </Button>
                <Button
                  colorScheme="red"
                  size="sm"
                  onClick={() => deleteMutation.mutate(selectedItem?.row)}
                  isLoading={deleteMutation.isPending}
                >
                  Hapus
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </StyledProspektifMarcomPage>
    </ContainerCarrot>
  );
}
