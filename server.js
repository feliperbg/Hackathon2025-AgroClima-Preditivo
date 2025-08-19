/**
 * @file Servidor principal da aplicação AgroClima Preditivo.
 * @description Este ficheiro configura um servidor Express para servir uma aplicação web e uma API.
 * A API conecta-se a um banco de dados MySQL para obter informações sobre localidades e culturas,
 * integra-se com APIs externas de previsão do tempo (Visual Crossing) e de inteligência artificial (Google Gemini)
 * para fornecer análises de risco climático para a agricultura.
 * @author [Seu Nome/Equipa]
 * @version 11.0
 */

// --- IMPORTAÇÃO DE MÓDULOS ---
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import 'dotenv/config'; // Carrega variáveis de ambiente do ficheiro .env
import path from 'path';
import { fileURLToPath } from 'url';

// --- CONFIGURAÇÃO INICIAL DO SERVIDOR ---
const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- MIDDLEWARES ---
app.use(cors()); // Habilita o Cross-Origin Resource Sharing para todas as rotas
app.use(express.json()); // Habilita o parsing de corpos de requisição em formato JSON
app.use(express.static(path.join(__dirname, 'public'))); // Serve ficheiros estáticos da pasta 'public'

// --- CONEXÃO COM O BANCO DE DADOS ---
/**
 * @constant {object} dbConfig - Configurações de conexão para o banco de dados MySQL.
 * As credenciais são carregadas a partir de variáveis de ambiente.
 */
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;
try {
    pool = mysql.createPool(dbConfig);
    console.log('Pool de conexões com o MySQL estabelecido com sucesso.');
} catch (error) {
    console.error('Não foi possível criar o pool de conexões com o MySQL:', error);
}

// --- FUNÇÕES AUXILIARES ---
/**
 * Realiza uma requisição fetch com um timeout definido.
 * @param {string} url - A URL para a qual a requisição será feita.
 * @param {object} [options={}] - Opções de configuração para a requisição fetch.
 * @param {number} [timeout=15000] - Tempo em milissegundos antes de a requisição ser abortada.
 * @returns {Promise<Response>} A resposta da requisição fetch.
 * @throws {Error} Lança um erro se a requisição exceder o tempo limite (timeout) ou falhar.
 */
async function fetchWithTimeout(url, options = {}, timeout = 15000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error('A requisição demorou muito e foi cancelada (timeout).');
        }
        throw error;
    }
}

// --- ROTAS DA API ---

/**
 * @route GET /api/estados
 * @description Obtém a lista de todos os estados do Brasil a partir do banco de dados.
 * @returns {JSON} Um array de objetos, onde cada objeto representa um estado.
 */
app.get('/api/estados', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT codigo_uf AS id, nome, uf AS sigla FROM estados ORDER BY nome');
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar estados:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
});

/**
 * @route GET /api/municipios/:estadoId
 * @description Obtém a lista de municípios para um determinado estado.
 * @param {string} estadoId - O ID do estado (código UF) a ser consultado.
 * @returns {JSON} Um array de objetos, onde cada objeto representa um município com seus dados.
 */
app.get('/api/municipios/:estadoId', async (req, res) => {
    try {
        const { estadoId } = req.params;
        const [rows] = await pool.execute('SELECT codigo_ibge AS id, nome, latitude, longitude FROM municipios WHERE codigo_uf = ? ORDER BY nome', [estadoId]);
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar municípios:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
});

/**
 * @route GET /api/sementes
 * @description Obtém a lista de todas as culturas (sementes) disponíveis no banco de dados.
 * @returns {JSON} Um array de objetos, onde cada objeto representa uma cultura.
 */
app.get('/api/sementes', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, nome FROM sementes ORDER BY nome');
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar sementes:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
});

