/* ============================================================================
 * SipSaviya · subject catalogue
 * Sri Lankan national curriculum (Grades 1–13), in Sinhala, Tamil and English.
 * Used by: book library, past-paper library, AI tutor, quiz engine, planner.
 * ==========================================================================*/
window.SIP_SUBJECTS = [
  /* ----------------------------------------------------------- grade 6-11 */
  {
    id: "maths", si: "ගණිතය", en: "Mathematics", ta: "கணிதம்", icon: "📐",
    color: "#3b82f6", grades: [6, 7, 8, 9, 10, 11, 12, 13], core: true,
    units: {
      "6-9": ["සංඛ්‍යා (Numbers)", "ස්ථානීය අගය (Place value)", "භාග හා දශම (Fractions & decimals)",
        "ප්‍රතිශත (Percentages)", "අනුපාත හා සමානුපාත (Ratio & proportion)", "වීජ ගණිතය (Algebraic expressions)",
        "සමීකරණ (Simple equations)", "ජ්‍යාමිතිය (Angles, triangles, circles)", "ක්ෂේත්‍රඵලය හා පරිමාව (Area & volume)",
        "දත්ත නිරූපණය (Graphs & statistics)", "සම්භාවිතාව (Probability)", "පයිතගරස් ප්‍රමේයය (Pythagoras)"],
      "10-11": ["සංඛ්‍යා හා නිර්මේය සංඛ්‍යා (Real & irrational numbers)", "වීජීය භාග (Algebraic fractions)",
        "ද්විපද ප්‍රකාශන (Binomial expressions)", "සමීකරණ හා සමීකරණ පද්ධති", "සමගාමී සමීකරණ (Simultaneous equations)",
        "ද්විතීයික සමීකරණ (Quadratic equations)", "සමානුපාත හා ප්‍රතිශත (Proportion)", "ලඝුගණක (Logarithms)",
        "ත්‍රිකෝණමිතිය (Trigonometry)", "ජ්‍යාමිතික නිර්මාණ (Geometric constructions)", "සමාන ත්‍රිකෝණ (Congruence & similarity)",
        "ජ්‍යාමිතික සම්භාවිතාව (Probability)", "සංඛ්‍යානය (Statistics)"],
      "12-13": ["ශ්‍රේණි (Series & progressions)", "බහුපද ශ්‍රිත (Polynomial functions)", "ප්‍රතිලෝම ශ්‍රිත (Inverse functions)",
        "සීමා හා අඛණ්ඩතාව (Limits & continuity)", "අවකලනය (Differentiation)", "අනුකලනය (Integration)",
        "න්‍යාස (Matrices)", "දෛශික (Vectors)", "සංකීර්ණ සංඛ්‍යා (Complex numbers)", "විස්තාරණය (Expansions & binomial theorem)",
        "චක්‍රීය ශ්‍රිත (Circular functions)", "සම්භාවිතා ව්‍යාප්ති (Probability distributions)", "සංඛ්‍යානය හා ප්‍රතිගාමී විශ්ලේෂණය"]
    }
  },
  {
    id: "science", si: "විද්‍යාව", en: "Science", ta: "அறிவியல்", icon: "🔬",
    color: "#10b981", grades: [6, 7, 8, 9, 10, 11], core: true,
    units: {
      "6-9": ["ජීවීන්ගේ වර්ගීකරණය (Classification of organisms)", "ශාක හා සත්ත්ව ලෝකය", "මිනිස් ශරීරය (Human body systems)",
        "ද්‍රව්‍ය හා ඒවායේ ගුණ (Matter & properties)", "මිශ්‍රණ හා වෙන්කිරීම (Mixtures & separation)",
        "බලය හා චලිතය (Force & motion)", "ආලෝකය (Light)", "ශබ්දය (Sound)", "උෂ්ණත්වය හා තාපය (Heat)",
        "චුම්බකත්වය (Magnetism)", "විද්‍යුතය (Electricity)", "පරිසරය හා ජෛව විවිධත්වය (Ecosystems)"],
      "10-11": ["ජීව විද්‍යාව: සෛලය හා පටක (Cell & tissues)", "ශාක පෝෂණය (Plant nutrition)", "මිනිස් ජීර්ණය (Digestion)",
        "ශ්වසනය (Respiration)", "සංසරණ පද්ධතිය (Circulatory system)", "තන්ත්‍රිකා පද්ධතිය (Nervous system)",
        "ප්‍රජනනය (Reproduction)", "ප්‍රවේණිය (Heredity)", "ඇල්කේන වර්ගීකරණය (Alkanes & hydrocarbons)",
        "මව් පදාර්ථවල ව්‍යුහය (Structure of matter)", "පරමාණුක ස්කන්ධය හා මවුලය (Mole concept)",
        "රසායනික ප්‍රතික්‍රියා හා සමීකරණ", "ආම්ලික හා භාෂ්මික (Acids & bases)", "චලනය පිළිබඳ නියම (Laws of motion)",
        "ගුරුත්වාකර්ෂණය (Gravitation)", "ඝනත්වය හා පීඩනය (Density & pressure)", "විද්‍යුත් ධාරාව (Electric current)",
        "විද්‍යුත් චුම්බකත්වය (Electromagnetism)", "අභ්‍යවකාශ විද්‍යාව (Space science)"]
    }
  },
  {
    id: "sinhala", si: "සිංහල භාෂාව හා සාහිත්‍යය", en: "Sinhala Language & Literature", ta: "சிங்கள மொழி", icon: "📖",
    color: "#f59e0b", grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], core: true,
    units: {
      "1-5": ["අකුරු හුරුව (Letters)", "වචන හා වාක්‍ය (Words & sentences)", "කියවීම හා රචනය", "කවි හා ගීත", "ශ්‍රවණය හා කථනය"],
      "6-9": ["ව්‍යාකරණය (Grammar)", "ව්‍යුත්පත්ති (Etymology)", "ඡන්දස් (Prosody)", "රචනා ලිවීම", "ලිපි හා වාර්තා ලිවීම",
        "ගද්‍ය හා පද්‍ය විචාරය", "වචන කෝෂය (Vocabulary)"],
      "10-11": ["පද්‍ය සාහිත්‍යය (Poetry)", "ගද්‍ය සාහිත්‍යය (Prose)", "නාට්‍ය හා සිනමා (Drama)", "ව්‍යාකරණ හා ව්‍යුත්පත්ති",
        "රචනා ලිවීම", "සාහිත්‍ය විචාරය"],
      "12-13": ["සිංහල සාහිත්‍ය ඉතිහාසය", "පුරාතන පද්‍ය (හේළ අවස්ථාව)", "සන්න සහ ගද්‍ය සාහිත්‍යය", "නූතන සාහිත්‍යය",
        "සාහිත්‍ය විචාර මූලධර්ම", "භාෂාවේ ස්වරූපය හා භාෂා විද්‍යාව"]
    }
  },
  {
    id: "english", si: "ඉංග්‍රීසි", en: "English", ta: "ஆங்கிலம்", icon: "🔤",
    color: "#8b5cf6", grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], core: true,
    units: {
      "1-5": ["Alphabet & phonics", "Everyday words", "Simple sentences", "Reading aloud", "Picture description"],
      "6-9": ["Tenses", "Articles & prepositions", "Vocabulary building", "Comprehension", "Letter & email writing", "Listening & speaking"],
      "10-11": ["Reported speech", "Passive voice", "Conditionals", "Essay & letter writing", "Comprehension & summary",
        "Vocabulary in context", "Dialogues & interviews"],
      "12-13": ["Advanced grammar", "Literature appreciation", "Argumentative essays", "Summary writing", "Translation", "Précis & formal writing"]
    }
  },
  {
    id: "history", si: "ඉතිහාසය", en: "History", ta: "வரலாறு", icon: "🏛️",
    color: "#a16207", grades: [6, 7, 8, 9, 10, 11], core: true,
    units: {
      "6-9": ["පුරාවිද්‍යාව හා මූලාශ්‍ර (Sources & archaeology)", "ශ්‍රී ලංකාවේ පැරණි ශිෂ්ටාචාරය",
        "රාජ වංශ (Anuradhapura, Polonnaruwa)", "කොළඹ යුගය (Colonial era)", "ලෝක ශිෂ්ටාචාර (World civilisations)",
        "ශ්‍රී ලංකාවේ නිදහස් අරගලය"],
      "10-11": ["ශ්‍රී ලංකාවේ ජනාවාස හා රාජ්‍ය පිහිටුවීම", "විදේශ ආක්‍රමණ හා ප්‍රතිරෝධය", "යටත් විජිත පාලනය (1796–1948)",
        "නිදහසින් පසු ශ්‍රී ලංකාව", "ලෝක යුද්ධ හා ජාත්‍යන්තර සබඳතා", "ආර්ථික හා සමාජ වෙනස්කම්"]
    }
  },
  {
    id: "geography", si: "භූගෝල විද්‍යාව", en: "Geography", ta: "புவியியல்", icon: "🌏",
    color: "#0891b2", grades: [6, 7, 8, 9, 10, 11, 12, 13], core: true,
    units: {
      "6-9": ["භූගෝලීය සිතියම් කියවීම (Maps)", "දේශගුණය හා කාලගුණය", "ශ්‍රී ලංකාවේ භූ ලක්ෂණ", "ජනගහනය",
        "කෘෂිකර්මය හා කර්මාන්ත", "ස්වාභාවික සම්පත්"],
      "10-11": ["පෘථිවියේ භූ විද්‍යාත්මක ක්‍රියාවලි", "දේශගුණික කලාප", "ජල චක්‍රය හා ජල සම්පත්", "පස හා පස සංරක්ෂණය",
        "ලෝක ජනගහන ව්‍යාප්තිය", "නාගරීකරණය", "සංචාරක කර්මාන්තය", "සිතියම්කරණය හා GIS මූලිකාංග"],
      "12-13": ["භෞතික භූගෝලය", "මානව භූගෝලය", "පරිසර භූගෝලය", "ප්‍රායෝගික භූගෝලය (Field work)", "භූ-තොරතුරු පද්ධති"]
    }
  },
  {
    id: "civics", si: "පුරවැසි අධ්‍යාපනය", en: "Citizenship Education", ta: "குடிமைக் கல்வி", icon: "⚖️",
    color: "#dc2626", grades: [6, 7, 8, 9, 10, 11], core: true,
    units: {
      "6-9": ["පවුල හා සමාජය", "අපගේ අයිතිවාසිකම් හා යුතුකම්", "ප්‍රජාතන්ත්‍රවාදය", "ශ්‍රී ලංකාවේ ආණ්ඩු ක්‍රමය",
        "නීතිය හා සාධාරණත්වය", "සාමය හා සමගිය"],
      "10-11": ["ශ්‍රී ලංකා ආණ්ඩුක්‍රම ව්‍යවස්ථාව", "මූලික අයිතිවාසිකම්", "ජාතික වගකීම්", "ආර්ථික හා සමාජ සංවර්ධනය",
        "සමාජ සුබසාධනය හා සංවිධාන", "ජාත්‍යන්තර සංවිධාන"]
    }
  },
  {
    id: "ict", si: "තොරතුරු හා සන්නිවේදන තාක්ෂණය", en: "ICT", ta: "தகவல் தொழில்நுட்பம்", icon: "💻",
    color: "#0ea5e9", grades: [6, 7, 8, 9, 10, 11, 12, 13], core: false,
    units: {
      "6-9": ["පරිගණකයට හැඳින්වීම හා ආරක්ෂාව", "මෙහෙයුම් පද්ධති", "වචන සකසන (Word processing)", "පැතුරුම්පත් (Spreadsheets)",
        "ඉදිරිපත් කිරීම් (Presentations)", "අන්තර්ජාලය හා ඊමේල්", "ඇල්ගොරිතම හා ප්‍රවාහ රූප (Flowcharts)", "පයිතන්/ස්ක්‍රැච් මූලිකාංග"],
      "10-11": ["දත්ත නිරූපණය (Number systems)", "තර්ක ද්වාර හා පරිපථ (Logic gates)", "පරිගණක ජාල (Networks)", "දත්ත සමුදාය (Databases)",
        "පයිතන් ක්‍රමලේඛනය", "වෙබ් නිර්මාණය (HTML)", "මල්ටිමීඩියා", "සයිබර් ආරක්ෂාව හා නීතිය"],
      "12-13": ["ක්‍රමලේඛනය (Python)", "දත්ත ව්‍යුහ හා ඇල්ගොරිතම", "දත්ත සමුදාය කළමනාකරණය (SQL)", "මෘදුකාංග ඉංජිනේරු විද්‍යාව",
        "පරිගණක ජාල හා ආරක්ෂාව", "වෙබ් පද්ධති සංවර්ධනය", "ව්‍යාපාරික පද්ධති විශ්ලේෂණය (Systems analysis)"]
    }
  },
  {
    id: "health", si: "සෞඛ්‍යය හා ශාරීරික අධ්‍යාපනය", en: "Health & Physical Education", ta: "நலவியல்", icon: "🏃",
    color: "#16a34a", grades: [6, 7, 8, 9, 10, 11], core: true,
    units: {
      "6-9": ["පෝෂණය (Nutrition)", "පෞද්ගලික සනීපාරක්ෂාව", "ශාරීරික ක්‍රියාකාරකම්", "රෝග හා ආරක්ෂාව", "මානසික සෞඛ්‍යය"],
      "10-11": ["කායික ශික්ෂණය", "ආහාර රටාව හා ශරීර ස්කන්ධ දර්ශකය", "මත්ද්‍රව්‍ය හා දුම්වැටි අනතුරු", "ප්‍රථමාධාර (First aid)", "ක්‍රීඩා කුසලතා හා නීති"]
    }
  },
  {
    id: "buddhism", si: "බුද්ධ ධර්මය", en: "Buddhism", ta: "பௌத்தம்", icon: "☸️",
    color: "#ea580c", grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], core: false,
    units: {
      "1-5": ["බුදු ගුණ", "දම් ගුණ", "සඟ ගුණ", "ජාතක කථා", "බෝධි පූජා හා ආශිර්වාද"],
      "6-9": ["බුද්ධ චරිතය", "ධම්මපදය", "සතර බ්‍රහ්ම විහරණ", "ආර්ය අෂ්ටාංගික මාර්ගය", "පංචසීලය", "සිංහල බෞද්ධ සංස්කෘතිය"],
      "10-11": ["ත්‍රිපිටකය", "අභිධර්මයේ මූලිකාංග", "පටිච්චසමුප්පාදය", "බෝධිපාක්ෂික ධර්ම", "බෞද්ධ සංස්කෘතිය හා කලාව"],
      "12-13": ["බුද්ධ දර්ශනය", "අභිධර්මය", "පාලි භාෂාව", "බෞද්ධ ශිෂ්ටාචාරය හා ඉතිහාසය", "බෞද්ධ ආචාර ධර්ම"]
    }
  },
  {
    id: "tamil", si: "දෙමළ", en: "Tamil", ta: "தமிழ்", icon: "🪔",
    color: "#7c3aed", grades: [6, 7, 8, 9, 10, 11], core: false,
    units: {
      "6-9": ["தமிழ் எழுத்துக்கள் (Alphabets)", "சொற்கள் மற்றும் வாக்கியங்கள்", "இலக்கணம் (Grammar)", "படித்தல் மற்றும் எழுதுதல்"],
      "10-11": ["இலக்கணம்", "கவிதை மற்றும் உரைநடை", "கட்டுரை எழுதுதல்", "மொழிபெயர்ப்பு"]
    }
  },
  {
    id: "agriculture", si: "කෘෂිකර්මය හා ගෘහ විද්‍යාව", en: "Agriculture & Home Science", ta: "விவசாயம்", icon: "🌾",
    color: "#65a30d", grades: [6, 7, 8, 9, 10, 11], core: false,
    units: {
      "6-9": ["පස හා පොහොර (Soil & fertiliser)", "එළවළු වගාව", "ගෘහ උද්‍යානය", "පශු සම්පත්", "ආහාර සංරක්ෂණය", "ගෘහ කළමනාකරණය"],
      "10-11": ["භෝග විද්‍යාව", "පශු සම්පත් අභිජනනය", "කෘෂි ආර්ථිකය", "ආහාර තාක්ෂණය", "මූල්‍ය කළමනාකරණය"]
    }
  },
  {
    id: "bas", si: "ව්‍යාපාර හා ගිණුම්කරණ අධ්‍යයනය", en: "Business & Accounting Studies", ta: "வணிகம்", icon: "📊",
    color: "#0d9488", grades: [10, 11], core: false,
    units: {
      "10-11": ["ව්‍යාපාරයේ ස්වභාවය හා පරිසරය", "ව්‍යවසායකත්වය", "ද්විත්ව සටහන් ක්‍රමය (Double entry)",
        "පොත් තැබීම (Books of prime entry)", "වෙළඳ ලාභ හා අලාභ ගිණුම", "ශේෂ පත්‍රය (Balance sheet)",
        "රුක්ෂ ශේෂය හා බැංකු සැසඳීම", "මූල්‍ය ප්‍රකාශන විශ්ලේෂණය", "නිෂ්පාදන පිරිවැය"]
    }
  },
  /* ------------------------------------------------------------------ A/L */
  {
    id: "combmaths", si: "සංයුක්ත ගණිතය", en: "Combined Mathematics", ta: "இணைந்த கணிதம்", icon: "∑",
    color: "#2563eb", grades: [12, 13], core: false, stream: "science",
    units: {
      "12-13": ["සමීකරණයේ මූල (Roots of equations)", "න්‍යාස හා නිර්ණායක (Matrices & determinants)", "දෛශික (Vectors)",
        "ශ්‍රේණි හා අනුක්‍රම (Series)", "සංකීර්ණ සංඛ්‍යා (Complex numbers)", "අවකලනය හා අනුකලනය",
        "අනුකලනයේ යෙදීම් (Applications of integration)", "ත්‍රිකෝණමිතිය හා චක්‍රීය ශ්‍රිත",
        "ප්‍රතිභාවිත සම්බන්ධතා (Recurrence relations)", "සම්භාවිතාව (Probability)", "ව්‍යාප්ති (Distributions)",
        "ගතික විද්‍යාව (Statics & dynamics)", "ස්ථිතිකය (Forces on rigid bodies)"]
    }
  },
  {
    id: "physics", si: "භෞතික විද්‍යාව", en: "Physics", ta: "இயற்பியல்", icon: "🧲",
    color: "#7c3aed", grades: [12, 13], core: false, stream: "science",
    units: {
      "12-13": ["මිනුම් හා ඒකක (Units & measurement)", "අංශු භෞතික විද්‍යාව (Particle physics)", "චලිතය (Motion)",
        "බලය හා නිව්ටන් නියම", "ඝර්ෂණය (Friction)", "කාර්යය, ශක්තිය හා බලය", "වෘත්තීය චලිතය",
        "භ්‍රමණ ගතිකය (Rotational dynamics)", "ස්ථිතික සමතුලිතතාව", "ගුරුත්වාකර්ෂණ ක්ෂේත්‍රය",
        "පදාර්ථවල ගුණ (Elasticity, viscosity)", "තාප භෞතිකය (Thermal physics)", "තරංග (Waves)",
        "ආලෝකය හා දෘශ්‍ය විද්‍යාව", "විද්‍යුත් ක්ෂේත්‍ර හා ධාරිත්‍රක", "විද්‍යුත් ධාරාව හා පරිපථ",
        "චුම්බකත්වය හා විද්‍යුත් චුම්බක ප්‍රේරණය", "ප්‍රත්‍යාවර්ත ධාරාව (AC)", "ඉලෙක්ට්‍රොනික විද්‍යාව"]
    }
  },
  {
    id: "chemistry", si: "රසායන විද්‍යාව", en: "Chemistry", ta: "வேதியியல்", icon: "⚗️",
    color: "#059669", grades: [12, 13], core: false, stream: "science",
    units: {
      "12-13": ["පරමාණුවේ ව්‍යුහය (Atomic structure)", "ඉලෙක්ට්‍රොන වින්‍යාසය", "රසායනික බන්ධන (Chemical bonding)",
        "වායු නියම හා වායු අණුක චලිතවාදය", "තාප රසායනය (Thermochemistry)", "රසායනික සමතුලිතතාව",
        "අයනික සමතුලිතතාව හා pH", "විද්‍යුත් රසායනය (Electrochemistry)", "රසායනික චාලක විද්‍යාව",
        "කාබනික රසායනය: හයිඩ්‍රොකාබන", "ඇල්කොහොල් හා ෆීනෝල", "ඇල්ඩිහයිඩ හා කීටෝන",
        "කාබොක්සිලික් අම්ල හා එස්ටර", "අමයින් හා ප්‍රෝටීන", "වර්ණාවලි විද්‍යාව (Spectroscopy)",
        "සංක්‍රාන්ති ලෝහ රසායනය"]
    }
  },
  {
    id: "biology", si: "ජීව විද්‍යාව", en: "Biology", ta: "உயிரியல்", icon: "🧬",
    color: "#16a34a", grades: [12, 13], core: false, stream: "science",
    units: {
      "12-13": ["ජීවයේ රසායනික පදනම", "සෛලයේ ව්‍යුහය හා කෘත්‍ය", "සෛල බෙදීම (Mitosis & meiosis)",
        "ප්‍රවේණිය හා ප්‍රතිසංයෝජනය", "ශාක කෘත්‍යාත්මක ජීව විද්‍යාව", "ප්‍රකාශ සංශ්ලේෂණය",
        "ජීවීන්ගේ ප්‍රවාහනය", "ශ්වසනය හා විච්ඡේදනය", "අන්තරාසර්ග පද්ධතිය",
        "ස්නායු හා ඉන්ද්‍රිය පද්ධති", "ප්‍රජනනය හා වර්ධනය", "පරිණාමය හා ප්‍රභේදනය",
        "පරිසර විද්‍යාව හා ජෛව තාක්ෂණය", "රෝග හා ප්‍රතිශක්තිය"]
    }
  },
  {
    id: "accounting", si: "ගිණුම්කරණය", en: "Accounting", ta: "கணக்கியல்", icon: "🧾",
    color: "#0891b2", grades: [12, 13], core: false, stream: "commerce",
    units: {
      "12-13": ["ගිණුම්කරණයේ මූලධර්ම", "ද්විත්ව සටහන් ක්‍රමය හා පොත්", "ව්‍යාපාරික ලාභ ගණනය",
        "මූලික ගිණුම්කරණ ප්‍රමිතිය", "සමාගම් ගිණුම් (Company accounts)", "හවුල් ව්‍යාපාර ගිණුම්",
        "මුදල් ප්‍රවාහ ප්‍රකාශය", "පිරිවැය ගිණුම්කරණය", "ප්‍රමිතික පිරිවැය හා විචල්‍ය විශ්ලේෂණය",
        "තීරණාත්මක ගිණුම්කරණය", "විගණනය හා අභ්‍යන්තර පාලනය"]
    }
  },
  {
    id: "business", si: "ව්‍යාපාර අධ්‍යයනය", en: "Business Studies", ta: "வணிகக் கல்வி", icon: "🏢",
    color: "#ca8a04", grades: [12, 13], core: false, stream: "commerce",
    units: {
      "12-13": ["ව්‍යාපාර පරිසරය හා අරමුණු", "ව්‍යාපාර ආකෘති", "කළමනාකරණයේ මූලධර්ම",
        "සැලසුම්කරණය හා තීරණ ගැනීම", "සංවිධාන ව්‍යුහය හා මානව සම්පත්", "අභිප්‍රේරණය හා නායකත්වය",
        "අලෙවිකරණය (Marketing)", "නිෂ්පාදන කළමනාකරණය", "මූල්‍ය කළමනාකරණය", "ව්‍යවසායකත්වය හා නවෝත්පාදනය"]
    }
  },
  {
    id: "economics", si: "ආර්ථික විද්‍යාව", en: "Economics", ta: "பொருளியல்", icon: "📈",
    color: "#e11d48", grades: [12, 13], core: false, stream: "commerce",
    units: {
      "12-13": ["මූලික ආර්ථික සංකල්ප", "ඉල්ලුම හා සැපයුම", "පාරිභෝගික හැසිරීම", "නිෂ්පාදනය හා පිරිවැය",
        "වෙළඳපොළ ව්‍යුහ (Market structures)", "ජාතික ආදායම හා GDP", "මුදල් හා බැංකු ක්‍රමය",
        "උද්ධමනය හා විරැකියාව", "රාජ්‍ය මූල්‍ය ප්‍රතිපත්තිය", "ජාත්‍යන්තර වෙළඳාම හා ගෙවුම් ශේෂය",
        "සංවර්ධන ආර්ථික විද්‍යාව"]
    }
  },
  {
    id: "political", si: "දේශපාලන විද්‍යාව", en: "Political Science", ta: "அரசியல் அறிவியல்", icon: "🏛️",
    color: "#9333ea", grades: [12, 13], core: false, stream: "arts",
    units: {
      "12-13": ["දේශපාලන සිතුවිලි ඉතිහාසය", "රාජ්‍යය හා ස්වෛරීත්වය", "ආණ්ඩුක්‍රම ව්‍යවස්ථා", "ප්‍රජාතන්ත්‍රවාදය හා මැතිවරණ",
        "ශ්‍රී ලංකා ආණ්ඩු ක්‍රමය", "ජාත්‍යන්තර සබඳතා හා සංවිධාන"]
    }
  },
  {
    id: "agri_tech", si: "කෘෂිකර්ම විද්‍යාව (A/L)", en: "Agricultural Science", ta: "விவசாய அறிவியல்", icon: "🚜",
    color: "#4d7c0f", grades: [12, 13], core: false, stream: "science",
    units: {
      "12-13": ["පස හා ජල කළමනාකරණය", "ශාක පෝෂණය හා පොහොර", "බෝග වගාව හා රෝග", "පශු සම්පත් හා මත්ස්‍ය",
        "කෘෂි ආර්ථිකය හා අලෙවිකරණය", "කෘෂි තාක්ෂණය හා යන්ත්‍ර"]
    }
  },
  {
    id: "arts", si: "කලා අධ්‍යාපනය", en: "Aesthetic Studies", ta: "கலைக் கல்வி", icon: "🎨",
    color: "#db2777", grades: [6, 7, 8, 9, 10, 11], core: false,
    units: {
      "6-9": ["චිත්‍ර කලාව", "සංගීතය (රාග ධ්වනි)", "නර්තනය", "නාට්‍ය හා රංග කලාව", "හස්ත කර්මාන්ත"],
      "10-11": ["චිත්‍ර කලාව හා නිර්මාණය", "සංගීතය හා ස්වර ඥානය", "නර්තන විධි", "රංග කලාව හා වේදිකා කළමනාකරණය"]
    }
  }
];

