// lib/mutashabihat-data.ts
// Classical Mutashabihat pairs from Islamic scholarship
// Sourced from: Mutashabihat al-Quran traditions, Manzil recitation scholarship

export interface MutashabihatPairData {
  id:         string;
  surah1:     number;
  ayah1:      number;
  juz1:       number;
  text1:      string;
  surah2:     number;
  ayah2:      number;
  juz2:       number;
  text2:      string;
  difference: string;  // What makes them different
  category:   "BEGINNING" | "ENDING" | "MIDDLE" | "PRONOUN" | "VERB_TENSE" | "WORD_ORDER";
  difficulty: 1|2|3|4|5;
  notes:      string;
}

export const MUTASHABIHAT_PAIRS: MutashabihatPairData[] = [
  // ── SURAH AL-BAQARAH / AL-IMRAN OPENING ──
  {
    id:"M001", surah1:2, ayah1:1, juz1:1,
    text1:"الم ذَٰلِكَ الْكِتَابُ لَا رَيْبَ",
    surah2:3, ayah2:1, juz2:3,
    text2:"الم اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ",
    difference:"After الم: ذلك (Baqarah) vs الله (Aal-Imran)",
    category:"BEGINNING", difficulty:2,
    notes:"Most common opening confusion in Hifz"
  },
  // ── يعلمون vs تعلمون ──
  {
    id:"M002", surah1:2, ayah1:13, juz1:1,
    text1:"أَلَا إِنَّهُمْ هُمُ الْمُفْسِدُونَ وَلَٰكِن لَّا يَعْلَمُونَ",
    surah2:2, ayah2:102, juz2:1,
    text2:"لَوْ كَانُوا يَعْلَمُونَ",
    difference:"يعلمون vs تعلمون — third vs second person",
    category:"PRONOUN", difficulty:4,
    notes:"Verb person changes cause frequent confusion"
  },
  // ── خَتَمَ اللَّهُ ──
  {
    id:"M003", surah1:2, ayah1:7, juz1:1,
    text1:"خَتَمَ اللَّهُ عَلَىٰ قُلُوبِهِمْ وَعَلَىٰ سَمْعِهِمْ",
    surah2:45, ayah2:23, juz2:25,
    text2:"وَخَتَمَ عَلَىٰ سَمْعِهِ وَقَلْبِهِ",
    difference:"Order: قلوب then سمع (Baqarah) vs سمع then قلب (Jathiyah)",
    category:"WORD_ORDER", difficulty:4,
    notes:"Word order reversal — extremely common mistake"
  },
  // ── وَمَا اللَّهُ بِغَافِلٍ ──
  {
    id:"M004", surah1:2, ayah1:85, juz1:1,
    text1:"وَمَا اللَّهُ بِغَافِلٍ عَمَّا تَعْمَلُونَ",
    surah2:2, ayah2:144, juz2:2,
    text2:"وَمَا اللَّهُ بِغَافِلٍ عَمَّا تَعْمَلُونَ",
    difference:"Context differs — second occurrence in Qibla passage",
    category:"MIDDLE", difficulty:3,
    notes:"Same text, different context — easy to skip or repeat"
  },
  // ── إِنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ ──
  {
    id:"M005", surah1:2, ayah1:20, juz1:1,
    text1:"إِنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    surah2:3, ayah2:29, juz2:3,
    text2:"وَاللَّهُ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    difference:"إن الله (Baqarah) vs والله (Aal-Imran)",
    category:"BEGINNING", difficulty:3,
    notes:"Beginning word difference"
  },
  // ── هُوَ الَّذِي ──
  {
    id:"M006", surah1:2, ayah1:29, juz1:1,
    text1:"هُوَ الَّذِي خَلَقَ لَكُم مَّا فِي الْأَرْضِ جَمِيعًا",
    surah2:67, ayah2:15, juz2:29,
    text2:"هُوَ الَّذِي جَعَلَ لَكُمُ الْأَرْضَ ذَلُولًا",
    difference:"خلق (Baqarah) vs جعل (Mulk)",
    category:"BEGINNING", difficulty:3,
    notes:"Similar opening phrase, different continuation"
  },
  // ── لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ (Ayat ul Kursi area) ──
  {
    id:"M007", surah1:2, ayah1:255, juz1:3,
    text1:"لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
    surah2:2, ayah2:256, juz2:3,
    text2:"لَا إِكْرَاهَ فِي الدِّينِ",
    difference:"Consecutive Ayahs — students jump or merge them",
    category:"BEGINNING", difficulty:2,
    notes:"Consecutive proximity confusion"
  },
  // ── وَإِذَا سَأَلَكَ ──
  {
    id:"M008", surah1:2, ayah1:186, juz1:2,
    text1:"وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ",
    surah2:7, ayah2:55, juz2:8,
    text2:"ادْعُوا رَبَّكُمْ تَضَرُّعًا وَخُفْيَةً",
    difference:"Context: Fasting Dua (Baqarah) vs general Dua (A'raf)",
    category:"MIDDLE", difficulty:3,
    notes:"Both in Dua contexts"
  },
  // ── إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ ──
  {
    id:"M009", surah1:2, ayah1:277, juz1:3,
    text1:"إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَأَقَامُوا الصَّلَاةَ",
    surah2:10, ayah2:9, juz2:11,
    text2:"إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ يَهْدِيهِمْ رَبُّهُم",
    difference:"Continuation: وأقاموا الصلاة (Baqarah) vs يهديهم (Yunus)",
    category:"BEGINNING", difficulty:4,
    notes:"Very common opening — many continuations across Quran"
  },
  // ── رَبَّنَا لَا تُزِغْ قُلُوبَنَا ──
  {
    id:"M010", surah1:3, ayah1:8, juz1:3,
    text1:"رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا",
    surah2:3, ayah2:147, juz2:4,
    text2:"رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا",
    difference:"Two Rabbana duas close in same Surah",
    category:"BEGINNING", difficulty:3,
    notes:"Multiple Rabbana duas in Aal-Imran"
  },
  // ── قُلْ هُوَ اللَّهُ أَحَدٌ ──
  {
    id:"M011", surah1:112, ayah1:1, juz1:30,
    text1:"قُلْ هُوَ اللَّهُ أَحَدٌ اللَّهُ الصَّمَدُ",
    surah2:112, ayah2:3, juz2:30,
    text2:"لَمْ يَلِدْ وَلَمْ يُولَدْ",
    difference:"Verses 1-2 vs 3-4 — students merge/skip",
    category:"MIDDLE", difficulty:1,
    notes:"Short Surah but consecutive verse confusion"
  },
  // ── فَبِأَيِّ آلَاءِ رَبِّكُمَا ──
  {
    id:"M012", surah1:55, ayah1:13, juz1:27,
    text1:"فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ",
    surah2:55, ayah2:16, juz2:27,
    text2:"فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ",
    difference:"Repeated 31 times — students lose count of repetitions",
    category:"MIDDLE", difficulty:5,
    notes:"Rahman repeated refrain — hardest in entire Quran"
  },
  // ── وَيْلٌ يَوْمَئِذٍ لِّلْمُكَذِّبِينَ ──
  {
    id:"M013", surah1:77, ayah1:15, juz1:29,
    text1:"وَيْلٌ يَوْمَئِذٍ لِّلْمُكَذِّبِينَ",
    surah2:77, ayah2:19, juz2:29,
    text2:"وَيْلٌ يَوْمَئِذٍ لِّلْمُكَذِّبِينَ",
    difference:"Repeated 10 times in Al-Mursalat — students skip repetitions",
    category:"MIDDLE", difficulty:5,
    notes:"Al-Mursalat repeated refrain"
  },
  // ── كَلَّا إِنَّ الْإِنسَانَ ──
  {
    id:"M014", surah1:96, ayah1:6, juz1:30,
    text1:"كَلَّا إِنَّ الْإِنسَانَ لَيَطْغَىٰ",
    surah2:89, ayah2:15, juz2:30,
    text2:"فَأَمَّا الْإِنسَانُ إِذَا مَا ابْتَلَاهُ رَبُّهُ",
    difference:"إن الإنسان vs فأما الإنسان — similar subjects",
    category:"BEGINNING", difficulty:3,
    notes:"Juz 30 short Surahs with similar themes"
  },
  // ── إِنَّ الَّذِينَ كَفَرُوا ──
  {
    id:"M015", surah1:2, ayah1:6, juz1:1,
    text1:"إِنَّ الَّذِينَ كَفَرُوا سَوَاءٌ عَلَيْهِمْ",
    surah2:36, ayah2:10, juz2:22,
    text2:"وَسَوَاءٌ عَلَيْهِمْ أَأَنذَرْتَهُمْ أَمْ لَمْ تُنذِرْهُمْ",
    difference:"سواء عليهم appears in both but different context",
    category:"MIDDLE", difficulty:3,
    notes:"Parallel structure"
  },
  // ── أَلَا إِنَّهُمْ ──
  {
    id:"M016", surah1:2, ayah1:12, juz1:1,
    text1:"أَلَا إِنَّهُمْ هُمُ الْمُفْسِدُونَ",
    surah2:2, ayah2:13, juz2:1,
    text2:"أَلَا إِنَّهُمْ هُمُ السُّفَهَاءُ",
    difference:"المفسدون (12) vs السفهاء (13) — back-to-back Ayahs",
    category:"ENDING", difficulty:4,
    notes:"Adjacent Ayahs with parallel structure"
  },
  // ── وَاتَّقُوا اللَّهَ ──
  {
    id:"M017", surah1:2, ayah1:194, juz1:2,
    text1:"وَاتَّقُوا اللَّهَ وَاعْلَمُوا أَنَّ اللَّهَ مَعَ الْمُتَّقِينَ",
    surah2:2, ayah2:196, juz2:2,
    text2:"وَاتَّقُوا اللَّهَ وَاعْلَمُوا أَنَّ اللَّهَ شَدِيدُ الْعِقَابِ",
    difference:"مع المتقين (194) vs شديد العقاب (196)",
    category:"ENDING", difficulty:4,
    notes:"Same prefix, different ending — 2 Ayahs apart"
  },
  // ── وَلَا تَقُولُوا ──
  {
    id:"M018", surah1:2, ayah1:154, juz1:2,
    text1:"وَلَا تَقُولُوا لِمَن يُقْتَلُ فِي سَبِيلِ اللَّهِ أَمْوَاتٌ",
    surah2:3, ayah2:169, juz2:4,
    text2:"وَلَا تَحْسَبَنَّ الَّذِينَ قُتِلُوا فِي سَبِيلِ اللَّهِ أَمْوَاتًا",
    difference:"ولا تقولوا (Baqarah) vs ولا تحسبن (Aal-Imran) — martyrs topic",
    category:"BEGINNING", difficulty:4,
    notes:"Same topic (martyrs) in two Surahs"
  },
  // ── يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ ──
  {
    id:"M019", surah1:2, ayah1:178, juz1:2,
    text1:"يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الْقِصَاصُ",
    surah2:2, ayah2:183, juz2:2,
    text2:"يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ",
    difference:"القصاص (178) vs الصيام (183) — both كتب عليكم",
    category:"BEGINNING", difficulty:4,
    notes:"Same opening 6 words, different rulings"
  },
  // ── صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ ──
  {
    id:"M020", surah1:1, ayah1:7, juz1:1,
    text1:"صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ",
    surah2:4, ayah2:69, juz2:5,
    text2:"مَعَ الَّذِينَ أَنْعَمَ اللَّهُ عَلَيْهِم",
    difference:"أنعمت عليهم (Fatiha) vs أنعم الله عليهم (Nisa)",
    category:"MIDDLE", difficulty:2,
    notes:"Fatiha phrase echoed in Nisa"
  },
  // ── رَبِّ اشْرَحْ لِي صَدْرِي ──
  {
    id:"M021", surah1:20, ayah1:25, juz1:16,
    text1:"رَبِّ اشْرَحْ لِي صَدْرِي",
    surah2:94, ayah2:1, juz2:30,
    text2:"أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ",
    difference:"Musa's dua (Ta-Ha) vs statement (Inshirah) — same concept",
    category:"BEGINNING", difficulty:2,
    notes:"Dua form vs statement form"
  },
  // ── وَالضُّحَىٰ وَاللَّيْلِ ──
  {
    id:"M022", surah1:93, ayah1:1, juz1:30,
    text1:"وَالضُّحَىٰ وَاللَّيْلِ إِذَا سَجَىٰ",
    surah2:92, ayah2:1, juz2:30,
    text2:"وَاللَّيْلِ إِذَا يَغْشَىٰ وَالنَّهَارِ",
    difference:"يغشى (Al-Layl) vs سجى (Ad-Duha) — both night openings",
    category:"BEGINNING", difficulty:3,
    notes:"Juz 30 surahs with similar night themes"
  },
  // ── إِنَّا أَعْطَيْنَاكَ ──
  {
    id:"M023", surah1:108, ayah1:1, juz1:30,
    text1:"إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ",
    surah2:17, ayah2:101, juz2:15,
    text2:"وَلَقَدْ آتَيْنَا مُوسَىٰ تِسْعَ آيَاتٍ",
    difference:"أعطيناك vs آتينا — giving verbs",
    category:"BEGINNING", difficulty:2,
    notes:"Different subjects of giving"
  },
  // ── فِي قُلُوبِهِم مَّرَضٌ ──
  {
    id:"M024", surah1:2, ayah1:10, juz1:1,
    text1:"فِي قُلُوبِهِم مَّرَضٌ فَزَادَهُمُ اللَّهُ مَرَضًا",
    surah2:9, ayah2:125, juz2:11,
    text2:"فَأَمَّا الَّذِينَ فِي قُلُوبِهِم مَّرَضٌ فَزَادَتْهُمْ رِجْسًا",
    difference:"فزادهم الله مرضاً (Baqarah) vs فزادتهم رجساً (Tawbah)",
    category:"ENDING", difficulty:5,
    notes:"Nearly identical opening, very different ending"
  },
  // ── يُخَادِعُونَ ──
  {
    id:"M025", surah1:2, ayah1:9, juz1:1,
    text1:"يُخَادِعُونَ اللَّهَ وَالَّذِينَ آمَنُوا",
    surah2:4, ayah2:142, juz2:5,
    text2:"يُخَادِعُونَ اللَّهَ وَهُوَ خَادِعُهُمْ",
    difference:"والذين آمنوا (Baqarah) vs وهو خادعهم (Nisa)",
    category:"ENDING", difficulty:4,
    notes:"Hypocrites described similarly"
  },
  // ── وَبَشِّرِ الَّذِينَ آمَنُوا ──
  {
    id:"M026", surah1:2, ayah1:25, juz1:1,
    text1:"وَبَشِّرِ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ",
    surah2:18, ayah2:2, juz2:15,
    text2:"وَيُبَشِّرَ الْمُؤْمِنِينَ الَّذِينَ يَعْمَلُونَ الصَّالِحَاتِ",
    difference:"بشر (Baqarah) vs يبشر (Kahf) — form differs",
    category:"BEGINNING", difficulty:3,
    notes:"Glad tidings with different verb forms"
  },
  // ── لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ──
  {
    id:"M027", surah1:2, ayah1:286, juz1:3,
    text1:"لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    surah2:7, ayah2:42, juz2:8,
    text2:"لَا نُكَلِّفُ نَفْسًا إِلَّا وُسْعَهَا",
    difference:"لا يكلف الله (Baqarah) vs لا نكلف (A'raf)",
    category:"BEGINNING", difficulty:3,
    notes:"Same concept, different subject"
  },
  // ── يَسْأَلُونَكَ عَنِ ──
  {
    id:"M028", surah1:2, ayah1:189, juz1:2,
    text1:"يَسْأَلُونَكَ عَنِ الْأَهِلَّةِ",
    surah2:2, ayah2:217, juz2:2,
    text2:"يَسْأَلُونَكَ عَنِ الشَّهْرِ الْحَرَامِ",
    difference:"Multiple يسألونك questions in Baqarah — students mix responses",
    category:"BEGINNING", difficulty:4,
    notes:"7 يسألونك in Quran — students mix answers"
  },
  // ── وَمَن يَتَوَلَّ ──
  {
    id:"M029", surah1:5, ayah1:56, juz1:6,
    text1:"وَمَن يَتَوَلَّ اللَّهَ وَرَسُولَهُ وَالَّذِينَ آمَنُوا فَإِنَّ حِزْبَ اللَّهِ",
    surah2:58, ayah2:22, juz2:28,
    text2:"أَلَا إِنَّ حِزْبَ اللَّهِ هُمُ الْمُفْلِحُونَ",
    difference:"حزب الله in Maidah vs Mujadilah",
    category:"ENDING", difficulty:4,
    notes:"Party of Allah mentioned in two surahs"
  },
  // ── سُبْحَانَ الَّذِي ──
  {
    id:"M030", surah1:17, ayah1:1, juz1:15,
    text1:"سُبْحَانَ الَّذِي أَسْرَىٰ بِعَبْدِهِ لَيْلًا",
    surah2:36, ayah2:36, juz2:22,
    text2:"سُبْحَانَ الَّذِي خَلَقَ الْأَزْوَاجَ كُلَّهَا",
    difference:"أسرى (Isra) vs خلق الأزواج (Ya-Sin)",
    category:"BEGINNING", difficulty:3,
    notes:"Subhana alladhi with different actions"
  },
  // ── طسم ──
  {
    id:"M031", surah1:26, ayah1:1, juz1:19,
    text1:"طسم تِلْكَ آيَاتُ الْكِتَابِ الْمُبِينِ",
    surah2:28, ayah2:1, juz2:20,
    text2:"طسم تِلْكَ آيَاتُ الْكِتَابِ الْمُبِينِ",
    difference:"Identical opening — continuation differs (Shu'ara vs Qasas)",
    category:"BEGINNING", difficulty:5,
    notes:"Exact same 2 Ayahs in two different Surahs"
  },
  // ── كَذَٰلِكَ يَطْبَعُ اللَّهُ ──
  {
    id:"M032", surah1:7, ayah1:101, juz1:9,
    text1:"كَذَٰلِكَ يَطْبَعُ اللَّهُ عَلَىٰ قُلُوبِ الْكَافِرِينَ",
    surah2:10, ayah2:74, juz2:11,
    text2:"كَذَٰلِكَ نَطْبَعُ عَلَىٰ قُلُوبِ الْمُعْتَدِينَ",
    difference:"يطبع الله (A'raf) vs نطبع (Yunus); الكافرين vs المعتدين",
    category:"MIDDLE", difficulty:5,
    notes:"Almost identical — two word differences"
  },
  // ── وَلَوْ شِئْنَا ──
  {
    id:"M033", surah1:6, ayah1:35, juz1:7,
    text1:"وَلَوْ شَاءَ اللَّهُ لَجَمَعَهُمْ عَلَى الْهُدَىٰ",
    surah2:10, ayah2:99, juz2:11,
    text2:"وَلَوْ شَاءَ رَبُّكَ لَآمَنَ مَن فِي الْأَرْضِ كُلُّهُمْ",
    difference:"لو شاء الله (An'am) vs لو شاء ربك (Yunus)",
    category:"BEGINNING", difficulty:4,
    notes:"Divine will statements"
  },
  // ── يَا أَيُّهَا النَّاسُ اتَّقُوا ──
  {
    id:"M034", surah1:4, ayah1:1, juz1:4,
    text1:"يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمُ الَّذِي خَلَقَكُم",
    surah2:22, ayah2:1, juz2:17,
    text2:"يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمْ إِنَّ زَلْزَلَةَ السَّاعَةِ",
    difference:"Same opening 6 words, very different continuation",
    category:"BEGINNING", difficulty:4,
    notes:"Two major يا أيها الناس اتقوا openings"
  },
  // ── الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ ──
  {
    id:"M035", surah1:2, ayah1:3, juz1:1,
    text1:"الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ",
    surah2:27, ayah2:3, juz2:19,
    text2:"الَّذِينَ يُقِيمُونَ الصَّلَاةَ وَيُؤْتُونَ الزَّكَاةَ",
    difference:"Order differs: يؤمنون بالغيب first (Baqarah) vs يقيمون first (Naml)",
    category:"WORD_ORDER", difficulty:3,
    notes:"Characteristics of believers — order varies"
  },
];

