
getAvailableModules()
  .then(modulesInfo => {
    renderModuleSelect(modulesInfo);
    addModuleSelectListener(modulesInfo);
  });


async function getAvailableModules() {
  const resp = await fetch('/modules');
  return await resp.json();
}


function renderModuleSelect(modulesInfo) {
  const el = document.getElementById('function-list__header--select-container');
  el.innerHTML = `
  <select id="function-list__header--select">
    <option value="">Please select a module</option>
    ${modulesInfo
      .map(m => `<option value="${m.path}">${m.name}</option>`)
      .join('')}
  </select>`;
}


function addModuleSelectListener(modulesInfo) {
  let functionSelectListenerInfo = null

  const el = document.getElementById('function-list__header--select');
  el.addEventListener('change', evt => {
    removeListener(functionSelectListenerInfo);
    clearAllPanels();

    if (!evt.target.value) {
      return;
    }

    const selectedModule = modulesInfo.find(mi => mi.path === evt.target.value);

    importFunctions(selectedModule)
      .then(functionInfos => {
        renderFunctionList(functionInfos);
        functionSelectListenerInfo = addFunctionSelectListener(functionInfos);
      });
  });
}


async function importFunctions(moduleInfo) {
  // dynamically import the module
  const module = await import(moduleInfo.path);

  // Remove anything that isn't a function and sort alphabetically
  return Object.values(module)
    .filter(val => typeof val === 'function')
    .sort((funA, funB) => funA.name < funB.name ? -1 : 1)
    .map(fun => ({
      moduleName: moduleInfo.name,
      function: fun
    }));
}


function renderFunctionList(functionInfos) {
  const el = document.querySelector('#function-list__body');
  el.innerHTML = functionInfos
    .map(fi => functionCard(fi.function))
    .join('');
}


function functionCard(fun) {
  return `
    <section id="${fun.name}" class="function-card">
      <div class="function-card__name">
        ${fun.name}${extractParamList(fun)}
      </div>
    </section>
  `;
}


function addFunctionSelectListener(functionInfos) {
  let functionRunnerListenerInfo = null;

  function listener(evt) {
    const section = getNearestAncestorByTag(evt.target, 'section');
    if (!section) {
      return;
    }

    const selectedFunctionInfo =
      functionInfos.find(fi => fi.function.name === section.id);

    renderFunctionDisplay(selectedFunctionInfo.function);
    renderFunctionRunner(selectedFunctionInfo.function);
    clearPanel('#function-result');

    removeListener(functionRunnerListenerInfo);
    functionRunnerListenerInfo = addFunctionRunnerListener(selectedFunctionInfo);
  }

  const selector = '#function-list';

  const el = document.querySelector(selector);
  el.addEventListener('click', listener);

  return { selector, listener, type: 'click' };
}


function renderFunctionDisplay(fun) {
  const el = document.querySelector('#function-display');
  el.innerHTML = `
    <h2>${fun.name}</h2>
    <hr/>
    <pre>
      <code>
${window.Prism.highlight(fun.toString(), window.Prism.languages.javascript, 'javascript')}
      </code>
    </pre>
  `;
}


function renderFunctionRunner(fun) {
  const el = document.querySelector('#function-runner__args');

  let html = `<h2>Function <code>${fun.name}()</code> accepts no arguments</h2>`;

  if (fun.length) {
    html = `<h2>Please enter the argument${fun.length === 1 ? '' : 's'} for <code>${fun.name}()</code>:</h2>`;

    html += '<ol>';
    for (let i = 0; i < fun.length; i++) {
      html += `<li><textarea id="${i}" class="arg"></textarea></li>`
    }
    html += '</ol>';
  }

  html += `<button id="run">Execute ${fun.name}()</button>`;
  el.innerHTML = html;

  const firstInput = document.querySelector('.arg');
  firstInput?.focus();
}


function addFunctionRunnerListener(functionInfo) {
  async function listener(evt) {
    if (evt.target.id !== 'run') {
      return;
    }

    const args = Array.from(document.querySelectorAll('.arg'))
      .sort((inputA, inputB) => parseInt(inputA.id) - parseInt(inputB.id))
      .map(input => input.value)
      .map(parseArg);

    const result = functionInfo.function(...args);
    const testResult = await runTest(functionInfo.moduleName, functionInfo.function.name, args);
    renderResults(result, testResult);
  }

  const selector = '#function-runner';

  const el = document.querySelector(selector);
  el.addEventListener('click', listener);

  return { selector, listener, type: 'click' };
}


function renderResults(result, testResult) {
  const containerClass = checkTest(result, testResult) ? 'success' : 'fail';
  const el = document.querySelector('#function-result');
  el.innerHTML = `
    <section id="function-result__container" class="${containerClass}">
      <div id="function-result__result"> 
        ${printableResult(result)} 
      </div>
      <div id="function-result__test-result"> 
        ${printableResult(testResult)}
      </div>
    </section>`;
}


function checkTest(result, testResult) {
  return JSON.stringify(result) === JSON.stringify(testResult);
}


function printableResult(result) {
  if (typeof result === 'string') {
    if (result.trim() === '') {
      return '<i>--- Result contains only whitespace ---</i>';
    }
    return result;
  }

  return JSON.stringify(result);
}


async function runTest(modName, funName, args) {
  const functionCallInfo = {
    module: modName,
    function: funName,
    args: args
  };

  const res = await fetch('/test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(functionCallInfo)
  });

  return await res.json();
}


function removeListener(listenerInfo) {
  if (listenerInfo) {
    const el = document.querySelector(listenerInfo.selector)
    el.removeEventListener(listenerInfo.type, listenerInfo.listener);
  }
}


function clearAllPanels() {
  const panelSelectors = [
    '#function-result', '#function-runner__args',
    '#function-display', '#function-list__body'];

  panelSelectors.forEach(clearPanel);
}


function clearPanel(selector) {
  const el = document.querySelector(selector);
  el.innerHTML = "";
}


function getNearestAncestorByTag(el, tagname) {
  if (!el?.tagName) {
    return null;
  }

  if (el.tagName.toUpperCase() === tagname.toUpperCase()) {
    return el;
  }

  return getNearestAncestorByTag(el.parentNode, tagname);
}


function extractParamList(fun) {
  const funString = fun.toString();

  const openParenPos = funString.indexOf('(');
  const closeParenPos = funString.indexOf(')');

  return funString.substring(openParenPos, closeParenPos + 1);
}


function parseArg(stringArg) {
  try {
    return JSON.parse(stringArg);
  } catch (error) {
    console.warn(`Failed tp parse "${stringArg}" as JSON. Treating value as string.`, error)
    return stringArg;
  }
}
