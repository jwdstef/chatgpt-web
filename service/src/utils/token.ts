// @ts-ignore
import jwt from 'jsonwebtoken';

export function generateToken(email): string {
	const secret = 'CIG-Robot';
	const timestamp = new Date().getTime();
	const payload = { email: email, timestamp };
	return jwt.sign(payload, secret, {expiresIn: '1h'});
}
