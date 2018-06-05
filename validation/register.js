const Validator = require('validator')
const isEmpty = require('./is_empty')

module.exports = function validateRegisterInput(data) {
    let errors = {}

    data.name = !isEmpty(data.name) ? data.name : ''
    data.email = !isEmpty(data.email) ? data.email : ''
    data.password = !isEmpty(data.password) ? data.password : ''
    data.password_2 = !isEmpty(data.password_2) ? data.password_2 : ''

    if(!Validator.isLength(data.name, { min: 4, max: 30 })) {
        errors.name = 'Name must be between 2 and 30 characters'
    }

    if(Validator.isEmpty(data.name)) {
        errors.name = 'Name field is required'
    }

    if(!Validator.isEmail(data.email)) {
        errors.email = 'Email is invalid'
    }

    if(Validator.isEmpty(data.email)) {
        errors.email = 'Email field is required'
    }

    if(Validator.isEmpty(data.password)) {
        errors.password = 'Password field is required'
    }

    if(!Validator.isLength(data.password, { min: 6, max: 30 })) {
        errors.password = 'Password must be at least 6 characters'
    }

    if(!Validator.equals(data.password, data.password_2)) {
        errors.password_2 = 'Passwords must match'
    }

    if(Validator.isEmpty(data.password_2)) {
        errors.password_2 = 'Confirm Password field is required'
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}