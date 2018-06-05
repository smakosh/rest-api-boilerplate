## Models

User

- name
- email
- password
- avatar
- date

Profile

- user
- handle
- company
- website
- location
- status
- skills
- bio
- githubusername
- experience
  - title
  - company
  - joblocation
  - from
  - to
  - current
  - description
- education
  - school
  - degree
  - fieldofstudy
  - from
  - to
  - current
  - description
- social
  - youtube
  - facebook
  - twitter
  - linkedin
  - instagram
- date

Post

- user
- text
- name
- avatar
- likes
  - user
- comments
  - user
  - text
  - name
  - avatar
  - date
- date

## Routes

- User

        POST api/users/register
        // Register a new user
        // Public

        POST api/users/login
        // Login user - return JWT
        // Public

        GET api/users/current
        // Return current user data
        // Private

        POST api/users/register
        // Register a new user
        // Public

- Profile

        GET api/profile
        // GET current user profile
        // Private

        POST api/profile
        // create or Edit user profile
        // Private

        DELETE api/profile
        // Delete user and profile
        // Private

        GET api/profile/all
        // Get all profiles
        // Public

        GET api/profile/handle/:handle
        // Get profile by handle
        // Public

        POST api/profile/experience
        // Add experience to profile
        // Private

        DELETE api/profile/experience/:exp_id
        // Delete experience from profile
        // Private

        POST api/profile/education
        // Add education to profile
        // Private

        DELETE api/profile/education/:edu_id
        // Delete education from profile
        // Private

- Post

        POST api/posts
        // Create post
        // Private

        GET api/posts
        // Get all posts
        // Public

        GET api/posts/:id
        // Get Post by ID
        // Public

        DELETE api/posts/:id
        // Delete Post by ID
        // Private

        POST api/posts/like/:id
        // Like Post by ID
        // Private

        POST api/posts/unlike/:id
        // Unlike Post by ID
        // Private

        POST api/posts/comment/:id
        // Add a comment to Post
        // Private

        DELETE api/posts/comment/:id/:comment_id
        // Delete a comment by Id from a post
        // Private

## Credits
[Traversy Media Udemy course](https://www.udemy.com/mern-stack-front-to-back/learn/v4/content)
