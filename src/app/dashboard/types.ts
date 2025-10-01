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
};