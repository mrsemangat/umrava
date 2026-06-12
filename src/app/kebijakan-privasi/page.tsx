import Link from 'next/link'
import { LandingNav } from '@/components/landing/LandingNav'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi — Umrava',
  description: 'Kebijakan Privasi Umrava menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi pengguna.',
}

export default function KebijakanPrivasiPage() {
  return (
    <div className="min-h-screen bg-[#FBF7F0]">
      <LandingNav />

      {/* Hero */}
      <div className="bg-gradient-to-b from-[#1B6B3A] to-[#0D4A28] pt-28 pb-12 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-3xl font-black text-white mb-3">Kebijakan Privasi</h1>
          <p className="text-[#C9A84C] text-sm">Terakhir diperbarui: 3 Juni 2026</p>
          <p className="text-white/70 text-sm mt-2">
            Umrava berkomitmen melindungi privasi dan keamanan data pribadi Anda.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-[rgba(201,168,76,0.12)] p-8 md:p-12 space-y-10">

          {/* Intro */}
          <div className="bg-[#E8F5ED] rounded-2xl p-5 text-sm text-[#1B6B3A] leading-relaxed">
            Kebijakan Privasi ini menjelaskan bagaimana Umrava (<strong>umrava.com</strong>) mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda saat menggunakan layanan kami. Dengan menggunakan Umrava, Anda menyetujui praktik yang dijelaskan dalam kebijakan ini.
          </div>

          {/* 1 */}
          <section>
            <h2 className="text-xl font-black text-[#0D4A28] mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#E8F5ED] text-[#1B6B3A] flex items-center justify-center text-sm font-black">1</span>
              Data yang Kami Kumpulkan
            </h2>
            <div className="text-[#374151] text-sm leading-relaxed space-y-4">
              <div>
                <p className="font-semibold text-[#0D4A28] mb-2">1.1 Data yang Anda Berikan Langsung</p>
                <ul className="space-y-1.5 pl-4">
                  <li className="flex gap-2"><span className="text-[#1B6B3A]">•</span> <strong>Nama lengkap</strong> — digunakan untuk personalisasi pengalaman pengguna</li>
                  <li className="flex gap-2"><span className="text-[#1B6B3A]">•</span> <strong>Alamat email</strong> — untuk autentikasi, notifikasi, dan komunikasi layanan</li>
                  <li className="flex gap-2"><span className="text-[#1B6B3A]">•</span> <strong>Kata sandi</strong> — disimpan dalam bentuk terenkripsi (hashed)</li>
                  <li className="flex gap-2"><span className="text-[#1B6B3A]">•</span> <strong>Kota asal & tanggal keberangkatan</strong> — untuk personalisasi fitur perencanaan</li>
                  <li className="flex gap-2"><span className="text-[#1B6B3A]">•</span> <strong>Data pembayaran</strong> — diproses oleh gateway pembayaran pihak ketiga (Duitku); Umrava tidak menyimpan data kartu atau rekening bank Anda</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-[#0D4A28] mb-2">1.2 Data yang Dikumpulkan Otomatis</p>
                <ul className="space-y-1.5 pl-4">
                  <li className="flex gap-2"><span className="text-[#1B6B3A]">•</span> <strong>Data lokasi</strong> — hanya saat fitur Kompas Kiblat digunakan; tidak disimpan di server</li>
                  <li className="flex gap-2"><span className="text-[#1B6B3A]">•</span> <strong>Log aktivitas</strong> — halaman yang dikunjungi, fitur yang digunakan, waktu akses</li>
                  <li className="flex gap-2"><span className="text-[#1B6B3A]">•</span> <strong>Informasi perangkat</strong> — jenis browser, sistem operasi, resolusi layar</li>
                  <li className="flex gap-2"><span className="text-[#1B6B3A]">•</span> <strong>Alamat IP</strong> — untuk keamanan dan pencegahan penyalahgunaan</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-[#0D4A28] mb-2">1.3 Data Preferensi Pengguna</p>
                <ul className="space-y-1.5 pl-4">
                  <li className="flex gap-2"><span className="text-[#1B6B3A]">•</span> Doa & ayat yang difavoritkan, bookmark Al-Quran</li>
                  <li className="flex gap-2"><span className="text-[#1B6B3A]">•</span> Progress checklist persiapan dan tracker ibadah</li>
                  <li className="flex gap-2"><span className="text-[#1B6B3A]">•</span> Pengaturan tampilan (mode malam, ukuran font)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-black text-[#0D4A28] mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#E8F5ED] text-[#1B6B3A] flex items-center justify-center text-sm font-black">2</span>
              Cara Kami Menggunakan Data
            </h2>
            <div className="text-[#374151] text-sm leading-relaxed space-y-3">
              <p>Data Anda kami gunakan untuk tujuan-tujuan berikut:</p>
              <ul className="space-y-2 pl-4">
                <li className="flex gap-2"><span className="text-[#1B6B3A]">•</span> <strong>Menyediakan layanan</strong> — autentikasi, akses fitur, sinkronisasi data antar perangkat</li>
                <li className="flex gap-2"><span className="text-[#1B6B3A]">•</span> <strong>Memproses pembayaran</strong> — verifikasi dan aktivasi akses Premium</li>
                <li className="flex gap-2"><span className="text-[#1B6B3A]">•</span> <strong>Meningkatkan layanan</strong> — analisis penggunaan fitur untuk pengembangan produk</li>
                <li className="flex gap-2"><span className="text-[#1B6B3A]">•</span> <strong>Komunikasi</strong> — notifikasi layanan, pembaruan penting, respons pertanyaan</li>
                <li className="flex gap-2"><span className="text-[#1B6B3A]">•</span> <strong>Keamanan</strong> — mendeteksi dan mencegah penyalahgunaan atau akses tidak sah</li>
                <li className="flex gap-2"><span className="text-[#1B6B3A]">•</span> <strong>Kewajiban hukum</strong> — mematuhi peraturan perundang-undangan yang berlaku</li>
              </ul>
              <p className="text-[#8B6914] bg-[#F5E6C8] rounded-xl p-3">
                ℹ️ Umrava <strong>tidak</strong> menggunakan data Anda untuk iklan pihak ketiga atau menjual data Anda kepada pihak manapun.
              </p>
            </div>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-black text-[#0D4A28] mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#E8F5ED] text-[#1B6B3A] flex items-center justify-center text-sm font-black">3</span>
              Penyimpanan & Keamanan Data
            </h2>
            <div className="text-[#374151] text-sm leading-relaxed space-y-3">
              <p>Data Anda disimpan di server database Neon (PostgreSQL) yang berlokasi di region Asia Tenggara (Singapura) dengan enkripsi data saat penyimpanan dan transmisi (TLS/SSL).</p>
              <p>Langkah-langkah keamanan yang kami terapkan:</p>
              <ul className="space-y-1.5 pl-4">
                <li className="flex gap-2"><span className="text-[#1B6B3A]">•</span> Enkripsi kata sandi menggunakan algoritma bcrypt</li>
                <li className="flex gap-2"><span className="text-[#1B6B3A]">•</span> Koneksi database hanya melalui SSL</li>
                <li className="flex gap-2"><span className="text-[#1B6B3A]">•</span> Autentikasi menggunakan NextAuth.js dengan standar keamanan tinggi</li>
                <li className="flex gap-2"><span className="text-[#1B6B3A]">•</span> Akses admin terbatas dan termonitor</li>
              </ul>
              <p>Data Anda akan disimpan selama akun Anda aktif. Jika akun dihapus, data Anda akan dihapus dalam 30 hari kerja.</p>
            </div>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-black text-[#0D4A28] mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#E8F5ED] text-[#1B6B3A] flex items-center justify-center text-sm font-black">4</span>
              Berbagi Data dengan Pihak Ketiga
            </h2>
            <div className="text-[#374151] text-sm leading-relaxed space-y-3">
              <p>Kami dapat berbagi data dengan pihak ketiga terpercaya hanya untuk keperluan berikut:</p>
              <div className="space-y-3">
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="font-semibold text-[#0D4A28] text-xs mb-2">🏦 Duitku (Gateway Pembayaran)</p>
                  <p className="text-xs text-gray-500">Memproses transaksi pembayaran. Data yang dibagikan: email, nama, jumlah transaksi. Duitku memiliki kebijakan privasi tersendiri.</p>
                </div>
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="font-semibold text-[#0D4A28] text-xs mb-2">🗄️ Neon (Database)</p>
                  <p className="text-xs text-gray-500">Penyimpanan data pengguna menggunakan PostgreSQL terkelola. Neon tunduk pada regulasi perlindungan data internasional (GDPR compliant).</p>
                </div>
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="font-semibold text-[#0D4A28] text-xs mb-2">☁️ Vercel (Hosting)</p>
                  <p className="text-xs text-gray-500">Infrastruktur hosting aplikasi web. Vercel memiliki kebijakan privasi dan keamanan yang ketat.</p>
                </div>
              </div>
              <p>
                Kami tidak menjual, menyewakan, atau menukar data pribadi Anda dengan pihak ketiga mana pun untuk tujuan komersial.
              </p>
              <p>
                Kami dapat mengungkapkan data Anda jika diwajibkan oleh hukum, perintah pengadilan, atau otoritas pemerintah yang berwenang.
              </p>
            </div>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-black text-[#0D4A28] mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#E8F5ED] text-[#1B6B3A] flex items-center justify-center text-sm font-black">5</span>
              Hak-Hak Pengguna
            </h2>
            <div className="text-[#374151] text-sm leading-relaxed space-y-3">
              <p>Sesuai dengan Undang-Undang Nomor 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP) Indonesia, Anda memiliki hak:</p>
              <ul className="space-y-2 pl-4">
                <li className="flex gap-2"><span className="text-[#1B6B3A] font-bold">•</span> <strong>Akses</strong> — meminta salinan data pribadi Anda yang kami simpan</li>
                <li className="flex gap-2"><span className="text-[#1B6B3A] font-bold">•</span> <strong>Koreksi</strong> — meminta perbaikan data yang tidak akurat melalui halaman Pengaturan</li>
                <li className="flex gap-2"><span className="text-[#1B6B3A] font-bold">•</span> <strong>Penghapusan</strong> — meminta penghapusan akun dan data pribadi Anda</li>
                <li className="flex gap-2"><span className="text-[#1B6B3A] font-bold">•</span> <strong>Portabilitas</strong> — meminta ekspor data Anda dalam format yang dapat dibaca mesin</li>
                <li className="flex gap-2"><span className="text-[#1B6B3A] font-bold">•</span> <strong>Keberatan</strong> — menolak pemrosesan data tertentu (kecuali yang diwajibkan hukum)</li>
              </ul>
              <p>Untuk menggunakan hak-hak ini, kirim permintaan ke <a href="mailto:info@umrava.com" className="text-[#1B6B3A] underline">info@umrava.com</a>.</p>
            </div>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-black text-[#0D4A28] mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#E8F5ED] text-[#1B6B3A] flex items-center justify-center text-sm font-black">6</span>
              Cookie & Penyimpanan Lokal
            </h2>
            <div className="text-[#374151] text-sm leading-relaxed space-y-3">
              <p>Umrava menggunakan cookie dan penyimpanan lokal browser untuk:</p>
              <ul className="space-y-1.5 pl-4">
                <li className="flex gap-2"><span className="text-[#1B6B3A]">•</span> <strong>Session cookie</strong> — mempertahankan status login Anda</li>
                <li className="flex gap-2"><span className="text-[#1B6B3A]">•</span> <strong>LocalStorage</strong> — menyimpan preferensi (mode malam, bookmark Al-Quran) secara lokal di perangkat Anda</li>
                <li className="flex gap-2"><span className="text-[#1B6B3A]">•</span> <strong>Analytics</strong> — memahami cara pengguna berinteraksi dengan fitur-fitur kami</li>
              </ul>
              <p>Anda dapat menghapus cookie melalui pengaturan browser kapan saja, namun ini dapat memengaruhi fungsi layanan.</p>
            </div>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-black text-[#0D4A28] mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#E8F5ED] text-[#1B6B3A] flex items-center justify-center text-sm font-black">7</span>
              Privasi Anak-Anak
            </h2>
            <div className="text-[#374151] text-sm leading-relaxed">
              <p>
                Layanan Umrava tidak ditujukan untuk anak-anak di bawah usia 17 tahun tanpa pengawasan orang tua atau wali. Kami tidak dengan sengaja mengumpulkan data pribadi dari anak-anak. Jika Anda menemukan bahwa anak Anda telah memberikan data kepada kami, segera hubungi kami untuk penghapusan data.
              </p>
            </div>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-black text-[#0D4A28] mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#E8F5ED] text-[#1B6B3A] flex items-center justify-center text-sm font-black">8</span>
              Perubahan Kebijakan Privasi
            </h2>
            <div className="text-[#374151] text-sm leading-relaxed space-y-3">
              <p>
                Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Setiap perubahan material akan diberitahukan melalui email atau notifikasi di platform minimal 7 hari sebelum berlaku.
              </p>
              <p>
                Versi terbaru selalu tersedia di halaman ini dengan tanggal pembaruan yang tercantum di bagian atas.
              </p>
            </div>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-black text-[#0D4A28] mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#E8F5ED] text-[#1B6B3A] flex items-center justify-center text-sm font-black">9</span>
              Hubungi Kami
            </h2>
            <div className="text-[#374151] text-sm leading-relaxed">
              <p className="mb-3">Untuk pertanyaan, permintaan, atau keluhan terkait privasi data Anda:</p>
              <div className="bg-[#E8F5ED] rounded-xl p-4 space-y-1.5 text-sm">
                <p>📧 Email: <a href="mailto:info@umrava.com" className="text-[#1B6B3A] font-medium">info@umrava.com</a></p>
                <p>📱 Telepon / WA: <a href="https://wa.me/6281313585848" className="text-[#1B6B3A] font-medium">081313585848</a></p>
                <p>📍 Alamat: Perumahan Pilar Biru Blok Pilar Utara, Bandung</p>
                <p>🌐 Website: <a href="https://umrava.com" className="text-[#1B6B3A] font-medium">umrava.com</a></p>
                <p>👤 Pengelola: Jajang Taufik Hidayat</p>
                <p>⏰ Respons dalam 1×24 jam kerja</p>
              </div>
            </div>
          </section>

        </div>

        {/* Footer links */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-[#6b7280]">
          <Link href="/syarat-ketentuan" className="hover:text-[#1B6B3A] transition-colors">Syarat & Ketentuan</Link>
          <span className="text-gray-200">·</span>
          <Link href="/kebijakan-refund" className="hover:text-[#1B6B3A] transition-colors">Kebijakan Refund</Link>
          <span className="text-gray-200">·</span>
          <Link href="/" className="hover:text-[#1B6B3A] transition-colors">Kembali ke Beranda</Link>
        </div>
      </div>
    </div>
  )
}
