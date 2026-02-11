# กำหนดรายชื่อผู้ประเมิน

ระบบจัดการรายชื่อผู้ประเมินพนักงานด้วย Azure Entra ID (Azure AD) Authentication

## คุณสมบัติ

- 🔐 Login ด้วย Azure Entra ID (Azure AD)
- 👤 ดึงข้อมูล Employee ID จาก Azure AD User Profile
- 📊 แสดงรายการผู้ประเมินในรูปแบบตาราง
- ✏️ แก้ไขผู้ประเมิน (ผู้ประเมิน 1, 2, 3) ผ่าน Popup Modal
- 🔍 ค้นหาพนักงานแบบ Autocomplete
- 📸 แสดงรูปโปรไฟล์จาก Microsoft Graph API

## เทคโนโลยีที่ใช้

- **Next.js 16** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Azure MSAL** - Microsoft Authentication Library
- **React Select** - Dropdown with Autocomplete

## การติดตั้ง

1. Clone repository

```bash
git clone <repository-url>
cd evaluator
```

2. ติดตั้ง dependencies

```bash
npm install
```

3. สร้างไฟล์ `.env.local` และกำหนดค่า Azure AD Credentials

```env
NEXT_PUBLIC_AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_AZURE_AD_TENANT_ID=your-tenant-id
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=https://api.airportthai.co.th/API2/eva
```

4. รันโปรเจค

```bash
npm run dev
```

5. เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

## โครงสร้างโปรเจค

```
evaluator/
├── app/
│   ├── api/
│   │   ├── employees/route.ts      # API สำหรับดึงรายชื่อพนักงาน
│   │   └── eva/
│   │       ├── get-data/route.ts   # API ดึงข้อมูลผู้ประเมิน
│   │       └── save-data/route.ts  # API บันทึกข้อมูลผู้ประเมิน
│   ├── layout.tsx                  # Root Layout with AuthProvider
│   └── page.tsx                    # หน้าหลัก
├── components/
│   ├── EmployeeAutocomplete.tsx    # Dropdown พร้อม Autocomplete
│   ├── EditEvaluatorModal.tsx      # Modal แก้ไขผู้ประเมิน
│   ├── EvaluatorTable.tsx          # ตารางแสดงรายการผู้ประเมิน
│   └── UserProfile.tsx             # แสดงข้อมูลผู้ใช้
├── lib/
│   ├── AuthContext.tsx             # Authentication Context
│   ├── authConfig.ts               # Azure AD Configuration
│   └── types.ts                    # TypeScript Types
└── .env.local                      # Environment Variables
```

## API Endpoints

### 1. getEmployeeERP
- **URL**: `https://api.airportthai.co.th/API2/eva/getEmployeeERP`
- **Method**: POST
- **Response**: รายชื่อพนักงานทั้งหมด

### 2. EvaGetData
- **URL**: `https://api.airportthai.co.th/API2/eva/EvaGetData`
- **Method**: POST
- **Body**: `{ "EmplCode": "employee_id" }`
- **Response**: รายการผู้ประเมินทั้งหมด

### 3. EvaSaveData
- **URL**: `https://api.airportthai.co.th/API2/eva/EvaSaveData`
- **Method**: POST
- **Body**: 
```json
{
  "id": 1,
  "EmplCode_Evaluator1": "EMP001",
  "EmplCode_Evaluator2": "EMP002",
  "EmplCode_Evaluator3": "EMP003",
  "EmplCode_AdminUpdate": "ADMIN001"
}
```

## การใช้งาน

1. **Login**: กดปุ่ม "เข้าสู่ระบบ" เพื่อ login ด้วย Azure Entra ID
2. **ดูรายการ**: ระบบจะแสดงรายการผู้ประเมินทั้งหมดในรูปแบบตาราง
3. **แก้ไข**: กดปุ่ม "แก้ไข" เพื่อเปลี่ยนผู้ประเมิน 1, 2, 3
4. **บันทึก**: เลือกผู้ประเมินและกดปุ่ม "บันทึก" เพื่อบันทึกข้อมูล
5. **รีเฟรช**: กดปุ่ม "รีเฟรชข้อมูล" เพื่อโหลดข้อมูลใหม่

## Build สำหรับ Production

```bash
npm run build
npm start
```

## หมายเหตุ

- ต้องมี Azure AD Application ที่ตั้งค่า Redirect URI เรียบร้อยแล้ว
- ต้องเพิ่ม Permission `User.Read` และ `User.ReadBasic.All` ใน Azure AD App
- Employee ID ต้องมีในข้อมูล User Profile ของ Azure AD
