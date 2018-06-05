const express = require('express')
const router = express.Router()
const passport = require('passport')

// Post model
const Post = require('../../models/Post')
const Profile = require('../../models/Profile')

// Post validation
const validatePostInput = require('../../validation/post')

// @route GET api/posts/test
// @desc Tests post route
// @access Public

router.get('/test', (req, res) => res.json({message: "posts route works"}))

// @route POST api/posts
// @desc Create post
// @access Private

router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body)

    if(!isValid) {
        res.status(400).json(errors)
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.user.name,
        avatar: req.user.avatar,
        user: req.user.id
    })

    newPost.save()
        .then(post => res.json(post))
})

// @route GET api/posts
// @desc Get all posts
// @access Public

router.get('/', (req, res) => {
    Post.find()
        .sort({date: -1})
        .then(posts => res.json(posts))
        .catch(() => res.status(404).json({notfoundposts: 'Posts not found'}))
})

// @route GET api/posts/:id
// @desc Get Post by ID
// @access Public

router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(() => res.status(404).json({notfoundpost: 'Post not found'}))
})

// @route DELETE api/posts/:id
// @desc Delete Post by ID
// @access Private

router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(() => {
            Post.findById(req.params.id)
                .then(post => {
                    if(post.user.toString() !== req.user.id) {
                        return res.status(401).json({notauthorized: 'User not authorized'})
                    }

                    post.remove()
                        .then(() => res.status(200).json({success: true}))
                })
                .catch(() => res.status(404).json({postnotfound: 'Post not found'}))
        })
})

// @route POST api/posts/like/:id
// @desc Like Post by ID
// @access Private

router.post('/like/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(() => {
            Post.findById(req.params.id)
                .then(post => {
                    if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                        return res.status(404).json({alreadyliked: 'User already liked this post'})
                    }

                    post.likes.unshift({user: req.user.id})

                    post.save().then(post => res.json(post))
                })
                .catch(() => res.status(404).json({postnotfound: 'Post not found'}))
        })
})

// @route POST api/posts/unlike/:id
// @desc Unlike Post by ID
// @access Private

router.post('/unlike/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(() => {
            Post.findById(req.params.id)
                .then(post => {
                    if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                        return res.status(404).json({notliked: 'You have not liked this post'})
                    }

                    const removeIndex = post.likes
                        .map(item => item.user.toString())
                        .indexOf(req.user.id)
                    
                    post.likes.splice(removeIndex, 1)

                    post.save().then(post => res.json(post))
                })
                .catch(() => res.status(404).json({postnotfound: 'Post not found'}))
        })
})

// @route POST api/posts/comment/:id
// @desc Add a comment to Post
// @access Private

router.post('/comment/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body)

    if(!isValid) {
        res.status(400).json(errors)
    }

    Post.findById(req.params.id)
        .then(post => {
            const newComment = {
                text: req.body.text,
                name: req.user.name,
                avatar: req.user.avatar,
                user: req.user.id
            }

            post.comments.unshift(newComment)
            
            post.save().then(post => res.json(post))
        })
        .catch(err => res.status(404).json({nopostfound: 'No post found'}))
})

// @route DELETE api/posts/comment/:id/:comment_id
// @desc Delete a comment by Id from a post
// @access Private

router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Post.findById(req.params.id)
        .then(post => {
            if(post.comments.filter(comment => comment.id.toString() === req.params.comment_id).length === 0) {
                return res.status(404).json({commentnotfound: 'Comment not found'})
            }

            const removeIndex = post.comments
                .map(item => item._id.toString())
                .indexOf(req.params.comment_id)
            
            post.comments.splice(removeIndex, 1)

            post.save().then(post => res.json(post))
        })
        .catch(() => res.status(404).json({nopostfound: 'No post found'}))
})

module.exports = router