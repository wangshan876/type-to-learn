// courseManager.js
let dbModule = null
export async function createCourseManager(containerId,db) {
    dbModule = db
    const container = document.getElementById(containerId);
    renderHTML(container);
    await bindEvents(container);
}

function renderHTML(container) {
    container.innerHTML = `
        <style>
            .course-manager {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .course-manager h1 {
                text-align: center;
                color: #333;
            }
            .course-manager .tabs {
                display: flex;
                justify-content: center;
                margin-bottom: 20px;
            }
            .course-manager .tab-button {
                cursor: pointer;
                padding: 10px 20px;
                border: none;
                background-color: #007bff;
                color: white;
                margin: 0 5px;
                border-radius: 5px;
                transition: background-color 0.3s;
            }
            .course-manager .tab-button:hover {
                background-color: #0056b3;
            }
            .course-manager .tab-button.active {
                background-color: #0056b3;
            }
            .course-manager .tab {
                display: none;
                background-color: white;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .course-manager .active {
                display: block;
            }
            .course-manager label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
            }
            .course-manager input[type="text"],
            .course-manager textarea {
                width: 100%;
                padding: 10px;
                margin-bottom: 10px;
                border: 1px solid #ccc;
                border-radius: 5px;
                box-sizing: border-box;
            }
            .course-manager button {
                padding: 10px 15px;
                border: none;
                background-color: #28a745;
                color: white;
                border-radius: 5px;
                cursor: pointer;
                transition: background-color 0.3s;
            }
            .course-manager button:hover {
                background-color: #218838;
            }
            .course-manager #output {
                background-color: #f8f9fa;
                padding: 10px;
                border-radius: 5px;
                white-space: pre-wrap;
                overflow: auto;
            }
        </style>
        <div class="course-manager">
            <h1>课程管理</h1>
            <div class="tabs">
                <div id="dataEntryButton" class="tab-button ">数据录入</div>
                <div id="courseButton" class="tab-button active" >课程</div>
            </div>
            <div id="saveTab" class="tab ">
                <label for="directoryName">目录名称:</label>
                <input type="text" id="directoryName" placeholder="输入目录名称">
                <label for="lessonContent">课程内容:</label>
                <textarea id="lessonContent" rows="10" placeholder="输入课程内容，每行一个课程"></textarea>
                <button id="saveButton">保存</button>
            </div>
            <div id="loadTab" class="tab active">
                <h2>已保存的课程:</h2>
                <pre id="output" class="course-list"></pre>
                <button id="loadButton">加载所有课程</button>
            </div>
        </div>
    `;
}

async function bindEvents(container) {
  
    const saveTab = container.querySelector('#saveTab');
    const loadTab = container.querySelector('#loadTab');
    const saveButton = container.querySelector('#saveButton');
    const loadButton = container.querySelector('#loadButton');

    // 切换选项卡
    const showTab = (tab) => {
        container.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        container.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        tab.classList.add('active');
    };

    container.querySelector('#dataEntryButton').onclick = () => {
        showTab(saveTab);
        container.querySelector('#dataEntryButton').classList.add('active');
        container.querySelector('#courseButton').classList.remove('active');
    };

    container.querySelector('#courseButton').onclick = async () => {
        showTab(loadTab);
        container.querySelector('#courseButton').classList.add('active');
        container.querySelector('#dataEntryButton').classList.remove('active');
        await loadCourses(); // 加载课程数据
    };

    // 保存课程
    saveButton.onclick = () => {
        const directoryName = container.querySelector('#directoryName').value.trim();
        const lessonContent = container.querySelector('#lessonContent').value.trim();

        if (!directoryName || !lessonContent) {
            alert('目录名称和课程内容不能为空！');
            return;
        }

        const lessonsArray = lessonContent.split('\n').map(item => item.trim()).filter(item => item);
        // 假设 dbModule 是一个已定义的 IndexedDB 模块
        
        dbModule.saveData(lessonsArray, directoryName).then(() => {
            alert('课程保存成功！');
            container.querySelector('#directoryName').value = '';
            container.querySelector('#lessonContent').value = '';
        }).catch(error => {
            console.error('课程保存失败！', error);
        });
    };

    loadButton.onclick = async () => {
        await loadCourses(); // 调用 loadCourses 函数
    };
    await loadCourses()
}

async function loadCourses() {
    // 假设 dbModule 是一个已定义的 IndexedDB 模块
    await dbModule.getAllData().then(results => {
        const output = document.getElementById('output');
        output.innerHTML = ''; // 清空之前的内容

        if (results.length === 0) {
            output.textContent = '没有已保存的课程。';
            return;
        }

        results.forEach((course,index) => {
            const courseElement = document.createElement('div');
            courseElement.id = "course-"+index
            courseElement.style.marginBottom = '20px';
            courseElement.style.padding = '10px';
            courseElement.style.border = '1px solid #ccc';
            courseElement.style.borderRadius = '5px';
            courseElement.style.backgroundColor = '#f8f9fa';

            const courseTitle = document.createElement('h3');
            courseTitle.textContent = `${course.id}`;
            courseElement.appendChild(courseTitle);

            // 创建折叠按钮
            const toggleButton = document.createElement('button');
            toggleButton.textContent = '显示课程内容';
            toggleButton.style.marginRight = '10px';
            toggleButton.style.backgroundColor = '#007bff';
            toggleButton.style.color = 'white';
            toggleButton.style.border = 'none';
            toggleButton.style.borderRadius = '5px';
            toggleButton.style.cursor = 'pointer';
            toggleButton.style.padding = '5px 10px';
            courseElement.appendChild(toggleButton);

            // 创建复制按钮
            const copyButton = document.createElement('button');
            copyButton.textContent = '复制课程内容';
            copyButton.style.backgroundColor = '#28a745';
            copyButton.style.color = 'white';
            copyButton.style.border = 'none';
            copyButton.style.borderRadius = '5px';
            copyButton.style.cursor = 'pointer';
            copyButton.style.padding = '5px 10px';
            courseElement.appendChild(copyButton);

            // 创建课程内容列表
            const lessonList = document.createElement('ul');
            lessonList.style.display = 'none'; // 初始隐藏
            course.data.forEach(lesson => {
                const lessonItem = document.createElement('li');
                lessonItem.textContent = lesson;
                lessonList.appendChild(lessonItem);
            });

            courseElement.appendChild(lessonList);

            // 添加折叠/展开功能
            toggleButton.onclick = () => {
                if (lessonList.style.display === 'none') {
                    lessonList.style.display = 'block';
                    toggleButton.textContent = '隐藏课程内容';
                } else {
                    lessonList.style.display = 'none';
                    toggleButton.textContent = '显示课程内容';
                }
            };

            // 添加复制功能
            copyButton.onclick = () => {
                const lessonTexts = course.data.join('\n'); // 将课程内容合并为字符串
                navigator.clipboard.writeText(lessonTexts).then(() => {
                    alert('课程内容已复制到剪贴板！');
                }).catch(err => {
                    console.error('复制失败:', err);
                });
            };

            output.appendChild(courseElement);
        });
    }).catch(error => {
        alert('加载课程失败！');
    });
}
