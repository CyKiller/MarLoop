const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log("User is authenticated, proceeding to the next middleware.");
    return next();
  } else {
    console.log("User is not authenticated, redirecting to login.");
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/auth/login');
  }
};

const forwardAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    console.log("User is not authenticated, proceeding to the next middleware.");
    return next();
  }
  console.log("User is authenticated, redirecting to dashboard.");
  res.redirect('/dashboard');  
};

module.exports = {
  ensureAuthenticated,
  forwardAuthenticated
};