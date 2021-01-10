import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';

const PORT = 3001;
const STATIC_FILE_PATH = '.';
const FUNCTIONS_FILE_PATH = path.join(STATIC_FILE_PATH, 'functions');
const FUNCTIONS_URL_PATH = '/functions';

const server = http.createServer((req, res) => {
  // extract URL path - Avoid https://en.wikipedia.org/wiki/Directory_traversal_attack
  const parsedUrl = url.parse(req.url);
  const sanitizePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');

  handler(sanitizePath)(req, res, sanitizePath);
});

server.listen( PORT, () => console.log(`http://localhost:${PORT}`));



function handler(path) {
  const handlerMap = {
    '/modules': handleModulesRequest,
  };

  return handlerMap[path] ?? handleStatic;
};


function handleModulesRequest(_req, res, _pathname) {
  fs.readdir(FUNCTIONS_FILE_PATH, (err, filenames) => {
    if (err) {
      return error(res, 500, err);
    }

    const moduleInfo = filenames
      .filter(name => name.endsWith('.js'))
      .map(name => ({
        path: `${FUNCTIONS_URL_PATH}/${name}`,
        name: name.substring(0, name.length - 3)
      }));

    res.setHeader('content-type', mimeType('json'));
    res.end(JSON.stringify(moduleInfo));
  })
}


function handleStatic(_req, res, pathname) {
  pathname = path.join(STATIC_FILE_PATH, pathname);

  fs.stat(pathname, (err, stats) => {
    if (err || !(stats.isFile() || stats.isDirectory())) {
      return error(res, 404);
    }

    if (stats.isDirectory()) {
      pathname = path.join(pathname, 'index.html');
    }

    fs.readFile(pathname, function (err, data) {
      if (err) {
        return error(res, 500, err);
      }

      const ext = path.parse(pathname).ext;
      res.setHeader('Content-type', mimeType(ext));
      res.end(data);
    });
  });
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


function error(res, code, err) {
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