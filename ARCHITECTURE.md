## สรุปโครงสร้างระบบ

### 📁 โครงสร้างไฟล์ที่สร้าง

```
evaluator/
├── .env.local                          # Environment variables (Azure AD config)
├── .env.example                        # ตัวอย่าง environment variables
├── AZURE_SETUP.md                      # คู่มือการตั้งค่า Azure AD
├── README.md                           # เอกสารหลัก
├── package.json                        # Dependencies
├── next.config.ts                      # Next.js configuration
├── tsconfig.json                       # TypeScript configuration
│
├── app/
│   ├── layout.tsx                      # Root layout พร้อม AuthProvider
│   ├── page.tsx                        # หน้าหลัก (Main page)
│   ├── globals.css                     # Global styles
│   └── api/
│       ├── employees/
│       │   └── route.ts                # API: ดึงรายชื่อพนักงานทั้งหมด
│       └── eva/
│           ├── get-data/
│           │   └── route.ts            # API: ดึงข้อมูลผู้ประเมิน
│           └── save-data/
│               └── route.ts            # API: บันทึกข้อมูลผู้ประเมิน
│
├── components/
│   ├── EmployeeAutocomplete.tsx        # Dropdown พร้อม Autocomplete
│   ├── EditEvaluatorModal.tsx          # Modal แก้ไขผู้ประเมิน
│   ├── EvaluatorTable.tsx              # ตารางแสดงรายการ
│   └── UserProfile.tsx                 # แสดงข้อมูลผู้ใช้
│
└── lib/
    ├── AuthContext.tsx                 # React Context สำหรับ Authentication
    ├── authConfig.ts                   # Azure AD Configuration
    └── types.ts                        # TypeScript Type Definitions
```

### 🔑 คุณสมบัติหลัก

#### 1. **Authentication (Azure Entra ID)**
- ใช้ `@azure/msal-browser` และ `@azure/msal-react`
- Login ผ่าน Azure AD Popup
- ดึง Employee ID จาก User Profile
- ดึงรูปภาพจาก Microsoft Graph API
- Session management ด้วย sessionStorage

#### 2. **หน้าแสดงรายการผู้ประเมิน**
- แสดงข้อมูลเป็นตาราง:
  - ผู้ถูกประเมิน (FullnameTHEmpl)
  - หน่วยงาน (MainOrgOrgShort)
  - ตำแหน่ง (MainPositionOrgShort)
  - ผู้ประเมิน 1, 2, 3 (FullnameTH1, FullnameTH2, FullnameTH3)
  - ปุ่มแก้ไข
  - ผู้บันทึก (EmplCode_AdminUpdateTH)
  - เวลาบันทึก (UpdateDate)
- รีเฟรชข้อมูลได้ทันที
- Loading state ขณะโหลดข้อมูล

#### 3. **Modal แก้ไขผู้ประเมิน**
- แสดง Popup เมื่อกดปุ่มแก้ไข
- แสดงชื่อผู้ถูกประเมิน (ไม่สามารถแก้ไขได้)
- Dropdown Autocomplete สำหรับเลือกผู้ประเมิน 1, 2, 3
- ปุ่มบันทึกและปิด
- บันทึกข้อมูลผ่าน API EvaSaveData

#### 4. **Autocomplete Dropdown**
- ค้นหาได้ทั้ง Employee Code และชื่อ
- ใช้ `react-select` library
- โหลดข้อมูลจาก API getEmployeeERP แล้วเก็บไว้ใน local state
- รองรับคีย์บอร์ดและเมาส์

#### 5. **User Profile Display**
- แสดงรูปภาพจาก Microsoft Graph
- แสดงชื่อ-นามสกุล
- แสดงตำแหน่ง (Job Title)
- แสดงรหัสพนักงาน (Employee ID)
- ปุ่มออกจากระบบ

### 🔌 API Integration

#### Backend APIs (Airport Thai)
```
Base URL: https://api.airportthai.co.th/API2/eva
```

**1. getEmployeeERP**
- Endpoint: `POST /getEmployeeERP`
- Response: `[{ EMPL_CODE, TNAME }]`
- ใช้งาน: โหลดรายชื่อพนักงานทั้งหมด

**2. EvaGetData**
- Endpoint: `POST /EvaGetData`
- Request: `{ EmplCode }`
- Response: รายการผู้ประเมินทั้งหมด
- ใช้งาน: ดึงข้อมูลตารางผู้ประเมิน

**3. EvaSaveData**
- Endpoint: `POST /EvaSaveData`
- Request: `{ id, EmplCode_Evaluator1, EmplCode_Evaluator2, EmplCode_Evaluator3, EmplCode_AdminUpdate }`
- Response: `{ success, message }`
- ใช้งาน: บันทึกการแก้ไขผู้ประเมิน

#### Microsoft Graph API
```
Base URL: https://graph.microsoft.com/v1.0
```

**1. User Profile**
- Endpoint: `GET /me`
- ดึงข้อมูล: displayName, jobTitle, mail, employeeId

**2. User Photo**
- Endpoint: `GET /me/photo/$value`
- ดึงรูปโปรไฟล์ของผู้ใช้

### 🎨 UI/UX Design