/**
 * @route GET /api/cultura-info/:id
 * @description Obtém informações detalhadas sobre uma cultura específica e gera uma análise de impacto climático usando IA.
 * @param {string} id - O ID da cultura a ser consultada.
 * @returns {JSON} Um objeto contendo os dados da cultura do banco de dados e a análise gerada pela IA.
 */
app.get('/api/cultura-info/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT * FROM sementes WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ erro: 'Cultura não encontrada.' });
        
        const cultura = rows[0];
        const geminiApiKey = process.env.GEMINI_API_KEY;

        if (!geminiApiKey) {
            console.error("A chave GEMINI_API_KEY não está definida no ficheiro .env");
            throw new Error("Configuração da API de IA incompleta no servidor.");
        }

        const prompt = `
            Você é um especialista em agronomia e sustentabilidade, focado na ODS 13 (Ação Contra a Mudança Global do Clima).
            Analise a cultura de "${cultura.nome}" e gere um resumo conciso para um agricultor.

            **Informações da Cultura:**
            - Descrição: ${cultura.descricao}
            - Solo Ideal: ${cultura.solo_ideal}

            **Sua Análise Deve Conter (em formato JSON):**
            1.  **impacto_climatico:** Um parágrafo curto sobre o impacto geral do cultivo de ${cultura.nome} no clima.
            2.  **vulnerabilidades:** Liste em 2 ou 3 bullet points como as mudanças climáticas afetam a produção de ${cultura.nome}.
            3.  **praticas_sustentaveis:** Liste em 2 ou 3 bullet points práticas agrícolas sustentáveis para o cultivo de ${cultura.nome}.

            **Formato da Resposta (Obrigatório):**
            Responda APENAS com um objeto JSON válido.
            {
              "impacto_climatico": "texto",
              "vulnerabilidades": ["ponto 1", "ponto 2"],
              "praticas_sustentaveis": ["ponto 1", "ponto 2"]
            }
        `;
        
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;
        const payload = { contents: [{ parts: [{ text: prompt }] }] };
        const geminiResponse = await fetchWithTimeout(geminiApiUrl, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });

        if (!geminiResponse.ok) { throw new Error(`Erro na API de IA: ${geminiResponse.status} ${geminiResponse.statusText}`); }

        const geminiResult = await geminiResponse.json();
        const analysisText = geminiResult.candidates[0].content.parts[0].text;
        const jsonStartIndex = analysisText.indexOf('{');
        const jsonEndIndex = analysisText.lastIndexOf('}');
        const cleanedJsonString = analysisText.substring(jsonStartIndex, jsonEndIndex + 1);
        const analiseIA = JSON.parse(cleanedJsonString.trim());

        res.json({ db: cultura, ia: analiseIA });
    } catch (error) {
        console.error('Erro ao buscar informações da cultura:', error);
        res.status(500).json({ erro: 'Erro interno do servidor ao gerar análise da cultura.' });
    }
});

/**
 * @route POST /api/predicao
 * @description Rota principal que recebe coordenadas e uma cultura, busca a previsão do tempo e gera uma análise de risco climático com IA.
 * @param {object} req.body - O corpo da requisição contendo { lat, lon, sementeId }.
 * @returns {JSON} Um objeto completo com os dados da localização, previsão do tempo para 15 dias, a análise da IA, e informações da semente.
 */
