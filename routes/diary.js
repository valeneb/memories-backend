const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const Diary = require("../models/diaries");
const Travel = require("../models/travels");
const convertToBase64 = require("../utils/convertToBase64");
// const mongoose = require("mongoose");

//TODO Route pour créer un Diary (Create)

router.post("/newDiary", async (req, res) => {
  //   console.log(req.body);
  //   console.log(req.files);
  try {
    const travelId = req.body._id;
    //!const travelId = mongoose.Types.ObjectId(req.body._id);   //? "error": "Class constructor ObjectId cannot be invoked without 'new'"
    // console.log(travelId);
    const findTravel = await Travel.findById(travelId);
    // console.log(findTravel); //!.ObjectKey ⬆️
    if (!findTravel) {
      res.status(401).json({
        result: false,
        error: "you have to create a newTravel before creating diary",
      });
    }
    //!req.files?.picture est du optional chaining : si req n'a pas de clef files et qu'on n'avait pas mis le ?, le fait de chercher à lire sa clef picture provoquerait une erreur. Grâce à l'optional chaining, si files n'existe pas, la clef picture n'est pas lue et on ne passe pas dans le if.
    if (
      (findTravel._id && !req.files?.picture) ||
      (req.body.title === "" && req.body.title) ||
      (req.body.description === "" && req.body.description)
    ) {
      const newDiary = new Diary({
        title: req.body.title || "",
        description: req.body.description || "",
        travel: findTravel,
      });
      const savedDiary = await newDiary.save();
      // console.log(newDiary);
      findTravel.travelDiary.push(savedDiary._id);
      await findTravel.save();
      res.status(200).json({ result: true, saved: newDiary });
      return;
    }
    if (
      findTravel._id &&
      req.files?.picture
      //  || Object.keys(req.files.picture).lentgh === null
    ) {
      // console.log(Object.keys(req.files.picture));
      const newDiary = new Diary({
        title: req.body.title || "" || null,
        description: req.body.description || "" || null,
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
            folder: `memories/diary_images/${newDiary._id}`,
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
                folder: `memories/diary_images/${newDiary._id}`,
                public_id: "diary",
              }
            );
            newDiary.moment = resultToUpload;
            newDiary.moment_pictures.push(resultToUpload);
          } else {
            const resultToUpload = await cloudinary.uploader.upload(
              convertToBase64(picture),
              {
                folder: `memories/diary_images/${newDiary._id}`,
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

// TODO Route pour récupérer tous les Diaries (Read)
router.get("/", async (req, res) => {
  //   console.log(req.query);
  try {
    const travelId = req.query._id;
    // console.log(travelId);
    const findTravel = await Travel.findById(travelId);
    // console.log(findTravel.travelDiary);
    if (!findTravel) {
      res.status(403).json({ result: false, error: "travel not found" });
    }

    if (findTravel.travelDiary) {
      const diaries = await Diary.find(findTravel);
      res.status(200).json({ result: true, diaries: diaries });
    } else {
      res
        .status(401)
        .json({ result: false, error: "you have to register a new travel" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//TODO Route pour mettre à jour un Diary (Update)
router.put("/", async (req, res) => {
  //   console.log(req.body._id);
  if (!req.body._id) {
    return res.status(401).json({
      result: false,
      error: "diary file doesn't exist start to create something",
    });
  }
  const diaryToModify = await Diary.findById(req.body._id);

  try {
    if (req.body.title) {
      diaryToModify.title = req.body.title;
      // console.log(req.body.title);
    }
    if (req.body.description) {
      diaryToModify.description = req.body.description;
    }
    if (req.files?.picture) {
      // console.log(req.files);
      console.log(diaryToModify.moment);
      await cloudinary.uploader.destroy(diaryToModify.moment.public_id);

      const resultUploadedMoment = await cloudinary.uploader.upload(
        convertToBase64(req.files.picture),
        {
          folder: `memories/diary_images/${diaryToModify._id}`,
          public_id: "diary",
        }
      );
      diaryToModify.moment = resultUploadedMoment;
      diaryToModify.moment_pictures[0] = resultUploadedMoment;
      // console.log(resultUploadedMoment);
    }
    const savedAndUpdatedDiary = await diaryToModify.save();
    res.status(201).json({ result: true, diary: savedAndUpdatedDiary });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});
//TODO 653aa5dba47d6cdeebfa10ea/
//TODO Route pour supprimer un Diary (Delete)

router.delete("/", async (req, res) => {
  const diaryId = req.query._id;
  if (!diaryId) {
    return res.status(400).json({ error: "ID de journal invalide" });
  }
  try {
    // Supprimez le journal en utilisant son ID
    const diaryToDelete = await Diary.findByIdAndDelete(diaryId);
    console.log("Carnet Supprimé :", diaryToDelete);
    if (!diaryToDelete) {
      return res.status(404).json({ error: "Journal non trouvé" });
    }

    // Supprimez les ressources Cloudinary associées si nécessaire
    await cloudinary.api.delete_resources_by_prefix(
      `memories/diary_images/${diaryId}`
    );
    await cloudinary.api.delete_folder(`memories/diary_images/${diaryId}`);

    res.status(200).json({
      result: true,
      diary: diaryToDelete,
      message: "le carnet a bien été supprimé",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
