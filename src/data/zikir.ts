export interface ZikirItem {
  id: string
  urutan: number
  judul: string
  arab: string
  latin: string
  terjemahan: string
  keutamaan?: string
  ulangan: number        // berapa kali dibaca
  sumber?: string
  waktu: ('pagi' | 'petang' | 'keduanya')[]
}

// =============================================
// ZIKIR PAGI — Al-Awrad Al-Banna (setelah Subuh)
// Disusun oleh Imam Hasan Al-Banna
// =============================================
export const ZIKIR_PAGI: ZikirItem[] = [
  {
    id: 'pagi-istighfar',
    urutan: 1,
    judul: 'Istighfar',
    arab: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
    latin: "Astaghfirullaahal-'azhiimalladzii laa ilaaha illaa huwal-hayyul-qayyuumu wa atuubu ilaih",
    terjemahan: 'Aku mohon ampun kepada Allah Yang Maha Agung, tiada tuhan selain Dia Yang Maha Hidup lagi Maha Berdiri Sendiri, dan aku bertaubat kepada-Nya.',
    keutamaan: 'Barangsiapa membacanya, Allah ampuni dosanya meskipun ia lari dari perang. (HR. Abu Dawud)',
    ulangan: 3,
    sumber: 'HR. Abu Dawud & At-Tirmidzi',
    waktu: ['keduanya'],
  },
  {
    id: 'pagi-asbahna',
    urutan: 2,
    judul: 'Doa Memasuki Pagi',
    arab: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    latin: "Ashbahnaa wa-ashbahal-mulku lillaah, walhamdulillaah, laa ilaaha illallaahu wahdahu laa syariika lah, lahul-mulku walahul-hamdu wa huwa 'alaa kulli syai-in qadiir",
    terjemahan: 'Kami memasuki pagi hari dan alam semesta ini kepunyaan Allah. Segala puji bagi Allah. Tiada tuhan selain Allah semata, tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan segala puji, dan Dia Maha Kuasa atas segala sesuatu.',
    keutamaan: 'Diucapkan setiap memasuki pagi hari. (HR. Muslim)',
    ulangan: 1,
    sumber: 'HR. Muslim',
    waktu: ['pagi'],
  },
  {
    id: 'pagi-allahumma-anta-rabbi',
    urutan: 3,
    judul: 'Sayyidul Istighfar',
    arab: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ لَكَ بِذَنْبِي، فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    latin: "Allaahumma anta rabbii laa ilaaha illaa anta, khalaqtanii wa anaa 'abduka, wa anaa 'alaa 'ahdika wa wa'dika mastatho'tu, a'uudzu bika min syarri maa shona'tu, abuu-u laka bini'matika 'alayya wa abuu-u laka bidzambii, faghfirlii fa-innahuu laa yaghfirudz-dzunuuba illaa anta",
    terjemahan: 'Ya Allah, Engkau adalah Tuhanku, tiada tuhan selain Engkau. Engkau menciptakanku dan aku adalah hamba-Mu. Aku berada di atas perjanjian dan janji-Mu semampuku. Aku berlindung kepada-Mu dari keburukan perbuatanku. Aku mengakui nikmat-Mu atasku dan aku mengakui dosaku, maka ampunilah aku, sesungguhnya tiada yang dapat mengampuni dosa-dosa selain Engkau.',
    keutamaan: 'Barangsiapa membacanya dengan yakin di pagi hari lalu meninggal di hari itu, ia masuk surga. (HR. Bukhari)',
    ulangan: 1,
    sumber: 'HR. Bukhari',
    waktu: ['keduanya'],
  },
  {
    id: 'pagi-ayat-kursi',
    urutan: 4,
    judul: 'Ayat Kursi',
    arab: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    latin: "Allaahu laa ilaaha illaa huwal-hayyul-qayyuum, laa ta-khudzuhuu sinatuw-walaa nawm, lahuu maa fis-samaawaati wa maa fil-ardh, man dzalladzii yasyfa'u 'indahuu illaa bi-idznih, ya'lamu maa bayna aydiihim wa maa khalfahum, wa laa yuhiithuuna bisyai-im-min 'ilmihii illaa bimaa syaa-a, wasi'a kursiyyuhus-samaawaati wal-ardha walaa ya-uuduhuu hifzhuhumaa wahuwal-'aliyyul-'azhiim",
    terjemahan: 'Allah, tidak ada tuhan selain Dia, Yang Maha Hidup, Yang terus menerus mengurus (makhluk-Nya). Tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan apa yang ada di bumi...',
    keutamaan: 'Barangsiapa membaca Ayat Kursi setiap pagi dan petang, ia dijaga Allah hingga pagi atau petang berikutnya. (HR. Al-Hakim)',
    ulangan: 1,
    sumber: 'QS. Al-Baqarah: 255 | HR. Al-Hakim',
    waktu: ['keduanya'],
  },
  {
    id: 'pagi-ikhlas-falaq-nas',
    urutan: 5,
    judul: 'Al-Ikhlas, Al-Falaq, An-Nas',
    arab: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    latin: "Qul huwallahu ahad, allahush-shamad, lam yalid wa lam yuulad, wa lam yakun lahuu kufuwan ahad",
    terjemahan: 'Katakanlah: Dialah Allah, Yang Maha Esa. Allah tempat meminta segala sesuatu. Dia tidak beranak dan tidak pula diperanakkan. Dan tidak ada sesuatu yang setara dengan Dia.',
    keutamaan: 'Membaca Al-Ikhlas, Al-Falaq, An-Nas masing-masing 3× setiap pagi dan petang cukup untuk menjaga dari segala sesuatu. (HR. Abu Dawud & At-Tirmidzi)',
    ulangan: 3,
    sumber: 'HR. Abu Dawud, At-Tirmidzi, An-Nasa\'i',
    waktu: ['keduanya'],
  },
  {
    id: 'pagi-laailaha-wah',
    urutan: 6,
    judul: 'La Ilaha Illallah Wahdahu',
    arab: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    latin: "Laa ilaaha illallaahu wahdahu laa syariika lah, lahul-mulku walahul-hamdu wa huwa 'alaa kulli syai-in qadiir",
    terjemahan: 'Tiada tuhan selain Allah semata, tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan segala puji, dan Dia Maha Kuasa atas segala sesuatu.',
    keutamaan: 'Membaca ini 10× di pagi hari sama dengan memerdekakan 4 budak dari keturunan Ismail, ditulis 10 kebaikan, dihapus 10 keburukan, diangkat 10 derajat, dan dijaga dari setan hingga petang. (HR. Ahmad)',
    ulangan: 10,
    sumber: 'HR. Ahmad, An-Nasa\'i',
    waktu: ['keduanya'],
  },
  {
    id: 'pagi-subhanallah-100',
    urutan: 7,
    judul: 'Tasbih (Subhanallahi wa Bihamdihi)',
    arab: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    latin: 'Subhanallaahi wa bihamdihi',
    terjemahan: 'Maha Suci Allah dan dengan memuji-Nya.',
    keutamaan: 'Barangsiapa membacanya 100× di pagi dan petang, tidak ada yang datang pada hari Kiamat dengan yang lebih utama darinya kecuali orang yang membaca sepertinya atau lebih banyak. (HR. Muslim)',
    ulangan: 100,
    sumber: 'HR. Muslim',
    waktu: ['keduanya'],
  },
  {
    id: 'pagi-allahumma-inni-asaluka',
    urutan: 8,
    judul: 'Doa Memohon Kebaikan',
    arab: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي',
    latin: "Allaahumma innii as-alukal-'aafiyata fid-dunyaa wal-aakhirah, Allaahumma innii as-alukal-'afwa wal-'aafiyata fii diinii wa dunyaaya wa ahlii wa maalii",
    terjemahan: 'Ya Allah, sesungguhnya aku memohon kepada-Mu keselamatan di dunia dan akhirat. Ya Allah, aku memohon kepada-Mu ampunan dan keselamatan dalam agamaku, duniaku, keluargaku, dan hartaku.',
    keutamaan: 'Tidak ada sesuatu yang lebih utama yang dimohon seseorang kepada Allah setelah keyakinan selain afiat. (HR. At-Tirmidzi)',
    ulangan: 1,
    sumber: 'HR. Abu Dawud, Ibn Majah',
    waktu: ['keduanya'],
  },
  {
    id: 'pagi-allahumma-aafinii',
    urutan: 9,
    judul: 'Doa Perlindungan dari Kejahatan',
    arab: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ',
    latin: "Allaahumma 'aafinii fii badanii, allaahumma 'aafinii fii sam'ii, allaahumma 'aafinii fii basharii, laa ilaaha illaa anta",
    terjemahan: 'Ya Allah, selamatkan tubuhku (dari penyakit). Ya Allah, selamatkan pendengaranku. Ya Allah, selamatkan penglihatanku. Tiada tuhan selain Engkau.',
    ulangan: 3,
    sumber: 'HR. Abu Dawud',
    waktu: ['keduanya'],
  },
  {
    id: 'pagi-bismillah-tawakkalt',
    urutan: 10,
    judul: 'Tawakkal Kepada Allah',
    arab: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    latin: "Bismillaahilladzii laa yadhurru ma'asmihi syai-un fil-ardhi walaa fis-samaa-i wa huwas-samii'ul-'aliim",
    terjemahan: 'Dengan nama Allah yang tidak ada sesuatu pun yang membahayakan bersama nama-Nya, baik di bumi maupun di langit. Dan Dia Maha Mendengar lagi Maha Mengetahui.',
    keutamaan: 'Barangsiapa membacanya 3× di pagi dan petang, tidak ada sesuatu pun yang membahayakannya. (HR. Abu Dawud & At-Tirmidzi)',
    ulangan: 3,
    sumber: 'HR. Abu Dawud, At-Tirmidzi',
    waktu: ['keduanya'],
  },
  {
    id: 'pagi-radhitu-billah',
    urutan: 11,
    judul: 'Ridha dengan Allah, Islam, dan Muhammad',
    arab: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
    latin: "Radhiitu billaahi rabbaa, wa bil-islaami diinaa, wa bi-muhammadin shallallaahu 'alayhi wa sallama nabiyyaa",
    terjemahan: 'Aku ridha Allah sebagai Tuhan, Islam sebagai agama, dan Muhammad ﷺ sebagai Nabi.',
    keutamaan: 'Barangsiapa membacanya 3× di pagi dan petang, Allah berkewajiban meridhainya pada hari Kiamat. (HR. Ahmad & At-Tirmidzi)',
    ulangan: 3,
    sumber: 'HR. Ahmad, At-Tirmidzi',
    waktu: ['keduanya'],
  },
  {
    id: 'pagi-yaa-hayyu-yaa-qayyum',
    urutan: 12,
    judul: 'Ya Hayyu Ya Qayyum',
    arab: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ',
    latin: "Yaa hayyu yaa qayyuumu birahmatika astaghiitsu, ashlih lii sya-nii kullahu wa laa takilnii ilaa nafsii tharfata 'ayn",
    terjemahan: 'Wahai Yang Maha Hidup, wahai Yang Maha Berdiri Sendiri, dengan rahmat-Mu aku memohon pertolongan. Perbaikilah semua urusanku dan jangan Engkau serahkan aku kepada diriku sendiri walau sekejap mata.',
    ulangan: 1,
    sumber: 'HR. Al-Hakim',
    waktu: ['keduanya'],
  },
  {
    id: 'pagi-sholawat',
    urutan: 13,
    judul: 'Sholawat atas Nabi ﷺ',
    arab: 'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ',
    latin: "Allaahumma shalli wa sallim wa baarik 'alaa sayyidinaa muhammadin wa 'alaa aalihi wa shahbih wa sallim",
    terjemahan: 'Ya Allah, limpahkanlah sholawat, salam, dan berkah kepada junjungan kami Muhammad, keluarga, dan para sahabatnya.',
    keutamaan: 'Barangsiapa bersholawat kepadaku sekali, Allah bersholawat kepadanya sepuluh kali. (HR. Muslim)',
    ulangan: 10,
    sumber: 'HR. Muslim',
    waktu: ['keduanya'],
  },
  {
    id: 'pagi-doa-keselamatan-dunia-akhirat',
    urutan: 14,
    judul: 'Doa Keselamatan Dunia & Akhirat',
    arab: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    latin: "Rabbanaa aatinaa fid-dunyaa hasanatan wa fil-aakhirati hasanatan wa qinaa 'adzaaban-naar",
    terjemahan: 'Wahai Tuhan kami, berikanlah kami kebaikan di dunia dan kebaikan di akhirat, serta peliharalah kami dari siksa neraka.',
    keutamaan: 'Doa yang paling banyak dibaca Rasulullah ﷺ. (HR. Bukhari & Muslim)',
    ulangan: 3,
    sumber: 'QS. Al-Baqarah: 201 | HR. Bukhari & Muslim',
    waktu: ['keduanya'],
  },
  {
    id: 'pagi-subhanallah-33',
    urutan: 15,
    judul: 'Tasbih, Tahmid, Takbir',
    arab: 'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَاللَّهُ أَكْبَرُ',
    latin: 'Subhanallaah, walhamdulillaah, wallaahu akbar',
    terjemahan: 'Maha Suci Allah, segala puji bagi Allah, dan Allah Maha Besar.',
    keutamaan: 'Aku lebih cinta membaca Subhanallah, Alhamdulillah, La ilaha illallah, Allahu Akbar daripada segala sesuatu yang matahari terbit atasnya. (HR. Muslim)',
    ulangan: 33,
    sumber: 'HR. Muslim, HR. Bukhari',
    waktu: ['keduanya'],
  },
]

