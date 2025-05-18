// script.js para o Conector de Causas Sociais

document.addEventListener('DOMContentLoaded', () => {
    // Seleciona os elementos do DOM
    const interestForm = document.getElementById('interest-form');
    const causesInput = document.getElementById('causes');
    const skillsInput = document.getElementById('skills');
    const locationInput = document.getElementById('location');
    const chatArea = document.getElementById('chat-area');
    const suggestionsArea = document.getElementById('suggestions-area');

    // Adiciona um ouvinte de evento para o envio do formulário
    interestForm.addEventListener('submit', handleSubmitInterests);

    /**
     * Lida com o envio do formulário de interesses.
     * @param {Event} event - O evento de envio do formulário.
     */
    async function handleSubmitInterests(event) {
        event.preventDefault(); // Impede o comportamento padrão de envio do formulário

        // Coleta os dados do formulário
        const causes = causesInput.value.trim();
        const skills = skillsInput.value.trim();
        const location = locationInput.value.trim();

        // Validação básica
        if (!causes || !location) {
            addMessageToChat('Por favor, preencha pelo menos as causas que te motivam e sua localização.', 'system-error');
            return;
        }

        // Adiciona mensagem de "processando" ao chat
        addMessageToChat('Buscando oportunidades com base nos seus interesses...', 'user');
        addMessageToChat('Aguarde um momento, estou consultando as informações...', 'assistant-thinking');

        // Simulação de chamada de API e processamento
        // No futuro, aqui você chamará a API do Gemini e outras APIs do Google
        try {
            // Placeholder para a lógica de chamada da API
            // const opportunities = await fetchOpportunities(causes, skills, location);

            // Simulação de resposta da API após um pequeno atraso
            await new Promise(resolve => setTimeout(resolve, 2500)); // Simula a latência da rede

            // Limpa a mensagem de "pensando"
            removeThinkingMessage();

            const mockOpportunities = [
                {
                    name: "ONG Criança Feliz",
                    cause: "Educação Infantil",
                    description: "Precisamos de voluntários para auxiliar em atividades educativas com crianças de 4 a 6 anos.",
                    type: "Voluntariado Presencial",
                    contact: "contato@criancafeliz.org",
                    address: "Rua das Palmeiras, 123, São Paulo, SP"
                },
                {
                    name: "Projeto Patinhas Carentes",
                    cause: "Proteção Animal",
                    description: "Buscamos voluntários para passear com cães e ajudar na limpeza do abrigo aos finais de semana.",
                    type: "Voluntariado Presencial",
                    contact: "patinhas@email.com",
                    address: "Av. dos Animais, 789, São Paulo, SP"
                },
                {
                    name: "Campanha do Agasalho Digital",
                    cause: "Assistência Social",
                    description: "Doe agasalhos virtualmente ou ajude a divulgar nossa campanha online.",
                    type: "Voluntariado Online / Doação",
                    contact: "agasalhodigital.org",
                    address: "Online"
                }
            ];

            if (mockOpportunities && mockOpportunities.length > 0) {
                addMessageToChat('Encontrei algumas oportunidades que podem te interessar!', 'assistant');
                displayOpportunities(mockOpportunities);
            } else {
                addMessageToChat('Não encontrei oportunidades com os critérios informados no momento. Tente refinar sua busca.', 'assistant');
                suggestionsArea.innerHTML = '<p class="text-sm text-gray-500">Nenhuma sugestão encontrada.</p>';
            }

        } catch (error) {
            console.error("Erro ao buscar oportunidades:", error);
            removeThinkingMessage();
            addMessageToChat('Desculpe, ocorreu um erro ao buscar as oportunidades. Tente novamente mais tarde.', 'system-error');
        }
    }

    /**
     * Adiciona uma mensagem à área de chat.
     * @param {string} message - A mensagem a ser adicionada.
     * @param {string} sender - Quem enviou a mensagem ('user', 'assistant', 'system-error', 'assistant-thinking').
     */
    function addMessageToChat(message, sender) {
        // Remove a mensagem inicial "O assistente aguarda..." se for a primeira mensagem real
        const initialMessage = chatArea.querySelector('.text-gray-500.text-center');
        if (initialMessage) {
            initialMessage.remove();
        }

        const messageElement = document.createElement('div');
        messageElement.classList.add('mb-3', 'p-3', 'rounded-lg', 'max-w-xs', 'md:max-w-md', 'text-sm', 'shadow');

        if (sender === 'user') {
            messageElement.classList.add('bg-blue-500', 'text-white', 'ml-auto', 'rounded-br-none');
            messageElement.textContent = message;
        } else if (sender === 'assistant') {
            messageElement.classList.add('bg-purple-500', 'text-white', 'mr-auto', 'rounded-bl-none');
            messageElement.textContent = message;
        } else if (sender === 'system-error') {
            messageElement.classList.add('bg-red-500', 'text-white', 'mr-auto', 'rounded-bl-none');
            messageElement.textContent = `Erro: ${message}`;
        } else if (sender === 'assistant-thinking') {
            messageElement.id = 'thinking-message';
            messageElement.classList.add('bg-gray-200', 'text-gray-600', 'mr-auto', 'rounded-bl-none', 'italic');
            messageElement.innerHTML = `
                <div class="flex items-center space-x-2">
                    <svg class="animate-spin h-4 w-4 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>${message}</span>
                </div>
            `;
        }


        chatArea.appendChild(messageElement);
        chatArea.scrollTop = chatArea.scrollHeight; // Mantém o scroll na última mensagem
    }

    /**
     * Remove a mensagem "pensando..." do chat.
     */
    function removeThinkingMessage() {
        const thinkingMsg = document.getElementById('thinking-message');
        if (thinkingMsg) {
            thinkingMsg.remove();
        }
    }

    /**
     * Exibe as oportunidades encontradas na área de sugestões.
     * @param {Array<Object>} opportunities - Uma lista de objetos de oportunidade.
     */
    function displayOpportunities(opportunities) {
        suggestionsArea.innerHTML = ''; // Limpa sugestões anteriores

        if (opportunities.length === 0) {
            suggestionsArea.innerHTML = '<p class="text-sm text-gray-500">Nenhuma sugestão encontrada para os critérios informados.</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.classList.add('space-y-4');

        opportunities.forEach(op => {
            const li = document.createElement('li');
            li.classList.add('p-4', 'bg-white', 'rounded-lg', 'shadow-md', 'hover:shadow-lg', 'transition-shadow', 'duration-200');
            li.innerHTML = `
                <h4 class="font-semibold text-md text-purple-700">${op.name}</h4>
                <p class="text-sm text-gray-600"><strong class="font-medium">Causa:</strong> ${op.cause}</p>
                <p class="text-sm text-gray-600 mt-1">${op.description}</p>
                <p class="text-sm text-gray-500 mt-1"><strong class="font-medium">Tipo:</strong> ${op.type}</p>
                ${op.address ? `<p class="text-xs text-gray-500 mt-1"><strong class="font-medium">Endereço:</strong> ${op.address}</p>` : ''}
                <div class="mt-3">
                    <a href="mailto:${op.contact}?subject=Interesse em Oportunidade: ${op.name}" class="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium">Entrar em contato</a>
                    </div>
            `;
            ul.appendChild(li);
        });
        suggestionsArea.appendChild(ul);
    }

    // Funções futuras (placeholders)
    /**
     * Busca oportunidades usando as APIs (simulação).
     * @param {string} causes - Causas de interesse.
     * @param {string} skills - Habilidades ou tipo de contribuição.
     * @param {string} location - Localização do usuário.
     * @returns {Promise<Array<Object>>} - Uma promessa que resolve para uma lista de oportunidades.
     */
    // async function fetchOpportunities(causes, skills, location) {
    //     console.log("Buscando oportunidades para:", { causes, skills, location });
    //     // Aqui ocorreria a chamada para o backend que, por sua vez, usaria Gemini, Maps API, Search API
    //     // Por enquanto, retornaremos dados mockados após um tempo.
    //     return new Promise(resolve => {
    //         setTimeout(() => {
    //             resolve([
    //                 // ... dados mockados como no exemplo acima ...
    //             ]);
    //         }, 1500);
    //     });
    // }

    // Adiciona mensagem inicial ao chat
    addMessageToChat('Olá! Descreva seus interesses, habilidades e localização para que eu possa te ajudar a encontrar causas sociais.', 'assistant');
});
