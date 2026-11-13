// All site copy, in Persian (source of truth) and English.
// [[double brackets]] mark the accented words in a headline.
const L = (fa, en) => ({ fa, en });

export const brand = L('کاردان', 'Kardan');

export const nav = [
  { file: 'index.html', label: L('خانه', 'Home') },
  { file: 'solutions.html', label: L('راهکارها', 'Solutions') },
  { file: 'domains.html', label: L('حوزه‌های تجربه', 'Experience') },
  { file: 'about.html', label: L('شناخت کاردان', 'About') },
  { file: 'insights.html', label: L('افق تجارت', 'Trade Horizon') },
  { file: 'contact.html', label: L('تماس', 'Contact') },
];

export const ui = {
  cta: L('بررسی مسیر', 'Route review'),
  start: L('شروع گفت‌وگو', 'Start a conversation'),
  menu: L('منو', 'Menu'),
  close: L('بستن', 'Close'),
  scroll: L('اسکرول', 'Scroll'),
  tagline: L('مشاوره تخصصی و اجرای فرآیندهای گمرکی و تجارت خارجی', 'Specialist advisory and execution for customs and foreign trade'),
  closing: L('تصمیم‌های بهتر، از شناخت بهتر آغاز می‌شوند.', 'Better decisions begin with better understanding.'),
  quick: L('دسترسی سریع', 'Quick access'),
  contactInfo: L('اطلاعات تماس', 'Contact details'),
  latest: L('آخرین مطالب افق تجارت', 'Latest from Trade Horizon'),
  address: L('نشانی دفتر', 'Office address'),
  hint: L('نشانگر را روی لوگو حرکت دهید', 'Move the pointer across the wordmark'),
  formNote: L('این فرم هنوز به سرور متصل نیست و چیزی ارسال نشد.', 'This form is not connected to a server yet, so nothing was sent.'),
  home: L('خانه', 'Home'),
  vizCap: L('از پیچیدگی به شفافیت', 'From complexity to clarity'),
  isoCap: L('اجرای هماهنگ', 'Coordinated execution'),
};

export const domains = [
  { ico: 'molecule', art: 'customs', name: L('دارو و مواد اولیه دارویی', 'Pharmaceuticals and pharmaceutical raw materials'), desc: L('پروژه‌هایی که دقت، انطباق با مقررات و زمان‌بندی در آن‌ها اهمیت حیاتی دارد.', 'Projects where precision, regulatory compliance and timing are critical.') },
  { ico: 'signal', art: 'air', name: L('تلفن همراه و تجهیزات ارتباطی', 'Mobile phones and communication equipment'), desc: L('بازاری با تغییرات سریع، ارزش بالا و حساسیت زیاد نسبت به زمان.', 'A market of rapid change, high value and great sensitivity to time.') },
  { ico: 'car', art: 'road', name: L('خودروهای سواری و تجاری', 'Passenger and commercial vehicles'), desc: L('پروژه‌هایی با الزامات قانونی، استانداردها و تصمیم‌های چندلایه.', 'Projects with legal requirements, standards and multi-layered decisions.') },
  { ico: 'circuit', art: 'boxes', name: L('کالای دیجیتال و تجهیزات فناوری', 'Digital goods and technology equipment'), desc: L('محصولاتی که سرعت تغییر بازار، بخش مهمی از تصمیم‌گیری را تشکیل می‌دهد.', 'Products where the pace of market change is a major part of the decision.') },
  { ico: 'gear', art: 'rail', name: L('ماشین‌آلات و تجهیزات صنعتی', 'Industrial machinery and equipment'), desc: L('پروژه‌هایی که هر تصمیم آن‌ها مستقیماً بر تولید و سرمایه‌گذاری اثر می‌گذارد.', 'Projects where every decision directly affects production and investment.') },
  { ico: 'crystal', art: 'contour', name: L('مواد اولیه صنعتی', 'Industrial raw materials'), desc: L('حفظ پایداری زنجیره تأمین، مهم‌ترین عامل موفقیت این پروژه‌هاست.', 'Keeping the supply chain stable is the most important factor in the success of these projects.') },
  { ico: 'lattice', art: 'ocean', name: L('محصولات پتروشیمی', 'Petrochemical products'), desc: L('بازاری با وابستگی بالا به استانداردها، بازار جهانی و مدیریت ریسک.', 'A market highly dependent on standards, the global market and risk management.') },
  { ico: 'health', art: 'customs', name: L('تجهیزات پزشکی', 'Medical equipment'), desc: L('پروژه‌هایی که دقت، انطباق و مسئولیت‌پذیری، نقش تعیین‌کننده دارند.', 'Projects where precision, compliance and accountability play a decisive role.') },
];

