exports.getHealth = (req, res) => {
    res.status(200).json({
        success: true,
        message: "FitMirror API is healthy"
    });
};