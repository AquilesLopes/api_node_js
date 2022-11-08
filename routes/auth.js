require('dotenv').config()
const router = require('express').Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


function checkToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if(!token){
        return res.status(401).json({message: 'Acesso negado.'})
    } 

    console.log(token);

    try {
        const secret = process.env.SECRET
        jwt.verify(token, secret, function(err, decoded) {
            console.log(decoded)
            if(err){
                return res.status(401).json({message: 'Acesso negado.'})
            }
            next();
        });
    } catch(err){
        return res.status(401).json({message: err})
    }
}

router.get('/:id', checkToken, async (req, res) => {
    try {
        var user = await User.findById(req.params.id, '-password')

        if(!user){
            res.status(404).json({message: 'Registro não encontrado.'})
            return
        }

        res.status(200).json(user)
    } catch (err) {
        if(err.name === 'CastError'){
            res.status(422).json({message: 'Id é inválido.'})
        }else {
            res.status(500).json({error: err})
        }
    }
})

router.post('/register', async (req, res) => {
    var err = "";
    var {name, email, password, confirmPassword} = req.body

    if(!name || name.length < 7){
       err += 'nome inválido | '
    }

    if(!email || email.length < 7){
        err += 'email inválido | '
    }

    if(!password || password < 6){
        err += 'senha inválida | '
    }

    if(!confirmPassword || confirmPassword !== password){
        err += 'confirmação de senha inválida | '
    }

    if(err.length === 0){
        email = email.trim()
        email = email.toLowerCase()
        const userExists = await User.findOne({email: email})

        if(userExists){
            err += 'E-mail já existe.'
        }
    }

    if(err.length === 0){
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        var user = new User({
            name,
            email,
            password: passwordHash
        })

        try {
            await user.save()
            res.status(200).json({message: "Usuário cadastrado com sucesso!"})
        } catch (err) {
            return res.status(500).json({message: "Erro de com banco de dados!"})
        }
    }else {
        return res.status(422).json({message: err})
    }
})


router.post('/login', async (req, res) => {
    var err = "";
    var {email, password} = req.body
    var userExists = null

    if(!email || email.length < 7){
        err += 'email inválido | '
    }

    if(!password || password < 6){
        err += 'senha inválida | '
    }

    if(err.length === 0){
        email = email.trim()
        email = email.toLowerCase()
        userExists = await User.findOne({email: email})

        if(!userExists){
            return res.status(401).json({message: 'Acesso negado.'})
        }
    }

    if(err.length === 0){
       const checPassword = await bcrypt.compare(password, userExists.password)

       if(checPassword){
          try {
            const secret = process.env.SECRET
            const token = jwt.sign(
                    {id: userExists._id},
                    secret
                )

                res.status(200).json({message: "Autenticado com sucesso!", token})
          } catch (err) {
            return res.status(500).json({message: err})
          }
       }else{
          return res.status(401).json({message: 'Acesso negado.'})
       }
    }else {
        return res.status(422).json({message: err})
    }
})



module.exports = router