/* O/L and A/L examination subject lists (used by the past-paper library). */
window.SIP_EXAMS = {
  ol: {
    si: "සා.පෙ. (O/L)", en: "G.C.E. O/L", years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
    mandatory: ["sinhala", "english", "maths", "science", "history", "buddhism", "health", "civics", "geography"],
    optional: ["ict", "bas", "tamil", "agriculture", "arts", "music", "drama", "art", "french", "japanese",
      "arabic", "pali", "sanskrit", "islam", "hinduism", "christianity", "catholicism", "russian", "german", "hindi"]
  },
  al: {
    si: "උ.පෙ. (A/L)", en: "G.C.E. A/L", years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
    streams: {
      science: { si: "විද්‍යා", en: "Science", subjects: ["combmaths", "physics", "chemistry", "biology", "agri_tech", "ict"] },
      commerce: { si: "වාණිජ", en: "Commerce", subjects: ["accounting", "business", "economics", "ict", "bas"] },
      arts: { si: "කලා", en: "Arts", subjects: ["political", "economics", "geography", "history", "buddhism", "sinhala", "english", "ict"] },
      tech: { si: "තාක්ෂණවේදය", en: "Technology", subjects: ["eng_tech", "bio_tech", "sci_tech", "ict"] }
    }
  },
  grade5: { si: "5 ශ්‍රේණිය ශිෂ්‍යත්වය", en: "Grade 5 Scholarship", years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
  common: { si: "සාමාන්‍ය පොදු පරීක්ෂණය", en: "Common General Test", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] }
};

