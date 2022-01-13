// Testing Authentication API Routes

// 🐨 import the things you'll need
// 💰 here, I'll just give them to you. You're welcome
import axios from 'axios'
import {getData, handleRequestFailure} from 'utils/async'
import {resetDb} from 'utils/db-utils'
import * as usersDb from 'db/users'
import * as generate from 'utils/generate'
import startServer from '../start'

// 🐨 you'll need to start/stop the server using beforeAll and afterAll
// 💰 This might be helpful: server = await startServer({port: 8000})
let server, api
beforeAll(async () => {
  server = await startServer()
  const {port} = server.address()
  api = axios.create({baseURL: `http://localhost:${port}/api`})
  api.interceptors.response.use(getData, handleRequestFailure)
})
afterAll(async () => {
  await server.close()
})
// 🐨 beforeEach test in this file we want to reset the database
beforeEach(async () => {
  await resetDb()
})

test('auth flow', async () => {
  // 🐨 get a username and password from generate.loginForm()
  const {username, password} = generate.loginForm()
  // register
  // 🐨 use axios.post to post the username and password to the registration endpoint
  // 💰 http://localhost:8000/api/auth/register
  const registerResponse = await api.post('/auth/register', {
    username,
    password,
  })
  // 🐨 assert that the result you get back is correct
  // 💰 it'll have an id and a token that will be random every time.
  // You can either only check that `result.data.user.username` is correct, or
  // for a little extra credit 💯 you can try using `expect.any(String)`
  // (an asymmetric matcher) with toEqual.
  // 📜 https://jestjs.io/docs/en/expect#expectanyconstructor
  // 📜 https://jestjs.io/docs/en/expect#toequalvalue
  console.log(registerResponse)
	expect(registerResponse.user).toEqual({
		id:expect.any(String),
		token:expect.any(String),
		username
	})
  // expect(registerResponse.user.username).toEqual(username)
  // expect(registerResponse.user).toHaveProperty('token')

  // login
  // 🐨 use axios.post to post the username and password again, but to the login endpoint
  // 💰 http://localhost:8000/api/auth/login
  const loginResponse = await api.post('/auth/login', {username, password})
  // 🐨 assert that the result you get back is correct
  // 💰 tip: the data you get back is exactly the same as the data you get back
  // from the registration call, so this can be done really easily by comparing
  // the data of those results with toEqual
  // expect(loginResponse.user.username).toEqual(username)
  // expect(loginResponse.user).toHaveProperty('token')
	expect(loginResponse.user).toEqual(registerResponse.user)
  // authenticated request
  // 🐨 use axios.get(url, config) to GET the user's information
  // 💰 http://localhost:8000/api/auth/me
  // 💰 This request must be authenticated via the Authorization header which
  // you can add to the config object: {headers: {Authorization: `Bearer ${token}`}}
  // Remember that you have the token from the registration and login requests.
  const {token} = loginResponse.user
  const userResponse = await api.get('/auth/me', {
    headers: {Authorization: `Bearer ${token}`},
  })
  // 🐨 assert that the result you get back is correct
  // 💰 (again, this should be the same data you get back in the other requests,
  // so you can compare it with that).
  expect(userResponse.user.username).toEqual(username)
  expect(userResponse.user).toHaveProperty('token')
})

test('register exist user', async () => {
  const createExistUser = async () => {
    const {password} = generate.loginForm()
    usersDb.insert({username: 'dimon'})
    await api.post('/auth/register', {username: 'dimon', password})
  }

  await expect(createExistUser).rejects.toThrowErrorMatchingInlineSnapshot(
    `"400: {\\"message\\":\\"username taken\\"}"`,
  )
})

test('register user without password', async () => {
  const createUserWithoutPassword = async () => {
    const {username} = generate.loginForm()
    await api.post('/auth/register', {username})
  }
  await expect(
    createUserWithoutPassword,
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"400: {\\"message\\":\\"password can't be blank\\"}"`,
  )
})

test('register user without username', async () => {
  const createUserWithoutUsername = async () => {
    const {password} = generate.loginForm()
    await api.post('/auth/register', {password})
  }
  await expect(
    createUserWithoutUsername,
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"400: {\\"message\\":\\"username can't be blank\\"}"`,
  )
})
