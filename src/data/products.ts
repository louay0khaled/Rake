// ======================================================
// Products Database - قاعدة بيانات المنتجات (500+ منتج)
// ======================================================

export interface Product {
  id: number;
  name: string;
  nameEn: string;
  category: string;
  price: number; // بالليرة السورية الجديدة
  originalPrice?: number;
  discount?: number;
  image: string;
  rating: number;
  reviews: number;
  stock: number;
  description: string;
  badge?: string;
  isNew?: boolean;
  isFeatured?: boolean;
}

// صور Unsplash للمنتجات
const IMAGES = {
  electronics: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80",
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&q=80",
    "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80",
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80",
  ],
  phones: [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&q=80",
    "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&q=80",
    "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80",
    "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80",
  ],
  fashion: [
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80",
    "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&q=80",
  ],
  home: [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
    "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=80",
    "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400&q=80",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80",
  ],
  food: [
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80",
  ],
  beauty: [
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
    "https://images.unsplash.com/photo-1583241475880-083f84372725?w=400&q=80",
  ],
  sports: [
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80",
    "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=400&q=80",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80",
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80",
  ],
  books: [
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80",
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&q=80",
    "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&q=80",
    "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80",
  ],
  toys: [
    "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=400&q=80",
    "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&q=80",
    "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80",
  ],
  tools: [
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80",
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80",
    "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&q=80",
  ],
};

function getImg(category: keyof typeof IMAGES, index: number): string {
  const arr = IMAGES[category];
  return arr[index % arr.length];
}

