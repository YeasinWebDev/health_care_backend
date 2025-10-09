import { NextFunction, Request, Response } from "express";

// Define a custom error interface for better type safety
interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let success = false;
  let message = err.message || "Something went wrong!";
  let error = err;

  // Log the error for debugging
  console.error("Error:", err);

  // Handle different types of errors
  if (err.name === "ValidationError") {
    statusCode = 500;
    message = "Validation Error";
  } else if (err.name === "CastError") {
    statusCode = 500;
    message = "Invalid ID format";
  } else if (err.code === 11000) {
    statusCode = 401;
    message = "Duplicate field value entered";
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === "production") {
    error = { 
      name: err.name,
      message: message,
      ...(err.isOperational && { stack: err.stack })
    };
  }

  res.status(statusCode).json({
    success,
    message,
    error: {
      name: error.name,
      message: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack })
    },
    ...(process.env.NODE_ENV === "development" && { 
      stack: error.stack 
    })
  });
};

export default globalErrorHandler;