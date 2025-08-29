const asyncHandler = (requestHandler) => {
    return async (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => { next(err) });

    }
}

export { asyncHandler }

// const asyncHandler = () => { }
// const asyncHandler = (func) => { () => { } }
// const asyncHandler = async(func)=>()=>{}

// const asyncHandler = (func) => async (req, res, next) => { 
//     try {
//         await func(req, res, next);
//     }
//     catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         }); 
//     }
// }