// =============================================
// ZIKIR PETANG — Al-Awrad Al-Banna (setelah Asar)
// =============================================
export const ZIKIR_PETANG: ZikirItem[] = [
  // Ambil yang waktu: keduanya dari pagi, tambah yang khusus petang
  ...ZIKIR_PAGI.filter(z => z.waktu.includes('keduanya')).map(z => ({
    ...z,
    id: z.id.replace('pagi-', 'petang-'),
    waktu: ['petang'] as ('pagi' | 'petang' | 'keduanya')[],
  })),
  {
    id: 'petang-amsayna',
    urutan: 2,
    judul: 'Doa Memasuki Petang',
    arab: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    latin: "Amsaynaa wa-amsal-mulku lillaah, walhamdulillaah, laa ilaaha illallaahu wahdahu laa syariika lah, lahul-mulku walahul-hamdu wa huwa 'alaa kulli syai-in qadiir",
    terjemahan: 'Kami memasuki petang hari dan alam semesta ini kepunyaan Allah. Segala puji bagi Allah. Tiada tuhan selain Allah semata, tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan segala puji, dan Dia Maha Kuasa atas segala sesuatu.',
    ulangan: 1,
    sumber: 'HR. Muslim',
    waktu: ['petang'],
  },
  {
    id: 'petang-audzubika-min-syarri',
    urutan: 16,
    judul: "Doa Perlindungan di Petang Hari",
    arab: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    latin: "A'uudzu bikalimaatillaahit-taammaati min syarri maa khalaq",
    terjemahan: 'Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari kejahatan apa yang Dia ciptakan.',
    keutamaan: 'Barangsiapa mengucapkannya 3× saat petang, tidak ada sesuatu yang membahayakannya di malam itu. (HR. Muslim & At-Tirmidzi)',
    ulangan: 3,
    sumber: 'HR. Muslim, At-Tirmidzi',
    waktu: ['petang'],
  },
]

