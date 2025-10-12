import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermosCampanhaPage() {
    return (
        <>
            <Header />
            <main>
                <section className="bg-royal-blue text-white pt-32 pb-20 text-center">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="text-4xl md:text-5xl font-black text-white-text mb-4">Termos e Condições das Campanhas de Simulados</h1>
                        <p className="text-lg text-text-white">Última Atualização: 11 de Outubro de 2025</p>
                    </div>
                </section>

                <section className="py-12 bg-white">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <div className="prose lg:prose-xl max-w-none space-y-8 text-text-muted">

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">1. Introdução e Aceitação</h2>
                                <p>
                                    Estes Termos e Condições regem a sua participação nas Campanhas de Simulados (&quot;Campanhas&quot;) oferecidas pela plataforma Facillit Hub. Ao participar de uma Campanha, você concorda em cumprir integralmente estas regras, que são um complemento aos nossos <a href="/recursos/uso" className="text-royal-blue underline">Termos de Uso</a> gerais. A não concordância com estes termos impede a sua participação.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">2. Regras de Conduta e Antifraude</h2>
                                <p>
                                    Para garantir a integridade e a justiça das Campanhas, o participante concorda em seguir as seguintes regras durante a realização de qualquer simulado:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 mt-4">
                                    <li><strong>Proibição de Cópia e Cola:</strong> Não é permitido copiar o conteúdo das questões ou colar qualquer tipo de texto nas caixas de resposta. A plataforma bloqueará essas ações.</li>
                                    <li><strong>Foco na Janela do Teste:</strong> O participante não deve sair ou minimizar a janela/aba do navegador enquanto o simulado estiver em andamento. A plataforma monitora a visibilidade da página.</li>
                                    <li><strong>Consequências da Saída:</strong> Se o participante sair da tela do teste, a tentativa será automaticamente encerrada e o progresso perdido, sem possibilidade de retomada. Um alerta será exibido antes do início de cada teste.</li>
                                    <li><strong>Tentativa Única:</strong> Cada simulado dentro de uma campanha só pode ser realizado uma única vez. Após a conclusão, o mesmo não estará mais disponível para uma nova tentativa.</li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">3. Propriedade Intelectual e Uso de Dados</h2>
                                <p>
                                    Todo o conteúdo dos simulados, incluindo questões e textos de apoio, é de propriedade intelectual do Facillit Hub ou de seus parceiros. A reprodução, cópia ou distribuição não autorizada é estritamente proibida. Os dados de desempenho (notas, tempo de resposta, etc.) serão utilizados para fins de análise estatística e para aprimoramento da plataforma.
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