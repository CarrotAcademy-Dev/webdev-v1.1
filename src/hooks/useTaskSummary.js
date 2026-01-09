import { useQueries } from '@tanstack/react-query';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { format } from 'date-fns';
import {
    getJanjiTemu,
    getReminderFoundationNaikModul,
    getDashboardProspektifPersonal,
    getTicketingInternal
} from '@/features/cso/csoApiService';
import { JABATAN } from '@/utils/constants/accessControl';

/**
 * Custom hook untuk aggregate task summary dari berbagai sources
 * Menghitung tasks berdasarkan status dan deadline hari ini
 * 
 * @returns {Object} Task summary data
 * @returns {number} assigned - Total tasks assigned
 * @returns {number} completed - Total tasks completed
 * @returns {number} onProgress - Total tasks on progress
 * @returns {number} completionRate - Completion percentage (0-100)
 * @returns {boolean} isLoading - Loading state
 * @returns {boolean} hasData - Whether there's any task data
 * 
 * @example
 * const { assigned, completed, onProgress, completionRate, isLoading } = useTaskSummary();
 * 
 * @see IMPLEMENTATION_STATUS.md - Section "Task Summary Hook" untuk dokumentasi lengkap
 * cara extend task baru atau tambah jabatan baru
 */
export const useTaskSummary = () => {
    const { currentUser } = useContext(AuthContext);
    const jabatan = currentUser?.jabatan;
    
    // Format tanggal: YYYY-MM-DD untuk API
    const today = format(new Date(), 'yyyy-MM-dd');

    // Parallel fetch semua data
    const queries = useQueries({
        queries: [
            {
                queryKey: ['janjiTemu'],
                queryFn: getJanjiTemu,
                enabled: jabatan === JABATAN.CSO,
                staleTime: 1000 * 60 * 5
            },
            {
                queryKey: ['reminderFoundation', today],
                queryFn: () => getReminderFoundationNaikModul(today),
                enabled: jabatan === JABATAN.CSO,
                staleTime: 1000 * 60 * 5
            },
            {
                queryKey: ['dashboardProspektif', today],
                queryFn: () => getDashboardProspektifPersonal(today),
                enabled: jabatan === JABATAN.CSO,
                staleTime: 1000 * 60 * 5
            },
            {
                queryKey: ['ticketingInternal'],
                queryFn: getTicketingInternal,
                enabled: jabatan === JABATAN.ESO,
                staleTime: 1000 * 60 * 5
            }
        ]
    });

    const [janjiTemuQuery, foundationQuery, prospektifQuery, ticketQuery] = queries;

    // Loading state
    const isLoading = queries.some(q => q.isLoading);

    // Calculate task counts based on jabatan
    const calculateTaskSummary = () => {
        if (jabatan === JABATAN.CSO) {
            // Janji Temu
            const janjiTemuOpen = janjiTemuQuery.data?.dataOpen || [];
            const janjiTemuDone = janjiTemuQuery.data?.dataDone || [];
            
            // Filter janji temu hari ini
            const todayDate = new Date();
            const todayStr = format(todayDate, 'd MMMM yyyy');
            const janjiTemuToday = janjiTemuOpen.filter(item => 
                item.tanggal && item.tanggal.includes(todayStr.split(' ')[0])
            );
            const janjiTemuDoneToday = janjiTemuDone.filter(item =>
                item.tanggal && item.tanggal.includes(todayStr.split(' ')[0])
            );

            // Foundation naik modul
            const foundationCount = foundationQuery.data?.length || 0;

            // Prospektif follow up (gabungan FU1, FU2, FU3)
            const prospektifData = prospektifQuery.data?.data || {};
            const fu1Count = prospektifData.list_ongoing_fu1?.length || 0;
            const fu2Count = prospektifData.list_ongoing_fu2?.length || 0;
            const fu3Count = prospektifData.list_ongoing_fu3?.length || 0;
            const prospektifCount = fu1Count + fu2Count + fu3Count;

            // Calculate totals
            const assigned = janjiTemuToday.length + foundationCount + prospektifCount;
            const completed = janjiTemuDoneToday.length;
            const onProgress = janjiTemuToday.length; // Janji temu open = on progress
            const completionRate = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;

            return {
                assigned,
                completed,
                onProgress,
                completionRate
            };
        }

        if (jabatan === JABATAN.ESO) {
            // Tickets
            const allTickets = ticketQuery.data || [];
            const progressTickets = allTickets.filter(t => t.status === 'Progress');
            const doneTickets = allTickets.filter(t => t.status === 'Done');

            const assigned = allTickets.length;
            const completed = doneTickets.length;
            const onProgress = progressTickets.length;
            const completionRate = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;

            return {
                assigned,
                completed,
                onProgress,
                completionRate
            };
        }

        // Default for other jabatan
        return {
            assigned: 0,
            completed: 0,
            onProgress: 0,
            completionRate: 0
        };
    };

    const taskSummary = calculateTaskSummary();

    return {
        ...taskSummary,
        isLoading,
        hasData: taskSummary.assigned > 0
    };
};
