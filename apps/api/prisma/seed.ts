import { PrismaClient, type ServiceZone, type ServiceCategory } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

type ServiceSeed = {
  slug: string;
  name: string;
  nameEn: string;
  shortDesc: string;
  shortDescEn: string;
  description: string;
  descriptionEn: string;
  zone: ServiceZone;
  category: ServiceCategory;
  durationMinutes: number;
  priceFrom: number;
  priceTo: number | null;
  priceNote: string;
  priceNoteEn: string;
  sortOrder: number;
};

type DoctorSeed = {
  slug: string;
  name: string;
  title: string;
  titleEn: string;
  specialty: string;
  specialtyEn: string;
  bio: string;
  bioEn: string;
  /** Public portrait URL (Unsplash, face-cropped 16:10) used across web + admin. */
  photoUrl: string;
  sipNumber: string;
  experienceYears: number;
  education: string[];
  sortOrder: number;
  serviceSlugs: string[];
  hours: { weekday: number; start: string; end: string }[];
};

// Real, publicly hosted portraits (Unsplash CDN, free to hotlink, no API key).
// `fit=crop&crop=faces` keeps the face centred in the 16:10 hero frame, and the
// same URL also fills the 3:4 doctor cards.
const portrait = (id: string): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&crop=faces&w=1200&h=750&q=80`;

const weekdayHours = [1, 2, 3, 4, 5, 6].flatMap((weekday) => [
  { weekday, start: '09:00', end: '12:00' },
  { weekday, start: '13:00', end: '20:00' },
]);

const serviceSeeds: ServiceSeed[] = [
  {
    slug: 'scaling',
    name: 'Pembersihan Karang Gigi (Scaling)',
    nameEn: 'Dental Scaling & Polishing',
    shortDesc: 'Pembersihan plak dan karang gigi ultrasonik tanpa rasa ngilu berlebih.',
    shortDescEn: 'Ultrasonic plaque and tartar removal with minimal sensitivity.',
    description:
      'Perawatan pembersihan kalkulus (karang gigi) dan plak menggunakan scaler ultrasonik modern. Menghilangkan sarang bakteri penyebab bau mulut, radang gusi, dan pendarahan saat menyikat gigi.',
    descriptionEn:
      'Plaque and calculus removal using modern ultrasonic scalers. Eliminates bacterial reservoirs causing halitosis, gum inflammation, and bleeding.',
    zone: 'gum',
    category: 'prevention',
    durationMinutes: 45,
    priceFrom: 300000,
    priceTo: 550000,
    priceNote: 'Mulai Rp 300 rb (tergantung tingkat keparahan karang gigi)',
    priceNoteEn: 'From IDR 300k (depends on calculus grade)',
    sortOrder: 0,
  },
  {
    slug: 'tambal',
    name: 'Tambal Gigi Komposit Sinar',
    nameEn: 'Light-Cured Composite Filling',
    shortDesc: 'Restorasi gigi berlubang sewarna gigi asli dengan bahan resin komposit kuat.',
    shortDescEn: 'Tooth-colored resin restoration for decayed or chipped teeth.',
    description:
      'Penambalan gigi menggunakan komposit nano-hibrid yang disinari polimerisasi ultra-violet. Menghasilkan tambalan yang menyatu mulus dengan warna gigi asli, kuat untuk mengunyah, dan tahan lama.',
    descriptionEn:
      'Direct restorative filling using nano-hybrid resin polymerized with a curing light. Seamlessly blends with tooth enamel shade and withstands daily mastication.',
    zone: 'molar',
    category: 'restorative',
    durationMinutes: 45,
    priceFrom: 250000,
    priceTo: 600000,
    priceNote: 'Mulai Rp 250 rb (per permukaan lubang)',
    priceNoteEn: 'From IDR 250k (per surface cavity)',
    sortOrder: 1,
  },
  {
    slug: 'bleaching',
    name: 'Pemutihan Gigi (Bleaching In-Office)',
    nameEn: 'In-Office Dental Bleaching',
    shortDesc: 'Mencerahkan warna gigi hingga 4–8 tingkat lebih putih dalam 1 sesi klinis.',
    shortDescEn: 'Brighten tooth shade 4–8 tones in a single in-chair session.',
    description:
      'Perawatan pemutihan gigi estetik profesional menggunakan gel hidrogen peroksida berstandar medis yang diaktivasi sinar LED dingin. Aman untuk email gigi dengan perlindungan gusi ekstra tebal.',
    descriptionEn:
      'Professional aesthetic tooth whitening using medical-grade hydrogen peroxide activated by a cold LED. Safe on enamel with gingival barrier protection.',
    zone: 'front',
    category: 'aesthetic',
    durationMinutes: 60,
    priceFrom: 1500000,
    priceTo: 2800000,
    priceNote: 'Mulai Rp 1,5 jt per sesi (sudah termasuk pemolesan)',
    priceNoteEn: 'From IDR 1.5M per session (including polishing)',
    sortOrder: 2,
  },
  {
    slug: 'veneer',
    name: 'Veneer Porselen Estetik',
    nameEn: 'Porcelain Dental Veneer',
    shortDesc: 'Lapisan keramik ultra tipis untuk senyum simetris, cerah, dan proporsional.',
    shortDescEn: 'Ultra-thin custom porcelain laminate for symmetrical, bright smiles.',
    description:
      'Cangkang keramik e.max tipis berkualitas tinggi yang direkatkan permanen pada permukaan depan gigi. Mengoreksi gigi bernoda permanen, sompel, celah kecil, atau bentuk gigi yang tidak rata.',
    descriptionEn:
      'High-grade ultra-thin e.max ceramic shell bonded to the anterior facial enamel. Corrects discoloration, chips, minor spacing, and uneven contouring.',
    zone: 'front',
    category: 'aesthetic',
    durationMinutes: 90,
    priceFrom: 1500000,
    priceTo: 3500000,
    priceNote: 'Mulai Rp 1,5 jt per gigi (komposit) / Rp 3,5 jt (porselen e.max)',
    priceNoteEn: 'From IDR 1.5M per tooth (composite) / IDR 3.5M (porcelain e.max)',
    sortOrder: 3,
  },
  {
    slug: 'behel',
    name: 'Pemasangan Behel / Kawat Gigi',
    nameEn: 'Orthodontic Braces & Aligners',
    shortDesc: 'Perataan susunan gigi berjejal atau tonggos dengan ortodontis bersertifikat.',
    shortDescEn: 'Orthodontic alignment for crowded or misaligned teeth with certified specialists.',
    description:
      'Perawatan ortodonti komprehensif menggunakan bracket logam konvensional, sapphire transparan, atau self-ligating Damon. Menyelaraskan gigitan (oklusi) dan meratakan estetika senyum.',
    descriptionEn:
      'Comprehensive orthodontic alignment using metal brackets, aesthetic ceramic/sapphire, or Damon self-ligating systems for balanced occlusion and smile harmony.',
    zone: 'arch',
    category: 'orthodontic',
    durationMinutes: 60,
    priceFrom: 5000000,
    priceTo: 14000000,
    priceNote: 'Mulai Rp 5 jt (rahang atas & bawah bertahap)',
    priceNoteEn: 'From IDR 5M (upper & lower arch staged)',
    sortOrder: 4,
  },
  {
    slug: 'implan',
    name: 'Implan Gigi Titanium & Mahkota',
    nameEn: 'Titanium Dental Implant & Crown',
    shortDesc: 'Penggantian akar gigi yang hilang dengan sekrup titanium biologis permanen.',
    shortDescEn: 'Permanent root replacement with biocompatible surgical titanium implant fixture.',
    description:
      'Solusi permanen paling kokoh untuk menggantikan gigi ompong tanpa mengikis gigi tetangga. Menggunakan sekrup titanium kelas medis yang menyatu sempurna dengan tulang rahang (osteointegrasi).',
    descriptionEn:
      'Gold standard tooth replacement anchored permanently into the jawbone without trimming neighboring teeth. Biocompatible osseointegrated titanium system.',
    zone: 'molar',
    category: 'surgery',
    durationMinutes: 90,
    priceFrom: 10000000,
    priceTo: 18000000,
    priceNote: 'Mulai Rp 10 jt per gigi (sudah termasuk fixture & abutment)',
    priceNoteEn: 'From IDR 10M per tooth (fixture & abutment included)',
    sortOrder: 5,
  },
];

const doctorSeeds: DoctorSeed[] = [
  {
    slug: 'drg-ayu',
    name: 'drg. Ayu Larasati, Sp.KG',
    title: 'Spesialis Konservasi Gigi (Endodontis & Restorasi)',
    titleEn: 'Endodontics & Restorative Dental Specialist',
    specialty: 'Konservasi Gigi & Estetik',
    specialtyEn: 'Conservative Dentistry & Aesthetics',
    bio: 'Fokus pada perawatan saluran akar mikroskopis, veneer porselen minimal-prep, dan restorasi komposit estetika tinggi dengan sentuhan yang sangat halus dan teliti.',
    bioEn: 'Specializes in microscopic root canal therapy, minimal-prep porcelain veneers, and high-aesthetic composite restorations with gentle precision.',
    photoUrl: portrait('photo-1559839734-2b71ea197ec2'),
    sipNumber: 'SIP. 503/4421/DPMPTSP/2023',
    experienceYears: 12,
    education: ['Spesialis Konservasi Gigi - Universitas Indonesia', 'Pendidikan Dokter Gigi - Universitas Airlangga'],
    sortOrder: 0,
    serviceSlugs: ['scaling', 'tambal', 'bleaching', 'veneer'],
    hours: weekdayHours,
  },
  {
    slug: 'drg-bima',
    name: 'drg. Bima Wicaksono, Sp.Ort',
    title: 'Spesialis Ortodonti (Behel & Aligner)',
    titleEn: 'Orthodontics & Dentofacial Orthopedics Specialist',
    specialty: 'Ortodonti & Perataan Gigi',
    specialtyEn: 'Orthodontics & Bite Alignment',
    bio: 'Berpengalaman menangani ratusan kasus maloklusi rumit, behel self-ligating, serta aligner transparan untuk remaja dan dewasa.',
    bioEn: 'Extensive experience treating complex malocclusion, self-ligating bracket dynamics, and clear aligners for adults and teens.',
    photoUrl: portrait('photo-1612349317150-e413f6a5b16d'),
    sipNumber: 'SIP. 503/8912/DPMPTSP/2022',
    experienceYears: 10,
    education: ['Spesialis Ortodonti - Universitas Gadjah Mada', 'Pendidikan Dokter Gigi - Universitas Indonesia'],
    sortOrder: 1,
    serviceSlugs: ['behel', 'scaling'],
    hours: weekdayHours,
  },
  {
    slug: 'drg-citra',
    name: 'drg. Citra Dewi, Sp.BM',
    title: 'Spesialis Bedah Mulut & Maksilofasial',
    titleEn: 'Oral & Maxillofacial Surgeon',
    specialty: 'Implan Gigi & Odontektomi',
    specialtyEn: 'Implantology & Wisdom Tooth Surgery',
    bio: 'Menangani pemasangan implan gigi dengan pemandu 3D CBCT, pencabutan gigi bungsu impaksi yang minim trauma, dan rekonstruksi tulang rahang.',
    bioEn: 'Dedicated to CBCT-guided dental implant placement, atraumatic wisdom tooth extractions, and alveolar bone ridge augmentations.',
    photoUrl: portrait('photo-1594824476967-48c8b964273f'),
    sipNumber: 'SIP. 503/3218/DPMPTSP/2024',
    experienceYears: 9,
    education: ['Spesialis Bedah Mulut - Universitas Padjadjaran', 'Pendidikan Dokter Gigi - Universitas Padjadjaran'],
    sortOrder: 2,
    serviceSlugs: ['implan', 'scaling'],
    hours: weekdayHours,
  },
];

const faqSeeds = [
  {
    question: 'Apakah biaya perawatan di klinik transparan?',
    questionEn: 'Are treatment costs fully transparent?',
    answer: 'Ya, seluruh estimasi biaya disampaikan secara tertulis dan disetujui pasien sebelum tindakan medis dimulai. Tidak ada biaya tersembunyi.',
    answerEn: 'Yes, all cost estimates are shared in writing and agreed upon before any procedure begins. There are zero hidden fees.',
    category: 'biaya',
    sortOrder: 0,
  },
  {
    question: 'Bagaimana standar sterilisasi alat medis di klinik ini?',
    questionEn: 'What is the sterilization standard for clinic instruments?',
    answer: 'Kami menerapkan sterilisasi Autoclave Kelas B berstandar rumah sakit internasional dengan kantong bersegel steril individual yang baru dibuka di depan pasien.',
    answerEn: 'We adhere to international hospital-grade Class B Autoclave sterilization with individually pouch-sealed instruments opened in front of you.',
    category: 'fasilitas',
    sortOrder: 1,
  },
  {
    question: 'Apakah saya perlu membuat janji temu (booking) terlebih dahulu?',
    questionEn: 'Is an advance appointment booking mandatory?',
    answer: 'Sangat disarankan melakukan booking online untuk memastikan ketersediaan dokter spesialis dan meminimalkan waktu tunggu di ruang tunggu klinik.',
    answerEn: 'We highly recommend advance online booking to guarantee doctor availability and eliminate unnecessary waiting time.',
    category: 'booking',
    sortOrder: 2,
  },
  {
    question: 'Bagaimana jika saya perlu membatalkan atau mengubah jadwal booking?',
    questionEn: 'How can I reschedule or cancel my booking?',
    answer: 'Anda dapat melakukan reschedule atau pembatalan secara mandiri melalui halaman kelola booking atau menghubungi tim kami via WhatsApp minimal 3 jam sebelumnya.',
    answerEn: 'You can reschedule or cancel online via the booking management page or by notifying our team on WhatsApp at least 3 hours prior.',
    category: 'booking',
    sortOrder: 3,
  },
];

const testimonialSeeds = [
  {
    name: 'Rian Sastrowardoyo',
    text: 'Klinik gigi paling nyaman yang pernah saya kunjungi. Dokter sangat sabar menjelaskan kondisi gigi lewat layar kamera. Scaling sama sekali tidak ngilu, tempatnya bersih dan tenang.',
    textEn: 'The most calming dental practice I have visited. The doctor patiently explained my condition on screen. The scaling was completely painless.',
    serviceName: 'Scaling & Tambal Komposit',
    serviceNameEn: 'Scaling & Composite Filling',
    reviewedAt: '2 minggu lalu',
    rating: 5,
    source: 'Google Review',
    sortOrder: 0,
  },
  {
    name: 'Melissa Wijaya',
    text: 'Sudah 8 bulan kontrol behel di sini. Progress perataan giginya cepat sekali dan tidak perlu cabut gigi sehat. Penjelasan biaya dari awal sangat transparan.',
    textEn: '8 months into my braces here. Tooth alignment progress is remarkably fast without extracting healthy teeth. Upfront pricing was crystal clear.',
    serviceName: 'Pemasangan Behel Self-Ligating',
    serviceNameEn: 'Self-Ligating Braces',
    reviewedAt: '1 bulan lalu',
    rating: 5,
    source: 'Google Review',
    sortOrder: 1,
  },
  {
    name: 'Bambang Hardianto',
    text: 'Sempat takut pasang implan karena bayangan operasi, tapi dokternya sangat profesional. Tindakannya cepat, pemulihannya lancar, sekarang saya bisa mengunyah normal lagi.',
    textEn: 'I was hesitant about implants, but the surgeon was extremely professional. Swift procedure and smooth healing; I can chew normally again.',
    serviceName: 'Implan Gigi Geraham',
    serviceNameEn: 'Molar Dental Implant',
    reviewedAt: '3 bulan lalu',
    rating: 5,
    source: 'Pasien Terverifikasi',
    sortOrder: 2,
  },
  {
    name: 'Nadia Putri',
    text: 'Puas banget sama hasil bleaching sebelum acara pernikahan. Warna gigi naik 5 shade, senyum jadi jauh lebih percaya diri.',
    textEn: 'Incredibly pleased with the in-office bleaching before my wedding day. Teeth brightened 5 shades for a far more confident smile.',
    serviceName: 'Bleaching Gigi In-Office',
    serviceNameEn: 'In-Office Bleaching',
    reviewedAt: '1 bulan lalu',
    rating: 5,
    source: 'WhatsApp',
    sortOrder: 3,
  },
];

const articleCategorySeeds = [
  { slug: 'kesehatan-gigi', name: 'Kesehatan Gigi', nameEn: 'Oral Health', sortOrder: 0 },
  { slug: 'ortodonti', name: 'Ortodonti', nameEn: 'Orthodontics', sortOrder: 1 },
  { slug: 'estetik', name: 'Estetik', nameEn: 'Aesthetics', sortOrder: 2 },
  { slug: 'anak', name: 'Gigi Anak', nameEn: 'Pediatric Care', sortOrder: 3 },
];

const articleSeeds = [
  {
    slug: 'kapan-harus-ke-dokter-gigi',
    title: 'Bukan Tunggu Sakit: Kapan Waktu Terbaik Periksa ke Dokter Gigi?',
    titleEn: 'Don’t Wait for Toothache: When Is the Best Time for a Dental Checkup?',
    excerpt: 'Banyak masalah gigi seperti karies mikro dan radang gusi tidak menimbulkan rasa sakit di tahap awal.',
    excerptEn: 'Most dental issues such as micro-cavities and gingivitis are painless at initial stages.',
    body: 'Sebagian besar masyarakat baru datang ke klinik gigi ketika rasa sakit sudah tak tertahankan. Padahal rasa sakit menandakan infeksi telah mencapai pulpa.\n\nPemeriksaan rutin setiap 6 bulan memungkinkan dokter mendeteksi lubang sekecil jarum sebelum membesar, serta membersihkan kalkulus yang menjadi tempat berkembang biak bakteri patogen.',
    bodyEn: 'Many patients only visit a dental practice when severe pulpitis strikes. However, pain means the bacteria have already reached the nerve canal.\n\nA bi-annual routine checkup enables early cavity diagnosis before it expands, while removing hard tartar that harbors pathogenic colonies.',
    readTime: '4 min read',
    authorName: 'drg. Ayu Larasati, Sp.KG',
    authorTitle: 'Spesialis Konservasi Gigi',
    categorySlug: 'kesehatan-gigi',
    publishedAt: new Date('2026-09-12T00:00:00.000Z'),
  },
  {
    slug: 'perbedaan-behel-dan-aligner',
    title: 'Behel Konvensional vs Aligner Transparan: Mana yang Lebih Cocok?',
    titleEn: 'Traditional Braces vs Clear Aligners: Which One Fits Your Lifestyle?',
    excerpt: 'Ulasan objektif mengenai efektivitas, durasi, estetika, dan komitmen perawatan antara kawat gigi klasik dan aligner transparan.',
    excerptEn: 'An objective review on biomechanical efficiency, aesthetics, duration, and compliance between braces and clear aligners.',
    body: 'Kawat gigi tetap menjadi standar emas untuk pergeseran rotasi gigi yang parah atau kasus gigitan dalam kompleks yang membutuhkan daya mekanis kuat.\n\nAligner transparan menawarkan fleksibilitas estetika: hampir tidak terlihat, dapat dilepas saat makan, dan memudahkan pembersihan gigi tanpa kawat yang mengganjal.',
    bodyEn: 'Fixed orthodontic brackets remain the clinical benchmark for complex rotations and deep-bite malocclusions requiring sustained vectors.\n\nClear aligners provide unmatched aesthetic discretion: virtually invisible, removable during meals, and easy to floss.',
    readTime: '6 min read',
    authorName: 'drg. Bima Wicaksono, Sp.Ort',
    authorTitle: 'Spesialis Ortodonti',
    categorySlug: 'ortodonti',
    publishedAt: new Date('2026-08-28T00:00:00.000Z'),
  },
  {
    slug: 'fakta-mitos-bleaching-gigi',
    title: '5 Mitos dan Fakta Seputar Pemutihan Gigi (Bleaching)',
    titleEn: '5 Myths and Facts About Professional Teeth Whitening',
    excerpt: 'Apakah bleaching mengikis email? Berapa lama hasilnya bertahan? Simak penjelasan ilmiah dari dokter gigi kami.',
    excerptEn: 'Does bleaching erode enamel? How long does it last? Scientific answers from our certified restorative dentist.',
    body: 'Mitos 1: Bleaching mengikis email gigi. Faktanya: gel peroksida medis bekerja dengan mengoksidasi molekul pigmen warna di dalam tubuli dentin, bukan mengamplas lapisan email.\n\nMitos 2: Hasil bleaching permanen selamanya. Faktanya: kebiasaan minum kopi, teh, dan merokok akan perlahan menimbulkan noda baru setelah 1–2 tahun.',
    bodyEn: 'Myth 1: Bleaching wears enamel away. Fact: medical peroxide works by oxidizing chromatic pigments inside dentinal tubules without abrasive stripping.\n\nMyth 2: Whitening is permanent forever. Fact: coffee, dark teas, and tobacco gradually cause new stains after 1–2 years.',
    readTime: '5 min read',
    authorName: 'drg. Ayu Larasati, Sp.KG',
    authorTitle: 'Spesialis Konservasi Gigi',
    categorySlug: 'estetik',
    publishedAt: new Date('2026-08-05T00:00:00.000Z'),
  },
];

async function main() {
  // Demo seed content is upserted with an `update` payload so re-running
  // `yarn seed` refreshes the canonical demo rows instead of silently skipping
  // them when the record already exists.
  const settingsData = {
    name: 'Klinik Demo',
    phone: '+6221000000',
    waNumber: '+628120000000',
    address: 'Jakarta, Indonesia',
    timezone: 'Asia/Jakarta',
    chairsCount: 3,
    reminderTemplates: {},
    socials: {},
    tagline: 'Perawatan Gigi Modern dengan Pendekatan Ramah dan Transparan',
    taglineEn: 'Modern Dental Care with a Gentle and Transparent Approach',
    city: 'Jakarta Selatan',
    instagramHandle: '@klinikgigi_demo',
    googleMapsUrl: 'https://maps.google.com/?q=Jakarta',
    openHours: {
      openHoursDesc: 'Senin – Sabtu: 09:00 – 20:00 WIB (Istirahat 12:00 – 13:00)',
      openHoursDescEn: 'Monday – Saturday: 09:00 – 20:00 WIB (Break 12:00 – 13:00)',
      regularHours: {
        weekdays: 'Senin – Sabtu',
        weekdaysTime: '09:00 – 20:00 WIB',
        sunday: 'Minggu',
        sundayTime: 'Tutup',
        breakTime: 'Istirahat: 12:00 – 13:00 WIB',
      },
    },
    stats: [
      { label: 'Pasien Puas', labelEn: 'Satisfied Patients', value: '[JUMLAH]+', unit: 'orang' },
      { label: 'Tahun Pengalaman', labelEn: 'Years Experience', value: '[TAHUN]', unit: 'tahun' },
      { label: 'Rating Rata-rata', labelEn: 'Average Rating', value: '4.9', unit: '/ 5.0' },
      { label: 'Dokter Spesialis', labelEn: 'Specialist Doctors', value: '3', unit: 'drg. Sp.' },
    ],
  };

  await prisma.clinicSettings.upsert({
    where: { id: 'default' },
    update: settingsData,
    create: { id: 'default', ...settingsData },
  });

  const doctors = await Promise.all(
    doctorSeeds.map(({ serviceSlugs, hours, education, ...doctor }) =>
      prisma.doctor.upsert({
        where: { slug: doctor.slug },
        update: { ...doctor, education },
        create: { ...doctor, education },
      }),
    ),
  );

  const services = await Promise.all(
    serviceSeeds.map((service) => prisma.service.upsert({ where: { slug: service.slug }, update: service, create: service })),
  );

  const serviceBySlug = new Map(services.map((service) => [service.slug, service]));
  await prisma.doctorService.deleteMany({});
  await prisma.doctorService.createMany({
    data: doctorSeeds.flatMap((doctor, index) =>
      doctor.serviceSlugs
        .map((slug) => serviceBySlug.get(slug))
        .filter((service): service is NonNullable<typeof service> => Boolean(service))
        .map((service) => ({ doctorId: doctors[index].id, serviceId: service.id })),
    ),
    skipDuplicates: true,
  });

  await prisma.workingHour.deleteMany({});
  await prisma.workingHour.createMany({
    data: doctorSeeds.flatMap((doctor, index) =>
      doctor.hours.map((hour) => ({
        doctorId: doctors[index].id,
        weekday: hour.weekday,
        startTime: new Date(`1970-01-01T${hour.start}:00.000Z`),
        endTime: new Date(`1970-01-01T${hour.end}:00.000Z`),
      })),
    ),
    skipDuplicates: true,
  });

  for (const faq of faqSeeds) {
    const existing = await prisma.faq.findFirst({ where: { question: faq.question } });
    if (!existing) await prisma.faq.create({ data: { ...faq, isPublished: true } });
  }

  for (const testimonial of testimonialSeeds) {
    const existing = await prisma.testimonial.findFirst({ where: { name: testimonial.name, text: testimonial.text } });
    if (!existing) await prisma.testimonial.create({ data: { ...testimonial, isPublished: true } });
  }

  await prisma.galleryItem.deleteMany({});
  const gallerySeeds = [
    { slug: 'bleaching', type: 'before_after' as const, beforeLabel: 'Kuning Noda Kopi (Shade A3.5)', afterLabel: 'Hasil 1 Sesi (Shade B1)', caption: 'Pencerahan noda intrinsik akibat konsumsi teh dan kopi pekat.', captionEn: 'Enamel brightening on stubborn coffee staining in a single visit.', treatmentDuration: '60 Menit' },
    { slug: 'veneer', type: 'before_after' as const, beforeLabel: 'Gigi Sompel & Diastema', afterLabel: 'Smile Makeover e.max', caption: 'Penutupan celah gigi depan (diastema) dengan laminasi porselen tahan noda.', captionEn: 'Anterior midline diastema closure with stain-resistant ceramic veneers.', treatmentDuration: '2 Kunjungan' },
    { slug: 'behel', type: 'before_after' as const, beforeLabel: 'Crowding Rahang Atas', afterLabel: 'Lengkung Rapi Teratur', caption: 'Perataan gigi berjejal tanpa pencabutan gigi premolar.', captionEn: 'Non-extraction orthodontic expansion resolving severe crowding.', treatmentDuration: '18 Bulan' },
    { slug: 'tambal', type: 'before_after' as const, beforeLabel: 'Karies Dalam Gigi 46', afterLabel: 'Anatomi Oklusal Alami', caption: 'Restorasi resin komposit nano-hibrid dengan pewarnaan fisur alami.', captionEn: 'Layered nano-hybrid composite sculpting with natural fissure tinting.', treatmentDuration: '45 Menit' },
  ];
  for (const [index, item] of gallerySeeds.entries()) {
    const service = serviceBySlug.get(item.slug);
    if (!service) continue;
    await prisma.galleryItem.create({
      data: {
        type: item.type,
        beforeUrl: `https://placehold.co/800x600?text=Before+${index + 1}`,
        afterUrl: `https://placehold.co/800x600?text=After+${index + 1}`,
        beforeLabel: item.beforeLabel,
        afterLabel: item.afterLabel,
        caption: item.caption,
        captionEn: item.captionEn,
        treatmentDuration: item.treatmentDuration,
        serviceId: service.id,
        consentConfirmed: true,
        isPublished: true,
        sortOrder: index,
      },
    });
  }

  const categories = await Promise.all(
    articleCategorySeeds.map((category) => prisma.articleCategory.upsert({ where: { slug: category.slug }, update: category, create: category })),
  );
  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));
  await Promise.all(
    articleSeeds.map(({ categorySlug, ...article }) =>
      prisma.article.upsert({
        where: { slug: article.slug },
        update: { ...article, categoryId: categoryBySlug.get(categorySlug)?.id ?? null },
        create: { ...article, categoryId: categoryBySlug.get(categorySlug)?.id ?? null },
      }),
    ),
  );

  if (process.env.ADMIN_SEED_PASSWORD) {
    await prisma.user.upsert({
      where: { email: process.env.ADMIN_SEED_EMAIL ?? 'owner@clinic.local' },
      update: {},
      create: {
        email: process.env.ADMIN_SEED_EMAIL ?? 'owner@clinic.local',
        name: 'Clinic Owner',
        role: 'owner',
        passwordHash: await argon2.hash(process.env.ADMIN_SEED_PASSWORD),
      },
    });
  }
}

main().finally(() => prisma.$disconnect());
