import { logEvents } from "./logger.js";

const errorHandler = (err, req, res, next) => {
  logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, "errLog.log");
  console.error(err.stack);

  const status = res.statusCode ? res.statusCode : 500;
  res.status(status).json({ message: err.message, isError: true });
  next();
};

export default errorHandler;
