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
  Checkbox,
  Badge,
  useToast,
  useColorModeValue,
  Skeleton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Tooltip
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCekFolderDropbox, editCekFolderDropbox } from '@/features/marcom/marcomApiService';
import ContainerCarrot from '@/components/Container';
import InfoCard from '@/components/InfoCard';
import Pagination from '@/components/Pagination';
import useDebounce from '@/hooks/useDebounce';
import { StyledCekFolderDropboxPage } from './CekFolderDropboxPage.styled';
import {
  FiSearch,
  FiFolder,
  FiCheckCircle,
  FiClock,
  FiExternalLink,
  FiEdit3,
  FiCheckSquare
} from 'react-icons/fi';

const DROPBOX_URL =
  'https://www.dropbox.com/scl/fo/iqb0388z0td4w8gyaf8p3/AGNSIM05Vm4X5md2CB2fjiY?rlkey=0vlokebarxmu9lurad966k6wy&st=pcelkw50&dl=0';

export default function CekFolderDropboxPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'DONE' | 'UNDONE'

  // Edit Target Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [targetValue, setTargetValue] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Query
  const { data: dropboxList = [], isLoading } = useQuery({
    queryKey: ['marcomDropbox'],
    queryFn: getCekFolderDropbox,
    staleTime: 3 * 60 * 1000
  });

  // Mutation
  const editMutation = useMutation({
    mutationFn: editCekFolderDropbox,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['marcomDropbox'] });
      const previousData = queryClient.getQueryData(['marcomDropbox']);

      queryClient.setQueryData(['marcomDropbox'], (old = []) => {
        return old.map((item) => {
          if (item.row === variables.row) {
            return {
              ...item,
              ...(variables.target !== undefined ? { target: variables.target } : {}),
              ...(variables.checklist !== undefined
                ? { checklist: variables.checklist === 'TRUE' || variables.checklist === true }
                : {})
            };
          }
          return item;
        });
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['marcomDropbox'], context.previousData);
      }
      toast({
        title: 'Gagal Update',
        description: err.message || 'Terjadi kesalahan saat update',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    },
    onSuccess: (res) => {
      toast({
        title: 'Berhasil',
        description: res.message || 'Perubahan tersimpan',
        status: 'success',
        duration: 2000,
        isClosable: true
      });
      setIsEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ['marcomDropbox'] });
    }
  });

  // Checklist handler
  const handleChecklistToggle = (item) => {
    const newChecklist = !item.checklist;
    editMutation.mutate({
      row: item.row,
      checklist: newChecklist ? 'TRUE' : 'FALSE'
    });
  };

  // Target edit handler
  const handleOpenEditTarget = (item) => {
    setSelectedItem(item);
    setTargetValue(item.target || '');
    setIsEditOpen(true);
  };

  const handleSaveTarget = () => {
    if (!selectedItem) return;
    editMutation.mutate({
      row: selectedItem.row,
      target: targetValue
    });
  };

  // Filtered data
  const filteredData = useMemo(() => {
    return dropboxList.filter((item) => {
      const matchSearch =
        !debouncedSearch || (item.nama && item.nama.toLowerCase().includes(debouncedSearch.toLowerCase()));

      const matchStatus =
        filterStatus === 'ALL'
          ? true
          : filterStatus === 'DONE'
            ? item.checklist
            : !item.checklist;

      return matchSearch && matchStatus;
    });
  }, [dropboxList, debouncedSearch, filterStatus]);

  // Statistics
  const totalStudents = dropboxList.length;
  const totalChecked = dropboxList.filter((i) => i.checklist).length;
  const totalUnchecked = totalStudents - totalChecked;
  const progressPct = totalStudents > 0 ? Math.round((totalChecked / totalStudents) * 100) : 0;

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  return (
    <ContainerCarrot>
      <StyledCekFolderDropboxPage>
        <div className="page-header">
          <h1>Cek Folder Dropbox Siswa</h1>
          <p>Monitoring checklist dan target upload file karya/tugas ke Dropbox masing-masing siswa</p>
        </div>

        {/* Dropbox Link Banner */}
        <div className="dropbox-banner">
          <Flex align="center" gap={3}>
            <FiFolder size={26} color="#0061FF" />
            <div>
              <Text fontWeight="600" fontSize="sm" color="blue.600">
                Penyimpanan Dropbox Terpusat
              </Text>
              <Text fontSize="xs" color={textColor}>
                Upload file karya siswa ke folder masing-masing sesuai nama siswa
              </Text>
            </div>
          </Flex>

          <Button
            as="a"
            href={DROPBOX_URL}
            target="_blank"
            rel="noopener noreferrer"
            leftIcon={<FiExternalLink />}
            colorScheme="blue"
            size="sm"
          >
            Buka Dropbox
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <InfoCard>
            <FiFolder size={28} color="#0061FF" />
            <div>
              <p>Total Siswa</p>
              <h3>{totalStudents}</h3>
            </div>
          </InfoCard>

          <InfoCard>
            <FiCheckCircle size={28} color="#38A169" />
            <div>
              <p>Sudah Diceklis</p>
              <h3>{totalChecked}</h3>
            </div>
          </InfoCard>

          <InfoCard>
            <FiClock size={28} color="#E53E3E" />
            <div>
              <p>Belum Selesai</p>
              <h3>{totalUnchecked}</h3>
            </div>
          </InfoCard>

          <InfoCard>
            <FiCheckSquare size={28} color="#DD6B20" />
            <div>
              <p>Persentase Progres</p>
              <h3>{progressPct}%</h3>
            </div>
          </InfoCard>
        </div>

        {/* Controls & Table Container */}
        <Box bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={3} mb={4}>
            <InputGroup maxW={{ base: '100%', md: '300px' }}>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray" />
              </InputLeftElement>
              <Input
                placeholder="Cari nama siswa..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                size="sm"
                borderRadius="md"
              />
            </InputGroup>

            <Flex gap={2}>
              <Button
                size="xs"
                variant={filterStatus === 'ALL' ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => {
                  setFilterStatus('ALL');
                  setCurrentPage(1);
                }}
              >
                Semua ({totalStudents})
              </Button>
              <Button
                size="xs"
                variant={filterStatus === 'DONE' ? 'solid' : 'outline'}
                colorScheme="green"
                onClick={() => {
                  setFilterStatus('DONE');
                  setCurrentPage(1);
                }}
              >
                Sudah ({totalChecked})
              </Button>
              <Button
                size="xs"
                variant={filterStatus === 'UNDONE' ? 'solid' : 'outline'}
                colorScheme="red"
                onClick={() => {
                  setFilterStatus('UNDONE');
                  setCurrentPage(1);
                }}
              >
                Belum ({totalUnchecked})
              </Button>
            </Flex>
          </Flex>

          {/* Table */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>No</th>
                  <th>Nama Siswa</th>
                  <th>Target / Catatan</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>Checklist</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>Status</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={idx}>
                      <td colSpan={6}>
                        <Skeleton height="35px" />
                      </td>
                    </tr>
                  ))
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                      <Text color={textColor}>Tidak ada data siswa ditemukan</Text>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, idx) => (
                    <tr key={item.row || idx}>
                      <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td>
                        <Text fontWeight="600">{item.nama}</Text>
                      </td>
                      <td>
                        <Text fontSize="sm" color={item.target ? undefined : 'gray.400'}>
                          {item.target || '-'}
                        </Text>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Checkbox
                          isChecked={item.checklist}
                          colorScheme="green"
                          size="lg"
                          onChange={() => handleChecklistToggle(item)}
                          isDisabled={editMutation.isPending}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {item.checklist ? (
                          <Badge colorScheme="green" px={2} py={0.5} borderRadius="full">
                            Sudah Selesai
                          </Badge>
                        ) : (
                          <Badge colorScheme="orange" px={2} py={0.5} borderRadius="full">
                            Belum Selesai
                          </Badge>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Tooltip label="Edit Target / Catatan">
                          <IconButton
                            icon={<FiEdit3 />}
                            size="xs"
                            variant="ghost"
                            colorScheme="blue"
                            aria-label="Edit Target"
                            onClick={() => handleOpenEditTarget(item)}
                          />
                        </Tooltip>
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

        {/* Modal Edit Target */}
        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Update Target: {selectedItem?.nama}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
                <FormLabel fontSize="sm">Target / Keterangan Upload</FormLabel>
                <Input
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="Contoh: Modul 3 Selesai / File Artwork"
                  size="sm"
                />
              </FormControl>
            </ModalBody>
            <ModalFooter gap={2}>
              <Button size="sm" variant="ghost" onClick={() => setIsEditOpen(false)}>
                Batal
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={handleSaveTarget}
                isLoading={editMutation.isPending}
              >
                Simpan Target
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </StyledCekFolderDropboxPage>
    </ContainerCarrot>
  );
}
