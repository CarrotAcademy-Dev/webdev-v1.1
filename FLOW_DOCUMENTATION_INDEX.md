# Flow Documentation Index

> **Panduan lengkap tentang flow sistem Carrot Academy Dashboard**  
> Pilih dokumentasi sesuai kebutuhan Anda

---

## Dokumentasi yang Tersedia

### 1️. **USER_FLOW_GUIDE.md** - Flow Lengkap & Detail
**Untuk siapa**: Stakeholder, Product Owner, Project Manager  
**Tujuan**: Memahami flow lengkap dari login sampai logout  
**Isi**:
- Flow diagram lengkap dengan penjelasan setiap tahap
- Access Control Matrix
- User Journey Scenarios  
- Session Management detail
- Visual indicators
- Technical flow (behind the scenes)
- Glossary & troubleshooting

**Baca ini jika**: Anda ingin memahami **keseluruhan sistem** secara menyeluruh

---

### 2️. **QUICK_REFERENCE.md** - Cheat Sheet
**Untuk siapa**: Developer, QA, Support Team  
**Tujuan**: Reference cepat untuk konsep-konsep penting  
**Isi**:
- Flow sederhana 3 tahap utama
- State diagram user
- Access control matrix
- Timeline session management
- Visual indicators cheat sheet
- Component hierarchy
- Error scenarios
- Quick troubleshooting

**Baca ini jika**: Anda butuh **referensi cepat** tanpa banyak penjelasan

---

### 3️. **USER_STORIES.md** - Cerita & Storytelling
**Untuk siapa**: Non-technical stakeholder, Business team, Client  
**Tujuan**: Memahami flow melalui cerita real-user scenarios  
**Isi**:
- Story CSO (CSO normal workflow)
- Story Admin (Admin register user)
- Story Finance (Finance limited access)
- Story Auto logout scenario
- User satisfaction metrics
- Best practices dalam bentuk cerita

**Baca ini jika**: Anda lebih suka **belajar lewat cerita** daripada diagram

---

### 4️. **RBAC_GUIDE.md** - Role-Based Access Control
**Untuk siapa**: Developer, System Admin  
**Tujuan**: Implementasi & maintenance access control  
**Isi**:
- Konsep RBAC hierarchy
- Role & Jabatan definitions
- Access groups
- Protected route implementation
- Testing scenarios

**Baca ini jika**: Anda perlu **implementasi access control** di sistem

---

### 5️. **TOKEN_EXPIRY_GUIDE.md** - Session Management
**Untuk siapa**: Developer, Security team  
**Tujuan**: Implementasi & maintenance session management  
**Isi**:
- Token expiry mechanism
- Session monitoring
- Session timeout dialog
- Session timer badge
- Best practices

**Baca ini jika**: Anda perlu **implementasi session management** di sistem

---

## Navigation Guide

### Berdasarkan Role

#### Stakeholder / Product Owner
**Recommended reading order:**
1. **USER_STORIES.md** - Mulai dengan cerita user
2. **USER_FLOW_GUIDE.md** - Pahami detail flow
3. **QUICK_REFERENCE.md** - Simpan sebagai referensi

**Why this order?**
- Stories lebih mudah dipahami untuk non-technical
- Flow guide memberikan context lengkap
- Quick reference untuk lookup cepat nanti

---

#### Developer / Engineer
**Recommended reading order:**
1. **QUICK_REFERENCE.md** - Overview cepat
2. **RBAC_GUIDE.md** - Implementasi access control
3. **TOKEN_EXPIRY_GUIDE.md** - Implementasi session
4. **USER_FLOW_GUIDE.md** - Deep dive flow

**Why this order?**
- Quick reference untuk context
- Technical guides untuk implementasi
- Flow guide untuk understanding lengkap

---

#### QA / Tester
**Recommended reading order:**
1. **USER_FLOW_GUIDE.md** - Scenario testing
2. **USER_STORIES.md** - Test cases dari user stories
3. **QUICK_REFERENCE.md** - Expected results

**Why this order?**
- Flow guide untuk test scenarios
- User stories untuk realistic test cases
- Quick reference untuk verify hasil

---

#### Client / Business Team
**Recommended reading order:**
1. **USER_STORIES.md** - Mudah dipahami
2. **USER_FLOW_GUIDE.md** (bagian User Journey)

**Why this order?**
- Stories tidak technical, mudah relate
- Journey scenarios untuk validation

---

## Documentation Coverage

### Flow Aspects Covered

| Aspect             | USER_FLOW | QUICK_REF | USER_STORIES | RBAC | TOKEN_EXPIRY |
|--------------------|-----------|-----------|--------------|------|--------------|
| Login Process      |     ✅    |    ✅    |      ✅      |  ✅ |      ✅      |
| Dashboard          |     ✅    |    ✅    |      ✅      |  ⚪ |      ⚪      |
| Navigation         |     ✅    |    ✅    |      ✅      |  ⚪ |      ⚪      |
| Access Control     |     ✅    |    ✅    |      ✅      |  ✅ |      ⚪      |
| Session Management |     ✅    |    ✅    |      ✅      |  ⚪ |      ✅      |
| Logout             |     ✅    |    ✅    |      ✅      |  ⚪ |      ✅      |
| Error Handling     |     ✅    |    ✅    |      ✅      |  ✅ |      ✅      |
| Technical Details  |     ✅    |    ✅    |      ⚪      |  ✅ |      ✅      |
| User Stories       |     ⚪    |    ⚪    |      ✅      |  ⚪ |      ⚪      |

