const asyncHandler = (requestHandler) => {
    return (req, res, next) => { // return is necessary because its a higher-order function(function that takes a function), else nothing is passed back to Express, and you’ll get an error 
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export { asyncHandler }