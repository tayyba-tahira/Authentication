const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/user'); // Import user model
const app = express();
const session=require('express-session');

mongoose.connect('mongodb://localhost:27017/authdemo', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret:'notagoodsecret'}));
// Routes
app.get('/', (req, res) => {
    res.send('THIS IS HOME PAGE!');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { password, username } = req.body;
    try {
        const hash = await bcrypt.hash(password, 12);
        const user = new User({ username, password: hash });
        await user.save();
        req.session.user_id=user._id;
        res.redirect('/');
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send('Error during registration');
    }
});

app.get('/login', (req, res) => {
    res.render('login'); // Assuming you have a login.ejs template
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).send('Invalid username or password');
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (validPassword) {
            req.session.user_id=user._id;
            res.redirect('/secret');
        } else {
            res.redirect('/login');
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Internal server error');
    }
});
app.post('/logout',(req,res)=>{
    req.session.destroy();
    res.redirect('/login');
})

app.get('/secret', (req, res) => {
    if( !req.session.user_id)
    {
    return  res.redirect('/login')
    }
    res.render('secret')
})


// Start server
app.listen(3000, () => {
    console.log('Serving your app on http://localhost:3000');
});
