import React, { useContext, useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import { isSameDay, isToday, addDays, subDays, format } from 'date-fns';
import StyledCalendarWrapper from './AttendanceCalendar.Styled';
import { useQuery } from '@tanstack/react-query';
import { getAbsensiBulanan } from '@/features/cso/csoApiService';
import { AuthContext } from '@/context/AuthContext';

function AttendanceCalendar() {
    const { currentUser } = useContext(AuthContext);
    const [value, setValue] = useState(new Date());
    const [holidays, setHolidays] = useState([]);
    const [isloading, setIsLoading] = useState(true);
    const [selectedDayInfo, setSelectedDayInfo] = useState('');
    const [attendanceDates, setAttendanceDates] = useState([]);

    // Fetch attendance data for current displayed month
    const currentMonth = format(value, 'MMM yyyy');
    
    const { data: attendanceData, isLoading: isLoadingAttendance } = useQuery({
        queryKey: ['absensiBulanan', currentUser?.nama, currentMonth],
        queryFn: () => getAbsensiBulanan(currentMonth),
        enabled: !!currentUser?.nama,
        staleTime: 1000 * 60 * 5
    });

    // Convert attendance data to dates array
    useEffect(() => {
        if (attendanceData?.result) {
            const dates = attendanceData.result
                .filter(item => item.attendance === 'Hadir')
                .map(item => {
                    const monthNumber = getMonthNumber(item.month);
                    return new Date(item.year, monthNumber, item.dayNum);
                });
            setAttendanceDates(dates);
        }
    }, [attendanceData]);

    const getMonthNumber = (monthName) => {
        const months = {
            'January': 0, 'February': 1, 'March': 2, 'April': 3,
            'May': 4, 'June': 5, 'July': 6, 'August': 7,
            'September': 8, 'October': 9, 'November': 10, 'December': 11
        };
        return months[monthName] || 0;
    };

    useEffect(() => {
         const fetchHolidays = async () => {
            try {
                const response = await fetch('https://api-harilibur.vercel.app/api');
                const data = await response.json();
                const filteredData = data.filter(item => item.is_national_holiday);

                setHolidays(filteredData);
            } catch (error) {
                console.error("Gagal mengambil data liburan:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHolidays();
    }, []);

    const isAttended = (date, attendedDays) => attendedDays.some(d => isSameDay(d, date));
    const isHoliday = (date, holidays) => {
        const uniqueHolidays = holidays.filter(
            (holiday, index, self) => index === self.findIndex((t) => t.holiday_date === holiday.holiday_date)
        );
        return uniqueHolidays.some(h => isSameDay(new Date(h.holiday_date), date));
    };

    const today = new Date();
    
    function handleDayClick(clickedDate) {
        const holidayInfo = holidays.find(h => isSameDay(new Date(h.holiday_date), clickedDate));
        const attendedInfo = isAttended(clickedDate, attendanceDates);
        const dayName = clickedDate.toLocaleDateString('en-US', { weekday: 'long' });


        if (holidayInfo) {
            setSelectedDayInfo(`Libur: ${holidayInfo.holiday_name}`);
        } else if (attendedInfo) {
            setSelectedDayInfo('Status: Hadir');
        } else if (clickedDate <= today && dayName != "Sunday") {
            setSelectedDayInfo('Status: Tidak Hadir');
        } else {
            setSelectedDayInfo('');
        }
    }

    function tileClassName({ date, view }) {
        if (view !== 'month') {
            return '';
        }

        const classes = [];

        if (isHoliday(date, holidays)) {
            classes.push('holiday');
        }

        const attended = isAttended(date, attendanceDates);

        if (attended) {
            classes.push('attended');
            const prevDayAttended = isAttended(subDays(date, 1), attendanceDates);
            const nextDayAttended = isAttended(addDays(date, 1), attendanceDates);

            if (!prevDayAttended && nextDayAttended) classes.push('range-start');
            if (prevDayAttended && !nextDayAttended) classes.push('range-end');
            if (prevDayAttended && nextDayAttended) classes.push('range-middle');
        }

        if (isToday(date)) {
            classes.push('today');
        }
        
        return classes.join(' ');
    }

    if (isloading || isLoadingAttendance) {
        return <p>Loading calendar...</p>;
    }

    return (
        <StyledCalendarWrapper>
            <h3>Attendance</h3>
            <Calendar
                onChange={setValue}
                value={value}
                tileClassName={tileClassName}
                next2Label={null}
                prev2Label={null}
                onClickDay={handleDayClick}
            />
            <div className="info-box">
                <p>{selectedDayInfo}</p>
            </div>
        </StyledCalendarWrapper>
    );
}

export default AttendanceCalendar;