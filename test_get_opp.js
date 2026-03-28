const http = require('http');

http.get('http://127.0.0.1:3000/api/v1/opportunities', res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const opps = JSON.parse(data);
    console.log('GET Opportunities Count:', opps.length);
    if(opps.length > 0) console.log(opps[0].title);
  });
});
