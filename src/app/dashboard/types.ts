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
  verification_badge: string | null; // Alterado para string para aceitar 'green', 'blue', 'red', etc.
  role?: 'student' | 'teacher'; // Adicionado para membros da turma
  has_completed_onboarding?: boolean; // Adicionado para o fluxo de onboarding
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

// Define a estrutura de uma atualização da plataforma (usado no admin).
export type Update = {
  id: string;
  created_at: string;
  title: string;
  content: string;
  version: string | null;
  module_slug: string | null;
  category: 'Nova Funcionalidade' | 'Melhoria' | 'Correção' | null;
};

// Define a estrutura de um tema de redação (usado no admin e no módulo write).
export type EssayPrompt = {
    id: string;
    title: string;
    description: string | null;
    source: string | null;
    image_url: string | null;
    category: string | null;
    publication_date: string | null;
    deadline: string | null;
    cover_image_source: string | null;
    motivational_text_1: string | null;
    motivational_text_2: string | null;
    motivational_text_3_description: string | null;
    motivational_text_3_image_url: string | null;
    motivational_text_3_image_source: string | null;
    difficulty: number | null;
    tags: string[] | null;
};