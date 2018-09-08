const express        = require('express');
const router         = express.Router();
const client         = require('../services/contentfulClient').client;
const stringify      = require('json-stringify-safe');

const MarkdownIt = require('markdown-it'),
    md = new MarkdownIt();

//Blog Index
router.get('/', (req, res) => {
  Promise.all([getPosts(req.query.page), getCats()])
    .then( ([posts, categories]) => {
      console.log(categories)
      categories.items = categories.items.filter(cat => cat.fields.posts)
      res.render('blog/blogIndex',{
        posts: posts,
        categories: categories,
        pagination: {
          page: req.query.page,
          pageCount: Math.ceil(posts.total/3)
        },
        user: req.user,
        messages:  req.flash()
      });
    }).catch(err => console.log(err))
});

//Single Blog Post
//Use both id and slug for SEO performance / user experience
router.get('/post/:slug/:id', (req, res) => {
  console.log(req.params);
  Promise.all([singlePost(req.params.id), getCats()])
    .then( ([post, categories]) => {
      categories.items = categories.items.filter(cat => cat.fields.posts)

      post.fields.text = md.render(post.fields.text);
      console.log(post.fields.categories)
       res.render('blog/blogPost',  {
        post : post,
        categories: categories,
        user: req.user,
        messages:  req.flash()
      });
    }).catch(err => console.log(err));
});


  //By Category
router.get('/category/:cat_id',  (req ,res) => {
  Promise.all([getCat(req.params.cat_id), getCats()])
    .then( ([posts, categories]) => {
      categories.items = categories.items.filter(cat => cat.fields.posts)

      console.log(posts.items[0].fields)
      let postsArray = posts.includes.Entry

       postsArray.forEach(post => {
        if (post.fields.images) {
          post.fields["thumbnail"] = posts.includes.Asset.find(asset => asset.sys.id == post.fields.images[0].sys.id)
        }
      })
      res.render('blog/blogCategory',{
        posts: posts.items[0].fields.posts.slice((req.query.page-1)*3, req.query.page*3),
        category: posts.items[0],
        categories: categories,
        user: req.user,
        messages:req.flash(),
        pagination: {
          page: req.query.page,
          pageCount: Math.ceil(posts.items[0].fields.posts.length/3)
        }
      });
    }).catch(err => console.log(err))
});

/*
router.get('/category/:cat_id', (req, res) => {
  Promise.all([getPostsByCat(req.params.cat_id, req.query.page), getCats(), getCat(req.params.cat_id)])
    .then( ([posts, categories, thisCat]) => {
      var currentCat = categories.items.filter( (cat)=> cat.sys.id==req.params.cat_id);
      console.log(posts)
      res.render('blog/blogCategory',{
        category: currentCat[0],
        posts: posts,
        categories: categories,
        pagination: {
          page: req.query.page,
          pageCount: Math.ceil(posts.total/3)
        },
        user: req.user,
        messages:  req.flash()
      });
    }).catch(err => res.json('bad call'))
});
*/

module.exports = router;


function getPosts (page){
  return client.getEntries({
    'content_type': 'blogPost',
     order: '-fields.date',
     limit: 3*page,
     skip: 3*(page-1)
  });
};

function singlePost (id) {
  return client.getEntry(id);
};

function getCats (){
  return client.getEntries({
    'content_type': 'categories',
    'include':0
  });
}

function getPostsByCat (cat_id, page){
  return client.getEntries({
    'content_type': 'blogPost',
    'fields.categories.sys.id': cat_id,
     order: '-fields.date',
     limit: 3*page,
     skip: 3*(page-1)
  });
};

function getCat (cat_id){
  return client.getEntries({
    'content_type': 'categories',
    'sys.id': cat_id,
    'include':1
  });
}