export const categories = [
  L('تحلیل مقررات', 'Regulatory analysis'), L('واردات', 'Imports'), L('صادرات', 'Exports'), L('زنجیره تأمین', 'Supply chain'),
  L('لجستیک', 'Logistics'), L('تصمیم‌سازی', 'Decision-making'), L('مدیریت ریسک', 'Risk management'), L('بازارهای جهانی', 'Global markets'),
  L('منطقه آزاد', 'Free zones'), L('پرونده‌های تحلیلی', 'Analytical cases'),
];

export const articles = [
  { cat: L('واردات', 'Imports'), title: L('چرا بسیاری از مشکلات ترخیص، پیش از ورود کالا به گمرک شکل می‌گیرند؟', 'Why do so many clearance problems take shape before the goods ever reach customs?') },
  { cat: L('زنجیره تأمین', 'Supply chain'), title: L('پیش از انتخاب تأمین‌کننده، این پنج سؤال را از خود بپرسید.', 'Before choosing a supplier, ask yourself these five questions.') },
  { cat: L('تصمیم‌سازی', 'Decision-making'), title: L('چه زمانی ارزان‌ترین مسیر، گران‌ترین تصمیم است؟', 'When is the cheapest route the most expensive decision?') },
];

export const question = L(
  'اگر فرصت یک گفت‌وگوی حرفه‌ای با کاردان داشته باشید، دوست دارید درباره چه موضوعی صحبت کنیم؟',
  'If you had the chance of a professional conversation with Kardan, what would you like us to talk about?',
);

