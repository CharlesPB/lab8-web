function init(){

  fetch("/api/blog-posts")
    .then(response => {
      if (response.ok) {
        return response.json();
      }

      throw new Error(response.statusText);
    })
    .then(responseJSON => {
      console.log("response json", responseJSON);
      for (let i = 0; i < responseJSON.length; i++) {
        $("#postsList").append(`<li class="posts">
                                    <div>
                                        <p class="title">${responseJSON[i].title}</p>
                                        <p>${responseJSON[i].content}</p>
                                        <div>
                                            <p>escrito por ${
                                              responseJSON[i].author
                                            } on ${new Date(
          responseJSON[i].publishDate
        )}</p>
                                            <p>${
                                              responseJSON[i].id
                                            }</p>
                                        </div>
                                    </div>
								</li>`);
      }
    })
    .catch(err => {
      console.log(err);
    });

  $("#createPostBtn").on("click", event => {
    event.preventDefault();
    let title = $("#title").val();
    let author = $("#author").val();
    let content = $("#content").val();

    $(".errMessage").remove()

    const fetchOptions = {
      method: "POST",
      body: JSON.stringify({ title, content, author, publishDate: Date.now() }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    };

    fetch("/api/blog-posts", fetchOptions).then(res => {
      console.log(res);
      if (res.status === 201) {
        location.reload();
      } else {
        $("#newPost > fieldset").append(`<div class="errMessage">${res.statusText}</div>`)
      }
    });


  });


  $("#deletePostBtn").on("click", event => {
    event.preventDefault();
    let idDelete = $("#idDelete").val();

    $(".errMessage").remove()

    $.ajax({
		    url: "/api/blog-posts/" + idDelete,
		    method: "DELETE",
		    success: function() {
			       location.reload();
		    },
		    error: function(error) {
			       console.log(error);
             $("#deletePost > fieldset").append(`<div class="errMessage">${error.statusText}</div>`)
        }
	  });
  });

  $("#updatePostBtn").on("click", event => {
    event.preventDefault();
    let id = $("#idUpdate").val();
    let title = $("#titleUpdate").val();
    let author = $("#authorUpdate").val();
    let content = $("#contentUpdate").val();
    let publishDate = $("#publishDate").val();

    $(".errMessage").remove()

    const fetchOptions = {
      method: "PUT",
      body: JSON.stringify({
        id,
        title: title ? title : null,
        content: content ? content : null,
        author: author ? author : null,
        publishDate: publishDate ? publishDate : null
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    };

    fetch(`/api/blog-posts/${id}`, fetchOptions).then(res => {
      console.log(res);
      if (res.status === 202) {
        location.reload();
      } else {
        $("#updatePost > fieldset").append(`<div class="errMessage">${res.statusText}</div>`)
      }
    });
  });
}

$(init);
