from flask import Flask, request, jsonify
import google.generativeai as genai  # Exemplo de biblioteca para Gemini (sujeito a alterações)
import googlemaps  # Biblioteca para Google Maps Platform
import os

app = Flask(__name__)

# Carregue suas chaves de API (mantenha-as seguras!)
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)
gmaps = googlemaps.Client(key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro') # Ou o modelo específico que você deseja usar

@app.route('/sugerir_causas', methods=['POST'])
def sugerir_causas():
    data = request.get_json()
    interesses = data.get('interesses')
    habilidades = data.get('habilidades')
    localizacao = data.get('localizacao')

    if not interesses or not localizacao:
        return jsonify({'erro': 'Interesses e localização são obrigatórios'}), 400

    # 1. Usar Gemini para refinar a busca e entender melhor os interesses
    prompt_gemini = f"O usuário tem interesse em {interesses} e pode contribuir com {habilidades}. Quais tipos de organizações sociais ou projetos poderiam ser relevantes para ele na área de {localizacao}?"
    response_gemini = model.generate_content(prompt_gemini)
    palavras_chave_gemini = response_gemini.text.split() # Extrair palavras-chave relevantes

    # 2. Usar Google Maps Places API para buscar organizações próximas
    try:
        geocode_result = gmaps.geocode(localizacao)
        if geocode_result:
            lat = geocode_result[0]['geometry']['location']['lat']
            lng = geocode_result[0]['geometry']['location']['lng']
            places_result = gmaps.places_nearby(location=(lat, lng), keyword=' '.join(palavras_chave_gemini), radius=10000) # Raio de 10km
            ongs = places_result.get('results', [])
        else:
            ongs = []
    except Exception as e:
        print(f"Erro ao buscar no Google Maps: {e}")
        ongs = []

    # 3. Filtrar e formatar as sugestões (você pode adicionar mais lógica aqui)
    sugestoes = []
    for ong in ongs:
        sugestoes.append({
            'nome': ong.get('name'),
            'endereco': ong.get('vicinity'),
            'detalhes_google': f"https://www.google.com/maps/place/?q=place_id:{ong.get('place_id')}"
            # Adicione mais informações relevantes
        })

    return jsonify({'sugestoes': sugestoes})

# Outras rotas para facilitar o contato, informar sobre doações, etc.

if __name__ == '__main__':
    app.run(debug=True)