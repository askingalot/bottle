dynamicallyImportFunctions()
  .then(functions => {
    renderFunctionList(functions);
    addFunctionSelectEventListener(functions);
  });


async function dynamicallyImportFunctions() {
  // This whole thing relies on parsing the directory listing provided by `serve`
  // It assumes all the function modules are in a directory called 'functions'
  //  Do NOT put an  index.html' file in the 'functions' directory
  //  If you do 'serve' will not serve up it's custom directory listing page.

  const resp = await fetch('./functions');
  const funIndexText = await resp.text();

  // The directory listing provided by `serve` creates links to each file in the files
  //  They look something like this: 
  //   <a href="/functions/file.js" class="file js" title="file.js">file.js</a>
  //  Here we use the 'title' attribute to get the filename
  const jsPaths = 
    [...funIndexText.matchAll(/title="([^.]+)\.js"/g)]
    .map(match => `./functions/${match[1]}.js`);

  // Here we dynamically import each of the js modules found above 
  //  and merge them into a single object
  const modules = await Promise.all(jsPaths.map(path => import(path)));
  const combined = modules.reduce((acc, mod) => ({ ...acc, ...mod }), {});

  // Remove anything that isn't a function
  const functions = Object.entries(combined)
    .filter(([key, val]) => typeof val === 'function')
    .reduce((funs, [key, val]) => {
      funs[key] = val;
      return funs;
    }, {});

  return functions;
}


function renderFunctionList(functions) {
  const el = document.querySelector('#function-list__body');
  el.innerHTML =
    Object.values(functions)
      .sort((funA, funB) => funA.name < funB.name ? -1 : 1)
      .map(functionCard)
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


function addFunctionSelectEventListener(functions) {
  let functionRunnerEventListener = null;

  const el = document.querySelector('#function-list');
  el.addEventListener('click', evt => {
    const section = getNearestAncestorByTag(evt.target, 'section');
    if (!section) {
      return;
    }

    const selectedFunction = functions[section.id];

    renderFunctionDisplay(selectedFunction);
    renderFunctionRunner(selectedFunction);
    clearFunctionResult();

    removeFunctionRunnerEventListener(functionRunnerEventListener);
    functionRunnerEventListener = addFunctionRunnerEventListener(selectedFunction);
  });
}


function renderFunctionDisplay(fun) {
  console.log(window.Prism);
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


function addFunctionRunnerEventListener(fun) {
  function listener(evt) {
    if (evt.target.id !== 'run') {
      return;
    }

    const args = Array.from(document.querySelectorAll('.arg'))
      .sort((inputA, inputB) => parseInt(inputA.id) - parseInt(inputB.id))
      .map(input => input.value)
      .map(parseArg);

    const result = fun(...args);
    renderFunctionResult(result);
  }

  const el = document.querySelector('#function-runner');
  el.addEventListener('click', listener);

  return listener;
}


function removeFunctionRunnerEventListener(listener) {
  const el = document.querySelector('#function-runner');
  el.removeEventListener('click', listener);
}


function renderFunctionResult(result) {
  const el = document.querySelector('#function-runner__result');
  el.innerHTML = typeof result !== 'string'
    ? JSON.stringify(result)
    : result;
}


function clearFunctionResult() {
  const el = document.querySelector('#function-runner__result');
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
