import { DetailsContentProps } from '@/types/types';

const DetailsContent: React.FC<DetailsContentProps> = ({ item }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500">الاسم الكامل</h4>
          <p className="mt-1 text-lg">{item.name}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500">البريد الإلكتروني</h4>
          <p className="mt-1 text-lg">{item.email}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500">المنصب</h4>
          <p className="mt-1 text-lg">{item.position}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500">القسم</h4>
          <p className="mt-1 text-lg">{item.department}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500">الحالة</h4>
          <p className="mt-1 text-lg">{item.status}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500">تاريخ الإضافة</h4>
          <p className="mt-1 text-lg">{item.date}</p>
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <h4 className="text-sm font-medium text-gray-500">ملاحظات إضافية</h4>
        <p className="mt-1 text-gray-600">لا توجد ملاحظات إضافية.</p>
      </div>
    </div>
  );
};

export default DetailsContent;