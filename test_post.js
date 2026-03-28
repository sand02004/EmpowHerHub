const http = require('http');

const data = JSON.stringify({
  title: 'Test Posting',
  description: 'Desc',
  passingScore: 70,
  questions: [{
    content: 'Q1',
    answerOptions: [
      { content: 'A', isCorrect: true },
      { content: 'B', isCorrect: false },
    ]
  }]
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/tests',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    // we need auth, but let's see if 401 is returned
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('STATUS:', res.statusCode, body));
});

req.write(data);
req.end();
