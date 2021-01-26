# YelpCamp

YelpCamp is a website where users can create and review campgrounds. In order to review or create a campground, you must have an account.
This project was created using Node.js, Express, MongoDB, and Bootstrap. Passport.js was used to handle authentication.

## Screenshots

![](public/images/landing.png "Landing Page")
![](public/images/index.png "Index Page")
![](public/images/show.png "Show Page")

## Features

* Authentication:
  * User login with username and password
  
* Authorization:
  * One cannot manage posts without being authenticated
  * One cannot edit or delete posts and reviews created by other users
  
* Manage campground posts with basic functionalities:
  * Create, edit and delete posts and reviews
  * Like feature
  * Upload campground photos(multiple photos are allowed)
  * Display campground location on Maps
  * Search existing campgrounds
  
* Manage user account with basic functionalities:
  * Password reset via email confirmation
  
* Flash messages responding to users' interaction with the app

## Custom Enhancements

* Update campground photos and location when editing campgrounds
* Checking the size of the images while uploading via multer
* Use Helmet to strengthen security

## Getting Started
1. Install [mongodb](https://www.mongodb.com/)
2. Create a cloudinary account and an account on MapBox to get an API key and secret code.Then:
```
git clone https://github.com/satcasm/YelpCamp.git
cd yelpcamp
npm install

```
3. If you want to use some seed data for your application:(A default database is set for it make you change it)
```
cd seeds
node index.js
```

4. Create a .env file (or just export manually in the terminal) in the root of the project and add the following:
```
DATABASEURL=<url>
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_KEY=<key>
CLOUDINARY_SECRET=<secret>
MAPBOX_TOKEN=<token>
GMAILP=<password>
SECRET=<session-secret>
ADDRESS=<email>

```
5. Run ```mongod``` in another terminal and ```node app.js``` in the terminal with the project.  

6. Then go to [localhost:3000](http://localhost:3000/).

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

