import { getTokens } from './tokens'

test('getTokens returns dark cat3 amber', () => {
  expect(getTokens('dark').cat3).toBe('#B27B27')
})
test('getTokens defaults to light', () => {
  expect(getTokens('light').cat3).toBe('#E69F00')
  expect(getTokens(undefined).bg).toBe('#F4F7EF')
})
