"use server";

import createSupabaseServerClient from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Tipos de dados...
export type QuestionContent = {
  statement: string;
  image_url?: string | null;
  options?: string[];
  correct_option?: number;
};

export type Question = {
  id: string; // Vem do DB
  test_id: string; // Vem do DB
  question_type: 'multiple_choice' | 'dissertation';
  content: QuestionContent;
  points: number;
};

// Este tipo agora representa um teste COM suas questões
export type TestWithQuestions = {
  id: string;
  title: string;
  description: string | null;
  created_by: string;
  created_at: string;
  questions: Question[]; // Array de questões
};

// Este tipo representa um teste simples, para a lista
export type Test = Omit<TestWithQuestions, 'questions'>;


export type TestAttempt = {
  id: string;
  test_id: string;
  student_id: string;
  answers: any[];
  score: number;
  started_at: string;
  completed_at: string | null;
};


export async function createOrUpdateTest(testData: { title: string; description: string | null; questions: Omit<Question, 'id' | 'test_id'>[], is_public: boolean }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Usuário não autenticado.' };
  }

  const { data: testResult, error: testError } = await supabase
    .from('tests')
    .insert({
      title: testData.title,
      description: testData.description,
      created_by: user.id,
      is_public: testData.is_public, // Adicionado campo para definir se o teste é público
    })
    .select()
    .single();

  if (testError) {
    console.error('Erro ao criar teste:', testError);
    return { error: `Erro ao criar a avaliação: ${testError.message}` };
  }

  if (testData.questions.length > 0) {
    const questionsToInsert = testData.questions.map(q => ({
      test_id: testResult.id,
      question_type: q.question_type,
      content: q.content,
      points: q.points,
    }));

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionsToInsert);

    if (questionsError) {
      console.error('Erro ao salvar questões:', questionsError);
      // Opcional: deletar o teste se as questões falharem
      await supabase.from('tests').delete().eq('id', testResult.id);
      return { error: `Erro ao salvar as questões: ${questionsError.message}` };
    }
  }

  revalidatePath('/dashboard/applications/test');
  
  return { data: testResult, error: null };
}

// CORRIGIDO: Busca apenas os testes, sem as questões
export async function getTestsForTeacher() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Usuário não autenticado." };

  const { data, error } = await supabase
    .from('tests')
    .select('*') 
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Erro ao buscar testes:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

// NOVO E CORRIGIDO: Busca um único teste com todas as suas questões
export async function getTestWithQuestions(testId: string): Promise<{ data: TestWithQuestions | null, error: string | null }> {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Usuário não autenticado." };

    const { data, error } = await supabase
        .from('tests')
        .select('*, questions(*)')
        .eq('id', testId)
        .single();

    if (error) {
        console.error("Erro ao buscar detalhes do teste:", error);
        return { data: null, error: error.message };
    }

    return { data, error: null };
}

// CORRIGIDO: Agora busca os testes públicos para os alunos
export async function getTestsForStudent() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Usuário não autenticado." };

  // Busca todos os testes que estão marcados como públicos e inclui o nome do professor
  const { data, error } = await supabase
    .from('tests')
    .select('id, title, description, created_at, profiles (full_name)')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Erro ao buscar testes para aluno:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}


export async function submitTestAttempt(attemptData: Partial<TestAttempt>) {
  return { data: null, error: "Função não implementada." };
}