// Fungsi helper
export function getZikirByWaktu(waktu: 'pagi' | 'petang'): ZikirItem[] {
  const base = waktu === 'pagi' ? ZIKIR_PAGI : [
    ...ZIKIR_PAGI.filter(z => z.waktu.includes('keduanya')),
    {
      id: 'petang-amsayna', urutan: 2, judul: 'Doa Memasuki Petang',
      arab: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
      latin: "Amsaynaa wa-amsal-mulku lillaah, walhamdulillaah, laa ilaaha illallaahu wahdahu laa syariika lah, lahul-mulku walahul-hamdu wa huwa 'alaa kulli syai-in qadiir",
      terjemahan: 'Kami memasuki petang hari dan alam semesta ini kepunyaan Allah. Segala puji bagi Allah. Tiada tuhan selain Allah semata, tiada sekutu bagi-Nya.',
      ulangan: 1, sumber: 'HR. Muslim', waktu: ['petang'] as ('pagi' | 'petang' | 'keduanya')[],
    },
    {
      id: 'petang-audzubika', urutan: 16, judul: 'Doa Perlindungan di Petang',
      arab: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
      latin: "A'uudzu bikalimaatillaahit-taammaati min syarri maa khalaq",
      terjemahan: 'Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari kejahatan apa yang Dia ciptakan.',
      keutamaan: 'Barangsiapa mengucapkannya 3× saat petang, tidak ada sesuatu yang membahayakannya di malam itu.',
      ulangan: 3, sumber: 'HR. Muslim, At-Tirmidzi', waktu: ['petang'] as ('pagi' | 'petang' | 'keduanya')[],
    },
  ]
  return base.sort((a, b) => a.urutan - b.urutan)
}

export const TOTAL_ZIKIR_PAGI = ZIKIR_PAGI.reduce((s, z) => s + z.ulangan, 0)
export const TOTAL_ZIKIR_PETANG = getZikirByWaktu('petang').reduce((s, z) => s + z.ulangan, 0)
