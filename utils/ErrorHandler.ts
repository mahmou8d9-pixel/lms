class ErrorHandler extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    // تساعد هذه الخطوة في إبقاء سجلات الأخطاء (Logs) نظيفة ومباشرة لسهولة التتبع (Debugging)
    Error.captureStackTrace(this, this.constructor);
  }
}
export default ErrorHandler;
