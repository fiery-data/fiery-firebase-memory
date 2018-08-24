
import firebase from '../src/'
import { populate, pluck } from './util'
import { expect } from 'chai'


describe('query', () =>
{

  it('get simple', () =>
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
        gets++
      })
      .catch(err => errors++)

    expect(gets).to.equal(1)
    expect(errors).to.equal(0)
  })

  it('get order', () =>
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
        gets++
      })
      .catch(err => errors++)

    expect(gets).to.equal(1)
    expect(errors).to.equal(0)
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

})
