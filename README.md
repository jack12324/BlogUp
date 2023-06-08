# BlogUp
BlogUp is website designed to allow users to find, save, and share blogs.

Start using BlogUp at [blogup.fly.dev](https://blogup.fly.dev)

## Usage
- Users may add blogs they would like to share by providing the blog title, author, and url
- Once a blog is added, anyone who visits the home page will be able to see it and navigate to it with a click
- Users are able to delete blogs which they have added
- Blogs are displayed on the home page in order of the likes they have received
- Only authenticated users may like, create, or delete blogs
- Dark mode supported


## Technical Details
BlogUp is built with a MERN stack:
- [**M**ongoDB](https://www.mongodb.com) for data storage
- [**E**xpress](https://expressjs.com/) for the backend 
- [**R**eactJS](https://react.dev/) for the frontend
- [**N**odeJS](https://nodejs.org/en) for a runtime environment

Beyond MERN:
- [Chakra UI](https://chakra-ui.com/) enables a responsive user experience
- [Fly.io](https://fly.io/) to host the app

## CI/CD
Github actions are used for CI/CD. Commits are not allowed to the master branch. Because of this, all commits must be merged via a pull request. Github actions allow each pull request to be linted, built, and tested automatically. Merges will not be allowed unless all checks pass. Once a branch is merged into master, it is tagged with a release version and deployed to fly.io 


