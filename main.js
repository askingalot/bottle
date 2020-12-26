import * as functions from './functions.js';

function main() {
  renderFunctionList(functions);
  addFunctionSelectEventListener(functions);
}

function addFunctionSelectEventListener(functions) {
  const el = document.querySelector('#function-list');
  el.addEventListener('click', evt => {
    const section = getNearestAncestorByTag(evt.target, 'section');
    if (!section) {
      return;
    }
    const selectedFunction = functions[section.id];
    renderFunctionRunner(selectedFunction);
  });
}


function renderFunctionList(functions) {
  const el = document.querySelector('#function-list');
  el.innerHTML =
    Object.values(functions)
      .filter(prop => typeof prop === 'function')
      .map(functionComponent)
      .join('');
}

function functionComponent(fun) {
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
  el.innerHTML = html;
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

main();