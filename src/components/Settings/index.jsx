import React, { useState, useContext, useEffect } from 'react';
import { 
    Input, 
    Badge,
    Switch,
    useColorMode
} from '@chakra-ui/react';
import { 
    FiUser, 
    FiLock, 
    FiMonitor, 
    FiMail, 
    FiBriefcase,
    FiShield,
    FiKey,
    FiClock,
    FiSun,
    FiMoon,
    FiSave,
    FiX
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import StyledSettingsPage from './Settings.Styled';
import { toaster } from '@/components/ui/toaster';

function Settings() {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const { colorMode, toggleColorMode } = useColorMode();

    // Profile state
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        nama: currentUser?.nama || '',
        email: currentUser?.email || '',
        role: currentUser?.role || '',
        jabatan: currentUser?.jabatan || '',
        noHp: currentUser?.noHp || '' // Assuming backend has this field
    });

    const [originalData, setOriginalData] = useState({ ...profileData });
    const [isLoading, setIsLoading] = useState(false);

    // Mock login history - TODO: Fetch from backend
    const [loginHistory] = useState([
        {
            date: '2026-02-28',
            time: '09:30',
            device: 'Chrome on Windows',
            status: 'success'
        },
        {
            date: '2026-02-27',
            time: '08:45',
            device: 'Chrome on Windows',
            status: 'success'
        },
        {
            date: '2026-02-26',
            time: '10:15',
            device: 'Firefox on Windows',
            status: 'success'
        }
    ]);

    useEffect(() => {
        if (currentUser) {
            const data = {
                nama: currentUser.nama || '',
                email: currentUser.email || '',
                role: currentUser.role || '',
                jabatan: currentUser.jabatan || '',
                noHp: currentUser.noHp || ''
            };
            setProfileData(data);
            setOriginalData(data);
        }
    }, [currentUser]);

    const handleInputChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        
        try {
            // TODO: Call backend API to update profile
            // await updateProfile(profileData);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setOriginalData({ ...profileData });
            setIsEditing(false);
            
            toaster.create({
                title: 'Profil Berhasil Diperbarui',
                description: 'Data profil Anda telah disimpan.',
                type: 'success',
                duration: 3000
            });
        } catch (error) {
            toaster.create({
                title: 'Gagal Memperbarui Profil',
                description: error.message || 'Terjadi kesalahan saat menyimpan.',
                type: 'error',
                duration: 3000
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setProfileData({ ...originalData });
        setIsEditing(false);
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleBadgeColor = (role) => {
        const colors = {
            admin: 'purple',
            super_admin: 'red',
            cso_l1: 'blue',
            cso_l2: 'cyan',
            eso: 'green',
            staff: 'gray'
        };
        return colors[role] || 'gray';
    };

    if (!currentUser) {
        navigate('/login');
        return null;
    }

    return (
        <StyledSettingsPage>
            <div className="page-header">
                <h1>Pengaturan</h1>
                <p>Kelola profil, keamanan, dan preferensi tampilan Anda</p>
            </div>

            <div className="settings-container">
                {/* Profile Section */}
                <div className="settings-section">
                    <div className="section-header">
                        <FiUser />
                        <h2>Profil</h2>
                    </div>
                    <div className="section-content">
                        <div className="profile-grid">
                            <div className="profile-avatar">
                                <div className="avatar-circle">
                                    {getInitials(profileData.nama)}
                                </div>
                                <div className="avatar-name">{profileData.nama}</div>
                            </div>

                            <div className="profile-fields">
                                <div className="field-group">
                                    <label>
                                        <FiUser />
                                        Nama Lengkap
                                    </label>
                                    <Input
                                        value={profileData.nama}
                                        onChange={(e) => handleInputChange('nama', e.target.value)}
                                        isDisabled={!isEditing}
                                        size="lg"
                                    />
                                </div>

                                <div className="field-group">
                                    <label>
                                        <FiMail />
                                        Email
                                    </label>
                                    <Input
                                        value={profileData.email}
                                        isDisabled={true}
                                        size="lg"
                                        className="read-only"
                                    />
                                </div>

                                <div className="field-group">
                                    <label>
                                        <FiShield />
                                        Role & Jabatan
                                    </label>
                                    <div className="badge-group">
                                        <Badge 
                                            colorScheme={getRoleBadgeColor(profileData.role)}
                                            fontSize="0.9rem"
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                        >
                                            {profileData.role?.toUpperCase()}
                                        </Badge>
                                        <Badge 
                                            colorScheme="orange"
                                            fontSize="0.9rem"
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                        >
                                            <FiBriefcase style={{ display: 'inline', marginRight: '0.25rem' }} />
                                            {profileData.jabatan}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="save-button-container">
                            {!isEditing ? (
                                <button 
                                    className="primary"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <FiUser />
                                    Edit Profil
                                </button>
                            ) : (
                                <>
                                    <button 
                                        className="primary"
                                        onClick={handleSave}
                                        disabled={isLoading}
                                    >
                                        <FiSave />
                                        {isLoading ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                    <button 
                                        className="secondary"
                                        onClick={handleCancel}
                                        disabled={isLoading}
                                    >
                                        <FiX />
                                        Batal
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="settings-section">
                    <div className="section-header">
                        <FiLock />
                        <h2>Keamanan</h2>
                    </div>
                    <div className="section-content">
                        <button 
                            className="action-button"
                            onClick={() => navigate('/update-password')}
                        >
                            <FiKey />
                            Ubah Password
                        </button>

                        <div className="field-group">
                            <label>
                                <FiClock />
                                Riwayat Login Terakhir
                            </label>
                            <table className="login-history-table">
                                <thead>
                                    <tr>
                                        <th>Tanggal</th>
                                        <th>Waktu</th>
                                        <th>Device</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loginHistory.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.date}</td>
                                            <td>{item.time}</td>
                                            <td>{item.device}</td>
                                            <td>
                                                <span className={`status-badge ${item.status}`}>
                                                    {item.status === 'success' ? 'Berhasil' : 'Gagal'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Display Section */}
                <div className="settings-section">
                    <div className="section-header">
                        <FiMonitor />
                        <h2>Tampilan</h2>
                    </div>
                    <div className="section-content">
                        <div className="theme-toggle-container">
                            <div className="toggle-info">
                                {colorMode === 'light' ? <FiSun /> : <FiMoon />}
                                <div className="toggle-text">
                                    <h3>Mode {colorMode === 'light' ? 'Terang' : 'Gelap'}</h3>
                                    <p>Sesuaikan tema tampilan dashboard</p>
                                </div>
                            </div>
                            <Switch 
                                isChecked={colorMode === 'dark'}
                                onChange={toggleColorMode}
                                size="lg"
                                colorScheme="orange"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </StyledSettingsPage>
    );
}

export default Settings;
