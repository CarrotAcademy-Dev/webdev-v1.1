/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Button,
  IconButton,
  Tooltip,
  Skeleton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  HStack,
  useToast,
  Link as ChakraLink
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import {
  FiCalendar,
  FiFilm,
  FiInstagram,
  FiBarChart2,
  FiDollarSign,
  FiSearch,
  FiRefreshCw,
  FiExternalLink,
  FiCheckCircle,
  FiLayers,
  FiEye,
  FiAward,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { getListPeriode, getDataByPeriode } from '@/features/socmedFreelance/socmedFreelanceApiService';
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters';
import { StyledSocmedFreelancePage } from './SocmedFreelancePage.styled';

// Safe date formatter for sheet dates
const formatDisplayDate = (val) => {
  if (!val) return '-';
  if (typeof val === 'string' && val.trim() === '') return '-';
  const parsed = new Date(val);
  if (!isNaN(parsed.getTime()) && (typeof val !== 'string' || val.includes('T') || val.includes('-'))) {
    return formatDate.toLongDate(parsed);
  }
  return String(val);
};

// Safe number parser
const parseNum = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]+/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

const ITEMS_PER_PAGE = 12;

// Flag sementara untuk menyembunyikan tab Rekap Penggajian dari user (ubah ke true jika ingin ditampilkan kembali)
const SHOW_PAYROLL = false;

