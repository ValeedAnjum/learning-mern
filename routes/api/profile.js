const express = require('express');
const router = express.Router();
 
//@route    GET api/profile

//@desc     Test routes

//@access   Public

router.get('/',(req,res) => res.send('profile route'));

module.exports = router;