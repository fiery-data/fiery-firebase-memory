
import firebase from '../src/'
import { populate, pluck } from './util'
import { expect, assert } from 'chai'


describe('query', () =>
{

  it('get simple', (done) =>
  {
    const APP = 'query get simple'
    let app = firebase.initializeApp({}, APP)
    let db = firebase.firestore(app)
    let gets = 0
    let errors = 0

    populate(db, {
      'todo/1': { name: '1', done: true, assigned: ['a'], age: 12 },
      'todo/7': { name: '7', done: true, assigned: ['b'], age: 11 },
      'todo/2': { name: '2', done: false, assigned: [], age: 10 },
      'todo/3': { name: '3', done: true, assigned: ['a', 'b'], age: 11 },
      'todo/5': { name: '5', done: false, assigned: ['c'], age: 8 },
      'todo/6': { name: '6', done: true, assigned: ['a'], age: 1 },
      'todo/4': { name: '4', done: false, assigned: ['d'], age: 20 }
    })

    db.collection('todo')
      .where('done', '==', false)
      .get()
      .then(querySnap => {
        expect(querySnap.docs.length).to.equal(3)
        expect(querySnap.size).to.equal(3)
        expect(pluck(querySnap, 'name')).to.deep.equal(['2', '5', '4'])
        done()
      })
      .catch(err => assert.fail(err))
  })

  it('get order', (done) =>
  {
    const APP = 'query get order'
    let app = firebase.initializeApp({}, APP)
    let db = firebase.firestore(app)
    let gets = 0
    let errors = 0

    populate(db, {
      'todo/1': { name: '1', done: true, assigned: ['a'], age: 12 },
      'todo/7': { name: '7', done: true, assigned: ['b'], age: 11 },
      'todo/2': { name: '2', done: false, assigned: [], age: 10 },
      'todo/3': { name: '3', done: true, assigned: ['a', 'b'], age: 11 },
      'todo/5': { name: '5', done: false, assigned: ['c'], age: 8 },
      'todo/6': { name: '6', done: true, assigned: ['a'], age: 1 },
      'todo/4': { name: '4', done: false, assigned: ['d'], age: 20 }
    })

    db.collection('todo')
      .where('assigned', 'array_contains', 'a')
      .orderBy('age')
      .get()
      .then(querySnap => {
        expect(querySnap.docs.length).to.equal(3)
        expect(querySnap.size).to.equal(3)
        expect(pluck(querySnap, 'name')).to.deep.equal(['6', '3', '1'])
        done()
      })
      .catch(err => assert.fail(err))
  })

  it('realtime', () =>
  {
    const APP = 'query realtime'
    let app = firebase.initializeApp({}, APP)
    let db = firebase.firestore(app)
    let gets = 0
    let errors = 0

    populate(db, {
      'todo/1': { name: '1', done: true, assigned: ['a'], age: 12 },
      'todo/7': { name: '7', done: true, assigned: ['b'], age: 11 },
      'todo/2': { name: '2', done: false, assigned: [], age: 10 },
      'todo/3': { name: '3', done: true, assigned: ['a', 'b'], age: 11 },
      'todo/5': { name: '5', done: false, assigned: ['c'], age: 8 },
      'todo/6': { name: '6', done: true, assigned: ['a'], age: 1 },
      'todo/4': { name: '4', done: false, assigned: ['d'], age: 20 }
    })

    let off = db.collection('todo')
      .where('assigned', 'array_contains', 'a')
      .orderBy('age')
      .onSnapshot(
        querySnap => {
          if (gets === 0) {
            expect(pluck(querySnap, 'name')).to.deep.equal(['6', '3', '1'])
          }
          if (gets === 1) {
            expect(pluck(querySnap, 'name')).to.deep.equal(['6', '5', '3', '1'])
          }
          if (gets === 2) {
            expect(pluck(querySnap, 'name')).to.deep.equal(['5', '3', '1'])
          }
          gets++
        },
        (err: Error) => {
          errors++
        }
      )

    expect(gets).to.equal(1)
    expect(errors).to.equal(0)

    db.doc('todo/5').update({
      assigned: firebase.firestore.FieldValue.arrayUnion('a')
    })

    expect(gets).to.equal(2)
    expect(errors).to.equal(0)

    db.doc('todo/4').delete()

    expect(gets).to.equal(2)
    expect(errors).to.equal(0)

    db.doc('todo/6').delete()

    expect(gets).to.equal(3)
    expect(errors).to.equal(0)

    off()

    db.doc('todo/3').delete()

    expect(gets).to.equal(3)
    expect(errors).to.equal(0)
  })

  it('changes properly', () => {

    const handleChanges = <E>(target: E[], changes: firebase.firestore.DocumentChange[]) => {
      for (const change of changes) {
        if (change.type !== 'added') {
          target.splice(change.oldIndex, 1)
        }
        if (change.type !== 'removed') {
          target.splice(change.newIndex, 0, change.doc.data() as E)
        }
      }
      return target
    }

    const APP = 'changes properly'
    let app = firebase.initializeApp({}, APP)
    let db = firebase.firestore(app)

    populate(db, {
      'todo/1': { name: '1', done: true, assigned: ['a'], age: 12 },
      'todo/7': { name: '7', done: true, assigned: ['b'], age: 11 },
      'todo/2': { name: '2', done: false, assigned: [], age: 10 },
      'todo/3': { name: '3', done: true, assigned: ['a', 'b'], age: 11 },
      'todo/5': { name: '5', done: false, assigned: ['c'], age: 8 },
      'todo/6': { name: '6', done: true, assigned: ['a'], age: 1 },
      'todo/4': { name: '4', done: false, assigned: ['d'], age: 20 }
    })

    const todos: any[] = []

    let off = db.collection('todo')
      .where('assigned', 'array_contains', 'a')
      .orderBy('age')
      .onSnapshot(
        querySnap => {
          handleChanges(todos, querySnap.docChanges())
        }
      )

    expect(todos.map(t => t.name)).to.deep.equal(['6', '3', '1'])

    db.doc('todo/5').update({
      assigned: firebase.firestore.FieldValue.arrayUnion('a')
    })

    expect(todos.map(t => t.name)).to.deep.equal(['6', '5', '3', '1'])

    db.doc('todo/4').delete()

    expect(todos.map(t => t.name)).to.deep.equal(['6', '5', '3', '1'])

    db.doc('todo/6').delete()

    expect(todos.map(t => t.name)).to.deep.equal(['5', '3', '1'])

    db.doc('todo/1').update({
      age: 7
    })

    expect(todos.map(t => t.name)).to.deep.equal(['1', '5', '3'])

    db.doc('todo/8').set({ name: '8', done: false, assigned: ['a', 'd'], age: 7.5 })

    expect(todos.map(t => t.name)).to.deep.equal(['1', '8', '5', '3'])

    db.doc('todo/8').update({
      age: 8.5
    })

    expect(todos.map(t => t.name)).to.deep.equal(['1', '5', '8', '3'])

    db.doc('todo/1').update({
      age: 20
    })

    expect(todos.map(t => t.name)).to.deep.equal(['5', '8', '3', '1'])

    off()
  })

})
