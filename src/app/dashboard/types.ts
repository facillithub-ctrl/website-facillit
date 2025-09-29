export type UserProfile = {
  id: string;
  fullName: string | null;
  userCategory: string | null;
  avatarUrl: string | null;
  pronoun: string | null;
  nickname: string | null;
  has_completed_onboarding: boolean | null;
  active_modules: string[] | null;
  birthDate?: string | null;   // Adicionado
  schoolName?: string | null;  // Adicionado
};