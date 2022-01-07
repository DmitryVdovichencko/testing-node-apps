// Testing Middleware
import {buildRes, buildReq, buildNext} from 'utils/generate'
import {UnauthorizedError} from 'express-jwt'
import errorMiddleware from '../error-middleware'


//const createRes = (overrides = {}) => ({json: jest.fn(() => createRes), status: jest.fn(() => createRes), ...overrides})
// 🐨 Write a test for the UnauthorizedError case
test('testing UnauthorizedError case', () => {
  // const res = createRes();
  // const req = {}
  // const next = jest.fn(() => next)
	const res = buildRes();
	const req = buildReq();
	const next = buildNext();

  const error = new UnauthorizedError('unauthorize', {
    message: 'Access denied',
  })
	errorMiddleware(error, req, res, next)
	expect(next).not.toHaveBeenCalled()
  expect(res.status).toHaveBeenCalledWith(401)
	expect(res.json).toHaveBeenCalledWith({
		code: error.code, message: error.message
	})
	expect(res.status).toHaveBeenCalledTimes(1)
	expect(res.json).toHaveBeenCalledTimes(1)
})
// 🐨 Write a test for the headersSent case
test('testing headersSent case', () => {
  // const res = createRes({headersSent: true});
  // const req = {}
  // const next = jest.fn(() => next)
	const res = buildRes({headersSent: true});
	const req = buildReq();
	const next = buildNext();
  const error = new Error('header sent error')
	errorMiddleware(error, req, res, next)
	expect(res.json).not.toHaveBeenCalled()
	expect(res.status).not.toHaveBeenCalled()
	expect(next).toHaveBeenCalledTimes(1)
  expect(next).toHaveBeenCalledWith(error)
})

// 🐨 Write a test for the else case (responds with a 500)
test('testing else case (responds with a 500)', () => {
	const res = buildRes();
	const req = buildReq();
	const next = buildNext();
  const error = new Error('server failure')
	errorMiddleware(error, req, res, next)
	expect(next).not.toHaveBeenCalled()
  expect(res.status).toHaveBeenCalledWith(500)
	expect(res.status).toHaveBeenCalledTimes(1)
	expect(res.json).toHaveBeenCalledTimes(1)
	expect(res.json).toHaveBeenCalledWith({
		message: error.message,
		stack: error.stack
	})
})