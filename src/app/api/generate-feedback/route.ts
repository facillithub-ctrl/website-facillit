import { NextResponse } from 'next/server';

// Esta versão SIMULA a resposta da IA para não dependermos de chaves ou saldo.
// É ideal para continuar o desenvolvimento sem interrupções.

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || text.trim().length < 50) {
      return NextResponse.json({ error: 'O texto da redação é muito curto ou inválido.' }, { status: 400 });
    }

    // Objeto de resposta simulado (mock)
    const mockFeedback = {
      detailed_feedback: [
        { competency: 'Competência 1: Domínio da Escrita Formal', feedback: '[SIMULADO] O texto demonstra bom domínio da norma culta, com poucos desvios gramaticais.' },
        { competency: 'Competência 2: Compreensão do Tema e Estrutura', feedback: '[SIMULADO] O tema foi compreendido e a estrutura dissertativo-argumentativa foi respeitada.' },
        { competency: 'Competência 3: Argumentação', feedback: '[SIMULADO] A argumentação é pertinente, mas carece de repertório sociocultural mais diversificado.' },
        { competency: 'Competência 4: Coesão e Coerência', feedback: '[SIMULADO] Os conectivos são utilizados de forma adequada na maior parte do texto, garantindo a coesão.' },
        { competency: 'Competência 5: Proposta de Intervenção', feedback: '[SIMULADO] A proposta de intervenção é válida, mas poderia detalhar mais os "meios" da ação.' },
      ],
      rewrite_suggestions: [
        { original: "A sociedade de hoje em dia precisa pensar sobre o problema.", suggestion: "Na contemporaneidade, é imperativo que a sociedade reflita sobre a problemática em questão." },
        { original: "Isso é uma coisa muito ruim que acontece bastante.", suggestion: "Essa conjuntura adversa manifesta-se com frequência, denotando um desafio social persistente." },
      ],
      actionable_items: [
        "Revisar o uso de conectivos para evitar repetições.",
        "Aprimorar a tese, tornando-a mais clara na introdução.",
        "Buscar e incluir um dado estatístico ou citação para fortalecer seus argumentos.",
      ]
    };

    // Simula um pequeno atraso de rede
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json(mockFeedback);

  } catch (error) {
    console.error("Erro na rota /api/generate-feedback:", error);
    return NextResponse.json({ error: 'Ocorreu um erro no servidor simulado.' }, { status: 500 });
  }
}