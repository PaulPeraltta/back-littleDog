const { Router } = require('express');
const breedRouter = require('./breeds');
const tempRouter = require('./temps');

const router = Router();

router.use('/dogs', breedRouter);
router.use('/temperament', tempRouter);

router.get("/ping", (req, res) => {
    res.send('Hello World')
})


module.exports = router;
