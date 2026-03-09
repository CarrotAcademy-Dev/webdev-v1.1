import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Input, 
  InputGroup, 
  InputLeftElement, 
  useColorMode,
  Button,
  Flex,
  Text,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  useToast,
  IconButton,
  Tooltip,
  Checkbox
} from '@chakra-ui/react';
import { FiInbox, FiSearch, FiEdit2, FiExternalLink } from 'react-icons/fi';
import { getKelengkapanData, updateKelengkapanData } from '@/features/eso/esoApiService';
import ContainerCarrot from '@/components/Container';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { StyledKelengkapanDataPage } from './KelengkapanData.styled';

// Kelengkapan Data Page Component
const KelengkapanDataPage = () => {
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Theme colors
  const cardBg = useColorModeValue('white', 'dark.bg.card');
  const textMuted = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    nis: '',
    nama: '',
    program: '',
    status: '',
    link_dropbox: '',
    link_gdrive_studio: '',
    link_gdrive_portfolio: '',
    artist_journal: false,
    invite_gchat: false,
    add_birthday: false,
    link_foto: '',
    link_predrawing: '',
    predrawing_satu: false,
    predrawing_dua: false,
    predrawing_tiga: false,
    predrawing_empat: false,
    predrawing_lima: false,
  });

  // Fetch data using React Query
  const { data: kelengkapanData = [], isLoading, isError } = useQuery({
    queryKey: ['kelengkapanDataEso'],
    queryFn: getKelengkapanData,
    refetchOnWindowFocus: false,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateKelengkapanData,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['kelengkapanDataEso']);
      toast({
        title: 'Berhasil',
        description: data.message || 'Data berhasil diperbaharui',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal update data',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    },
  });

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return kelengkapanData;
    
    return kelengkapanData.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      return (
        item.nis?.toLowerCase().includes(searchLower) ||
        item.nama?.toLowerCase().includes(searchLower) ||
        item.program?.toLowerCase().includes(searchLower) ||
        item.status?.toLowerCase().includes(searchLower)
      );
    });
  }, [kelengkapanData, searchQuery]);

  // Use pagination hook
  const {
    currentItems,
    currentPage,
    totalPages,
    goToPage,
    startIndex,
    endIndex,
    totalItems,
    resetPage
  } = usePagination(filteredData, 10);

  // Reset to page 1 when search changes
  useEffect(() => {
    resetPage();
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Helper function to convert TRUE/FALSE string to boolean
  const stringToBoolean = (value) => {
    if (typeof value === 'boolean') return value;
    return value === 'TRUE' || value === 'true';
  };

  // Helper function to convert boolean to TRUE/FALSE string
  const booleanToString = (value) => {
    return value ? 'TRUE' : 'FALSE';
  };

  // Handle edit button click
  const handleEdit = (item) => {
    setFormData({
      nis: item.nis || '',
      nama: item.nama || '',
      program: item.program || '',
      status: item.status || '',
      link_dropbox: item.link_dropbox || '',
      link_gdrive_studio: item.link_gdrive_studio || '',
      link_gdrive_portfolio: item.link_gdrive_portfolio || '',
      artist_journal: stringToBoolean(item.artist_journal),
      invite_gchat: stringToBoolean(item.invite_gchat),
      add_birthday: stringToBoolean(item.add_birthday),
      link_foto: item.link_foto || '',
      link_predrawing: item.link_predrawing || '',
      predrawing_satu: stringToBoolean(item.predrawing_satu),
      predrawing_dua: stringToBoolean(item.predrawing_dua),
      predrawing_tiga: stringToBoolean(item.predrawing_tiga),
      predrawing_empat: stringToBoolean(item.predrawing_empat),
      predrawing_lima: stringToBoolean(item.predrawing_lima),
    });
    onOpen();
  };

  // Handle form input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submit
  const handleSubmit = () => {
    if (!formData.nis) {
      toast({
        title: 'Error',
        description: 'NIS tidak boleh kosong',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    // Convert boolean fields to TRUE/FALSE strings for API
    const dataToSubmit = {
      ...formData,
      artist_journal: booleanToString(formData.artist_journal),
      invite_gchat: booleanToString(formData.invite_gchat),
      add_birthday: booleanToString(formData.add_birthday),
      predrawing_satu: booleanToString(formData.predrawing_satu),
      predrawing_dua: booleanToString(formData.predrawing_dua),
      predrawing_tiga: booleanToString(formData.predrawing_tiga),
      predrawing_empat: booleanToString(formData.predrawing_empat),
      predrawing_lima: booleanToString(formData.predrawing_lima),
    };

    updateMutation.mutate(dataToSubmit);
  };

  // Loading skeleton
  const renderSkeleton = () => (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '60px' }}>No</th>
            <th style={{ width: '100px' }}>NIS</th>
            <th style={{ width: '180px' }}>Nama</th>
            <th style={{ width: '120px' }}>Program</th>
            <th style={{ width: '100px' }}>Status</th>
            <th style={{ width: '80px' }}>Actions</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Check if link exists and is valid
  const isValidLink = (link) => {
    return link && link.trim() !== '' && link !== '-';
  };

  return (
    <ContainerCarrot>
      <StyledKelengkapanDataPage data-theme={colorMode}>
        {/* Page Title */}
        <h1 className="page-title">Kelengkapan Data</h1>
        <Text fontSize="md" color={textMuted} mb={6}>
          Kelola kelengkapan data siswa termasuk links dan predrawing status
        </Text>

        {/* Search Bar */}
        <Flex mb={4} gap={3} alignItems="center" flexWrap="wrap">
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray" />
            </InputLeftElement>
            <Input
              placeholder="Cari NIS, nama, program, atau status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              borderRadius="md"
            />
          </InputGroup>
          <Text fontSize="sm" color={textMuted}>
            {filteredData.length} results
          </Text>
        </Flex>

      {/* Table or Loading State */}
      {isLoading ? (
        renderSkeleton()
      ) : isError ? (
        <Flex 
          direction="column" 
          align="center" 
          justify="center" 
          py={16} 
          bg={cardBg}
          borderRadius="md"
          border="1px solid"
          borderColor={borderColor}
        >
          <FiInbox size={48} color="gray" />
          <Text fontSize="xl" fontWeight="600" mt={4}>Gagal memuat data</Text>
          <Text fontSize="sm" color={textMuted}>Terjadi kesalahan saat mengambil data</Text>
        </Flex>
      ) : currentItems.length === 0 ? (
        <Flex 
          direction="column" 
          align="center" 
          justify="center" 
          py={16} 
          bg={cardBg}
          borderRadius="md"
          border="1px solid"
          borderColor={borderColor}
        >
          <FiInbox size={48} color="gray" />
          <Text fontSize="xl" fontWeight="600" mt={4}>Tidak ada data</Text>
          <Text fontSize="sm" color={textMuted}>Belum ada data kelengkapan yang tersedia</Text>
        </Flex>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>No</th>
                  <th style={{ width: '100px' }}>NIS</th>
                  <th style={{ width: '180px' }}>Nama</th>
                  <th style={{ width: '120px' }}>Program</th>
                  <th style={{ width: '100px' }}>Status</th>
                  <th style={{ width: '100px' }}>Dropbox</th>
                  <th style={{ width: '120px' }}>GDrive Studio</th>
                  <th style={{ width: '130px' }}>GDrive Portfolio</th>
                  <th style={{ width: '120px' }}>Artist Journal</th>
                  <th style={{ width: '110px' }}>Invite GChat</th>
                  <th style={{ width: '110px' }}>Add Birthday</th>
                  <th style={{ width: '100px' }}>Link Foto</th>
                  <th style={{ width: '120px' }}>Link Predrawing</th>
                  <th style={{ width: '110px' }}>Predrawing 1</th>
                  <th style={{ width: '110px' }}>Predrawing 2</th>
                  <th style={{ width: '110px' }}>Predrawing 3</th>
                  <th style={{ width: '110px' }}>Predrawing 4</th>
                  <th style={{ width: '110px' }}>Predrawing 5</th>
                  <th style={{ width: '100px', position: 'sticky', right: 0, background: colorMode === 'dark' ? '#1a202c' : 'white', zIndex: 1 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <tr key={item.nis || index}>
                    <td>{startIndex + index + 1}</td>
                    <td>{item.nis}</td>
                    <td>{item.nama}</td>
                    <td>{item.program}</td>
                    <td>{item.status}</td>
                    <td>
                      {isValidLink(item.link_dropbox) ? (
                        <Tooltip label="Open Link">
                          <IconButton
                            as="a"
                            href={item.link_dropbox}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="xs"
                            icon={<FiExternalLink />}
                            aria-label="Open Dropbox"
                            bg="blue.500"
                            color="white"
                            _hover={{ bg: 'blue.600' }}
                          />
                        </Tooltip>
                      ) : (
                        <Text fontSize="xs" color={textMuted}>-</Text>
                      )}
                    </td>
                    <td>
                      {isValidLink(item.link_gdrive_studio) ? (
                        <Tooltip label="Open Link">
                          <IconButton
                            as="a"
                            href={item.link_gdrive_studio}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="xs"
                            icon={<FiExternalLink />}
                            aria-label="Open GDrive Studio"
                            bg="blue.500"
                            color="white"
                            _hover={{ bg: 'blue.600' }}
                          />
                        </Tooltip>
                      ) : (
                        <Text fontSize="xs" color={textMuted}>-</Text>
                      )}
                    </td>
                    <td>
                      {isValidLink(item.link_gdrive_portfolio) ? (
                        <Tooltip label="Open Link">
                          <IconButton
                            as="a"
                            href={item.link_gdrive_portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="xs"
                            icon={<FiExternalLink />}
                            aria-label="Open GDrive Portfolio"
                            bg="blue.500"
                            color="white"
                            _hover={{ bg: 'blue.600' }}
                          />
                        </Tooltip>
                      ) : (
                        <Text fontSize="xs" color={textMuted}>-</Text>
                      )}
                    </td>
                    <td>
                      <Checkbox 
                        isChecked={stringToBoolean(item.artist_journal)} 
                        isReadOnly 
                        colorScheme="orange"
                        pointerEvents="none"
                      />
                    </td>
                    <td>
                      <Checkbox 
                        isChecked={stringToBoolean(item.invite_gchat)} 
                        isReadOnly 
                        colorScheme="orange"
                        pointerEvents="none"
                      />
                    </td>
                    <td>
                      <Checkbox 
                        isChecked={stringToBoolean(item.add_birthday)} 
                        isReadOnly 
                        colorScheme="orange"
                        pointerEvents="none"
                      />
                    </td>
                    <td>
                      {isValidLink(item.link_foto) ? (
                        <Tooltip label="Open Link">
                          <IconButton
                            as="a"
                            href={item.link_foto}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="xs"
                            icon={<FiExternalLink />}
                            aria-label="Open Foto"
                            bg="blue.500"
                            color="white"
                            _hover={{ bg: 'blue.600' }}
                          />
                        </Tooltip>
                      ) : (
                        <Text fontSize="xs" color={textMuted}>-</Text>
                      )}
                    </td>
                    <td>
                      {isValidLink(item.link_predrawing) ? (
                        <Tooltip label="Open Link">
                          <IconButton
                            as="a"
                            href={item.link_predrawing}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="xs"
                            icon={<FiExternalLink />}
                            aria-label="Open Predrawing"
                            bg="blue.500"
                            color="white"
                            _hover={{ bg: 'blue.600' }}
                          />
                        </Tooltip>
                      ) : (
                        <Text fontSize="xs" color={textMuted}>-</Text>
                      )}
                    </td>
                    <td>
                      <Checkbox 
                        isChecked={stringToBoolean(item.predrawing_satu)} 
                        isReadOnly 
                        colorScheme="orange"
                        pointerEvents="none"
                      />
                    </td>
                    <td>
                      <Checkbox 
                        isChecked={stringToBoolean(item.predrawing_dua)} 
                        isReadOnly 
                        colorScheme="orange"
                        pointerEvents="none"
                      />
                    </td>
                    <td>
                      <Checkbox 
                        isChecked={stringToBoolean(item.predrawing_tiga)} 
                        isReadOnly 
                        colorScheme="orange"
                        pointerEvents="none"
                      />
                    </td>
                    <td>
                      <Checkbox 
                        isChecked={stringToBoolean(item.predrawing_empat)} 
                        isReadOnly 
                        colorScheme="orange"
                        pointerEvents="none"
                      />
                    </td>
                    <td>
                      <Checkbox 
                        isChecked={stringToBoolean(item.predrawing_lima)} 
                        isReadOnly 
                        colorScheme="orange"
                        pointerEvents="none"
                      />
                    </td>
                    <td style={{ position: 'sticky', right: 0, background: colorMode === 'dark' ? '#1a202c' : 'white', zIndex: 1 }}>
                      <Tooltip label="Edit Data">
                        <IconButton
                          size="sm"
                          icon={<FiEdit2 />}
                          onClick={() => handleEdit(item)}
                          aria-label="Edit"
                          bg="teal.500"
                          color="white"
                          _hover={{ bg: 'teal.600', transform: 'translateY(-2px)', boxShadow: 'lg' }}
                          _active={{ bg: 'teal.700', transform: 'translateY(0)' }}
                        />
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Flex mt={6} justify="center">
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

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Kelengkapan Data</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Flex direction="column" gap={4}>
              {/* Read-only fields */}
              <Flex gap={4}>
                <FormControl isReadOnly>
                  <FormLabel fontSize="sm">NIS</FormLabel>
                  <Input
                    value={formData.nis}
                    bg={useColorModeValue('gray.100', 'gray.700')}
                    size="sm"
                  />
                </FormControl>
                <FormControl isReadOnly>
                  <FormLabel fontSize="sm">Nama</FormLabel>
                  <Input
                    value={formData.nama}
                    bg={useColorModeValue('gray.100', 'gray.700')}
                    size="sm"
                  />
                </FormControl>
              </Flex>

              <Flex gap={4}>
                <FormControl isReadOnly>
                  <FormLabel fontSize="sm">Program</FormLabel>
                  <Input
                    value={formData.program}
                    bg={useColorModeValue('gray.100', 'gray.700')}
                    size="sm"
                  />
                </FormControl>
                <FormControl isReadOnly>
                  <FormLabel fontSize="sm">Status</FormLabel>
                  <Input
                    value={formData.status}
                    bg={useColorModeValue('gray.100', 'gray.700')}
                    size="sm"
                  />
                </FormControl>
              </Flex>

              {/* Editable links */}
              <Text fontSize="md" fontWeight="600" mt={4}>Links & Data</Text>
              
              <FormControl>
                <FormLabel fontSize="sm">Link Dropbox</FormLabel>
                <Input
                  value={formData.link_dropbox}
                  onChange={(e) => handleInputChange('link_dropbox', e.target.value)}
                  placeholder="https://..."
                  size="sm"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Link GDrive Studio</FormLabel>
                <Input
                  value={formData.link_gdrive_studio}
                  onChange={(e) => handleInputChange('link_gdrive_studio', e.target.value)}
                  placeholder="https://..."
                  size="sm"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Link GDrive Portfolio</FormLabel>
                <Input
                  value={formData.link_gdrive_portfolio}
                  onChange={(e) => handleInputChange('link_gdrive_portfolio', e.target.value)}
                  placeholder="https://..."
                  size="sm"
                />
              </FormControl>

              <Flex gap={4}>
                <FormControl display="flex" alignItems="center">
                  <FormLabel fontSize="sm" mb={0} mr={3}>Artist Journal</FormLabel>
                  <Checkbox
                    isChecked={formData.artist_journal}
                    onChange={(e) => handleInputChange('artist_journal', e.target.checked)}
                    colorScheme="orange"
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel fontSize="sm" mb={0} mr={3}>Invite GChat</FormLabel>
                  <Checkbox
                    isChecked={formData.invite_gchat}
                    onChange={(e) => handleInputChange('invite_gchat', e.target.checked)}
                    colorScheme="orange"
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel fontSize="sm" mb={0} mr={3}>Add Birthday</FormLabel>
                  <Checkbox
                    isChecked={formData.add_birthday}
                    onChange={(e) => handleInputChange('add_birthday', e.target.checked)}
                    colorScheme="orange"
                  />
                </FormControl>
              </Flex>

              <FormControl>
                <FormLabel fontSize="sm">Link Foto</FormLabel>
                <Input
                  value={formData.link_foto}
                  onChange={(e) => handleInputChange('link_foto', e.target.value)}
                  placeholder="https://..."
                  size="sm"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Link Predrawing</FormLabel>
                <Input
                  value={formData.link_predrawing}
                  onChange={(e) => handleInputChange('link_predrawing', e.target.value)}
                  placeholder="https://..."
                  size="sm"
                />
              </FormControl>

              <Text fontSize="md" fontWeight="600" mt={4}>Predrawing Status</Text>

              <Flex gap={6} flexWrap="wrap">
                <FormControl display="flex" alignItems="center" width="auto">
                  <FormLabel fontSize="sm" mb={0} mr={3}>Predrawing 1</FormLabel>
                  <Checkbox
                    isChecked={formData.predrawing_satu}
                    onChange={(e) => handleInputChange('predrawing_satu', e.target.checked)}
                    colorScheme="green"
                  />
                </FormControl>
                <FormControl display="flex" alignItems="center" width="auto">
                  <FormLabel fontSize="sm" mb={0} mr={3}>Predrawing 2</FormLabel>
                  <Checkbox
                    isChecked={formData.predrawing_dua}
                    onChange={(e) => handleInputChange('predrawing_dua', e.target.checked)}
                    colorScheme="green"
                  />
                </FormControl>
                <FormControl display="flex" alignItems="center" width="auto">
                  <FormLabel fontSize="sm" mb={0} mr={3}>Predrawing 3</FormLabel>
                  <Checkbox
                    isChecked={formData.predrawing_tiga}
                    onChange={(e) => handleInputChange('predrawing_tiga', e.target.checked)}
                    colorScheme="green"
                  />
                </FormControl>
                <FormControl display="flex" alignItems="center" width="auto">
                  <FormLabel fontSize="sm" mb={0} mr={3}>Predrawing 4</FormLabel>
                  <Checkbox
                    isChecked={formData.predrawing_empat}
                    onChange={(e) => handleInputChange('predrawing_empat', e.target.checked)}
                    colorScheme="green"
                  />
                </FormControl>
                <FormControl display="flex" alignItems="center" width="auto">
                  <FormLabel fontSize="sm" mb={0} mr={3}>Predrawing 5</FormLabel>
                  <Checkbox
                    isChecked={formData.predrawing_lima}
                    onChange={(e) => handleInputChange('predrawing_lima', e.target.checked)}
                    colorScheme="green"
                  />
                </FormControl>
              </Flex>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              isLoading={updateMutation.isPending}
              bg="teal.500"
              color="white"
              _hover={{ bg: 'teal.600', transform: 'translateY(-2px)', boxShadow: 'lg' }}
              _active={{ bg: 'teal.700', transform: 'translateY(0)' }}
            >
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      </StyledKelengkapanDataPage>
    </ContainerCarrot>
  );
};

export default KelengkapanDataPage;
