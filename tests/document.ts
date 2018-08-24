
import firebase from '../src/'
import { populate } from './util'
import { expect, assert } from 'chai'


describe('document', () =>
{

  it ('sets', () =>
  {
    const APP = 'document sets'
    let app = firebase.initializeApp({}, APP)
    let db = firebase.firestore(app)

    db.collection('role').doc('admin').set({
      name: 'Administrator',
      priority: 10
    })

    let doc = db.dataAt('role/admin')

    expect(doc.name).to.equal('Administrator')
    expect(doc.priority).to.equal(10)

    let collection = db._collections['role']

    expect(collection).to.deep.equal(['admin'])
  })

  it ('chains sync', (done) =>
  {
    const APP = 'document chains sync'
    let app = firebase.initializeApp({}, APP)
    let db = firebase.firestore(app)

    db.doc('role/admin').set({name: 'Chains', admin: '3'})
    db.doc('admin/3').set({name: 'Thomas'})

    db.collection('role')
      .doc('admin').get()
      .then(role => {
        expect(role.get('name')).to.equal('Chains')
        return db.collection('admin').doc(role.get('admin')).get()
      })
      .then(admin => {
        expect(admin.get('name')).to.equal('Thomas')
        done()
      })
      .catch(err => assert.fail(err))
  })

  it ('merges', () =>
  {
    const APP = 'document merges'
    let app = firebase.initializeApp({}, APP)
    let db = firebase.firestore(app)

    let docRef = db.collection('person').doc()
    docRef.set({
      name: 'Administrator',
      priority: 10,
      favorite: [1, 4, 6]
    })

    let doc = db.dataAt(docRef.path)

    expect(doc).to.deep.equal({name: 'Administrator', priority: 10, favorite: [1, 4, 6]})

    docRef.update({
      favorite: firebase.firestore.FieldValue.arrayUnion(2, 3, 5),
      priority: 5
    })

    expect(doc).to.deep.equal({name: 'Administrator', priority: 5, favorite: [1, 4, 6, 2, 3, 5]})

    docRef.set({
      favorite: firebase.firestore.FieldValue.arrayRemove(1, 3, 5)
    }, {merge: true})

    expect(doc).to.deep.equal({name: 'Administrator', priority: 5, favorite: [4, 6, 2]})
  })

  it('get', (done) =>
  {
    const APP = 'document get'
    let app = firebase.initializeApp({}, APP)
    let db = firebase.firestore(app)

    populate(db, {
      'cars/ford': {model: 'taurus', color: 'silver', miles: 123456}
    })

    db.collection('cars').doc('ford').get()
      .then(snap => {
        expect(snap.exists).to.be.true
        expect(snap.data()).to.deep.equal({model: 'taurus', color: 'silver', miles: 123456})
        expect(snap.get('color')).to.equal('silver')

        return db.collection('cars').doc('honda').get()
      })
      .then(snap => {
        expect(snap.exists).to.be.false
        done()
      })
      .catch(err => assert.fail(err))
  })

  it('realtime', () =>
  {
    const APP = 'document realtime'
    let app = firebase.initializeApp({}, APP)
    let db = firebase.firestore(app)
    let updates = 0
    let errors = 0
    let miles = [123456, 654321, 666]

    populate(db, {
      'cars/ford': {model: 'taurus', color: 'silver', miles: 123456}
    })

    let off = db.collection('cars').doc('ford').onSnapshot(
      snap => {
        expect(snap.exists).to.be.true
        expect(snap.get('miles')).to.equal(miles[updates])
        updates++
      },
      (err: Error) => {
        errors++
      }
    )

    db.doc('cars/ford').update({
      miles: 654321
    })

    db.doc('cars/ford').update({
      miles: 666
    })

    expect(updates).to.be.equal(3)
    expect(errors).to.be.equal(0)

    off()

    db.doc('cars/ford').update({
      miles: 8675309
    })

    expect(updates).to.be.equal(3)
    expect(errors).to.be.equal(0)
  })

  it('deletes', () =>
  {
    const APP = 'document deletes'
    let app = firebase.initializeApp({}, APP)
    let db = firebase.firestore(app)
    let updates = 0
    let deletes = 0
    let errors = 0

    populate(db, {
      'cars/ford': {model: 'taurus', color: 'silver', miles: 123456}
    })

    let off = db.collection('cars').doc('ford').onSnapshot(
      snap => {
        if (snap.exists) {
          updates++
        } else {
          deletes++
        }
      },
      (err: Error) => {
        errors++
      }
    )

    expect(updates).to.be.equal(1)

    db.doc('cars/ford').update({
      miles: 654321
    })

    expect(updates).to.be.equal(2)

    db.doc('cars/ford').delete()

    expect(updates).to.be.equal(2)
    expect(deletes).to.be.equal(1)
    expect(errors).to.be.equal(0)

    db.doc('cars/ford').delete()

    expect(updates).to.be.equal(2)
    expect(deletes).to.be.equal(1)
    expect(errors).to.be.equal(0)

    db.doc('cars/ford').set({
      model: 'taurus',
      color: 'silver',
      miles: 8675309
    })

    expect(updates).to.be.equal(3)
    expect(deletes).to.be.equal(1)
    expect(errors).to.be.equal(0)

    off()

    db.doc('cars/ford').update({
      miles: 333
    })

    expect(updates).to.be.equal(3)
    expect(deletes).to.be.equal(1)
    expect(errors).to.be.equal(0)
  })

})
