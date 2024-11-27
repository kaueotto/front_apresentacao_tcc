from flask import Flask, jsonify
from flask_cors import CORS  # Importa o CORS
import pandas as pd

app = Flask(__name__)
CORS(app)  # Habilita o CORS para todas as rotas

@app.route('/api/dados', methods=['GET'])
def carregar_excel():
    try:
        arquivo_excel = 'dados.xlsx'
        # Lê o arquivo Excel
        df = pd.read_excel(arquivo_excel)

        # Substitui valores NaN por 0, para garantir que valores vazios no Excel sejam tratados como 0
        df = df.fillna(0)

        # Converte o dataframe para um formato adequado para envio como JSON
        dados = df.to_dict(orient='records')
        
        return jsonify(dados), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
