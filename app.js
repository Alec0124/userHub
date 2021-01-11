// ***Constants***
const BASE_URL = 'https://jsonplace-univclone.herokuapp.com';

// ***Functions*** */
function bootstrap() {
  fetchUsers().then(renderUserList);
}

function fetchData(url) {
  return fetch(url)
    .then(item => {
      return item.json();
    })
    .catch(item => {
      console.log("error: ", item);
    })
    ;
}

function fetchUsers() {
  return fetchData(`${BASE_URL}/users`)
}

function fetchUserAlbumList(userId) {
  return fetchData(`${BASE_URL}/users/${userId}/albums?_expand=user&_embed=photos`);
}

function fetchUserPosts(userId) {
  return fetchData(`${BASE_URL}/users/${userId}/posts?_expand=user`);
}

function fetchPostComments(postId) {
  return fetchData(`${BASE_URL}/posts/${postId}/comments`);
}

function renderUser(item) {

  const result = $(`<div class="user-card">
    <header>
      <h2>${item.name}</h2>
    </header>
    <section class="company-info">
      <p><b>Contact:</b> ${item.email}</p>
      <p><b>Works for:</b> ${item.company.name}</p>
      <p><b>Company creed:</b> "${item.company.catchPhrase}"</p>
    </section>
    <footer>
      <button class="load-posts">POSTS BY ${item.username}</button>
      <button class="load-albums">ALBUMS BY ${item.username}</button>
    </footer>
  </div>`);
  result.data('user', `${item.username}`)
    .data('userId', `${item.id}`)
  $('#user-list').append(result);

}

function renderUserList(userList) {
  $('#user-list').html('');
  userList.forEach(item => {
    renderUser(item);
  });
}

function renderAlbum(album) {
  const result = $(`<div class="album-card">
  <header>
    <h3>${album.title}, by ${album.user.username} </h3>
  </header>
  </div>`);
  const photoList = $('<section class="photo-list">');
  album.photos.forEach(item => {
    photoList.append(renderPhoto(item));
  });
  result.append(photoList);
  $('#album-list').append(result);
}

function renderPhoto(photo) {
  return $(`<div class="photo-card">
  <a href="${photo.url}" target="_blank">
    <img src="${photo.thumbnailUrl}">
    <figure>${photo.title}</figure>
  </a>
  </div>`);
}

function renderAlbumList(albumList) {
  $('#app section.active').removeClass('active');
  $('#album-list').html('').addClass('active');
  albumList.forEach(item => {
    renderAlbum(item);
  });
}

function renderPost(post) {
  const result = $(`<div class="post-card">
  <header>
    <h3>${post.title}</h3>
    <h3>--- ${post.user.username}</h3>
  </header>
  <p>${post.body}</p>
  <footer>
    <div class="comment-list"></div>
    <a href="#" class="toggle-comments">(<span class="verb">show</span> comments)</a>
  </footer>
  </div>`);
  result.data('post', post);
  $('#post-list').append(result);
}

function renderPostList(postList) {
  $('#app section.active').removeClass('active');
  $('#post-list').html('').addClass('active');
  postList.forEach(item => {
    renderPost(item);
  });
}

function setCommentsOnPost(post) {
  if (post.comments) {
    return Promise.reject(null);
  }
  return fetchPostComments(post.id)
    .then(function (comments) {
      post.comments = comments;
      return post;
    });

}

function toggleComments(postCardElement) {
  const footerElement = postCardElement.find('footer');

  if (footerElement.hasClass('comments-open')) {
    footerElement.removeClass('comments-open');
    footerElement.find('.verb').text('show');
  } else {
    footerElement.addClass('comments-open');
    footerElement.find('.verb').text('hide');
  }
}



// ***Event Handlers***
$('#user-list').on('click', '.user-card .load-posts', function () {
  const userId = $(this).closest('.user-card').data('userId');
  fetchUserPosts(userId).then(renderPostList);
});

$('#user-list').on('click', '.user-card .load-albums', function () {
  const userId = $(this).closest('.user-card').data('userId');
  fetchUserAlbumList(userId).then(renderAlbumList);
});

$('#post-list').on('click', '.post-card .toggle-comments', function () {
  const postCardElement = $(this).closest('.post-card');
  const post = postCardElement.data('post');

  setCommentsOnPost(post)
    .then(function (post) {
      post.comments.forEach(item => {
        const comment = $(`<h3>${item.body} --- ${item.email}</h3>`);
        postCardElement.find('.comment-list').append(comment);
      });
      toggleComments(postCardElement);
    })
    .catch(function () {
      toggleComments(postCardElement);
    });
});

// ***Initialize
bootstrap();