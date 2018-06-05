const express = require('express')
const router = express.Router()
const passport = require('passport')

// Load validation
const validateProfileInput = require('../../validation/profile')
const validateExperienceInput = require('../../validation/experience')
const validateEducationInput = require('../../validation/education')

const Profile = require('../../models/Profile')
const User = require('../../models/User')

// @route GET api/profile/test
// @desc Tests profile route
// @access Public

router.get('/test', (req, res) => res.json({message: "profile route works"}))

// @route GET api/profile
// @desc GET current user profile
// @access Private

router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {}

    Profile.findOne({ user: req.user.id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.noprofile = 'There is no profile for this user'
                return res.status(404).json(errors)
            }
            res.status(200).json(profile)
        })
        .catch(err => res.status(400).json(err))
})

// @route POST api/profile
// @desc create or Edit user profile
// @access Private

router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const {errors, isValid} = validateProfileInput(req.body)

    if(!isValid) {
        return res.status(400).json(errors)
    }
    // Get all the fields
    const profileFields = {}
    profileFields.user = req.user.id
    if(req.body.handle) profileFields.handle = req.body.handle
    if(req.body.company) profileFields.company = req.body.company
    if(req.body.website) profileFields.website = req.body.website
    if(req.body.location) profileFields.location = req.body.location
    if(req.body.bio) profileFields.bio = req.body.bio
    if(req.body.status) profileFields.status = req.body.status
    if(req.body.githubusername) profileFields.githubusername = req.body.githubusername

    // Skills
    if(typeof req.body.skills !== 'undefined') {
        profileFields.skills = req.body.skills.split(',')
    }

    // Social
    profileFields.social = {}
    if(req.body.youtube) profileFields.social.youtube = req.body.youtube
    if(req.body.facebook) profileFields.social.facebook = req.body.facebook
    if(req.body.twitter) profileFields.social.twitter = req.body.twitter
    if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin
    if(req.body.instagram) profileFields.social.instagram = req.body.instagram

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if(profile) {
                Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                ).then(profile => res.json(profile))
            } else {
                Profile.findOne({ handle: req.body.handle })
                    .then(profile => {
                        if(profile) {
                            errors.handle = 'That handle already exists'
                            return res.status(400).json(errors)
                        }

                        new Profile(profileFields).save()
                            .then(profile => res.json(profile))
                    })
            }
        })
})

// @route GET api/profile/all
// @desc Get all profiles
// @access Public

router.get('/all', (req, res) => {
    const errors = {}
    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then(profiles => {
            if(!profiles) {
                errors.noprofile = 'There are no profiles'
                return res.status(404).json(errors)
            }

            res.json(profiles)
        })
        .catch(() => res.status(404).json({profile: 'There are no profiles'}))
})

// @route GET api/profile/handle/:handle
// @desc Get profile by handle
// @access Public

router.get('/handle/:handle', (req, res) => {
    const errors = {}
    Profile.findOne({ handle: req.params.handle })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.noprofile = 'There is no profile for this user'
                return res.status(404).json(errors)
            }

            res.json(profile)
        })
        .catch(() => res.status(404).json({profile: 'There is no profile for this user'}))
})

// @route GET api/profile/user/:user_id
// @desc Get profile by ID
// @access Public

router.get('/user/:user_id', (req, res) => {
    const errors = {}
    Profile.findOne({ user: req.params.user_id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.noprofile = 'There is no profile for this user'
                return res.status(404).json(errors)
            }

            res.json(profile)
        })
        .catch(() => res.status(404).json({profile: 'There is no profile for this user'}))
})

// @route POST api/profile/experience
// @desc Add experience to profile
// @access Private

router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
    const {errors, isValid} = validateExperienceInput(req.body)

    if(!isValid) {
        return res.status(400).json(errors)
    }
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const {title, company, location, from, to, current, description} = req.body
            const newExperience = {
                title, 
                company, 
                location, 
                from, 
                to, 
                current, 
                description
            }

            profile.experience.unshift(newExperience)

            profile.save().then(profile => res.json(profile))
        })
})

// @route DELETE api/profile/experience/:exp_id
// @desc Delete experience from profile
// @access Private

router.delete('/experience/:exp_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const removeIndex = profile.experience
                .map(exp => exp.id)
                .indexOf(req.params.exp_id)
            
            profile.experience.splice(removeIndex, 1)

            profile.save().then(profile => res.json(profile)).catch(err => res.status(404).json(err))
        })
})

// @route POST api/profile/education
// @desc Add education to profile
// @access Private

router.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {
    const {errors, isValid} = validateEducationInput(req.body)

    if(!isValid) {
        return res.status(400).json(errors)
    }
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const {school, degree, fieldofstudy, from, to, current, description} = req.body
            const newEducation = {
                school, 
                degree, 
                fieldofstudy, 
                from, 
                to, 
                current, 
                description
            }

            profile.education.unshift(newEducation)

            profile.save().then(profile => res.json(profile))
        })
})

// @route DELETE api/profile/education/:edu_id
// @desc Delete education from profile
// @access Private

router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const removeIndex = profile.education
                .map(edu => edu.id)
                .indexOf(req.params.edu_id)
            
            profile.education.splice(removeIndex, 1)

            profile.save().then(profile => res.json(profile)).catch(err => res.status(404).json(err))
        })
})

// @route DELETE api/profile
// @desc Delete user and profile
// @access Private

router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id })
        .then(() => {
            User.findOneAndRemove({ _id: req.user.id })
                .then(() => res.json({ success: true }))
        })
})

module.exports = router