/* ------------------------------------------------------------------ Home */
export const home = {
  title: L('کاردان | هر تصمیم مهم، به یک مسیر روشن نیاز دارد', 'Kardan | Every major decision needs a clear route'),
  desc: L(
    'کاردان با بررسی شرایط، تحلیل ریسک‌ها و طراحی مسیر، از تصمیم‌گیری تا اجرای فرآیندهای گمرکی و تجارت خارجی در کنار پروژه قرار می‌گیرد.',
    'Kardan stands beside your project from decision to execution of customs and foreign-trade processes.',
  ),
  hero: {
    lines: L(['هر تصمیم مهم،', 'پیش از اجرا به یک', '[[مسیر روشن]] نیاز دارد.'], ['Every major decision', 'needs a [[clear route]]', 'before execution.']),
    sub: L(
      'کاردان با بررسی شرایط، تحلیل ریسک‌ها و طراحی مسیر، از مرحله تصمیم‌گیری تا اجرای فرآیندهای گمرکی و تجارت خارجی در کنار پروژه قرار می‌گیرد.',
      'By reviewing the conditions, analysing the risks and designing the route, Kardan stands beside the project from the decision stage through to the execution of customs and foreign-trade processes.',
    ),
    secondary: L('شناخت کاردان', 'About Kardan'),
  },
  talk: {
    label: L('گفت‌وگو پیش از اقدام', 'A conversation before action'),
    statement: L('ما معمولاً گفت‌وگو را با پاسخ شروع نمی‌کنیم؛ با سؤال شروع می‌کنیم.', 'We do not usually begin a conversation with an answer; we begin with a question.'),
    more: L(
      'بیشتر پروژه‌های تجارت خارجی، نه به دلیل اجرای ضعیف، بلکه به دلیل تصمیم‌های نادرست در مراحل ابتدایی با مشکل مواجه می‌شوند. به همین دلیل، پیش از هر پیشنهاد، ابتدا تلاش می‌کنیم شرایط پروژه، اهداف، محدودیت‌ها، ریسک‌ها و مسیرهای ممکن را بشناسیم. وقتی مسئله به‌درستی شناخته شود، انتخاب مسیر نیز آگاهانه‌تر خواهد بود.',
      'Most foreign-trade projects run into trouble not because of weak execution, but because of wrong decisions made in the early stages. That is why, before any proposal, we first try to understand the project’s conditions, goals, constraints, risks and possible routes. When the problem is properly understood, the choice of route becomes more informed too.',
    ),
    cards: [
      { ico: 'focus', t: L('شناخت شرایط پروژه', 'Understanding the project'), d: L('پیش از هر تصمیم، باید تصویر دقیقی از شرایط پروژه شکل بگیرد.', 'Before any decision, an accurate picture of the project’s conditions has to take shape.') },
      { ico: 'shield', t: L('شناسایی ریسک‌ها', 'Identifying the risks'), d: L('تمام مسیرها یکسان نیستند. پیش از انتخاب، باید ریسک‌های پنهان شناسایی شوند.', 'Not every route is the same. Hidden risks have to be identified before a choice is made.') },
      { ico: 'routes', t: L('بررسی مسیرهای ممکن', 'Examining the possible routes'), d: L('همیشه تنها یک راه وجود ندارد. مسیرها باید با شرایط پروژه مقایسه شوند.', 'There is not always only one way. Routes have to be compared against the project’s conditions.') },
      { ico: 'node', t: L('تصمیم‌گیری آگاهانه‌تر', 'A more informed decision'), d: L('پس از شناخت، تحلیل و مقایسه، مناسب‌ترین مسیر انتخاب می‌شود.', 'After understanding, analysis and comparison, the most suitable route is chosen.') },
    ],
  },
  domains: {
    label: L('حوزه‌های تجربه', 'Fields of experience'),
    lines: L(['حوزه‌های', '[[تجربه]]'], ['Fields of', '[[experience]]']),
    lead: L('تجربه زمانی ارزشمند است که بتواند در پروژه بعدی، تصمیم بهتری بسازد.', 'Experience is valuable when it can shape a better decision in the next project.'),
    intro: L(
      'هر صنعت، مقررات، ریسک‌ها و پیچیدگی‌های خاص خود را دارد. با این حال، آنچه پروژه‌های موفق را از پروژه‌های پرهزینه متمایز می‌کند، صرفاً شناخت قوانین نیست؛ بلکه توانایی تحلیل شرایط و انتخاب مسیر مناسب است. تجربه کاردان در صنایع مختلف، به ما کمک کرده است تا الگوهای مشترک و تفاوت‌های مهم هر پروژه را بهتر بشناسیم.',
      'Every industry has its own regulations, risks and complexities. Even so, what separates successful projects from costly ones is not knowledge of the rules alone; it is the ability to analyse the conditions and choose a suitable route. Kardan’s experience across industries has helped us recognise the shared patterns and the important differences in each project.',
    ),
    foot: L('هر پروژه، مسیر مخصوص به خود را دارد.', 'Every project has a route of its own.'),
    button: L('بررسی مسیر پروژه', 'Review your project’s route'),
  },
  flow: {
    label: L('مسیر همکاری', 'The path of collaboration'),
    sub: L('هر پروژه ویژگی‌های خاص خود را دارد، اما اصول همکاری ما همیشه بر پایه شناخت، شفافیت و همراهی شکل می‌گیرد.', 'Every project has its own characteristics, but the principles of our collaboration always rest on understanding, transparency and companionship.'),
    steps: [
      { t: L('آغاز گفت‌وگو', 'Opening the conversation'), d: L('آشنایی اولیه با پروژه، شنیدن مسئله و شناخت اهداف.', 'A first acquaintance with the project: hearing the problem and understanding the goals.') },
      { t: L('بررسی شرایط', 'Reviewing the conditions'), d: L('مطالعه مدارک، محدودیت‌ها، فرصت‌ها و ریسک‌های پروژه.', 'Studying the project’s documents, constraints, opportunities and risks.') },
      { t: L('طراحی مسیر', 'Designing the route'), d: L('انتخاب مناسب‌ترین مسیر بر اساس شرایط واقعی پروژه.', 'Choosing the most suitable route based on the project’s real conditions.') },
      { t: L('اجرای هماهنگ', 'Coordinated execution'), d: L('هماهنگی مراحل اجرایی و همراهی تا پایان فرآیند.', 'Coordinating the stages of execution and staying alongside until the process ends.') },
      { t: L('جمع‌بندی و ادامه مسیر', 'Wrap-up and the road ahead'), d: L('پایان یک پروژه، آغاز تجربه‌ای برای تصمیم‌های آینده.', 'The end of one project is the beginning of experience for future decisions.') },
    ],
  },
  why: {
    label: L('چرا کاردان؟', 'Why Kardan?'),
    lines: L(['چرا', '[[کاردان؟]]'], ['Why', '[[Kardan?]]']),
    sub: L('تفاوت یک پروژه موفق، همیشه در سرعت اجرا نیست؛ گاهی در کیفیت تصمیم‌هایی است که پیش از اجرا گرفته می‌شوند.', 'What sets a successful project apart is not always the speed of execution; sometimes it is the quality of the decisions made before execution.'),
    pillars: [
      { art: 'contour', t: L('شناخت قبل از اقدام', 'Understanding before action'), d: L('پیش از ارائه هر پیشنهاد، تلاش می‌کنیم مسئله را از زوایای مختلف بشناسیم. راه‌حل زمانی ارزشمند است که مسئله به‌درستی درک شده باشد.', 'Before offering any proposal, we try to understand the problem from different angles. A solution is valuable only when the problem has been properly understood.') },
      { art: 'air', t: L('تحلیل چندمسیره', 'Multi-route analysis'), d: L('در تجارت خارجی، معمولاً بیش از یک مسیر وجود دارد. انتخاب بهترین مسیر، نتیجه مقایسه گزینه‌هاست؛ نه انتخاب اولین گزینه.', 'In foreign trade there is usually more than one route. The right one comes from comparing the options, not from taking the first.') },
      { art: 'rail', t: L('اجرای هماهنگ', 'Coordinated execution'), d: L('پس از انتخاب مسیر، تمام مراحل پروژه باید به صورت هماهنگ و منظم پیش بروند. هماهنگی، کیفیت اجرا را تضمین می‌کند.', 'Once the route is chosen, every stage of the project has to move forward in a coordinated, orderly way. Coordination is what secures the quality of execution.') },
      { art: 'customs', t: L('یادگیری مستمر', 'Continuous learning'), d: L('هر پروژه، بخشی از دانش سازمانی کاردان را کامل‌تر می‌کند. تجربه برای ما فقط سابقه نیست؛ سرمایه‌ای است که در پروژه‌های بعدی به کار گرفته می‌شود.', 'Every project makes part of Kardan’s organisational knowledge more complete. For us, experience is not just a record; it is capital put to work in the projects that follow.') },
    ],
    summary: L('اعتماد، نتیجه یک ادعا نیست؛ نتیجه تجربه‌ای است که در تمام مراحل همکاری شکل می‌گیرد.', 'Trust is not the result of a claim; it is the result of an experience formed across every stage of working together.'),
    button: L('مسیر پروژه خود را بررسی کنیم', 'Let’s review your project’s route'),
  },
  cases: {
    label: L('پرونده‌های واقعی', 'Real cases'),
    lines: L(['پرونده‌های', '[[واقعی]]'], ['Real', '[[cases]]']),
    lead: L('هر پروژه، مسئله‌ای منحصربه‌فرد دارد؛ اما بسیاری از تجربه‌های آن می‌توانند به تصمیم‌های بهتر در پروژه‌های بعدی کمک کنند.', 'Every project has a problem of its own; yet much of what it teaches can lead to better decisions in the projects that follow.'),
    sampleLabel: L('نمونه ساختار پرونده', 'Sample case structure'),
    field: L('واردات ماشین‌آلات صنعتی', 'Import of industrial machinery'),
    rows: [
      [L('مسئله', 'The problem'), L('مسیر انتخاب‌شده باعث افزایش زمان توقف کالا می‌شد.', 'The chosen route was increasing the time the goods stood idle.')],
      [L('تحلیل', 'Analysis'), L('شرایط حمل، مجوزها، زمان‌بندی و ساختار ثبت سفارش مجدداً بررسی شد.', 'Shipping conditions, permits, timing and the structure of the order registration were reviewed again.')],
      [L('تصمیم', 'Decision'), L('مسیر جایگزین انتخاب شد.', 'An alternative route was chosen.')],
      [L('نتیجه', 'Outcome'), L('ریسک توقف پروژه به میزان قابل توجهی کاهش یافت.', 'The risk of the project stalling was considerably reduced.')],
      [L('درس‌آموخته', 'Lesson learned'), L('در پروژه‌های سرمایه‌ای، کیفیت تصمیم‌های اولیه مهم‌تر از سرعت اجرای مراحل پایانی است.', 'In capital projects, the quality of the early decisions matters more than the speed of the final stages.')],
    ],
  },
  insights: {
    label: L('افق تجارت', 'Trade Horizon'),
    lines: L(['افق', '[[تجارت]]'], ['Trade', '[[Horizon]]']),
    lead: L('جایی برای تحلیل، تجربه و نگاه عمیق‌تر به تجارت خارجی.', 'A place for analysis, experience and a deeper look at foreign trade.'),
    button: L('مطالعه افق تجارت', 'Read Trade Horizon'),
  },
  contact: {
    label: L('ارتباط با کاردان', 'Contact Kardan'),
    lines: L(['ارتباط با', '[[کاردان]]'], ['Contact', '[[Kardan]]']),
    lead: L('هر پروژه شرایط، ابهامات و اهداف متفاوتی دارد. برای آغاز گفت‌وگو، مسیر مناسب ارتباط را انتخاب کنید.', 'Every project has different conditions, uncertainties and goals. To begin the conversation, choose the channel that suits you.'),
    cards: [
      { ico: 'phone', t: L('تماس تلفنی', 'Phone call'), d: L('برای گفتگوهای فوری و هماهنگی اولیه.', 'For urgent conversations and initial coordination.') },
      { ico: 'chat', t: L('واتساپ', 'WhatsApp'), d: L('برای ارسال مدارک، تصاویر و ادامه ارتباط.', 'For sending documents and images, and for keeping in touch.') },
      { ico: 'mail', t: L('پست الکترونیکی', 'Email'), d: L('برای مکاتبات رسمی، اسناد و درخواست‌های تفصیلی.', 'For formal correspondence, documents and detailed requests.') },
      { ico: 'form', t: L('فرم ارتباط', 'Contact form'), d: L('برای پروژه‌هایی که نیاز به توضیح بیشتری دارند.', 'For projects that need a fuller explanation.') },
    ],
  },
};

