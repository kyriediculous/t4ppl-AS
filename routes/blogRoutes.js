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
      console.log(posts.items[0]);
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
    }).catch(err => res.json('bad call'))
});

//Single Blog Post
//Use both id and slug for SEO performance / user experience
router.get('/post/:slug/:id', (req, res) => {
  console.log(req.params);
  Promise.all([singlePost(req.params.id), getCats()])
    .then( ([post, categories]) => {
      post.fields.text = md.render(post.fields.text);
       res.render('blog/blogPost',  {
        post : post,
        categories: categories,
        user: req.user,
        messages:  req.flash()
      });
    }).catch(err => console.log(err));
});

/* //By Category
router.get('/category/:cat_id', (req ,res) => {
  Promise.all([getCat(req.params.cat_id), getCats()])
    .then( ([posts, categories]) => {
      console.log(posts.items[0].fields);
      posts.includes.Entry = posts.includes.Entry.slice(0, posts.includes.Entry.length-1);
      posts.includes.Entry =  posts.includes.Entry.slice((req.query.page-1)*3, req.query.page*3);
      res.render('blog/blogCategory',{
        posts: posts,
        categories: categories,
        user: req.user,
        messages:req.flash(),
        pagination: {
          page: req.query.page,
          pageCount: Math.ceil(posts.total/3)
        }
      });
    }).catch(err => console.log(err))
}); */
router.get('/category/:cat_id', (req, res) => {
  Promise.all([getPostsByCat(req.params.cat_id, req.query.page), getCats()])
    .then( ([posts, categories]) => {
      var currentCat = categories.items.filter( (cat)=> cat.sys.id==req.params.cat_id);
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
