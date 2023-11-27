const imagekit = require("../lib/imagekit");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function updateProfilPicture(req,res){
  try {
    const stringFile = req.file.buffer.toString("base64");
    const uploadFile = await imagekit.upload({
      fileName: req.file.originalname,
      file: stringFile,
    });

    const user = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        profile_picture: uploadFile.url,
      },
    });
    return res.json({
      status: 200,
      message: "success",
      data: {
        name: uploadFile.name,
        url: uploadFile.url,
        type: uploadFile.fileType,
      },
    });
  } catch (error) {
    throw error;
  }
}

module.exports = { updateProfilPicture }