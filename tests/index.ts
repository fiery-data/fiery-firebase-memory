
import firebase from '../src/'
import { expect } from 'chai'

/**

expect( test ).to. equal ( expected )
expect( test ).to.not.equal ( expected )
expect( test ).to.deep.equal ( expected )
expect( testObject ).to.deep.include ( {prop: value})
expect( test ).to.be.a ( expectedTypeString )
expect( testArray ).to.include ( expectedItem )
expect ( test ).to.be.true
expect ( test ).to.be.false
expect ( test ).to.be.null
expect ( test ).to.be.undefined
expect ( testNumber ).to.be.finite
expect ( testStringArrayObject ).to.be.empty

*/

describe('initialize', () =>
{

  it('has default', () =>
  {
    const APP = '[DEFAULT]'
    let app = firebase.initializeApp({})

    expect(app).to.equal( firebase.app() )
    expect(app.name).to.equal(APP)
  });

  it('has name', () =>
  {
    const APP = 'initialize has name'
    let app = firebase.initializeApp({}, APP)

    expect(app).to.equal( firebase.app(APP) )
    expect(app.name).to.equal(APP)
  });

});
