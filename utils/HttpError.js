// An error that carries an HTTP status code.
// Routes throw it, and the error handler in server.js turns it into a JSON response.
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = HttpError;
