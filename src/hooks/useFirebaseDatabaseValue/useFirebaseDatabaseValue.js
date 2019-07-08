import _ from 'lodash';
import React from 'react';
import useFirebase from '../useFirebase';
import useStateHandlers from '../useStateHandlers';

function useFirebaseDatabaseValue(path, {
  orderByChild,     // string
  orderByKey,       // boolean
  orderByValue,     // boolean
  orderByPriority,  // boolean
  limitToFirst,     // number
  limitToLast,      // number
  startAt,          // number | string | boolean
  endAt,            // number | string | boolean
  equalTo           // any
} = {}) {
  const firebase = useFirebase()

  const [value, { set: setValue }] = useStateHandlers()

  const setValueFromSnapshot = React.useCallback(
    dataSnapshot => setValue(dataSnapshot.val()),
    [setValue]
  )

  React.useEffect(() => {
    let reference = firebase.database().ref(path)

    // order-by methods
    if (orderByChild) {
      reference = reference.orderByChild(orderByChild)
    } else if (orderByKey) {
      reference = reference.orderByKey()
    } else if (orderByValue) {
      reference = reference.orderByValue()
    } else if (orderByPriority) {
      reference = reference.orderByPriority()
    }

    // query methods
    if (limitToFirst) {
      reference = reference.limitToFirst(limitToFirst)
    } else if (limitToLast) {
      reference = reference.limitToLast(limitToLast)
    } else if (startAt) {
      reference = reference.startAt(startAt)
    } else if (endAt) {
      reference = reference.endAt(endAt)
    } else if (!_.isNil(equalTo)) { // so you can filter by falsey value
      reference = reference.equalTo(equalTo)
    }


    reference.on('value', setValueFromSnapshot)

    return function cleanup() {
      reference.off('value', setValueFromSnapshot)
    }
  }, [firebase, path, setValue])

  return value
}

export default useFirebaseDatabaseValue;