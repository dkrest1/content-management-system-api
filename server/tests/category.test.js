/* eslint-disable no-undef */
const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const CategoryModel = require('../src/models/category.model');
const UserModel = require('../src/models/user.model');

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

describe('Server and Tests', () => {
  it('responds with a status of 404', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(404);
  });
});

describe('POST /api/v1/categories', () => {
  let token, testUser, user;

  beforeEach(async () => {
    // Create a user for testing
    testUser = {
      email: 'testuser@example.com',
      password: 'testPassword123',
      username: 'testuser',
    };

    user = await UserModel.create(testUser);

    // Login
    const loginResponse = await request(app).post('/api/v1/auth/login').send({
      email: 'testuser@example.com',
      password: 'testPassword123',
    });

    token = loginResponse.body.payload.access_token;
  });

  afterAll(async () => {
    // Cleanup: Delete the created user
    await UserModel.deleteOne({ _id: user._id });
    await CategoryModel.deleteMany();
  });

  it('should create a category successfully', async () => {
    const categoryData = {
      name: 'newcategory',
      description: 'This is a new category.',
    };

    const response = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`)
      .send(categoryData);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe(201);
    expect(response.body.message).toBe('Created successfully');
    expect(response.body.payload.catagory).toBeDefined();

    // Check if the category is actually created in the database
    const createdCategory = await CategoryModel.findOne({
      name: 'newcategory',
    });
    expect(createdCategory).toBeDefined();
    expect(createdCategory.description).toBe('This is a new category.');
  });

  it('should return a 400 status when category name already exists', async () => {
    const existingCategoryData = {
      name: 'existingCategory',
      description: 'This category already exists.',
    };

    // Create an existing category
    await CategoryModel.create(existingCategoryData);

    const response = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`)
      .send(existingCategoryData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Category already exist');
  });
});

