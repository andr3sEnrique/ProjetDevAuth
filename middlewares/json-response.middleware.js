module.exports.jsonResponseMiddleware = (req, res, next) => {
    res.jsonSuccess = (data, statusCode) => {
        const response = {
            success: true,
            data
        }
        res.status(statusCode).json(response);
    },

    res.jsonError = (error, statusCode) => {
        const response = {
            success: false,
            data: null,
            error: {
                message: error,
                code: statusCode
            }
        }
        res.status(statusCode).json(response);
    }

    next()
}