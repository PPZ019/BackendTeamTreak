const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const NodeCache = require('node-cache');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Initialize cache (5 minute TTL)
const cache = new NodeCache({ stdTTL: 300 });

// Rate limiting (100 requests per 15 minutes per IP)
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later'
});

// Local knowledge base for fallback responses
const HR_KNOWLEDGE_BASE = {
  leave: {
    apply: "To apply for leave, go to the HRMS portal > Leave Application > Fill the form and submit. For urgent requests, email hr@teamtreak.com",
    annual: "24 days per year (2 days per month accrual)",
    casual: "12 days per year",
    sick: "6 days per year (medical certificate required after 3 days)",
    balance: "Check your leave balance in the HRMS portal under 'My Leaves' section"
  },
  contact: {
    hr: "Email: hr@teamtreak.com | Phone: +91-9876543210",
    emergency: "+91-9876543211"
  },
  payroll: {
    schedule: "7th of each month",
    components: "Basic (40%), HRA (20%), Allowances (30%), Deductions (10%)"
  },
  attendance: {
    regularize: "To regularize attendance, submit a request in HRMS within 3 days with manager approval"
  }
};

function getFallbackResponse(message) {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('apply') && lowerMsg.includes('leave')) {
    return HR_KNOWLEDGE_BASE.leave.apply;
  }
  
  if (lowerMsg.includes('leave')) {
    if (lowerMsg.includes('annual')) return HR_KNOWLEDGE_BASE.leave.annual;
    if (lowerMsg.includes('casual')) return HR_KNOWLEDGE_BASE.leave.casual;
    if (lowerMsg.includes('sick')) return HR_KNOWLEDGE_BASE.leave.sick;
    if (lowerMsg.includes('balance')) return HR_KNOWLEDGE_BASE.leave.balance;
    return `Leave policies: Annual (${HR_KNOWLEDGE_BASE.leave.annual}), Casual (${HR_KNOWLEDGE_BASE.leave.casual}), Sick (${HR_KNOWLEDGE_BASE.leave.sick})`;
  }
  
  if (lowerMsg.includes('contact') || lowerMsg.includes('hr')) {
    return HR_KNOWLEDGE_BASE.contact.hr;
  }
  
  if (lowerMsg.includes('pay') || lowerMsg.includes('salary') || lowerMsg.includes('payday')) {
    return `Payroll is processed on ${HR_KNOWLEDGE_BASE.payroll.schedule}. Components: ${HR_KNOWLEDGE_BASE.payroll.components}`;
  }
  
  if (lowerMsg.includes('regularize') || lowerMsg.includes('attendance')) {
    return HR_KNOWLEDGE_BASE.attendance.regularize;
  }
  
  return "I can only assist with HR queries. For specific questions about leaves, payroll, or contacts, please try rephrasing your question or contact HR directly at hr@teamtreak.com";
}

// Public chat endpoint (no authentication required)
router.post('/public', publicLimiter, async (req, res, next) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: 'Valid message is required'
      });
    }
    
    // Use IP address for caching to differentiate between users
    const ip = req.ip || req.connection.remoteAddress;
    const cacheKey = `public-chat-${ip}-${message}`;
    const cachedReply = cache.get(cacheKey);
    
    if (cachedReply) {
      return res.json({ 
        success: true,
        reply: cachedReply,
        cached: true,
        fallback: false
      });
    }
    
    let reply;
    let fallback = false;
    
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
          timeout: 5000
        });
        
        const chatCompletion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You're TeamTreak HR Assistant. Only answer HR-related questions about leaves, payroll, policies. For non-HR queries, say "I can only assist with HR matters." Keep responses concise (1-2 sentences).`
            },
            { role: 'user', content: message }
          ],
          temperature: 0.5,
          max_tokens: 150
        });
        
        reply = chatCompletion.choices[0].message.content.trim();
      } catch (err) {
        console.error('OpenAI Error:', err.message);
        reply = getFallbackResponse(message);
        fallback = true;
      }
    } else {
      reply = getFallbackResponse(message);
      fallback = true;
    }
    
    cache.set(cacheKey, reply);
    res.json({ 
      success: true,
      reply,
      fallback,
      cached: false
    });
    
  } catch (err) {
    console.error('Error in public chat endpoint:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;