function SocmedFreelancePage() {
  const toast = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Tab 1 filters
  const [searchProduksi, setSearchProduksi] = useState('');
  const [filterTipeKonten, setFilterTipeKonten] = useState('ALL');
  const [pageProduksi, setPageProduksi] = useState(1);

  // Tab 2 filters
  const [searchTracking, setSearchTracking] = useState('');
  const [pageTracking, setPageTracking] = useState(1);

  // Tab 4 selected payroll row
  const [selectedGajiIndex, setSelectedGajiIndex] = useState(0);

  // 1. Fetch List of Periods
  const {
    data: listPeriode = [],
    isLoading: isLoadingPeriods,
    isRefetching: isRefetchingPeriods,
    refetch: refetchPeriods,
    error: errorPeriods
  } = useQuery({
    queryKey: ['socmedFreelance', 'listPeriode'],
    queryFn: getListPeriode,
    staleTime: 5 * 60 * 1000
  });

  // Auto select first period once loaded
  useEffect(() => {
    if (listPeriode.length > 0 && !selectedPeriod) {
      setSelectedPeriod(listPeriode[0]);
    }
  }, [listPeriode, selectedPeriod]);

  // 2. Fetch Data By Period
  const {
    data: periodData,
    isLoading: isLoadingData,
    isRefetching: isRefetchingData,
    refetch: refetchData
  } = useQuery({
    queryKey: ['socmedFreelance', 'dataByPeriode', selectedPeriod],
    queryFn: () => getDataByPeriode(selectedPeriod),
    enabled: Boolean(selectedPeriod),
    staleTime: 5 * 60 * 1000
  });

  const produksiList = useMemo(() => periodData?.produksi_konten || [], [periodData]);
  const trackingList = useMemo(() => periodData?.tracking_instagram || [], [periodData]);
  const mingguanList = useMemo(() => periodData?.produksi_mingguan || [], [periodData]);
  const gajiList = useMemo(() => periodData?.rekap_penggajian || [], [periodData]);

  // Handle manual refresh
  const handleRefreshAll = async () => {
    try {
      await Promise.all([refetchPeriods(), refetchData()]);
      toast({
        title: 'Data Diperbarui',
        description: 'Data Social Media Freelance berhasil disinkronisasi.',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch {
      toast({
        title: 'Gagal Memperbarui',
        description: 'Terjadi kendala saat memperbarui data.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  // Filtered Produksi Konten
  const filteredProduksi = useMemo(() => {
    return produksiList.filter((item) => {
      const matchSearch = searchProduksi
        ? (item.judul_topik_konten || '').toLowerCase().includes(searchProduksi.toLowerCase())
        : true;
      const matchTipe =
        filterTipeKonten === 'ALL'
          ? true
          : (item.tipe_konten || '').toLowerCase().includes(filterTipeKonten.toLowerCase());
      return matchSearch && matchTipe;
    });
  }, [produksiList, searchProduksi, filterTipeKonten]);

  // Filtered Tracking Instagram
  const filteredTracking = useMemo(() => {
    return trackingList.filter((item) => {
      return searchTracking
        ? (item.judul_deskripsi_konten || '').toLowerCase().includes(searchTracking.toLowerCase())
        : true;
    });
  }, [trackingList, searchTracking]);

  // Unique Tipe Konten options
  const uniqueTipeKonten = useMemo(() => {
    const set = new Set();
    produksiList.forEach((item) => {
      if (item.tipe_konten) set.add(item.tipe_konten.trim());
    });
    return Array.from(set);
  }, [produksiList]);

  // Pagination for Produksi
  const totalPagesProduksi = Math.max(1, Math.ceil(filteredProduksi.length / ITEMS_PER_PAGE));
  const paginatedProduksi = useMemo(() => {
    const start = (pageProduksi - 1) * ITEMS_PER_PAGE;
    return filteredProduksi.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProduksi, pageProduksi]);

  // Pagination for Tracking
  const totalPagesTracking = Math.max(1, Math.ceil(filteredTracking.length / ITEMS_PER_PAGE));
  const paginatedTracking = useMemo(() => {
    const start = (pageTracking - 1) * ITEMS_PER_PAGE;
    return filteredTracking.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTracking, pageTracking]);

  // Reset pagination when filter changes
  useEffect(() => {
    setPageProduksi(1);
  }, [searchProduksi, filterTipeKonten, selectedPeriod]);

  useEffect(() => {
    setPageTracking(1);
  }, [searchTracking, selectedPeriod]);

  // Summary Metrics - Tracking
  const trackingStats = useMemo(() => {
    let totalViews = 0;
    let totalBonus = 0;
    trackingList.forEach((item) => {
      totalViews += parseNum(item.realisasi_views);
      totalBonus += parseNum(item.bonus_views);
    });
    return {
      count: trackingList.length,
      totalViews,
      totalBonus
    };
  }, [trackingList]);

  // Summary Metrics - Produksi Mingguan
  const mingguanStats = useMemo(() => {
    let totalKonten = 0;
    let totalBaseFee = 0;
    let targetAchieved = 0;
    mingguanList.forEach((item) => {
      totalKonten += parseNum(item.total_konten);
      totalBaseFee += parseNum(item.total_base_fee);
      const status = (item.status_target_mingguan || '').toLowerCase();
      if (status.includes('tercapai') || status.includes('lengkap') || status.includes('pass')) {
        targetAchieved++;
      }
    });
    return {
      weeks: mingguanList.length,
      totalKonten,
      totalBaseFee,
      targetAchieved
    };
  }, [mingguanList]);

  // Active Payroll Data
  const activeGaji = useMemo(() => {
    if (gajiList.length === 0) return null;
    return gajiList[selectedGajiIndex] || gajiList[0];
  }, [gajiList, selectedGajiIndex]);

  const isRefreshing = isRefetchingPeriods || isRefetchingData;

  return (
    <StyledSocmedFreelancePage>
      {/* Header Section */}
      <div className="header-section">
        <div className="header-title-group">
          <h1 className="page-title">
            <span className="icon-badge">
              <FiInstagram />
            </span>
            Social Media Freelance Dashboard
          </h1>
          <p className="page-subtitle">
            Monitoring performa produksi konten, views Instagram, pencapaian target mingguan, dan rekap honor per periode.
          </p>
        </div>

        <div className="header-actions">
          <Tooltip label="Muat ulang data dari Spreadsheet" hasArrow>
            <Button
              leftIcon={<FiRefreshCw className={isRefreshing ? 'spin-icon' : ''} />}
              onClick={handleRefreshAll}
              isLoading={isRefreshing}
              colorScheme="orange"
              variant="outline"
              size="sm"
              borderRadius="10px"
              fontWeight="600"
            >
              Sinkronkan Data
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Period Selection Cards */}
      <div className="section-label">
        <FiCalendar /> Pilih Periode Kerja
      </div>

      {isLoadingPeriods ? (
        <div className="period-cards-grid">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="110px" borderRadius="16px" />
          ))}
        </div>
      ) : errorPeriods ? (
        <Box
          p={4}
          bg="red.50"
          _dark={{ bg: 'red.900' }}
          color="red.600"
          _darkText={{ color: 'red.200' }}
          borderRadius="12px"
          mb={6}
        >
          <Text fontWeight="600">Gagal memuat list periode.</Text>
          <Button size="xs" colorScheme="red" mt={2} onClick={() => refetchPeriods()}>
            Coba Lagi
          </Button>
        </Box>
      ) : listPeriode.length === 0 ? (
        <Box p={6} textAlign="center" borderRadius="14px" borderWidth="1px" mb={6}>
          <Text color="gray.500">Belum ada data periode yang tersedia di spreadsheet.</Text>
        </Box>
      ) : (
        <div className="period-cards-grid">
          {listPeriode.map((periode) => {
            const isActive = selectedPeriod === periode;
            return (
              <div
                key={periode}
                className={`period-card ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedPeriod(periode)}
                role="button"
                tabIndex={0}
              >
                <div className="period-card-top">
                  <div className="period-card-icon">
                    <FiCalendar />
                  </div>
                  <Badge
                    className="period-badge-status"
                    colorScheme={isActive ? 'orange' : 'gray'}
                    variant={isActive ? 'solid' : 'subtle'}
                  >
                    {isActive ? 'Periode Aktif' : 'Pilih'}
                  </Badge>
                </div>
                <div>
                  <div className="period-card-title">{periode}</div>
                  <div className="period-card-footer">
                    <FiCheckCircle size={14} color={isActive ? '#FE7743' : '#A0AEC0'} />
                    <span>{isActive ? 'Sedang ditampilkan' : 'Klik untuk melihat data'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Tabs Area */}
      <Tabs
        index={activeTabIndex}
        onChange={setActiveTabIndex}
        colorScheme="orange"
        variant="enclosed"
        isLazy
      >
        <TabList
          mb={5}
          borderBottomWidth="2px"
          borderColor="orange.200"
          _dark={{ borderColor: 'gray.700' }}
          overflowX="auto"
          py={1}
        >
          <Tab fontWeight="700" gap={2} fontSize="0.95rem">
            <FiFilm />
            Produksi Konten
            {produksiList.length > 0 && (
              <Badge colorScheme="orange" borderRadius="full" px={2} fontSize="0.75rem">
                {produksiList.length}
              </Badge>
            )}
          </Tab>
          <Tab fontWeight="700" gap={2} fontSize="0.95rem">
            <FiInstagram />
            Tracking Instagram
            {trackingList.length > 0 && (
              <Badge colorScheme="pink" borderRadius="full" px={2} fontSize="0.75rem">
                {trackingList.length}
              </Badge>
            )}
          </Tab>
          <Tab fontWeight="700" gap={2} fontSize="0.95rem">
            <FiBarChart2 />
            Produksi Mingguan
            {mingguanList.length > 0 && (
              <Badge colorScheme="blue" borderRadius="full" px={2} fontSize="0.75rem">
                {mingguanList.length} W
              </Badge>
            )}
          </Tab>
          {SHOW_PAYROLL && (
            <Tab fontWeight="700" gap={2} fontSize="0.95rem">
              <FiDollarSign />
              Rekap Penggajian
              {gajiList.length > 0 && (
                <Badge colorScheme="green" borderRadius="full" px={2} fontSize="0.75rem">
                  {gajiList.length}
                </Badge>
              )}
            </Tab>
          )}
        </TabList>

        <TabPanels>
          {/* ================= TAB 1: PRODUKSI KONTEN ================= */}
          <TabPanel p={0}>
            {isLoadingData ? (
              <Box py={8}>
                <Skeleton height="80px" borderRadius="14px" mb={4} />
                <Skeleton height="350px" borderRadius="14px" />
              </Box>
            ) : (
              <>
                {/* Stats Bar */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon orange">
                      <FiFilm />
                    </div>
                    <div className="stat-info">
                      <span className="stat-label">Total Produksi</span>
                      <span className="stat-value">{produksiList.length} Konten</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon purple">
                      <FiLayers />
                    </div>
                    <div className="stat-info">
                      <span className="stat-label">Carousel</span>
                      <span className="stat-value">
                        {produksiList.filter((x) => (x.tipe_konten || '').toLowerCase().includes('carousel')).length}
                      </span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon pink">
                      <FiInstagram />
                    </div>
                    <div className="stat-info">
                      <span className="stat-label">Reels</span>
                      <span className="stat-value">
                        {produksiList.filter((x) => (x.tipe_konten || '').toLowerCase().includes('reels')).length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Filter and Search */}
                <div className="filter-bar">
                  <div className="filter-controls">
                    <InputGroup maxW="360px" size="md">
                      <InputLeftElement pointerEvents="none">
                        <FiSearch color="#A0AEC0" />
                      </InputLeftElement>
                      <Input
                        placeholder="Cari judul / topik konten..."
                        value={searchProduksi}
                        onChange={(e) => setSearchProduksi(e.target.value)}
                        borderRadius="10px"
                      />
                    </InputGroup>

                    <Select
                      maxW="220px"
                      size="md"
                      borderRadius="10px"
                      value={filterTipeKonten}
                      onChange={(e) => setFilterTipeKonten(e.target.value)}
                    >
                      <option value="ALL">Semua Tipe Konten</option>
                      {uniqueTipeKonten.map((tipe) => (
                        <option key={tipe} value={tipe}>
                          {tipe}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <Text fontSize="0.85rem" color="gray.500" fontWeight="500">
                    Menampilkan {filteredProduksi.length} dari {produksiList.length} data
                  </Text>
                </div>

                {/* Table */}
                <div className="table-container">
                  <div className="table-responsive">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th style={{ width: '60px' }}>No</th>
                          <th style={{ width: '160px' }}>Tanggal Produksi</th>
                          <th>Judul / Topik Konten</th>
                          <th style={{ width: '180px' }}>Tipe Konten</th>
                          <th style={{ width: '180px' }}>Fee Satuan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProduksi.length === 0 ? (
                          <tr>
                            <td colSpan={5}>
                              <div className="empty-state">
                                <div className="empty-icon">
                                  <FiFilm />
                                </div>
                                <div className="empty-title">Tidak ada data produksi konten</div>
                                <div className="empty-desc">
                                  Belum ada catatan produksi untuk periode atau pencarian ini.
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          paginatedProduksi.map((item, index) => {
                            const rowNumber = (pageProduksi - 1) * ITEMS_PER_PAGE + index + 1;
                            const tipeLower = (item.tipe_konten || '').toLowerCase();
                            const statusLower = (item.status_produksi || '').toLowerCase();

                            let tipeBadgeScheme = 'gray';
                            if (tipeLower.includes('carousel')) tipeBadgeScheme = 'purple';
                            else if (tipeLower.includes('reels')) tipeBadgeScheme = 'pink';

                            let statusBadgeScheme = 'gray';
                            if (statusLower.includes('selesai') || statusLower.includes('siap') || statusLower.includes('done')) {
                              statusBadgeScheme = 'green';
                            } else if (statusLower.includes('revisi') || statusLower.includes('review')) {
                              statusBadgeScheme = 'orange';
                            } else if (statusLower.includes('proses') || statusLower.includes('draft')) {
                              statusBadgeScheme = 'blue';
                            }

                            return (
                              <tr key={index}>
                                <td style={{ fontWeight: 600, color: '#718096' }}>{rowNumber}</td>
                                <td>{formatDisplayDate(item.tanggal_produksi)}</td>
                                <td style={{ fontWeight: 600 }}>{item.judul_topik_konten || '-'}</td>
                                <td>
                                  {item.tipe_konten ? (
                                    <Badge colorScheme={tipeBadgeScheme} borderRadius="8px" px={2.5} py={0.5}>
                                      {item.tipe_konten}
                                    </Badge>
                                  ) : (
                                    '-'
                                  )}
                                </td>
                                <td style={{ fontWeight: 700, color: '#2F855A' }}>
                                  {item.fee_satuan !== undefined && item.fee_satuan !== null && item.fee_satuan !== ''
                                    ? formatCurrency(parseNum(item.fee_satuan))
                                    : (item.status_produksi ? formatCurrency(parseNum(item.status_produksi)) : '-')}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                {totalPagesProduksi > 1 && (
                  <Flex justify="space-between" align="center" mt={4} px={1}>
                    <Text fontSize="0.85rem" color="gray.500">
                      Halaman {pageProduksi} dari {totalPagesProduksi}
                    </Text>
                    <HStack spacing={2}>
                      <IconButton
                        size="sm"
                        icon={<FiChevronLeft />}
                        aria-label="Previous Page"
                        isDisabled={pageProduksi <= 1}
                        onClick={() => setPageProduksi((p) => p - 1)}
                      />
                      <IconButton
                        size="sm"
                        icon={<FiChevronRight />}
                        aria-label="Next Page"
                        isDisabled={pageProduksi >= totalPagesProduksi}
                        onClick={() => setPageProduksi((p) => p + 1)}
                      />
                    </HStack>
                  </Flex>
                )}
              </>
            )}
          </TabPanel>

          {/* ================= TAB 2: TRACKING INSTAGRAM ================= */}
          <TabPanel p={0}>
            {isLoadingData ? (
              <Box py={8}>
                <Skeleton height="80px" borderRadius="14px" mb={4} />
                <Skeleton height="350px" borderRadius="14px" />
              </Box>
            ) : (
              <>
                {/* Stats Bar */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon pink">
                      <FiInstagram />
                    </div>
                    <div className="stat-info">
                      <span className="stat-label">Total Postingan</span>
                      <span className="stat-value">{trackingStats.count} Post</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon blue">
                      <FiEye />
                    </div>
                    <div className="stat-info">
                      <span className="stat-label">Total Realisasi Views</span>
                      <span className="stat-value">{formatNumber(trackingStats.totalViews)}</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon green">
                      <FiAward />
                    </div>
                    <div className="stat-info">
                      <span className="stat-label">Total Bonus Views</span>
                      <span className="stat-value">{formatCurrency(trackingStats.totalBonus)}</span>
                    </div>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="filter-bar">
                  <div className="filter-controls">
                    <InputGroup maxW="380px" size="md">
                      <InputLeftElement pointerEvents="none">
                        <FiSearch color="#A0AEC0" />
                      </InputLeftElement>
                      <Input
                        placeholder="Cari deskripsi konten..."
                        value={searchTracking}
                        onChange={(e) => setSearchTracking(e.target.value)}
                        borderRadius="10px"
                      />
                    </InputGroup>
                  </div>

                  <Text fontSize="0.85rem" color="gray.500" fontWeight="500">
                    Menampilkan {filteredTracking.length} dari {trackingList.length} data
                  </Text>
                </div>

                {/* Table */}
                <div className="table-container">
                  <div className="table-responsive">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th style={{ width: '50px' }}>No</th>
                          <th style={{ width: '140px' }}>Tanggal Tayang</th>
                          <th>Judul / Deskripsi Konten</th>
                          <th style={{ width: '150px' }}>Link Postingan</th>
                          <th style={{ width: '150px' }}>Cek Views (H+7)</th>
                          <th style={{ width: '140px' }}>Realisasi Views</th>
                          <th style={{ width: '130px' }}>Tier</th>
                          <th style={{ width: '140px' }}>Bonus Views</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedTracking.length === 0 ? (
                          <tr>
                            <td colSpan={8}>
                              <div className="empty-state">
                                <div className="empty-icon">
                                  <FiInstagram />
                                </div>
                                <div className="empty-title">Tidak ada data tracking Instagram</div>
                                <div className="empty-desc">
                                  Belum ada data tayang postingan untuk periode yang dipilih.
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          paginatedTracking.map((item, index) => {
                            const rowNumber = (pageTracking - 1) * ITEMS_PER_PAGE + index + 1;
                            const tierText = item.pencapaian_tier ? String(item.pencapaian_tier) : '-';
                            const hasLink = item.link_postingan_instagram && item.link_postingan_instagram.startsWith('http');

                            return (
                              <tr key={index}>
                                <td style={{ fontWeight: 600, color: '#718096' }}>{rowNumber}</td>
                                <td>{formatDisplayDate(item.tanggal_tayang)}</td>
                                <td style={{ fontWeight: 600 }}>{item.judul_deskripsi_konten || '-'}</td>
                                <td>
                                  {hasLink ? (
                                    <ChakraLink
                                      href={item.link_postingan_instagram}
                                      isExternal
                                      className="ig-link-button"
                                    >
                                      Buka Postingan <FiExternalLink size={12} />
                                    </ChakraLink>
                                  ) : (
                                    <Text color="gray.400" fontSize="0.85rem">
                                      {item.link_postingan_instagram || '-'}
                                    </Text>
                                  )}
                                </td>
                                <td>{formatDisplayDate(item.tanggal_cek_views)}</td>
                                <td style={{ fontWeight: 700, color: '#2B6CB0' }}>
                                  {formatNumber(parseNum(item.realisasi_views))}
                                </td>
                                <td>
                                  {item.pencapaian_tier ? (
                                    <Badge colorScheme="teal" borderRadius="8px" px={2.5} py={0.5}>
                                      {tierText}
                                    </Badge>
                                  ) : (
                                    '-'
                                  )}
                                </td>
                                <td style={{ fontWeight: 700, color: '#2F855A' }}>
                                  {formatCurrency(parseNum(item.bonus_views))}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                {totalPagesTracking > 1 && (
                  <Flex justify="space-between" align="center" mt={4} px={1}>
                    <Text fontSize="0.85rem" color="gray.500">
                      Halaman {pageTracking} dari {totalPagesTracking}
                    </Text>
                    <HStack spacing={2}>
                      <IconButton
                        size="sm"
                        icon={<FiChevronLeft />}
                        aria-label="Previous Page"
                        isDisabled={pageTracking <= 1}
                        onClick={() => setPageTracking((p) => p - 1)}
                      />
                      <IconButton
                        size="sm"
                        icon={<FiChevronRight />}
                        aria-label="Next Page"
                        isDisabled={pageTracking >= totalPagesTracking}
                        onClick={() => setPageTracking((p) => p + 1)}
                      />
                    </HStack>
                  </Flex>
                )}
              </>
            )}
          </TabPanel>

          {/* ================= TAB 3: PRODUKSI MINGGUAN ================= */}
          <TabPanel p={0}>
            {isLoadingData ? (
              <Box py={8}>
                <Skeleton height="80px" borderRadius="14px" mb={4} />
                <Skeleton height="350px" borderRadius="14px" />
              </Box>
            ) : (
              <>
                {/* Stats Bar */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon blue">
                      <FiCalendar />
                    </div>
                    <div className="stat-info">
                      <span className="stat-label">Total Minggu Terdata</span>
                      <span className="stat-value">{mingguanStats.weeks} Minggu</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon orange">
                      <FiFilm />
                    </div>
                    <div className="stat-info">
                      <span className="stat-label">Total Konten Dibuat</span>
                      <span className="stat-value">{mingguanStats.totalKonten} Konten</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon green">
                      <FiDollarSign />
                    </div>
                    <div className="stat-info">
                      <span className="stat-label">Total Base Fee</span>
                      <span className="stat-value">{formatCurrency(mingguanStats.totalBaseFee)}</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon purple">
                      <FiCheckCircle />
                    </div>
                    <div className="stat-info">
                      <span className="stat-label">Target Tercapai</span>
                      <span className="stat-value">{mingguanStats.targetAchieved} Minggu</span>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="table-container">
                  <div className="table-responsive">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Minggu</th>
                          <th>Tgl Mulai</th>
                          <th>Tgl Selesai</th>
                          <th>Carousel</th>
                          <th>Reels Kata-Kata</th>
                          <th>Reels Testimoni</th>
                          <th>Total Konten</th>
                          <th>Total Base Fee</th>
                          <th>Status Target</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mingguanList.length === 0 ? (
                          <tr>
                            <td colSpan={9}>
                              <div className="empty-state">
                                <div className="empty-icon">
                                  <FiBarChart2 />
                                </div>
                                <div className="empty-title">Tidak ada data produksi mingguan</div>
                                <div className="empty-desc">
                                  Belum ada rekapan target mingguan pada sheet Produksi Mingguan.
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          mingguanList.map((item, index) => {
                            const statusLower = (item.status_target_mingguan || '').toLowerCase();
                            let badgeScheme = 'gray';
                            if (statusLower.includes('tercapai') || statusLower.includes('lengkap') || statusLower.includes('pass')) {
                              badgeScheme = 'green';
                            } else if (statusLower.includes('belum') || statusLower.includes('kurang')) {
                              badgeScheme = 'orange';
                            }

                            return (
                              <tr key={index}>
                                <td style={{ fontWeight: 700, color: '#FE7743' }}>
                                  {item.periode_minggu || `W${index + 1}`}
                                </td>
                                <td>{formatDisplayDate(item.tgl_mulai)}</td>
                                <td>{formatDisplayDate(item.tgl_selesai)}</td>
                                <td>{item.carousel ?? 0}</td>
                                <td>{item.reels_kata_kata ?? 0}</td>
                                <td>{item.reels_testimoni ?? 0}</td>
                                <td style={{ fontWeight: 800, color: '#2B6CB0' }}>{item.total_konten ?? 0}</td>
                                <td style={{ fontWeight: 700, color: '#2F855A' }}>
                                  {formatCurrency(parseNum(item.total_base_fee))}
                                </td>
                                <td>
                                  {item.status_target_mingguan ? (
                                    <Badge colorScheme={badgeScheme} borderRadius="8px" px={2.5} py={0.5}>
                                      {item.status_target_mingguan}
                                    </Badge>
                                  ) : (
                                    '-'
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </TabPanel>

          {/* ================= TAB 4: REKAP PENGGAJIAN (DI-HIDE SEMENTARA) ================= */}
          {SHOW_PAYROLL && (
            <TabPanel p={0}>
              {isLoadingData ? (
                <Box py={8}>
                  <Skeleton height="180px" borderRadius="18px" mb={6} />
                  <Skeleton height="280px" borderRadius="14px" />
                </Box>
              ) : (
              <>
                {/* Hero Card Rekap Penggajian */}
                {activeGaji ? (
                  <div className="payroll-hero-card">
                    <div className="hero-top">
                      <div className="hero-tag">
                        <FiDollarSign /> Rekap Penggajian Freelance
                      </div>
                      <div className="hero-period-label">
                        Cut-off: {formatDisplayDate(activeGaji.tgl_mulai_cut_off)} s/d{' '}
                        {formatDisplayDate(activeGaji.tgl_selesai_cut_off)}
                      </div>
                    </div>

                    <div className="hero-amount-group">
                      <div className="amount-caption">
                        {activeGaji.periode_gaji || 'Total Take Home Pay'}
                      </div>
                      <div className="amount-value">
                        {formatCurrency(parseNum(activeGaji.total_take_home_pay))}
                      </div>
                    </div>

                    <div className="hero-breakdown-grid">
                      <div className="breakdown-item">
                        <span className="item-label">Subtotal Base Fee</span>
                        <span className="item-value">
                          {formatCurrency(parseNum(activeGaji.subtotal_base_fee))}
                        </span>
                      </div>
                      <div className="breakdown-item">
                        <span className="item-label">Subtotal Bonus Views</span>
                        <span className="item-value">
                          {formatCurrency(parseNum(activeGaji.subtotal_bonus_views))}
                        </span>
                      </div>
                      <div className="breakdown-item">
                        <span className="item-label">Total Konten</span>
                        <span className="item-value">{activeGaji.total_konten ?? 0} Konten</span>
                      </div>
                      <div className="breakdown-item">
                        <span className="item-label">Total Realisasi Views</span>
                        <span className="item-value">
                          {formatNumber(parseNum(activeGaji.total_views))} Views
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Box p={6} textAlign="center" borderRadius="14px" borderWidth="1px" mb={6}>
                    <Text color="gray.500">Belum ada data rekap penggajian untuk periode ini.</Text>
                  </Box>
                )}

                {/* Multiple Periods Selector (if > 1 row) */}
                {gajiList.length > 1 && (
                  <Flex align="center" gap={3} mb={4}>
                    <Text fontSize="0.88rem" fontWeight="600" color="gray.600" _dark={{ color: 'gray.300' }}>
                      Pilih Baris Rekap:
                    </Text>
                    <Select
                      maxW="260px"
                      size="sm"
                      borderRadius="8px"
                      value={selectedGajiIndex}
                      onChange={(e) => setSelectedGajiIndex(Number(e.target.value))}
                    >
                      {gajiList.map((gaji, idx) => (
                        <option key={idx} value={idx}>
                          {gaji.periode_gaji || `Periode ${idx + 1}`}
                        </option>
                      ))}
                    </Select>
                  </Flex>
                )}

                {/* All Rows Comparison Table */}
                <div className="table-container">
                  <div className="table-responsive">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Periode Gaji</th>
                          <th>Tgl Mulai Cut-Off</th>
                          <th>Tgl Selesai Cut-Off</th>
                          <th>Total Konten</th>
                          <th>Total Views</th>
                          <th>Subtotal Base Fee</th>
                          <th>Subtotal Bonus</th>
                          <th>Take Home Pay</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gajiList.length === 0 ? (
                          <tr>
                            <td colSpan={8}>
                              <div className="empty-state">
                                <div className="empty-icon">
                                  <FiDollarSign />
                                </div>
                                <div className="empty-title">Tidak ada data penggajian</div>
                                <div className="empty-desc">
                                  Data rekap penggajian belum tersedia pada spreadsheet.
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          gajiList.map((item, index) => {
                            const isSelected = index === selectedGajiIndex;
                            return (
                              <tr
                                key={index}
                                onClick={() => setSelectedGajiIndex(index)}
                                style={{
                                  cursor: 'pointer',
                                  backgroundColor: isSelected ? 'rgba(254, 119, 67, 0.08)' : undefined
                                }}
                              >
                                <td style={{ fontWeight: 700, color: '#FE7743' }}>
                                  {item.periode_gaji || `Periode ${index + 1}`}
                                  {isSelected && (
                                    <Badge ml={2} colorScheme="orange" fontSize="0.7rem">
                                      Aktif
                                    </Badge>
                                  )}
                                </td>
                                <td>{formatDisplayDate(item.tgl_mulai_cut_off)}</td>
                                <td>{formatDisplayDate(item.tgl_selesai_cut_off)}</td>
                                <td style={{ fontWeight: 600 }}>{item.total_konten ?? 0}</td>
                                <td style={{ fontWeight: 600 }}>{formatNumber(parseNum(item.total_views))}</td>
                                <td>{formatCurrency(parseNum(item.subtotal_base_fee))}</td>
                                <td style={{ color: '#2F855A', fontWeight: 600 }}>
                                  {formatCurrency(parseNum(item.subtotal_bonus_views))}
                                </td>
                                <td style={{ fontWeight: 800, color: '#E0531D', fontSize: '1rem' }}>
                                  {formatCurrency(parseNum(item.total_take_home_pay))}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </StyledSocmedFreelancePage>
  );
}

export default SocmedFreelancePage;
