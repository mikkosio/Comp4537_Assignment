module.exports = (app) => {
    app.get('/login', (req, res) => {
        var msg = '';
        res.render('login', {
            'msg': msg
        });
    });
}