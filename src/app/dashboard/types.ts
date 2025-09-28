export type UserProfile = {
  id: string;
  fullName: string | null;
  userCategory: string | null;
  avatarUrl: string | null;
  pronoun: string | null;
  has_completed_onboarding: boolean | null; // <-- ADICIONADO
  active_modules: string[] | null; // <-- ADICIONADO
};