const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Google token required"
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    return res.json({
      success: true,
      message: "Google token valid",
      data: {
        email: payload.email,
        fullName: payload.name,
        picture: payload.picture
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid Google token"
    });
  }
};

module.exports = {
  googleLogin
};