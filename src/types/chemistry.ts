export type CognitiveLevel = 'nhan_biet' | 'thong_hieu' | 'van_dung';

export interface BlankItem {
  id: string;
  correctAnswers: string[]; // List of acceptable answers (case-insensitive, normalized)
  acceptableVariants?: string[]; // Alternate spellings or representations
  hint?: string;
  explanation: string;
  lengthHint?: number; // suggested width
}

export interface QuestionPart {
  type: 'text' | 'blank' | 'formula' | 'subscript';
  content?: string;
  blankId?: string;
}

export interface ClozeExercise {
  id: string;
  title: string;
  subtitle: string;
  level: CognitiveLevel;
  levelLabel: string;
  description: string;
  targetAchievement: string; // Yêu cầu cần đạt
  parts: QuestionPart[];
  blanks: Record<string, BlankItem>;
  wordBank: string[]; // Options to pick from
  experimentContext?: {
    type: 'no2_n2o4' | 'sodium_acetate';
    equation: string;
    thermalEffect: string;
  };
}

export interface StudentProfile {
  fullName: string;
  classGroup: string;
  schoolName: string;
  studentId: string;
  mode: 'practice' | 'exam'; // Exam: time limited, no hints; Practice: hints available
}

export interface BlankAnswerResult {
  blankId: string;
  userAnswer: string;
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
}

export interface ExerciseResult {
  exerciseId: string;
  title: string;
  level: CognitiveLevel;
  totalBlanks: number;
  correctBlanks: number;
  blankResults: BlankAnswerResult[];
}

export interface TestSubmission {
  id: string;
  student: StudentProfile;
  submittedAt: string;
  durationSeconds: number;
  totalBlanks: number;
  totalCorrect: number;
  scoreScale10: number; // e.g. 8.5
  scoreScale100: number; // e.g. 85
  levelStats: {
    nhan_biet: { total: number; correct: number; percent: number };
    thong_hieu: { total: number; correct: number; percent: number };
    van_dung: { total: number; correct: number; percent: number };
  };
  exerciseResults: ExerciseResult[];
  teacherFeedback: string;
  rankBadge: 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Trung bình' | 'Cần cố gắng';
}
