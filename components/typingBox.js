const stylestr = `
    .input-container {
      display: flex;
      gap: 5px;
      align-items: end;
      flex-wrap:wrap;
    }

    .input-box {
      width: 30px;
      height: 40px;
      text-align: center;
      border: 1px solid #ccc;
      font-size: 24px;
      outline: none;
      border-width: 0px;
      border-bottom-width: 1px;
    }

    .input-box.error {
      border-color: red;
    }
`;

export function createInputComponent(id = 'typeComponent', targetStrings) {
  const inputContainer = document.getElementById(id);
  // 注入样式
  const style = document.createElement('style');
  style.innerHTML = stylestr;
  document.head.appendChild(style);
  inputContainer.classList.add('input-container');

  let currentStringIndex = 0; // 当前字符串索引

  function loadString(targetString) {
    inputContainer.setAttribute('data-sentence', targetString);
    inputContainer.innerHTML = ''; // 清空输入框
    for (let i = 0; i < targetString.length; i++) {
      if (',.?!、";，。！？「」'.includes(targetString[i])) {
        const span = document.createElement('span');
        span.textContent = targetString[i];
        inputContainer.appendChild(span);
      } else {
        const inputBox = document.createElement('input');
        inputBox.type = 'text';
        inputBox.className = 'input-box';
        inputBox.dataset.index = i; // 存储当前输入框的索引
        inputContainer.appendChild(inputBox);

        // 绑定输入事件
        inputBox.addEventListener('input', function (e) {
          if(!inputContainer.contains(e.target)) return;
          if (this.isComposing) return; // 如果正在输入中文，直接返回

          const currentIndex = this.dataset.index;
          const currentValue = this.value;

          // 校验输入
          if (currentValue === targetString[currentIndex]) {
            this.classList.remove('error');
          } else {
            this.classList.add('error');
          }
        });

        // 处理汉字输入法的事件
        inputBox.addEventListener('compositionstart', function (e) {
          if(!inputContainer.contains(e.target)) return;
          this.isComposing = true; // 标记正在输入
        });

        inputBox.addEventListener('compositionend', function (e) {
          if(!inputContainer.contains(e.target)) return;
          this.isComposing = false; // 标记输入结束
          const currentIndex = this.dataset.index;
          const currentValue = this.value;

          // 逐个校验输入的字符
          for (let i = 0; i < currentValue.length; i++) {
            const charIndex = parseInt(currentIndex) + i;
            if (charIndex < targetString.length) {
              const nextInputBox = inputContainer.children[charIndex];
              if (currentValue[i] === targetString[charIndex]) {
                // 输入正确，填入下一个输入框
                nextInputBox.value = currentValue[i];
                nextInputBox.classList.remove('error');
              } else {
                // 输入错误，添加错误样式
                nextInputBox.classList.add('error');
                nextInputBox.focus();
                return; // 如果有错误，直接返回
              }
            }
          }

          // 自动聚焦下一个输入框
          let nextInput = inputContainer.children[parseInt(currentIndex) + currentValue.length];
          while (nextInput && nextInput.tagName !== 'INPUT') {
            nextInput = nextInput.nextElementSibling;
          }

          // 只在下一个输入框为空时聚焦
          if (nextInput) {
            nextInput.focus();
          } else {
            // 如果当前字符串输入完成，加载下一个字符串
            currentStringIndex++;
            if (currentStringIndex < targetStrings.length) {
              setTimeout(() => {
                loadString(targetStrings[currentStringIndex]);
                inputContainer.children[0].focus(); // 聚焦第一个输入框
              }, 1000); 
            }
          }
        });

        // 绑定聚焦事件
        inputBox.addEventListener('focus', function () {
          this.classList.remove('error'); // 聚焦时移除错误样式
          focusFirstInput()
        });
      }
    }
  }


  // 加载第一个字符串
  loadString(targetStrings[currentStringIndex]);

  // 绑定keydown事件
// 绑定keydown事件
document.addEventListener('keydown', function (event) {
  if(!inputContainer.contains(event.target)) return;
  // 检查是否按下字母或数字键
  if (event.key.length === 1) {
    focusFirstInput();
  }

  // 检查是否按下删除键
  if (event.key === 'Backspace') {
    for (let i = inputContainer.children.length - 1; i >= 0; i--) {
      const inputBox = inputContainer.children[i];
      if (inputBox.value !== '') {
        inputBox.value = ''; // 清空值
        inputBox.focus(); // 聚焦当前清空的输入框
        break; // 只清空最后一个非空输入框
      }
    }
  }

  // 处理方向键
  const inputs = inputContainer.getElementsByTagName('input');
  let focusedIndex = Array.from(inputs).findIndex(input => input === document.activeElement);

  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault(); // 阻止默认行为
    if (focusedIndex < inputs.length - 1) {
      inputs[focusedIndex + 1].focus(); // 聚焦下一个输入框
    }
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault(); // 阻止默认行为
    if (focusedIndex > 0) {
      inputs[focusedIndex - 1].focus(); // 聚焦上一个输入框
    }
  } 
});


  function focusFirstInput() {
    // 聚焦到下一个待输入的输入框
    const inputs = inputContainer.getElementsByTagName('input');
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].value === '') {
        inputs[i].focus();
        break;
      }
    }
  }
}
