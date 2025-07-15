import StyledHero from "./Hero.Styled";
import womanavatar from "../../assets/images/womanavatar.svg"
import InfoCard from "../InfoCard";
import { FiClock, FiStar } from "react-icons/fi";
import { LuClipboardCheck, LuClipboardPenLine, LuClipboardPlus } from "react-icons/lu";
import { IoStatsChart } from "react-icons/io5";
import TasksChart from "../TasksChart";
import AttendanceCalendar from "../AttendanceCalendar";
import RemindersWidget from "../RemindersWidget";
import Container from "../Container";

function Hero() {
    return (
        <Container>
            <StyledHero>
                <div className="hero__left">
                    <div className="greetings">
                        <h2>Hallo, Cristin!</h2>
                        <p>Customer Office Officer</p>
                    </div>
                    <div className="cards__profile">
                        <InfoCard>
                            <img src={womanavatar} alt="avatar" />
                            <p className="profile__name">Cristin Magdalena Sitompul</p>
                        </InfoCard>
                        <InfoCard>
                            <FiClock size="30px" color="#FE7743" />
                            <p className="card__text">You clocked in at</p><p><strong>8.59 AM</strong></p>
                            <p className="card__subtext__sub">You reached a <span>13 day streak!</span></p>
                        </InfoCard>
                        <InfoCard>
                            <FiStar size="30px" color="#FE7743" style={{ fill: '#FE7743' }} />
                            <p className="card__points">50 pts</p>
                            <p className="card__subtext">You're in #1 place</p>
                        </InfoCard>
                    </div>
                    <h3 className="section-title">Task Summary - Today</h3>
                    <div className="task-summary-grid">
                        <InfoCard><LuClipboardPlus size="30px" color="#FE7743" /> <p>Assigned</p> <p className="card__points">50</p></InfoCard>
                        <InfoCard><LuClipboardCheck size="30px" color="#FE7743" /> <p>Completed</p> <p className="card__points">2</p></InfoCard>
                        <InfoCard><LuClipboardPenLine size="30px" color="#FE7743" /> <p>On Progress</p> <p className="card__points">18</p></InfoCard>
                        <InfoCard className="dark-card"><IoStatsChart size="30px" color="#FFFFFF"/><strong>10%</strong> <p>Completion</p></InfoCard>
                    </div>
                    <div className="tasks-completed-chart">
                        <TasksChart />
                    </div>
                </div>
                <div className="hero__right">
                    <div className="bottom-widgets-grid">
                        <div className="calendar-widget">
                            <InfoCard>
                                <AttendanceCalendar />
                            </InfoCard>
                        </div>

                        <div className="reminders-widget">
                            <InfoCard>
                                <RemindersWidget />
                            </InfoCard>
                        </div>
                    </div>
                </div>
            </StyledHero>
        </Container>
    );
}

export default Hero;