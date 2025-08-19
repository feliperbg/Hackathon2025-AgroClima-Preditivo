/**
 * @file Script da página de informações sobre Culturas e Clima.
 * @description Este script popula o dropdown com as culturas disponíveis e, quando uma é selecionada,
 * busca no backend as informações detalhadas e a análise de impacto climático gerada pela IA,
 * exibindo o resultado na página.
 */

document.addEventListener('DOMContentLoaded', () => {
    const sementeSelect = document.getElementById('semente-info');
    const resultadoDiv = document.getElementById('info-resultado');
    const loadingDiv = document.getElementById('loading-info');

    /**
     * Busca e popula a lista de culturas (sementes) no select.
     */
    fetch('/api/sementes')
        .then(response => response.json())
        .then(data => {
            sementeSelect.innerHTML = '<option value="">Selecione uma cultura</option>';
            data.forEach(semente => {
                const option = document.createElement('option');
                option.value = semente.id;
                option.textContent = semente.nome;
                sementeSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar sementes:', error);
            sementeSelect.innerHTML = '<option value="">Erro ao carregar</option>';
        });

    /**
     * Event listener para quando uma cultura é selecionada.
     * Aciona a busca de informações detalhadas e a análise de IA no backend.
     */
    sementeSelect.addEventListener('change', () => {
        const sementeId = sementeSelect.value;
        resultadoDiv.innerHTML = '';
        
        if (!sementeId) return;

        loadingDiv.classList.remove('hidden');

        fetch(`/api/cultura-info/${sementeId}`)
            .then(response => response.json())
            .then(data => {
                loadingDiv.classList.add('hidden');
                if (data.erro) {
                    throw new Error(data.erro);
                }
                displayCulturaInfo(data);
            })
            .catch(error => {
                loadingDiv.classList.add('hidden');
                resultadoDiv.innerHTML = `<div class="card"><p>Erro ao buscar informações: ${error.message}</p></div>`;
                console.error('Erro:', error);
            });
    });

    /**
     * Exibe as informações da cultura e a análise da IA na página.
     * @param {object} data - O objeto contendo as informações do banco de dados (data.db) e da IA (data.ia).
     */
    function displayCulturaInfo(data) {
        const { db, ia } = data;

        const vulnerabilidadesHtml = `<ul>${ia.vulnerabilidades.map(item => `<li>${item}</li>`).join('')}</ul>`;
        const praticasHtml = `<ul>${ia.praticas_sustentaveis.map(item => `<li>${item}</li>`).join('')}</ul>`;

        const html = `
            <div class="card card-info-cultura">
                <h2>${db.nome} <span>(${db.nome_cientifico})</span></h2>
                <div class="info-section">
                    <h3><i class="fa-solid fa-plant-wilt"></i> Descrição Geral</h3>
                    <p>${db.descricao}</p>
                </div>
                <div class="info-grid">
                    <div class="info-section">
                        <h3><i class="fa-solid fa-earth-americas"></i> Impacto Climático</h3>
                        <p>${ia.impacto_climatico}</p>
                    </div>
                    <div class="info-section">
                        <h3><i class="fa-solid fa-triangle-exclamation"></i> Vulnerabilidades Climáticas</h3>
                        ${vulnerabilidadesHtml}
                    </div>
                </div>
                <div class="info-section">
                    <h3><i class="fa-solid fa-seedling"></i> Práticas Sustentáveis e Resilientes (ODS 13)</h3>
                    ${praticasHtml}
                </div>
                 <div class="info-section">
                    <h3><i class="fa-solid fa-mountain-sun"></i> Condições Ideais</h3>
                    <p><strong>Clima:</strong> ${db.clima_ideal}</p>
                    <p><strong>Solo:</strong> ${db.solo_ideal}</p>
                </div>
            </div>
        `;
        resultadoDiv.innerHTML = html;
    }
});
