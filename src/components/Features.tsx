export default function Features() {
  return (
    <section className="section bg-white py-20 lg:py-24" id="features">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-16">
          O que torna o Hub Único?
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Card 1 */}
          <div className="feature-card bg-gray-50 p-8 rounded-2xl border border-gray-200 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl">
            <div className="feature-icon inline-flex items-center justify-center bg-blue-100 text-royal-blue w-16 h-16 rounded-full mb-6">
              <i className="fas fa-sitemap text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-3">Plataforma Tudo-em-Um</h3>
            <p className="text-text-muted">
              Centralize seus estudos, finanças, saúde e tarefas em um único ambiente, eliminando a necessidade de múltiplos aplicativos.
            </p>
          </div>

          {/* Card 2 */}
          <div className="feature-card bg-gray-50 p-8 rounded-2xl border border-gray-200 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl">
            <div className="feature-icon inline-flex items-center justify-center bg-blue-100 text-royal-blue w-16 h-16 rounded-full mb-6">
              <i className="fas fa-lightbulb text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-3">Inteligência Integrada</h3>
            <p className="text-text-muted">
              Nossos módulos se comunicam para oferecer insights, como sugerir uma pausa após uma longa sessão de estudos.
            </p>
          </div>

          {/* Card 3 */}
          <div className="feature-card bg-gray-50 p-8 rounded-2xl border border-gray-200 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl">
            <div className="feature-icon inline-flex items-center justify-center bg-blue-100 text-royal-blue w-16 h-16 rounded-full mb-6">
              <i className="fas fa-graduation-cap text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-3">Alinhado à BNCC</h3>
            <p className="text-text-muted">
              Oferecemos ferramentas pedagógicas alinhadas às diretrizes curriculares nacionais, ideal para estudantes e instituições.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}