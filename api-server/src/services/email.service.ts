/* Autor: Annika Junge */

import nodemailer from 'nodemailer';

class EmailService {
  sendEmail = async (email: string, subject: string, text: string) => {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        service: 'gmail',
        port: 465,
        secure: true,
        auth: {
          user: 'skillbay1.web@gmail.com',
          pass: 'eduihxdlfnhktvcc'
        }
      });

      await transporter.sendMail({
        from: 'skill.bay.web@gmail.com',
        to: email,
        subject: subject,
        text: text
      });
      console.log('email sent sucessfully');
    } catch (error) {
      console.log('email not sent');
      console.log(error);
    }
  };
}
export const emailService = new EmailService();
