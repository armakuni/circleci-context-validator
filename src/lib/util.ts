/*
* Organise an array of objects by grouping based on a top level key
*/
export const groupBy = (array: Array<any>, key: string): Map<string, Array<any>> => {
  // eslint-disable-next-line unicorn/no-array-reduce, unicorn/prefer-object-from-entries
  return array.reduce((result, currentValue) => {
    (result[currentValue[key]] = result[currentValue[key]] || [])
    .push(currentValue)
    return result
  }, {})
}
