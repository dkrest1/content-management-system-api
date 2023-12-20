const request = require("supertest");
const app = require("../src/app");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require('mongodb-memory-server');
const UserModel = require("../src/models/user.model");
const CategoryModel = require("../src/models/category.model");
const PostModel = require("../src/models/post.model");

let mongoServer;

beforeAll(async () => {
    // Start the in-memory MongoDB server before all tests
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    // Stop the in-memory MongoDB server after all tests
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    // Clear the in-memory database before each test
    await mongoose.connection.collection('users').deleteMany({});
    await mongoose.connection.collection('posts').deleteMany({});
});

describe("Server and Tests", () => {
    it('responds with a status of 404', async() => {
        const response = await request(app).get("/");
        expect(response.statusCode).toBe(404);
    });
});

describe('POST /api/v1/posts', () => {
    it('should create a post successfully', async () => {
        const testUser = {
            email: 'testuser@example.com',
            password: 'testPassword123', 
            username: 'testuser'
        };

        const user = await UserModel.create(testUser);

        const testCategory = {
            name: 'technology',
            
        };

        const category = await CategoryModel.create(testCategory);

        // Login 
        const loginResponse = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'testuser@example.com',
                password: 'testPassword123',
            });

        const token = loginResponse.body.payload.access_token;

        // Create a post
        const createPostResponse = await request(app)
            .post('/api/v1/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                category: 'technology',
                title: 'Test Post',
                body: 'This is a test post.',
            });

        expect(createPostResponse.statusCode).toBe(201);
        expect(createPostResponse.headers['content-type']).toMatch(/^application\/json/);
        expect(createPostResponse.body).toEqual({
            status: 201,
            message: 'Post created successfully',
            payload: {
            post: expect.objectContaining({
                title: 'Test Post',
                body: 'This is a test post.',
            }),
            },
        });

        // Check of post is created in the database
        const createdPost = await PostModel.findOne({ title: 'Test Post' });
        expect(createdPost).toBeDefined();
        expect(createdPost.category.toString()).toBe(category._id.toString());
        expect(createdPost.user.toString()).toBe(user._id.toString());
    });
});