describe('PATCH /api/v1/categories/:categoryId', () => {
  let token, testUser, user, testCategory, category;

  beforeEach(async () => {
    // Create a user and category for testing
    testUser = {
      email: 'testuser@example.com',
      password: 'testPassword123',
      username: 'testuser',
      userRole: 'admin',
    };

    user = await UserModel.create(testUser);

    testCategory = {
      name: 'testcategory',
      description: 'This is a test category.',
    };

    category = await CategoryModel.create(testCategory);

    // Login
    const loginResponse = await request(app).post('/api/v1/auth/login').send({
      email: 'testuser@example.com',
      password: 'testPassword123',
    });

    token = loginResponse.body.payload.access_token;
  });

  afterAll(async () => {
    // Cleanup: Delete the created user
    await UserModel.deleteOne({ _id: user._id });
    await CategoryModel.deleteMany();
  });

  it('should update a category successfully', async () => {
    const updatedData = {
      name: 'updatedcategory',
      description: 'Updated description.',
    };

    const response = await request(app)
      .patch(`/api/v1/categories/${category._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(200);
    expect(response.body.message).toBe('Success');
    expect(response.body.payload.category).toBeDefined();
    expect(response.body.payload.category.name).toBe('updatedcategory');
    expect(response.body.payload.category.description).toBe('Updated description.');

    // Check if the category is actually updated in the database
    const updatedCategory = await CategoryModel.findById(category._id);
    expect(updatedCategory).toBeDefined();
    expect(updatedCategory.name).toBe('updatedcategory');
    expect(updatedCategory.description).toBe('Updated description.');
  });

  it('should return a 400 status when category ID is invalid', async () => {
    const response = await request(app)
      .patch('/api/v1/categories/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'updatedCategory',
        description: 'Updated description.',
      });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe(400);
    expect(response.body.message).toBe('Invalid category ID');
  });
});

describe('GET /api/v1/categories', () => {
  // eslint-disable-next-line no-unused-vars
  let token, testUser, user, testCategory1, testCategory2, category1, category2;

  beforeEach(async () => {
    // Create a user and categories for testing
    testUser = {
      email: 'testuser@example.com',
      password: 'testPassword123',
      username: 'testuser',
    };

    user = await UserModel.create(testUser);

    testCategory1 = {
      name: 'testcategory1',
      description: 'This is test category 1.',
    };

    testCategory2 = {
      name: 'testcategory2',
      description: 'This is test category 2.',
    };

    category1 = await CategoryModel.create(testCategory1);
    category2 = await CategoryModel.create(testCategory2);

    // Login
    const loginResponse = await request(app).post('/api/v1/auth/login').send({
      email: 'testuser@example.com',
      password: 'testPassword123',
    });

    token = loginResponse.body.payload.access_token;
  });

  afterAll(async () => {
    // Cleanup: Delete the created user and categories
    await UserModel.deleteOne({ _id: user._id });
    await CategoryModel.deleteMany({});
  });

  it('should get a list of categories with pagination', async () => {
    const response = await request(app).get('/api/v1/categories');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(200);
    expect(response.body.message).toBe('Success');
    expect(response.body.payload.docs).toHaveLength(2);
    expect(response.body.payload.docs[0].name).toBe('testcategory1');
    expect(response.body.payload.docs[1].name).toBe('testcategory2');
  });

  it('should get a list of categories with specified pagination options', async () => {
    const response = await request(app)
      .get('/api/v1/categories?page=1&limit=1')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(200);
    expect(response.body.message).toBe('Success');
    expect(response.body.payload.docs).toHaveLength(1);
    expect(response.body.payload.docs[0].name).toBe('testcategory1');
  });
});

describe('GET /api/v1/categories/:categoryId', () => {
  let testUser, user, testCategory, category;

  beforeEach(async () => {
    // Create a user and category for testing
    testUser = {
      email: 'testuser@example.com',
      password: 'testPassword123',
      username: 'testuser',
    };

    user = await UserModel.create(testUser);

    testCategory = {
      name: 'testcategory',
      description: 'This is a test category.',
    };

    category = await CategoryModel.create(testCategory);
  });

  afterAll(async () => {
    // Cleanup: Delete the created user and category
    await UserModel.deleteOne({ _id: user._id });
    await CategoryModel.deleteOne({ _id: category._id });
  });

  it('should find a category by ID successfully', async () => {
    const response = await request(app).get(`/api/v1/categories/${category._id}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(200);
    expect(response.body.message).toBe('Success');
    expect(response.body.payload.category).toBeDefined();
    expect(response.body.payload.category.name).toBe('testcategory');
  });

  it('should return a 404 status when category ID is invalid', async () => {
    const response = await request(app).get('/api/v1/categories/1');

    expect(response.status).toBe(400);
    expect(response.body.status).toBe(400);
    expect(response.body.message).toBe('Invalid category ID');
  });
});

describe('DELETE /api/v1/categories/:categoryId', () => {
  let token, testUser, user, testCategory, category;

  beforeEach(async () => {
    // Create a user and category for testing
    testUser = {
      email: 'testuser@example.com',
      password: 'testPassword123',
      username: 'testuser',
      userRole: 'admin',
    };

    user = await UserModel.create(testUser);

    testCategory = {
      name: 'testcategory',
      description: 'This is a test category.',
    };

    category = await CategoryModel.create(testCategory);

    // Login
    const loginResponse = await request(app).post('/api/v1/auth/login').send({
      email: 'testuser@example.com',
      password: 'testPassword123',
    });

    token = loginResponse.body.payload.access_token;
  });

  afterAll(async () => {
    // Cleanup: Delete the created user and category
    await UserModel.deleteOne({ _id: user._id });
    await CategoryModel.deleteOne({ _id: category._id });
  });

  it('should soft-delete a category by ID successfully', async () => {
    const response = await request(app)
      .delete(`/api/v1/categories/${category._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(200);
    expect(response.body.message).toBe('Success');
    expect(response.body.payload).toBeNull();

    // Check if the category is actually soft-deleted in the database
    const deletedCategory = await CategoryModel.findOne({ _id: category._id });
    expect(deletedCategory).toBeDefined();
    expect(deletedCategory.active).toBe(false);
  });

  it('should return a 400 status when category ID is invalid', async () => {
    const response = await request(app)
      .patch('/api/v1/categories/1')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.status).toBe(400);
    expect(response.body.message).toBe('Invalid category ID');
  });
});
