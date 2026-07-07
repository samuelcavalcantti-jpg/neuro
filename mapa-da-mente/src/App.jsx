import React, { useState, useEffect, useRef, useMemo, createContext, useContext } from "react";
import { Brain, Zap, Sparkles, Play, Pause, RotateCcw, ChevronRight, ChevronLeft, X, Layers, Link2, Shuffle, Check, Trophy, Lock, Star, Map as MapIcon, Gamepad2, User, Award, GraduationCap, ArrowLeft, Heart, Volume2, Search, Flame, Repeat, HelpCircle, Network, SlidersHorizontal, ScrollText, Lightbulb, Dumbbell, Eye, Timer, MousePointerClick } from "lucide-react";

// narração (text-to-speech) — falha graciosamente se não houver suporte
function speak(text) {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR"; u.rate = 1;
    window.speechSynthesis.speak(u);
  } catch (e) {}
}
function stopSpeak() { try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {} }
function SpeakBtn({ text }) {
  return <button onClick={() => speak(text)} style={styles.speakBtn} title="Ouvir"><Volume2 size={15} /></button>;
}

// =========================================================================
//  DADOS
// =========================================================================

const REGIONS = {
  prefrontal: {
    name: "Córtex Pré-frontal", tag: "O CEO", role: "Razão e autocontrole",
    fn: "Planeja, decide, pensa nas consequências e FREIA os impulsos da emoção. É o adulto na sala que segura a amígdala quando ela quer surtar.",
    curiosidade: "É a última região a amadurecer — só fica 'pronta' por volta dos 25 anos. Por isso adolescentes agem mais por impulso: o freio ainda está em obra.",
    neuros: ["dopamina", "noradrenalina", "serotonina", "glutamato"], x: 105, y: 168, r: 20, lp: "below",
  },
  corpocaloso: {
    name: "Corpo Caloso", tag: "A ponte", role: "Liga os 2 lados",
    fn: "É o cabo grosso de fibras que conecta os hemisférios esquerdo e direito, deixando os dois lados do cérebro conversarem e trabalharem juntos.",
    curiosidade: "Tem cerca de 200 milhões de fibras nervosas. Em casos raros e graves de epilepsia, ele já foi cortado — e a pessoa passa a ter dois 'lados' quase independentes.",
    neuros: ["glutamato"], x: 210, y: 148, r: 13, lp: "above",
  },
  ganglios: {
    name: "Gânglios da Base", tag: "O hábito", role: "Automático e movimento",
    fn: "Transformam ações repetidas em hábitos automáticos (dirigir, andar, digitar) e ajudam a iniciar movimentos voluntários.",
    curiosidade: "É aqui que mora o 'piloto automático' dos hábitos. Quando você dirige sem pensar no caminho, são os gânglios da base rodando o programa.",
    neuros: ["dopamina", "glutamato"], x: 178, y: 198, r: 14, lp: "above",
  },
  talamo: {
    name: "Tálamo", tag: "A recepção", role: "Central dos sentidos",
    fn: "É a recepcionista do cérebro: quase tudo que você vê, ouve e sente passa por ele primeiro e é distribuído para a região certa processar.",
    curiosidade: "O único sentido que NÃO passa pelo tálamo é o olfato — o cheiro tem atalho direto para a emoção e a memória. Por isso um perfume traz lembranças tão fortes.",
    neuros: ["glutamato", "serotonina"], x: 262, y: 200, r: 15, lp: "above",
  },
  insula: {
    name: "Ínsula", tag: "O sensor interno", role: "Corpo, nojo e intuição",
    fn: "Lê os sinais do seu corpo (coração, estômago, dor) e transforma em sentimentos. Responsável pelo nojo, pela empatia e pela 'intuição'.",
    curiosidade: "É ela que dá aquele 'frio na barriga' e o famoso 'pressentimento'. Também acende quando você sente nojo — e quando vê alguém sentindo nojo.",
    neuros: ["serotonina", "glutamato"], x: 203, y: 240, r: 13, lp: "below",
  },
  accumbens: {
    name: "Núcleo Accumbens", tag: "A recompensa", role: "O 'quero mais'",
    fn: "Centro da recompensa. É aqui que a dopamina 'bate' e gera a vontade de buscar e repetir o que deu prazer ou deu certo.",
    curiosidade: "É o mesmo circuito ativado por comida boa, curtidas no celular e drogas. O vício acontece quando algo o estimula forte e rápido demais, viciando o 'querer'.",
    neuros: ["dopamina", "endorfina"], x: 158, y: 252, r: 15, lp: "below",
  },
  amigdala: {
    name: "Amígdala", tag: "O alarme", role: "Medo, raiva e ameaça",
    fn: "Detector de perigo. Dispara o medo e a raiva ANTES de você pensar, e aciona o corpo para reagir em milissegundos.",
    curiosidade: "Reage mais rápido que a consciência: você pula de um cano achando que é cobra antes de o cérebro confirmar. Na ansiedade, ela vive em alerta sem perigo real.",
    neuros: ["noradrenalina", "cortisol", "glutamato"], x: 250, y: 270, r: 15, lp: "below",
  },
  hipotalamo: {
    name: "Hipotálamo", tag: "O termostato", role: "Comanda os hormônios",
    fn: "Controla fome, sede, sono, temperatura e desejo. É a ponte entre cérebro e corpo: ordena a liberação de hormônios como cortisol, adrenalina e ocitocina.",
    curiosidade: "Tem o tamanho de uma amêndoa, mas comanda quase todos os hormônios do corpo. É ele que segura seu relógio biológico de 24h.",
    neuros: ["cortisol", "adrenalina", "ocitocina", "melatonina"], x: 220, y: 302, r: 14, lp: "below",
  },
  hipocampo: {
    name: "Hipocampo", tag: "O arquivo", role: "Memória e aprendizado",
    fn: "Grava novas experiências e dá contexto às emoções. Transforma o vivido em memória de longo prazo.",
    curiosidade: "O estresse crônico (cortisol alto demais) literalmente encolhe o hipocampo. Já o exercício faz ele crescer e criar novos neurônios.",
    neuros: ["acetilcolina", "glutamato"], x: 318, y: 256, r: 15, lp: "below",
  },
  occipital: {
    name: "Lobo Occipital", tag: "A tela", role: "Visão",
    fn: "Fica na nuca e é onde as imagens são montadas. Recebe o sinal dos olhos e transforma em tudo que você 'vê'.",
    curiosidade: "Você enxerga com o CÉREBRO, não com os olhos. Os olhos só captam luz; é o occipital que constrói a imagem — por isso existem ilusões de ótica.",
    neuros: ["glutamato"], x: 378, y: 188, r: 17, lp: "above",
  },
  tronco: {
    name: "Tronco Encefálico", tag: "Piloto automático", role: "Funções vitais",
    fn: "Respiração, batimento, pressão, reflexos — tudo que roda sem você controlar. Também é a fábrica de vários sinais químicos.",
    curiosidade: "É a parte mais antiga do cérebro, que dividimos com répteis. Mesmo em coma profundo, ele segue mantendo você vivo no automático.",
    neuros: ["serotonina", "noradrenalina"], x: 350, y: 360, r: 14, lp: "below",
  },
  cerebelo: {
    name: "Cerebelo", tag: "O equilibrista", role: "Coordenação",
    fn: "Equilíbrio, postura e movimentos finos e coordenados. É o que torna um gesto suave em vez de tremido, e o que aprende habilidades motoras.",
    curiosidade: "Tem só 10% do volume do cérebro, mas guarda mais da metade de TODOS os neurônios. Andar de bike 'sem pensar' é ele no automático.",
    neuros: ["glutamato"], x: 398, y: 318, r: 18, lp: "below",
  },
};

const NEUROS = {
  dopamina: { name: "Dopamina", type: "Neurotransmissor", color: "#ffb627",
    desc: "Motivação e recompensa. O 'vale a pena ir atrás'. Atenção: NÃO é o prazer em si — é a vontade de buscar, a antecipação.",
    alto: "Foco, energia e busca de objetivos. Em excesso (ou drogas), vira impulsividade e risco.",
    baixo: "Apatia, falta de motivação e dificuldade de concentração. Ligada ao Parkinson e ao TDAH.",
    curiosidade: "Ela dispara mais na ESPERA da recompensa do que na recompensa em si. Por isso rolar o feed vicia: a expectativa do próximo post é o gatilho.",
    boost: "Metas pequenas concluídas, exercício, luz do sol, proteína e reduzir estímulos rápidos demais." },
  serotonina: { name: "Serotonina", type: "Neurotransmissor", color: "#4ade80",
    desc: "Estabilidade do humor, saciedade e sono. A sensação de 'estou seguro, tudo sob controle'.",
    alto: "Humor estável, calma e bem-estar. É o alvo da maioria dos antidepressivos.",
    baixo: "Ligada à depressão, ansiedade, irritabilidade e compulsão por doces.",
    curiosidade: "Cerca de 90% da sua serotonina fica no INTESTINO. Por isso ele é o 'segundo cérebro' e o humor sofre com a digestão.",
    boost: "Luz solar pela manhã, exercício, gratidão e alimentos com triptofano (banana, ovo, castanhas)." },
  noradrenalina: { name: "Noradrenalina", type: "Ambos", color: "#fb923c",
    desc: "Alerta e foco. O 'acorda, presta atenção'. Te deixa ligado em risco ou concentração intensa.",
    alto: "Hiperfoco e prontidão. Em excesso vira ansiedade, agitação e insônia.",
    baixo: "Cansaço mental, desânimo e dificuldade de prestar atenção.",
    curiosidade: "É prima da adrenalina. A diferença: a adrenalina age no corpo (coração), a noradrenalina age mais no cérebro (foco).",
    boost: "Sono de qualidade, exercício moderado e desafios na medida certa." },
  cortisol: { name: "Cortisol", type: "Hormônio", color: "#ef4444",
    desc: "O hormônio do estresse. Libera energia para reagir. Sozinho não é vilão — depende da dose e da duração.",
    alto: "Crônico: ansiedade, insônia, gordura na barriga, imunidade baixa e memória prejudicada.",
    baixo: "Cansaço extremo, pressão baixa e dificuldade de lidar com estresse.",
    curiosidade: "Tem ritmo diário: sobe de manhã (pra te acordar) e cai à noite. Olhar o celular ao acordar pode disparar um pico cedo demais.",
    boost: "Para REDUZIR: respiração lenta, sono regular, natureza, exercício leve e menos cafeína à tarde." },
  adrenalina: { name: "Adrenalina", type: "Hormônio", color: "#f43f5e",
    desc: "A resposta imediata de luta ou fuga. Coração dispara, pupila dilata, músculos prontos — em segundos.",
    alto: "Aquela 'descarga': mãos suando, coração a mil. Útil no perigo, exaustivo se vira rotina.",
    baixo: "Resposta lenta a emergências e baixa energia sob pressão.",
    curiosidade: "É ela que dá força 'sobre-humana' em emergências. O cortisol entra depois pra sustentar o estado.",
    boost: "Liberada em sustos, montanha-russa, esportes radicais e exercício intenso." },
  gaba: { name: "GABA", type: "Neurotransmissor", color: "#38bdf8",
    desc: "O FREIO do cérebro. Acalma e reduz a excitação dos neurônios. Impede o cérebro de 'acelerar demais'.",
    alto: "Relaxamento e calma. Calmantes e álcool agem aumentando o efeito do GABA.",
    baixo: "Ansiedade, tensão, insônia e mente acelerada que não desliga.",
    curiosidade: "É o oposto exato do glutamato. O equilíbrio entre os dois (freio x acelerador) define se você está calmo ou agitado.",
    boost: "Meditação, ioga, respiração profunda, exercício e chá (a L-teanina ajuda)." },
  glutamato: { name: "Glutamato", type: "Neurotransmissor", color: "#a78bfa",
    desc: "O ACELERADOR. Principal sinal excitatório do cérebro, essencial para aprender, pensar e formar memórias.",
    alto: "Cérebro a mil e aprendizado ativo. Em excesso, pode sobrecarregar neurônios.",
    baixo: "Raciocínio lento e dificuldade de memória.",
    curiosidade: "É o neurotransmissor MAIS abundante do cérebro. Aprender algo novo é neurônios trocando glutamato e fortalecendo conexões.",
    boost: "Aprender coisas novas, desafios mentais e sono (que consolida o aprendizado)." },
  ocitocina: { name: "Ocitocina", type: "Hormônio", color: "#f472b6",
    desc: "Vínculo, confiança e afeto. O 'hormônio do amor e da conexão'. Aproxima você das pessoas.",
    alto: "Confiança, empatia e sensação de pertencer. Reduz o medo social.",
    baixo: "Sensação de solidão, desconexão e dificuldade de confiar.",
    curiosidade: "Liberada no parto e na amamentação, cria o vínculo mãe-bebê. Mas também sobe num abraço de 20 segundos ou ao acariciar um cachorro.",
    boost: "Abraços, toque afetivo, contato visual, tempo com quem ama e carinho em pets." },
  endorfina: { name: "Endorfina", type: "Neurotransmissor", color: "#2dd4bf",
    desc: "O analgésico natural do corpo. Alivia a dor e traz bem-estar — o famoso 'barato' do exercício.",
    alto: "Euforia leve e tolerância à dor. É o 'runner's high' depois de correr.",
    baixo: "Mais sensibilidade à dor e menos prazer em atividades físicas.",
    curiosidade: "O nome vem de 'endo' (interno) + 'morfina'. Ela se encaixa nos MESMOS receptores que a morfina — só que produzida por você.",
    boost: "Exercício, risada, comida apimentada, chocolate amargo e música que emociona." },
  acetilcolina: { name: "Acetilcolina", type: "Neurotransmissor", color: "#c084fc",
    desc: "Memória, aprendizado, atenção e controle dos músculos. A ponte entre nervos e movimento.",
    alto: "Memória afiada, foco e raciocínio rápido.",
    baixo: "Esquecimento e névoa mental. A queda é uma das marcas do Alzheimer.",
    curiosidade: "Foi o PRIMEIRO neurotransmissor descoberto (1921). É ela que faz seu músculo contrair quando você decide mexer o dedo.",
    boost: "Sono REM (sonhos), aprendizado e alimentos com colina (ovo, fígado, soja)." },
  melatonina: { name: "Melatonina", type: "Hormônio", color: "#818cf8",
    desc: "O hormônio do sono. Sobe quando escurece e avisa: 'é hora de desacelerar e dormir'.",
    alto: "Sonolência e sono profundo. Pico natural por volta das 2-4h da manhã.",
    baixo: "Insônia, sono leve e relógio biológico bagunçado.",
    curiosidade: "A luz AZUL das telas engana o cérebro fingindo ser dia e BLOQUEIA a melatonina. Por isso o celular na cama atrapalha o sono.",
    boost: "Escuro à noite, evitar telas antes de dormir e luz natural de dia." },
};

const CONNECTIONS = [
  ["prefrontal", "accumbens"], ["prefrontal", "amigdala"], ["corpocaloso", "prefrontal"],
  ["amigdala", "hipotalamo"], ["amigdala", "hipocampo"], ["insula", "amigdala"],
  ["ganglios", "talamo"], ["hipocampo", "talamo"], ["talamo", "occipital"],
  ["hipotalamo", "talamo"], ["talamo", "tronco"], ["tronco", "cerebelo"],
];

// perfil corporal de cada químico (0-100) — usado nos medidores dos cenários
const NEURO_BODY = {
  dopamina:      { heart: 50, alerta: 70, estresse: 30, calma: 45 },
  serotonina:    { heart: 35, alerta: 40, estresse: 15, calma: 85 },
  noradrenalina: { heart: 70, alerta: 92, estresse: 55, calma: 20 },
  cortisol:      { heart: 68, alerta: 72, estresse: 92, calma: 10 },
  adrenalina:    { heart: 96, alerta: 95, estresse: 80, calma: 6 },
  gaba:          { heart: 30, alerta: 25, estresse: 10, calma: 92 },
  glutamato:     { heart: 52, alerta: 78, estresse: 45, calma: 32 },
  ocitocina:     { heart: 42, alerta: 35, estresse: 14, calma: 82 },
  endorfina:     { heart: 46, alerta: 45, estresse: 14, calma: 78 },
  acetilcolina:  { heart: 45, alerta: 66, estresse: 28, calma: 52 },
  melatonina:    { heart: 28, alerta: 12, estresse: 8, calma: 96 },
};
const METERS = [
  { key: "heart", emoji: "❤️", label: "Coração", color: "#f43f5e" },
  { key: "alerta", emoji: "⚡", label: "Alerta", color: "#ffb627" },
  { key: "estresse", emoji: "😰", label: "Estresse", color: "#ef4444" },
  { key: "calma", emoji: "😌", label: "Calma", color: "#4ade80" },
];

const SCEN_CATS = {
  cotidiano: { label: "Cotidiano", emoji: "🌤️" },
  emocoes: { label: "Emoções", emoji: "❤️‍🔥" },
  recompensa: { label: "Recompensa & Vícios", emoji: "🎯" },
  vinculo: { label: "Vínculo & Social", emoji: "🤝" },
  corpo: { label: "Corpo & Saúde", emoji: "💪" },
  mente: { label: "Mente & Decisão", emoji: "🧩" },
};

const SCENARIOS = [
  { id: "luta", cat: "emocoes", title: "Cachorro bravo vindo na sua direção", emoji: "🐕", summary: "Luta ou fuga: a emoção acelera e a razão freia.", steps: [
    { region: "amigdala", neuro: "noradrenalina", text: "A amígdala dispara o alarme antes de você pensar: PERIGO! O foco trava no cachorro." },
    { region: "hipotalamo", neuro: "adrenalina", text: "O hipotálamo manda liberar adrenalina. Coração dispara, pupila dilata, corpo pronto pra correr." },
    { region: "hipotalamo", neuro: "cortisol", text: "Logo vem o cortisol, que sustenta o estresse e libera energia (açúcar no sangue)." },
    { region: "prefrontal", neuro: "serotonina", text: "O córtex avalia: 'calma, está preso na corrente'. A razão FREIA a amígdala e o corpo relaxa." } ] },
  { id: "recompensa", cat: "recompensa", title: "Você termina um projeto difícil", emoji: "🏆", summary: "O circuito da recompensa que te motiva a repetir.", steps: [
    { region: "accumbens", neuro: "dopamina", text: "O núcleo accumbens recebe dopamina: 'consegui, valeu a pena!'." },
    { region: "hipocampo", neuro: "acetilcolina", text: "O hipocampo grava: 'esse esforço deu certo' — pra você querer repetir." },
    { region: "accumbens", neuro: "endorfina", text: "Endorfina traz a sensação gostosa de dever cumprido." } ] },
  { id: "abraco", cat: "vinculo", title: "Um abraço de alguém querido", emoji: "🤗", summary: "O circuito do vínculo e da segurança.", steps: [
    { region: "hipotalamo", neuro: "ocitocina", text: "O hipotálamo libera ocitocina: confiança, afeto e conexão." },
    { region: "tronco", neuro: "serotonina", text: "A serotonina sobe, trazendo 'tudo sob controle, estou bem'." },
    { region: "prefrontal", neuro: "serotonina", text: "O córtex desliga o alerta. O cérebro entende: aqui é seguro." } ] },
  { id: "ansiedade", cat: "emocoes", title: "Ansiedade antes de uma apresentação", emoji: "😰", summary: "Quando o alarme dispara sem perigo real.", steps: [
    { region: "amigdala", neuro: "noradrenalina", text: "A amígdala trata a plateia como 'ameaça' e dispara — mesmo sem perigo real." },
    { region: "hipotalamo", neuro: "cortisol", text: "Cortisol e adrenalina: mãos suando, coração acelerado, frio na barriga." },
    { region: "prefrontal", neuro: "glutamato", text: "Os pensamentos disparam ('e se eu errar?'). O córtex tenta, mas a amígdala grita alto." },
    { region: "tronco", neuro: "gaba", text: "Respirar fundo e devagar ativa o GABA, o freio. A amígdala acalma e o córtex retoma o comando." } ] },
  { id: "sono", cat: "cotidiano", title: "Pegando no sono à noite", emoji: "😴", summary: "Como o cérebro desliga pra dormir.", steps: [
    { region: "hipotalamo", neuro: "melatonina", text: "Escureceu. O hipotálamo percebe e libera melatonina: 'hora de desacelerar'." },
    { region: "tronco", neuro: "serotonina", text: "A serotonina (que vira melatonina) acalma o corpo e baixa a temperatura." },
    { region: "prefrontal", neuro: "gaba", text: "O GABA aumenta e silencia os neurônios. A mente para de tagarelar." },
    { region: "hipocampo", neuro: "acetilcolina", text: "Dormindo, a acetilcolina ajuda o hipocampo a organizar as memórias do dia." } ] },
  { id: "foco", cat: "mente", title: "Estudando concentrado ('na zona')", emoji: "🎯", summary: "O estado de foco profundo.", steps: [
    { region: "prefrontal", neuro: "dopamina", text: "Um desafio interessante libera dopamina: 'isso importa, vamos nessa'. Surge a motivação." },
    { region: "prefrontal", neuro: "noradrenalina", text: "A noradrenalina afia a atenção. Você ignora distrações e entra no flow." },
    { region: "hipocampo", neuro: "glutamato", text: "O glutamato conecta os neurônios. É o aprendizado em tempo real." },
    { region: "accumbens", neuro: "dopamina", text: "Cada progresso libera mais dopamina, te dando combustível pra continuar." } ] },
  { id: "exercicio", cat: "corpo", title: "Terminando um treino puxado", emoji: "🏃", summary: "Por que o exercício melhora o humor.", steps: [
    { region: "hipotalamo", neuro: "adrenalina", text: "No esforço, adrenalina e cortisol sobem pra dar energia e bombear sangue." },
    { region: "accumbens", neuro: "endorfina", text: "O corpo libera endorfina pra mascarar o cansaço: chega o 'runner's high'." },
    { region: "tronco", neuro: "serotonina", text: "Serotonina e dopamina sobem depois, deixando o humor lá em cima por horas." },
    { region: "hipocampo", neuro: "glutamato", text: "Bônus: o exercício faz o hipocampo criar novos neurônios. Mais memória, menos ansiedade." } ] },
  { id: "celular", cat: "recompensa", title: "Rolando o feed sem parar", emoji: "📱", summary: "Como as redes 'sequestram' a recompensa.", steps: [
    { region: "accumbens", neuro: "dopamina", text: "Cada post é uma recompensa imprevisível. A dopamina dispara na EXPECTATIVA do próximo." },
    { region: "amigdala", neuro: "noradrenalina", text: "Notificações ativam um mini-alerta: 'algo novo!'. Difícil ignorar." },
    { region: "prefrontal", neuro: "dopamina", text: "O córtex sabe que devia parar, mas o accumbens grita 'mais um'. O freio é mais lento e perde." },
    { region: "accumbens", neuro: "dopamina", text: "Com estímulo rápido demais, o cérebro 'baixa o volume' da dopamina. Aí tudo o mais parece chato." } ] },
  { id: "paixao", cat: "vinculo", title: "Se apaixonando por alguém", emoji: "💘", summary: "A química da paixão (parece até vício).", steps: [
    { region: "accumbens", neuro: "dopamina", text: "Pensar na pessoa dispara dopamina: euforia, obsessão e vontade de estar perto." },
    { region: "amigdala", neuro: "noradrenalina", text: "A noradrenalina causa o coração acelerado e a insônia de quem ama." },
    { region: "prefrontal", neuro: "serotonina", text: "A serotonina CAI no início — por isso a pessoa vira pensamento fixo (parecido com TOC)." },
    { region: "hipotalamo", neuro: "ocitocina", text: "Com o tempo, a ocitocina assume e transforma paixão em vínculo duradouro." } ] },
  { id: "raiva", cat: "emocoes", title: "Uma discussão acalorada", emoji: "😤", summary: "O 'sequestro emocional' de que a gente se arrepende.", steps: [
    { region: "amigdala", neuro: "noradrenalina", text: "A amígdala interpreta a fala como ataque e explode em raiva num piscar de olhos." },
    { region: "hipotalamo", neuro: "adrenalina", text: "Adrenalina e cortisol disparam: rosto quente, voz alterada, modo combate." },
    { region: "prefrontal", neuro: "glutamato", text: "A emoção é tão forte que o córtex fica 'offline'. É o sequestro da amígdala — você fala o que não devia." },
    { region: "prefrontal", neuro: "serotonina", text: "Contar até 10 e respirar dá tempo do córtex voltar. Com o freio, você pensa antes de agir." } ] },
  { id: "nojo", cat: "corpo", title: "Sentindo nojo de comida estragada", emoji: "🤢", summary: "A ínsula te protegendo de veneno.", steps: [
    { region: "talamo", neuro: "glutamato", text: "O cheiro e a imagem chegam e são distribuídos pelo cérebro." },
    { region: "insula", neuro: "serotonina", text: "A ínsula dispara o NOJO: 'isso pode te fazer mal, não coma!'. Você faz careta automática." },
    { region: "amigdala", neuro: "noradrenalina", text: "A amígdala marca aquilo como 'ruim' pra você evitar no futuro." } ] },
  { id: "cafe", cat: "cotidiano", title: "Tomando café de manhã", emoji: "☕", summary: "Como a cafeína te 'acorda'.", steps: [
    { region: "hipotalamo", neuro: "cortisol", text: "De manhã o cortisol já sobe naturalmente pra te despertar." },
    { region: "talamo", neuro: "glutamato", text: "A cafeína bloqueia o sinal de 'cansaço' (adenosina), tirando o pé do freio do cérebro." },
    { region: "accumbens", neuro: "dopamina", text: "Sem o freio, a dopamina e a noradrenalina fluem mais: você sente foco e energia." } ] },
  { id: "musica", cat: "emocoes", title: "Música que te dá arrepio", emoji: "🎵", summary: "Por que uma música emociona tanto.", steps: [
    { region: "talamo", neuro: "glutamato", text: "O som chega pelos ouvidos e é distribuído pelo cérebro." },
    { region: "accumbens", neuro: "dopamina", text: "Na parte que você AMA (ou na expectativa dela), o accumbens libera dopamina: arrepio puro." },
    { region: "insula", neuro: "serotonina", text: "A ínsula conecta o som à emoção no corpo. Música triste pode até dar 'aperto no peito' gostoso." } ] },
  { id: "habito", cat: "mente", title: "Dirigindo no piloto automático", emoji: "🚗", summary: "Como o cérebro economiza energia com hábitos.", steps: [
    { region: "prefrontal", neuro: "dopamina", text: "Quando você APRENDEU a dirigir, o córtex trabalhava muito, prestando atenção em tudo." },
    { region: "ganglios", neuro: "dopamina", text: "Com a repetição, os gânglios da base assumem e viram um 'programa' automático." },
    { region: "cerebelo", neuro: "glutamato", text: "O cerebelo coordena os movimentos finos. Você dirige sem pensar e libera o córtex pra outras coisas." } ] },
  { id: "acordar", cat: "cotidiano", title: "Acordando de manhã", emoji: "🌅", summary: "A troca de turno entre sono e vigília.", steps: [
    { region: "hipotalamo", neuro: "melatonina", text: "A luz da manhã chega e o hipotálamo DESLIGA a melatonina: 'acabou a noite'." },
    { region: "hipotalamo", neuro: "cortisol", text: "Ele libera um pico de cortisol pra te dar energia e levantar da cama." },
    { region: "talamo", neuro: "glutamato", text: "O tálamo religa os sentidos no máximo e o cérebro volta ao modo desperto." } ] },
  { id: "comfort", cat: "recompensa", title: "Comendo doce quando está triste", emoji: "🍫", summary: "Por que buscamos açúcar pra aliviar.", steps: [
    { region: "accumbens", neuro: "dopamina", text: "O doce dispara dopamina rápida: um alívio imediato e gostoso." },
    { region: "tronco", neuro: "serotonina", text: "O açúcar ajuda a subir a serotonina por um tempo — é o 'conforto'." },
    { region: "prefrontal", neuro: "dopamina", text: "O cérebro grava: 'triste = doce resolve'. E vira um hábito de compensação." } ] },
  { id: "susto", cat: "emocoes", title: "Levando um susto", emoji: "😱", summary: "A reação mais rápida do cérebro.", steps: [
    { region: "talamo", neuro: "glutamato", text: "O som ou a imagem chega e dispara o atalho rápido direto pro alarme." },
    { region: "amigdala", neuro: "adrenalina", text: "A amígdala aciona o susto ANTES de você entender o que foi. Pulo, grito." },
    { region: "hipotalamo", neuro: "adrenalina", text: "Adrenalina explode: o coração dispara em menos de um segundo." },
    { region: "prefrontal", neuro: "serotonina", text: "O córtex avalia 'era só o gato' e desliga o alarme. Você ri, aliviado." } ] },
  { id: "tristeza", cat: "emocoes", title: "Um dia de tristeza", emoji: "😢", summary: "A química do humor lá embaixo.", steps: [
    { region: "prefrontal", neuro: "serotonina", text: "Serotonina e dopamina baixas: tudo parece sem graça e falta energia." },
    { region: "hipotalamo", neuro: "cortisol", text: "O cortisol pode subir, deixando o corpo pesado e a mente ruminando." },
    { region: "accumbens", neuro: "dopamina", text: "Pequenas ações (sol, caminhada, abraço) reativam dopamina e serotonina aos poucos." } ] },
  { id: "meditacao", cat: "cotidiano", title: "Meditando ou respirando fundo", emoji: "🧘", summary: "Como acionar o freio do corpo.", steps: [
    { region: "tronco", neuro: "gaba", text: "Respirar devagar ativa o nervo vago e o GABA, o freio do sistema nervoso." },
    { region: "amigdala", neuro: "gaba", text: "A amígdala desacelera: o alarme baixa o volume." },
    { region: "prefrontal", neuro: "serotonina", text: "O córtex ganha espaço. A clareza e a calma aumentam." } ] },
  { id: "elogio", cat: "vinculo", title: "Recebendo um elogio sincero", emoji: "🌟", summary: "Reconhecimento é recompensa social.", steps: [
    { region: "accumbens", neuro: "dopamina", text: "Reconhecimento dispara dopamina: dá vontade de repetir o que foi elogiado." },
    { region: "hipotalamo", neuro: "ocitocina", text: "A ocitocina reforça o vínculo com quem te elogiou." },
    { region: "prefrontal", neuro: "serotonina", text: "A serotonina (ligada a status e aceitação) sobe: você se sente valorizado." } ] },
  { id: "decisao", cat: "mente", title: "Decidindo sob pressão", emoji: "⏱️", summary: "Por que decidimos pior com pressa.", steps: [
    { region: "hipotalamo", neuro: "cortisol", text: "Sob pressão, o cortisol sobe e ESTREITA o pensamento — difícil ver opções." },
    { region: "amigdala", neuro: "noradrenalina", text: "A amígdala empurra pra reação rápida e automática (Sistema 1)." },
    { region: "prefrontal", neuro: "glutamato", text: "Se você respira e ganha tempo, o córtex reorganiza e pondera (Sistema 2)." } ] },
  { id: "procrastinacao", cat: "mente", title: "Adiando uma tarefa chata", emoji: "🛋️", summary: "A briga entre o fácil e o importante.", steps: [
    { region: "accumbens", neuro: "dopamina", text: "A tarefa chata dá pouca dopamina; o celular dá muita e na hora. O cérebro escolhe o fácil." },
    { region: "amigdala", neuro: "cortisol", text: "A tarefa vira uma leve 'ameaça' (tédio, medo de falhar) — e fugir dela alivia na hora." },
    { region: "prefrontal", neuro: "dopamina", text: "Começar por só 2 minutos gera um pingo de dopamina de progresso. Aí engata." } ] },
  { id: "alcool", cat: "corpo", title: "Tomando uma bebida alcoólica", emoji: "🍺", summary: "O que o álcool faz com o freio e o acelerador.", steps: [
    { region: "prefrontal", neuro: "gaba", text: "O álcool turbina o GABA (freio): relaxa, solta a língua, baixa a inibição." },
    { region: "talamo", neuro: "glutamato", text: "Ao mesmo tempo bloqueia o glutamato (acelerador): reflexo e memória ficam lentos." },
    { region: "accumbens", neuro: "dopamina", text: "Dá um pico de dopamina no começo — por isso parece animar." },
    { region: "tronco", neuro: "gaba", text: "Em excesso, o freio fica forte demais: fala enrolada, sono e perda de coordenação." } ] },
];

const CARDS = [
  { q: "Qual químico é a MOTIVAÇÃO e recompensa — a vontade de buscar?", a: "Dopamina", extra: "Não é o prazer em si, é a antecipação. Por isso o feed vicia." },
  { q: "Qual químico dá ESTABILIDADE de humor e a sensação de 'tudo sob controle'?", a: "Serotonina", extra: "90% dela fica no intestino. Em falta: depressão e ansiedade." },
  { q: "Qual é o hormônio do ESTRESSE?", a: "Cortisol", extra: "Útil em picos curtos; cronicamente alto, desgasta corpo e memória." },
  { q: "Qual hormônio é a resposta IMEDIATA de luta ou fuga?", a: "Adrenalina", extra: "Age em segundos; o cortisol vem depois pra sustentar." },
  { q: "Qual é o FREIO do cérebro, que acalma os neurônios?", a: "GABA", extra: "Calmantes e álcool aumentam o efeito dele." },
  { q: "Qual é o ACELERADOR do cérebro, essencial pra aprender?", a: "Glutamato", extra: "O mais abundante. É o oposto do GABA." },
  { q: "Qual hormônio cria VÍNCULO e confiança (abraços, parto)?", a: "Ocitocina", extra: "Sobe num abraço de 20 segundos ou ao acariciar um pet." },
  { q: "Qual é o ANALGÉSICO natural — o 'barato' do exercício?", a: "Endorfina", extra: "Encaixa nos mesmos receptores da morfina." },
  { q: "Qual químico cuida da MEMÓRIA e do controle muscular?", a: "Acetilcolina", extra: "Em falta, ligada ao Alzheimer. Foi o 1º descoberto." },
  { q: "Qual é o hormônio do SONO, que sobe quando escurece?", a: "Melatonina", extra: "A luz azul das telas bloqueia ela." },
  { q: "Qual químico dá ALERTA e FOCO?", a: "Noradrenalina", extra: "Prima da adrenalina, mas age mais no cérebro." },
  { q: "Qual região é o 'CEO': planeja, decide e FREIA os impulsos?", a: "Córtex pré-frontal", extra: "Só amadurece por volta dos 25 anos." },
  { q: "Qual região é o 'alarme' do medo e da raiva?", a: "Amígdala", extra: "Reage antes da consciência." },
  { q: "Qual região é o 'arquivo' da memória?", a: "Hipocampo", extra: "O estresse crônico encolhe ele." },
  { q: "Qual região é o 'termostato' que comanda os hormônios?", a: "Hipotálamo", extra: "Do tamanho de uma amêndoa, controla quase tudo." },
  { q: "Qual região é o centro da RECOMPENSA?", a: "Núcleo accumbens", extra: "Mesmo circuito de comida, curtidas e vícios." },
  { q: "Qual região cuida do EQUILÍBRIO e da coordenação?", a: "Cerebelo", extra: "10% do volume, mas mais da metade dos neurônios." },
  { q: "Qual região é o 'piloto automático' (respiração, batimento)?", a: "Tronco encefálico", extra: "A parte mais antiga, que dividimos com répteis." },
  { q: "Qual região é a 'recepção' por onde passam os sentidos?", a: "Tálamo", extra: "Só o olfato não passa por ele." },
  { q: "Qual região cria o NOJO e a intuição (frio na barriga)?", a: "Ínsula", extra: "Lê os sinais internos do corpo." },
  { q: "Qual região transforma ações repetidas em HÁBITOS automáticos?", a: "Gânglios da base", extra: "O 'piloto automático' de dirigir e digitar." },
  { q: "Onde as imagens são montadas (você 'vê' com o cérebro)?", a: "Lobo occipital", extra: "Fica na nuca. Por isso existem ilusões de ótica." },
  { q: "Qual a diferença entre neurotransmissor e hormônio?", a: "Velocidade e alcance", extra: "Neuro = rápido e local (WhatsApp). Hormônio = pelo sangue, corpo todo (e-mail)." },
  { q: "No 'sequestro da amígdala', o que fica offline?", a: "Córtex pré-frontal", extra: "Por isso, com raiva, falamos o que não devíamos." },
];

// ---- TRILHA: módulos e lições ----
const MODULES = [
  {
    "id": "m1",
    "title": "Fundamentos",
    "emoji": "🌱",
    "color": "#38bdf8",
    "lessons": [
      "l1",
      "l2",
      "l3",
      "l4"
    ]
  },
  {
    "id": "m2",
    "title": "Os Químicos",
    "emoji": "⚗️",
    "color": "#ffb627",
    "lessons": [
      "l5",
      "l6",
      "l7",
      "l8",
      "l9"
    ]
  },
  {
    "id": "m3",
    "title": "O Mapa do Cérebro",
    "emoji": "🧠",
    "color": "#a78bfa",
    "lessons": [
      "l10",
      "l11",
      "l12",
      "l13"
    ]
  },
  {
    "id": "m4",
    "title": "Tudo Conectado",
    "emoji": "🔗",
    "color": "#2dd4bf",
    "lessons": [
      "l14",
      "l15",
      "l16",
      "l17"
    ]
  },
  {
    "id": "m5",
    "title": "Casos Reais",
    "emoji": "🔬",
    "color": "#f472b6",
    "lessons": [
      "l18",
      "l19",
      "l20",
      "l21"
    ]
  },
  {
    "id": "m6",
    "title": "Aplicado à Vida",
    "emoji": "🎯",
    "color": "#4ade80",
    "lessons": [
      "l22",
      "l23",
      "l24"
    ]
  }
];

const LESSONS = {
  "l1": {
    "title": "A Orquestra de 86 Bilhões",
    "emoji": "🎼",
    "key": "Neurônios não pensam sozinhos — a mente emerge da rede de conexões.",
    "concept": "hipocampo",
    "check": {
      "q": "O que acontece na sinapse?",
      "opts": [
        "Neurônios se tocam diretamente",
        "Químicos são liberados no espaço entre neurônios",
        "Um pulso elétrico pula entre células"
      ],
      "correct": 1,
      "why": "Na sinapse, o sinal elétrico vira químico — é justamente aqui que antidepressivos e ansiolíticos agem."
    },
    "stages": [
      {
        "type": "hook",
        "content": "Agora mesmo, enquanto você lê isso, 86 bilhões de neurônios disparam em padrões que nunca existiram antes — e nunca se repetirão. Nenhum neurônio sozinho pensa. Mas juntos, eles criam memórias, emoções e tudo que você é. Como isso é possível?",
        "question": "O que faz um cérebro 'funcionar'?"
      },
      {
        "type": "conceito",
        "title": "Anatomia de um neurônio",
        "content": "Um neurônio é uma célula especializada em transmitir informação. Cada parte tem uma função específica:",
        "items": [
          {
            "emoji": "🌿",
            "label": "Dendritos",
            "text": "As antenas: recebem sinais de até 10 mil outros neurônios ao mesmo tempo."
          },
          {
            "emoji": "🔋",
            "label": "Corpo celular",
            "text": "Integra todos os sinais recebidos e decide: disparo ou silêncio?"
          },
          {
            "emoji": "📡",
            "label": "Axônio",
            "text": "A linha de transmissão: carrega o impulso elétrico a até 1 metro de distância."
          },
          {
            "emoji": "💊",
            "label": "Sinapse",
            "text": "O espaço entre neurônios — aqui o sinal elétrico vira mensagem química."
          }
        ]
      },
      {
        "type": "flow",
        "title": "O caminho do sinal",
        "steps": [
          {
            "icon": "👁️",
            "label": "Estímulo",
            "text": "Você vê, ouve ou sente algo no ambiente."
          },
          {
            "icon": "⚡",
            "label": "Impulso elétrico",
            "text": "O neurônio dispara um sinal que percorre o axônio."
          },
          {
            "icon": "💊",
            "label": "Sinapse",
            "text": "No terminal, libera neurotransmissores no espaço sináptico."
          },
          {
            "icon": "🔑",
            "label": "Receptor",
            "text": "O químico encaixa no receptor do próximo neurônio como chave-fechadura."
          },
          {
            "icon": "🌊",
            "label": "Resposta",
            "text": "O sinal se propaga em rede — criando pensamento, emoção ou ação."
          }
        ]
      },
      {
        "type": "quiz",
        "q": "O que acontece na sinapse?",
        "opts": [
          "Neurônios se tocam diretamente",
          "Químicos são liberados no espaço entre neurônios",
          "Um pulso elétrico pula entre células"
        ],
        "correct": 1,
        "why": "Na sinapse o sinal elétrico vira químico. É aqui que antidepressivos (ISRS) e ansiolíticos agem — aumentando ou reduzindo o que fica disponível nesse espaço."
      },
      {
        "type": "real",
        "title": "Por que isso importa pra você",
        "content": "Quando você aprende algo novo, neurônios que disparam juntos formam sinapses mais fortes. 'Memorizar' é literalmente remodelar conexões físicas. Cada repetição fortalece o circuito.",
        "aplicacao": "Isso explica por que praticar muda fisicamente o cérebro. Um músico tem mais conexões nas áreas motoras correspondentes aos seus dedos. Um taxista tem hipocampo maior. Você é o que repete."
      },
      {
        "type": "apply",
        "text": "Hoje: escolha algo que quer aprender e pratique 15 minutos. Enquanto você dorme esta noite, o hipocampo vai consolidar as conexões novas — dormir após aprender é parte do aprendizado."
      }
    ]
  },
  "l2": {
    "title": "A Sinapse — Onde a Magia Acontece",
    "emoji": "💊",
    "key": "Chave-fechadura: cada neurotransmissor só ativa o receptor certo.",
    "check": {
      "q": "O que é recaptação?",
      "opts": [
        "O receptor absorve o neurotransmissor",
        "O neurônio puxa de volta o neurotransmissor sobrante",
        "Um sinal elétrico reverso"
      ],
      "correct": 1,
      "why": "Antidepressivos ISRS bloqueiam a recaptação de serotonina — mais dela fica na sinapse por mais tempo."
    },
    "stages": [
      {
        "type": "hook",
        "content": "Por que uma xícara de café muda seu humor em minutos? Por que um abraço alivia a dor? A resposta está num espaço de 20 nanômetros entre dois neurônios. A sinapse não é só uma passagem — é onde toda a sua experiência interior é fabricada.",
        "question": "O que controla como você se sente neste momento?"
      },
      {
        "type": "conceito",
        "title": "Os 4 momentos da sinapse",
        "content": "A sinapse é uma conversa química ultra-precisa com quatro atos:",
        "items": [
          {
            "emoji": "🏭",
            "label": "Produção",
            "text": "O neurônio pré-sináptico produz e armazena neurotransmissores em vesículas."
          },
          {
            "emoji": "🌊",
            "label": "Liberação",
            "text": "O impulso elétrico abre as vesículas — os químicos são despejados na fenda sináptica."
          },
          {
            "emoji": "🔑",
            "label": "Recepção",
            "text": "Cada químico encaixa só no receptor certo do neurônio seguinte (especificidade total)."
          },
          {
            "emoji": "🧹",
            "label": "Recaptação",
            "text": "O neurônio 'aspira' o sobrante de volta — reutiliza ou destrói. É aqui que muitos remédios agem."
          }
        ]
      },
      {
        "type": "compare",
        "title": "Excitação × Inibição",
        "left": {
          "name": "Excitação",
          "color": "#fb7185",
          "emoji": "⚡",
          "items": [
            "Dispara o próximo neurônio",
            "Aumenta a atividade elétrica",
            "Exemplos: glutamato, noradrenalina",
            "Essencial pra aprender e agir"
          ]
        },
        "right": {
          "name": "Inibição",
          "color": "#38bdf8",
          "emoji": "🛑",
          "items": [
            "Silencia o próximo neurônio",
            "Reduz a atividade elétrica",
            "Exemplos: GABA, serotonina",
            "Essencial pra calma e sono"
          ]
        }
      },
      {
        "type": "quiz",
        "q": "Por que o café mantém você acordado?",
        "opts": [
          "Eleva a dopamina",
          "Bloqueia receptores de adenosina (sonolência) sem ativá-los",
          "Acelera o metabolismo cerebral"
        ],
        "correct": 1,
        "why": "A cafeína ocupa os receptores de adenosina — a molécula que sinaliza cansaço — sem ativá-los. Você fica acordado enquanto a 'canseira química' se acumula por baixo. Por isso o crash depois."
      },
      {
        "type": "real",
        "title": "Como remédios psiquiátricos agem",
        "content": "Quase todos agem na sinapse: antidepressivos ISRS bloqueiam a recaptação de serotonina (mais fica disponível), benzodiazepínicos turbinação o GABA (mais freio), Ritalina bloqueia a recaptação de dopamina e noradrenalina (mais foco).",
        "aplicacao": "Isso explica por que remédios demoram 2-4 semanas para fazer efeito: o cérebro precisa se adaptar ao novo nível do químico, não é instantâneo. E por que parar abruptamente pode causar abstinência."
      },
      {
        "type": "apply",
        "text": "Reflita: existe alguma substância que você usa (café, álcool, cigarro, açúcar) que age na sinapse? Agora que você sabe o mecanismo, como isso muda sua relação com ela?"
      }
    ]
  },
  "l3": {
    "title": "Neurotransmissor × Hormônio",
    "emoji": "📡",
    "key": "WhatsApp (rápido e local) vs. e-mail geral (lento e no corpo todo).",
    "check": {
      "q": "Qual mensageiro age em todo o corpo via corrente sanguínea?",
      "opts": [
        "Neurotransmissor",
        "Hormônio",
        "São iguais"
      ],
      "correct": 1,
      "why": "O hormônio viaja pelo sangue e age em vários órgãos — por isso uma emoção pode durar horas, mesmo depois que o 'perigo' passou."
    },
    "stages": [
      {
        "type": "hook",
        "content": "Você leva um susto. Em 0,2 segundos o coração dispara. Mas a sensação de nervoso pode durar uma hora depois. Como o mesmo 'sistema' pode agir em milissegundos e também em horas? São dois tipos de mensageiros diferentes trabalhando em paralelo.",
        "question": "Por que emoções são tão rápidas — e às vezes tão duradouras?"
      },
      {
        "type": "compare",
        "title": "Dois mensageiros, dois alcances",
        "left": {
          "name": "Neurotransmissor",
          "color": "#7dd3fc",
          "emoji": "⚡",
          "items": [
            "Age só na sinapse (nanômetros)",
            "Velocidade: milissegundos",
            "Ex: dopamina, GABA, glutamato",
            "Liberado por neurônios"
          ]
        },
        "right": {
          "name": "Hormônio",
          "color": "#f472b6",
          "emoji": "🩸",
          "items": [
            "Viaja pelo sangue (corpo todo)",
            "Velocidade: minutos a horas",
            "Ex: cortisol, insulina, ocitocina",
            "Liberado por glândulas"
          ]
        }
      },
      {
        "type": "conceito",
        "title": "Os mensageiros duplos",
        "content": "Alguns químicos são versáteis — agem nos dois sistemas dependendo de onde são liberados:",
        "items": [
          {
            "emoji": "🔥",
            "label": "Noradrenalina",
            "text": "Neurotransmissor no cérebro (foco e alerta); hormônio (adrenalina) nas glândulas suprarrenais."
          },
          {
            "emoji": "💞",
            "label": "Ocitocina",
            "text": "Neurotransmissor em redes de vínculo; hormônio durante o parto e amamentação."
          },
          {
            "emoji": "😊",
            "label": "Dopamina",
            "text": "Principalmente neurotransmissor, mas também afeta rins, coração e sistema imune via sangue."
          }
        ]
      },
      {
        "type": "quiz",
        "q": "Por que uma discussão pode deixar você agitado por horas?",
        "opts": [
          "O Sistema 1 não desliga",
          "Hormônios como cortisol circulam no sangue por tempo prolongado",
          "Neurônios continuam disparando indefinidamente"
        ],
        "correct": 1,
        "why": "O cortisol liberado durante o estresse circula no sangue por 1-3 horas. O 'perigo' passou, mas o hormônio ainda está lá — mantendo o alerta."
      },
      {
        "type": "real",
        "title": "O eixo do estresse (HPA)",
        "content": "Hipotálamo detecta ameaça → manda sinal à hipófise → hipófise ordena às suprarrenais → suprarrenais liberam cortisol. Esse é o eixo HPA — a cadeia de comando do estresse.",
        "aplicacao": "Respiração lenta (6 expiração, 4 inspiração) ativa o nervo vago que freia esse eixo. É o único controle voluntário direto que temos sobre o sistema hormonal de estresse."
      },
      {
        "type": "apply",
        "text": "Próxima vez que sentir estresse, observe: a ameaça sumiu mas o corpo ainda está ativado? Isso é cortisol no sangue. Dê 10 minutos antes de tomar qualquer decisão importante."
      }
    ]
  },
  "l4": {
    "title": "Seus 3 Cérebros em 1",
    "emoji": "🏛️",
    "key": "Instinto, emoção e razão disputam o controle — e emoção quase sempre chega primeiro.",
    "check": {
      "q": "Por que é difícil 'só usar a razão' numa situação emocional intensa?",
      "opts": [
        "O neocórtex é lento demais",
        "O sistema límbico é prioritário e age antes da razão",
        "Emoções não afetam o raciocínio"
      ],
      "correct": 1,
      "why": "O sistema límbico recebe sinais sensoriais antes do córtex. Quando a emoção é intensa, o córtex chega 'atrasado' — é o sequestro da amígdala."
    },
    "stages": [
      {
        "type": "hook",
        "content": "Paul MacLean nos anos 60 propôs: dentro do seu crânio há três cérebros empilhados — um que quer sobreviver, um que quer pertencer, um que quer planejar. Eles não concordam sempre. E a sequência de quem 'fala primeiro' muda tudo.",
        "question": "Quem está realmente comandando suas decisões agora?"
      },
      {
        "type": "conceito",
        "title": "Os 3 andares do cérebro",
        "content": "Modelo simplificado, mas poderoso para entender prioridades:",
        "items": [
          {
            "emoji": "🦎",
            "label": "Tronco encefálico (reptiliano)",
            "text": "Respiração, batimento cardíaco, reflexos. Liga ao nascer. Não pensa — só garante que você continue vivo."
          },
          {
            "emoji": "🐘",
            "label": "Sistema límbico (mamífero)",
            "text": "Emoções, memória, vínculo social, sobrevivência. Age antes do pensamento consciente."
          },
          {
            "emoji": "🧠",
            "label": "Neocórtex (humano)",
            "text": "Linguagem, raciocínio abstrato, planejamento, empatia avançada. Último a amadurecer (~25 anos)."
          }
        ]
      },
      {
        "type": "flow",
        "title": "A ordem de prioridade",
        "steps": [
          {
            "icon": "🦎",
            "label": "1º: Sobreviver",
            "text": "Qualquer ameaça física? Tronco e amígdala reagem ANTES de qualquer pensamento."
          },
          {
            "icon": "🐘",
            "label": "2º: Pertencer",
            "text": "Sem ameaça imediata? O límbico busca conexão, recompensa, e evita dor social."
          },
          {
            "icon": "🧠",
            "label": "3º: Pensar",
            "text": "Com segurança e vínculo garantidos, o neocórtex entra para planejar e criar."
          }
        ]
      },
      {
        "type": "quiz",
        "q": "Uma apresentação importante amanhã deixa você ansioso hoje. Qual sistema está dominando?",
        "opts": [
          "Neocórtex — está planejando",
          "Sistema límbico — está antecipando ameaça social",
          "Tronco — está regulando a respiração"
        ],
        "correct": 1,
        "why": "Ansiedade por apresentação é o sistema límbico interpretando 'julgamento social' como ameaça. O tronco acelera o coração e o neocórtex fica parcialmente 'sequestrado'."
      },
      {
        "type": "real",
        "title": "Na prática: design, vendas e persuasão",
        "content": "Se você quiser influenciar uma decisão: 1) Elimine o medo (tronco+amígdala), 2) Crie pertencimento (límbico), 3) Então apresente os dados (neocórtex). Fazer na ordem errada não funciona.",
        "aplicacao": "Marcas que criam FOMO ativam diretamente o límbico. Produtos que mostram especificações técnicas primeiro, sem criar segurança emocional, perdem para quem emociona antes de informar."
      },
      {
        "type": "apply",
        "text": "Observe uma decisão sua hoje e pergunte: qual dos 3 cérebros estava dirigindo? Nomear isso já cria distância entre o impulso e a ação."
      }
    ]
  },
  "l5": {
    "title": "Dopamina — O Motor da Busca",
    "emoji": "🔥",
    "key": "Dopamina é QUERER, não TER — dispara mais na expectativa que na recompensa.",
    "concept": "dopamina",
    "check": {
      "q": "Quando a dopamina dispara mais forte?",
      "opts": [
        "Só após a recompensa",
        "Na expectativa da recompensa",
        "Uniformemente o tempo todo"
      ],
      "correct": 1,
      "why": "A antecipação é o pico. Por isso o scroll é mais viciante que o conteúdo que você acha — a busca dispara mais que o encontrado."
    },
    "stages": [
      {
        "type": "hook",
        "content": "Por que você rola o feed mesmo sem esperar nada de bom? Por que checar e-mail compulsivamente mesmo vazio? Por que uma meta quase alcançada motiva mais que outra já conquistada? A dopamina responde tudo isso — e a resposta é contraintuitiva.",
        "question": "O que te faz QUERER as coisas — e por que nunca parece suficiente?"
      },
      {
        "type": "conceito",
        "title": "Dopamina: desejo, não prazer",
        "content": "O erro mais comum: confundir dopamina com 'hormônio do prazer'. Ela é o hormônio do QUERER — não do TER:",
        "items": [
          {
            "emoji": "🎯",
            "label": "Antecipação",
            "text": "Sobe quando você ESPERA uma recompensa — não quando a recebe."
          },
          {
            "emoji": "📉",
            "label": "Pós-recompensa",
            "text": "Cai imediatamente após receber. É a decepção pós-compra, pós-conquista."
          },
          {
            "emoji": "🎰",
            "label": "Recompensa variável",
            "text": "Imprevisível (às vezes sim, às vezes não) = pico MÁXIMO de dopamina."
          },
          {
            "emoji": "⚡",
            "label": "Motivação",
            "text": "Dopamina baixa = apatia. Alta = foco, iniciativa e energia para buscar."
          }
        ]
      },
      {
        "type": "real",
        "title": "O design do vício em tela",
        "content": "Apps e redes sociais foram projetados com o princípio de recompensa variável: você nunca sabe quando vai aparecer algo bom no feed. Isso gera dopamina maior que uma recompensa garantida.",
        "aplicacao": "É o mesmo mecanismo de uma slot machine: uma em cada X puxadas dá o prêmio. O cérebro aprende que 'vale continuar buscando' — e não para. Tristan Harris (ex-Google) chama isso de 'corrida armamentista pela atenção'."
      },
      {
        "type": "quiz",
        "q": "Por que completar uma tarefa difícil dá mais satisfação que uma fácil?",
        "opts": [
          "Tomou mais tempo",
          "O esforço eleva dopamina no processo E na conclusão",
          "Ativamos mais neurônios"
        ],
        "correct": 1,
        "why": "Tarefas desafiadoras mantêm dopamina elevada durante o processo (antecipação da conquista). Fáceis demais não sustentam o sistema — o cérebro para de se engajar."
      },
      {
        "type": "conceito",
        "title": "Dopamina saudável vs. dopamina de curto prazo",
        "content": "Nem toda dopamina é igual no impacto a longo prazo:",
        "items": [
          {
            "emoji": "✅",
            "label": "Dopamina saudável",
            "text": "Conquistas reais, aprendizado, exercício, criação, progressos com esforço."
          },
          {
            "emoji": "⚠️",
            "label": "Dopamina de curto prazo",
            "text": "Notificações, açúcar, scroll, likes — rápidas, sem esforço, dessensibilizam o sistema."
          },
          {
            "emoji": "😶",
            "label": "Dessensibilização",
            "text": "Estímulos rápidos demais 'cansam' os receptores — a vida normal passa a parecer monótona."
          }
        ]
      },
      {
        "type": "apply",
        "text": "Por 24h: quando sentir vontade de checar o celular sem motivo real, espere 2 minutos. Observe o desconforto passar. Isso é seu sistema dopaminérgico sendo recondicinado — cada pausa fortalece o córtex pré-frontal."
      }
    ]
  },
  "l6": {
    "title": "Serotonina — A Âncora do Humor",
    "emoji": "🌿",
    "key": "Serotonina = calma e contentamento. 90% mora no intestino — o segundo cérebro.",
    "concept": "serotonina",
    "check": {
      "q": "Onde fica a maior parte da serotonina do seu corpo?",
      "opts": [
        "Cérebro",
        "Coração",
        "Intestino"
      ],
      "correct": 2,
      "why": "~90% da serotonina está no intestino — por isso intestino saudável e humor estável são diretamente ligados."
    },
    "stages": [
      {
        "type": "hook",
        "content": "Às vezes você acorda sem motivo aparente se sentindo 'off'. Humor baixo, tudo mais pesado, menos paciência — sem causa clara. Isso tem correlato químico preciso. E a sua dieta, sua exposição ao sol e suas relações afetam isso diretamente.",
        "question": "O que regula o seu 'estado base' de humor?"
      },
      {
        "type": "conceito",
        "title": "O que a serotonina faz",
        "content": "Diferente da dopamina (que te faz querer mais), a serotonina é o hormônio do contentamento — do 'estou bem assim':",
        "items": [
          {
            "emoji": "😌",
            "label": "Estabilidade de humor",
            "text": "Reduz irritabilidade e dá a sensação de 'tudo sob controle'."
          },
          {
            "emoji": "😴",
            "label": "Precursora do sono",
            "text": "É a matéria-prima da melatonina — sem serotonina, o sono fica irregular."
          },
          {
            "emoji": "🍽️",
            "label": "Saciedade",
            "text": "Sinaliza ao cérebro que você comeu o suficiente."
          },
          {
            "emoji": "👑",
            "label": "Status social",
            "text": "Sobe quando você sente que é respeitado e reconhecido pelo grupo."
          }
        ]
      },
      {
        "type": "real",
        "title": "O intestino como segundo cérebro",
        "content": "Cerca de 90% da serotonina do corpo fica nas células enterocromafins do intestino. O nervo vago conecta intestino e cérebro em via dupla — por isso intestino inflamado frequentemente acompanha humor deprimido.",
        "aplicacao": "Alimentos fermentados (iogurte, kefir, kimchi), fibras prebióticas e variedade alimentar afetam diretamente a produção intestinal de serotonina. 'Gut feelings' têm base neuroquímica real."
      },
      {
        "type": "compare",
        "title": "Serotonina × Dopamina",
        "left": {
          "name": "Serotonina",
          "color": "#4ade80",
          "emoji": "🌿",
          "items": [
            "Contentamento: 'tenho o suficiente'",
            "Estabilidade — sem picos e quedas",
            "Vem de sol, exercício, conexão",
            "Baixa → depressão, irritabilidade"
          ]
        },
        "right": {
          "name": "Dopamina",
          "color": "#fb7185",
          "emoji": "🔥",
          "items": [
            "Desejo: 'quero mais'",
            "Picos intensos e quedas",
            "Vem de novidades e recompensas",
            "Baixa → apatia, desmotivação"
          ]
        }
      },
      {
        "type": "quiz",
        "q": "Por que tomar sol de manhã melhora o humor?",
        "opts": [
          "Vitamina D eleva dopamina",
          "Luz do dia ativa síntese de serotonina",
          "O calor relaxa os músculos"
        ],
        "correct": 1,
        "why": "A luz natural (especialmente matinal) estimula a síntese de serotonina. É por isso que depressão sazonal é muito mais comum em países com menos sol no inverno."
      },
      {
        "type": "apply",
        "text": "Experimento desta semana: 10 minutos de sol de manhã (antes das 10h), sem óculos escuros — luz nos olhos ativa o sinal. Anote seu humor nos 3 dias seguintes comparado com dias sem sol."
      }
    ]
  },
  "l7": {
    "title": "Cortisol e Adrenalina — O Sistema 911",
    "emoji": "🚨",
    "key": "Adrenalina age em segundos; cortisol sustenta. O problema é quando não desligam.",
    "concept": "cortisol",
    "check": {
      "q": "Qual é o problema do cortisol cronicamente elevado?",
      "opts": [
        "Sempre prejudica",
        "Prejudica só o sono",
        "Atinge sono, memória, imunidade e pode encolher o hipocampo"
      ],
      "correct": 2,
      "why": "Cortisol crônico é um dos maiores danos ao cérebro — especialmente o hipocampo, que pode encolher com exposição prolongada."
    },
    "stages": [
      {
        "type": "hook",
        "content": "Um freio de carro de repente. Em 0,2 segundos: coração disparado, músculos tensos, visão focada, força extra. Seu corpo virou uma máquina de sobrevivência. Como o cérebro faz isso tão rápido? E por que às vezes parece que nunca desliga?",
        "question": "O que acontece no seu corpo sob ameaça — e por que o estresse crônico é tão destrutivo?"
      },
      {
        "type": "flow",
        "title": "O sistema 911 em ação",
        "steps": [
          {
            "icon": "👁️",
            "label": "Ameaça percebida",
            "text": "Amígdala detecta perigo (real ou imaginado) e dispara alarme."
          },
          {
            "icon": "⚡",
            "label": "Adrenalina (segundos)",
            "text": "Suprarrenais liberam adrenalina: coração dispara, pupilas dilatam, força aumenta."
          },
          {
            "icon": "📈",
            "label": "Cortisol (minutos)",
            "text": "Cortisol sustenta o alerta, libera glicose e suprime funções não essenciais (digestão, reprodução)."
          },
          {
            "icon": "✅",
            "label": "Resposta",
            "text": "Você luta, foge ou paralisa — o mais antigo dos sistemas de defesa."
          },
          {
            "icon": "😮‍💨",
            "label": "Recuperação",
            "text": "Com segurança, cortisol deveria cair. Se não cai — começa o problema."
          }
        ]
      },
      {
        "type": "conceito",
        "title": "Agudo × Crônico: a diferença fatal",
        "content": "O cortisol é essencial em doses certas. O problema é a exposição prolongada:",
        "items": [
          {
            "emoji": "✅",
            "label": "Cortisol agudo (horas)",
            "text": "Energia, foco, resposta rápida à ameaça. Salva vidas."
          },
          {
            "emoji": "⚠️",
            "label": "Cortisol crônico (semanas)",
            "text": "Insônia, memória ruim, imunidade baixa, ganho de peso abdominal."
          },
          {
            "emoji": "❌",
            "label": "Cortisol crônico (meses/anos)",
            "text": "Hipocampo literalmente encolhe. Ansiedade estrutural. Burnout."
          }
        ]
      },
      {
        "type": "quiz",
        "q": "Por que uma crítica no trabalho ativa o mesmo sistema que um predador?",
        "opts": [
          "Erro evolutivo",
          "A amígdala não distingue ameaça social de física — o cortisol responde igual",
          "Hormônios são imprecisos"
        ],
        "correct": 1,
        "why": "A amígdala evoluiu para reagir a qualquer ameaça. Uma crítica pública ou e-mail agressivo ativa o mesmo eixo HPA que um predador. O cortisol não sabe distinguir."
      },
      {
        "type": "real",
        "title": "Respiração como freio fisiológico",
        "content": "Respiração diafragmática lenta (4s inspiração, 6s expiração) ativa o nervo vago, que freia o sistema nervoso simpático e começa a reduzir cortisol em cerca de 90 segundos.",
        "aplicacao": "Não é relaxamento — é fisiologia. O nervo vago conecta pulmão ao tronco encefálico. Respirar devagar manda o sinal: 'não há perigo imediato'. É o único controle voluntário direto que temos sobre o sistema de estresse."
      },
      {
        "type": "apply",
        "text": "Experimente agora: 4 segundos inspirando, 6 expirando, por 2 minutos. Compare tensão antes e depois. Se funcionar, você encontrou uma ferramenta que pode usar em qualquer situação de estresse."
      }
    ]
  },
  "l8": {
    "title": "GABA × Glutamato — Freio e Acelerador",
    "emoji": "⚖️",
    "key": "Glutamato acelera; GABA freia. Equilíbrio = saúde. Desequilíbrio = ansiedade ou letargia.",
    "concept": "gaba",
    "check": {
      "q": "O que GABA faz no cérebro?",
      "opts": [
        "Acelera os neurônios",
        "Inibe e acalma a atividade neural",
        "Produz dopamina"
      ],
      "correct": 1,
      "why": "GABA é o principal neurotransmissor inibitório — o freio de mão do cérebro. GABA baixo é um dos mecanismos da ansiedade e insônia."
    },
    "stages": [
      {
        "type": "hook",
        "content": "Às vezes a mente acelera à noite e não para. Outras vezes trava e você não consegue começar nada. Dois neurotransmissores controlam esse ritmo — e quando saem de equilíbrio, é quando surgem ansiedade, insônia e letargia.",
        "question": "O que controla a velocidade do seu cérebro?"
      },
      {
        "type": "compare",
        "title": "O par mais importante do cérebro",
        "left": {
          "name": "Glutamato",
          "color": "#fb7185",
          "emoji": "⚡",
          "items": [
            "Principal acelerador neural",
            "Excita e ativa neurônios",
            "Essencial para aprender",
            "Excesso → ansiedade, convulsão"
          ]
        },
        "right": {
          "name": "GABA",
          "color": "#38bdf8",
          "emoji": "🛑",
          "items": [
            "Principal freio neural",
            "Inibe e acalma neurônios",
            "Essencial para calma e sono",
            "Baixo → ansiedade, insônia"
          ]
        }
      },
      {
        "type": "conceito",
        "title": "O que acontece no desequilíbrio",
        "content": "O problema não é ter um ou outro — é a proporção:",
        "items": [
          {
            "emoji": "😰",
            "label": "Muito glutamato / Pouco GABA",
            "text": "Mente acelerada, ansiedade, pensamentos em loop, dificuldade de dormir."
          },
          {
            "emoji": "😴",
            "label": "Muito GABA / Pouco glutamato",
            "text": "Letargia, pensamento lento, sedação. Efeito de álcool e benzodiazepínicos."
          },
          {
            "emoji": "⚖️",
            "label": "Equilíbrio",
            "text": "Foco calmo, presença, capacidade de aprender e criar sem ansiedade."
          }
        ]
      },
      {
        "type": "quiz",
        "q": "Por que álcool parece 'soltar' na hora e causar letargia depois?",
        "opts": [
          "Bloqueia o glutamato apenas",
          "Turbina o GABA (freio) e bloqueia o glutamato (acelerador) ao mesmo tempo",
          "Eleva a serotonina"
        ],
        "correct": 1,
        "why": "O álcool age nos dois: aumenta GABA (sedação, desinibição) e bloqueia glutamato (lentidão de reflexo e memória). O 'soltar' é GABA. O 'apagar' é falta de glutamato."
      },
      {
        "type": "real",
        "title": "Ansiedade como falha do GABA",
        "content": "Transtornos de ansiedade frequentemente envolvem sistema GABAérgico hipoativo. Benzodiazepínicos (Rivotril, Lexotan) agem potencializando receptores GABA — por isso sedatam e acalmam rapidamente.",
        "aplicacao": "Práticas que naturalmente elevam GABA: meditação regular, exercício aeróbico, respiração lenta, magnésio. Não substituem tratamento, mas têm mecanismo neural real — não são placebo."
      },
      {
        "type": "apply",
        "text": "Teste o freio agora: 5 respirações lentas (6 segundos de expiração). A expiração longa ativa o GABA via nervo vago parassimpático. É o único freio que você pode acionar voluntariamente."
      }
    ]
  },
  "l9": {
    "title": "Ocitocina, Endorfina e Melatonina",
    "emoji": "💞",
    "key": "Ocitocina conecta, endorfina alivia, melatonina sincroniza o relógio.",
    "concept": "ocitocina",
    "check": {
      "q": "Por que telas à noite atrapalham o sono?",
      "opts": [
        "Cansam os olhos",
        "Luz azul suprime melatonina enganando o hipotálamo",
        "O conteúdo estimula demais"
      ],
      "correct": 1,
      "why": "A luz azul de telas tem comprimento de onda idêntico à luz do meio-dia — o hipotálamo lê como 'ainda é dia' e suprime a melatonina."
    },
    "stages": [
      {
        "type": "hook",
        "content": "Por que um abraço de 20 segundos muda seu estado interno? Por que o 'barato' após o exercício é real e não imaginação? Por que usar celular à noite destrói o sono mesmo que você não se sinta acordado? Três químicos respondem tudo isso.",
        "question": "O que conecta vínculo, dor e sono?"
      },
      {
        "type": "conceito",
        "title": "Ocitocina — o hormônio do vínculo",
        "content": "Erroneamente chamada de 'hormônio do amor' (é mais seletiva que isso):",
        "items": [
          {
            "emoji": "🤝",
            "label": "Vínculo seletivo",
            "text": "Reforça laços com quem você JÁ confia. Com estranhos pode aumentar desconfiança."
          },
          {
            "emoji": "🤱",
            "label": "Parto e amamentação",
            "text": "Pico máximo no nascimento — forma o vínculo mãe-filho com força extrema."
          },
          {
            "emoji": "🐶",
            "label": "Pets também",
            "text": "Acariciar um animal por 15 minutos eleva ocitocina — no humano E no animal."
          },
          {
            "emoji": "🛡️",
            "label": "Antiestresse",
            "text": "Reduz cortisol — mecanismo pelo qual apoio social protege contra estresse."
          }
        ]
      },
      {
        "type": "conceito",
        "title": "Endorfina e Melatonina",
        "content": "Dois outros químicos que mudam sua vida diária:",
        "items": [
          {
            "emoji": "🏃",
            "label": "Endorfina — o analgésico natural",
            "text": "Liberada em esforço físico, gargalhadas e toque. Age nos mesmos receptores da morfina (endo+morfina = endorfina). É o 'barato' do exercício — real, não imaginação."
          },
          {
            "emoji": "🌙",
            "label": "Melatonina — o sinal do escuro",
            "text": "Não é o 'hormônio do sono' — é o sinal de escuridão. Sobe na ausência de luz e avisa ao corpo: hora de dormir. A luz azul de telas mimetiza a luz do meio-dia."
          }
        ]
      },
      {
        "type": "quiz",
        "q": "Por que rir alivia a dor?",
        "opts": [
          "Distração mental",
          "Gargalhada genuína libera endorfina",
          "O corpo relaxa com o riso"
        ],
        "correct": 1,
        "why": "A gargalhada é um dos maiores liberadores naturais de endorfina. Terapia do humor tem base neuroquímica — não é apenas psicológico."
      },
      {
        "type": "real",
        "title": "O protocolo do abraço",
        "content": "Um abraço precisa de pelo menos 20 segundos para liberar ocitocina de forma mensurável. Abraços rápidos são protocolo social — abraços longos são neuroquímica.",
        "aplicacao": "Pesquisa de Carnegie Mellon: pessoas que recebem mais abraços têm sistema imunológico mais forte e são menos suscetíveis a resfriados — mediado pela redução de cortisol via ocitocina."
      },
      {
        "type": "apply",
        "text": "Esta semana: abrace alguém por 20 segundos completos. E considere: o celular fica longe 1h antes de dormir? A melatonina precisa desse sinal para preparar o sono."
      }
    ]
  },
  "l10": {
    "title": "Córtex Pré-frontal — O CEO",
    "emoji": "👔",
    "key": "O pré-frontal planeja, decide e freia impulsos — e é o primeiro a falhar sob estresse.",
    "concept": "prefrontal",
    "check": {
      "q": "Por que decisões ruins aumentam quando você está cansado?",
      "opts": [
        "Você fica menos inteligente",
        "O pré-frontal perde eficiência primeiro sob fadiga",
        "Os hormônios ficam mais lentos"
      ],
      "correct": 1,
      "why": "O pré-frontal é o mais sensível à fadiga e ao cortisol. Cansado ou estressado, você é literalmente menos capaz de resistir a impulsos."
    },
    "stages": [
      {
        "type": "hook",
        "content": "Você sabe que não deveria comer aquilo às 23h — e come. Sabe que deveria começar o projeto — e procrastina. Sabe que vai se arrepender de responder na raiva — e responde. Por que o que você sabe e o que você faz são tão diferentes?",
        "question": "Por que é tão difícil fazer o que você sabe que é certo?"
      },
      {
        "type": "conceito",
        "title": "O que o pré-frontal faz",
        "content": "O córtex pré-frontal (CPF) é a região que mais nos diferencia de outros animais:",
        "items": [
          {
            "emoji": "🗓️",
            "label": "Planejamento",
            "text": "Projeta consequências futuras — pensa no 'eu' de amanhã, não só de agora."
          },
          {
            "emoji": "🛑",
            "label": "Inibição de impulsos",
            "text": "Freia reações automáticas do sistema límbico. O freio da razão sobre a emoção."
          },
          {
            "emoji": "⚖️",
            "label": "Tomada de decisão",
            "text": "Integra informação emocional e racional para decidir — não separa os dois."
          },
          {
            "emoji": "🪞",
            "label": "Metacognição",
            "text": "Pensa sobre o próprio pensamento — base da consciência de si."
          },
          {
            "emoji": "👥",
            "label": "Empatia avançada",
            "text": "Simula o estado mental do outro — base da empatia cognitiva (não só emocional)."
          }
        ]
      },
      {
        "type": "flow",
        "title": "O pré-frontal e o impulso",
        "steps": [
          {
            "icon": "💥",
            "label": "Estímulo emocional",
            "text": "Algo provoca uma reação do sistema límbico (medo, raiva, desejo)."
          },
          {
            "icon": "🔥",
            "label": "Amígdala (0,2s)",
            "text": "Impulso de agir imediatamente — antes de qualquer pensamento."
          },
          {
            "icon": "⏱️",
            "label": "Pré-frontal (0,5s)",
            "text": "Chega com a pergunta: 'Devo fazer isso? Qual é a consequência?'"
          },
          {
            "icon": "⚡",
            "label": "Resultado",
            "text": "Com recursos: pré-frontal modera. Com estresse, cansaço ou álcool: o límbico vence."
          }
        ]
      },
      {
        "type": "quiz",
        "q": "Por que álcool piora as decisões mesmo quando você 'ainda está no controle'?",
        "opts": [
          "O álcool desliga a consciência",
          "O pré-frontal é seletivamente afetado antes de outras funções",
          "A memória falha"
        ],
        "correct": 1,
        "why": "O pré-frontal é seletivamente inibido pelo álcool antes de funções motoras básicas. Você ainda fala e anda — mas a inibição de impulsos já falhou."
      },
      {
        "type": "real",
        "title": "Fadiga de decisão",
        "content": "Steve Jobs usava a mesma roupa. Obama tomava grandes decisões de manhã. Não é filosofia — é gestão de recursos cognitivos. O pré-frontal tem energia limitada por dia.",
        "aplicacao": "Decisões triviais (o que vestir, o que comer) gastam o mesmo recurso que decisões importantes. Automatizar escolhas rotineiras preserva pré-frontal para o que realmente importa."
      },
      {
        "type": "apply",
        "text": "Identifique 2 decisões triviais que você toma todo dia. Como poderia automatizá-las? Cada uma eliminada libera pré-frontal para o que realmente importa na sua vida."
      }
    ]
  },
  "l11": {
    "title": "Amígdala e Hipocampo — Alarme e Arquivo",
    "emoji": "🔔",
    "key": "Amígdala dispara antes do pensamento; hipocampo arquiva com intensidade emocional.",
    "concept": "amigdala",
    "check": {
      "q": "Por que memórias emocionais são tão vívidas?",
      "opts": [
        "Acontecem devagar",
        "A amígdala carimba memórias intensas com cortisol",
        "O hipocampo grava tudo em dobro"
      ],
      "correct": 1,
      "why": "A amígdala adiciona uma 'tag de importância' às memórias — quanto mais intensa a emoção, mais forte e duradoura a memória."
    },
    "stages": [
      {
        "type": "hook",
        "content": "Você se lembra exatamente onde estava em momentos de impacto emocional forte. Mas não sabe o que comeu no almoço há 3 dias. Por que emoção 'grava' tão melhor? E por que às vezes esse sistema nos prega peças?",
        "question": "O que decide o que o cérebro guarda para sempre?"
      },
      {
        "type": "conceito",
        "title": "A amígdala: o alarme sempre ligado",
        "content": "Duas estruturas em forma de amêndoa (amygdala em latim), uma em cada hemisfério:",
        "items": [
          {
            "emoji": "🚨",
            "label": "Detector de ameaças",
            "text": "Escaneia continuamente o ambiente por sinais de perigo — 24 horas, mesmo durante o sono."
          },
          {
            "emoji": "⚡",
            "label": "Velocidade extrema",
            "text": "Reage em 0,1-0,2 segundos — antes da sua percepção consciente."
          },
          {
            "emoji": "🎭",
            "label": "Emoções intensas",
            "text": "Medo, raiva, nojo, mas também excitação e prazer extremo."
          },
          {
            "emoji": "🔖",
            "label": "Tagger de memória",
            "text": "Adiciona intensidade emocional: 'isso foi importante, não esqueça'."
          }
        ]
      },
      {
        "type": "conceito",
        "title": "O hipocampo: o arquivo com contexto",
        "content": "Do grego 'cavalo-marinho' (pela forma), é central para memória:",
        "items": [
          {
            "emoji": "📚",
            "label": "Memória episódica",
            "text": "Grava 'quando e onde' — dá contexto temporal e espacial aos eventos."
          },
          {
            "emoji": "🗺️",
            "label": "Navegação espacial",
            "text": "Cria mapas mentais. Taxistas de Londres têm hipocampo literalmente maior."
          },
          {
            "emoji": "🌱",
            "label": "Neurogênese",
            "text": "Uma das poucas regiões que cria novos neurônios em adultos — exercício e aprendizado estimulam."
          },
          {
            "emoji": "😟",
            "label": "Vulnerável ao cortisol",
            "text": "Estresse crônico encolhe o hipocampo — por isso estresse prolongado piora memória."
          }
        ]
      },
      {
        "type": "quiz",
        "q": "Você cheira um perfume e imediatamente lembra de alguém da infância. Por quê o olfato evoca memórias mais intensas?",
        "opts": [
          "O olfato é o sentido mais preciso",
          "O cheiro vai direto ao sistema límbico sem passar pelo tálamo",
          "Cheiros são processados mais devagar"
        ],
        "correct": 1,
        "why": "O olfato é o único sentido com conexão direta à amígdala e ao hipocampo — sem passar pelo tálamo. Por isso cheiros evocam memórias emocionalmente poderosas de forma quase involuntária."
      },
      {
        "type": "real",
        "title": "O atalho e a análise do medo",
        "content": "Joseph LeDoux descobriu dois caminhos para o medo: o atalho (tálamo → amígdala, 0,2s) e o caminho longo (tálamo → córtex → amígdala, 0,5s). O atalho salva vidas — mas também faz você pular com um galho que parece cobra.",
        "aplicacao": "Fobias, gatilhos de trauma e preconceitos automáticos operam pelo atalho. Terapias de exposição e EMDR trabalham para reconectar a memória ao córtex — dar contexto racional ao gatilho emocional."
      },
      {
        "type": "apply",
        "text": "Próxima reação emocional forte e repentina: pergunte 'que memória a amígdala acessou agora?'. Nomear o processo já ativa o pré-frontal e reduz parcialmente a reatividade da amígdala."
      }
    ]
  },
  "l12": {
    "title": "Hipotálamo, Tálamo e Tronco Encefálico",
    "emoji": "🎛️",
    "key": "Tálamo = central dos sentidos; hipotálamo = maestro hormonal; tronco = sobrevivência automática.",
    "concept": "hipotalamo",
    "check": {
      "q": "O que o hipotálamo controla?",
      "opts": [
        "Apenas o sono",
        "Fome, sede, temperatura, sono e liberação hormonal",
        "Apenas hormônios sexuais"
      ],
      "correct": 1,
      "why": "O hipotálamo é o termostato do corpo — regula tudo que mantém o equilíbrio interno (homeostase)."
    },
    "stages": [
      {
        "type": "hook",
        "content": "Você não pensa 'preciso respirar agora'. Não agenda 'hora de sentir fome'. Não programa 'temperatura corporal = 36,8ºC'. Tudo isso acontece automaticamente, gerenciado por estruturas que nunca descansam — e raramente recebem crédito.",
        "question": "Quem cuida do seu corpo enquanto você não está prestando atenção?"
      },
      {
        "type": "conceito",
        "title": "O tronco encefálico — base da vida",
        "content": "A estrutura mais antiga evolutivamente — presente em todos os vertebrados:",
        "items": [
          {
            "emoji": "💨",
            "label": "Respiração automática",
            "text": "Ritmo respiratório sem esforço consciente. Dano aqui = morte imediata."
          },
          {
            "emoji": "❤️",
            "label": "Batimento cardíaco",
            "text": "Regula FC em resposta ao esforço, estresse e repouso."
          },
          {
            "emoji": "😴",
            "label": "Ciclos vigília-sono",
            "text": "Controla quando você adormece e acorda via ritmo circadiano."
          },
          {
            "emoji": "🤢",
            "label": "Reflexos de proteção",
            "text": "Vômito, tosse, espirro — defesas automáticas sem precisar pensar."
          }
        ]
      },
      {
        "type": "compare",
        "title": "Tálamo × Hipotálamo",
        "left": {
          "name": "Tálamo",
          "color": "#a78bfa",
          "emoji": "📡",
          "items": [
            "Central de distribuição sensorial",
            "Todo sentido passa por aqui (exceto olfato)",
            "Filtra e direciona ao córtex correto",
            "'Gargalo' da percepção consciente"
          ]
        },
        "right": {
          "name": "Hipotálamo",
          "color": "#ffce6b",
          "emoji": "🎛️",
          "items": [
            "Maestro hormonal (só 4 gramas!)",
            "Comanda fome, sede, temperatura, libido",
            "Controla o eixo HPA (estresse)",
            "Liga ao sistema nervoso autônomo"
          ]
        }
      },
      {
        "type": "quiz",
        "q": "Por que cheiros evocam memórias mais fortes que sons ou imagens?",
        "opts": [
          "O olfato é o sentido mais poderoso",
          "Cheiro vai direto ao sistema límbico sem passar pelo tálamo",
          "Cheiros são processados mais devagar"
        ],
        "correct": 1,
        "why": "O olfato é o único sentido que bypassa o tálamo — vai direto à amígdala e ao hipocampo. Por isso um perfume pode trazer de volta uma memória de infância de forma avassaladora."
      },
      {
        "type": "real",
        "title": "O eixo HPA e o burnout",
        "content": "Hipotálamo detecta ameaça → ordena à hipófise → hipófise ordena às suprarrenais → cortisol é liberado. Esse eixo HPA é a cadeia de comando do estresse. Quando cronicamente ativado, fica 'viciado' no estado de alerta.",
        "aplicacao": "É a base fisiológica do burnout: o eixo HPA fica tão sensível após meses de estresse que dispara com estímulos mínimos. Tratamento envolve recuperação desse eixo — não só 'descanso'."
      },
      {
        "type": "apply",
        "text": "Liste 3 funções que seu corpo faz agora sem que você peça (respiração, batimento, temperatura). Tudo isso é o tronco e o hipotálamo. Depois de saber isso, como você trata o seu sono e o seu estresse?"
      }
    ]
  },
  "l13": {
    "title": "Ínsula, Gânglios, Cerebelo e Occipital",
    "emoji": "🧩",
    "key": "Ínsula lê o corpo; gânglios criam hábitos; cerebelo coordena; occipital constrói imagens.",
    "concept": "insula",
    "check": {
      "q": "Qual região transforma repetição em hábito automático?",
      "opts": [
        "Ínsula",
        "Gânglios da base",
        "Cerebelo"
      ],
      "correct": 1,
      "why": "Os gânglios da base 'comprimem' comportamentos repetidos em rotinas automáticas — o piloto automático dos hábitos."
    },
    "stages": [
      {
        "type": "hook",
        "content": "Você sente 'frio na barriga' antes de uma decisão difícil. Dirige para casa em piloto automático. Sente nojo ao ver algo repulsivo. Enxerga uma cena inteira com uma lanterna no escuro — e o cérebro 'pinta' o que não está iluminado. Quem faz tudo isso?",
        "question": "Quais são as regiões esquecidas que moldam tudo?"
      },
      {
        "type": "conceito",
        "title": "Ínsula — o intérprete do corpo",
        "content": "Escondida dentro do sulco lateral, a ínsula processa a experiência interna do corpo:",
        "items": [
          {
            "emoji": "🤢",
            "label": "Nojo",
            "text": "Emoção mais fortemente ligada à ínsula — evoluiu para proteger de venenos e doenças."
          },
          {
            "emoji": "💙",
            "label": "Empatia somática",
            "text": "Simula no SEU corpo o que outros sentem — base da empatia visceral."
          },
          {
            "emoji": "🎯",
            "label": "Interoepção",
            "text": "Frio na barriga, coração acelerado, aperto no peito — a ínsula interpreta sinais internos."
          },
          {
            "emoji": "🌶️",
            "label": "Craving",
            "text": "A fissura de vícios ativa fortemente a ínsula — por isso mindfulness ajuda em tratamentos."
          }
        ]
      },
      {
        "type": "conceito",
        "title": "Gânglios, Cerebelo e Occipital",
        "content": "Três regiões essenciais frequentemente esquecidas:",
        "items": [
          {
            "emoji": "🔄",
            "label": "Gânglios da Base",
            "text": "Convertem comportamentos repetidos em hábitos automáticos. Sede do Parkinson (dopamina nos gânglios) e do TOC."
          },
          {
            "emoji": "🎯",
            "label": "Cerebelo",
            "text": "Coordenação motora fina e equilíbrio. Pesquisas recentes ligam ao timing cognitivo e aprendizado."
          },
          {
            "emoji": "👁️",
            "label": "Córtex Occipital",
            "text": "Você enxerga com o CÉREBRO, não com os olhos. O occipital reconstrói a realidade visual — e pode 'ver' coisas que não existem (ilusões, sonhos)."
          }
        ]
      },
      {
        "type": "quiz",
        "q": "O que é interoepção?",
        "opts": [
          "Percepção do ambiente externo",
          "Leitura dos sinais internos do corpo pela ínsula",
          "Coordenação motora"
        ],
        "correct": 1,
        "why": "Interoepção é 'sentir o corpo por dentro'. Pessoas com melhor interoepção tomam decisões mais intuitivas e corretas — a 'intuição' tem base na leitura precisa dos sinais corporais."
      },
      {
        "type": "real",
        "title": "O loop do hábito (gânglios da base)",
        "content": "Os gânglios gravam comportamentos repetidos como loops automáticos: gatilho → rotina → recompensa. Isso é eficiência neural — o cérebro automatiza o que repete para liberar o pré-frontal para o novo.",
        "aplicacao": "Hábitos nos gânglios da base NUNCA são apagados — apenas suprimidos por novos loops mais fortes. É por isso que situações de estresse reativam velhos hábitos: o circuito original ainda está gravado."
      },
      {
        "type": "apply",
        "text": "Escolha um hábito que quer criar. Defina agora: Gatilho (quando/onde exatamente?), Rotina (o quê?), Recompensa (o quê imediatamente depois?). A especificidade do gatilho acelera a gravação nos gânglios."
      }
    ]
  },
  "l14": {
    "title": "O Sequestro da Amígdala",
    "emoji": "⚡",
    "key": "Emoção intensa 'desliga' o pré-frontal. Respirar religa o freio — é fisiologia, não força de vontade.",
    "check": {
      "q": "O que é o sequestro da amígdala?",
      "opts": [
        "A amígdala cresce",
        "Emoção intensa bloqueia o córtex pré-frontal",
        "A memória é apagada temporariamente"
      ],
      "correct": 1,
      "why": "Daniel Goleman: quando a amígdala dispara no máximo, o pré-frontal fica offline — você age por impulso e se arrepende depois."
    },
    "stages": [
      {
        "type": "hook",
        "content": "Você respondeu um e-mail no calor da raiva e se arrependeu 10 minutos depois. Disse algo numa briga que nunca diria 'no controle'. Congelou num momento que precisava agir. Isso tem nome — e uma explicação neural precisa com uma janela de intervenção.",
        "question": "Por que às vezes perdemos completamente o controle — e o que fazer nos 6 segundos antes?"
      },
      {
        "type": "flow",
        "title": "O sequestro em câmera lenta",
        "steps": [
          {
            "icon": "💥",
            "label": "Gatilho intenso",
            "text": "Emoção muito forte (raiva, humilhação, medo) ativa a amígdala no máximo."
          },
          {
            "icon": "🌊",
            "label": "Flood emocional",
            "text": "Cortisol e adrenalina inundam o sistema — corpo em modo emergência total."
          },
          {
            "icon": "📵",
            "label": "Pré-frontal offline",
            "text": "O córtex pré-frontal perde recursos — menos ativo nos exames de imagem."
          },
          {
            "icon": "🤯",
            "label": "Agir sem pensar",
            "text": "Você faz ou fala o que o impulso manda — sem acesso à razão ou consequências."
          },
          {
            "icon": "😟",
            "label": "Arrependimento",
            "text": "20-30 minutos depois, o cortisol cai, o pré-frontal volta e você avalia o dano."
          }
        ]
      },
      {
        "type": "conceito",
        "title": "Por que existe — e a janela de 6 segundos",
        "content": "O sequestro não é falha — é design evolutivo. E há uma janela:",
        "items": [
          {
            "emoji": "🦁",
            "label": "Útil no savana",
            "text": "Frente a predador, pensar demais seria fatal. Agir pelo instinto salvou vidas."
          },
          {
            "emoji": "💼",
            "label": "Problema no escritório",
            "text": "O mesmo sistema dispara com e-mail difícil, crítica pública, deadline impossível."
          },
          {
            "emoji": "⏱️",
            "label": "A janela de 6 segundos",
            "text": "Há ~6 segundos entre o estímulo e o sequestro completo. É a janela de intervenção."
          },
          {
            "emoji": "⏳",
            "label": "Após o sequestro",
            "text": "Tentativa de resolver conflito durante o pico é inútil — espere 20-30 min o cortisol cair."
          }
        ]
      },
      {
        "type": "quiz",
        "q": "Você está com raiva intensa de alguém. Qual estratégia funciona DURANTE o sequestro?",
        "opts": [
          "Tentar se explicar racionalmente",
          "Afastar-se e deixar o cortisol cair (20-30 min)",
          "Pedir desculpas imediatamente"
        ],
        "correct": 1,
        "why": "Durante o sequestro, o pré-frontal está offline. Resolver conflito no pico é inútil — nenhum dos lados tem acesso pleno à razão. Esperar o cortisol cair não é fraqueza: é neurociência."
      },
      {
        "type": "real",
        "title": "Intervenções que funcionam nos 6 segundos",
        "content": "Antes do sequestro ser completo, três coisas realmente funcionam: nomear a emoção ('estou com raiva' — ativa pré-frontal), respiração 4-6s (GABA via nervo vago), dar um passo físico para trás (quebra o loop).",
        "aplicacao": "Matthew Lieberman (UCLA): nomear uma emoção reduz atividade da amígdala em exames de fMRI. Não é filosofia — é neurofisiologia mensurável."
      },
      {
        "type": "apply",
        "text": "Crie seu protocolo de 6 segundos AGORA — antes de precisar. Qual das 3 estratégias funciona pra você? Escreva em algum lugar visível. Quando sequestrado, você não vai lembrar sem ter praticado antes."
      }
    ]
  },
  "l15": {
    "title": "Como Hábitos São Formados (e Mudados)",
    "emoji": "🔄",
    "key": "Loop: gatilho → rotina → recompensa. Hábitos nunca apagam — só sobrescrevem.",
    "check": {
      "q": "Por que é tão difícil eliminar um hábito ruim?",
      "opts": [
        "O cérebro o apaga com tempo",
        "Os gânglios gravam o loop permanentemente — só é substituído por outro",
        "Requer força de vontade pura"
      ],
      "correct": 1,
      "why": "Hábitos gravados nos gânglios nunca são apagados — apenas suprimidos. Por isso velhos hábitos ressurgem em situações de estresse."
    },
    "stages": [
      {
        "type": "hook",
        "content": "Você acorda e o ritual da manhã acontece quase sem pensar. Chega em casa e automaticamente abre a geladeira. Comportamentos automáticos representam ~40% das ações diárias. Mas o que cria esse piloto automático — e como reprogramá-lo?",
        "question": "O que distingue uma ação deliberada de um hábito automático?"
      },
      {
        "type": "flow",
        "title": "O loop do hábito (Duhigg + neurociência)",
        "steps": [
          {
            "icon": "🎯",
            "label": "Gatilho",
            "text": "O sinal que ativa o loop: hora, lugar, emoção, pessoa ou ação anterior."
          },
          {
            "icon": "🔄",
            "label": "Rotina",
            "text": "O comportamento automático que os gânglios da base executam sem esforço."
          },
          {
            "icon": "🎁",
            "label": "Recompensa",
            "text": "O benefício que reforça o loop: prazer, alívio, pertencimento, identidade."
          },
          {
            "icon": "🔥",
            "label": "Craving (anseio)",
            "text": "Com repetição, o cérebro antecipa a recompensa ao ver o gatilho — cria o desejo antes da ação."
          }
        ]
      },
      {
        "type": "conceito",
        "title": "Por que hábitos nunca são apagados",
        "content": "A descoberta mais importante sobre mudança de comportamento:",
        "items": [
          {
            "emoji": "💾",
            "label": "Gravação permanente",
            "text": "Os gânglios da base gravam o loop em circuito físico — mesmo após anos sem usar."
          },
          {
            "emoji": "🔁",
            "label": "Reativação",
            "text": "Estresse, ambiente familiar ou gatilhos antigos reativam hábitos que pareciam extintos."
          },
          {
            "emoji": "🔄",
            "label": "Substituição é a solução",
            "text": "Não eliminar — mas substituir a ROTINA mantendo o mesmo gatilho e recompensa."
          }
        ]
      },
      {
        "type": "quiz",
        "q": "Você quer parar de checar o celular compulsivamente. Qual abordagem tem mais chance de funcionar?",
        "opts": [
          "Proibir-se completamente",
          "Identificar o gatilho (tédio?) e substituir por outra rotina que satisfaça a mesma necessidade",
          "Esconder o celular"
        ],
        "correct": 1,
        "why": "A rotina é a parte maleável. O gatilho (tédio, estresse) e a recompensa (estímulo, alívio) costumam ser necessidades reais. Mudar só a rotina que as satisfaz é mais duradouro."
      },
      {
        "type": "real",
        "title": "Implementação intencional (Gollwitzer)",
        "content": "Pesquisa: declarações 'se-então' aumentam adesão a novos hábitos em 2-3x: 'SE for 7h da manhã E estiver na cozinha, ENTÃO vou beber um copo de água antes do café'.",
        "aplicacao": "Especificidade do gatilho é tão importante quanto a intenção. 'Vou me exercitar mais' falha porque o cérebro não sabe quando ativar o loop. 'Às 7h de segunda, quinta e sábado, calço o tênis' funciona."
      },
      {
        "type": "apply",
        "text": "Complete agora: 'Quando [gatilho específico: hora + lugar], farei [nova rotina], para obter [recompensa real].' Escreva e coloque onde vai ver no momento do gatilho."
      }
    ]
  },
  "l16": {
    "title": "Sono — A Faxina Noturna do Cérebro",
    "emoji": "🌙",
    "key": "Sono não é inatividade — é consolidação de memória, limpeza de toxinas e regeneração. Privá-lo é devastador.",
    "check": {
      "q": "O que o hipocampo faz durante o sono profundo?",
      "opts": [
        "Fica inativo",
        "Transfere memórias do dia para o córtex como memória de longo prazo",
        "Produz melatonina"
      ],
      "correct": 1,
      "why": "Consolidação da memória dependente do sono: o hipocampo 'repassa' os eventos do dia e os transfere para o córtex como memória de longo prazo."
    },
    "stages": [
      {
        "type": "hook",
        "content": "Você passa 1/3 da vida dormindo. Nenhum animal deixou de evoluir o sono — mesmo sendo vulnerável durante ele. Isso prova que o custo de não dormir é maior que o risco de ser atacado. O que acontece de tão essencial que não pode esperar?",
        "question": "O que o cérebro faz que só consegue fazer enquanto você dorme?"
      },
      {
        "type": "flow",
        "title": "Os estágios do sono",
        "steps": [
          {
            "icon": "😴",
            "label": "N1 (leve, 5-10 min)",
            "text": "Transição vigília→sono. Você ainda acorda facilmente com qualquer estímulo."
          },
          {
            "icon": "💤",
            "label": "N2 (moderado, ~50%)",
            "text": "Maior parte do sono. Memória procedimental consolidada aqui."
          },
          {
            "icon": "🔵",
            "label": "N3 (profundo, restaurador)",
            "text": "Restauração física e imunológica. Sistema glinfático limpa toxinas — incluindo beta-amiloide."
          },
          {
            "icon": "🎭",
            "label": "REM (sonhos)",
            "text": "Processamento emocional e consolidação da memória declarativa. Criatividade e conexões."
          },
          {
            "icon": "🔄",
            "label": "Ciclo de ~90 min",
            "text": "4-6 ciclos por noite. Cortar sono reduz desproporcionalmente o REM (final dos ciclos)."
          }
        ]
      },
      {
        "type": "conceito",
        "title": "O sistema glinfático — a faxina",
        "content": "Matthew Walker (Por Que Dormimos): uma descoberta que muda tudo:",
        "items": [
          {
            "emoji": "🧹",
            "label": "Sistema glinfático",
            "text": "No sono profundo, o LCR varre o espaço entre neurônios removendo resíduos metabólicos."
          },
          {
            "emoji": "☠️",
            "label": "Beta-amiloide",
            "text": "Proteína removida durante o sono — que se acumula em demência quando o sono é cronicamente ruim."
          },
          {
            "emoji": "📈",
            "label": "Uma noite ruim",
            "text": "Uma noite de sono reduzido → 30% mais acúmulo de beta-amiloide no dia seguinte."
          }
        ]
      },
      {
        "type": "quiz",
        "q": "Por que estudar, dormir e revisar na manhã seguinte é mais eficiente que estudar muito de uma vez?",
        "opts": [
          "O descanso evita confusão",
          "Dormir consolida e o sono é parte ativa do aprendizado",
          "Acordado a memória apaga mais rápido"
        ],
        "correct": 1,
        "why": "'Memória dependente do sono': o hipocampo consolida durante o sono o que você aprendeu. Revisar depois de dormir acessa a memória já consolidada no córtex."
      },
      {
        "type": "real",
        "title": "O custo real da privação",
        "content": "Uma semana com 6h de sono vs 8h: reflexo equivalente a alcoolemia de 0,08%, risco de pré-diabetes começa, sistema imune cai 70%, aprendizado cai 40%, hormônios de fome desregulam.",
        "aplicacao": "A privação é cumulativa e NÃO é recuperável 'dormindo no final de semana'. A dívida prejudica desempenho cognitivo mesmo sem você perceber que está comprometido."
      },
      {
        "type": "apply",
        "text": "Esta semana: durma e acorde no MESMO horário todos os dias (incluindo sábado e domingo). Consistência do horário é mais importante que quantidade de horas para regular o relógio circadiano."
      }
    ]
  },
  "l17": {
    "title": "Exercício e Neuroplasticidade",
    "emoji": "🏃",
    "key": "Exercício é a maior intervenção conhecida para o cérebro: cria neurônios, protege e turbina a cognição.",
    "check": {
      "q": "O que o BDNF faz?",
      "opts": [
        "Eleva o cortisol",
        "Estimula criação de novos neurônios e sinapses",
        "Regula o sono"
      ],
      "correct": 1,
      "why": "BDNF (Fator Neurotrófico Derivado do Cérebro) é chamado de 'MiracleGro do cérebro'. O exercício é o maior produtor natural de BDNF."
    },
    "stages": [
      {
        "type": "hook",
        "content": "John Ratey chama o exercício de 'o melhor remédio que existe para o cérebro'. Pesquisas mostram que 20 minutos de cardio moderado têm efeito comparável a uma dose de Ritalina em foco e atenção. O que está acontecendo?",
        "question": "Por que mover o corpo muda a mente?"
      },
      {
        "type": "conceito",
        "title": "O que o exercício faz no cérebro",
        "content": "Múltiplos mecanismos simultâneos:",
        "items": [
          {
            "emoji": "🌱",
            "label": "BDNF",
            "text": "'MiracleGro do cérebro': cria novos neurônios no hipocampo e fortalece sinapses existentes."
          },
          {
            "emoji": "😊",
            "label": "Neurotransmissores",
            "text": "Eleva dopamina, serotonina e noradrenalina simultaneamente — mais eficiente que muitos antidepressivos."
          },
          {
            "emoji": "📉",
            "label": "Cortisol",
            "text": "Pico DURANTE o exercício, queda ABAIXO do basal depois. Treino cria resiliência ao estresse."
          },
          {
            "emoji": "🧠",
            "label": "Volume cerebral",
            "text": "Exercício regular aumenta volume do hipocampo em 2% ao ano — contrabalança o encolhimento natural."
          }
        ]
      },
      {
        "type": "conceito",
        "title": "Neuroplasticidade — o cérebro que muda",
        "content": "O cérebro adulto pode mudar estruturalmente. Isso é neuroplasticidade:",
        "items": [
          {
            "emoji": "🔗",
            "label": "Sinapses novas",
            "text": "Aprendizado cria novas conexões. Uso fortalece, desuso enfraquece ('use it or lose it')."
          },
          {
            "emoji": "🌿",
            "label": "Neurogênese",
            "text": "Novos neurônios nascem no hipocampo em adultos — mais em exercício e ambiente enriquecido."
          },
          {
            "emoji": "🗺️",
            "label": "Remapeamento",
            "text": "Regiões podem assumir novas funções após lesão ou aprendizado intenso (plasticidade compensatória)."
          }
        ]
      },
      {
        "type": "quiz",
        "q": "Por que estudar imediatamente após exercício potencializa o aprendizado?",
        "opts": [
          "O cansaço aumenta a concentração",
          "BDNF cria receptores de plasticidade que ficam ativos por ~2h pós-treino",
          "A dopamina substitui a cafeína"
        ],
        "correct": 1,
        "why": "O pico de BDNF após exercício prepara o hipocampo para aprender. É a janela ideal de aprendizado — a escola de Naperville aplicou isso e chegou ao topo mundial em ciências."
      },
      {
        "type": "real",
        "title": "A escola de Naperville",
        "content": "Em Naperville, Illinois, alunos corriam antes das aulas mais difíceis. Resultado: ficaram em 1º lugar mundial em ciências e 6º em matemática. A escola mais 'problemática' virou referência — com custo zero extra.",
        "aplicacao": "A conclusão é direta: exercício antes de aprender maximiza absorção. Não precisa de academia — 20 minutos de caminhada rápida antes de estudar já ativa o BDNF."
      },
      {
        "type": "apply",
        "text": "Por 5 dias: 20 minutos de caminhada rápida antes de trabalhar ou estudar. Compare seu foco e produção com dias sem exercício. Você vai notar diferença nos primeiros 3 dias."
      }
    ]
  },
  "l18": {
    "title": "Vício — O Loop da Dopamina Sequestrado",
    "emoji": "🎰",
    "key": "Vício é o sistema de recompensa fisicamente alterado — não fraqueza moral.",
    "concept": "dopamina",
    "check": {
      "q": "Por que é difícil parar um vício mesmo querendo?",
      "opts": [
        "Fraqueza de caráter",
        "O sistema de recompensa é fisicamente alterado — receptores mudam",
        "A memória é bloqueada"
      ],
      "correct": 1,
      "why": "Vício cria mudanças físicas nos receptores de dopamina. É uma doença do sistema de recompensa, não fraqueza — e isso muda como deve ser tratado."
    },
    "stages": [
      {
        "type": "hook",
        "content": "Uma pessoa que luta com vício pode ter perdido família, emprego e saúde — e continua usando. Isso não é falta de força de vontade. É um cérebro fisicamente alterado em suas estruturas mais fundamentais de recompensa. O que a neurociência mostra?",
        "question": "O que a ciência mudou na nossa compreensão do vício?"
      },
      {
        "type": "flow",
        "title": "Como o vício se instala no cérebro",
        "steps": [
          {
            "icon": "🎯",
            "label": "1ª exposição",
            "text": "Substância ou comportamento dispara dopamina muito acima do natural."
          },
          {
            "icon": "📉",
            "label": "Dessensibilização",
            "text": "O cérebro reduz receptores para se adaptar ao excesso. A mesma dose gera menos prazer."
          },
          {
            "icon": "⬆️",
            "label": "Tolerância",
            "text": "Precisa de mais para sentir o mesmo. O craving (desejo) aumenta em vez de diminuir."
          },
          {
            "icon": "💔",
            "label": "Abstinência",
            "text": "Sem a substância, o sistema de recompensa fica abaixo do normal — nada parece prazeroso."
          },
          {
            "icon": "🔄",
            "label": "Compulsão",
            "text": "O loop continua mesmo sem prazer — busca sem satisfação possível."
          }
        ]
      },
      {
        "type": "conceito",
        "title": "O que muda fisicamente no cérebro",
        "content": "Pesquisas de Nora Volkow (NIDA) com exames de imagem:",
        "items": [
          {
            "emoji": "📉",
            "label": "Receptores D2 reduzidos",
            "text": "Menos receptores de dopamina → menos sensibilidade a qualquer prazer (anedonia)."
          },
          {
            "emoji": "🔥",
            "label": "Amígdala hiperativa",
            "text": "Estresse e abstinência ficam amplificados — o mínimo gatilho dispara craving intenso."
          },
          {
            "emoji": "📵",
            "label": "Pré-frontal enfraquecido",
            "text": "Controle de impulsos comprometido — exatamente o que precisaria para resistir."
          },
          {
            "emoji": "💾",
            "label": "Memória de craving",
            "text": "Gatilhos (lugares, pessoas, objetos) ativam o craving décadas depois — o circuito fica gravado."
          }
        ]
      },
      {
        "type": "quiz",
        "q": "Por que 'só mais uma vez' nunca funciona para quem tem vício instalado?",
        "opts": [
          "A pessoa não quer realmente parar",
          "Cada exposição reativa e fortalece o circuito em vez de saciá-lo",
          "Uma vez não faz diferença"
        ],
        "correct": 1,
        "why": "A teoria do 'controle após o vício' ignora que o sistema de recompensa foi fisicamente reprogramado. 'Uma vez' reativa o loop completamente."
      },
      {
        "type": "real",
        "title": "Vício em telas: o mesmo circuito",
        "content": "Vício em substâncias e vício em redes sociais compartilham mecanismos — recompensa variável, craving, checagem compulsiva mesmo sem satisfação. A diferença é de grau, não de tipo.",
        "aplicacao": "Tristan Harris (ex-Google): 'Não é que você não tem força de vontade. É que 1000 engenheiros trabalharam para garantir que você não a use.'"
      },
      {
        "type": "apply",
        "text": "Reflexão sem julgamento: existe um comportamento na sua vida que você continua mesmo sem prazer real? Nomear o padrão com curiosidade (não culpa) é o primeiro passo que a neurociência recomenda."
      }
    ]
  },
  "l19": {
    "title": "Depressão, Ansiedade e o Cérebro",
    "emoji": "🌧️",
    "key": "Não é 'fraqueza de caráter' — são alterações mensuráveis em regiões e circuitos.",
    "concept": "serotonina",
    "check": {
      "q": "O que o hipocampo sofre na depressão crônica?",
      "opts": [
        "Cresce com plasticidade compensatória",
        "Encolhe com exposição prolongada ao cortisol",
        "Fica hiperativo"
      ],
      "correct": 1,
      "why": "Cortisol crônico inibe neurogênese e pode reduzir o hipocampo — afetando memória, contexto e regulação emocional."
    },
    "stages": [
      {
        "type": "hook",
        "content": "Depressão afeta 300 milhões de pessoas. Ansiedade é o transtorno mais prevalente do mundo. E ainda há quem diga 'é só força de vontade'. O que os exames de imagem mostram que está acontecendo fisicamente no cérebro?",
        "question": "O que a ciência vê — e o que isso muda?"
      },
      {
        "type": "conceito",
        "title": "Depressão: o que muda no cérebro",
        "content": "Depressão não é apenas tristeza — é um estado com correlatos físicos mensuráveis:",
        "items": [
          {
            "emoji": "📉",
            "label": "Serotonina, dopamina, noradrenalina baixas",
            "text": "Sinalização reduzida nesses três sistemas — base do que a maioria dos antidepressivos tenta corrigir."
          },
          {
            "emoji": "🔥",
            "label": "Amígdala hiperativa",
            "text": "Reatividade emocional elevada e viés de negatividade amplificado."
          },
          {
            "emoji": "📵",
            "label": "Pré-frontal hipoativo",
            "text": "Dificuldade de controlar emoções, decidir e planejar."
          },
          {
            "emoji": "🌧️",
            "label": "Hipocampo menor",
            "text": "Cortisol crônico inibe neurogênese e pode reduzir volume — piora memória e regulação."
          }
        ]
      },
      {
        "type": "compare",
        "title": "Depressão × Ansiedade (no cérebro)",
        "left": {
          "name": "Depressão",
          "color": "#94a3b8",
          "emoji": "🌧️",
          "items": [
            "Amígdala reativa ao negativo",
            "Dopamina e serotonina baixas",
            "Anedonia — nada dá prazer",
            "Hipocampo comprometido"
          ]
        },
        "right": {
          "name": "Ansiedade",
          "color": "#fb923c",
          "emoji": "⚡",
          "items": [
            "Amígdala em estado de alerta",
            "GABA baixo, noradrenalina alta",
            "Antecipação constante de ameaça",
            "Eixo HPA cronicamente ativado"
          ]
        }
      },
      {
        "type": "quiz",
        "q": "Por que exercício tem eficácia comprovada contra depressão leve-moderada?",
        "opts": [
          "Distrai dos pensamentos",
          "Eleva BDNF, normaliza neurotransmissores e gera novos neurônios no hipocampo",
          "Cansa e força o descanso"
        ],
        "correct": 1,
        "why": "Múltiplos estudos mostram eficácia comparável a antidepressivos em casos leves-moderados — com vantagem de não ter efeitos colaterais."
      },
      {
        "type": "real",
        "title": "O que a ciência diz sobre tratamento",
        "content": "Tratamento mais eficaz é multimodal: terapia (TCC e ACT têm mais evidência), exercício aeróbico, medicação quando indicada, sono de qualidade, conexão social significativa.",
        "aplicacao": "IMPORTANTE: estas informações são educativas. Depressão e ansiedade clínicas precisam de avaliação e acompanhamento profissional. O conhecimento do mecanismo ajuda a reduzir o estigma — não substitui o tratamento."
      },
      {
        "type": "apply",
        "text": "Se você ou alguém próximo sofre com isso: o passo mais importante é buscar ajuda profissional. Conhecer a base neural pode ajudar a mudar a narrativa de 'fraqueza' para 'condição tratável com abordagem correta'."
      }
    ]
  },
  "l20": {
    "title": "Paixão, Amor e o Cérebro",
    "emoji": "💞",
    "key": "Paixão é dopamina + noradrenalina (fogo); amor duradouro é ocitocina + vasopressina (brasa).",
    "concept": "ocitocina",
    "check": {
      "q": "Por que a serotonina CAI no início da paixão?",
      "opts": [
        "A pessoa fica triste",
        "A queda de serotonina cria pensamento obsessivo sobre o amado",
        "A dopamina a substitui completamente"
      ],
      "correct": 1,
      "why": "Na paixão, serotonina cai a níveis similares ao TOC — criando pensamentos obsessivos sobre a pessoa amada. É literalmente um estado de obsessão controlada."
    },
    "stages": [
      {
        "type": "hook",
        "content": "Por que a paixão parece um vício? Por que você 'não consegue parar de pensar' na pessoa? Por que casais de longa data têm uma calma que apaixonados não têm? A química de cada fase do amor é completamente diferente.",
        "question": "O amor é um sentimento — ou um estado químico com fases precisas?"
      },
      {
        "type": "conceito",
        "title": "Fase 1: Desejo (lust)",
        "content": "Dominada por hormônios sexuais — a busca por parceiro:",
        "items": [
          {
            "emoji": "🔥",
            "label": "Testosterona / Estrogênio",
            "text": "Criam o interesse inicial e o impulso de buscar — presentes em todos os mamíferos."
          },
          {
            "emoji": "⏱️",
            "label": "Duração",
            "text": "Semanas a meses. O componente mais universal e menos seletivo."
          }
        ]
      },
      {
        "type": "conceito",
        "title": "Fase 2: Atração (apaixonar-se)",
        "content": "O estado que parece loucura — porque quimicamente é próximo disso:",
        "items": [
          {
            "emoji": "🎯",
            "label": "Dopamina alta",
            "text": "Euforia, energia extra, pensamento obsessivo sobre a pessoa."
          },
          {
            "emoji": "💓",
            "label": "Noradrenalina alta",
            "text": "Coração acelerado, insônia, nervosismo — excitação constante."
          },
          {
            "emoji": "📉",
            "label": "Serotonina baixa",
            "text": "Pensamento obsessivo: estudos mostram níveis similares ao TOC."
          },
          {
            "emoji": "⏱️",
            "label": "Duração",
            "text": "6 meses a 2 anos — evolutivamente, tempo suficiente para conceber."
          }
        ]
      },
      {
        "type": "conceito",
        "title": "Fase 3: Vínculo (amor maduro)",
        "content": "A transição química mais importante — e mais mal compreendida:",
        "items": [
          {
            "emoji": "💞",
            "label": "Ocitocina",
            "text": "O hormônio do vínculo — sobe com toque, intimidade e cumplicidade. Cria confiança profunda."
          },
          {
            "emoji": "🛡️",
            "label": "Vasopressina",
            "text": "Ligada à fidelidade e ao cuidado a longo prazo."
          },
          {
            "emoji": "🕯️",
            "label": "A transição",
            "text": "Da euforia intensa ao calor constante. Muitos confundem com 'amor acabou' — é na verdade um amor mais profundo."
          }
        ]
      },
      {
        "type": "quiz",
        "q": "Casais de longa data felizes compartilham algo em comum. O quê?",
        "opts": [
          "Mantêm a intensidade da paixão inicial",
          "Fazem experiências novas juntos regularmente (novidade + ocitocina)",
          "Evitam conflitos"
        ],
        "correct": 1,
        "why": "Helen Fisher: casais que ainda se reportam apaixonados após décadas fazem coisas novas juntos com frequência — ativando dopamina dentro do vínculo de ocitocina."
      },
      {
        "type": "apply",
        "text": "Na próxima semana: faça algo genuinamente novo com quem você ama — um lugar, uma atividade, uma conversa sobre algo nunca discutido. A novidade ativa dopamina; o contexto de segurança mantém a ocitocina."
      }
    ]
  },
  "l21": {
    "title": "Decisão, Emoção e os Vieses",
    "emoji": "⚖️",
    "key": "Decidimos com emoção primeiro, razão depois. Sistema 1 é veloz e erra de forma previsível.",
    "check": {
      "q": "O que o caso Phineas Gage revelou?",
      "opts": [
        "Razão e emoção são completamente separadas",
        "Sem emoção, decisão é impossível ou catastrófica",
        "O cérebro pode funcionar sem pré-frontal"
      ],
      "correct": 1,
      "why": "Gage perdeu o pré-frontal e manteve QI — mas passou a tomar decisões sociais e financeiras desastrosas. Damasio: emoção é necessária para decidir bem."
    },
    "stages": [
      {
        "type": "hook",
        "content": "Phineas Gage, 1848: uma barra de ferro atravessou seu crânio destruindo o pré-frontal. Ele sobreviveu, manteve a inteligência e a linguagem — mas passou a tomar decisões completamente irresponsáveis. Isso prova algo fundamental sobre como decidimos.",
        "question": "O que realmente guia as nossas decisões?"
      },
      {
        "type": "conceito",
        "title": "A hipótese do marcador somático (Damasio)",
        "content": "Antonio Damasio descobriu que emoções são instrumentos de decisão, não obstáculos:",
        "items": [
          {
            "emoji": "🤔",
            "label": "Sem emoção",
            "text": "Pacientes com lesão no pré-frontal ventromedial têm QI intacto mas decisões péssimas."
          },
          {
            "emoji": "💡",
            "label": "Marcadores somáticos",
            "text": "O corpo 'vota' antes da razão — frio na barriga, aperto no peito são dados de decisão."
          },
          {
            "emoji": "⚡",
            "label": "Sistema 1 decide",
            "text": "A decisão já está formada antes do pensamento consciente — a razão racionaliza depois."
          },
          {
            "emoji": "⚖️",
            "label": "O ideal",
            "text": "Emoção + razão integradas — não um ou outro."
          }
        ]
      },
      {
        "type": "compare",
        "title": "Sistema 1 × Sistema 2 (Kahneman)",
        "left": {
          "name": "Sistema 1",
          "color": "#fb7185",
          "emoji": "⚡",
          "items": [
            "Rápido (milissegundos)",
            "Automático e emocional",
            "Usa atalhos (heurísticas)",
            "Comete erros previsíveis (vieses)"
          ]
        },
        "right": {
          "name": "Sistema 2",
          "color": "#7dd3fc",
          "emoji": "🧠",
          "items": [
            "Lento (segundos)",
            "Deliberado e racional",
            "Analisa e pondera",
            "Preguiçoso — evita trabalho extra"
          ]
        }
      },
      {
        "type": "quiz",
        "q": "Por que todos somos previsíveis nos nossos erros de julgamento?",
        "opts": [
          "Todos erramos aleatoriamente",
          "Heurísticas do Sistema 1 criam erros sistemáticos iguais em todos",
          "Inteligência determina os erros"
        ],
        "correct": 1,
        "why": "Os vieses são erros sistemáticos — não aleatórios. Kahneman e Tversky mapearam padrões previsíveis que afetam CEOs e cientistas do mesmo jeito. Conhecê-los não os elimina — mas cria espaço."
      },
      {
        "type": "real",
        "title": "Vieses na prática",
        "content": "Ancoragem: o primeiro número visto distorce tudo depois. Aversão à perda: perder R$100 dói 2x mais que ganhar R$100 alegra. Sunk cost: continuamos num mau investimento por 'já ter investido tanto'.",
        "aplicacao": "Esses padrões são explorados conscientemente em preços ('de/por'), design de produtos (opção padrão), e políticas públicas. Consciência reduz (mas não elimina) o impacto."
      },
      {
        "type": "apply",
        "text": "Próxima decisão importante: anote sua primeira reação (Sistema 1). Depois, force 3 contra-argumentos (Sistema 2). Tome a decisão após esse processo — você vai notar como as duas etapas diferem."
      }
    ]
  },
  "l22": {
    "title": "Regulação Emocional — Você no Controle",
    "emoji": "🎮",
    "key": "Emoção não é algo que acontece com você — é algo que você pode aprender a regular.",
    "check": {
      "q": "O que 'nomear para domar' faz no cérebro?",
      "opts": [
        "Suprime a emoção",
        "Ativa o pré-frontal e reduz atividade da amígdala",
        "Eleva o cortisol"
      ],
      "correct": 1,
      "why": "Matthew Lieberman: nomear uma emoção ativa o pré-frontal ventrolateral e reduz a atividade da amígdala. Três palavras mudam a neurofisiologia."
    },
    "stages": [
      {
        "type": "hook",
        "content": "Você não escolhe quais emoções surgem. Mas pode escolher o que faz com elas. Regulação emocional não é suprimir o que sente — é ter um repertório de estratégias que funcionam neurologicamente. E cada uma tem um mecanismo preciso.",
        "question": "Qual é a diferença entre sentir uma emoção e ser controlado por ela?"
      },
      {
        "type": "conceito",
        "title": "Estratégias com base neural",
        "content": "Gross (2015) mapeou estratégias de regulação com eficácia comprovada:",
        "items": [
          {
            "emoji": "🏷️",
            "label": "Nomear (labeling)",
            "text": "'Estou sentindo ansiedade' — ativa pré-frontal e reduz amígdala imediatamente. O mais rápido."
          },
          {
            "emoji": "🎭",
            "label": "Reavaliação cognitiva",
            "text": "Reinterpretar: 'essa crítica pode ser aprendizado'. Reduz amígdala de forma sustentada."
          },
          {
            "emoji": "💨",
            "label": "Regulação somática",
            "text": "Respiração lenta, exercício, toque — acessam o sistema nervoso autonomamente."
          },
          {
            "emoji": "🧘",
            "label": "Aceitação (mindfulness)",
            "text": "Observar sem julgamento — reduz reatividade da amígdala a longo prazo com prática regular."
          }
        ]
      },
      {
        "type": "real",
        "title": "O que NÃO funciona",
        "content": "Supressão (forçar não sentir) funciona no curtíssimo prazo mas tem custo alto: aumenta atividade da amígdala, eleva pressão arterial e piora a saúde mental a longo prazo (James Gross, Stanford).",
        "aplicacao": "Fingir que não sente não faz a emoção ir embora — faz ela aparecer de outras formas. Reconhecer e nomear é neurologicamente superior a suprimir."
      },
      {
        "type": "quiz",
        "q": "Por que mindfulness ajuda a regular emoções?",
        "opts": [
          "Elimina pensamentos negativos",
          "Com prática, reduz fisicamente o volume da amígdala e espessa o pré-frontal",
          "Distrai das emoções difíceis"
        ],
        "correct": 1,
        "why": "Sara Lazar (Harvard): 8 semanas de mindfulness mostram espessamento do pré-frontal e redução do volume da amígdala — mudanças estruturais mensuráveis em exames de imagem."
      },
      {
        "type": "apply",
        "text": "Pratique 'nomear para domar' hoje: quando uma emoção surgir, diga mentalmente 'Estou notando [emoção]'. Três palavras que ativam o pré-frontal e reduzem a amígdala — neurociência aplicada em tempo real."
      }
    ]
  },
  "l23": {
    "title": "Foco, Atenção e o Estado de Flow",
    "emoji": "🎯",
    "key": "Foco não é força de vontade — é neuroquímica. E o ambiente moderno foi projetado para destruí-lo.",
    "check": {
      "q": "Quanto tempo o cérebro leva para recuperar foco após uma interrupção?",
      "opts": [
        "30 segundos",
        "Até 23 minutos (pesquisa UCI)",
        "5 minutos"
      ],
      "correct": 1,
      "why": "Uma distração de 3 segundos pode custar até 23 minutos de foco profundo. O custo não é a distração em si — é o tempo de reconexão ao estado anterior."
    },
    "stages": [
      {
        "type": "hook",
        "content": "Microsoft (2015): span de atenção humano caiu de 12 para 8 segundos entre 2000 e 2015. Abaixo do peixe dourado (9s). Mas isso não é inevitável — é consequência de como usamos o ambiente. O que a neurociência diz sobre recuperar foco profundo?",
        "question": "Por que é tão difícil se concentrar hoje — e o que fazer?"
      },
      {
        "type": "conceito",
        "title": "A neuroquímica do foco",
        "content": "Quatro sistemas neurais sustentam o foco profundo:",
        "items": [
          {
            "emoji": "🎯",
            "label": "Noradrenalina",
            "text": "Alerta e foco seletivo. Liberada em estado de leve estresse positivo (desafio adequado, não excessivo)."
          },
          {
            "emoji": "🔥",
            "label": "Dopamina",
            "text": "Motivação para a tarefa. Alta quando ela é significativa ou tem progresso visível."
          },
          {
            "emoji": "🛑",
            "label": "GABA",
            "text": "Inibe o ruído mental — silencia pensamentos irrelevantes. Meditação eleva GABA."
          },
          {
            "emoji": "🌊",
            "label": "Acetilcolina",
            "text": "Sinaliza 'este momento importa': aumenta plasticidade e atenção seletiva."
          }
        ]
      },
      {
        "type": "conceito",
        "title": "Flow — foco sem esforço",
        "content": "Csikszentmihalyi mapeou o estado de flow — foco total sem trabalho consciente:",
        "items": [
          {
            "emoji": "⚖️",
            "label": "Desafio = Habilidade",
            "text": "Fácil demais: tédio (dopamina cai). Difícil demais: ansiedade (cortisol sobe). No ponto certo: flow."
          },
          {
            "emoji": "🎭",
            "label": "Hipofrontalidade",
            "text": "O pré-frontal 'sai do caminho' — processamento fica fluido e sem autocrítica."
          },
          {
            "emoji": "🚫",
            "label": "Multitarefa é mito",
            "text": "O cérebro alterna entre tarefas (task-switching), com custo a cada troca — não paraliza."
          }
        ]
      },
      {
        "type": "quiz",
        "q": "Por que colocar o celular em outro cômodo melhora o desempenho cognitivo?",
        "opts": [
          "Elimina a tentação visual",
          "A presença do celular (mesmo silencioso) já ocupa recursos cognitivos (Ward et al., 2017)",
          "O silêncio ajuda a pensar"
        ],
        "correct": 1,
        "why": "Só a presença do celular na mesa — mesmo virado pra baixo, mesmo silencioso — já reduz capacidade cognitiva disponível. O cérebro usa recursos para não checar."
      },
      {
        "type": "real",
        "title": "O custo das interrupções",
        "content": "Gloria Mark (UCI): após uma interrupção, leva em média 23 minutos para retornar ao nível de foco anterior. Uma notificação de 3 segundos custa ~23 minutos de estado profundo.",
        "aplicacao": "Cal Newport: trabalho profundo é raro e valioso. Períodos ininterruptos de foco intenso produzem mais em 4 horas do que 8 horas fragmentadas."
      },
      {
        "type": "apply",
        "text": "Experimento amanhã: 90 minutos com celular em outro cômodo, notificações desligadas, trabalhando em UMA coisa. Compare a produção com um dia normal. A diferença vai surpreender."
      }
    ]
  },
  "l24": {
    "title": "Bem-estar — Seu Plano Neural",
    "emoji": "🌟",
    "key": "Bem-estar não é um estado — é uma prática de quatro pilares com base em evidências.",
    "check": {
      "q": "O que o Estudo de Harvard sobre felicidade (85 anos) concluiu?",
      "opts": [
        "Dinheiro e sucesso profissional são chave",
        "Qualidade dos relacionamentos é o maior preditor de saúde e longevidade",
        "Saúde física é o único fator"
      ],
      "correct": 1,
      "why": "Iniciado em 1938, o maior estudo longitudinal sobre felicidade humana: qualidade das relações — não fama, dinheiro ou sucesso — prediz melhor quem vai envelhecer saudável e feliz."
    },
    "stages": [
      {
        "type": "hook",
        "content": "Você chegou ao fim da trilha com uma visão de como o cérebro funciona. Mas conhecimento só muda vidas quando vira ação. O que a neurociência — reunida em décadas de pesquisa — recomenda para uma vida com mais bem-estar?",
        "question": "O que realmente move o ponteiro do bem-estar, com base em evidências?"
      },
      {
        "type": "conceito",
        "title": "Os 4 pilares neurais do bem-estar",
        "content": "Consenso entre neurociência e psicologia positiva:",
        "items": [
          {
            "emoji": "🏃",
            "label": "Movimento",
            "text": "20-30 min de cardio moderado, 3-5x/semana. Maior intervenção única para cognição, humor e longevidade."
          },
          {
            "emoji": "🌙",
            "label": "Sono",
            "text": "7-9h, horário consistente. Consolidação de memória, limpeza glinfática e restauração hormonal."
          },
          {
            "emoji": "🤝",
            "label": "Conexão",
            "text": "Relacionamentos profundos são o maior preditor de longevidade e saúde mental (Estudo de Harvard, 85 anos)."
          },
          {
            "emoji": "🎯",
            "label": "Sentido",
            "text": "Propósito ativo — contribuir, crescer, criar. Não precisa ser grandioso."
          }
        ]
      },
      {
        "type": "flow",
        "title": "O Estudo de Harvard (85 anos)",
        "steps": [
          {
            "icon": "📅",
            "label": "Iniciado em 1938",
            "text": "O maior estudo longitudinal sobre felicidade humana — 85 anos de acompanhamento."
          },
          {
            "icon": "🔎",
            "label": "Descoberta central",
            "text": "QUALIDADE dos relacionamentos é o maior preditor de saúde e longevidade — mais que qualquer outro fator."
          },
          {
            "icon": "❌",
            "label": "O que não importou",
            "text": "Fama, dinheiro e sucesso profissional correlacionaram pouco com bem-estar a longo prazo."
          },
          {
            "icon": "✅",
            "label": "O que importou",
            "text": "Ter alguém em quem confiar completamente. A profundidade, não a quantidade, das conexões."
          }
        ]
      },
      {
        "type": "quiz",
        "q": "Se você pudesse implementar apenas UMA mudança hoje para bem-estar mental, qual tem mais evidência?",
        "opts": [
          "Meditação diária",
          "Exercício aeróbico regular (20-30 min, 3-5x/semana)",
          "Dieta sem açúcar"
        ],
        "correct": 1,
        "why": "Todos têm evidência, mas exercício aeróbico regular tem o maior corpo de pesquisa para saúde mental, cognição e longevidade combinados — e o efeito é imediato e mensurável."
      },
      {
        "type": "real",
        "title": "Integrando o que você aprendeu",
        "content": "Você agora sabe: dopamina precisa de busca real; serotonina de sol e reconhecimento; cortisol precisa ser regulado; o pré-frontal precisa de descanso; o hipocampo ama exercício; o sono consolida tudo.",
        "aplicacao": "Um dia ideal para o seu cérebro: sol de manhã (serotonina), exercício (BDNF, dopamina, noradrenalina), trabalho focado (noradrenalina, acetilcolina), conexão real (ocitocina), escuridão à noite (melatonina). Você não precisa fazer tudo de uma vez."
      },
      {
        "type": "apply",
        "text": "Última pergunta da trilha: qual é a UMA coisa que você vai implementar esta semana com base no que aprendeu? Consistência com uma coisa supera perfeição com dez. Escreva. Comprometa-se."
      }
    ]
  }
};

const LESSON_EXTRA = Object.fromEntries(Object.entries(LESSONS).map(([k,v])=>[k,{key:v.key}]));

const LESSON_CONCEPT = {"l5": "dopamina", "l6": "serotonina", "l7": "cortisol", "l8": "gaba", "l9": "ocitocina", "l10": "prefrontal", "l11": "amigdala", "l12": "hipotalamo", "l13": "insula", "l18": "dopamina", "l19": "serotonina", "l20": "ocitocina"};

const LESSON_ORDER = MODULES.flatMap((m) => m.lessons);

// ---- Mito vs Verdade ----
const MITOS = [
  { claim: "Existe um 'detox de dopamina' que zera a dopamina do cérebro.", isTrue: false, explain: "Você não 'zera' dopamina (ela mantém você vivo). O que ajuda é reduzir estímulos rápidos demais pra ressensibilizar o sistema de recompensa." },
  { claim: "Usamos apenas 10% do cérebro.", isTrue: false, explain: "Mito clássico. Exames mostram que usamos praticamente o cérebro todo ao longo do dia, em momentos diferentes." },
  { claim: "A maior parte da serotonina fica no intestino.", isTrue: true, explain: "Cerca de 90%! Por isso o intestino é chamado de 'segundo cérebro'." },
  { claim: "Pessoas são 'cérebro esquerdo' (lógico) ou 'direito' (criativo).", isTrue: false, explain: "Os dois lados trabalham juntos o tempo todo. Não existe dominância que defina personalidade." },
  { claim: "O cérebro pode criar novos neurônios na vida adulta.", isTrue: true, explain: "Sim! Principalmente no hipocampo. Exercício e aprendizado ajudam — chama-se neurogênese." },
  { claim: "Açúcar é o que deixa crianças 'hiperativas'.", isTrue: false, explain: "Estudos controlados não confirmam. O efeito costuma vir do contexto (festa, expectativa), não do açúcar." },
  { claim: "Adrenalina e cortisol são exatamente a mesma coisa.", isTrue: false, explain: "São diferentes: adrenalina age em segundos (coração), cortisol sustenta o estresse por mais tempo." },
  { claim: "Dormir pouco prejudica a memória.", isTrue: true, explain: "O sono é quando o hipocampo consolida o que você aprendeu. Sem sono, a memória falha." },
  { claim: "O próprio tecido do cérebro sente dor.", isTrue: false, explain: "Ele não tem receptores de dor — por isso existem cirurgias com o paciente acordado." },
  { claim: "Telas à noite atrapalham o sono.", isTrue: true, explain: "A luz azul bloqueia a melatonina, enganando o cérebro como se ainda fosse dia." },
];

// ---- Prova final (puxa os quizzes das lições) ----
const PROVA = LESSON_ORDER.map((id) => LESSONS[id] && LESSONS[id].check ? { ...LESSONS[id].check } : null).filter(Boolean);

// ---- Revisão espaçada (Leitner) ----
const SRS_DAYS = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 16 };
const todayStr = () => new Date().toISOString().slice(0, 10);
const yesterdayStr = () => new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const DAILY_GOAL = 30;

// conceito principal de cada lição (pro mapa de domínio)
// conceitos exibidos no mapa de domínio
const MASTERY_CONCEPTS = [...Object.keys(NEUROS), "prefrontal", "amigdala", "hipocampo", "hipotalamo", "talamo", "insula", "accumbens"];
const conceptName = (id) => (NEUROS[id] ? NEUROS[id].name : REGIONS[id] ? REGIONS[id].name : id);
const conceptColor = (id) => (NEUROS[id] ? NEUROS[id].color : "#ffce6b");

// descobre o conceito de um flashcard pelo texto da resposta
const NAME2ID = {};
Object.keys(NEUROS).forEach((id) => { NAME2ID[NEUROS[id].name.toLowerCase()] = id; });
Object.keys(REGIONS).forEach((id) => { NAME2ID[REGIONS[id].name.toLowerCase()] = id; });
function conceptOfCard(card) {
  const a = card.a.toLowerCase();
  for (const name in NAME2ID) { if (a.includes(name) || name.includes(a)) return NAME2ID[name]; }
  return null;
}

// desafios de aplicação na vida real
const DESAFIOS = [
  { id: "sol", emoji: "☀️", text: "Tome 10 min de sol pela manhã (serotonina + relógio do sono)." },
  { id: "tela", emoji: "🌙", text: "Fique 30 min sem telas antes de dormir (libera a melatonina)." },
  { id: "treino", emoji: "🏃", text: "Faça 20 min de exercício e observe seu humor depois (endorfina)." },
  { id: "abraco", cat: "vinculo", emoji: "🤗", text: "Dê um abraço de 20 segundos em alguém querido (ocitocina)." },
  { id: "respira", emoji: "😮‍💨", text: "Num momento tenso, respire lento 1 min antes de reagir (GABA)." },
  { id: "meta", emoji: "✅", text: "Conclua uma tarefa pequena e celebre (dopamina da recompensa)." },
];

// perguntas abertas para o tutor de IA
const TUTOR_QS = [
  "Com suas palavras, por que a dopamina está ligada aos vícios?",
  "Qual é a diferença entre a amígdala e o córtex pré-frontal numa discussão?",
  "Por que tomar sol de manhã ajuda no humor e no sono?",
  "Explique o que é o 'sequestro da amígdala'.",
  "Por que estímulos rápidos demais (como o feed) deixam as coisas normais sem graça?",
  "Qual a diferença entre um neurotransmissor e um hormônio?",
  "Por que a respiração lenta ajuda a acalmar a ansiedade?",
];

const BADGES = [
  { id: "novato", name: "Primeiros Passos", emoji: "👣", desc: "Conclua sua 1ª lição" },
  { id: "m1", name: "Base Sólida", emoji: "🧱", desc: "Conclua o módulo Fundamentos" },
  { id: "m2", name: "Químico", emoji: "⚗️", desc: "Conclua o módulo Os Químicos" },
  { id: "m3", name: "Neuroanatomista", emoji: "🧠", desc: "Conclua o módulo O Cérebro" },
  { id: "formado", name: "Formado", emoji: "🎓", desc: "Conclua TODAS as lições" },
  { id: "memoria", name: "Memória de Elefante", emoji: "🐘", desc: "Acerte 100% nos flashcards" },
  { id: "conexao", name: "Conexão Perfeita", emoji: "🔗", desc: "Vença o Conectar sem erros" },
  { id: "explorador", name: "Explorador", emoji: "🗺️", desc: "Veja 8 cenários diferentes" },
  { id: "mestre", name: "Mestre da Mente", emoji: "👑", desc: "Chegue ao nível 5" },
  { id: "diploma", name: "Diplomado", emoji: "📜", desc: "Passe na Prova Final" },
  { id: "ofensiva", name: "Em Chamas", emoji: "🔥", desc: "Mantenha 3 dias de ofensiva" },
];

const LEVEL_TITLES = ["Aprendiz", "Curioso", "Explorador", "Conhecedor", "Mestre da Mente"];
const XP_PER_LEVEL = 100;
const levelOf = (xp) => Math.floor(xp / XP_PER_LEVEL) + 1;
const titleOf = (lvl) => LEVEL_TITLES[Math.min(lvl - 1, LEVEL_TITLES.length - 1)];

// =========================================================================
//  ESTADO / GAMIFICAÇÃO
// =========================================================================

const _LS = {
  get: async (k) => { try { const v = localStorage.getItem(k); return v == null ? null : { key: k, value: v }; } catch (e) { return null; } },
  set: async (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} return { key: k, value: v }; },
};
const store = (typeof window !== "undefined" && window.storage) ? window.storage : _LS;

const GameCtx = createContext(null);
const useGame = () => useContext(GameCtx);

const DEFAULT_PROGRESS = { xp: 0, lessons: {}, review: {}, mastery: {}, challenges: {}, streak: 0, dailyDate: "", dailyXp: 0, stats: { seen: {}, flashPerfect: false, connectPerfect: false, provaPassed: false } };

function computeBadges(p) {
  const earned = {};
  const lessonsDone = Object.keys(p.lessons).filter((k) => p.lessons[k]);
  if (lessonsDone.length >= 1) earned.novato = true;
  MODULES.forEach((m) => { if (m.lessons.every((l) => p.lessons[l])) earned[m.id] = true; });
  if (LESSON_ORDER.every((l) => p.lessons[l])) earned.formado = true;
  if (p.stats.flashPerfect) earned.memoria = true;
  if (p.stats.connectPerfect) earned.conexao = true;
  if (Object.keys(p.stats.seen || {}).length >= 8) earned.explorador = true;
  if (levelOf(p.xp) >= 5) earned.mestre = true;
  if (p.stats.provaPassed) earned.diploma = true;
  if ((p.streak || 0) >= 3) earned.ofensiva = true;
  return earned;
}

function GameProvider({ children }) {
  const [progress, setProgress] = useState(DEFAULT_PROGRESS);
  const [toast, setToast] = useState(null);
  const loaded = useRef(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await store.get("brain_progress");
        if (alive && r && r.value) {
          const saved = JSON.parse(r.value);
          setProgress({ ...DEFAULT_PROGRESS, ...saved, review: saved.review || {}, mastery: saved.mastery || {}, challenges: saved.challenges || {}, stats: { ...DEFAULT_PROGRESS.stats, ...(saved.stats || {}) } });
        }
      } catch (e) { /* sem persistência: usa memória */ }
      loaded.current = true;
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    (async () => { try { await store.set("brain_progress", JSON.stringify(progress)); } catch (e) {} })();
  }, [progress]);

  const showToast = (text, emoji) => {
    setToast({ text, emoji, k: Date.now() });
    setTimeout(() => setToast((t) => (t && Date.now() - t.k >= 1900 ? null : t)), 2000);
  };

  const addXp = (n, label) => {
    setProgress((p) => {
      const today = todayStr();
      let np = { ...p, xp: p.xp + n };
      if (p.dailyDate !== today) {
        np.streak = p.dailyDate === yesterdayStr() ? (p.streak || 0) + 1 : 1;
        np.dailyDate = today; np.dailyXp = n;
      } else { np.dailyXp = (p.dailyXp || 0) + n; }
      return np;
    });
    showToast(`+${n} XP${label ? " · " + label : ""}`, "⭐");
  };
  const completeLesson = (id) => setProgress((p) => (p.lessons[id] ? p : { ...p, lessons: { ...p.lessons, [id]: true } }));
  const updateReview = (idx, correct) => setProgress((p) => {
    const cur = p.review[idx] || { box: 1 };
    const box = correct ? Math.min(5, (cur.box || 1) + 1) : 1;
    const due = Date.now() + (SRS_DAYS[box] || 0) * 86400000;
    return { ...p, review: { ...p.review, [idx]: { box, due } } };
  });
  const recordConcept = (id, correct) => setProgress((p) => {
    const cur = (p.mastery || {})[id] || { r: 0, t: 0 };
    return { ...p, mastery: { ...(p.mastery || {}), [id]: { r: cur.r + (correct ? 1 : 0), t: cur.t + 1 } } };
  });
  const toggleChallenge = (id) => setProgress((p) => {
    const done = !!(p.challenges || {})[id];
    return { ...p, challenges: { ...(p.challenges || {}), [id]: !done } };
  });
  const setStat = (key, val) => setProgress((p) => ({ ...p, stats: { ...p.stats, [key]: val } }));
  const seeScenario = (id) => setProgress((p) => ({ ...p, stats: { ...p.stats, seen: { ...(p.stats.seen || {}), [id]: true } } }));
  const reset = () => setProgress(DEFAULT_PROGRESS);

  const badges = computeBadges(progress);

  return (
    <GameCtx.Provider value={{ progress, badges, addXp, completeLesson, updateReview, recordConcept, toggleChallenge, setStat, seeScenario, showToast, reset }}>
      {children}
      {toast && (
        <div style={styles.toast} className="toast-anim" key={toast.k}>
          <span style={{ fontSize: 18 }}>{toast.emoji}</span> {toast.text}
        </div>
      )}
    </GameCtx.Provider>
  );
}

// =========================================================================
//  APP
// =========================================================================

// ---- gesto "deslizar pra voltar": pilha global de ações de voltar ----
const _backStack = [];
let _backUid = 0;
function useBackHandler(active, fn) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!active) return;
    const id = ++_backUid;
    _backStack.push({ id, fn: () => ref.current && ref.current() });
    return () => { const i = _backStack.findIndex((h) => h.id === id); if (i >= 0) _backStack.splice(i, 1); };
  }, [active]);
}
function runBack() { const top = _backStack[_backStack.length - 1]; if (top) { top.fn(); return true; } return false; }


// =========================================================================
//  MBA — dados e componentes
// =========================================================================

const MBA_MODULES = [
  { id:"mba1", title:"Neuro & Consumo", emoji:"🧠", color:"#6366f1", lessons:["ml1","ml2","ml3"] },
  { id:"mba2", title:"Decisão & Vieses", emoji:"⚡", color:"#f59e0b", lessons:["ml4","ml5","ml6"] },
  { id:"mba3", title:"Emoção & Memória", emoji:"💞", color:"#ec4899", lessons:["ml7","ml8","ml9"] },
  { id:"mba4", title:"Persuasão", emoji:"🎯", color:"#10b981", lessons:["ml10","ml11","ml12"] },
  { id:"mba5", title:"Branding & UX", emoji:"✨", color:"#8b5cf6", lessons:["ml13","ml14","ml15"] },
  { id:"mba6", title:"Pesquisa & Futuro", emoji:"🔬", color:"#06b6d4", lessons:["ml16","ml17","ml18"] },
];

const MBA_LESSONS = {
 "ml1":{
  "title":"Advertising e a Mente Humana","emoji":"📺",
  "key":"95% das decisões de compra são inconscientes. A publicidade age no cérebro antes da consciência.",
  "stages":[
   {"type":"hook","content":"Um anúncio de 30 segundos ativa mais de 11 regiões cerebrais distintas antes de você decidir se gostou ou não. A pergunta não é 'você viu o anúncio?' — é 'o que seu cérebro fez com ele enquanto você nem percebeu?'","question":"O que realmente decide se um anúncio funciona?"},
   {"type":"conceito","title":"O cérebro que assiste propaganda","content":"A publicidade opera em três camadas simultâneas no cérebro:","items":[
    {"emoji":"👁️","label":"Atenção (0-130ms)","text":"O olho é guiado por movimento, cor e rostos humanos antes de qualquer escolha consciente. Eye-tracking mostra que a fóvea (área de foco) cobre apenas 2° do campo visual."},
    {"emoji":"💊","label":"Processamento emocional (130ms-2s)","text":"A amígdala 'vota' antes do córtex: o anúncio é seguro ou ameaçador? Desejável ou repulsivo? Esse voto emocional pré-consciente determina se você vai continuar assistindo."},
    {"emoji":"🧠","label":"Racionalização (2s+)","text":"Só depois o córtex pré-frontal cria uma 'razão' para a resposta já tomada. 'Achei bonito' é a narrativa — o cérebro já decidiu antes."},
   ]},
   {"type":"scenario","title":"Você está criando um anúncio","context":"Você tem que criar um banner para um novo chocolate premium. Qual abordagem você escolhe?",
    "choices":[
     {"label":"🍫 Close do chocolate derretendo com iluminação perfeita","result":"Acerto neuro! Texturas, movimento implícito (o derretimento) e cor âmbar-dourada ativam o córtex gustativo e o sistema de recompensa. Estudos de fMRI mostram aumento de salivação mensurável. Isso é priming sensorial clássico.","quality":"good"},
     {"label":"🏆 Lista de premiações e avaliações 4,9 estrelas","result":"Funciona, mas é mais fraco sozinho. Dados e prêmios ativam o córtex pré-frontal (avaliação racional), mas exigem que o cérebro 'trabalhe'. Para impulso de compra, emoção primeiro, lógica depois.","quality":"neutral"},
     {"label":"💑 Casal sorrindo compartilhando o chocolate","content":"Bom! Rostos são superativadores — a amígdala e o sistema de neurônios-espelho respondem instantaneamente a expressões humanas. O sorriso cria empatia e associação afetiva. Cuidado: o rosto não pode competir com o produto no campo visual.","quality":"good"},
    ]},
   {"type":"conceito","title":"Métricas de neuromarketing","content":"Diferença entre o que pesquisas tradicionais e neuro captam:","items":[
    {"emoji":"📊","label":"Pesquisa tradicional (declara)","text":"Pergunta ao consumidor. Ele responde com o que acha que faz, não o que faz. 80% das previsões de vendas baseadas em grupos focais erram."},
    {"emoji":"🧪","label":"EEG (Eletroencefalograma)","text":"Mede atividade elétrica neural em tempo real. Mostra exatamente em qual frame do vídeo o engajamento cai ou sobe."},
    {"emoji":"👁️","label":"Eye-tracking","text":"Rastreia onde o olhar foi — não onde o participante acha que olhou. Revela que logotipos no canto inferior direito são frequentemente ignorados."},
    {"emoji":"❤️","label":"Resposta galvânica da pele","text":"Mede ativação emocional (sudorese leve). Alta ativação = memorável, não necessariamente positivo. A cena mais lembrada pode ser a mais perturbadora."},
   ]},
   {"type":"quiz","q":"Uma pesquisa de grupo focal aprova muito um anúncio, mas as vendas caem após o lançamento. Qual é a explicação mais provável?","opts":["O criativo foi alterado depois da pesquisa","Grupos focais captam intenção declarada, não resposta emocional inconsciente real","A mídia foi insuficiente"],"correct":1,"why":"Daniel Kahneman e pesquisas do Ehrenberg-Bass Institute mostram que o que as pessoas dizem em grupo focal difere do que seus cérebros fazem frente à decisão real de compra. O social desejability bias distorce as respostas."},
   {"type":"insight_stack","title":"O que o neuromarketing descobriu sobre publicidade","insights":[
    {"emoji":"⏱️","title":"3 segundos ou nada","text":"Uma embalagem na gôndola tem 3 segundos para capturar atenção. Anúncios online têm 1,7 segundos. O cérebro decide 'relevante ou não' antes da consciência."},
    {"emoji":"🎵","title":"Música muda o sabor","text":"Pesquisas da Oxford (Charles Spence) mostram que música de piano faz vinho parecer mais refinado; música grave faz cerveja parecer mais amarga. A trilha sonora é um ingrediente."},
    {"emoji":"👃","title":"Cheiro tem memória de 65%","text":"Após 1 ano, lembramos de 35% do que vimos, 15% do que tocamos, mas 65% do que cheiramos. Lojas que usam aromatização têm ticket médio 20-35% maior."},
    {"emoji":"🔴","title":"Vermelho acelera decisão","text":"Rótulos vermelhos aumentam velocidade de decisão de compra (urgência). Azul aumenta confiança. Mas: o efeito muda radicalmente por categoria e cultura."},
   ]},
   {"type":"apply","text":"Pegue um anúncio que você fez ou viu recentemente. Responda: (1) O que ativa nos primeiros 3 segundos? (2) Qual emoção a amígdala 'lê' primeiro? (3) A racionalização que o copy oferece faz sentido depois dessa emoção? Redesenhe com esse olhar."},
  ]
 },
 "ml2":{
  "title":"Neurologia do Comportamento do Consumidor","emoji":"🔬",
  "key":"Comportamento de compra emerge de circuitos neurais evolutivamente antigos — não de 'escolha racional'.",
  "stages":[
   {"type":"hook","content":"Ratos de laboratório e humanos num shopping compartilham o mesmo circuito de busca por recompensa. Isso não é insulto — é uma das descobertas mais valiosas para entender por que compramos o que compramos (e por que o que planejamos raramente é o que levamos no carrinho).","question":"O que tem em comum um rato pressionando uma alavanca e um consumidor num shopping?"},
   {"type":"flow","title":"Os 3 sistemas neurais do comportamento de compra","steps":[
    {"icon":"🦎","label":"Sistema Límbico (quero)","text":"Amígdala e accumbens: desejo, recompensa e aversão à perda. Age antes de qualquer pensamento. É aqui que nasce o impulso de compra."},
    {"icon":"🧮","label":"Córtex Pré-frontal (devo?)","text":"Avalia consequências, compara preço/valor, controla impulso. Funciona bem quando descansado — fica fraco sob estresse, cansaço e pressão de tempo."},
    {"icon":"🔄","label":"Memória e Hábito (automático)","text":"Hipocampo + gânglios da base: compras habituais (marca de sempre, lista fixa) não passam pelo pré-frontal — são loops automáticos."},
   ]},
   {"type":"conceito","title":"O 'pain of paying' (Prelec & Loewenstein, 1998)","content":"Pagar fisicamente dói. Neuralmente, literalmente:","items":[
    {"emoji":"💳","label":"Cartão de crédito vs. dinheiro","text":"fMRI mostra que pagar com dinheiro ativa a ínsula (desconforto, 'dor'). Pagar com cartão, quase nenhuma ativação. Por isso gastos são maiores com cartão."},
    {"emoji":"📱","label":"Apple Pay / carteiras digitais","text":"Ainda mais dissociado: um tap no celular gera praticamente zero ativação de 'dor'. Design intencional de redução de fricção = aumento de gasto."},
    {"emoji":"🏷️","label":"Preço 'sem vírgula'","text":"R$100 (sem centavos) ativa menos dor que R$99,99 — o cérebro percebe o 100 como round number e processa mais fluidamente (menos esforço cognitivo)."},
    {"emoji":"🎁","label":"Implicação de design","text":"Quanto mais você remove a 'dor' do pagamento (fluxo de checkout, salvar cartão, compra com 1 clique), mais você aumenta conversão — mas também o risco de superendividamento do consumidor."},
   ]},
   {"type":"scenario","title":"Análise de caso: loja física vs. e-commerce","context":"Você é o diretor de e-commerce. As conversões no mobile caem 60% comparadas ao desktop, mesmo com design idêntico. O que o neuromarketing sugere como causa?",
    "choices":[
     {"label":"📐 O layout mobile é confuso","result":"Possível, mas secondary. A interface idêntica elimina essa variável. O neuromarketing aponta para outro fator primário.","quality":"neutral"},
     {"label":"🖐️ Toque na tela cria mais 'pain of paying' que clique","result":"Exato! Pesquisas (Peck & Wiggins, 2006; Brasel & Gips, 2014) mostram que toque físico em telas ativa maior sensação de posse E maior dor ao 'soltar' (pagar). O paradoxo: o toque aumenta o desejo, mas também o desconforto ao comprar. Solução: reduzir steps de checkout ao máximo no mobile.","quality":"good"},
     {"label":"🔋 A bateria baixa cria ansiedade e reduce compra","result":"Surpreendentemente, isso é real (pesquisa da NYU, 2019)! Bateria baixa ativa escassez de recurso e muda comportamento — as pessoas ficam mais avessas a risco. Mas não é a causa principal aqui.","quality":"neutral"},
    ]},
   {"type":"quiz","q":"Por que produtos 'edição limitada' vendem mais rápido mesmo quando a qualidade é idêntica à versão padrão?","opts":["Marketing cria expectativa artificial","Escassez percebida aumenta o valor hedônico e ativa o medo de perder (amígdala) — o produto literalmente 'vale mais' no cérebro","Consumidores testam antes de comprar"],"correct":1,"why":"Ciampa & Nagel (2021) demonstraram com fMRI que produtos rotulados 'exclusivos' ativam o córtex orbito-frontal (valor percebido) de forma significativamente maior. A escassez não é enganação — ela redefine neuronalmente o valor do item."},
   {"type":"apply","text":"Mapeie a jornada de compra de um produto que você vende (ou usa). Em cada ponto de contato, identifique: (1) Qual sistema neural está ativo? (2) O que aumenta ou diminui 'pain of paying'? (3) Onde o hábito substitui a decisão consciente? Esse mapa é a base do seu plano de neuromarketing."},
  ]
 },
 "ml3":{
  "title":"Cérebro e Design","emoji":"🎨",
  "key":"O cérebro constrói a realidade visual — design eficaz fala a língua dessa construção.",
  "stages":[
   {"type":"hook","content":"Você nunca viu o mundo como ele é. Seu cérebro recebe dados brutos dos olhos e constrói ativamente uma realidade. 40% do processamento cerebral é dedicado à visão — e designers que entendem esse processo têm uma vantagem enorme.","question":"O que o design 'diz' ao cérebro antes de você ler uma palavra?"},
   {"type":"conceito","title":"Princípios da Gestalt e o cérebro","content":"O cérebro não vê partes — vê padrões completos. A Gestalt mapeou como:","items":[
    {"emoji":"🔲","label":"Proximidade","text":"Elementos perto um do outro são percebidos como grupo. Usar bem: agrupar produto e CTA. Usar mal: agrupar produto com elemento negativo."},
    {"emoji":"〰️","label":"Continuidade","text":"O olho segue linhas e curvas naturalmente. Setas implícitas (olhares de personagens, linhas de produto) guiam a atenção sem que o usuário perceba."},
    {"emoji":"⬜","label":"Fechamento","text":"O cérebro completa formas incompletas. Logos como FedEx (seta implícita) e Amazon (sorriso que vai de A a Z) exploram isso."},
    {"emoji":"🔵","label":"Figura-Fundo","text":"O cérebro precisa separar o objeto do fundo. Quando isso é ambíguo, gera tensão. Às vezes intencional (logos icônicos) — às vezes um erro que ninguém notou até viralizar."},
   ]},
   {"type":"insight_stack","title":"O que o Eye-Tracking revela que designers não esperam","insights":[
    {"emoji":"👁️","title":"O padrão F e o padrão Z","text":"Em páginas de texto, o olho lê em F (duas horizontais e uma vertical). Em visuais, em Z (diagonal). O headline e o CTA precisam estar nas zonas de ativação — não onde o designer acha bonito."},
    {"emoji":"👶","title":"Rostos puxam o olhar","text":"A amígdala detecta rostos humanos em 13ms. Um rosto num banner rouba 70% da atenção — o que pode ajudar (criar conexão) ou atrapalhar (competir com o produto)."},
    {"emoji":"🔴","title":"O efeito da cor na periferia","text":"A visão periférica (fora do foco direto) só processa cor e movimento — não texto ou detalhe. A cor de fundo de um banner influencia mesmo quando o usuário 'não está olhando'."},
    {"emoji":"📏","title":"Espaço em branco não é vazio","text":"Eye-tracking mostra que espaço em branco direciona o olhar ao elemento principal com mais eficácia que bordas ou setas. Apple é mestre nisso."},
   ]},
   {"type":"scenario","title":"Redesign de embalagem","context":"Uma marca de sucos 'saudáveis' tem conversão baixa na gôndola. O produto tem boa qualidade mas a embalagem tem muita informação. Qual mudança neuro tem maior impacto?","choices":[
    {"label":"🌿 Aumentar o tamanho dos elementos naturais (frutas, folhas)","result":"Correto e poderoso. Elementos naturais (biofilia) reduzem cortisol e aumentam percepção de qualidade. Além disso, imagens de alimentos in natura ativam o córtex gustativo antes mesmo de saborear. Prioridade alta.","quality":"good"},
    {"label":"📝 Reduzir texto para apenas 3 elementos visuais principais","result":"Excelente! O cérebro em modo de compra (rápido, periférico) não lê texto — identifica padrões. Três elementos = o máximo que a memória de trabalho processa eficientemente. Menos informação, mais processamento.","quality":"good"},
    {"label":"🏷️ Adicionar selos e certificações de saúde","result":"Intuitivo mas contraproducente aqui. Mais elementos = mais carga cognitiva. Se o design já está sobrecarregado, selos adicionam ruído. Um selo bem posicionado pode funcionar — cinco criam confusão.","quality":"warning"},
   ]},
   {"type":"quiz","q":"Por que muitas marcas premium usam embalagens com muito espaço em branco?","opts":["É mais barato de produzir","O espaço em branco sinaliza exclusividade e força o cérebro a focar no produto — reduzindo carga cognitiva e aumentando percepção de valor","É tendência do design contemporâneo"],"correct":1,"why":"Roper e Fill (2012) documentaram que espaço em branco funciona como 'luxo visual' — o cérebro associa abundância de espaço com abundância de recursos. Marcas premium pagam caro por menos elementos."},
   {"type":"apply","text":"Escolha uma peça de design (embalagem, site, anúncio) que você criou ou admira. Analise: (1) Onde o olho vai primeiro? (2) Quais princípios Gestalt estão ativos? (3) Há algum elemento competindo com o foco principal? (4) O que acontece se você remover 30% dos elementos?"},
  ]
 },
 "ml4":{
  "title":"(In)consciente na Tomada de Decisão","emoji":"⚡",
  "key":"O inconsciente processa 11 milhões de bits/segundo. O consciente, apenas 40. A 'decisão racional' é frequentemente a racionalização de uma decisão já tomada.",
  "stages":[
   {"type":"hook","content":"Benjamin Libet mediu algo perturbador em 1983: a atividade elétrica que precede uma decisão começa 550ms ANTES da pessoa ter consciência de que decidiu. O livre-arbítrio, pelo menos no sentido clássico, pode ser uma ilusão — ou pelo menos uma narrativa posterior.","question":"Você realmente decide o que compra — ou o inconsciente decide e você rationaliza?"},
   {"type":"compare","title":"Processamento consciente vs. inconsciente","left":{"name":"Consciente","color":"#7dd3fc","emoji":"🧠","items":["40 bits/segundo de processamento","Serial (uma coisa por vez)","Lento — segundos a minutos","Linguagem e lógica","Consome muito energia (glicose)","Decide ~5% das nossas ações"]},"right":{"name":"Inconsciente","color":"#fb7185","emoji":"⚡","items":["11.000.000 bits/segundo","Paralelo (tudo simultâneo)","Rápido — milissegundos","Padrões, imagens, emoções","Eficiente energeticamente","Decide ~95% das nossas ações"]}},
   {"type":"conceito","title":"Os quatro tipos de processamento de decisão","content":"Gerald Zaltman (Harvard) mapeou como o cérebro decide de compra:","items":[
    {"emoji":"🦎","label":"Processamento automático","text":"Reflexos e hábitos. Compras habituais ('minha marca de sempre') não passam pela consciência. Uma vez instalado o hábito, é difícil competir."},
    {"emoji":"🎭","label":"Processamento emocional","text":"Memórias e emoções passadas moldam a resposta atual. Uma experiência ruim com uma marca pode persistir por anos no sistema emocional."},
    {"emoji":"🤝","label":"Processamento social","text":"O que 'pessoas como eu' fazem? Normas sociais são poderosas referências inconscientes. Por isso depoimentos e prova social funcionam."},
    {"emoji":"🧩","label":"Processamento racional","text":"Consciente e deliberado. Entra em cena quando as outras camadas não resolvem — ou quando o produto é de alto envolvimento (carro, imóvel)."},
   ]},
   {"type":"scenario","title":"Você está analisando por que um produto de alta qualidade não vende","context":"Um suplemento vitamínico tem formulação comprovadamente superior, preço competitivo e boas avaliações — mas vendas estagnadas. Pesquisa tradicional mostra satisfação alta entre quem já compra. O que o entendimento do inconsciente sugere?","choices":[
    {"label":"💰 Baixar o preço para estimular experimentação","result":"Contraproducente! Para produtos de saúde/suplementos, preço baixo ativa desconfiança inconsciente: 'se é tão bom, por que é barato?' A percepção de qualidade está associada ao preço nessa categoria.","quality":"warning"},
    {"label":"🔄 O produto não criou um gatilho de hábito — ele está fora da rotina do consumidor","result":"Exato! A maioria das compras repetidas são hábitos — não decisões conscientes. Se o suplemento não encontrou um 'slot' na rotina (junto com o café da manhã, antes de dormir), ele não existe na vida do consumidor. Solução: ancoragem comportamental (linked habits).","quality":"good"},
    {"label":"📣 Aumentar investimento em mídia paga para gerar mais awareness","result":"Awareness não é o problema — a qualidade e avaliações já provam isso. Mais mídia sem mudar a estratégia de hábito vai apenas desperdiçar budget. Primeiro resolva o mecanismo de adoção.","quality":"neutral"},
   ]},
   {"type":"quiz","q":"Gerald Zaltman afirma que 95% das decisões de compra são inconscientes. O que isso implica para pesquisas de mercado?","opts":["Pesquisa qualitativa é suficiente","Perguntar ao consumidor o que ele quer é fundamentalmente limitado — é preciso acessar o inconsciente via metáforas, imagens e técnicas projetivas (ZMET)","Dados de venda são suficientes"],"correct":1,"why":"A técnica ZMET (Zaltman Metaphor Elicitation Technique) usa imagens selecionadas pelos participantes para revelar estruturas mentais inconscientes. É radicalmente diferente de focus groups tradicionais porque não depende de autodeclaração."},
   {"type":"apply","text":"Conduza uma mini-pesquisa ZMET: peça a 3 consumidores do seu produto para trazerem 5 imagens (de qualquer fonte) que 'representam como se sentem ao usar o produto'. Analise os padrões — não as palavras que eles usam para explicar. O que as imagens revelam que as palavras não revelaram?"},
  ]
 },
 "ml5":{
  "title":"Processo de Tomada de Decisão no Consumo","emoji":"🗺️",
  "key":"A decisão de compra é uma sequência de heurísticas (atalhos) — e cada atalho é um ponto de influência.",
  "stages":[
   {"type":"hook","content":"O modelo clássico de marketing diz: problema → busca → avaliação → compra → pós-compra. O modelo neural diz: estímulo emocional → atalho mental → ação → justificativa. A diferença não é acadêmica — ela determina onde você deve investir no funil.","question":"Onde de verdade o consumidor decide? E como você pode estar lá?"},
   {"type":"flow","title":"O funil real de decisão do consumidor","steps":[
    {"icon":"💥","label":"Gatilho (consciente ou inconsciente)","text":"Pode ser uma necessidade real, um anúncio visto, um cheiro na rua, ou uma menção casual. O gatilho aciona o sistema de busca."},
    {"icon":"📱","label":"Momento de busca ('Zero Moment of Truth')","text":"Google, redes, influencers, amigos. Este é onde mais de 70% das decisões já estão em curso. A marca que não existe neste momento não existe para o consumidor."},
    {"icon":"🏪","label":"Primeiro Momento da Verdade (FMOT)","text":"O ponto de venda: físico ou digital. Aqui entram todas as heurísticas visuais: embalagem, posição, preço relativo, selos."},
    {"icon":"🎁","label":"Segundo Momento da Verdade (SMOT)","text":"A experiência com o produto. É onde marcas constroem (ou destroem) memórias emocionais que vão influenciar a próxima decisão."},
    {"icon":"📣","label":"Terceiro Momento — o consumidor vira mídia","text":"Compartilhamento, review, UGC. Este terceiro momento alimenta o Zero Moment de outros consumidores. O ciclo fecha."},
   ]},
   {"type":"conceito","title":"As 7 heurísticas de decisão do consumidor","content":"O cérebro usa atalhos para decidir rápido. Cada um é influenciável:","items":[
    {"emoji":"👑","label":"1. Reconhecimento de marca","text":"Simplesmente reconhecer uma marca já ativa preferência inconsciente (efeito de mera exposição). Marcas conhecidas exigem menos esforço cognitivo — o cérebro as 'prefere' por default."},
    {"emoji":"⭐","label":"2. Satisfação prévia","text":"A melhor heurística: 'funcionou antes'. Memória episódica positiva cria lealdade mais forte que qualquer campanha."},
    {"emoji":"👥","label":"3. O que outros como eu compram","text":"Prova social poderosa. 'Clientes que compraram X também compraram Y' é a implementação algorítmica desta heurística."},
    {"emoji":"💰","label":"4. Preço como indicador de qualidade","text":"Em categorias de alto risco (saúde, luxo, tecnologia), preço mais alto = qualidade percebida mais alta. Preço baixo demais pode ser fatal."},
    {"emoji":"🥇","label":"5. Primeiro da lista/prateleira","text":"Posição importa mais que a maioria das marcas aceita. O primeiro resultado de busca tem CTR 10x maior que o décimo."},
    {"emoji":"⏱️","label":"6. Escassez e urgência","text":"O cérebro valoriza mais o que pode perder. 'Últimas unidades' ativa amígdala mais que 'grande oferta'."},
    {"emoji":"🎁","label":"7. Reciprocidade","text":"Um brinde, uma amostra, um conteúdo útil cria senso de dívida inconsciente. O sistema límbico registra presentes e espera retribuição."},
   ]},
   {"type":"quiz","q":"Uma marca de software B2B quer aumentar conversão no trial gratuito. Qual mudança tem maior impacto segundo o entendimento de heurísticas?","opts":["Adicionar mais features ao trial","Fazer o trial com cartão de crédito (não cobrado) em vez de sem cartão — usando o efeito de posse e ancoragem","Reduzir o período do trial de 30 para 14 dias"],"correct":1,"why":"Pesquisas de SaaS consistentemente mostram que trials com cartão cadastrado (mas sem cobrança imediata) convertem 2-4x mais. O efeito: a pessoa 'já pagou psicologicamente' (ancoragem de posse) e cancelar requer mais esforço que continuar."},
   {"type": "compare", "title": "Envolvimento alto vs. baixo", "left": {"name": "Alto Envolvimento", "color": "#6366f1", "emoji": "🏠", "items": ["Imóvel, carro, plano de saúde", "Processo longo, múltiplas etapas", "Muito uso do pré-frontal", "Comparação racional intensiva", "Influência de família e especialistas"]}, "right": {"name": "Baixo Envolvimento", "color": "#10b981", "emoji": "🛒", "items": ["Sabão, cereal, pilhas", "Decisão automática em segundos", "Sistema límbico domina", "Hábito e familiaridade de marca", "Posição na gôndola é tudo"]}},{"type": "scenario", "title": "Lançamento de produto financeiro", "context": "Você lança um cartão de crédito premium. No ZMOT (busca online), a maioria pesquisa 'melhor cartão'. No FMOT (ponto de venda digital), a página de comparação converte pouco. O que a jornada de decisão revela?", "choices": [{"label": "💰 Melhorar os benefícios do cartão para vencer na comparação", "result": "Necessário mas insuficiente. Se todos os concorrentes já têm benefícios similares, a guerra de features exige muito do pré-frontal e acaba em empate — vencendo o mais barato. O problema está em outro ponto da jornada.", "quality": "neutral"}, {"label": "🧠 O ZMOT está errado: quem pesquisa 'melhor cartão' já está em modo comparação racional — precisamos capturar antes, no estágio emocional", "result": "Exato! O consumidor que pesquisa comparações já está no Sistema 2. Mas a decisão emocional de 'quero um cartão premium' aconteceu antes — nas redes sociais, com amigos, vendo influencers. Capturar nesse estágio com identidade e aspiração é mais eficaz que vencer a comparação racional.", "quality": "good"}, {"label": "📱 Investir em retargeting para quem visitou a página mas não converteu", "result": "Útil como tática de baixo funil, mas sem mudar o problema estrutural. Retargeting funciona bem para recuperar quem já decidiu — não para convencer quem está em dúvida fundamental.", "quality": "neutral"}]},{"type": "insight_stack", "title": "Descobertas sobre o processo de decisão", "insights": [{"emoji": "⏱️", "title": "A decisão média de FMCG: 3-7 segundos", "text": "Para produtos de consumo rápido, pesquisas de eye-tracking mostram que a decisão final na gôndola leva menos de 7 segundos. 90% do que acontece nesse tempo é processamento inconsciente de embalagem, cor e posição."}, {"emoji": "📱", "title": "O smartphone mudou o ZMOT para sempre", "text": "Google (2011) descobriu que o consumidor médio consulta 10,4 fontes antes de uma compra importante. Em 2024, esse número é estimado em 20+. O pré-compra digital é hoje mais determinante que o ponto de venda."}, {"emoji": "🔄", "title": "O momento pós-compra é o próximo ZMOT", "text": "O que você posta, avalia e compartilha após comprar alimenta o ZMOT de milhões de outros consumidores. Marcas que investem no pós-compra criam um flywheel de aquisição gratuito."}]},{"type":"apply","text":"Mapeie o funil de decisão para um cliente real. Para cada etapa (gatilho, ZMOT, FMOT, SMOT), liste: (1) Qual heurística está mais ativa? (2) O que sua marca faz bem ali? (3) O que um concorrente faz melhor? O gap entre 2 e 3 é seu roadmap de crescimento."},
  ]
 },
 "ml6":{
  "title":"Heurísticas e Vieses no Marketing","emoji":"🎲",
  "key":"Vieses não são falhas — são features do cérebro que evoluíram para sobrevivência. O marketing que entende isso não manipula: otimiza.",
  "stages":[
   {"type":"hook","content":"Daniel Kahneman ganhou o Nobel de Economia (2002) por provar que humanos não são racionais — são sistematicamente irracionais de maneiras previsíveis. Para o marketing, isso é ouro: se os erros são previsíveis, as oportunidades também são.","question":"Quais erros previsíveis do cérebro seu marketing ainda não está usando eticamente?"},
   {"type":"conceito","title":"Os vieses mais valiosos para o marketing","content":"Seleção dos vieses com maior ROI comprovado em aplicações de marketing:","items":[
    {"emoji":"⚓","label":"Ancoragem","text":"O primeiro número visto distorce tudo. 'De R$499 por R$249' funciona porque 499 âncora a percepção de valor. Mas âncoras também se formam com o produto mais caro do menu — que poucos compram, mas que existe para fazer o meio parecer razoável."},
    {"emoji":"😱","label":"Aversão à Perda (2x)","text":"Perder R$100 dói 2x mais que ganhar R$100 alegra. 'Você vai perder X por não assinar hoje' é neurologicamente mais poderoso que 'ganhe X assinando hoje'."},
    {"emoji":"🎰","label":"Efeito de Dotação","text":"Possuir algo aumenta seu valor percebido. Trials gratuitos, 'experimente em casa', 'retorne se não gostar' — criam posse antes da compra. Depois, devolver dói."},
    {"emoji":"🔍","label":"Viés de Confirmação","text":"Depois de decidir, buscamos informação que confirma. Reviews positivos pós-compra, emails de onboarding que reforçam 'você fez uma ótima escolha' reduzem dissonância cognitiva e churn."},
   ]},
   {"type":"scenario","title":"Pricing strategy com vieses","context":"Você precisa precificar um novo plano SaaS com 3 opções. Como estrutura os preços?","choices":[
    {"label":"Básico R$49 | Pro R$99 | Enterprise R$199","result":"Funciona, mas perde a chance de usar o 'efeito isca' (decoy). Sem uma opção que claramente parece pior que outra, o consumidor compara todos os três — e pode ficar paralisado ou escolher o mais barato.","quality":"neutral"},
    {"label":"Básico R$49 | Pro R$149 | Business R$159 (isca) | Enterprise R$299","result":"Excelente uso do Decoy Effect! O Business a R$159 (quase o mesmo preço que Pro a R$149 mas com menos features) faz o Pro parecer absurdamente vantajoso. A maioria migrará para o Pro. Dan Ariely documentou este efeito na The Economist com resultado de 84% escolhendo a opção 'armadilha'.","quality":"good"},
    {"label":"Apenas 1 plano com preço único, simples","result":"Elimina o paradoxo da escolha (menos decisão = mais conversão), mas perde a oportunidade de segmentação por disposição a pagar. Funciona melhor para produtos de entrada ou audiências avessas à complexidade.","quality":"neutral"},
   ]},
   {"type":"quiz","q":"O efeito de enquadramento (framing) diz que '90% de aprovação' e '10% de rejeição' são a mesma informação, mas produzem respostas diferentes. Por quê?","opts":["As pessoas não entendem estatística","O cérebro processa o frame emocional antes do conteúdo lógico — positivo vs negativo ativa circuitos neurais distintos antes da análise","É apenas percepção, sem base neural"],"correct":1,"why":"Estudos de fMRI (Kahneman, Tversky) mostram que 'positivo' e 'negativo' ativam regiões distintas do córtex pré-frontal antes do processamento lógico. O frame emocional é a primeira informação que o cérebro processa."},
   {"type": "insight_stack", "title": "Os vieses mais explorados no marketing digital", "insights": [{"emoji": "🎯", "title": "Bandwagon effect no e-commerce", "text": "'15 pessoas compraram nas últimas 24 horas' — Amazon e Booking são mestres em criar prova social em tempo real. O bandwagon effect (seguir a maioria) é especialmente forte em categorias de incerteza alta."}, {"emoji": "🔴", "title": "O viés de urgência e o custo do abuso", "text": "Estudos mostram que overuse de countdown timers (especialmente falsos) treinaram os consumidores a ignorá-los. Em 2018, pesquisa da CXL mostrou queda de 10-15% na eficácia de timers em sites que os usam em toda página."}, {"emoji": "💎", "title": "O Decoy Effect na precificação de SaaS", "text": "Dan Ariely documentou na The Economist: quando havia 2 opções (digital $59, impresso+digital $125), 68% escolhiam digital. Com a 'isca' (impresso $125), 84% escolhiam o combo. A isca que ninguém compra muda tudo."}, {"emoji": "🧪", "title": "Viés de confirmação em algoritmos", "text": "Os algoritmos de feed foram projetados para maximizar engajamento — e nosso viés de confirmação garante que conteúdo que confirma crenças retém mais atenção. Isso cria bolhas de filtro como efeito colateral de produto."}]},{"type": "compare", "title": "Enquadramento: a mesma mensagem, resultados opostos", "left": {"name": "Ganho", "color": "#4ade80", "emoji": "✅", "items": ["'Economize R$200 ao ano'", "'90% de satisfação'", "'Você vai ganhar X'", "Ativa sistema de recompensa", "Funciona melhor para compras hedônicas"]}, "right": {"name": "Perda", "color": "#fb7185", "emoji": "⚠️", "items": ["'Perca R$200 ao ano sem isso'", "'Evite 10% de insatisfação'", "'Não perca X'", "Ativa amígdala (medo da perda)", "2x mais motivador que ganho equivalente"]}},{"type":"apply","text":"Reescreva 3 elementos de comunicação da sua marca (headline, CTA, email subject) usando: (1) Aversão à perda em vez de ganho, (2) Ancoragem de preço, (3) Enquadramento positivo. A/B teste. A diferença de conversão vai te mostrar quanto cada viés vale em reais."},
  ]
 },
 "ml7":{
  "title":"Conexão Emocional e Consumo","emoji":"💞",
  "key":"Marcas com conexão emocional têm ticket médio 3,4x maior e churn 50% menor. Emoção não é soft — é o KPI mais duro que existe.",
  "stages":[
   {"type":"hook","content":"Apple não vende computadores. Harley-Davidson não vende motos. Starbucks não vende café. Eles vendem identidade, pertencimento e significado. E o cérebro processa 'eu me identifico com isso' de forma neurologicamente idêntica ao amor romântico — mesmas regiões, mesmos neurotransmissores.","question":"Sua marca faz o cérebro do consumidor sentir o que, exatamente?"},
   {"type":"conceito","title":"Os 4 níveis de conexão emocional com marca","content":"Pesquisa do Harvard Business Review com 300+ marcas mapeou a escada emocional:","items":[
    {"emoji":"😐","label":"Nível 1: Satisfação","text":"'Funciona como prometido.' Sem diferencial. Consumidores substituem por qualquer alternativa similar mais barata."},
    {"emoji":"😊","label":"Nível 2: Confiança","text":"'Sei que não vai me decepcionar.' Começa a reduzir a busca por alternativas. Mas ainda não é lealdade."},
    {"emoji":"🥰","label":"Nível 3: Afinidade","text":"'Eu gosto desta marca.' O consumidor defende a marca em conversas. Resistência moderada a substitutos."},
    {"emoji":"❤️","label":"Nível 4: Identificação","text":"'Esta marca me representa.' A marca se torna parte da identidade do consumidor. Lealdade quase irracional. NPS altíssimo. Tatuagem na pele (Harley-Davidson)."},
   ]},
   {"type":"insight_stack","title":"Neurociência da conexão afetiva com marcas","insights":[
    {"emoji":"🪞","title":"Neurônios-espelho e identificação","text":"Quando vemos alguém usando uma marca que admiramos, neurônios-espelho simulam a experiência em nós. Campanhas com personagens autênticos são simulações neurais gratuitas da experiência."},
    {"emoji":"🧠","title":"A mesma área que amar pessoas","text":"Uma pesquisa de neuroimagem (Yoon et al., 2006) mostrou que admiradores fervorosos de marcas ativam o córtex pré-frontal medial — a mesma região ativa no amor interpessoal."},
    {"emoji":"😢","title":"Perder uma marca é como uma perda real","text":"Quando marcas icônicas são descontinuadas, consumidores relatam 'luto'. Não é exagero — as estruturas neurais ativadas são as mesmas do luto."},
    {"emoji":"🛡️","title":"Amor de marca cria imunidade a crises","text":"Consumidores com alta identificação de marca processam informações negativas sobre ela com ativação menor do córtex de avaliação — literalmente as veem como menos ameaçadoras."},
   ]},
   {"type":"quiz","q":"Qual estratégia cria conexão emocional mais duradoura?","opts":["Campanhas de awareness massivas","Experiências marcantes no primeiro uso + comunicação de valores compartilhados + comunidade","Desconto frequente e promoções relâmpago"],"correct":1,"why":"A regra do pico-fim (Kahneman) mostra que lembramos experiências pelo pico emocional e pelo fim. Uma experiência de primeiro uso memorável + um encerramento poderoso (embalagem, onboarding, follow-up) cria a memória afetiva que gera lealdade."},
   {"type": "flow", "title": "Como construir conexão emocional sistematicamente", "steps": [{"icon": "🔍", "label": "1. Mapeie as emoções atuais", "text": "Pesquisa de marcador somático: que sentimentos o consumidor tem antes, durante e depois do uso? Honestidade aqui é tudo."}, {"icon": "🎯", "label": "2. Identifique a emoção-âncora", "text": "Qual emoção, se amplificada, mais contribui para lealdade? Geralmente é uma das: pertencimento, orgulho, alívio, ou admiração."}, {"icon": "🎭", "label": "3. Crie experiências de pico", "text": "Design o momento mais intenso da experiência (regra do pico-fim). Unboxing, onboarding, primeiro resultado — qual é o seu 'pico'?"}, {"icon": "🔄", "label": "4. Feche com memória", "text": "O fim da experiência é tão importante quanto o pico. Email de confirmação, embalagem de retorno, suporte pós-compra — o fim define a memória."}, {"icon": "🌱", "label": "5. Cultive ao longo do tempo", "text": "Conexão emocional não é campanha — é operação contínua. Cada touchpoint é um voto a favor ou contra a relação."}]},{"type": "scenario", "title": "Marca sob crise de reputação", "context": "Uma marca de alimentação infantil que tem alta conexão emocional com mães é atingida por notícia de recall de produto. Como a conexão emocional influencia a gestão da crise?", "choices": [{"label": "📢 Responder com dados e fatos sobre a segurança do produto", "result": "Necessário, mas incompleto. Dados ativam o córtex analítico — mas a crise já está no sistema emocional das consumidoras. Fatos não desativam a amígdala ativada por medo de segurança dos filhos.", "quality": "neutral"}, {"label": "💞 Comunicar com empatia primeiro, depois transparência total e ação concreta", "result": "Correto para marcas com conexão emocional alta! Pesquisas de gestão de crise mostram que marcas amadas têm muito mais crédito com consumidoras — mas apenas se a comunicação honrar a relação afetiva. Empatia genuína + transparência + ação = preservação da lealdade em 70% dos casos de marcas de alta conexão.", "quality": "good"}, {"label": "🤫 Gerenciar silenciosamente para não amplificar", "text": "Erro clássico. Silêncio em crise de marca com consumidoras altamente engajadas é interpretado como culpa e descaso. O vínculo emocional cria expectativa de comunicação direta.", "quality": "warning"}]},{"type":"apply","text":"Mapeie as emoções que sua marca provoca em cada touchpoint. Para cada emoção mapeada, classifique em 0 (indiferença) a 4 (identificação). Some os pontos. Onde está sua média? E qual touchpoint tem a maior queda? Aquele é o seu maior risco de churn."},
  ]
 },
 "ml8":{
  "title":"Cognição, Memória e Aprendizagem","emoji":"🗂️",
  "key":"Memória de marca não é recall — é a reconstituição ativa de experiências emocionalmente marcadas.",
  "stages":[
   {"type":"hook","content":"Você provavelmente lembra do cheiro da casa da sua avó com mais nitidez do que do que comeu na semana passada. Isso não é acidente — é arquitetura neural. E marcas que entenderam essa arquitetura constroem presença permanente na memória dos consumidores.","question":"Que memória sua marca está criando — e em qual sistema de memória ela mora?"},
   {"type":"flow","title":"Os 4 sistemas de memória relevantes para marketing","steps":[
    {"icon":"⚡","label":"Memória Sensorial (1-3 segundos)","text":"Tudo que seus sentidos captam. 99,9% é descartado imediatamente. O que sobrevive: emocionalmente relevante ou repetido."},
    {"icon":"🔄","label":"Memória de Trabalho (segundos-minutos)","text":"'RAM' do cérebro. Capacidade: 7±2 itens (Miller, 1956). Sobrecarregar com informação mata a retenção. Design e comunicação devem respeitar esse limite."},
    {"icon":"📚","label":"Memória de Longo Prazo Explícita","text":"Fatos e episódios. O nome da marca, a proposta de valor, a história. Construída por repetição espaçada e conexão emocional."},
    {"icon":"🤖","label":"Memória Implícita/Procedural","text":"Hábitos e associações automáticas. Quando você 'pensa em refrigerante', qual cor vem primeiro? Isso é memória implícita de marca — o mais valioso e difícil de construir."},
   ]},
   {"type":"conceito","title":"Efeitos de memória exploráveis em marketing","content":"Fenômenos cognitivos com aplicações diretas:","items":[
    {"emoji":"📍","label":"Efeito Von Restorff","text":"O diferente é lembrado. Um único elemento visual radicalmente diferente em uma categoria toda igual pode garantir recall de 80%. É o científico por trás de 'seja o polegar vermelho entre polegares cinzas'."},
    {"emoji":"🔁","label":"Efeito de Espaçamento","text":"Repetição distribuída no tempo cria memória mais forte que repetição concentrada. Jingle ouvido 3x em 3 semanas > 9x em 1 dia. Implicação: calendário de mídia importa tanto quanto verba."},
    {"emoji":"🔚","label":"Regra do Pico-Fim","text":"Lembramos experiências pelo momento mais intenso e pelo final. Um produto mediano com um final memorável (embalagem premium, email de confirmação criativo) é mais lembrado que um produto excelente com final indiferente."},
    {"emoji":"🌐","label":"Efeito de Profundidade de Processamento","text":"Informações que exigem elaboração ativa (reflexão, conexão com o próprio) são lembradas muito mais. Perguntar ao consumidor em vez de afirmar = memória mais profunda."},
   ]},
   {"type":"quiz","q":"Por que repetir o mesmo anúncio 15 vezes na mesma semana pode ser menos eficaz que veiculá-lo 5 vezes ao longo de 5 semanas?","opts":["É mais caro veicular em mais semanas","O efeito de espaçamento: intervalos entre exposições fortalecem consolidação de memória. Exposições concentradas geram desgaste e resistência (wear-out)","Algoritmos penalizam alta frequência"],"correct":1,"why":"Pesquisa clássica de Ebbinghaus (curva do esquecimento) e replicações modernas mostram que recall cai rapidamente após exposição concentrada mas se recupera e acumula com exposições espaçadas. A memória se consolida nos intervalos, não durante a exposição."},
   {"type": "scenario", "title": "Campanha de lançamento com memória de longo prazo", "context": "Você tem R$2M para lançar uma nova marca de bebida energética. O objetivo é criar memória de marca duradoura — não só awareness imediato. Como você aloca?", "choices": [{"label": "📺 80% em mídia massiva (TV + digital) em 1 mês intenso", "result": "Alto awareness imediato, memória fraca. O efeito de wear-out é rápido: após 72h da última exposição, o recall cai vertiginosamente. Ótimo para promoção de prazo, péssimo para construção de marca.", "quality": "neutral"}, {"label": "🔄 Distribua em 8 meses com 3-4 exposições por semana — e invista 20% em experiências físicas únicas", "result": "Uso correto do efeito de espaçamento! Exposições distribuídas + consolidação noturna cria memória de longo prazo real. A experiência física (ativação, evento, sampling) adiciona codificação multi-sensorial — o tipo de memória mais duradouro e de maior recall.", "quality": "good"}, {"label": "📱 100% em influencers digitais segmentados", "result": "Altamente relevante para o público de energético, mas sozinho perde a repetição estruturada necessária para memória de longo prazo. Influencers criam awareness e prova social — não substituem a frequência espaçada.", "quality": "neutral"}]},{"type": "insight_stack", "title": "Como as marcas criam memória implícita", "insights": [{"emoji": "🎵", "title": "Sonic branding: a memória que você não sabe que tem", "text": "O jingle do McDonald's ('I'm lovin' it') foi criado com base em pesquisa de memória musical. Sons ativam o hipocampo de forma diferente de imagens — criando memória emocional mais durável. Intel, Nokia e Netflix construíram identidades sonoras que disparam reconhecimento em menos de 1 segundo."}, {"emoji": "🎨", "title": "Memória de cor: o Pantone de marca", "text": "Pesquisas mostram que consumidores reconhecem marcas pela cor antes do logo em 80% dos casos. A cor de marca precisa de consistência de décadas para criar memória implícita. Variar muito a paleta destrói anos de investimento em memória."}, {"emoji": "🔁", "title": "Repetição espaçada para brand salience", "text": "Byron Sharp (Como as Marcas Crescem) documentou que brand salience — vir à mente primeiro na categoria — é resultado de exposições frequentes e espaçadas. Não é sobre amar a marca, é sobre estar disponível mentalmente no momento da compra."}]},{"type":"apply","text":"Audit de memória da sua marca: (1) Qual associação sensorial você criou? (cheiro, cor, som, textura) (2) Qual é o 'pico' e o 'fim' da experiência do cliente? (3) Com que frequência e espaçamento sua marca aparece na vida do consumidor? Onde há gap entre o que você quer que seja lembrado e o que provavelmente é lembrado?"},
  ]
 },
 "ml9":{
  "title":"O Poder do Storytelling","emoji":"🎭",
  "key":"Histórias são a tecnologia original de transmissão cultural. O cérebro evoluiu para ser capturado por narrativas — marcas que entendem isso têm vantagem evolutiva.",
  "stages":[
   {"type":"hook","content":"Quando você lê uma lista de fatos, ativam 2 áreas cerebrais. Quando você lê uma história com os mesmos fatos, ativam 7 áreas — incluindo regiões sensoriais e motoras. Uma história faz o cérebro simular a experiência. Dados informam. Histórias transformam.","question":"O que sua marca narra — e quem é o herói dessa história?"},
   {"type":"conceito","title":"A estrutura narrativa que o cérebro ama","content":"Joseph Campbell mapeou o monomito — o padrão narrativo universal que aparece em todas as culturas. Marcas de sucesso seguem essa estrutura:","items":[
    {"emoji":"🌍","label":"O Mundo Comum","text":"Quem é o consumidor antes da marca? Qual é sua situação atual, suas frustrações, seus desejos não atendidos?"},
    {"emoji":"⚡","label":"O Chamado à Aventura","text":"O problema que a marca resolve. Não o produto — o problema. 'E se houvesse uma maneira de...'"},
    {"emoji":"🗡️","label":"O Mentor / A Ferramenta","text":"Aqui entra a marca — não como herói, como MENTOR. O herói é sempre o consumidor. A marca é o Gandalf, não o Frodo."},
    {"emoji":"🏆","label":"A Transformação","text":"Como fica o consumidor depois? Qual versão melhor de si mesmo ele se torna usando a marca?"},
   ]},
   {"type":"scenario","title":"Qual narrativa de marca funciona?","context":"Uma marca de tênis de corrida quer lançar uma campanha. Qual abordagem storytelling vai mais fundo?","choices":[
    {"label":"🏅 Atletas profissionais usando o tênis em competições de elite","result":"Alta aspiração, mas baixa identificação. A distância entre o consumidor médio e um atleta olímpico é grande demais para a simulação neural. O consumidor admira — mas não se vê ali. Funciona para construção de marca, pouco para conversão.","quality":"neutral"},
    {"label":"🧑 'Eu nunca fui de correr. Aos 42, comecei com 2km. Hoje faço maratonas.' — consumidor real","result":"Poderoso! A história real de alguém similar ao consumidor ativa neurônios-espelho com máxima eficiência. A jornada de transformação completa o monomito. O consumidor não está comprando um tênis — está comprando a possibilidade de ser aquela versão transformada de si mesmo.","quality":"good"},
    {"label":"📊 Dados de performance: amortecimento 38% melhor, durabilidade 2x maior","result":"Funciona para alta racionalidade e alta intenção (quem já quer comprar e está comparando). Mas como 'entrada' para quem ainda não considerou a marca, dados falam ao córtex enquanto a decisão já foi tomada (ou não) pelo sistema emocional.","quality":"neutral"},
   ]},
   {"type":"insight_stack","title":"O que a neurociência sabe sobre histórias","insights":[
    {"emoji":"🔗","title":"Acoplamento neural (Neural coupling)","text":"Uri Hasson (Princeton) mostrou que quando alguém conta uma história, o cérebro do ouvinte sincroniza com o do narrador — mesmas regiões ativas, mesmos padrões. É literalmente transmissão de experiência."},
    {"emoji":"💉","title":"Oxitocina e narrativa","text":"Paul Zak descobriu que histórias com tensão narrativa aumentam ocitocina no sangue dos espectadores — e ocitocina alta prediz comportamento pró-social (doação, compra, recomendação)."},
    {"emoji":"🧠","title":"Transporte narrativo","text":"Pessoas 'transportadas' por uma história (completamente absortas) têm menor resistência persuasiva e maior intenção de mudança de comportamento. Quanto mais imersiva, mais influente."},
    {"emoji":"📱","title":"Histórias de 6 palavras","text":"Hemingway: 'For sale: baby shoes, never worn.' Neuralmente, o cérebro completa a história. Mecanismo de fechamento (Gestalt) cria engajamento mais poderoso que a história explicitada."},
   ]},
   {"type":"quiz","q":"Por que campanhas com 1 criança patrocinada (com nome, foto e história) geram mais doações que campanhas que mostram '1 milhão de crianças em situação de risco'?","opts":["Pessoas preferem casos individuais por egoísmo","O 'efeito de vítima identificável': o cérebro processa 1 pessoa concreta com empatia máxima; grandes números ativam o córtex analítico, que processa distância emocional","Fotos de crianças são mais atraentes visualmente"],"correct":1,"why":"Paul Slovic documentou o 'collapse of compassion' — empatia NÃO escala. 1 criança > 2 > 3 em termos de ativação emocional e doação. O sistema emocional processa indivíduos concretos; grandes números são abstratos para o sistema emocional."},
   {"type":"apply","text":"Escreva a história da sua marca usando o monomito em 5 frases: (1) Quem é o herói (seu consumidor)? (2) Qual é o mundo dele antes? (3) Qual o problema/chamado? (4) Como sua marca é o mentor que dá a ferramenta? (5) Quem ele se torna? Valide: a marca é o mentor, nunca o herói."},
  ]
 },
 "ml10":{
  "title":"Neurociência e Persuasão","emoji":"🎯",
  "key":"Persuasão ética usa a ciência do cérebro para facilitar decisões que beneficiam o consumidor — não para sequestrar sua agência.",
  "stages":[
   {"type":"hook","content":"Robert Cialdini estudou por 3 anos, infiltrado, os mestres da persuasão — vendedores, marqueteiros, arrecadadores de doações. O resultado: 6 princípios universais que funcionam porque se conectam a necessidades neurais evolutivamente profundas. Mas esses mesmos princípios podem ser usados para ajudar ou para manipular.","question":"Qual é a linha entre persuasão ética e manipulação?"},
   {"type":"conceito","title":"Os 7 princípios de Cialdini (incluindo o novo)","content":"2021: Cialdini adicionou um 7º princípio ao seu modelo clássico:","items":[
    {"emoji":"🎁","label":"1. Reciprocidade","text":"Dar primeiro cria obrigação inconsciente. Conteúdo gratuito, amostra, brinde. Neuronal: ocitocina e senso de dívida social."},
    {"emoji":"🔗","label":"2. Compromisso & Coerência","text":"Após um pequeno 'sim', a pessoa mantém consistência. Onboarding que pede pequenas ações cria comprometimento crescente."},
    {"emoji":"👥","label":"3. Prova Social","text":"Seguimos o que 'pessoas como nós' fazem. Poderoso quando a referência é específica ('clientes do seu setor') não genérica."},
    {"emoji":"🎓","label":"4. Autoridade","text":"Especialistas, certificações, dados. Reduz o esforço cognitivo de avaliar — o cérebro delega a avaliação."},
    {"emoji":"💛","label":"5. Afinidade / Afeição","text":"Compramos de quem gostamos. Similaridade, elogio genuíno, rapport. Ativa neurônios-espelho e empatia."},
    {"emoji":"⏳","label":"6. Escassez","text":"Raro é mais valioso. Ativa amígdala e aversão à perda. O mais poderoso — e o mais abusado."},
    {"emoji":"🤝","label":"7. Unidade (NOVO)","text":"Não é apenas afinidade — é identidade compartilhada. 'Nós' vs. 'eles'. Pertencer ao mesmo grupo cria confiança profunda. Comunidades de marca ativam este princípio."},
   ]},
   {"type":"quiz","q":"Qual versão de um email de vendas usa Cialdini mais efetivamente?","opts":["'Nossa solução tem 98% de satisfação. Clique aqui para conhecer.'","'João, vi que você é do setor de educação — 84% das EdTechs que usam nossa plataforma triplicaram retenção em 90 dias. Posso te mostrar o caso da [empresa similar à sua]?'","'Oferta exclusiva por 24 horas! Não perca!'"],"correct":1,"why":"A segunda versão usa nome (afinidade), prova social específica ao setor (prova social + autoridade), dado concreto (autoridade) e referência personalizada (unidade + afinidade). É muito mais persuasiva que a urgência vazia da terceira."},
   {"type":"scenario","title":"Ética da persuasão","context":"Você tem um produto SaaS que é genuinamente bom mas tem uma interface desafiadora. As avaliações mencionam a curva de aprendizado. Como você usa persuasão eticamente?","choices":[
    {"label":"🚫 Esconder ou minimizar o feedback negativo sobre a curva de aprendizado","result":"Dark pattern ético. Viola a confiança e cria dissonância cognitiva pós-compra quando a dificuldade aparece. O consumidor se sentiu enganado. Churn e reviews negativos são consequências certas.","quality":"warning"},
    {"label":"✅ Antecipar a objeção: 'Sim, tem curva de aprendizado. Veja o que clientes dizem após 30 dias.'","result":"Persuasão ética e muito mais eficaz! Antecipar objeções (inoculação de objeção) reduz resistência. A honestidade inesperada cria credibilidade — o que dito negativo sobre si mesmo é processado como mais verdadeiro. E os depoimentos pós-30-dias endereçam exatamente o medo.","quality":"good"},
    {"label":"🎮 Gamificar o onboarding para tornar a curva menos dolorosa","result":"Boa estratégia complementar! Mas por si só não é persuasão — é melhoria de produto. Combine com a abordagem anterior para o impacto máximo.","quality":"neutral"},
   ]},
   {"type": "insight_stack", "title": "Cialdini na prática — casos reais", "insights": [{"emoji": "🏥", "title": "Reciprocidade que salvou vidas", "text": "Hospital britânico adicionou histórias pessoais dos médicos nos pedidos de doação de órgãos. Taxa de consentimento subiu 47%. A reciprocidade era simbólica (o médico se abria), mas o efeito foi real e mensurável."}, {"emoji": "☎️", "title": "O pé na porta que funcionou", "text": "Freedman & Fraser (1966): quem concordou com um pequeno adesivo na janela aceitou 3x mais uma placa grande no jardim depois. O 'sim' pequeno cria identidade de 'pessoa que apoia esta causa' — e a coerência mantém a identidade."}, {"emoji": "🍽️", "title": "Prova social específica bate genérica", "text": "Airbnb testou 'Outros viajantes adoram este destino' vs. 'Viajantes do Brasil adoram este destino' vs. 'Viajantes de São Paulo adoram este destino'. A prova social hiperlocal converteu 2,4x mais que a genérica."}, {"emoji": "🤝", "title": "Unidade em B2B: o poder do 'nós'", "text": "Vendors que criam comunidades de clientes (grupos de WhatsApp, fóruns privados, encontros) usam o princípio da Unidade. Clientes que se sentem parte de um grupo têm churn 40-60% menor — o custo de sair é social, não só financeiro."}]},{"type": "compare", "title": "Influência legítima vs. manipulação", "left": {"name": "Influência ética", "color": "#4ade80", "emoji": "✅", "items": ["Informação verdadeira e completa", "Escassez real existente", "Prova social de pessoas reais", "Urgência com prazo genuíno", "O consumidor ficaria satisfeito sabendo da técnica"]}, "right": {"name": "Manipulação", "color": "#fb7185", "emoji": "⚠️", "items": ["Omissão de informação relevante", "Escassez fabricada (timer falso)", "Reviews falsos ou pagos não declarados", "Urgência artificial e renovável", "O consumidor se sentiria enganado sabendo"]}},{"type":"apply","text":"Faça o audit de persuasão da sua comunicação atual. Para cada um dos 7 princípios de Cialdini, identifique: (1) Você usa? (2) Onde? (3) É específico ou genérico? (4) Está dentro da ética? A grande maioria das comunicações usa apenas 1-2 princípios. Ativar 4+ de forma integrada pode dobrar conversão."},
  ]
 },
 "ml11":{
  "title":"Nudges, Gatilhos e Consumo","emoji":"👋",
  "key":"Nudge não é manipulation — é arquitetura de escolha que facilita a decisão que o próprio consumidor deseja tomar.",
  "stages":[
   {"type":"hook","content":"Em 2012, o governo inglês criou o 'Behavioural Insights Team' (Nudge Unit). Resultado: doações de órgãos subiram 96.000 por ano com uma única mudança — a opção padrão. Nenhuma obrigação. Nenhuma multa. Apenas arquitetura de escolha. Nudges são a política pública mais eficiente que existe — e também a ferramenta de marketing mais subestimada.","question":"Quantas decisões do seu consumidor você poderia facilitar — sem mudar o produto?"},
   {"type":"conceito","title":"Os tipos de nudge com maior eficácia comprovada","content":"Richard Thaler e Cass Sunstein (Nobel, 2017) mapearam os nudges mais eficazes:","items":[
    {"emoji":"📌","label":"Default (Opção Padrão)","text":"A escolha que já vem selecionada. O mais poderoso de todos. Doação de órgãos opt-out vs. opt-in: diferença de 30% para 90% de participação. Para marcas: plano recomendado, configurações pré-definidas."},
    {"emoji":"📏","label":"Simplificação","text":"Quanto mais simples a decisão, mais ela é tomada. Reduzir campos de cadastro de 10 para 4 pode dobrar conversão. Tornar um comportamento 'fácil' aumenta sua frequência."},
    {"emoji":"💬","label":"Norma Social","text":"'90% dos seus vizinhos já pagaram a conta de energia deste mês.' Mais eficaz que multa. A pressão normativa é neurologicamente mais poderosa que a financeira."},
    {"emoji":"⏰","label":"Timing","text":"O mesmo nudge tem eficácia diferente em momentos diferentes. Pedir doação imediatamente após uma boa notícia. Oferecer upgrade no momento de maior satisfação (pós-solução de problema)."},
    {"emoji":"🧭","label":"Saliência","text":"Tornar a informação relevante mais visível no momento da decisão. Nutri-score, calorias no cardápio, custo total em vez de parcela."},
   ]},
   {"type":"quiz","q":"Uma academia quer reduzir cancelamentos. Qual nudge tem mais evidência de eficácia?","opts":["Oferecer desconto de renovação no mês do aniversário do cliente","Enviar mensagem de texto na manhã do dia em que o cliente costuma ir à academia ('Bom dia! Hoje é seu dia de treino') — reforçando o hábito existente","Criar programa de pontos por check-in"],"correct":1,"why":"O SMS de implementação de intenção ('quando X acontecer, farei Y') tem evidência robusta de adesão a comportamentos de saúde. O simples reminder no timing exato do hábito aumenta frequência de visitas em 20-35% em estudos peer-reviewed."},
   {"type":"scenario","title":"Nudge ético vs. dark pattern","context":"Uma plataforma de streaming quer reduzir churn no momento de cancelamento. Quais das seguintes práticas são nudges éticos?","choices":[
    {"label":"⏸️ Oferecer 'pausar assinatura' em vez de só 'cancelar'","result":"Nudge ético claro! Adiciona uma opção intermediária que serve genuinamente o consumidor que quer uma pausa temporária. Reduz churn real. Serve o interesse do usuário.","quality":"good"},
    {"label":"😢 Mostrar imagem emotiva ('Vamos sentir sua falta!') e esconder o botão de cancelamento","result":"Dark pattern. Usar emoção para dificultar o exercício de um direito é manipulação. Viola princípios de design ético e em muitos países já é ilegal (EU Digital Markets Act, LGPD).","quality":"warning"},
    {"label":"📊 Mostrar quantas horas de conteúdo o usuário tem disponível que ainda não assistiu","result":"Nudge ético com eficácia comprovada. Saliência de valor: lembrar o que o usuário já pagou e ainda não usou ativa aversão à perda genuína — mas de algo real. É informação relevante apresentada no momento certo.","quality":"good"},
   ]},
   {"type": "compare", "title": "Nudge vs. Dark Pattern", "left": {"name": "Nudge ético", "color": "#4ade80", "emoji": "👋", "items": ["Facilita a decisão que o consumidor QUER tomar", "Reversível facilmente", "Transparente se perguntado", "Beneficia consumidor E empresa", "Exemplos: default de doação, simplificação de fluxo"]}, "right": {"name": "Dark Pattern", "color": "#fb7185", "emoji": "☠️", "items": ["Induz decisão que beneficia só a empresa", "Difícil de reverter", "Obscuro e enganoso", "Prejudica o consumidor", "Exemplos: cancelamento em labirinto, confirmshaming"]}},{"type": "insight_stack", "title": "Nudges que mudaram o mundo — casos reais", "insights": [{"emoji": "🫀", "title": "Doação de órgãos: opt-out salvou 96 mil vidas/ano", "text": "A mudança do default de 'opt-in' para 'opt-out' em doação de órgãos no Reino Unido gerou 96.000 doadores extras ao ano — sem nenhuma lei obrigatória. O comportamento padrão é permanecer como está. Design esse padrão."}, {"emoji": "💰", "title": "Save More Tomorrow: aposentadoria automática", "text": "Thaler e Benartzi criaram programa onde funcionários concordavam em destinar aumentos futuros para aposentadoria. Resultado: taxa de poupança subiu de 3,5% para 13,6% em 40 meses. Ninguém perdeu dinheiro presente — só comprometeu ganhos futuros."}, {"emoji": "🥗", "title": "Cantina escolar e a posição do salada", "text": "Mover a salada para a primeira posição na linha do almoço escolar aumentou consumo de vegetais em 35%. Sem proibição de outras opções. Sem incentivo financeiro. Apenas arquitetura de escolha."}, {"emoji": "📧", "title": "'A maioria dos seus vizinhos pagou' — OPOWER", "text": "A empresa Opower usou norma social descritiva (o que outros fazem) em contas de energia. Resultado: 6 terawatts-hora economizados — mais impactante que qualquer multa ou incentivo financeiro testado anteriormente."}]},{"type":"apply","text":"Identifique 3 pontos de decisão na jornada do seu consumidor (cadastro, primeira compra, renovação, reativação). Para cada um: (1) Qual é o comportamento desejado? (2) Qual default você poderia criar? (3) Qual norma social poderia citar? (4) Como simplificar o caminho? Implemente e meça."},
  ]
 },
 "ml12":{
  "title":"Neurociência e Vendas","emoji":"🤝",
  "key":"Vender é criar alinhamento neural entre o estado do comprador e a solução. Os melhores vendedores fazem isso intuitivamente — a ciência explica por que funciona.",
  "stages":[
   {"type":"hook","content":"Pesquisa de 2018 (Openview Partners): vendedores de alto desempenho têm uma característica neural incomum — muito baixa atividade da amígdala (alarme de ameaça) em conversas de alta pressão. Eles literalmente não sentem o 'medo de rejeição' do mesmo jeito. Mas o mais importante: eles treinaram isso, não nasceram assim.","question":"O que os melhores vendedores fazem neurologicamente — que outros não fazem?"},
   {"type":"flow","title":"O processo neural de uma venda","steps":[
    {"icon":"🤝","label":"Rapport (Espelhamento)","text":"Matching de tom, ritmo e postura ativa neurônios-espelho. Cria senso inconsciente de similaridade. O comprador relaxa — a amígdala baixa o alarme."},
    {"icon":"🎯","label":"Descoberta (Escuta Ativa)","text":"Perguntas abertas ativam o modo narrativo do comprador. Quando alguém fala de si mesmo, o cérebro libera dopamina — a conversa se torna prazerosa."},
    {"icon":"💡","label":"Insight (O 'A-ha!')","text":"O melhor momento para a solução não é quando o vendedor a apresenta — é quando o comprador a descobre. Perguntas que levam ao insight são mais poderosas que demonstrações."},
    {"icon":"🎭","label":"Storytelling de caso","text":"Um cliente similar que resolveu o mesmo problema. Neurônios-espelho simulam a experiência. É mais convincente que dados porque cria empatia e identificação."},
    {"icon":"✅","label":"Comprometimento incremental","text":"Pequenos 'sins' ao longo da conversa criam coerência. O grande 'sim' do fechamento é precedido por 7-12 microcompromissos."},
   ]},
   {"type":"conceito","title":"PNL e neuromarketing em vendas — o que funciona","content":"Distinguindo ciência de mito:","items":[
    {"emoji":"✅","label":"O que funciona (evidenciado)","text":"Espelhamento postural aumenta rapport. Usar o nome do interlocutor ativa atenção preferencial. Perguntar antes de afirmar aumenta persuasão. Timing de oferta após momento positivo aumenta aceitação."},
    {"emoji":"⚠️","label":"O que é exagerado (parcial)","text":"Padrões de movimento ocular como indicadores de mentira: sem consistência em estudos controlados. PNL como 'ciência' da mente: muitas afirmações sem replicação."},
    {"emoji":"🔬","label":"O que claramente funciona: oxitocina","text":"Toque físico leve aumenta oxitocina e aceitação de pedidos. Um toque no ombro por 1-2 segundos aumenta pedidos atendidos em 22% (estudos de gorjeta, 1988)."},
   ]},
   {"type":"quiz","q":"Em uma negociação, quando é o melhor momento para fazer uma concessão?","opts":["No início, para criar boa vontade","Após o outro lado fazer uma concessão — e verbalmente nomear isso como reciprocidade","No final, quando o acordo está quase fechado"],"correct":1,"why":"A reciprocidade funciona melhor quando: (1) a concessão é inesperada, (2) é nomeada explicitamente ('estou fazendo isso porque você caminhou em X'), e (3) vem após uma concessão do outro lado. A sequência ativa o senso de obrigação e move o sistema límbico para modo colaborativo."},
   {"type": "insight_stack", "title": "O que neurofisiologia revela sobre vendas de alto desempenho", "insights": [{"emoji": "🔉", "title": "Tom de voz importa mais que o conteúdo", "text": "UCLA (Mehrabian): 38% da percepção de confiança vem do tom de voz, 55% da linguagem corporal, apenas 7% das palavras. Em calls de venda, pesquisa da Gong.ai analisou 1M+ de chamadas: top performers falam em tom mais baixo e mais lento nos momentos-chave de fechamento."}, {"emoji": "🤫", "title": "O silêncio como ferramenta", "text": "Análise da Gong.ai: após fazer uma pergunta de fechamento, vendedores de alto desempenho esperam em média 6 segundos. Medianos: 1,5 segundos. O silêncio cria desconforto que o comprador preenche — frequentemente com informações ou compromisso."}, {"emoji": "❓", "title": "Perguntas abertas geram dopamina", "text": "Quando respondemos uma pergunta aberta, o cérebro libera dopamina similar à que sente ao compartilhar nas redes sociais. Um comprador que fala de suas necessidades está literalmente sentindo prazer — e associando esse prazer ao vendedor."}, {"emoji": "🔗", "title": "Labeling: nomear a emoção do comprador", "text": "Técnica do FBI de negociação (Chris Voss): nomear a emoção percebida reduz sua intensidade e cria rapport profundo. 'Parece que você está preocupado com o prazo de implementação.' O comprador se sente entendido — a amígdala baixa a guarda."}]},{"type": "scenario", "title": "Negociação difícil — cliente em vantagem", "context": "O cliente diz: 'O concorrente oferece a mesma coisa por 30% menos. Por que eu compraria de você?' Como você responde usando neurociência?", "choices": [{"label": "💰 Justificar o preço com lista de features e ROI", "result": "Fraco início. O cliente já está no modo racional-comparativo. Uma lista de features confirma que ele DEVE comparar — e você acaba na guerra de preços que quer evitar. Além disso, o Sistema 1 já decidiu que 'caro demais'.", "quality": "neutral"}, {"label": "🔍 'O que te faria ter certeza de que o investimento extra valeu?' (labeling + pergunta aberta)", "result": "Excelente! Esta abordagem: (1) valida que há uma diferença de preço real, (2) usa pergunta aberta que faz o cliente articular seus próprios critérios de valor, (3) quando ele responde, ele está se convencendo — não você o convencendo. O System 1 percebe aliança, não confronto.", "quality": "good"}, {"label": "🏆 Focar no diferencial de qualidade e na reputação da sua empresa", "result": "Melhor que features, mas ainda é você falando. O problema: qualquer coisa que você diz sobre si mesmo tem credibilidade reduzida (viés de autosserviço). O que o cliente diz sobre seus próprios critérios tem credibilidade máxima.", "quality": "neutral"}]},{"type":"apply","text":"Grave (com permissão) 3 conversas de venda. Analise: (1) Em que % do tempo o vendedor fala vs. ouve? (ideal: 40% fala, 60% ouve) (2) Quantas perguntas abertas por conversa? (3) Em que momento a solução é apresentada? (4) O cliente teve algum 'A-ha' espontâneo? Ajuste e compare resultados na semana seguinte."},
  ]
 },
 "ml13":{
  "title":"Synapticbrain: Marcas e o Cérebro","emoji":"🔗",
  "key":"Uma marca forte é uma rede neural — quanto mais conexões cria, mais forte e resistente ela fica.",
  "stages":[
   {"type":"hook","content":"Em experimento clássico (McClure et al., 2004), pessoas preferiam Pepsi em teste cego. Com o logo visível, preferiam Coca-Cola — com ativação diferente do córtex pré-frontal medial. Não é fidelidade irracional: a marca Coca-Cola ativou redes neurais de memória, identidade e recompensa que a Pepsi não tinha construído. O logo não é visual — é um gatilho neural.","question":"O que seu logo dispara no cérebro — e por quê?"},
   {"type":"conceito","title":"Neurobranding: como marcas vivem no cérebro","content":"Uma marca forte é uma constelação de associações neurais:","items":[
    {"emoji":"🌐","label":"Redes associativas","text":"Cada exposição à marca fortalece sinapses entre ela e atributos (velocidade, confiança, diversão). A Nike ativou 'superação pessoal' por décadas — agora 'Just Do It' ativa isso automaticamente."},
    {"emoji":"🎨","label":"Encoding sensorial","text":"Cor, forma, som e cheiro são encodados junto com a emoção da experiência. Por isso o vermelho da Coca-Cola e o amarelo do McDonald's não são 'apenas cores' — são gatilhos condicionados."},
    {"emoji":"👤","label":"Self-concept e identidade","text":"Marcas com as quais o consumidor se identifica são processadas na mesma região que processa o 'eu'. Atacar a Apple é como atacar um fã da Apple pessoalmente — literalmente, neuralmente."},
    {"emoji":"🛡️","label":"Memória implícita de marca","text":"Você 'pensa em sapatos esportivos' e uma marca vem antes que você decida pensar nela. Isso é memória implícita — o nível mais profundo de construção de marca."},
   ]},
   {"type":"scenario","title":"Extensão de marca — quando o cérebro aceita ou rejeita","context":"Uma marca premium de roupas quer lançar uma linha de eletrodomésticos. O CEO quer usar o mesmo nome e logo. O que o neuromarketing prevê?","choices":[
    {"label":"✅ A marca forte facilita a entrada no novo mercado","result":"Parcialmente verdadeiro e perigoso. A consciência de marca facilita — mas se a rede associativa da marca é 'elegância + moda + status social', eletrodoméstico não ativa essas associações. Pior: pode diluir as associações de moda. O fit precisa ser testado antes.","quality":"neutral"},
    {"label":"🔬 Depende do fit de associações — teste com neuromarketing primeiro","result":"Correto! Kevin Lane Keller (brand equity) e estudos de fMRI mostram que extensão de marca funciona quando há congruência de associações. Virgin do disco para avião (experiência premium) funcionou. Virgin para vodka funcionou menos. O critério é: as mesmas redes neurais fazem sentido?","quality":"good"},
    {"label":"🚫 Não — criar sub-marca separada é sempre melhor","result":"Conservador demais. Marcas com brand equity forte podem e devem explorar extensões — mas com teste de congruência. Toyota criou Lexus separado para o premium justamente porque 'Toyota' não ativava as redes de luxo no Japão. Estratégia correta para o contexto deles.","quality":"neutral"},
   ]},
   {"type":"quiz","q":"Por que o slogan de uma marca pode ser mais memorável quando musicado?","opts":["Música chama mais atenção","Música codifica informação em múltiplas regiões cerebrais simultaneamente (auditiva, emocional, motora), criando mais pontos de acesso para recuperação — é como ter 4 caminhos para a mesma memória em vez de 1","Pessoas gostam mais de música que texto"],"correct":1,"why":"Jingles ativam córtex auditivo, sistema límbico (emoção), cerebelo (ritmo e timing) e frequentemente córtex motor (vontade de cantar junto). Esta codificação multi-modal cria memória mais robusta e mais acessos de recuperação."},
   {"type": "compare", "title": "Marca forte vs. marca fraca — o que o cérebro faz diferente", "left": {"name": "Marca forte (Apple, Nike)", "color": "#6366f1", "emoji": "💪", "items": ["Logo ativa córtex pré-frontal medial (self-concept)", "Menor ativação na área de avaliação racional", "Processada como identidade, não produto", "Resiste a evidências negativas", "Prêmio de preço de 20-60% aceito sem resistência"]}, "right": {"name": "Marca fraca (genérico)", "color": "#94a3b8", "emoji": "📦", "items": ["Ativa principalmente córtex analítico", "Alta ativação de comparação e avaliação", "Processada como produto/commodity", "Vulnerável a qualquer dado negativo", "Pressão de preço constante"]}},{"type": "insight_stack", "title": "Casos de brand equity — o poder mensurável da marca", "insights": [{"emoji": "🍎", "title": "Apple: o prêmio de identidade", "text": "Estudo de 2023: consumidores com iPhone pagam em média 40% mais por qualquer acessório com o logo da Apple — mesmo quando produtos alternativos idênticos estão disponíveis. O cérebro não está comprando o produto; está investindo na identidade."}, {"emoji": "👟", "title": "Nike sem logo ainda vende mais", "text": "Experimento: Nike removeu o Swoosh de tênis e ainda tinha preferência sobre marcas desconhecidas — porque outras associações (cor, silhueta, estilo) já ativavam as redes neurais de marca. Brand equity é multi-sensorial."}, {"emoji": "☕", "title": "Starbucks: o ambiente como produto", "text": "Pesquisa mostra que o mesmo café custa 3x mais caro no Starbucks — e a percepção de sabor é genuinamente diferente em exame cego quando o participante sabe que é Starbucks. O contexto de marca altera literalmente a experiência sensorial."}]},{"type":"apply","text":"Mapeie as associações da sua marca em 3 camadas: (1) Associações explícitas (o que você quer que pensem — sua identidade declarada), (2) Associações implícitas (o que provavelmente pensam — baseado em comunicação e experiência real), (3) Gap entre 1 e 2. O gap é o maior problema estratégico da sua marca."},
  ]
 },
 "ml14":{
  "title":"UX, IA e Gamificação","emoji":"🎮",
  "key":"Gamificação real não é adicionar pontos — é projetar loops de recompensa que fazem o comportamento desejado se tornar intrinsecamente satisfatório.",
  "stages":[
   {"type":"hook","content":"A empresa Opower usou um simples relatório de energia com a comparação 'seus vizinhos usam X kWh a menos que você' e economizou mais de 6 terawatts-hora de energia — equivalente a fechar 2 usinas nucleares. Sem gamificação explícita. Apenas psicologia aplicada ao design. UX é neurociência aplicada.","question":"O que faz um produto ser impossível de parar de usar — e como você projeta isso?"},
   {"type":"conceito","title":"O loop de engajamento (Fogg Behavior Model)","content":"BJ Fogg (Stanford) descobriu que comportamento = Motivação × Habilidade × Prompt. Um produto só é adotado quando os três se alinham:","items":[
    {"emoji":"🔥","label":"Motivação","text":"Prazer/dor, esperança/medo, aceitação/rejeição social. A motivação pode ser aumentada por storytelling, status e recompensa variável."},
    {"emoji":"💪","label":"Habilidade","text":"Quanto mais simples, mais adotado. Cada passo a mais cobre exponencialmente o funil. O Fogg diz: quando motivação é baixa, facilite ao máximo."},
    {"emoji":"⏰","label":"Prompt (Trigger)","text":"O gatilho certo no momento certo. Notificações, emails, lembretes. O mais eficaz é o trigger interno (emoção própria) — mas o externo bem cronometrado também funciona."},
   ]},
   {"type":"conceito","title":"Gamificação neurociência — o que funciona de verdade","content":"Separando gamificação real de superficial:","items":[
    {"emoji":"✅","label":"Recompensa variável (slot machine)","text":"Imprevisível = mais dopamina. Por isso notificações de redes sociais são mais viciantes que de email: você nunca sabe o que vai encontrar."},
    {"emoji":"✅","label":"Progresso visível","text":"Barras de progresso e conquistas ativam dopamina de antecipação. Quanto mais perto da meta, mais motivação (gradiente de meta)."},
    {"emoji":"✅","label":"Status social","text":"Leaderboards, badges visíveis para outros. Serotonina e pertencimento ao grupo. Mas atenção: leaderboards onde a maioria 'perde' desmotivam."},
    {"emoji":"⚠️","label":"Pontos sem sentido","text":"Pontos por si só, sem valor real ou social, não sustentam engajamento. O cérebro aprende rápido quando a recompensa é vazia."},
   ]},
   {"type":"quiz","q":"Por que o Duolingo usa 'streaks' (sequência de dias consecutivos) como mecanismo central de retenção?","opts":["É fácil de implementar tecnicamente","Streaks ativam aversão à perda (não quero perder a sequência) e efeito de dotação (o streak 'me pertence') — dois dos vieses mais poderosos. Perder a sequência dói mais do que o benefício de ter continuado alegra","Usuários pediram essa feature"],"correct":1,"why":"O Duolingo documentou que streaks são o preditor individual mais forte de retenção. O mecanismo neural: o streak acumula valor como 'posse' (efeito de dotação) e ameaça de perda o torna altamente motivador (aversão à perda). É a gamificação mais eficiente por menor custo de implementação."},
   {"type": "compare", "title": "Motivação intrínseca vs. extrínseca em gamificação", "left": {"name": "Intrínseca (sustentável)", "color": "#4ade80", "emoji": "🔥", "items": ["Vem de dentro: curiosidade, competência, autonomia", "Aumenta com o tempo de prática", "Produtos: Duolingo, Spotify Wrapped, GitHub", "Gamificação serve o propósito do usuário", "Alta retenção de longo prazo"]}, "right": {"name": "Extrínseca (frágil)", "color": "#fb923c", "emoji": "💰", "items": ["Vem de fora: pontos, prêmios, ranking", "Diminui quando a recompensa some (overjustification)", "Problema: 'por que usar sem pontos?'", "Gamificação serve o propósito da empresa", "Alta dependência de recompensas crescentes"]}},{"type": "scenario", "title": "Redesign de onboarding com gamificação", "context": "Um app de finanças pessoais tem abandono de 60% no onboarding (antes do usuário conectar a primeira conta). Qual abordagem de gamificação resolve?", "choices": [{"label": "🏆 Adicionar sistema de pontos e badges para cada ação do onboarding", "result": "Cuidado! Gamificação extrínseca no onboarding pode funcionar no curto prazo mas cria usuários que 'jogam' — não que se engajam com o produto real. Quando os badges acabam, a motivação some. Além disso, pontos em finanças pessoais parecem triviais dado o contexto de dinheiro real.", "quality": "neutral"}, {"label": "🎯 Mostrar o progresso em tempo real: 'Você conectou 2 contas. Usuários com 3+ têm 4x mais clareza financeira'", "result": "Excelente! Isso usa: (1) gradiente de meta (perto do objetivo), (2) prova social específica (o que outros conseguem), (3) benefit preview (clareza financeira — a motivação intrínseca real do usuário). É gamificação a serviço do objetivo do usuário, não de métricas de engajamento.", "quality": "good"}, {"label": "⚡ Simplificar o onboarding para menos etapas", "result": "Correto e complementar — mas não é gamificação, é redução de fricção. O BJ Fogg Behavior Model diria: você aumentou a 'Habilidade'. Mas se a 'Motivação' não está clara, etapas a menos não resolvem o abandono estrutural.", "quality": "neutral"}]},{"type": "insight_stack", "title": "IA no marketing — o que já mudou", "insights": [{"emoji": "🤖", "title": "Hiperpersonalização em escala", "text": "Netflix economiza $1 bilhão/ano em churn evitado graças à personalização algorítmica. Mas a próxima fronteira não é só recomendar conteúdo — é personalizar o tom de comunicação, o timing, e o canal para cada usuário individualmente."}, {"emoji": "🎨", "title": "Geração criativa: ameaça ou ferramenta?", "text": "IA generativa não elimina o criativo humano — elimina o trabalho mecânico de produção. Quem entende de neurofisiologia do consumidor e usa IA para executar tem vantagem sobre quem só executa. A curadoria estratégica é o diferencial humano."}, {"emoji": "🔮", "title": "Predição de comportamento pré-decisão", "text": "Modelos de ML já preveem com 73% de precisão se um usuário vai cancelar a assinatura 30 dias antes de ele mesmo saber. A intervenção preventiva (oferta, check-in, feature) muda o resultado em 40% dos casos identificados."}]},{"type":"apply","text":"Mapeie o produto ou serviço que você trabalha com o Fogg Behavior Model. Para o comportamento mais importante que você quer que o usuário adote: (1) A motivação está clara e presente? (2) O caminho é simples o suficiente? (3) O trigger chega no momento certo? Identifique o elo mais fraco dos três."},
  ]
 },
 "ml15":{
  "title":"Consumo sob a Ótica da Neurociência","emoji":"🛍️",
  "key":"Consumo é identidade, pertencimento e regulação emocional — muito mais que satisfação de necessidade.",
  "stages":[
   {"type":"hook","content":"Abraham Maslow propôs a hierarquia das necessidades em 1943. Mas estudos modernos de neuroimagem mostram que necessidades de status e pertencimento ativam regiões cerebrais mais primitivas e mais urgentes do que ele imaginou. Consumimos para regular emoções, construir identidade e sinalizar posição social — muito antes de 'necessitar' do produto.","question":"Por que você compra o que compra — realmente?"},
   {"type":"flow","title":"As camadas do consumo contemporâneo","steps":[
    {"icon":"🛒","label":"Necessidade Funcional","text":"O que o produto faz objetivamente. Cada vez menos diferenciador — commoditização rápida. Necessário mas insuficiente."},
    {"icon":"😊","label":"Necessidade Hedônica","text":"O prazer da experiência de compra e uso. Estética, sensorialidade, conveniência. Aqui começa a diferenciação real."},
    {"icon":"🪞","label":"Necessidade de Identidade","text":"'Que tipo de pessoa compra isso?' Consumo como auto-expressão e construção de narrativa pessoal. Muito mais emocionalmente poderoso."},
    {"icon":"👥","label":"Necessidade Social","text":"Sinalização de status, pertencimento a grupo, distinção. O cérebro é profundamente social — consumo é comunicação."},
   ]},
   {"type":"conceito","title":"Os 5 sentidos e o comportamento de compra","content":"Spence (2015): 'Atmospherics' — o ambiente de compra age em todos os sentidos simultaneamente:","items":[
    {"emoji":"👁️","label":"Visão","text":"O mais explorado. Cor, layout, iluminação. Mas: iluminação quente aumenta conforto e tempo de permanência em lojas. Luz fria aumenta alerta e velocidade de decisão."},
    {"emoji":"👂","label":"Audição","text":"Ritmo musical controla velocidade de consumo. Música lenta: consumidores ficam mais tempo e gastam mais. Música clássica em vinícola: vendas de vinhos caros sobem."},
    {"emoji":"👃","label":"Olfato","text":"O único sentido sem intermediário tálâmico — vai direto ao sistema límbico. Cheiro de baunilha em loja aumenta tempo de permanência. Aroma de pão em supermercado aumenta compras não planejadas."},
    {"emoji":"👄","label":"Paladar","text":"Sampling (degustação) usa reciprocidade + posse prévia. Uma vez experimentado, o produto 'pertence' psicologicamente."},
    {"emoji":"✋","label":"Tato","text":"Tocar o produto aumenta percepção de posse e disposição a pagar. Por isso e-commerce tem desvantagem estrutural — e fotos de produto hiper-realistas compensam parcialmente."},
   ]},
   {"type":"quiz","q":"Por que compras impulsivas aumentam nos caixas de supermercados?","opts":["É onde há mais variedade de produto","Cansaço de decisão (ego depletion): após tomar dezenas de decisões pelo mercado, o córtex pré-frontal está exausto e o sistema impulsivo do accumbens domina. Além disso, barras e doces estão na altura visual enquanto você espera, ocioso.","Os produtos nos caixas são mais baratos"],"correct":1,"why":"Roy Baumeister documentou o 'ego depletion' — a capacidade de autocontrole é um recurso finito que se esgota com uso. O supermercado é projetado para esgotar esse recurso antes do checkout, quando produtos de impulso de alto margem estão estrategicamente posicionados."},
   {"type": "flow", "title": "Os 5 sentidos no design de experiência de consumo", "steps": [{"icon": "👁️", "label": "Visão — o mais explorado", "text": "Cor, luz e layout são a base. Mas atenção: coerência entre estímulos visuais e promessa de marca é mais importante que beleza isolada. Uma embalagem premium com interior desleixado cria dissonância cognitiva."}, {"icon": "👂", "label": "Audição — o mais subestimado", "text": "Música ambiente a 72bpm reduz velocidade de compra em restaurantes em 13% e aumenta ticket em 9,5% (North, Hargreaves, McKendrick). O silêncio também comunica — lojas de luxo frequentemente têm menor volume sonoro que lojas de massa."}, {"icon": "👃", "label": "Olfato — o mais direto ao límbico", "text": "Cheiro de lavanda em farmácias reduz percepção de espera. Cheiro de madeira em lojas de carro aumenta percepção de qualidade. Ritz-Carlton tem cheiro proprietário em todos os hotéis do mundo — é brand identity olfativa."}, {"icon": "✋", "label": "Tato — o mais subutilizado digitalmente", "text": "O peso de um produto aumenta sua percepção de qualidade (efeito de peso como qualidade). Embalagens que 'custam' mais para abrir criam expectativa e ritual. O haptic feedback do iPhone foi projetado para criar sensação de qualidade."}, {"icon": "👅", "label": "Paladar — o de maior influência ambiental", "text": "Degustações em supermercados têm ROI comprovado de 5-10x por criar prova física + reciprocidade. O 'sabor' percebido muda com cor da embalagem, peso do utensílio e contexto social de consumo."}]},{"type": "scenario", "title": "Redesign de experiência de loja física", "context": "Uma livraria independente está perdendo para e-commerce. O cliente entra mas compra menos. Qual redesign de experiência sensorial tem maior impacto?", "choices": [{"label": "💻 Instalar tablets com catálogo digital e compra integrada", "result": "Digitalizar uma loja física é tratar o sintoma errado. O consumidor que entrou numa livraria física já escolheu a experiência presencial. Adicionar tablets cria fricção digital no único espaço onde a concorrência digital não existe.", "quality": "warning"}, {"label": "☕ Adicionar café, criar áreas de leitura confortáveis e eventos de autores", "result": "Excelente estratégia multi-sensorial! Café ativa olfato (prazer e conforto), áreas de leitura criam permanência (quem fica mais compra mais), eventos criam identidade e comunidade. Você não está vendendo livros — está vendendo um terceiro lugar entre casa e trabalho.", "quality": "good"}, {"label": "🏷️ Baixar preços para competir com Amazon", "result": "Impossível vencer em preço contra Amazon. E preço mais baixo destrói a percepção de curadoria e qualidade que é o único diferencial de uma livraria independente. É a estratégia que acelera a morte.", "quality": "warning"}]},{"type":"apply","text":"Faça uma auditoria sensorial do seu ponto de venda (físico ou digital). Para cada sentido: (1) O que está acontecendo? (2) É intencional ou acidental? (3) Como está impactando a experiência e a decisão? Um ambiente de compra não neutro — cada escolha é uma intervenção no sistema nervoso do consumidor."},
  ]
 },
 "ml16":{
  "title":"Pesquisa de Marketing com Neurociência","emoji":"🔭",
  "key":"Neuromarketing é o único método que acessa o que o consumidor realmente pensa — não o que ele declara pensar.",
  "stages":[
   {"type":"hook","content":"Quando a New Coke foi lançada em 1985, os grupos focais amaram. A pesquisa dizia sucesso garantido. Resultado: o maior fracasso de marketing da história, com a empresa sendo forçada a voltar à Coca-Cola Classic em 79 dias. O que os grupos focais não capturaram: a resposta emocional e de identidade que o cérebro guarda, não a língua.","question":"Como pesquisar o que o consumidor não sabe que sente?"},
   {"type":"conceito","title":"As ferramentas de pesquisa neuro — guia prático","content":"Cada ferramenta acessa uma camada diferente da experiência:","items":[
    {"emoji":"🧠","label":"fMRI (Ressonância Magnética Funcional)","text":"Mede fluxo sanguíneo em regiões cerebrais. Alta resolução espacial — você sabe ONDE o cérebro reage. Desvantagem: lento, caro, claustrofóbico, não ecologicamente válido."},
    {"emoji":"⚡","label":"EEG (Eletroencefalograma)","text":"Mede atividade elétrica. Alta resolução temporal — você sabe QUANDO o cérebro reage (até 1ms). Pode ser usado em ambientes reais. Mais acessível que fMRI."},
    {"emoji":"👁️","label":"Eye-Tracking","text":"Rastreia movimento ocular. Revela atenção real vs. declarada. Disponível em desktop, mobile e óculos portáteis para varejo físico. Muito mais acessível."},
    {"emoji":"❤️","label":"GSR (Galvânica / Biometria)","text":"Mede ativação emocional via condutância da pele. Simples e acessível. Não diz se é positivo ou negativo — apenas intensidade. Precisa ser combinado com outro dado."},
    {"emoji":"🎭","label":"Facial Coding","text":"Analisa microexpressões faciais. Software como Affectiva identifica emoções em tempo real. Útil para reação a anúncios em escala."},
   ]},
   {"type":"scenario","title":"Você tem R$50k de budget para pesquisa. Como alocar?","context":"Sua marca quer entender por que os consumidores não estão convertendo após ver o anúncio novo. Você precisa de insights acionáveis em 30 dias.","choices":[
    {"label":"🧠 fMRI com 20 participantes","result":"Muito caro para o insight gerado aqui. fMRI responde bem à questões de percepção de produto e identidade de marca — não de conversão de anúncio. A falta de validade ecológica (ambiente artificial) diminui a aplicabilidade. Budget melhor alocado em outras ferramentas para esta questão.","quality":"warning"},
    {"label":"👁️ Eye-tracking do anúncio + EEG + questionário de memória implícita","result":"Excelente combinação! Eye-tracking mostra onde a atenção vai (e não vai) no anúncio. EEG mostra quando o engajamento sobe e cai. Memória implícita testa o que ficou no sistema emocional pós-exposição. Você vai saber exatamente em qual frame/elemento o problema está.","quality":"good"},
    {"label":"📊 Pesquisa quantitativa online com 1.000 participantes","result":"Alta escala, baixo custo, mas captura apenas intenção declarada. Útil para medir awareness e atitude — mas não vai revelar o mecanismo inconsciente de rejeição ao anúncio. Complementar, não substituto.","quality":"neutral"},
   ]},
   {"type":"quiz","q":"O que o método ZMET (Zaltman Metaphor Elicitation) revela que pesquisas tradicionais não conseguem?","opts":["Dados quantitativos de larga escala","Estruturas mentais inconscientes através de imagens — o que as pessoas pensam 'abaixo da linguagem'. Metáforas são a linguagem do inconsciente.","Intenção de compra declarada"],"correct":1,"why":"Gerald Zaltman (Harvard) desenvolveu ZMET baseado na descoberta de que 95% do pensamento é não-verbal. Ao pedir imagens em vez de palavras, você acessa associações que o participante não consegue (ou não quer) verbalizar. Empresas como Coca-Cola e P&G usam extensivamente."},
   {"type": "compare", "title": "Pesquisa declarativa vs. não-declarativa", "left": {"name": "Declarativa (tradicional)", "color": "#7dd3fc", "emoji": "📋", "items": ["Survey, grupo focal, entrevista", "O que o consumidor diz que faz/quer", "Rápida e barata de executar", "Sujeita a social desirability bias", "Captura intenção, não comportamento"]}, "right": {"name": "Não-declarativa (neuro)", "color": "#f472b6", "emoji": "🧪", "items": ["EEG, eye-tracking, GSR, fMRI", "O que o consumidor realmente faz/sente", "Cara e especializada", "Elimina o filtro da consciência", "Captura comportamento real"]}},{"type": "insight_stack", "title": "Casos de pesquisa neuro que mudaram produtos", "insights": [{"emoji": "🚗", "title": "Ford Focus: design por neuroimagem", "text": "Ford usou EEG e eye-tracking para testar reação a diferentes designs de painel. A versão escolhida pelos grupos focais era diferente da que ativava mais resposta emocional positiva no EEG. Lançaram a versão 'neuro' — foi um sucesso de vendas."}, {"emoji": "🍟", "title": "McDonald's e o eye-tracking do menu", "text": "Eye-tracking revelou que consumidores olhavam para o canto superior esquerdo do menu por mais tempo. McDonald's reposicionou combos de maior margem nessa área. Aumento de 15% no ticket médio sem qualquer mudança de preço."}, {"emoji": "🎬", "title": "Publicidade de prevenção: o que funciona além do medo", "text": "Pesquisas de saúde pública com fMRI descobriram que campanhas de medo intenso ('fumar causa câncer' com imagens chocantes) ativam a amígdala mas também o mecanismo de defesa do ego — consumidores reprimem a mensagem. Campanhas de identidade ('pessoas saudáveis como você não fumam') têm mais eficácia mensurável."}]},{"type":"apply","text":"Implemente uma pesquisa neuro de baixo custo: (1) Selecione 5-8 participantes do seu público, (2) Peça que escolham 5 imagens (de revista, internet, qualquer fonte) que 'representam como se sentem em relação ao [seu produto/categoria]', (3) Conduza uma entrevista em profundidade sobre as imagens, (4) Analise os temas recorrentes nas imagens — não nas palavras. Compare com o que sua comunicação está transmitindo."},
  ]
 },
 "ml17":{
  "title":"Ética em Neuromarketing","emoji":"⚖️",
  "key":"Com grande poder neural vem grande responsabilidade — o neuromarketing ético distingue influência de manipulação.",
  "stages":[
   {"type":"hook","content":"O Comitê de Ética em Pesquisa em Neurociência do Consumo tem um dilema real: as mesmas técnicas que revelam como ajudar consumidores a fazer melhores escolhas também revelam como contornar sua agência. A diferença entre 'facilitar a decisão que o consumidor quer tomar' e 'induzir uma decisão que ele não tomaria de outra forma' é onde a ética começa.","question":"Onde está a linha entre persuasão legítima e manipulação?"},
   {"type":"conceito","title":"O framework ético do neuromarketing","content":"Três critérios para distinguir uso ético de antiético:","items":[
    {"emoji":"✅","label":"1. Critério de Transparência","text":"O consumidor poderia consentir à técnica se soubesse que ela está sendo usada? Usar cores que aumentam apetite numa rede de restaurantes: sim. Usar EEG implantado sem consentimento: não."},
    {"emoji":"✅","label":"2. Critério de Alinhamento de Interesses","text":"A técnica beneficia o consumidor além da marca? Nudge de default em doação de órgãos: beneficia socialmente. Dark pattern de cancelamento difícil: apenas a empresa."},
    {"emoji":"✅","label":"3. Critério de Reversibilidade","text":"O consumidor pode facilmente mudar a decisão se quiser? Comprar com 1 clique mas cancelar com 7 telas: assimétrico e não ético. Comprar fácil e sair igualmente fácil: ético."},
   ]},
   {"type":"scenario","title":"Análise ética de práticas reais","context":"Avalie as seguintes práticas de neuromarketing. Qual é claramente antiética?","choices":[
    {"label":"🏥 Hospital usa framing positivo: '90% de recuperação' em vez de '10% de mortalidade'","result":"Ético na medida em que a informação é verdadeira e o paciente pode pedir a versão alternativa. O framing positivo reduz ansiedade e pode facilitar decisões de saúde mais racionais. Porém: sempre com a informação completa disponível.","quality":"good"},
    {"label":"😴 App de sono usa técnicas de notificação noturna para criar compulsão de uso","result":"Claramente antiético! Um app de SONO que usa técnicas de engajamento compulsivo é diretamente contraditório com o bem-estar do usuário — e consequentemente com o critério de alinhamento de interesses. Isso é o que Tristan Harris chama de 'produto que devora o que produz'.","quality":"warning"},
    {"label":"🛒 E-commerce mostra 'Seus amigos compraram isto' usando dados de redes sociais integradas","result":"Zona cinzenta. Prova social é legítima — mas o uso de dados de terceiros sem consentimento explícito para isso pode violar LGPD/GDPR. A ética depende do consent flow que o usuário passou.","quality":"neutral"},
   ]},
   {"type":"quiz","q":"A Resolução 196/96 do CNS e as regulamentações da LGPD impactam pesquisas de neuromarketing porque:","opts":["Proíbem qualquer pesquisa com seres humanos","Exigem consentimento informado, minimização de danos e tratamento adequado dos dados neurais — que são dados sensíveis por natureza","São apenas para pesquisas médicas"],"correct":1,"why":"Dados neurais (EEG, fMRI) são classificados como dados biométricos sensíveis pela LGPD. Pesquisas que os coletam precisam de: TCLE (Termo de Consentimento Livre e Esclarecido), aprovação de CEP para estudos com humanos, e protocolo claro de uso, armazenamento e descarte."},
   {"type": "flow", "title": "O processo ético de uma pesquisa de neuromarketing", "steps": [{"icon": "📋", "label": "1. Protocolo de pesquisa", "text": "Definir claramente: objetivo, método, população, coleta, armazenamento e uso de dados. Submeter ao CEP se envolver seres humanos e técnicas invasivas."}, {"icon": "📄", "label": "2. TCLE — Termo de Consentimento", "text": "Explicar em linguagem acessível: o que será coletado, para que, quem terá acesso, por quanto tempo, como será descartado. Consentimento deve ser livre e informado — não coercitivo."}, {"icon": "🔒", "label": "3. Anonimização e proteção de dados", "text": "Dados neurais são dados biométricos sensíveis pela LGPD. Exigem anonimização, protocolo de segurança e política de retenção definida."}, {"icon": "🔍", "label": "4. Revisão dos resultados", "text": "Os insights gerados permitem interferência no comportamento do consumidor contra seus próprios interesses? Se sim, há uma questão ética a resolver antes da aplicação."}, {"icon": "📢", "label": "5. Transparência de uso", "text": "Empresas que usam neuromarketing têm obrigação ética (e em alguns países, legal) de informar quando técnicas de influência são aplicadas em comunicação."}]},{"type": "insight_stack", "title": "O debate ético atual no neuromarketing", "insights": [{"emoji": "🧠", "title": "Neurodireitos — a próxima fronteira legal", "text": "Chile (2021) foi o primeiro país a incluir neurodireitos na Constituição: o direito à privacidade mental, identidade pessoal, livre-arbítrio e acesso equitativo a tecnologias de aprimoramento cognitivo. Brasil ainda não tem legislação específica — mas o debate chegou ao Congresso."}, {"emoji": "🎯", "title": "Targeting por estado emocional — ético?", "text": "Facebook foi acusado de testar (sem consentimento) a manipulação do feed para alterar o humor de 700.000 usuários. O experimento foi 'bem-sucedido' cientificamente — e um escândalo ético. O mesmo dado (estado emocional) usado para 'mostrar conteúdo relevante' vs. 'manipular humor' — a linha é tênue."}, {"emoji": "⚖️", "title": "O Código de Ética da NMSBA", "text": "A Neuromarketing Science & Business Association criou um código de ética com 7 princípios: transparência, beneficência, não-maleficência, justiça, respeito pela autonomia, privacidade de dados e responsabilidade profissional. É o padrão internacional de referência."}]},{"type":"apply","text":"Conduza um audit ético da sua comunicação e estratégia de marketing atual. Para cada técnica de influência que você usa, aplique os 3 critérios: Transparência, Alinhamento de Interesses, Reversibilidade. Identifique uma prática que pode estar na zona cinzenta e defina o que precisaria mudar para ela ser claramente ética."},
  ]
 },
 "ml18":{
  "title":"Integração Cérebro-Máquina e Futuro do Consumo","emoji":"🚀",
  "key":"O futuro da interface cérebro-máquina não é ficção científica — é o próximo capítulo do neuromarketing, e as implicações são profundas.",
  "stages":[
   {"type":"hook","content":"Em 2023, o primeiro paciente com o chip Neuralink conseguiu controlar um cursor de computador com o pensamento. Em 2024, um segundo paciente. Meta e Apple investem bilhões em interfaces neurais para óculos e headsets. O 'consumer brain data' pode ser a próxima fronteira do marketing — e das regulamentações. O futuro chegou mais cedo do que você pensa.","question":"Quando o consumidor pensar no produto, a marca já vai saber?"},
   {"type":"flow","title":"A evolução das interfaces humano-tecnologia","steps":[
    {"icon":"🖱️","label":"Hoje: Interface física","text":"Clique, toque, voz. O dispositivo registra ações deliberadas."},
    {"icon":"😊","label":"Próximos 2-5 anos: Biometria contínua","text":"Câmeras e wearables registram frequência cardíaca, expressão facial, eye-tracking em tempo real durante a navegação. Já existe — ainda subutilizado."},
    {"icon":"🥽","label":"5-10 anos: XR e presença imersiva","text":"Realidade aumentada e virtual criam experiências de produto imersivas. O 'try-before-you-buy' virtual ativa respostas de posse sem o produto físico."},
    {"icon":"🧠","label":"10-20 anos: BCI (Brain-Computer Interface)","text":"Interfaces que leem intenção e estado emocional diretamente. Já existem versões primitivas (Neuralink, Emotiv). O marketing 'pré-click' pode capturar interesse antes da ação."},
   ]},
   {"type":"conceito","title":"Tendências que já estão moldando o consumo","content":"O futuro não é uniforme — algumas tendências já chegaram:","items":[
    {"emoji":"🤖","label":"IA Generativa no Marketing","text":"Personalização de conteúdo em escala nunca antes possível. Risco: se toda marca é 'personalizada', o diferencial volta a ser autenticidade e valores genuínos."},
    {"emoji":"🌐","label":"Ambiente Phygital","text":"A fronteira físico-digital desapareceu. O consumidor espera a mesma fluidez de experiência num QR Code do produto no supermercado que no site. Pós-pandemia: aceleração definitiva."},
    {"emoji":"🎯","label":"Zero-Party Data","text":"Com o fim dos cookies de terceiros, o dado mais valioso é o que o consumidor voluntariamente compartilha. Quem tem relação direta e confiança, tem o ativo mais valioso."},
    {"emoji":"🛒","label":"Social Commerce","text":"A compra acontece dentro do conteúdo — sem sair da rede social. O funil colapsou: awareness e conversão acontecem no mesmo momento."},
   ]},
   {"type":"quiz","q":"Por que o conceito de 'Zero Party Data' se torna mais estratégico conforme a privacidade é regulada?","opts":["Porque é mais barato que dados de terceiros","Porque dados voluntariamente compartilhados pelo consumidor têm maior precisão, legalidade garantida e geram confiança — o ativo mais escasso no ecossistema de marketing digital","Porque é exigido por lei"],"correct":1,"why":"Forrester cunhou o termo: zero-party data é informação que o consumidor intencionalmente compartilha (preferências, intenções, contexto). Com LGPD e fim de cookies, quem tem relação direta com o consumidor tem vantagem competitiva estrutural."},
   {"type": "scenario", "title": "Estratégia de dados para o futuro", "context": "Sua empresa usa cookies de terceiros para retargeting. Com o fim iminente dos cookies e as novas regulamentações, qual é a estratégia mais resiliente?", "choices": [{"label": "🍪 Investir em tecnologias de cookie alternativas (fingerprinting, ID graphs)", "result": "Solução técnica de curto prazo que viola o espírito — e potencialmente a letra — das regulamentações de privacidade. Reguladores europeus e brasileiros já estão de olho. É o caminho de maior risco legal e reputacional.", "quality": "warning"}, {"label": "💎 Construir uma estratégia de Zero-Party Data: criar valor em troca de dados voluntários", "result": "Correto e futuro-proof. Zero-Party Data (preferências, intenções declaradas pelo usuário) tem: (1) consentimento claro, (2) maior precisão que dados inferidos, (3) compliance total, (4) gera relação de troca de valor com o consumidor. É a única estratégia escalável no mundo pós-cookie.", "quality": "good"}, {"label": "🤝 Fazer parcerias com data providers e retail media networks", "result": "Solução legítima e crescente — retail media (Amazon Ads, Mercado Livre Ads) dá acesso a dados first-party de terceiros com consentimento. Complementa mas não substitui a necessidade de construir dados próprios.", "quality": "neutral"}]},{"type": "insight_stack", "title": "O futuro que já chegou para o marketing", "insights": [{"emoji": "🥽", "title": "Spatial Computing e o marketing em 3D", "text": "Apple Vision Pro e o ecossistema de XR (realidade estendida) cria um novo canal onde o produto existe no espaço do consumidor antes da compra. Try-before-you-buy em escala — e com dados de interação espacial que nenhum canal atual captura."}, {"emoji": "🎙️", "title": "Interfaces de voz e a morte da busca visual", "text": "Alexa, Google Assistant, Siri: em compras por voz, não há gôndola. A marca que não está no 'slot 1' da resposta do assistente não existe. SEO vira AEO (Answer Engine Optimization). A batalha por posição na mente do consumidor agora tem um árbitro algorítmico."}, {"emoji": "🧬", "title": "Personalização biométrica — ficção ou realidade?", "text": "Wearables como Apple Watch já captam frequência cardíaca, sono e estresse. Em 5-10 anos, o marketing que souber usar esses dados eticamente pode oferecer café quando você está com sono, pausar notificações quando detecta ansiedade alta, ou sugerir exercício quando os dados mostram sedentarismo. A questão: quem controla esses dados?"}]},{"type":"apply","text":"Escreva o cenário de consumo do seu produto em 10 anos. Que tecnologias existirão? Como o consumidor vai descobrir, avaliar e comprar? O que da neurociência que você aprendeu ainda vai ser válido (princípios fundamentais do cérebro não mudam — ferramentas mudam)? Use isso para identificar onde sua marca precisa investir hoje."},
  ]
 },
};


export default function App() {
  return (
    <GameProvider>
      <Shell />
    </GameProvider>
  );
}

function Shell() {
  const [tab, setTab] = useState("trilha");
  const { progress, badges } = useGame();
  const lvl = levelOf(progress.xp);
  const xpInLevel = progress.xp % XP_PER_LEVEL;
  const badgeCount = Object.keys(badges).length;
  const touch = useRef(null);
  const [hint, setHint] = useState(false);

  const onTouchStart = (e) => { const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY, t: Date.now() }; };
  const onTouchMove = (e) => {
    const s = touch.current; if (!s) return; const t = e.touches[0];
    setHint(s.x <= 30 && t.clientX - s.x > 24 && Math.abs(t.clientY - s.y) < 50 && _backStack.length > 0);
  };
  const onTouchEnd = (e) => {
    const s = touch.current; touch.current = null; setHint(false); if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x, dy = t.clientY - s.y, dt = Date.now() - s.t;
    if (s.x <= 40 && dx > 60 && Math.abs(dy) < 60 && dx > Math.abs(dy) && dt < 700) runBack();
  };

  return (
    <div style={styles.root} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <style>{css}</style>
      <div className="glow glow-a" /><div className="glow glow-b" /><div className="glow glow-c" />
      <div style={{ ...styles.backHint, opacity: hint ? 1 : 0 }}><ArrowLeft size={18} /></div>

      <header style={styles.header}>
        <div style={styles.logoRow}>
          <div style={styles.logo}><Brain size={22} style={{ color: "#ffce6b" }} /></div>
          <div style={{ flex: 1 }}>
            <h1 style={styles.h1}>Mapa da Mente</h1>
            <span style={styles.lvlTitle}>Nível {lvl} · {titleOf(lvl)}{progress.streak > 0 ? ` · 🔥${progress.streak}` : ""}</span>
          </div>
          <div style={styles.xpChip}><Star size={13} style={{ color: "#ffb627" }} /> {progress.xp}</div>
        </div>
        <div style={styles.xpBar}>
          <div style={{ ...styles.xpFill, width: `${xpInLevel}%` }} />
        </div>
      </header>

      <main style={styles.main}>
        {tab === "trilha" && <Trilha />}
        {tab === "cerebro" && <Cerebro />}
        {tab === "comportamento" && <Comportamento />}
        {tab === "praticar" && <Jogos />}
        {tab === "mba" && <MBATrilha />}
        {tab === "perfil" && <Perfil />}
      </main>

      <nav style={styles.nav}>
        <NavBtn active={tab === "trilha"} onClick={() => setTab("trilha")} icon={<MapIcon size={18} />} label="Trilha" compact />
        <NavBtn active={tab === "cerebro"} onClick={() => setTab("cerebro")} icon={<Brain size={18} />} label="Cérebro" compact />
        <NavBtn active={tab === "comportamento"} onClick={() => setTab("comportamento")} icon={<Lightbulb size={18} />} label="Comportar" compact />
        <NavBtn active={tab === "praticar"} onClick={() => setTab("praticar")} icon={<Dumbbell size={18} />} label="Praticar" compact />
        <NavBtn active={tab === "mba"} onClick={() => setTab("mba")} icon={<GraduationCap size={18} />} label="MBA" compact />
        <NavBtn active={tab === "perfil"} onClick={() => setTab("perfil")} icon={<Trophy size={18} />} label="Perfil" badge={badgeCount || null} compact />
      </nav>
    </div>
  );
}

function NavBtn({ active, onClick, icon, label, badge, compact }) {
  return (
    <button onClick={onClick} style={{ ...styles.navBtn, color: active ? "#ffce6b" : "#7c7c84" }}>
      <div style={{ position: "relative" }}>
        {icon}
        {badge ? <span style={styles.navBadge}>{badge}</span> : null}
      </div>
      <span style={{ fontSize: compact ? 9 : 10.5, fontWeight: active ? 700 : 500, letterSpacing: compact ? -0.2 : 0 }}>{label}</span>
    </button>
  );
}


// ── MBA Trilha ─────────────────────────────────────────────────────────────
const MBA_ORDER = MBA_MODULES.flatMap((m) => m.lessons);

function MBATrilha() {
  const { progress, completeLesson } = useGame();
  const [open, setOpen] = useState(null);

  const key = (id) => "mba_" + id;
  const isDone = (id) => !!progress.lessons[key(id)];
  const isUnlocked = (id) => { const i = MBA_ORDER.indexOf(id); return i === 0 || isDone(MBA_ORDER[i - 1]); };
  const firstUndone = MBA_ORDER.find((id) => !isDone(id));
  const doneCount = MBA_ORDER.filter(isDone).length;

  if (open) {
    return <LessonView id={open} lessons={MBA_LESSONS}
      onClose={() => setOpen(null)}
      onComplete={() => { completeLesson(key(open)); setOpen(null); }} />;
  }

  return (
    <div className="fade">
      <div style={styles.trilhaHead}>
        <h2 style={styles.h2}>MBA — Neurociência, Consumo e Marketing</h2>
        <p style={styles.pMuted}>{doneCount}/{MBA_ORDER.length} aulas · cenários reais + descobertas + fixação</p>
      </div>
      {MBA_MODULES.map((m) => {
        const modDone = m.lessons.every(isDone);
        return (
          <div key={m.id} style={{ marginBottom: 26 }}>
            <div style={{ ...styles.modHead, borderColor: m.color + "55", background: m.color + "12" }}>
              <span style={{ fontSize: 22 }}>{m.emoji}</span>
              <div style={{ flex: 1 }}>
                <b style={{ fontSize: 15, color: "#e6eefc" }}>{m.title}</b>
                <span style={{ display: "block", fontSize: 11.5, color: "#8aa0c4" }}>{m.lessons.filter(isDone).length}/{m.lessons.length} aulas</span>
              </div>
              {modDone && <Check size={18} style={{ color: m.color }} />}
            </div>
            <div style={styles.path}>
              {m.lessons.map((id, i) => {
                const L = MBA_LESSONS[id]; if (!L) return null;
                const done = isDone(id), unlocked = isUnlocked(id), current = id === firstUndone;
                const side = i % 2 === 0 ? "flex-start" : "flex-end";
                const stageCount = (L.stages || []).length;
                const hasSc = (L.stages || []).some(s => s.type === "scenario");
                const hasIs = (L.stages || []).some(s => s.type === "insight_stack");
                return (
                  <div key={id} style={{ display: "flex", justifyContent: side }}>
                    <button disabled={!unlocked} onClick={() => unlocked && setOpen(id)}
                      className={current ? "pulse-node" : ""}
                      style={{ ...styles.lessonNode, borderColor: done ? "#4ade80" : current ? m.color : "rgba(255,255,255,0.12)", background: done ? "#4ade8018" : current ? m.color + "22" : GLASS, backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR, opacity: unlocked ? 1 : 0.5, cursor: unlocked ? "pointer" : "not-allowed", width: "68%" }}>
                      <span style={{ fontSize: 26 }}>{done ? "✅" : unlocked ? L.emoji : "🔒"}</span>
                      <span style={{ ...styles.lessonTitle, fontSize: 11.5 }}>{L.title}</span>
                      {unlocked && !done && (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
                          <span style={{ fontSize: 9.5, color: m.color, fontWeight: 700 }}>{stageCount} etapas</span>
                          {hasSc && <span style={{ fontSize: 9.5, color: "#a5b4fc" }}>· cenário</span>}
                          {hasIs && <span style={{ fontSize: 9.5, color: "#6ee7b7" }}>· descobertas</span>}
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}


function LessonVisual({ id }) {
  const VB = "0 0 320 150";
  const txt = { fontFamily: "Sora, sans-serif" };
  const wrap = (children) => <div style={styles.lessonVisual}><svg viewBox={VB} style={{ width: "100%", height: "auto", display: "block" }}>{children}</svg></div>;

  switch (id) {
    case "l1": // neurônios + sinapse
      return wrap(<>
        <g stroke="#4c4c54" strokeWidth="2" fill="none">
          <path d="M40 75 l-22 -18 M40 75 l-22 18 M40 75 l-24 0" />
          <path d="M280 75 l22 -18 M280 75 l22 18 M280 75 l24 0" />
        </g>
        <line x1="60" y1="75" x2="150" y2="75" stroke="#4c4c54" strokeWidth="3" />
        <line x1="170" y1="75" x2="262" y2="75" stroke="#4c4c54" strokeWidth="3" />
        <circle cx="48" cy="75" r="16" fill="#1e1e23" stroke="#ffce6b" strokeWidth="2" />
        <circle cx="272" cy="75" r="16" fill="#1e1e23" stroke="#ffce6b" strokeWidth="2" />
        <circle cx="148" cy="68" r="4" fill="#ffb627" /><circle cx="160" cy="78" r="4" fill="#4ade80" /><circle cx="152" cy="86" r="3.5" fill="#a78bfa" />
        <text x="160" y="120" textAnchor="middle" fontSize="12" fill="#8aa0c4" style={txt}>sinapse: o "recado" químico salta o vão</text>
      </>);
    case "l2": // chave e fechadura
      return wrap(<>
        <text x="160" y="22" textAnchor="middle" fontSize="12" fill="#8aa0c4" style={txt}>encaixou → dispara a resposta</text>
        <rect x="180" y="48" width="90" height="60" rx="8" fill="#13203a" stroke="#4c4c54" strokeWidth="2" />
        <path d="M180 70 h26 v18 h-26" fill="#0a0e1a" stroke="#4c4c54" strokeWidth="2" />
        <circle cx="120" cy="79" r="16" fill="#ffb627" />
        <rect x="134" y="73" width="48" height="12" rx="3" fill="#ffb627" />
        <rect x="150" y="63" width="8" height="10" fill="#ffb627" /><rect x="166" y="63" width="8" height="10" fill="#ffb627" />
        <text x="100" y="120" textAnchor="middle" fontSize="11" fill="#ffb627" style={txt}>mensageiro</text>
        <text x="225" y="125" textAnchor="middle" fontSize="11" fill="#ffce6b" style={txt}>receptor</text>
      </>);
    case "l3": // whatsapp vs email
      return wrap(<>
        <rect x="14" y="28" width="135" height="94" rx="12" fill="#0d2818" stroke="#4ade8055" strokeWidth="1.5" />
        <text x="81" y="55" textAnchor="middle" fontSize="26">💬</text>
        <text x="81" y="84" textAnchor="middle" fontSize="12" fill="#4ade80" fontWeight="700" style={txt}>Neurotransmissor</text>
        <text x="81" y="104" textAnchor="middle" fontSize="10.5" fill="#9fb2d4" style={txt}>rápido · local</text>
        <rect x="171" y="28" width="135" height="94" rx="12" fill="#2a1010" stroke="#ef444455" strokeWidth="1.5" />
        <text x="238" y="55" textAnchor="middle" fontSize="26">📧</text>
        <text x="238" y="84" textAnchor="middle" fontSize="12" fill="#f87171" fontWeight="700" style={txt}>Hormônio</text>
        <text x="238" y="104" textAnchor="middle" fontSize="10.5" fill="#9fb2d4" style={txt}>lento · corpo todo</text>
      </>);
    case "l4": { // DOSE
      const items = [["D", "#ffb627", "Dopamina"], ["O", "#f472b6", "Ocitocina"], ["S", "#4ade80", "Serotonina"], ["E", "#2dd4bf", "Endorfina"]];
      return wrap(<>{items.map(([l, c, n], i) => {
        const x = 22 + i * 73;
        return <g key={l}><rect x={x} y="38" width="56" height="56" rx="14" fill={c + "22"} stroke={c} strokeWidth="2" />
          <text x={x + 28} y="76" textAnchor="middle" fontSize="26" fontWeight="700" fill={c} style={txt}>{l}</text>
          <text x={x + 28} y="112" textAnchor="middle" fontSize="9.5" fill="#9fb2d4" style={txt}>{n}</text></g>;
      })}</>);
    }
    case "l5": // antecipação
      return wrap(<>
        <line x1="20" y1="115" x2="300" y2="115" stroke="#4c4c54" strokeWidth="1.5" />
        <path d="M20 100 L110 100 L130 35 L150 95 L210 95 L225 70 L240 95 L300 95" fill="none" stroke="#ffb627" strokeWidth="3" />
        <text x="130" y="28" textAnchor="middle" fontSize="11" fill="#ffb627" fontWeight="700" style={txt}>expectativa ⬆</text>
        <text x="232" y="60" textAnchor="middle" fontSize="10" fill="#9fb2d4" style={txt}>recompensa</text>
        <text x="225" y="100" textAnchor="middle" fontSize="16">🎁</text>
        <text x="160" y="135" textAnchor="middle" fontSize="10.5" fill="#8aa0c4" style={txt}>o pico é na ESPERA, não no prêmio</text>
      </>);
    case "l6": // intestino-cérebro
      return wrap(<>
        <text x="160" y="40" textAnchor="middle" fontSize="30">🧠</text>
        <line x1="160" y1="52" x2="160" y2="88" stroke="#4ade80" strokeWidth="2.5" strokeDasharray="4 3" />
        <path d="M120 110 q10 -16 22 -4 q12 12 24 0 q12 -12 24 0 q12 12 22 -4" fill="none" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" />
        <circle cx="205" cy="100" r="16" fill="#4ade8022" stroke="#4ade80" strokeWidth="1.5" />
        <text x="205" y="104" textAnchor="middle" fontSize="11" fontWeight="700" fill="#4ade80" style={txt}>90%</text>
        <text x="160" y="140" textAnchor="middle" fontSize="10.5" fill="#8aa0c4" style={txt}>o intestino é o "2º cérebro"</text>
      </>);
    case "l7": // timeline cortisol/adrenalina
      return wrap(<>
        <line x1="20" y1="115" x2="300" y2="115" stroke="#4c4c54" strokeWidth="1.5" />
        <path d="M30 113 L60 113 L70 35 L80 113 L300 113" fill="none" stroke="#f43f5e" strokeWidth="3" />
        <path d="M30 113 C90 113, 95 60, 150 60 C220 60, 240 95, 300 100" fill="none" stroke="#ef4444" strokeWidth="3" opacity="0.9" />
        <text x="70" y="28" textAnchor="middle" fontSize="10" fill="#f43f5e" fontWeight="700" style={txt}>adrenalina</text>
        <text x="200" y="50" textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="700" style={txt}>cortisol</text>
        <text x="160" y="135" textAnchor="middle" fontSize="10.5" fill="#8aa0c4" style={txt}>pico rápido vs. onda sustentada · tempo →</text>
      </>);
    case "l8": // acelerador x freio
      return wrap(<>
        <rect x="30" y="40" width="110" height="70" rx="12" fill="#a78bfa18" stroke="#a78bfa" strokeWidth="2" />
        <text x="85" y="72" textAnchor="middle" fontSize="22">⏩</text>
        <text x="85" y="96" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#a78bfa" style={txt}>Glutamato</text>
        <rect x="180" y="40" width="110" height="70" rx="12" fill="#38bdf818" stroke="#38bdf8" strokeWidth="2" />
        <text x="235" y="72" textAnchor="middle" fontSize="22">🛑</text>
        <text x="235" y="96" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#38bdf8" style={txt}>GABA</text>
        <text x="160" y="78" textAnchor="middle" fontSize="14" fill="#8aa0c4" style={txt}>×</text>
        <text x="160" y="132" textAnchor="middle" fontSize="10.5" fill="#8aa0c4" style={txt}>acelera × freia = equilíbrio</text>
      </>);
    case "l9": // ocitocina + endorfina
      return wrap(<>
        <rect x="20" y="32" width="130" height="86" rx="12" fill="#f472b614" stroke="#f472b655" strokeWidth="1.5" />
        <text x="85" y="68" textAnchor="middle" fontSize="26">🤗</text>
        <text x="85" y="94" textAnchor="middle" fontSize="11" fontWeight="700" fill="#f472b6" style={txt}>Ocitocina · vínculo</text>
        <rect x="170" y="32" width="130" height="86" rx="12" fill="#2dd4bf14" stroke="#2dd4bf55" strokeWidth="1.5" />
        <text x="235" y="68" textAnchor="middle" fontSize="26">🩹</text>
        <text x="235" y="94" textAnchor="middle" fontSize="11" fontWeight="700" fill="#2dd4bf" style={txt}>Endorfina · alívio</text>
      </>);
    case "l10": // CEO freia amígdala
      return wrap(<>
        <ellipse cx="160" cy="78" rx="120" ry="52" fill="#101d33" stroke="#3a3a42" strokeWidth="2" />
        <circle cx="95" cy="72" r="26" fill="#ffce6b33" stroke="#ffce6b" strokeWidth="2.5" />
        <text x="95" y="76" textAnchor="middle" fontSize="18">👔</text>
        <circle cx="210" cy="92" r="18" fill="#fb923c22" stroke="#fb923c" strokeWidth="1.5" opacity="0.7" />
        <text x="210" y="97" textAnchor="middle" fontSize="14" opacity="0.7">🔔</text>
        <path d="M120 78 L186 90" stroke="#ffce6b" strokeWidth="2" strokeDasharray="4 3" />
        <text x="95" y="118" textAnchor="middle" fontSize="10" fill="#ffce6b" style={txt}>córtex (freio)</text>
        <text x="160" y="142" textAnchor="middle" fontSize="10.5" fill="#8aa0c4" style={txt}>a razão segura a emoção</text>
      </>);
    case "l11": // alarme + arquivo
      return wrap(<>
        <rect x="22" y="34" width="130" height="84" rx="12" fill="#fb923c14" stroke="#fb923c55" strokeWidth="1.5" />
        <text x="87" y="72" textAnchor="middle" fontSize="28">🔔</text>
        <text x="87" y="98" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fb923c" style={txt}>Amígdala · alarme</text>
        <rect x="168" y="34" width="130" height="84" rx="12" fill="#c084fc14" stroke="#c084fc55" strokeWidth="1.5" />
        <text x="233" y="72" textAnchor="middle" fontSize="28">🗄️</text>
        <text x="233" y="98" textAnchor="middle" fontSize="11" fontWeight="700" fill="#c084fc" style={txt}>Hipocampo · arquivo</text>
      </>);
    case "l12": // talamo hub + termostato
      return wrap(<>
        <circle cx="95" cy="74" r="24" fill="#ffce6b22" stroke="#ffce6b" strokeWidth="2" />
        <text x="95" y="79" textAnchor="middle" fontSize="16">📡</text>
        <g stroke="#ffce6b" strokeWidth="1.5"><line x1="95" y1="44" x2="95" y2="28" /><line x1="71" y1="60" x2="52" y2="48" /><line x1="71" y1="88" x2="52" y2="100" /></g>
        <text x="40" y="32" fontSize="14">👁️</text><text x="34" y="52" fontSize="14">👂</text><text x="34" y="110" fontSize="14">✋</text>
        <text x="95" y="120" textAnchor="middle" fontSize="10" fill="#ffce6b" style={txt}>Tálamo (recepção)</text>
        <circle cx="232" cy="72" r="30" fill="#ef444418" stroke="#ef4444" strokeWidth="2" />
        <line x1="232" y1="72" x2="248" y2="56" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
        <text x="232" y="120" textAnchor="middle" fontSize="10" fill="#ef4444" style={txt}>Hipotálamo (hormônios)</text>
      </>);
    case "l13": { // puzzle peças
      const ps = [["🤢", "Ínsula", "#4ade80"], ["🔁", "Gânglios", "#ffb627"], ["⚖️", "Cerebelo", "#a78bfa"], ["👁️", "Occipital", "#ffce6b"]];
      return wrap(<>{ps.map(([e, n, c], i) => { const x = 20 + i * 73; return <g key={n}>
        <rect x={x} y="40" width="58" height="58" rx="10" fill={c + "18"} stroke={c + "66"} strokeWidth="1.5" />
        <text x={x + 29} y="74" textAnchor="middle" fontSize="22">{e}</text>
        <text x={x + 29} y="114" textAnchor="middle" fontSize="9.5" fill="#9fb2d4" style={txt}>{n}</text></g>; })}</>);
    }
    case "l14": // sequestro
      return wrap(<>
        <circle cx="100" cy="72" r="34" fill="#ef444433" stroke="#ef4444" strokeWidth="3" className="halo" />
        <text x="100" y="80" textAnchor="middle" fontSize="26">🔔</text>
        <text x="100" y="124" textAnchor="middle" fontSize="10.5" fill="#ef4444" fontWeight="700" style={txt}>amígdala no comando</text>
        <circle cx="225" cy="76" r="24" fill="#1e1e23" stroke="#4c4c54" strokeWidth="2" opacity="0.5" />
        <text x="225" y="81" textAnchor="middle" fontSize="16" opacity="0.45">👔</text>
        <text x="225" y="120" textAnchor="middle" fontSize="10" fill="#7c7c84" style={txt}>córtex "offline"</text>
        <path d="M140 72 L196 74" stroke="#ef4444" strokeWidth="2.5" markerEnd="url(#a)" />
      </>);
    case "l15": { // hábitos
      const hs = [["😴", "Sono"], ["🏃", "Exercício"], ["☀️", "Sol"], ["🫂", "Conexão"]];
      return wrap(<>{hs.map(([e, n], i) => { const x = 20 + i * 73; return <g key={n}>
        <circle cx={x + 29} cy="62" r="26" fill="#ffce6b15" stroke="#ffce6b55" strokeWidth="1.5" />
        <text x={x + 29} y="70" textAnchor="middle" fontSize="22">{e}</text>
        <text x={x + 29} y="112" textAnchor="middle" fontSize="10.5" fill="#cfe0f7" fontWeight="600" style={txt}>{n}</text></g>; })}</>);
    }
    default:
      return null;
  }
}

// ── STAGE renderers ────────────────────────────────────────────────
function StageHook({ stage }) {
  return (
    <div style={styles.stageHook}>
      <p style={{ fontSize: 15.5, lineHeight: 1.7, color: "#e6eefc", margin: 0, fontFamily: "Fraunces, serif" }}>{stage.content}</p>
      {stage.question && (
        <div style={styles.stageQuestion}>
          <span style={{ fontSize: 18 }}>💭</span>
          <b style={{ color: "#ffce6b", fontSize: 14 }}>{stage.question}</b>
        </div>
      )}
    </div>
  );
}

function StageConceito({ stage }) {
  return (
    <div className="fade">
      <h3 style={styles.stageTitle}>{stage.title}</h3>
      {stage.content && <p style={styles.stagePara}>{stage.content}</p>}
      <div style={styles.stageItems}>
        {(stage.items || []).map((item, i) => (
          <div key={i} style={styles.stageItem}>
            <span style={{ fontSize: 26, flexShrink: 0 }}>{item.emoji}</span>
            <div>
              <b style={{ color: "#ffce6b", fontSize: 13.5, display: "block" }}>{item.label}</b>
              <span style={{ fontSize: 13, color: "#c8d4ea", lineHeight: 1.5 }}>{item.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StageFlow({ stage }) {
  return (
    <div className="fade">
      <h3 style={styles.stageTitle}>{stage.title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {(stage.steps || []).map((step, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div style={styles.stageFlowStep}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{step.icon}</span>
              <div>
                <b style={{ color: "#ffce6b", fontSize: 13, display: "block" }}>{step.label}</b>
                <span style={{ fontSize: 13, color: "#c8d4ea", lineHeight: 1.45 }}>{step.text}</span>
              </div>
            </div>
            {i < stage.steps.length - 1 && (
              <div style={{ width: 2, height: 18, background: "rgba(255,206,107,0.25)", marginLeft: 22, borderRadius: 99 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StageCompareLesson({ stage }) {
  const { left: L, right: R } = stage;
  return (
    <div className="fade">
      <h3 style={styles.stageTitle}>{stage.title}</h3>
      <div style={{ display: "flex", gap: 9 }}>
        {[L, R].map((side, si) => (
          <div key={si} style={{ flex: 1, padding: "13px 11px", borderRadius: 14, border: `1px solid ${side.color}44`, background: side.color + "10" }}>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{side.emoji}</span>
              <b style={{ display: "block", color: side.color, fontSize: 13.5 }}>{side.name}</b>
            </div>
            {(side.items || []).map((item, i) => (
              <div key={i} style={{ fontSize: 12.5, color: "#c8d4ea", lineHeight: 1.45, padding: "4px 0", borderTop: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>{item}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function StageQuiz({ stage, onAnswer, answered, picked }) {
  const correct = answered && picked === stage.correct;
  return (
    <div className="fade">
      <div style={styles.stageQuizBadge}>🧠 Fixação</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: "#e6eefc", lineHeight: 1.5, margin: "8px 0 14px" }}>{stage.q}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {(stage.opts || []).map((opt, i) => {
          let bd = "rgba(255,255,255,0.12)", bg = "rgba(255,255,255,0.03)", cl = "#dce8fb";
          if (answered) {
            if (i === stage.correct) { bd = "#4ade80"; bg = "rgba(74,222,128,0.12)"; cl = "#9be8b4"; }
            else if (i === picked)   { bd = "#f87171"; bg = "rgba(248,113,113,0.12)"; cl = "#f8b4b4"; }
          }
          return (
            <button key={i} onClick={() => !answered && onAnswer(i)} disabled={answered}
              style={{ ...styles.quizOpt, borderColor: bd, background: bg, color: cl, textAlign: "left" }}>
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="fade" style={{ marginTop: 12, padding: "12px 14px", borderRadius: 13,
          borderColor: correct ? "#4ade8055" : "#fb923c55",
          background: (correct ? "#4ade80" : "#fb923c") + "12",
          border: "1px solid" }}>
          <b style={{ color: correct ? "#4ade80" : "#fb923c" }}>{correct ? "Isso! 🎉" : "Quase! A correta está em verde."}</b>
          <p style={{ ...styles.lessonPara, margin: "5px 0 0", fontSize: 13.5 }}>{stage.why}</p>
        </div>
      )}
    </div>
  );
}

function StageReal({ stage }) {
  return (
    <div className="fade">
      <h3 style={styles.stageTitle}>{stage.title}</h3>
      <p style={styles.stagePara}>{stage.content}</p>
      {stage.aplicacao && (
        <div style={styles.stageAplicacao}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#7dd3fc", display: "block", marginBottom: 5, letterSpacing: 0.5 }}>NA PRÁTICA</span>
          <p style={{ fontSize: 13.5, color: "#dbe4f3", lineHeight: 1.55, margin: 0 }}>{stage.aplicacao}</p>
        </div>
      )}
    </div>
  );
}

function StageApply({ stage }) {
  return (
    <div style={styles.stageApply}>
      <span style={{ fontSize: 24, marginBottom: 6 }}>🎯</span>
      <b style={{ color: "#ffce6b", fontSize: 14, display: "block", marginBottom: 8 }}>Experimente hoje</b>
      <p style={{ fontSize: 14, color: "#e6eefc", lineHeight: 1.6, margin: 0 }}>{stage.text}</p>
    </div>
  );
}

function StageLink({ stage }) {
  return (
    <div style={styles.stageLink}>
      <p style={{ fontSize: 13.5, color: "#c8d4ea", margin: "0 0 10px" }}>{stage.text}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(stage.targets || []).map((t) => (
          <div key={t.id} style={{ padding: "8px 13px", borderRadius: 12, background: "rgba(255,206,107,0.10)", border: "1px solid rgba(255,206,107,0.35)", fontSize: 13, color: "#ffce6b", fontWeight: 600 }}>
            {t.emoji} {t.name}
          </div>
        ))}
      </div>
    </div>
  );
}

function StageScenario({ stage, onPick, picked }) {
  const chosen = picked !== undefined ? stage.choices[picked] : null;
  const qualColor = { good: "#4ade80", neutral: "#ffce6b", warning: "#fb7185" };
  const qualEmoji = { good: "✅", neutral: "💡", warning: "⚠️" };
  return (
    <div className="fade">
      <div style={{ ...styles.stageQuizBadge, background: "rgba(99,102,241,0.18)", borderColor: "rgba(99,102,241,0.45)", color: "#a5b4fc" }}>🎬 Cenário</div>
      <h3 style={{ ...styles.stageTitle, marginTop: 8 }}>{stage.title}</h3>
      <div style={{ padding: "12px 14px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", marginBottom: 14 }}>
        <p style={{ fontSize: 14, color: "#e6eefc", lineHeight: 1.6, margin: 0 }}>{stage.context}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {stage.choices.map((c, i) => {
          const isChosen = picked === i;
          const isOther = picked !== undefined && !isChosen;
          const qc = qualColor[c.quality] || "#ffce6b";
          return (
            <button key={i} onClick={() => picked === undefined && onPick(i)} disabled={picked !== undefined}
              style={{ ...styles.quizOpt, textAlign: "left", borderColor: isChosen ? qc : isOther ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)", background: isChosen ? qc + "12" : isOther ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.03)", opacity: isOther ? 0.5 : 1 }}>
              {c.label}
            </button>
          );
        })}
      </div>
      {chosen && (
        <div className="fade" style={{ marginTop: 12, padding: "14px", borderRadius: 14, border: "1px solid " + (qualColor[chosen.quality] || "#ffce6b") + "55", background: (qualColor[chosen.quality] || "#ffce6b") + "10" }}>
          <b style={{ color: qualColor[chosen.quality] || "#ffce6b", fontSize: 13 }}>{qualEmoji[chosen.quality] || "💡"} {chosen.quality === "good" ? "Boa escolha!" : chosen.quality === "warning" ? "Cuidado!" : "Parcialmente certo"}</b>
          <p style={{ fontSize: 13.5, color: "#dbe4f3", lineHeight: 1.55, margin: "7px 0 0" }}>{chosen.result || chosen.content}</p>
        </div>
      )}
    </div>
  );
}

function StageInsightStack({ stage }) {
  const [rev, setRev] = useState(0);
  const ins = stage.insights || [];
  return (
    <div className="fade">
      <div style={{ ...styles.stageQuizBadge, background: "rgba(52,211,153,0.14)", borderColor: "rgba(52,211,153,0.4)", color: "#6ee7b7" }}>💡 Descobertas</div>
      <h3 style={{ ...styles.stageTitle, marginTop: 8 }}>{stage.title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
        {ins.slice(0, rev + 1).map((it, i) => (
          <div key={i} className="fade" style={{ padding: "13px 14px", borderRadius: 14, background: i === rev ? "rgba(52,211,153,0.08)" : "rgba(255,255,255,0.04)", border: i === rev ? "1px solid rgba(52,211,153,0.35)" : "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{it.emoji}</span>
              <div>
                <b style={{ color: i === rev ? "#6ee7b7" : "#ffce6b", fontSize: 13.5, display: "block", marginBottom: 4 }}>{it.title}</b>
                <p style={{ fontSize: 13, color: "#c8d4ea", lineHeight: 1.5, margin: 0 }}>{it.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {rev < ins.length - 1 && (
        <button onClick={() => setRev(r => r + 1)} className="fade"
          style={{ ...styles.ctrlBtn, width: "100%", marginTop: 12, borderColor: "rgba(52,211,153,0.4)", color: "#6ee7b7" }}>
          Próxima descoberta ({rev + 1}/{ins.length}) →
        </button>
      )}
      {rev === ins.length - 1 && ins.length > 1 && (
        <p style={{ ...styles.pMuted, textAlign: "center", marginTop: 10 }}>✓ Todas as descobertas reveladas</p>
      )}
    </div>
  );
}

function LessonView({ id, onClose, onComplete, lessons }) {
  const { addXp } = useGame();
  const L = (lessons || LESSONS)[id];
  const [si, setSi] = useState(0);
  const [answers, setAnswers] = useState({});
  const [scenarioPicks, setScenarioPicks] = useState({});
  useBackHandler(true, onClose);

  if (!L || !L.stages) return null;

  const stages = L.stages;
  const stage = stages[si];
  const isLast = si === stages.length - 1;
  const isQuiz = stage.type === "quiz";
  const isScenario = stage.type === "scenario";
  const answered = answers[si] !== undefined;
  const scenarioPicked = scenarioPicks[si] !== undefined;
  const canNext = (!isQuiz || answered) && (!isScenario || scenarioPicked);

  const next = () => {
    if (isLast) { addXp(20, "Lição!"); onComplete(); }
    else setSi(s => s + 1);
  };

  const STAGE_LABELS = {
    hook: "Introdução", conceito: "Conceito", flow: "Como funciona",
    compare: "Comparação", quiz: "Fixação", real: "Na prática",
    apply: "Aplicar", link: "Próximos passos",
    scenario: "Cenário real", insight_stack: "Descobertas",
  };

  return (
    <div className="fade">
      <button onClick={onClose} style={styles.backBtn}><ArrowLeft size={16} /> Voltar</button>
      <div style={{ textAlign: "center", margin: "4px 0 16px" }}>
        <div style={{ fontSize: 38 }}>{L.emoji}</div>
        <h2 style={{ ...styles.h2, fontSize: 20, margin: "6px 0 4px" }}>{L.title}</h2>
      </div>
      <div style={{ display: "flex", gap: 5, justifyContent: "center", marginBottom: 18 }}>
        {stages.map((st, i) => (
          <div key={i} style={{ width: i === si ? 22 : 8, height: 8, borderRadius: 99, transition: "all .25s", background: i < si ? "#4ade80" : i === si ? "#ffce6b" : "rgba(255,255,255,0.15)" }} />
        ))}
      </div>
      <div style={{ fontSize: 11, fontWeight: 800, color: "#8aa0c4", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
        {STAGE_LABELS[stage.type] || stage.type} · {si + 1}/{stages.length}
      </div>

      {stage.type === "hook"          && <StageHook stage={stage} />}
      {stage.type === "conceito"      && <StageConceito stage={stage} />}
      {stage.type === "flow"          && <StageFlow stage={stage} />}
      {stage.type === "compare"       && <StageCompareLesson stage={stage} />}
      {stage.type === "quiz"          && <StageQuiz stage={stage} onAnswer={(i) => { if (!answered) setAnswers({ ...answers, [si]: i }); }} answered={answered} picked={answers[si]} />}
      {stage.type === "real"          && <StageReal stage={stage} />}
      {stage.type === "apply"         && <StageApply stage={stage} />}
      {stage.type === "link"          && <StageLink stage={stage} />}
      {stage.type === "scenario"      && <StageScenario stage={stage} onPick={(i) => { if (!scenarioPicked) setScenarioPicks({ ...scenarioPicks, [si]: i }); }} picked={scenarioPicks[si]} />}
      {stage.type === "insight_stack" && <StageInsightStack stage={stage} />}

      {canNext && (
        <button onClick={next} className="fade" style={{ ...styles.ctrlBtn, ...styles.playBtn, width: "100%", marginTop: 20 }}>
          {isLast ? "Concluir lição (+20 XP) 🎉" : "Próximo →"}
          <ChevronRight size={17} />
        </button>
      )}
      {(isQuiz && !answered) && <p style={{ ...styles.pMuted, textAlign: "center", marginTop: 12 }}>Escolha uma resposta para continuar</p>}
      {(isScenario && !scenarioPicked) && <p style={{ ...styles.pMuted, textAlign: "center", marginTop: 12 }}>Escolha uma opção para ver a análise</p>}
    </div>
  );
}

// =========================================================================
//  CÉREBRO (explorar)
// =========================================================================

function Cerebro() {
  const [view, setView] = useState("anatomia");
  const [selRegion, setSelRegion] = useState(null);
  const [selNeuro, setSelNeuro] = useState(null);

  const pickRegion = (id) => { setSelNeuro(null); setSelRegion((p) => (p === id ? null : id)); };
  const pickNeuro = (id) => { setSelRegion(null); setSelNeuro((p) => (p === id ? null : id)); };

  let activeRegions = new Set();
  let activeNeuros = new Set();
  let activeConn = new Set();
  if (selRegion) {
    activeRegions.add(selRegion);
    REGIONS[selRegion].neuros.forEach((n) => activeNeuros.add(n));
    CONNECTIONS.forEach(([a, b], i) => { if (a === selRegion || b === selRegion) activeConn.add(i); });
  }
  if (selNeuro) {
    activeNeuros.add(selNeuro);
    Object.entries(REGIONS).forEach(([id, r]) => { if (r.neuros.includes(selNeuro)) activeRegions.add(id); });
  }

  return (
    <div className="fade">
      <div style={styles.segment}>
        <button onClick={() => setView("anatomia")} style={{ ...styles.segBtn, ...(view === "anatomia" ? styles.segActive : {}) }}><Brain size={14} /> Anatomia</button>
        <button onClick={() => setView("conexoes")} style={{ ...styles.segBtn, ...(view === "conexoes" ? styles.segActive : {}) }}><Network size={14} /> Conexões</button>
        <button onClick={() => setView("equilibrio")} style={{ ...styles.segBtn, ...(view === "equilibrio" ? styles.segActive : {}) }}><SlidersHorizontal size={14} /> Equilíbrio</button>
        <button onClick={() => setView("cenarios")} style={{ ...styles.segBtn, ...(view === "cenarios" ? styles.segActive : {}) }}><Zap size={14} /> Cenários</button>
      </div>

      {view === "anatomia" && (
        <>
          <div style={styles.brainWrap}>
            <BrainSVG activeRegions={activeRegions} activeConn={activeConn} onPick={pickRegion} glow={null} clickable />
            {!selRegion && !selNeuro && <p style={styles.hint}>Toque numa região acima ✦</p>}
          </div>
          <ExploreContent selRegion={selRegion} selNeuro={selNeuro} activeNeuros={activeNeuros}
            pickNeuro={pickNeuro} clear={() => { setSelRegion(null); setSelNeuro(null); }} />
        </>
      )}
      {view === "conexoes" && <GraphView />}
      {view === "equilibrio" && <EquilibrioLab />}
      {view === "cenarios" && <Cenarios />}
    </div>
  );
}

function BrainSVG({ activeRegions, activeConn, onPick, glow, clickable }) {
  return (
    <svg viewBox="0 0 470 430" style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <radialGradient id="bg" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="#1b1b20" /><stop offset="100%" stopColor="#0a0a0c" />
        </radialGradient>
        <filter id="soft"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>
      {glow && <rect x="0" y="0" width="470" height="430" fill={glow} opacity="0.05" />}
      <path d="M95 175 C95 110 160 70 235 78 C300 72 345 110 350 160
               C385 158 415 185 410 225 C420 248 405 280 375 282
               C372 312 345 332 312 326 C300 348 270 356 245 344
               C220 356 188 352 172 330 C140 336 108 318 105 285
               C78 282 62 252 75 226 C62 205 72 182 95 175 Z"
        fill="url(#bg)" stroke="#3a3a42" strokeWidth="2" />
      <g stroke="#2b2b31" strokeWidth="1.5" fill="none" opacity="0.6">
        <path d="M140 150 C175 135 205 150 210 180 C215 205 195 215 200 240" />
        <path d="M250 110 C260 145 240 160 255 185 C270 205 255 230 270 250" />
        <path d="M310 135 C300 165 325 175 320 205 C315 230 335 240 330 265" />
      </g>
      <g stroke="#45454d" strokeWidth="1.3" fill="none" opacity="0.8">
        <path d="M376 300 q14 6 28 4" /><path d="M374 310 q15 6 30 3" /><path d="M376 320 q14 5 26 2" />
      </g>
      <path d="M340 350 q8 26 14 50" stroke="#45454d" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.6" />

      {CONNECTIONS.map(([a, b], i) => {
        const A = REGIONS[a], B = REGIONS[b]; const on = activeConn.has(i);
        return <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y}
          stroke={on ? "#ffce6b" : "#45454d"} strokeWidth={on ? 2.5 : 1.2}
          opacity={on ? 0.9 : 0.4} className={on ? "pulse-line" : ""} />;
      })}

      {Object.entries(REGIONS).map(([id, r]) => {
        const on = activeRegions.has(id);
        const ly = r.lp === "above" ? r.y - r.r - 6 : r.y + r.r + 13;
        return (
          <g key={id} onClick={() => onPick(id)} style={{ cursor: clickable ? "pointer" : "default" }} className="node-g">
            {on && <circle cx={r.x} cy={r.y} r={r.r + 10} fill={glow || "#ffce6b"} opacity="0.22" filter="url(#soft)" className="halo" />}
            <circle cx={r.x} cy={r.y} r={r.r} fill={on ? (glow || "#ffce6b") : "#1e1e23"}
              stroke={on ? "#e0f2fe" : "#4c4c54"} strokeWidth={on ? 2.5 : 1.5} className={on ? "node-on" : ""} />
            <text x={r.x} y={ly} textAnchor="middle" fill={on ? "#e0f2fe" : "#8aa0c4"}
              fontSize={on ? 11.5 : 10} fontWeight={on ? 700 : 500} style={{ fontFamily: "Sora, sans-serif" }}>
              {r.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ExploreContent({ selRegion, selNeuro, activeNeuros, pickNeuro, clear }) {
  const region = selRegion ? REGIONS[selRegion] : null;
  const neuro = selNeuro ? NEUROS[selNeuro] : null;
  const [q, setQ] = useState("");
  const filtered = Object.keys(NEUROS).filter((n) => NEUROS[n].name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={styles.panel}>
      {!region && !neuro && (
        <div>
          <h2 style={styles.h2}>Explore o cérebro</h2>
          <p style={styles.p}>Toque numa <span style={{ color: "#ffce6b" }}>região</span> pra ver o que faz, uma curiosidade e seus químicos. Toque num <span style={{ color: "#ffb627" }}>químico</span> abaixo pra ver onde ele age.</p>
          <div style={styles.legend}>
            <span style={styles.legItem}><i style={{ background: "#ffce6b" }} /> Região</span>
            <span style={styles.legItem}><i style={{ background: "#4ade80" }} /> Neurotransmissor</span>
            <span style={styles.legItem}><i style={{ background: "#ef4444" }} /> Hormônio</span>
          </div>
        </div>
      )}

      {region && (
        <div className="fade">
          <button onClick={clear} style={styles.close}><X size={16} /></button>
          <span style={styles.tagPill}>{region.tag}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2 style={{ ...styles.h2, margin: 0 }}>{region.name}</h2>
            <SpeakBtn text={`${region.name}. ${region.role}. ${region.fn} ${region.curiosidade}`} />
          </div>
          <p style={styles.role}>{region.role}</p>
          <p style={styles.p}>{region.fn}</p>
          <div style={styles.factBox}><span style={styles.factLabel}>💡 Você sabia?</span><p style={{ ...styles.p, margin: "4px 0 0" }}>{region.curiosidade}</p></div>
          <p style={styles.label}>Mensageiros que usa:</p>
          <div style={styles.chips}>{region.neuros.map((n) => <Chip key={n} id={n} onClick={() => pickNeuro(n)} active />)}</div>
        </div>
      )}

      {neuro && (
        <div className="fade">
          <button onClick={clear} style={styles.close}><X size={16} /></button>
          <span style={{ ...styles.tagPill, background: neuro.color + "22", color: neuro.color, borderColor: neuro.color + "55" }}>{neuro.type}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2 style={{ ...styles.h2, color: neuro.color, margin: 0 }}>{neuro.name}</h2>
            <SpeakBtn text={`${neuro.name}. ${neuro.desc} Quando está alta: ${neuro.alto} Quando está baixa: ${neuro.baixo}`} />
          </div>
          <p style={styles.p}>{neuro.desc}</p>
          <div style={styles.hiLo}>
            <div style={{ ...styles.hiLoBox, borderColor: "#4ade8055", background: "#4ade8010" }}>
              <span style={{ ...styles.hiLoTag, color: "#4ade80" }}>▲ Quando está alta</span>
              <p style={styles.hiLoText}>{neuro.alto}</p>
            </div>
            <div style={{ ...styles.hiLoBox, borderColor: "#f8717155", background: "#f8717110" }}>
              <span style={{ ...styles.hiLoTag, color: "#f87171" }}>▼ Quando está baixa</span>
              <p style={styles.hiLoText}>{neuro.baixo}</p>
            </div>
          </div>
          <div style={styles.factBox}><span style={styles.factLabel}>💡 Você sabia?</span><p style={{ ...styles.p, margin: "4px 0 0" }}>{neuro.curiosidade}</p></div>
          <div style={{ ...styles.factBox, background: neuro.color + "12", borderColor: neuro.color + "44" }}>
            <span style={{ ...styles.factLabel, color: neuro.color }}>🌱 Como estimular naturalmente</span>
            <p style={{ ...styles.p, margin: "4px 0 0" }}>{neuro.boost}</p>
          </div>
          <p style={styles.label}>Regiões onde aparece:</p>
          <div style={styles.chips}>
            {Object.entries(REGIONS).filter(([, r]) => r.neuros.includes(selNeuro)).map(([id, r]) => <span key={id} style={styles.regChip}>{r.name}</span>)}
          </div>
        </div>
      )}

      <div style={{ marginTop: 22 }}>
        <p style={styles.label}>Todos os mensageiros químicos</p>
        <div style={styles.searchWrap}>
          <Search size={15} style={{ color: "#7c7c84" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar químico..." style={styles.searchInput} />
          {q && <button onClick={() => setQ("")} style={styles.searchClear}><X size={13} /></button>}
        </div>
        <div style={styles.chips}>{filtered.map((n) => <Chip key={n} id={n} onClick={() => pickNeuro(n)} active={activeNeuros.has(n) || selNeuro === n} />)}</div>
        {filtered.length === 0 && <p style={styles.pMuted}>Nada encontrado.</p>}
      </div>
    </div>
  );
}

function Chip({ id, onClick, active }) {
  const n = NEUROS[id];
  return (
    <button onClick={onClick} style={{ ...styles.chip, borderColor: active ? n.color : "#35353d", background: active ? n.color + "1f" : "transparent", color: active ? n.color : "#9fb2d4", boxShadow: active ? `0 0 12px ${n.color}44` : "none" }}>
      <i style={{ width: 8, height: 8, borderRadius: 99, background: n.color, display: "inline-block" }} /> {n.name}
    </button>
  );
}

// =========================================================================
//  CENÁRIOS
// =========================================================================

function Cenarios() {
  const { seeScenario, addXp, progress, recordConcept } = useGame();
  const [scenario, setScenario] = useState(null);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState("reveal"); // 'predict' | 'reveal'
  const [guess, setGuess] = useState(null);
  const [recap, setRecap] = useState(false);
  const [predictMode, setPredictMode] = useState(true);
  const [scenCat, setScenCat] = useState("all");
  const awarded = useRef({});

  const start = (sc) => {
    setScenario(sc); setStep(0); setPhase("reveal"); setGuess(null); setRecap(false);
    seeScenario(sc.id);
    if (!awarded.current[sc.id]) { awarded.current[sc.id] = true; addXp(10, "Cenário"); }
  };
  const exit = () => { setScenario(null); setRecap(false); };
  useBackHandler(scenario !== null, exit);
  const goNext = () => {
    if (step === scenario.steps.length - 1) { setRecap(true); return; }
    setStep(step + 1); setGuess(null); setPhase(predictMode ? "predict" : "reveal");
  };
  const goPrev = () => { if (step > 0) { setStep(step - 1); setPhase("reveal"); setGuess(null); } };

  const opts = useMemo(() => {
    if (!scenario || phase !== "predict") return [];
    const correct = scenario.steps[step].neuro;
    const others = shuffle(Object.keys(NEUROS).filter((n) => n !== correct)).slice(0, 3);
    return shuffle([correct, ...others]);
  }, [scenario, step, phase]);

  const answerGuess = (nid) => {
    if (guess !== null) return;
    setGuess(nid);
    const cNeuro = scenario.steps[step].neuro;
    const ok = nid === cNeuro;
    recordConcept(cNeuro, ok);
    if (ok) addXp(3, "Predição certa!");
  };

  if (!scenario) {
    const filtered = scenCat === "all" ? SCENARIOS : SCENARIOS.filter((sc) => sc.cat === scenCat);
    return (
      <div className="fade">
        <h2 style={styles.h2}>Cenários</h2>
        <p style={styles.p}>Veja os químicos e regiões agindo em cadeia. Avance no seu tempo. (+10 XP por cenário · {Object.keys(progress.stats.seen || {}).length}/{SCENARIOS.length} vistos)</p>
        <button onClick={() => setPredictMode((v) => !v)} style={{ ...styles.miniBtn, marginBottom: 10 }}>🔮 Modo predição: {predictMode ? "ON" : "OFF"}</button>
        <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 6, marginBottom: 10 }}>
          <button onClick={() => setScenCat("all")} style={{ ...styles.uxCatBtn, borderColor: scenCat === "all" ? "#ffce6b" : "rgba(255,255,255,0.12)", color: scenCat === "all" ? "#ffce6b" : "#9fb2d4" }}>Todos</button>
          {Object.entries(SCEN_CATS).map(([k, v]) => (
            <button key={k} onClick={() => setScenCat(k)} style={{ ...styles.uxCatBtn, borderColor: scenCat === k ? "#ffce6b" : "rgba(255,255,255,0.12)", color: scenCat === k ? "#ffce6b" : "#9fb2d4", background: scenCat === k ? "rgba(255,206,107,0.12)" : "transparent" }}>{v.emoji} {v.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {filtered.map((sc) => {
            const seen = (progress.stats.seen || {})[sc.id];
            return (
              <button key={sc.id} onClick={() => start(sc)} style={styles.scCard}>
                <span style={{ fontSize: 24 }}>{sc.emoji}</span>
                <span style={{ flex: 1 }}>
                  <b style={{ display: "block", color: "#e6eefc", fontSize: 14 }}>{sc.title}</b>
                  <span style={{ fontSize: 12, color: "#8aa0c4" }}>{sc.summary}</span>
                </span>
                {seen ? <Check size={16} style={{ color: "#4ade80" }} /> : <ChevronRight size={18} style={{ color: "#ffce6b" }} />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (recap) {
    return (
      <div className="fade">
        <button onClick={exit} style={styles.backBtn}><ArrowLeft size={16} /> Todos os cenários</button>
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 30 }}>{scenario.emoji}</span>
          <h2 style={{ ...styles.h2, fontSize: 19 }}>A cadeia completa</h2>
          <p style={styles.pMuted}>{scenario.summary}</p>
        </div>
        <div style={{ marginTop: 10 }}>
          {scenario.steps.map((s, j) => <ChainRow key={j} s={s} idx={j} last={j === scenario.steps.length - 1} state="done" />)}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button onClick={() => { setStep(0); setRecap(false); setPhase("reveal"); }} style={styles.ctrlBtn}><RotateCcw size={15} /> De novo</button>
          <button onClick={exit} style={{ ...styles.ctrlBtn, ...styles.playBtn }}>Outros cenários</button>
        </div>
      </div>
    );
  }

  const cNeuro = scenario.steps[step].neuro;
  const n = NEUROS[cNeuro];
  const last = step === scenario.steps.length - 1;
  const predicting = phase === "predict";
  let activeRegions = new Set();
  if (!predicting) activeRegions.add(scenario.steps[step].region);

  return (
    <div className="fade">
      <button onClick={exit} style={styles.backBtn}><ArrowLeft size={16} /> Todos os cenários</button>
      <div style={styles.brainWrap}>
        <BrainSVG activeRegions={activeRegions} activeConn={new Set()} onPick={() => {}} glow={predicting ? null : n.color} clickable={false} />
      </div>
      <div style={{ textAlign: "center", marginTop: 6 }}>
        <span style={{ fontSize: 24 }}>{scenario.emoji}</span>
        <h2 style={{ ...styles.h2, fontSize: 18 }}>{scenario.title}</h2>
      </div>
      <div style={styles.progress}>{scenario.steps.map((_, i) => <span key={i} style={{ height: 5, borderRadius: 99, background: i < step ? "#4ade80" : i === step && !predicting ? n.color : "#2c3e60", flex: 1 }} />)}</div>

      <div style={{ marginTop: 4 }}>
        {scenario.steps.slice(0, predicting ? step : step + 1).map((s, j) => (
          <ChainRow key={j} s={s} idx={j} last={!predicting && j === step} state={!predicting && j === step ? "current" : "done"} />
        ))}
      </div>

      {predicting ? (
        <div className="fade" style={styles.predictBox}>
          <b style={{ fontSize: 15, color: "#c084fc" }}>🔮 Qual químico entra agora?</b>
          <p style={{ ...styles.pMuted, margin: "4px 0 10px" }}>Tente adivinhar antes de revelar — pensar fixa muito mais.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {opts.map((nid) => {
              const c = NEUROS[nid].color; let bg = c + "14", bc = c + "55", cl = c;
              if (guess !== null) {
                if (nid === cNeuro) { bg = "#4ade8022"; bc = "#4ade80"; cl = "#9be8b4"; }
                else if (nid === guess) { bg = "#f8717122"; bc = "#f87171"; cl = "#f8b4b4"; }
                else { bg = "#10192c"; bc = "#2c3e60"; cl = "#7c7c84"; }
              }
              return <button key={nid} disabled={guess !== null} onClick={() => answerGuess(nid)} style={{ ...styles.quizOpt, textAlign: "center", background: bg, borderColor: bc, color: cl }}>{NEUROS[nid].name}</button>;
            })}
          </div>
          {guess !== null ? (
            <div className="fade" style={{ marginTop: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: guess === cNeuro ? "#4ade80" : "#fb923c", textAlign: "center" }}>{guess === cNeuro ? "Acertou! 🎉" : `Era ${n.name}.`}</p>
              <button onClick={() => setPhase("reveal")} style={{ ...styles.ctrlBtn, ...styles.playBtn, width: "100%", marginTop: 6 }}>Ver a etapa <ChevronRight size={17} /></button>
            </div>
          ) : (
            <button onClick={() => setPhase("reveal")} style={{ ...styles.miniBtn, margin: "12px auto 0" }}>Pular e ver</button>
          )}
        </div>
      ) : (
        <>
          <div style={styles.controls}>
            <button onClick={goPrev} disabled={step === 0} style={styles.ctrlBtn}><ChevronLeft size={18} /> Voltar</button>
            {last ? (
              <button onClick={() => setRecap(true)} style={{ ...styles.ctrlBtn, ...styles.playBtn }}>Ver resumo <ScrollText size={16} /></button>
            ) : (
              <button onClick={goNext} style={{ ...styles.ctrlBtn, ...styles.playBtn }}>Próximo <ChevronRight size={18} /></button>
            )}
          </div>
          <p style={{ ...styles.label, textAlign: "center", marginTop: 10 }}>Etapa {step + 1} de {scenario.steps.length} · avance no seu tempo</p>
        </>
      )}
    </div>
  );
}

function ChainRow({ s, idx, last, state }) {
  const n = NEUROS[s.neuro], r = REGIONS[s.region];
  const current = state === "current";
  const shortRole = n.desc.split(".")[0];
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
      {/* trilho */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 28 }}>
        <div style={{ width: 28, height: 28, borderRadius: 99, background: current ? n.color : n.color + "33", border: `2px solid ${n.color}`, color: current ? "#0a0e1a" : n.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }} className={current ? "node-on" : ""}>
          {state === "done" ? "✓" : idx + 1}
        </div>
        {!last && <div style={{ flex: 1, width: 2, background: n.color + "44", minHeight: 12 }} />}
      </div>
      {/* conteúdo */}
      <div style={{ flex: 1, paddingBottom: last ? 0 : 12 }}>
        {current ? (
          <div className="fade" style={{ ...styles.stepBox, borderColor: n.color + "66", background: n.color + "14", padding: "13px 14px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, alignItems: "center", marginBottom: 9 }}>
              <span style={styles.regChip}>{r.name}</span>
              <span style={{ fontSize: 11, color: "#8aa0c4" }}>· {r.tag}</span>
            </div>
            <p style={{ ...styles.p, margin: "0 0 11px", fontSize: 15, lineHeight: 1.55, color: "#e9f0fc" }}>{s.text}</p>
            <div style={{ ...styles.neuroInfo, borderColor: n.color + "44", background: n.color + "10" }}>
              <span style={{ ...styles.chip, borderColor: n.color, color: n.color, background: n.color + "1f", padding: "4px 10px" }}>
                <i style={{ width: 8, height: 8, borderRadius: 99, background: n.color, display: "inline-block" }} /> {n.name}
              </span>
              <span style={{ fontSize: 11, color: n.color, fontWeight: 600, marginLeft: 6 }}>{n.type}</span>
              <p style={{ fontSize: 12.5, color: "#c2d0e8", margin: "6px 0 0", lineHeight: 1.45 }}>💊 {shortRole}.</p>
            </div>
            <BodyMeters neuro={s.neuro} />
          </div>
        ) : (
          <div style={{ padding: "7px 0 4px", opacity: 0.7 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, alignItems: "center" }}>
              <b style={{ fontSize: 13, color: "#aebdd8" }}>{r.name}</b>
              <span style={{ fontSize: 11.5, color: n.color, fontWeight: 600 }}>· {n.name}</span>
            </div>
            <p style={{ fontSize: 12.5, color: "#8aa0c4", margin: "3px 0 0", lineHeight: 1.45 }}>{s.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BodyMeters({ neuro }) {
  const b = NEURO_BODY[neuro];
  if (!b) return null;
  return (
    <div style={styles.bodyMeters}>
      <span style={styles.bodyTitle}>🩺 No corpo agora:</span>
      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 7 }}>
        {METERS.map((m) => (
          <div key={m.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 92, fontSize: 11.5, color: "#c2d0e8", flexShrink: 0 }}>{m.emoji} {m.label}</span>
            <div style={styles.meterTrack}><div style={{ height: "100%", borderRadius: 99, width: `${b[m.key]}%`, background: m.color, transition: "width .45s ease" }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =========================================================================
//  JOGOS (hub) + Flashcards + Conectar
// =========================================================================

function Jogos() {
  const { progress } = useGame();
  const [game, setGame] = useState(null);
  const dueCount = Object.values(progress.review || {}).filter((v) => v.due <= Date.now()).length;
  useBackHandler(game !== null, () => setGame(null));

  const back = <button onClick={() => setGame(null)} style={styles.backBtn}><ArrowLeft size={16} /> Jogos</button>;
  if (game === "cards") return <div className="fade">{back}<Flashcards /></div>;
  if (game === "conectar") return <div className="fade">{back}<ConnectGame /></div>;
  if (game === "revisao") return <div className="fade">{back}<Revisao /></div>;
  if (game === "mito") return <div className="fade">{back}<MitoVerdade /></div>;
  if (game === "prova") return <div className="fade">{back}<ProvaFinal /></div>;
  if (game === "tutor") return <div className="fade">{back}<AITutor /></div>;
  if (game === "misto") return <div className="fade">{back}<TreinoMisto /></div>;

  const Item = ({ id, emoji, title, desc, badge }) => (
    <button onClick={() => setGame(id)} style={styles.gameCard}>
      <span style={{ fontSize: 28 }}>{emoji}</span>
      <span style={{ flex: 1 }}>
        <b style={{ display: "block", color: "#e6eefc", fontSize: 15 }}>{title}</b>
        <span style={{ fontSize: 12.5, color: "#8aa0c4" }}>{desc}</span>
      </span>
      {badge ? <span style={styles.dueBadge}>{badge}</span> : <ChevronRight size={18} style={{ color: "#ffce6b" }} />}
    </button>
  );

  return (
    <div className="fade">
      <h2 style={styles.h2}>Jogos & Treino</h2>
      <p style={styles.p}>Pratique e ganhe XP. Cada atividade reforça o que você aprendeu na trilha.</p>
      <Item id="cards" emoji="🃏" title="Flashcards" desc="24 cartas · vire e teste (+5 XP por acerto)" />
      <Item id="revisao" emoji="🔁" title="Revisão Espaçada" desc={dueCount ? `${dueCount} carta(s) pra revisar agora` : "Volta as cartas no momento certo de lembrar"} badge={dueCount || null} />
      <Item id="tutor" emoji="🤖" title="Explique com suas palavras" desc="Escreva e a IA te dá feedback (+15 XP)" />
      <Item id="misto" emoji="🔀" title="Treino Misto" desc="Perguntas embaralhadas de todos os temas (+4 XP)" />
      <Item id="conectar" emoji="🔗" title="Conectar" desc="Ligue região ao químico certo (+30 XP)" />
      <Item id="mito" emoji="❓" title="Mito vs Verdade" desc="10 afirmações: você acerta quais são reais? (+5 XP)" />
      <Item id="prova" emoji="🎓" title="Prova Final" desc="Teste geral. Passe e ganhe o diploma 📜 (+100 XP)" />
    </div>
  );
}

function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function Flashcards() {
  const { addXp, setStat, updateReview, recordConcept } = useGame();
  const [deck, setDeck] = useState(() => shuffle(CARDS.map((_, idx) => idx)));
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [review, setReview] = useState(0);
  const [done, setDone] = useState(false);
  const card = CARDS[deck[i]];

  const mark = (good) => {
    updateReview(deck[i], good);
    const c = conceptOfCard(card); if (c) recordConcept(c, good);
    if (good) { setKnown((k) => k + 1); addXp(5); }
    else setReview((r) => r + 1);
    if (i < deck.length - 1) { setI(i + 1); setFlipped(false); }
    else {
      const finalKnown = known + (good ? 1 : 0);
      if (finalKnown === deck.length) setStat("flashPerfect", true);
      setDone(true);
    }
  };
  const restart = () => { setDeck(shuffle(CARDS.map((_, idx) => idx))); setI(0); setFlipped(false); setKnown(0); setReview(0); setDone(false); };

  if (done) {
    const pct = Math.round((known / deck.length) * 100);
    return (
      <div className="fade" style={{ textAlign: "center", padding: "16px 0" }}>
        <Trophy size={46} style={{ color: "#ffb627", margin: "0 auto 10px" }} />
        <h2 style={styles.h2}>Sessão concluída!</h2>
        <p style={{ ...styles.p, fontSize: 17 }}>Acertou <b style={{ color: "#4ade80" }}>{known}</b> de <b>{deck.length}</b> ({pct}%)</p>
        <div style={styles.progress}><span style={{ height: 8, borderRadius: 99, background: "#4ade80", flex: pct }} /><span style={{ height: 8, borderRadius: 99, background: "#f87171", flex: 100 - pct }} /></div>
        {pct === 100 && <p style={{ color: "#ffb627", fontWeight: 700 }}>🐘 Conquista: Memória de Elefante!</p>}
        <button onClick={restart} style={{ ...styles.ctrlBtn, ...styles.playBtn, marginTop: 12, width: "100%" }}><Shuffle size={16} /> Estudar de novo</button>
      </div>
    );
  }

  return (
    <div className="fade">
      <div style={styles.cardTop}>
        <span style={styles.label}>Card {i + 1} de {deck.length}</span>
        <button onClick={restart} style={styles.miniBtn}><Shuffle size={14} /> Embaralhar</button>
      </div>
      <div style={styles.progress}>{deck.map((_, idx) => <span key={idx} style={{ height: 4, borderRadius: 99, background: idx < i ? "#4ade80" : idx === i ? "#ffce6b" : "#2c3e60", flex: 1 }} />)}</div>
      <button onClick={() => setFlipped((f) => !f)} style={{ ...styles.flashcard, ...(flipped ? styles.flashcardBack : {}) }}>
        {!flipped ? (<><span style={styles.cardHint}>PERGUNTA · toque pra virar</span><p style={styles.cardQ}>{card.q}</p></>) : (
          <div className="fade"><span style={{ ...styles.cardHint, color: "#ffce6b" }}>RESPOSTA</span><p style={styles.cardA}>{card.a}</p><p style={styles.cardExtra}>{card.extra}</p></div>
        )}
      </button>
      {!flipped ? (
        <button onClick={() => setFlipped(true)} style={{ ...styles.ctrlBtn, ...styles.playBtn, width: "100%", marginTop: 14 }}>Ver resposta</button>
      ) : (
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={() => mark(false)} style={{ ...styles.judgeBtn, color: "#f87171", borderColor: "#f8717155" }}><X size={17} /> Errei</button>
          <button onClick={() => mark(true)} style={{ ...styles.judgeBtn, color: "#4ade80", borderColor: "#4ade8055" }}><Check size={17} /> Acertei</button>
        </div>
      )}
      <div style={styles.tally}><span style={{ color: "#4ade80" }}>✓ {known}</span><span style={{ color: "#f87171" }}>✗ {review}</span></div>
    </div>
  );
}

function buildRound() {
  for (let attempt = 0; attempt < 50; attempt++) {
    const chosen = shuffle(Object.keys(REGIONS)).slice(0, 5);
    const sorted = [...chosen].sort((a, b) => REGIONS[a].neuros.length - REGIONS[b].neuros.length);
    const used = new Set(); const pairs = {}; let ok = true;
    for (const rid of sorted) {
      const opts = shuffle(REGIONS[rid].neuros).filter((n) => !used.has(n));
      if (opts.length === 0) { ok = false; break; }
      pairs[rid] = opts[0]; used.add(opts[0]);
    }
    if (ok) return { regions: chosen, neuros: shuffle(chosen.map((r) => pairs[r])), key: pairs };
  }
  return null;
}

function ConnectGame() {
  const { addXp, setStat } = useGame();
  const [round, setRound] = useState(buildRound);
  const [selReg, setSelReg] = useState(null);
  const [matched, setMatched] = useState({});
  const [errors, setErrors] = useState(0);
  const [wrongFlash, setWrongFlash] = useState(null);
  const scored = useRef(false);

  const matchedNeuros = new Set(Object.values(matched));
  const allMatched = round && Object.keys(matched).length === round.regions.length;

  useEffect(() => {
    if (allMatched && !scored.current) {
      scored.current = true;
      addXp(errors === 0 ? 40 : 30, "Conectar");
      if (errors === 0) setStat("connectPerfect", true);
    }
  }, [allMatched]);

  const tapNeuro = (nid) => {
    if (!selReg || matched[selReg] || matchedNeuros.has(nid)) return;
    if (round.key[selReg] === nid) { setMatched((m) => ({ ...m, [selReg]: nid })); setSelReg(null); }
    else { setErrors((e) => e + 1); setWrongFlash(nid); setTimeout(() => setWrongFlash(null), 500); }
  };
  const newRound = () => { setRound(buildRound()); setSelReg(null); setMatched({}); setErrors(0); setWrongFlash(null); scored.current = false; };

  if (!round) return <p style={styles.p}>Erro ao montar a rodada.</p>;

  if (allMatched) {
    return (
      <div className="fade" style={{ textAlign: "center", padding: "16px 0" }}>
        <Trophy size={46} style={{ color: "#ffb627", margin: "0 auto 10px" }} />
        <h2 style={styles.h2}>Mandou bem! 🎉</h2>
        <p style={{ ...styles.p, fontSize: 17 }}>5 pares com {errors === 0 ? <b style={{ color: "#4ade80" }}>nenhum erro!</b> : <><b style={{ color: "#f87171" }}>{errors}</b> erro(s).</>}</p>
        {errors === 0 && <p style={{ color: "#ffb627", fontWeight: 700 }}>🔗 Conquista: Conexão Perfeita!</p>}
        <button onClick={newRound} style={{ ...styles.ctrlBtn, ...styles.playBtn, marginTop: 12, width: "100%" }}><Shuffle size={16} /> Nova rodada</button>
      </div>
    );
  }

  return (
    <div className="fade">
      <div style={styles.cardTop}>
        <h2 style={{ ...styles.h2, fontSize: 19 }}>Conecte os pares</h2>
        <button onClick={newRound} style={styles.miniBtn}><Shuffle size={14} /> Nova</button>
      </div>
      <p style={{ ...styles.p, marginTop: 0 }}>Toque numa <b style={{ color: "#ffce6b" }}>região</b>, depois no <b>químico</b> que ela usa. ✓ {Object.keys(matched).length}/5 · ✗ {errors}</p>
      <div style={styles.gameGrid}>
        <div style={styles.gameCol}>
          {round.regions.map((rid) => {
            const done = !!matched[rid]; const sel = selReg === rid;
            return <button key={rid} disabled={done} onClick={() => setSelReg(sel ? null : rid)}
              style={{ ...styles.gameItem, borderColor: done ? "#4ade80" : sel ? "#ffce6b" : "#35353d", background: done ? "#4ade8018" : sel ? "#ffce6b22" : "#10192c", color: done ? "#9be8b4" : "#dce8fb", opacity: done ? 0.85 : 1 }}>
              {REGIONS[rid].name} {done && <Check size={13} style={{ verticalAlign: "-2px" }} />}
            </button>;
          })}
        </div>
        <div style={styles.gameCol}>
          {round.neuros.map((nid) => {
            const done = matchedNeuros.has(nid); const wrong = wrongFlash === nid; const n = NEUROS[nid];
            return <button key={nid} disabled={done} onClick={() => tapNeuro(nid)} className={wrong ? "shake" : ""}
              style={{ ...styles.gameItem, borderColor: done ? "#4ade80" : wrong ? "#f87171" : n.color + "66", background: done ? "#4ade8018" : wrong ? "#f8717125" : n.color + "14", color: done ? "#9be8b4" : n.color, opacity: done ? 0.85 : 1 }}>
              <i style={{ width: 7, height: 7, borderRadius: 99, background: done ? "#4ade80" : n.color, display: "inline-block", marginRight: 6 }} />{n.name} {done && <Check size={13} style={{ verticalAlign: "-2px" }} />}
            </button>;
          })}
        </div>
      </div>
      {selReg && <p style={{ ...styles.label, textAlign: "center", marginTop: 14, color: "#ffce6b" }}>Selecionado: {REGIONS[selReg].name} → toque no químico certo</p>}
    </div>
  );
}

// =========================================================================
//  REVISÃO ESPAÇADA
// =========================================================================

function Revisao() {
  const { progress, addXp, updateReview } = useGame();
  const [queue] = useState(() => Object.keys(progress.review || {}).filter((idx) => progress.review[idx].due <= Date.now()).map(Number));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);

  if (queue.length === 0) {
    return (
      <div className="fade" style={{ textAlign: "center", padding: "20px 0" }}>
        <Repeat size={44} style={{ color: "#4ade80", margin: "0 auto 10px" }} />
        <h2 style={styles.h2}>Tudo em dia! ✅</h2>
        <p style={styles.p}>Não há cartas para revisar agora. A revisão espaçada traz de volta o que você estudou nos flashcards, no momento certo para fixar de vez. Volte mais tarde.</p>
      </div>
    );
  }
  if (done) {
    return (
      <div className="fade" style={{ textAlign: "center", padding: "20px 0" }}>
        <Trophy size={44} style={{ color: "#ffb627", margin: "0 auto 10px" }} />
        <h2 style={styles.h2}>Revisão concluída!</h2>
        <p style={styles.p}>Você revisou {queue.length} carta(s). Elas voltarão em intervalos maiores conforme você acerta.</p>
      </div>
    );
  }

  const card = CARDS[queue[pos]];
  const mark = (good) => {
    updateReview(queue[pos], good);
    if (good) addXp(5);
    if (pos < queue.length - 1) { setPos(pos + 1); setFlipped(false); } else setDone(true);
  };

  return (
    <div className="fade">
      <div style={styles.cardTop}><span style={styles.label}>🔁 Revisão · {pos + 1} de {queue.length}</span></div>
      <div style={styles.progress}>{queue.map((_, idx) => <span key={idx} style={{ height: 4, borderRadius: 99, background: idx < pos ? "#4ade80" : idx === pos ? "#ffce6b" : "#2c3e60", flex: 1 }} />)}</div>
      <button onClick={() => setFlipped((f) => !f)} style={{ ...styles.flashcard, ...(flipped ? styles.flashcardBack : {}) }}>
        {!flipped ? (<><span style={styles.cardHint}>PERGUNTA · toque pra virar</span><p style={styles.cardQ}>{card.q}</p></>) : (
          <div className="fade"><span style={{ ...styles.cardHint, color: "#ffce6b" }}>RESPOSTA</span><p style={styles.cardA}>{card.a}</p><p style={styles.cardExtra}>{card.extra}</p></div>
        )}
      </button>
      {!flipped ? (
        <button onClick={() => setFlipped(true)} style={{ ...styles.ctrlBtn, ...styles.playBtn, width: "100%", marginTop: 14 }}>Ver resposta</button>
      ) : (
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={() => mark(false)} style={{ ...styles.judgeBtn, color: "#f87171", borderColor: "#f8717155" }}><X size={17} /> Errei</button>
          <button onClick={() => mark(true)} style={{ ...styles.judgeBtn, color: "#4ade80", borderColor: "#4ade8055" }}><Check size={17} /> Acertei</button>
        </div>
      )}
    </div>
  );
}

// =========================================================================
//  MITO vs VERDADE
// =========================================================================

function MitoVerdade() {
  const { addXp } = useGame();
  const [deck] = useState(() => shuffle(MITOS));
  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const m = deck[i];

  const answer = (val) => {
    if (pick !== null) return;
    setPick(val);
    if (val === m.isTrue) { setScore((s) => s + 1); addXp(5); }
  };
  const next = () => { if (i < deck.length - 1) { setI(i + 1); setPick(null); } else setDone(true); };

  if (done) {
    return (
      <div className="fade" style={{ textAlign: "center", padding: "16px 0" }}>
        <HelpCircle size={44} style={{ color: "#a78bfa", margin: "0 auto 10px" }} />
        <h2 style={styles.h2}>Fim!</h2>
        <p style={{ ...styles.p, fontSize: 17 }}>Você acertou <b style={{ color: "#4ade80" }}>{score}</b> de <b>{deck.length}</b>.</p>
        <button onClick={() => { setI(0); setPick(null); setScore(0); setDone(false); }} style={{ ...styles.ctrlBtn, ...styles.playBtn, marginTop: 12, width: "100%" }}><Shuffle size={16} /> De novo</button>
      </div>
    );
  }

  const correct = pick !== null && pick === m.isTrue;
  return (
    <div className="fade">
      <div style={styles.cardTop}><span style={styles.label}>❓ Mito vs Verdade · {i + 1}/{deck.length}</span><span style={styles.label}>✓ {score}</span></div>
      <div style={styles.mitoCard}>
        <p style={{ fontSize: 18, lineHeight: 1.45, color: "#e6eefc", fontFamily: "Fraunces, serif", margin: 0 }}>"{m.claim}"</p>
      </div>
      {pick === null ? (
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={() => answer(false)} style={{ ...styles.judgeBtn, color: "#f87171", borderColor: "#f8717155" }}>🚫 Mito</button>
          <button onClick={() => answer(true)} style={{ ...styles.judgeBtn, color: "#4ade80", borderColor: "#4ade8055" }}>✅ Verdade</button>
        </div>
      ) : (
        <div className="fade">
          <div style={{ ...styles.whyBox, marginTop: 14, borderColor: correct ? "#4ade8055" : "#fb923c55", background: (correct ? "#4ade80" : "#fb923c") + "12" }}>
            <b style={{ color: correct ? "#4ade80" : "#fb923c" }}>{correct ? "Acertou! " : "Não é bem assim. "}É {m.isTrue ? "VERDADE" : "MITO"}.</b>
            <p style={{ ...styles.lessonPara, margin: "5px 0 0", fontSize: 13.5 }}>{m.explain}</p>
          </div>
          <button onClick={next} style={{ ...styles.ctrlBtn, ...styles.playBtn, width: "100%", marginTop: 14 }}>{i < deck.length - 1 ? "Próxima" : "Ver resultado"} <ChevronRight size={17} /></button>
        </div>
      )}
    </div>
  );
}

// =========================================================================
//  PROVA FINAL + CERTIFICADO
// =========================================================================

function ProvaFinal() {
  const { progress, addXp, setStat } = useGame();
  const [quiz] = useState(() => shuffle(PROVA).slice(0, 10));
  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const awarded = useRef(false);
  const q = quiz[i];

  const answer = (idx) => {
    if (pick !== null) return;
    setPick(idx);
    if (idx === q.correct) setScore((s) => s + 1);
  };
  const next = () => { if (i < quiz.length - 1) { setI(i + 1); setPick(null); } else finish(); };
  const finish = () => {
    const passed = score >= Math.ceil(quiz.length * 0.7);
    if (passed && !awarded.current) {
      awarded.current = true;
      if (!progress.stats.provaPassed) { setStat("provaPassed", true); addXp(100, "Diploma! 📜"); }
    }
    setDone(true);
  };

  if (done) {
    const passed = score >= Math.ceil(quiz.length * 0.7);
    const lvl = levelOf(progress.xp);
    if (passed) {
      return (
        <div className="fade" style={{ textAlign: "center" }}>
          <div style={styles.cert}>
            <ScrollText size={34} style={{ color: "#ffb627" }} />
            <span style={styles.certKicker}>CERTIFICADO</span>
            <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 22, color: "#fff", margin: "4px 0" }}>Neurociência Básica</h2>
            <p style={{ fontSize: 13.5, color: "#cde0f5", margin: "6px 0" }}>Concluído com <b style={{ color: "#4ade80" }}>{score}/{quiz.length}</b> de acerto.</p>
            <p style={{ fontSize: 12, color: "#8fb0d4" }}>Nível {lvl} · {titleOf(lvl)} · {new Date().toLocaleDateString("pt-BR")}</p>
            <div style={styles.certSeal}>🧠</div>
          </div>
          <p style={{ color: "#ffb627", fontWeight: 700, marginTop: 14 }}>📜 Conquista: Diplomado!</p>
          <button onClick={() => { setI(0); setPick(null); setScore(0); setDone(false); }} style={{ ...styles.ctrlBtn, marginTop: 8, width: "100%" }}><RotateCcw size={15} /> Refazer</button>
        </div>
      );
    }
    return (
      <div className="fade" style={{ textAlign: "center", padding: "16px 0" }}>
        <GraduationCap size={44} style={{ color: "#fb923c", margin: "0 auto 10px" }} />
        <h2 style={styles.h2}>Quase lá!</h2>
        <p style={{ ...styles.p, fontSize: 17 }}>Você fez <b>{score}/{quiz.length}</b>. Precisa de {Math.ceil(quiz.length * 0.7)} pra passar.</p>
        <p style={styles.pMuted}>Dica: revise a Trilha e os Flashcards e tente de novo.</p>
        <button onClick={() => { setI(0); setPick(null); setScore(0); setDone(false); }} style={{ ...styles.ctrlBtn, ...styles.playBtn, marginTop: 12, width: "100%" }}><RotateCcw size={15} /> Tentar de novo</button>
      </div>
    );
  }

  return (
    <div className="fade">
      <div style={styles.cardTop}><span style={styles.label}>🎓 Prova · {i + 1}/{quiz.length}</span><span style={styles.label}>✓ {score}</span></div>
      <div style={styles.progress}>{quiz.map((_, idx) => <span key={idx} style={{ height: 5, borderRadius: 99, background: idx < i ? "#ffce6b" : idx === i ? "#a78bfa" : "#2c3e60", flex: 1 }} />)}</div>
      <p style={{ ...styles.lessonPara, fontWeight: 600, color: "#e6eefc", fontSize: 16 }}>{q.q}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {q.options.map((opt, idx) => {
          let bg = "#10192c", bc = "#2c3e60", cl = "#dce8fb";
          if (pick !== null) {
            if (idx === q.correct) { bg = "#4ade8018"; bc = "#4ade80"; cl = "#9be8b4"; }
            else if (idx === pick) { bg = "#f8717118"; bc = "#f87171"; cl = "#f8b4b4"; }
          }
          return <button key={idx} onClick={() => answer(idx)} disabled={pick !== null} style={{ ...styles.quizOpt, background: bg, borderColor: bc, color: cl }}>{opt}</button>;
        })}
      </div>
      {pick !== null && (
        <div className="fade">
          <p style={{ ...styles.pMuted, marginTop: 12 }}>{q.why}</p>
          <button onClick={next} style={{ ...styles.ctrlBtn, ...styles.playBtn, width: "100%", marginTop: 8 }}>{i < quiz.length - 1 ? "Próxima" : "Finalizar"} <ChevronRight size={17} /></button>
        </div>
      )}
    </div>
  );
}

// =========================================================================
//  MAPA DE CONEXÕES (teia bipartite)
// =========================================================================

function GraphView() {
  const [sel, setSel] = useState(null); // {type:'r'|'n', id}
  const regs = Object.keys(REGIONS);
  const neus = Object.keys(NEUROS);
  const W = 470;
  const rowH = 30, top = 24;
  const H = Math.max(regs.length, neus.length) * rowH + top + 16;
  const lx = 120, rx = 350;
  const ry = (i) => top + i * rowH;
  const ny = (i) => top + i * rowH + (regs.length - neus.length) * rowH / 2;

  const edges = [];
  regs.forEach((rid, ri) => REGIONS[rid].neuros.forEach((nid) => edges.push({ rid, nid, ri, ni: neus.indexOf(nid) })));

  const isActive = (e) => {
    if (!sel) return false;
    return (sel.type === "r" && sel.id === e.rid) || (sel.type === "n" && sel.id === e.nid);
  };
  const dim = (type, id) => sel && !((sel.type === type && sel.id === id) || edges.some((e) => isActive(e) && ((type === "r" && e.rid === id) || (type === "n" && e.nid === id))));

  return (
    <div className="fade">
      <p style={styles.p}>A <b style={{ color: "#ffce6b" }}>teia</b> de quem usa o quê. Toque numa região ou num químico pra acender todas as ligações dele.</p>
      <div style={styles.brainWrap}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
          {edges.map((e, k) => {
            const y1 = ry(e.ri), y2 = ny(e.ni); const on = isActive(e);
            return <path key={k} d={`M${lx + 6} ${y1} C ${(lx + rx) / 2} ${y1}, ${(lx + rx) / 2} ${y2}, ${rx - 6} ${y2}`}
              fill="none" stroke={on ? NEUROS[e.nid].color : "#303038"} strokeWidth={on ? 2.2 : 1} opacity={on ? 0.95 : sel ? 0.12 : 0.4} />;
          })}
          {regs.map((rid, i) => {
            const d = dim("r", rid); const active = sel && sel.type === "r" && sel.id === rid;
            return (
              <g key={rid} onClick={() => setSel(active ? null : { type: "r", id: rid })} style={{ cursor: "pointer" }}>
                <rect x={lx - 112} y={ry(i) - 11} width={118} height={22} rx={7} fill={active ? "#ffce6b" : "#181820"} stroke={active ? "#e0f2fe" : "#35353d"} strokeWidth={1} opacity={d ? 0.3 : 1} />
                <text x={lx - 53} y={ry(i) + 4} textAnchor="middle" fontSize="9.5" fontWeight={active ? 700 : 500} fill={active ? "#06243a" : "#aebdd8"} style={{ fontFamily: "Sora, sans-serif", pointerEvents: "none" }} opacity={d ? 0.4 : 1}>{REGIONS[rid].name}</text>
              </g>
            );
          })}
          {neus.map((nid, i) => {
            const d = dim("n", nid); const active = sel && sel.type === "n" && sel.id === nid; const c = NEUROS[nid].color;
            return (
              <g key={nid} onClick={() => setSel(active ? null : { type: "n", id: nid })} style={{ cursor: "pointer" }}>
                <rect x={rx - 6} y={ny(i) - 11} width={112} height={22} rx={7} fill={active ? c : c + "1e"} stroke={c + (active ? "" : "55")} strokeWidth={1} opacity={d ? 0.3 : 1} />
                <text x={rx + 50} y={ny(i) + 4} textAnchor="middle" fontSize="9.5" fontWeight={active ? 700 : 600} fill={active ? "#0a0e1a" : c} style={{ fontFamily: "Sora, sans-serif", pointerEvents: "none" }} opacity={d ? 0.4 : 1}>{NEUROS[nid].name}</text>
              </g>
            );
          })}
        </svg>
      </div>
      {sel ? (
        sel.type === "r" ? (
          <div className="fade" style={styles.graphDetail}>
            <span style={styles.tagPill}>{REGIONS[sel.id].tag}</span>
            <h3 style={styles.graphTitle}>{REGIONS[sel.id].name}</h3>
            <p style={{ ...styles.p, margin: "4px 0 0" }}>{REGIONS[sel.id].fn}</p>
            <p style={styles.label}>Químicos que usa e como agem aqui:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {REGIONS[sel.id].neuros.map((nid) => {
                const nn = NEUROS[nid];
                return (
                  <div key={nid} style={{ ...styles.graphChemRow, borderColor: nn.color + "44", background: nn.color + "10" }}>
                    <span style={{ ...styles.chip, borderColor: nn.color, color: nn.color, background: nn.color + "1f", padding: "4px 10px", flexShrink: 0 }}>
                      <i style={{ width: 8, height: 8, borderRadius: 99, background: nn.color, display: "inline-block" }} /> {nn.name}
                    </span>
                    <span style={{ fontSize: 12.5, color: "#c2d0e8", lineHeight: 1.4 }}>{nn.desc.split(".")[0]}.</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="fade" style={styles.graphDetail}>
            <span style={{ ...styles.tagPill, background: NEUROS[sel.id].color + "22", color: NEUROS[sel.id].color, borderColor: NEUROS[sel.id].color + "55" }}>{NEUROS[sel.id].type}</span>
            <h3 style={{ ...styles.graphTitle, color: NEUROS[sel.id].color }}>{NEUROS[sel.id].name}</h3>
            <p style={{ ...styles.p, margin: "4px 0 0" }}>{NEUROS[sel.id].desc}</p>
            <p style={styles.label}>Regiões onde ele age:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {regs.filter((r) => REGIONS[r].neuros.includes(sel.id)).map((rid) => (
                <div key={rid} style={styles.graphChemRow}>
                  <span style={{ ...styles.regChip, flexShrink: 0 }}>{REGIONS[rid].name}</span>
                  <span style={{ fontSize: 12.5, color: "#c2d0e8", lineHeight: 1.4 }}>{REGIONS[rid].role} — {REGIONS[rid].tag}</span>
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        <p style={{ ...styles.pMuted, textAlign: "center", marginTop: 10 }}>👆 Toque numa caixa pra ver a descrição</p>
      )}
    </div>
  );
}

// =========================================================================
//  LABORATÓRIO: ACELERADOR x FREIO
// =========================================================================

const EQ_PAIRS = [
  { id: "af", title: "Acelerador × Freio", l: "gaba", r: "glutamato", hintL: "mais freio", hintR: "mais acelerador",
    intro: "O equilíbrio mais básico: o glutamato (acelerador) e o GABA (freio) controlam a excitação de todo o cérebro.",
    states: [
      { t: "Sedado / sonolento", d: "Freio (GABA) dominando demais. É o efeito de calmantes fortes e do álcool: lentidão, fala arrastada e sono.", c: "#38bdf8", bad: 1 },
      { t: "Calmo e relaxado", d: "Bom predomínio do freio. Mente tranquila, corpo relaxado — ótimo pra dormir ou meditar.", c: "#4ade80" },
      { t: "Equilíbrio e foco", d: "Acelerador e freio em harmonia. Estado ideal pra pensar, aprender e produzir com clareza.", c: "#ffce6b" },
      { t: "Agitado / ansioso", d: "Glutamato demais. Mente acelerada, difícil relaxar — começa a parecer ansiedade.", c: "#fb923c" },
      { t: "Sobrecarga", d: "Excitação extrema. O excesso de glutamato pode causar pânico e, em casos clínicos, convulsões (excitotoxicidade).", c: "#ef4444", bad: 1 },
    ] },
  { id: "ds", title: "Busca × Contentamento", l: "serotonina", r: "dopamina", hintL: "mais contentamento", hintR: "mais busca",
    intro: "A dança entre a dopamina (busca, desejo, 'quero mais') e a serotonina (contentamento, saciedade, 'estou bem assim').",
    states: [
      { t: "Apatia / sem impulso", d: "Dopamina muito baixa: falta motivação e iniciativa, mesmo sem tristeza. Tudo vira 'tanto faz'.", c: "#4ade80", bad: 1 },
      { t: "Tranquilo e satisfeito", d: "Boa serotonina: contentamento, humor estável e paz com o que se tem.", c: "#4ade80" },
      { t: "Motivado e satisfeito", d: "Equilíbrio ideal: vontade de agir somada à capacidade de se contentar. Foco saudável.", c: "#ffce6b" },
      { t: "Ansioso por mais", d: "Dopamina puxando forte: busca constante, difícil se satisfazer com o que já tem.", c: "#fb923c" },
      { t: "Compulsão / vício", d: "Dopamina dominando e serotonina baixa: impulsividade e busca sem fim (redes, jogo, açúcar). Nunca é suficiente.", c: "#ef4444", bad: 1 },
    ] },
  { id: "ec", title: "Estresse × Vínculo", l: "ocitocina", r: "cortisol", hintL: "mais vínculo", hintR: "mais estresse",
    intro: "O cortisol (estresse) contra a ocitocina (vínculo e acolhimento) — que é o antídoto natural do estresse.",
    states: [
      { t: "Seguro e conectado", d: "Ocitocina alta, cortisol baixo: confiança, calma e a sensação de pertencer.", c: "#4ade80" },
      { t: "Relaxado", d: "Tranquilo e acolhido. É quando o corpo se repara e recarrega.", c: "#4ade80" },
      { t: "Alerta saudável", d: "Um pouco de cortisol é ótimo: energia, foco e disposição pra encarar o dia.", c: "#ffce6b" },
      { t: "Estressado", d: "Cortisol alto: tensão muscular, irritação e dificuldade de desligar.", c: "#fb923c" },
      { t: "Burnout / exaustão", d: "Cortisol cronicamente alto: ansiedade, insônia, memória prejudicada e imunidade baixa. Aqui o vínculo (ocitocina) é remédio.", c: "#ef4444", bad: 1 },
    ] },
  { id: "cs", title: "Sono × Vigília (relógio)", l: "melatonina", r: "cortisol", hintL: "noite / sono", hintR: "dia / vigília",
    intro: "O relógio do corpo: melatonina (sono) e cortisol (vigília) se revezam ao longo das 24h.",
    states: [
      { t: "Sono profundo", d: "Melatonina no auge: corpo desligado, reparando e consolidando as memórias do dia.", c: "#a78bfa" },
      { t: "Sonolento", d: "Pegando no sono: o cérebro desacelera e a temperatura cai.", c: "#4ade80" },
      { t: "Transição (amanhecer)", d: "A melatonina cai e o cortisol sobe: o corpo troca de turno, do sono pra vigília.", c: "#ffce6b" },
      { t: "Desperto e ativo", d: "Pico de cortisol da manhã: energia e foco no máximo. O dia ideal pra produzir.", c: "#fb923c" },
      { t: "Insônia / agitação", d: "Cortisol alto na hora errada (estresse, telas, luz azul): a mente acelera, a melatonina não sobe e o sono não vem.", c: "#ef4444", bad: 1 },
    ] },
];

function EquilibrioLab() {
  const [pid, setPid] = useState("af");
  const [v, setV] = useState(50);
  const pair = EQ_PAIRS.find((p) => p.id === pid);
  const L = NEUROS[pair.l], R = NEUROS[pair.r];
  const idx = v < 15 ? 0 : v < 38 ? 1 : v < 62 ? 2 : v < 85 ? 3 : 4;
  const state = pair.states[idx];

  return (
    <div className="fade">
      <h2 style={styles.h2}>Equilíbrio</h2>
      <p style={styles.p}>O cérebro é feito de duplas que se conversam. Escolha uma e arraste pra ver o que acontece — inclusive quando ela desregula.</p>

      <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 6, marginBottom: 12 }}>
        {EQ_PAIRS.map((p) => (
          <button key={p.id} onClick={() => { setPid(p.id); setV(50); }} style={{ ...styles.uxCatBtn, borderColor: pid === p.id ? "#ffce6b" : "rgba(255,255,255,0.12)", color: pid === p.id ? "#ffce6b" : "#9fb2d4", background: pid === p.id ? "rgba(255,206,107,0.12)" : "transparent" }}>{p.title}</button>
        ))}
      </div>

      <p style={{ ...styles.p, marginTop: 0 }}>{pair.intro}</p>

      <div style={styles.balBars}>
        <div style={styles.balRow}><span style={{ color: L.color, width: 84, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{L.name}</span><div style={styles.balTrack}><div style={{ ...styles.balFill, width: `${100 - v}%`, background: L.color }} /></div></div>
        <div style={styles.balRow}><span style={{ color: R.color, width: 84, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{R.name}</span><div style={styles.balTrack}><div style={{ ...styles.balFill, width: `${v}%`, background: R.color }} /></div></div>
      </div>

      <input type="range" min={0} max={100} value={v} onChange={(e) => setV(Number(e.target.value))} style={styles.slider} className="brain-slider" />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#7c7c84", marginTop: 2 }}><span>← {pair.hintL}</span><span>{pair.hintR} →</span></div>

      <div style={{ ...styles.stepBox, borderColor: state.c + "66", background: state.c + "12", marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <b style={{ color: state.c, fontSize: 16, flex: 1 }}>{state.t}</b>
          {state.bad && <span style={{ fontSize: 10.5, fontWeight: 800, color: "#ef4444", border: "1px solid #ef444455", borderRadius: 99, padding: "3px 9px" }}>⚠️ DESBALANCEADO</span>}
        </div>
        <p style={{ ...styles.p, margin: "6px 0 0" }}>{state.d}</p>
      </div>
    </div>
  );
}

// =========================================================================
//  TUTOR DE IA (explique com suas palavras)
// =========================================================================

function AITutor() {
  const { addXp } = useGame();
  const [qi, setQi] = useState(() => Math.floor(Math.random() * TUTOR_QS.length));
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [err, setErr] = useState(false);
  const awarded = useRef(false);
  const q = TUTOR_QS[qi];

  const submit = async () => {
    if (!answer.trim() || loading) return;
    setLoading(true); setErr(false); setFeedback(null);
    try {
      const prompt = `Você é um tutor de neurociência gentil para iniciantes, em português do Brasil. A pergunta foi: "${q}". O aluno respondeu: "${answer}". Dê um feedback curto e encorajador em no máximo 4 frases: comece dizendo o que ele acertou, depois corrija ou complete o que faltou de forma simples e clara, sem jargão pesado. Não invente fatos. Termine com uma frase de incentivo.`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
      if (text) { setFeedback(text); if (!awarded.current) { awarded.current = true; addXp(15, "Explicação!"); } }
      else setErr(true);
    } catch (e) { setErr(true); }
    setLoading(false);
  };

  const novaPergunta = () => {
    let ni = qi; while (ni === qi && TUTOR_QS.length > 1) ni = Math.floor(Math.random() * TUTOR_QS.length);
    setQi(ni); setAnswer(""); setFeedback(null); setErr(false); awarded.current = false;
  };

  return (
    <div className="fade">
      <h2 style={styles.h2}>Explique com suas palavras</h2>
      <p style={styles.p}>Responder com suas próprias palavras fixa muito mais que escolher A, B ou C. Um tutor de IA dá um feedback no que você escrever.</p>
      <div style={styles.tutorQ}><span style={{ fontSize: 12, fontWeight: 700, color: "#ffce6b" }}>❔ PERGUNTA</span><p style={{ ...styles.lessonPara, margin: "6px 0 0", color: "#e6eefc", fontWeight: 600 }}>{q}</p></div>
      <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Escreva sua explicação aqui..." style={styles.textarea} rows={4} />
      <button onClick={submit} disabled={loading || !answer.trim()} style={{ ...styles.ctrlBtn, ...styles.playBtn, width: "100%", marginTop: 10, opacity: loading || !answer.trim() ? 0.6 : 1 }}>
        {loading ? "Avaliando..." : <>Receber feedback <Sparkles size={16} /></>}
      </button>
      {loading && <p style={{ ...styles.pMuted, textAlign: "center", marginTop: 10 }} className="blink-soft">🧠 o tutor está lendo sua resposta...</p>}
      {err && <div style={{ ...styles.whyBox, marginTop: 12, borderColor: "#fb923c55", background: "#fb923c12" }}><p style={{ ...styles.lessonPara, margin: 0 }}>Não consegui falar com o tutor agora. Tente de novo em instantes.</p></div>}
      {feedback && (
        <div className="fade" style={{ ...styles.tutorFb }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#4ade80" }}>✨ FEEDBACK DO TUTOR</span>
          <p style={{ ...styles.lessonPara, margin: "6px 0 0", whiteSpace: "pre-wrap" }}>{feedback}</p>
        </div>
      )}
      <button onClick={novaPergunta} style={{ ...styles.miniBtn, margin: "14px auto 0" }}><Shuffle size={14} /> Outra pergunta</button>
    </div>
  );
}

// =========================================================================
//  TREINO MISTO (interleaving)
// =========================================================================

function buildMixed() {
  const pool = LESSON_ORDER.filter((id) => LESSON_CONCEPT[id]).map((id) => ({ ...LESSONS[id].check, concept: LESSON_CONCEPT[id] }));
  return shuffle(pool).slice(0, 8);
}

function TreinoMisto() {
  const { addXp, recordConcept } = useGame();
  const [quiz, setQuiz] = useState(buildMixed);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = quiz[i];

  const answer = (idx) => {
    if (pick !== null) return;
    setPick(idx);
    const ok = idx === q.correct;
    if (q.concept) recordConcept(q.concept, ok);
    if (ok) { setScore((s) => s + 1); addXp(4); }
  };
  const next = () => { if (i < quiz.length - 1) { setI(i + 1); setPick(null); } else setDone(true); };
  const restart = () => { setQuiz(buildMixed()); setI(0); setPick(null); setScore(0); setDone(false); };

  if (done) {
    return (
      <div className="fade" style={{ textAlign: "center", padding: "16px 0" }}>
        <Layers size={44} style={{ color: "#ffce6b", margin: "0 auto 10px" }} />
        <h2 style={styles.h2}>Treino concluído!</h2>
        <p style={{ ...styles.p, fontSize: 17 }}>Você acertou <b style={{ color: "#4ade80" }}>{score}</b> de <b>{quiz.length}</b>.</p>
        <p style={styles.pMuted}>Misturar temas parece mais difícil, mas é o que mais fixa a longo prazo.</p>
        <button onClick={restart} style={{ ...styles.ctrlBtn, ...styles.playBtn, marginTop: 12, width: "100%" }}><Shuffle size={16} /> Novo treino misto</button>
      </div>
    );
  }

  return (
    <div className="fade">
      <div style={styles.cardTop}><span style={styles.label}>🔀 Treino misto · {i + 1}/{quiz.length}</span><span style={styles.label}>✓ {score}</span></div>
      <div style={styles.progress}>{quiz.map((_, idx) => <span key={idx} style={{ height: 5, borderRadius: 99, background: idx < i ? "#ffce6b" : idx === i ? "#a78bfa" : "#2c3e60", flex: 1 }} />)}</div>
      <p style={{ ...styles.lessonPara, fontWeight: 600, color: "#e6eefc", fontSize: 16 }}>{q.q}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {q.options.map((opt, idx) => {
          let bg = "#10192c", bc = "#2c3e60", cl = "#dce8fb";
          if (pick !== null) {
            if (idx === q.correct) { bg = "#4ade8018"; bc = "#4ade80"; cl = "#9be8b4"; }
            else if (idx === pick) { bg = "#f8717118"; bc = "#f87171"; cl = "#f8b4b4"; }
          }
          return <button key={idx} onClick={() => answer(idx)} disabled={pick !== null} style={{ ...styles.quizOpt, background: bg, borderColor: bc, color: cl }}>{opt}</button>;
        })}
      </div>
      {pick !== null && <div className="fade"><p style={{ ...styles.pMuted, marginTop: 12 }}>{q.why}</p><button onClick={next} style={{ ...styles.ctrlBtn, ...styles.playBtn, width: "100%", marginTop: 8 }}>{i < quiz.length - 1 ? "Próxima" : "Finalizar"} <ChevronRight size={17} /></button></div>}
    </div>
  );
}

// =========================================================================
//  COMPORTAMENTO — dados
// =========================================================================

const BIAS_CATS = {
  tempo: { label: "Agir rápido", color: "#fb7185" },
  info: { label: "Excesso de info", color: "#38bdf8" },
  memoria: { label: "O que lembrar", color: "#34d399" },
  sentido: { label: "Dar sentido", color: "#a78bfa" },
};

const BIASES = [
  // ---- EXCESSO DE INFORMAÇÃO ----
  { id:"confirmacao", name:"Viés de Confirmação", cat:"info", what:"Buscamos e valorizamos o que confirma o que já achamos; ignoramos o que contradiz.", brain:"Recompensa por concordar com a própria crença.", ex:["Feed do Instagram/TikTok que só mostra o que você já curte","Ler só os reviews 5★ e pular os 1★ do produto que você quer","Política: cada lado compartilha só o que confirma sua visão","Pesquisar no Google já esperando uma resposta e clicar só nela"], defesa:"Procure ativamente o argumento contrário antes de decidir.", ethics:"Mostre também o contraditório.", neuro:"dopamina", regiao:"prefrontal", },
  { id:"ancoragem", name:"Ancoragem", cat:"info", what:"O primeiro número apresentado vira referência e distorce todo o resto.", brain:"Córtex pré-frontal ajusta a partir da âncora.", ex:["'De R$199 por R$99' — o 199 ancora o valor","Cardápio com prato de R$120 que faz o de R$60 parecer barato","Salário: quem fala o número primeiro ancora a negociação","'Doação sugerida: R$50, R$100, R$200' (o maior puxa pra cima)"], defesa:"Defina seu próprio valor antes de ver o preço deles.", ethics:"Âncora real, sem preço fantasma.", regiao:"prefrontal", },
  { id:"framing", name:"Enquadramento (Framing)", cat:"info", what:"A forma de apresentar muda a decisão, mesmo sendo o mesmo fato.", brain:"Sistema 1 reage à moldura emocional.", ex:["Iogurte '90% sem gordura' vs '10% de gordura'","'Garantia de 30 dias' soa melhor que 'devolução em 30 dias'","'Economize R$50' vs 'não pague R$50 a mais'","Cirurgia com '90% de sobrevivência' vs '10% de morte'"], defesa:"Reformule a frase pro lado oposto e veja se muda sua escolha.", ethics:"Enquadre sem distorcer.", neuro:"noradrenalina", regiao:"amigdala", },
  { id:"negatividade", name:"Viés de Negatividade", cat:"info", what:"Damos muito mais peso ao negativo do que ao positivo equivalente.", brain:"Amígdala prioriza ameaças por sobrevivência.", ex:["Uma crítica ruim te marca mais que dez elogios","Manchetes de tragédia rendem mais cliques","'O que você está perdendo ao não assinar'","Lembrar do único comentário negativo numa apresentação ótima"], defesa:"Pese os fatos pela frequência, não pela intensidade.", ethics:"Informe sem fabricar medo.", neuro:"cortisol", regiao:"amigdala", },
  { id:"mera_exposicao", name:"Mera Exposição", cat:"info", what:"Quanto mais vemos algo, mais passamos a gostar dele.", brain:"Familiaridade reduz o esforço de processar (fluência).", ex:["Música que você odiava e começou a curtir de tanto tocar","Logos onipresentes (Coca, Nike) que viram sinônimo de confiança","Anúncio repetido até a marca parecer 'famosa'","Aquele colega que ficou mais simpático só com a convivência"], defesa:"Familiar não é o mesmo que bom — avalie o mérito.", ethics:"Repetição honesta, não saturação.", neuro:"dopamina", regiao:"hipocampo", },
  { id:"frequencia", name:"Ilusão de Frequência", cat:"info", what:"Depois de notar algo, você passa a vê-lo em todo lugar (Baader-Meinhof).", brain:"Atenção seletiva + viés de confirmação.", ex:["Pesquisou um tênis e ele te 'persegue' em todo site (retargeting)","Decidiu um nome de bebê e parece que todo mundo usa","Comprou um carro e agora vê o mesmo modelo em toda esquina","Aprendeu uma palavra nova e ela 'aparece' o tempo todo"], defesa:"Você não está vendo mais — está reparando mais.", ethics:"Frequência com limite e relevância.", neuro:"noradrenalina", regiao:"talamo", },
  { id:"saliencia", name:"Viés de Saliência", cat:"info", what:"O que chama mais atenção parece mais importante do que é.", brain:"Sistema 1 reage ao que é vívido e contrastante.", ex:["Botão de compra colorido enquanto o resto é cinza","Medo de avião (raro e vívido) vs carro (comum e perigoso)","Selo 'NOVO' ou 'OFERTA' que rouba o olhar","Promoção em letra garrafal e as condições em letra miúda"], defesa:"Pergunte: isso é importante ou só chamativo?", ethics:"Destaque o que importa pro usuário.", neuro:"noradrenalina", regiao:"talamo", },
  { id:"contraste", name:"Efeito de Contraste", cat:"info", what:"Avaliamos algo pela comparação com o que está ao lado, não em si.", brain:"Percepção é relativa, não absoluta.", ex:["Plano 'isca' caro que faz o do meio parecer ótimo","Vendedor mostra o item caro primeiro pra o segundo parecer barato","Casa feia visitada antes faz a próxima parecer maravilhosa","'Antes e depois' exagerado em propaganda"], defesa:"Avalie a opção isolada, sem a vizinha ao lado.", ethics:"Comparações justas.", regiao:"occipital", },
  { id:"ambiguidade", name:"Aversão à Ambiguidade", cat:"info", what:"Preferimos o risco conhecido ao incerto, mesmo quando o incerto é melhor.", brain:"Incerteza ativa desconforto (ínsula/amígdala).", ex:["Ficar na marca conhecida em vez de testar a nova mais barata","Selos de 'garantia' e 'sem surpresas' que acalmam a compra","Preferir o emprego ruim conhecido ao novo incerto","FAQ detalhado que reduz o 'e se...' antes de comprar"], defesa:"Incerteza não é o mesmo que risco — avalie os dois.", ethics:"Reduza incerteza com clareza real.", neuro:"cortisol", regiao:"insula", },
  { id:"funcional", name:"Fixação Funcional", cat:"info", what:"Só enxergamos o uso 'óbvio' de algo, travando soluções novas.", brain:"Padrões aprendidos limitam o Sistema 2.", ex:["Não pensar em usar o celular como lanterna ou nível","Bombril que virou produto de limpeza, beleza e arte","Empresas que reposicionam um produto pra um novo público","Usar um clipe de papel pra mil coisas além de prender papel"], defesa:"Pergunte 'pra que mais isso serviria?'.", ethics:"Abra possibilidades, não force.", regiao:"prefrontal", },

  // ---- DAR SENTIDO ----
  { id:"halo", name:"Efeito Halo", cat:"sentido", what:"Uma qualidade boa (como beleza) contamina o julgamento de tudo o mais.", brain:"Amígdala + julgamento veloz do Sistema 1.", ex:["App bonito que parece mais confiável e fácil, mesmo sem testar","Pessoa atraente é vista como mais inteligente e gentil","Embalagem premium faz o produto 'parecer' melhor","Celebridade simpática garante credibilidade ao que anuncia"], defesa:"Separe a embalagem do conteúdo antes de julgar.", ethics:"Capriche no visual, mas entregue substância.", neuro:"dopamina", regiao:"amigdala", },
  { id:"horn", name:"Efeito Chifre (Horn)", cat:"sentido", what:"O oposto do halo: um traço ruim contamina toda a avaliação.", brain:"Generalização negativa rápida.", ex:["Um erro de português no site derruba a confiança na empresa","Atendimento ríspido faz você achar o produto todo ruim","Foto de perfil descuidada e o currículo nem é lido","Um bug logo no início e o app inteiro 'parece' quebrado"], defesa:"Não deixe um detalhe ruim condenar o todo.", ethics:"Cuide dos detalhes que pesam.", neuro:"cortisol", regiao:"amigdala", },
  { id:"prova", name:"Prova Social", cat:"sentido", what:"Na dúvida, copiamos o que os outros estão fazendo.", brain:"Recompensa de pertencer ao grupo + FOMO.", ex:["'12 mil pessoas já compraram', avaliações 5★","Restaurante cheio parece melhor que o vazio ao lado","'37 pessoas vendo este hotel agora'","Risada gravada em programa de humor pra você rir junto"], defesa:"A maioria pode estar errada — decida pelo seu caso.", ethics:"Use números reais.", neuro:"ocitocina", regiao:"accumbens", },
  { id:"manada", name:"Efeito Manada", cat:"sentido", what:"Tendemos a seguir a multidão mesmo contra o próprio julgamento.", brain:"Conformidade social reduz conflito.", ex:["Comprar cripto/ação só porque 'todo mundo' está comprando","Filas que crescem porque já tem gente na fila","Tendências virais de TikTok que todos repetem","Aplaudir porque a plateia aplaudiu"], defesa:"Pergunte se você faria isso sozinho.", ethics:"Não force consenso artificial.", neuro:"ocitocina", regiao:"amigdala", },
  { id:"estereotipo", name:"Estereótipo", cat:"sentido", what:"Atribuímos características a alguém só pelo grupo a que pertence.", brain:"Categorização automática pra economizar esforço.", ex:["Achar que 'jovem não entende de finanças'","Personas de marketing que viram caricatura","Julgar competência pela aparência ou sotaque","Supor o gosto de alguém só pela idade"], defesa:"Trate a pessoa, não o rótulo.", ethics:"Segmente sem reduzir pessoas a rótulos.", regiao:"hipocampo", },
  { id:"controle", name:"Ilusão de Controle", cat:"sentido", what:"Achamos que controlamos resultados que são, em boa parte, sorte.", brain:"Conforto de prever e dominar o ambiente.", ex:["Soprar o dado ou apertar mais o botão do elevador","Escolher os próprios números na loteria e sentir mais chance","'Monte do seu jeito' que dá sensação de domínio","Day trader achando que controla o mercado"], defesa:"Separe o que depende de você do que é acaso.", ethics:"Dê controle real, não a sensação dele.", neuro:"dopamina", regiao:"prefrontal", },
  { id:"retrospectiva", name:"Viés Retrospectivo", cat:"sentido", what:"Depois que sabemos o resultado, achamos que 'já era óbvio' (hindsight).", brain:"Memória se reescreve pra fazer sentido.", ex:["'Eu sabia que esse time/ ação ia ganhar'","Analistas explicando a crise como se fosse previsível","Cases de sucesso que parecem inevitáveis em retrospecto","'Tava na cara que ia dar errado' depois do término"], defesa:"Anote suas previsões antes — e confira depois.", ethics:"Não venda obviedade do que era incerto.", regiao:"hipocampo", },
  { id:"dunning", name:"Dunning-Kruger", cat:"sentido", what:"Quem sabe pouco superestima o quanto sabe; o expert subestima.", brain:"Falta metacognição pra avaliar a própria falha.", ex:["Iniciante super confiante depois de um tutorial","O expert que sempre acha que 'sabe pouco'","Achar que entende de saúde por ler na internet","Opinar com certeza sobre um tema que mal conhece"], defesa:"Quanto mais você aprende, mais vê o que não sabe.", ethics:"Ensine sem humilhar.", regiao:"prefrontal", },
  { id:"sobrevivencia", name:"Viés de Sobrevivência", cat:"sentido", what:"Olhamos só pros casos que 'deram certo' e ignoramos os que sumiram.", brain:"Vemos o presente, não o que falhou e desapareceu.", ex:["'Fulano largou a faculdade e ficou rico' (e os milhões que não?)","Receita de sucesso de 1 startup (e as 99 que quebraram?)","'Meu avô fumava e viveu 90 anos'","Reforçar avião só onde os que voltaram foram atingidos"], defesa:"Pergunte: onde estão os que não apareceram?", ethics:"Mostre o quadro completo.", regiao:"prefrontal", },
  { id:"narrativa", name:"Falácia da Narrativa", cat:"sentido", what:"Preferimos uma história coerente à verdade bagunçada e aleatória.", brain:"O cérebro é máquina de criar enredos de causa-efeito.", ex:["Storytelling de marca conectando pontos que eram acaso","Explicar a alta da bolsa com uma 'razão' inventada","Biografias que fazem o sucesso parecer um plano","Ver 'sinais' e 'destino' em coincidências"], defesa:"Nem todo evento tem causa simples — às vezes é sorte.", ethics:"Conte histórias verdadeiras.", neuro:"dopamina", regiao:"hipocampo", },
  { id:"atribuicao", name:"Erro de Atribuição", cat:"sentido", what:"Culpamos o caráter dos outros, mas o contexto nas nossas falhas.", brain:"Atalho social do Sistema 1.", ex:["'Ele é grosso' (e não 'teve um dia ruim')","Eu me atrasei pelo trânsito; o outro 'é irresponsável'","Suporte que assume má fé do cliente","Avaliar funcionário pela personalidade, não pela situação"], defesa:"Pergunte: e se fosse o contexto, não a pessoa?", ethics:"Trate o usuário com benefício da dúvida.", regiao:"prefrontal", },
  { id:"falso_consenso", name:"Falso Consenso", cat:"sentido", what:"Achamos que a maioria pensa como a gente.", brain:"Projeção do próprio ponto de vista.", ex:["'Todo mundo acha esse recurso óbvio' (a sua bolha acha)","Fundador que projeta no produto só o próprio gosto","'Ninguém usa isso' baseado só no seu círculo","Supor que sua opinião política é a da maioria"], defesa:"Teste com gente fora da sua bolha.", ethics:"Valide com dados, não com achismo.", regiao:"prefrontal", },
  { id:"autosservico", name:"Viés de Autosserviço", cat:"sentido", what:"Sucesso é mérito meu; fracasso é culpa de fora.", brain:"Protege a autoestima.", ex:["Vendi bem? talento. Vendi mal? a economia.","Nota boa é mérito; nota ruim é 'a prova foi injusta'","Time ganha 'por nós', perde 'pelo juiz'","Empresa: o lucro é estratégia; o prejuízo é o mercado"], defesa:"Aplique o mesmo critério pro sucesso e pro fracasso.", ethics:"Elogie sem manipular o ego.", neuro:"dopamina", regiao:"accumbens", },
  { id:"ponto_cego", name:"Ponto Cego de Viés", cat:"sentido", what:"Enxergamos vieses nos outros, mas não em nós mesmos.", brain:"Falta de acesso aos próprios processos automáticos.", ex:["'Eu sou racional, os outros é que se deixam levar'","Achar que propaganda 'não funciona comigo'","Criticar a bolha alheia sem ver a própria","Decidir 'sem viés' e não perceber o seu"], defesa:"Assuma que você também cai — e cheque.", ethics:"Desconfie das próprias certezas.", regiao:"prefrontal", },
  { id:"ikea", name:"Efeito IKEA", cat:"sentido", what:"Valorizamos mais o que ajudamos a construir.", brain:"Esforço investido vira valor percebido (e posse).", ex:["Móvel que você montou e tem orgulho mesmo torto","Onboarding em que você personaliza o app e se apega","Bolo de mistura em que você 'só' adiciona o ovo","Apresentação que você ajudou a fazer parece a melhor"], defesa:"Seu esforço não torna a escolha necessariamente boa.", ethics:"Esforço que gera valor real, não trabalho à toa.", neuro:"dopamina", regiao:"accumbens", },
  { id:"just_world", name:"Mundo Justo", cat:"sentido", what:"Acreditamos que cada um recebe o que merece.", brain:"Conforto de viver num mundo previsível e justo.", ex:["'Se é pobre, é porque não se esforça'","Culpar a vítima ('ela se vestiu assim')","'Deu certo porque mereceu' ignorando a sorte","Achar que doença é 'castigo'"], defesa:"Nem tudo é mérito ou culpa — existe acaso e contexto.", ethics:"Não responsabilize a vítima.", regiao:"prefrontal", },
  { id:"dissonancia", name:"Dissonância Cognitiva", cat:"sentido", what:"Agir contra a própria crença gera desconforto, e o cérebro racionaliza pra aliviar.", brain:"Córtex cíngulo anterior + ínsula.", ex:["Gastou caro e se convence de que 'valeu muito'","Fumante que minimiza os riscos do cigarro","Comprou por impulso e cria justificativas depois","Defender uma escolha duvidosa pra não admitir o erro"], defesa:"Aceite o desconforto em vez de inventar desculpa.", ethics:"Reforce a boa escolha no pós-compra, com honestidade.", neuro:"cortisol", regiao:"insula", },

  // ---- AGIR RÁPIDO ----
  { id:"perda", name:"Aversão à Perda", cat:"tempo", what:"Perder dói cerca de 2x mais do que ganhar o equivalente alegra.", brain:"Amígdala + ínsula (o desconforto da perda).", ex:["'Não perca essa chance!' em vez de 'aproveite'","Frete grátis que some se você não comprar agora","Teste grátis: depois de usar, cancelar 'dói'","'Você vai perder seus pontos' em programas de fidelidade"], defesa:"Pergunte: eu quero isso, ou só não quero perder?", ethics:"Não fabrique medo de perdas inexistentes.", neuro:"cortisol", regiao:"amigdala", },
  { id:"escassez", name:"Escassez", cat:"tempo", what:"O que é raro ou urgente parece automaticamente mais valioso.", brain:"Dopamina (desejo) + FOMO.", ex:["'Só restam 2!' no site de hotel","Contagem regressiva da oferta","Edição limitada e 'drops' de tênis","'Vagas limitadas' em cursos e webinars"], defesa:"Escassez real ou cronômetro que reinicia? Confira.", ethics:"Escassez real — cronômetro falso quebra a confiança.", neuro:"dopamina", regiao:"accumbens", },
  { id:"status_quo", name:"Viés de Status Quo", cat:"tempo", what:"Preferimos que tudo continue como está; mudar dá trabalho.", brain:"Mudança = esforço + risco percebido.", ex:["Continuar no plano caro por preguiça de trocar","Renovação automática que ninguém cancela","Manter o banco ruim de sempre","Não mudar de operadora mesmo com oferta melhor"], defesa:"Reavalie de tempos em tempos como se fosse a 1ª vez.", ethics:"Facilite sair tanto quanto entrar.", regiao:"ganglios", },
  { id:"default", name:"Opção Padrão", cat:"tempo", what:"A opção já marcada tende a ser aceita sem questionar.", brain:"Economia de esforço — puro Sistema 1.", ex:["Plano 'recomendado' pré-selecionado","Opt-in de newsletter já marcado","Doação de órgãos: países com 'sim' por padrão têm muito mais","Gorjeta sugerida de 20% já selecionada na maquininha"], defesa:"Confira sempre o que já veio marcado.", ethics:"Que o padrão beneficie o usuário.", regiao:"ganglios", },
  { id:"posse", name:"Efeito de Posse", cat:"tempo", what:"Damos mais valor a algo só por já ser nosso (endowment).", brain:"Aversão à perda aplicada ao que possuímos.", ex:["Teste grátis de 30 dias: soltar depois custa","'Experimente em casa' (depois de usar, devolver dói)","Vender algo seu por mais do que pagaria nele","Apego ao plano atual só por já tê-lo"], defesa:"Pergunte: eu compraria isso de novo hoje?", ethics:"Não prenda pela dor de devolver.", neuro:"ocitocina", regiao:"insula", },
  { id:"sunk", name:"Custo Afundado", cat:"tempo", what:"Insistimos numa escolha ruim por já termos investido nela.", brain:"Aversão a admitir perda + coerência.", ex:["Terminar um filme ruim 'porque já comecei'","Manter relacionamento/curso por 'todo o tempo investido'","Jogar mais dinheiro num projeto que não anda","Não largar a assinatura cara 'porque já paguei o ano'"], defesa:"O que já foi gasto não volta — decida pelo futuro.", ethics:"Não explore o medo de 'jogar fora'.", neuro:"cortisol", regiao:"insula", },
  { id:"otimismo", name:"Viés de Otimismo", cat:"tempo", what:"Achamos que coisas ruins acontecem mais com os outros do que conosco.", brain:"Protege a motivação e o bem-estar.", ex:["'Comigo não vai dar atraso/dívida'","Subestimar prazo de projeto (falácia do planejamento)","Não fazer seguro 'porque comigo não acontece'","Achar que vai usar muito a academia que assinou"], defesa:"Some uma margem de segurança às suas previsões.", ethics:"Otimismo realista, sem promessa falsa.", neuro:"dopamina", regiao:"prefrontal", },
  { id:"acao", name:"Viés de Ação", cat:"tempo", what:"Sentimos que fazer algo é melhor que esperar, mesmo quando não é.", brain:"Agir alivia a ansiedade da inércia.", ex:["Goleiro pula pro canto quando ficar parado defenderia mais","Trocar de fila no mercado achando que anda mais","Vender na baixa por pânico em vez de esperar","CTA 'aja agora!' que empurra decisão precipitada"], defesa:"Às vezes não fazer nada é a melhor jogada.", ethics:"Incentive ação útil, não impulsiva.", neuro:"adrenalina", regiao:"ganglios", },
  { id:"desconto", name:"Imediatismo", cat:"tempo", what:"Valorizamos demais a recompensa de agora e desprezamos a futura.", brain:"Núcleo accumbens prefere recompensa imediata.", ex:["'Compre agora, pague depois' / parcelamento sem juros","Furar a dieta hoje e 'começar segunda'","Gastar a poupança por um prazer imediato","Streaming que solta 'só mais um episódio'"], defesa:"Pense no seu 'eu' de daqui a um ano.", ethics:"Não empurre dívida disfarçada de facilidade.", neuro:"dopamina", regiao:"accumbens", },
  { id:"meta", name:"Gradiente de Meta", cat:"tempo", what:"Quanto mais perto do objetivo, mais motivação pra completá-lo.", brain:"Dopamina cresce com a proximidade da recompensa.", ex:["Cartão fidelidade que já vem com 2 selos 'de brinde'","Barra 'perfil 80% completo, falta pouco!'","'Falta 1 para o próximo nível' em apps e jogos","Frete grátis 'a partir de R$99' (você completa o carrinho)"], defesa:"A meta é deles ou sua? Não complete por completar.", ethics:"Ótimo pra engajar, não pra prender.", neuro:"dopamina", regiao:"accumbens", },
  { id:"fomo", name:"FOMO", cat:"tempo", what:"Medo de ficar de fora do que os outros estão aproveitando.", brain:"Dor social + dopamina do desejo.", ex:["'Última chance', drops e lives que somem","Stories que mostram todo mundo num evento","'Seus amigos já estão no app'","Pré-venda 'exclusiva' por tempo limitado"], defesa:"Vai mudar sua vida perder isso? Quase nunca.", ethics:"Não invente urgência social falsa.", neuro:"cortisol", regiao:"amigdala", },
  { id:"escolha", name:"Paradoxo da Escolha", cat:"tempo", what:"Opções demais paralisam e diminuem a satisfação com a decisão.", brain:"Sobrecarga do Sistema 2.", ex:["30 planos de celular e você não escolhe nenhum","Menu gigante que trava o pedido","Netflix por 20 min sem decidir o que assistir","Loja com curadoria vende mais que a com 'tudo'"], defesa:"Reduza a poucas opções e decida.", ethics:"Simplifique de verdade, não esconda opções.", neuro:"cortisol", regiao:"prefrontal", },
  { id:"compromisso", name:"Escalada de Compromisso", cat:"tempo", what:"Depois de um 'sim' pequeno, mantemos coerência com 'sins' maiores.", brain:"Identidade + desconforto de se contradizer.", ex:["Cadastro grátis → upsell ('pé na porta')","Questionário curto que termina em proposta de compra","Adesivo na porta hoje, doação amanhã","Free trial que vira assinatura quase automática"], defesa:"Cada 'sim' é novo — você pode parar a qualquer hora.", ethics:"Não prenda ninguém pela própria palavra.", regiao:"prefrontal", },

  // ---- O QUE LEMBRAR ----
  { id:"priming", name:"Priming", cat:"memoria", what:"Um estímulo anterior influencia, sem você perceber, a resposta seguinte.", brain:"Hipocampo + redes associativas.", ex:["Música francesa na loja faz vender mais vinho francês","Palavras como 'caro/premium' antes de mostrar o preço","Cores quentes que abrem o apetite em fast-food","Foto de pôr do sol antes da oferta de viagem"], defesa:"Repare no clima montado antes da decisão.", ethics:"Prepare emoções verdadeiras.", neuro:"acetilcolina", regiao:"hipocampo", },
  { id:"disponibilidade", name:"Heurística da Disponibilidade", cat:"memoria", what:"Julgamos o provável pelo que lembramos com mais facilidade.", brain:"Memória recente/vívida domina o julgamento.", ex:["Achar avião mais perigoso que carro por causa do noticiário","Superestimar crimes após ver muito na TV","Depoimento marcante que pesa mais que a estatística","Comprar seguro logo após ouvir uma história de roubo"], defesa:"Busque a frequência real, não o caso que lembrou.", ethics:"Não distorça probabilidades com casos raros.", regiao:"hipocampo", },
  { id:"recencia", name:"Efeito de Recência", cat:"memoria", what:"Lembramos melhor do que veio por último.", brain:"Memória de curto prazo retém o final.", ex:["Numa lista, você lembra dos últimos itens","O último candidato da entrevista fica mais fresco","Encerrar a apresentação com o ponto mais forte","Última experiência ruim apaga meses de serviço bom"], defesa:"Reveja o todo, não só o final.", ethics:"Final honesto, não manipulação de última hora.", regiao:"hipocampo", },
  { id:"primazia", name:"Efeito de Primazia", cat:"memoria", what:"Lembramos bem do que veio primeiro; a 1ª impressão pesa.", brain:"O início é codificado com mais profundidade.", ex:["A primeira tela/headline decide se você continua","Primeira impressão numa entrevista que gruda","O primeiro preço visto vira referência","Abrir a reunião com a notícia mais importante"], defesa:"Dê uma chance ao que veio depois também.", ethics:"Comece com verdade, não com isca.", regiao:"hipocampo", },
  { id:"pico_fim", name:"Regra do Pico-Fim", cat:"memoria", what:"Lembramos de uma experiência pelo momento mais intenso e pelo fim.", brain:"Memória resume, não grava tudo.", ex:["Unboxing caprichado vira a lembrança do produto","Fila chata mas com final rápido é lembrada como ok","Viagem marcada por 1 momento incrível e a despedida","Consulta médica: o final gentil define a avaliação"], defesa:"Avalie a experiência inteira, não só os picos.", ethics:"Crie picos reais de valor.", regiao:"hipocampo", },
  { id:"zeigarnik", name:"Efeito Zeigarnik", cat:"memoria", what:"Lembramos mais de tarefas inacabadas do que das concluídas.", brain:"Tensão cognitiva do que ficou em aberto.", ex:["'Perfil 70% completo' que te incomoda até terminar","Cliffhanger de série que te prende","Notificação de carrinho abandonado","'Continue de onde parou' em apps de curso"], defesa:"Loop aberto não é obrigação — feche no seu tempo.", ethics:"Use loops abertos sem ansiedade tóxica.", neuro:"dopamina", regiao:"prefrontal", },
  { id:"representatividade", name:"Representatividade", cat:"memoria", what:"Julgamos pela semelhança a um estereótipo, ignorando a estatística.", brain:"Atalho de 'parece com, então é'.", ex:["Site com cara 'premium' parece mais confiável","Achar que quem lê muito é bibliotecário, não vendedor","Embalagem 'saudável' (verde, folhas) que nem é","Julgar um candidato pelo 'tipo' e não pelo currículo"], defesa:"Parecer não é ser — cheque os fatos.", ethics:"Não simule qualidade que não existe.", regiao:"hipocampo", },
  { id:"afeto", name:"Heurística do Afeto", cat:"memoria", what:"Decidimos pela emoção que algo desperta, não pela análise.", brain:"Marcadores somáticos (ínsula) guiam a escolha.", ex:["Propaganda emocional vende mais que lista de specs","Doar pra 1 criança com nome e foto, não pra 'milhões'","Comprar o carro pela sensação, não pela ficha técnica","Marca que você 'ama' e nem compara preço"], defesa:"Sinta — depois confira com a razão.", ethics:"Emocione com honestidade.", regiao:"insula", },
  { id:"ilusao_profundidade", name:"Ilusão de Profundidade", cat:"memoria", what:"Achamos que entendemos algo melhor do que de fato entendemos.", brain:"Familiaridade é confundida com compreensão.", ex:["Saber 'como funciona' um zíper... até tentar explicar","Achar que entende de economia por ler manchetes","Resumo simples que dá falsa sensação de domínio","'Eu sei usar' o app, mas não sei explicar por quê"], defesa:"Tente explicar do zero — vê na hora o que falta.", ethics:"Simplifique sem iludir.", regiao:"prefrontal", },
];

const CIALDINI = [
  { id: "recip", name: "Reciprocidade", emoji: "🎁", grupo: "Cialdini", what: "Quem recebe algo sente que precisa retribuir.", brain: "Gera vínculo social e prazer de retribuir.", neuro: "ocitocina", regiao: "accumbens", ex: ["Amostra grátis no mercado que gera compra", "E-book/conteúdo gratuito antes da oferta", "Brinde ou bala junto com a conta", "Período de teste 'de presente'"], defesa: "Um presente não te obriga a comprar.", ethics: "Dê de verdade, sem cobrança disfarçada." },
  { id: "coer", name: "Compromisso & Coerência", emoji: "🔗", grupo: "Cialdini", what: "Depois de um 'sim' pequeno, mantemos coerência com 'sins' maiores.", brain: "Contradizer-se gera desconforto (dissonância).", neuro: "cortisol", regiao: "insula", ex: ["Cadastro simples → upsell ('pé na porta')", "Quiz que leva a uma compra 'coerente'", "Pequena doação que vira mensal", "'Você disse que queria emagrecer, então...'"], defesa: "Cada novo 'sim' é uma nova escolha.", ethics: "Não prenda ninguém pela própria palavra." },
  { id: "social", name: "Prova Social", emoji: "👥", grupo: "Cialdini", what: "Na dúvida, seguimos a maioria.", brain: "Pertencer ao grupo é recompensa; ficar de fora dói.", neuro: "ocitocina", regiao: "accumbens", ex: ["'Mais vendido' e selos de favorito", "Depoimentos e avaliações 5★", "'+50 mil confiam'", "'37 pessoas vendo agora'"], defesa: "Popular não é o mesmo que certo pra você.", ethics: "Mostre o que é real." },
  { id: "autoridade", name: "Autoridade", emoji: "🎓", grupo: "Cialdini", what: "Confiamos em especialistas e símbolos de autoridade.", brain: "Delegar a quem 'sabe' poupa esforço de decidir.", neuro: "acetilcolina", regiao: "prefrontal", ex: ["'Recomendado por dentistas'", "Jaleco, diploma, selos de certificação", "Especialista/influencer endossando", "'Eleito o melhor de 2025'"], defesa: "A autoridade é real e relevante ao tema?", ethics: "Autoridade legítima, não jaleco de mentira." },
  { id: "afinidade", name: "Afinidade", emoji: "💛", grupo: "Cialdini", what: "Compramos de quem gostamos e com quem nos parecemos.", brain: "Empatia e semelhança ativam recompensa social.", neuro: "ocitocina", regiao: "accumbens", ex: ["Influencer 'gente como a gente'", "Tom de voz amigável da marca", "Vendedor que acha algo em comum", "História do fundador parecida com você"], defesa: "Gostar do vendedor não torna a oferta boa.", ethics: "Conexão real, não bajulação." },
  { id: "escassez2", name: "Escassez", emoji: "⏳", grupo: "Cialdini", what: "O raro e o que está acabando valem mais.", brain: "Desejo (dopamina) + medo de perder (cortisol).", neuro: "dopamina", regiao: "accumbens", ex: ["'Últimas unidades' / 'só restam 2'", "Edição limitada e drops", "Contagem regressiva", "'Vagas limitadas'"], defesa: "Escassez verdadeira ou fabricada?", ethics: "Só use se for verdade." },
  { id: "unidade", name: "Unidade (Nós)", emoji: "🤝", grupo: "Cialdini", what: "Agimos por quem sentimos ser 'do nosso grupo'.", brain: "Identidade compartilhada gera confiança e laço.", neuro: "ocitocina", regiao: "amigdala", ex: ["'Feito por brasileiros, pra brasileiros'", "Comunidades e clubes de membros", "Linguagem de tribo ('a gente', 'nossa turma')", "Causa em comum entre marca e cliente"], defesa: "Pertencer não deve anular seu julgamento.", ethics: "Una de verdade, não divida pra vender." },
  { id: "novidade", name: "Novidade", emoji: "✨", grupo: "Gatilho", what: "O novo atrai e prende a atenção automaticamente.", brain: "Novidade dispara dopamina e curiosidade.", neuro: "dopamina", regiao: "accumbens", ex: ["'Lançamento', 'novo', 'atualizado'", "Drops e coleções sazonais", "Funções 'beta' exclusivas", "Reembalagem 'nova fórmula'"], defesa: "Novo nem sempre é melhor.", ethics: "Novidade com valor real, não só rótulo." },
  { id: "curiosidade", name: "Curiosidade (Loop Aberto)", emoji: "🕳️", grupo: "Gatilho", what: "Uma lacuna de informação cria coceira por fechar.", brain: "O 'gap' gera tensão que só o clique alivia.", neuro: "dopamina", regiao: "prefrontal", ex: ["Títulos 'você não vai acreditar no que...'", "'A 3ª dica mudou meu negócio'", "Cliffhanger no fim do episódio/e-mail", "Caixa misteriosa / spoiler parcial"], defesa: "O conteúdo entrega o que a isca promete?", ethics: "Abra loops que você realmente fecha." },
  { id: "antecipacao", name: "Antecipação", emoji: "🔮", grupo: "Gatilho", what: "Esperar a recompensa é, em parte, mais prazeroso que tê-la.", brain: "Dopamina sobe na expectativa, não só no prêmio.", neuro: "dopamina", regiao: "accumbens", ex: ["Pré-venda e listas de espera", "Contagem para o lançamento", "Teasers e 'em breve'", "Pré-encomenda com bônus"], defesa: "A espera está te vendendo o hype ou o produto?", ethics: "Construa hype honesto." },
  { id: "porque", name: "O Poder do 'Porque'", emoji: "💬", grupo: "Gatilho", what: "Uma justificativa — mesmo fraca — aumenta a aceitação.", brain: "O cérebro aceita melhor o que tem 'razão'.", neuro: "acetilcolina", regiao: "prefrontal", ex: ["'Compre agora PORQUE o estoque é limitado'", "'Desconto PORQUE é seu aniversário'", "Explicar o motivo da política/preço", "'Posso passar na frente porque estou com pressa?'"], defesa: "A razão dada faz sentido de verdade?", ethics: "Dê motivos verdadeiros." },
  { id: "inimigo", name: "Inimigo Comum", emoji: "⚔️", grupo: "Gatilho", what: "Unir-se contra um 'vilão' fortalece o vínculo com a marca.", brain: "Ameaça compartilhada ativa identidade de grupo.", neuro: "adrenalina", regiao: "amigdala", ex: ["'Chega de banco caro' / 'contra a burocracia'", "Marca desafiante vs. gigante do setor", "'Eles complicam, a gente simplifica'", "Manifesto contra um problema do mercado"], defesa: "O inimigo é real ou foi inventado pra te capturar?", ethics: "Critique sem caluniar." },
  { id: "gamificacao", name: "Gamificação", emoji: "🎮", grupo: "Gatilho", what: "Pontos, níveis e recompensas viciam pela dopamina do progresso.", brain: "Cada conquista libera dopamina de recompensa.", neuro: "dopamina", regiao: "accumbens", ex: ["Streaks (ofensivas) que você não quer perder", "Pontos, badges, ranking", "Barras de progresso e níveis", "Recompensa variável (como caça-níquel)"], defesa: "Você joga por valor ou só pra não 'perder a sequência'?", ethics: "Engaje, não vicie." },
];

const STROOP_COLORS = [
  { name: "VERMELHO", hex: "#ef4444" }, { name: "AZUL", hex: "#38bdf8" },
  { name: "VERDE", hex: "#4ade80" }, { name: "AMARELO", hex: "#ffce6b" }, { name: "ROXO", hex: "#a78bfa" },
];

const SIM_SCENARIOS = [
  {
    id: "ecom", emoji: "🛒", title: "Compra online", intro: "Você entra num site pra comprar um fone. Veja quais gatilhos agem em você.",
    steps: [
      { text: "Logo na página: 'MAIS VENDIDO ⭐ 4,9 — 8.213 avaliações'. O que pesa mais?", a: ["Se tanta gente aprova, deve ser bom", "Vou ler as specs com calma"], trigger: "Prova Social", note: "O selo de popularidade ativa a prova social — seguimos a maioria pra poupar esforço.", neuro: "ocitocina", regiao: "accumbens" },
      { text: "O preço aparece: 'De R$499 por R$249'. Sua sensação?", a: ["Metade do preço, que oferta!", "R$249 ainda é caro"], trigger: "Ancoragem", note: "O R$499 riscado é a âncora. Sem ele, R$249 não pareceria barato.", neuro: null, regiao: "prefrontal" },
      { text: "'Oferta acaba em 04:59 ⏳ — restam 3 unidades'. E agora?", a: ["Melhor comprar logo!", "Isso é pressão, vou pensar"], trigger: "Escassez + Urgência", note: "Tempo e estoque baixos disparam o FOMO e o impulso de agir.", neuro: "cortisol", regiao: "amigdala" },
      { text: "No checkout: 'Frete grátis acima de R$299. Falta R$50'. Você...", a: ["Adiciono algo pra ganhar o frete", "Pago o frete mesmo"], trigger: "Aversão à Perda + Meta", note: "Não querer 'perder' o frete te faz gastar mais — e a barra de progresso puxa pra completar.", neuro: "dopamina", regiao: "accumbens" },
      { text: "Aparece um seguro/garantia estendida pré-marcado por +R$39. Você...", a: ["Deixo marcado, melhor garantir", "Desmarco, não preciso"], trigger: "Opção Padrão + Aversão à Perda", note: "O que já vem marcado tende a ficar; e a ideia de 'perder' a proteção pesa.", neuro: null, regiao: "ganglios" },
    ],
  },
  {
    id: "saas", emoji: "💳", title: "Assinatura (SaaS)", intro: "Você testa um app e ele quer te converter em assinante. Repare nos gatilhos.",
    steps: [
      { text: "'Teste grátis 7 dias' — sem pedir cartão. Você assina o teste?", a: ["Claro, é grátis", "Vou pesquisar antes"], trigger: "Reciprocidade", note: "Receber algo de graça cria a sensação de querer retribuir depois.", neuro: "ocitocina", regiao: "accumbens" },
      { text: "Durante o teste, uma barra mostra 'Seu progresso: 80% configurado'. Você...", a: ["Completo, falta pouco!", "Deixo pra lá"], trigger: "Efeito Zeigarnik + Meta", note: "Tarefa inacabada incomoda; a proximidade da meta libera dopamina.", neuro: "dopamina", regiao: "prefrontal" },
      { text: "Depois de personalizar tudo, pensa em sair. Como se sente?", a: ["Já investi tanto, vou ficar", "Tanto faz, saio fácil"], trigger: "Efeito IKEA + Posse", note: "O que você ajudou a montar parece mais valioso — e soltar dói.", neuro: "ocitocina", regiao: "accumbens" },
      { text: "'Plano Pro recomendado ⭐' já vem selecionado, com '-30% só hoje'. Você...", a: ["Pego o Pro com desconto", "Escolho o básico"], trigger: "Opção Padrão + Escassez", note: "O padrão destacado + o prazo curto empurram pro plano mais caro.", neuro: "dopamina", regiao: "accumbens" },
      { text: "Ao tentar cancelar: 'Você vai perder seu histórico e 320 pontos'. Você...", a: ["Melhor não cancelar", "Cancelo mesmo assim"], trigger: "Aversão à Perda", note: "Enfatizar a perda (não o ganho) trava o cancelamento. Cuidado: vira dark pattern.", neuro: "cortisol", regiao: "insula" },
    ],
  },
  {
    id: "super", emoji: "🏬", title: "No supermercado", intro: "Uma ida ao mercado é uma aula de neuromarketing. Veja por quê.",
    steps: [
      { text: "Na entrada: flores, cheiro de pão quente e frutas coloridas. Efeito?", a: ["Fico de bom humor pra comprar", "Não me afeta"], trigger: "Priming Sensorial", note: "Aromas e cores 'preparam' seu humor e apetite antes das compras.", neuro: "dopamina", regiao: "hipocampo" },
      { text: "Os itens essenciais (leite, ovos) ficam no fundo. Por quê?", a: ["Pra eu passar por tudo", "Coincidência"], trigger: "Arquitetura de Escolha", note: "O trajeto é desenhado pra te expor ao máximo de produtos.", neuro: null, regiao: "prefrontal" },
      { text: "Na altura dos olhos estão as marcas mais caras. Você...", a: ["Pego a que está na minha frente", "Procuro embaixo as mais baratas"], trigger: "Saliência + Esforço", note: "O que é fácil de ver e pegar vende mais — menos esforço, mais compra.", neuro: null, regiao: "talamo" },
      { text: "'Leve 3, pague 2'. Você só precisava de 1. O que faz?", a: ["Levo 3, é vantagem!", "Levo 1, é o que preciso"], trigger: "Ancoragem + Aversão à Perda", note: "A oferta ancora a quantidade e faz 'perder o desconto' parecer ruim.", neuro: "dopamina", regiao: "accumbens" },
      { text: "No caixa: chocolates e balas pequenos. Por quê ali?", a: ["Compra por impulso na espera", "Pra decorar"], trigger: "Imediatismo", note: "Cansado e na fila, seu autocontrole (córtex pré-frontal) está baixo — o impulso vence.", neuro: "dopamina", regiao: "accumbens" },
    ],
  },
  {
    id: "social", emoji: "📱", title: "Rede social", intro: "Por que é tão difícil largar o feed? Veja os gatilhos do design.",
    steps: [
      { text: "Você abre o app 'só pra ver rapidinho'. O feed é infinito. Efeito?", a: ["Rolo sem perceber o tempo", "Fecho rápido"], trigger: "Scroll Infinito", note: "Sem fim e sem 'ponto de parada', o cérebro não recebe o sinal de 'chega'.", neuro: "dopamina", regiao: "accumbens" },
      { text: "Puxa pra atualizar e nem sempre vem algo novo. Por que vicia?", a: ["A surpresa me prende", "Acho chato"], trigger: "Recompensa Variável", note: "Recompensa imprevisível (como caça-níquel) é a que mais libera dopamina.", neuro: "dopamina", regiao: "accumbens" },
      { text: "Aparece '🔴 3 novas notificações'. Você...", a: ["Preciso checar agora", "Ignoro"], trigger: "Saliência + Curiosidade", note: "O ponto vermelho cria um loop aberto que coça até você clicar.", neuro: "dopamina", regiao: "talamo" },
      { text: "Seus amigos curtiram um evento que você não foi. Sente o quê?", a: ["Um aperto de estar perdendo algo", "Tranquilo"], trigger: "FOMO + Prova Social", note: "Ver os outros aproveitando ativa dor social e medo de ficar de fora.", neuro: "cortisol", regiao: "amigdala" },
      { text: "Postou e fica olhando os likes chegando. Por quê?", a: ["Cada like me dá um pico de prazer", "Não ligo"], trigger: "Validação Social", note: "Cada curtida é uma microdose de dopamina — feita pra você voltar.", neuro: "dopamina", regiao: "accumbens" },
    ],
  },
];

// =========================================================================
//  COMPORTAMENTO — hub e sub-módulos
// =========================================================================

// liga um conceito de comportamento ao hormônio/neurotransmissor e à região do cérebro
function NeuroTag({ neuro, regiao, label = "Cérebro" }) {
  const n = neuro && NEUROS[neuro];
  const r = regiao && REGIONS[regiao];
  if (!n && !r) return null;
  return (
    <div style={styles.neuroTagWrap}>
      <span style={styles.neuroTagLbl}>🔗 {label}:</span>
      {n && <span style={{ ...styles.neuroPill, color: n.color, borderColor: n.color + "66", background: n.color + "14" }}><i style={{ width: 7, height: 7, borderRadius: 99, background: n.color, display: "inline-block" }} /> {n.name}</span>}
      {r && <span style={styles.regiaoPill}>{r.name}</span>}
    </div>
  );
}

function Comportamento() {
  const [view, setView] = useState(null);
  useBackHandler(view !== null, () => setView(null));
  const back = <button onClick={() => setView(null)} style={styles.backBtn}><ArrowLeft size={16} /> Comportamento</button>;
  if (view === "vieses") return <div className="fade">{back}<BiasDeck /></div>;
  if (view === "persuasao") return <div className="fade">{back}<Persuasao /></div>;
  if (view === "sistema") return <div className="fade">{back}<Sistema12 /></div>;
  if (view === "neuroux") return <div className="fade">{back}<NeuroUX /></div>;
  if (view === "simulador") return <div className="fade">{back}<Simulador /></div>;

  const Item = ({ id, emoji, title, desc }) => (
    <button onClick={() => setView(id)} style={styles.gameCard}>
      <span style={{ fontSize: 28 }}>{emoji}</span>
      <span style={{ flex: 1 }}><b style={{ display: "block", color: "#e6eefc", fontSize: 15 }}>{title}</b><span style={{ fontSize: 12.5, color: "#8aa0c4" }}>{desc}</span></span>
      <ChevronRight size={18} style={{ color: "#ffce6b" }} />
    </button>
  );
  return (
    <div className="fade">
      <h2 style={styles.h2}>Comportamento</h2>
      <p style={styles.p}>Como o cérebro vira decisão — e como isso aparece no design e no marketing. Sempre com um olhar ético.</p>
      <Item id="vieses" emoji="🃏" title="Baralho de Vieses" desc={`${BIASES.length} cartas com exemplos + o hormônio que cada viés ativa`} />
      <Item id="persuasao" emoji="🎯" title="Gatilhos Mentais" desc={`${CIALDINI.length} gatilhos (Cialdini + mais), ligados ao cérebro`} />
      <Item id="sistema" emoji="⚡" title="Sistema 1 × Sistema 2" desc="Teoria + teste de raciocínio (CRT) + Stroop" />
      <Item id="neuroux" emoji="🖥️" title="Anatomia de uma Tela" desc="Guia de UI/UX por categoria, com boas práticas e dark patterns" />
      <Item id="simulador" emoji="🕹️" title="Simulador de Decisão" desc="4 cenários reais, passo a passo, com o hormônio de cada gatilho" />
    </div>
  );
}

function FlipCard({ height = 300, front, back, onFlip }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ perspective: 1400, cursor: "pointer" }} onClick={() => { setF(!f); onFlip && onFlip(!f); }}>
      <div className={"flip-inner" + (f ? " flipped" : "")} style={{ minHeight: height }}>
        <div className="flip-face">{front}</div>
        <div className="flip-face flip-back">{back}</div>
      </div>
    </div>
  );
}

function BiasDeck() {
  const { addXp } = useGame();
  const [cat, setCat] = useState("all");
  const [i, setI] = useState(0);
  const seenRef = useRef(new Set());
  const [drawnId, setDrawnId] = useState(null);
  const awarded = useRef({});

  const list = cat === "all" ? BIASES : BIASES.filter((b) => b.cat === cat);
  const idx = Math.min(i, list.length - 1);
  const currentB = cat === "all" ? (drawnId ? BIASES.find((b) => b.id === drawnId) : null) : list[idx];

  useEffect(() => { const b = currentB; if (b && !awarded.current[b.id]) { awarded.current[b.id] = true; addXp(3, "Viés!"); } }, [currentB && currentB.id]);

  const drawNext = () => {
    let pool = BIASES.filter((b) => !seenRef.current.has(b.id));
    if (pool.length === 0) { seenRef.current = new Set(); pool = BIASES.slice(); }
    if (pool.length > 1 && drawnId) pool = pool.filter((b) => b.id !== drawnId);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    seenRef.current.add(pick.id);
    setDrawnId(pick.id);
  };
  const reshuffle = () => { seenRef.current = new Set(); setDrawnId(null); };

  const renderCard = (b) => {
    const c = BIAS_CATS[b.cat];
    return (
      <div key={b.id} className="fade" style={{ ...styles.biasCard, borderColor: c.color + "55" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 30 }}>🃏</span>
          <div style={{ flex: 1 }}>
            <span style={{ ...styles.catTag, background: c.color + "22", color: c.color, borderColor: c.color + "55" }}>{c.label}</span>
            <h3 style={{ fontFamily: "Fraunces, serif", fontSize: 22, color: "#fff", margin: "5px 0 0" }}>{b.name}</h3>
          </div>
        </div>
        <p style={{ fontSize: 14, color: "#dbe4f3", lineHeight: 1.55, margin: "12px 0 0" }}>{b.what}</p>
        <div style={{ ...styles.biasBlock, background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.10)" }}>
          <span style={styles.biasBlockLbl}>🧠 No cérebro</span>
          <p style={styles.biasBlockTxt}>{b.brain}</p>
          <NeuroTag neuro={b.neuro} regiao={b.regiao} label="Ativa" />
        </div>
        <div style={{ ...styles.biasBlock, background: "rgba(255,206,107,0.08)", borderColor: "rgba(255,206,107,0.28)" }}>
          <span style={{ ...styles.biasBlockLbl, color: "#ffce6b" }}>📣 Exemplos reais</span>
          <ul style={styles.exList}>{b.ex.map((e, k) => <li key={k} style={styles.exItem}><span style={{ color: "#ffce6b", marginRight: 7 }}>•</span>{e}</li>)}</ul>
        </div>
        <div style={{ ...styles.biasBlock, background: "rgba(74,222,128,0.08)", borderColor: "rgba(74,222,128,0.28)" }}>
          <span style={{ ...styles.biasBlockLbl, color: "#4ade80" }}>🛡️ Como se proteger</span>
          <p style={styles.biasBlockTxt}>{b.defesa}</p>
        </div>
        <div style={{ ...styles.biasBlock, background: "rgba(125,211,252,0.06)", borderColor: "rgba(205,209,218,0.22)", marginBottom: 0 }}>
          <span style={{ ...styles.biasBlockLbl, color: "#cdd1da" }}>⚖️ Uso ético</span>
          <p style={styles.biasBlockTxt}>{b.ethics}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="fade">
      <h2 style={styles.h2}>Baralho de Vieses</h2>
      <p style={{ ...styles.pMuted, marginBottom: 10 }}>{BIASES.length} cartas · puxe do baralho ou filtre por categoria.</p>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
        <button onClick={() => { setCat("all"); setI(0); }} style={{ ...styles.catChip, borderColor: cat === "all" ? "#ffce6b" : "rgba(255,255,255,0.12)", color: cat === "all" ? "#ffce6b" : "#9fb2d4" }}>Todos</button>
        {Object.entries(BIAS_CATS).map(([k, v]) => (
          <button key={k} onClick={() => { setCat(k); setI(0); }} style={{ ...styles.catChip, borderColor: cat === k ? v.color : "rgba(255,255,255,0.12)", color: cat === k ? v.color : "#9fb2d4", background: cat === k ? v.color + "18" : "transparent" }}>
            <i style={{ width: 8, height: 8, borderRadius: 99, background: v.color, display: "inline-block", marginRight: 6 }} />{v.label}
          </button>
        ))}
      </div>

      {cat === "all" ? (
        <>
          {!drawnId ? (
            <div style={{ textAlign: "center" }}>
              <div style={styles.deckPile} onClick={drawNext}>
                {[3, 2, 1, 0].map((k) => (
                  <div key={k} style={{ ...styles.deckBack, transform: `translateY(${k * -7}px) translateX(${(k - 1.5) * 4}px) rotate(${(k - 1.5) * 2}deg)`, zIndex: 10 - k, opacity: 1 - k * 0.12 }}>
                    {k === 0 && <span style={{ fontSize: 48 }}>🃏</span>}
                  </div>
                ))}
              </div>
              <p style={{ ...styles.pMuted, margin: "4px 0 12px" }}>Baralho embaralhado com {BIASES.length} vieses</p>
              <button onClick={drawNext} style={{ ...styles.ctrlBtn, ...styles.playBtn, width: "100%" }}>🃏 Puxar uma carta aleatória</button>
            </div>
          ) : (
            <>
              {renderCard(currentB)}
              <div style={styles.controls}>
                <button onClick={reshuffle} style={styles.ctrlBtn} title="Embaralhar"><RotateCcw size={16} /></button>
                <span style={{ ...styles.label, flex: 1, textAlign: "center", margin: 0 }}>{seenRef.current.size} de {BIASES.length} vistas</span>
                <button onClick={drawNext} style={{ ...styles.ctrlBtn, ...styles.playBtn, flex: 1 }}>Puxar outra <Shuffle size={15} /></button>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          {renderCard(currentB)}
          <div style={styles.controls}>
            <button onClick={() => setI(Math.max(0, idx - 1))} disabled={idx === 0} style={styles.ctrlBtn}><ChevronLeft size={18} /></button>
            <span style={{ ...styles.label, flex: 1, textAlign: "center", margin: 0 }}>{idx + 1} / {list.length}</span>
            <button onClick={() => setI(Math.min(list.length - 1, idx + 1))} disabled={idx >= list.length - 1} style={styles.ctrlBtn}><ChevronRight size={18} /></button>
          </div>
        </>
      )}
    </div>
  );
}

function Persuasao() {
  const [open, setOpen] = useState("recip");
  return (
    <div className="fade">
      <h2 style={styles.h2}>Gatilhos Mentais</h2>
      <p style={styles.p}>Os 6 princípios de Cialdini + outros gatilhos que movem decisões. Cada um liga ao hormônio e à região que ativa. Toque pra abrir.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {CIALDINI.map((g) => {
          const isOpen = open === g.id;
          return (
            <div key={g.id} style={{ ...styles.uxCard, padding: 0, overflow: "hidden" }}>
              <button onClick={() => setOpen(isOpen ? null : g.id)} style={styles.persHead}>
                <span style={{ fontSize: 24 }}>{g.emoji}</span>
                <span style={{ flex: 1, textAlign: "left" }}>
                  <b style={{ color: "#e6eefc", fontSize: 15, display: "block" }}>{g.name}</b>
                  <span style={{ fontSize: 10.5, color: "#8aa0c4" }}>{g.grupo === "Cialdini" ? "Cialdini" : "Gatilho mental"}</span>
                </span>
                <ChevronRight size={18} style={{ color: "#ffce6b", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
              </button>
              {isOpen && (
                <div className="fade" style={{ padding: "0 15px 15px" }}>
                  <p style={{ fontSize: 13.5, color: "#dbe4f3", lineHeight: 1.5, margin: "0 0 6px" }}>{g.what}</p>
                  <p style={{ fontSize: 12.5, color: "#9fb2d4", margin: "0" }}>🧠 {g.brain}</p>
                  <NeuroTag neuro={g.neuro} regiao={g.regiao} label="Ativa" />
                  <span style={{ ...styles.biasBlockLbl, color: "#ffce6b", marginTop: 11 }}>📣 Exemplos reais</span>
                  <ul style={styles.exList}>{g.ex.map((e, k) => <li key={k} style={styles.exItem}><span style={{ color: "#ffce6b", marginRight: 7 }}>•</span>{e}</li>)}</ul>
                  <p style={{ fontSize: 12.5, color: "#9be8b4", margin: "8px 0 0" }}>🛡️ <b>Defesa:</b> {g.defesa}</p>
                  <p style={{ fontSize: 12.5, color: "#cdd1da", margin: "4px 0 0" }}>⚖️ <b>Ético:</b> {g.ethics}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const CRT = [
  { q: "Um taco e uma bola custam R$1,10 juntos. O taco custa R$1,00 a mais que a bola. Quanto custa a bola?", opts: ["R$0,10", "R$0,05", "R$1,00", "R$0,11"], correct: 1, intui: 0, note: "A resposta automática é R$0,10 — e está errada. Se a bola custasse 0,10, o taco (1,10) somaria 1,20. O certo é R$0,05. O Sistema 1 some o '1,10' e o '1,00' sem pensar." },
  { q: "5 máquinas levam 5 minutos pra fazer 5 peças. Quanto tempo 100 máquinas levam pra fazer 100 peças?", opts: ["100 minutos", "5 minutos", "20 minutos", "50 minutos"], correct: 1, intui: 0, note: "O Sistema 1 grita '100'. Mas cada máquina faz 1 peça em 5 min — então 100 máquinas fazem 100 peças em… 5 minutos." },
  { q: "Vitórias-régias dobram de área a cada dia e cobrem o lago em 48 dias. Em quantos dias cobriam METADE do lago?", opts: ["24 dias", "47 dias", "36 dias", "12 dias"], correct: 1, intui: 0, note: "O intuitivo é 24 (metade de 48). Mas como dobra todo dia, um dia antes de encher (dia 47) o lago estava pela metade." },
];

function CrtTest() {
  const { addXp } = useGame();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [traps, setTraps] = useState(0);
  const [done, setDone] = useState(false);
  const awarded = useRef(false);
  const q = CRT[i];

  const pick = (idx) => {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === q.correct) setScore((s) => s + 1);
    else if (idx === q.intui) setTraps((t) => t + 1);
  };
  const next = () => {
    if (i + 1 >= CRT.length) { setDone(true); if (!awarded.current) { awarded.current = true; addXp(12, "CRT!"); } }
    else { setI(i + 1); setPicked(null); }
  };

  if (done) return (
    <div style={styles.s12box}>
      <div style={{ textAlign: "center" }}>
        <span style={{ fontSize: 36 }}>🧮</span>
        <h3 style={{ ...styles.h2, fontSize: 19 }}>{score}/{CRT.length} no raciocínio</h3>
        <p style={styles.p}>{traps > 0 ? `O Sistema 1 te pegou ${traps}x com a resposta "óbvia" e errada. ` : "Você resistiu à resposta automática! "}Essas perguntas têm uma resposta intuitiva (Sistema 1) que parece certa mas engana — só o Sistema 2, parando pra calcular, acerta.</p>
        <button onClick={() => { setI(0); setPicked(null); setScore(0); setTraps(0); setDone(false); }} style={{ ...styles.ctrlBtn, ...styles.playBtn, width: "100%" }}><RotateCcw size={15} /> De novo</button>
      </div>
    </div>
  );

  return (
    <div style={styles.s12box}>
      <span style={{ ...styles.label, display: "block", margin: 0 }}>Pergunta {i + 1}/{CRT.length}</span>
      <p style={{ ...styles.lessonPara, fontWeight: 600, color: "#e6eefc", margin: "8px 0 12px" }}>{q.q}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {q.opts.map((o, idx) => {
          let bd = "rgba(255,255,255,0.12)", bg = "rgba(255,255,255,0.03)";
          if (picked !== null) {
            if (idx === q.correct) { bd = "#4ade80"; bg = "rgba(74,222,128,0.12)"; }
            else if (idx === picked) { bd = "#f87171"; bg = "rgba(248,113,113,0.12)"; }
          }
          return <button key={idx} onClick={() => pick(idx)} disabled={picked !== null} style={{ ...styles.stroopBtn, borderColor: bd, background: bg, fontSize: 15 }}>{o}</button>;
        })}
      </div>
      {picked !== null && (
        <div className="fade" style={{ ...styles.whyBox, marginTop: 12, borderColor: "#7dd3fc55", background: "rgba(125,211,252,0.08)" }}>
          <p style={{ ...styles.lessonPara, margin: 0, fontSize: 13 }}>{q.note}</p>
          <button onClick={next} style={{ ...styles.ctrlBtn, ...styles.playBtn, width: "100%", marginTop: 8 }}>{i + 1 >= CRT.length ? "Ver resultado" : "Próxima"} <ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
}

function StroopTest() {
  const { addXp } = useGame();
  const [playing, setPlaying] = useState(false);
  const [trial, setTrial] = useState(null);
  const [score, setScore] = useState(0);
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);
  const awarded = useRef(false);
  const TOTAL = 8;

  const nextTrial = () => {
    const word = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
    let ink = word; while (ink.name === word.name) ink = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
    const opts = STROOP_COLORS.slice().sort(() => Math.random() - 0.5).slice(0, 4);
    if (!opts.find((o) => o.name === ink.name)) opts[0] = ink;
    setTrial({ word, ink, opts: opts.sort(() => Math.random() - 0.5), answered: null });
  };
  const start = () => { setPlaying(true); setScore(0); setN(0); setDone(false); awarded.current = false; nextTrial(); };
  const answer = (o) => {
    if (!trial || trial.answered) return;
    const ok = o.name === trial.ink.name;
    setTrial({ ...trial, answered: o.name });
    if (ok) setScore((s) => s + 1);
    setTimeout(() => {
      if (n + 1 >= TOTAL) { setDone(true); setPlaying(false); if (!awarded.current) { awarded.current = true; addXp(12, "Stroop!"); } }
      else { setN((x) => x + 1); nextTrial(); }
    }, 650);
  };

  if (!playing && !done) return (
    <div style={styles.s12box}>
      <b style={{ color: "#ffce6b" }}>🎨 Teste de Stroop</b>
      <p style={{ ...styles.lessonPara, margin: "6px 0 12px", fontSize: 13.5 }}>Vai aparecer o NOME de uma cor, escrito numa cor diferente. Toque na <b>cor da tinta</b> — ignore a palavra. Você vai sentir o Sistema 1 (que lê automático) te atrapalhar.</p>
      <button onClick={start} style={{ ...styles.ctrlBtn, ...styles.playBtn, width: "100%" }}>Começar <Play size={16} /></button>
    </div>
  );
  if (playing && trial) return (
    <div style={styles.s12box}>
      <span style={{ ...styles.label, textAlign: "center", display: "block" }}>{n + 1}/{TOTAL} · acertos {score}</span>
      <div style={{ textAlign: "center", padding: "18px 0 22px" }}>
        <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 44, color: trial.ink.hex, letterSpacing: 1 }}>{trial.word.name}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {trial.opts.map((o) => {
          let bd = "rgba(255,255,255,0.12)";
          if (trial.answered) { if (o.name === trial.ink.name) bd = "#4ade80"; else if (o.name === trial.answered) bd = "#f87171"; }
          return <button key={o.name} onClick={() => answer(o)} disabled={!!trial.answered} style={{ ...styles.stroopBtn, borderColor: bd }}>{o.name}</button>;
        })}
      </div>
    </div>
  );
  return (
    <div style={styles.s12box}>
      <div style={{ textAlign: "center" }}>
        <span style={{ fontSize: 38 }}>⚡</span>
        <h3 style={{ ...styles.h2, fontSize: 19 }}>{score}/{TOTAL} acertos</h3>
        <p style={styles.p}>Sentiu a hesitação? É o Sistema 1 lendo a palavra sem você pedir, enquanto o Sistema 2 tenta corrigir. Essa briga é o que cansa — e o que o marketing explora.</p>
        <button onClick={start} style={{ ...styles.ctrlBtn, ...styles.playBtn, width: "100%" }}><RotateCcw size={15} /> De novo</button>
      </div>
    </div>
  );
}

function Sistema12() {
  const [sub, setSub] = useState("teoria");
  const HEUR = [
    { n: "Disponibilidade", d: "Julga pelo que vem fácil à mente.", v: "→ vira o viés de disponibilidade" },
    { n: "Representatividade", d: "Julga por semelhança a um 'tipo'.", v: "→ vira estereótipo" },
    { n: "Afeto", d: "Decide pela emoção que sente.", v: "→ vira heurística do afeto" },
    { n: "Ancoragem", d: "Parte do primeiro número que viu.", v: "→ vira ancoragem" },
  ];
  return (
    <div className="fade">
      <h2 style={styles.h2}>Sistema 1 × Sistema 2</h2>
      <p style={styles.p}>O modelo de Daniel Kahneman: dois modos de pensar que disputam a sua cabeça o tempo todo. Quase todo viés nasce do Sistema 1 agindo sozinho.</p>

      <div style={{ ...styles.segment }}>
        {[["teoria", "Entender"], ["crt", "Teste CRT"], ["stroop", "Stroop"]].map(([k, l]) => (
          <button key={k} onClick={() => setSub(k)} style={{ ...styles.s12tab, ...(sub === k ? styles.segActive : { color: "#9aacc6" }) }}>{l}</button>
        ))}
      </div>

      {sub === "teoria" && (
        <div className="fade">
          <div style={{ ...styles.s12card, borderColor: "#fb718555", background: "rgba(251,113,133,0.08)" }}>
            <b style={{ color: "#fb7185", fontSize: 16 }}>⚡ Sistema 1 — rápido</b>
            <p style={{ ...styles.biasBlockTxt, margin: "6px 0 0" }}>Automático, emocional e sem esforço. Está sempre ligado. Reconhece rostos, lê palavras, sente medo, dá o "palpite". Roda a maior parte das suas decisões do dia.</p>
            <NeuroTag neuro="dopamina" regiao="amigdala" label="Apoia-se em" />
          </div>
          <div style={{ ...styles.s12card, borderColor: "#7dd3fc55", background: "rgba(125,211,252,0.07)" }}>
            <b style={{ color: "#7dd3fc", fontSize: 16 }}>🧠 Sistema 2 — lento</b>
            <p style={{ ...styles.biasBlockTxt, margin: "6px 0 0" }}>Concentrado, lógico e cansativo. Faz conta, compara, controla impulso. É preguiçoso e gasta energia (glicose), então delega quase tudo pro Sistema 1.</p>
            <NeuroTag neuro={null} regiao="prefrontal" label="Mora no" />
          </div>

          <p style={styles.label}>🔧 As heurísticas (atalhos) do Sistema 1</p>
          <div style={styles.uxCard}>
            {HEUR.map((h, i) => (
              <div key={i} style={{ ...styles.s12row, borderBottom: i === HEUR.length - 1 ? "none" : styles.s12row.borderBottom }}>
                <b style={{ color: "#ffce6b", minWidth: 130, flexShrink: 0 }}>{h.n}</b>
                <span>{h.d} <span style={{ color: "#8aa0c4" }}>{h.v}</span></span>
              </div>
            ))}
            <p style={{ ...styles.pMuted, marginTop: 10 }}>Quando o atalho acerta, é genial e rápido. Quando erra, nasce um viés. 🃏 Tudo isso está no Baralho de Vieses.</p>
          </div>

          <div style={{ ...styles.keyBox, marginTop: 14 }}>
            <span style={styles.keyLabel}>COMO ATIVAR O SISTEMA 2</span>
            <p style={{ ...styles.biasBlockTxt, margin: "6px 0 0" }}>Desacelere antes de decisões importantes • pergunte "por que eu acho isso?" • escreva os prós e contras • evite escolher com fome, cansaço, pressa ou pressão • durma sobre o assunto.</p>
          </div>
        </div>
      )}
      {sub === "crt" && <div className="fade"><p style={{ ...styles.p, marginTop: 0 }}>O Teste de Reflexão Cognitiva: 3 perguntas com uma resposta "óbvia" (Sistema 1) que está errada. Pare e pense.</p><CrtTest /></div>}
      {sub === "stroop" && <div className="fade"><StroopTest /></div>}
    </div>
  );
}

function ScarcityTimer() {
  const [s, setS] = useState(15);
  useEffect(() => { const t = setInterval(() => setS((x) => (x <= 0 ? 15 : x - 1)), 1000); return () => clearInterval(t); }, []);
  const mm = String(Math.floor(s / 60)).padStart(2, "0"), ss = String(s % 60).padStart(2, "0");
  return <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, color: "#fb7185" }}>{mm}:{ss}</span>;
}

const UX_CATS = {
  atencao: { label: "Atenção & Hierarquia", color: "#38bdf8" },
  confianca: { label: "Confiança", color: "#4ade80" },
  acao: { label: "Ação & Conversão", color: "#ffce6b" },
  engajamento: { label: "Engajamento", color: "#a78bfa" },
  carga: { label: "Carga Cognitiva", color: "#fb7185" },
  urgencia: { label: "Urgência (cuidado)", color: "#fb923c" },
};

function UXExampleScreen() {
  const Tag = ({ c, children }) => <span style={{ fontSize: 9.5, fontWeight: 800, color: c, border: "1px solid " + c + "66", background: c + "14", borderRadius: 99, padding: "2px 7px", whiteSpace: "nowrap" }}>{children}</span>;
  const Row = ({ children, tag }) => <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}><div style={{ flex: 1, minWidth: 0 }}>{children}</div>{tag}</div>;
  return (
    <div style={styles.uxScreen}>
      <div style={styles.uxScreenImg}>🎧</div>
      <Row tag={<Tag c="#38bdf8">Hierarquia</Tag>}><b style={{ color: "#fff", fontSize: 15 }}>Fone XYZ Pro</b></Row>
      <Row tag={<Tag c="#4ade80">Prova Social</Tag>}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 12.5, color: "#e6eefc", fontWeight: 600 }}>⭐ 4,9 · 8.213 avaliações</span>
          <span className="ux-pulse" style={{ fontSize: 10.5, color: "#4ade80" }}>🟢 37 pessoas vendo agora</span>
        </div>
      </Row>
      <Row tag={<Tag c="#ffce6b">Ancoragem</Tag>}>
        <span><span style={{ color: "#8aa0c4", textDecoration: "line-through", fontSize: 13 }}>R$499</span> <b style={{ color: "#ffce6b", fontSize: 21 }}>R$249</b></span>
      </Row>
      <Row tag={<Tag c="#fb923c">Escassez</Tag>}>
        <span style={{ color: "#fb7185", fontWeight: 700, fontSize: 12.5 }}>⏳ Acaba em <ScarcityTimer /> · restam 3</span>
      </Row>
      <Row tag={<Tag c="#ffce6b">Padrão</Tag>}>
        <div style={{ display: "flex", gap: 6 }}><div style={{ ...styles.uxPlan, padding: "7px 6px", fontSize: 11 }}>Avulso</div><div style={{ ...styles.uxPlan, padding: "7px 6px", fontSize: 11, borderColor: "#ffce6b", background: "rgba(255,206,107,0.14)", color: "#ffce6b" }}>⭐ Recomendado</div></div>
      </Row>
      <Row tag={<Tag c="#ffce6b">CTA único</Tag>}>
        <div style={{ ...styles.ctrlBtn, ...styles.playBtn, padding: "11px", fontWeight: 800 }}>Comprar agora</div>
      </Row>
      <Row tag={<Tag c="#4ade80">Confiança</Tag>}>
        <span style={{ color: "#4ade80", fontSize: 12, fontWeight: 600 }}>🛡️ 30 dias de garantia</span>
      </Row>
    </div>
  );
}

function NeuroUX() {
  const [cat, setCat] = useState("all");
  const [showEx, setShowEx] = useState(true);
  const G = [
    // ATENÇÃO & HIERARQUIA
    { cat: "atencao", name: "Contraste & Saliência", what: "O olho vai primeiro pro que mais se destaca (cor, tamanho, movimento).", neuro: "noradrenalina", regiao: "occipital", mock: <div style={{ display: "flex", gap: 8, alignItems: "center" }}><div style={{ ...styles.uxPlan, fontSize: 11 }}>Cancelar</div><div style={{ ...styles.uxPlan, borderColor: "#ffce6b", background: "rgba(255,206,107,0.16)", color: "#ffce6b", fontWeight: 800 }}>Comprar</div></div>, boa: "Destaque UMA ação principal por tela.", alerta: "Esconder a opção 'sair/cancelar' em cinza apagado é dark pattern." },
    { cat: "atencao", name: "Lei de Hick", what: "Quanto mais opções, mais demora (e trava) a decisão.", neuro: null, regiao: "prefrontal", mock: <div style={styles.uxMock}>{["Mensal","Anual","Vitalício"].map((t)=><div key={t} style={{...styles.uxPlan, padding:"8px 10px", textAlign:"left", fontSize:12}}>{t}</div>)}</div>, boa: "Reduza escolhas; agrupe e destaque o recomendado.", alerta: "Menu com 30 itens sem hierarquia paralisa o usuário." },
    { cat: "atencao", name: "Lei de Fitts", what: "Alvos grandes e próximos são mais rápidos de tocar.", neuro: null, regiao: "cerebelo", mock: <div style={{...styles.ctrlBtn, ...styles.playBtn, padding:"14px", fontWeight:800, justifyContent:"center"}}>👍 Botão grande e fácil de tocar</div>, boa: "Botões importantes grandes e ao alcance do polegar.", alerta: "Botão minúsculo de 'fechar' que faz errar e clicar no anúncio." },
    { cat: "atencao", name: "Espaço em Branco", what: "O vazio guia o olhar e reduz a sensação de bagunça.", neuro: null, regiao: "occipital", mock: <div style={{...styles.uxMock, padding:"22px 14px", alignItems:"center"}}><b style={{color:"#fff"}}>Uma ideia por vez</b><span style={{fontSize:11, color:"#8aa0c4"}}>com espaço pra respirar</span></div>, boa: "Dê respiro: menos é mais legível.", alerta: "Tela lotada esconde o que importa." },
    { cat: "atencao", name: "Padrão F / Z", what: "Lemos telas em F (texto) ou Z (visual), não tudo.", neuro: null, regiao: "occipital", mock: <div style={styles.uxMock}><b style={{color:"#fff"}}>Título principal ⟵</b><div style={{height:7, width:"88%", borderRadius:99, background:"rgba(255,255,255,0.14)"}}/><div style={{height:7, width:"55%", borderRadius:99, background:"rgba(255,255,255,0.10)"}}/></div>, boa: "Ponha o essencial no topo e à esquerda.", alerta: "Enterrar a informação principal no rodapé." },
    // CONFIANÇA
    { cat: "confianca", name: "Prova Social", what: "Ver que outros aprovam reduz o risco percebido.", neuro: "ocitocina", regiao: "accumbens", mock: <div style={styles.uxMock}><span style={{ fontWeight: 700 }}>⭐ 4,9 · 12.482 compraram</span><span className="ux-pulse" style={{ fontSize: 11, color: "#4ade80" }}>● 37 vendo agora</span></div>, boa: "Use avaliações e números verdadeiros.", alerta: "Inventar depoimentos ou 'vendo agora' falso destrói a confiança." },
    { cat: "confianca", name: "Reversão de Risco", what: "Garantia e selos tiram o medo da decisão.", neuro: "gaba", regiao: "insula", mock: <div style={styles.uxMock}><span style={{ fontWeight: 700, color: "#4ade80" }}>🛡️ 30 dias de garantia</span><span style={{ fontSize: 11, color: "#8aa0c4" }}>devolução sem perguntas</span></div>, boa: "Ofereça garantia real e fácil de acionar.", alerta: "Garantia cheia de letras miúdas que ninguém consegue usar." },
    { cat: "confianca", name: "Transparência de Preço", what: "Custos claros desde o início geram confiança.", neuro: null, regiao: "prefrontal", mock: <div style={styles.uxMock}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#cbd6ea"}}><span>Produto</span><span>R$99</span></div><div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#cbd6ea"}}><span>Frete</span><span>Grátis</span></div><div style={{display:"flex",justifyContent:"space-between",fontWeight:800,color:"#fff",borderTop:"1px solid rgba(255,255,255,0.1)",paddingTop:5}}><span>Total</span><span>R$99</span></div></div>, boa: "Mostre o total cedo, sem surpresa.", alerta: "'Drip pricing': taxas que só aparecem no fim (dark pattern)." },
    { cat: "confianca", name: "Consistência (Halo)", what: "Visual coeso e caprichado faz tudo parecer mais confiável.", neuro: "dopamina", regiao: "amigdala", mock: <div style={{display:"flex",gap:8}}>{[1,2,3].map((k)=><div key={k} style={{...styles.uxPlan, padding:"9px 6px", fontSize:11}}>Botão</div>)}</div>, boa: "Mantenha padrão de cores, fontes e espaçamento.", alerta: "Um detalhe quebrado derruba a percepção do todo (efeito chifre)." },
    // AÇÃO & CONVERSÃO
    { cat: "acao", name: "CTA Único e Claro", what: "Uma chamada de ação óbvia converte mais que várias.", neuro: "dopamina", regiao: "prefrontal", mock: <div style={styles.uxMock}><div style={{...styles.ctrlBtn, ...styles.playBtn, padding:"12px", fontWeight:800, justifyContent:"center"}}>Começar grátis</div><span style={{fontSize:11, color:"#8aa0c4", textAlign:"center"}}>Já tenho conta</span></div>, boa: "Verbo + benefício ('Começar grátis').", alerta: "5 botões competindo confundem e travam." },
    { cat: "acao", name: "Affordance", what: "O elemento deve 'parecer' o que faz (clicável, arrastável).", neuro: null, regiao: "occipital", mock: <div style={{display:"flex", gap:12, alignItems:"center"}}><div style={{...styles.uxPlan, borderColor:"#ffce6b", background:"rgba(255,206,107,0.14)", color:"#ffce6b", fontWeight:800, boxShadow:"0 3px 0 rgba(0,0,0,0.45)"}}>Botão</div><span style={{color:"#7dd3fc", textDecoration:"underline", fontSize:12}}>e um link</span></div>, boa: "Botão parece botão; link parece link.", alerta: "Texto que parece clicável mas não é (ou o contrário)." },
    { cat: "acao", name: "Reduzir Fricção", what: "Cada campo/passo a mais derruba a conversão.", neuro: null, regiao: "prefrontal", mock: <div style={styles.uxMock}><div style={{padding:"9px 11px", borderRadius:9, border:"1px solid rgba(255,255,255,0.12)", color:"#8aa0c4", fontSize:12}}>seu@email.com</div><div style={{...styles.uxPlan, padding:"9px", fontSize:12}}>Entrar com Google</div></div>, boa: "Peça o mínimo; login social; autopreenchimento.", alerta: "Cadastro com 15 campos antes de ver valor." },
    { cat: "acao", name: "Defaults Inteligentes", what: "O que já vem marcado costuma ser aceito.", neuro: null, regiao: "ganglios", mock: <div style={{ display: "flex", gap: 8 }}><div style={styles.uxPlan}>Básico</div><div style={{ ...styles.uxPlan, borderColor: "#ffce6b", background: "rgba(255,206,107,0.12)" }}>⭐ Recomendado</div></div>, boa: "O padrão deve ser o melhor pro usuário.", alerta: "Pré-marcar seguro/assinatura que ele não pediu." },
    { cat: "acao", name: "Âncora de Preço", what: "Um preço de referência faz o final parecer barato.", neuro: null, regiao: "prefrontal", mock: <div style={styles.uxMock}><span style={{ color: "#8aa0c4", textDecoration: "line-through", fontSize: 15 }}>R$ 199</span><span style={{ color: "#ffce6b", fontWeight: 800, fontSize: 24 }}>R$ 99</span></div>, boa: "Âncora honesta (preço que existiu de verdade).", alerta: "'De/por' fantasma com preço que nunca foi praticado." },
    // ENGAJAMENTO
    { cat: "engajamento", name: "Barra de Progresso", what: "Ver-se perto da meta aumenta a vontade de concluir.", neuro: "dopamina", regiao: "accumbens", mock: <div style={styles.uxMock}><span style={{ fontSize: 12, color: "#cbd6ea" }}>Quase lá! 🎯</span><div style={{ height: 10, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}><div className="ux-progress" style={{ height: "100%", background: "linear-gradient(90deg,#e0a324,#ffd873)" }} /></div></div>, boa: "Mostre progresso e o quão perto falta.", alerta: "Barra falsa que nunca enche pra te manter preso." },
    { cat: "engajamento", name: "Loops Abertos (Zeigarnik)", what: "Tarefa inacabada incomoda até ser fechada.", neuro: "dopamina", regiao: "prefrontal", mock: <div style={styles.uxMock}><span style={{fontSize:12, color:"#cbd6ea"}}>Perfil 80% completo</span><div style={{height:8, borderRadius:99, background:"rgba(255,255,255,0.08)", overflow:"hidden"}}><div style={{height:"100%", width:"80%", background:"linear-gradient(90deg,#e0a324,#ffd873)"}}/></div><span style={{fontSize:11, color:"#8aa0c4"}}>☑ Nome  ☑ Foto  ☐ Bio</span></div>, boa: "'Perfil 80% completo' incentiva concluir.", alerta: "Criar ansiedade com pendências sem fim." },
    { cat: "engajamento", name: "Recompensa Variável", what: "Prêmio imprevisível é o que mais prende (e vicia).", neuro: "dopamina", regiao: "accumbens", mock: <div style={{...styles.uxMock, alignItems:"center"}}><span style={{fontSize:30}}>🎁</span><span style={{fontSize:12, color:"#ffce6b", fontWeight:700}}>Você ganhou uma surpresa!</span></div>, boa: "Surpresas pontuais que encantam.", alerta: "Mecânica de caça-níquel pra maximizar tempo de tela." },
    { cat: "engajamento", name: "Onboarding (IKEA)", what: "Quem configura/personaliza se apega mais ao produto.", neuro: "ocitocina", regiao: "accumbens", mock: <div style={styles.uxMock}><span style={{fontSize:12, color:"#cbd6ea"}}>Escolha seus temas:</span><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["Cérebro","Hábitos","Foco"].map((t,k)=><div key={t} style={{...styles.uxPlan, padding:"6px 10px", fontSize:11, ...(k<2?{borderColor:"#ffce6b",color:"#ffce6b",background:"rgba(255,206,107,0.12)"}:{})}}>{k<2?"✓ ":""}{t}</div>)}</div></div>, boa: "Faça o usuário construir algo logo no início.", alerta: "Trabalho à toa só pra criar falso apego." },
    // CARGA COGNITIVA
    { cat: "carga", name: "Chunking (7±2)", what: "A memória de trabalho segura poucos itens por vez.", neuro: null, regiao: "prefrontal", mock: <div style={{...styles.uxMock, alignItems:"center"}}><b style={{color:"#fff", fontSize:18, letterSpacing:1}}>(11) 99999-9999</b><span style={{fontSize:11, color:"#8aa0c4"}}>fácil em blocos, não 11999999999</span></div>, boa: "Agrupe (ex: telefone em blocos); passos curtos.", alerta: "Formulário gigante numa tela só." },
    { cat: "carga", name: "Reconhecer > Lembrar", what: "É mais fácil reconhecer opções do que lembrar de cor.", neuro: "acetilcolina", regiao: "hipocampo", mock: <div style={styles.uxMock}><div style={{padding:"8px 11px", borderRadius:9, border:"1px solid rgba(255,255,255,0.12)", color:"#cbd6ea", fontSize:12}}>🔍 dopa…</div><span style={{fontSize:11, color:"#8aa0c4"}}>↳ Dopamina · Dopamina e vício · Dopamina no foco</span></div>, boa: "Mostre opções, histórico e sugestões.", alerta: "Forçar decorar comandos ou códigos." },
    { cat: "carga", name: "Lei de Jakob", what: "O usuário espera que seu app funcione como os outros que já usa.", neuro: null, regiao: "hipocampo", mock: <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 4px"}}><span style={{fontSize:18}}>☰</span><b style={{color:"#fff", fontSize:13}}>Loja</b><span style={{fontSize:18}}>🔍</span><span style={{fontSize:18}}>🛒</span></div>, boa: "Use padrões conhecidos (carrinho, menu ☰).", alerta: "Reinventar o básico só pra ser 'diferente'." },
    { cat: "carga", name: "Feedback Imediato", what: "Toda ação precisa de resposta visível na hora.", neuro: "dopamina", regiao: "cerebelo", mock: <div style={{display:"flex", gap:8, flexWrap:"wrap"}}><div style={{...styles.uxPlan, fontSize:11}}>⏳ Enviando…</div><div style={{...styles.uxPlan, fontSize:11, borderColor:"#4ade80", color:"#4ade80", background:"rgba(74,222,128,0.12)"}}>✓ Enviado</div></div>, boa: "Estados de loading, sucesso e erro claros.", alerta: "Botão que não responde e gera cliques repetidos." },
    // URGÊNCIA (cuidado)
    { cat: "urgencia", name: "Escassez & Urgência", what: "Tempo/estoque baixos disparam o medo de perder.", neuro: "cortisol", regiao: "amigdala", mock: <div style={styles.uxMock}><span style={{ color: "#fb7185", fontWeight: 700 }}>⏳ Acaba em <ScarcityTimer /></span><span style={{ fontSize: 11, color: "#8aa0c4" }}>restam 3 unidades</span></div>, boa: "Só comunique escassez que é real.", alerta: "Cronômetro que reinicia ao recarregar = enganação." },
    { cat: "urgencia", name: "Confirmshaming", what: "Envergonhar quem recusa pra forçar o 'sim'.", neuro: "cortisol", regiao: "insula", mock: <div style={{...styles.uxMock, alignItems:"center"}}><div style={{...styles.uxPlan, borderColor:"#ffce6b", background:"rgba(255,206,107,0.14)", color:"#ffce6b", fontWeight:800, width:"100%", textAlign:"center"}}>Quero economizar!</div><span style={{fontSize:11, color:"#fb7185", textDecoration:"underline"}}>Não, prefiro pagar caro 😞</span></div>, boa: "Deixe o 'não' tão digno quanto o 'sim'.", alerta: "'Não, prefiro continuar pobre' como botão de recusa (dark pattern)." },
    { cat: "urgencia", name: "Roach Motel", what: "Fácil entrar, difícil sair (assinar x cancelar).", neuro: "cortisol", regiao: "insula", mock: <div style={{display:"flex", gap:8, alignItems:"center"}}><div style={{...styles.uxPlan, borderColor:"#4ade80", color:"#4ade80", background:"rgba(74,222,128,0.12)", fontWeight:800}}>Assinar ✓</div><span style={{fontSize:16}}>→</span><span style={{fontSize:11, color:"#fb7185"}}>Cancelar: 5 telas…</span></div>, boa: "Cancelar deve ser tão fácil quanto assinar.", alerta: "Esconder o cancelamento em labirintos de telas." },
  ];
  const list = cat === "all" ? G : G.filter((g) => g.cat === cat);
  return (
    <div className="fade">
      <h2 style={styles.h2}>Anatomia de uma Tela</h2>
      <p style={styles.p}>Um guia de UI/UX: os padrões que movem o comportamento, o hormônio que cada um aciona, a boa prática e o alerta de quando vira manipulação (dark pattern).</p>

      <button onClick={() => setShowEx((x) => !x)} style={{ ...styles.miniBtn, marginBottom: 10 }}>{showEx ? "▾" : "▸"} Ver na prática: uma tela real</button>
      {showEx && (
        <div className="fade" style={{ marginBottom: 16 }}>
          <p style={{ ...styles.pMuted, marginBottom: 8 }}>Uma única página de produto costuma empilhar vários gatilhos ao mesmo tempo. Repare:</p>
          <UXExampleScreen />
        </div>
      )}

      <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 6, marginBottom: 12 }}>
        <button onClick={() => setCat("all")} style={{ ...styles.uxCatBtn, borderColor: cat === "all" ? "#ffce6b" : "rgba(255,255,255,0.12)", color: cat === "all" ? "#ffce6b" : "#9fb2d4" }}>Todos</button>
        {Object.entries(UX_CATS).map(([k, v]) => (
          <button key={k} onClick={() => setCat(k)} style={{ ...styles.uxCatBtn, borderColor: cat === k ? v.color : "rgba(255,255,255,0.12)", color: cat === k ? v.color : "#9fb2d4", background: cat === k ? v.color + "16" : "transparent" }}>{v.label}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {list.map((p, i) => {
          const c = UX_CATS[p.cat];
          return (
            <div key={i} style={{ ...styles.uxCard, borderColor: c.color + "33" }}>
              {p.mock && <div style={styles.uxMockWrap}>{p.mock}</div>}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <b style={{ color: "#fff", fontSize: 14.5, flex: 1 }}>{p.name}</b>
                <span style={{ fontSize: 10, fontWeight: 700, color: c.color, border: "1px solid " + c.color + "55", borderRadius: 99, padding: "2px 8px" }}>{c.label}</span>
              </div>
              <p style={{ fontSize: 13, color: "#dbe4f3", margin: "6px 0 0", lineHeight: 1.5 }}>{p.what}</p>
              <NeuroTag neuro={p.neuro} regiao={p.regiao} label="Ativa" />
              <p style={{ fontSize: 12.5, color: "#9be8b4", margin: "9px 0 0" }}>✅ <b>Boa prática:</b> {p.boa}</p>
              <p style={{ fontSize: 12.5, color: "#fca5a5", margin: "4px 0 0" }}>⚠️ <b>Alerta:</b> {p.alerta}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Simulador() {
  const { addXp } = useGame();
  const [sc, setSc] = useState(null);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);
  const awarded = useRef({});
  useBackHandler(sc !== null, () => setSc(null));

  // escolha de cenário
  if (!sc) {
    return (
      <div className="fade">
        <h2 style={styles.h2}>Simulador de Decisão</h2>
        <p style={styles.p}>Viva situações reais e descubra, passo a passo, quais gatilhos agem em você — e qual hormônio cada um aciona. Escolha um cenário:</p>
        {SIM_SCENARIOS.map((s) => (
          <button key={s.id} onClick={() => { setSc(s); setStep(0); setPicked(null); setDone(false); }} style={styles.gameCard}>
            <span style={{ fontSize: 28 }}>{s.emoji}</span>
            <span style={{ flex: 1 }}><b style={{ display: "block", color: "#e6eefc", fontSize: 15 }}>{s.title}</b><span style={{ fontSize: 12.5, color: "#8aa0c4" }}>{s.steps.length} decisões</span></span>
            <ChevronRight size={18} style={{ color: "#ffce6b" }} />
          </button>
        ))}
      </div>
    );
  }

  if (done) {
    return (
      <div className="fade" style={{ textAlign: "center", padding: "10px 0" }}>
        <span style={{ fontSize: 40 }}>{sc.emoji}</span>
        <h2 style={styles.h2}>Gatilhos que agiram em você</h2>
        <p style={{ ...styles.pMuted, marginBottom: 12 }}>{sc.title}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "12px 0", textAlign: "left" }}>
          {sc.steps.map((s, i) => (
            <div key={i} style={styles.uxCard}>
              <b style={{ color: "#ffce6b" }}>{s.trigger}</b>
              <p style={{ fontSize: 12.5, color: "#cbd6ea", margin: "4px 0 0" }}>{s.note}</p>
              <NeuroTag neuro={s.neuro} regiao={s.regiao} label="Ativa" />
            </div>
          ))}
        </div>
        <p style={styles.pMuted}>Perceber o gatilho no momento já tira metade do poder dele. 🧠</p>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button onClick={() => { setStep(0); setPicked(null); setDone(false); }} style={{ ...styles.ctrlBtn, flex: 1 }}><RotateCcw size={15} /> Repetir</button>
          <button onClick={() => setSc(null)} style={{ ...styles.ctrlBtn, ...styles.playBtn, flex: 1 }}>Outro cenário</button>
        </div>
      </div>
    );
  }

  const s = sc.steps[step];
  const advance = () => {
    if (step + 1 >= sc.steps.length) { setDone(true); if (!awarded.current[sc.id]) { awarded.current[sc.id] = true; addXp(15, "Simulador!"); } }
    else { setStep(step + 1); setPicked(null); }
  };

  return (
    <div className="fade">
      <button onClick={() => setSc(null)} style={styles.backBtn}><ArrowLeft size={16} /> Cenários</button>
      <h2 style={styles.h2}>{sc.emoji} {sc.title}</h2>
      {step === 0 && picked === null && <p style={styles.p}>{sc.intro}</p>}
      <div style={styles.progress}>{sc.steps.map((_, i) => <span key={i} style={{ height: 5, borderRadius: 99, background: i < step ? "#ffce6b" : i === step ? "#fb7185" : "rgba(255,255,255,0.1)", flex: 1 }} />)}</div>
      <div style={styles.s12box}>
        <p style={{ ...styles.lessonPara, fontWeight: 600, color: "#e6eefc" }}>{s.text}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {s.a.map((opt, idx) => (
            <button key={idx} onClick={() => picked === null && setPicked(idx)} disabled={picked !== null}
              style={{ ...styles.quizOpt, borderColor: picked === idx ? "#ffce6b" : "rgba(255,255,255,0.10)", background: picked === idx ? "rgba(255,206,107,0.10)" : "rgba(255,255,255,0.03)" }}>{opt}</button>
          ))}
        </div>
        {picked !== null && (
          <div className="fade" style={{ ...styles.whyBox, marginTop: 12, borderColor: "#ffce6b55", background: "rgba(255,206,107,0.10)" }}>
            <b style={{ color: "#ffce6b" }}>Gatilho: {s.trigger}</b>
            <p style={{ ...styles.lessonPara, margin: "5px 0 0", fontSize: 13.5 }}>{s.note}</p>
            <NeuroTag neuro={s.neuro} regiao={s.regiao} label="Ativa" />
            <button onClick={advance} style={{ ...styles.ctrlBtn, ...styles.playBtn, width: "100%", marginTop: 10 }}>{step + 1 >= sc.steps.length ? "Ver resumo" : "Continuar"} <ChevronRight size={16} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

// cérebro que acende conforme o domínio
function BrainGlow({ mastery }) {
  const ids = ["prefrontal", "accumbens", "amigdala", "hipotalamo", "hipocampo", "talamo", "insula", "tronco", "cerebelo"];
  const pct = (id) => { const m = mastery[id]; return m && m.t > 0 ? m.r / m.t : 0; };
  return (
    <div style={{ marginTop: 22 }}>
      <p style={styles.label}>🧠 Seu cérebro acende</p>
      <p style={{ ...styles.pMuted, marginTop: -2, marginBottom: 6 }}>Cada região brilha conforme você domina o conteúdo dela.</p>
      <div style={styles.brainWrap}>
        <svg viewBox="0 0 470 430" style={{ width: "100%", height: "auto", display: "block" }}>
          <path d="M95 175 C95 110 160 70 235 78 C300 72 345 110 350 160 C385 158 415 185 410 225 C420 248 405 280 375 282 C372 312 345 332 312 326 C300 348 270 356 245 344 C220 356 188 352 172 330 C140 336 108 318 105 285 C78 282 62 252 75 226 C62 205 72 182 95 175 Z" fill="rgba(255,255,255,0.02)" stroke="#3a3a42" strokeWidth="2" />
          {ids.map((id) => { const r = REGIONS[id]; const v = pct(id); return (
            <g key={id}>
              {v > 0 && <circle cx={r.x} cy={r.y} r={r.r + 9} fill="#ffce6b" opacity={0.12 + v * 0.4} className="halo" />}
              <circle cx={r.x} cy={r.y} r={r.r} fill={v > 0 ? "#ffce6b" : "#1e1e23"} fillOpacity={v > 0 ? 0.25 + v * 0.6 : 1} stroke={v > 0 ? "#ffd873" : "#4c4c54"} strokeWidth="1.5" />
            </g>
          ); })}
        </svg>
      </div>
    </div>
  );
}

// =========================================================================
//  PERFIL
// =========================================================================

function Perfil() {
  const { progress, badges, reset } = useGame();
  const lvl = levelOf(progress.xp);
  const xpInLevel = progress.xp % XP_PER_LEVEL;
  const doneCount = LESSON_ORDER.filter((id) => progress.lessons[id]).length;
  const earnedCount = Object.keys(badges).length;
  const todayXp = progress.dailyDate === todayStr() ? (progress.dailyXp || 0) : 0;
  const dailyDone = todayXp >= DAILY_GOAL;

  return (
    <div className="fade">
      <div style={styles.profileCard}>
        <div style={styles.lvlRing}>
          <span style={{ fontSize: 30, fontWeight: 700, fontFamily: "Fraunces, serif", color: "#ffce6b" }}>{lvl}</span>
          <span style={{ fontSize: 9, color: "#8aa0c4", letterSpacing: 1 }}>NÍVEL</span>
        </div>
        <h2 style={{ ...styles.h2, marginTop: 10 }}>{titleOf(lvl)}</h2>
        <p style={styles.pMuted}>{progress.xp} XP · faltam {XP_PER_LEVEL - xpInLevel} pro nível {lvl + 1}</p>
        <div style={{ ...styles.xpBar, marginTop: 10 }}><div style={{ ...styles.xpFill, width: `${xpInLevel}%` }} /></div>
      </div>

      <div style={styles.streakCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 30 }}>🔥</span>
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 17, color: "#e6eefc" }}>{progress.streak || 0} {progress.streak === 1 ? "dia" : "dias"} de ofensiva</b>
            <span style={{ display: "block", fontSize: 12, color: "#8aa0c4" }}>
              {dailyDone ? "Meta de hoje concluída! 🎉" : `Meta de hoje: ${Math.min(todayXp, DAILY_GOAL)}/${DAILY_GOAL} XP`}
            </span>
          </div>
        </div>
        <div style={{ ...styles.xpBar, marginTop: 10, background: "#2a1c0e" }}>
          <div style={{ height: "100%", borderRadius: 99, width: `${Math.min(100, (todayXp / DAILY_GOAL) * 100)}%`, background: "linear-gradient(90deg,#f97316,#ffb627)", transition: "width .5s" }} />
        </div>
      </div>

      <div style={styles.statRow}>
        <Stat n={doneCount + "/" + LESSON_ORDER.length} l="Lições" />
        <Stat n={earnedCount + "/" + BADGES.length} l="Conquistas" />
        <Stat n={Object.keys(progress.stats.seen || {}).length + "/" + SCENARIOS.length} l="Cenários" />
      </div>

      <p style={styles.label}>Conquistas</p>
      <div style={styles.badgeGrid}>
        {BADGES.map((b) => {
          const got = !!badges[b.id];
          return (
            <div key={b.id} style={{ ...styles.badge, opacity: got ? 1 : 0.45, borderColor: got ? "#ffb62755" : "#2c3e60", background: got ? "#ffb6270f" : "#10192c" }}>
              <span style={{ fontSize: 28, filter: got ? "none" : "grayscale(1)" }}>{got ? b.emoji : "🔒"}</span>
              <b style={{ fontSize: 12, color: got ? "#e6eefc" : "#8aa0c4", marginTop: 4 }}>{b.name}</b>
              <span style={{ fontSize: 10.5, color: "#7e93b8", lineHeight: 1.3 }}>{b.desc}</span>
            </div>
          );
        })}
      </div>

      <BrainGlow mastery={progress.mastery || {}} />

      <MasteryMap mastery={progress.mastery || {}} />

      <Desafios />

      <button onClick={() => { if (confirm("Apagar todo o progresso? Isso não pode ser desfeito.")) reset(); }} style={styles.resetBtn}>
        Reiniciar progresso
      </button>
    </div>
  );
}

function MasteryMap({ mastery }) {
  const rows = MASTERY_CONCEPTS.map((id) => {
    const m = mastery[id]; const pct = m && m.t > 0 ? Math.round((m.r / m.t) * 100) : null;
    return { id, pct, t: m ? m.t : 0 };
  });
  const tested = rows.filter((r) => r.pct !== null).sort((a, b) => a.pct - b.pct);
  const untested = rows.filter((r) => r.pct === null);
  const weak = tested.filter((r) => r.pct < 60).slice(0, 3);

  return (
    <div style={{ marginTop: 22 }}>
      <p style={styles.label}>📊 Mapa de domínio</p>
      {tested.length === 0 ? (
        <p style={styles.pMuted}>Responda flashcards, faça predições nos cenários ou o treino misto pra medir seu domínio de cada conceito.</p>
      ) : (
        <>
          {weak.length > 0 && <p style={{ ...styles.pMuted, marginBottom: 8 }}>🎯 Foque em: <b style={{ color: "#fb923c" }}>{weak.map((w) => conceptName(w.id)).join(", ")}</b></p>}
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {tested.map((r) => {
              const col = r.pct >= 75 ? "#4ade80" : r.pct >= 50 ? "#ffb627" : "#f87171";
              return (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ width: 110, fontSize: 11.5, color: "#c2d0e8", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conceptName(r.id)}</span>
                  <div style={styles.meterTrack}><div style={{ height: "100%", borderRadius: 99, width: `${r.pct}%`, background: col, transition: "width .4s" }} /></div>
                  <span style={{ width: 34, textAlign: "right", fontSize: 11.5, fontWeight: 700, color: col }}>{r.pct}%</span>
                </div>
              );
            })}
          </div>
          {untested.length > 0 && <p style={{ ...styles.pMuted, marginTop: 8, fontSize: 11.5 }}>Ainda não testados: {untested.map((u) => conceptName(u.id)).join(", ")}.</p>}
        </>
      )}
    </div>
  );
}

function Desafios() {
  const { progress, toggleChallenge, addXp } = useGame();
  const ch = progress.challenges || {};
  const tap = (id) => {
    const wasDone = !!ch[id];
    toggleChallenge(id);
    if (!wasDone) addXp(15, "Desafio!");
  };
  const doneN = DESAFIOS.filter((d) => ch[d.id]).length;
  return (
    <div style={{ marginTop: 22 }}>
      <p style={styles.label}>🎯 Desafios da vida real ({doneN}/{DESAFIOS.length})</p>
      <p style={{ ...styles.pMuted, marginTop: -2, marginBottom: 8 }}>Usar o conhecimento é o que fixa de verdade. Marque quando fizer:</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {DESAFIOS.map((d) => {
          const done = !!ch[d.id];
          return (
            <button key={d.id} onClick={() => tap(d.id)} style={{ ...styles.challengeRow, borderColor: done ? "#4ade8055" : "#233350", background: done ? "#4ade8012" : "#10192c" }}>
              <span style={{ fontSize: 20 }}>{d.emoji}</span>
              <span style={{ flex: 1, fontSize: 13, color: done ? "#9be8b4" : "#cfe0f7", lineHeight: 1.35, textAlign: "left" }}>{d.text}</span>
              <span style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${done ? "#4ade80" : "#4c4c54"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{done && <Check size={14} style={{ color: "#4ade80" }} />}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ n, l }) {
  return <div style={styles.statBox}><b style={{ fontSize: 20, color: "#ffce6b", fontFamily: "Fraunces, serif" }}>{n}</b><span style={{ fontSize: 11, color: "#8aa0c4" }}>{l}</span></div>;
}

// =========================================================================
//  ESTILOS
// =========================================================================

const GLASS = "rgba(255,255,255,0.055)";
const GLASS_SOFT = "rgba(255,255,255,0.035)";
const GBORDER = "1px solid rgba(255,255,255,0.10)";
const GBLUR = "blur(16px)";
const GSHADOW = "0 10px 34px rgba(0,0,0,0.45)";
const ACCENT = "linear-gradient(135deg,#ffd873,#e0a324)";

const styles = {
  root: { minHeight: "100vh", position: "relative", overflowX: "hidden", background: "#08080a", color: "#e8edf7", fontFamily: "Sora, system-ui, sans-serif", paddingBottom: 76 },
  header: { position: "sticky", top: 0, zIndex: 20, background: "rgba(10,10,12,0.6)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "12px 16px 10px" },
  logoRow: { display: "flex", alignItems: "center", gap: 10, maxWidth: 880, margin: "0 auto" },
  logo: { width: 38, height: 38, borderRadius: 12, background: GLASS, border: GBORDER, backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)" },
  h1: { fontFamily: "Fraunces, serif", fontSize: 20, fontWeight: 600, margin: 0, lineHeight: 1, letterSpacing: "-0.5px" },
  lvlTitle: { fontSize: 11.5, color: "#8ea0bd" },
  xpChip: { display: "flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 99, background: GLASS, border: GBORDER, backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR, fontSize: 13, fontWeight: 700, color: "#ffce6b" },
  xpBar: { height: 6, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden", maxWidth: 880, margin: "9px auto 0" },
  xpFill: { height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#e0a324,#ffd873)", transition: "width .5s ease", boxShadow: "0 0 12px rgba(255,200,90,0.5)" },
  main: { maxWidth: 880, margin: "0 auto", padding: "16px 14px", position: "relative", zIndex: 1 },
  nav: { position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20, display: "flex", background: "rgba(10,10,12,0.65)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)", borderTop: "1px solid rgba(255,255,255,0.07)", padding: "6px 0 8px" },
  navBtn: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", fontFamily: "Sora, sans-serif", padding: "4px 0" },
  navBadge: { position: "absolute", top: -6, right: -10, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 99, background: "#ffce6b", color: "#1a1200", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" },
  h2: { fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 600, margin: "0 0 4px", letterSpacing: "-0.3px", color: "#f1f5fc" },
  p: { fontSize: 14, lineHeight: 1.6, color: "#c4d0e4", margin: "8px 0" },
  pMuted: { fontSize: 12.5, color: "#8ea0bd", margin: "2px 0" },
  trilhaHead: { marginBottom: 18 },
  modHead: { display: "flex", alignItems: "center", gap: 11, padding: "12px 14px", borderRadius: 16, border: "1px solid", marginBottom: 14, backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR },
  path: { display: "flex", flexDirection: "column", gap: 12, padding: "0 4px" },
  lessonNode: { width: "62%", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "16px 12px", borderRadius: 18, border: "2px solid", fontFamily: "Sora, sans-serif", transition: "all .2s", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: GSHADOW },
  lessonTitle: { fontSize: 12.5, fontWeight: 600, color: "#e3ebf8", textAlign: "center", lineHeight: 1.25 },
  backBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 12, border: GBORDER, background: GLASS, backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR, color: "#aebcd4", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Sora, sans-serif", marginBottom: 12 },
  lessonPara: { fontSize: 14.5, lineHeight: 1.65, color: "#cbd6ea", margin: "0 0 12px" },
  lessonVisual: { background: GLASS_SOFT, border: GBORDER, borderRadius: 18, padding: "10px", marginBottom: 14, backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR, boxShadow: GSHADOW },
  keyBox: { padding: "14px 16px", borderRadius: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.16)", marginBottom: 16, backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR },
  keyLabel: { fontSize: 10.5, letterSpacing: 1, fontWeight: 800, color: "#ffce6b" },
  quizBox: { marginTop: 16, padding: "16px", borderRadius: 18, background: GLASS_SOFT, border: GBORDER, backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR },
  quizLabel: { fontSize: 12, fontWeight: 700, color: "#ffce6b", letterSpacing: 0.3 },
  quizOpt: { padding: "13px 14px", borderRadius: 13, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "Sora, sans-serif", textAlign: "left", transition: "all .15s" },
  whyBox: { marginTop: 12, padding: "12px 14px", borderRadius: 13, border: "1px solid" },
  panel: { background: GLASS, border: GBORDER, borderRadius: 22, padding: "18px 16px", position: "relative", marginTop: 14, backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR, boxShadow: GSHADOW },
  brainWrap: { background: GLASS, border: GBORDER, borderRadius: 22, padding: "10px 8px 6px", position: "relative", backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR, boxShadow: GSHADOW },
  hint: { textAlign: "center", color: "#7e90ad", fontSize: 13, margin: "0 0 8px", animation: "blink 2s infinite" },
  role: { fontSize: 13, color: "#ffce6b", margin: "0 0 8px", fontWeight: 600 },
  label: { fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.8px", color: "#7e90ad", fontWeight: 700, margin: "16px 0 8px" },
  chips: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: { display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "Sora, sans-serif", transition: "all .18s" },
  regChip: { display: "inline-block", padding: "6px 11px", borderRadius: 9, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.20)", color: "#e2e4ea", fontSize: 12.5, fontWeight: 600 },
  factBox: { marginTop: 14, padding: "12px 14px", borderRadius: 13, background: "rgba(255,255,255,0.04)", border: GBORDER, backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR },
  factLabel: { fontSize: 12, fontWeight: 700, color: "#cfd2da" },
  hiLo: { display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" },
  hiLoBox: { flex: "1 1 150px", minWidth: 140, padding: "11px 13px", borderRadius: 13, border: "1px solid" },
  hiLoTag: { fontSize: 11.5, fontWeight: 700, display: "block", marginBottom: 5 },
  hiLoText: { fontSize: 12.8, lineHeight: 1.5, color: "#c4d0e4", margin: 0 },
  tagPill: { display: "inline-block", padding: "4px 10px", borderRadius: 99, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.20)", color: "#ffce6b", fontSize: 11.5, fontWeight: 700, marginBottom: 8 },
  close: { position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.06)", border: GBORDER, borderRadius: 9, color: "#aebcd4", padding: 6, cursor: "pointer", display: "flex" },
  legend: { display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" },
  legItem: { display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "#aebcd4" },
  scCard: { display: "flex", alignItems: "center", gap: 11, textAlign: "left", padding: "13px", borderRadius: 16, border: GBORDER, background: GLASS, cursor: "pointer", fontFamily: "Sora, sans-serif", transition: "all .18s", backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR },
  gameCard: { display: "flex", alignItems: "center", gap: 12, textAlign: "left", padding: "16px", borderRadius: 18, border: GBORDER, background: GLASS, cursor: "pointer", fontFamily: "Sora, sans-serif", width: "100%", marginTop: 10, backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR, boxShadow: GSHADOW },
  progress: { display: "flex", gap: 5, margin: "14px 0 16px" },
  stepBox: { border: "1px solid", borderRadius: 16, padding: "16px", transition: "all .3s", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" },
  neuroInfo: { borderRadius: 12, border: "1px solid", padding: "10px 12px", marginTop: 2 },
  bodyMeters: { marginTop: 11, padding: "11px 13px", borderRadius: 13, background: "rgba(255,255,255,0.04)", border: GBORDER },
  bodyTitle: { fontSize: 12, fontWeight: 700, color: "#cfd2da" },
  predictBox: { marginTop: 10, padding: "16px", borderRadius: 18, background: "rgba(124,90,200,0.12)", border: "1px solid rgba(167,139,250,0.32)", backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR },
  tutorQ: { padding: "14px", borderRadius: 14, background: GLASS_SOFT, border: GBORDER, marginBottom: 12, backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR },
  textarea: { width: "100%", padding: "12px 14px", borderRadius: 13, border: GBORDER, background: "rgba(255,255,255,0.03)", color: "#e8edf7", fontSize: 14, fontFamily: "Sora, sans-serif", resize: "vertical", outline: "none", lineHeight: 1.5 },
  tutorFb: { marginTop: 14, padding: "14px 16px", borderRadius: 14, background: "rgba(74,222,128,0.10)", border: "1px solid rgba(74,222,128,0.30)", backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR },
  challengeRow: { display: "flex", alignItems: "center", gap: 11, padding: "12px 13px", borderRadius: 14, border: "1px solid", cursor: "pointer", fontFamily: "Sora, sans-serif", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" },
  graphDetail: { marginTop: 12, padding: "16px", borderRadius: 18, background: GLASS, border: GBORDER, backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR, boxShadow: GSHADOW },
  graphTitle: { fontFamily: "Fraunces, serif", fontSize: 19, fontWeight: 600, margin: "6px 0 0", color: "#f1f5fc" },
  graphChemRow: { display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 12, border: GBORDER, background: "rgba(255,255,255,0.03)" },
  meterTrack: { flex: 1, height: 11, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" },
  stepHead: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 12 },
  controls: { display: "flex", gap: 8, marginTop: 18, alignItems: "center" },
  ctrlBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px 14px", borderRadius: 13, border: GBORDER, background: GLASS, backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR, color: "#d4e0f4", fontWeight: 600, fontSize: 13.5, cursor: "pointer", fontFamily: "Sora, sans-serif" },
  playBtn: { flex: 1, background: ACCENT, border: "1px solid rgba(255,255,255,0.18)", color: "#241a02", boxShadow: "0 6px 22px rgba(224,163,36,0.42)" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  miniBtn: { display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 10, border: GBORDER, background: GLASS, backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR, color: "#aebcd4", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Sora, sans-serif" },
  flashcard: { width: "100%", minHeight: 200, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", padding: "26px 20px", borderRadius: 20, border: GBORDER, background: GLASS, cursor: "pointer", fontFamily: "Sora, sans-serif", transition: "all .25s", backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR, boxShadow: GSHADOW },
  flashcardBack: { border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.07)" },
  cardHint: { fontSize: 11, letterSpacing: "1px", color: "#7e90ad", fontWeight: 700, marginBottom: 12 },
  cardQ: { fontSize: 18, lineHeight: 1.45, color: "#eef3fb", fontWeight: 500, margin: 0, fontFamily: "Fraunces, serif" },
  cardA: { fontSize: 24, lineHeight: 1.2, color: "#ffce6b", fontWeight: 600, margin: "0 0 10px", fontFamily: "Fraunces, serif" },
  cardExtra: { fontSize: 13.5, lineHeight: 1.55, color: "#b3c0d8", margin: 0 },
  judgeBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "13px", borderRadius: 13, border: "1px solid", background: "rgba(255,255,255,0.03)", fontWeight: 700, fontSize: 14.5, cursor: "pointer", fontFamily: "Sora, sans-serif", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" },
  tally: { display: "flex", justifyContent: "center", gap: 20, marginTop: 14, fontSize: 14, fontWeight: 700 },
  gameGrid: { display: "flex", gap: 10, marginTop: 6 },
  gameCol: { flex: 1, display: "flex", flexDirection: "column", gap: 9 },
  gameItem: { padding: "13px 8px", borderRadius: 12, border: "1px solid", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "Sora, sans-serif", transition: "all .15s", textAlign: "center", lineHeight: 1.25, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" },
  profileCard: { textAlign: "center", padding: "20px", borderRadius: 22, background: GLASS, border: GBORDER, backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR, boxShadow: GSHADOW },
  lvlRing: { width: 84, height: 84, borderRadius: 99, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.05)", border: "3px solid rgba(255,206,107,0.55)", boxShadow: "0 0 28px rgba(255,200,90,0.30)" },
  statRow: { display: "flex", gap: 10, margin: "16px 0" },
  statBox: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "14px 8px", borderRadius: 16, background: GLASS, border: GBORDER, backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR },
  badgeGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 },
  badge: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 2, padding: "14px 8px", borderRadius: 16, border: "1px solid", transition: "all .2s", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" },
  resetBtn: { width: "100%", marginTop: 22, padding: "11px", borderRadius: 12, border: "1px solid rgba(220,120,140,0.25)", background: "rgba(220,120,140,0.06)", color: "#d68a9a", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "Sora, sans-serif" },
  toast: { position: "fixed", bottom: 88, left: "50%", transform: "translateX(-50%)", zIndex: 50, display: "flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 99, background: "rgba(255,206,107,0.16)", border: "1px solid rgba(255,206,107,0.45)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", color: "#fff1d6", fontWeight: 700, fontSize: 14, boxShadow: "0 10px 30px rgba(224,163,36,0.30)" },
  segment: { display: "flex", gap: 5, background: GLASS, padding: 5, borderRadius: 15, border: GBORDER, marginBottom: 14, backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR },
  segBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "9px 4px", border: "none", borderRadius: 11, background: "transparent", color: "#9aacc6", fontWeight: 600, fontSize: 12.5, cursor: "pointer", fontFamily: "Sora, sans-serif" },
  segActive: { background: ACCENT, color: "#241a02", boxShadow: "0 4px 16px rgba(224,163,36,0.42)" },
  speakBtn: { display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 9, border: GBORDER, background: GLASS, color: "#ffce6b", cursor: "pointer", flexShrink: 0 },
  searchWrap: { display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 12, border: GBORDER, background: "rgba(255,255,255,0.03)", marginBottom: 10 },
  searchInput: { flex: 1, background: "transparent", border: "none", outline: "none", color: "#e8edf7", fontSize: 14, fontFamily: "Sora, sans-serif" },
  searchClear: { background: "none", border: "none", color: "#7e90ad", cursor: "pointer", display: "flex", padding: 0 },
  dueBadge: { minWidth: 22, height: 22, padding: "0 6px", borderRadius: 99, background: "#ffce6b", color: "#1a1200", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" },
  mitoCard: { padding: "22px 18px", borderRadius: 18, background: "rgba(124,90,200,0.12)", border: "1px solid rgba(167,139,250,0.30)", textAlign: "center", marginTop: 6, backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR },
  cert: { position: "relative", padding: "26px 20px", borderRadius: 20, background: "rgba(255,206,107,0.10)", border: "1px solid rgba(255,206,107,0.35)", boxShadow: "0 0 34px rgba(255,206,107,0.18)", display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden", backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR },
  certKicker: { fontSize: 11, letterSpacing: 3, color: "#ffce6b", fontWeight: 700, marginTop: 8 },
  certSeal: { position: "absolute", right: 14, bottom: 10, fontSize: 40, opacity: 0.22 },
  streakCard: { padding: "14px 16px", borderRadius: 18, background: "rgba(249,115,22,0.10)", border: "1px solid rgba(249,115,22,0.28)", margin: "14px 0", backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR },
  balBars: { display: "flex", flexDirection: "column", gap: 8, marginTop: 6 },
  balRow: { display: "flex", alignItems: "center", gap: 10 },
  balTrack: { flex: 1, height: 14, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" },
  balFill: { height: "100%", borderRadius: 99, transition: "width .15s ease" },
  slider: { width: "100%", marginTop: 18, accentColor: "#ffce6b" },
  catChip: { display: "inline-flex", alignItems: "center", padding: "6px 11px", borderRadius: 99, border: "1px solid", background: "transparent", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Sora, sans-serif" },
  biasFace: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "20px 16px", borderRadius: 20, border: "1px solid", boxShadow: GSHADOW },
  catTag: { padding: "4px 11px", borderRadius: 99, border: "1px solid", fontSize: 11, fontWeight: 700 },
  biasRow: { display: "flex", gap: 9, marginTop: 11, fontSize: 12.8, color: "#c8d4ea", lineHeight: 1.45, alignItems: "flex-start" },
  biasIco: { fontSize: 15, flexShrink: 0 },
  persFace: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 4, padding: "14px", borderRadius: 16, border: GBORDER },
  s12box: { padding: "16px", borderRadius: 18, background: GLASS, border: GBORDER, backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR, marginTop: 8, boxShadow: GSHADOW },
  stroopBtn: { padding: "14px 8px", borderRadius: 12, border: "2px solid", background: "rgba(255,255,255,0.04)", color: "#e8edf7", fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "Sora, sans-serif" },
  uxCard: { padding: "14px", borderRadius: 16, background: GLASS, border: GBORDER, backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR },
  uxMockWrap: { padding: "14px", borderRadius: 12, background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 10 },
  uxMock: { display: "flex", flexDirection: "column", gap: 5 },
  uxPlan: { flex: 1, padding: "12px 8px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)", textAlign: "center", fontSize: 12.5, fontWeight: 600, color: "#cbd6ea" },
  biasCard: { padding: "18px 16px", borderRadius: 20, background: GLASS, border: "1px solid", backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR, boxShadow: GSHADOW },
  biasBlock: { marginTop: 11, padding: "11px 13px", borderRadius: 13, border: "1px solid" },
  biasBlockLbl: { fontSize: 11, fontWeight: 800, letterSpacing: 0.4, color: "#aebcd4", display: "block", marginBottom: 5 },
  biasBlockTxt: { fontSize: 13, color: "#dbe4f3", lineHeight: 1.5, margin: 0 },
  exList: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 },
  exItem: { fontSize: 13, color: "#dbe4f3", lineHeight: 1.45, display: "flex", alignItems: "flex-start" },
  persHead: { display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "14px 15px", background: "none", border: "none", cursor: "pointer", fontFamily: "Sora, sans-serif" },
  backHint: { position: "fixed", top: "50%", left: 8, zIndex: 60, transform: "translateY(-50%)", width: 40, height: 40, borderRadius: 99, background: "rgba(255,206,107,0.18)", border: "1px solid rgba(255,206,107,0.5)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffce6b", transition: "opacity .15s", pointerEvents: "none" },
  neuroTagWrap: { display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", marginTop: 11 },
  neuroTagLbl: { fontSize: 11, fontWeight: 700, color: "#8aa0c4" },
  neuroPill: { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 99, border: "1px solid", fontSize: 12, fontWeight: 700 },
  regiaoPill: { display: "inline-block", padding: "4px 10px", borderRadius: 99, border: "1px solid rgba(205,209,218,0.3)", background: "rgba(205,209,218,0.08)", color: "#cdd1da", fontSize: 12, fontWeight: 600 },
  s12tab: { flex: 1, padding: "9px 4px", borderRadius: 10, border: "none", fontWeight: 600, fontSize: 12.5, cursor: "pointer", fontFamily: "Sora, sans-serif" },
  s12card: { padding: "15px", borderRadius: 16, border: "1px solid", marginBottom: 10 },
  s12row: { display: "flex", gap: 8, fontSize: 13, color: "#dbe4f3", lineHeight: 1.5, padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  uxCatBtn: { padding: "7px 12px", borderRadius: 99, border: "1px solid", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Sora, sans-serif", whiteSpace: "nowrap" },
  uxScreen: { display: "flex", flexDirection: "column", gap: 11, padding: "14px", borderRadius: 18, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" },
  uxScreenImg: { height: 90, borderRadius: 12, background: "linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38 },
  deckPile: { position: "relative", height: 210, marginTop: 8, cursor: "pointer" },
  deckBack: { position: "absolute", left: "50%", top: "50%", width: 180, height: 200, marginLeft: -90, marginTop: -100, borderRadius: 18, border: "1px solid rgba(255,206,107,0.4)", background: "linear-gradient(160deg, rgba(255,206,107,0.14), rgba(255,255,255,0.03))", backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR, boxShadow: GSHADOW, display: "flex", alignItems: "center", justifyContent: "center" },
  stageHook: { padding: "20px 16px", borderRadius: 18, background: "linear-gradient(160deg, rgba(99,102,241,0.12), rgba(255,255,255,0.03))", border: "1px solid rgba(99,102,241,0.25)", backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR, marginBottom: 4 },
  stageQuestion: { display: "flex", alignItems: "flex-start", gap: 10, marginTop: 14, padding: "12px 14px", borderRadius: 13, background: "rgba(255,206,107,0.08)", border: "1px solid rgba(255,206,107,0.28)" },
  stageTitle: { fontFamily: "Fraunces, serif", fontSize: 18, fontWeight: 600, color: "#f1f5fc", margin: "0 0 8px" },
  stagePara: { fontSize: 14, color: "#c8d4ea", lineHeight: 1.65, margin: "0 0 10px" },
  stageItems: { display: "flex", flexDirection: "column", gap: 10 },
  stageItem: { display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 13px", borderRadius: 14, background: GLASS, border: GBORDER, backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR },
  stageFlowStep: { display: "flex", gap: 12, alignItems: "flex-start", padding: "11px 12px", borderRadius: 13, background: GLASS, border: GBORDER, backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR, width: "100%" },
  stageQuizBadge: { display: "inline-block", padding: "4px 11px", borderRadius: 99, background: "rgba(255,206,107,0.15)", border: "1px solid rgba(255,206,107,0.4)", color: "#ffce6b", fontSize: 12, fontWeight: 800, marginBottom: 8 },
  stageAplicacao: { padding: "13px 14px", borderRadius: 13, background: "rgba(125,211,252,0.08)", border: "1px solid rgba(125,211,252,0.25)", marginTop: 10 },
  stageApply: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "22px 18px", borderRadius: 18, background: "rgba(255,206,107,0.10)", border: "1px solid rgba(255,206,107,0.35)", backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR },
  stageLink: { padding: "16px", borderRadius: 16, background: GLASS, border: GBORDER, backdropFilter: GBLUR, WebkitBackdropFilter: GBLUR },
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Sora:wght@400;500;600;700&display=swap');
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
button:disabled { cursor: not-allowed; }
.fade { animation: fade .35s ease; }
@keyframes fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes blink { 0%,100% { opacity: .5; } 50% { opacity: 1; } }
.node-on { animation: pop .4s ease; }
@keyframes pop { 0% { transform: scale(.8); } 60% { transform: scale(1.12); } 100% { transform: scale(1); } }
.halo { animation: breathe 2.4s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
@keyframes breathe { 0%,100% { opacity: .18; } 50% { opacity: .35; } }
.pulse-line { stroke-dasharray: 5 4; animation: dash 1.2s linear infinite; }
@keyframes dash { to { stroke-dashoffset: -18; } }
.node-g circle:first-of-type { transition: transform .25s; transform-origin: center; transform-box: fill-box; }
.shake { animation: shake .4s ease; }
@keyframes shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
.pulse-node { animation: pnode 1.8s ease-in-out infinite; }
@keyframes pnode { 0%,100% { box-shadow: 0 0 0 0 rgba(125,211,252,.35); } 50% { box-shadow: 0 0 0 8px rgba(125,211,252,0); } }
.toast-anim { animation: slideUp .3s ease; }
@keyframes slideUp { from { opacity: 0; transform: translate(-50%, 16px); } to { opacity: 1; transform: translate(-50%, 0); } }
.brain-slider { -webkit-appearance: none; appearance: none; height: 8px; border-radius: 99px; background: linear-gradient(90deg,#38bdf8,#ffce6b,#a78bfa); outline: none; }
.brain-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 26px; height: 26px; border-radius: 99px; background: #fff; border: 3px solid #e0a324; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,.4); }
.brain-slider::-moz-range-thumb { width: 26px; height: 26px; border-radius: 99px; background: #fff; border: 3px solid #e0a324; cursor: pointer; }
.blink-soft { animation: blink 1.4s infinite; }
.flip-inner { position: relative; width: 100%; transition: transform .6s cubic-bezier(.4,.2,.2,1); transform-style: preserve-3d; }
.flip-inner.flipped { transform: rotateY(180deg); }
.flip-face { position: absolute; inset: 0; width: 100%; height: 100%; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.flip-inner:not(.flipped) .flip-back, .flip-back { transform: rotateY(180deg); }
.ux-pulse { animation: blink 1.6s infinite; }
.ux-progress { width: 0; animation: uxprog 2.4s ease-in-out infinite; }
@keyframes uxprog { 0% { width: 8%; } 60% { width: 82%; } 100% { width: 82%; } }
.glow { position: fixed; border-radius: 50%; filter: blur(70px); opacity: 0.5; pointer-events: none; z-index: 0; }
.glow-a { width: 320px; height: 320px; background: radial-gradient(circle, rgba(255,255,255,0.10), transparent 70%); top: -60px; left: -80px; animation: float1 14s ease-in-out infinite; }
.glow-b { width: 300px; height: 300px; background: radial-gradient(circle, rgba(255,255,255,0.30), transparent 70%); bottom: 40px; right: -90px; animation: float2 17s ease-in-out infinite; }
.glow-c { width: 260px; height: 260px; background: radial-gradient(circle, rgba(255,255,255,0.06), transparent 70%); top: 45%; left: 35%; animation: float1 20s ease-in-out infinite; }
@keyframes float1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,40px); } }
@keyframes float2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-40px,-30px); } }`;
