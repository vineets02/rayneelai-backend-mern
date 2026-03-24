const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.titan.email',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection Error during initialization:', error);
  } else {
    console.log('SMTP Server is ready to take our messages');
  }
});

const sendContactEmail = async (contactData) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP credentials not configured. Throwing error.');
    throw new Error('SMTP credentials missing');
  }

  try {
    console.log(`Attempting to send email for contact form submission from: ${contactData.email}`);
    
    const mailOptions = {
      from: process.env.SMTP_FROM || '"RayneelAI Team" <contact@rayneelai.com>',
      to: process.env.CONTACT_RECEIVER_EMAIL || 'contact@rayneelai.com',
      replyTo: contactData.email,
      subject: `New Inquiry from ${contactData.name} - RayneelAI`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${contactData.name}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        <p><strong>Company:</strong> ${contactData.company || 'N/A'}</p>
        <p><strong>Phone:</strong> ${contactData.phone || 'N/A'}</p>
        <p><strong>Service of Interest:</strong> ${contactData.service_interest}</p>
        <hr />
        <h3>Message:</h3>
        <p>${contactData.message.replace(/\n/g, '<br/>')}</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Exact email sending error from nodemailer:', error);
    throw new Error(error.message || 'Failed to send email notification');
  }
};

module.exports = { sendContactEmail };
