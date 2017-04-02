import nymbol
	from 'nymbol'

const nym = nymbol.suffix('nymrod', '')
export const CONSTANT  = nym('', 'CONSTANT')
export const EXTENDS   = nym('extends')
export const EXTEND    = nym('extend')
export const APPEND    = nym('append')
export const CONSTRUCT = nym('construct')
export const CREATE    = nym('create')
export const CRUSH     = nym('crush')
export const REBASE    = nym('rebase')
export const BASE      = nym('base')
export const WAS       = nym('was')
export const NEW       = nym('New')
export const BIND      = nym('bind')

export const THEN  = EXTEND
export const EDIT  = CREATE
export const SAVE  = REBASE
export const SAVED = BASE

const {
	assign,
	create,
	defineProperty,
	defineProperties,
	getOwnPropertyDescriptor,
	getOwnPropertyNames,
} = Object

const CONSTANT_NAME = /^[^a-z]*[A-Z]/

function identity(that) {
	return that
}

function ish(that) {
	return this == that
}

function _resolve(g) {
	switch ('function') {
		case typeof g.default === 'function' &&
		     typeof g.default[EXTENDS]: return g.default[EXTENDS]
		case typeof g[EXTENDS]:         return g[EXTENDS]
		case typeof g:                  return g
		default: throw new TypeError
	}
}

function transformer(f = identity) {
	f = _resolve(f)
	f = _lift(f)
	const R = ish.call(null, this) ? class {} : this
	const g = _build.call(R, f)
	const S = g(R)
	const T = f(S)
	return T
}

nymbol.call(transformer, 'nymrod')

function _build(f) {
	const R = this
	return _lift($ => class extends $ {

		static get [NEW]() {
			return this[BIND](CREATE)
		}

		// Rebase class/decorator hierarchy at a new root.
		static [EXTENDS](R) {
			return f(R)
		}

		// Append a subclass/subdecorator.
		static [EXTEND](g) {
			g = _resolve(g)
			return transformer.call(R, S => g(f(S)))
		}
		
		// Append a subclass/subdecorator as an inner-class.
		static [APPEND](f) {
			return this[EXTEND](f)
		}

		static [CREATE](source) {
			return (new this)[CREATE](source)
		}
		[CREATE](source) {
			let result; const target = this

			if (source == target.valueOf()) return target
			if (source.isPrototypeOf(target)) return source // Undo!

			for (const k in source) {
				let u = target[k]
				let v = source[k]

				// Allow for initialization via setter when value provided is `null`:
				if (u === undefined) { target[k] = null; u = target[k] }
				
				// Recursively `CREATE` each property:
				if (u && 'function' === typeof u[CREATE]) v = u[CREATE](v)
				
				// If unchanged, skip to the next one:
				if (u === v) continue

				// Otherwise vivify the result as a clone:
				if (result === undefined) result = create(target)
				result[k] = v
			}
			if (undefined === result) return target
			defineProperty(result, WAS,
				{configurable:true, enumerable:false, writable:false, value:this})
			result[CRUSH]
			return result
		}

		get [CRUSH]() {
		}

		static [CONSTRUCT](source) {
			return (new this)[CONSTRUCT](source)
		}
		[CONSTRUCT](source) {
			const target = this, result = target[CREATE](source)
			return target === result ? target : assign(target, result)
		}

		[REBASE](base) {
			if (undefined === base) switch (false) {
				case BASE in this: defineProperty(this, BASE, valueDescriptor)
				case null == this[BASE]: this[BASE] = base = this
			}
			// Beware of recursion on enumerable & circular/self-referential properties of `this`...
			return base[CREATE](this)
		}

		static [BIND](name) {
			return this[name].bind(this)
		}
		[BIND](name) {
			return this[name].bind(this)
		}

	})
}

function _lift(f) {
	return _memoize(_constantize(f))
}

function _memoize(f) {
	function g(S) {
		if (secret in S) return S
		const T = f(S); defineProperty(T, secret, {get}); return T
	}
	// Defines `g.valueOf` as `secret`, allowing eg. `g in T`:
	const secret = nymbol.call(g, null)
	const get = function () { return this }
	return g
}

function _constantize(f) {
	return S => {
		const T = f(S)
		_Constantize.call(T)
		_Constantize.call(T.prototype)
		return T
	}
}

function _Constantize() {
	const Names = getOwnPropertyNames(this)
	const Nangs = {}
	const descriptors = {}
	const owns = this.hasOwnProperty

	loop: for (let i_ = Names.length, i = 0; i < i_; i++) {

		// Processing limited to Title-case getter-only-properties:
		const Name = Names[i]; if (! CONSTANT_NAME.test(Name)) continue loop
		const {get, set} = getOwnPropertyDescriptor(this, Name)
		switch ('function') {
			case typeof set: continue loop
			case typeof get: break  
			default: continue loop
		}
		
		// Generating a unguessable name for the hidden property:
		const Nang = Nangs[Name] = Name + CONSTANT
		
		descriptors[Name] =
			new GetDescriptor(function () {
				// Return the value if already defined on the current instance:
				if (hasOwnProperty.call(this, Nang)) return this[Nang]
				
				// Define and return the value otherwise:
				try {
					const value = get.call(this)
					defineProperty(this, Nang, {configurable:true, enumerable:false, writable:false, value})
					return value
				}
				// Allow definitions to throw `null` or `undefined` to avoid reevaluation
				// (eg. if a calculation's dependencies haven't changed):
				catch (exception) {
					if (exception == null) return this[Nang]
					throw exception
				}
			})
	}
	
	once: for (const Name in Nangs) {
		
		descriptors.hasOwnProperty =
			new ValueDescriptor(function (Name) {
				return Nangs.hasOwnProperty(Name) &&
					owns.call(this, Nangs[Name]) || owns.call(this, Name)
			})

		break
	}

	// Could use some kind of flyweight pattern to cut down on garbage
	// (since most PropertyDescriptors have the same flags),
	// but I feel it's probably faster defining them en masse:
	defineProperties(this, descriptors)
}

const valueDescriptor = new ValueDescriptor

function ValueDescriptor(value) {
	this.configurable = true
	this.enumerable = false
	this.writable = true
	this.value = value
}

function GetDescriptor(get) {
	this.configurable = true
	this.enumerable = false
	this.get = get
}

const Constructor = transformer()

export {transformer, Constructor}
export default transformer
