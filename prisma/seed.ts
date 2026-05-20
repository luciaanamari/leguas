import { PrismaClient, AdminRole, ModalidadeTrilha } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type ProfissaoSeed = { nome: string; descricao: string };

type TrilhaSeed = {
  slug: string;
  titulo: string;
  modalidade: ModalidadeTrilha;
  descricaoCurta: string;
  descricaoCompleta: string;
  comoEntrar: string;
  duracao: string;
  custoEstimado: string;
  primeirosPassos: string;
  narrativaAluno: string;
  narrativaProfissional: string;
  ordem: number;
  profissoes: ProfissaoSeed[];
};

const trilhas: TrilhaSeed[] = [
  {
    slug: "bacharelado-presencial",
    titulo: "Bacharelado Presencial",
    modalidade: ModalidadeTrilha.PRESENCIAL,
    descricaoCurta: "O caminho clássico: 4 a 6 anos em uma universidade pública ou privada.",
    descricaoCompleta:
      "O bacharelado presencial é o que a maioria das pessoas pensa quando ouve a palavra faculdade. Você assiste aulas em uma universidade, dentro de uma sala física, com professores e colegas presentes. As graduações duram entre quatro e seis anos.\n\nNo Piauí, as universidades públicas mais comuns são a UFPI (Universidade Federal do Piauí) e a UESPI (Universidade Estadual do Piauí). Para entrar nelas, o caminho principal é o ENEM e o SISU. Quem prefere uma faculdade particular tem opções em Teresina, Parnaíba, Picos e outras cidades, com mensalidades que variam de R$ 400 a R$ 1.500. O ProUni e o FIES ajudam quem não pode pagar.\n\nEsse formato pede dedicação integral em muitos cursos. É o caminho mais valorizado no mercado para profissões reguladas como Medicina, Direito e Engenharia, mas exige tempo e, em muitos casos, mudança de cidade.",
    comoEntrar:
      "Fazer o ENEM no final do 3º ano. Com a nota, você pode usar o SISU (universidades públicas), o ProUni (bolsa em particular) ou o FIES (financiamento em particular). Cada universidade pública também pode ter um vestibular próprio.",
    duracao: "4 a 6 anos, em tempo integral ou parcial dependendo do curso.",
    custoEstimado:
      "Pública: gratuita (gastos pessoais com transporte, material e moradia se mudar de cidade). Particular: R$ 400 a R$ 1.500 por mês, com bolsas do ProUni ou financiamento do FIES.",
    primeirosPassos:
      "Inscreva-se no ENEM, escolha 3 cursos que combinam com você e veja a nota de corte do último ano no SISU.",
    narrativaAluno:
      "São 6h40 da manhã quando o despertador toca. Você é da turma de Engenharia Civil na UFPI, no campus de Teresina, e a primeira aula começa às 7h30. O ônibus que sai do bairro Dirceu para o Ininga demora uns 40 minutos. Você desce na frente do CCN, atravessa a praça do RU e entra na sala de Cálculo III. O professor já está escrevendo no quadro uma sequência de integrais que parece um quebra-cabeça em árabe.\n\nNo intervalo, você senta na grama do campus com três colegas. Um é de Picos, dois são de bairros diferentes de Teresina. Vocês falam sobre o trabalho que precisa ser entregue na sexta, sobre a vaga de estágio que abriu na Eletrobras, sobre o calor que está fazendo. Alguém comenta que o RU está com feijoada hoje e todo mundo decide almoçar lá. Por R$ 2, você come arroz, feijão, salada, carne e suco. Em uma faculdade particular, esse mesmo almoço custaria R$ 25.\n\nNa parte da tarde, tem aula de Mecânica dos Solos e laboratório de Topografia. Vocês saem do prédio carregando um teodolito para medir um terreno atrás da biblioteca. O sol bate forte e você aprende, na prática, que o ângulo medido em sala é diferente do ângulo medido no chão de verdade. À noite, na biblioteca, você revisa a matéria com o caderno aberto e o celular travado em modo de estudo. Os colegas do grupo do WhatsApp combinam de se encontrar amanhã às 14h para resolver a lista de exercícios.\n\nÉ um dia comum. Mas existe uma diferença que demorou um pouco para você perceber: aqui, ninguém faz isso sozinho. O professor está acessível, a monitoria existe, o grupo da turma resolve dúvidas no fim de semana. Você não está só com o livro e a sua dúvida. Está em um ambiente onde aprender é coletivo.",
    narrativaProfissional:
      "Você é engenheiro civil há quatro anos. Trabalha na prefeitura de Floriano, contratado por concurso, e também faz projetos como autônomo. Hoje, segunda-feira, acorda às 6h30. Toma café com cuscuz e ovo, sai de casa às 7h40 e chega no canteiro de obras às 8h. A obra é a reforma da praça central da cidade. A equipe de pedreiros já está lá há meia hora.\n\nO mestre de obras te chama: a fundação que foi projetada não vai funcionar porque o solo é mais arenoso do que o sondagem mostrou. Você abre o projeto no tablet, liga para o calculista que mora em Teresina, e em uma hora vocês ajustam o cálculo. Decide aumentar a profundidade da sapata em 40cm. Anota no diário de obra, fotografa, envia para o engenheiro fiscal da prefeitura.\n\nÀs 11h, você volta para o escritório, almoça em casa (sua mãe fez baião de dois) e às 14h tem reunião com um cliente particular. Ele quer construir uma casa de dois pavimentos no bairro Princesa do Sul. Você abre o esboço, mostra três opções de planta, explica o que cada coisa significa em custo. O cliente diz que precisa de tempo para conversar com a esposa. Vocês marcam de novo para a próxima semana.\n\nÀ tarde, ainda no escritório, você responde e-mails, fecha um orçamento, atualiza o cronograma da obra da praça. Às 17h30, encerra. Vai correr na orla. Aos sábados, atende clientes na sua sala alugada no centro. Ganha em torno de R$ 8 mil por mês somando o salário da prefeitura e os projetos próprios.\n\nO trabalho é estável, exige decisão constante, e cada projeto deixa algo concreto no mundo. Quando você passa pela praça reformada, três meses depois, vê crianças brincando ali. Isso não tem preço, mas tem trabalho atrás. Muito trabalho.",
    ordem: 1,
    profissoes: [
      {
        nome: "Médico",
        descricao: "Cuida da saúde das pessoas em hospitais, clínicas e postos do SUS.",
      },
      {
        nome: "Engenheiro Civil",
        descricao: "Projeta e acompanha obras de casas, edifícios, estradas e pontes.",
      },
      {
        nome: "Advogado",
        descricao: "Defende clientes em processos, dá pareceres e atua em órgãos públicos.",
      },
      {
        nome: "Arquiteto",
        descricao: "Projeta espaços, casas e prédios pensando em uso e estética.",
      },
      {
        nome: "Psicólogo",
        descricao: "Acompanha pessoas em consultórios, escolas, postos de saúde e empresas.",
      },
      {
        nome: "Professor universitário",
        descricao: "Dá aulas e faz pesquisa em universidades, geralmente após o mestrado.",
      },
    ],
  },
  {
    slug: "bacharelado-ead",
    titulo: "Bacharelado EAD",
    modalidade: ModalidadeTrilha.EAD,
    descricaoCurta: "Diploma de bacharel estudando de casa, com aulas online e polo presencial.",
    descricaoCompleta:
      "O bacharelado a distância (EAD) é uma graduação completa, com o mesmo valor de diploma que uma faculdade presencial. A diferença é que a maior parte das aulas acontece online: você assiste a vídeos, faz atividades em uma plataforma e participa de fóruns com colegas e tutores. Algumas vezes por mês, você vai a um polo presencial perto da sua cidade para provas e atividades.\n\nNo Piauí, vários municípios fora de Teresina têm polos de EAD de universidades reconhecidas. Isso significa que você pode morar em Picos, Floriano, Bom Jesus ou São Raimundo Nonato e fazer Administração, Pedagogia, Ciências Contábeis ou outros cursos sem precisar mudar de cidade.\n\nO custo é mais baixo que o presencial particular (mensalidades a partir de R$ 200) e o tempo é mais flexível: você organiza o seu próprio estudo. Em troca, exige autodisciplina e atenção redobrada na hora de escolher a instituição — só vale a pena se ela for credenciada pelo MEC.",
    comoEntrar:
      "Muitas faculdades EAD aceitam direto a nota do ENEM, sem vestibular próprio. Outras fazem uma prova online simples. Você se inscreve pelo site da instituição, escolhe o polo mais perto e começa.",
    duracao: "4 a 5 anos, com carga horária semelhante ao presencial.",
    custoEstimado: "R$ 200 a R$ 600 por mês. Há descontos por bolsa, ProUni e convênios.",
    primeirosPassos:
      "Liste 3 cursos que te interessam, procure no site do MEC e-MEC se a faculdade é credenciada, e visite o polo mais perto de você.",
    narrativaAluno:
      "Você mora em Oeiras, no interior do Piauí. Tem 19 anos, trabalha de manhã como atendente em uma farmácia e começou o curso de Administração EAD pela faculdade UNINASSAU em fevereiro. Sua rotina mudou bastante.\n\nDe manhã, das 7h às 13h, você está na farmácia. Almoça em casa, descansa 40 minutos e abre o notebook no quarto. Hoje a aula é de Matemática Financeira. O professor gravou um vídeo de 50 minutos explicando juros compostos com exemplos práticos: como funciona um financiamento de moto, como o banco calcula o cheque especial, como uma poupança rende. Você assiste pausando quando precisa, anota no caderno e refaz dois exercícios no fim.\n\nDepois da aula, você entra no fórum da turma. Um colega de Floriano postou uma dúvida sobre a fórmula da tabela price. Você responde com base no que entendeu. A tutora confirma sua resposta no dia seguinte. O ritmo é diferente: ninguém te cobra estar online às 14h em ponto, mas no fim da semana você precisa ter cumprido três atividades. Quem não se organiza, atrasa.\n\nUma vez por mês, no sábado, você vai até o polo no centro de Oeiras. Lá, faz a prova presencial das matérias do bimestre. Encontra uns 30 colegas, todos da região. Alguns são professoras que querem virar gestoras de escola, outros são donos de pequenos comércios, outros começaram cedo como você. Vocês trocam contato, formam grupos no WhatsApp para estudar juntos.\n\nÀ noite, você assiste mais uma aula gravada, dessa vez de Gestão de Pessoas. Termina às 22h. Não foi um dia leve, mas você está construindo algo. O diploma vai ter o nome da faculdade impresso, sem distinção entre EAD e presencial. E, mais importante, você não precisou abandonar a cidade, a família ou o emprego para conquistar isso.",
    narrativaProfissional:
      "Você se formou em Administração pela EAD e há dois anos abriu, com um sócio, uma loja de produtos para festas em Floriano. Hoje, terça-feira, acorda às 6h40, leva o filho para a escola e às 8h abre a loja no centro da cidade.\n\nO dia começa com a conferência do estoque. Chegou uma encomenda de balões, descartáveis e itens de decoração. Você confere nota fiscal, atualiza o sistema, repõe as prateleiras. Sua sócia chega às 9h e atende os primeiros clientes. Uma mãe quer organizar o aniversário de 6 anos da filha, tema bailarina. Você sugere combinações de cores, calcula o orçamento, fecha em R$ 480.\n\nÀs 11h, você está na sala dos fundos. Abre o computador e revisa as contas a pagar. Aquela aula de gestão financeira da faculdade te ensinou a separar dinheiro da loja do dinheiro pessoal. Você usa uma planilha simples, controla o fluxo de caixa, sabe quanto pode investir em estoque e quanto guardar como reserva. No mês passado, o lucro líquido foi de R$ 6.200, dividido com a sócia.\n\nÀ tarde, depois do almoço em casa, você atende mais clientes, conversa com fornecedores no WhatsApp, fecha uma parceria com um buffet local. Às 17h, sai mais cedo porque tem reunião do grupo da igreja. Sua sócia fica até as 18h.\n\nA loja não é gigante, mas é estável, sustenta duas famílias e cresce todo ano. Você não precisou sair de Floriano para virar empreendedor. Aprendeu pelo curso, aplicou na prática, e hoje seus colegas de turma da EAD viram o que você construiu. Alguns viram referência. Você sente que valeu cada noite estudando no quarto.",
    ordem: 2,
    profissoes: [
      {
        nome: "Administrador",
        descricao: "Gerencia empresas, equipes e negócios próprios em qualquer área.",
      },
      {
        nome: "Contador",
        descricao: "Cuida da contabilidade e dos impostos de empresas e pessoas físicas.",
      },
      {
        nome: "Pedagogo",
        descricao: "Atua em escolas, coordenações pedagógicas e programas educacionais.",
      },
      {
        nome: "Gestor de Recursos Humanos",
        descricao: "Trabalha com seleção, treinamento e bem-estar de equipes.",
      },
      {
        nome: "Analista de Marketing",
        descricao: "Planeja campanhas, redes sociais e estratégias de venda para empresas.",
      },
    ],
  },
  {
    slug: "tecnologo",
    titulo: "Tecnólogo",
    modalidade: ModalidadeTrilha.PRESENCIAL,
    descricaoCurta: "Graduação curta e prática: 2 a 3 anos com foco em mercado de trabalho.",
    descricaoCompleta:
      "O curso superior de tecnologia, ou tecnólogo, é uma graduação reconhecida pelo MEC, com duração de 2 a 3 anos, focada diretamente em uma profissão específica. Diferente do bacharelado, que dura mais tempo e tem caráter mais amplo, o tecnólogo prepara você para uma função concreta no mercado em menos tempo.\n\nNo Piauí, instituições como o IFPI (Instituto Federal do Piauí) oferecem tecnólogos gratuitos em áreas como Análise e Desenvolvimento de Sistemas, Gestão Comercial, Agroecologia e Saneamento Ambiental. Faculdades particulares e EAD também oferecem cursos como Logística, Estética, Recursos Humanos e Marketing Digital.\n\nA principal vantagem é o tempo: em três anos você está formado e podendo trabalhar. A desvantagem é que algumas profissões reguladas (como Medicina, Direito e Engenharia) não aceitam diploma de tecnólogo — para elas, é bacharelado obrigatório.",
    comoEntrar:
      "Pelo ENEM e SISU (em instituições públicas como IFPI) ou direto pelo site da faculdade no caso de instituições privadas. Algumas oferecem ProUni e FIES.",
    duracao: "2 a 3 anos, presencial ou EAD.",
    custoEstimado:
      "IFPI e outras públicas: gratuitas. Particulares: R$ 200 a R$ 700 por mês, com bolsas disponíveis.",
    primeirosPassos:
      "Liste 3 áreas com vagas na sua região, pesquise tecnólogos relacionados, e veja se o IFPI mais próximo oferece algum deles.",
    narrativaAluno:
      "São 18h e você acabou de chegar no IFPI de Teresina para a aula de Análise e Desenvolvimento de Sistemas. Trabalha de manhã como auxiliar administrativo e, à noite, estuda. O curso é noturno, dura três anos, e você está no segundo período.\n\nA aula de hoje é Lógica de Programação. O professor projeta o código no quadro: um algoritmo simples para calcular o desconto de uma loja. Ele pede para vocês implementarem em Python. Você abre o notebook (comprou com o auxílio estudantil) e começa a digitar. Erro de sintaxe. Você lê de novo, encontra a vírgula no lugar errado, corrige. Roda. Funciona. Pequena vitória.\n\nNo intervalo, vocês descem para o pátio. Um colega chamado Renan vai te chamando para um grupo de estudo aos sábados, na biblioteca pública. São quatro alunos, todos no mesmo ritmo, e juntos vocês fazem projetos pequenos: um site para a igreja dele, um app de cardápio para um restaurante. Esses projetos depois entram no portfólio que vocês mandam quando aparece vaga de estágio.\n\nO professor da segunda aula, Banco de Dados, é um cara de Picos que trabalhou anos no mercado privado. Ele explica não só o conteúdo, mas como é a vida real: como é uma reunião com cliente, o que significa entregar um projeto no prazo, por que um sistema mal modelado vira um problema gigante depois. Você anota tudo. Não tem vergonha de fazer pergunta, porque sabe que a chance de virar a pessoa que conhece a resposta depende de fazer a pergunta agora.\n\nÀs 22h30, você está no ônibus voltando para casa. Cansado, mas com a sensação de que cada noite te aproxima de um trabalho na área. Em três anos, está formado. E o mercado de tecnologia tem vaga até para quem ainda nem se formou.",
    narrativaProfissional:
      "Você se formou tecnólogo em Análise e Desenvolvimento de Sistemas pelo IFPI há um ano e três meses. Trabalha como desenvolvedor júnior em uma empresa de software de Teresina que atende clientes de todo o Brasil. O escritório é híbrido: você vai duas vezes por semana presencialmente, o resto é de casa.\n\nHoje é quarta-feira, dia de ir ao escritório. Você acorda às 7h, toma café, pega o ônibus às 8h. Chega no escritório no Jóquei, no centro comercial de Teresina, às 9h. A reunião diária da equipe (chamam de daily) é às 9h30. Você fala em dois minutos o que fez ontem, o que vai fazer hoje, e se tem algum problema. Ontem você terminou um relatório de vendas. Hoje vai começar uma tela nova para um cliente de São Paulo.\n\nDas 10h às 12h, você programa concentrado, com fone de ouvido. Para uma dúvida, abre o chat da equipe e seu colega sênior responde em três minutos. Isso é diferente da faculdade, onde você ficava preso na dúvida por horas. Aqui, é normal pedir ajuda. Quem nunca pede é quem trava.\n\nNo almoço, você desce com a equipe para um restaurante a quilo na rua. R$ 25 a refeição. Conversa-se sobre futebol, sobre o último jogo do River, sobre uma série nova. À tarde, mais código, uma reunião de uma hora com o cliente e mais código. Às 18h, você encerra.\n\nGanha R$ 4.200 por mês como júnior. Em dois anos, planeja virar pleno, com salário a partir de R$ 6 mil. Mora no apartamento dos pais ainda, mas já está economizando para alugar perto da empresa. Faz pequenos freelas no fim de semana quando aparece. Estuda em casa por conta para virar especialista em uma área que paga bem. O tecnólogo te abriu a porta. O resto depende de você continuar entrando.",
    ordem: 3,
    profissoes: [
      {
        nome: "Desenvolvedor de Sistemas",
        descricao: "Programa sites, aplicativos e sistemas para empresas e clientes próprios.",
      },
      {
        nome: "Analista de Logística",
        descricao: "Organiza transporte, estoque e distribuição em empresas e armazéns.",
      },
      {
        nome: "Gestor Comercial",
        descricao: "Coordena equipes de vendas, metas e relacionamento com clientes.",
      },
      {
        nome: "Técnico em Agroecologia",
        descricao: "Atua na produção rural sustentável e em programas do governo.",
      },
      {
        nome: "Designer Gráfico",
        descricao: "Cria identidade visual, posts, embalagens e materiais de comunicação.",
      },
    ],
  },
  {
    slug: "curso-tecnico",
    titulo: "Curso Técnico",
    modalidade: ModalidadeTrilha.TECNICO,
    descricaoCurta: "Formação prática de 1 a 2 anos para entrar no mercado rapidamente.",
    descricaoCompleta:
      "O curso técnico é uma formação profissionalizante de ensino médio. Você aprende uma profissão específica em 1 ou 2 anos e sai com um diploma reconhecido pelo MEC. Pode ser feito durante o ensino médio (técnico integrado) ou depois (subsequente).\n\nNo Piauí, o IFPI é a principal referência: oferece técnicos gratuitos em Enfermagem, Edificações, Informática, Eletrotécnica, Administração, Agropecuária e muitos outros. O SENAI, SENAC e a rede privada também oferecem cursos em horários flexíveis.\n\nO técnico é a entrada mais rápida no mercado formal. Em pouco tempo você já está apto a trabalhar em hospitais, escritórios, obras, comércios ou laboratórios. Muitos profissionais começam pelo técnico e depois fazem uma graduação na mesma área, com a vantagem de já estar empregado.",
    comoEntrar:
      "Concurso de seleção do IFPI (provas de Português, Matemática e conhecimentos básicos) ou inscrição direta em escolas privadas e SENAI/SENAC. Para o IFPI, geralmente as inscrições abrem entre setembro e novembro.",
    duracao: "1 a 2 anos. Integrado ao ensino médio dura 3 anos.",
    custoEstimado:
      "IFPI: gratuito. SENAI/SENAC: bolsas e custos baixos. Escolas privadas: R$ 150 a R$ 400 por mês.",
    primeirosPassos:
      "Procure o site do IFPI e veja quais técnicos têm oferta na sua região. Confira o edital do próximo processo seletivo.",
    narrativaAluno:
      "Você tem 17 anos, mora em Parnaíba e está no segundo ano do curso técnico em Enfermagem no IFPI. As aulas começam às 7h e vão até as 12h. À tarde, você faz estágio no Hospital Estadual Dirceu Arcoverde.\n\nDe manhã, você está em sala. Hoje é aula de Anatomia. A professora trouxe um modelo do sistema circulatório e está explicando como o sangue percorre o coração. Vocês são em 30 alunos, dos 14 aos 19 anos. Alguns querem virar enfermeiros formados, outros estão pensando em medicina, outros vão direto para o mercado depois de formados como técnicos. Você ainda não decidiu o caminho longo, mas sabe que esse técnico abre porta.\n\nNo intervalo, a turma desce para a cantina. R$ 5 e você come um cuscuz com ovo e suco. Uma colega, que mora no bairro Lourival Parente, divide a marmita com você. Conversa-se sobre o pavor do prova de Microbiologia da semana que vem, sobre o estágio, sobre o caso do paciente do leito 12 que melhorou.\n\nDepois do almoço em casa, você pega o ônibus para o hospital. No estágio, está acompanhando uma técnica em enfermagem com 20 anos de experiência. Hoje, você ajuda a verificar pressão de três pacientes, faz o curativo de uma senhora que caiu em casa, conversa com um senhor de 70 anos que está internado há uma semana. Ele conta sobre os filhos, e você só escuta. Sua chefe te disse, no primeiro dia: escutar é metade do cuidado. Você nunca esqueceu.\n\nÀs 18h, volta para casa. Está cansada, mas com a sensação de quem fez algo útil hoje. Sabe que ainda é estudante, mas já está aprendendo o que é cuidar de alguém. Em pouco mais de um ano, com o diploma na mão, já pode ser contratada como técnica em enfermagem em qualquer hospital. O salário inicial gira em torno de R$ 1.700 a R$ 2.500. É um começo. E você já tem mais experiência prática do que muito colega que está no terceiro ano de faculdade.",
    narrativaProfissional:
      "Você é técnica em enfermagem há cinco anos. Trabalha em dois lugares: meio expediente em uma clínica particular em Teresina e plantões noturnos a cada quinze dias no Hospital Getúlio Vargas. Hoje, sexta-feira, é dia da clínica.\n\nVocê acorda às 6h, leva o filho para a escola, chega na clínica às 7h30. O dia começa com a passagem de plantão: a colega da noite te conta como ficaram os pacientes, quem tomou remédio, quem ainda não. Você confere a planilha, separa os medicamentos do dia, organiza o material para os procedimentos.\n\nÀs 8h, chega o primeiro paciente. Um senhor que faz hemodiálise três vezes por semana. Você prepara o acesso, monitora os sinais vitais durante o procedimento, fica atenta a qualquer mudança. Conversa com ele sobre a neta que faz aniversário no sábado. Ele te mostra fotos no celular. Daqui a quatro horas, você vai desligar a máquina e ele vai para casa.\n\nDas 11h às 14h, você atende mais cinco pacientes: aplicação de medicamento, coleta de sangue, curativo, retirada de pontos, vacinação infantil. Cada um exige atenção total. Erro em enfermagem custa caro. Você aprendeu isso no IFPI e nunca esqueceu.\n\nÀs 14h, encerra na clínica e vai para casa. À tarde, descansa, busca o filho na escola, faz almoço, estuda um pouco. Está se preparando para o concurso da prefeitura, que abre um edital com vagas para técnicos em enfermagem. O salário inicial é de R$ 3.100, com estabilidade. Se passar, fecha a clínica e fica só com o concurso e os plantões esporádicos.\n\nGanha hoje R$ 3.500 por mês somando os dois trabalhos. Não é rico, mas é estável, ajuda em casa, sustenta o filho. Há cinco anos era estudante. Hoje é referência na clínica. Comprou um carro usado no ano passado. Está pagando a faculdade de Enfermagem em ritmo lento, EAD, à noite, sem pressa. Quer ser enfermeira plena daqui a três anos. O técnico foi a base. O que veio depois foi consequência do que você plantou.",
    ordem: 4,
    profissoes: [
      {
        nome: "Técnico em Enfermagem",
        descricao: "Atua em hospitais, clínicas, postos de saúde e atendimento domiciliar.",
      },
      {
        nome: "Técnico em Edificações",
        descricao: "Trabalha em obras, escritórios de engenharia e prefeituras.",
      },
      {
        nome: "Técnico em Informática",
        descricao: "Faz manutenção, suporte e instalação de redes em empresas e órgãos públicos.",
      },
      {
        nome: "Técnico em Agropecuária",
        descricao: "Atua em fazendas, cooperativas, agroindústrias e órgãos rurais.",
      },
      {
        nome: "Técnico em Eletrotécnica",
        descricao: "Trabalha em manutenção elétrica de indústrias, prédios e instalações.",
      },
    ],
  },
  {
    slug: "concurso-publico",
    titulo: "Concurso Público",
    modalidade: ModalidadeTrilha.CONCURSO,
    descricaoCurta: "Estabilidade, salário garantido e benefícios. Exige preparação focada.",
    descricaoCompleta:
      "O concurso público é a porta de entrada para o serviço público no Brasil. Você estuda para uma prova, é aprovado por nota, e tem direito a uma vaga com estabilidade, salário fixo, 13º, férias e benefícios. Existem concursos para todos os níveis de escolaridade: ensino médio, técnico e superior.\n\nNo Piauí, os concursos mais comuns para quem está terminando o ensino médio são os de assistente administrativo da prefeitura, da Polícia Militar (soldado), do Exército, dos Correios e de diversos órgãos federais que pedem apenas ensino médio. Para quem tiver técnico ou superior, abre-se um leque ainda maior.\n\nA preparação é o ponto crucial. Você precisa estudar matérias específicas (Português, Matemática, Conhecimentos Gerais, Direito) com disciplina por meses ou até anos. Existem cursinhos presenciais em Teresina, plataformas online por R$ 30 a R$ 100 mensais, e materiais gratuitos como o Gran Cursos, Estratégia Concursos (alguns conteúdos abertos) e canais no YouTube.",
    comoEntrar:
      "Acompanhar os editais nos sites oficiais (governo.br, sites de prefeituras, PMs, etc), preparar-se nas matérias cobradas, e prestar a prova. A nota define a aprovação.",
    duracao:
      "A preparação pode levar de 6 meses a 3 anos. Depois da aprovação, o cargo é até a aposentadoria.",
    custoEstimado:
      "Estudo: material gratuito, cursinho online R$ 30 a R$ 100 por mês, cursinho presencial em Teresina R$ 200 a R$ 600 por mês.",
    primeirosPassos:
      "Escolha 1 concurso real (PM-PI, Correios, prefeitura da sua cidade), baixe o último edital, e veja as matérias cobradas.",
    narrativaAluno:
      "Você tem 19 anos, terminou o ensino médio o ano passado e mora com seus pais em Picos. Decidiu se preparar para o concurso da Polícia Militar do Piauí, que abre vagas para o cargo de Soldado. A rotina é firme: acorda às 5h30, faz 40 minutos de exercício físico (porque a prova tem teste físico), toma café e às 7h está na frente do caderno.\n\nDe manhã, das 7h às 11h, você estuda em casa. Hoje é dia de Direito Administrativo. Você abre o PDF da apostila que comprou online por R$ 80 (cobre todas as matérias do edital), assiste à aula gravada no celular e resolve 30 questões de provas anteriores no caderno. Marca as que errou. Volta para a teoria. Refaz. Acerta.\n\nNo almoço, sua mãe te chama para a mesa. Arroz, feijão, frango e salada. Vocês conversam pouco, porque ela sabe que sua cabeça está cheia. Depois, descansa 30 minutos.\n\nÀ tarde, das 14h às 17h, você vai para o curso presencial no centro de Picos. São 12 alunos, todos preparando para PM ou Bombeiros. O professor explica Matemática com foco no que cai. Você se identifica com vários colegas: gente que veio de escola pública, gente que trabalha de manhã e estuda à tarde, gente que sustenta a casa e estuda à noite.\n\nDas 17h às 18h, você vai correr na praça de esportes. Treina abdominal, flexão, corrida. O edital pede 12 minutos de corrida com no mínimo 2.000 metros. Hoje você correu 2.300. Ainda dá pra melhorar.\n\nÀ noite, das 20h às 22h, mais estudo. Português. Quem domina Português leva a prova. Você resolve 20 questões de interpretação de texto, lê os comentários do professor, anota o que errou.\n\nÀs 22h30, deita. Não é um dia divertido. Mas é um dia produtivo. E todo dia produtivo te aproxima da aprovação. O concurso pode demorar 1 ano, 2 anos, 3 anos. Mas quando passar, é uma vida inteira. Salário inicial: R$ 4.300, com plano de carreira, estabilidade e aposentadoria garantida.",
    narrativaProfissional:
      "Você passou no concurso da Polícia Militar do Piauí há três anos. Hoje é Soldado lotado no 12º Batalhão de Picos. Trabalha em escala 12x36: 12 horas trabalhando, 36 horas descansando. Hoje é dia de plantão diurno.\n\nÀs 6h30 você sai de casa, fardado. Chega ao batalhão às 7h. O comandante do plantão passa as orientações do dia, distribui as duplas e as viaturas. Você fica com o cabo Silva, um veterano de 15 anos de corporação. Vocês saem para patrulhar o centro e os bairros ao redor.\n\nDas 8h às 11h, a viatura faz rondas. Atende uma ocorrência: briga entre dois vizinhos por causa de cachorro solto. Vocês conversam com os dois, acalmam a situação, anotam os dados, encerram sem necessidade de ir para a delegacia. Outra ocorrência: comerciante denunciou um furto. Vocês fazem o registro, levam o suspeito para a delegacia, voltam para a viatura.\n\nNo almoço, você come no rancho do batalhão. Comida simples, mas farta. Conversa com colegas, ri de piada antiga, descontrai. Depois, mais quatro horas de patrulha.\n\nÀs 19h, encerra o plantão. Vai para casa, toma banho, joga conversa fora com sua esposa. Amanhã é dia de folga. Você usa o dia para descansar, levar a filha ao parquinho, ajudar no quintal. Aproveita para passar na academia.\n\nGanha R$ 5.100 líquidos por mês como Soldado. Tem plano de saúde estendido para a família, vale-alimentação, gratificações por escala. Em alguns anos, vai prestar o concurso para Cabo, depois Sargento. Tem amigos que viraram oficiais formados no curso superior interno da PM. Tudo isso a partir de um diploma de ensino médio bem aproveitado.\n\nO concurso te deu o que poucos empregos da sua geração dão: previsibilidade. Você sabe o que vai ganhar daqui a 10 anos. Sabe que vai se aposentar com salário integral. Sabe que seus filhos vão ter plano de saúde. Em troca, você dá disciplina, escala dura, risco no trabalho. É uma troca clara. E você fez essa escolha de olhos abertos.",
    ordem: 5,
    profissoes: [
      {
        nome: "Soldado da Polícia Militar",
        descricao: "Atua na segurança pública estadual, em viaturas e batalhões.",
      },
      {
        nome: "Auxiliar Administrativo",
        descricao: "Trabalha em órgãos públicos federais, estaduais e municipais.",
      },
      {
        nome: "Agente dos Correios",
        descricao: "Atua na entrega, atendimento e operação dos Correios.",
      },
      {
        nome: "Professor da Rede Pública",
        descricao: "Ensina em escolas estaduais e municipais (exige formação específica).",
      },
      {
        nome: "Agente de Endemias",
        descricao: "Atua no combate a doenças (dengue, esquistossomose) em órgãos municipais.",
      },
    ],
  },
  {
    slug: "mercado-direto",
    titulo: "Mercado Direto",
    modalidade: ModalidadeTrilha.MERCADO,
    descricaoCurta: "Entrar direto no trabalho, com cursos curtos e experiência prática.",
    descricaoCompleta:
      "Nem todo mundo precisa fazer faculdade para construir uma carreira. Existem caminhos legítimos e bem pagos que partem direto do mercado: cursos livres, certificações curtas, aprendizado prático e abertura do próprio negócio.\n\nNo Piauí, várias profissões funcionam assim: estética, gastronomia, mecânica, marcenaria, costura, beleza, fotografia, marketing digital, vendas, ofícios em geral. Muitas pagam mais do que cargos administrativos que exigem diploma superior, e várias permitem você abrir seu próprio negócio em pouco tempo.\n\nA escola dessa trilha é o trabalho. O preço de entrada é baixo (cursos de R$ 200 a R$ 2.000), o tempo é curto (alguns meses), e a recompensa depende muito de quanto você dedica e da sua reputação. É um caminho com menos rede de proteção formal, mas com liberdade e potencial real.",
    comoEntrar:
      "Escolher uma área prática, fazer um curso livre (SENAI, SENAC, cursos online), começar a trabalhar como aprendiz ou auxiliar, ganhar experiência, abrir o próprio negócio ou subir como profissional.",
    duracao: "3 a 12 meses de curso. Crescimento depende da experiência e da rede de contatos.",
    custoEstimado:
      "Cursos de R$ 200 a R$ 2.000. Investimento inicial em ferramentas ou negócio próprio varia (R$ 500 a R$ 5.000).",
    primeirosPassos:
      "Pense em 3 coisas que você gosta de fazer ou tem facilidade. Procure cursos curtos no SENAI, SENAC ou plataformas como Hotmart e Udemy.",
    narrativaAluno:
      "Você tem 18 anos, mora em Teresina e decidiu não fazer faculdade — pelo menos não agora. Sempre gostou de cabelo e desde os 13 anos cortava o cabelo dos primos no quintal. Em janeiro, se matriculou no curso de Cabeleireiro Profissional do SENAC: 6 meses, R$ 1.400 parcelado.\n\nO curso começa às 13h e vai até as 17h, de segunda a sexta. De manhã, das 8h às 12h, você trabalha como auxiliar em um salão no bairro Saci. Ganha R$ 50 por dia mais gorjetas. Sua função é lavar cabelo, levar produto, organizar a bancada. Mas, na prática, você está aprendendo muito mais: observa cada movimento das cabeleireiras experientes, escuta a conversa com as clientes, entende como elas precificam, como gerenciam o tempo, como fidelizam.\n\nNo SENAC, à tarde, a aula é técnica. Hoje você aprendeu degradê na nuca. O instrutor passou no quadro o ângulo do pente, a posição da tesoura, e fez em três alunos como demonstração. Depois foi a vez dos alunos. Você cortou na primeira tentativa em uma cabeça de manequim. Depois foi para um colega, que confiou em você. Saiu bom. O instrutor aprovou.\n\nNo intervalo, vocês conversam. A turma é diversa: tem gente saindo do ensino médio como você, gente com 30 anos mudando de profissão, gente que já corta há anos e veio buscar o diploma do SENAC. Vocês trocam ideias, marcam de cortar de graça uns nos outros no fim de semana para praticar.\n\nÀ noite, você não tem aula. Aproveita para postar no Instagram fotos dos cortes que fez no salão (com autorização). Está montando seu portfólio digital. Em 6 meses, quando se formar, quer começar a atender em domicílio até juntar dinheiro pra alugar uma cadeira em um salão.\n\nÉ uma rotina cansativa: trabalho de manhã, curso à tarde, prática no fim de semana. Mas em menos de um ano, você vai estar formada, com clientes próprias e ganhando o suficiente para se sustentar. Sua mãe queria que você fizesse faculdade. Você não fechou essa porta, mas escolheu outra primeiro. Ela respeita.",
    narrativaProfissional:
      "Você é cabeleireira há quatro anos. Há dois anos, abriu seu próprio salão pequeno no bairro Promorar, em Teresina. É um espaço de 30 metros quadrados, com duas cadeiras: uma sua, outra alugada para uma manicure parceira. Hoje, sábado, é o dia mais corrido da semana.\n\nVocê chega no salão às 7h30. Tem cinco clientes agendadas até as 13h e mais três no fim de semana. Abre a porta, varre o chão, organiza as tesouras, esteriliza os pentes, prepara o café. Sua primeira cliente é Dona Marina, 60 anos, que vem fazer escova e coloração toda quinzena. Você conhece o cabelo dela melhor do que ela própria. Conversam sobre os netos, sobre a igreja, sobre o tempo. Em 1h45 está pronta.\n\nDas 9h30 às 13h, mais quatro clientes. Cortes diversos: uma menina de 8 anos (a mãe explicou exatamente como queria, você executou), uma senhora que vai a um casamento à tarde (penteado preso), uma estudante universitária (corte curtinho moderno, primeira vez no salão, indicação de uma amiga), um homem (corte social rápido, R$ 35).\n\nÀs 13h você fecha por uma hora para almoçar. Pede um marmitex no boteco em frente, come sentada na cadeira. Atualiza a agenda no caderno. Confere quanto fez de manhã: R$ 480 brutos. Tirando produtos usados e a parte da manicure parceira, fica com cerca de R$ 380 só do sábado de manhã.\n\nDe tarde, mais três clientes. Termina às 18h. No mês, com a média de movimento, fatura entre R$ 8 mil e R$ 10 mil brutos. Tirando aluguel do espaço (R$ 800), conta de luz, materiais e impostos do MEI, sobra entre R$ 6 mil e R$ 7 mil líquidos. Mais do que muito amigo seu formado em faculdade ganha.\n\nVocê tem 22 anos, salão próprio, agenda cheia, mais de 3 mil seguidores no Instagram que viraram clientes. Está pensando em alugar uma sala maior no ano que vem para colocar uma terceira cadeira. Quer um dia ter uma rede pequena, com 3 ou 4 salões em bairros diferentes. Tem amigas que escolheram fazer faculdade. Você escolheu correr por fora. Os caminhos não competem — cada um construiu o que faz sentido para si. E o seu fez muito sentido.",
    ordem: 6,
    profissoes: [
      {
        nome: "Cabeleireiro(a)",
        descricao: "Atua em salões ou abre o próprio espaço; alta demanda em todo o estado.",
      },
      {
        nome: "Mecânico de Automóveis",
        descricao: "Trabalha em oficinas ou monta a própria; oficio em alta demanda no Piauí.",
      },
      {
        nome: "Confeiteiro(a) / Bolos sob encomenda",
        descricao: "Vende doces, bolos e salgados para festas e comércios locais.",
      },
      {
        nome: "Fotógrafo(a) de Eventos",
        descricao: "Fotografa casamentos, formaturas e festas em geral.",
      },
      {
        nome: "Social Media",
        descricao: "Gerencia redes sociais de empresas e pequenos negócios da região.",
      },
      {
        nome: "Costureiro(a) / Modista",
        descricao: "Confecciona, ajusta e cria peças sob medida para clientes próprios.",
      },
    ],
  },
];

