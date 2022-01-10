// Testing Controllers

import {
  buildUser,
  buildBook,
  buildListItem,
  buildReq,
  buildRes,
} from 'utils/generate'
import * as booksDB from '../../db/books'
import * as listItemsDB from '../../db/list-items'
import * as listItemsController from '../list-items-controller'

jest.mock('../../db/books')
jest.mock('../../db/list-items')

beforeEach(() => {
  jest.resetAllMocks()
})

test('getListItem returns the req.listItem', async () => {
  const user = buildUser()
  const book = buildBook()
  const listItem = buildListItem({ownerId: user.id, bookId: book.id})
  booksDB.readById.mockResolvedValueOnce(book)
  const req = buildReq({user, listItem})
  const res = buildRes()
  await listItemsController.getListItem(req, res)

  expect(booksDB.readById).toHaveBeenCalledTimes(1)
  expect(booksDB.readById).toHaveBeenCalledWith(book.id)

  expect(res.json).toHaveBeenCalledTimes(1)
  expect(res.json).toHaveBeenCalledWith({listItem: {...listItem, book}})
})

test('createListItem happy path', async () => {
  const user = buildUser()
  const book = buildBook()
  const listItem = buildListItem({ownerId: user.id, bookId: book.id})
  const req = buildReq({user, body: {bookId: book.id}})
  const res = buildRes()
  listItemsDB.query.mockResolvedValueOnce([])
  listItemsDB.create.mockResolvedValueOnce(listItem)
  booksDB.readById.mockResolvedValueOnce(book)
  await listItemsController.createListItem(req, res).catch((err) => err)
  expect(listItemsDB.query).toHaveBeenCalledTimes(1)
  expect(listItemsDB.query).toHaveBeenCalledWith({
    ownerId: user.id,
    bookId: book.id,
  })
  expect(listItemsDB.create).toHaveBeenCalledTimes(1)
  expect(listItemsDB.create).toHaveBeenCalledWith({
    ownerId: user.id,
    bookId: book.id,
  })
  expect(booksDB.readById).toHaveBeenCalledTimes(1)
  expect(booksDB.readById).toHaveBeenCalledWith(book.id)
  expect(res.json).toHaveBeenCalledTimes(1)
  expect(res.json).toHaveBeenCalledWith({listItem: {...listItem, book}})
})

test('createListItem returns a 400 error if no bookId is provided', async () => {
  const user = buildUser()
  const req = buildReq({user, body: {bookId: null}})
  const res = buildRes()
  await listItemsController.createListItem(req, res).catch((err) => err)
  // res.json.mock.calls[0].toMatchInlineSnapshot()
  expect(res.json.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "No bookId provided",
      },
    ]
  `)
})

test('createListItem returns a 400 error if listItem already exists for user', async () => {
  const user = buildUser()
  const book = buildBook()
  const listItem = buildListItem({ownerId: user.id, bookId: book.id})
  const req = buildReq({user, body: {bookId: book.id}})
  const res = buildRes()
  listItemsDB.query.mockResolvedValueOnce([listItem])
  await listItemsController.createListItem(req, res).catch((err) => err)
  // res.json.mock.calls[0].toMatchInlineSnapshot()
  expect(listItemsDB.query).toHaveBeenCalledTimes(1)
  expect(listItemsDB.query).toHaveBeenCalledWith({
    ownerId: user.id,
    bookId: book.id,
  })
  expect(res.json.mock.calls[0][0].message).toEqual(`User ${user.id} already has a list item for the book with the ID ${book.id}`)
})


test('update ListItem happy path', async () => {
  const user = buildUser()
  const book = buildBook()
  const listItem = buildListItem({ownerId: user.id, bookId: book.id})
  const req = buildReq({listItem, body: listItem })
  const res = buildRes()
  listItemsDB.update.mockResolvedValueOnce(listItem)
  booksDB.readById.mockResolvedValueOnce(book)
  await listItemsController.updateListItem(req, res)
  expect(listItemsDB.update).toHaveBeenCalledTimes(1)
  expect(listItemsDB.update).toHaveBeenCalledWith(req.listItem.id, req.body)
  expect(booksDB.readById).toHaveBeenCalledTimes(1)
  expect(booksDB.readById).toHaveBeenCalledWith(book.id)
  expect(res.json).toHaveBeenCalledTimes(1)
  expect(res.json).toHaveBeenCalledWith({listItem: {...listItem, book}})
})

test('delete ListItem happy path', async () => {
  const user = buildUser()
  const book = buildBook()
  const listItem = buildListItem({ownerId: user.id, bookId: book.id})
  const req = buildReq({listItem, body: listItem })
  const res = buildRes()
  listItemsDB.remove.mockResolvedValueOnce(true)
  await listItemsController.deleteListItem(req, res)
  expect(listItemsDB.remove).toHaveBeenCalledTimes(1)
  expect(listItemsDB.remove).toHaveBeenCalledWith(req.listItem.id)
  expect(res.json).toHaveBeenCalledTimes(1)
  expect(res.json).toHaveBeenCalledWith({success:true})
})