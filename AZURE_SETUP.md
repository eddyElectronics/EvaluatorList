## วิธีการตั้งค่า Azure AD Application

### 1. สร้าง Azure AD Application

1. ไปที่ [Azure Portal](https://portal.azure.com)
2. ค้นหา "Azure Active Directory" หรือ "Microsoft Entra ID"
3. เลือก "App registrations" > "New registration"
4. กรอกข้อมูล:
   - Name: `Evaluator System`
   - Supported account types: `Accounts in this organizational directory only`
   - Redirect URI: เลือก `Single-page application (SPA)` และใส่ `http://localhost:3000`
5. คลิก "Register"

### 2. ตั้งค่า API Permissions

1. ในหน้า App registration ที่สร้างไว้ เลือก "API permissions"
2. คลิก "Add a permission"
3. เลือก "Microsoft Graph"
4. เลือก "Delegated permissions"
5. เพิ่ม permissions ดังนี้:
   - `User.Read` (อนุญาตให้อ่านข้อมูล profile ของผู้ใช้)
   - `User.ReadBasic.All` (อนุญาตให้อ่านข้อมูลพื้นฐานของผู้ใช้ทั้งหมด)
6. คลิก "Add permissions"
7. คลิก "Grant admin consent" (ถ้าเป็น admin)

### 3. เพิ่ม Employee ID ใน User Profile

Employee ID ต้องถูกเพิ่มใน User Profile ของ Azure AD:

1. ไปที่ "Azure Active Directory" > "Users"
2. เลือก User ที่ต้องการ
3. คลิก "Edit properties"
4. ใน tab "Job information" กรอก "Employee ID"
5. คลิก "Save"

**หรือ** ใช้ PowerShell:

```powershell
Connect-AzureAD
Set-AzureADUser -ObjectId "user@domain.com" -EmployeeId "EMP001"
```

### 4. คัดลอก Credentials

1. ใน App registration เลือก "Overview"
2. คัดลอก:
   - **Application (client) ID** → `NEXT_PUBLIC_AZURE_AD_CLIENT_ID`
   - **Directory (tenant) ID** → `NEXT_PUBLIC_AZURE_AD_TENANT_ID`

3. เลือก "Certificates & secrets"
4. คลิก "New client secret"
5. กรอก Description และเลือก Expires
6. คลิก "Add"
7. คัดลอก **Value** → `AZURE_AD_CLIENT_SECRET` (เก็บไว้ทันที เพราะจะไม่แสดงอีก)

### 5. นำ Credentials ไปใส่ใน .env.local

```env
NEXT_PUBLIC_AZURE_AD_CLIENT_ID=<Application-Client-ID>
AZURE_AD_CLIENT_SECRET=<Client-Secret-Value>
NEXT_PUBLIC_AZURE_AD_TENANT_ID=<Directory-Tenant-ID>
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000
```

### 6. เพิ่ม Redirect URI (Production)

เมื่อ deploy ไปยัง production:

1. ใน App registration เลือก "Authentication"
2. ใน "Single-page application" เพิ่ม Redirect URI เช่น:
   - `https://yourdomain.com`
   - `https://evaluator.yourdomain.com`
3. คลิก "Save"

### 7. เพิ่ม Logout URI (Optional)

1. ใน "Authentication" > "Single-page application"
2. ใน "Front-channel logout URL" ใส่:
   - `http://localhost:3000` (Development)
   - `https://yourdomain.com` (Production)
3. คลิก "Save"

### สิทธิ์ที่จำเป็น

- ต้องเป็น **Application Administrator** หรือ **Global Administrator** เพื่อสร้าง App registration
- ต้องเป็น **User Administrator** หรือ **Global Administrator** เพื่อแก้ไข Employee ID ของ User

### Troubleshooting

#### ปัญหา: ไม่สามารถ login ได้
- ตรวจสอบว่า Redirect URI ถูกต้อง
- ตรวจสอบว่า Client ID และ Tenant ID ถูกต้อง
- ตรวจสอบว่า User มีสิทธิ์เข้าถึง Application

#### ปัญหา: ไม่มี Employee ID
- ตรวจสอบว่า Employee ID ถูกเพิ่มใน User Profile แล้ว
- ลองใช้ Microsoft Graph Explorer เพื่อตรวจสอบ: `https://graph.microsoft.com/v1.0/me`

#### ปัญหา: Permission denied
- ตรวจสอบว่า API Permissions ถูกเพิ่มแล้ว
- ตรวจสอบว่า Admin consent ถูก grant แล้ว

### การทดสอบ

ทดสอบการ login และดึงข้อมูลด้วย [Microsoft Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer):

1. Login ด้วย Account ของคุณ
2. ลอง query: `https://graph.microsoft.com/v1.0/me`
3. ตรวจสอบว่ามี `employeeId` ใน response หรือไม่
