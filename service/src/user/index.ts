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

async function find_user_by_email(email: string, password: string) {
	return await prisma.user_info.findFirst({
		where: {
			email: email,
			password: password,
		},
	})
}


export {add_user, find_user_by_email}
