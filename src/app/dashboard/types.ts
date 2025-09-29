export type UserProfile = {
  id: string;
  fullName: string | null;
  userCategory: string | null;
  avatarUrl: string | null;
  pronoun: string | null;
  nickname: string | null; // <-- ADICIONADO
  has_completed_onboarding: boolean | null;
  active_modules: string[] | null;
};