function rnd(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rating(): number {
  return Math.round((3.5 + Math.random() * 1.5) * 10) / 10;
}

// ======================================================
// توليد 500+ منتج
// ======================================================

const electronicProducts: Product[] = [
  // لابتوبات
  { id: 1, name: "لابتوب Dell Inspiron 15", nameEn: "Dell Inspiron 15", category: "الإلكترونيات", price: 2800, originalPrice: 3200, discount: 13, image: getImg("electronics", 0), rating: 4.7, reviews: 342, stock: 15, description: "معالج Intel Core i7، ذاكرة 16GB RAM، تخزين 512GB SSD", badge: "الأكثر مبيعاً", isFeatured: true },
  { id: 2, name: "لابتوب HP Pavilion 14", nameEn: "HP Pavilion 14", category: "الإلكترونيات", price: 2100, originalPrice: 2400, discount: 13, image: getImg("electronics", 1), rating: 4.5, reviews: 218, stock: 22, description: "معالج Ryzen 5، شاشة Full HD، بطارية تدوم 8 ساعات" },
  { id: 3, name: "لابتوب Lenovo IdeaPad", nameEn: "Lenovo IdeaPad", category: "الإلكترونيات", price: 1850, image: getImg("electronics", 2), rating: 4.3, reviews: 167, stock: 30, description: "مثالي للدراسة والعمل اليومي" },
  { id: 4, name: "MacBook Air M2", nameEn: "MacBook Air M2", category: "الإلكترونيات", price: 5500, originalPrice: 6000, discount: 8, image: getImg("electronics", 3), rating: 4.9, reviews: 523, stock: 8, description: "قوة لا مثيل لها بتصميم أنيق", badge: "الأفضل تقييماً", isFeatured: true },
  { id: 5, name: "لابتوب Asus VivoBook", nameEn: "Asus VivoBook", category: "الإلكترونيات", price: 1650, image: getImg("electronics", 4), rating: 4.2, reviews: 145, stock: 25, description: "أداء ممتاز بسعر مناسب" },
  { id: 6, name: "لابتوب Acer Aspire 5", nameEn: "Acer Aspire 5", category: "الإلكترونيات", price: 1750, image: getImg("electronics", 5), rating: 4.4, reviews: 198, stock: 18, description: "شاشة IPS واضحة وبطارية قوية" },
  { id: 7, name: "لابتوب MSI Gaming", nameEn: "MSI Gaming Laptop", category: "الإلكترونيات", price: 4200, originalPrice: 4800, discount: 13, image: getImg("electronics", 6), rating: 4.8, reviews: 289, stock: 5, description: "كرت شاشة RTX 3060 لتجربة ألعاب مذهلة", badge: "جيمنج" },
  { id: 8, name: "Microsoft Surface Pro", nameEn: "Microsoft Surface Pro", category: "الإلكترونيات", price: 3800, image: getImg("electronics", 7), rating: 4.6, reviews: 234, stock: 10, description: "لابتوب وتابلت في آنٍ واحد" },
  // تابلت
  { id: 9, name: "iPad Pro 12.9\"", nameEn: "iPad Pro 12.9\"", category: "الإلكترونيات", price: 4500, originalPrice: 5000, discount: 10, image: getImg("electronics", 0), rating: 4.9, reviews: 612, stock: 12, description: "شاشة Liquid Retina XDR مذهلة", badge: "جديد", isNew: true, isFeatured: true },
  { id: 10, name: "Samsung Galaxy Tab S9", nameEn: "Samsung Galaxy Tab S9", category: "الإلكترونيات", price: 3200, image: getImg("electronics", 1), rating: 4.7, reviews: 378, stock: 20, description: "شاشة AMOLED 2X وأداء استثنائي" },
  { id: 11, name: "Xiaomi Pad 6", nameEn: "Xiaomi Pad 6", category: "الإلكترونيات", price: 1400, image: getImg("electronics", 2), rating: 4.5, reviews: 256, stock: 35, description: "أفضل تابلت بسعر متوسط" },
  { id: 12, name: "Huawei MatePad 11", nameEn: "Huawei MatePad 11", category: "الإلكترونيات", price: 1600, image: getImg("electronics", 3), rating: 4.4, reviews: 189, stock: 28, description: "شاشة 120Hz وقلم M-Pencil" },
];

// هواتف
const phoneProducts: Product[] = Array.from({ length: 80 }, (_, i) => {
  const brands = ["Samsung Galaxy", "iPhone", "Xiaomi", "Oppo", "Huawei", "Vivo", "Realme", "OnePlus", "Nokia", "Motorola"];
  const models = ["Pro Max", "Ultra", "Plus", "Lite", "Standard", "SE", "Neo", "Edge", "X", "S"];
  const brand = brands[i % brands.length];
  const model = models[Math.floor(i / brands.length) % models.length];
  const basePrice = brand.includes("iPhone") ? rnd(3000, 7000) : rnd(500, 4000);
  return {
    id: 100 + i,
    name: `${brand} ${model} ${2023 + (i % 2)}`,
    nameEn: `${brand} ${model} ${2023 + (i % 2)}`,
    category: "الهواتف",
    price: basePrice,
    originalPrice: i % 3 === 0 ? Math.round(basePrice * 1.15) : undefined,
    discount: i % 3 === 0 ? 13 : undefined,
    image: getImg("phones", i),
    rating: rating(),
    reviews: rnd(50, 800),
    stock: rnd(5, 50),
    description: `هاتف ${brand} ${model} بكاميرا ${rnd(48, 200)}MP وذاكرة ${[6, 8, 12][i % 3]}GB RAM`,
    badge: i % 10 === 0 ? "الأكثر مبيعاً" : undefined,
    isNew: i % 8 === 0,
    isFeatured: i % 15 === 0,
  };
});

// أزياء
const fashionProducts: Product[] = Array.from({ length: 90 }, (_, i) => {
  const items = [
    "فستان سهرة أنيق", "قميص قطني فاخر", "بنطلون جينز", "تيشيرت كاجوال",
    "جاكيت شتوي", "عباءة مطرزة", "بلوزة حرير", "تنورة ميدي", "جاكيت جلد",
    "سترة رسمية", "فستان صيفي", "قميص كتان", "شورت رياضي", "هودي دافئ"
  ];
  const colors = ["أسود", "أبيض", "أزرق", "أحمر", "بيج", "رمادي", "أخضر", "بنفسجي"];
  const item = items[i % items.length];
  const color = colors[i % colors.length];
  const basePrice = rnd(50, 800);
  return {
    id: 200 + i,
    name: `${item} - ${color}`,
    nameEn: `Fashion Item ${i}`,
    category: "الأزياء",
    price: basePrice,
    originalPrice: i % 4 === 0 ? Math.round(basePrice * 1.2) : undefined,
    discount: i % 4 === 0 ? 20 : undefined,
    image: getImg("fashion", i),
    rating: rating(),
    reviews: rnd(20, 500),
    stock: rnd(10, 100),
    description: `${item} ${color} عالي الجودة، مريح وأنيق لجميع المناسبات`,
    badge: i % 12 === 0 ? "وصل حديثاً" : undefined,
    isNew: i % 7 === 0,
  };
});

// منزل وديكور
const homeProducts: Product[] = Array.from({ length: 70 }, (_, i) => {
  const items = [
    "طقم غرفة نوم", "كنبة فاخرة", "طاولة قهوة", "ثريا ذهبية", "سجادة بريمة",
    "ستائر مطرزة", "إطار صور", "مزهرية", "ساعة حائط", "مرآة مزخرفة",
    "رف خشبي", "لوحة فنية", "وسادة زخرفية", "طقم مطبخ", "مصباح أرضي"
  ];
  const item = items[i % items.length];
  const basePrice = rnd(80, 3000);
  return {
    id: 300 + i,
    name: `${item} - موديل ${i + 1}`,
    nameEn: `Home Item ${i}`,
    category: "المنزل والديكور",
    price: basePrice,
    originalPrice: i % 5 === 0 ? Math.round(basePrice * 1.25) : undefined,
    discount: i % 5 === 0 ? 25 : undefined,
    image: getImg("home", i),
    rating: rating(),
    reviews: rnd(15, 300),
    stock: rnd(5, 60),
    description: `${item} بتصميم عصري وجودة عالية، يضيف لمسة فاخرة لمنزلك`,
  };
});

// طعام وبقالة
const foodProducts: Product[] = Array.from({ length: 60 }, (_, i) => {
  const items = [
    "زيت زيتون سوري أصيل", "عسل طبيعي معصور", "شاي أخضر فاخر", "قهوة عربية مطحونة",
    "تمر مجدول", "مكسرات مشكلة", "شوكولاتة بلجيكية", "مربى تين بلدي", "زعتر بلدي",
    "دبس رمان طبيعي", "بهارات مشكلة", "ثوم مجفف", "فستق حلبي محمص", "كاكاو فاخر"
  ];
  const item = items[i % items.length];
  const basePrice = rnd(15, 400);
  return {
    id: 400 + i,
    name: `${item} - ${["500غ", "1كغ", "250غ", "2كغ"][i % 4]}`,
    nameEn: `Food Item ${i}`,
    category: "الطعام والبقالة",
    price: basePrice,
    image: getImg("food", i),
    rating: rating(),
    reviews: rnd(30, 600),
    stock: rnd(20, 200),
    description: `${item} طازج وعالي الجودة من أفضل المصادر السورية`,
    badge: i % 8 === 0 ? "منتج محلي" : undefined,
  };
});

// جمال وعناية
const beautyProducts: Product[] = Array.from({ length: 60 }, (_, i) => {
  const items = [
    "كريم مرطب فاخر", "عطر نسائي", "عطر رجالي", "أحمر شفاه", "كحل للعيون",
    "ماسكارا", "كريم أساس", "ظل عيون", "سيروم الوجه", "زيت الشعر",
    "شامبو طبيعي", "كريم مضاد للشمس", "غسول الوجه", "مقشر الجسم"
  ];
  const item = items[i % items.length];
  const basePrice = rnd(20, 600);
  return {
    id: 500 + i,
    name: `${item} - ${["Rose", "Gold", "Pearl", "Diamond", "Natural"][i % 5]}`,
    nameEn: `Beauty Item ${i}`,
    category: "الجمال والعناية",
    price: basePrice,
    originalPrice: i % 3 === 0 ? Math.round(basePrice * 1.3) : undefined,
    discount: i % 3 === 0 ? 30 : undefined,
    image: getImg("beauty", i),
    rating: rating(),
    reviews: rnd(50, 1000),
    stock: rnd(15, 150),
    description: `${item} فاخر من أجود المكونات الطبيعية`,
    badge: i % 6 === 0 ? "خصم 30%" : undefined,
    isNew: i % 9 === 0,
  };
});

// رياضة
const sportsProducts: Product[] = Array.from({ length: 50 }, (_, i) => {
  const items = [
    "حذاء رياضي", "كرة قدم", "دمبل 5كغ", "حصيرة يوغا", "قفازات ملاكمة",
    "دراجة هوائية", "حبل تمرين", "ملابس رياضية", "كرة سلة", "راكيت تنس"
  ];
  const item = items[i % items.length];
  const basePrice = rnd(30, 2000);
  return {
    id: 600 + i,
    name: `${item} - احترافي ${i + 1}`,
    nameEn: `Sports Item ${i}`,
    category: "الرياضة",
    price: basePrice,
    image: getImg("sports", i),
    rating: rating(),
    reviews: rnd(20, 400),
    stock: rnd(8, 80),
    description: `${item} احترافي مناسب لجميع المستويات الرياضية`,
  };
});

// كتب
const bookProducts: Product[] = Array.from({ length: 40 }, (_, i) => {
  const items = [
    "الأيام - طه حسين", "ألف شمس مشرقة", "رواية ثلاثية نجيب محفوظ", "موبي ديك",
    "الشيطان في التفاصيل", "كيف تؤثر في الناس", "فن اللامبالاة", "العالم الجديد الشجاع",
    "هاري بوتر", "ألف ليلة وليلة", "قواعد عشق الأربعين"
  ];
  const item = items[i % items.length];
  const basePrice = rnd(8, 80);
  return {
    id: 700 + i,
    name: `${item}`,
    nameEn: `Book ${i}`,
    category: "الكتب والثقافة",
    price: basePrice,
    image: getImg("books", i),
    rating: rating(),
    reviews: rnd(100, 2000),
    stock: rnd(30, 500),
    description: `كتاب ${item} - نسخة فاخرة مجلدة بأعلى جودة طباعة`,
  };
});

// العاب اطفال
const toyProducts: Product[] = Array.from({ length: 35 }, (_, i) => {
  const items = [
    "ليغو ابداع", "باربي فاخرة", "سيارة تحكم عن بعد", "طائرة مسيّرة", "لعبة ألغاز",
    "دمية ناطقة", "مجموعة رسم", "لعبة شطرنج", "أحجية خشبية"
  ];
  const item = items[i % items.length];
  const basePrice = rnd(20, 500);
  return {
    id: 800 + i,
    name: `${item} - موديل ${i + 1}`,
    nameEn: `Toy ${i}`,
    category: "ألعاب الأطفال",
    price: basePrice,
    image: getImg("toys", i),
    rating: rating(),
    reviews: rnd(30, 400),
    stock: rnd(10, 120),
    description: `${item} آمن للأطفال من سن 3 سنوات فما فوق`,
    badge: i % 7 === 0 ? "الأطفال يحبونه" : undefined,
  };
});

// أدوات ومعدات
const toolProducts: Product[] = Array.from({ length: 30 }, (_, i) => {
  const items = [
    "مثقاب كهربائي", "مفك براغي احترافي", "طقم عدة كاملة", "مفتاح ربط هيدروليكي",
    "شريط قياس", "مستوى ليزر", "قاطع ورق", "لاصق حراري", "مسدس طلاء"
  ];
  const item = items[i % items.length];
  const basePrice = rnd(30, 800);
  return {
    id: 900 + i,
    name: `${item} - احترافي`,
    nameEn: `Tool ${i}`,
    category: "الأدوات والمعدات",
    price: basePrice,
    image: getImg("tools", i),
    rating: rating(),
    reviews: rnd(15, 300),
    stock: rnd(5, 50),
    description: `${item} احترافي من الفولاذ عالي الجودة`,
  };
});

// دمج جميع المنتجات
export const ALL_PRODUCTS: Product[] = [
  ...electronicProducts,
  ...phoneProducts,
  ...fashionProducts,
  ...homeProducts,
  ...foodProducts,
  ...beautyProducts,
  ...sportsProducts,
  ...bookProducts,
  ...toyProducts,
  ...toolProducts,
];

export const CATEGORIES = [
  { id: "all", name: "الكل", icon: "🛒" },
  { id: "الإلكترونيات", name: "الإلكترونيات", icon: "💻" },
  { id: "الهواتف", name: "الهواتف", icon: "📱" },
  { id: "الأزياء", name: "الأزياء", icon: "👗" },
  { id: "المنزل والديكور", name: "المنزل والديكور", icon: "🏠" },
  { id: "الطعام والبقالة", name: "الطعام والبقالة", icon: "🍎" },
  { id: "الجمال والعناية", name: "الجمال والعناية", icon: "💄" },
  { id: "الرياضة", name: "الرياضة", icon: "⚽" },
  { id: "الكتب والثقافة", name: "الكتب والثقافة", icon: "📚" },
  { id: "ألعاب الأطفال", name: "ألعاب الأطفال", icon: "🎮" },
  { id: "الأدوات والمعدات", name: "الأدوات والمعدات", icon: "🔧" },
];

export const FEATURED_PRODUCTS = ALL_PRODUCTS.filter((p) => p.isFeatured).slice(0, 8);
export const NEW_PRODUCTS = ALL_PRODUCTS.filter((p) => p.isNew).slice(0, 8);