/* ------------------------------------------------------------- Solutions */
export const solutions = {
  title: L('راهکارها | کاردان', 'Solutions | Kardan'),
  desc: L('راهکارهای کاردان بر اساس مرحله پروژه، نه نوع خدمت.', 'Kardan’s solutions, organised by project stage rather than by type of service.'),
  eyebrow: L('راهکارها', 'Solutions'),
  lines: L(['هر پروژه، فقط', '[[یک مرحله]] ندارد.'], ['No project has', 'only [[one stage]].']),
  sub: L(
    'گاهی مهم‌ترین تصمیم، پیش از ثبت سفارش گرفته می‌شود و گاهی پس از ورود کالا به گمرک. برای همین، ابتدا باید بدانیم اکنون در کدام نقطه از مسیر قرار دارید.',
    'Sometimes the most important decision is made before the order is registered, and sometimes after the goods reach customs. That is why we first need to know where on the route you are now.',
  ),
  aside: L('بر اساس مرحله پروژه، نه نوع خدمت', 'By project stage, not by type of service'),
  map: {
    label: L('نقشه مسیر تجارت', 'The trade route map'),
    lines: L(['نقشه', '[[مسیر تجارت]]'], ['The trade', '[[route map]]']),
    lead: L('هر پروژه، مراحل مختلفی دارد و نوع همراهی کاردان در هر مرحله متفاوت است.', 'Every project has different stages, and the way Kardan accompanies it differs at each one.'),
  },
  stages: [
    L('پیش از خرید و تعهد', 'Before purchase and commitment'), L('تأمین‌کننده و قرارداد', 'Supplier and contract'),
    L('ثبت سفارش و الزامات ورود', 'Order registration and entry requirements'), L('امور بانکی و ارزی', 'Banking and foreign exchange'),
    L('حمل، بیمه و لجستیک', 'Shipping, insurance and logistics'), L('تشریفات گمرکی و ترخیص', 'Customs formalities and clearance'),
    L('پس از ترخیص و جمع‌بندی', 'After clearance and wrap-up'), L('مدیریت یکپارچه پروژه', 'Integrated project management'),
    L('صادرات و توسعه بازار', 'Exports and market development'),
  ],
  stageWord: L('مرحله', 'Stage'),
  problem: {
    label: L('آغاز از مسئله', 'Starting from the problem'),
    statement: L(
      'اگر هنوز درباره امکان واردات، الزامات قانونی یا مسیر مناسب پروژه خود مطمئن نیستید، ثبت سفارش نباید اولین اقدام شما باشد.',
      'If you are still unsure whether the import is possible, what the legal requirements are, or which route suits your project, registering the order should not be your first step.',
    ),
    more: L(
      'هیچ خدمتی مستقل نیست. هر مرحله ورودی و خروجی دارد و بالای همه آن‌ها یک لایه قرار می‌گیرد که تمام مراحل را به هم متصل می‌کند: تصمیم‌سازی.',
      'No service stands alone. Each stage has an input and an output, and above them all sits one layer that connects every stage: decision-making.',
    ),
  },
  cta: { lines: L(['مسیر پروژه خود را', '[[بررسی کنیم]]'], ['Let’s review', '[[your route]]']) },
};

