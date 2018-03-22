/*The render function will render our index page.*/
exports.render = function(req, res) {
  /* Add other preprocessing for the index here */
  res.render('index', {
    /* Add other attributes to pass to the index here. */
    title : 'Beestream'
  });
};
