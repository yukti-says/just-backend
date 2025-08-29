class ApiResponse {
  constructor(statusCode, message = "Success", data = null) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = true || statusCode < 400;
  }
}
