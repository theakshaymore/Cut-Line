const ImageKit = require("imagekit");

let imagekit = null;

const getImageKit = () => {
  if (imagekit) return imagekit;
  imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
  return imagekit;
};

const getImageKitAuthParams = () => {
  const sdk = getImageKit();
  return sdk.getAuthenticationParameters();
};

module.exports = { getImageKitAuthParams };