#### หน้า Login
- Background gradient สวยงาม
- ปุ่ม Login ขนาดใหญ่
- Icon user เป็นสัญลักษณ์
- ข้อความชัดเจน

#### หน้าหลัก
- Layout แบบ Container กว้าง 7xl
- Header พร้อม User Profile Card
- ตารางพร้อม Shadow และ Rounded corners
- ปุ่มแก้ไขสีน้ำเงิน
- Loading indicator แบบ Spinner

#### Modal
- Overlay สีดำโปร่งแสง
- Modal กึ่งกลางหน้าจอ
- ปุ่มชัดเจนด้านล่าง
- Dropdown ที่สามารถค้นหาได้

### 🛠️ เทคโนโลยีและ Libraries

| Library | Version | ใช้งาน |
|---------|---------|--------|
| Next.js | 16.1.6 | React Framework |
| React | 19.2.3 | UI Library |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | 4.x | Styling |
| @azure/msal-browser | 3.20.0 | Azure AD Auth |
| @azure/msal-react | 2.2.0 | React Azure AD |
| react-select | 5.8.0 | Dropdown Autocomplete |

### 📝 Type Definitions

**Employee**
```typescript
interface Employee {
  EMPL_CODE: string;
  TNAME: string;
}
```

**EvaluationRecord**
```typescript
interface EvaluationRecord {
  id: number;
  EmplCode: string;
  FullnameTHEmpl: string;
  MainOrgOrgShort: string;
  MainPositionOrgShort: string;
  EmplCode_Evaluator1?: string;
  FullnameTH1?: string;
  EmplCode_Evaluator2?: string;
  FullnameTH2?: string;
  EmplCode_Evaluator3?: string;
  FullnameTH3?: string;
  EmplCode_AdminUpdate?: string;
  EmplCode_AdminUpdateTH?: string;
  UpdateDate?: string;
}
```

**UserProfile**
```typescript
interface UserProfile {
  id: string;
  displayName: string;
  jobTitle?: string;
  mail?: string;
  employeeId?: string;
  photo?: string;
}
```

### 🔒 Security

- Environment variables แยกใน `.env.local`
- Client Secret ไม่ถูกส่งไปฝั่ง client
- Session stored ใน sessionStorage (ลบอัตโนมัติเมื่อปิด tab)
- HTTPS required สำหรับ Production
- CORS handled โดย Next.js API routes

### ⚡ Performance

- Server-side API routes ลด CORS issues
- Employee data cached ใน React state
- Lazy loading สำหรับ Modal
- Image optimization ด้วย Next.js Image
- Turbopack สำหรับ fast refresh

### 🧪 การทดสอบ

#### ทดสอบ Authentication
1. เปิด http://localhost:3000
2. กดปุ่ม "เข้าสู่ระบบ"
3. Login ด้วย Azure AD account
4. ตรวจสอบว่า User Profile แสดงถูกต้อง

#### ทดสอบการโหลดข้อมูล
1. เข้าสู่ระบบสำเร็จ
2. ระบบจะโหลดข้อมูลจาก API EvaGetData อัตโนมัติ
3. ตรวจสอบว่าตารางแสดงข้อมูลถูกต้อง

#### ทดสอบการแก้ไข
1. กดปุ่ม "แก้ไข" ในแถวใดก็ได้
2. Modal จะแสดงขึ้น
3. เลือกผู้ประเมิน 1, 2, 3 ใหม่
4. กดปุ่ม "บันทึก"
5. ตรวจสอบว่าข้อมูลถูกบันทึกและตารางอัพเดท

### 🚀 Deployment

#### Development
```bash
npm run dev
```

#### Production Build
```bash
npm run build
npm start
```

#### Environment Variables (Production)
อย่าลืมตั้งค่า environment variables ใน Production:
- ใน Vercel: Settings > Environment Variables
- ใน Azure App Service: Configuration > Application settings
- ใน Docker: docker-compose.yml หรือ Kubernetes ConfigMap

### 📚 เอกสารเพิ่มเติม

- [AZURE_SETUP.md](./AZURE_SETUP.md) - คู่มือตั้งค่า Azure AD
- [Next.js Documentation](https://nextjs.org/docs)
- [Azure MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/overview)

### 🐛 Troubleshooting

#### ปัญหา: Login ไม่สำเร็จ
- ตรวจสอบ Azure AD credentials ใน `.env.local`
- ตรวจสอบ Redirect URI ใน Azure Portal
- ลองเปิดใน Incognito mode

#### ปัญหา: ไม่มี Employee ID
- ตรวจสอบว่า Employee ID ถูกเพิ่มใน Azure AD User Profile
- ใช้ Microsoft Graph Explorer ทดสอบ

#### ปัญหา: API ไม่ทำงาน
- ตรวจสอบ Network tab ใน Browser DevTools
- ตรวจสอบ Console logs
- ตรวจสอบว่า Backend API endpoints ทำงานได้

#### ปัญหา: Dropdown ไม่แสดงข้อมูล
- ตรวจสอบ API getEmployeeERP ว่า return data ถูกต้อง
- เปิด Console ดู error messages
- ตรวจสอบ Network tab ว่า API ถูกเรียกหรือไม่
