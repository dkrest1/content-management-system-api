const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { MongoMemoryServer } = require('mongodb-memory-server');
const UserModel = require('../src/models/user.model');
const { generateToken } = require('../src/utils/helper.util');
const { JWT_RESET_SECRET, JWT_RESET_SECRET_EXPIRATION } = require('../src/config/constant');

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
});

describe('Server and Tests', () => {
  it('responds with a status of 404', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(404);
  });
});

describe('POST /api/v1/auth/signup', () => {
  it('responds with status 201 and write to the database with hashed password', async () => {
    const userData = {
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'testpassword',
    };

    const response = await request(app).post('/api/v1/auth/signup').send(userData);

    // Assert the response properties
    expect(response.statusCode).toBe(201);
    expect(response.headers['content-type']).toMatch('application/json');
    expect(response.body.payload.user).toHaveProperty('username', 'testuser');
    expect(response.body).toHaveProperty('message', 'Created');

    // Check the database to see if the user was actually created
    const user = await UserModel.findOne({ username: 'testuser' });
    expect(user).toBeDefined();
    expect(user.email).toBe('testuser@example.com');

    // Check if password is hashed
    const isPasswordHashed = await bcrypt.compare('testpassword', user.password);
    expect(isPasswordHashed).toBe(true);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('should login user successfuly with email and password', async () => {
    // Create a user with the hashed password
    const user = new UserModel({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'testpassword',
    });

    await user.save();

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'testpassword',
      })
      .expect(200);

    // Assert the response properties
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(response.body).toHaveProperty('message', 'Login successful');
    expect(response.body.payload).toHaveProperty('access_token');
  });

  it('should throw an error on wrong credentials', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'nonexistentuser@example.com',
      password: 'wrongpassword',
    });

    expect(response.statusCode).toBe(400);
    expect(response.headers['content-type']).toMatch(/^application\/json/);

    expect(response.body).toHaveProperty('message', 'Invalid credentials');
  });
});

describe('POST /api/v1/auth/password/forget', () => {
  it('should intiate a password reset for a valid email', async () => {
    // Create a user with the hashed password
    const user = new UserModel({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'testpassword',
    });

    await user.save();

    const response = await request(app).post('/api/v1/auth/password/forget').send({
      email: 'testuser@example.com',
    });

    // Assert the response body
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toMatch(/^application\/json/);
    expect(response.body).toHaveProperty('message', 'Email sent successfully');
  });

  it('should handle invalid email for password reset', async () => {
    const response = await request(app).post('/api/v1/auth/password/forget').send({
      email: 'nonexistentuser@example.com',
    });

    expect(response.statusCode).toBe(404);
    expect(response.headers['content-type']).toMatch(/^application\/json/);
    expect(response.body).toHaveProperty('message', 'User not found');
  });
});

describe('POST /api/v1/auth/password/reset', () => {
  let resetToken;
  const newPassword = 'newPassword123';
  let user;

  beforeEach(async () => {
    const testUser = {
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'oldPassword123',
    };

    user = await UserModel.create(testUser);

    // Generate a reset token for the user
    const payload = {
      sub: user._id,
      email: user.email,
    };

    resetToken = generateToken(payload, JWT_RESET_SECRET, JWT_RESET_SECRET_EXPIRATION);
  });

  it('should reset the user password with a valid reset token', async () => {
    const response = await request(app)
      .post('/api/v1/auth/password/reset')
      .query({ reset_token: resetToken })
      .send({ new_password: newPassword });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toMatch(/^application\/json/);
    expect(response.body).toEqual({
      status: 200,
      message: 'Password updated successfully',
      payload: null,
    });

    // Check if user password is updated
    const updatedUser = await UserModel.findById(user._id);
    const isPasswordChanged = await bcrypt.compare(newPassword, updatedUser.password);
    expect(isPasswordChanged).toBe(true);
  });
});
