import TextToSpeech from "./components/textToSpeech.js";
import { createChatModule } from './components/gpt/chatView.js';
import { createInputComponent } from "./components/typingBox.js";
import {japanese_sentences} from "./sentences.js";
import { IndexedDBModule } from './components/autoSaveIndexedDB.js';
import PopupMenu  from './components/popMenu.js';
import { createCourseManager } from './components/courseManager.js';


const chatModule = createChatModule('chat-container');
const typeComponent = document.getElementById('typeComponent');
const transcard = document.getElementById('transcard');
const languageSelect = document.getElementById('languageSelect');
const saveConfigBtn = document.getElementById('saveConfig');
const readConfigBtn = document.getElementById('readConfig');
const hint = document.getElementById('hint');
const hintPromptTA = document.getElementById('hint-prompt');
const translatePromptTA = document.getElementById('translate-prompt');
const courseSelect = document.getElementById('course-select'); 
let previousValue = typeComponent.getAttribute('data-sentence');
let sentences = null;
const radios = document.querySelectorAll('input[type="radio"]');
const configToggleBtn = document.getElementById('config-toggle-btn');
const lessonsToggleBtn = document.getElementById('lessons-toggle-btn');
const dbname = "typeDatabase",storeName = "configs",lessonsDBName='lessonsDatabase',lessonsStoreName = 'lessons'

let translatePrompt=`
    请将用户输入的句子逐字翻译成中文，不要改变句子的结构或意思,输出时只输出翻译后的内容，不要输出其他内容。
`
// const hintPrompt=`列出下面句子的难点词汇，标明发音、含义、动词变化和句型结构，输出时只输出词汇、发音、含义、动词变化和句型结构，不要输出其他内容`
let hintPrompt=`请分析输入日语句子的句型结构，输出时只输出句型结构，不要输出其他内容`

// 更新翻译内容
async function updateTranslation(sentence) {
    if(!sentence) return;
    const text = sentence?sentence: document.getElementById('typeComponent').getAttribute('data-sentence');
    transcard.innerHTML = ''
    translatePromptTA.value && (translatePrompt = translatePromptTA.value)
    hintPromptTA.value && (hintPrompt = hintPromptTA.value)
    await chatModule.chat(translatePrompt,text,'transcard');
    await chatModule.chat(hintPrompt,typeComponent.getAttribute('data-sentence'),'hint');
    

}
// 获取选中值的函数
function getSortValue() {
    let selectedValue;
    radios.forEach(radio => {
        if (radio.checked) {
            selectedValue = radio.value; // 获取选中的值
        }
    });
    return selectedValue;
}
function sentenceSort(){
    const selectedValue = getSortValue();
    if(selectedValue === '随机'){
        getSentences()
        sentences = shuffle(sentences);
    }else if(selectedValue === '顺序'){
        getSentences();
    }   
}

function observerSentenceChange() {

    // 创建一个观察者实例并传入回调函数
    const observer = new MutationObserver((mutationsList) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-sentence') {
                const currentValue = typeComponent.getAttribute('data-sentence');
                if (currentValue !== previousValue) {
                    // 处理数据变化
                    updateTranslation(currentValue);
                    // 更新上一个值
                    previousValue = currentValue;
                }
            }
        }
    });

    // 配置观察选项
    const config = { attributes: true };

    // 开始观察目标节点
    observer.observe(typeComponent, config);

    // 停止观察（如果需要，可以取消注释这行代码）
    // observer.disconnect();
}
function sentenceSortEvent(){
    // 添加 change 事件监听器
    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            // 输出当前选中的单选框的值
            if(this.value === '随机'){
                getSentences()
                sentences = shuffle(sentences);
            }else if(this.value === '顺序'){
                getSentences();
            }        
            // 你可以在这里添加其他逻辑，比如根据选中的单选框执行某些操作
        });
    });


}
function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
        // 生成一个随机索引
        const j = Math.floor(Math.random() * (i + 1));
        // 交换元素
        [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
}

function addEventListeners(dbModule,menu,lessonsManager){
    saveConfigBtn.onclick = function() {
        dbModule.handleSaveButtonClick("configs");
    };
    readConfigBtn.onclick = function() {
        dbModule.initializeFormFromStore("configs").then(() => {
            console.log("表单初始化完成");
        });
    };
    configToggleBtn.onclick = function(e) {
        e.preventDefault()
        menu.toggle();
    };
    lessonsToggleBtn.onclick = function(e) {
        e.preventDefault()
        lessonsManager.toggle();
    };
}

function init_course_select(){ //courseSelect 
    const lessonsManager = document.querySelector('#lessons-manager');
    const courseList = lessonsManager.querySelector('.course-list')
    const childElements = courseList.children;
    
    for (let child of childElements) {
        if (child.id) {
            const option = document.createElement("option");
            const title = child.querySelector('h3').textContent
            option.value = child.id;
            option.textContent = title; // 显示子元素的id
            courseSelect.appendChild(option);
        }
    }
    // 监听select控件的变化
    courseSelect.addEventListener("change", function() {
        getSentences()
    });
 }
 
function getSentences(){
        const _select = document.getElementById('course-select')
        const selectedId = _select.value;
        if(_select.value == 'none') {
            sentences = japanese_sentences
            return;
         }
        const selectedChild = document.getElementById(selectedId);
        
        if (selectedChild) {
            const ul = selectedChild.querySelector('ul')
            const lis =  ul.getElementsByTagName('li');
            sentences = Array.from(lis).map(li => li.textContent);
        } else {
            console.log('error')
        }
    
}
//界面数据初始化，以及需要indexdb数据处理的事件设置
async function dataInit(){
    // 创建并 配置菜单 和 课程菜单 的IndexedDB存储模块
    const dbModule = new IndexedDBModule(dbname, storeName);
    const lessonsdbModule = new IndexedDBModule(lessonsDBName, lessonsStoreName);
    
    // 初始化课程管理界面 和 相关数据
    await createCourseManager('lessons-manager', lessonsdbModule); 
    
    // 读取课程管理 来 初始化 配置菜单中的 课程选择 下拉列表选项，
    init_course_select();
    
    // 将配置菜单和课程管理配置为可弹出菜单
    const menu = new PopupMenu('menu', { toggleButtonId: 'config-toggle-btn', position: 'left', useIndicator: false, enableEdgeOpen: false });
    const lessonsManager = new PopupMenu('lessons-manager', { toggleButtonId: 'lessons-toggle-btn', position: 'left', useIndicator: false, enableEdgeOpen: false });
    
    // 从 IndexedDB 中初始化配置表单
    await dbModule.initializeFormFromStore("configs");
    
    // 初始化句子列表
    getSentences();
    
    // 添加事件监听器，用于处理用户交互
    addEventListeners(dbModule, menu, lessonsManager);
    
    sentenceSortEvent(); // 添加配置页排序事件
    sentenceSort(); //句子排序
 }
 
function speakerBuild(){
    const tts = TextToSpeech;
    tts.init('ttsContainer');
    const speakButton = document.querySelector('#speakButton');
    speakButton.addEventListener('click', () => {
        const text = typeComponent.getAttribute('data-sentence');
        tts.speak(text);
    });
 }
async function build() {
    await dataInit()  //界面控件数据初始化，及事件添加
    speakerBuild() //speech
    
    // 打字机组件构建
    createInputComponent("typeComponent", sentences);
    
    // 翻译卡片相关
    updateTranslation();
    observerSentenceChange();
}

build()