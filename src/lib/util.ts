/*
* Organise an array of objects by grouping based on a top level key
*/
export const groupBy = (array: Array<any>, key: string): Map<string, Array<any>> => {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key]] = result[currentValue[key]] || [])
    .push(currentValue)
    return result
  }, {})
}
