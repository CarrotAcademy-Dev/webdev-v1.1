import InfoCard from '@/components/InfoCard';
import StyledProspectivePage from './ProspectivePage.Styled';
import { FiUsers, FiClipboard, FiMessageSquare } from 'react-icons/fi';
import ContainerCarrot from '@/components/Container';
import ProgressBarChart from '@/components/ProgressBarChart';
import SistemTabs from '@/components/SistemTabs';

const tabItems = [
    { key: 'trialClass', label: 'Trial Class' },
    { key: 'firstClass', label: 'First Class' },
    { key: 'followUp1', label: 'FU 1' },
    { key: 'followUp2', label: 'FU 2' },
    { key: 'followUp3', label: 'FU 3' }
];
const data = {
    "trialClass": [
        { no: 1, name: 'Paula Mora', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '12346', done: true },
        { no: 2, name: 'Autumn Phillips', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '128738', done: false },
        { no: 3, name: 'Frances Swann', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '126738', done: true },
        { no: 4, name: 'Autumn Phillips', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '128738', done: true },
        { no: 5, name: 'Frances Swann', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '126738', done: false },
        { no: 6, name: 'Paula Mora', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '12346', done: true },
        { no: 7, name: 'Autumn Phillips', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '128738', done: false },
        { no: 8, name: 'Frances Swann', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '126738', done: true },
        { no: 9, name: 'Autumn Phillips', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '128738', done: true },
        { no: 10, name: 'Frances Swann', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '126738', done: false },
        { no: 11, name: 'Paula Mora', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '12346', done: true },
        { no: 12, name: 'Paula Mora', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '12347', done: true },
        { no: 13, name: 'Autumn Phillips', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '128737', done: false },
        { no: 14, name: 'Frances Swann', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '126737', done: true },
        { no: 15, name: 'Autumn Phillips', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '128737', done: true },
        { no: 16, name: 'Frances Swann', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '126737', done: false },
        { no: 17, name: 'Paula Mora', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '12347', done: true },
        { no: 18, name: 'Autumn Phillips', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '128737', done: false },
        { no: 19, name: 'Frances Swann', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '126737', done: true },
        { no: 20, name: 'Autumn Phillips', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '128737', done: true },
        { no: 21, name: 'Frances Swann', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '126737', done: false },
        { no: 22, name: 'Paula Mora', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '12347', done: true }
    ],
    "firstClass": [
        { no: 1, name: 'Paula Mora', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '12346', done: true },
        { no: 2, name: 'Autumn Phillips', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '128738', done: false },
        { no: 3, name: 'Frances Swann', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '126738', done: true },
        { no: 4, name: 'Autumn Phillips', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '128738', done: true },
        { no: 5, name: 'Frances Swann', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '126738', done: false },
        { no: 6, name: 'Paula Mora', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '12346', done: true },
        { no: 7, name: 'Autumn Phillips', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '128738', done: false },
        { no: 8, name: 'Frances Swann', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '126738', done: true },
        { no: 9, name: 'Autumn Phillips', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '128738', done: true },
        { no: 10, name: 'Frances Swann', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '126738', done: false },
        { no: 11, name: 'Paula Mora', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '12346', done: true },
        { no: 12, name: 'Paula Mora', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '12347', done: true },
        { no: 13, name: 'Autumn Phillips', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '128737', done: false },
        { no: 14, name: 'Frances Swann', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '126737', done: true },
        { no: 15, name: 'Autumn Phillips', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '128737', done: true },
        { no: 16, name: 'Frances Swann', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '126737', done: false },
        { no: 17, name: 'Paula Mora', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '12347', done: true },
        { no: 18, name: 'Autumn Phillips', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '128737', done: false },
        { no: 19, name: 'Frances Swann', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '126737', done: true },
        { no: 20, name: 'Autumn Phillips', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '128737', done: true },
        { no: 21, name: 'Frances Swann', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '126737', done: false },
        { no: 22, name: 'Paula Mora', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '12347', done: true }
    ],
    "followUp1": [
        { no: 1, name: 'Paula Mora', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '12346', done: true },
        { no: 2, name: 'Autumn Phillips', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '128738', done: false },
        { no: 3, name: 'Frances Swann', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '126738', done: true },
        { no: 4, name: 'Autumn Phillips', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '128738', done: true },
        { no: 5, name: 'Frances Swann', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '126738', done: false },
        { no: 6, name: 'Paula Mora', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '12346', done: true },
        { no: 7, name: 'Autumn Phillips', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '128738', done: false },
        { no: 8, name: 'Frances Swann', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '126738', done: true },
        { no: 9, name: 'Autumn Phillips', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '128738', done: true },
        { no: 10, name: 'Frances Swann', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '126738', done: false },
        { no: 11, name: 'Paula Mora', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '12346', done: true },
        { no: 12, name: 'Paula Mora', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '12347', done: true },
        { no: 13, name: 'Autumn Phillips', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '128737', done: false },
        { no: 14, name: 'Frances Swann', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '126737', done: true },
        { no: 15, name: 'Autumn Phillips', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '128737', done: true },
        { no: 16, name: 'Frances Swann', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '126737', done: false },
        { no: 17, name: 'Paula Mora', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '12347', done: true },
        { no: 18, name: 'Autumn Phillips', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '128737', done: false },
        { no: 19, name: 'Frances Swann', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '126737', done: true },
        { no: 20, name: 'Autumn Phillips', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '128737', done: true },
        { no: 21, name: 'Frances Swann', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '126737', done: false },
        { no: 22, name: 'Paula Mora', tanggal: '18 Jun 2025', noHp: '0822512847298', psid: '12347', done: true },
    ],
    "followUp2": [],
    "followUp3": []
};

const headerItems = [
    { key: 'no', label: 'No' },
    { key: 'name', label: 'Nama' },
    { key: 'tanggal', label: 'Tanggal' },
    { key: 'noHp', label: 'No. Handphone' },
    { key: 'psid', label: 'PSID' },
    { key: 'done', label: 'Done?' }
]

function ProspectivePage() {
    return (
        <StyledProspectivePage>
            <ContainerCarrot>
                <div className="hero-section">
                    <div className="hero-section__left">
                        <h1 className="page-title">Prospective - Overview</h1>
                        <div className="stats-grid-prospective">
                            <InfoCard><FiUsers size="30px" /> <p>Trial Class</p> <p className="card__points">20</p></InfoCard>
                            <InfoCard><FiUsers size="30px" /> <p>First Class</p> <p className="card__points">2</p></InfoCard>
                            <InfoCard><FiUsers size="30px" /> <p>Dari Marcom</p> <p className="card__points">18</p></InfoCard>
                            <InfoCard><FiMessageSquare size="30px" /> <p>Follow Up 1</p> <p className="card__points">5</p></InfoCard>
                            <InfoCard><FiMessageSquare size="30px" /> <p>Follow Up 2</p> <p className="card__points">2</p></InfoCard>
                            <InfoCard><FiMessageSquare size="30px" /> <p>Follow Up 3</p> <p className="card__points">3</p></InfoCard>
                        </div>
                    </div>
                    <div className="hero-section__right">
                        <InfoCard>
                            <ProgressBarChart />
                        </InfoCard>
                    </div>
                </div>
            </ContainerCarrot>
            <div className="main-content-section">
                <SistemTabs tabItems={tabItems} tableData={data} headerItems={headerItems} />
            </div>
        </StyledProspectivePage>
    );
}

export default ProspectivePage;