# Token Expiry & Session Management

## Overview
Sistem token expiry dan session management untuk meningkatkan keamanan aplikasi dengan auto-logout, warning notification, dan session extension.

## Fitur Utama

### 1. **Token Expiry dengan Auto Storage**
- Token tersimpan dengan expiry time 8 jam secara default
- Auto-check expiry setiap kali `getUser()` dipanggil
- Expired token otomatis dihapus dari localStorage

### 2. **Session Monitoring**
- Check session expiry setiap 5 menit di background
- Toast notification saat token akan expired (15 menit sebelumnya)
- Auto-logout saat token sudah expired

### 3. **Session Timeout Dialog**
- Modal warning muncul saat sesi tinggal 10 menit
- User bisa pilih:
  - **Perpanjang Sesi**: Extend 8 jam lagi
  - **Logout Sekarang**: Keluar dari aplikasi

### 4. **Session Timer Badge di Navbar**
- Real-time display waktu sesi tersisa
- Color coding:
  - 🟢 **Green**: > 2 jam tersisa
  - 🟡 **Yellow**: 30 menit - 2 jam
  - 🟠 **Orange**: 10-30 menit
  - 🔴 **Red**: < 10 menit
- Tooltip hover untuk info lengkap

## Technical Implementation

### Storage Layer (`utils/storage.js`)
```javascript
// Set user dengan expiry 8 jam
auth.setUser(user, 480); // 480 menit = 8 jam

// Check token expiring soon (< 15 menit)
const expiringSoon = auth.isTokenExpiringSoon();

// Get remaining time
const minutes = auth.getTokenRemainingTime(); // Returns number

// Extend session
auth.extendToken(480); // Add 8 jam lagi
```

### Context Layer (`context/AuthContext.jsx`)
```javascript
// Methods available
const { 
  currentUser,
  login,
  logout,
  extendSession,
  getSessionTimeRemaining 
} = useContext(AuthContext);

// Extend session programmatically
extendSession(); // Perpanjang 8 jam + toast notification

// Get remaining time
const minutes = getSessionTimeRemaining();
```

### Component Layer
- **SessionTimeout**: Modal dialog saat < 10 menit
- **Navbar**: Badge timer dengan color coding
- **Layout**: Integrates SessionTimeout component

## Flow Diagram

```
User Login
    ↓
Set Token (8 jam expiry)
    ↓
[Every 5 minutes]
    ↓
Check Token Status
    ├─→ > 15 menit: Continue
    ├─→ 10-15 menit: Toast Warning
    ├─→ < 10 menit: Show Modal Dialog
    │       ├─→ User Extends: +8 jam
    │       └─→ User Logout: Clear session
    └─→ Expired (0 menit): Auto Logout
```

## UI/UX Features

### Toast Notifications
1. **Session Expiring Soon** (15 menit sebelumnya)
   - Type: Info (blue)
   - Duration: 10 detik
   - Message: "Sesi Anda akan berakhir dalam X menit. Simpan pekerjaan Anda."

2. **Session Extended**
   - Type: Success (green)
   - Duration: 3 detik
   - Message: "Sesi login Anda telah diperpanjang 8 jam."

3. **Session Expired**
   - Type: Warning (orange)
   - Duration: 5 detik
   - Message: "Sesi login Anda telah berakhir. Silakan login kembali."

### Modal Dialog (< 10 menit)
- **Title**: Sesi Akan Berakhir
- **Content**: 
  - Timer countdown
  - Suggestion untuk simpan data
  - Tips untuk avoid data loss
- **Actions**:
  - Button: "Logout Sekarang" (outline)
  - Button: "Perpanjang Sesi (8 Jam)" (primary blue)

### Navbar Badge
- **Position**: Center-left (antara logo dan menu)
- **Icon**: Clock (FiClock)
- **Format**: 
  - > 60 menit: "Xj Ym" (contoh: "2j 30m")
  - < 60 menit: "Xm" (contoh: "45m")
  - No expiry: "∞"
- **Responsive**: Visible di desktop & mobile

## Security Benefits

### Client-Side Protection
1. **Auto-cleanup expired tokens**: Tidak ada stale data di localStorage
2. **Proactive warnings**: User punya waktu untuk save work
3. **Forced logout**: Expired sessions tidak bisa digunakan
4. **Session awareness**: User tahu kapan harus refresh

### Backend Validation (REQUIRED)
**PENTING**: Client-side expiry adalah UX feature, bukan security feature utama.

Backend HARUS validate:
- Token signature & integrity
- Token expiry timestamp
- User permissions & roles
- Request authenticity

## Usage Examples

### Extend Session Programmatically
```javascript
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

function MyComponent() {
  const { extendSession } = useContext(AuthContext);
  
  const handleKeepAlive = () => {
    extendSession(); // Auto +8 jam + toast
  };
  
  return <button onClick={handleKeepAlive}>Keep Me Logged In</button>;
}
```

### Check Session Time
```javascript
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';

function SessionInfo() {
  const { getSessionTimeRemaining } = useContext(AuthContext);
  const [timeLeft, setTimeLeft] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getSessionTimeRemaining());
    }, 60000); // Update setiap menit
    
    return () => clearInterval(interval);
  }, []);
  
  return <p>Session expires in: {timeLeft} minutes</p>;
}
```

### Custom Expiry Time
```javascript
// Di login function
const result = await login(email, password);

// Override default 8 jam dengan 8 jam
auth.setUser(result, 480); // 480 menit = 8 jam
```

## Testing Checklist

### Manual Testing
- [ ] Login → Check badge muncul dengan waktu correct
- [ ] Wait 5 menit → Badge update otomatis
- [ ] Set expiry 11 menit → Modal muncul setelah 1 menit
- [ ] Click "Perpanjang" → Timer reset, modal close, toast success
- [ ] Click "Logout" → Redirect ke login page
- [ ] Wait until expired → Auto-logout + toast warning
- [ ] Refresh page dengan expired token → Auto-logout
- [ ] Navbar badge color sesuai dengan waktu tersisa

### Edge Cases
- [ ] Login dengan token expired di localStorage → Auto-cleanup
- [ ] Multiple tabs open → All tabs sync logout
- [ ] Network offline → Expiry tetap jalan (client-side)
- [ ] Browser closed → Token persist dengan expiry
- [ ] Browser reopened after expiry → Auto-logout on mount

## Future Improvements

### Potential Enhancements
1. **Activity-based extension**: Auto-extend saat user aktif
2. **Remember me**: Optional expiry 30 hari
3. **Session analytics**: Track average session duration
4. **Multi-device management**: List active sessions
5. **Idle timeout**: Auto-logout saat idle 30 menit
6. **Backend sync**: Validate expiry dengan server timestamp

### Performance Optimization
- Use `requestIdleCallback` untuk background checks
- Debounce badge updates
- Memoize session calculations

## References

### Files Modified
- `src/utils/storage.js` - Storage layer dengan expiry mechanism
- `src/context/AuthContext.jsx` - Session monitoring & management
- `src/components/SessionTimeout/index.jsx` - Modal dialog component
- `src/components/Navbar/index.jsx` - Session timer badge
- `src/components/Navbar/Navbar.Styled.jsx` - Badge styling
- `src/Layout/index.jsx` - SessionTimeout integration

### Dependencies
- React Context API
- Chakra UI (Dialog, Badge, Toast)
- localStorage API
- setInterval for background checks

---

**Version**: 1.0.0  
**Last Updated**: December 13, 2024  
**Status**: Production Ready (with backend validation)
