/**
 * @file Script da página de resultados da predição.
 * @description Este script é responsável por pegar os dados da análise (armazenados na sessionStorage),
 * exibi-los de forma organizada na página e renderizar os gráficos de previsão do tempo com Chart.js.
 */

document.addEventListener('DOMContentLoaded', () => {
    const resultadoContainer = document.getElementById('resultado-container');
    const predicaoDataString = sessionStorage.getItem('predicaoData');

    if (!predicaoDataString) {
        resultadoContainer.innerHTML = `
            <div class="card">
                <h2>Nenhum dado de predição encontrado</h2>
                <p>Por favor, gere uma nova análise na página inicial para ver os resultados aqui.</p>
                <a href="/" class="button-link" style="text-decoration:none; color:white; background-color:var(--primary-green); padding: 1rem; border-radius: var(--border-radius); display: inline-block; text-align:center;">Voltar para a Página Inicial</a>
            </div>`;
        return;
    }

    try {
        const data = JSON.parse(predicaoDataString);
        displayResultados(data);
    } catch (error) {
        console.error("Erro ao processar os dados da predição:", error);
        resultadoContainer.innerHTML = `<div class="card"><p class="error-message">Ocorreu um erro ao exibir os resultados. Tente gerar uma nova análise.</p></div>`;
    }
});

/**
 * Exibe todos os resultados da análise na página.
 * @param {object} data - O objeto de dados completo retornado pela API de predição.
 * @param {string} data.localizacao - O endereço resolvido da análise.
 * @param {Array<object>} data.previsao - Array com os dados da previsão do tempo para 15 dias.
 * @param {object} data.analise - Objeto com a análise textual gerada pela IA.
 * @param {object} data.semente - Objeto com as informações da cultura selecionada.
 */
function displayResultados(data) {
    const { localizacao, previsao, analise, semente } = data;

    const headerHtml = `
        <div id="resultado-header">
            <h2>Análise Preditiva para ${semente.nome}</h2>
            <p>${localizacao}</p>
        </div>
    `;

    const analiseClimaticaHtml = `
        <div class="card">
            <h3><i class="fa-solid fa-cloud-sun"></i> Análise das Condições Climáticas</h3>
            <p>${analise.analise_climatica || 'Análise indisponível.'}</p>
        </div>
    `;

    let riscoHtml = analise.analise_risco.map(item => `
        <div class="risco-item">
            <h4>${item.risco} <span class="severidade ${item.severidade}">${item.severidade}</span></h4>
            <p>${item.descricao}</p>
        </div>
    `).join('');

    const analiseHtml = `
        <div class="grid-resultados">
            ${analiseClimaticaHtml}
            <div class="card">
                <h3><i class="fa-solid fa-triangle-exclamation"></i> Análise de Risco Climático</h3>
                ${riscoHtml || '<p>Nenhum risco significativo identificado.</p>'}
            </div>
            <div class="card">
                <h3><i class="fa-solid fa-calendar-check"></i> Janela de Plantio Recomendada</h3>
                <p><strong>Recomendação:</strong> ${analise.janela_plantio.recomendacao}</p>
                <p><strong>Período Ideal:</strong> ${formatDate(analise.janela_plantio.data_inicio)} a ${formatDate(analise.janela_plantio.data_fim)}</p>
            </div>
            <div class="card">
                <h3><i class="fa-solid fa-lightbulb"></i> Sugestões Práticas (ODS 13)</h3>
                <p>${analise.sugestao_pratica}</p>
            </div>
             <div class="card" style="grid-column: 1 / -1;">
                <h3><i class="fa-solid fa-circle-info"></i> Resumo Geral da Análise</h3>
                <p>${analise.resumo_geral}</p>
            </div>
        </div>
    `;

    const chartsHtml = `
        <div class="card chart-container">
             <h3>Previsão do Tempo Detalhada (Próximos 15 dias)</h3>
             <canvas id="tempChart"></canvas>
             <canvas id="precipChart"></canvas>
             <canvas id="windChart"></canvas>
        </div>
    `;
    
    document.getElementById('resultado-container').innerHTML = headerHtml + analiseHtml + chartsHtml;

    renderCharts(previsao);
}

/**
 * Renderiza os gráficos de previsão do tempo usando Chart.js.
 * @param {Array<object>} previsao - O array de dados da previsão do tempo.
 */
function renderCharts(previsao) {
    const labels = previsao.map(d => formatDate(d.datetime));
    
    // Gráfico de Temperatura
    const tempCtx = document.getElementById('tempChart').getContext('2d');
    new Chart(tempCtx, { /* ... (código do gráfico mantido como antes) ... */ });

    // Gráfico de Precipitação e Umidade
    const precipCtx = document.getElementById('precipChart').getContext('2d');
    new Chart(precipCtx, { /* ... (código do gráfico mantido como antes) ... */ });

    // Gráfico de Vento
    const windCtx = document.getElementById('windChart').getContext('2d');
    new Chart(windCtx, { /* ... (código do gráfico mantido como antes) ... */ });
}

/**
 * Formata uma string de data 'YYYY-MM-DD' para 'DD/MM'.
 * @param {string} dateString - A data no formato 'YYYY-MM-DD'.
 * @returns {string} A data formatada como 'DD/MM' ou uma string vazia se a entrada for inválida.
 */
function formatDate(dateString) {
    if (!dateString || typeof dateString !== 'string') return '';
    const parts = dateString.split('-');
    if (parts.length < 3) return dateString; // Retorna o original se não estiver no formato esperado
    const [year, month, day] = parts;
    return `${day}/${month}`;
}