/* --------------------------------------------------------------- Domains */
export const domainsPage = {
  title: L('حوزه‌های تجربه | کاردان', 'Fields of experience | Kardan'),
  desc: L('حوزه‌هایی که کاردان در آن‌ها تجربه عملی دارد.', 'The fields in which Kardan has practical experience.'),
  eyebrow: L('حوزه‌های تجربه', 'Fields of experience'),
  lines: L(['حوزه‌های', '[[تجربه]]'], ['Fields of', '[[experience]]']),
  aside: L('۸ حوزه', '8 fields'),
  cta: { lines: L(['هر پروژه، مسیر', '[[مخصوص به خود]] را دارد.'], ['Every project has', 'a route [[of its own]].']) },
};

/* ----------------------------------------------------------------- About */
export const about = {
  title: L('شناخت کاردان | کاردان', 'About Kardan'),
  desc: L('چرا کاردان به این شکل فکر می‌کند.', 'Why Kardan thinks the way it does.'),
  eyebrow: L('شناخت کاردان', 'About Kardan'),
  lines: L(['هر پروژه، چیزی', 'به ما [[می‌آموزد]].'], ['Every project', '[[teaches]] us something.']),
  sub: L(
    'آنچه امروز کاردان را شکل داده، فقط سال‌های فعالیت نیست؛ مجموعه‌ای از تجربه‌هایی است که به مرور زمان به یک شیوه فکر کردن تبدیل شده‌اند.',
    'What has shaped Kardan today is not only its years of activity; it is a body of experience that has, over time, become a way of thinking.',
  ),
  aside: L('یک شیوه فکر کردن', 'A way of thinking'),
  story: {
    label: L('داستان شکل‌گیری', 'How it took shape'),
    statement: L(
      'در طول سال‌های فعالیت، بارها با پروژه‌هایی مواجه شدیم که مشکل اصلی آن‌ها در گمرک نبود؛ بلکه تصمیم‌هایی بود که ماه‌ها قبل از ورود کالا گرفته شده بود.',
      'Over the years we repeatedly met projects whose real problem was not at customs; it lay in decisions made months before the goods arrived.',
    ),
    more: L(
      'همین تجربه‌ها، نگاه ما را تغییر داد. به مرور، متوجه شدیم ارزش واقعی ما صرفاً در اجرای فرآیندها نیست؛ بلکه در کمک به تصمیم‌گیری آگاهانه پیش از آغاز مسیر است. کاردان از همین نگاه شکل گرفت.',
      'Those experiences changed the way we see our work. Over time we realised that our real value lies not merely in carrying out processes, but in supporting an informed decision before the route begins. Kardan grew out of that view.',
    ),
  },
  philosophy: {
    label: L('فلسفه کاردان', 'Kardan’s philosophy'),
    items: [L('شناخت پیش از اقدام', 'Understanding before action'), L('تصمیم‌سازی پیش از اجرا', 'Decision-making before execution'), L('یادگیری پس از هر پروژه', 'Learning after every project')],
  },
  values: {
    label: L('ارزش‌های بنیادین', 'Core values'),
    lines: L(['ارزش‌های', '[[بنیادین]]'], ['Core', '[[values]]']),
    items: [L('صداقت حرفه‌ای', 'Professional honesty'), L('مسئولیت‌پذیری', 'Accountability'), L('محرمانگی', 'Confidentiality'), L('یادگیری مستمر', 'Continuous learning'), L('احترام به منافع مشتری', 'Respect for the client’s interests'), L('شفافیت', 'Transparency')],
  },
  thinking: {
    label: L('روش فکر کردن', 'How we think'),
    lead: L('وقتی با یک پروژه روبه‌رو می‌شویم، چگونه فکر می‌کنیم؟', 'When we face a project, how do we think?'),
    steps: [L('مسئله', 'The problem'), L('شناخت', 'Understanding'), L('تحلیل', 'Analysis'), L('مقایسه مسیرها', 'Comparing routes'), L('تصمیم', 'Decision'), L('اجرا', 'Execution'), L('یادگیری', 'Learning'), L('بازگشت دانش به سازمان', 'Knowledge returned to the organisation')],
  },
  future: {
    label: L('آینده', 'The road ahead'),
    lead: L('ما هنوز در ابتدای مسیر یادگیری هستیم.', 'We are still at the beginning of the road of learning.'),
    items: [L('توسعه بانک دانش', 'Developing the knowledge bank'), L('توسعه افق تجارت', 'Growing Trade Horizon'), L('ابزارهای هوشمند تصمیم‌سازی', 'Intelligent decision-making tools'), L('گسترش حوزه‌های تخصصی', 'Expanding the specialist fields'), L('حضور در بازارهای بین‌المللی', 'A presence in international markets')],
  },
  cta: { lines: L(['اگر مسیر پروژه شما نیاز به', 'بررسی دارد، گفت‌وگو را', '[[از همین‌جا]] آغاز کنیم.'], ['If your project’s route needs', 'a review, let’s begin the', 'conversation [[right here]].']) },
};

