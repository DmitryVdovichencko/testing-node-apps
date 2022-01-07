// Testing Pure Functions
import cases from 'jest-in-case'
import {isPasswordAllowed} from '../auth'

function casify(obj) {
  return Object.entries(obj).map(([testName, password]) => ({
    name: `${testName} - ${password}`,
    password,
  }))
}

// cases(`isPasswordAllowed(password)`, opts => {
//   expect(isPasswordAllowed(opts.password, opts.addend)).toBe(opts.result);
// }, [

// ]);

cases(
  'isPasswordAllowed(password) valid password',
  ({password}) => {
    expect(isPasswordAllowed(password)).toBe(true)
  },
  casify({
    'valid password': '!aBc123',
  }),
)

cases(
  'isPasswordAllowed(password) invalid passwords',
  ({password}) => {
    expect(isPasswordAllowed(password)).toBe(false)
  },
  casify({
    'too short password': 'a2c!',
    'no alphabet characters': '123456!',
    'no numbers': 'ABCdef!',
    'no uppercase letters': 'abc123!',
    'no lowercase letters': 'ABC123!',
    'no non-alphanumeric characters': 'ABCdef123',
  }),
)
