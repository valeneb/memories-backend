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
  if (!req.query._id) {
    return res.status(401).json({
      result: false,
      error: "diary file doesn't exist start to create something",
    });
  }
  const diaryToModify = await Diary.findById(req.query._id);
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
      for (let i = 0; i < req.files.picture.length; i++) {
        const picture = req.files.picture[i];
        console.log(picture);
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
        diaryToModify.moment_pictures.push(resultToUpload);
        // console.log(diaryToModify.moment_pictures);
        // console.log(resultToUpload);
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
  // console.log(diaryId);
  const travel = await Travel.findById(travelId);
  // console.log(req.query._id);
  // console.log(travel);

  if (!travel) {
    return res.status(404).json({
      result: false,
      error: "Travel not found",
    });
  }
  if (!diaryId) {
    return res.status(404).json({
      result: false,
      error: "diary not found in this travel",
    });
  }
  try {
    if (diaryId) {
      const diaryIdToTravel = travel.travelDiary.filter(
        (diaryItem) => diaryId === diaryItem._id
      );
      const diaryTodelete = await Travel.findOneAndUpdate(diaryId, {
        $push: { diaryId: diaryIdToTravel },
      });
      console.log(diaryTodelete);
      console.log(diaryToTravel);
      // console.log(travel.travelDiary);

      // await Travel.findOneAndDelete(diaryIdToTravel[0]);
      await travel.save();
      // diaryIdToTravel[0].delete();

      // Supprimez le journal en utilisant son ID
      // const diaryToDelete = await Diary.findByIdAndDelete(diaryId);
      // console.log("Carnet Supprimé :", diaryToDelete);
      // if (!diaryToDelete) {
      //   return res.status(404).json({ error: "Journal non trouvé" });
      // }
      // console.log(diaryToDelete.travelDiary._id);
      // // Supprimez les ressources Cloudinary associées si nécessaire
      // await cloudinary.api.delete_resources_by_prefix(
      //   `memories/diary_images/${diaryId}`
      // );
      // await cloudinary.api.delete_folder(`memories/diary_images/${diaryId}`);
      //   (diaryItem) => {
      //   diaryId.toString() === diaryItem._id.toString();
      //   console.log(diaryItem);
      // });
      // console.log(travel);
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
/* if (req.files?.picture) {
  if (!Array.isArray(req.files.picture)) {
    const picture = req.files.picture;

    if (picture.mimetype.slice(0, 5) !== "image") {
      return res.status(400).json({
        result: false,
        message:
          "You must send an image in a good format (jpeg/jpg/png, etc.).",
      });
    }

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
    for (let i = 0; i < req.files.picture.length; i++) {
      const picture = req.files.picture[i];

      if (picture.mimetype.slice(0, 5) !== "image") {
        return res.status(400).json({
          message:
            "You must send images in a good format (jpeg/jpg/png, etc.).",
        });
      }

      const resultToUpload = await cloudinary.uploader.upload(
        convertToBase64(picture),
        {
          folder: `memories/diary_images/${newDiary._id}`,
        }
      );

      newDiary.moment_pictures.push(resultToUpload);
    }
  }
}*/
// await cloudinary.uploader.destroy(diaryToModify.moment.public_id);
//   const resultUploadedMoment = await cloudinary.uploader.upload(
//     convertToBase64(req.files.picture),
//     {
//       folder: `memories/diary_images/${diaryToModify._id}`,
//       public_id: "diary",
//     }
//   );
//   console.log(diaryToModify.moment_pictures);
//   // diaryToModify.moment = resultUploadedMoment;
//   diaryToModify.moment_pictures.push(resultUploadedMoment);
//   console.log(resultUploadedMoment);
// }
// // (

//   Array.isArray(req.files?.picture) ||
//   req.files?.picture.length >= 0
// )

//   // const savedDiary = await newDiary.save();
//   findTravel.travelDiary.push(savedDiary._id);
//   await findTravel.save();