/* -------------------------------------------------------------- Insights */
export const insights = {
  title: L('افق تجارت | کاردان', 'Trade Horizon | Kardan'),
  desc: L('تحلیل‌ها، تجربه‌ها و یادداشت‌هایی برای تصمیم‌گیری آگاهانه‌تر در تجارت خارجی.', 'Analyses, experiences and notes for more informed decisions in foreign trade.'),
  eyebrow: L('افق تجارت', 'Trade Horizon'),
  lines: L(['هر تصمیم بهتر،', 'از یک [[تحلیل بهتر]]', 'آغاز می‌شود.'], ['Every better decision', 'begins with a', '[[better analysis]].']),
  sub: L(
    'افق تجارت، مجموعه‌ای از تحلیل‌ها، تجربه‌ها و یادداشت‌هایی است که با هدف کمک به تصمیم‌گیری آگاهانه‌تر در تجارت خارجی منتشر می‌شوند.',
    'Trade Horizon is a collection of analyses, experiences and notes published to support more informed decisions in foreign trade.',
  ),
  aside: L('ما آنچه را آموخته‌ایم نیز به اشتراک می‌گذاریم', 'We also share what we have learned'),
  topics: { label: L('دسته‌بندی موضوعات', 'Topics'), lines: L(['دسته‌بندی', '[[موضوعات]]'], ['Browse by', '[[topic]]']) },
  selected: { label: L('مطالب منتخب', 'Selected pieces'), lines: L(['مطالب', '[[منتخب]]'], ['Selected', '[[pieces]]']) },
  principles: {
    label: L('اصول تولید محتوا', 'Editorial principles'),
    items: [
      L('نوشتن برای تصمیم‌گیرندگان، نه برای موتور جستجو.', 'Written for decision-makers, not for search engines.'),
      L('تحلیل، نه بازنویسی خبر.', 'Analysis, not rewritten news.'),
      L('بی‌طرفی حرفه‌ای، نه جانبداری.', 'Professional neutrality, not partisanship.'),
      L('ارائه راهکار، نه صرفاً بیان مشکل.', 'Offering a way forward, not merely stating the problem.'),
      L('استناد به منابع معتبر.', 'Citing credible sources.'),
      L('انتقال تجربه، نه نمایش تجربه.', 'Passing experience on, not showing it off.'),
    ],
  },
  subscribe: {
    text: L('اگر مایل هستید تحلیل‌های مهم تجارت خارجی را دریافت کنید، به فهرست به‌روزرسانی‌های کاردان بپیوندید.', 'If you would like to receive the important analyses of foreign trade, join Kardan’s list of updates.'),
    button: L('پیوستن به فهرست', 'Join the list'),
  },
};