// ── Category display info ──
export const CATEGORY_INFO: Record<string, { label:string; labelAr:string; color:string; icon:string }> = {
  BEGINNING:   { label:"Similar Beginning",   labelAr:"بداية متشابهة",   color:"#1e40af", icon:"▶️" },
  ENDING:      { label:"Similar Ending",      labelAr:"نهاية متشابهة",   color:"#7c3aed", icon:"⏹️" },
  MIDDLE:      { label:"Similar Middle",      labelAr:"وسط متشابه",       color:"#0f766e", icon:"▪️" },
  PRONOUN:     { label:"Pronoun Difference",  labelAr:"اختلاف الضمير",   color:"#b45309", icon:"👁️" },
  VERB_TENSE:  { label:"Verb Tense",          labelAr:"صيغة الفعل",       color:"#dc2626", icon:"🔄" },
  WORD_ORDER:  { label:"Word Order",          labelAr:"ترتيب الكلمات",   color:"#065f46", icon:"↔️" },
};

export const DIFFICULTY_INFO: Record<number, { label:string; color:string }> = {
  1: { label:"Easy",    color:"#16a34a" },
  2: { label:"Moderate",color:"#0369a1" },
  3: { label:"Medium",  color:"#d97706" },
  4: { label:"Hard",    color:"#dc2626" },
  5: { label:"Expert",  color:"#7c3aed" },
};
