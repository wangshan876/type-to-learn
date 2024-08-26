// textToSpeech.js
const TextToSpeech = (function () {
    const synth = window.speechSynthesis;
    let voices = [];

    function injectStyles() {
        const styles = `
            select, button {
                margin-top: 10px;
            }
        `;
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
    }

    function injectHTML(containerId) {
        const html = `
            <div>
            <label for="languageSelect">选择语言:</label>
            <select id="languageSelect">
                <option value="all">全部讲述人</option>
                <option value="zh-CN">中文</option>
                <option value="en-US">英语</option>
                <option value="es-ES">西班牙语</option>
                <option value="ja-JP" selected>日语</option>
            </select>
            </div>
            <div>
            <label for="voiceSelect">选择讲述人:</label>
            <select id="voiceSelect"></select>
            </div>
        `;
        document.getElementById(containerId).innerHTML = html;
    }

    function populateVoiceList() {
        voices = synth.getVoices();
        const selectedLanguage = document.getElementById('languageSelect').value;
        const voiceSelect = document.getElementById('voiceSelect');
        voiceSelect.innerHTML = '';

        voices.forEach((voice) => {
            if (selectedLanguage === 'all' || voice.lang === selectedLanguage) {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} (${voice.lang})`;
                voiceSelect.appendChild(option);
            }
        });
    }

    function speak(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoice = document.getElementById('voiceSelect').value;
        utterance.voice = voices.find(voice => voice.name === selectedVoice);
        synth.speak(utterance);
    }

    function init(containerId) {
        injectStyles();
        injectHTML(containerId);
        populateVoiceList();

        // Populate voices when they are loaded
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = populateVoiceList;
        }

        // 监听语言选择变化
        document.getElementById('languageSelect').addEventListener('change', populateVoiceList);

    }

    return {
        init,
        speak
    };
})();


export default TextToSpeech;