/* --------------------------------------------------------------- Contact */
export const contact = {
  title: L('ارتباط با کاردان', 'Contact Kardan'),
  desc: L('هر پروژه، با یک گفت‌وگو آغاز می‌شود.', 'Every project begins with a conversation.'),
  eyebrow: L('ارتباط با کاردان', 'Contact Kardan'),
  lines: L(['هر پروژه، با یک', '[[گفت‌وگو]] آغاز می‌شود.'], ['Every project begins', 'with a [[conversation]].']),
  sub: L(
    'مهم نیست پروژه شما در چه مرحله‌ای قرار دارد. اگر هنوز مسئله‌ای وجود دارد که نیاز به بررسی دارد، گفتگو را از همان نقطه آغاز می‌کنیم.',
    'It does not matter what stage your project is at. If there is still a question that needs examining, we begin the conversation from that very point.',
  ),
  aside: L('از توضیح مسئله آغاز کنید، نه از تکمیل فرم', 'Begin by describing the problem, not by filling in a form'),
  fields: {
    name: L('نام', 'Name'),
    company: L('نام شرکت (اختیاری)', 'Company name (optional)'),
    reach: L('راه ارتباطی', 'How to reach you'),
    subject: L('موضوع', 'Subject'),
    project: L('توضیح پروژه', 'About the project'),
  },
  methods: [
    { t: L('تماس تلفنی', 'Phone call'), d: L('زمانی که موضوع نیاز به هماهنگی سریع دارد.', 'When the matter needs quick coordination.'), v: '+00 000 000 000' },
    { t: L('واتساپ', 'WhatsApp'), d: L('زمانی که ارسال تصویر، فایل یا مدارک اهمیت دارد.', 'When sending images, files or documents matters.'), v: '+00 000 000 000' },
    { t: L('پست الکترونیکی', 'Email'), d: L('زمانی که موضوع رسمی یا چندمرحله‌ای است.', 'When the matter is formal or has several steps.'), v: 'hello@example.com' },
    { t: L('جلسه حضوری', 'In-person meeting'), d: L('برای پروژه‌هایی که نیاز به بررسی عمیق‌تر دارند؛ فقط با هماهنگی قبلی.', 'For projects that need a deeper review; by prior arrangement only.'), v: '' },
  ],
};
