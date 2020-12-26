import * as functions from './functions.js';

renderFunctionList(functions);
addFunctionSelectEventListener(functions);


function addFunctionSelectEventListener(functions) {
  let functionRunnerEventListener = null;

  const el = document.querySelector('#function-list');
  el.addEventListener('click', evt => {
    const section = getNearestAncestorByTag(evt.target, 'section');
    if (!section) {
      return;
    }
    const selectedFunction = functions[section.id];

    renderFunctionRunner(selectedFunction);

    removeFunctionRunnerEventListener(functionRunnerEventListener);
    functionRunnerEventListener = addFunctionRunnerEventListener(selectedFunction);
  });
}


function renderFunctionList(functions) {
  const el = document.querySelector('#function-list');
  el.innerHTML =
    Object.values(functions)
      .filter(prop => typeof prop === 'function')
      .map(functionCard)
      .join('');
}


function functionCard(fun) {
  return `
    <section id="${fun.name}" class="function-card">
      <div class="function-card__name">
        ${fun.name}()
      </div>
      <div class="function-card__args">
        Takes ${fun.length} ${fun.length === 1 ? 'arg' : 'args'}
      </div>
      <div class="function-card__body">
        <code>
          ${fun.toString()}
        </code>
      </div>
    </section>
  `;
}

function renderFunctionRunner(fun) {
  const el = document.querySelector('#function-runner__args');
  let html = '<ol>';
  for (let i=0; i<fun.length; i++) {
    html += `<li><input id="${i}" class="arg" /></li>`
  }
  html += '</ol>';
  html += '<button id="run">Execute</button>';
  el.innerHTML = html;
}


function addFunctionRunnerEventListener(fun) {
  function listener(evt) {
    if (evt.target.id !== 'run') {
      return;
    }

    const args = Array.from(document.querySelectorAll('.arg'))
      .sort((inputA, inputB) => parseInt(inputA.id) - parseInt(inputB.id))
      .map(input => input.value);

    const result = fun(...args);

    console.log(result);
  }

  const el = document.querySelector('#function-runner');
  el.addEventListener('click', listener);

  return listener;
}


function removeFunctionRunnerEventListener(listener){
  const el = document.querySelector('#function-runner');
  el.removeEventListener('click', listener);
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