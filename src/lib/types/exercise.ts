export interface Question {
  id: number;
  text: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
}

export interface LessonData {
  id: number;
  judul_materi: string;
  tipe_konten: string;
  url_konten: string;
  soal_evaluasi?: Question[];
}

export interface ModuleData {
  id: number;
  nama_modul: string;
  lessons: LessonData[];
}

export interface LevelData {
  id: number;
  nama_level: string;
  modules: ModuleData[];
}