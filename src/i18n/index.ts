import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      nav: {
        home: 'Home',
        courses: 'Courses',
        categories: 'Categories',
        about: 'About',
        honorBoard: 'Honor Board'
      },
      home: {
        title: 'Welcome to LearnHub',
        subtitle: 'Your Gateway to Knowledge',
        description: 'Discover thousands of courses from expert instructors and advance your skills',
        startLearning: 'Start Learning Today',
        featuredCourses: 'Featured Courses',
        topCategories: 'Top Categories',
        joinNow: 'Join Now'
      },
      courses: {
        title: 'All Courses',
        filterBy: 'Filter by',
        category: 'Category',
        price: 'Price',
        level: 'Level',
        rating: 'Rating',
        free: 'Free',
        paid: 'Paid',
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        expert: 'Expert'
      },
      honorBoard: {
        title: 'Students Honor Board',
        subtitle: 'Celebrating Academic Excellence',
        topStudents: 'Top Students This Month',
        achievements: 'Recent Achievements',
        coursesCompleted: 'Courses Completed',
        certificatesEarned: 'Certificates Earned',
        points: 'Points',
        rank: 'Rank'
      },
      footer: {
        aboutUs: 'About Us',
        courses: 'Courses',
        support: 'Support',
        contact: 'Contact',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        followUs: 'Follow Us',
        rights: 'All rights reserved.'
      },
      common: {
        loading: 'Loading...',
        error: 'Something went wrong',
        search: 'Search...',
        filter: 'Filter',
        sort: 'Sort by',
        viewAll: 'View All'
      }
    }
  },
  ar: {
    translation: {
      nav: {
        home: 'الرئيسية',
        courses: 'الدورات',
        categories: 'الفئات',
        about: 'عن الموقع',
        honorBoard: 'لوحة الشرف'
      },
      home: {
        title: 'مرحباً بكم في ليرن هاب',
        subtitle: 'بوابتكم إلى المعرفة',
        description: 'اكتشف آلاف الدورات من مدربين خبراء وطور مهاراتك',
        startLearning: 'ابدأ التعلم اليوم',
        featuredCourses: 'الدورات المميزة',
        topCategories: 'أهم الفئات',
        joinNow: 'انضم الآن'
      },
      courses: {
        title: 'جميع الدورات',
        filterBy: 'فلترة حسب',
        category: 'الفئة',
        price: 'السعر',
        level: 'المستوى',
        rating: 'التقييم',
        free: 'مجاني',
        paid: 'مدفوع',
        beginner: 'مبتدئ',
        intermediate: 'متوسط',
        expert: 'متقدم'
      },
      honorBoard: {
        title: 'لوحة شرف الطلاب',
        subtitle: 'تكريم التميز الأكاديمي',
        topStudents: 'أفضل الطلاب هذا الشهر',
        achievements: 'الإنجازات الأخيرة',
        coursesCompleted: 'الدورات المكتملة',
        certificatesEarned: 'الشهادات المكتسبة',
        points: 'النقاط',
        rank: 'الترتيب'
      },
      footer: {
        aboutUs: 'عن الموقع',
        courses: 'الدورات',
        support: 'الدعم',
        contact: 'اتصل بنا',
        privacy: 'سياسة الخصوصية',
        terms: 'شروط الخدمة',
        followUs: 'تابعنا',
        rights: 'جميع الحقوق محفوظة.'
      },
      common: {
        loading: 'جاري التحميل...',
        error: 'حدث خطأ ما',
        search: 'البحث...',
        filter: 'فلترة',
        sort: 'ترتيب حسب',
        viewAll: 'عرض الكل'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;