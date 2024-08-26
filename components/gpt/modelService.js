export async function fetchModels(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        return data.models || [];
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        return [];
    }
}

export function getModel(provider, ollamaModelSelectValue) {
    if (provider === 'deepseek') {
        return 'deepseek-chat';
    } else if (provider === 'ollama') {
        return ollamaModelSelectValue;
    }
    return null;
}
