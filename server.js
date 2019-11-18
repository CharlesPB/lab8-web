let express = require("express");
let morgan = require("morgan");
let mongoose = require("mongoose");
let bodyParser = require('body-parser');
let uuid = require('uuid');

let { PostList } = require('./blog-post-model');
const {DATABASE_URL, PORT} = require('./config');


let app = express();
let jsonParser = bodyParser.json();

mongoose.Promise = global.Promise;

app.use(express.static('public'));

app.use(morgan("dev"));

let blogposts = [{
          id: uuid.v4(),
          title: "Vocalizando",
          content: "Cómo prepararse para mejorar",
          author: "Daniela Garcia",
          publishDate: Date.now()
        },
        {
          id: uuid.v4(),
          title: "Inicializando",
          content: "Cómo comenzar el proceso",
          author: "Carlos Pérez",
          publishDate: Date.now()
        },
        {
          id: uuid.v4(),
          title: "Finalizando",
          content: "Cómo terminar el proceso",
          author: "Carlos Pérez",
          publishDate: Date.now()
        },
        {
          id: uuid.v4(),
          title: "Twitter",
          content: "Lo que tienes que saber de la plataforma",
          author: "Marisol Paipilla",
          publishDate: Date.now()
        }];


app.get("/api/blog-posts", (req, res, next) => {
  	PostList.getAll()
            .then( posts => {
          		return res.status(200).json(posts);
          	})
            .catch( error => {
          		return res.status(500).json({
          			message: "Something went wrong with the DB. Try again later",
          			status: 500
          		});
          	});
});

app.get("/api/blog-post", function(req, res) {
  	let author = req.query.author;

  	if (author == "") {
  		res.statusMessage = "No author was provided";
  		return res.status(406).json({
  			message: "No author was provided",
  			status: 406
  		});
  	}

  	PostList.getByAuthor(author)
            .then( posts => {

          		if(posts.length == 0) {
          			res.statusMessage = "Author provided not found";
          			return res.status(404).json({
          				message: "Author provided not found",
          				status: 404
          			});
          		}

          		return res.status(200).json(posts);
          	})
            .catch(error => {
          		return res.status(500).json({
          			message: "Something went wrong with the DB. Try again later",
          			status: 500
          		});
          	});
});

app.post("/api/blog-posts", jsonParser, function(req, res) {
  	let newPost = req.body;

    //&& checkAttributes(newPost)
  	if(!(newPost.title && newPost.author && newPost.content)) {
  		res.statusMessage = "Missing field in body";
  		return res.status(406).json({
  			message: "Missing field in body",
  			status: 406
  		});
  	};

  	newPost.id = uuid.v4();
  	newPost.publishDate = new Date();

  	PostList.post(newPost)
            .then(post => {
          		return res.status(201).json(post);
          	})
            .catch(error => {
          		return res.status(500).json({
          			message: "Something went wrong with the DB. Try again later",
          			status: 500
          		});
          	});
});

app.delete("/api/blog-posts/:id", jsonParser, function(req, res) {
  	let id = req.params.id;

  	PostList.delete(id)
            .then( post => {
          		console.log(post);

          		if(post == null) {
          			res.statsMessage = "Post id not found";
          			return res.status(404).json({
          				message: "Post id not found",
          				status: 404
          			});
          		}

          		return res.status(202).json(post);
          	})
            .catch( error => {
          		return res.status(500).json({
          			message: "Something went wrong with the DB. Try again later",
          			status: 500
          		});
          	});
});

app.put("/api/blog-posts/:id", jsonParser, function(req, res) {
    let id = req.body.id;
    let author = req.body.author;
    let title = req.body.title;
    let content = req.body.content;
    let publishDate = req.body.publishDate;

    let new_post = {id: id};
  	if(new_post.id == undefined) {
  		res.statusMessage = "Missing id in body";
  		res.status(406).json({
  			message: "Missing id in body",
  			status: 406
  		});
  	};

  	if(new_post.id != req.params.id) {
  		res.statusMessage = "The id in the parameters does not match the id in the body";
  		res.status(409).json({
  			message: "The id in the parameters does not match the id in the body",
  			status: 409
  		});
  	};

    if ( title ) {
      new_post.title = title;
    }
    if ( publishDate ) {
      new_post.publishDate = publishDate;
    }
    if ( content ) {
      new_post.content = content;
    }
    if ( author ) {
      new_post.author = author;
    }
  	PostList.put(new_post)
            .then( post => {
          		if (post == null) {
          			res.statusMessage = "No post found with id given";
          			return res.status(404).json({
          				message: "No post found with id given",
          				status: 404
          			});
          		}
          		return res.status(202).json(post);
          	})
            .catch( error => {
          		return res.status(500).json({
          			message: "Something went wrong with the DB. Try again later",
          			status: 500
          		});
          	});
});


let server;

function runServer(port, databaseURL) {
	return new Promise( (resolve, reject) => {
		mongoose.connect(databaseURL, response => {
			if ( response ) {
				return reject(response);
			}
			else {
				server = app.listen(port, function() {
					console.log('Blog Post app running on server:' + port);
					resolve();
				}).on('error', err => {
					mongoose.disconnect();
					return reject(err);
				});
			}
		});
	});
};


function closeServer(){
	return mongoose.disconnect()
      .then(() => {
      		return new Promise((resolve, reject) => {
        			console.log('Closing the server');
        			server.close( err => {
        				if (err){
        					return reject(err);
        				}
        				else{
        					resolve();
        				}
        			});
      		});
    	});
}

runServer(PORT, DATABASE_URL)
  .catch( err => {
	   console.log( err );
   });

module.exports = { app, runServer, closeServer };