**Legend:**
- ✅ = Fully covered
- ⚪ = Not applicable / Minimal coverage

---

## Quick Access by Topic

### Authentication & Login
- **USER_FLOW_GUIDE.md** → Section 1️. "Halaman Login"
- **USER_STORIES.md** → "CSO's Daily Workflow"
- **QUICK_REFERENCE.md** → "Login Flow"

### Dashboard & Overview
- **USER_FLOW_GUIDE.md** → Section 3️. "Halaman Overview"
- **USER_STORIES.md** → "Dashboard Overview - Sambutan Pagi"

### Menu & Navigation
- **USER_FLOW_GUIDE.md** → Section 4️. "Navigasi Menu"
- **USER_STORIES.md** → "Mulai Bekerja - Akses Menu CSO"
- **QUICK_REFERENCE.md** → "User Actions & Expected Results"

### Access Control
- **RBAC_GUIDE.md** → Full document
- **USER_FLOW_GUIDE.md** → Section 5️. "Proteksi Akses"
- **USER_STORIES.md** → "Finance's Limited Access"
- **QUICK_REFERENCE.md** → "Access Control Matrix"

### Session Management
- **TOKEN_EXPIRY_GUIDE.md** → Full document
- **USER_FLOW_GUIDE.md** → Section 6️. & 7️.
- **USER_STORIES.md** → "Session Warning" & "Auto Logout"
- **QUICK_REFERENCE.md** → "Timeline Session Management"

### Logout
- **USER_FLOW_GUIDE.md** → Section 8️. "Logout Manual"
- **USER_STORIES.md** → "Selesai Kerja - Logout"

### Error & Troubleshooting
- **USER_FLOW_GUIDE.md** → "Support & Troubleshooting"
- **QUICK_REFERENCE.md** → "Error Scenarios" & "Quick Troubleshooting"
- **USER_STORIES.md** → "Access Denied Scenario"

---

## How to Use This Documentation

### For New Team Members

**Day 1:**
```
Morning: Read USER_STORIES.md
Lunch: Skim USER_FLOW_GUIDE.md
Afternoon: Bookmark QUICK_REFERENCE.md
```

**Day 2-3:**
```
Deep dive: RBAC_GUIDE.md + TOKEN_EXPIRY_GUIDE.md
Practice: Try scenarios from USER_STORIES
```

---

### For Feature Development

**Planning Phase:**
```
1. Review USER_FLOW_GUIDE.md → Understand impact
2. Check RBAC_GUIDE.md → Access control requirements
3. Read TOKEN_EXPIRY_GUIDE.md → Session implications
```

**Development Phase:**
```
1. Use QUICK_REFERENCE.md → Component hierarchy
2. Reference RBAC_GUIDE.md → Implementation details
3. Test with USER_STORIES scenarios
```

**Testing Phase:**
```
1. USER_FLOW_GUIDE.md → Test scenarios
2. USER_STORIES.md → Real user paths
3. QUICK_REFERENCE.md → Expected results
```

---

### For Bug Fixing

**Debug Flow:**
```
1. QUICK_REFERENCE.md → Identify affected component
2. USER_FLOW_GUIDE.md → Understand expected behavior
3. Technical guides → Check implementation
4. USER_STORIES.md → Reproduce scenario
```

---

## Documentation Updates

### When to Update?

|     Change Type        |             Update Required             |
|------------------------|-----------------------------------------|
| New feature added      | ✅ All flow docs                        |
| Access control changed | ✅ RBAC_GUIDE, USER_FLOW_GUIDE          |
| Session logic changed  | ✅ TOKEN_EXPIRY_GUIDE, USER_FLOW_GUIDE  |
| UI/UX updated          | ✅ USER_FLOW_GUIDE, USER_STORIES        |
| Bug fix (minor)        | ⚪ No update needed                     |

---

## Support

### Questions?

|          Topic           |     Contact    |
|--------------------------|----------------|
| Flow understanding       | Product Owner  |
| Technical implementation | Lead Developer |
| Access issues            | System Admin   |
| Session problems         | Backend Team   |

---

## Checklist: Have You Read Everything?

### Stakeholder Checklist
- [ ] USER_STORIES.md - Read all scenarios
- [ ] USER_FLOW_GUIDE.md - Understand complete flow
- [ ] QUICK_REFERENCE.md - Bookmarked for reference

### Developer Checklist
- [ ] QUICK_REFERENCE.md - Overview understood
- [ ] RBAC_GUIDE.md - Implementation clear
- [ ] TOKEN_EXPIRY_GUIDE.md - Session logic clear
- [ ] USER_FLOW_GUIDE.md - Flow context understood

