const { Router } = require('express');
const breedRouter = require('./breeds');
const tempRouter = require('./temps');

const router = Router();

router.use('/dogs', breedRouter);
router.use('/temperament', tempRouter);


module.exports = router;
