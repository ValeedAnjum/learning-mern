const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');
const User = require('../../models/User');
//@route    Posts api/users

//@desc     Register user

//@access   Public
router.post('/', [
    check('name','name is required').not().isEmpty(),
    check('email','please include a valid email address').isEmail(),
    check('password','please enter a password with 6 or more character').isLength({
        min:6
    })
] , async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const {name,email,password} = req.body;
    try {
        //see if user exists
        let user = await User.findOne({email});
        if(user){
            return res.status(400).json( { errors:[ {msg:'User already exicts'} ] } )
        }
        //Get user gravatar
        const avatar = gravatar.url(email , {
            s:'200'
        })
        user = new User({
            name,
            email,
            avatar,
            password
        })
        //Encrypt password
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password,salt);

        await user.save();
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
    // res.send('User route')
});

module.exports = router;