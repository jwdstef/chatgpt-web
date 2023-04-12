import nodemailer from 'nodemailer'
const nodemailer = require('nodemailer');

// Create transporter object with email service credentials
let transporter = nodemailer.createTransport({
	host: 'mail.chinasofti.com', // replace with your SMTP server address
	port: 25, // replace with the appropriate port number for your SMTP server
	secure: false, // Set to true if your SMTP server requires SSL/TLS
	auth: {
		user: 'liyachao@chinasofti.com', // replace with your email address
		pass: '#010471edc' // replace with your email password or application-specific password
	}
});

// Generate random verification code
let verificationCode = Math.floor(Math.random() * 1000000);

// Set up email content and details
let mailOptions = {
	from: 'liyachao@chinasofti.com',
	to: '410000368@qq.com',
	subject: 'Verification Code for Your Account',
	text: 'Your verification code is ' + verificationCode
};

export function sendMail() {
	// Send email with verification code
	transporter.sendMail(mailOptions, function(error, info){
		if(error) {
			console.log(error);
		} else {
			console.log('Email sent: ' + info.response);
		}
	});

}


