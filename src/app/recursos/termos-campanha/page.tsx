import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function TermosCampanhaPage() {
    return (
        <>
            <Header />
            <main>
                <section className="bg-royal-blue text-white pt-32 pb-20 text-center">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="text-4xl md:text-5xl font-black text-white-text mb-4">Regulamento Oficial da Campanha de Incentivo "SAEB 2025"</h1>
                    </div>
                </section>

                <section className="py-12 bg-white">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <div className="prose lg:prose-xl max-w-none space-y-8 text-text-muted">

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">Preâmbulo</h2>
                                <p>
                                    O presente documento estabelece os termos e as regras para a campanha de incentivo acadêmico &quot;SAEB 2025&quot;, doravante denominada &quot;Campanha&quot;. Esta iniciativa é promovida pela plataforma FACILLIT HUB&quot;. A Campanha enquadra-se na modalidade de concurso de natureza exclusivamente cultural e educativa, fundamentado no mérito e desempenho acadêmico dos participantes, sem qualquer subordinação a sorteio ou pagamento. O objetivo principal é estimular o engajamento dos estudantes, reconhecer e premiar a excelência acadêmica e prepará-los de forma lúdica e competitiva para o Sistema de Avaliação da Educação Básica (SAEB) de 2025, em alinhamento com a missão pedagógica da empresa. A participação é voluntária e implica a aceitação integral e irrestrita de todos os termos aqui dispostos.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">Seção 1: Objeto e Vigência da Campanha</h2>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">1.1 Objetivo</h3>
                                <p>
                                    A Campanha tem como objetivo central incentivar a preparação e o aprofundamento dos estudos dos alunos para as avaliações do SAEB 2025. Por meio de simulados gamificados nas disciplinas de Português e Matemática, busca-se reforçar o conhecimento, desenvolver habilidades de gerenciamento de tempo e familiarizar os estudantes com o formato de avaliações de larga escala. A iniciativa visa valorizar o mérito, a dedicação e o esforço no desempenho escolar, transformando o processo de aprendizagem em uma experiência motivadora e recompensadora.
                                </p>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">1.2 Período de Realização</h3>
                                <p>
                                    A Campanha será realizada no período compreendido entre os dias 13 e 17 de outubro de 2025. O período de participação terá início às 00:01 do dia 13 de outubro de 2025 e se encerrará impreterivelmente às 23:59 do dia 17 de outubro de 2025, considerando o Horário Oficial de Brasília (BRT). Atividades realizadas fora deste intervalo não serão consideradas para fins de pontuação ou classificação.
                                </p>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">1.3 Abrangência</h3>
                                <p>
                                    Esta Campanha é uma iniciativa de caráter interno e exclusivo, destinada unicamente aos alunos regularmente matriculados na Instituição da Escola Estadual Professora Marilda de Oliveira durante o ano letivo de 2025 nas séries: 5° anos fundamental, 9°anos fundamental e 3° ano ensino médio. A participação não é aberta ao público externo.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">Seção 2: Condições de Elegibilidade e Inscrição</h2>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">2.1 Participantes Elegíveis</h3>
                                <p>
                                    São elegíveis para participar todos os alunos que possuam matricula ativa e regular na Escola Estadual Professora Marilda de Oliveira e que disponham de uma conta de &quot;Acesso Institucional&quot; válida na plataforma Facillit Hub, fornecida e gerenciada pela escola. A elegibilidade está condicionada à manutenção do vínculo escolar durante todo o período da Campanha.
                                </p>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">2.2 Processo de Inscrição e Acesso</h3>
                                <p>
                                    A participação na Campanha é automática para todos os alunos elegíveis e não requer um processo de inscrição separado. O ato de acessar a plataforma e iniciar a resolução do primeiro simulado designado para a Campanha formaliza a adesão do participante. Os alunos deverão acessar a plataforma Facillit Hub e criar sua conta e senha utilizando um código de acesso disponibilizado pelo Facilit Hub. Os simulados estarão disponíveis na dashboard do módulo &quot;Facillit Test&quot;.
                                </p>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">2.3 Gratuidade e Voluntariedade</h3>
                                <p>
                                    A participação na presente Campanha é inteiramente voluntária e gratuita, não estando vinculada à aquisição ou uso de qualquer bem, direito ou serviço, nem a qualquer tipo de pagamento por parte dos participantes ou de seus responsáveis legais. A decisão de participar pressupõe a leitura e concordância com todos os termos deste regulamento.
                                </p>
                            </div>
                            
                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">Seção 3: Mecânica Operacional da Campanha</h2>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">3.1 Plataforma de Execução</h3>
                                <p>
                                    Todas as atividades da Campanha serão realizadas exclusivamente por meio do módulo &quot;Facillit Test&quot;, integrante do ecossistema Facillit Hub. Nenhuma outra forma de participação ou envio de respostas será aceita. A plataforma é responsável por registrar as respostas, calcular o tempo de execução e gerar a pontuação de forma automatizada.
                                </p>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">3.2 Cronograma de Atividades</h3>
                                <p>
                                    Durante cada dia útil do período de vigência da Campanha (de 13 a 17 de outubro), serão publicados dois novos simulados, sendo um de Português e um de Matemática. Os simulados serão disponibilizados diariamente, pontualmente às 16:00 (BRT), e permanecerão acessíveis para resolução até o final do período da Campanha.
                                </p>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">3.3 Formato das Atividades</h3>
                                <p>
                                    Cada simulado terá um tempo máximo de duração de 30 minutos para sua conclusão. O cronômetro será iniciado no momento em que o aluno acessar a atividade e não poderá ser pausado ou reiniciado. Ao final dos 30 minutos, o simulado será automaticamente encerrado e submetido com as respostas marcadas até aquele momento. Caso o aluno finalize antes do tempo limite, deverá submeter ativamente suas respostas para que sejam computadas.
                                </p>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">3.4 Responsabilidade Técnica</h3>
                                <p>
                                    A Organizadora e a Plataforma Tecnológica são responsáveis por garantir a disponibilidade e o funcionamento adequado do servidor e do módulo Facillit Test durante o periodo da Campanha. Contudo, não se responsabilizam por falhas de conexão com a internet, problemas em equipamentos (computadores, tablets, smartphones) ou softwares de propriedade do participante. A instabilidade na rede do usuário ou qualquer outra dificuldade técnica de sua responsabilidade não concederá o direito a uma nova tentativa, extensão de tempo ou qualquer tipo de compensação. Apesar de mencionada a Escola não é organizadora da campanha, todas a responsabilidades são exclusiva do Facilit HUb.
                                </p>
                            </div>
                            
                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">Seção 4: Métricas de Avaliação e Critérios de Classificação</h2>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">4.1 Sistema de Pontuação</h3>
                                <p>
                                    A classificação dos participantes será baseada em um sistema de pontuação objetivo e transparente. Cada resposta correta em qualquer um dos simulados da Campanha concederá ao participante 1 (um) ponto. A pontuação final de cada aluno será o somatório de todos os pontos acumulados nos simulados de Português e Matemática realizados durante o período de vigência. O ranking geral será gerado automaticamente pela plataforma Facillit Test ao final da Campanha.
                                </p>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">4.2 Critérios de Desempate</h3>
                                <p>
                                    Na eventualidade de dois ou mais participantes alcançarem a mesma pontuação final, serão aplicados os seguintes critérios de desempate, em ordem hierárquica e eliminatória, para determinar a classificação final:
                                </p>
                                <ol className="list-decimal pl-6 space-y-2 mt-4">
                                    <li><strong>Menor Tempo Acumulado:</strong> Será considerado o somatório do tempo, em segundos, gasto para completar todos os simulados. O participante com o menor tempo total terá a melhor classificação.</li>
                                    <li><strong>Maior Pontuação em Matemática:</strong> Prevalecerá o participante que obtiver o maior número de acertos somados em todos os simulados de Matemática.</li>
                                    <li><strong>Maior Pontuação em Português:</strong> Persistindo o empate, terá vantagem o participante com o maior número de acertos somados em todos os simulados de Português.</li>
                                    <li><strong>Maior Sequência de Acertos:</strong> Será classificado à frente o participante que tiver a mais longa sequência ininterrupta de respostas corretas dentro de um único simulado.</li>
                                    <li><strong>Sorteio:</strong> Como último recurso, caso o empate persista após a aplicação de todos os critérios anteriores, será realizado um sorteio público na sede da Instituição Marilda, com a presença de representantes da escola e dos pais ou responsáveis.</li>
                                </ol>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">4.3 Apuração e Divulgação do Ranking</h3>
                                <p>
                                    A apuração final será realizada pela plataforma Facillit Test de forma automatizada no primeiro dia útil após o término da Campanha. O resultado oficial, contendo a lista dos 10 primeiros classificados, será divulgado em até 5 (cinco) dias úteis após o encerramento da Campanha, por meio dos canais oficiais da empresa e nas redes sociais da escola.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">Seção 5: Premiação e Política de Pagamento</h2>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">5.1 Descrição dos Prêmios</h3>
                                <p>Os participantes classificados nas dez primeiras posições do ranking final serão contemplados com os seguintes prêmios:</p>
                                <ul className="list-disc pl-6 space-y-2 mt-4">
                                    <li><strong>1º Lugar:</strong> R$ 50,00 (cinquenta reais)</li>
                                    <li><strong>2º Lugar:</strong> R$ 30,00 (trinta reais)</li>
                                    <li><strong>3º Lugar:</strong> R$ 20,00 (vinte reais)</li>
                                    <li><strong>4º ao 10º Lugar:</strong> Certificado de mérito</li>
                                </ul>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">5.2 Política de Entrega e Prazos</h3>
                                <p>
                                    Os vencedores serão notificados oficialmente por meio de seu e-mail cadastrado e por comunicado da escola. O prazo máximo para a entrega dos prêmios é de 30 (trinta) dias corridos a contar da data de divulgação do resultado final.
                                </p>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">5.3 Condições para Prêmios Monetários</h3>
                                <p>
                                    Os prêmios em dinheiro serão pagos exclusivamente por meio de pagamento via PIX, depósito ou transferência bancária para uma conta corrente ou poupança de titularidade do pai, mãe ou responsável legal do aluno vencedor. Em caso de aluno ter mais de 16 (dezesseis) anos o pagamento será feito em uma conta pessoal. Para efetivação do pagamento, o responsável legal deverá apresentar cópia de seu documento de identidade, certidão de nascimento do vencedor e os dados bancários completos. A não apresentação da documentação solicitada em até 15 dias úteis após a notificação poderá implicar na perda do direito ao prêmio.
                                </p>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">5.4 Natureza dos Prêmios</h3>
                                <p>
                                    Os prêmios são pessoais, intransferíveis e, com exceção dos valores monetários já estipulados, não poderão ser convertidos em dinheiro ou substituídos por outros itens.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">Seção 6: Política de Integridade e Antifraude</h2>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">6.1 Condutas Consideradas Fraudulentas</h3>
                                <p>
                                    Será considerado fraude qualquer ato que atente contra a lisura e a integridade da Campanha. A Organizadora se reserva o direito de desclassificar sumariamente o participante que incorrer em qualquer das seguintes práticas, sem prejuízo de outras sanções cabíveis:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 mt-4">
                                    <li>Utilização de softwares, scripts, robôs ou qualquer outro dispositivo automatizado para realizar os simulados.</li>
                                    <li>Compartilhamento de login e senha com terceiros para que estes realizem os simulados em nome do participante.</li>
                                    <li>Formação de conluio ou qualquer tipo de colaboração com outros participantes durante a resolução das atividades.</li>
                                    <li>Tentativas de adulterar o sistema da plataforma, explorar vulnerabilidades de software ou manipular o cronômetro.</li>
                                    <li>Qualquer outra conduta que viole o código de honra acadêmica da Instituição Marilda.</li>
                                </ul>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">6.2 Processo de Verificação</h3>
                                <p>
                                    A comissão organizadora tem o direito de realizar auditorias nos dados de participação. A detecção de fraude será baseada na análise de dados e padrões de comportamento na plataforma. A análise considerará, entre outros fatores, a velocidade de resposta (tempo de submissão por questão, sendo sinalizados padrões consistentemente mais rápidos que a capacidade humana de leitura), padrões de navegação (análise de logs para identificar interações não humanas) e a consistência de desempenho (discrepâncias extremas entre o desempenho na campanha e o histórico acadêmico do aluno, que podem acionar uma revisão manual). Esses métodos são análogos aos utilizados para verificar a autenticidade da participação em sistemas digitais, garantindo que o resultado reflita o esforço genuino.
                                </p>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">6.3 Sanções Aplicáveis</h3>
                                <p>A comprovação de fraude resultará na:</p>
                                <ul className="list-disc pl-6 space-y-2 mt-4">
                                    <li>Desclassificação imediata e irrevogável do participante da Campanha.</li>
                                    <li>Perda automática e integral do direito a qualquer prêmio.</li>
                                    <li>Comunicação formal aos pais ou responsáveis e a possível abertura de um processo disciplinar interno, conforme o regimento da Instituição Marilda.</li>
                                </ul>
                            </div>
                            
                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">Seção 7: Política de Privacidade e Tratamento de Dados Pessoais (LGPD)</h2>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">7.1 Fundamento Legal</h3>
                                <p>
                                    O tratamento de dados pessoais no âmbito desta Campanha está em total conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD), Lei nº 13.709/2018, e demais legislações aplicáveis.
                                </p>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">7.2 Agentes de Tratamento e Finalidade</h3>
                                <p>Para os fins desta Campanha, os agentes de tratamento são definidos da seguinte forma:</p>
                                <ul className="list-disc pl-6 space-y-2 mt-4">
                                    <li><strong>Controlador:</strong> Facilit test, a quem compete as decisões referentes ao tratamento dos dados pessoais.</li>
                                    <li><strong>Operador:</strong> Facillit Hub, que realiza o tratamento de dados pessoais em nome do Controlador.</li>
                                </ul>
                                <p className="mt-4">
                                    Os dados coletados (nome, apelido, e-mail, turma e dados de desempenho como respostas, pontuação e tempo) serão tratados com a finalidade exclusiva de administrar a participação na Campanha, apurar os resultados, identificar e contatar os vencedores, divulgar o ranking e prevenir fraudes.
                                </p>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">7.3 Compartilhamento de Dados</h3>
                                <p>
                                    Os dados pessoais dos participantes serão compartilhados entre a Instituição E o Facillit Hub estritamente para o cumprimento das finalidades descritas neste regulamento. Não haverá compartilhamento de dados com terceiros para fins comerciais ou de marketing.
                                </p>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">7.4 Direitos do Titular</h3>
                                <p>
                                    Aos participantes e seus responsáveis legais são assegurados todos os direitos previstos no artigo 18 da LGPD, como o direito de acesso, correção, e informação sobre o tratamento de seus dados. Para exercer esses direitos, o responsável legal deverá entrar em contato com a plataforma pelos canais oficiais.
                                </p>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">7.5 Uso de Imagem e Nome</h3>
                                <p>
                                    Ao participar da Campanha, o aluno e seu responsável legal autorizam a divulgação do nome, turma e classificação do participante nos canais de comunicação da Instituição Marilda para fins de publicidade dos resultados. A utilização de fotografias ou vídeos dos vencedores em cerimônias de premiação para fins promocionais estará condicionada à assinatura de um termo de autorização de uso de imagem específico.
                                </p>
                            </div>
                            
                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">Seção 8: Disposições Gerais</h2>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">8.1 Aceitação do Regulamento</h3>
                                <p>
                                    A participação na Campanha &quot;SAEB 2025&quot;, a realização do primerio teste, caracteriza a aceitação plena e incondicional de todos os termos e condições estabelecidos neste Regulamento.
                                </p>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">8.2 Casos Omissos e Contato</h3>
                                <p>
                                    As dúvidas e situações não previstas neste regulamento serão analisadas e decididas de forma soberana por uma comissão organizadora. Para dúvidas e esclarecimentos devem-se contatar os canais oficiais da plataforma.
                                </p>
                            </div>

                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}