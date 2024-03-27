module.exports = (app) => {
    app.get('/logout', (req, res) => {
        res.clearCookie('jwt');
        res.redirect('/login');
    });
}