async function main() {
  console.log("Iniciando seed do Légua...");

  // Admin inicial
  const adminEmail = process.env.ADMIN_INITIAL_EMAIL || "admin@legua.com.br";
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || "admin123";
  const senhaHash = await bcrypt.hash(adminPassword, 12);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      nome: "Administrador Légua",
      email: adminEmail,
      senhaHash,
      role: AdminRole.SUPER_ADMIN,
      ativo: true,
    },
  });
  console.log(`Admin inicial criado: ${adminEmail}`);

  // Trilhas e profissões
  for (const t of trilhas) {
    const trilha = await prisma.trilha.upsert({
      where: { slug: t.slug },
      update: {
        titulo: t.titulo,
        modalidade: t.modalidade,
        descricaoCurta: t.descricaoCurta,
        descricaoCompleta: t.descricaoCompleta,
        comoEntrar: t.comoEntrar,
        duracao: t.duracao,
        custoEstimado: t.custoEstimado,
        primeirosPassos: t.primeirosPassos,
        narrativaAluno: t.narrativaAluno,
        narrativaProfissional: t.narrativaProfissional,
        ordem: t.ordem,
        ativo: true,
      },
      create: {
        slug: t.slug,
        titulo: t.titulo,
        modalidade: t.modalidade,
        descricaoCurta: t.descricaoCurta,
        descricaoCompleta: t.descricaoCompleta,
        comoEntrar: t.comoEntrar,
        duracao: t.duracao,
        custoEstimado: t.custoEstimado,
        primeirosPassos: t.primeirosPassos,
        narrativaAluno: t.narrativaAluno,
        narrativaProfissional: t.narrativaProfissional,
        ordem: t.ordem,
      },
    });

    await prisma.profissao.deleteMany({ where: { trilhaId: trilha.id } });
    await prisma.profissao.createMany({
      data: t.profissoes.map((p) => ({
        nome: p.nome,
        descricao: p.descricao,
        trilhaId: trilha.id,
      })),
    });
    console.log(
      `Trilha "${t.titulo}" criada com ${t.profissoes.length} profissões.`,
    );
  }

  console.log("Seed concluído com sucesso.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
