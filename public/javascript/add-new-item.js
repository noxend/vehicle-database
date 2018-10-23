

import axios from 'axios'

fetch('/api/session', {
  method: post
})
  .then(function (response) {
    return response.json()
  })
  .then(function (data) {
    console.log(data);
  })