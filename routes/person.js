const router = require('express').Router()
const Person = require('../models/Person')


router.get('/', async (req, res) => {
    try {
        var list = await Person.find()
        res.status(200).json(list)
    } catch (err) {
        res.status(500).json({error: err})
    }
})

router.get('/:id', async (req, res) => {
    try {
        var person = await Person.findById(req.params.id)

        if(!person){
            res.status(404).json({message: 'Registro não encontrado.'})
            return
        }

        res.status(200).json(person)
    } catch (err) {
        if(err.name === 'CastError'){
            res.status(422).json({message: 'Id é inválido.'})
        }else {
            res.status(500).json({error: err})
        }
    }
})

router.post('/', async (req, res) => {
    const {name, salary, approved} = req.body

    const person = {
        name,
        salary,
        approved
    }

    try {
        await Person.create(person)
        res.status(201).json({message: 'Casatrado com sucesso.'})
    } catch (err) {
        res.status(500).json({error: err})
    }
});

router.patch('/:id', async (req, res) => {
    const {name, salary, approved} = req.body
    const id = req.params.id
    const person = {
        name,
        salary,
        approved
    }
    
    try {
        var personUpdate = await Person.updateOne({_id: id}, person)

        if(personUpdate.matchedCount === 0){
            res.status(404).json({message: 'Registro não encontrado.'})
            return
        }

        res.status(200).json({message: 'Atualizado com sucesso.'})
    } catch (err) {
        if(err.name === 'CastError'){
            res.status(422).json({message: 'Id é inválido.'})
        }else {
            res.status(500).json({error: err})
        }
    }
});

router.delete('/:id', async (req, res) => {
    const id = req.params.id
    
    try {
        var personDelete = await Person.deleteOne({_id: id})

        if(personDelete.deletedCount === 0){
            res.status(404).json({message: 'Registro não encontrado.'})
            return
        }

        res.status(200).json({message: 'Deletado com sucesso.'})
    } catch (err) {
        if(err.name === 'CastError'){
            res.status(422).json({message: 'Id é inválido.'})
        }else {
            res.status(500).json({error: err})
        }
    }
});

module.exports = router