const http = require('http');

async function loginAndPost() {
  const loginData = JSON.stringify({ email: 'admin@empowher.com', password: 'password123' });
  
  const loginReq = http.request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) }
  }, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      const token = JSON.parse(body).access_token;

      const testData = JSON.stringify({
        title: 'Backend Global Test',
        description: 'Testing if backend creates it successfully',
        passingScore: 50,
        questions: [{
          content: 'What is 2+2?',
          answerOptions: [
            { content: '4', isCorrect: true },
            { content: '5', isCorrect: false }
          ]
        }]
      });

      const testReq = http.request({
        hostname: '127.0.0.1',
        port: 3000,
        path: '/api/v1/tests',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(testData),
          'Authorization': `Bearer ${token}`
        }
      }, testRes => {
        let testBody = '';
        testRes.on('data', d => testBody += d);
        testRes.on('end', () => {
          console.log('Post Test Status:', testRes.statusCode, testBody);
        });
      });
      testReq.write(testData);
      testReq.end();
    });
  });
  loginReq.write(loginData);
  loginReq.end();
}

loginAndPost().catch(console.error);
