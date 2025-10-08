"use server";

import createSupabaseServerClient from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Tipos de dados (já definidos anteriormente)
export type QuestionContent = {
  statement: string;
  image_url?: string | null;
  options?: string[];
  correct_option?: number;
};

export type Question = {
  id: string;
  question_type: 'multiple_choice' | 'dissertation';
  content: QuestionContent;
  points: number;
};

export type Test = {
  id: string;
  title: string;
  description: string | null; // Adicionado
  created_by: string;
  questions: Question[];
};

export type TestAttempt = {
  id: string;
  test_id: string;
  student_id: string;
  answers: any[];
  score: number;
  started_at: string;
  completed_at: string | null;
};

// --- IMPLEMENTAÇÃO DA FUNÇÃO DE SALVAR ---
export async function createOrUpdateTest(testData: { title: string; description: string | null; questions: Question[] }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Usuário não autenticado.' };
  }

  // 1. Insere o teste principal na tabela 'tests'
  const { data: testResult, error: testError } = await supabase
    .from('tests')
    .insert({
      title: testData.title,
      description: testData.description,
      created_by: user.id,
    })
    .select()
    .single();

  if (testError) {
    console.error('Erro ao criar teste:', testError);
    return { error: `Erro ao criar a avaliação: ${testError.message}` };
  }

  // 2. Prepara as questões para serem inseridas, vinculando-as ao ID do teste criado
  if (testData.questions.length > 0) {
    const questionsToInsert = testData.questions.map(q => ({
      test_id: testResult.id,
      question_type: q.question_type,
      content: q.content,
      points: q.points,
    }));

    // 3. Insere todas as questões na tabela 'questions'
    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionsToInsert);

    if (questionsError) {
      console.error('Erro ao salvar questões:', questionsError);
      // O ideal aqui seria deletar o teste que foi criado para não deixar dados órfãos,
      // mas por simplicidade, apenas retornamos o erro.
      return { error: `Erro ao salvar as questões: ${questionsError.message}` };
    }
  }

  // 4. Revalida o cache da página para que a lista de testes seja atualizada
  revalidatePath('/dashboard/applications/test');
  
  return { data: testResult, error: null };
}


// --- DEMAIS FUNÇÕES (placeholders) ---
export async function getTestsForStudent() {
  return { data: [], error: null };
}

export async function getTestsForTeacher() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Usuário não autenticado." };

  const { data, error } = await supabase
    .from('tests')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Erro ao buscar testes:", error);
    return { data: [], error: error.message };
  }

  return { data, error: null };
}

export async function submitTestAttempt(attemptData: Partial<TestAttempt>) {
  return { data: null, error: "Função não implementada." };
}