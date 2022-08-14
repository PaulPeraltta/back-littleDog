const { Router } = require("express");
const { Op } = require("sequelize");
const axios = require("axios");
const { Breed, Temp } = require("../db");
const { DOGI_KEY } = process.env;

const router = Router();

router.get("/", (req, res, next) => {
  let name = req.query.name;
  let breedApi;
  let breedDb;
  let filteredBreedsApi;

  if (name) {
    breedApi = axios.get(
      `https://api.thedogapi.com/v1/breeds/`,
      {
        header: { "x-api-key": `${DOGI_KEY}` },
      }
    );
    breedDb = Breed.findAll({
      include: Temp,
      where: {
        name: {
          [Op.iLike]: "%" + name + "%",
        },
      },
      // order: [["name", "ASC"]],
      // raw: true,
      // nest: true,
    });
  } else {
    breedApi = axios.get(`https://api.thedogapi.com/v1/breeds`, {
      headers: { "x-api-key": `${DOGI_KEY}` },
    });
    breedDb = Breed.findAll({
      include: Temp,
      // raw: true,
      // nest: true,
    });
  }
  Promise.all([breedApi, breedDb])
    .then((resp) => {
      const [respBreedApi, respBreedDb] = resp;
      if(name) {
        prefilteredBreedsApi = respBreedApi.data.filter((b) => b.name.toLowerCase().includes(name.toLowerCase()));
        filteredBreedsApi = prefilteredBreedsApi.map((b) => { 
          // let temperaments = b.temperament.split(', ');
         return {
          id: b.id,
          name: b.name,
          image: b.image.url,
          height: b.height.metric,
          weight: b.weight.metric,
          life_span: b.life_span,
          temps: b.temperament,
        }
          })
        filteredBreedsDb = respBreedDb.map((b) => ({
          id: b.dataValues.id,
          name: b.dataValues.name,
          image: b.dataValues.image,
          createdInDb: b.dataValues.createdInDb,
          height: b.dataValues.height,
          weight: b.dataValues.weight,
          life_span: b.dataValues.life_span,
          temps: b.dataValues.temps.map((el) => el.dataValues.name)
        }));
      } else {
        filteredBreedsApi = respBreedApi.data.map((b) => {
          // let temperaments = b.temperament.split(', ');
          return {
            id: b.id,
            name: b.name,
            image: b.image.url,
            height: b.height.metric,
            weight: b.weight.metric,
            life_span: b.life_span,
            temps: b.temperament,
          }
          });
        filteredBreedsDb = respBreedDb.map((b) => ({
          id: b.dataValues.id,
          name: b.dataValues.name,
          image: b.dataValues.image,
          createdInDb: b.dataValues.createdInDb,
          height: b.dataValues.height,
          weight: b.dataValues.weight,
          life_span: b.dataValues.life_span,
          temps: b.dataValues.temps.map((el) => el.dataValues.name)
        }));

      }
      let allBreeds = [...filteredBreedsApi, ...filteredBreedsDb];
      allBreeds.sort((a, b) => {
        if (a.name.toLowerCase() < b.name.toLowerCase()) {
          return -1;
        }
        if (a.name.toLowerCase() > b.name.toLowerCase()) {
          return 1;
        }
        return 0;
      });
      res.send(allBreeds);
    })
    .catch((error) => {
      next(error);
    });
});

router.get("/:id", (req, res, next) => {
  const ID = req.params.id;
  if (ID.length > 30) {
    // Breed.findByPk(ID)
    Breed.findAll({
      include: Temp,
      where: {
        id: ID,
      },
      // order: [["name", "ASC"]],
      // raw: true,
      // nest: true,
    })
      .then((breed) => {
        dataBase = breed[0].dataValues;
        theBreed = {
          id: dataBase.id,
          name: dataBase.name,
          image: dataBase.image,
          height: dataBase.height,
          weight: dataBase.weight,
          life_span: dataBase.life_span,
          temps: dataBase.temps.map(t => t.dataValues.name)

        }
        res.send(theBreed)
      })
      .catch((error) => next(error));
  } else {
    axios
      .get(`https://api.thedogapi.com/v1/breeds`, {
        header: { "x-api-key": `${DOGI_KEY}` },
      })
      .then((breed) => {
        let breeds = breed.data;
        let breedId = breeds.filter((el) => {
          if (el.id == ID) return el;
        });
        if (breedId.length) {
          logBreed = breedId[0];
          orderedBreed = {
            id: logBreed.id,
            name: logBreed.name,
            image: logBreed.image.url,
            height: logBreed.height.metric,
            weight: logBreed.weight.metric,
            life_span: logBreed.life_span,
            temps: logBreed.temperament,
          };
          res.send(orderedBreed);
        } else {
          res.send("Dont find");
        }
      })
      .catch((error) => next(error));
  }
});

router.post("/", async (req, res, next) => {
  const { name, image, height, weight, life_span, createdInDb, temperament } =
    req.body;
  let arrayTemps = [];

  let newDog = await Breed.create({
    name,
    image,
    height,
    weight,
    life_span,
    createdInDb,
  });

  let tempDb = await Temp.findAll({
    where: { name: temperament },
  });
  // tempDb.map(temp => {
  //   arrayTemps.push(temp.dataValues.name)
  // });

  newDog.addTemp(tempDb);
  res.send("Congratulations! Your Dog was created successfully");
});

router.post("/:breedId/temp/:tempId", (req, res, next) => {
  const { breedId, tempId } = req.params;
  Breed.findByPk(breedId)
    .then((breed) => {
      breed.addTemp(tempId);
      res.send(200);
    })
    .catch((error) => {
      next(error);
    });
});

router.put("/", (req, res, next) => {
  res.send("Soy put en /breed");
});

router.delete("/", (req, res, next) => {
  res.send("Soy delete en /breed");
});

module.exports = router;