### QA Checklist
- [ ] USER_FLOW_GUIDE.md - Test scenarios identified
- [ ] USER_STORIES.md - Test cases prepared
- [ ] QUICK_REFERENCE.md - Expected results noted
- [ ] Error scenarios tested

---

## Related Documentation

### Other Guides in This Project
- **DEPLOYMENT.md** - How to deploy the application
- **GIT_WORKFLOW.md** - Git branching strategy
- **THEME_GUIDE.md** - UI theming system
- **THEME_MIGRATION.md** - Chakra UI v2 to v3 migration guide
- **THEME_UPDATE_SUMMARY.md** - Summary of theme changes
- **IMPLEMENTATION_STATUS.md** - Feature status tracker (termasuk ESO Module)
- **DASHBOARD_PROSPEKTIF_GUIDE.md** - Dashboard Prospektif features & workflows
- **DASHBOARD_REMINDER_GUIDE.md** - Dashboard Reminder & Janjian Temu features
- **APP_NAVIGATION_FLOW.md** - Application navigation flows and routing
- **IMPROVEMENTS.md** - Known issues and planned improvements

---

## Learning Path

### Week 1: Understand the System
```
Day 1: USER_STORIES.md
Day 2: USER_FLOW_GUIDE.md (Part 1)
Day 3: USER_FLOW_GUIDE.md (Part 2)
Day 4: QUICK_REFERENCE.md
Day 5: Practice & Questions
```

### Week 2: Deep Dive Technical
```
Day 1: RBAC_GUIDE.md
Day 2: TOKEN_EXPIRY_GUIDE.md
Day 3: Code walkthrough
Day 4: Hands-on practice
Day 5: Test scenarios
```

---

## Tips for Reading

### For Non-Technical Readers
- Start with **USER_STORIES.md** (paling mudah dipahami)
- Skip bagian "Technical Flow" di **USER_FLOW_GUIDE.md**
- Focus pada visual diagrams & scenarios

### For Technical Readers
- Start with **QUICK_REFERENCE.md** (overview cepat)
- Deep dive **RBAC_GUIDE** & **TOKEN_EXPIRY_GUIDE**
- Cross-reference dengan actual code

### For Visual Learners
- Focus pada diagram di **USER_FLOW_GUIDE.md**
- Read scenarios di **USER_STORIES.md**
- Use **QUICK_REFERENCE.md** state diagrams

---

## Success Criteria

You've successfully understood the flow when you can:

Explain login to logout flow to a non-technical person  
Identify which user can access which menu  
Explain what happens when session expires  
Troubleshoot basic access control issues  
Understand the difference between Role & Jabatan  
Know when and how session warnings appear  

---

## Documentation Stats

| Document              | Pages   | Sections | Diagrams | Code Examples |
|-----------------------|---------|----------|----------|---------------|
| USER_FLOW_GUIDE.md    |  ~20    |    14    |     8    |        5      |
| QUICK_REFERENCE.md    |  ~10    |    12    |     6    |        3      |
| USER_STORIES.md       |  ~15    |     8    |    10    |        2      |
| RBAC_GUIDE.md         |  ~25    |    10    |     4    |       15      |
| TOKEN_EXPIRY_GUIDE.md |  ~12    |     8    |     3    |       10      |
| THEME_GUIDE.md        |  ~15    |     9    |     2    |       12      |
| **Core Docs Total**   | **~97** |  **61**  |  **33**  |     **47**    |

### Additional Documentation (Reference)
- DASHBOARD_PROSPEKTIF_GUIDE.md (~8 pages)
- DASHBOARD_REMINDER_GUIDE.md (~6 pages)
- APP_NAVIGATION_FLOW.md (~10 pages)
- GIT_WORKFLOW.md (~5 pages)
- DEPLOYMENT.md (~4 pages)
- THEME_MIGRATION.md (~8 pages)
- THEME_UPDATE_SUMMARY.md (~3 pages)
- IMPLEMENTATION_STATUS.md (~12 pages)
- IMPROVEMENTS.md (~5 pages)

---

## Conclusion

Dokumentasi flow ini dibuat untuk memastikan **semua stakeholder** (technical & non-technical) memahami bagaimana sistem bekerja dari **login sampai logout**, termasuk fitur-fitur baru seperti **ESO Module** dan **Theme System**.

**Key Highlights:**
- 6 dokumentasi core lengkap covering semua aspek
- 9 dokumentasi tambahan untuk reference dan guides
- 33+ diagrams untuk visual understanding
- 47+ code examples untuk technical reference
- Real user stories untuk context
- Quick reference untuk daily use
- Complete ESO Module documentation dalam IMPLEMENTATION_STATUS.md

**Next Steps:**
1. Pilih dokumentasi sesuai role Anda (lihat README.md section 7)
2. Baca dengan urutan yang recommended
3. Bookmark untuk reference nanti
4. Share dengan tim yang relevan

---

*Happy Reading! 📖*  
*Jika ada pertanyaan, hubungi Development Team*

---

**Last Updated**: January 2026  
**Version**: 1.1  
**Maintained by**: Development Team
