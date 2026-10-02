// Wraps an async route so any thrown error goes to Express's error handler
// instead of crashing the request.
function asyncHandler(routeFunction) {
  return (req, res, next) => {
    Promise.resolve(routeFunction(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
