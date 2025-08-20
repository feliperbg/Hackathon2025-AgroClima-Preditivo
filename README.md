# 🌱 AgroClima Preditivo

O **AgroClima Preditivo** é uma aplicação web desenvolvida para o **Hackathon 2025**.  
A ferramenta oferece **análises climáticas preditivas** para a agricultura, auxiliando agricultores a tomarem decisões mais informadas sobre o plantio e a gestão de culturas, com foco em **sustentabilidade** e na **Ação Contra a Mudança Global do Clima (ODS 13)**.

---

## 🚀 Funcionalidades Principais

- **Predição Climática Personalizada**  
  Análise de risco climático e janela de plantio recomendada para os próximos **15 dias**, baseada na localização geográfica e na cultura selecionada.

- **Análise de Culturas e Clima**  
  Informações detalhadas sobre impactos climáticos em diferentes culturas, vulnerabilidades e práticas sustentáveis para aumentar a resiliência.

- **Integração com APIs Externas**  
  Dados de fontes confiáveis como:
  - [Visual Crossing Weather](https://www.visualcrossing.com/) (previsões meteorológicas)  
  - [Google Gemini](https://deepmind.google/technologies/gemini/) (análise via IA)  

- **Visualização de Dados**  
  Gráficos interativos de **precipitação** e **temperatura** para facilitar a compreensão das tendências climáticas.

---

## 🛠️ Tecnologias Utilizadas

### Backend
- Node.js  
- Express.js  
- MySQL2  
- dotenv  
- cors  

### Frontend
- HTML5, CSS3, JavaScript (ES6+)  
- Chart.js  
- Font Awesome  

### APIs Externas
- Google Gemini  
- Visual Crossing Weather  

---

## 🔧 Estrutura do Backend (API)

O servidor, desenvolvido em **Express.js**, expõe os seguintes endpoints:

- `GET /api/estados` → Lista de estados do Brasil  
- `GET /api/municipios/:estadoId` → Municípios de um estado específico  
- `GET /api/sementes` → Lista de culturas disponíveis  
- `GET /api/cultura-info/:id` → Informações detalhadas de uma cultura (com análise de IA)  
- `POST /api/predicao` → Análise climática com base em localização e cultura  

---

## ⚙️ Instalação e Execução

### 🔑 Pré-requisitos
- Node.js (>= 14)  
- NPM  
- Servidor MySQL  

### 1. Clonar o Repositório
```bash
git clone https://[URL-DO-SEU-REPOSITORIO]/Hackathon2025-AgroClima-Preditivo.git
cd Hackathon2025-AgroClima-Preditivo
```
2. Instalar Dependências

```bash 
  npm install
```

3. Configuração da Base de Dados

Crie uma base de dados no MySQL

Importe a estrutura e os dados iniciais a partir do arquivo database.sql

4. Configuração das Variáveis de Ambiente

Crie um arquivo .env na raiz do projeto:

# Configuração do Banco de Dados
```bash
  DB_HOST=localhost
  DB_USER=seu_usuario_mysql
  DB_PASSWORD=sua_senha_mysql
  DB_DATABASE=nome_da_sua_base_de_dados
```
# Chaves de API
```bash
GEMINI_API_KEY=sua_chave_de_api_do_gemini
VISUAL_CROSSING_API_KEY=sua_chave_de_api_do_visual_crossing
```
# Porta do Servidor
```bash
PORT=3000
```
###5. Iniciar o Servidor
Produção:
```bash
npm start
```

Desenvolvimento (com reinicialização automática):
```bash
npm run start-nodemon
```

Instalar dependências e iniciar (atalho):
```bash
npm run install-start
```

### 6. Acessar a Aplicação
Abra no navegador o arquivo:
public/index.html
O servidor rodará em: http://localhost:3000

### 📌 Observações
Certifique-se de configurar corretamente as chaves de API para acesso às funcionalidades de previsão climática.
O projeto pode ser facilmente adaptado para deploy em nuvem (Heroku, Vercel, etc.) ou rodar em containers Docker.

### 👨‍💻 Equipe
Projeto desenvolvido durante o Hackathon 2025 com foco em inovação para o agronegócio sustentável.
