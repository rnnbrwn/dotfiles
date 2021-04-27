const fs = require('fs');

const b = Object.keys(a).reduce((acc, f) => {
  let body = acc[f].body;
  if (body.indexOf(':') >= 0) {
    let bodyA = body.split(':');
    let i = 1;
    bodyA = bodyA.map((str, index) => {
      if (index === 0) {
        i = 1;
        return str.concat(`${i}`);
      }
      i++;
      return '\\$'.concat(str, `${i}`);
    });
    body = bodyA.join(':').slice(0, -1);
    acc[f].body = body;
  }
  return acc;
}, a);

fs.writeFileSync('f.json', JSON.stringify(b), 'utf-8');