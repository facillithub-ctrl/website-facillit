// Define a estrutura de um perfil de utilizador, como vem da base de dados.
export type UserProfile = {
  id: string;
  fullName: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  userCategory: string | null;
  pronoun: string | null;
  birthDate: string | null;
  schoolName: string | null;
  organization_id: string | null;
  target_exam: string | null;
  active_modules: string[] | null;
  verification_badge: 'bronze' | 'silver' | 'gold' | null;
  role?: 'student' | 'teacher'; // Adicionado para membros da turma
};

// Define a estrutura de uma organização/escola.
export type Organization = {
    id: string;
    name: string;
    cnpj: string | null;
};

// Define a estrutura de uma turma.
export type SchoolClass = {
    id: string;
    name: string;
    organization_id: string;
};

// Define a estrutura de um tema de redação.
export type EssayPrompt = {
    id: string;
    title: string;
    description: string;
    image_url: string | null;
    difficulty: number | null;
    tags: string[] | null;
    publication_date: string | null;
};