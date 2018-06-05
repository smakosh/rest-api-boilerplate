const express = require('express')
const gravatar = require('gravatar')
const router = express.Router()
const User = require('../../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const keys = require('../../config/keys')
const passport = require('passport')

// Load Input validation

const validateRegisterInput = require('../../validation/register')
const validateLoginInput = require('../../validation/login')

// @route GET api/users/test
// @desc Tests user route
// @access Public

router.get('/test', (req, res) => res.json({message: "users route works"}))

// @route POST api/users/register
// @desc Register a new user
// @access Public

router.post('/register', (req, res) => {
    const {errors, isValid} = validateRegisterInput(req.body)

    if(!isValid) {
        return res.status(400).json(errors)
    }

    const avatar = gravatar.url(req.body.email, {
        s: '200', //size
        r: 'pg', // rating
        d: 'mm' // default
    })
    User.findOne({ email: req.body.email })
        .then(user => {
            if(user) {
                errors.email = 'Email already exists'
                return res.status(400).json(errors)
            } else {

                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password
                })

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err
                        newUser.password = hash
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err))
                    })
                })
            }
        }).catch(err => console.log(err))
})

// @route POST api/users/login
// @desc Login user - return JWT
// @access Public

router.post('/login', (req, res) => {
    const {errors, isValid} = validateLoginInput(req.body)

    if(!isValid) {
        return res.status(400).json(errors)
    }

    const email = req.body.email
    const password = req.body.password

    User.findOne({email})
        .then(user => {
            if(!user) {
                errors.email = 'User not found'
                return res.status(404).json(errors)
            }

            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(isMatch) {
                        const payload = {
                            id: user.id,
                            name: user.name,
                            avatar: user.avatar
                        }
                        jwt.sign(
                            payload,
                            keys.secret_key,
                            {expiresIn: 3600},
                            (err, token) => {
                                res.json({
                                    success: true,
                                    token: `Bearer ${token}`
                                })
                            }
                        )
                    } else {
                        errors.password = 'Password incorrect'
                        return res.status(400).json(errors)
                    }
                })
        })
})

// @route GET api/users/current
// @desc Return current user data
// @access Private

router.get('/current', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    })
})

module.exports = router