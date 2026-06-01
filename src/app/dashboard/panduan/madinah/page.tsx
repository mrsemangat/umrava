'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ZIARAH_MADINAH } from '@/data/panduan'
import { DATA_DOA } from '@/data/doa'
import { AudioPlayer } from '@/components/audio/AudioPlayer'
import { cn } from '@/lib/utils'
import { ArrowLeft, MapPin, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'

const SPOTS = [
  {
    id: 'masjid-nabawi',
    nama: 'Masjid Nabawi',
    emoji: '🕌',
    badge: 'Wajib Dikunjungi',
    badgeColor: 'bg-[#1B6B3A] text-white',
    deskripsi: 'Masjid yang didirikan langsung oleh Rasulullah ﷺ pada tahun pertama Hijriah. Sholat di sini bernilai 1.000 kali sholat di masjid lain kecuali Masjidil Haram.',
    sejarah: 'Dibangun oleh Nabi ﷺ setelah hijrah ke Madinah tahun 622 M. Awalnya sederhana dengan dinding tanah liat dan atap pelepah kurma. Kini diperluas hingga menampung jutaan jamaah.',
    panduan: [
      'Masuk dengan kaki kanan sambil baca doa masuk masjid',
      'Sholat tahiyatul masjid 2 rakaat sebelum duduk',
      'Ziarah ke Raudhah (daftarkan diri via Nusuk)',
      'Beri salam kepada Nabi ﷺ di sisi makam',
      'Sholat fardhu berjamaah diutamakan',
    ],
    doaIds: ['masuk-masjid-nabawi', 'ziarah-makam-nabi'],
    tips: 'Datang minimal 30 menit sebelum waktu sholat untuk mendapat shaf awal. Hindari membawa barang besar ke dalam masjid.',
    waktu: 'Setiap waktu, terbaik di waktu-waktu sholat',
    jarak: '0 km (pusat Madinah)',
  },
  {
    id: 'raudhah',
    nama: 'Raudhah (Taman Surga)',
    emoji: '🌿',
    badge: 'Sangat Istimewa',
    badgeColor: 'bg-[#C9A84C] text-white',
    deskripsi: '"Antara rumahku dan mimbarku adalah taman dari taman-taman surga." (HR. Bukhari & Muslim). Area seluas ±330 m² ini berada di antara makam Nabi ﷺ dan mimbar beliau.',
    sejarah: 'Raudhah dibatasi oleh tiang-tiang putih dengan karpet hijau khas yang berbeda dari karpet masjid lainnya (merah). Di sinilah tempat paling mustajab untuk berdoa.',
    panduan: [
      'Wajib booking via aplikasi Nusuk (gratis)',
      'Datang tepat waktu sesuai slot yang diberikan',
      'Waktu di dalam sangat singkat (~15-30 menit)',
      'Siapkan doa-doa yang sudah dihafal sebelumnya',
      'Sholat 2 rakaat jika memungkinkan',
      'Tenang dan khusyuk — jangan tergesa-gesa',
    ],
    doaIds: ['raudhah'],
    tips: 'Buat akun Nusuk jauh sebelum berangkat. Slot pagi (setelah Subuh) dan Isya biasanya lebih longgar. Wanita masuk pada jam khusus yang berbeda.',
    waktu: 'Sesuai slot Nusuk (biasanya 2-3 slot per hari)',
    jarak: 'Di dalam Masjid Nabawi',
  },
  {
    id: 'makam-nabi',
    nama: 'Makam Rasulullah ﷺ',
    emoji: '💚',
    badge: 'Sangat Mulia',
    badgeColor: 'bg-green-700 text-white',
    deskripsi: 'Makam Nabi Muhammad ﷺ, Abu Bakar Ash-Shiddiq, dan Umar bin Khattab. Ditandai dengan kubah hijau ikonik di atas Masjid Nabawi.',
    sejarah: 'Nabi ﷺ dimakamkan di kamar Aisyah r.a. sesuai sabdanya: "Para nabi dimakamkan di tempat mereka meninggal." Kemudian masjid diperluas mengelilingi makam.',
    panduan: [
      'Ucapkan salam dengan sopan: "Assalamu alaika ya Rasulallah"',
      'Berdiri dengan tenang menghadap makam',
      'Berdoa untuk Nabi ﷺ, Abu Bakar, dan Umar',
      'Tidak berteriak atau menangis berlebihan',
      'Tidak menyentuh pagar pembatas',
      'Sampaikan salam dari keluarga dan orang-orang yang menitipkan',
    ],
    doaIds: ['ziarah-makam-nabi'],
    tips: 'Masuk dari pintu Baab As-Salam (sisi selatan). Antrian bisa panjang terutama setelah Subuh dan Asar.',
    waktu: 'Terbaik setelah sholat fardhu, terutama Subuh dan Asar',
    jarak: 'Di dalam Masjid Nabawi',
  },
  {
    id: 'masjid-quba',
    nama: 'Masjid Quba',
    emoji: '🕌',
    badge: 'Pahala Umroh',
    badgeColor: 'bg-blue-600 text-white',
    deskripsi: 'Masjid pertama yang dibangun dalam sejarah Islam. "Barangsiapa bersuci di rumahnya kemudian pergi ke Masjid Quba dan sholat di sana, ia mendapat pahala seperti umroh." (HR. Ibnu Majah)',
    sejarah: 'Dibangun oleh Nabi ﷺ pada hari Senin, 12 Rabiul Awwal tahun ke-1 H, saat pertama kali tiba di Madinah dalam perjalanan hijrah dari Makkah. Beliau meletakkan batu pertamanya sendiri.',
    panduan: [
      'Bersuci (wudhu) dari hotel sebelum berangkat',
      'Sholat 2 rakaat di dalam masjid',
      'Perbanyak dzikir dan doa',
      'Dianjurkan datang hari Sabtu (sunnah Nabi ﷺ)',
    ],
    doaIds: ['masuk-masjid-nabawi'],
    tips: 'Berjarak ±5 km dari Masjid Nabawi. Tersedia bus ziarah dari hotel atau bisa naik taksi/Uber. Fasadnya sangat fotogenik untuk dokumentasi.',
    waktu: 'Pagi setelah Subuh atau sore hari, dianjurkan hari Sabtu',
    jarak: '±5 km dari Masjid Nabawi',
  },
  {
    id: 'jabal-uhud',
    nama: 'Jabal Uhud',
    emoji: '⛰️',
    badge: 'Ziarah Sejarah',
    badgeColor: 'bg-gray-600 text-white',
    deskripsi: 'Bukit tempat terjadinya Perang Uhud (3 H / 625 M). Di sini terdapat makam Sayyidina Hamzah bin Abdul Muthalib (paman Nabi) dan 70 syuhada Uhud.',
    sejarah: 'Nabi ﷺ sangat mencintai Jabal Uhud: "Uhud adalah gunung yang mencintai kami dan kami mencintainya." (HR. Bukhari). Perang ini menjadi pelajaran penting tentang ketaatan.',
    panduan: [
      'Ziarah ke makam para syuhada dengan penuh hormat',
      'Ucapkan salam kepada para syuhada',
      'Doakan mereka dan renungkan pengorbanan mereka',
      'Bisa mendaki ke area pandang (tidak wajib)',
      'Jaga adab — ini area pemakaman yang mulia',
    ],
    doaIds: ['sholawat'],
    tips: 'Berjarak ±5 km dari Masjid Nabawi. Datang pagi hari sebelum cuaca sangat panas. Bawa air minum cukup.',
    waktu: 'Pagi hari (07:00-10:00) sebelum cuaca terlalu panas',
    jarak: '±5 km dari Masjid Nabawi',
  },
  {
    id: 'masjid-qiblatayn',
    nama: 'Masjid Qiblatayn',
    emoji: '🕌',
    badge: 'Sejarah Islam',
    badgeColor: 'bg-purple-600 text-white',
    deskripsi: 'Masjid dengan dua kiblat — tempat turunnya wahyu yang memerintahkan perubahan kiblat dari Masjidil Aqsa di Yerusalem ke Ka\'bah di Makkah.',
    sejarah: 'Di sinilah, di tengah sholat Dzuhur, Nabi ﷺ menerima wahyu (QS. Al-Baqarah: 144) untuk berpaling ke arah Makkah. Beliau langsung berputar bersama seluruh makmum dalam satu rakaat sholat.',
    panduan: [
      'Sholat di dalam masjid',
      'Renungkan sejarah perubahan kiblat',
      'Lihat dua mihrab yang masih dipertahankan',
    ],
    doaIds: ['masuk-masjid-nabawi'],
    tips: 'Berjarak ±4 km dari Masjid Nabawi. Biasanya dikunjungi sebagai bagian dari paket ziarah Madinah.',
    waktu: 'Siang atau sore hari',
    jarak: '±4 km dari Masjid Nabawi',
  },
  {
    id: 'kebun-kurma',
    nama: 'Kebun Kurma Madinah',
    emoji: '🌴',
    badge: 'Rekomendasi',
    badgeColor: 'bg-orange-500 text-white',
    deskripsi: 'Madinah terkenal dengan kurma berkualitas tinggi. Varietas terbaik: Ajwa (paling istimewa, disebut dalam hadits), Medjool, Safawi, Sukkari, dan Mabroom.',
    sejarah: '"Barangsiapa di pagi hari memakan tujuh butir kurma Ajwa, ia tidak akan dirugikan oleh racun maupun sihir pada hari itu." (HR. Bukhari & Muslim)',
    panduan: [
      'Minta cicip sebelum beli — penjual Madinah ramah',
      'Beli Ajwa untuk oleh-oleh premium',
      'Cek tanggal panen — kurma segar vs kering',
      'Tawar dengan sopan, biasanya harga bisa lebih rendah',
      'Beli di kebun atau pasar untuk harga lebih baik',
    ],
    doaIds: [],
    tips: 'Rekomendasi: Kebun Al-Ansar dekat Masjid Quba, atau Pasar Kurma dekat Masjid Nabawi. Ajwa grade 1 harganya SAR 50-150/kg.',
    waktu: 'Pagi atau sore hari (hindari tengah hari)',
    jarak: 'Tersebar di sekitar Madinah',
  },
]

export default function ZiarahMadinahPage() {
  const [expandedId, setExpandedId] = useState<string>('masjid-nabawi')
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set())

  const toggleVisited = (id: string) =>
    setVisitedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <Link href="/dashboard/panduan" className="inline-flex items-center gap-2 text-sm text-[#1B6B3A] hover:text-[#0D4A28] mb-6 font-semibold">
        <ArrowLeft size={16} /> Kembali ke Panduan Ibadah
      </Link>

      {/* Header */}
      <div className="bg-[#0D4A28] rounded-3xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-[#C9A84C] flex items-center justify-center text-2xl">🕌</div>
          <div>
            <h1 className="text-2xl font-black">Panduan Ziarah Madinah</h1>
            <p className="text-[rgba(251,247,240,0.7)] text-sm">Kota Rasulullah ﷺ — Al-Madinah Al-Munawwarah</p>
          </div>
        </div>
        <p className="text-[rgba(251,247,240,0.8)] text-sm leading-relaxed">
          Madinah adalah kota yang diberkahi. Setiap sudutnya menyimpan sejarah Islam yang agung.
          Ziarah ke tempat-tempat ini akan menguatkan iman dan kecintaan kepada Rasulullah ﷺ.
        </p>
        {/* Progress */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-[#C9A84C] rounded-full transition-all" style={{ width: `${Math.round((visitedIds.size / SPOTS.length) * 100)}%` }} />
          </div>
          <span className="text-sm font-bold text-[#C9A84C]">{visitedIds.size}/{SPOTS.length} dikunjungi</span>
        </div>
      </div>

      {/* Spot cards */}
      <div className="space-y-3">
        {SPOTS.map(spot => {
          const isExpanded = expandedId === spot.id
          const isVisited = visitedIds.has(spot.id)
          const doaItems = spot.doaIds.map(id => DATA_DOA.find(d => d.id === id)).filter(Boolean)

          return (
            <div key={spot.id} className={cn(
              'rounded-2xl border overflow-hidden transition-all',
              isVisited
                ? 'bg-[#E8F5ED] border-[#1B6B3A]/20'
                : isExpanded
                ? 'bg-white border-[#C9A84C] shadow-md'
                : 'bg-white border-[rgba(201,168,76,0.12)] shadow-sm'
            )}>
              {/* Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? '' : spot.id)}
                className="w-full flex items-center gap-3 p-5 text-left"
              >
                <div className="text-2xl w-10 text-center flex-shrink-0">{spot.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-[#0D4A28]">{spot.nama}</span>
                    <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', spot.badgeColor)}>
                      {spot.badge}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin size={11} /> {spot.jarak}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isVisited && <CheckCircle2 size={18} className="text-[#1B6B3A]" />}
                  {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>
              </button>

              {/* Detail */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-50 space-y-4">
                  {/* Deskripsi */}
                  <p className="text-sm text-[#374151] leading-relaxed pt-4">{spot.deskripsi}</p>

                  {/* Sejarah */}
                  <div className="bg-[#FBF7F0] rounded-xl p-4">
                    <h4 className="font-bold text-[#0D4A28] text-sm mb-1.5">📜 Sejarah Singkat</h4>
                    <p className="text-sm text-[#374151] leading-relaxed">{spot.sejarah}</p>
                  </div>

                  {/* Panduan */}
                  <div>
                    <h4 className="font-bold text-[#0D4A28] text-sm mb-2">📋 Tata Cara Ziarah</h4>
                    <ul className="space-y-2">
                      {spot.panduan.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#374151]">
                          <span className="w-5 h-5 rounded-full bg-[#1B6B3A] text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tips */}
                  <div className="bg-[#F5E6C8] rounded-xl p-3">
                    <p className="text-sm text-[#8B6914]">💡 <strong>Tips:</strong> {spot.tips}</p>
                  </div>

                  {/* Waktu */}
                  <div className="flex items-center gap-2 text-sm text-[#1B6B3A] bg-[#E8F5ED] rounded-xl px-4 py-2.5">
                    <span>⏰</span>
                    <span><strong>Waktu terbaik:</strong> {spot.waktu}</span>
                  </div>

                  {/* Doa */}
                  {doaItems.length > 0 && (
                    <div>
                      <h4 className="font-bold text-[#0D4A28] text-sm mb-3">🤲 Doa yang Dianjurkan</h4>
                      <div className="space-y-3">
                        {doaItems.map(doa => doa && (
                          <div key={doa.id} className="bg-[#FBF7F0] rounded-xl p-4">
                            <div className="font-semibold text-[#1B6B3A] text-sm mb-2">{doa.judul}</div>
                            <div
                              className="text-right mb-2 text-[#1a1a1a]"
                              style={{ fontFamily: "'Amiri', serif", fontSize: 22, direction: 'rtl', lineHeight: 2.2 }}
                            >
                              {doa.arab}
                            </div>
                            <p className="text-xs italic text-gray-400 mb-1">{doa.latin}</p>
                            <p className="text-xs text-[#374151]">
                              <span className="font-semibold text-[#1B6B3A]">Artinya: </span>{doa.terjemahan}
                            </p>
                            <div className="mt-3">
                              <AudioPlayer compact doaJudul={doa.judul} arabText={doa.arab} latinText={doa.latin} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tandai dikunjungi */}
                  <button
                    onClick={() => toggleVisited(spot.id)}
                    className={cn(
                      'w-full py-3 rounded-2xl font-bold text-sm transition-all',
                      isVisited
                        ? 'bg-[#E8F5ED] text-[#1B6B3A] border border-[#1B6B3A]/20'
                        : 'bg-[#1B6B3A] text-white hover:bg-[#0D4A28]'
                    )}
                  >
                    {isVisited ? '✅ Sudah dikunjungi — Alhamdulillah' : 'Tandai sudah dikunjungi'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-[#E8F5ED] rounded-2xl text-center">
        <p className="text-sm text-[#1B6B3A] leading-relaxed">
          🤲 <strong>Doa untuk Madinah:</strong> <em>"Allaahumma habbibnaa ilaa madiinati ka-hubbinaa makkata aw asyadda"</em>
          <br />Ya Allah, jadikanlah kami mencintai Madinah seperti kecintaan kami kepada Makkah atau lebih.
        </p>
      </div>
    </div>
  )
}
