import { unit, question } from './deep-course.js';
export const concept=(title,summary,a,b,example,task,misconception,text,options,answer,feedback)=>({title,summary,a,b,example,task,misconception,question:text,options,answer,feedback});

// One pedagogical structure; all explanations, cases and experiments remain topic-specific.
export function buildPhaseECourse(config) {
  const check=(text,options,answer,feedback)=>[question(text,options,answer,feedback)];
  const sections=(a,b)=>[[a[0],[a[1]]],[b[0],[b[1]]]];
  const chapters=[unit('orientasi','Orientasi, Tujuan, dan Asesmen Awal',config.goal,
    sections(['Mulai dari persoalan nyata',config.context],['Rencana dan bukti belajar',`Tuliskan pengetahuan awal, dugaan penyebab masalah, serta informasi yang belum tersedia. Bedakan fakta pengamatan, asumsi, dan pendapat. Bekerja berpasangan: satu siswa menyusun keputusan, satu siswa memeriksa bukti dan mengajukan penjelasan alternatif. Tukar peran pada percobaan berikutnya. Produk akhir modul adalah ${config.product}. Simpan versi awal agar perubahan penalaran dapat dibandingkan dengan hasil akhir.`]),
    config.orientationExample,`Baca situasi awal, tulis tiga pertanyaan klarifikasi, dan tentukan satu tujuan pribadi yang dapat diperiksa melalui hasil kerja. Jelaskan bukti apa yang akan membuat Anda mengubah dugaan awal.`,
    'Mengetahui istilah belum membuktikan kemampuan menerapkannya. Kemukakan alasan, bukti, batas kewenangan, dan kondisi yang dapat mengubah keputusan.',
    check('Langkah pertama ketika informasi kasus belum lengkap adalah ...',['Mencatat fakta, asumsi, dan pertanyaan klarifikasi','Menetapkan jawaban tanpa data','Menyalin keputusan kelompok lain'],0,'Klarifikasi membuat keputusan dapat ditelusuri dan mencegah asumsi diperlakukan sebagai fakta.'))];
  config.concepts.forEach((c,index)=>chapters.push(unit(`konsep-${index+1}`,c.title,c.summary,sections(c.a,c.b),c.example,c.task,c.misconception,check(c.question,c.options,c.answer,c.feedback))));
  chapters.push(unit('kasus','Studi Kasus dan Proyek Terapan',`Menyusun ${config.product} dengan alasan dan bukti yang dapat ditinjau.`,
    sections(['Situasi, kendala, dan keluaran',config.project],['Menilai proses dan hasil','Gunakan empat dimensi rubrik: ketepatan konsep; keterlacakan data dan perhitungan; kelayakan keputusan beserta keselamatan/etika; komunikasi dan perbaikan. Tiap dimensi diberi 0 bila belum ada bukti, 1 bila berupa klaim umum atau masih ada kesalahan mendasar, 2 bila benar dan didukung bukti tetapi batasnya belum jelas, dan 3 bila benar, bukti dapat diulang, alternatif dibandingkan, serta batas dan tindak lanjut dinyatakan. Maksimum 12. Umpan balik harus menyebut lokasi bukti dan satu perbaikan yang dapat dikerjakan. Rubrik diterapkan guru/teman, bukan dinilai otomatis dari panjang tulisan.']),
    config.projectExample,'Kerjakan versi pertama secara mandiri, lalu tukarkan dengan kelompok lain. Minta peninjau menguji satu asumsi yang paling memengaruhi keputusan. Revisi produk dengan catatan perubahan, alasan revisi, dan bukti yang dipakai. Catat kontribusi setiap anggota.',
    'Produk yang tampak rapi belum tentu benar. Rancangan harus dapat ditelusuri dari kebutuhan dan data hingga kriteria penerimaan.',
    check(config.caseQuestion,config.caseOptions,config.caseAnswer,config.caseFeedback)));
  chapters.push(unit('laboratorium','Laboratorium: Prediksi, Eksperimen, dan Bukti',config.labGoal,
    sections(['Prosedur eksperimen sesuai topik',config.lab],['Membaca hasil dan batas model',config.boundary+' Catat input, satuan, hasil, serta variabel yang sengaja dipertahankan. Ulangi titik awal untuk memeriksa konsistensi. Simpan minimal tiga percobaan dan jelaskan hubungan sebab akibat yang diwakili model. Kecocokan angka model dengan dugaan tidak membuktikan semua kondisi lapangan telah terwakili. Gunakan jurnal pada tahap refleksi untuk menuliskan data tambahan yang dibutuhkan sebelum keputusan nyata.']),
    config.labExample,'Gunakan aktivitas yang tersedia pada tahap laboratorium ini. Jalankan kondisi dasar dan dua variasi sesuai prosedur topik. Catat percobaan, lalu isi prediksi, bukti, penalaran, dan transfer pada tahap refleksi. Bandingkan hasil dengan pasangan tanpa menyamakan catatan secara paksa.',
    'Simulasi menguji konsekuensi asumsi, bukan mengukur kondisi perangkat atau layanan nyata.',
    check(config.labQuestion,config.labOptions,config.labAnswer,config.labFeedback)));
  chapters.push(unit('game','Game Misi Terapan','Mengelola objek dan sumber daya sesuai karakter materi untuk menyelesaikan tiga level.',
    sections(['Misi dan kendali',config.game+' Baca tujuan, keadaan awal dan kendali pada papan permainan. Pilih objek atau gunakan tombol yang dijelaskan. Gunakan Tab/Enter bila tidak memakai seret.'],['Strategi dan bukti','Rencanakan tindakan menurut syarat topik, periksa akibat perubahan pada papan dan tekan Uji misi. Jika belum berhasil, baca umpan balik dan perbaiki; ulangi level jika batas tindakan habis. Selesaikan tiga level untuk memperoleh nilai. Game memodelkan sebagian keputusan, bukan seluruh implementasi nyata.']),
    config.projectExample,'Selesaikan tiga level, lalu jelaskan satu keputusan, kegagalan, perbaikan dan batas model yang berkaitan dengan materi.',
    'Keberhasilan game tidak otomatis membuktikan keterampilan pada perangkat nyata.',[]));
  chapters.push(unit('refleksi','Refleksi, Umpan Balik, dan Transfer','Menilai perubahan pemahaman melalui bukti serta penerapan pada konteks baru.',
    sections(['Tinjau pemahaman dan keputusan',config.reflection],['Umpan balik dan revisi','Bandingkan prediksi awal dengan hasil tiga percobaan. Minta teman memeriksa hubungan antara data dan kesimpulan, lalu revisi alasan yang belum cukup didukung. Simpan catatan dan versi produk agar perubahan dapat ditelusuri. Catatan browser tidak otomatis berpindah perangkat.']),
    config.transfer,'Tulis: dahulu saya menduga …; bukti yang saya peroleh …; sekarang saya menjelaskan …; batas kesimpulan saya …; pada situasi baru saya akan menguji …. Minta teman menunjukkan satu kalimat yang masih berupa klaim tanpa bukti.',
    'Refleksi bukan sekadar menyatakan senang atau sulit. Hubungkan perubahan pemahaman dengan bukti dan rencana tindakan.',
    check('Refleksi yang paling kuat memuat ...',['Hanya skor permainan','Prediksi, bukti, alasan perubahan, batas, dan rencana uji berikutnya','Daftar istilah tanpa hubungan'],1,'Refleksi mendalam menilai proses berpikir menggunakan bukti serta menetapkan transfer yang dapat diuji.')));
  chapters.push(unit('evaluasi','Rangkuman dan Evaluasi Akhir','Memadukan konsep, bukti eksperimen, dan keputusan pada kasus baru.',
    sections(['Hubungkan gagasan utama',config.synthesis],['Bukti ketuntasan','Kerjakan evaluasi konsep dengan ambang ketuntasan 80%. Baca umpan balik dan kembali ke bagian yang belum dipahami bila perlu. Kelulusan evaluasi otomatis belum menggantikan penilaian proyek dan keterampilan oleh guru. Serahkan produk, rekaman tiga percobaan, hasil tinjauan teman, revisi, serta jurnal refleksi. Jelaskan satu keputusan tanpa membaca teks dan tanggapi perubahan kondisi yang diberikan guru.']),
    config.projectExample,'Buat peta hubungan enam konsep utama. Pilih satu keputusan pada proyek dan jelaskan bagaimana keputusan berubah bila satu asumsi penting dibalik. Gunakan data baru dan nyatakan apa yang tetap belum dapat disimpulkan.',
    'Menghafal jawaban evaluasi tidak cukup untuk memindahkan pengetahuan ke situasi baru.',[]));
  chapters.find(c=>c.id==='laboratorium').sections.push(['Laporan kegiatan satu halaman',[
    'Setelah kegiatan, catat tujuan; alat/bahan atau model yang digunakan; langkah penting; input dan satuan; hasil asli; kesimpulan; satu perbaikan. Bedakan praktik fisik, simulasi dan data contoh. Gunakan format singkat yang sama untuk percobaan berikutnya, tanpa menyalin hasil teman. Jangan sertakan kata sandi atau data pribadi.',
    'Contoh susunan: tujuan → kondisi awal → tindakan → bukti hasil → penjelasan → tindak lanjut. Jika uji belum dapat dilakukan, tulis belum diuji beserta sebabnya. Laporan dinilai dari ketepatan dan keterlacakan bukti, bukan panjang tulisan.'
  ]]);
  return {moduleId:config.moduleId,title:config.title,objectives:config.objectives,sources:config.sources,chapters};
}
