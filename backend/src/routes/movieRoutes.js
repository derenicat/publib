import express from 'express';

const router = express.Router();

router.route('/').get();
router.route('/:id').get();
router.route('/:id/reviews').get().post().patch().delete();

export default router;
