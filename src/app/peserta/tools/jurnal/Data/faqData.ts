export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_DATA: FAQItem[] = [
  {
    question: "Bagaimana cara memulai menulis buku bagi pemula?",
    answer: "Memulai menulis buku membutuhkan perencanaan yang matang. Langkah pertama yang paling krusial adalah membuat **Outline** atau kerangka bab secara mendetail. Outline berfungsi sebagai peta agar alur tulisan tetap jelas dan tidak melebar. Selanjutnya, fokuslah untuk menyelesaikan **Draf Pertama** tanpa terlalu memikirkan revisi atau tata bahasa terlebih dahulu (prinsip *write now, edit later*). Untuk menjaga momentum, tentukan target jumlah kata harian yang realistis, misalnya 500 kata per hari, agar kamu tetap konsisten hingga naskah selesai."
  },
  {
    question: "Dimana tempat mencari referensi jurnal yang kredibel?",
    answer: "Untuk memastikan kualitas riset, kamu harus menggunakan portal resmi yang terindeks secara internasional maupun nasional. Beberapa pilihannya adalah:\n\n* **SINTA (Science and Technology Index):** Untuk mencari jurnal nasional Indonesia yang telah terakreditasi oleh Kemdikbudristek.\n* **Scopus atau Web of Science:** Database global untuk jurnal internasional bereputasi tinggi dengan sistem *peer-review* yang ketat.\n* **Google Scholar:** Mesin pencari akademik yang luas, namun pastikan untuk memeriksa kembali reputasi penerbitnya.\n* **DOAJ (Directory of Open Access Journals):** Tempat mencari jurnal akses terbuka yang berkualitas dan gratis secara legal."
  },
  {
    question: "Apa perbedaan antara Sitasi dan Daftar Pustaka?",
    answer: "Keduanya adalah elemen penting untuk menghindari plagiarisme, namun memiliki penempatan yang berbeda. **Sitasi** (atau *in-text citation*) adalah rujukan singkat yang diletakkan langsung di dalam paragraf tepat setelah pernyataan yang diambil dari sumber lain (misal: *LITERA, 2024*). Fungsinya untuk memberi kredit instan kepada penulis asli. Sementara itu, **Daftar Pustaka** adalah daftar rincian lengkap dari seluruh sumber yang disitasi, yang disusun secara alfabetis di akhir dokumen. Daftar ini mencakup nama penulis, tahun, judul karya, penerbit, atau URL agar pembaca dapat melacak sumber asli secara utuh."
  },
  {
    question: "Bagaimana cara mendapatkan ISBN untuk buku saya?",
    answer: "ISBN (International Standard Book Number) di Indonesia dikelola secara eksklusif oleh **Perpustakaan Nasional RI (Perpusnas)**. Proses pengajuannya biasanya dilakukan melalui lembaga penerbit yang sudah terdaftar sebagai anggota resmi Perpusnas. Jika kamu menempuh jalur **self-publishing**, kamu bisa bekerja sama dengan jasa penerbitan indie yang menyediakan layanan pengurusan ISBN. Kamu perlu menyiapkan naskah yang sudah rapi (lengkap dengan halaman judul dan hak cipta) serta desain cover. Ingat, saat ini Perpusnas sangat selektif dan memberikan kuota ISBN berdasarkan kualitas dan profil penerbit."
  },
  {
    question: "Apa aplikasi terbaik untuk mengelola referensi?",
    answer: "Menggunakan *Reference Manager* sangat membantu mengotomatisasi sitasi dan daftar pustaka. Berikut rekomendasinya:\n\n1.  **Mendeley:** Sangat populer karena kemampuannya mengelola file PDF, anotasi, dan sinkronisasi otomatis dengan Microsoft Word. Cocok untuk kolaborasi riset.\n2.  **Zotero:** Aplikasi *open-source* yang sangat kuat dalam mengambil metadata jurnal langsung dari browser hanya dengan satu klik. Sangat efisien untuk pengumpulan referensi cepat.\n3.  **EndNote:** Software berbayar yang menawarkan fitur lebih kompleks dan database yang lebih besar, biasanya digunakan oleh peneliti profesional atau institusi besar."
  },
  {
    question: "Bagaimana cara mencari 'Research Gap' dalam riset?",
    answer: "Menemukan *Research Gap* (celah penelitian) adalah kunci orisinalitas riset kamu. Cara paling efektif adalah dengan membaca jurnal-jurnal terbaru (maksimal 3-5 tahun terakhir) pada bidang yang sama. Fokuslah pada bagian **'Limitations'** (keterbatasan penelitian) atau **'Suggestions for future research'** (saran penelitian mendatang). Di bagian tersebut, penulis biasanya mengungkapkan masalah yang belum terpecahkan, data yang kurang lengkap, atau metodologi yang perlu dikembangkan lebih lanjut. Kamu bisa menjadikan temuan tersebut sebagai landasan untuk membangun kebaruan (*novelty*) pada riset kamu."
  },
  {
    question: "Apa saja kriteria judul buku yang menarik?",
    answer: "Judul buku adalah 'wajah' pertama yang dilihat calon pembaca. Kriteria utamanya harus **Singkat, Padat, dan Menggambarkan isi** buku secara akurat. Hindari judul yang terlalu panjang atau ambigu. Gunakan teknik **Sub-judul** jika ingin memberikan penjelasan lebih mendalam (misal: *LITERA: Panduan Praktis Menulis Buku dalam 30 Hari*). Selain itu, pastikan judul mengandung kata kunci yang relevan agar mudah ditemukan melalui mesin pencari (SEO friendly). Judul yang kuat harus mampu memicu rasa penasaran sekaligus menjanjikan solusi bagi pembaca."
  },
  {
    question: "Bagaimana cara mengatasi writer's block?",
    answer: "Writer's block adalah hal yang wajar dialami setiap penulis. Cara terbaik untuk mengatasinya adalah dengan tidak memaksakan diri. Berhentilah sejenak dan lakukan aktivitas yang merelaksasi otak seperti berjalan santai, mendengarkan musik, atau membaca karya orang lain. Jika ingin tetap mencoba menulis, gunakan teknik **Free Writing**: tulislah apa pun yang ada di pikiranmu selama 10–15 menit tanpa memedulikan logika atau tanda baca. Seringkali, ide kreatif muncul kembali setelah tekanan untuk menulis secara sempurna dihilangkan."
  },
  {
    question: "Berapa jumlah kata ideal untuk sebuah buku?",
    answer: "Jumlah kata ideal sangat bergantung pada genre buku yang kamu tulis. Untuk **Novel (Fiksi)**, standarnya berkisar antara 50.000 hingga 100.000 kata. Untuk **Buku Nonfiksi (Populer/Akademik)**, biasanya berkisar antara 30.000 hingga 70.000 kata. Sementara itu, buku anak atau antologi puisi biasanya jauh lebih sedikit. Namun, jangan hanya terpaku pada angka; fokuslah pada kepadatan pesan. Naskah yang ringkas namun berisi jauh lebih baik daripada naskah panjang yang bertele-tele (hanya berisi 'filler')."
  },
  {
    question: "Apakah saya harus menyelesaikan semua bab secara berurutan?",
    answer: "Tentu saja tidak. Menulis secara linear (dari Bab 1 ke Bab terakhir) seringkali menghambat kreativitas jika kamu terjebak di satu bagian. Banyak penulis sukses menggunakan teknik **Non-Linear Writing**, di mana mereka menulis bagian yang paling mereka kuasai atau bagian yang idenya sedang mengalir deras terlebih dahulu. Kamu bisa melompati bagian yang sulit dan kembali lagi nanti setelah mendapatkan inspirasi baru. Tugasmu saat fase revisi adalah menyatukan potongan-potongan tersebut agar menjadi satu kesatuan yang utuh dan logis."
  },
  {
    question: "Bagaimana cara menentukan target pembaca buku?",
    answer: "Menentukan target pembaca (audiens) akan memengaruhi gaya bahasa, kedalaman materi, dan strategi pemasaran buku. Lakukan analisis berdasarkan demografi seperti usia, tingkat pendidikan, dan profesi. Misalnya, jika targetmu adalah **profesional**, gunakan bahasa yang teknis dan to-the-point. Jika targetmu adalah **remaja**, gunakan gaya bahasa yang santai dan emosional. Tanyakan pada dirimu sendiri: 'Masalah apa yang sedang dihadapi pembaca saya, dan bagaimana buku ini menyelesaikannya?'. Semakin spesifik target audiensmu, semakin mudah buku tersebut diterima di pasar."
  },
  {
    question: "Apakah penting melakukan editing setelah menulis?",
    answer: "Editing adalah proses 'mengasah berlian' dari draf kasar kamu. Sangat penting karena naskah mentah pasti memiliki kesalahan ketik, logika yang melompat, atau pengulangan kata yang membosankan. Lakukan **Self-Editing** terlebih dahulu dengan mengendapkan naskah selama beberapa hari agar kamu memiliki perspektif baru saat membacanya kembali. Setelah itu, sangat disarankan untuk menggunakan jasa **Editor Profesional** atau meminta bantuan *beta reader* untuk mendapatkan masukan objektif mengenai alur dan tata bahasa sebelum naskah diterbitkan secara luas."
  },
  {
    question: "Bagaimana cara menerbitkan buku secara self-publishing?",
    answer: "Self-publishing memberi kamu kendali penuh atas karya dan royalti. Prosesnya meliputi: merapikan naskah (editing), mengurus legalitas (seperti ISBN melalui jasa penerbit indie), mendesain cover secara profesional, dan menentukan format buku (cetak atau e-book). Kamu bisa menggunakan platform seperti **Gramedia Writing Project**, **nulisbuku.com**, atau langsung memasarkannya di marketplace. Keberhasilan self-publishing sangat bergantung pada kemampuanmu dalam melakukan promosi mandiri dan membangun komunitas pembaca."
  },
  {
    question: "Apa pentingnya cover buku?",
    answer: "Ada pepatah *'Don't judge a book by its cover'*, namun kenyataannya pembaca seringkali memutuskan untuk melirik buku berdasarkan sampulnya. Cover adalah alat pemasaran visual terpenting. Desain yang menarik, pemilihan warna yang sesuai genre, dan tipografi yang jelas menunjukkan profesionalisme penulisnya. Cover yang dikerjakan asal-asalan akan menurunkan nilai jual buku meskipun isinya sangat bagus. Jika kamu serius ingin menerbitkan buku, investasikan waktu atau dana untuk membuat desain cover yang mampu mencuri perhatian di rak toko buku maupun di layar ponsel."
  },
  {
    question: "Bagaimana cara memasarkan buku agar laku?",
    answer: "Memasarkan buku di era digital membutuhkan strategi multi-platform. Pertama, bangunlah **Personal Branding** di media sosial agar orang mengenalmu sebagai ahli di bidang tersebut. Buatlah konten *teaser*, kutipan menarik dari buku, atau video pendek mengenai proses penulisan. Kedua, manfaatkan ulasan atau testimoni dari pembaca pertama atau tokoh relevan. Ketiga, buatlah program *Pre-Order* untuk menciptakan urgensi. Jangan hanya menjual produk, tetapi ceritakan 'nilai' atau pengalaman yang akan didapatkan pembaca setelah membaca buku tersebut."
  },
  {
    question: "Apakah saya perlu membuat outline sebelum menulis?",
    answer: "Sangat disarankan, terutama bagi pemula. Tanpa outline, penulis seringkali mengalami kebingungan di tengah jalan (*lost in the middle*) atau kehilangan arah fokus tulisan. Outline membantu membagi topik besar menjadi sub-topik yang lebih kecil dan teratur. Ini juga berfungsi untuk memastikan transisi antar bab terasa halus dan logis. Meskipun kamu adalah tipe penulis yang spontan, memiliki kerangka dasar akan menghemat waktu kamu saat fase editing karena struktur ceritanya sudah terjamin sejak awal."
  },
  {
    question: "Berapa lama waktu yang dibutuhkan untuk menulis buku?",
    answer: "Durasi penulisan sangat bervariasi tergantung pada riset, panjang naskah, dan waktu luang yang kamu miliki. Seorang penulis yang disiplin dengan target 1.000 kata per hari bisa menyelesaikan draf pertama buku nonfiksi dalam waktu 1-2 bulan. Namun, riset mendalam bisa memakan waktu berbulan-bulan bahkan bertahun-tahun. Kuncinya bukan pada seberapa cepat kamu menulis, melainkan pada **Konsistensi**. Dengan menyisihkan waktu minimal 1 jam setiap hari, proses penulisan buku akan terasa jauh lebih ringan dan terukur daripada menunggu waktu luang yang tidak menentu."
  }
];