// @ts-ignore
const Joi = require('joi');

// 校验字符串
const email_schema = Joi.string().required();
const password_schema = Joi.string().required();


// 校验对象
const user_schema = Joi.object({
	email: email_schema,
	password: password_schema,
});

export {user_schema}
