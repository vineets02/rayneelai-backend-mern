const Contact = require('../models/Contact');
const jwt = require('jsonwebtoken');

// Admin Login
const adminLogin = async (req, res, next) => {
  try {
    const { password } = req.body;
    
    // In a minimal secure setup without a DB user table, we use ENV variables
    // Hard fallback used here only for development if env is missing
    const adminPassword = process.env.ADMIN_PASSWORD || 'rayneelai_admin_2026';
    const secret = process.env.ADMIN_JWT_SECRET || 'fallback_admin_secret_key_change_in_prod';

    if (!password || password !== adminPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { role: 'admin', id: 'admin-1' },
      secret,
      { expiresIn: '12h' }
    );

    res.status(200).json({ success: true, token });
  } catch (error) {
    next(error);
  }
};

// Get all leads with pagination, search, and filters
const getLeads = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      priority,
      isRead,
      isContacted,
      showArchived = 'false',
      sort = 'newest'
    } = req.query;

    const query = {};

    // Handle soft deletes
    if (showArchived === 'true') {
      query.deletedAt = { $ne: null };
    } else {
      query.deletedAt = null;
    }

    // Search logic
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (isContacted !== undefined) query.isContacted = isContacted === 'true';

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest') sortOptions = { createdAt: 1 };
    else if (sort === 'status') sortOptions = { status: 1, createdAt: -1 };
    else if (sort === 'priority') sortOptions = { priority: -1, createdAt: -1 };

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    const leads = await Contact.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parsedLimit);

    const total = await Contact.countDocuments(query);

    res.status(200).json({
      success: true,
      data: leads,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        pages: Math.ceil(total / parsedLimit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single lead by ID
const getLeadById = async (req, res, next) => {
  try {
    const lead = await Contact.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    // Optionally mark as read when viewed
    if (!lead.isRead) {
      lead.isRead = true;
      await lead.save();
    }
    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

// Update lead fields
const updateLead = async (req, res, next) => {
  try {
    const allowedUpdates = ['status', 'priority', 'isRead', 'isContacted', 'tags'];
    const updateData = {};
    
    // Prevent mass assignment
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    const lead = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

// Toggle read status quickly
const markAsRead = async (req, res, next) => {
  try {
    const { isRead } = req.body;
    const lead = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: !!isRead },
      { new: true }
    );
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

// Toggle contacted status quickly
const markAsContacted = async (req, res, next) => {
  try {
    const { isContacted } = req.body;
    const update = { isContacted: !!isContacted };
    if (isContacted) {
      update.status = 'contacted';
    }
    
    const lead = await Contact.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

// Add internal note
const addNote = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Note text is required' });
    }

    const lead = await Contact.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    lead.notes.push({ text: text.trim() });
    await lead.save();

    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

// Soft delete / archive
const archiveLead = async (req, res, next) => {
  try {
    const lead = await Contact.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

// Restore archived lead
const restoreLead = async (req, res, next) => {
  try {
    const lead = await Contact.findByIdAndUpdate(
      req.params.id,
      { deletedAt: null },
      { new: true }
    );
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

// Get dashboard statistics
const getStats = async (req, res, next) => {
  try {
    const [total, newData, unread, contacted, archived] = await Promise.all([
      Contact.countDocuments({ deletedAt: null }),
      Contact.countDocuments({ status: 'new', deletedAt: null }),
      Contact.countDocuments({ isRead: false, deletedAt: null }),
      Contact.countDocuments({ isContacted: true, deletedAt: null }),
      Contact.countDocuments({ deletedAt: { $ne: null } })
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        new: newData,
        unread,
        contacted,
        archived
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin,
  getLeads,
  getLeadById,
  updateLead,
  markAsRead,
  markAsContacted,
  addNote,
  archiveLead,
  restoreLead,
  getStats
};
