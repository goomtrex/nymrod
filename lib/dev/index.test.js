import nymrod, {EDIT}
	from '.'

import {assert}
	from 'chai'

describe('nymrod', () => {

	it("should never result in enumerable hidden variables", () => {
	})

	it("should have no change on edit with empty object", () => {
		const Thing = nymrod($ => class extends $ {
			get FOO() {
				return Math.random()
			}
		})

		const beforeThing = new Thing
		const afterThing = beforeThing[EDIT]({})
		assert.equal(beforeThing, afterThing)
	})

	it("should recalculate constant properties after change", () => {
		const Thing = nymrod($ => class extends $ {
			get FOO() {
				return Math.random()
			}
		})

		const beforeThing = new Thing
		const beforeValue = beforeThing.FOO

		const afterThing = beforeThing[EDIT]({bar:99})
		const afterValue = afterThing.FOO

		assert.notEqual(beforeThing, afterThing)
		assert.notEqual(beforeValue, afterValue)

		assert(beforeThing.hasOwnProperty('FOO'), "hasOwnProperty")
		assert(afterThing.hasOwnProperty('FOO'), "hasOwnProperty")
	})

	it("should retain constant properties after no change", () => {
		const Thing = nymrod($ => class extends $ {
			constructor(/* ...arguments */) {
				super(...arguments)
				this.bar = 99
			}
			get FOO() {
				return Math.random()
			}
		})

		const beforeThing = new Thing
		const beforeValue = beforeThing.FOO

		const afterThing = beforeThing[EDIT]({bar:99})
		const afterValue = afterThing.FOO

		assert.equal(beforeThing, afterThing)
		assert.equal(beforeValue, afterValue)
	})

})
