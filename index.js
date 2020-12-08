const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []
let listFlag = 0 // 0: card, 1: list

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const cardButton = document.querySelector('#card-button')
const listButton = document.querySelector('#list-button')

function renderMovieList(data) {
  let rawHTML = ''

  if (listFlag === 0) {
    data.forEach(item => {
      rawHTML += `<div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img
                src="${POSTER_URL + item.image}"
                class="card-img-top" alt="Movie Poster">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <botton class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-model" data-id="${item.id}">More
                </botton>
                <botton class="btn btn-info btn-add-favorite" data-id="${item.id}">+</botton>
              </div>
            </div>
          </div>
        </div>`
    })
  } else {
    data.forEach(item => {
      rawHTML += `<ul class="list-group col-12">
      <li class="list-group-item d-flex justify-content-between align-items-center h5">${item.title}
        <div>
          <botton class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-model" data-id="${item.id}">More</botton>
          <botton class="btn btn-info btn-add-favorite" data-id="${item.id}">+</botton>
        </div>
      </li>
    </ul>`
    })
  }

  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-model-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios
    .get(`${INDEX_URL}/${id}`)
    .then(function (response) {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalImage.innerHTML = `<img src="${POSTER_URL}${data.image}" alt="movie-poster" class="img-fluid">`
      modalDate.innerText = `Release Data: ${data.release_date}`
      modalDescription.innerText = data.description
    })
    .catch((err) => console.log(err))
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)
  if (list.some(movie => movie.id === id)) {
    return alert('此電影已在收藏清單中')
  }
  list.push(movie)

  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page='${page}'>${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))
  if (filteredMovies.length === 0) {
    return alert(`Can't find movies with keyword: ${keyword}`)
  }

  renderMovieList(getMoviesByPage(1))
  renderPaginator(filteredMovies.length)
})

paginator.addEventListener('click', function onPaginator(event) {
  if (event.target.tagName !== 'A') return
  const page = event.target.dataset.page
  renderMovieList(getMoviesByPage(page))
})

cardButton.addEventListener('click', function clickCardButton(event) {
  listFlag = 0
  renderMovieList(getMoviesByPage(1))
  renderPaginator(movies.length)
})

listButton.addEventListener('click', function clickListButton(event) {
  listFlag = 1
  renderMovieList(getMoviesByPage(1))
  renderPaginator(movies.length)
})

axios
  .get(INDEX_URL)
  .then(function (response) {
    // Array(80)
    movies.push(...response.data.results)
    renderMovieList(getMoviesByPage(1), 'cardButton')
    renderPaginator(movies.length)
  })
  .catch((err) => console.log(err))
