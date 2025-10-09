export type UserProfile = {
  id: string;
  fullName: string | null;
  userCategory: string | null;
  avatarUrl: string | null;
  pronoun: string | null;
  nickname: string | null;
  has_completed_onboarding: boolean | null;
  active_modules: string[] | null;
  birthDate?: string | null;
  schoolName?: string | null;
  target_exam?: string | null; // Adicionado
  verification_badge?: string | null; // 
};

// ADICIONE ESTE NOVO TIPO NO FINAL DO ARQUIVO
export type Update = {
    id: string;
    created_at: string;
    title: string;
    content: string;
    module_slug: string | null;
    version: string | null;
};