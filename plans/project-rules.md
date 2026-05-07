# Project Rules & Standards

## 1. Directory & File Naming
- **Folders**: Wajib menggunakan **kebab-case** (contoh: `landing-form`, `reading-task`).
- **Entry Points**: Setiap folder komponen/fitur wajib memiliki file **`index.tsx`**.
- **File Size**: Maksimal **800 baris** per file. Jika lebih, wajib di-breakdown menjadi sub-komponen.

## 2. Component Architecture
- **Base Components**: Wajib menggunakan/duplikasi dari `@template-untitled-ui`. Jangan membuat komponen UI dasar dari nol jika sudah ada di template.
- **Features**: Logika spesifik halaman diletakkan di `@/features/[feature-name]`.
- **Reusability**: Cek ketersediaan komponen sebelum membuat baru. Gunakan konsep "Don't Repeat Yourself" (DRY).

## 3. AI & Data Handling
- **AI Response Format**: Wajib mengikuti format CSV Custom: `description |-> options |-> answer |-> skill |-> type <_>`.
- **Chunking Protocol**: Request soal wajib dilakukan per satu unit (index per index) untuk menjaga stabilitas token dan responsivitas UI (progress bar).
- **Parsing**: Semua parsing AI dipusatkan di `lib/ai/parser.ts` untuk memastikan konsistensi data sebelum masuk ke state.

## 4. State & Storage
- **Persistence**: Gunakan `localStorage` untuk menyimpan session aktif dan history ujian.
- **Key Naming**: Gunakan prefix `lang-test-` untuk semua key di localStorage (contoh: `lang-test-current-session`).
- **Security**: Jangan simpan API Key di localStorage. API Key hanya boleh ada di `.env` dan diakses via server-side (Next.js API Routes).

## 5. Development Workflow
- **Linting**: Wajib menjalankan `npm run lint` sebelum commit atau merge.
- **Styling**: Gunakan Tailwind CSS v4 dengan token warna yang sudah didefinisikan di `theme.css`.
- **SEO**: Setiap page (`app/[page]/page.tsx`) wajib memiliki metadata title dan description yang relevan.

## 6. Language & Localization
- **UI Language**: Default UI menggunakan bahasa Indonesia (sesuai request awal).
- **Target Language**: Mendukung semua bahasa secara dinamis melalui prompt AI.
