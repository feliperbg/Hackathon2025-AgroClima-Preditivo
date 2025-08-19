/**
 * @file Script principal da página de entrada da aplicação.
 * @description Este script gerencia a interatividade do formulário de seleção de localidade e cultura.
 * Ele carrega dinamicamente os estados e municípios, e, após a seleção do usuário,
 * envia os dados para a API de predição e redireciona para a página de resultados.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Mapeamento de elementos do DOM
    const estadoSelect = document.getElementById('estado');
    const municipioSelect = document.getElementById('municipio');
    const sementeSelect = document.getElementById('semente');
    const form = document.getElementById('location-form');
    const loadingDiv = document.getElementById('loading');
    const formDiv = document.getElementById('predicao-form');

    /**
     * Busca e popula a lista de estados no select.
     */
    fetch('/api/estados')
        .then(response => response.json())
        .then(data => {
            estadoSelect.innerHTML = '<option value="">Selecione um estado</option>';
            data.forEach(estado => {
                const option = document.createElement('option');
                option.value = estado.id;
                option.textContent = estado.nome;
                estadoSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar estados:', error);
            estadoSelect.innerHTML = '<option value="">Erro ao carregar</option>';
        });

    /**
     * Event listener para quando um estado é selecionado.
     * Busca os municípios correspondentes e os popula no select de municípios.
     */
    estadoSelect.addEventListener('change', () => {
        const estadoId = estadoSelect.value;
        municipioSelect.innerHTML = '<option value="">A carregar...</option>';
        municipioSelect.disabled = true;
        sementeSelect.innerHTML = '<option value="">Selecione um município</option>';
        sementeSelect.disabled = true;

        if (estadoId) {
            fetch(`/api/municipios/${estadoId}`)
                .then(response => response.json())
                .then(data => {
                    municipioSelect.innerHTML = '<option value="">Selecione um município</option>';
                    data.forEach(municipio => {
                        const option = document.createElement('option');
                        option.value = municipio.id;
                        option.dataset.lat = municipio.latitude;
                        option.dataset.lon = municipio.longitude;
                        option.textContent = municipio.nome;
                        municipioSelect.appendChild(option);
                    });
                    municipioSelect.disabled = false;
                })
                .catch(error => {
                    console.error('Erro ao carregar municípios:', error);
                    municipioSelect.innerHTML = '<option value="">Erro ao carregar</option>';
                });
        }
    });
    
    /**
     * Event listener para quando um município é selecionado.
     * Busca as culturas (sementes) disponíveis e as popula no select de culturas.
     */
    municipioSelect.addEventListener('change', () => {
        sementeSelect.innerHTML = '<option value="">A carregar...</option>';
        sementeSelect.disabled = true;

        if (municipioSelect.value) {
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
                    sementeSelect.disabled = false;
                })
                .catch(error => {
                    console.error('Erro ao carregar sementes:', error);
                    sementeSelect.innerHTML = '<option value="">Erro ao carregar</option>';
                });
        }
    });

    /**
     * Event listener para a submissão do formulário.
     * Coleta os dados, envia para a API de predição e redireciona para a página de resultados.
     */
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const selectedMunicipio = municipioSelect.options[municipioSelect.selectedIndex];
        const lat = selectedMunicipio.dataset.lat;
        const lon = selectedMunicipio.dataset.lon;
        const sementeId = sementeSelect.value;

        if (!lat || !lon || !sementeId) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        formDiv.classList.add('hidden');
        loadingDiv.classList.remove('hidden');

        try {
            const response = await fetch('/api/predicao', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat, lon, sementeId }),
            });

            const data = await response.json();
            if (!response.ok || data.erro) {
                throw new Error(data.erro || 'Falha ao buscar predição.');
            }
            
            sessionStorage.setItem('predicaoData', JSON.stringify(data));
            window.location.href = '/predicao';

        } catch (error) {
            console.error('Erro ao gerar predição:', error);
            alert(`Ocorreu um erro: ${error.message}. Tente novamente.`);
            loadingDiv.classList.add('hidden');
            formDiv.classList.remove('hidden');
        }
    });
});
