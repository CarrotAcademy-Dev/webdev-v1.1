import React, { useMemo } from 'react';
import StyledRemindersWidget from './RemindersWidget.Styled';
import { Button } from '@chakra-ui/react';
import { differenceInMinutes, parseISO } from 'date-fns';
import { BsFillCameraVideoFill } from 'react-icons/bs';

// --- DUMMY DATA ---
const remindersData = [
    {
        id: 1,
        title: 'Meeting with Client',
        startTime: '2025-06-25T17:30:00',
        displayTime: '17:30 - 18:00 GMT',
        actionable: true,
    },
    {
        id: 2,
        title: 'Submit Weekly Report',
        startTime: '2025-06-25T17:00:00',
        displayTime: 'Before 17:00',
        actionable: false,
    },
    {
        id: 3,
        title: 'Daily Standup',
        startTime: '2025-06-26T09:00:00',
        displayTime: '09:00 - 09:15',
        actionable: true,
    }
];

function RemindersWidget() {
    const upcomingReminders = useMemo(() => {
        const now = new Date();
        const upcomingWindowInMinutes = 30;

        return remindersData.filter(reminder => {
            const reminderStartTime = parseISO(reminder.startTime);
            const diff = differenceInMinutes(reminderStartTime, now);
            
            return diff >= 0 && diff <= upcomingWindowInMinutes;
        });
    }, []);

    return (
        <StyledRemindersWidget>
            <h3 className="widget-title">Reminders</h3>
            <ul className="reminders-list">
                {upcomingReminders.length > 0 ? (
                    upcomingReminders.map(item => (
                        <li key={item.id} className="reminder-item">
                            <div className="reminder-details">
                                <p className="reminder-title">{item.title}</p>
                                <p className="reminder-time">{item.displayTime}</p>
                            </div>
                            {item.actionable && (
                                <div className="widget-footer">
                                    <Button
                                        colorScheme="orange"
                                        bg="#FE7743"
                                        color="white"
                                        leftIcon={<BsFillCameraVideoFill />}
                                        _hover={{ bg: '#E46A3A' }}
                                    >
                                        Start Meeting
                                    </Button>
                                </div>
                            )}
                        </li>
                    ))
                ) : (
                    <p className="no-reminders">No upcoming reminders.</p>
                )}
            </ul>
        </StyledRemindersWidget>
    );
}

export default RemindersWidget;