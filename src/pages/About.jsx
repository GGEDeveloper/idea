import React from 'react';

export default function About() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <section className="mb-12 text-center">
        <img src="/logo_transparente_amarelo.png" alt="ALIMAMEDETOOLS logotipo" className="mx-auto h-24 w-auto mb-4" />
        <h1 className="text-4xl font-bold text-indigo-700 mb-2">ALIMAMEDETOOLS</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">A MARCA DAS MARCAS</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Loja exclusiva a revendedores. Especialistas em artigos de bricolage, construção, decoração e jardim. Inovação, variedade e preços competitivos, com atendimento personalizado e parceria direta com fabricantes.
        </p>
      </section>
      <section className="mb-10">
        <h3 className="text-2xl font-semibold text-indigo-600 mb-3">Missão</h3>
        <p className="text-gray-700 mb-4">Oferecer soluções versáteis e inovadoras em ferramentas, bricolage, construção, jardim e proteção, com atendimento personalizado a cada cliente revendedor.</p>
        <h3 className="text-2xl font-semibold text-indigo-600 mb-3">Visão</h3>
        <p className="text-gray-700 mb-4">Ser referência nacional no fornecimento de artigos para bricolage e construção, reconhecida pela variedade, qualidade e atendimento diferenciado.</p>
        <h3 className="text-2xl font-semibold text-indigo-600 mb-3">Valores</h3>
        <ul className="text-gray-700 list-disc list-inside space-y-1">
          <li>Variedade</li>
          <li>Preço justo</li>
          <li>Proximidade com o cliente</li>
          <li>Flexibilidade comercial</li>
          <li>Parceria direta com fabricantes</li>
        </ul>
      </section>
      <section className="mb-10">
        <h3 className="text-2xl font-semibold text-indigo-600 mb-3">Categorias de Produtos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <ul className="list-disc list-inside">
            <li>Ferramentas Manuais (Alicates, Martelos, Machados, Picaretas, Maço de borracha, Jogo de chaves)</li>
            <li>Construção (Discos diamantados, Talochas, Ponteiros, Pistolas Mastik, Colheres & pás, Fitas métricas)</li>
            <li>Cabos de aço e acessórios</li>
            <li>Jardim (Pulverizadores, Tesouras, Serrotes, Aspersores, Agulhetas, Lançadores, Esticadores)</li>
          </ul>
          <ul className="list-disc list-inside">
            <li>Eletricidade (Cola termofusível, Interruptores, Cabo de bateria, Fichas)</li>
            <li>Oficina Mecânica (Funil, Carro de ferramentas, Macacos, Diferenciais, Serrote tubular)</li>
            <li>Proteção & Segurança (Luvas, Capacetes, Fatos descartáveis, Viseiras, Óculos, Coletes, Botas, Sinalização)</li>
          </ul>
        </div>
      </section>
      <section className="mb-10">
        <h3 className="text-2xl font-semibold text-indigo-600 mb-3">Contactos</h3>
        <div className="text-gray-700">
          <p><strong>Endereço:</strong> Centro Empresarial Cacém / Paço de Arcos - Pavilhão I; Estrada Nacional 249-3 KM 1.8 E, São Marcos, 2735-307 Cacém, Portugal</p>
          <p><strong>Email:</strong> <a href="mailto:alimamedetools@gmail.com" className="text-indigo-600 hover:underline">alimamedetools@gmail.com</a></p>
          <p><strong>Telefone:</strong> <a href="tel:+351963965903" className="text-indigo-600 hover:underline">(+351) 96 396 59 03</a></p>
          <p><strong>Horário:</strong> Seg a Sex: 9:00 às 12:30 — 14:00 às 18:30</p>
        </div>
      </section>
    </main>
  );
}
