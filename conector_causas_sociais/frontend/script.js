const submitButton = document.getElementById('submit-input');
const chatBox = document.getElementById('chat-box');
const contactNgoButton = document.getElementById('contact-ngo-button');
const emailOptinCheckbox = document.getElementById('email-notifications');

// URL do seu backend. Ajuste se for diferente.
const BACKEND_URL = 'http://localhost:5000'; // Se o backend estiver na mesma origem, pode ser só '/api/get-suggestions'

submitButton.addEventListener('click', async () => {
    const interests = document.getElementById('interests').value;
    const skills = document.getElementById('skills').value;
    const contributionMethod = document.getElementById('contribution-method').value;
    const location = document.getElementById('location').value;

    if (!interests || !skills || !contributionMethod || !location) {
        addMessageToChat("Por favor, preencha todos os campos para que eu possa te ajudar melhor!", 'bot-error');
        return;
    }

    // Adiciona a mensagem do usuário ao chat
    addMessageToChat(`Interesses: ${interests}, Habilidades: ${skills}, Tipo de Contribuição: ${contributionMethod}, Localização: ${location}`, 'user');

    // Mostra uma mensagem de "buscando..."
    addMessageToChat("Ok! Com base nas suas informações, estou buscando oportunidades...", 'bot-loading');
    contactNgoButton.style.display = 'none'; // Esconde o botão enquanto busca

    try {
        const response = await fetch(`${BACKEND_URL}/api/get-suggestions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                interests: interests, // Enviando como 'interests'
                skills: skills,
                contributionMethod: contributionMethod, // Enviando 'contributionMethod'
                location: location
            }),
        });

        // Remove a mensagem de "buscando..." (opcional, ou substitui pela resposta)
        removeMessageByClass('bot-loading'); // Função auxiliar para remover mensagem

        if (!response.ok) {
            const errorData = await response.json().catch(() => null); // Tenta pegar o JSON do erro, se houver
            const errorMessage = errorData && errorData.error ? errorData.error : `Erro HTTP: ${response.status}`;
            addMessageToChat(`Desculpe, tive um problema ao buscar sugestões: ${errorMessage}. Tente novamente mais tarde.`, 'bot-error');
            console.error('Erro do backend:', response.status, errorData);
            return;
        }

        const data = await response.json();

        if (data && data.processedResponse) {
            addMessageToChat(data.processedResponse, 'bot');
            contactNgoButton.style.display = 'block'; // Mostra o botão após receber as sugestões
        } else {
            addMessageToChat("Não consegui obter uma sugestão clara no momento. Você pode tentar reformular seus interesses?", 'bot');
        }

    } catch (error) {
        removeMessageByClass('bot-loading');
        addMessageToChat("Ocorreu um erro ao tentar conectar com o servidor. Verifique sua conexão ou tente mais tarde.", 'bot-error');
        console.error('Erro na requisição fetch:', error);
    }
});

contactNgoButton.addEventListener('click', () => {
    // Idealmente, o [Nome da ONG Sugerida] viria da resposta do bot/seleção do usuário
    const nomeOngSugerida = "[Nome da ONG Sugerida - a ser preenchido]";
    const interests = document.getElementById('interests').value;
    const skills = document.getElementById('skills').value;
    const contributionMethod = document.getElementById('contribution-method').value;

    const subject = encodeURIComponent("Interesse em Voluntariado/Apoio - Plataforma Conectando");
    const body = encodeURIComponent(`Prezados(as),

Meu nome é [Seu Nome Aqui] e encontrei sua organização através da plataforma Conectando.
Tenho interesse em contribuir com ${nomeOngSugerida}.

Meus interesses principais são: ${interests}.
Minhas habilidades incluem: ${skills}.
Gostaria de contribuir através de: ${contributionMethod}.

Gostaria de saber mais sobre as oportunidades de voluntariado ou outras formas de apoio disponíveis.

Aguardo um retorno.

Atenciosamente,
[Seu Nome Aqui]`);

    window.open(`mailto:email@exemplo-ong.org.br?subject=${subject}&body=${body}`); // Substitua pelo email real ou lógica de contato
});

emailOptinCheckbox.addEventListener('change', () => {
    if (emailOptinCheckbox.checked) {
        addMessageToChat("Legal! Você será notificado sobre novas oportunidades por e-mail (funcionalidade a ser implementada).", 'bot-info');
        console.log("Usuário optou por receber notificações por e-mail.");
        // Aqui você implementaria a lógica para registrar o e-mail do usuário, se ele já tiver fornecido.
    } else {
        addMessageToChat("Ok, notificações por e-mail desativadas.", 'bot-info');
        console.log("Usuário desativou notificações por e-mail.");
    }
});

function addMessageToChat(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender); // sender pode ser 'user', 'bot', 'bot-error', 'bot-loading', 'bot-info'
    messageElement.textContent = message; // Para HTML simples. Se a resposta do bot tiver HTML, use .innerHTML e sanitize.
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll para a última mensagem
}

function removeMessageByClass(className) {
    const messageToRemove = chatBox.querySelector(`.chat-message.${className}`);
    if (messageToRemove) {
        chatBox.removeChild(messageToRemove);
    }
}

// Adicionar algumas classes CSS para os novos tipos de mensagem no seu style.css
/*
No seu style.css, adicione:

.chat-message.bot-error {
    background-color: #ffdddd;
    color: #d8000c;
    border-left: 5px solid #d8000c;
}

.chat-message.bot-loading {
    background-color: #e0e0e0;
    font-style: italic;
}

.chat-message.bot-info {
    background-color: #e7f3fe;
    color: #31708f;
    border-left: 5px solid #31708f;
}
*/