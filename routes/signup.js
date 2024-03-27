module.exports = (app) => {
    app.get('/signup', (req, res) => {
        var msg = '';
        res.render('signup', {
            'msg': msg
        });
    });
}