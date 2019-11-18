let mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let postSchema = mongoose.Schema({
  	id : {
            type : String,
            require : true },
  	title : { type : String },
  	content : { type : String },
  	author : { type : String },
  	publishDate : { type : Date }
});

let Post = mongoose.model( 'Post', postSchema );

let PostList = {
  	getAll : function() {
    		return Post.find()
                  .then( posts => {
              			return posts;
              		})
                  .catch( error => {
              			throw Error(error);
              		});
  	},
  	getByAuthor : function( author ) {
    		return Post.find({author: author})
                  .then( post => {
              			return post;
              		})
                  .catch( error => {
              			throw Error(error);
              		});
  	},
  	getByID : function( id ) {
    		return Post.find({id: id})
                  .then( post => {
              			return post;
              		})
                  .catch( error => {
              			throw new Error(error);
              		});
  	},
  	post : function(newPost) {
    		return Post.create(newPost)
                  .then( resultPost => {
              			return resultPost;
              		}).catch( error => {
              			throw Error(error);
              		});
  	},
  	delete : function(postId) {
    		return Post.findOneAndRemove({id: postId})
                  .then( post => {
              			return post;
              		}).catch( error => {
              			throw Error(error);
              		});
  	},
  	put : function( updatedPost ){
    		return Post.findOneAndUpdate( {id : updatedPost.id}, {$set : updatedPost}, {new : true})
            			.then( newPost => {
            				console.log(newPost);
            				return newPost;
            			})
            			.catch(error => {
            				throw Error(error);
            			});
  	}
}

module.exports = { PostList };
