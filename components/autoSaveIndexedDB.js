class IndexedDBModule {
    constructor(dbName, storeName) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.db = null;
        this.isDbInitialized = false; // 添加标志
        this.init();
    }

    init() {
        return new Promise((resolve, reject) => {
            const dbRequest = indexedDB.open(this.dbName, 1);

            dbRequest.onupgradeneeded = (event) => {
                const db = event.target.result;
                db.createObjectStore(this.storeName, { keyPath: "id" });
            };

            dbRequest.onsuccess = (event) => {
                this.db = event.target.result;
                this.isDbInitialized = true; // 数据库初始化成功
                console.log(`${this.dbName} 数据库已打开`);
                resolve();
            };

            dbRequest.onerror = (event) => {
                console.error("打开数据库时出错:", event.target.error);
                reject(event.target.error);
            };
        });
    }

    // 确保数据库已打开
    ensureDbInitialized() {
        if (!this.isDbInitialized) {
            return this.init();
        }
        return Promise.resolve(); // 数据库已打开，返回已解决的 Promise
    }

    saveData(data,keypath = this.storeName) {
        return this.ensureDbInitialized().then(() => {
            const transaction = this.db.transaction([this.storeName], "readwrite");
            const store = transaction.objectStore(this.storeName);
            console.log({ id: keypath, data: data })
            store.put({ id: keypath, data: data });

            return new Promise((resolve, reject) => {
                transaction.oncomplete = () => {
                    console.log("数据已保存到 IndexedDB:", data);
                    resolve();
                };

                transaction.onerror = (event) => {
                    console.error("保存数据时出错:", event.target.error);
                    reject(event.target.error);
                };
            });
        });
    }

    getAllData() {
        return this.ensureDbInitialized().then(() => {
            const transaction = this.db.transaction([this.storeName], "readonly");
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            return new Promise((resolve, reject) => {
                request.onsuccess = (event) => {
                    resolve(event.target.result);
                };

                request.onerror = (event) => {
                    console.error("读取数据时出错:", event.target.error);
                    reject(event.target.error);
                };
            });
        });
    }

    handleSaveButtonClick(containerId) {
        const data = {};
        const container = document.getElementById(containerId);
        const inputs = container.querySelectorAll("input, select, textarea"); // 添加 textarea

        inputs.forEach(input => {
            if (input.type === "checkbox") {
                if (input.checked) {
                    if (!data[input.name]) {
                        data[input.name] = [];
                    }
                    data[input.name].push(input.value);
                }
            } else if (input.type === "radio") {
                if (input.checked) {
                    data[input.name] = input.value;
                }
            } else if (input.tagName.toLowerCase() === "textarea") { // 处理 textarea
                data[input.id || input.name] = input.value;
            } else {
                data[input.id || input.name] = input.value;
            }
        });

        this.saveData(data).catch(error => {
            console.error("保存数据时出错:", error);
        });
    }

    initializeFormFromStore(containerId) {
        return this.ensureDbInitialized().then(() => {
            const transaction = this.db.transaction([this.storeName], "readonly");
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            return new Promise((resolve, reject) => {
                request.onsuccess = (event) => {
                    const results = event.target.result;
                    if (results.length > 0) {
                        const data = results[0].data;
                        const container = document.getElementById(containerId);

                        for (const key in data) {
                            const element = container.querySelector(`[name="${key}"], [id="${key}"]`);
                            if (element) {
                                if (element.type === "checkbox") {
                                    if (Array.isArray(data[key])) {
                                        data[key].forEach(value => {
                                            const checkbox = container.querySelector(`[name="${key}"][value="${value}"]`);
                                            if (checkbox) {
                                                checkbox.checked = true;
                                            }
                                        });
                                    }
                                } else if (element.type === "radio") {
                                    const radio = container.querySelector(`[name="${key}"][value="${data[key]}"]`);
                                    if (radio) {
                                        radio.checked = true;
                                    }
                                } else if (element.tagName.toLowerCase() === "textarea") { // 处理 textarea
                                    element.value = data[key];
                                } else {
                                    element.value = data[key];
                                }
                            }
                        }
                        resolve();
                    } else {
                        console.log("没有找到数据");
                        resolve(); // 仍然解决 Promise
                    }
                };

                request.onerror = (event) => {
                    console.error("读取数据时出错:", event.target.error);
                    reject(event.target.error);
                };
            });
        });
    }
}

export { IndexedDBModule };