/* Subjects that only exist as exam papers (no textbook chapter list above). */
window.SIP_EXTRA_EXAM_SUBJECTS = [
  { id: "music", si: "සංගීතය", en: "Music" },
  { id: "drama", si: "නාට්‍ය හා රංග කලාව", en: "Drama & Theatre" },
  { id: "art", si: "චිත්‍ර කලාව", en: "Art" },
  { id: "french", si: "ප්‍රංශ", en: "French" },
  { id: "japanese", si: "ජපන්", en: "Japanese" },
  { id: "arabic", si: "අරාබි", en: "Arabic" },
  { id: "pali", si: "පාලි", en: "Pali" },
  { id: "sanskrit", si: "සංස්කෘත", en: "Sanskrit" },
  { id: "islam", si: "ඉස්ලාම්", en: "Islam" },
  { id: "hinduism", si: "හින්දු", en: "Hinduism" },
  { id: "christianity", si: "ක්‍රිස්තියානි", en: "Christianity" },
  { id: "catholicism", si: "කතෝලික", en: "Catholicism" },
  { id: "russian", si: "රුසියානු", en: "Russian" },
  { id: "german", si: "ජර්මන්", en: "German" },
  { id: "hindi", si: "හින්දි", en: "Hindi" },
  { id: "eng_tech", si: "ඉංජිනේරු තාක්ෂණවේදය", en: "Engineering Technology" },
  { id: "bio_tech", si: "ජෛව පද්ධති තාක්ෂණවේදය", en: "Bio Systems Technology" },
  { id: "sci_tech", si: "තාක්ෂණවේදය සඳහා විද්‍යාව", en: "Science for Technology" }
];
