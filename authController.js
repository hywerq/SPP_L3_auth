const User = require('./models/User')
const Role = require('./models/Role')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {validationResult} = require('express-validator')
const {secret} = require('./config')

const generateAccessToken = (id, roles) => {
    const payload = { id, roles }

    return jwt.sign(payload, secret, {expiresIn: "24h"});
}

class authController {
    async registration(req, res) {
        try {
            const error = validationResult(req)
            if(!error.isEmpty()) {
                return res.status(400).json({message: 'Registration error', error})
            }

            const {username, password} = req.body
            const person = await User.findOne({username})

            if(person) {
                return res.status(400).json({message: 'User with this login already exists'})
            }

            const hashPassword = bcrypt.hashSync(password, 6)
            const userRole = await Role.findOne({value: "USER"})
            const user = new User({username, password: hashPassword, roles: [userRole.value]})

            await user.save()
            return res.json({message: "Successfully registered"})
        }
        catch (e) {
            console.log(e)
            res.status(400).json({message: 'Registration error'})
        }
    }

    async login(req, res) {
        try {
            const {username, password} = req.body
            const user = await User.findOne({username})
            if(!user) {
                return res.status(400).json({message: `Couldn't find user ${user}`})
            }

            const validPassword = bcrypt.compareSync(password, user.password)
            if(!validPassword) {
                return res.status(400).json({message: 'Wrong password'})
            }

            const token = generateAccessToken(user._id, user.roles)
            return res.json({token})
        }
        catch (e) {
            console.log(e)
            res.status(400).json({message: 'Login error'})
        }
    }

    async getUsers(req, res) {
        try {

            res.json("hello")
        }
        catch (e) {
            console.log(e)
            res.status(400).json({message: ''})
        }
    }
}

module.exports = new authController