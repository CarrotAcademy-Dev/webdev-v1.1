import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import { isSameDay, isToday, addDays, subDays } from 'date-fns';
import StyledCalendarWrapper from './AttendanceCalendar.Styled';

// --- DUMMY DATA --
const attendanceDates = [ new Date(2025, 5, 2), new Date(2025, 5, 4), new Date(2025, 5, 5), new Date(2025, 5, 6), new Date(2025, 5, 7), new Date(2025, 5, 9), new Date(2025, 5, 10), new Date(2025, 5, 11), new Date(2025, 5, 12), new Date(2025, 5, 13), new Date(2025, 5, 14), new Date(2025, 5, 16), new Date(2025, 5, 17), new Date(2025, 5, 18) ];

function AttendanceCalendar() {
    const [value, setValue] = useState(new Date());
    const [holidays, setHolidays] = useState([]);
    const [isloading, setIsLoading] = useState(true);
    const [selectedDayInfo, setSelectedDayInfo] = useState('');

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

    if (isloading) {
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