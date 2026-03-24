const { Resend } = require('resend');

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

const sendContactEmail = async (contactData) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured. Throwing error.');
    throw new Error('Resend API key missing');
  }

  try {
    console.log(`Attempting to send email via Resend for contact: ${contactData.email}`);
    
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    
    const { data, error } = await resend.emails.send({
      from: `RayneelAI <${fromEmail}>`,
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
    });

    if (error) {
      console.error('Exact email sending error from Resend:', error);
      throw new Error(error.message || 'Failed to send email via Resend');
    }

    console.log(`Email sent successfully via Resend. ID: ${data?.id}`);
    return true;
  } catch (error) {
    console.error('Exact email sending exception:', error);
    throw new Error(error.message || 'Failed to send email notification');
  }
};

module.exports = { sendContactEmail };
