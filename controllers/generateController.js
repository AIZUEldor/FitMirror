const { generateTryOnImage } = require("../services/aiService");

exports.generateTryOn = async (req, res) => {
    try {
        const personImage = req.files?.personImage?.[0];
        const clothImage = req.files?.clothImage?.[0];

        if (!personImage || !clothImage) {
            return res.status(400).json({
                success: false,
                message: "personImage and clothImage are required"
            });
        }

        const result = await generateTryOnImage(personImage.path, clothImage.path);

        res.json({
            success: true,
            message: "AI try-on generated successfully",
            uploadedFiles: {
                personImage: personImage.filename,
                clothImage: clothImage.filename
            },
            result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "AI generation failed",
            error: error.message
        });
    }
};