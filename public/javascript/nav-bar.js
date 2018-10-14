fetch('/api/data/user')
  .then(function (response) {
    return response.json()
  })
  .then(function (data) {
    let img = document.getElementById('thumbnail-image');
    img.setAttribute('src', data.data[0].image_link);
  })