import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const refs = {
  searchForm: document.querySelector('.search-form'),
  input: document.querySelector('input'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

refs.loadMoreBtn.style.display = 'none';
refs.searchForm.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onloadMoreBtn);
let page = 1;

function onSearch(e) {
  e.preventDefault();
  page = 1;
  refs.gallery.innerHTML = '';
  const term = refs.input.value.trim();

  if (term !== '') {
    fetchImages(term);
  } else {
    refs.loadMoreBtn.style.display = 'none';

    return Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

function onloadMoreBtn() {
  const term = refs.input.value.trim();
  page += 1;
  fetchImages(term, page);
}

async function fetchImages(term, page) {
  const BASE_URL = 'https://pixabay.com/api/';
  const apiKey = '34345525-6d11e2f3879927783b88e9d81';

  const params = {
    key: `${apiKey}`,
    q: term,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    page: page,
    per_page: 40,
  };

  try {
    const response = await axios.get(BASE_URL, { params });
    notifications(response.data.hits.length, response.data.total);
    markupImages(response.data);
  } catch (error) {
    console.log(error);
  }
}

function markupImages(items) {
  const markup = items.hits
    .map(
      item =>
        `<a class="photo-link" href="${item.largeImageURL}">
            <div class="photo-card">
            <div class="photo">
            <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy"/>
            </div>
                    <div class="info">
                        <p class="info-item">
                            <b>Likes</b>
                            ${item.likes}
                        </p>
                        <p class="info-item">
                            <b>Views</b>
                            ${item.views}
                        </p>
                        <p class="info-item">
                            <b>Comments</b>
                            ${item.comments}
                        </p>
                        <p class="info-item">
                            <b>Downloads</b>
                            ${item.downloads}
                        </p>
                    </div>
            </div>
        </a>`
    )
    .join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
  simpleLightBox.refresh();
}

function notifications(length, totalHits) {
  refs.loadMoreBtn.style.display = 'none';
  if (length === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }

  if (page === 1 || page > 1) {
    refs.loadMoreBtn.style.display = 'flex';
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
  }

  if (length < 40) {
    refs.loadMoreBtn.style.display = 'none';
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

const simpleLightBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});