describe('PATCH /api/v1/posts/:postId', () => {
    it('should update a post successfully', async () => {
        const testUser = {
            email: 'testuser@example.com',
            password: 'testPassword123', 
            username: 'testuser'
        };

        const user = await UserModel.create(testUser);

        const testCategory = {
            name: 'technology',
        };

        const category = await CategoryModel.create(testCategory);

        const testPost = {
            title: 'Test Post',
            body: 'This is a test post.',
            user: user._id,
            category: category._id,
        };

        const post = await PostModel.create(testPost);

        // Login 
        const loginResponse = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'testuser@example.com',
                password: 'testPassword123',
            });

        const token = loginResponse.body.payload.access_token;

        // Update the post
        const updatePostResponse = await request(app)
            .patch(`/api/v1/posts/${post._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Updated Test Post',
                body: 'This is an updated test post.',
                category: 'updated technology',
            });

        expect(updatePostResponse.statusCode).toBe(200);
        expect(updatePostResponse.headers['content-type']).toMatch(/^application\/json/);
        expect(updatePostResponse.body).toEqual({
            status: 200,
            message: 'Post updated successfully',
            payload: {
            post: expect.objectContaining({
                title: 'Updated Test Post',
                body: 'This is an updated test post.',
            }),
            },
        });

        // Check if the post is updated in the database
        const updatedPost = await PostModel.findById(post._id);
        expect(updatedPost.title).toBe('Updated Test Post');
        expect(updatedPost.body).toBe('This is an updated test post.');
    });

});

describe('GET /api/v1/posts/:postId', () => {
    let post, testUser, user, testCategory, category, testPost
  
    beforeEach(async () => {
        // Create a user, post and category for testing

        testUser = {
            email: 'testuser@example.com',
            password: 'testPassword123', 
            username: 'testuser'
        };

        user = await UserModel.create(testUser);

        testCategory = {
            name: 'technology',
        };
        
        category = await CategoryModel.create(testCategory);

        testPost = {
            title: 'Test Post',
            body: 'This is a test post.',
            user,
            category
        };
  
        post = await PostModel.create(testPost);
    });

  
    afterAll(async () => {
        // Cleanup: Delete the created post
        await PostModel.deleteOne({ _id: post._id });
    });

  
    it('should find a post by ID successfully', async () => {
        const response = await request(app)
            .get(`/api/v1/posts/${post._id}`);
  
        expect(response.status).toBe(200);
        expect(response.body.status).toBe(200);
        expect(response.body.message).toBe('Success');
        expect(response.body.payload.post).toBeDefined();
    });
  
    it('should return a 400 status when post ID is invalid', async () => {
        const response = await request(app)
            .get('/api/v1/posts/1');
  
        expect(response.status).toBe(400);
        expect(response.body.status).toBe(400);
        expect(response.body.message).toBe('Invalid post ID');
    
    });

});

describe('GET /api/v1/posts', () => {
    let testUser, user, testCategory, category, testPosts;

    beforeEach(async () => {
        // Create a user, category, and multiple posts for testing
        testUser = {
            email: 'testuser@example.com',
            password: 'testPassword123',
            username: 'testuser' 
        };

        user = await UserModel.create(testUser);

        testCategory = {
            name: 'technology',
        };

        category = await CategoryModel.create(testCategory);

        testPosts = [
            {
                title: 'Test Post 1',
                body: 'This is test post 1.',
                user,
                category
            },
            {
                title: 'Test Post 2',
                body: 'This is test post 2.',
                user,
                category
            },
            {
                title: 'Test Post 3',
                body: 'This is test post 3.',
                user,
                category
            },
        ];

        await PostModel.create(testPosts);

    });

    afterAll(async () => {
        // Cleanup: Delete the created posts, user, and category
        await PostModel.deleteMany({ user: user._id });
        await UserModel.deleteOne({ _id: user._id });
        await CategoryModel.deleteOne({ _id: category._id });
    });

    it('should retrieve posts with pagination', async () => {
        const response = await request(app)
            .get('/api/v1/posts?page=1&limit=2');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe(200);
        expect(response.body.message).toBe('Success');
        expect(response.body.payload.docs.length).toBe(2);
        expect(response.body.payload.totalDocs).toBeGreaterThanOrEqual(3); 
    });

    it('should retrieve posts without pagination if query params are not provided', async () => {
        const response = await request(app)
            .get('/api/v1/posts');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe(200);
        expect(response.body.message).toBe('Success');
        expect(response.body.payload.docs.length).toBeGreaterThanOrEqual(3); 
        expect(response.body.payload.totalDocs).toBeGreaterThanOrEqual(3); 
    });

});

describe('DELETE /api/v1/posts/:postId', () => {
    let token, testUser, user, testCategory, category, testPost;

    beforeEach(async () => {
        // Create a user, post, and category for testing
        testUser = {
            email: 'testuser@example.com',
            password: 'testPassword123',
            username: 'testuser' 
        };

        user = await UserModel.create(testUser);

        testCategory = {
            name: 'technology',
        };

        category = await CategoryModel.create(testCategory);

        testPost = {
            title: 'Test Post',
            body: 'This is a test post.',
            user,
            category
        };

        testPost = await PostModel.create(testPost);

        // Login
        const loginResponse = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'testuser@example.com',
                password: 'testPassword123',
            });

        token = loginResponse.body.payload.access_token;
    });

    afterAll(async () => {
        // Cleanup: Delete the created post, user, and category
        await PostModel.deleteMany({ user: user._id });
        await UserModel.deleteOne({ _id: user._id });
        await CategoryModel.deleteOne({ _id: category._id });
    });

    it('should delete a post successfully', async () => {
        const response = await request(app)
            .delete(`/api/v1/posts/${testPost._id}`)
            .set('Authorization', `Bearer ${token}`)

        expect(response.status).toBe(200);
        expect(response.body.status).toBe(200);
        expect(response.body.message).toBe('Post deleted successfully');

        // Check if the post is actually deleted from the database
        const deletedPost = await PostModel.findById(testPost._id);
        expect(deletedPost).toBeNull();
    });

    it('should return a 400 status when post ID is invalid', async () => {
        const response = await request(app)
                .delete('/api/v1/posts/1')
                .set('Authorization', `Bearer ${token}`)

        expect(response.status).toBe(400);
        expect(response.body.status).toBe(400);
        expect(response.body.message).toBe('Invalid post ID');
    });

});

