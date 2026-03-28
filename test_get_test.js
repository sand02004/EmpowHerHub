const http = require('http');

async function loginAndGet() {
  const loginData = JSON.stringify({ email: 'admin@empowher.com', password: 'password123' });
  const loginReq = http.request({
    hostname: '127.0.0.1', port: 3000, path: '/api/v1/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) }
  }, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      const token = JSON.parse(body).access_token;
      http.get({
        hostname: '127.0.0.1', port: 3000, path: '/api/v1/tests',
        headers: { 'Authorization': \`Bearer \${token}\` }
      }, testRes => {
        let tData = '';
        testRes.on('data', d => tData += d);
        testRes.on('end', () => console.log('GET Tests Count:', JSON.parse(tData).length));
      });
    });
  });
  loginReq.write(loginData); loginReq.end();
}
loginAndGet();
