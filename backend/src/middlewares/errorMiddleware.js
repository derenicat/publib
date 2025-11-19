import AppError from '../utils/appError.js';

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

// Function to send detailed errors in the development environment
// GELİŞTİRME ORTAMI İÇİN HATA GÖNDERİMİ:
// Geliştirme sırasında, hatanın kaynağını hızlıca bulabilmek için
// mümkün olan en detaylı bilgiyi (stack trace dahil) geliştiriciye gönderir.
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// ÜRETİM ORTAMI İÇİN HATA GÖNDERİMİ:
// Üretim ortamında, güvenlik zaafiyeti yaratmamak ve kullanıcıyı gereksiz
// teknik detaylarla yormamak için sadece temiz ve anlaşılır hata mesajları gönderilir.
// İki tür hata ayırt edilir:
const sendErrorProd = (err, res) => {
  // 1) Operasyonel Hatalar (Operational Errors): Güvenilir ve beklenen hatalardır
  // (örn: "Geçersiz kullanıcı girişi"). Bu hataların mesajı doğrudan kullanıcıya gösterilir.
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // 2) Programlama Hataları (Programming Errors): Beklenmedik ve koddan kaynaklanan hatalardır.
  // Bu hatalar loglanır ancak kullanıcıya sadece genel bir hata mesajı gösterilir.
  // Bu, uygulamanın iç yapısının sızdırılmasını engeller.
  console.error('ERROR 💥', err);

  // Send a generic message
  res.status(500).json({
    status: 'error',
    message: 'Something went very wrong on the server.',
  });
};

// MERKEZİ HATA YÖNETİMİ (GLOBAL ERROR HANDLER):
// Express'teki tüm hataları yakalayan ve tek bir yerden yöneten ara yazılımdır.
// Uygulamanın çalışma ortamına (geliştirme/üretim) göre farklı detay seviyelerinde
// hata yanıtları oluşturur. Üretim modunda, Mongoose veya JWT gibi kaynaklardan gelen
// teknik hataları, kullanıcı dostu ve operasyonel hatalara dönüştürür.
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'production') {
    let error = { ...err, message: err.message, name: err.name };
    error.errmsg = err.errmsg; // Make sure to copy errmsg as well

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  } else {
    // In development mode, send all details
    sendErrorDev(err, res);
  }
};

export default globalErrorHandler;
