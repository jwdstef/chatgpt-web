// @ts-ignore
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function add_user(email, password) {
	await prisma.user_info.create({
		data: {
			email: email,
			password: password
		}
	})
}


export {add_user}
