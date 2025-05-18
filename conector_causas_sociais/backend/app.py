from flask import Flask, request, jsonify
import google.generativeai as genai
import os
from dotenv import load_dotenv
from flask_cors import CORS # Importar CORS

load_dotenv()

app = Flask(__name__)
CORS(app) # Habilitar CORS para todas as rotas e origens.
          # Para produção, configure origens específicas:
          # CORS(app, resources={r"/api/*": {"origins": "http://seu-dominio-frontend.com"}})


# Configuração da API do Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("Chave da API do Gemini não encontrada. Defina GEMINI_API_KEY no arquivo .env")

genai.configure(api_key=GEMINI_API_KEY)

# IMPORTANTE: Substitua 'gemini-1.5-flash-latest' pelo nome do modelo que você
# encontrou usando o script para listar modelos (ex: gemini-1.0-pro, gemini-1.5-pro-latest, etc.)
# O erro anterior "404 models/gemini-pro is not found" indicava que 'gemini-pro' não era válido.
model = genai.GenerativeModel('gemini-1.5-flash-latest')

def get_gemini_response(user_interests, user_skills, user_contribution_method, user_location):
    # Adapte o prompt para usar os novos campos
    prompt = f"""
    Analise o perfil de um usuário interessado em voluntariado e engajamento social:
    - Interesses/Causas que motivam: {user_interests}
    - Habilidades específicas que gostaria de oferecer: {user_skills}
    - Tipo de contribuição que gostaria de oferecer: {user_contribution_method}
    - Localização: {user_location}

    Com base nessas informações, interprete e categorize os interesses do usuário.
    Sugira que tipo de oportunidades ou organizações seriam mais alinhadas com este perfil.
    A resposta deve ser um parágrafo ou dois, amigável e encorajador.
    O foco inicial é apenas interpretar o perfil e dar uma direção geral.
    """
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        # Imprime o erro no console do backend para depuração
        print(f"Erro ao chamar a API do Gemini na função get_gemini_response: {e}")
        # Relança a exceção para que o endpoint principal possa tratá-la
        # e retornar um status HTTP de erro apropriado (ex: 500).
        raise

@app.route('/api/get-suggestions', methods=['POST'])
def api_get_suggestions():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Nenhum dado recebido"}), 400

        interests = data.get('interests')
        skills = data.get('skills')
        contribution_method = data.get('contributionMethod') # Note a mudança para camelCase para corresponder ao JS
        location = data.get('location')

        required_fields_data = {
            "interests": interests,
            "skills": skills,
            "contributionMethod": contribution_method,
            "location": location
        }

        # Verifica se todos os campos esperados foram fornecidos
        if not all(required_fields_data.values()):
            missing_fields = [field for field, value in required_fields_data.items() if not value]
            return jsonify({"error": f"Dados incompletos. Campos obrigatórios ausentes: {', '.join(missing_fields)}"}), 400

        gemini_processed_response = get_gemini_response(interests, skills, contribution_method, location)

        # Se chegou aqui, a chamada ao Gemini foi bem-sucedida
        return jsonify({"processedResponse": gemini_processed_response})

    except Exception as e:
        # Este bloco agora capturará exceções da chamada à API do Gemini (re-lançadas por get_gemini_response)
        # e outras exceções inesperadas neste endpoint.
        print(f"Erro no endpoint /api/get-suggestions: {e}") # Log do erro no backend
        
        # Retorna uma mensagem de erro genérica e um status 500 para o cliente.
        # Adicionar str(e) pode dar mais detalhes do erro no frontend se desejado,
        # mas para produção, uma mensagem genérica é geralmente mais segura.
        return jsonify({"error": "Erro interno no servidor ao processar sua solicitação.", "details": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "backend_ok"})


@app.route('/', methods=['GET'])
def home():
    return "Servidor Backend 'Conectando' está no ar! Acesse o frontend para interagir."

if __name__ == '__main__':
    app.run(debug=True, port=5000)