const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const Diary = require("../models/diaries");
const Travel = require("../models/travels");
// const mongoose = require("mongoose");

cloudinary.config({
  cloud_name: "dbmg2zl7x",
  api_key: "237518157193281",
  api_secret: "ucWJnMRH_GBvQcP6RQDgUsAnDJ4",
});
const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

// Route pour créer un Diary (Create)
//TODO DID IT
router.post("/upload", async (req, res) => {
  //   console.log(req.body);
  //   console.log(req.files);
  try {
    const travelId = req.body._id;
    //!const travelId = mongoose.Types.ObjectId(req.body._id);//? "error": "Class constructor ObjectId cannot be invoked without 'new'"
    // console.log(travelId);
    findTravel = await Travel.findById(travelId);
    // console.log(findTravel); //!.ObjectKey ⬆️
    if (!findTravel) {
      res.status(401).json({
        result: false,
        error: "you have to create a newTravel before creating diary",
      });
      return;
    }
    //!req.files?.picture est du optional chaining : si req n'a pas de clef files et qu'on n'avait pas mis le ?, le fait de chercher à lire sa clef picture provoquerait une erreur. Grâce à l'optional chaining, si files n'existe pas, la clef picture n'est pas lue et on ne passe pas dans le if.

    if (
      findTravel._id &&
      req.body.title &&
      req.body.description &&
      req.files?.picture
    ) {
      const newDiary = new Diary({
        title: req.body.title,
        description: req.body.description,
        travel: findTravel,
      });

      if (!Array.isArray(req.files.picture)) {
        if (req.files.picture.mimetype.slice(0, 5) !== "image") {
          return res.status(400).json({
            result: false,
            message:
              "You must send image in a good format/jpeg/jpg/png blablabla",
          });
        }
        const resultToUpload = await cloudinary.uploader.upload(
          convertToBase64(req.files.picture),
          {
            folder: `c-572da241b15dac9e2f3c79aacc36f3/media-explorer/memories/diary_images/${newDiary._id}`,
            public_id: "diary",
          }
        );
        // console.log(resultToUpload);

        newDiary.moment = resultToUpload;
        // console.log(newDiary.moment);
        // console.log(newDiary.moment_pictures.push(resultToUpload)); //!doit afficher le chiffre 1 nbr d'élément
        newDiary.moment_pictures.push(resultToUpload);
      } else {
        for (let i = 0; i < req.files.picture.length; i++) {
          const picture = req.files.picture[i];
          //quand requête x photos dans mon form-data postman   console.log(`je fais un tour de: ${req.files.picture[i]}${i}`);
          if (picture.mimetype.slice(0, 5) !== "image") {
            return res.status(400).json({
              message: "You must send images in a good format blablabla",
            });
          }
          //   console.log(i);
          if (i === 0) {
            const resultToUpload = await cloudinary.uploader.upload(
              convertToBase64(picture),
              {
                folder: `c-572da241b15dac9e2f3c79aacc36f3/media-explorer/memories/diary_images/${newDiary._id}`,
                public_id: "diary",
              }
            );
            newDiary.moment = resultToUpload;
            newDiary.moment_pictures.push(resultToUpload);
          } else {
            const resultToUpload = await cloudinary.uploader.upload(
              convertToBase64(picture),
              {
                folder: `c-572da241b15dac9e2f3c79aacc36f3/media-explorer/memories/diary_images/${newDiary._id}`,
              }
            );
            newDiary.moment_pictures.push(resultToUpload);
          }
        }
      }

      const savedDiary = await newDiary.save();

      findTravel.travelDiary.push(savedDiary._id);
      await findTravel.save();
      res.status(201).json({ result: true, saved: savedDiary });
      //   findTravel.travel.push(savedDiary._id);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});
//     }

// TODORoute pour récupérer tous les Diaries (Read)
router.get("/", async (req, res) => {
  try {
    const diaries = await Diary.find();
    res.status(200).json(diaries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//TODO Route pour mettre à jour un Diary (Update)
router.put("/:id", async (req, res) => {
  try {
    const updatedDiary = await Diary.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedDiary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//TODO Route pour supprimer un Diary (Delete)
router.delete("/:id", async (req, res) => {
  try {
    await Diary.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
