package maturation

// Conversation representa uma conversa entre dois números
// Cada mensagem alterna entre os dois números:
// - Índice par (0, 2, 4...): Número A envia para B
// - Índice ímpar (1, 3, 5...): Número B envia para A
type Conversation []string

// Conversations contém 10 conversas genéricas em português
// para simular interações humanas reais no WhatsApp
var Conversations = []Conversation{
	// Conversa 1: Cumprimento casual
	{
		"Oi, tudo bem?",
		"Tudo sim! E você?",
		"Tudo ótimo, obrigado por perguntar!",
		"Que bom! Qualquer coisa estou por aqui",
	},

	// Conversa 2: Marcando encontro
	{
		"E aí, vamos marcar algo essa semana?",
		"Bora! Que dia você pode?",
		"Quinta ou sexta pra mim tá tranquilo",
		"Sexta então! Te mando o local depois",
	},

	// Conversa 3: Sobre o trabalho
	{
		"Como tá o trabalho?",
		"Corrido, mas tudo sob controle. E o seu?",
		"Também bastante coisa, mas dando conta",
		"É assim mesmo, força aí!",
	},

	// Conversa 4: Agradecimento
	{
		"Muito obrigado pela ajuda de ontem!",
		"Imagina, foi um prazer ajudar",
		"Você salvou meu dia, sério mesmo",
		"Pode contar comigo sempre que precisar",
	},

	// Conversa 5: Fim de semana
	{
		"Curtiu o fim de semana?",
		"Demais! Descansei bastante. E você?",
		"Também, aproveitei pra ficar em casa",
		"Às vezes é o que a gente precisa mesmo",
	},

	// Conversa 6: Compartilhando novidade
	{
		"Tenho uma novidade pra te contar!",
		"Conta aí, to curioso!",
		"Consegui aquilo que te falei!",
		"Sério? Parabéns! Muito feliz por você!",
	},

	// Conversa 7: Pedindo opinião
	{
		"Preciso da sua opinião sobre uma coisa",
		"Claro, pode falar",
		"Depois te mando os detalhes, pode ser?",
		"Tranquilo, fico no aguardo",
	},

	// Conversa 8: Lembrando de algo
	{
		"Lembrei de você hoje!",
		"Que legal! Por quê?",
		"Vi algo que você ia gostar",
		"Ah que bacana! Mostra depois!",
	},

	// Conversa 9: Check-in rápido
	{
		"Só passando pra dar um oi",
		"Opa! Que bom te ouvir!",
		"Tava com saudade de trocar ideia",
		"Também! Vamos nos falar mais",
	},

	// Conversa 10: Combinando retorno
	{
		"Conseguiu resolver aquele assunto?",
		"Ainda não, mas to quase lá",
		"Qualquer coisa me avisa que ajudo",
		"Valeu! Te dou um retorno em breve",
	},
}