app.post('/api/predicao', async (req, res) => {
    const { lat, lon, sementeId } = req.body;
    if (!lat || !lon || !sementeId) {
        return res.status(400).json({ erro: 'Latitude, longitude e ID da semente são obrigatórios.' });
    }

    try {
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            console.error("A chave GEMINI_API_KEY não está definida no ficheiro .env");
            throw new Error("Configuração da API de IA incompleta no servidor.");
        }

        const [seedRowsResult, weatherResponse] = await Promise.all([
            pool.execute('SELECT * FROM sementes WHERE id = ?', [sementeId]),
            fetchWithTimeout(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}?unitGroup=metric&key=${process.env.VISUAL_CROSSING_API_KEY}&contentType=json`)
        ]);

        const infoSemente = seedRowsResult[0][0];
        if (!infoSemente) return res.status(404).json({ erro: 'Semente não encontrada.' });

        if (!weatherResponse.ok) throw new Error('Falha ao buscar dados de previsão do tempo.');
        const dadosPrevisao = await weatherResponse.json();
        
        const prompt = `
            Você é um engenheiro agrônomo especialista em análise de risco climático, focado na ODS 13.
            Sua tarefa é fornecer uma análise profissional e concisa para um agricultor, baseada na previsão do tempo.

            **Localização:** Latitude ${lat}, Longitude ${lon}.
            **Cultura Selecionada:** ${infoSemente.nome}.
            **Requisitos da Cultura:**
            - Clima Ideal: ${infoSemente.clima_ideal}
            - Solo Ideal (Referência): ${infoSemente.solo_ideal}

            **Dados de Previsão do Tempo (Próximos 15 Dias):**
            ${JSON.stringify(dadosPrevisao.days.slice(0, 15).map(d => ({data: d.datetime, temp_max: d.tempmax, temp_min: d.tempmin, chuva_mm: d.precip})))}

            **Sua Análise Deve Conter:**
            1.  **Análise das Condições Climáticas:** Compare a previsão do tempo com o clima ideal para a cultura. Destaque os períodos favoráveis e desfavoráveis.
            2.  **Recomendação de Plantio:** Com base na previsão de chuva e temperatura, identifique a melhor "janela de plantio" nos próximos 15 dias.
            3.  **Análise de Risco Climático:** Identifique até 3 riscos principais (ex: estresse hídrico, risco de geada, calor excessivo, erosão por chuvas intensas). Atribua um nível de severidade (Baixo, Médio, Alto).
            4.  **Sugestão Prática (ODS 13):** Forneça uma sugestão acionável focada em resiliência climática.
            5.  **Resumo Geral:** Uma conclusão curta (1-2 frases).

            **Formato da Resposta (Obrigatório):**
            Responda APENAS com um objeto JSON válido.
            {
              "analise_climatica": "texto da análise",
              "janela_plantio": { "recomendacao": "texto", "data_inicio": "YYYY-MM-DD", "data_fim": "YYYY-MM-DD" },
              "analise_risco": [ { "risco": "Nome", "descricao": "Descrição", "severidade": "Baixo|Médio|Alto" } ],
              "sugestao_pratica": "texto da sugestão",
              "resumo_geral": "texto do resumo"
            }
        `;

        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;
        const payload = { contents: [{ parts: [{ text: prompt }] }] };
        const geminiResponse = await fetchWithTimeout(geminiApiUrl, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });

        if (!geminiResponse.ok) { throw new Error(`Erro na API de IA: ${geminiResponse.status} ${geminiResponse.statusText}`); }

        const geminiResult = await geminiResponse.json();
        const analysisText = geminiResult.candidates[0].content.parts[0].text;
        const jsonStartIndex = analysisText.indexOf('{');
        const jsonEndIndex = analysisText.lastIndexOf('}');
        const cleanedJsonString = analysisText.substring(jsonStartIndex, jsonEndIndex + 1);
        const analysisJson = JSON.parse(cleanedJsonString.trim());

        res.json({
            localizacao: dadosPrevisao.resolvedAddress,
            previsao: dadosPrevisao.days.slice(0, 15),
            analise: analysisJson,
            semente: infoSemente
        });

    } catch (error) {
        console.error('Erro ao realizar predição:', error);
        res.status(500).json({ erro: 'Erro interno do servidor ao processar a análise.' });
    }
});

// --- ROTAS DAS PÁGINAS HTML ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/culturas', (req, res) => res.sendFile(path.join(__dirname, 'public', 'culturas.html')));
app.get('/predicao', (req, res) => res.sendFile(path.join(__dirname, 'public', 'predicao.html')));

// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => console.log(`Servidor a rodar na porta ${PORT}`));
