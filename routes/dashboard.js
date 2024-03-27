module.exports = (app) => {
    app.get('/dashboard', (req, res) => {
        var msg = '';
        res.render('dashboard', {
            'msg': msg
        });
    });
}