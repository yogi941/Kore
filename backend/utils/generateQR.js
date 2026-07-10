const QRCode = require('qrcode');

const generateQRCode = async (data) => {
  try {
    const qrDataURL = await QRCode.toDataURL(JSON.stringify(data), {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 2,
    });
    return qrDataURL;
  } catch (error) {
    console.error('QR generation failed:', error);
    return null;
  }
};

module.exports = generateQRCode;
