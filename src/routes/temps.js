const { Router } = require('express');
const { Temp } = require('../db');
const axios = require('axios');

const router = Router();

router.get('/', (req, res, next) => {
    axios.get('https://api.thedogapi.com/v1/breeds')
    .then(breeds => {
        let newArray = []
        breeds.data.map(b => newArray.push(b.temperament))
        let newArray2 = newArray.toString().split(', ');
        let finalArray = newArray2.map(t => t.split(','))
        return finalArray.toString().split(',')
    })
    .then(temps => {
        temps.forEach(temp => {
            Temp.findOrCreate({
        
                where: { name: temp }
            })
        })
    })
    Temp.findAll({
        atributes: [
            { exclude: ['id']}
        ],
        order: [
            ['name', 'ASC']
        ]
    })
    .then(allTemps => {
        res.send(allTemps);
    })
})



router.post('/', (req, res, next) => {

})

router.put('/', (req, res, next) => { 
    res.send('Soy put en /temp')  
})

router.delete('/', (req, res, next) => {
    res.send('Soy delete en /temp')
})

module.exports = router;
