import InfoCard from "@/components/InfoCard";
import womanavatar from "../../assets/images/womanavatar.svg";
import manavatar from "../../assets/images/manavatar.svg";
import { FiClock, FiStar } from "react-icons/fi";
import { LuClipboardCheck, LuClipboardPenLine, LuClipboardPlus } from "react-icons/lu";
import { IoStatsChart } from "react-icons/io5";
import TasksChart from "@/components/TasksChart";
import AttendanceCalendar from "@/components/AttendanceCalendar";
import RemindersWidget from "@/components/RemindersWidget";
import HeroLayout from "@/components/HeroLayout";
import ContainerCarrot from "@/components/Container";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getAbsensiBulanan } from "@/features/cso/csoApiService";
import { format } from "date-fns";
import { useColorMode, Spinner, Box } from "@chakra-ui/react";
import { useTaskSummary } from "@/hooks/useTaskSummary";


function OverviewPage() {
    const { currentUser } = useContext(AuthContext);
    const { colorMode } = useColorMode();
    
    // Icon color based on theme
    const iconColor = colorMode === 'dark' ? '#FF9B7B' : '#FE7743';
    const whiteIconColor = colorMode === 'dark' ? '#E2E8F0' : '#FFFFFF';

    // Fetch task summary
    const { assigned, completed, onProgress, completionRate, isLoading: loadingTasks } = useTaskSummary();

    // Fetch attendance data for current month
    const currentDate = new Date();
    const currentMonth = format(currentDate, 'MMM yyyy');
    
    const { data: attendanceData } = useQuery({
        queryKey: ['absensiBulanan', currentUser?.nama, currentMonth],
        queryFn: () => getAbsensiBulanan(currentMonth),
        enabled: !!currentUser?.nama,
        staleTime: 1000 * 60 * 5
    });

    // Get today's attendance
    const today = new Date();
    const todayDate = `${today.getDate()} ${format(today, 'MMMM')} ${today.getFullYear()}`;
    const todayAttendance = attendanceData?.result?.find(item => item.date === todayDate) || null;

    // Calculate attendance streak
    const calculateStreak = () => {
        if (!attendanceData?.result || attendanceData.result.length === 0) return 0;

        const sortedAttendance = [...attendanceData.result].sort((a, b) => {
            const dateA = new Date(a.year, getMonthNumber(a.month), a.dayNum);
            const dateB = new Date(b.year, getMonthNumber(b.month), b.dayNum);
            return dateB - dateA; // Sort descending (newest first)
        });

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < sortedAttendance.length; i++) {
            const attendance = sortedAttendance[i];
            const attendanceDate = new Date(attendance.year, getMonthNumber(attendance.month), attendance.dayNum);
            attendanceDate.setHours(0, 0, 0, 0);

            // Calculate expected date based on streak
            const expectedDate = new Date(today);
            expectedDate.setDate(today.getDate() - streak);

            // Check if this attendance date matches the expected date
            if (attendanceDate.getTime() === expectedDate.getTime()) {
                // Check if attended (Hadir)
                if (attendance.attendance === 'Hadir') {
                    streak++;
                } else {
                    // If not attended, break the streak
                    break;
                }
            } else if (attendanceDate < expectedDate) {
                // If date is before expected, streak is broken
                break;
            }
        }

        return streak;
    };

    const getMonthNumber = (monthName) => {
        const months = {
            'January': 0, 'February': 1, 'March': 2, 'April': 3,
            'May': 4, 'June': 5, 'July': 6, 'August': 7,
            'September': 8, 'October': 9, 'November': 10, 'December': 11
        };
        return months[monthName] || 0;
    };

    const attendanceStreak = calculateStreak();

    if (!currentUser) {
        return <div>Loading...</div>;
    }

    const firstName = currentUser.nama.split(' ')[0];

    const dashboardLeftContent = (
        <>
            <div className="cards__profile">
                <InfoCard hoverable>
                    <img src={currentUser.jenisKelamin === "Perempuan" ? womanavatar : manavatar} alt="avatar" />
                    <p className="profile__name">{currentUser.nama}</p>
                </InfoCard>
                <InfoCard to="/attendance" hoverable>
                    <FiClock size="30px" color={iconColor} />
                    <p className="card__text">You clocked in at <strong>{todayAttendance?.check_in || '-'}</strong></p>
                    <p className="card__subtext__sub">You reached a <span>{attendanceStreak} day streak!</span></p>
                </InfoCard>
                <InfoCard hoverable>
                    <FiStar size="30px" color={iconColor} style={{ fill: iconColor }} />
                    <p className="card__points">50 pts</p>
                    <p className="card__subtext">You're in #1 place</p>
                </InfoCard>
            </div>
            <h3 className="section-title">Task Summary - Today</h3>
            <div className="task-summary-grid">
                <InfoCard hoverable>
                    <LuClipboardPlus size="30px" color={iconColor} /> 
                    <p>Assigned</p> 
                    {loadingTasks ? (
                        <Spinner size="md" color="orange.500" />
                    ) : (
                        <p className="card__points">{assigned}</p>
                    )}
                </InfoCard>
                <InfoCard hoverable>
                    <LuClipboardCheck size="30px" color={iconColor} /> 
                    <p>Completed</p> 
                    {loadingTasks ? (
                        <Spinner size="md" color="orange.500" />
                    ) : (
                        <p className="card__points">{completed}</p>
                    )}
                </InfoCard>
                <InfoCard hoverable>
                    <LuClipboardPenLine size="30px" color={iconColor} /> 
                    <p>On Progress</p> 
                    {loadingTasks ? (
                        <Spinner size="md" color="orange.500" />
                    ) : (
                        <p className="card__points">{onProgress}</p>
                    )}
                </InfoCard>
                <InfoCard className="dark-card" hoverable>
                    <IoStatsChart size="30px" color={whiteIconColor}/>
                    {loadingTasks ? (
                        <Spinner size="md" color="white" />
                    ) : (
                        <strong>{completionRate}%</strong>
                    )}
                    <p>Completion</p>
                </InfoCard>
            </div>
            <div className="tasks-completed-chart">
                <TasksChart />
            </div>
        </>
    );

    const dashboardRightContent = (
        <div className="bottom-widgets-grid">
            <div className="calendar-widget">
                <InfoCard><AttendanceCalendar /></InfoCard>
            </div>
            <div className="reminders-widget">
                <InfoCard><RemindersWidget /></InfoCard>
            </div>
        </div>
    );
    
    return (
        <ContainerCarrot>
            <HeroLayout 
                title={`Hallo, ${firstName}`}
                subtitle={currentUser.jabatan}
                leftContent={dashboardLeftContent}
                rightContent={dashboardRightContent}
            />
        </ContainerCarrot>
    );
}

export default OverviewPage;