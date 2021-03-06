const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
//@route    GET api/auth

//@desc     Test routes

//@access   Public

router.get('/', auth , async (req,res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('server error');
    }
});

//@route    Posts api/auth

//@desc     Authenticate user and get token

//@access   Public

router.post('/', [
    check('email','please include a valid email address').isEmail(),
    check('password','password required').exists()
] , async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const {email,password} = req.body;
    try {
        //see if user exists
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json( { errors:[ {msg:'Invalid Credentials'} ] } )
        }
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch) {
            return res.status(400).json({errors:[{msg:'Invalid Credentials'}]});
        }
        //Return Json webtoken
        const payload = {
            user:{
                id:user.id
            }
        }
        jwt.sign(payload,config.get('jwtToken'),{expiresIn:360000},(err,token) => {
            if (err) throw err;
            res.json({token});
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');        
    }
});

module.exports = router;