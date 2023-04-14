const redis = require('redis');

const redis_config = { socket: {
	host: '121.37.181.45',
		port: 6379
}  }
const client =  redis.createClient(redis_config);

client.connect();

function redisSet(key, value, timeout = 300) {
	// 创建Redis客户端
	client.set('CIGWellERobot:'+key, value, {'EX': timeout})
}


function redisGet(key) {
	console.log('CIGWellERobot:'+key)
	return client.get('CIGWellERobot:'+key)
}

export { redisSet, redisGet };
