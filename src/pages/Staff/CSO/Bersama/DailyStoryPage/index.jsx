import ContainerCarrot from "@/components/Container";
import { StyledDailyStoryPage } from "./DailyStoryPage.styled";
import InfoCard from "@/components/InfoCard";
import { useMemo } from "react";
import { LuCloudOff, LuCloudUpload} from "react-icons/lu";
import ProgressBarChart from "@/components/ProgressBarChart";
import SistemTabs from "@/components/SistemTabs";
import { Checkbox, useToast } from "@chakra-ui/react";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { endOfWeek, format, parse, startOfWeek } from "date-fns";
import { useMutation, useQueryClient, useQuery, } from "@tanstack/react-query";
import { getDailyStoryData, markStoryAsDone } from "@/features/cso/csoApiService";

const tabItems = [
    {key: 'undone', label: 'Not Done'},
    {key: 'done', label: 'Done'}
];

function DailyStoryPage() {
    const queryClient = useQueryClient();
    const toast = useToast();

    const { data: story, isLoading, isError, error } = useQuery({
        queryKey: ['dailyStory'],
        queryFn: getDailyStoryData,
        placeholderData: { undone: [], done: [] }
    });

    const { mutate: markDoneMutation } = useMutation({
        mutationFn: (rowData) => markStoryAsDone(rowData.tanggal),
        onMutate: async (updatedRow) => {
            await queryClient.cancelQueries({ queryKey: ['dailyStory'] });

            const previousStoryData = queryClient.getQueryData(['dailyStory']);

            queryClient.setQueryData(['dailyStory'], (oldData) => {
                if (!oldData) return { undone: [], done: [] };
                const newUndone = oldData.undone.map(item => {
                    if (item.id === updatedRow.id) {
                        return { ...item, done: true };
                    }
                    return item;
                });
                return { ...oldData, undone: newUndone };
            });
            return { previousStoryData };
        },
        onError: (error, updatedRow, context) => {
            if (context.previousStoryData) {
                queryClient.setQueryData(['dailyStory'], context.previousStoryData);
            }
            toast({
                title: 'Action Failed',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true
            });
        },
        onSuccess: () => {
            toast({
                title: 'Update Sukses!',
                status: 'success',
                duration: 2000,
                isClosable: true
            });

            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['dailyStory'] });
            }, 500);
        },
    });

    const handleStoryDone = (rowData) => {
       markDoneMutation(rowData);
    }

    const headerItems = [
        { key: 'no', label: 'No' },
        { key: 'tanggal', label: 'Tanggal' },
        { key: 'link_dropbox', label: 'Link Dropbox' },
        { key: 'status_marcom_ceklis', label: 'Status Marcom' },
        { 
            key: 'done',
            label: 'Done?',
            render: (item) => (
                <Checkbox
                    isChecked={item.done}
                    isDisabled={item.done} 
                    onChange={() => handleStoryDone(item)}
                    colorScheme="orange"
                    sx={{
                        borderColor: 'orange.200', 
                        bg: 'white',
                        '.chakra-checkbox__control': {
                            '&[data-checked]': {
                                bg: '#f9dbcfff',
                                borderColor: '#f9dbcfff',
                            },
                            '&[data-checked]:hover': {
                                bg: '#FE7743',
                                borderColor: '#FE7743',
                            }
                        }
                    }}
                />
            )
        }
    ];

    const parseTimestamp = (timestamp) => {
        if (!timestamp || timestamp === '-') return null;
        
        try {
            // Format 1: M/d/yyyy HH:mm:ss (old format from sheet)
            // Example: 8/8/2025 11:08:53
            const parsed = parse(timestamp, 'M/d/yyyy HH:mm:ss', new Date());
            if (!isNaN(parsed.getTime())) return parsed;
        } catch {
            // Format 1 failed, try next
        }

        try {
            // Format 2: JavaScript Date toString() format (new format from backend)
            // Example: "timestamp Wed Nov 19 2025 11:45:01 GMT+0700\n pic : CM"
            // Need to extract only the date part before newline
            let cleanedTimestamp = timestamp;
            
            // Remove "timestamp " prefix
            cleanedTimestamp = cleanedTimestamp.replace(/^timestamp\s+/, '');
            
            // Extract only the date portion (before any newline or "pic:")
            const dateMatch = cleanedTimestamp.match(/^([^\n]+)/);
            if (dateMatch) {
                cleanedTimestamp = dateMatch[1].trim();
            }
            
            const parsed = new Date(cleanedTimestamp);
            if (!isNaN(parsed.getTime())) return parsed;
        } catch (err) {
            console.error("Failed to parse timestamp:", timestamp, err);
        }

        return null;
    };

    const weeklyProgressData = useMemo(() => {
        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        let weekData = daysOfWeek.map(day => ({day, progress: 0}));

        const doneTasks = story.done;
        if (doneTasks.length === 0) return weekData;

        const now = new Date();
        const startOfThisWeek = startOfWeek(now, { weekStartsOn: 1 });
        const endOfThisWeek = endOfWeek(now, { weekStartsOn: 1 });

        const tasksInThisWeek = doneTasks.filter(task => {
            const taskDate = parseTimestamp(task.timestamp);
            if (!taskDate) return false;
            return taskDate >= startOfThisWeek && taskDate <= endOfThisWeek;
        });

        tasksInThisWeek.forEach(task => {
            const taskDate = parseTimestamp(task.timestamp);
            if (taskDate) {
                const dayName = format(taskDate, 'EEE');
                const dayIndex = weekData.findIndex(d => d.day.startsWith(dayName));
                if (dayIndex !== -1) {
                    weekData[dayIndex].progress += 1;
                }
            }
        });

        const maxProgressPerDay = 1; 
        weekData = weekData.map(day => ({
            ...day,
            progress: Math.min(100, (day.progress / maxProgressPerDay) * 100)
        }));

        return weekData;
    }, [story?.done])

    if (isError) return <div>Error: {error.message}</div>;
    const todayDay = format(new Date(), 'EEE');

    return (
        <StyledDailyStoryPage>
            <ContainerCarrot>
                <div className="hero-section">
                    <div className="hero-section__left">
                        <h1 className="page-title">Daily Story - Overview</h1>
                        <div className="stats-grid-prospective">
                            <InfoCard>
                                <LuCloudOff size="30px" /> 
                                <p>Total yang belum diupload</p> 
                                {isLoading ? (
                                    <Skeleton height="40px" width="60px" />
                                ) : (
                                    <p className="card__points">{story.undone.length}</p>
                                )}
                            </InfoCard>
                            <InfoCard>
                                <LuCloudUpload size="30px" /> 
                                <p>Total yang sudah diupload</p> 
                                {isLoading ? (
                                    <Skeleton height="40px" width="60px" />
                                ) : (
                                    <p className="card__points">{story.done.length}</p>
                                )}
                            </InfoCard>
                        </div>
                    </div>
                    <div className="hero-section__right">
                        <InfoCard>
                            <ProgressBarChart chartData={weeklyProgressData} todayDay={todayDay} />
                        </InfoCard>
                    </div>
                </div>
            </ContainerCarrot>
            <div className="main-content-section">
                <ContainerCarrot>
                    <SistemTabs tabItems={tabItems} tableData={story} headerItems={headerItems} isLoading={isLoading} />
                </ContainerCarrot>
            </div>
        </StyledDailyStoryPage>
    );
}

export default DailyStoryPage;
