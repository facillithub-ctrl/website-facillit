import Image from 'next/image';

const testimonialsData = [
  { name: 'João Silva', role: 'Estudante de Engenharia', text: 'O Facillit Hub transformou a maneira como eu organizo meus estudos. Ter tudo em um só lugar economiza muito tempo e me mantém focado.', img: '1' },
  { name: 'Maria Oliveira', role: 'Coordenadora Pedagógica', text: 'Finalmente uma plataforma que entende as necessidades de uma escola. A gestão pedagógica ficou muito mais simples e eficiente.', img: '2' },
  { name: 'Carlos Souza', role: 'Gerente de Projetos', text: 'Uso as ferramentas de produtividade para gerenciar minha equipe e os resultados são incríveis. Recomendo para qualquer empresa.', img: '3' },
  { name: 'Ana Pereira', role: 'Vestibulanda de Medicina', text: 'O Facillit Write com correção da IA me ajudou a passar no vestibular. É uma ferramenta de estudo indispensável.', img: '4' },
];

const TestimonialCard = ({ name, role, text, img }: typeof testimonialsData[0]) => (
  <div className="testimonial-card bg-white p-8 rounded-2xl border border-gray-200 text-left w-96 mx-4 flex-shrink-0">
   <p className="testimonial-text">&quot;Este serviço é incrível!&quot;</p> 
    <div className="flex items-center gap-4">
      <Image src={`https://i.pravatar.cc/60?img=${img}`} alt={`Foto de ${name}`} width={60} height={60} className="rounded-full" />
      <div>
        <strong className="block font-bold text-dark-text">{name}</strong>
        <span className="text-sm text-text-muted">{role}</span>
      </div>
    </div>
  </div>
);

export default function Testimonials() {
  return (
    <section className="section bg-white py-20 lg:py-24 overflow-hidden" id="testimonials">
      <div className="container mx-auto text-center">
        <h2 className="section-title text-3xl md:text-4xl font-bold text-dark-text mb-16">
          O que nossos usuários dizem
        </h2>
        <div className="relative w-full">
          <div className="testimonial-carousel flex w-max">
            {/* Renderiza os cards duas vezes para o efeito de loop contínuo */}
            {testimonialsData.map((testimonial, index) => <TestimonialCard key={index} {...testimonial} />)}
            {testimonialsData.map((testimonial, index) => <TestimonialCard key={`clone-${index}`} {...testimonial} />)}
          </div>
        </div>
      </div>
    </section>
  );
}