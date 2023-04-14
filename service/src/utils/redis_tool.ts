const redis = require('redis');

const redis_config = { socket: {
	host: '121.37.181.45',
		port: 6379
}  }
// const client =  redis.createClient(redis_config);
//
// client.connect();

const client = redis.createClient({
	...redis_config,
	retry_strategy: (options) => {
		if (options.error && options.error.code === 'ECONNREFUSED') {
			// 停止尝试并返回错误
			return new Error('Redis服务器拒绝连接');
		}
		// 等待N毫秒后尝试重新连接
		return Math.min(options.attempt * 100, 3000);
	},
});

client.connect()

client.on('connect', () => {
	console.log('已连接到Redis服务器');
});

client.on('error', (err) => {
	console.error('错误', err);
});

function redisSet(key, value, timeout = 300) {
	// 创建Redis客户端
	client.set('CIGWellERobot:'+key, value, {'EX': timeout})
}


function redisGet(key) {
	console.log('CIGWellERobot:'+key)
	return client.get('CIGWellERobot:'+key)
}

export { redisSet, redisGet };
