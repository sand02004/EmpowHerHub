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
      console.log('Login Status:', res.statusCode);
      if (res.statusCode >= 400) {
        console.log(body);
        return;
      }
      const token = JSON.parse(body).access_token;
      
      const decodedJwt = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const sponsorId = decodedJwt.sub;

      const oppData = JSON.stringify({
        title: 'Backend Test Opportunity',
        type: 'Job',
        description: 'Test Description',
        requirements: 'Test Requirements',
        deadline: new Date().toISOString(),
        sponsorId: sponsorId
      });

      const oppReq = http.request({
        hostname: '127.0.0.1',
        port: 3000,
        path: '/api/v1/opportunities',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(oppData),
          'Authorization': `Bearer ${token}`
        }
      }, oppRes => {
        let oppBody = '';
        oppRes.on('data', d => oppBody += d);
        oppRes.on('end', () => {
          console.log('Post Status:', oppRes.statusCode, oppBody);
        });
      });
      oppReq.write(oppData);
      oppReq.end();
    });
  });
  loginReq.write(loginData);
  loginReq.end();
}

loginAndPost().catch(console.error);
