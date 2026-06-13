const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON } = require('../utils/storage');

const router = express.Router();

router.get('/', (req, res) => {
  const appeals = readJSON('appeals.json', []);
  const reviews = readJSON('reviews.json', []);
  const users = readJSON('users.json', []);
  const { appellantId, status, reviewId } = req.query;

  let result = appeals;

  if (appellantId) {
    result = result.filter(a => a.appellantId === appellantId);
  }
  if (status) {
    result = result.filter(a => a.status === status);
  }
  if (reviewId) {
    result = result.filter(a => a.reviewId === reviewId);
  }

  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const enriched = result.map(a => ({
    ...a,
    review: reviews.find(r => r.id === a.reviewId) || null,
    appellant: users.find(u => u.id === a.appellantId) || null,
    reviewer: users.find(u => u.id === a.reviewerId) || null,
    handler: a.handlerId ? users.find(u => u.id === a.handlerId) : null
  }));

  res.json(enriched);
});

router.post('/', (req, res) => {
  const appeals = readJSON('appeals.json', []);
  const reviews = readJSON('reviews.json', []);
  const { reviewId, appellantId, reason, imageUrl } = req.body;

  if (!reviewId || !appellantId || !reason) {
    return res.status(400).json({
      success: false,
      error: '缺少必要参数'
    });
  }

  const review = reviews.find(r => r.id === reviewId);
  if (!review) {
    return res.status(404).json({
      success: false,
      error: '评价不存在'
    });
  }

  if (review.rating > 3) {
    return res.status(400).json({
      success: false,
      error: '只能对3星及以下的评价提起申诉'
    });
  }

  if (review.revieweeId !== appellantId) {
    return res.status(400).json({
      success: false,
      error: '只能申诉针对自己的评价'
    });
  }

  const existingAppeal = appeals.find(a => a.reviewId === reviewId && a.status !== 'rejected');
  if (existingAppeal) {
    return res.status(400).json({
      success: false,
      error: '该评价已有申诉在处理中或已通过'
    });
  }

  const newAppeal = {
    id: 'a' + uuidv4().slice(0, 8),
    reviewId,
    appellantId,
    reviewerId: review.reviewerId,
    reason,
    imageUrl: imageUrl || '',
    status: 'pending',
    reply: '',
    handlerId: null,
    handledAt: null,
    createdAt: new Date().toISOString()
  };

  appeals.push(newAppeal);
  writeJSON('appeals.json', appeals);

  res.json({ success: true, appeal: newAppeal });
});

router.put('/:id/handle', (req, res) => {
  const appeals = readJSON('appeals.json', []);
  const reviews = readJSON('reviews.json', []);
  const users = readJSON('users.json', []);
  const { id } = req.params;
  const { status, reply, handlerId } = req.body;

  if (!status || !reply || !handlerId) {
    return res.status(400).json({
      success: false,
      error: '缺少必要参数'
    });
  }

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: '无效的状态值'
    });
  }

  const appealIndex = appeals.findIndex(a => a.id === id);
  if (appealIndex === -1) {
    return res.status(404).json({
      success: false,
      error: '申诉不存在'
    });
  }

  if (appeals[appealIndex].status !== 'pending') {
    return res.status(400).json({
      success: false,
      error: '该申诉已处理'
    });
  }

  appeals[appealIndex].status = status;
  appeals[appealIndex].reply = reply;
  appeals[appealIndex].handlerId = handlerId;
  appeals[appealIndex].handledAt = new Date().toISOString();

  if (status === 'approved') {
    const reviewIndex = reviews.findIndex(r => r.id === appeals[appealIndex].reviewId);
    if (reviewIndex !== -1) {
      const deletedReview = reviews[reviewIndex];
      reviews.splice(reviewIndex, 1);
      writeJSON('reviews.json', reviews);

      const userIdx = users.findIndex(u => u.id === deletedReview.revieweeId);
      if (userIdx !== -1) {
        const userReviews = reviews.filter(r => r.revieweeId === deletedReview.revieweeId);
        const avgRating = userReviews.length > 0
          ? userReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / userReviews.length
          : 5.0;
        users[userIdx].rating = Math.round(avgRating * 10) / 10;
        users[userIdx].reviewCount = userReviews.length;
        writeJSON('users.json', users);
      }
    }
  }

  writeJSON('appeals.json', appeals);

  res.json({ success: true, appeal: appeals[appealIndex] });
});

router.get('/check/:reviewId', (req, res) => {
  const appeals = readJSON('appeals.json', []);
  const { reviewId } = req.params;

  const existingAppeal = appeals.find(a => a.reviewId === reviewId && a.status !== 'rejected');

  res.json({
    hasAppeal: !!existingAppeal,
    appeal: existingAppeal || null
  });
});

module.exports = router;
