import defaults from './options'

function format(input, opt = defaults) {
  if (input == null) return null

  if (opt.allowBlank && isNormalInteger(input)) {
    input = numbersToCurrency(input, fixed(opt.precision))
  }

  if (!isNaN(input)) {
    input = Number(input).toFixed(fixed(opt.precision))
  }

  const negative = (!opt.disableNegative) ? (input.indexOf('-') >= 0 ? '-' : '') : ''
  const filtered = input.replace(opt.prefix, '').replace(opt.suffix, '')
  const numbers = onlyNumbers(filtered)

  let currency = Number(numbersToCurrency(numbers, opt.precision));
  if (currency > opt.max) {
    currency = opt.max
  } else if (input < opt.min) {
    currency = opt.min
  }

  currency = currency.toFixed(fixed(opt.precision))
  if (currency === '0.00' && opt.allowBlank) {
    return ''
  }

  const parts = toStr(currency).split('.')

  if (opt.minimumNumberOfCharacters > 0) {
    const currentLength = (parts[0] + '').length + (parts[1] + '').length;
    const diff = opt.minimumNumberOfCharacters - currentLength;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        parts[0] = '0' + parts[0];
      }
    }
  }

  let integer = parts[0]
  const decimal = parts[1]
  integer = addThousandSeparator(integer, opt.thousands)

  return opt.prefix + negative + joinIntegerAndDecimal(integer, decimal, opt.decimal) + opt.suffix
}

function unformat(input, opt = defaults) {
  if (input == null) return null
  
  const negative = (!opt.disableNegative) ? (input.indexOf('-') >= 0 ? -1 : 1) : 1;
  const filtered = input.replace(opt.prefix, '').replace(opt.suffix, '')
  const numbers = onlyNumbers(filtered)
  const currency = numbersToCurrency(numbers, opt.precision)
  return parseFloat(currency) * negative
}

function onlyNumbers(input) {
  return toStr(input).replace(/\D+/g, '') || '0'
}

// Uncaught RangeError: toFixed() digits argument must be between 0 and 20 at Number.toFixed
function fixed(precision) {
  return between(0, precision, 20)
}

function between(min, n, max) {
  return Math.max(min, Math.min(n, max))
}

function numbersToCurrency(numbers, precision) {
  const exp = Math.pow(10, precision)
  const float = parseFloat(numbers) / exp
  return float.toFixed(fixed(precision))
}

function addThousandSeparator(integer, separator) {
  return integer.replace(/(\d)(?=(?:\d{3})+\b)/gm, `$1${separator}`)
}

// function currencyToIntegerAndDecimal (float) {
//   return toStr(float).split('.')
// }

function joinIntegerAndDecimal(integer, decimal, separator) {
  return decimal ? integer + separator + decimal : integer
}

function toStr(value) {
  return value ? value.toString() : ''
}

function setCursor(el, position) {
  const setSelectionRange = function () {
    el.setSelectionRange(position, position)
  }
  if (el === document.activeElement) {
    setSelectionRange()
    setTimeout(setSelectionRange, 1); // Android Fix
  }
}

// https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events#The_old-fashioned_way
function event(name) {
  const evt = document.createEvent('Event')
  evt.initEvent(name, true, true)
  return evt
}

function isNormalInteger(str) {
  const n = Math.floor(Number(str));
  return n !== Infinity && String(n) === str && n >= 0;
}

export {
  format,
  unformat,
  setCursor,
  event
}
