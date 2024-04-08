// pages/api/sendEmail.js
import nodemailer from 'nodemailer';


export default async (req, res) => {
  if (req.method === 'POST') {
    const { userName, selectedImagePath } = req.body;

    let transporter = nodemailer.createTransport({
      service: 'gmail', // Use your email service: Gmail, Outlook, etc.
      auth: {
        user: process.env.EMAIL_USERNAME, // Your email
        pass: process.env.EMAIL_PASSWORD, // Your email account password or app password
      },
    });

    let mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: 'shuiyujie@gmail.com', // The email address to send to
      subject: `New Test Result from ${userName}`,
      text: `${userName} has completed the test. The selected image is: ${selectedImagePath}`,
      // You can also use `html` for HTML email content
    };

    try {
      let info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);
      res.status(200).json({ status: 'Email sent' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 'Error sending email', error: error.toString() });
    }
  } else {
    // Block non-POST requests
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
