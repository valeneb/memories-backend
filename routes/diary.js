const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const Diary = require("../models/diaries");
const Travel = require("../models/travels");
const convertToBase64 = require("../utils/convertToBase64");
// const mongoose = require("mongoose");

//TODO Route pour créer un Diary (Create)

// TODO SIMPLY ROUTE POST
router.post("/newDiary", async (req, res) => {
  try {
    const travelId = req.query.travelId;
    const findTravel = await Travel.findById(travelId);

    if (!findTravel) {
      return res.status(401).json({
        result: false,
        error: "You have to create a newTravel before creating a diary.",
      });
    }

    const title = req.body.title || "";
    const description = req.body.description || "";

    const newDiary = new Diary({
      title,
      description,
      travel: findTravel,
      moment_pictures: [],
    });

    const savedDiary = await newDiary.save();

    findTravel.travelDiary.push(savedDiary._id);
    await findTravel.save();

    res.status(201).json({ result: true, saved: savedDiary });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

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
      // console.log(findTravel._id);
      const diaries = await Diary.find({ travel: findTravel._id });
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
router.put("/update", async (req, res) => {
  // console.log(req.body);
  const diaryId = req.query.diaryId;
  if (!diaryId) {
    return res.status(401).json({
      result: false,
      error: "diary file doesn't exist start to create something",
    });
  }
  const diaryToModify = await Diary.findById(diaryId);
  // console.log(diaryToModify);
  try {
    if (req.body.title) {
      diaryToModify.title = req.body.title;
      // console.log(req.body.title);
    }
    if (req.body.description) {
      diaryToModify.description = req.body.description;
      console.log(req.body.description);
    }
    if (req.files?.picture) {
      // console.log(req.files);
      // console.log(diaryToModify.moment);
      if (Array.isArray(req.files.picture)) {
        for (let i = 0; i < req.files.picture.length; i++) {
          const picture = req.files.picture[i];
          //console.log(picture);
          if (picture.mimetype.slice(0, 5) !== "image") {
            return res.status(400).json({
              message:
                "You must send images in a good format (jpeg/jpg/png, etc.).",
            });
          }
          const resultToUpload = await cloudinary.uploader.upload(
            convertToBase64(picture),
            {
              folder: `memories/diary_images/${diaryToModify._id}`,
            }
          );
          diaryToModify.moment_pictures.push(resultToUpload.secure_url);
          diaryToModify.moment_pictures.push(resultToUpload.public_id);
          // console.log(diaryToModify.moment_pictures);
          // console.log(resultToUpload);
        }
      } else {
        const picture = req.files.picture;

        if (picture.mimetype.slice(0, 5) !== "image") {
          return res.status(400).json({
            message:
              "You must send images in a good format (jpeg/jpg/png, etc.).",
          });
        }
        const resultToUpload = await cloudinary.uploader.upload(
          convertToBase64(picture),
          {
            folder: `memories/diary_images/${diaryToModify._id}`,
          }
        );
        diaryToModify.moment_pictures.push(resultToUpload.secure_url);
        diaryToModify.moment_pictures.push(resultToUpload.public_id);
      }
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
  const travelId = req.query.travelId;
  const diaryId = req.query.diaryId;

  if (!diaryId) {
    return res.status(400).json({ error: "ID de journal invalide" });
  }
  const travel = await Travel.findById(travelId);
  console.log(travel);
  if (!travel) {
    return res.status(404).json({
      result: false,
      error: "Travel not found",
    });
  }

  try {
    if (diaryId) {
      const diaryToDelete = await Diary.findByIdAndDelete(diaryId);
      const travel = await Travel.findByIdAndUpdate(travelId, {
        $pull: { travelDiary: diaryId },
      });
      console.log("Carnet Supprimé :", diaryToDelete);
      if (!diaryToDelete) {
        return res.status(404).json({ error: "Journal non trouvé" });
      }

      // Supprimez les ressources Cloudinary associées si nécessaire
      if (diaryToDelete.moment_pictures === "true") {
        await cloudinary.api.delete_resources_by_prefix(
          `memories/diary_images/${diaryId}`
        );
        await cloudinary.api.delete_folder(`memories/diary_images/${diaryId}`);
      }

      await travel.save();

      res.status(200).json({
        result: true,
        diary: diaryToDelete,
        message: "le carnet a bien été supprimé",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
