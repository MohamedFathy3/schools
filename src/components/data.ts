import { Employee } from '@/types/types';

export const tableData: Employee[] = [
  {
    id: 1,
    name: "أحمد محمد",
    email: "ahmed@example.com",
    position: "مطور واجهات أمامية",
    department: "التطوير",
    status: "نشط",
    date: "2023-10-15"
  },
  {
    id: 2,
    name: "فاطمة علي",
    email: "fatima@example.com",
    position: "مصممة UX",
    department: "التصميم",
    status: "نشط",
    date: "2023-09-20"
  },
  {
    id: 3,
    name: "محمد السيد",
    email: "mohamed@example.com",
    position: "مدير مشاريع",
    department: "الإدارة",
    status: "غير نشط",
    date: "2023-11-05"
  },
  {
    id: 4,
    name: "سارة كمال",
    email: "sara@example.com",
    position: "مطورة Backend",
    department: "التطوير",
    status: "نشط",
    date: "2023-08-12"
  },
  {
    id: 5,
    name: "علي حسن",
    email: "ali@example.com",
    position: "مسوق إلكتروني",
    department: "التسويق",
    status: "نشط",
    date: "2023-12-01"
  }
];

export const tableHeaders: string[] = [
  "ID", "الاسم", "البريد الإلكتروني", "المنصب", "القسم", "الحالة", "التاريخ", "الإجراءات"
];