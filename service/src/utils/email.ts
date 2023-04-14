import nodemailer from 'nodemailer'
import {redisSet} from "./redis_tool";
import {add_user} from "../user";
const nodemailer = require('nodemailer');

// Create transporter object with email service credentials
let transporter = nodemailer.createTransport({
	host: 'smtp.qq.com', // replace with your SMTP server address
	port: 465, // replace with the appropriate port number for your SMTP server
	secure: true, // Set to true if your SMTP server requires SSL/TLS
	auth: {
		user: '25463204@qq.com', // replace with your email address
		pass: 'dsubbaoajwbmbihi' // replace with your email password or application-specific password
	}
});

export function sendMail(toEmail) {
	// Send email with verification code

// Generate random verification code
	let verificationCode = Math.floor(Math.random() * 1000000);

	let mailOptions = {
		from: '25463204@qq.com',
		to: toEmail,
		subject: 'Verification Code for Your Account',
		text: 'Your verification code is: ' + verificationCode + '\nby CIG Wall·E Robot'
	};
	console.log(mailOptions)
	redisSet('emailVerifyCode:' + toEmail, verificationCode)
	console.log('已写入redis')
	transporter.sendMail(mailOptions, function(error, info){
		if(error) {
			console.log(error);
		} else {
			console.log('Email sent: ' + info.response);
		}
	});

}


