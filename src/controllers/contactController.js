const Contact = require('../models/Contact');
const { sendContactEmail } = require('../services/emailService');

const submitContactForm = async (req, res, next) => {
  try {
    const { name, email, company, phone, service_interest, message } = req.body;

    const newContact = await Contact.create({
      name,
      email,
      company,
      phone,
      service_interest,
      message
    });
    console.log(`Contact saved to DB successfully: ${newContact._id}`);

    try {
      await sendContactEmail(newContact);
      console.log(`Email sent successfully for contact: ${newContact._id}`);
    } catch (emailError) {
      console.error('Email failed to send for contact submission:', newContact._id);
      console.error('Exact email sending error:', emailError.message);
      
      return res.status(500).json({
        success: false,
        message: 'Contact was saved, but email notification failed.',
        error: emailError.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Inquiry sent successfully.',
      data: {
        id: newContact._id
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitContactForm };
