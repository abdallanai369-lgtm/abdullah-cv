export interface Profile {
  name: string;
  firstName: string;
  headline: string;
  roles: string[];
  location: string;
  email: string;
  phone: string;
  whatsapp: string;
  github: string;
  specialty: string;
  summary: string[];
  photoUrl: string;
}

export interface SkillCategory {
  id: string;
  title: string;
  icon: 'web' | 'apps' | 'ai' | 'automation';
  items: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  technologies: string[];
  features: string[];
  link: string;
  github: string;
}

export interface CVData {
  profile: Profile;
  skills: SkillCategory[];
  technologies: string[];
  projects: Project[];
  workEnvironment: string[];
  goal: string;
  targetFields: string[];
}

export const defaultCV: CVData = {
  profile: {
    name: 'عبدالله',
    firstName: 'عبدالله',
    headline: 'أحوّل الأفكار إلى حلول رقمية ذكية.',
    roles: ['مطور برمجيات', 'مطور مواقع وتطبيقات', 'AI Developer', 'Automation Developer'],
    location: 'مصر',
    email: 'abdallahai369@gmail.com',
    phone: '01055365106',
    whatsapp: '201055365106',
    github: 'https://github.com/abdallanai369-lgtm',
    specialty: 'تطوير البرمجيات والذكاء الاصطناعي والأتمتة',
    summary: [
      'مطور برمجيات مهتم ببناء الحلول الرقمية والأنظمة الذكية، أعمل على تصميم وتطوير المواقع الإلكترونية وتطبيقات Android وأنظمة إدارة الأعمال، بالإضافة إلى تطوير أدوات الذكاء الاصطناعي والأتمتة.',
      'أهتم بتحويل أفكار المشاريع والمشكلات اليومية إلى حلول برمجية عملية، مع التركيز على سهولة الاستخدام، والتصميم الاحترافي، وتقليل التكاليف.',
      'أعمل باستخدام Python وJavaScript وتقنيات تطوير الويب، وأطوّر وأختبر مشاريعي باستخدام هاتف Android وبيئة Termux.',
    ],
    photoUrl: '',
  },
  skills: [
    {
      id: 'web',
      title: 'تطوير المواقع الإلكترونية',
      icon: 'web',
      items: [
        'تصميم وتطوير مواقع الشركات',
        'مواقع المطاعم والكافيهات',
        'مواقع العيادات والمراكز الطبية',
        'صفحات الهبوط Landing Pages',
        'تصميم واجهات متجاوبة مع الهواتف',
        'أنظمة الحجز وعرض الخدمات',
        'صفحات المنتجات والطلبات الإلكترونية',
      ],
    },
    {
      id: 'apps',
      title: 'تطوير التطبيقات والأنظمة',
      icon: 'apps',
      items: [
        'تطوير نماذج تطبيقات Android',
        'أنظمة إدارة المشاريع',
        'أنظمة إدارة الورش والشركات',
        'أنظمة نقاط البيع POS',
        'قواعد البيانات وإدارة المعلومات',
        'تصميم لوحات التحكم Dashboard',
      ],
    },
    {
      id: 'ai',
      title: 'الذكاء الاصطناعي',
      icon: 'ai',
      items: [
        'بناء نماذج أولية لأدوات AI',
        'تجربة دمج نماذج الذكاء الاصطناعي',
        'تطوير مساعدات برمجية',
        'استخدام Gemini API',
        'أتمتة المهام باستخدام Python',
        'توليد المحتوى والأفكار والبيانات',
      ],
    },
    {
      id: 'automation',
      title: 'الأتمتة Automation',
      icon: 'automation',
      items: [
        'تصميم سير العمل Workflows',
        'أتمتة المهام المتكررة',
        'تطوير أدوات جمع وتحليل البيانات',
        'بناء أنظمة تساعد الشركات على تنظيم عملياتها',
      ],
    },
  ],
  technologies: [
    'Python', 'JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'React', 'Vite',
    'Tailwind CSS', 'Flask', 'SQLite', 'REST APIs', 'Git & GitHub', 'Termux',
    'Linux', 'Android SDK', 'Node.js', 'Express.js', 'Google Gemini', 'CodeMirror',
  ],
  projects: [
    {
      id: 'zeno-ai-studio',
      title: 'Zeno AI Studio',
      description: 'منصة لتطوير البرمجيات وإدارة المشاريع، مبنية باستخدام Python وFlask وتضم محرر أكواد ومساعد ذكاء اصطناعي.',
      status: 'نموذج أولي قيد التطوير',
      technologies: ['Python', 'Flask', 'SQLite'],
      features: [
        'تسجيل الحسابات وتسجيل الدخول',
        'إنشاء وإدارة المشاريع',
        'محرر أكواد داخل المنصة',
        'حفظ ملفات المشاريع',
        'معاينة صفحات HTML',
        'إعدادات مساعد الذكاء الاصطناعي',
        'قاعدة بيانات SQLite',
        'واجهة متجاوبة مع الهواتف',
      ],
      link: '',
      github: 'https://github.com/abdallanai369-lgtm/zeno-ai-studio',
    },
    {
      id: 'zeno-x-studio',
      title: 'Zeno X Studio',
      description: 'منصة محلية لتوليد نماذج المشاريع البرمجية من الأوصاف النصية، مع إمكانية المعاينة والتصدير.',
      status: 'Prototype تجريبي',
      technologies: ['Python', 'Local Server', 'Project Generator'],
      features: [
        'إنشاء نماذج مواقع إلكترونية',
        'معاينة المشاريع',
        'تصدير المشاريع في ملفات ZIP',
        'خادم Python محلي',
        'تطوير مبدئي لدعم أنواع مشاريع متعددة',
      ],
      link: '',
      github: '',
    },
    {
      id: 'amwaj-restaurant',
      title: 'Amwaj Restaurant',
      description: 'واجهة رقمية حديثة لمطعم، تركز على تجربة المستخدم وتنظيم المحتوى والاستعداد للنشر.',
      status: 'مشروع واجهة رقمية',
      technologies: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
      features: [
        'تصميم واجهة المطعم',
        'تطوير تجربة المستخدم',
        'تنظيم صفحات المشروع',
        'تجهيز المشروع للبناء والنشر',
      ],
      link: 'https://ai.studio/apps/494b0977-f8b4-41d7-814d-08de4ee462d2',
      github: '',
    },
    {
      id: 'al-hayah-care',
      title: 'Al Hayah Care Medical Center',
      description: 'نموذج موقع إلكتروني لمركز طبي يسهّل عرض الخدمات والمعلومات والوصول إلى تجربة حجز المواعيد.',
      status: 'نموذج موقع إلكتروني',
      technologies: ['Web Design', 'Responsive UI', 'UX'],
      features: [
        'تقديم الخدمات الطبية',
        'عرض معلومات المركز',
        'تسهيل وصول المرضى للمعلومات',
        'تطوير تجربة حجز المواعيد',
      ],
      link: 'https://alhayahcare-demo.tiiny.site',
      github: '',
    },
    {
      id: 'motor-workshop',
      title: 'Motor Workshop Management System',
      description: 'نظام تجريبي متكامل لإدارة ورش صيانة ولف المواتير، من أوامر الشغل حتى الحسابات والمخزون.',
      status: 'نظام تجريبي',
      technologies: ['Python', 'Flask', 'SQLite', 'Android Development'],
      features: [
        'إدارة أوامر الشغل',
        'متابعة مراحل الصيانة',
        'إدارة المخزون',
        'حسابات العملاء',
        'الفواتير والمدفوعات',
        'متابعة المستحقات',
        'لوحة تحكم إدارية',
        'قاعدة بيانات محلية',
      ],
      link: '',
      github: '',
    },
    {
      id: 'ai-sales-automation',
      title: 'AI Sales & Business Automation',
      description: 'أفكار وأنظمة مساعدة للشركات تستخدم الذكاء الاصطناعي والأتمتة لتحسين التسويق والمبيعات وتنظيم العمليات.',
      status: 'تطوير وتجارب ونماذج أولية',
      technologies: ['AI', 'Automation', 'Data Analysis'],
      features: [
        'البحث عن العملاء المحتملين',
        'تحليل المواقع الإلكترونية',
        'اكتشاف المشكلات التجارية',
        'إعداد عروض الخدمات',
        'تنظيم بيانات العملاء',
        'أتمتة عمليات التسويق والمبيعات',
      ],
      link: '',
      github: '',
    },
    {
      id: 'anime-ai',
      title: 'ANIME AI',
      description: 'أداة ذكاء اصطناعي لإنشاء أفكار ومحتوى YouTube Shorts، من الفكرة والسيناريو حتى العنوان والهاشتاجات.',
      status: 'مشروع قيد التطوير',
      technologies: ['Python', 'Google Gemini'],
      features: [
        'توليد أفكار الفيديوهات',
        'كتابة السيناريوهات',
        'إنشاء العناوين والأوصاف',
        'اقتراح الهاشتاجات',
      ],
      link: '',
      github: '',
    },
  ],
  workEnvironment: [
    'تطوير واختبار المشاريع باستخدام Android وTermux',
    'التعامل مع بيئات Linux',
    'استخدام GitHub لإدارة الأكواد',
    'تطوير واجهات تعمل على الهواتف',
    'الاهتمام بالحلول منخفضة التكلفة والمفتوحة المصدر',
  ],
  goal: 'أسعى إلى تطوير حلول برمجية وتقنيات ذكاء اصطناعي تساعد الأفراد والشركات على تحسين أعمالهم، وبناء منتجات رقمية عملية وقابلة للتطوير، والعمل مع العملاء والشركات في مشاريع تطوير المواقع والتطبيقات والأنظمة الذكية.',
  targetFields: [
    'Web Development',
    'Python Development',
    'AI Development',
    'Automation',
    'Android Applications',
    'Business Management Systems',
  ],
};

export function freshDefaultCV(): CVData {
  return JSON.parse(JSON.stringify(defaultCV)) as CVData;
}
