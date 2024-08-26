// chatModule.js
// const chatModule = createChatModule('chat-container');
// chatModule.chat
import { fetchModels, getModel } from './modelService.js';
import { generateChatCompletion } from './chatService.js'; 
export function createChatModule(id) {
    const container = document.getElementById(id);
    container.innerHTML = getHTML();

    const apiSelect = container.querySelector('#api-select');
    const ollamaModelsSelect = container.querySelector('#ollama-models-select');
    const ollamaModelsDiv = container.querySelector('#ollama-models');
    const deepseekApiKeyInput = document.getElementById('deepseek-apikey-container');
    const deepseekApiKey = deepseekApiKeyInput.querySelector('#deepseek-apikey')
    const errorMessage = container.querySelector('#error-message');
    function setGptSelectStatus(){
        if (apiSelect.value === "ollama") {
            if (ollamaModelsSelect.length === 0) {
                loadModels();
            }
            ollamaModelsDiv.style.display = "block";
            deepseekApiKeyInput.style.display = "none";
        } else if (apiSelect.value === "deepseek") {
            ollamaModelsDiv.style.display = "none";
            deepseekApiKeyInput.style.display = "block";
        }
    }
    apiSelect.addEventListener('change', () => {
        setGptSelectStatus()
    });

    initVisibility();

    function getHTML() {
        return `
            <div style="display: flex;" class="box">
                <div class="api-providers">
                    <label for="api-select">服务提供商:</label>
                    <select id="api-select">
                        <option value="ollama" selected >ollama</option>
                        <option value="deepseek" >deepseek</option>
                    </select>
                </div>
                <div id="ollama-models" style="display: none;">
                    <label for="ollama-models-select">ollama模型:</label>
                    <select id="ollama-models-select"></select>
                    <div id="error-message" style="color: red; display: none;"></div>
                </div>
                <div id="deepseek-apikey-container" style="display: none;">
                    <label for="deepseek-apikey">deepseek apikey:</label>
                    <input id="deepseek-apikey" type="password"></input>
                </div>
            </div>
        `;
    }

    async function loadModels() {
        errorMessage.style.display = 'none'; // 隐藏错误消息

        try {
            const models = await fetchModels('http://localhost:11434/api/tags');
            ollamaModelsSelect.innerHTML = ''; // 清空现有选项
            models.forEach((model,i) => {
                const option = document.createElement('option');
                option.value = model.name;
                option.textContent = model.name;
                if(i==0) option.selected = true;
                ollamaModelsSelect.appendChild(option);
            });
            // ollamaModelsDiv.style.display = 'block'; // 显示模型选择
        } catch (error) {
            console.error('获取模型失败:', error);
            errorMessage.textContent = '获取模型失败，请稍后再试。';
            errorMessage.style.display = 'block'; // 显示错误消息
        }
    }

    function initVisibility() {
        setGptSelectStatus()
    }

    async function chat(systemMessage, userMessage, displayNodeId) {
        const api = apiSelect.value;
        let ollamaModel = ollamaModelsSelect.value
        if(!ollamaModel) {
            await loadModels()
            ollamaModel = ollamaModelsSelect.value
        }
        const _model = getModel(api, ollamaModel)
        const response = await generateChatCompletion(_model,deepseekApiKey.value, systemMessage, userMessage, displayNodeId);
        return response;
    }
    loadModels()
    return { chat };
}
