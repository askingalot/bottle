import * as functions from './functions.js';

function main() {
  renderFunctions(functions);
}

function renderFunctions(functions) {
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
        Takes ${fun.length} args
      </div>
      <div class="function-card__body">
        <code>
          ${fun.toString()}
        </code>
      </div>
    </section>
  `;
}

main();