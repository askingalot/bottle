import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';

const PORT = 3001;

const STATIC_FILE_PATH = './';
const EXERCISES_FILE_PATH = path.join(STATIC_FILE_PATH, 'exercises');
const TEST_IMPORT_PATH = path.join('..', '..', 'exercise_tests');
const EXERCISES_URL_PATH = '/exercises';


const server = http.createServer((req, res) => {
  // extract URL path - Avoid https://en.wikipedia.org/wiki/Directory_traversal_attack
  const parsedUrl = url.parse(req.url);
  const sanitizePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');

  handler(sanitizePath)(req, res, sanitizePath);
});

server.listen(PORT, () => console.log(`http://localhost:${PORT}`));



function handler(path) {
  const handlerMap = {
    '/modules': handleModulesRequest,
    '/test': handleTestRequest,
  };

  return handlerMap[path] ?? handleStatic;
};


function handleModulesRequest(_req, res, _pathname) {
  fs.readdir(EXERCISES_FILE_PATH, (err, filenames) => {
    if (err) {
      return htmlError(res, 500, err);
    }

    const moduleInfo = filenames
      .filter(name => name.endsWith('.js'))
      .map(name => ({
        path: `${EXERCISES_URL_PATH}/${name}`,
        name: name.substring(0, name.length - 3)
      }));

    res.setHeader('content-type', mimeType('json'));
    res.end(JSON.stringify(moduleInfo));
  })
}


function handleTestRequest(req, res, _pathname) {
  let strTestInfo = '';
  req.on('data', chunk => strTestInfo += chunk);
  req.on('end', async () => {
    try {
      const testInfo = JSON.parse(strTestInfo);

      const result = await runTestFunction(testInfo)

      res.setHeader('Content-Type', mimeType('json'));
      res.end(JSON.stringify(result));
    } catch (err) {
      return jsonError(res, "Failed to run test. Error: " + err.message, err);
    }
  });
}


function handleStatic(_req, res, pathname) {
  pathname = path.join(STATIC_FILE_PATH, pathname);

  fs.stat(pathname, (err, stats) => {
    if (err || !(stats.isFile() || stats.isDirectory())) {
      return htmlError(res, 404);
    }

    if (stats.isDirectory()) {
      pathname = path.join(pathname, 'index.html');
    }

    fs.readFile(pathname, function (err, data) {
      if (err) {
        return htmlError(res, 500, err);
      }

      const ext = path.parse(pathname).ext;
      res.setHeader('Content-type', mimeType(ext));
      res.end(data);
    });
  });
}


async function runTestFunction(testInfo) {
  const modulePath = `${TEST_IMPORT_PATH}/${testInfo.module}.js`;
  const mod = await import(modulePath)
  return mod[testInfo.function](...testInfo.args);
}


function mimeType(extention) {
  if (extention.startsWith('.')) {
    extention = extention.substring(1);
  }

  const mimeTypeMap = {
    'ico': 'image/x-icon',
    'html': 'text/html',
    'js': 'text/javascript',
    'json': 'application/json',
    'css': 'text/css',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'svg': 'image/svg+xml'
  };

  return mimeTypeMap[extention] ?? 'text/plain';
}


function jsonError(res, message, err) {
  if (err) {
    console.error(message);
    console.error(err);
  }

  res.statusCode = 500;
  res.setHeader('Content-Type', mimeType('json'));
  res.end(`{ "error": "${message}" }`);
}


function htmlError(res, code, err) {
  if (err) {
    console.error(err);
  }

  res.statusCode = code;
  res.setHeader('Content-Type', mimeType('html'));
  res.end(`<h1>${errorMessageByCode(code)}</h1>`);
}


function errorMessageByCode(code) {
  const messageMap = {
    404: "Not Found",
    500: "Internal Server Error"
  };

  return messageMap[code] ?? "Unknown Error";
}