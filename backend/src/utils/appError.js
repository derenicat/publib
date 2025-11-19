// ÖZELLEŞTİRİLMİŞ HATA SINIFI (CUSTOM ERROR CLASS):
// Uygulama genelinde öngörülen ve güvenilir (operasyonel) hatalar oluşturmak için kullanılır.
// Bu sınıf sayesinde, programlama hataları (bug'lar) ile operasyonel hatalar
// (örn: "Geçersiz kullanıcı girişi", "Aranan sayfa bulunamadı") birbirinden ayırt edilebilir.
// `isOperational` özelliği, merkezi hata yöneticisinin (errorMiddleware)
// bu hatayı güvenli bir şekilde istemciye gönderip gönderemeyeceğini belirlemesini sağlar.
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
