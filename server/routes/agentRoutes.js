const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/authMiddleware');
const agentOrchestrator = require('../services/agent/agentOrchestrator');
const AgentConversation = require('../models/AgentConversation');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /api/agent/chat
 * Multi-turn conversational interface for agentic appointment scheduling
 */
router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const { message, sessionId = uuidv4() } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    const userId = req.user?._id || null;

    const result = await agentOrchestrator.processUserMessage({
      sessionId,
      userId,
      userMessage: message.trim(),
    });

    return res.json({
      success: true,
      sessionId,
      reply: result.reply,
      workflowState: result.workflowState,
      currentTools: result.currentTools,
      proposedSlot: result.proposedSlot,
      bookingId: result.bookingId || null,
      conversation: {
        id: result.conversation._id,
        sessionId: result.conversation.sessionId,
        workflowState: result.conversation.workflowState,
        extractedIntent: result.conversation.extractedIntent,
        missingInformation: result.conversation.missingInformation,
        toolExecutionHistory: result.conversation.toolExecutionHistory,
        messages: result.conversation.messages,
        currentProposedSlot: result.conversation.currentProposedSlot,
      },
    });
  } catch (err) {
    console.error('[Agent Chat Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/**
 * GET /api/agent/conversation/:id
 * Retrieve full state and tool execution logs for a session
 */
router.get('/conversation/:id', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const conversation = await AgentConversation.findOne({ sessionId });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Agent conversation session not found.' });
    }

    return res.json({
      success: true,
      data: conversation,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/agent/confirm-booking
 * Direct programmatic confirmation of proposed slot
 */
router.post('/confirm-booking', optionalAuth, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const conversation = await AgentConversation.findOne({ sessionId });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation session not found.' });
    }

    if (!conversation.currentProposedSlot) {
      return res.status(400).json({ success: false, message: 'No slot is currently awaiting confirmation.' });
    }

    const currentExecutionBatch = [];
    const result = await agentOrchestrator.handleBookingConfirmation(
      conversation,
      req.user,
      currentExecutionBatch
    );

    return res.json({
      success: true,
      reply: result.reply,
      workflowState: result.workflowState,
      bookingId: result.bookingId,
      currentTools: currentExecutionBatch,
      conversation: result.conversation,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/agent/retry
 * Direct programmatic rejection and retry for alternative slot
 */
router.post('/retry', optionalAuth, async (req, res) => {
  try {
    const { sessionId, reason = 'Alternative requested by user' } = req.body;
    const conversation = await AgentConversation.findOne({ sessionId });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation session not found.' });
    }

    const currentExecutionBatch = [];
    const result = await agentOrchestrator.handleBookingRejection(
      conversation,
      req.user,
      currentExecutionBatch,
      reason
    );

    return res.json({
      success: true,
      reply: result.reply,
      workflowState: result.workflowState,
      currentTools: currentExecutionBatch,
      proposedSlot: result.proposedSlot,
      conversation: result.conversation,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
